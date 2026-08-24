export const AUTH_MESSAGES = {
  passwordResetRequestAccepted:
    "Si un compte correspond à cette adresse, un lien de réinitialisation sera envoyé.",
  confirmationResendAccepted:
    "Si cette adresse attend une confirmation, un nouvel email sera envoyé.",
  passwordUpdated: "Votre mot de passe a été mis à jour.",
  sessionInvalid:
    "Votre session n’est plus valide. Reprenez le parcours depuis l’email reçu.",
  serviceUnavailable:
    "Le service d’authentification est momentanément indisponible. Réessayez dans un instant.",
  weakPassword: "Choisissez un mot de passe plus robuste.",
  samePassword: "Choisissez un mot de passe différent de l’actuel.",
  reauthenticationRequired:
    "Un code de sécurité vient de vous être envoyé. Saisissez-le puis confirmez à nouveau votre nouveau mot de passe.",
  currentPasswordRequired:
    "Supabase exige votre mot de passe actuel pour autoriser cette modification.",
  currentPasswordInvalid: "Le mot de passe actuel est incorrect.",
} as const;

type AuthErrorLike = {
  code?: string;
};

export type PasswordUpdateErrorKind =
  | "weak-password"
  | "same-password"
  | "reauthentication-required"
  | "reauthentication-invalid"
  | "current-password-required"
  | "current-password-invalid"
  | "session-invalid"
  | "unexpected";

export function classifyPasswordUpdateError(
  error: AuthErrorLike,
): PasswordUpdateErrorKind {
  switch (error.code) {
    case "weak_password":
      return "weak-password";
    case "same_password":
      return "same-password";
    case "reauthentication_needed":
    case "reauth_nonce_missing":
      return "reauthentication-required";
    case "reauthentication_not_valid":
    case "otp_expired":
      return "reauthentication-invalid";
    case "current_password_required":
      return "current-password-required";
    case "current_password_invalid":
      return "current-password-invalid";
    case "bad_jwt":
    case "session_expired":
    case "session_not_found":
      return "session-invalid";
    default:
      return "unexpected";
  }
}
