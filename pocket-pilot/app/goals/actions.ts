"use server";

import { revalidatePath } from "next/cache";

import type { GoalActionState } from "@/app/goals/goal-types";
import { validateSavingsGoalInput } from "@/lib/finance/savings-goal";
import { requireAuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const emptyGoalValues: GoalActionState["values"] = {
  name: "",
  targetAmount: "",
  currentAmount: "0,00",
  monthlyAllocation: "0,00",
};

function invalidGoalState(
  message: string,
  values: GoalActionState["values"] = emptyGoalValues,
): GoalActionState {
  return {
    status: "error",
    message,
    fieldErrors: {},
    values,
  };
}

function revalidateGoalViews() {
  revalidatePath("/");
  revalidatePath("/goals");
}

function validateGoalForm(formData: FormData) {
  return validateSavingsGoalInput({
    name: formData.get("name"),
    targetAmount: formData.get("targetAmount"),
    currentAmount: formData.get("currentAmount"),
    monthlyAllocation: formData.get("monthlyAllocation"),
  });
}

export async function createGoal(
  _previousState: GoalActionState,
  formData: FormData,
): Promise<GoalActionState> {
  const validation = validateGoalForm(formData);

  if (!validation.valid) {
    return {
      status: "error",
      message: "Corrigez les champs indiqués.",
      fieldErrors: validation.fieldErrors,
      values: validation.values,
    };
  }

  const { supabase, userId } = await requireAuthenticatedProfile();
  const { error } = await supabase.from("savings_goals").insert({
    user_id: userId,
    name: validation.data.name,
    target_amount_cents: validation.data.targetAmountCents,
    current_amount_cents: validation.data.currentAmountCents,
    monthly_allocation_cents: validation.data.monthlyAllocationCents,
  });

  if (error) {
    return invalidGoalState(
      "L’objectif n’a pas pu être créé. Réessayez dans un instant.",
      validation.values,
    );
  }

  revalidateGoalViews();

  return {
    status: "success",
    message: "L’objectif a été ajouté à votre plan.",
    fieldErrors: {},
    values: {
      name: "",
      targetAmount: "",
      currentAmount: "0,00",
      monthlyAllocation: "0,00",
    },
  };
}

export async function updateGoal(
  goalId: string,
  _previousState: GoalActionState,
  formData: FormData,
): Promise<GoalActionState> {
  if (!UUID_PATTERN.test(goalId)) {
    return invalidGoalState("Cet objectif est introuvable.");
  }

  const validation = validateGoalForm(formData);

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
    .from("savings_goals")
    .update({
      name: validation.data.name,
      target_amount_cents: validation.data.targetAmountCents,
      current_amount_cents: validation.data.currentAmountCents,
      monthly_allocation_cents: validation.data.monthlyAllocationCents,
    })
    .eq("id", goalId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return invalidGoalState(
      "L’objectif n’a pas pu être modifié. Il est peut-être introuvable.",
      validation.values,
    );
  }

  revalidateGoalViews();

  return {
    status: "success",
    message: "L’objectif et son épargne actuelle sont à jour.",
    fieldErrors: {},
    values: validation.values,
  };
}

export async function deleteGoal(
  goalId: string,
  _previousState: GoalActionState,
  _formData: FormData,
): Promise<GoalActionState> {
  void _previousState;
  void _formData;

  if (!UUID_PATTERN.test(goalId)) {
    return invalidGoalState("Cet objectif est introuvable.");
  }

  const { supabase, userId } = await requireAuthenticatedProfile();
  const { data, error } = await supabase
    .from("savings_goals")
    .delete()
    .eq("id", goalId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return invalidGoalState("L’objectif n’a pas pu être supprimé.");
  }

  revalidateGoalViews();

  return {
    status: "success",
    message: "L’objectif a été supprimé.",
    fieldErrors: {},
    values: {
      name: "",
      targetAmount: "",
      currentAmount: "0,00",
      monthlyAllocation: "0,00",
    },
  };
}
