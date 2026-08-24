import type { SupabaseClient } from "@supabase/supabase-js";

import {
  calculateCategoryBudgetUsages,
  summarizeCategoryBudgets,
} from "@/lib/budgets/category-budget";
import {
  getCalendarMonthInTimeZone,
  getCalendarMonthRange,
} from "@/lib/finance/calendar-month";
import { calculateMonthlySnapshot } from "@/lib/finance/monthly-snapshot";
import { readStoredCents } from "@/lib/finance/money";
import { isTransactionCategory } from "@/lib/transactions/categories";

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
          "current_amount_cents, target_amount_cents, monthly_allocation_cents",
        )
        .eq("user_id", userId),
      supabase
        .from("transactions")
        .select("amount_cents, category")
        .eq("user_id", userId)
        .gte("transaction_date", currentMonthRange.startInclusive)
        .lt("transaction_date", currentMonthRange.endExclusive),
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
    if (!isTransactionCategory(transaction.category)) {
      throw new Error("Une transaction contient une catégorie invalide.");
    }
    return {
      amountCents: readStoredCents(transaction.amount_cents, {
        allowZero: false,
        fieldName: "La transaction",
      }),
      category: transaction.category,
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

  return {
    activeExpenseCount: activeExpenses.length,
    activeIncomeCount: activeIncomes.length,
    expenseCount: expenses.length,
    goalCount: goals.length,
    incomeCount: incomes.length,
    categoryBudgetSummary: summarizeCategoryBudgets(categoryBudgetUsages),
    categoryBudgetUsages,
    snapshot,
    transactionCount: transactions.length,
  };
}
