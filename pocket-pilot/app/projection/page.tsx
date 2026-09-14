import Link from "next/link";

import { AppShell } from "@/app/_components/app-shell";
import {
  formatCalendarMonth,
  formatCalendarMonthParam,
  getCalendarMonthInTimeZone,
  parseCalendarMonthParam,
} from "@/lib/finance/calendar-month";
import { formatCents } from "@/lib/finance/format-cents";
import { projectFutureMonths } from "@/lib/finance/projection";
import { requireAuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";

export const DEFAULT_PROJECTION_MONTHS = 3;
const MIN_PROJECTION_MONTHS_PARAM = 1;
const MAX_PROJECTION_MONTHS_PARAM = 12;

function readMonthCount(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
  const parsed = Number(raw);

  if (
    !Number.isSafeInteger(parsed) ||
    parsed < MIN_PROJECTION_MONTHS_PARAM ||
    parsed > MAX_PROJECTION_MONTHS_PARAM
  ) {
    return DEFAULT_PROJECTION_MONTHS;
  }

  return parsed;
}

export default async function ProjectionPage({
  searchParams,
}: {
  searchParams: Promise<{ months?: string | string[] }>;
}) {
  const { profile, supabase, userId } = await requireAuthenticatedProfile();
  const currentMonth = getCalendarMonthInTimeZone(new Date(), profile.timeZone);
  const monthCount = readMonthCount((await searchParams).months);
  const [incomesResult, expensesResult, goalsResult] = await Promise.all([
    supabase
      .from("recurring_incomes")
      .select("amount_cents, is_active, start_date")
      .eq("user_id", userId),
    supabase
      .from("recurring_fixed_expenses")
      .select("amount_cents, is_active, start_date")
      .eq("user_id", userId),
    supabase
      .from("savings_goals")
      .select("monthly_allocation_cents")
      .eq("user_id", userId),
  ]);

  if (incomesResult.error || expensesResult.error || goalsResult.error) {
    throw new Error("Impossible de charger les données de projection.");
  }

  const months = projectFutureMonths({
    expenses: (expensesResult.data ?? []).map((expense) => ({
      amountCents: expense.amount_cents,
      isActive: expense.is_active,
      startDate: expense.start_date,
    })),
    goals: (goalsResult.data ?? []).map((goal) => ({
      monthlyAllocationCents: goal.monthly_allocation_cents,
    })),
    incomes: (incomesResult.data ?? []).map((income) => ({
      amountCents: income.amount_cents,
      isActive: income.is_active,
      startDate: income.start_date,
    })),
    monthCount,
    startMonth: formatCalendarMonthParam(currentMonth),
  });
  const hasPlan =
    (incomesResult.data ?? []).length > 0 ||
    (expensesResult.data ?? []).length > 0 ||
    (goalsResult.data ?? []).length > 0;

  return (
    <AppShell
      activePath="/projection"
      description="Estimez votre disponible mensuel à partir du plan récurrent actuel."
      eyebrow="Anticipation"
      profile={profile}
      title="Projection"
    >
      <div className="management-stack">
        <form action="/projection" className="period-toolbar period-toolbar-compact" method="get">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <label className="ui-label max-w-xs" htmlFor="projection-months">
              Horizon projeté
              <select className="ui-select" defaultValue={String(monthCount)} id="projection-months" name="months">
                {Array.from({ length: MAX_PROJECTION_MONTHS_PARAM }, (_, index) => index + 1).map((value) => (
                  <option key={value} value={value}>
                    {value} mois
                  </option>
                ))}
              </select>
            </label>
            <button className="ui-button-secondary min-h-10 px-3 py-2 text-xs" type="submit">
              Afficher
            </button>
          </div>
        </form>

        {!hasPlan ? (
          <div className="ui-empty">
            <h3>Aucun plan à projeter</h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--ink-soft)]">
              Ajoutez des revenus récurrents, des charges fixes ou un objectif pour voir une estimation.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Link className="ui-button-primary min-h-10 px-3 py-2 text-xs" href="/incomes">Ajouter un revenu</Link>
              <Link className="ui-button-secondary min-h-10 px-3 py-2 text-xs" href="/expenses">Ajouter une charge fixe</Link>
            </div>
          </div>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {months.map((month, index) => {
              const label = parseCalendarMonthParam(month.month);

              return (
                <li key={month.month} className="ui-panel p-6">
                  <p className="ui-kicker">{index === 0 ? "Mois actuel" : `Mois +${index}`}</p>
                  <h2 className="font-display mt-2 text-2xl font-semibold tracking-[-0.035em]">
                    {label ? formatCalendarMonth(label) : month.month}
                  </h2>
                  <dl className="dashboard-detail-list mt-4">
                    <div><dt>Revenus prévus</dt><dd className="font-amount">{formatCents(month.totalIncomeCents, profile.currencyCode)}</dd></div>
                    <div><dt>Charges prévues</dt><dd className="font-amount">{formatCents(month.totalFixedExpensesCents, profile.currencyCode)}</dd></div>
                    <div><dt>Épargne prévue</dt><dd className="font-amount">{formatCents(month.totalGoalAllocationsCents, profile.currencyCode)}</dd></div>
                    <div>
                      <dt>Disponible estimé</dt>
                      <dd className={`font-amount ${month.projectedAvailableCents < 0 ? "text-red-700" : ""}`}>
                        {formatCents(month.projectedAvailableCents, profile.currencyCode)}
                      </dd>
                    </div>
                  </dl>
                </li>
              );
            })}
          </ul>
        )}

        <section className="ui-panel p-6 sm:p-8" aria-labelledby="projection-assumptions-title">
          <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--accent)]">Hypothèses de calcul</p>
          <h2 className="font-display mt-2 text-2xl font-semibold tracking-[-0.035em]" id="projection-assumptions-title">Comment lire ces estimations</h2>
          <ul className="mt-4 grid gap-2 text-sm leading-6 text-[var(--ink-soft)]">
            <li>Un montant récurrent actif compte pour tout mois dont le début est atteint ou dépassé, mois entier inclus.</li>
            <li>Les allocations mensuelles des objectifs restent constantes sur toute la période, sans revalorisation ni plafonnement.</li>
            <li>Les dépenses ponctuelles futures et les revenus ponctuels ne sont pas projetés.</li>
            <li>Ces projections sont des estimations fondées sur le plan actuel : elles ne constituent ni une garantie ni un conseil financier.</li>
          </ul>
          <p className="mt-4 text-xs leading-5 text-[var(--ink-soft)]">
            Point de départ : {formatCalendarMonth(currentMonth)} ({formatCalendarMonthParam(currentMonth)}). Horizon : {monthCount} mois.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
