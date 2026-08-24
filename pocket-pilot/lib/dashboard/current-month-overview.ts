import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getCalendarMonthInTimeZone,
  getCalendarMonthRange,
} from "@/lib/finance/calendar-month";
import { calculateMonthlySnapshot } from "@/lib/finance/monthly-snapshot";

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
  const [incomesResult, expensesResult, goalsResult, transactionsResult] =
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
        .select("amount_cents")
        .eq("user_id", userId)
        .gte("transaction_date", currentMonthRange.startInclusive)
        .lt("transaction_date", currentMonthRange.endExclusive),
    ]);

  if (
    incomesResult.error ||
    expensesResult.error ||
    goalsResult.error ||
    transactionsResult.error
  ) {
    throw new Error("Impossible de charger les données financières du mois.");
  }

  const goals = goalsResult.data ?? [];
  const incomes = incomesResult.data ?? [];
  const expenses = expensesResult.data ?? [];
  const transactions = transactionsResult.data ?? [];
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
    transactionAmountsCents: transactions.map(
      (transaction) => transaction.amount_cents,
    ),
  });

  return {
    activeExpenseCount: activeExpenses.length,
    activeIncomeCount: activeIncomes.length,
    expenseCount: expenses.length,
    goalCount: goals.length,
    incomeCount: incomes.length,
    snapshot,
    transactionCount: transactions.length,
  };
}
