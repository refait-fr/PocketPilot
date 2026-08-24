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
      className="ui-button-danger min-h-10 px-3 py-2 text-xs"
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
      <li className="bg-[var(--accent-soft)] p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-2xl font-medium tracking-[-0.035em]">
            Modifier la transaction
          </h3>
          <span className="ui-badge bg-white text-[var(--accent-dark)]">
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
    <li className="bg-[var(--paper)] p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-words text-base font-extrabold">
              {title}
            </h3>
            <span className="ui-badge bg-[var(--surface-muted)] text-[var(--ink-soft)]">
              {transaction.category}
            </span>
          </div>
          <p className="font-amount mt-2 break-words text-2xl font-extrabold">
            {formatCents(transaction.amountCents, currencyCode)}
          </p>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            {formatTransactionDate(transaction.transactionDate)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <button
            className="ui-button-quiet min-h-10 px-3 py-2 text-xs"
            onClick={() => setIsEditing(true)}
            type="button"
          >
            Modifier
          </button>
          <button
            className="ui-button-danger min-h-10 px-3 py-2 text-xs"
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
          className="ui-feedback-error mt-5 p-4"
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
              className="ui-button-secondary min-h-10 px-3 py-2 text-xs"
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
