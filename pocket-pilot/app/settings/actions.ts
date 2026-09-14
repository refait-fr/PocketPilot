"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { generateApiToken, hashApiToken } from "@/lib/api/tokens";
import { isCurrencyCode } from "@/lib/profile-options";
import { logServerError } from "@/lib/observability/server-log";
import { validateProfileSettings } from "@/lib/profile-settings";
import { isUuid } from "@/lib/validation/uuid";
import {
  requireAuthenticatedUser,
  requireRawProfile,
} from "@/lib/supabase/require-authenticated-profile";

const financialTables = [
  "recurring_incomes",
  "recurring_fixed_expenses",
  "savings_goals",
  "transactions",
  "one_time_incomes",
  "category_budgets",
] as const;

export type ProfileSettingsActionState = {
  message: string;
  status: "idle" | "error" | "success";
  values: { currencyCode: string; timeZone: string };
};

export type DeleteAccountActionState = {
  message: string;
  status: "idle" | "error";
};

export type ShortcutTokenView = {
  createdAt: string;
  id: string;
  lastUsedAt: string | null;
  name: string;
  revokedAt: string | null;
};

export type ShortcutTokenActionState = {
  message: string;
  status: "idle" | "error" | "success";
  token: string | null;
  tokenName: string;
};

const MAX_ACTIVE_SHORTCUT_TOKENS = 5;
const MAX_TOKEN_NAME_LENGTH = 50;

const emptyShortcutTokenState: ShortcutTokenActionState = {
  message: "",
  status: "idle",
  token: null,
  tokenName: "",
};

async function userHasFinancialData(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedUser>>["supabase"],
  userId: string,
): Promise<boolean> {
  const results = await Promise.all(
    financialTables.map((table) =>
      supabase
        .from(table)
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
    ),
  );

  if (results.some(({ error }) => error)) {
    throw new Error("Impossible de vérifier les données financières du compte.");
  }

  return results.some(({ count }) => (count ?? 0) > 0);
}

export async function updateProfileSettings(
  _previousState: ProfileSettingsActionState,
  formData: FormData,
): Promise<ProfileSettingsActionState> {
  // Profil brut volontairement : la réparation d'un profil invalide passe
  // par cette action. Le garde-fou base (trigger 23514) reste le filet.
  const { rawProfile, supabase, userId } = await requireRawProfile();
  const hasFinancialData = await userHasFinancialData(supabase, userId);
  const validation = validateProfileSettings({
    currencyCode: formData.get("currencyCode"),
    currentCurrencyCode: isCurrencyCode(rawProfile.currencyCode)
      ? rawProfile.currencyCode
      : null,
    hasFinancialData,
    timeZone: formData.get("timeZone"),
  });

  if (!validation.valid) {
    return {
      message: validation.message,
      status: "error",
      values: validation.values,
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      currency_code: validation.data.currencyCode,
      time_zone: validation.data.timeZone,
    })
    .eq("user_id", userId);

  if (error) {
    if (error.code !== "23514") logServerError("settings:profile-update", error);
    return {
      message:
        error.code === "23514"
          ? "La devise ne peut plus être modifiée tant que des données financières existent. PocketPilot ne convertit pas automatiquement les montants."
          : "Les préférences n’ont pas pu être enregistrées. Réessayez dans un instant.",
      status: "error",
      values: validation.values,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/settings");

  return {
    message: "Les préférences sont enregistrées.",
    status: "success",
    values: validation.values,
  };
}

export async function deleteAccount(
  _previousState: DeleteAccountActionState,
  formData: FormData,
): Promise<DeleteAccountActionState> {
  if (formData.get("confirmation") !== "SUPPRIMER") {
    return {
      message: "Saisissez SUPPRIMER pour confirmer la suppression définitive.",
      status: "error",
    };
  }

  const password = String(formData.get("password") ?? "");

  if (!password) {
    return {
      message: "Saisissez votre mot de passe pour confirmer la suppression définitive.",
      status: "error",
    };
  }

  const { supabase } = await requireAuthenticatedUser();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.email) {
    if (userError) logServerError("settings:delete-account", userError);
    return {
      message: "Le compte n’a pas pu être supprimé. Réessayez dans un instant.",
      status: "error",
    };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  });

  if (signInError) {
    return {
      message: "Le mot de passe actuel est incorrect.",
      status: "error",
    };
  }

  const { error } = await supabase.rpc("delete_current_user");

  if (error) {
    logServerError("settings:delete-account", error);
    return {
      message: "Le compte n’a pas pu être supprimé. Réessayez dans un instant.",
      status: "error",
    };
  }

  await supabase.auth.signOut({ scope: "local" });
  redirect("/auth?notice=account-deleted");
}

export async function createShortcutToken(
  _previousState: ShortcutTokenActionState,
  formData: FormData,
): Promise<ShortcutTokenActionState> {
  const { supabase, userId } = await requireAuthenticatedUser();
  const name = String(formData.get("name") ?? "").trim();

  if (name.length === 0) {
    return { ...emptyShortcutTokenState, message: "Nommez ce jeton, par exemple « iPhone ».", status: "error" };
  }

  if (name.length > MAX_TOKEN_NAME_LENGTH) {
    return { ...emptyShortcutTokenState, message: `Le nom ne peut pas dépasser ${MAX_TOKEN_NAME_LENGTH} caractères.`, status: "error" };
  }

  const { count, error: countError } = await supabase
    .from("api_tokens")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("revoked_at", null);

  if (countError) {
    logServerError("settings:shortcut-token-count", countError);
    return { ...emptyShortcutTokenState, message: "Le jeton n’a pas pu être créé. Réessayez dans un instant.", status: "error" };
  }

  if ((count ?? 0) >= MAX_ACTIVE_SHORTCUT_TOKENS) {
    return { ...emptyShortcutTokenState, message: `Révoquez un ancien jeton : ${MAX_ACTIVE_SHORTCUT_TOKENS} jetons actifs maximum.`, status: "error" };
  }

  const token = await generateApiToken();
  const { error } = await supabase.from("api_tokens").insert({
    name,
    token_hash: await hashApiToken(token),
    user_id: userId,
  });

  if (error) {
    logServerError("settings:shortcut-token-create", error);
    return { ...emptyShortcutTokenState, message: "Le jeton n’a pas pu être créé. Réessayez dans un instant.", status: "error" };
  }

  revalidatePath("/settings");

  // Le jeton en clair n’est renvoyé qu’ici : il n’est jamais stocké.
  return {
    message: "Jeton créé. Copiez-le maintenant, il ne sera plus affiché.",
    status: "success",
    token,
    tokenName: name,
  };
}

export async function revokeShortcutToken(
  tokenId: string,
  _previousState: { message: string; status: "idle" | "error" | "success" },
  _formData: FormData,
): Promise<{ message: string; status: "idle" | "error" | "success" }> {
  void _previousState;
  void _formData;

  const { supabase, userId } = await requireAuthenticatedUser();

  if (!isUuid(tokenId)) {
    return { message: "Ce jeton est introuvable ou déjà révoqué.", status: "error" };
  }

  const { data, error } = await supabase
    .from("api_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", tokenId)
    .eq("user_id", userId)
    .is("revoked_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    logServerError("settings:shortcut-token-revoke", error);
    return { message: "Le jeton n’a pas pu être révoqué. Réessayez dans un instant.", status: "error" };
  }

  if (!data) {
    return { message: "Ce jeton est introuvable ou déjà révoqué.", status: "error" };
  }

  revalidatePath("/settings");

  return { message: "Jeton révoqué : le Raccourci associé ne fonctionne plus.", status: "success" };
}
