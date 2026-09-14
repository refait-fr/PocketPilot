import { AppShell } from "@/app/_components/app-shell";
import { IncomeManagement } from "@/app/incomes/income-management";
import { IncomeTabs } from "@/app/incomes/income-tabs";
import { getCalendarDateInTimeZone } from "@/lib/finance/calendar-month";
import {
  isValidRecurringStartDate,
  readPositiveStoredCents,
} from "@/lib/finance/recurring-entry-input";
import { requireAuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";

export default async function IncomesPage() {
  const { profile, supabase, userId } = await requireAuthenticatedProfile();
  const todayIso = getCalendarDateInTimeZone(new Date(), profile.timeZone);
  const { data, error } = await supabase
    .from("recurring_incomes")
    .select("id, label, amount_cents, is_active, start_date, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Impossible de charger les revenus récurrents.");
  }

  const incomes = (data ?? []).map((income) => {
    if (
      typeof income.id !== "string" ||
      typeof income.label !== "string" ||
      income.label.trim().length === 0 ||
      income.label.length > 100 ||
      typeof income.is_active !== "boolean" ||
      !isValidRecurringStartDate(income.start_date)
    ) {
      throw new Error("Un revenu récurrent contient des données invalides.");
    }

    return {
      id: income.id,
      label: income.label,
      amountCents: readPositiveStoredCents(income.amount_cents),
      isActive: income.is_active,
      startDate: income.start_date,
    };
  });

  return (
    <AppShell
      activePath="/incomes"
      description="Seuls les revenus actifs et débutés alimentent le budget disponible."
      eyebrow="Plan mensuel"
      profile={profile}
      title="Revenus"
    >
      <IncomeTabs active="recurrents" />
      <IncomeManagement
        currencyCode={profile.currencyCode}
        entries={incomes}
        todayIso={todayIso}
      />
    </AppShell>
  );
}
