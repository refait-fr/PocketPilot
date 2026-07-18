import { AppShell } from "@/app/_components/app-shell";
import { IncomeManagement } from "@/app/incomes/income-management";
import { readPositiveStoredCents } from "@/lib/finance/recurring-entry-input";
import { requireAuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";

export default async function IncomesPage() {
  const { profile, supabase, userId } = await requireAuthenticatedProfile();
  const { data, error } = await supabase
    .from("recurring_incomes")
    .select("id, label, amount_cents, is_active, created_at")
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
      typeof income.is_active !== "boolean"
    ) {
      throw new Error("Un revenu récurrent contient des données invalides.");
    }

    return {
      id: income.id,
      label: income.label,
      amountCents: readPositiveStoredCents(income.amount_cents),
      isActive: income.is_active,
    };
  });

  return (
    <AppShell
      activePath="/incomes"
      description="Ajoutez les revenus qui reviennent chaque mois. Seuls les revenus actifs alimentent votre reste disponible."
      eyebrow="Revenus récurrents"
      profile={profile}
      title="Votre point de départ mensuel."
    >
      <IncomeManagement
        currencyCode={profile.currencyCode}
        entries={incomes}
      />
    </AppShell>
  );
}
