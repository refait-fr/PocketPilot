import type { SupabaseClient } from "@supabase/supabase-js";

import {
  calculateCategoryBudgetUsages,
} from "@/lib/budgets/category-budget";
import {
  getCalendarDateInTimeZone,
  getCalendarMonthInTimeZone,
  getCalendarMonthRange,
} from "@/lib/finance/calendar-month";
import {
  buildMonthlyBalanceTrend,
  rankCategoryBudgets,
  selectFeaturedGoal,
} from "@/lib/dashboard/monthly-cockpit";
import { calculateMonthlySnapshot } from "@/lib/finance/monthly-snapshot";
import { readStoredCents } from "@/lib/finance/money";
import { isTransactionCategory } from "@/lib/transactions/categories";
import {
  isValidTransactionDate,
  MAX_TRANSACTION_DESCRIPTION_LENGTH,
} from "@/lib/transactions/transaction-input";

export async function loadCurrentMonthOverview({
  supabase,
  timeZone,
  userId,
}: {
  supabase: SupabaseClient;
  timeZone: string;
  userId: string;
}) {
  const currentMonthRange = getCalendarMonthRange(
    getCalendarMonthInTimeZone(new Date(), timeZone),
  );
  const [
    incomesResult,
    expensesResult,
    goalsResult,
    transactionsResult,
    budgetsResult,
  ] =
    await Promise.all([
      supabase
        .from("recurring_incomes")
        .select("amount_cents, is_active")
        .eq("user_id", userId),
      supabase
        .from("recurring_fixed_expenses")
        .select("amount_cents, is_active")
        .eq("user_id", userId),
      supabase
        .from("savings_goals")
        .select(
          "name, current_amount_cents, target_amount_cents, monthly_allocation_cents, created_at",
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("transactions")
        .select("amount_cents, category, description, transaction_date")
        .eq("user_id", userId)
        .gte("transaction_date", currentMonthRange.startInclusive)
        .lt("transaction_date", currentMonthRange.endExclusive)
        .order("transaction_date", { ascending: false }),
      supabase
        .from("category_budgets")
        .select("id, category, monthly_budget_cents")
        .eq("user_id", userId),
    ]);

  if (
    incomesResult.error ||
    expensesResult.error ||
    goalsResult.error ||
    transactionsResult.error ||
    budgetsResult.error
  ) {
    throw new Error("Impossible de charger les données financières du mois.");
  }

  const goals = goalsResult.data ?? [];
  const incomes = incomesResult.data ?? [];
  const expenses = expensesResult.data ?? [];
  const transactions = transactionsResult.data ?? [];
  const categoryTransactions = transactions.map((transaction) => {
    if (
      !isTransactionCategory(transaction.category) ||
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
      transactionDate: transaction.transaction_date,
    };
  });
  const categoryBudgets = (budgetsResult.data ?? []).map((budget) => {
    if (typeof budget.id !== "string" || !isTransactionCategory(budget.category)) {
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
  const activeIncomes = incomes.filter((income) => income.is_active);
  const activeExpenses = expenses.filter((expense) => expense.is_active);
  const snapshot = calculateMonthlySnapshot({
    incomeAmountsCents: activeIncomes.map((income) => income.amount_cents),
    fixedExpenseAmountsCents: activeExpenses.map(
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
  const featuredGoal = selectFeaturedGoal(dashboardGoals);
  const rankedCategoryBudgets = rankCategoryBudgets(categoryBudgetUsages);
  const monthDate = getCalendarDateInTimeZone(new Date(), timeZone);
  const balanceTrend = buildMonthlyBalanceTrend({
    availableCents: snapshot.availableCents,
    monthDate,
    transactions: categoryTransactions,
  });
  return {
    activeExpenseCount: activeExpenses.length,
    activeIncomeCount: activeIncomes.length,
    expenseCount: expenses.length,
    goalCount: goals.length,
    incomeCount: incomes.length,
    categoryBudgetUsages,
    balanceTrend,
    currentDay: Number(monthDate.slice(8, 10)),
    featuredGoal,
    rankedCategoryBudgets,
    recentTransactions: categoryTransactions.slice(0, 5),
    snapshot,
    transactionCount: transactions.length,
  };
}
