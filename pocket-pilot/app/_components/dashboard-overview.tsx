import type { CSSProperties } from "react";
import Link from "next/link";

import { AppIcon } from "@/app/_components/app-icon";
import { MonthlyBalanceChart } from "@/app/_components/monthly-balance-chart";
import type { CategoryBudgetUsage } from "@/lib/budgets/category-budget";
import type {
  DashboardGoal,
  MonthlyBalancePoint,
} from "@/lib/dashboard/monthly-cockpit";
import { getRecurringEntryDashboardDetail } from "@/lib/dashboard/recurring-entry-detail";
import { formatCents } from "@/lib/finance/format-cents";
import type { MonthlySnapshot } from "@/lib/finance/monthly-snapshot";
import type { TransactionCategory } from "@/lib/transactions/categories";

type RecentTransaction = {
  amountCents: number;
  category: TransactionCategory;
  description: string;
  transactionDate: string;
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
  recentTransactions: RecentTransaction[];
  snapshot: MonthlySnapshot;
  transactionCount: number;
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
  value: string;
}) {
  return (
    <article className="dashboard-metric-card">
      <div className="dashboard-metric-icon" aria-hidden="true">
        <AppIcon name={icon} />
      </div>
      <p>{label}</p>
      <strong className="font-amount">{value}</strong>
      <small>{detail}</small>
    </article>
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
  recentTransactions,
  snapshot,
  transactionCount,
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

  return (
    <div className="dashboard-layout">
      <section className="dashboard-kpi-grid" aria-label="Synthèse financière du mois">
        <MetricCard
          detail="Disponible après votre plan et vos dépenses."
          icon="wallet"
          label="Reste réel"
          value={formatCents(snapshot.realAvailableCents, currencyCode)}
        />
        <MetricCard
          detail={`Sur ${formatCents(snapshot.totalIncomeCents, currencyCode)} de revenus`}
          icon="transaction"
          label="Dépensé ce mois"
          value={formatCents(snapshot.totalTransactionsCents, currencyCode)}
        />
        <MetricCard
          detail="Allocation effective ce mois-ci"
          icon="goal"
          label="Épargne prévue"
          value={formatCents(snapshot.totalGoalAllocationsCents, currencyCode)}
        />
        <article className="dashboard-purchase-card">
          <div className="dashboard-purchase-icon" aria-hidden="true"><AppIcon name="check" /></div>
          <div>
            <h2>Purchase Checker</h2>
            <p>Mesurez l’impact d’un achat sur votre reste réel.</p>
          </div>
          <Link href="/purchase-checker">Vérifier un achat</Link>
        </article>
      </section>

      <div className="dashboard-content-grid">
        <div className="dashboard-primary-column">
          <section className="ui-panel dashboard-chart-card" aria-labelledby="balance-chart-heading">
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
          </section>

          <section className="ui-panel dashboard-transactions-card" aria-labelledby="recent-transactions-title">
            <DashboardSectionHeader href="/transactions" id="recent-transactions-title" linkLabel="Voir toutes" title="Transactions récentes" />
            {recentTransactions.length === 0 ? (
              <div className="dashboard-table-empty">
                <p>Aucune transaction ce mois-ci</p>
                <span>Les dépenses ponctuelles apparaîtront ici.</span>
              </div>
            ) : (
              <div className="dashboard-table-scroll">
                <table className="dashboard-transactions-table">
                  <caption className="sr-only">Transactions les plus récentes du mois en cours</caption>
                  <thead><tr><th>Date</th><th>Description</th><th>Catégorie</th><th>Montant</th></tr></thead>
                  <tbody>
                    {recentTransactions.map((transaction, index) => (
                      <tr key={`${transaction.transactionDate}-${transaction.description}-${index}`}>
                        <td>{formatTransactionDate(transaction.transactionDate)}</td>
                        <td><strong>{transaction.description}</strong></td>
                        <td><span className="transaction-category-dot" aria-hidden="true" />{transaction.category}</td>
                        <td className="font-amount">−{formatCents(transaction.amountCents, currencyCode)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <aside className="dashboard-secondary-column" aria-label="Repères complémentaires">
          <section className="ui-panel dashboard-goal-card">
            <DashboardSectionHeader href="/goals" linkLabel="Voir tout" title="Objectif principal" />
            {featuredGoal ? (
              <>
                <div className="dashboard-goal-summary">
                  <div className="goal-orbit" style={{ "--goal-progress": `${featuredGoal.progressPercent * 3.6}deg` } as CSSProperties}>
                    <div><strong>{featuredGoal.progressPercent} %</strong><span>atteint</span></div>
                  </div>
                  <div>
                    <h3>{featuredGoal.name}</h3>
                    <p>{formatCents(featuredGoal.currentAmountCents, currencyCode)} sur {formatCents(featuredGoal.targetAmountCents, currencyCode)}</p>
                  </div>
                </div>
                <dl className="dashboard-detail-list">
                  <div><dt>Estimation</dt><dd>{featuredGoal.isReached ? "Atteint" : featuredGoal.estimatedMonths === null ? "Indisponible" : `${featuredGoal.estimatedMonths} mois`}</dd></div>
                  <div><dt>Allocation mensuelle</dt><dd className="font-amount">{formatCents(featuredGoal.monthlyAllocationCents, currencyCode)}</dd></div>
                  <div><dt>Épargne restante</dt><dd className="font-amount">{formatCents(featuredGoal.remainingAmountCents, currencyCode)}</dd></div>
                </dl>
              </>
            ) : (
              <div className="dashboard-module-empty"><p>Aucun objectif d’épargne</p><Link href="/goals">Créer un objectif</Link></div>
            )}
          </section>

          <section className="ui-panel dashboard-budgets-card">
            <DashboardSectionHeader href="/budgets" linkLabel="Voir tout" title="Budgets à surveiller" />
            {visibleBudgets.length === 0 ? (
              <div className="dashboard-module-empty"><p>Aucun budget configuré</p><Link href="/budgets">Créer un budget</Link></div>
            ) : (
              <ul>
                {visibleBudgets.map((budget) => (
                  <li key={budget.id}>
                    <div className="dashboard-budget-heading">
                      <div><h3>{budget.category}</h3><span>{formatCents(budget.spentCents, currencyCode)} sur {formatCents(budget.monthlyBudgetCents, currencyCode)}</span></div>
                      <StatusBadge status={budget.status} />
                    </div>
                    <div aria-label={`${budget.percentageConsumed} % du budget ${budget.category} consommé`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={budget.progressPercent} className="ui-progress" role="progressbar"><span className={budget.status === "exceeded" ? "is-danger" : budget.status === "near" || budget.status === "reached" ? "is-warning" : ""} style={{ width: `${budget.progressPercent}%` }} /></div>
                    <p className="dashboard-budget-status">
                      {budget.remainingCents < 0
                        ? `Dépassé de ${formatCents(Math.abs(budget.remainingCents), currencyCode)}`
                        : `${formatCents(budget.remainingCents, currencyCode)} restants`}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <article className="ui-panel dashboard-plan-card">
            <DashboardSectionHeader title="Plan mensuel" />
            <dl className="dashboard-detail-list">
              <div><dt>Budget disponible</dt><dd className="font-amount">{formatCents(snapshot.availableCents, currencyCode)}</dd><small>Après charges fixes et épargne prévue.</small></div>
              <div><dt>Revenus mensuels</dt><dd className="font-amount">{formatCents(snapshot.totalIncomeCents, currencyCode)}</dd><small>{recurringIncomeDetail}</small></div>
              <div><dt>Dépenses fixes</dt><dd className="font-amount">{formatCents(snapshot.totalFixedExpensesCents, currencyCode)}</dd><small>{recurringExpenseDetail}</small></div>
              <div><dt>Dépenses ponctuelles</dt><dd className="font-amount">{formatCents(snapshot.totalTransactionsCents, currencyCode)}</dd><small>{transactionCount === 0 ? "Aucune transaction enregistrée ce mois-ci." : `${transactionCount} transaction${transactionCount > 1 ? "s" : ""} ce mois-ci.`}</small></div>
              <div><dt>Objectifs actifs</dt><dd>{snapshot.activeGoalCount}</dd><small>{goalCount === 0 ? "Aucun objectif d’épargne enregistré." : snapshot.activeGoalCount === 0 ? "Tous vos objectifs sont atteints." : `${goalCount} objectif${goalCount > 1 ? "s" : ""} au total.`}</small></div>
            </dl>
          </article>
        </aside>
      </div>
    </div>
  );
}
