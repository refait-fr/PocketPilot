import type { SupabaseClient } from "@supabase/supabase-js";

import {
  calculateCategoryBudgetUsages,
} from "@/lib/budgets/category-budget";
import {
  formatCalendarMonth,
  getCalendarDateInTimeZone,
  getCalendarMonthInTimeZone,
  getCalendarMonthRange,
} from "@/lib/finance/calendar-month";
import { estimateCompletionMonth } from "@/lib/finance/savings-goal";
import { readPositiveOneTimeIncomeCents } from "@/lib/finance/one-time-income-input";
import {
  buildMonthlyBalanceTrend,
  rankCategoryBudgets,
  selectFeaturedGoal,
} from "@/lib/dashboard/monthly-cockpit";
import { calculateMonthlySnapshot } from "@/lib/finance/monthly-snapshot";
import { readStoredCents } from "@/lib/finance/money";
import { fetchAllWithRange } from "@/lib/supabase/paginate";
import { isAllowedCategory } from "@/lib/transactions/allowed-categories";
import {
  isValidTransactionDate,
  MAX_TRANSACTION_DESCRIPTION_LENGTH,
} from "@/lib/transactions/transaction-input";
import { fetchUserCategoryNames } from "@/lib/transactions/user-categories";

export async function loadCurrentMonthOverview({
  supabase,
  timeZone,
  userId,
}: {
  supabase: SupabaseClient;
  timeZone: string;
  userId: string;
}) {
  const todayIso = getCalendarDateInTimeZone(new Date(), timeZone);
  const currentMonth = getCalendarMonthInTimeZone(new Date(), timeZone);
  const currentMonthRange = getCalendarMonthRange(currentMonth);
  const customCategoryNames = await fetchUserCategoryNames({ supabase, userId });
  // Pagination explicite : PostgREST plafonne à max_rows (1000) sans erreur,
  // un mois tronqué fausserait sinon le snapshot. L'ordre inclut toujours
  // l'id pour rester déterministe d'une page à l'autre.
  let incomes: { amount_cents: unknown; is_active: unknown; label: unknown; start_date: unknown }[];
  let expenses: { amount_cents: unknown; is_active: unknown; label: unknown; start_date: unknown }[];
  let goals: {
    name: unknown;
    current_amount_cents: unknown;
    target_amount_cents: unknown;
    monthly_allocation_cents: unknown;
  }[];
  let transactions: {
    id: unknown;
    amount_cents: unknown;
    category: unknown;
    description: unknown;
    transaction_date: unknown;
  }[];
  let budgets: { id: unknown; category: unknown; monthly_budget_cents: unknown }[];
  let oneTimeIncomes: {
    id: unknown;
    label: unknown;
    amount_cents: unknown;
    income_date: unknown;
  }[];

  try {
    [incomes, expenses, goals, transactions, budgets, oneTimeIncomes] =
      await Promise.all([
      fetchAllWithRange((from, to) =>
        supabase
          .from("recurring_incomes")
          .select("amount_cents, is_active, label, start_date")
          .eq("user_id", userId)
          .order("id")
          .range(from, to),
      ),
      fetchAllWithRange((from, to) =>
        supabase
          .from("recurring_fixed_expenses")
          .select("amount_cents, is_active, label, start_date")
          .eq("user_id", userId)
          .order("id")
          .range(from, to),
      ),
      fetchAllWithRange((from, to) =>
        supabase
          .from("savings_goals")
          .select(
            "name, current_amount_cents, target_amount_cents, monthly_allocation_cents, created_at",
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .order("id", { ascending: false })
          .range(from, to),
      ),
      fetchAllWithRange((from, to) =>
        supabase
          .from("transactions")
          .select("id, amount_cents, category, description, transaction_date")
          .eq("user_id", userId)
          .gte("transaction_date", currentMonthRange.startInclusive)
          .lt("transaction_date", currentMonthRange.endExclusive)
          .order("transaction_date", { ascending: false })
          .order("id", { ascending: false })
          .range(from, to),
      ),
      fetchAllWithRange((from, to) =>
        supabase
          .from("category_budgets")
          .select("id, category, monthly_budget_cents")
          .eq("user_id", userId)
          .order("id")
          .range(from, to),
      ),
      fetchAllWithRange((from, to) =>
        supabase
          .from("one_time_incomes")
          .select("id, label, amount_cents, income_date")
          .eq("user_id", userId)
          .gte("income_date", currentMonthRange.startInclusive)
          .lt("income_date", currentMonthRange.endExclusive)
          .order("income_date", { ascending: false })
          .order("id", { ascending: false })
          .range(from, to),
      ),
    ]);
  } catch {
    throw new Error("Impossible de charger les données financières du mois.");
  }

  const categoryTransactions = transactions.map((transaction) => {
    if (
      typeof transaction.id !== "string" ||
      !isAllowedCategory(transaction.category, customCategoryNames) ||
      typeof transaction.description !== "string" ||
      transaction.description.trim().length >
        MAX_TRANSACTION_DESCRIPTION_LENGTH ||
      !isValidTransactionDate(transaction.transaction_date)
    ) {
      throw new Error("Une transaction contient des données invalides.");
    }
    return {
      amountCents: readStoredCents(transaction.amount_cents, {
        allowZero: false,
        fieldName: "La transaction",
      }),
      category: transaction.category,
      description: transaction.description.trim(),
      id: transaction.id,
      transactionDate: transaction.transaction_date,
    };
  });
  const categoryBudgets = budgets.map((budget) => {
    if (typeof budget.id !== "string" || !isAllowedCategory(budget.category, customCategoryNames)) {
      throw new Error("Un budget contient des données invalides.");
    }
    return {
      category: budget.category,
      id: budget.id,
      monthlyBudgetCents: readStoredCents(budget.monthly_budget_cents, {
        allowZero: false,
        fieldName: "Le budget mensuel",
      }),
    };
  });
  const categoryBudgetUsages = calculateCategoryBudgetUsages(
    categoryBudgets,
    categoryTransactions,
  );
  // Une entrée récurrente compte pour le mois dès que son début est atteint
  // (comparaison ISO sûre : start_date < 1er jour du mois suivant).
  const startedIncomes = incomes.filter(
    (income) =>
      income.is_active === true &&
      typeof income.start_date === "string" &&
      isValidTransactionDate(income.start_date) &&
      income.start_date < currentMonthRange.endExclusive,
  );
  const startedExpenses = expenses.filter(
    (expense) =>
      expense.is_active === true &&
      typeof expense.start_date === "string" &&
      isValidTransactionDate(expense.start_date) &&
      expense.start_date < currentMonthRange.endExclusive,
  );

  for (const entry of [...incomes, ...expenses]) {
    if (
      typeof entry.start_date !== "string" ||
      !isValidTransactionDate(entry.start_date)
    ) {
      throw new Error("Une entrée récurrente contient des données invalides.");
    }
  }

  const upcomingIncomeCount = incomes.filter(
    (income) =>
      typeof income.start_date === "string" && income.start_date > todayIso,
  ).length;
  const upcomingExpenseCount = expenses.filter(
    (expense) =>
      typeof expense.start_date === "string" && expense.start_date > todayIso,
  ).length;
  // Seules les échéances futures bien formées alimentent les alertes : la
  // sélection mensuelle exige un libellé, une date valide et un montant
  // positif, et ignore le reste sans faire échouer le tableau de bord.
  const upcomingStarts: {
    amountCents: number;
    entryKind: "income" | "expense";
    label: string;
    startDate: string;
  }[] = [];

  for (const [entries, entryKind] of [
    [incomes, "income"],
    [expenses, "expense"],
  ] as const) {
    for (const entry of entries) {
      if (
        typeof entry.label !== "string" ||
        entry.label.trim().length === 0 ||
        typeof entry.start_date !== "string" ||
        !isValidTransactionDate(entry.start_date) ||
        entry.start_date <= todayIso ||
        typeof entry.amount_cents !== "number" ||
        !Number.isSafeInteger(entry.amount_cents) ||
        entry.amount_cents <= 0
      ) {
        continue;
      }

      upcomingStarts.push({
        amountCents: entry.amount_cents,
        entryKind,
        label: entry.label.trim(),
        startDate: entry.start_date,
      });
    }
  }

  const monthOneTimeIncomes = oneTimeIncomes.map((income) => {
    if (
      typeof income.id !== "string" ||
      typeof income.label !== "string" ||
      income.label.trim().length === 0 ||
      income.label.length > 100 ||
      !isValidTransactionDate(income.income_date)
    ) {
      throw new Error("Un revenu ponctuel contient des données invalides.");
    }

    return {
      amountCents: readPositiveOneTimeIncomeCents(income.amount_cents),
      id: income.id,
      incomeDate: income.income_date,
      label: income.label.trim(),
    };
  });
  const snapshot = calculateMonthlySnapshot({
    incomeAmountsCents: startedIncomes.map((income) => income.amount_cents),
    oneTimeIncomeAmountsCents: monthOneTimeIncomes.map(
      (income) => income.amountCents,
    ),
    fixedExpenseAmountsCents: startedExpenses.map(
      (expense) => expense.amount_cents,
    ),
    goals: goals.map((goal) => ({
      currentAmountCents: goal.current_amount_cents,
      targetAmountCents: goal.target_amount_cents,
      monthlyAllocationCents: goal.monthly_allocation_cents,
    })),
    transactionAmountsCents: categoryTransactions.map(
      (transaction) => transaction.amountCents,
    ),
  });
  const dashboardGoals = goals.map((goal) => {
    if (
      typeof goal.name !== "string" ||
      goal.name.trim().length === 0 ||
      goal.name.length > 100
    ) {
      throw new Error("Un objectif d’épargne contient des données invalides.");
    }

    return {
      currentAmountCents: goal.current_amount_cents,
      monthlyAllocationCents: goal.monthly_allocation_cents,
      name: goal.name,
      targetAmountCents: goal.target_amount_cents,
    };
  });
  const selectedGoal = selectFeaturedGoal(dashboardGoals);
  const featuredGoal =
    selectedGoal &&
    !selectedGoal.isReached &&
    selectedGoal.estimatedMonths !== null &&
    selectedGoal.estimatedMonths > 0
      ? {
          ...selectedGoal,
          estimatedArrivalLabel: formatCalendarMonth(
            estimateCompletionMonth(currentMonth, selectedGoal.estimatedMonths),
          ),
        }
      : selectedGoal;
  const rankedCategoryBudgets = rankCategoryBudgets(categoryBudgetUsages);
  const monthDate = getCalendarDateInTimeZone(new Date(), timeZone);
  const balanceTrend = buildMonthlyBalanceTrend({
    availableCents: snapshot.availableCents,
    monthDate,
    transactions: categoryTransactions,
  });
  return {
    activeExpenseCount: startedExpenses.length,
    activeIncomeCount: startedIncomes.length,
    expenseCount: expenses.length,
    goalCount: goals.length,
    incomeCount: incomes.length,
    oneTimeIncomeCount: monthOneTimeIncomes.length,
    upcomingExpenseCount,
    upcomingIncomeCount,
    categoryBudgetUsages,
    balanceTrend,
    currentDay: Number(monthDate.slice(8, 10)),
    featuredGoal,
    rankedCategoryBudgets,
    recentTransactions: categoryTransactions.slice(0, 5),
    snapshot,
    todayIso,
    transactionCount: transactions.length,
    upcomingStarts,
  };
}
