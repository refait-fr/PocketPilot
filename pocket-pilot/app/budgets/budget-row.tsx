"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  deleteCategoryBudget,
  updateCategoryBudget,
} from "@/app/budgets/actions";
import { BudgetForm } from "@/app/budgets/budget-form";
import type { BudgetActionState, BudgetView } from "@/app/budgets/budget-types";
import { formatCategoryBudgetCentsForInput } from "@/lib/budgets/category-budget";
import { formatCents } from "@/lib/finance/format-cents";

const statusLabels = {
  exceeded: "Dépassé",
  near: "Proche",
  ok: "Dans le budget",
  reached: "Atteint",
} as const;

const initialDeleteState: BudgetActionState = {
  fieldErrors: {},
  message: "",
  status: "idle",
  values: { category: "Alimentation", monthlyBudget: "" },
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

export function BudgetRow({ budget, currencyCode }: { budget: BudgetView; currencyCode: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteState, deleteAction] = useActionState(
    deleteCategoryBudget.bind(null, budget.id),
    initialDeleteState,
  );

  if (isEditing) {
    return (
      <li className="ui-panel-flat border-[var(--accent)] bg-[var(--accent-soft)] p-5 sm:p-6">
        <h3 className="font-display mb-5 text-2xl font-medium">Modifier {budget.category}</h3>
        <BudgetForm
          action={updateCategoryBudget.bind(null, budget.id)}
          availableCategories={[budget.category]}
          cancelEditing={() => setIsEditing(false)}
          defaultValues={{
            category: budget.category,
            monthlyBudget: formatCategoryBudgetCentsForInput(budget.monthlyBudgetCents),
          }}
          mode="edit"
        />
      </li>
    );
  }

  return (
    <li className="ui-panel-flat p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-extrabold">{budget.category}</h3>
            <span className={`ui-badge ${
              budget.status === "exceeded"
                ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                : budget.status === "near" || budget.status === "reached"
                  ? "bg-[var(--warning-soft)] text-[var(--warning)]"
                  : "bg-[var(--positive-soft)] text-[var(--positive)]"
            }`}>
              {statusLabels[budget.status]}
            </span>
          </div>
          <p className="font-amount mt-3 text-2xl font-extrabold">
            {formatCents(budget.spentCents, currencyCode)} <span className="text-base font-semibold text-[var(--ink-soft)]">sur {formatCents(budget.monthlyBudgetCents, currencyCode)}</span>
          </p>
          <p className={`mt-1 text-sm font-semibold ${budget.remainingCents < 0 ? "text-red-700" : "text-[var(--ink-soft)]"}`}>
            {formatCents(budget.remainingCents, currencyCode)} {budget.remainingCents < 0 ? "de dépassement" : "restants"}
          </p>
          <div
            aria-label={`${budget.percentageConsumed} % du budget ${budget.category} consommé`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={budget.progressPercent}
            className="ui-progress mt-4"
            role="progressbar"
          >
            <span
              className={budget.status === "exceeded" ? "is-danger" : budget.status === "near" || budget.status === "reached" ? "is-warning" : ""}
              style={{ width: `${budget.progressPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-bold text-[var(--ink-soft)]">{budget.percentageConsumed} % consommé</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="ui-button-quiet min-h-10 px-3 py-2 text-xs" onClick={() => setIsEditing(true)} type="button">
            Modifier
          </button>
          <button className="ui-button-danger min-h-10 px-3 py-2 text-xs" onClick={() => setIsConfirmingDelete(true)} type="button">
            Supprimer
          </button>
        </div>
      </div>

      {deleteState.status === "error" ? <p className="mt-3 text-xs text-red-700" role="alert">{deleteState.message}</p> : null}
      {isConfirmingDelete ? (
        <div className="ui-feedback-error mt-5 p-4" role="group">
          <p className="text-sm font-bold text-red-900">Supprimer le budget {budget.category} ?</p>
          <p className="mt-1 text-xs text-red-800">Les transactions restent enregistrées.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <form action={deleteAction}><DeleteButton /></form>
            <button className="ui-button-secondary min-h-10 px-3 py-2 text-xs" onClick={() => setIsConfirmingDelete(false)} type="button">Annuler</button>
          </div>
        </div>
      ) : null}
    </li>
  );
}
