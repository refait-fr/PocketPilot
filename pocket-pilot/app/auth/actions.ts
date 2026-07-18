"use server";

import { redirect } from "next/navigation";

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
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || email.length > 254 || !email.includes("@")) {
    return {
      valid: false,
      email,
      message: "Saisissez une adresse email valide.",
    };
  }

  if (password.length < 8 || password.length > 72) {
    return {
      valid: false,
      email,
      message: "Le mot de passe doit contenir entre 8 et 72 caractères.",
    };
  }

  return { valid: true, email, password };
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

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp(credentials);

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
  redirect("/auth?message=Vous%20êtes%20déconnecté.");
}
