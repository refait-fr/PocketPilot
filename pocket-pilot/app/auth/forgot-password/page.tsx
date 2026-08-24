import { AuthSupportShell } from "@/app/auth/auth-support-shell";
import { EmailActionForm } from "@/app/auth/email-action-form";

export default function ForgotPasswordPage() {
  return (
    <AuthSupportShell
      description="Indiquez votre adresse email. La réponse reste volontairement identique, qu’un compte existe ou non."
      eyebrow="Récupération du compte"
      title="Retrouver l’accès à PocketPilot."
    >
      <EmailActionForm mode="password-reset" />
    </AuthSupportShell>
  );
}
