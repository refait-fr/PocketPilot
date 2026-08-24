import { DashboardOverview } from "@/app/_components/dashboard-overview";
import { AppShell } from "@/app/_components/app-shell";
import { loadCurrentMonthOverview } from "@/lib/dashboard/current-month-overview";
import { requireAuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";

export default async function Home() {
  const { profile, supabase, userId } = await requireAuthenticatedProfile();
  const overview = await loadCurrentMonthOverview({
    supabase,
    timeZone: profile.timeZone,
    userId,
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
        activeExpenseCount={overview.activeExpenseCount}
        activeIncomeCount={overview.activeIncomeCount}
        currencyCode={profile.currencyCode}
        expenseCount={overview.expenseCount}
        goalCount={overview.goalCount}
        incomeCount={overview.incomeCount}
        snapshot={overview.snapshot}
        transactionCount={overview.transactionCount}
      />
    </AppShell>
  );
}
