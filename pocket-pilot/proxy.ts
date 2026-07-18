import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

function redirectWithCookies(request: NextRequest, path: string, response: NextResponse) {
  const redirectResponse = NextResponse.redirect(new URL(path, request.url));
  response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
  return redirectResponse;
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub;
  const pathname = request.nextUrl.pathname;
  const isAuthPage = pathname === "/auth";
  const isAuthEndpoint = pathname.startsWith("/auth/confirm") || pathname.startsWith("/auth/callback");

  if (!userId) {
    if (!isAuthPage && !isAuthEndpoint) return redirectWithCookies(request, "/auth", response);
    return response;
  }

  if (isAuthEndpoint) return response;

  const { data: profile } = await supabase.from("profiles").select("user_id").eq("user_id", userId).maybeSingle();
  if (!profile && pathname !== "/onboarding") return redirectWithCookies(request, "/onboarding", response);
  if (profile && (isAuthPage || pathname === "/onboarding")) return redirectWithCookies(request, "/", response);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next|__nextjs|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
