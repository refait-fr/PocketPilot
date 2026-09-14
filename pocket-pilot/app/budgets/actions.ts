"use server";

import { revalidatePath } from "next/cache";

import type { BudgetActionState } from "@/app/budgets/budget-types";
import { validateCategoryBudgetInput } from "@/lib/budgets/category-budget";
import { requireAuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";
import { logServerError } from "@/lib/observability/server-log";
import { isUuid } from "@/lib/validation/uuid";

const emptyValues: BudgetActionState["values"] = {
  category: "Alimentation",
  monthlyBudget: "",
};

function errorState(
  message: string,
  values: BudgetActionState["values"] = emptyValues,
): BudgetActionState {
  return { fieldErrors: {}, message, status: "error", values };
}

function validateForm(formData: FormData) {
  return validateCategoryBudgetInput({
    category: formData.get("category"),
    monthlyBudget: formData.get("monthlyBudget"),
  });
}

function revalidateBudgetViews() {
  revalidatePath("/dashboard");
  revalidatePath("/budgets");
  revalidatePath("/purchase-checker");
}

export async function createCategoryBudget(
  _previousState: BudgetActionState,
  formData: FormData,
): Promise<BudgetActionState> {
  const validation = validateForm(formData);

  if (!validation.valid) {
    return {
      fieldErrors: validation.fieldErrors,
      message: "Corrigez les champs indiqués.",
      status: "error",
      values: validation.values,
    };
  }

  const { supabase, userId } = await requireAuthenticatedProfile();
  const { error } = await supabase.from("category_budgets").insert({
    category: validation.data.category,
    monthly_budget_cents: validation.data.monthlyBudgetCents,
    user_id: userId,
  });

  if (error) {
    if (error.code !== "23505") logServerError("budgets:create", error);
    return errorState(
      error.code === "23505"
        ? "Un budget existe déjà pour cette catégorie."
        : "Le budget n’a pas pu être créé. Réessayez dans un instant.",
      validation.values,
    );
  }

  revalidateBudgetViews();
  return {
    fieldErrors: {},
    message: "Le budget mensuel a été ajouté.",
    status: "success",
    values: emptyValues,
  };
}

export async function updateCategoryBudget(
  budgetId: string,
  _previousState: BudgetActionState,
  formData: FormData,
): Promise<BudgetActionState> {
  if (!isUuid(budgetId)) {
    return errorState("Ce budget est introuvable.");
  }

  const validation = validateForm(formData);

  if (!validation.valid) {
    return {
      fieldErrors: validation.fieldErrors,
      message: "Corrigez les champs indiqués.",
      status: "error",
      values: validation.values,
    };
  }

  const { supabase, userId } = await requireAuthenticatedProfile();
  const { data, error } = await supabase
    .from("category_budgets")
    .update({ monthly_budget_cents: validation.data.monthlyBudgetCents })
    .eq("id", budgetId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    if (error) logServerError("budgets:update", error);
    return errorState(
      "Le budget n’a pas pu être modifié. Il est peut-être introuvable.",
      validation.values,
    );
  }

  revalidateBudgetViews();
  return {
    fieldErrors: {},
    message: "Le plafond mensuel est enregistré.",
    status: "success",
    values: validation.values,
  };
}

export async function deleteCategoryBudget(
  budgetId: string,
  _previousState: BudgetActionState,
  _formData: FormData,
): Promise<BudgetActionState> {
  void _previousState;
  void _formData;

  if (!isUuid(budgetId)) {
    return errorState("Ce budget est introuvable.");
  }

  const { supabase, userId } = await requireAuthenticatedProfile();
  const { data, error } = await supabase
    .from("category_budgets")
    .delete()
    .eq("id", budgetId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    if (error) logServerError("budgets:delete", error);
    return errorState("Le budget n’a pas pu être supprimé.");
  }

  revalidateBudgetViews();
  return {
    fieldErrors: {},
    message: "Le budget a été supprimé.",
    status: "success",
    values: emptyValues,
  };
}
