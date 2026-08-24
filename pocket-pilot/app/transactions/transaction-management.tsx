import Link from "next/link";

import { createTransaction } from "@/app/transactions/actions";
import { TransactionForm } from "@/app/transactions/transaction-form";
import { TransactionRow } from "@/app/transactions/transaction-row";
import type { TransactionView } from "@/app/transactions/transaction-types";
import { formatCents } from "@/lib/finance/format-cents";
import type { TransactionInputValues } from "@/lib/transactions/transaction-input";

export function TransactionManagement({
  currencyCode,
  defaultValues,
  isCurrentMonth,
  monthLabel,
  nextMonthHref,
  previousMonthHref,
  totalTransactionsCents,
  transactions,
}: {
  currencyCode: string;
  defaultValues: TransactionInputValues;
  isCurrentMonth: boolean;
  monthLabel: string;
  nextMonthHref: string;
  previousMonthHref: string;
  totalTransactionsCents: number;
  transactions: TransactionView[];
}) {
  return (
    <div className="management-grid">
      <section className="ui-panel management-form-panel">
        <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--accent)]">
          Nouvelle dépense ponctuelle
        </p>
        <h2 className="font-display mt-2 text-3xl font-medium tracking-[-0.04em]">
          Notez ce qui sort vraiment.
        </h2>
        <p className="mb-7 mt-3 text-sm leading-6 text-[var(--ink-soft)]">
          Une date, un montant et une catégorie suffisent. Aucun relevé bancaire complet à maintenir.
        </p>
        <TransactionForm
          action={createTransaction}
          defaultValues={defaultValues}
          mode="create"
        />
      </section>

      <section aria-labelledby="transaction-list-title" className="min-w-0">
        <div className="ui-panel-flat p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                {isCurrentMonth ? "Mois actuel" : "Mois consulté"}
              </p>
              <p className="font-display mt-1 text-2xl font-medium capitalize tracking-[-0.035em]">
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

        <div className="mb-4 mt-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
              {transactions.length} transaction{transactions.length > 1 ? "s" : ""}
            </p>
            <h2 className="font-display mt-1 text-3xl font-medium tracking-[-0.04em]" id="transaction-list-title">
              Dépensé : {formatCents(totalTransactionsCents, currencyCode)}
            </h2>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="ui-empty">
            <h3 className="font-display text-2xl font-medium tracking-[-0.035em]">
              {isCurrentMonth ? "Aucune transaction ce mois-ci" : `Aucune transaction en ${monthLabel}`}
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--ink-soft)]">
              {isCurrentMonth
                ? "Ajoutez une dépense ponctuelle pour rapprocher le budget prévu du reste réel."
                : "Ce mois ne contient aucune dépense ponctuelle enregistrée."}
            </p>
          </div>
        ) : (
          <ul className="ui-divider-list ui-panel overflow-hidden">
            {transactions.map((transaction) => (
              <TransactionRow
                currencyCode={currencyCode}
                key={transaction.id}
                transaction={transaction}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
