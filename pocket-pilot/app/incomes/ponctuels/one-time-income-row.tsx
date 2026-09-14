"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { deleteOneTimeIncome, updateOneTimeIncome } from "@/app/incomes/one-time-actions";
import type {
  OneTimeIncomeActionState,
  OneTimeIncomeView,
} from "@/app/incomes/one-time-types";
import { OneTimeIncomeForm } from "@/app/incomes/ponctuels/one-time-income-form";
import { formatCents } from "@/lib/finance/format-cents";
import { formatCentsForInput } from "@/lib/finance/money.ts";
import { formatTransactionDate } from "@/lib/transactions/transaction-input";

const initialDeleteState: OneTimeIncomeActionState = {
  fieldErrors: {},
  message: "",
  status: "idle",
  values: {
    amount: "",
    incomeDate: "",
    label: "",
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

export function OneTimeIncomeRow({
  currencyCode,
  income,
  maximumIncomeDate,
}: {
  currencyCode: string;
  income: OneTimeIncomeView;
  maximumIncomeDate: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteState, deleteFormAction] = useActionState(
    deleteOneTimeIncome.bind(null, income.id),
    initialDeleteState,
  );

  if (isEditing) {
    return (
      <li className="bg-[var(--accent-soft)] p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-xl font-semibold tracking-[-0.03em]">
            Modifier le revenu
          </h3>
          <span className="ui-badge bg-white text-[var(--accent-dark)]">
            Édition
          </span>
        </div>
        <OneTimeIncomeForm
          action={updateOneTimeIncome.bind(null, income.id)}
          cancelEditing={() => setIsEditing(false)}
          defaultValues={{
            amount: formatCentsForInput(income.amountCents, {
              allowZero: false,
              fieldName: "Le montant du revenu ponctuel",
            }),
            incomeDate: income.incomeDate,
            label: income.label,
          }}
          maximumIncomeDate={maximumIncomeDate}
          mode="edit"
        />
      </li>
    );
  }

  return (
    <li className="finance-list-row transaction-list-row bg-[var(--paper)]">
      <div className="transaction-main min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="break-words text-base font-extrabold">
            {income.label}
          </h3>
          <span className="ui-badge bg-[var(--positive-soft)] text-[var(--positive)]">
            Ponctuel
          </span>
        </div>
        <p className="transaction-amount font-amount break-words text-lg font-extrabold">
          +{formatCents(income.amountCents, currencyCode)}
        </p>
        <p className="transaction-date text-sm text-[var(--ink-soft)]">
          {formatTransactionDate(income.incomeDate)}
        </p>
      </div>

      <div className="finance-row-actions flex flex-wrap gap-2 sm:justify-end">
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

      {deleteState.status === "error" ? (
        <p aria-live="polite" className="mt-3 text-xs leading-5 text-red-700" role="alert">
          {deleteState.message}
        </p>
      ) : null}

      {isConfirmingDelete ? (
        <div
          aria-labelledby={`delete-one-time-income-${income.id}`}
          className="ui-feedback-error mt-5 p-4"
          role="group"
        >
          <p className="text-sm font-bold text-red-900" id={`delete-one-time-income-${income.id}`}>
            Supprimer définitivement « {income.label} » ?
          </p>
          <p className="mt-1 text-xs leading-5 text-red-800">
            Son montant ne sera plus ajouté au revenu de ce mois.
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
