"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { createTransaction } from "@/app/transactions/actions";
import type { TransactionActionState } from "@/app/transactions/transaction-types";
import { formatCentsForInput } from "@/lib/finance/money";
import { TRANSACTION_CATEGORIES } from "@/lib/transactions/categories";

function ConfirmationSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="min-h-12 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white transition-all hover:bg-[var(--accent-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-dark)] disabled:cursor-wait disabled:opacity-65"
      disabled={pending}
      type="submit"
    >
      {pending ? "Ajout en cours…" : "Confirmer l’ajout"}
    </button>
  );
}

export function PurchaseTransactionConfirmation({
  currentDate,
  name,
  priceCents,
}: {
  currentDate: string;
  name: string;
  priceCents: number;
}) {
  const [isConfirming, setIsConfirming] = useState(false);
  const initialState: TransactionActionState = {
    fieldErrors: {},
    message: "",
    status: "idle",
    values: {
      amount: formatCentsForInput(priceCents, { allowZero: false }),
      category: "Autre",
      description: name,
      transactionDate: currentDate,
    },
  };
  const [state, formAction] = useActionState(createTransaction, initialState);

  if (state.status === "success") {
    return (
      <div
        className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950"
        role="status"
      >
        <p className="font-bold">{state.message}</p>
        <p className="mt-2 text-sm leading-6">
          Le dashboard tiendra compte de cet achat dans le reste réel du mois.
        </p>
        <Link
          className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-[var(--forest)] px-4 py-2 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)]"
          href="/"
        >
          Voir le dashboard
        </Link>
      </div>
    );
  }

  if (!isConfirming) {
    return (
      <button
        className="min-h-12 rounded-xl border border-[var(--forest)] px-5 py-3 text-sm font-bold text-[var(--forest)] transition-all hover:bg-[var(--forest)] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)]"
        onClick={() => setIsConfirming(true)}
        type="button"
      >
        Ajouter comme transaction
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-2xl border border-[var(--line)] bg-white/70 p-5"
    >
      <div>
        <p className="font-display text-xl font-bold">Confirmer la transaction</p>
        <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
          Rien ne sera enregistré avant cette confirmation.
        </p>
      </div>

      {state.status === "error" ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {state.message}
        </div>
      ) : null}

      <input name="amount" type="hidden" value={initialState.values.amount} />
      <input
        name="description"
        type="hidden"
        value={initialState.values.description}
      />
      <input
        name="transactionDate"
        type="hidden"
        value={initialState.values.transactionDate}
      />

      <label className="grid gap-2 text-sm font-semibold">
        Catégorie
        <select
          className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 text-base font-normal outline-none transition-all focus:border-[var(--forest)] focus:ring-3 focus:ring-[#c9d5c380]"
          defaultValue="Autre"
          name="category"
        >
          {TRANSACTION_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <ConfirmationSubmitButton />
        <button
          className="min-h-12 rounded-xl border border-[var(--line)] px-5 py-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)]"
          onClick={() => setIsConfirming(false)}
          type="button"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
