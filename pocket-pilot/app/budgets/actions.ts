"use server";

import { revalidatePath } from "next/cache";

import type { BudgetActionState } from "@/app/budgets/budget-types";
import { validateCategoryBudgetInput } from "@/lib/budgets/category-budget";
import { requireAuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
  revalidatePath("/");
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
  if (!UUID_PATTERN.test(budgetId)) {
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

  if (!UUID_PATTERN.test(budgetId)) {
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
