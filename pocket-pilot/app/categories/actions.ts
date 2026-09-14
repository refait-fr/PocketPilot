"use server";

import { revalidatePath } from "next/cache";

import { getAllowedCategories, parseCustomCategoryName } from "@/lib/transactions/allowed-categories";
import { fetchUserCategoryNames } from "@/lib/transactions/user-categories";
import { requireAuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";
import { logServerError } from "@/lib/observability/server-log";

export type CategoryActionState = {
  fieldErrors: { name?: string };
  message: string;
  status: "error" | "idle" | "success";
};

function errorState(message: string, nameError?: string): CategoryActionState {
  return {
    fieldErrors: nameError ? { name: nameError } : {},
    message,
    status: "error",
  };
}

function revalidateCategoryViews() {
  revalidatePath("/budgets");
  revalidatePath("/settings");
  revalidatePath("/transactions");
  revalidatePath("/transactions/importer");
  revalidatePath("/dashboard");
  revalidatePath("/purchase-checker");
}

async function countCategoryUsage(supabase: Awaited<ReturnType<typeof requireAuthenticatedProfile>>["supabase"], userId: string, name: string) {
  const [transactionsResult, budgetsResult] = await Promise.all([
    supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("category", name),
    supabase
      .from("category_budgets")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("category", name),
  ]);

  if (transactionsResult.error || budgetsResult.error) {
    throw new Error("Impossible de vérifier l’usage de la catégorie.");
  }

  return {
    budgets: budgetsResult.count ?? 0,
    transactions: transactionsResult.count ?? 0,
  };
}

function describeUsage(usage: { budgets: number; transactions: number }): string {
  const parts: string[] = [];

  if (usage.transactions > 0) {
    parts.push(`${usage.transactions} transaction${usage.transactions > 1 ? "s" : ""}`);
  }

  if (usage.budgets > 0) {
    parts.push(`${usage.budgets} budget${usage.budgets > 1 ? "s" : ""}`);
  }

  return parts.join(" et ");
}

export async function createUserCategory(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const parsed = parseCustomCategoryName(formData.get("name"));

  if (!parsed.valid) {
    return errorState("Corrigez le nom indiqué.", parsed.message);
  }

  const { supabase, userId } = await requireAuthenticatedProfile();
  const existing = await fetchUserCategoryNames({ supabase, userId });

  if (getAllowedCategories(existing).some((category) => category.toLowerCase() === parsed.name.toLowerCase())) {
    return errorState("Cette catégorie existe déjà.", "Cette catégorie existe déjà.");
  }

  const { error } = await supabase.from("user_categories").insert({
    name: parsed.name,
    user_id: userId,
  });

  if (error) {
    if (error.code !== "23505") logServerError("user-categories:create", error);
    return errorState(
      error.code === "23505"
        ? "Cette catégorie existe déjà."
        : "La catégorie n’a pas pu être créée. Réessayez dans un instant.",
      error.code === "23505" ? "Cette catégorie existe déjà." : undefined,
    );
  }

  revalidateCategoryViews();

  return {
    fieldErrors: {},
    message: `La catégorie ${parsed.name} a été ajoutée.`,
    status: "success",
  };
}

export async function renameUserCategory(
  previousName: string,
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const parsed = parseCustomCategoryName(formData.get("name"));

  if (!parsed.valid) {
    return errorState("Corrigez le nom indiqué.", parsed.message);
  }

  const { supabase, userId } = await requireAuthenticatedProfile();
  const existing = await fetchUserCategoryNames({ supabase, userId });

  if (!existing.includes(previousName)) {
    return errorState("Cette catégorie est introuvable.");
  }

  if (parsed.name === previousName) {
    return errorState("Choisissez un nom différent du nom actuel.", "Choisissez un nom différent du nom actuel.");
  }

  if (
    getAllowedCategories(existing.filter((name) => name !== previousName)).some(
      (category) => category.toLowerCase() === parsed.name.toLowerCase(),
    )
  ) {
    return errorState("Cette catégorie existe déjà.", "Cette catégorie existe déjà.");
  }

  const { error: renameError } = await supabase
    .from("user_categories")
    .update({ name: parsed.name })
    .eq("user_id", userId)
    .eq("name", previousName);

  if (renameError) {
    if (renameError.code !== "23505") logServerError("user-categories:rename", renameError);
    return errorState(
      renameError.code === "23505"
        ? "Cette catégorie existe déjà."
        : "La catégorie n’a pas pu être renommée. Réessayez dans un instant.",
    );
  }

  // Les transactions et budgets existants suivent le nouveau nom pour
  // éviter toute ligne orpheline pointant vers l’ancien libellé.
  const [transactionsUpdate, budgetsUpdate] = await Promise.all([
    supabase
      .from("transactions")
      .update({ category: parsed.name })
      .eq("user_id", userId)
      .eq("category", previousName),
    supabase
      .from("category_budgets")
      .update({ category: parsed.name })
      .eq("user_id", userId)
      .eq("category", previousName),
  ]);

  if (transactionsUpdate.error || budgetsUpdate.error) {
    if (transactionsUpdate.error) logServerError("user-categories:rename-transactions", transactionsUpdate.error);
    if (budgetsUpdate.error) logServerError("user-categories:rename-budgets", budgetsUpdate.error);
    return errorState("Le nom a été modifié, mais certaines lignes n’ont pas suivi. Vérifiez vos transactions et budgets.");
  }

  revalidateCategoryViews();

  return {
    fieldErrors: {},
    message: `La catégorie ${previousName} devient ${parsed.name}, y compris dans l’historique.`,
    status: "success",
  };
}

export async function deleteUserCategory(
  name: string,
  _previousState: CategoryActionState,
): Promise<CategoryActionState> {
  void _previousState;
  const { supabase, userId } = await requireAuthenticatedProfile();
  const existing = await fetchUserCategoryNames({ supabase, userId });

  if (!existing.includes(name)) {
    return errorState("Cette catégorie est introuvable.");
  }

  let usage: { budgets: number; transactions: number };

  try {
    usage = await countCategoryUsage(supabase, userId, name);
  } catch {
    return errorState("La vérification d’usage a échoué. Réessayez dans un instant.");
  }

  // Garde d’usage : une catégorie utilisée reste disponible tant que des
  // transactions ou des budgets la référencent.
  if (usage.transactions > 0 || usage.budgets > 0) {
    return errorState(
      `La catégorie ${name} est utilisée par ${describeUsage(usage)} : renommez ces lignes ou changez leur catégorie avant de la supprimer.`,
    );
  }

  const { error } = await supabase
    .from("user_categories")
    .delete()
    .eq("user_id", userId)
    .eq("name", name);

  if (error) {
    logServerError("user-categories:delete", error);
    return errorState("La catégorie n’a pas pu être supprimée. Réessayez dans un instant.");
  }

  revalidateCategoryViews();

  return {
    fieldErrors: {},
    message: `La catégorie ${name} a été supprimée.`,
    status: "success",
  };
}
