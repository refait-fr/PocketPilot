export const AUTH_PASSWORD_MIN_LENGTH = 8;
export const AUTH_PASSWORD_MAX_LENGTH = 72;
export const AUTH_EMAIL_MAX_LENGTH = 254;
export const AUTH_EMAIL_LOCAL_PART_MAX_LENGTH = 64;

export const AUTH_INPUT_MESSAGES = {
  invalidEmail: "Saisissez une adresse email valide.",
  invalidPassword: `Le mot de passe doit contenir entre ${AUTH_PASSWORD_MIN_LENGTH} et ${AUTH_PASSWORD_MAX_LENGTH} caractères.`,
  weakPassword:
    "Le mot de passe doit contenir au moins une lettre et un chiffre.",
  passwordMismatch: "Les deux mots de passe ne correspondent pas.",
} as const;

export type PasswordFieldErrors = {
  password?: string;
  passwordConfirmation?: string;
};

export type NewPasswordValidation =
  | { valid: true; password: string }
  | { valid: false; fieldErrors: PasswordFieldErrors };

const EMAIL_LOCAL_PART_PATTERN =
  /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
const EMAIL_DOMAIN_LABEL_PATTERN = /^[A-Za-z0-9-]+$/;

export function isValidEmailAddress(email: string): boolean {
  if (
    !email ||
    email.length > AUTH_EMAIL_MAX_LENGTH ||
    email.includes(" ") ||
    email.includes("..")
  ) {
    return false;
  }

  const atIndex = email.indexOf("@");

  if (atIndex <= 0 || atIndex !== email.lastIndexOf("@")) {
    return false;
  }

  const localPart = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);

  if (
    localPart.length === 0 ||
    localPart.length > AUTH_EMAIL_LOCAL_PART_MAX_LENGTH ||
    localPart.startsWith(".") ||
    localPart.endsWith(".") ||
    !EMAIL_LOCAL_PART_PATTERN.test(localPart)
  ) {
    return false;
  }

  const labels = domain.split(".");

  if (labels.length < 2) {
    return false;
  }

  return labels.every(
    (label) =>
      label.length >= 1 &&
      label.length <= 63 &&
      !label.startsWith("-") &&
      !label.endsWith("-") &&
      EMAIL_DOMAIN_LABEL_PATTERN.test(label),
  );
}

export function readEmailAddress(value: unknown):
  | { valid: true; email: string }
  | { valid: false; email: string; message: string } {
  const email = typeof value === "string" ? value.trim().toLowerCase() : "";

  if (!isValidEmailAddress(email)) {
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

  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return AUTH_INPUT_MESSAGES.weakPassword;
  }

  return undefined;
}

export function getSignInPasswordMessage(value: unknown): string | undefined {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
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
