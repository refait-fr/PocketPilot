"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { deleteTransaction, updateTransaction } from "@/app/transactions/actions";
import { TransactionForm } from "@/app/transactions/transaction-form";
import type {
  TransactionActionState,
  TransactionView,
} from "@/app/transactions/transaction-types";
import { formatCents } from "@/lib/finance/format-cents";
import {
  formatTransactionCentsForInput,
  formatTransactionDate,
} from "@/lib/transactions/transaction-input";

const initialDeleteState: TransactionActionState = {
  fieldErrors: {},
  message: "",
  status: "idle",
  values: {
    amount: "",
    category: "Alimentation",
    description: "",
    transactionDate: "",
  },
};

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="min-h-10 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-800 transition-all duration-200 ease-in-out hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-wait disabled:opacity-65"
      disabled={pending}
      type="submit"
    >
      {pending ? "Suppression…" : "Confirmer la suppression"}
    </button>
  );
}

export function TransactionRow({
  currencyCode,
  transaction,
}: {
  currencyCode: string;
  transaction: TransactionView;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteState, deleteFormAction] = useActionState(
    deleteTransaction.bind(null, transaction.id),
    initialDeleteState,
  );

  if (isEditing) {
    return (
      <li className="rounded-[1.5rem] border border-[var(--forest)] bg-[var(--paper)] p-5 shadow-[0_14px_40px_rgba(23,53,47,0.08)] sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-2xl font-bold tracking-[-0.035em]">
            Modifier la transaction
          </h3>
          <span className="rounded-full bg-[var(--sage)] px-3 py-1 text-xs font-bold text-[var(--forest)]">
            Édition
          </span>
        </div>
        <TransactionForm
          action={updateTransaction.bind(null, transaction.id)}
          cancelEditing={() => setIsEditing(false)}
          defaultValues={{
            amount: formatTransactionCentsForInput(transaction.amountCents),
            category: transaction.category,
            description: transaction.description,
            transactionDate: transaction.transactionDate,
          }}
          mode="edit"
        />
      </li>
    );
  }

  const title = transaction.description || transaction.category;

  return (
    <li className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--paper)] p-5 shadow-[0_14px_40px_rgba(23,53,47,0.06)] sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-words font-display text-2xl font-bold tracking-[-0.035em]">
              {title}
            </h3>
            <span className="rounded-full bg-[#f7d4c1] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8b3518]">
              {transaction.category}
            </span>
          </div>
          <p className="mt-2 break-words text-xl font-bold text-[var(--forest)]">
            {formatCents(transaction.amountCents, currencyCode)}
          </p>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            {formatTransactionDate(transaction.transactionDate)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <button
            className="min-h-10 rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-bold transition-all duration-200 ease-in-out hover:border-[var(--forest)] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)]"
            onClick={() => setIsEditing(true)}
            type="button"
          >
            Modifier
          </button>
          <button
            className="min-h-10 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-800 transition-all duration-200 ease-in-out hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
            onClick={() => setIsConfirmingDelete(true)}
            type="button"
          >
            Supprimer
          </button>
        </div>
      </div>

      {deleteState.status === "error" ? (
        <p aria-live="polite" className="mt-3 text-xs leading-5 text-red-700" role="alert">
          {deleteState.message}
        </p>
      ) : null}

      {isConfirmingDelete ? (
        <div
          aria-labelledby={`delete-transaction-${transaction.id}`}
          className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4"
          role="group"
        >
          <p className="text-sm font-bold text-red-900" id={`delete-transaction-${transaction.id}`}>
            Supprimer définitivement « {title} » ?
          </p>
          <p className="mt-1 text-xs leading-5 text-red-800">
            Son montant ne sera plus déduit du reste réel de ce mois.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <form action={deleteFormAction}>
              <DeleteButton />
            </form>
            <button
              className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-xs font-bold transition-all duration-200 ease-in-out hover:border-[var(--forest)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)]"
              onClick={() => setIsConfirmingDelete(false)}
              type="button"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : null}
    </li>
  );
}
