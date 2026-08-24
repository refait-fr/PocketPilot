export const AUTH_PASSWORD_MIN_LENGTH = 8;
export const AUTH_PASSWORD_MAX_LENGTH = 72;
export const AUTH_EMAIL_MAX_LENGTH = 254;

export const AUTH_INPUT_MESSAGES = {
  invalidEmail: "Saisissez une adresse email valide.",
  invalidPassword: `Le mot de passe doit contenir entre ${AUTH_PASSWORD_MIN_LENGTH} et ${AUTH_PASSWORD_MAX_LENGTH} caractères.`,
  passwordMismatch: "Les deux mots de passe ne correspondent pas.",
} as const;

export type PasswordFieldErrors = {
  password?: string;
  passwordConfirmation?: string;
};

export type NewPasswordValidation =
  | { valid: true; password: string }
  | { valid: false; fieldErrors: PasswordFieldErrors };

export function readEmailAddress(value: unknown):
  | { valid: true; email: string }
  | { valid: false; email: string; message: string } {
  const email = typeof value === "string" ? value.trim().toLowerCase() : "";

  if (
    !email ||
    email.length > AUTH_EMAIL_MAX_LENGTH ||
    !email.includes("@")
  ) {
    return {
      valid: false,
      email,
      message: AUTH_INPUT_MESSAGES.invalidEmail,
    };
  }

  return { valid: true, email };
}

export function getPasswordValidationMessage(value: unknown): string | undefined {
  if (
    typeof value !== "string" ||
    value.length < AUTH_PASSWORD_MIN_LENGTH ||
    value.length > AUTH_PASSWORD_MAX_LENGTH
  ) {
    return AUTH_INPUT_MESSAGES.invalidPassword;
  }

  return undefined;
}

export function validateNewPassword(
  passwordValue: unknown,
  confirmationValue: unknown,
): NewPasswordValidation {
  const password = typeof passwordValue === "string" ? passwordValue : "";
  const passwordConfirmation =
    typeof confirmationValue === "string" ? confirmationValue : "";
  const fieldErrors: PasswordFieldErrors = {};
  const passwordError = getPasswordValidationMessage(password);

  if (passwordError) {
    fieldErrors.password = passwordError;
  }

  if (passwordConfirmation !== password) {
    fieldErrors.passwordConfirmation = AUTH_INPUT_MESSAGES.passwordMismatch;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { valid: false, fieldErrors };
  }

  return { valid: true, password };
}
