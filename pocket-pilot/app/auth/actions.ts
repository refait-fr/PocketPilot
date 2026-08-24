"use server";

import { redirect } from "next/navigation";

import {
  getPasswordValidationMessage,
  readEmailAddress,
} from "@/lib/auth/auth-input";
import { getAuthEmailRedirectUrl } from "@/lib/auth/auth-redirect-url";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = {
  status: "idle" | "error" | "success";
  message: string;
  email: string;
};

type CredentialsResult =
  | { valid: true; email: string; password: string }
  | { valid: false; email: string; message: string };

type SignUpError = {
  code?: string;
  status?: number;
};

const DEFAULT_SIGN_UP_ERROR_MESSAGE =
  "L’inscription n’a pas abouti. Réessayez dans un instant.";

function getSignUpErrorMessage(error: SignUpError): string {
  switch (error.code) {
    case "weak_password":
      return "Choisissez un mot de passe plus robuste.";
    case "email_address_invalid":
    case "validation_failed":
      return "Vérifiez le format de l’adresse email et du mot de passe.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Trop de tentatives ont été effectuées. Attendez quelques minutes avant de réessayer.";
    case "signup_disabled":
    case "email_provider_disabled":
      return "Les inscriptions par email sont temporairement indisponibles.";
    case "captcha_failed":
      return "La vérification anti-robot a échoué. Réessayez.";
    case "email_exists":
    case "identity_already_exists":
    case "user_already_exists":
      return DEFAULT_SIGN_UP_ERROR_MESSAGE;
    default:
      return error.status === 429
        ? "Trop de tentatives ont été effectuées. Attendez quelques minutes avant de réessayer."
        : DEFAULT_SIGN_UP_ERROR_MESSAGE;
  }
}

function readCredentials(formData: FormData): CredentialsResult {
  const emailResult = readEmailAddress(formData.get("email"));
  const password = String(formData.get("password") ?? "");

  if (!emailResult.valid) {
    return {
      valid: false,
      email: emailResult.email,
      message: emailResult.message,
    };
  }

  const passwordMessage = getPasswordValidationMessage(password);

  if (passwordMessage) {
    return {
      valid: false,
      email: emailResult.email,
      message: passwordMessage,
    };
  }

  return { valid: true, email: emailResult.email, password };
}

export async function signIn(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const credentials = readCredentials(formData);

  if (!credentials.valid) {
    return {
      status: "error",
      message: credentials.message,
      email: credentials.email,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    return {
      status: "error",
      message: "Email ou mot de passe incorrect.",
      email: credentials.email,
    };
  }

  redirect("/");
}

export async function signUp(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const credentials = readCredentials(formData);

  if (!credentials.valid) {
    return {
      status: "error",
      message: credentials.message,
      email: credentials.email,
    };
  }

  let supabase;
  let emailRedirectTo;

  try {
    supabase = await createClient();
    emailRedirectTo = getAuthEmailRedirectUrl("confirmation");
  } catch {
    return {
      status: "error",
      message: DEFAULT_SIGN_UP_ERROR_MESSAGE,
      email: credentials.email,
    };
  }

  const { data, error } = await supabase.auth.signUp({
    ...credentials,
    options: { emailRedirectTo },
  });

  if (error) {
    return {
      status: "error",
      message: getSignUpErrorMessage(error),
      email: credentials.email,
    };
  }

  if (data.session) {
    redirect("/onboarding");
  }

  return {
    status: "success",
    message:
      "Un email de confirmation vient de partir. Ouvrez-le pour continuer.",
    email: credentials.email,
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth?notice=signed-out");
}
