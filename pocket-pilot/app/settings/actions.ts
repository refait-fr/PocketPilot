"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { validateProfileSettings } from "@/lib/profile-settings";
import { requireAuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";

const financialTables = [
  "recurring_incomes",
  "recurring_fixed_expenses",
  "savings_goals",
  "transactions",
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

async function userHasFinancialData(
  supabase: Awaited<ReturnType<typeof requireAuthenticatedProfile>>["supabase"],
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
  const { profile, supabase, userId } = await requireAuthenticatedProfile();
  const hasFinancialData = await userHasFinancialData(supabase, userId);
  const validation = validateProfileSettings({
    currencyCode: formData.get("currencyCode"),
    currentCurrencyCode: profile.currencyCode,
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
    return {
      message: "Les préférences n’ont pas pu être enregistrées. Réessayez dans un instant.",
      status: "error",
      values: validation.values,
    };
  }

  revalidatePath("/");
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

  const { supabase } = await requireAuthenticatedProfile();
  const { error } = await supabase.rpc("delete_current_user");

  if (error) {
    return {
      message: "Le compte n’a pas pu être supprimé. Réessayez dans un instant.",
      status: "error",
    };
  }

  await supabase.auth.signOut({ scope: "local" });
  redirect("/auth?notice=account-deleted");
}
