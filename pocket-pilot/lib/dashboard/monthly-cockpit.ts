import type { CategoryBudgetUsage } from "../budgets/category-budget.ts";
import {
  calculateSavingsGoalPlan,
  type SavingsGoalPlan,
} from "../finance/savings-goal.ts";
import {
  addCents,
  readStoredCents,
  subtractCents,
} from "../finance/money.ts";

export type MonthlyBalancePoint = {
  day: number;
  remainingCents: number;
  spentCents: number;
};

export type DashboardGoal = SavingsGoalPlan & {
  currentAmountCents: number;
  monthlyAllocationCents: number;
  name: string;
  targetAmountCents: number;
};

export type MonthlyInsight =
  | {
      amountCents: number;
      kind: "real-available";
      tone: "negative" | "positive";
    }
  | {
      category: CategoryBudgetUsage["category"];
      kind: "budget-exceeded";
      overrunCents: number;
      tone: "negative";
    }
  | {
      category: CategoryBudgetUsage["category"];
      kind: "budget-near";
      percentageConsumed: string;
      tone: "warning";
    }
  | {
      kind: "goal-progress";
      name: string;
      progressPercent: number;
      tone: "positive";
    };

type DatedTransaction = {
  amountCents: unknown;
  transactionDate: string;
};

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseIsoDate(value: string) {
  const match = ISO_DATE_PATTERN.exec(value);

  if (!match) {
    throw new Error("La date de transaction est invalide.");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error("La date de transaction est impossible.");
  }

  return { day, month, year };
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function readSignedCents(value: unknown, fieldName: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value)) {
    throw new Error(`${fieldName} doit être un entier sûr en centimes.`);
  }

  return value;
}

export function buildMonthlyBalanceTrend({
  availableCents,
  monthDate,
  transactions,
}: {
  availableCents: unknown;
  monthDate: string;
  transactions: readonly DatedTransaction[];
}): MonthlyBalancePoint[] {
  const initialAvailableCents = readStoredCents(availableCents, {
    allowZero: true,
    fieldName: "Le budget disponible",
  });
  const selectedMonth = parseIsoDate(monthDate);
  const daysInMonth = getDaysInMonth(selectedMonth.year, selectedMonth.month);
  const spentByDay = new Map<number, number>();

  for (const transaction of transactions) {
    const transactionDate = parseIsoDate(transaction.transactionDate);

    if (
      transactionDate.year !== selectedMonth.year ||
      transactionDate.month !== selectedMonth.month
    ) {
      throw new Error("La transaction ne fait pas partie du mois affiché.");
    }

    const amountCents = readStoredCents(transaction.amountCents, {
      allowZero: false,
      fieldName: "La transaction",
    });
    spentByDay.set(
      transactionDate.day,
      addCents(spentByDay.get(transactionDate.day) ?? 0, amountCents),
    );
  }

  const points: MonthlyBalancePoint[] = [
    { day: 0, remainingCents: initialAvailableCents, spentCents: 0 },
  ];
  let cumulativeSpentCents = 0;

  for (let day = 1; day <= daysInMonth; day += 1) {
    cumulativeSpentCents = addCents(
      cumulativeSpentCents,
      spentByDay.get(day) ?? 0,
    );
    points.push({
      day,
      remainingCents: subtractCents(
        initialAvailableCents,
        cumulativeSpentCents,
      ),
      spentCents: cumulativeSpentCents,
    });
  }

  return points;
}

export function selectFeaturedGoal(
  goals: readonly {
    currentAmountCents: unknown;
    monthlyAllocationCents: unknown;
    name: string;
    targetAmountCents: unknown;
  }[],
): DashboardGoal | null {
  const plannedGoals = goals.map((goal) => {
    const plan = calculateSavingsGoalPlan(goal);
    const currentAmountCents = readStoredCents(goal.currentAmountCents, {
      allowZero: true,
      fieldName: "Le montant actuel de l’objectif",
    });
    const monthlyAllocationCents = readStoredCents(
      goal.monthlyAllocationCents,
      {
        allowZero: true,
        fieldName: "L’allocation mensuelle de l’objectif",
      },
    );
    const targetAmountCents = readStoredCents(goal.targetAmountCents, {
      allowZero: false,
      fieldName: "Le montant cible de l’objectif",
    });

    return {
      ...plan,
      currentAmountCents,
      monthlyAllocationCents,
      name: goal.name,
      targetAmountCents,
    };
  });
  const activeGoals = plannedGoals.filter((goal) => !goal.isReached);
  const candidates = activeGoals.length > 0 ? activeGoals : plannedGoals;

  return (
    candidates.reduce<DashboardGoal | null>((featured, goal) => {
      if (!featured || goal.progressPercent > featured.progressPercent) {
        return goal;
      }

      return featured;
    }, null)
  );
}

export function rankCategoryBudgets(
  usages: readonly CategoryBudgetUsage[],
): CategoryBudgetUsage[] {
  return [...usages].sort((first, second) => {
    const crossProduct =
      BigInt(second.spentCents) * BigInt(first.monthlyBudgetCents) -
      BigInt(first.spentCents) * BigInt(second.monthlyBudgetCents);

    if (crossProduct > BigInt(0)) return 1;
    if (crossProduct < BigInt(0)) return -1;
    return first.category.localeCompare(second.category, "fr");
  });
}

export function buildMonthlyInsights({
  categoryBudgets,
  featuredGoal,
  realAvailableCents,
}: {
  categoryBudgets: readonly CategoryBudgetUsage[];
  featuredGoal: DashboardGoal | null;
  realAvailableCents: unknown;
}): MonthlyInsight[] {
  const available = readSignedCents(realAvailableCents, "Le reste réel");
  const insights: MonthlyInsight[] = [
    {
      amountCents: available,
      kind: "real-available",
      tone: available < 0 ? "negative" : "positive",
    },
  ];
  const mostConsumedBudget = rankCategoryBudgets(categoryBudgets)[0];

  if (mostConsumedBudget?.status === "exceeded") {
    insights.push({
      category: mostConsumedBudget.category,
      kind: "budget-exceeded",
      overrunCents: Math.abs(mostConsumedBudget.remainingCents),
      tone: "negative",
    });
  } else if (
    mostConsumedBudget?.status === "near" ||
    mostConsumedBudget?.status === "reached"
  ) {
    insights.push({
      category: mostConsumedBudget.category,
      kind: "budget-near",
      percentageConsumed: mostConsumedBudget.percentageConsumed,
      tone: "warning",
    });
  }

  if (featuredGoal) {
    insights.push({
      kind: "goal-progress",
      name: featuredGoal.name,
      progressPercent: featuredGoal.progressPercent,
      tone: "positive",
    });
  }

  return insights.slice(0, 3);
}
