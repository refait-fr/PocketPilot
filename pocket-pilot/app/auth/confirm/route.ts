import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { getSiteOrigin } from "@/lib/auth/auth-redirect-url";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const siteOrigin = getSiteOrigin();
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const next =
    type === "recovery"
      ? "/auth/reset-password"
      : safeNextPath(request.nextUrl.searchParams.get("next"));

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return NextResponse.redirect(new URL(next, siteOrigin));
  }

  if (type === "recovery") {
    const recoveryUrl = new URL("/auth/reset-password", siteOrigin);
    recoveryUrl.searchParams.set("notice", "recovery-link-invalid");
    return NextResponse.redirect(recoveryUrl);
  }

  const authUrl = new URL("/auth", siteOrigin);
  authUrl.searchParams.set(
    "notice",
    "confirmation-link-invalid",
  );
  return NextResponse.redirect(authUrl);
}
