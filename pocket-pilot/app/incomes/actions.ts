"use server";

import { revalidatePath } from "next/cache";

import type { RecurringEntryActionState } from "@/app/_components/recurring-entry/recurring-entry-types";
import {
  validateRecurringEntryInput,
} from "@/lib/finance/recurring-entry-input";
import { requireAuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";
import { logServerError } from "@/lib/observability/server-log";
import { isUuid } from "@/lib/validation/uuid";

export type IncomeActionState = RecurringEntryActionState;

function invalidIncomeState(
  message: string,
  values: IncomeActionState["values"] = { label: "", monthlyAmount: "", startDate: "" },
): IncomeActionState {
  return {
    status: "error",
    message,
    fieldErrors: {},
    values,
  };
}

function revalidateIncomeViews() {
  revalidatePath("/dashboard");
  revalidatePath("/incomes");
}

export async function createIncome(
  _previousState: IncomeActionState,
  formData: FormData,
): Promise<IncomeActionState> {
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
  const { error } = await supabase.from("recurring_incomes").insert({
    user_id: userId,
    label: validation.data.label,
    amount_cents: validation.data.amountCents,
    start_date: validation.data.startDate,
    is_active: true,
  });

  if (error) {
    logServerError("incomes:create", error);
    return invalidIncomeState(
      "Le revenu n’a pas pu être créé. Réessayez dans un instant.",
      validation.values,
    );
  }

  revalidateIncomeViews();

  return {
    status: "success",
    message: "Le revenu a été ajouté au plan mensuel.",
    fieldErrors: {},
    values: { label: "", monthlyAmount: "", startDate: "" },
  };
}

export async function updateIncome(
  incomeId: string,
  _previousState: IncomeActionState,
  formData: FormData,
): Promise<IncomeActionState> {
  if (!isUuid(incomeId)) {
    return invalidIncomeState("Ce revenu est introuvable.");
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
    .from("recurring_incomes")
    .update({
      label: validation.data.label,
      amount_cents: validation.data.amountCents,
      start_date: validation.data.startDate,
    })
    .eq("id", incomeId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    if (error) logServerError("incomes:update", error);
    return invalidIncomeState(
      "Le revenu n’a pas pu être modifié. Il est peut-être introuvable.",
      validation.values,
    );
  }

  revalidateIncomeViews();

  return {
    status: "success",
    message: "Les modifications sont enregistrées.",
    fieldErrors: {},
    values: validation.values,
  };
}

export async function setIncomeActive(
  incomeId: string,
  nextIsActive: boolean,
  _previousState: IncomeActionState,
  _formData: FormData,
): Promise<IncomeActionState> {
  void _previousState;
  void _formData;

  if (!isUuid(incomeId) || typeof nextIsActive !== "boolean") {
    return invalidIncomeState("Ce revenu est introuvable.");
  }

  const { supabase, userId } = await requireAuthenticatedProfile();
  const { data, error } = await supabase
    .from("recurring_incomes")
    .update({ is_active: nextIsActive })
    .eq("id", incomeId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    if (error) logServerError("incomes:set-active", error);
    return invalidIncomeState(
      "Le statut du revenu n’a pas pu être modifié.",
    );
  }

  revalidateIncomeViews();

  return {
    status: "success",
    message: nextIsActive
      ? "Le revenu est de nouveau inclus dans le dashboard."
      : "Le revenu est exclu des calculs du dashboard.",
    fieldErrors: {},
    values: { label: "", monthlyAmount: "", startDate: "" },
  };
}

export async function deleteIncome(
  incomeId: string,
  _previousState: IncomeActionState,
  _formData: FormData,
): Promise<IncomeActionState> {
  void _previousState;
  void _formData;

  if (!isUuid(incomeId)) {
    return invalidIncomeState("Ce revenu est introuvable.");
  }

  const { supabase, userId } = await requireAuthenticatedProfile();
  const { data, error } = await supabase
    .from("recurring_incomes")
    .delete()
    .eq("id", incomeId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    if (error) logServerError("incomes:delete", error);
    return invalidIncomeState("Le revenu n’a pas pu être supprimé.");
  }

  revalidateIncomeViews();

  return {
    status: "success",
    message: "Le revenu a été supprimé.",
    fieldErrors: {},
    values: { label: "", monthlyAmount: "", startDate: "" },
  };
}
