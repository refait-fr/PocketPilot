"use server";

import { revalidatePath } from "next/cache";

import type { RecurringEntryActionState } from "@/app/_components/recurring-entry/recurring-entry-types";
import { validateRecurringEntryInput } from "@/lib/finance/recurring-entry-input";
import { requireAuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";
import { logServerError } from "@/lib/observability/server-log";
import { isUuid } from "@/lib/validation/uuid";

export type ExpenseActionState = RecurringEntryActionState;

function invalidExpenseState(
  message: string,
  values: ExpenseActionState["values"] = { label: "", monthlyAmount: "", startDate: "" },
): ExpenseActionState {
  return {
    status: "error",
    message,
    fieldErrors: {},
    values,
  };
}

function revalidateExpenseViews() {
  revalidatePath("/dashboard");
  revalidatePath("/expenses");
}

export async function createExpense(
  _previousState: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  const validation = validateRecurringEntryInput({
    label: formData.get("label"),
    monthlyAmount: formData.get("monthlyAmount"),
    startDate: formData.get("startDate"),
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
    start_date: validation.data.startDate,
    is_active: true,
  });

  if (error) {
    logServerError("expenses:create", error);
    return invalidExpenseState(
      "La dépense n’a pas pu être créée. Réessayez dans un instant.",
      validation.values,
    );
  }

  revalidateExpenseViews();

  return {
    status: "success",
    message: "La dépense a été ajoutée au plan mensuel.",
    fieldErrors: {},
    values: { label: "", monthlyAmount: "", startDate: "" },
  };
}

export async function updateExpense(
  expenseId: string,
  _previousState: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  if (!isUuid(expenseId)) {
    return invalidExpenseState("Cette dépense est introuvable.");
  }

  const validation = validateRecurringEntryInput({
    label: formData.get("label"),
    monthlyAmount: formData.get("monthlyAmount"),
    startDate: formData.get("startDate"),
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
      start_date: validation.data.startDate,
    })
    .eq("id", expenseId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    if (error) logServerError("expenses:update", error);
    return invalidExpenseState(
      "La dépense n’a pas pu être modifiée. Elle est peut-être introuvable.",
      validation.values,
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

  if (!isUuid(expenseId) || typeof nextIsActive !== "boolean") {
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
    if (error) logServerError("expenses:set-active", error);
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
    values: { label: "", monthlyAmount: "", startDate: "" },
  };
}

export async function deleteExpense(
  expenseId: string,
  _previousState: ExpenseActionState,
  _formData: FormData,
): Promise<ExpenseActionState> {
  void _previousState;
  void _formData;

  if (!isUuid(expenseId)) {
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
    if (error) logServerError("expenses:delete", error);
    return invalidExpenseState("La dépense n’a pas pu être supprimée.");
  }

  revalidateExpenseViews();

  return {
    status: "success",
    message: "La dépense a été supprimée.",
    fieldErrors: {},
    values: { label: "", monthlyAmount: "", startDate: "" },
  };
}
