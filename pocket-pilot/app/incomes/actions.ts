"use server";

import { revalidatePath } from "next/cache";

import type { RecurringEntryActionState } from "@/app/_components/recurring-entry/recurring-entry-types";
import {
  validateRecurringEntryInput,
} from "@/lib/finance/recurring-entry-input";
import { requireAuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";

export type IncomeActionState = RecurringEntryActionState;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function invalidIncomeState(
  message: string,
  values: IncomeActionState["values"] = { label: "", monthlyAmount: "" },
): IncomeActionState {
  return {
    status: "error",
    message,
    fieldErrors: {},
    values,
  };
}

function revalidateIncomeViews() {
  revalidatePath("/");
  revalidatePath("/incomes");
}

export async function createIncome(
  _previousState: IncomeActionState,
  formData: FormData,
): Promise<IncomeActionState> {
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
  const { error } = await supabase.from("recurring_incomes").insert({
    user_id: userId,
    label: validation.data.label,
    amount_cents: validation.data.amountCents,
    is_active: true,
  });

  if (error) {
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
    values: { label: "", monthlyAmount: "" },
  };
}

export async function updateIncome(
  incomeId: string,
  _previousState: IncomeActionState,
  formData: FormData,
): Promise<IncomeActionState> {
  if (!UUID_PATTERN.test(incomeId)) {
    return invalidIncomeState("Ce revenu est introuvable.");
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
    .from("recurring_incomes")
    .update({
      label: validation.data.label,
      amount_cents: validation.data.amountCents,
    })
    .eq("id", incomeId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
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

  if (!UUID_PATTERN.test(incomeId) || typeof nextIsActive !== "boolean") {
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
    values: { label: "", monthlyAmount: "" },
  };
}

export async function deleteIncome(
  incomeId: string,
  _previousState: IncomeActionState,
  _formData: FormData,
): Promise<IncomeActionState> {
  void _previousState;
  void _formData;

  if (!UUID_PATTERN.test(incomeId)) {
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
    return invalidIncomeState("Le revenu n’a pas pu être supprimé.");
  }

  revalidateIncomeViews();

  return {
    status: "success",
    message: "Le revenu a été supprimé.",
    fieldErrors: {},
    values: { label: "", monthlyAmount: "" },
  };
}
