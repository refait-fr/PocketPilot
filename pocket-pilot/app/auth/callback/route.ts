import { type NextRequest, NextResponse } from "next/server";
import { getSiteOrigin } from "@/lib/auth/auth-redirect-url";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  let siteOrigin: string;

  try {
    siteOrigin = getSiteOrigin();
  } catch {
    // Configuration SITE_URL absente ou invalide : on reste sur l'origine
    // de la requête plutôt que de répondre 500 sur le parcours d'auth.
    siteOrigin = request.nextUrl.origin;
  }

  const code = request.nextUrl.searchParams.get("code");
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, siteOrigin));
  }
  if (next === "/auth/reset-password") {
    const recoveryUrl = new URL("/auth/reset-password", siteOrigin);
    recoveryUrl.searchParams.set("notice", "recovery-link-invalid");
    return NextResponse.redirect(recoveryUrl);
  }

  const authUrl = new URL("/auth", siteOrigin);
  authUrl.searchParams.set(
    "notice",
    "confirmation-failed",
  );
  return NextResponse.redirect(authUrl);
}
