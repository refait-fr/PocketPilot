import Link from "next/link";

import { formatCents } from "@/lib/finance/format-cents";
import type { MonthlySnapshot } from "@/lib/finance/monthly-snapshot";

type DashboardOverviewProps = {
  currencyCode: string;
  expenseCount: number;
  goalCount: number;
  incomeCount: number;
  snapshot: MonthlySnapshot;
};

type MetricCardProps = {
  accent: "forest" | "orange" | "sage";
  detail: string;
  href: string;
  label: string;
  value: string;
};

const accentClasses = {
  forest: "bg-[var(--forest)] text-white",
  orange: "bg-[#f4b08c] text-[var(--forest)]",
  sage: "bg-[var(--sage)] text-[var(--forest)]",
} as const;

function MetricCard({
  accent,
  detail,
  href,
  label,
  value,
}: MetricCardProps) {
  return (
    <article className="flex min-h-52 flex-col justify-between rounded-[1.5rem] border border-[var(--line)] bg-[var(--paper)] p-5 shadow-[0_14px_40px_rgba(23,53,47,0.07)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
          {label}
        </p>
        <span
          aria-hidden="true"
          className={`size-3 rounded-full ${accentClasses[accent]}`}
        />
      </div>
      <div className="mt-8">
        <p className="font-display break-words text-3xl font-bold tracking-[-0.045em] sm:text-4xl">
          {value}
        </p>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
          {detail}
        </p>
        <Link
          className="mt-5 inline-flex rounded-lg text-sm font-bold text-[var(--accent-dark)] underline decoration-[var(--line)] underline-offset-4 transition-all duration-200 ease-in-out hover:decoration-[var(--accent-dark)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-dark)]"
          href={href}
        >
          Ouvrir
        </Link>
      </div>
    </article>
  );
}

export function DashboardOverview({
  currencyCode,
  expenseCount,
  goalCount,
  incomeCount,
  snapshot,
}: DashboardOverviewProps) {
  const availableIsPositive = snapshot.availableCents >= 0;

  return (
    <div className="space-y-5 sm:space-y-6">
      <section
        className={`relative overflow-hidden rounded-[1.75rem] border p-6 shadow-[0_18px_60px_rgba(23,53,47,0.12)] sm:p-8 lg:p-10 ${
          availableIsPositive
            ? "border-[#214b42] bg-[var(--forest)] text-white"
            : "border-[#a63d1d] bg-[#7f3019] text-white"
        }`}
      >
        <div className="absolute -right-16 -top-24 size-56 rounded-full border-[38px] border-white/10" />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f0b69b]">
              Reste mensuel disponible
            </p>
            <p className="font-display mt-4 break-words text-5xl font-bold leading-none tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              {formatCents(snapshot.availableCents, currencyCode)}
            </p>
            <p className="mt-5 max-w-xl text-sm leading-6 text-[#d9e2dd] sm:text-base">
              {availableIsPositive
                ? "Après vos charges fixes et les allocations prévues pour vos objectifs."
                : "Vos charges fixes et allocations dépassent actuellement vos revenus récurrents."}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 border-t border-white/20 pt-5 text-sm lg:min-w-72 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <div>
              <dt className="text-[#b9ccc4]">Devise</dt>
              <dd className="mt-1 font-bold">{currencyCode}</dd>
            </div>
            <div>
              <dt className="text-[#b9ccc4]">Épargne prévue</dt>
              <dd className="mt-1 font-bold">
                {formatCents(
                  snapshot.totalGoalAllocationsCents,
                  currencyCode,
                )}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section aria-labelledby="monthly-summary-title">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2
            className="font-display text-2xl font-bold tracking-[-0.035em] sm:text-3xl"
            id="monthly-summary-title"
          >
            Le plan du mois
          </h2>
          <p className="hidden text-sm text-[var(--ink-soft)] sm:block">
            Montants récurrents actifs
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            accent="sage"
            detail={
              incomeCount === 0
                ? "Aucun revenu récurrent enregistré."
                : `${incomeCount} revenu${incomeCount > 1 ? "s" : ""} actif${incomeCount > 1 ? "s" : ""}.`
            }
            href="/incomes"
            label="Revenus mensuels"
            value={formatCents(snapshot.totalIncomeCents, currencyCode)}
          />
          <MetricCard
            accent="orange"
            detail={
              expenseCount === 0
                ? "Aucune dépense fixe enregistrée."
                : `${expenseCount} dépense${expenseCount > 1 ? "s" : ""} fixe${expenseCount > 1 ? "s" : ""} active${expenseCount > 1 ? "s" : ""}.`
            }
            href="/expenses"
            label="Dépenses fixes"
            value={formatCents(
              snapshot.totalFixedExpensesCents,
              currencyCode,
            )}
          />
          <MetricCard
            accent="forest"
            detail={
              goalCount === 0
                ? "Aucun objectif d’épargne enregistré."
                : snapshot.activeGoalCount === 0
                  ? "Tous vos objectifs sont atteints."
                  : `${snapshot.activeGoalCount} objectif${snapshot.activeGoalCount > 1 ? "s" : ""} encore en route.`
            }
            href="/goals"
            label="Objectifs actifs"
            value={String(snapshot.activeGoalCount)}
          />
        </div>
      </section>
    </div>
  );
}
