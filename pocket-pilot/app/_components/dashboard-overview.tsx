"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import Link from "next/link";

import { AppIcon } from "@/app/_components/app-icon";
import { AnimatedAmount } from "@/app/_components/motion/animated-amount";
import { staggerContainer, staggerItem } from "@/app/_components/motion/motion-variants";
import { MonthlyBalanceChart } from "@/app/_components/monthly-balance-chart";
import { BudgetProgressBar } from "@/app/_components/premium/budget-progress-bar";
import { CategoryIcon } from "@/app/_components/premium/category-icon";
import { PremiumCard } from "@/app/_components/premium/premium-card";
import { ProgressRing } from "@/app/_components/premium/progress-ring";
import { getBudgetTone } from "@/lib/design/budget-tone";
import type { CategoryBudgetUsage } from "@/lib/budgets/category-budget";
import {
  buildMonthlyInsights,
  type DashboardGoal,
  type MonthlyBalancePoint,
  type MonthlyInsight,
} from "@/lib/dashboard/monthly-cockpit";
import { getRecurringEntryDashboardDetail } from "@/lib/dashboard/recurring-entry-detail";
import { formatCents } from "@/lib/finance/format-cents";
import type { MonthlySnapshot } from "@/lib/finance/monthly-snapshot";

type RecentTransaction = {
  amountCents: number;
  category: string;
  description: string;
  id: string;
  transactionDate: string;
};

type UpcomingStart = {
  amountCents: number;
  entryKind: "income" | "expense";
  label: string;
  startDate: string;
};

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
  oneTimeIncomeCount: number;
  recentTransactions: RecentTransaction[];
  snapshot: MonthlySnapshot;
  todayIso: string;
  transactionCount: number;
  upcomingExpenseCount: number;
  upcomingIncomeCount: number;
  upcomingStarts: UpcomingStart[];
};

function formatTransactionDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function MetricCard({
  detail,
  icon,
  label,
  value,
}: {
  detail: string;
  icon: Parameters<typeof AppIcon>[0]["name"];
  label: string;
  value: ReactNode;
}) {
  return (
    <motion.article className="dashboard-metric-card" variants={staggerItem}>
      <div className="dashboard-metric-icon" aria-hidden="true">
        <AppIcon name={icon} />
      </div>
      <p>{label}</p>
      <strong className="font-amount">{value}</strong>
      <small>{detail}</small>
    </motion.article>
  );
}

function StatusBadge({ percentageConsumed }: { percentageConsumed: string }) {
  // Badge sémantique : vert < 85 %, ambre 85–100 %, rouge > 100 %
  // (correction mockup n°6 : jamais tout en vert par défaut).
  const tone = getBudgetTone(Number(percentageConsumed));
  const presentation = {
    danger: { label: "Budget dépassé", tone: "ui-badge-danger" },
    ok: { label: "Maîtrisé", tone: "ui-badge-positive" },
    warning: { label: "À surveiller", tone: "ui-badge-warning" },
  }[tone];

  return <span className={`ui-badge ${presentation.tone}`}>{presentation.label}</span>;
}

function DashboardSectionHeader({
  href,
  id,
  linkLabel,
  title,
}: {
  href?: string;
  id?: string;
  linkLabel?: string;
  title: string;
}) {
  return (
    <div className="dashboard-section-header">
      <h2 id={id}>{title}</h2>
      {href && linkLabel ? (
        <Link href={href}>{linkLabel}<span aria-hidden="true">↗</span></Link>
      ) : null}
    </div>
  );
}

function InsightBanners({
  currencyCode,
  insights,
}: {
  currencyCode: string;
  insights: readonly MonthlyInsight[];
}) {
  // Les alertes actionnables et les échéances à venir sont affichées ;
  // le reste réel positif reste visible dans les cartes du mois.
  const actionable = insights.filter(
    (insight) =>
      insight.tone === "negative" ||
      insight.tone === "warning" ||
      insight.kind === "goal-progress",
  );

  if (actionable.length === 0) return null;

  return (
    <section aria-label="Alertes du mois" className="grid gap-3">
      {actionable.map((insight, index) => {
        const key = `${insight.kind}-${index}`;
        const tone =
          insight.tone === "negative"
            ? "ui-feedback-error"
            : insight.tone === "positive"
              ? "ui-feedback-success"
              : "ui-feedback-warning";

        if (insight.kind === "real-available") {
          return (
            <p className={tone} key={key} role="alert">
              Reste réel négatif ce mois-ci. Vos dépenses et allocations dépassent vos revenus : revoyez le plan mensuel.
            </p>
          );
        }

        if (insight.kind === "budget-exceeded") {
          return (
            <p className={tone} key={key} role="alert">
              Budget {insight.category} dépassé de {formatCents(insight.overrunCents, currencyCode)}. <Link href="/budgets">Revoir les budgets<span aria-hidden="true">↗</span></Link>
            </p>
          );
        }

        if (insight.kind === "budget-near") {
          return (
            <p className={tone} key={key} role="status">
              Budget {insight.category} bientôt épuisé ({insight.percentageConsumed} % consommé). <Link href="/budgets">Revoir les budgets<span aria-hidden="true">↗</span></Link>
            </p>
          );
        }

        if (insight.kind === "upcoming-start") {
          const startLabel = new Intl.DateTimeFormat("fr-FR", {
            day: "numeric",
            month: "long",
            timeZone: "UTC",
          }).format(new Date(`${insight.startDate}T00:00:00Z`));
          const target = insight.entryKind === "income" ? "/incomes" : "/expenses";
          const targetLabel = insight.entryKind === "income" ? "Voir les revenus" : "Voir les charges";

          return (
            <p className={tone} key={key} role="status">
              {insight.label} démarre le {startLabel} ({formatCents(insight.amountCents, currencyCode)}). <Link href={target}>{targetLabel}<span aria-hidden="true">↗</span></Link>
            </p>
          );
        }

        if (insight.kind === "goal-progress") {
          return (
            <p className={tone} key={key} role="status">
              Objectif {insight.name} : {insight.progressPercent} % atteint. <Link href="/goals">Voir les objectifs<span aria-hidden="true">↗</span></Link>
            </p>
          );
        }

        return null;
      })}
    </section>
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
  oneTimeIncomeCount,
  recentTransactions,
  snapshot,
  todayIso,
  transactionCount,
  upcomingExpenseCount,
  upcomingIncomeCount,
  upcomingStarts,
}: DashboardOverviewProps) {
  const visibleBudgets = categoryBudgets.slice(0, 3);
  const recurringIncomeDetail = getRecurringEntryDashboardDetail("income", {
    activeCount: activeIncomeCount,
    totalCount: incomeCount,
  });
  const recurringExpenseDetail = getRecurringEntryDashboardDetail("expense", {
    activeCount: activeExpenseCount,
    totalCount: expenseCount,
  });

  const insights = buildMonthlyInsights({
    categoryBudgets,
    featuredGoal,
    realAvailableCents: snapshot.realAvailableCents,
    todayIso,
    upcomingStarts,
  });

  return (
    <div className="dashboard-layout">
      <InsightBanners currencyCode={currencyCode} insights={insights} />
      <motion.section animate="show" aria-label="Synthèse financière du mois" className="dashboard-kpi-grid" initial="hidden" variants={staggerContainer}>
        <MetricCard
          detail="Disponible après votre plan et vos dépenses."
          icon="wallet"
          label="Reste réel"
          value={<AnimatedAmount currencyCode={currencyCode} valueCents={snapshot.realAvailableCents} />}
        />
        <MetricCard
          detail={`Sur ${formatCents(snapshot.totalIncomeCents, currencyCode)} de revenus`}
          icon="transaction"
          label="Dépensé ce mois"
          value={<AnimatedAmount currencyCode={currencyCode} valueCents={snapshot.totalTransactionsCents} />}
        />
        <MetricCard
          detail="Allocation effective ce mois-ci"
          icon="goal"
          label="Épargne prévue"
          value={<AnimatedAmount currencyCode={currencyCode} valueCents={snapshot.totalGoalAllocationsCents} />}
        />
        <motion.article className="dashboard-purchase-card" variants={staggerItem}>
          <div className="dashboard-purchase-icon" aria-hidden="true"><AppIcon name="check" /></div>
          <div>
            <h2>Purchase Checker</h2>
            <p>Mesurez l’impact d’un achat sur votre reste réel.</p>
          </div>
          <Link href="/purchase-checker">Vérifier un achat</Link>
        </motion.article>
      </motion.section>

      <div className="dashboard-content-grid">
        <div className="dashboard-primary-column">
          <PremiumCard className="dashboard-chart-card" labelledBy="balance-chart-heading">
            <DashboardSectionHeader id="balance-chart-heading" title="Reste réel au fil du mois" />
            <p className="dashboard-section-note">
              Le solde quotidien tient compte des transactions enregistrées.
            </p>
            {transactionCount === 0 ? (
              <p className="dashboard-inline-empty">Aucune variation pour le moment. La courbe évoluera avec vos transactions.</p>
            ) : null}
            <MonthlyBalanceChart
              currencyCode={currencyCode}
              currentDay={currentDay}
              points={balanceTrend}
            />
          </PremiumCard>

          <PremiumCard className="dashboard-transactions-card" labelledBy="recent-transactions-title">
            <DashboardSectionHeader href="/transactions" id="recent-transactions-title" linkLabel="Voir toutes" title="Transactions récentes" />
            {recentTransactions.length === 0 ? (
              <div className="dashboard-table-empty">
                <p>Aucune transaction ce mois-ci</p>
                <span>Les dépenses ponctuelles apparaîtront ici.</span>
              </div>
            ) : (
              <ul className="ui-divider-list premium-list-breathe">
                {recentTransactions.map((transaction) => (
                  <li className="finance-list-row" key={transaction.id}>
                    <div className="transaction-main min-w-0">
                      <CategoryIcon category={transaction.category} />
                      <div className="min-w-0">
                        <h3 className="break-words text-sm font-extrabold">{transaction.description || transaction.category}</h3>
                        <p className="premium-label">{formatTransactionDate(transaction.transactionDate)}</p>
                      </div>
                      <p className="transaction-amount font-amount break-words text-base font-extrabold">
                        {formatCents(transaction.amountCents, currencyCode)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </PremiumCard>
        </div>

        <aside className="dashboard-secondary-column" aria-label="Repères complémentaires">
          <PremiumCard className="dashboard-goal-card" labelledBy="dashboard-goal-title">
            <DashboardSectionHeader href="/goals" linkLabel="Voir tout" title="Objectif principal" id="dashboard-goal-title" />
            {featuredGoal ? (
              <>
                <div className="dashboard-goal-summary">
                  <ProgressRing
                    label={`${featuredGoal.progressPercent} % de l'objectif ${featuredGoal.name} atteint`}
                    percentage={featuredGoal.progressPercent}
                  />
                  <div>
                    <h3>{featuredGoal.name}</h3>
                    <p>{formatCents(featuredGoal.currentAmountCents, currencyCode)} sur {formatCents(featuredGoal.targetAmountCents, currencyCode)}</p>
                  </div>
                </div>
                <dl className="dashboard-detail-list">
                  <div><dt>Estimation</dt><dd>{featuredGoal.isReached ? "Atteint" : featuredGoal.estimatedMonths === null ? "Indisponible" : featuredGoal.estimatedArrivalLabel ? `${featuredGoal.estimatedMonths} mois (≈ ${featuredGoal.estimatedArrivalLabel})` : `${featuredGoal.estimatedMonths} mois`}</dd></div>
                  <div><dt>Allocation mensuelle</dt><dd className="font-amount">{formatCents(featuredGoal.monthlyAllocationCents, currencyCode)}</dd></div>
                  <div><dt>Épargne restante</dt><dd className="font-amount">{formatCents(featuredGoal.remainingAmountCents, currencyCode)}</dd></div>
                </dl>
              </>
            ) : (
              <div className="dashboard-module-empty"><p>Aucun objectif d’épargne</p><Link href="/goals">Créer un objectif</Link></div>
            )}
          </PremiumCard>

          <PremiumCard className="dashboard-budgets-card" labelledBy="dashboard-budgets-title">
            <DashboardSectionHeader href="/budgets" linkLabel="Voir tout" title="Budgets à surveiller" id="dashboard-budgets-title" />
            {visibleBudgets.length === 0 ? (
              <div className="dashboard-module-empty"><p>Aucun budget configuré</p><Link href="/budgets">Créer un budget</Link></div>
            ) : (
              <ul className="premium-list-breathe">
                {visibleBudgets.map((budget) => (
                  <li key={budget.id}>
                    <div className="dashboard-budget-heading">
                      <div><h3>{budget.category}</h3><span>{formatCents(budget.spentCents, currencyCode)} sur {formatCents(budget.monthlyBudgetCents, currencyCode)}</span></div>
                      <StatusBadge percentageConsumed={budget.percentageConsumed} />
                    </div>
                    <BudgetProgressBar
                      category={budget.category}
                      percentageConsumed={budget.percentageConsumed}
                      progressPercent={budget.progressPercent}
                    />
                    <p className="dashboard-budget-status">
                      {budget.remainingCents < 0
                        ? `Dépassé de ${formatCents(Math.abs(budget.remainingCents), currencyCode)}`
                        : `${formatCents(budget.remainingCents, currencyCode)} restants`}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </PremiumCard>

          <PremiumCard className="dashboard-plan-card" labelledBy="dashboard-plan-title">
            <DashboardSectionHeader title="Plan mensuel" id="dashboard-plan-title" />
            <dl className="dashboard-detail-list">
              <div><dt>Budget disponible</dt><dd className="font-amount">{formatCents(snapshot.availableCents, currencyCode)}</dd><small>Après charges fixes et épargne prévue.</small></div>
              <div><dt>Revenus mensuels</dt><dd className="font-amount">{formatCents(snapshot.totalIncomeCents, currencyCode)}</dd><small>{recurringIncomeDetail}{oneTimeIncomeCount > 0 ? ` Dont ${oneTimeIncomeCount} ponctuel${oneTimeIncomeCount > 1 ? "s" : ""}.` : ""}{upcomingIncomeCount > 0 ? ` ${upcomingIncomeCount} à venir.` : ""}</small></div>
              <div><dt>Dépenses fixes</dt><dd className="font-amount">{formatCents(snapshot.totalFixedExpensesCents, currencyCode)}</dd><small>{recurringExpenseDetail}{upcomingExpenseCount > 0 ? ` ${upcomingExpenseCount} à venir.` : ""}</small></div>
              <div><dt>Dépenses ponctuelles</dt><dd className="font-amount">{formatCents(snapshot.totalTransactionsCents, currencyCode)}</dd><small>{transactionCount === 0 ? "Aucune transaction enregistrée ce mois-ci." : `${transactionCount} transaction${transactionCount > 1 ? "s" : ""} ce mois-ci.`}</small></div>
              <div><dt>Objectifs actifs</dt><dd>{snapshot.activeGoalCount}</dd><small>{goalCount === 0 ? "Aucun objectif d’épargne enregistré." : snapshot.activeGoalCount === 0 ? "Tous vos objectifs sont atteints." : `${goalCount} objectif${goalCount > 1 ? "s" : ""} au total.`}</small></div>
            </dl>
            {incomeCount === 0 || expenseCount === 0 ? (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--line)] pt-5">
                {incomeCount === 0 ? <Link className="ui-button-primary min-h-10 px-3 py-2 text-xs" href="/incomes">Ajouter un revenu</Link> : null}
                {expenseCount === 0 ? <Link className="ui-button-secondary min-h-10 px-3 py-2 text-xs" href="/expenses">Ajouter une charge fixe</Link> : null}
              </div>
            ) : null}
          </PremiumCard>
        </aside>
      </div>
    </div>
  );
}
