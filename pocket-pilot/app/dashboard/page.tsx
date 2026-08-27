import { DashboardOverview } from "@/app/_components/dashboard-overview";
import { AppShell } from "@/app/_components/app-shell";
import { loadCurrentMonthOverview } from "@/lib/dashboard/current-month-overview";
import { requireAuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";

export default async function DashboardPage() {
  const { profile, supabase, userId } = await requireAuthenticatedProfile();
  const overview = await loadCurrentMonthOverview({
    supabase,
    timeZone: profile.timeZone,
    userId,
  });

  return (
    <AppShell
      activePath="/dashboard"
      description="Synthèse du plan, des dépenses et des objectifs pour le mois en cours."
      eyebrow="Mois en cours · Synthèse financière"
      profile={profile}
      title="Bonjour !"
    >
      <DashboardOverview
        activeExpenseCount={overview.activeExpenseCount}
        activeIncomeCount={overview.activeIncomeCount}
        balanceTrend={overview.balanceTrend}
        currencyCode={profile.currencyCode}
        categoryBudgets={overview.rankedCategoryBudgets}
        currentDay={overview.currentDay}
        expenseCount={overview.expenseCount}
        featuredGoal={overview.featuredGoal}
        goalCount={overview.goalCount}
        incomeCount={overview.incomeCount}
        recentTransactions={overview.recentTransactions}
        snapshot={overview.snapshot}
        transactionCount={overview.transactionCount}
      />
    </AppShell>
  );
}
