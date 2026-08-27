import Link from "next/link";

import { CreationDisclosure } from "@/app/_components/creation-disclosure";
import { createTransaction } from "@/app/transactions/actions";
import { TransactionForm } from "@/app/transactions/transaction-form";
import { TransactionRow } from "@/app/transactions/transaction-row";
import type { TransactionView } from "@/app/transactions/transaction-types";
import { formatCents } from "@/lib/finance/format-cents";
import type { TransactionInputValues } from "@/lib/transactions/transaction-input";
import type { MonthlyTransactionSummary } from "@/lib/transactions/monthly-summary";

export function TransactionManagement({
  currencyCode,
  defaultValues,
  isCurrentMonth,
  maximumTransactionDate,
  monthLabel,
  nextMonthHref,
  previousMonthHref,
  summary,
  transactions,
}: {
  currencyCode: string;
  defaultValues: TransactionInputValues;
  isCurrentMonth: boolean;
  maximumTransactionDate: string;
  monthLabel: string;
  nextMonthHref: string;
  previousMonthHref: string;
  summary: MonthlyTransactionSummary;
  transactions: TransactionView[];
}) {
  return (
    <div className="management-stack transaction-management">
      <section aria-labelledby="transaction-list-title" className="min-w-0">
        <div className="period-toolbar period-toolbar-compact">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="ui-kicker">
                {isCurrentMonth ? "Mois actuel" : "Mois consulté"}
              </p>
              <p className="period-title">
                {monthLabel}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link className="ui-button-secondary min-h-10 px-3 py-2 text-xs" href={previousMonthHref}>
                ← Mois précédent
              </Link>
              {!isCurrentMonth ? (
                <Link className="ui-button-primary min-h-10 px-3 py-2 text-xs" href="/transactions">
                  Mois actuel
                </Link>
              ) : null}
              <Link className="ui-button-secondary min-h-10 px-3 py-2 text-xs" href={nextMonthHref}>
                Mois suivant →
              </Link>
            </div>
          </div>
        </div>

        <dl className="finance-summary finance-summary-transactions" aria-label={`Synthèse de ${monthLabel}`}>
          <div className="pilot-metric pilot-metric-primary">
            <dt>Total dépensé</dt>
            <dd>{formatCents(summary.totalCents, currencyCode)}</dd>
          </div>
          <div className="pilot-metric">
            <dt>Transactions</dt>
            <dd>{summary.transactionCount}</dd>
          </div>
          <div className="pilot-metric">
            <dt>Catégorie principale</dt>
            <dd>{summary.topCategory ?? "—"}</dd>
            {summary.topCategory ? <small>{formatCents(summary.topCategoryCents, currencyCode)}</small> : null}
          </div>
        </dl>

        <div className="management-list-heading">
          <div><p className="ui-kicker">Détail du mois</p><h2 className="management-title" id="transaction-list-title">Détail des transactions</h2></div>
        </div>

        {transactions.length === 0 ? (
          <div className="ui-empty">
            <h3>
              {isCurrentMonth ? "Aucune transaction ce mois-ci" : `Aucune transaction en ${monthLabel}`}
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--ink-soft)]">
              {isCurrentMonth
                ? "Ajoutez une dépense ponctuelle pour rapprocher le budget prévu du reste réel."
                : "Ce mois ne contient aucune dépense ponctuelle enregistrée."}
            </p>
          </div>
        ) : (
          <ul className="ui-divider-list ui-panel dense-finance-list overflow-hidden">
            {transactions.map((transaction) => (
              <TransactionRow
                currencyCode={currencyCode}
                key={transaction.id}
                maximumTransactionDate={maximumTransactionDate}
                transaction={transaction}
              />
            ))}
          </ul>
        )}
      </section>
      <CreationDisclosure
        buttonLabel="Ajouter une transaction"
        defaultOpen={transactions.length === 0 && isCurrentMonth}
        description="Une date, un montant et une catégorie suffisent."
        eyebrow="Nouvelle dépense ponctuelle"
        title="Ajouter une transaction"
      >
        <TransactionForm action={createTransaction} defaultValues={defaultValues} maximumTransactionDate={maximumTransactionDate} mode="create" />
      </CreationDisclosure>
    </div>
  );
}
