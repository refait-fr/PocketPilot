import type { CSSProperties } from "react";
import Link from "next/link";

import type { CategoryBudgetUsage } from "@/lib/budgets/category-budget";
import type {
  DashboardGoal,
  MonthlyBalancePoint,
  MonthlyInsight,
} from "@/lib/dashboard/monthly-cockpit";
import { getRecurringEntryDashboardDetail } from "@/lib/dashboard/recurring-entry-detail";
import { formatCents } from "@/lib/finance/format-cents";
import type { MonthlySnapshot } from "@/lib/finance/monthly-snapshot";

type DashboardOverviewProps = {
  activeExpenseCount: number;
  activeIncomeCount: number;
  balanceTrend: MonthlyBalancePoint[];
  categoryBudgets: CategoryBudgetUsage[];
  currencyCode: string;
  currentDay: number;
  expenseCount: number;
  featuredGoal: DashboardGoal | null;
  goalCount: number;
  incomeCount: number;
  insights: MonthlyInsight[];
  snapshot: MonthlySnapshot;
  transactionCount: number;
};

const CHART_WIDTH = 760;
const CHART_HEIGHT = 284;
const CHART_PADDING = { bottom: 32, left: 18, right: 18, top: 20 } as const;

function getChartGeometry(points: readonly MonthlyBalancePoint[]) {
  const values = points.map((point) => point.remainingCents);
  const minimum = Math.min(0, ...values);
  const maximum = Math.max(0, ...values);
  const range = maximum === minimum ? 1 : maximum - minimum;
  const drawableWidth = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
  const drawableHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
  const lastDay = Math.max(points.at(-1)?.day ?? 1, 1);
  const coordinates = points.map((point) => ({
    ...point,
    x: CHART_PADDING.left + (point.day / lastDay) * drawableWidth,
    y:
      CHART_PADDING.top +
      ((maximum - point.remainingCents) / range) * drawableHeight,
  }));
  const linePath = coordinates
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");
  const baselineY = CHART_HEIGHT - CHART_PADDING.bottom;
  const areaPath = `${linePath} L${coordinates.at(-1)?.x ?? CHART_PADDING.left},${baselineY} L${CHART_PADDING.left},${baselineY} Z`;

  return { areaPath, coordinates, linePath, maximum, minimum };
}

function BalanceChart({
  currencyCode,
  currentDay,
  points,
}: {
  currencyCode: string;
  currentDay: number;
  points: MonthlyBalancePoint[];
}) {
  const { areaPath, coordinates, linePath, maximum, minimum } =
    getChartGeometry(points);
  const currentPoint = coordinates.find((point) => point.day === currentDay);
  const lastPoint = coordinates.at(-1);
  const tickDays = [1, 8, 15, 22, lastPoint?.day ?? 30].filter(
    (day, index, all) => all.indexOf(day) === index && day <= (lastPoint?.day ?? 30),
  );

  return (
    <div className="mt-5">
      <div className="mb-3 flex items-center justify-between gap-4 text-[0.7rem] font-bold text-[var(--ink-soft)]">
        <span>{formatCents(maximum, currencyCode)}</span>
        <span className="inline-flex items-center gap-2">
          <span className="size-2 rounded-full bg-[var(--chart-line)]" />
          Transactions enregistrées
        </span>
      </div>
      <svg
        aria-labelledby="monthly-balance-chart-title monthly-balance-chart-description"
        className="block h-auto w-full overflow-visible"
        role="img"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      >
        <title id="monthly-balance-chart-title">
          Évolution du reste réel pendant le mois
        </title>
        <desc id="monthly-balance-chart-description">
          Le budget disponible initial diminue aux dates des transactions
          enregistrées. Le dernier point vaut {formatCents(lastPoint?.remainingCents ?? 0, currencyCode)}.
        </desc>
        <defs>
          <linearGradient id="balance-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-line)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--chart-line)" stopOpacity="0.015" />
          </linearGradient>
        </defs>
        {[0.2, 0.5, 0.8].map((ratio) => (
          <line
            className="text-[var(--chart-grid)]"
            key={ratio}
            stroke="currentColor"
            strokeDasharray="3 7"
            x1={CHART_PADDING.left}
            x2={CHART_WIDTH - CHART_PADDING.right}
            y1={CHART_PADDING.top + ratio * (CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom)}
            y2={CHART_PADDING.top + ratio * (CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom)}
          />
        ))}
        {currentPoint ? (
          <line
            className="text-[var(--warning)]"
            stroke="currentColor"
            strokeDasharray="4 5"
            x1={currentPoint.x}
            x2={currentPoint.x}
            y1={CHART_PADDING.top}
            y2={CHART_HEIGHT - CHART_PADDING.bottom}
          />
        ) : null}
        <path d={areaPath} fill="url(#balance-area)" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--chart-line)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
          vectorEffect="non-scaling-stroke"
        />
        {coordinates.map((point, index) => {
          const previousSpent = coordinates[index - 1]?.spentCents ?? 0;
          if (point.spentCents === previousSpent) return null;

          return (
            <circle
              className="text-[var(--paper)]"
              cx={point.x}
              cy={point.y}
              fill="var(--chart-line)"
              key={point.day}
              r="5"
              stroke="currentColor"
              strokeWidth="3"
            />
          );
        })}
        {tickDays.map((day) => {
          const point = coordinates.find((item) => item.day === day);
          return point ? (
            <text
              fill="var(--ink-soft)"
              fontSize="12"
              key={day}
              textAnchor={day === 1 ? "start" : day === lastPoint?.day ? "end" : "middle"}
              x={point.x}
              y={CHART_HEIGHT - 8}
            >
              {day === currentDay ? `Aujourd’hui · ${day}` : day}
            </text>
          ) : null;
        })}
        {minimum < 0 ? (
          <text fill="var(--danger)" fontSize="11" x={CHART_PADDING.left} y={CHART_HEIGHT - CHART_PADDING.bottom - 7}>
            Zone négative
          </text>
        ) : null}
      </svg>
    </div>
  );
}

function StatusBadge({ status }: { status: CategoryBudgetUsage["status"] }) {
  const presentation = {
    exceeded: { label: "Budget dépassé", tone: "ui-badge-danger" },
    near: { label: "À surveiller", tone: "ui-badge-warning" },
    ok: { label: "Maîtrisé", tone: "ui-badge-positive" },
    reached: { label: "Limite atteinte", tone: "ui-badge-warning" },
  }[status];

  return <span className={`ui-badge ${presentation.tone}`}>{presentation.label}</span>;
}

function getInsightContent({
  currencyCode,
  insight,
}: {
  currencyCode: string;
  insight: MonthlyInsight;
}) {
  if (insight.kind === "real-available") {
    return {
      detail:
        insight.amountCents < 0
          ? `Les dépenses enregistrées dépassent le plan de ${formatCents(Math.abs(insight.amountCents), currencyCode)}.`
          : `${formatCents(insight.amountCents, currencyCode)} restent disponibles après le plan et les transactions.`,
      title: insight.amountCents < 0 ? "Le mois est sous tension." : "Votre marge reste positive.",
    };
  }

  if (insight.kind === "budget-exceeded") {
    return {
      detail: `Le plafond est dépassé de ${formatCents(insight.overrunCents, currencyCode)}.`,
      title: `Le budget ${insight.category} demande votre attention.`,
    };
  }

  if (insight.kind === "budget-near") {
    return {
      detail: `${insight.percentageConsumed} % du plafond est déjà consommé.`,
      title: `Le budget ${insight.category} approche de sa limite.`,
    };
  }

  return {
    detail: `${insight.progressPercent} % de la cible est déjà épargné.`,
    title: `L’objectif ${insight.name} avance.`,
  };
}

function PlanMetric({
  detail,
  href,
  label,
  value,
}: {
  detail: string;
  href: string;
  label: string;
  value: string;
}) {
  return (
    <article className="group min-w-0 border-t border-[var(--line)] px-5 py-4 first:border-t-0 sm:px-6 lg:border-l lg:border-t-0 lg:first:border-l-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-[var(--ink-soft)]">{label}</p>
          <p className="font-amount mt-1 break-words text-xl font-extrabold">{value}</p>
        </div>
        <Link className="ui-icon-link" href={href} aria-label={`Gérer ${label.toLowerCase()}`}>
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <p className="mt-2 text-xs leading-5 text-[var(--ink-soft)]">{detail}</p>
    </article>
  );
}

export function DashboardOverview({
  activeExpenseCount,
  activeIncomeCount,
  balanceTrend,
  categoryBudgets,
  currencyCode,
  currentDay,
  expenseCount,
  featuredGoal,
  goalCount,
  incomeCount,
  insights,
  snapshot,
  transactionCount,
}: DashboardOverviewProps) {
  const realAvailableIsPositive = snapshot.realAvailableCents >= 0;
  const visibleBudgets = categoryBudgets.slice(0, 3);

  return (
    <div className="cockpit-stack">
      <section className="cockpit-grid" aria-label="Synthèse financière du mois">
        <article className="ui-panel cockpit-chart-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="ui-kicker">Évolution du mois</p>
              <h2 className="ui-card-title">Reste réel au fil du mois</h2>
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-bold text-[var(--ink-soft)]">Dépensé ce mois</p>
              <p className="font-amount mt-1 text-xl font-extrabold">{formatCents(snapshot.totalTransactionsCents, currencyCode)}</p>
            </div>
          </div>
          {transactionCount === 0 ? (
            <div className="chart-empty mt-5">
              <div>
                <p className="text-sm font-extrabold">Aucune variation pour le moment</p>
                <p className="mt-1 text-xs leading-5 text-[var(--ink-soft)]">La courbe évoluera à chaque transaction enregistrée.</p>
              </div>
              <BalanceChart currencyCode={currencyCode} currentDay={currentDay} points={balanceTrend} />
            </div>
          ) : (
            <BalanceChart currencyCode={currencyCode} currentDay={currentDay} points={balanceTrend} />
          )}
        </article>

        <article className={`cockpit-balance-card ${realAvailableIsPositive ? "" : "is-negative"}`}>
          <div>
            <p className="ui-kicker text-[var(--cockpit-muted)]">Reste réel</p>
            <p className="font-amount mt-4 break-words text-[clamp(2.7rem,5vw,4.8rem)] font-extrabold leading-none tracking-[-0.07em]">
              {formatCents(snapshot.realAvailableCents, currencyCode)}
            </p>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--cockpit-muted)]">
              {realAvailableIsPositive
                ? "La marge réellement disponible après votre plan et les dépenses saisies."
                : "Les dépenses enregistrées dépassent le budget disponible du mois."}
            </p>
          </div>
          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-[var(--cockpit-line)]">
            <div className="bg-[var(--cockpit-card)] p-4">
              <dt className="text-[0.68rem] font-bold text-[var(--cockpit-muted)]">Budget disponible</dt>
              <dd className="font-amount mt-1 break-words text-base font-extrabold">{formatCents(snapshot.availableCents, currencyCode)}</dd>
            </div>
            <div className="bg-[var(--cockpit-card)] p-4">
              <dt className="text-[0.68rem] font-bold text-[var(--cockpit-muted)]">Épargne prévue</dt>
              <dd className="font-amount mt-1 break-words text-base font-extrabold">{formatCents(snapshot.totalGoalAllocationsCents, currencyCode)}</dd>
            </div>
          </dl>
        </article>

        <article className="ui-panel cockpit-budgets-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="ui-kicker">Budgets par catégorie</p>
              <h2 className="ui-card-title" id="category-budget-summary-title">{visibleBudgets.length === 0 ? "Vos repères du mois" : "À surveiller ce mois-ci"}</h2>
            </div>
            <Link className="ui-icon-link" href="/budgets" aria-label="Voir tous les budgets">↗</Link>
          </div>
          {visibleBudgets.length === 0 ? (
            <div className="ui-compact-empty mt-6">
              <p className="font-extrabold">Aucun budget configuré</p>
              <p className="mt-1 text-xs leading-5 text-[var(--ink-soft)]">Ajoutez un plafond à une catégorie que vous souhaitez surveiller.</p>
              <Link className="ui-text-link mt-4" href="/budgets">Créer un budget</Link>
            </div>
          ) : (
            <ul className="mt-6 space-y-5">
              {visibleBudgets.map((budget) => (
                <li key={budget.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-extrabold">{budget.category}</h3>
                      <p className="mt-1 text-xs text-[var(--ink-soft)]">{formatCents(budget.spentCents, currencyCode)} sur {formatCents(budget.monthlyBudgetCents, currencyCode)}</p>
                    </div>
                    <StatusBadge status={budget.status} />
                  </div>
                  <div aria-label={`${budget.percentageConsumed} % du budget ${budget.category} consommé`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={budget.progressPercent} className="ui-progress mt-3" role="progressbar">
                    <span className={budget.status === "exceeded" ? "is-danger" : budget.status === "near" || budget.status === "reached" ? "is-warning" : ""} style={{ width: `${budget.progressPercent}%` }} />
                  </div>
                  <p className="mt-2 text-xs font-bold text-[var(--ink-soft)]">
                    {budget.remainingCents < 0 ? `Dépassé de ${formatCents(Math.abs(budget.remainingCents), currencyCode)}` : `${formatCents(budget.remainingCents, currencyCode)} restants`}{" · "}{budget.percentageConsumed} % consommé
                  </p>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="ui-panel cockpit-goal-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="ui-kicker">Objectif en avant</p>
              <h2 className="ui-card-title">Votre prochain cap</h2>
            </div>
            <Link className="ui-icon-link" href="/goals" aria-label="Voir tous les objectifs">↗</Link>
          </div>
          {featuredGoal ? (
            <div className="mt-7">
              <div className="goal-orbit" style={{ "--goal-progress": `${featuredGoal.progressPercent * 3.6}deg` } as CSSProperties}>
                <div><strong>{featuredGoal.progressPercent} %</strong><span>atteint</span></div>
              </div>
              <h3 className="mt-5 truncate font-display text-2xl font-semibold tracking-[-0.04em]">{featuredGoal.name}</h3>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">{formatCents(featuredGoal.currentAmountCents, currencyCode)} sur {formatCents(featuredGoal.targetAmountCents, currencyCode)}</p>
              <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-[var(--line)] pt-4 text-xs">
                <div><dt className="text-[var(--ink-soft)]">Allocation / mois</dt><dd className="font-amount mt-1 font-extrabold">{formatCents(featuredGoal.monthlyAllocationCents, currencyCode)}</dd></div>
                <div><dt className="text-[var(--ink-soft)]">Estimation</dt><dd className="mt-1 font-extrabold">{featuredGoal.isReached ? "Atteint" : featuredGoal.estimatedMonths === null ? "Indisponible" : `${featuredGoal.estimatedMonths} mois`}</dd></div>
              </dl>
            </div>
          ) : (
            <div className="ui-compact-empty mt-6">
              <p className="font-extrabold">Aucun objectif d’épargne</p>
              <p className="mt-1 text-xs leading-5 text-[var(--ink-soft)]">Créez un cap pour donner une direction à votre épargne.</p>
              <Link className="ui-text-link mt-4" href="/goals">Créer un objectif</Link>
            </div>
          )}
        </article>

        <article className="cockpit-insights-card">
          <div className="flex items-start justify-between gap-4">
            <div><p className="ui-kicker text-[var(--cockpit-muted)]">Analyse déterministe</p><h2 className="ui-card-title text-white">Ce que dit votre mois</h2></div>
            <span className="ui-badge border border-[var(--cockpit-line)] text-[var(--cockpit-muted)]">Sans IA</span>
          </div>
          <ol className="mt-6 space-y-5">
            {insights.map((insight, index) => {
              const content = getInsightContent({ currencyCode, insight });
              return (
                <li className="grid grid-cols-[28px_1fr] gap-3" key={`${insight.kind}-${index}`}>
                  <span className={`insight-index is-${insight.tone}`}>{String(index + 1).padStart(2, "0")}</span>
                  <div><h3 className="text-sm font-extrabold text-white">{content.title}</h3><p className="mt-1 text-xs leading-5 text-[var(--cockpit-muted)]">{content.detail}</p></div>
                </li>
              );
            })}
          </ol>
        </article>
      </section>

      <section className="ui-panel overflow-hidden" aria-labelledby="monthly-plan-title">
        <div className="flex flex-col gap-2 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div><p className="ui-kicker">Structure du mois</p><h2 className="ui-card-title" id="monthly-plan-title">Le plan qui construit votre reste</h2></div>
          <p className="text-xs text-[var(--ink-soft)]">Montants mensuels actifs uniquement</p>
        </div>
        <div className="border-t border-[var(--line)] lg:grid lg:grid-cols-4">
          <PlanMetric detail={getRecurringEntryDashboardDetail("income", { activeCount: activeIncomeCount, totalCount: incomeCount })} href="/incomes" label="Revenus mensuels" value={formatCents(snapshot.totalIncomeCents, currencyCode)} />
          <PlanMetric detail={getRecurringEntryDashboardDetail("expense", { activeCount: activeExpenseCount, totalCount: expenseCount })} href="/expenses" label="Dépenses fixes" value={formatCents(snapshot.totalFixedExpensesCents, currencyCode)} />
          <PlanMetric detail={transactionCount === 0 ? "Aucune transaction enregistrée ce mois-ci." : `${transactionCount} transaction${transactionCount > 1 ? "s" : ""} ce mois-ci.`} href="/transactions" label="Dépenses ponctuelles" value={formatCents(snapshot.totalTransactionsCents, currencyCode)} />
          <PlanMetric detail={goalCount === 0 ? "Aucun objectif d’épargne enregistré." : snapshot.activeGoalCount === 0 ? "Tous vos objectifs sont atteints." : `${snapshot.activeGoalCount} objectif${snapshot.activeGoalCount > 1 ? "s" : ""} encore en route.`} href="/goals" label="Objectifs actifs" value={String(snapshot.activeGoalCount)} />
        </div>
      </section>
    </div>
  );
}
