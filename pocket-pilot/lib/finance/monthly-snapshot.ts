export type SavingsGoalAmounts = {
  currentAmountCents: unknown;
  targetAmountCents: unknown;
  monthlyAllocationCents: unknown;
};

export type MonthlySnapshot = {
  totalIncomeCents: number;
  totalFixedExpensesCents: number;
  totalGoalAllocationsCents: number;
  availableCents: number;
  activeGoalCount: number;
};

type MonthlySnapshotInput = {
  incomeAmountsCents: readonly unknown[];
  fixedExpenseAmountsCents: readonly unknown[];
  goals: readonly SavingsGoalAmounts[];
};

function readNonNegativeCents(value: unknown, fieldName: string): number {
  const amount =
    typeof value === "string" && /^\d+$/.test(value)
      ? Number(value)
      : value;

  if (
    typeof amount !== "number" ||
    !Number.isSafeInteger(amount) ||
    amount < 0
  ) {
    throw new Error(`${fieldName} doit être un montant entier sûr en centimes.`);
  }

  return amount;
}

function addCents(total: number, amount: number): number {
  const result = total + amount;

  if (!Number.isSafeInteger(result)) {
    throw new Error("Le total financier dépasse la précision entière disponible.");
  }

  return result;
}

function sumCents(values: readonly unknown[], fieldName: string): number {
  return values.reduce<number>(
    (total, value) => addCents(total, readNonNegativeCents(value, fieldName)),
    0,
  );
}

export function calculateMonthlySnapshot({
  incomeAmountsCents,
  fixedExpenseAmountsCents,
  goals,
}: MonthlySnapshotInput): MonthlySnapshot {
  const totalIncomeCents = sumCents(incomeAmountsCents, "Le revenu");
  const totalFixedExpensesCents = sumCents(
    fixedExpenseAmountsCents,
    "La dépense fixe",
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
      activeGoalCount += 1;
      totalGoalAllocationsCents = addCents(
        totalGoalAllocationsCents,
        monthlyAllocationCents,
      );
    }
  }

  const availableCents =
    totalIncomeCents -
    totalFixedExpensesCents -
    totalGoalAllocationsCents;

  if (!Number.isSafeInteger(availableCents)) {
    throw new Error("Le reste mensuel dépasse la précision entière disponible.");
  }

  return {
    totalIncomeCents,
    totalFixedExpensesCents,
    totalGoalAllocationsCents,
    availableCents,
    activeGoalCount,
  };
}
