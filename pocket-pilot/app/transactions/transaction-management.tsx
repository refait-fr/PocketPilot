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
    <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.78fr)_minmax(0,1.22fr)] xl:items-start">
      <section className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--paper)] p-6 shadow-[0_16px_50px_rgba(23,53,47,0.08)] sm:p-8 xl:sticky xl:top-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-dark)]">
          Nouvelle dépense ponctuelle
        </p>
        <h2 className="font-display mt-3 text-3xl font-bold tracking-[-0.04em]">
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
        <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--paper)] p-4 shadow-[0_10px_35px_rgba(23,53,47,0.05)] sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                {isCurrentMonth ? "Mois actuel" : "Mois consulté"}
              </p>
              <p className="font-display mt-1 text-2xl font-bold capitalize tracking-[-0.035em]">
                {monthLabel}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link className="min-h-10 rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-bold transition-all hover:border-[var(--forest)] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)]" href={previousMonthHref}>
                ← Mois précédent
              </Link>
              {!isCurrentMonth ? (
                <Link className="min-h-10 rounded-lg bg-[var(--forest)] px-3 py-2 text-xs font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)]" href="/transactions">
                  Mois actuel
                </Link>
              ) : null}
              <Link className="min-h-10 rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-bold transition-all hover:border-[var(--forest)] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)]" href={nextMonthHref}>
                Mois suivant →
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-4 mt-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
              {transactions.length} transaction{transactions.length > 1 ? "s" : ""}
            </p>
            <h2 className="font-display mt-1 text-3xl font-bold tracking-[-0.04em]" id="transaction-list-title">
              Dépensé : {formatCents(totalTransactionsCents, currencyCode)}
            </h2>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[color:rgba(255,253,247,0.72)] p-8 text-center sm:p-12">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-[var(--sage)] font-display text-2xl font-bold">
              0
            </span>
            <h3 className="font-display mt-5 text-2xl font-bold tracking-[-0.035em]">
              {isCurrentMonth ? "Aucune transaction ce mois-ci" : `Aucune transaction en ${monthLabel}`}
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--ink-soft)]">
              {isCurrentMonth
                ? "Ajoutez une dépense ponctuelle pour rapprocher le budget prévu du reste réel."
                : "Ce mois ne contient aucune dépense ponctuelle enregistrée."}
            </p>
          </div>
        ) : (
          <ul className="grid gap-4">
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
