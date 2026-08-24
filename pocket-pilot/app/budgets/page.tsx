import { redirect } from "next/navigation";

import { AppShell } from "@/app/_components/app-shell";
import { BudgetManagement } from "@/app/budgets/budget-management";
import { calculateCategoryBudgetUsages } from "@/lib/budgets/category-budget";
import {
  addCalendarMonths,
  formatCalendarMonth,
  formatCalendarMonthParam,
  getCalendarMonthInTimeZone,
  getCalendarMonthRange,
  isSameCalendarMonth,
  parseCalendarMonthParam,
} from "@/lib/finance/calendar-month";
import { readStoredCents } from "@/lib/finance/money";
import {
  isTransactionCategory,
  TRANSACTION_CATEGORIES,
} from "@/lib/transactions/categories";
import { requireAuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[] }>;
}) {
  const { profile, supabase, userId } = await requireAuthenticatedProfile();
  const currentMonth = getCalendarMonthInTimeZone(new Date(), profile.timeZone);
  const rawMonth = (await searchParams).month;
  const selectedMonth = rawMonth === undefined ? currentMonth : parseCalendarMonthParam(rawMonth);

  if (!selectedMonth) {
    redirect(`/budgets?month=${formatCalendarMonthParam(currentMonth)}`);
  }

  const range = getCalendarMonthRange(selectedMonth);
  const [budgetsResult, transactionsResult] = await Promise.all([
    supabase
      .from("category_budgets")
      .select("id, category, monthly_budget_cents")
      .eq("user_id", userId),
    supabase
      .from("transactions")
      .select("amount_cents, category")
      .eq("user_id", userId)
      .gte("transaction_date", range.startInclusive)
      .lt("transaction_date", range.endExclusive),
  ]);

  if (budgetsResult.error || transactionsResult.error) {
    throw new Error("Impossible de charger les budgets du mois.");
  }

  const budgets = (budgetsResult.data ?? []).map((budget) => {
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
  budgets.sort(
    (first, second) =>
      TRANSACTION_CATEGORIES.indexOf(first.category) -
      TRANSACTION_CATEGORIES.indexOf(second.category),
  );
  const transactions = (transactionsResult.data ?? []).map((transaction) => {
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
  const usages = calculateCategoryBudgetUsages(budgets, transactions);
  const previousMonth = addCalendarMonths(selectedMonth, -1);
  const nextMonth = addCalendarMonths(selectedMonth, 1);

  return (
    <AppShell
      activePath="/budgets"
      description="Définissez quelques plafonds utiles et suivez leur consommation à partir de vos transactions réelles."
      eyebrow="Budgets par catégorie"
      profile={profile}
      title="Des limites lisibles, mois après mois."
    >
      <BudgetManagement
        budgets={usages}
        currencyCode={profile.currencyCode}
        isCurrentMonth={isSameCalendarMonth(selectedMonth, currentMonth)}
        monthLabel={formatCalendarMonth(selectedMonth)}
        nextMonthHref={`/budgets?month=${formatCalendarMonthParam(nextMonth)}`}
        previousMonthHref={`/budgets?month=${formatCalendarMonthParam(previousMonth)}`}
      />
    </AppShell>
  );
}
