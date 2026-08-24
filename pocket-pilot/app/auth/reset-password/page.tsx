import { AuthSupportShell } from "@/app/auth/auth-support-shell";
import { PasswordUpdateForm } from "@/app/auth/password-update-form";
import { AUTH_MESSAGES } from "@/lib/auth/auth-messages";
import { getAuthNotice } from "@/lib/auth/auth-notice";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

type ResetPasswordPageProps = {
  searchParams: Promise<{ notice?: string | string[] }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { notice } = await searchParams;
  const invalidRecoveryNotice =
    notice === "recovery-link-invalid" ? getAuthNotice(notice) : undefined;
  let hasValidSession = false;
  let serviceUnavailable = false;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();

    hasValidSession = !error && Boolean(data?.claims.sub);
  } catch {
    serviceUnavailable = true;
  }

  return (
    <AuthSupportShell
      description="Choisissez un mot de passe distinct, puis confirmez-le avant de revenir dans votre espace."
      eyebrow="Nouveau mot de passe"
      title="Sécuriser à nouveau votre compte."
    >
      {invalidRecoveryNotice ? (
        <div className="grid gap-5">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800" role="alert">
            {invalidRecoveryNotice.message}
          </div>
          <Link
            className="w-fit rounded-xl bg-[var(--forest)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#244c43] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--forest)]"
            href="/auth/forgot-password"
          >
            Demander un nouveau lien
          </Link>
        </div>
      ) : serviceUnavailable ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800" role="alert">
          {AUTH_MESSAGES.serviceUnavailable}
        </div>
      ) : hasValidSession ? (
        <PasswordUpdateForm returnHref="/" returnLabel="Retourner dans PocketPilot" />
      ) : (
        <div className="grid gap-5">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800" role="alert">
            Le lien de réinitialisation est invalide ou a expiré. Demandez un nouveau lien depuis la page de connexion.
          </div>
          <Link
            className="w-fit rounded-xl bg-[var(--forest)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#244c43] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--forest)]"
            href="/auth/forgot-password"
          >
            Demander un nouveau lien
          </Link>
        </div>
      )}
    </AuthSupportShell>
  );
}
