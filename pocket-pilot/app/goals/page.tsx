import { AppShell } from "@/app/_components/app-shell";
import { GoalManagement } from "@/app/goals/goal-management";
import {
  calculateSavingsGoalPlan,
  estimateCompletionMonth,
  formatCalendarMonth,
  getCalendarMonthInTimeZone,
  readStoredSavingsGoalAmounts,
} from "@/lib/finance/savings-goal";
import { requireAuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";

export default async function GoalsPage() {
  const { profile, supabase, userId } = await requireAuthenticatedProfile();
  const { data, error } = await supabase
    .from("savings_goals")
    .select(
      "id, name, target_amount_cents, current_amount_cents, monthly_allocation_cents, created_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Impossible de charger les objectifs d’épargne.");
  }

  const referenceMonth = getCalendarMonthInTimeZone(
    new Date(),
    profile.timeZone,
  );
  const goals = (data ?? []).map((goal) => {
    if (
      typeof goal.id !== "string" ||
      typeof goal.name !== "string" ||
      goal.name.trim().length === 0 ||
      goal.name.length > 100
    ) {
      throw new Error("Un objectif d’épargne contient des données invalides.");
    }

    const amounts = readStoredSavingsGoalAmounts({
      targetAmountCents: goal.target_amount_cents,
      currentAmountCents: goal.current_amount_cents,
      monthlyAllocationCents: goal.monthly_allocation_cents,
    });
    const plan = calculateSavingsGoalPlan(amounts);
    const completionMonth =
      plan.estimatedMonths && plan.estimatedMonths > 0
        ? estimateCompletionMonth(referenceMonth, plan.estimatedMonths)
        : null;

    return {
      id: goal.id,
      name: goal.name,
      ...amounts,
      ...plan,
      estimatedCompletionLabel: completionMonth
        ? formatCalendarMonth(completionMonth)
        : null,
    };
  });

  return (
    <AppShell
      activePath="/goals"
      description="Donnez un montant cible et une allocation mensuelle aux projets qui comptent vraiment."
      eyebrow="Objectifs d’épargne"
      profile={profile}
      title="Chaque projet mérite un cap."
    >
      <GoalManagement currencyCode={profile.currencyCode} goals={goals} />
    </AppShell>
  );
}
