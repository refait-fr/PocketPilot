import { AppShell } from "@/app/_components/app-shell";
import { ExpenseManagement } from "@/app/expenses/expense-management";
import { readPositiveStoredCents } from "@/lib/finance/recurring-entry-input";
import { requireAuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";

export default async function ExpensesPage() {
  const { profile, supabase, userId } = await requireAuthenticatedProfile();
  const { data, error } = await supabase
    .from("recurring_fixed_expenses")
    .select("id, label, amount_cents, is_active, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Impossible de charger les dépenses fixes récurrentes.");
  }

  const expenses = (data ?? []).map((expense) => {
    if (
      typeof expense.id !== "string" ||
      typeof expense.label !== "string" ||
      expense.label.trim().length === 0 ||
      expense.label.length > 100 ||
      typeof expense.is_active !== "boolean"
    ) {
      throw new Error("Une dépense fixe contient des données invalides.");
    }

    return {
      id: expense.id,
      label: expense.label,
      amountCents: readPositiveStoredCents(expense.amount_cents),
      isActive: expense.is_active,
    };
  });

  return (
    <AppShell
      activePath="/expenses"
      description="Rassemblez les charges fixes qui structurent votre mois, sans suivi de transactions quotidiennes."
      eyebrow="Dépenses fixes"
      profile={profile}
      title="Les engagements avant le reste."
    >
      <ExpenseManagement
        currencyCode={profile.currencyCode}
        entries={expenses}
      />
    </AppShell>
  );
}
