import type {
  SavingsGoalInputFieldErrors,
  SavingsGoalInputValues,
} from "@/lib/finance/savings-goal";

export type GoalActionState = {
  status: "idle" | "error" | "success";
  message: string;
  fieldErrors: SavingsGoalInputFieldErrors;
  values: SavingsGoalInputValues;
};

export type GoalView = {
  id: string;
  name: string;
  targetAmountCents: number;
  currentAmountCents: number;
  monthlyAllocationCents: number;
  remainingAmountCents: number;
  progressPercent: number;
  isReached: boolean;
  estimatedMonths: number | null;
  estimatedCompletionLabel: string | null;
};

export type GoalFormAction = (
  state: GoalActionState,
  formData: FormData,
) => Promise<GoalActionState>;

export type GoalUpdateAction = (
  goalId: string,
  state: GoalActionState,
  formData: FormData,
) => Promise<GoalActionState>;

export type GoalDeleteAction = (
  goalId: string,
  state: GoalActionState,
  formData: FormData,
) => Promise<GoalActionState>;
