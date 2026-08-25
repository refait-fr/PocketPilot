import {
  addCents,
  formatCentsForInput,
  parseMoneyInput,
  readStoredCents,
  subtractCents,
} from "../finance/money.ts";
import {
  isTransactionCategory,
  TRANSACTION_CATEGORIES,
  type TransactionCategory,
} from "../transactions/categories.ts";

export const CATEGORY_BUDGET_THRESHOLDS = {
  nearPercent: 75,
  reachedPercent: 100,
} as const;

export type CategoryBudgetStatus = "ok" | "near" | "reached" | "exceeded";

export type CategoryBudgetInputValues = {
  category: string;
  monthlyBudget: string;
};

export type CategoryBudgetInputFieldErrors = Partial<
  Record<keyof CategoryBudgetInputValues, string>
>;

export type CategoryBudgetUsage = {
  category: TransactionCategory;
  id: string;
  monthlyBudgetCents: number;
  percentageConsumed: string;
  progressPercent: number;
  remainingCents: number;
  spentCents: number;
  status: CategoryBudgetStatus;
};

export type CategoryBudgetSummary = {
  configuredCount: number;
  exceededCount: number;
  mostConsumed: CategoryBudgetUsage | null;
  totalBudgetCents: number;
  totalRemainingCents: number;
  totalSpentCents: number;
};

type CategoryBudgetRecord = {
  category: TransactionCategory;
  id: string;
  monthlyBudgetCents: number;
};

type CategorizedAmount = {
  amountCents: number;
  category: TransactionCategory;
};

function readText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function validateCategoryBudgetInput(input: {
  category: unknown;
  monthlyBudget: unknown;
}) {
  const values: CategoryBudgetInputValues = {
    category: readText(input.category),
    monthlyBudget: readText(input.monthlyBudget),
  };
  const fieldErrors: CategoryBudgetInputFieldErrors = {};
  const parsedBudget = parseMoneyInput(values.monthlyBudget, {
    allowZero: false,
    emptyMessage: "Saisissez un plafond mensuel.",
    invalidMessage: "Saisissez un montant numérique, par exemple 100,00.",
  });

  if (!isTransactionCategory(values.category)) {
    fieldErrors.category = "Choisissez une catégorie valide.";
  }

  if (!parsedBudget.valid) {
    fieldErrors.monthlyBudget = parsedBudget.message;
  }

  if (!isTransactionCategory(values.category) || !parsedBudget.valid) {
    return { valid: false as const, fieldErrors, values };
  }

  return {
    valid: true as const,
    data: {
      category: values.category,
      monthlyBudgetCents: parsedBudget.amountCents,
    },
    values: {
      category: values.category,
      monthlyBudget: values.monthlyBudget.trim(),
    },
  };
}

export function calculateCategoryBudgetUsage({
  budget,
  spentCents,
}: {
  budget: CategoryBudgetRecord;
  spentCents: number;
}): CategoryBudgetUsage {
  const monthlyBudgetCents = readStoredCents(budget.monthlyBudgetCents, {
    allowZero: false,
    fieldName: "Le budget mensuel",
  });
  const spent = readStoredCents(spentCents, {
    allowZero: true,
    fieldName: "Le total dépensé",
  });
  const scaledSpent = BigInt(spent) * BigInt(100);
  const budgetAsBigInt = BigInt(monthlyBudgetCents);
  const percentage = scaledSpent / budgetAsBigInt;
  const status: CategoryBudgetStatus =
    spent > monthlyBudgetCents
      ? "exceeded"
      : spent === monthlyBudgetCents
        ? "reached"
        : scaledSpent >=
            budgetAsBigInt * BigInt(CATEGORY_BUDGET_THRESHOLDS.nearPercent)
          ? "near"
          : "ok";

  return {
    ...budget,
    monthlyBudgetCents,
    percentageConsumed: percentage.toString(),
    progressPercent: Number(percentage > BigInt(100) ? BigInt(100) : percentage),
    remainingCents: subtractCents(monthlyBudgetCents, spent),
    spentCents: spent,
    status,
  };
}

export function calculateCategoryBudgetUsages(
  budgets: readonly CategoryBudgetRecord[],
  transactions: readonly CategorizedAmount[],
): CategoryBudgetUsage[] {
  const spentByCategory = new Map<TransactionCategory, number>(
    TRANSACTION_CATEGORIES.map((category) => [category, 0]),
  );

  for (const transaction of transactions) {
    const amount = readStoredCents(transaction.amountCents, {
      allowZero: false,
      fieldName: "La transaction",
    });
    spentByCategory.set(
      transaction.category,
      addCents(spentByCategory.get(transaction.category) ?? 0, amount),
    );
  }

  const seenCategories = new Set<TransactionCategory>();

  return budgets.map((budget) => {
    if (seenCategories.has(budget.category)) {
      throw new Error("Une catégorie contient plusieurs budgets.");
    }
    seenCategories.add(budget.category);

    return calculateCategoryBudgetUsage({
      budget,
      spentCents: spentByCategory.get(budget.category) ?? 0,
    });
  });
}

export function summarizeCategoryBudgets(
  usages: readonly CategoryBudgetUsage[],
): CategoryBudgetSummary {
  let mostConsumed: CategoryBudgetUsage | null = null;
  let totalBudgetCents = 0;
  let totalSpentCents = 0;

  for (const usage of usages) {
    totalBudgetCents = addCents(totalBudgetCents, usage.monthlyBudgetCents);
    totalSpentCents = addCents(totalSpentCents, usage.spentCents);
    if (
      !mostConsumed ||
      BigInt(usage.spentCents) * BigInt(mostConsumed.monthlyBudgetCents) >
        BigInt(mostConsumed.spentCents) * BigInt(usage.monthlyBudgetCents)
    ) {
      mostConsumed = usage;
    }
  }

  return {
    configuredCount: usages.length,
    exceededCount: usages.filter((usage) => usage.status === "exceeded").length,
    mostConsumed,
    totalBudgetCents,
    totalRemainingCents: subtractCents(totalBudgetCents, totalSpentCents),
    totalSpentCents,
  };
}

export function formatCategoryBudgetCentsForInput(amountCents: number): string {
  return formatCentsForInput(amountCents, {
    allowZero: false,
    fieldName: "Le budget mensuel",
  });
}
