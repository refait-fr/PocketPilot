"use server";

import { revalidatePath } from "next/cache";

import type { OneTimeIncomeActionState } from "@/app/incomes/one-time-types";
import { getCalendarDateInTimeZone } from "@/lib/finance/calendar-month";
import { validateOneTimeIncomeInput } from "@/lib/finance/one-time-income-input";
import { logServerError } from "@/lib/observability/server-log";
import { requireAuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";
import { isUuid } from "@/lib/validation/uuid";

const emptyValues: OneTimeIncomeActionState["values"] = {
  amount: "",
  incomeDate: "",
  label: "",
};

function invalidState(
  message: string,
  values: OneTimeIncomeActionState["values"] = emptyValues,
): OneTimeIncomeActionState {
  return {
    fieldErrors: {},
    message,
    status: "error",
    values,
  };
}

function validateForm(formData: FormData, maximumIncomeDate: string) {
  return validateOneTimeIncomeInput({
    amount: formData.get("amount"),
    incomeDate: formData.get("incomeDate"),
    label: formData.get("label"),
    maximumIncomeDate,
  });
}

function revalidateOneTimeIncomeViews() {
  revalidatePath("/dashboard");
  revalidatePath("/incomes");
  revalidatePath("/incomes/ponctuels");
  revalidatePath("/purchase-checker");
}

export async function createOneTimeIncome(
  _previousState: OneTimeIncomeActionState,
  formData: FormData,
): Promise<OneTimeIncomeActionState> {
  const { profile, supabase, userId } = await requireAuthenticatedProfile();
  const maximumIncomeDate = getCalendarDateInTimeZone(new Date(), profile.timeZone);
  const validation = validateForm(formData, maximumIncomeDate);

  if (!validation.valid) {
    return {
      fieldErrors: validation.fieldErrors,
      message: "Corrigez les champs indiqués.",
      status: "error",
      values: validation.values,
    };
  }

  const { error } = await supabase.from("one_time_incomes").insert({
    amount_cents: validation.data.amountCents,
    income_date: validation.data.incomeDate,
    label: validation.data.label,
    user_id: userId,
  });

  if (error) {
    logServerError("one-time-incomes:create", error);
    return invalidState(
      "Le revenu n’a pas pu être créé. Réessayez dans un instant.",
      validation.values,
    );
  }

  revalidateOneTimeIncomeViews();

  return {
    fieldErrors: {},
    message: "Le revenu ponctuel a été ajouté au mois.",
    status: "success",
    values: {
      ...emptyValues,
      incomeDate: maximumIncomeDate,
    },
  };
}

export async function updateOneTimeIncome(
  incomeId: string,
  _previousState: OneTimeIncomeActionState,
  formData: FormData,
): Promise<OneTimeIncomeActionState> {
  if (!isUuid(incomeId)) {
    return invalidState("Ce revenu est introuvable.");
  }

  const { profile, supabase, userId } = await requireAuthenticatedProfile();
  const maximumIncomeDate = getCalendarDateInTimeZone(new Date(), profile.timeZone);
  const validation = validateForm(formData, maximumIncomeDate);

  if (!validation.valid) {
    return {
      fieldErrors: validation.fieldErrors,
      message: "Corrigez les champs indiqués.",
      status: "error",
      values: validation.values,
    };
  }

  const { data, error } = await supabase
    .from("one_time_incomes")
    .update({
      amount_cents: validation.data.amountCents,
      income_date: validation.data.incomeDate,
      label: validation.data.label,
    })
    .eq("id", incomeId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    if (error) logServerError("one-time-incomes:update", error);
    return invalidState(
      "Le revenu n’a pas pu être modifié. Il est peut-être introuvable.",
      validation.values,
    );
  }

  revalidateOneTimeIncomeViews();

  return {
    fieldErrors: {},
    message: "Les modifications sont enregistrées.",
    status: "success",
    values: validation.values,
  };
}

export async function deleteOneTimeIncome(
  incomeId: string,
  _previousState: OneTimeIncomeActionState,
  _formData: FormData,
): Promise<OneTimeIncomeActionState> {
  void _previousState;
  void _formData;

  if (!isUuid(incomeId)) {
    return invalidState("Ce revenu est introuvable.");
  }

  const { supabase, userId } = await requireAuthenticatedProfile();
  const { data, error } = await supabase
    .from("one_time_incomes")
    .delete()
    .eq("id", incomeId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    if (error) logServerError("one-time-incomes:delete", error);
    return invalidState("Le revenu n’a pas pu être supprimé.");
  }

  revalidateOneTimeIncomeViews();

  return {
    fieldErrors: {},
    message: "Le revenu ponctuel a été supprimé.",
    status: "success",
    values: emptyValues,
  };
}
