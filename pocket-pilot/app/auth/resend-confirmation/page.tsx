import { AuthSupportShell } from "@/app/auth/auth-support-shell";
import { EmailActionForm } from "@/app/auth/email-action-form";

export default function ResendConfirmationPage() {
  return (
    <AuthSupportShell
      description="Saisissez l’adresse utilisée lors de l’inscription. Supabase appliquera ses limites d’envoi habituelles."
      eyebrow="Confirmation email"
      title="Recevoir un nouveau lien."
    >
      <EmailActionForm mode="confirmation-resend" />
    </AuthSupportShell>
  );
}
