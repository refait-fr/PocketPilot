import { AppShell } from "@/app/_components/app-shell";
import { PurchaseChecker } from "@/app/purchase-checker/purchase-checker";
import { loadCurrentMonthOverview } from "@/lib/dashboard/current-month-overview";
import { getCalendarDateInTimeZone } from "@/lib/finance/calendar-month";
import { requireAuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";

export default async function PurchaseCheckerPage() {
  const { profile, supabase, userId } = await requireAuthenticatedProfile();
  const overview = await loadCurrentMonthOverview({
    supabase,
    timeZone: profile.timeZone,
    userId,
  });

  return (
    <AppShell
      activePath="/purchase-checker"
      description="Mesurez l’impact d’un achat sur votre mois avant de décider de l’enregistrer."
      eyebrow="Décision du mois"
      profile={profile}
      title="Est-ce que cet achat rentre dans votre mois ?"
    >
      <PurchaseChecker
        categoryBudgets={overview.categoryBudgetUsages}
        currentDate={getCalendarDateInTimeZone(new Date(), profile.timeZone)}
        currentRealAvailableCents={overview.snapshot.realAvailableCents}
        currencyCode={profile.currencyCode}
      />
    </AppShell>
  );
}
