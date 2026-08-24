import Link from "next/link";

import type { CategoryBudgetSummary } from "@/lib/budgets/category-budget";
import { getRecurringEntryDashboardDetail } from "@/lib/dashboard/recurring-entry-detail";
import { formatCents } from "@/lib/finance/format-cents";
import type { MonthlySnapshot } from "@/lib/finance/monthly-snapshot";

type DashboardOverviewProps = {
  activeExpenseCount: number;
  activeIncomeCount: number;
  currencyCode: string;
  categoryBudgetSummary: CategoryBudgetSummary;
  expenseCount: number;
  goalCount: number;
  incomeCount: number;
  snapshot: MonthlySnapshot;
  transactionCount: number;
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
  activeExpenseCount,
  activeIncomeCount,
  categoryBudgetSummary,
  currencyCode,
  expenseCount,
  goalCount,
  incomeCount,
  snapshot,
  transactionCount,
}: DashboardOverviewProps) {
  const realAvailableIsPositive = snapshot.realAvailableCents >= 0;

  return (
    <div className="space-y-5 sm:space-y-6">
      <section
        className={`relative overflow-hidden rounded-[1.75rem] border p-6 shadow-[0_18px_60px_rgba(23,53,47,0.12)] sm:p-8 lg:p-10 ${
          realAvailableIsPositive
            ? "border-[#214b42] bg-[var(--forest)] text-white"
            : "border-[#a63d1d] bg-[#7f3019] text-white"
        }`}
      >
        <div className="absolute -right-16 -top-24 size-56 rounded-full border-[38px] border-white/10" />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f0b69b]">
              Reste réel aujourd’hui
            </p>
            <p className="font-display mt-4 break-words text-5xl font-bold leading-none tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              {formatCents(snapshot.realAvailableCents, currencyCode)}
            </p>
            <p className="mt-5 max-w-xl text-sm leading-6 text-[#d9e2dd] sm:text-base">
              {realAvailableIsPositive
                ? "Après le plan mensuel et les dépenses ponctuelles déjà enregistrées ce mois-ci."
                : "Vos dépenses du mois dépassent actuellement le budget disponible."}
            </p>
            <Link
              className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-white px-4 py-2 text-sm font-bold text-[var(--forest)] transition-all hover:-translate-y-0.5 hover:bg-[#f8eee7] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              href="/purchase-checker"
            >
              Vérifier un achat
            </Link>
          </div>

          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 border-t border-white/20 pt-5 text-sm lg:min-w-72 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <div>
              <dt className="text-[#b9ccc4]">Budget disponible</dt>
              <dd className="mt-1 font-bold">
                {formatCents(snapshot.availableCents, currencyCode)}
              </dd>
            </div>
            <div>
              <dt className="text-[#b9ccc4]">Dépensé ce mois</dt>
              <dd className="mt-1 font-bold">
                {formatCents(snapshot.totalTransactionsCents, currencyCode)}
              </dd>
            </div>
            <div>
              <dt className="text-[#b9ccc4]">Épargne prévue</dt>
              <dd className="mt-1 font-bold">
                {formatCents(snapshot.totalGoalAllocationsCents, currencyCode)}
              </dd>
            </div>
            <div>
              <dt className="text-[#b9ccc4]">Devise</dt>
              <dd className="mt-1 font-bold">{currencyCode}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--paper)] p-5 shadow-[0_12px_36px_rgba(23,53,47,0.06)] sm:p-6" aria-labelledby="category-budget-summary-title">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-dark)]">Budgets par catégorie</p>
            <h2 className="font-display mt-2 text-2xl font-bold" id="category-budget-summary-title">
              {categoryBudgetSummary.configuredCount === 0
                ? "Aucun plafond configuré"
                : categoryBudgetSummary.mostConsumed
                  ? `${categoryBudgetSummary.mostConsumed.category} est la plus consommée`
                  : "Vos plafonds du mois"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
              {categoryBudgetSummary.configuredCount === 0
                ? "Ajoutez seulement les catégories que vous souhaitez surveiller."
                : `${categoryBudgetSummary.mostConsumed?.percentageConsumed ?? "0"} % consommé · ${categoryBudgetSummary.exceededCount} catégorie${categoryBudgetSummary.exceededCount === 1 ? "" : "s"} dépassée${categoryBudgetSummary.exceededCount === 1 ? "" : "s"}.`}
            </p>
          </div>
          <Link className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--forest)] px-4 py-2 text-sm font-bold text-[var(--forest)] hover:bg-[var(--forest)] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)]" href="/budgets">
            Gérer les budgets
          </Link>
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

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            accent="sage"
            detail={getRecurringEntryDashboardDetail("income", {
              activeCount: activeIncomeCount,
              totalCount: incomeCount,
            })}
            href="/incomes"
            label="Revenus mensuels"
            value={formatCents(snapshot.totalIncomeCents, currencyCode)}
          />
          <MetricCard
            accent="orange"
            detail={getRecurringEntryDashboardDetail("expense", {
              activeCount: activeExpenseCount,
              totalCount: expenseCount,
            })}
            href="/expenses"
            label="Dépenses fixes"
            value={formatCents(
              snapshot.totalFixedExpensesCents,
              currencyCode,
            )}
          />
          <MetricCard
            accent="orange"
            detail={
              transactionCount === 0
                ? "Aucune transaction enregistrée ce mois-ci."
                : `${transactionCount} transaction${transactionCount > 1 ? "s" : ""} ce mois-ci.`
            }
            href="/transactions"
            label="Dépenses ponctuelles"
            value={formatCents(snapshot.totalTransactionsCents, currencyCode)}
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
