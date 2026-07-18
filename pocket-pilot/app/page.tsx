import { DashboardOverview } from "@/app/_components/dashboard-overview";
import { AppShell } from "@/app/_components/app-shell";
import { calculateMonthlySnapshot } from "@/lib/finance/monthly-snapshot";
import { requireAuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";

export default async function Home() {
  const { profile, supabase, userId } = await requireAuthenticatedProfile();

  const [incomesResult, expensesResult, goalsResult] = await Promise.all([
    supabase
      .from("recurring_incomes")
      .select("amount_cents")
      .eq("user_id", userId)
      .eq("is_active", true),
    supabase
      .from("recurring_fixed_expenses")
      .select("amount_cents")
      .eq("user_id", userId)
      .eq("is_active", true),
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
  const snapshot = calculateMonthlySnapshot({
    incomeAmountsCents: (incomesResult.data ?? []).map(
      (income) => income.amount_cents,
    ),
    fixedExpenseAmountsCents: (expensesResult.data ?? []).map(
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
        currencyCode={profile.currencyCode}
        expenseCount={expensesResult.data?.length ?? 0}
        goalCount={goals.length}
        incomeCount={incomesResult.data?.length ?? 0}
        snapshot={snapshot}
      />
    </AppShell>
  );
}
