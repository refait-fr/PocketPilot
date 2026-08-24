import { DashboardOverview } from "@/app/_components/dashboard-overview";
import { AppShell } from "@/app/_components/app-shell";
import { calculateMonthlySnapshot } from "@/lib/finance/monthly-snapshot";
import { requireAuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";

export default async function Home() {
  const { profile, supabase, userId } = await requireAuthenticatedProfile();

  const [incomesResult, expensesResult, goalsResult] = await Promise.all([
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
  ]);

  if (incomesResult.error || expensesResult.error || goalsResult.error) {
    throw new Error("Impossible de charger les données du dashboard.");
  }

  const goals = goalsResult.data ?? [];
  const incomes = incomesResult.data ?? [];
  const expenses = expensesResult.data ?? [];
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
  });

  return (
    <AppShell
      activePath="/"
      description="Vos revenus, vos charges fixes et vos objectifs réunis dans un plan mensuel lisible."
      eyebrow="Tableau de bord"
      profile={profile}
      title="Votre mois, en un coup d’œil."
    >
      <DashboardOverview
        activeExpenseCount={activeExpenses.length}
        activeIncomeCount={activeIncomes.length}
        currencyCode={profile.currencyCode}
        expenseCount={expenses.length}
        goalCount={goals.length}
        incomeCount={incomes.length}
        snapshot={snapshot}
      />
    </AppShell>
  );
}
