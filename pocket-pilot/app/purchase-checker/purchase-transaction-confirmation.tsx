"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { createTransaction } from "@/app/transactions/actions";
import type { TransactionActionState } from "@/app/transactions/transaction-types";
import {
  calculateCategoryBudgetUsage,
  type CategoryBudgetUsage,
} from "@/lib/budgets/category-budget";
import { formatCents } from "@/lib/finance/format-cents";
import { addCents, formatCentsForInput } from "@/lib/finance/money";
import { TRANSACTION_CATEGORIES } from "@/lib/transactions/categories";

function ConfirmationSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="ui-button-primary min-h-12 px-5 py-3"
      disabled={pending}
      type="submit"
    >
      {pending ? "Ajout en cours…" : "Confirmer l’ajout"}
    </button>
  );
}

export function PurchaseTransactionConfirmation({
  categoryBudgets,
  currencyCode,
  currentDate,
  name,
  priceCents,
}: {
  categoryBudgets: CategoryBudgetUsage[];
  currencyCode: string;
  currentDate: string;
  name: string;
  priceCents: number;
}) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Autre");
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
  const selectedBudget = categoryBudgets.find(
    (budget) => budget.category === selectedCategory,
  );
  let projectedBudget: CategoryBudgetUsage | null = null;

  if (selectedBudget) {
    try {
      projectedBudget = calculateCategoryBudgetUsage({
        budget: selectedBudget,
        spentCents: addCents(selectedBudget.spentCents, priceCents),
      });
    } catch {
      projectedBudget = null;
    }
  }

  if (state.status === "success") {
    return (
      <div
        className="ui-feedback-success p-5"
        role="status"
      >
        <p className="font-bold">{state.message}</p>
        <p className="mt-2 text-sm leading-6">
          Le dashboard tiendra compte de cet achat dans le reste réel du mois.
        </p>
        <Link
          className="ui-button-primary mt-4"
          href="/dashboard"
        >
          Voir le dashboard
        </Link>
      </div>
    );
  }

  if (!isConfirming) {
    return (
      <button
        className="ui-button-primary min-h-12 px-5 py-3"
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
      className="grid gap-4 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-muted)] p-5"
    >
      <div>
        <p className="font-display text-xl font-bold">Confirmer la transaction</p>
        <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
          Rien ne sera enregistré avant cette confirmation.
        </p>
      </div>

      {state.status === "error" ? (
        <div
          className="ui-feedback-error"
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

      <label className="ui-label">
        Catégorie
        <select
          className="ui-select"
          defaultValue="Autre"
          name="category"
          onChange={(event) => setSelectedCategory(event.target.value)}
        >
          {TRANSACTION_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      {selectedBudget && projectedBudget ? (
        <div className="ui-feedback-info">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em]">Impact sur le budget {selectedBudget.category}</p>
          <p className="mt-2">Ce montant ferait passer {selectedBudget.category} de {formatCents(selectedBudget.spentCents, currencyCode)} / {formatCents(selectedBudget.monthlyBudgetCents, currencyCode)} à {formatCents(projectedBudget.spentCents, currencyCode)} / {formatCents(projectedBudget.monthlyBudgetCents, currencyCode)}.</p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <ConfirmationSubmitButton />
        <button
          className="ui-button-secondary min-h-12 px-5 py-3"
          onClick={() => setIsConfirming(false)}
          type="button"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
