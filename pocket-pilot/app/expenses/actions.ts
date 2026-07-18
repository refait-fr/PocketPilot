"use server";

import { revalidatePath } from "next/cache";

import type { RecurringEntryActionState } from "@/app/_components/recurring-entry/recurring-entry-types";
import { validateRecurringEntryInput } from "@/lib/finance/recurring-entry-input";
import { requireAuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";

export type ExpenseActionState = RecurringEntryActionState;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function invalidExpenseState(message: string): ExpenseActionState {
  return {
    status: "error",
    message,
    fieldErrors: {},
    values: { label: "", monthlyAmount: "" },
  };
}

function revalidateExpenseViews() {
  revalidatePath("/");
  revalidatePath("/expenses");
}

export async function createExpense(
  _previousState: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  const validation = validateRecurringEntryInput({
    label: formData.get("label"),
    monthlyAmount: formData.get("monthlyAmount"),
  });

  if (!validation.valid) {
    return {
      status: "error",
      message: "Corrigez les champs indiqués.",
      fieldErrors: validation.fieldErrors,
      values: validation.values,
    };
  }

  const { supabase, userId } = await requireAuthenticatedProfile();
  const { error } = await supabase.from("recurring_fixed_expenses").insert({
    user_id: userId,
    label: validation.data.label,
    amount_cents: validation.data.amountCents,
    is_active: true,
  });

  if (error) {
    return invalidExpenseState(
      "La dépense n’a pas pu être créée. Réessayez dans un instant.",
    );
  }

  revalidateExpenseViews();

  return {
    status: "success",
    message: "La dépense a été ajoutée au plan mensuel.",
    fieldErrors: {},
    values: { label: "", monthlyAmount: "" },
  };
}

export async function updateExpense(
  expenseId: string,
  _previousState: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  if (!UUID_PATTERN.test(expenseId)) {
    return invalidExpenseState("Cette dépense est introuvable.");
  }

  const validation = validateRecurringEntryInput({
    label: formData.get("label"),
    monthlyAmount: formData.get("monthlyAmount"),
  });

  if (!validation.valid) {
    return {
      status: "error",
      message: "Corrigez les champs indiqués.",
      fieldErrors: validation.fieldErrors,
      values: validation.values,
    };
  }

  const { supabase, userId } = await requireAuthenticatedProfile();
  const { data, error } = await supabase
    .from("recurring_fixed_expenses")
    .update({
      label: validation.data.label,
      amount_cents: validation.data.amountCents,
    })
    .eq("id", expenseId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return invalidExpenseState(
      "La dépense n’a pas pu être modifiée. Elle est peut-être introuvable.",
    );
  }

  revalidateExpenseViews();

  return {
    status: "success",
    message: "Les modifications sont enregistrées.",
    fieldErrors: {},
    values: validation.values,
  };
}

export async function setExpenseActive(
  expenseId: string,
  nextIsActive: boolean,
  _previousState: ExpenseActionState,
  _formData: FormData,
): Promise<ExpenseActionState> {
  void _previousState;
  void _formData;

  if (!UUID_PATTERN.test(expenseId) || typeof nextIsActive !== "boolean") {
    return invalidExpenseState("Cette dépense est introuvable.");
  }

  const { supabase, userId } = await requireAuthenticatedProfile();
  const { data, error } = await supabase
    .from("recurring_fixed_expenses")
    .update({ is_active: nextIsActive })
    .eq("id", expenseId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return invalidExpenseState(
      "Le statut de la dépense n’a pas pu être modifié.",
    );
  }

  revalidateExpenseViews();

  return {
    status: "success",
    message: nextIsActive
      ? "La dépense est de nouveau incluse dans le dashboard."
      : "La dépense est exclue des calculs du dashboard.",
    fieldErrors: {},
    values: { label: "", monthlyAmount: "" },
  };
}

export async function deleteExpense(
  expenseId: string,
  _previousState: ExpenseActionState,
  _formData: FormData,
): Promise<ExpenseActionState> {
  void _previousState;
  void _formData;

  if (!UUID_PATTERN.test(expenseId)) {
    return invalidExpenseState("Cette dépense est introuvable.");
  }

  const { supabase, userId } = await requireAuthenticatedProfile();
  const { data, error } = await supabase
    .from("recurring_fixed_expenses")
    .delete()
    .eq("id", expenseId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return invalidExpenseState("La dépense n’a pas pu être supprimée.");
  }

  revalidateExpenseViews();

  return {
    status: "success",
    message: "La dépense a été supprimée.",
    fieldErrors: {},
    values: { label: "", monthlyAmount: "" },
  };
}
