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
import { getAllowedCategories, isAllowedCategory } from "@/lib/transactions/allowed-categories";
import { fetchUserCategoryNames } from "@/lib/transactions/user-categories";
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

  const customCategoryNames = await fetchUserCategoryNames({ supabase, userId });
  const allowedCategories = getAllowedCategories(customCategoryNames);
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
  const categoryOrder = new Map(allowedCategories.map((category, index) => [category, index]));
  budgets.sort((first, second) => {
    const firstIndex = categoryOrder.get(first.category) ?? allowedCategories.length;
    const secondIndex = categoryOrder.get(second.category) ?? allowedCategories.length;

    if (firstIndex !== secondIndex) {
      return firstIndex - secondIndex;
    }

    return first.category.localeCompare(second.category, "fr");
  });
  const transactions = (transactionsResult.data ?? []).map((transaction) => {
    if (!isAllowedCategory(transaction.category, customCategoryNames)) {
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
      description="Suivez les plafonds des catégories qui comptent pour vous."
      eyebrow="Suivi mensuel"
      profile={profile}
      title="Budgets par catégorie"
    >
      <BudgetManagement
        allowedCategories={allowedCategories}
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
