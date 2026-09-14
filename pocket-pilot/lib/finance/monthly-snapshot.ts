import {
  addCents,
  readStoredCents,
  subtractCents,
  sumPositiveStoredCents,
  sumStoredCents,
} from "./money.ts";

export type SavingsGoalAmounts = {
  currentAmountCents: unknown;
  targetAmountCents: unknown;
  monthlyAllocationCents: unknown;
};

export type MonthlySnapshot = {
  totalIncomeCents: number;
  totalOneTimeIncomeCents: number;
  totalFixedExpensesCents: number;
  totalGoalAllocationsCents: number;
  availableCents: number;
  activeGoalCount: number;
  realAvailableCents: number;
  totalTransactionsCents: number;
};

type MonthlySnapshotInput = {
  incomeAmountsCents: readonly unknown[];
  oneTimeIncomeAmountsCents?: readonly unknown[];
  fixedExpenseAmountsCents: readonly unknown[];
  goals: readonly SavingsGoalAmounts[];
  transactionAmountsCents?: readonly unknown[];
};

function readNonNegativeCents(value: unknown, fieldName: string): number {
  return readStoredCents(value, { allowZero: true, fieldName });
}

function sumCents(values: readonly unknown[], fieldName: string): number {
  return sumStoredCents(values, fieldName);
}

export function calculateMonthlySnapshot({
  incomeAmountsCents,
  oneTimeIncomeAmountsCents = [],
  fixedExpenseAmountsCents,
  goals,
  transactionAmountsCents = [],
}: MonthlySnapshotInput): MonthlySnapshot {
  const totalRecurringIncomeCents = sumCents(incomeAmountsCents, "Le revenu");
  const totalOneTimeIncomeCents = sumCents(
    oneTimeIncomeAmountsCents,
    "Le revenu ponctuel",
  );
  const totalIncomeCents = addCents(
    totalRecurringIncomeCents,
    totalOneTimeIncomeCents,
  );
  const totalFixedExpensesCents = sumCents(
    fixedExpenseAmountsCents,
    "La dépense fixe",
  );
  const totalTransactionsCents = sumPositiveStoredCents(
    transactionAmountsCents,
    "La transaction",
  );

  let activeGoalCount = 0;
  let totalGoalAllocationsCents = 0;

  for (const goal of goals) {
    const currentAmountCents = readNonNegativeCents(
      goal.currentAmountCents,
      "Le montant actuel de l’objectif",
    );
    const targetAmountCents = readNonNegativeCents(
      goal.targetAmountCents,
      "Le montant cible de l’objectif",
    );
    const monthlyAllocationCents = readNonNegativeCents(
      goal.monthlyAllocationCents,
      "L’allocation mensuelle de l’objectif",
    );

    if (targetAmountCents === 0 || currentAmountCents > targetAmountCents) {
      throw new Error("Les montants de l’objectif sont incohérents.");
    }

    if (currentAmountCents < targetAmountCents) {
      const remainingAmountCents = subtractCents(
        targetAmountCents,
        currentAmountCents,
      );
      const effectiveAllocationCents = Math.min(
        monthlyAllocationCents,
        remainingAmountCents,
      );

      activeGoalCount += 1;
      totalGoalAllocationsCents = addCents(
        totalGoalAllocationsCents,
        effectiveAllocationCents,
      );
    }
  }

  const availableCents = subtractCents(
    subtractCents(totalIncomeCents, totalFixedExpensesCents),
    totalGoalAllocationsCents,
  );
  const realAvailableCents = subtractCents(
    availableCents,
    totalTransactionsCents,
  );

  return {
    totalIncomeCents,
    totalOneTimeIncomeCents,
    totalFixedExpensesCents,
    totalGoalAllocationsCents,
    availableCents,
    activeGoalCount,
    realAvailableCents,
    totalTransactionsCents,
  };
}
