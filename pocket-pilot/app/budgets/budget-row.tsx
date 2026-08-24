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
      className="min-h-10 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-800 hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-wait disabled:opacity-65"
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
      <li className="rounded-[1.5rem] border border-[var(--forest)] bg-[var(--paper)] p-5 shadow-[0_14px_40px_rgba(23,53,47,0.08)] sm:p-6">
        <h3 className="font-display mb-5 text-2xl font-bold">Modifier {budget.category}</h3>
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
    <li className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--paper)] p-5 shadow-[0_14px_40px_rgba(23,53,47,0.06)] sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-2xl font-bold">{budget.category}</h3>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
              budget.status === "exceeded"
                ? "bg-red-100 text-red-800"
                : budget.status === "near" || budget.status === "reached"
                  ? "bg-amber-100 text-amber-900"
                  : "bg-[var(--sage)] text-[var(--forest)]"
            }`}>
              {statusLabels[budget.status]}
            </span>
          </div>
          <p className="mt-3 text-xl font-bold text-[var(--forest)]">
            {formatCents(budget.spentCents, currencyCode)} / {formatCents(budget.monthlyBudgetCents, currencyCode)}
          </p>
          <p className={`mt-1 text-sm font-semibold ${budget.remainingCents < 0 ? "text-red-700" : "text-[var(--ink-soft)]"}`}>
            {formatCents(budget.remainingCents, currencyCode)} {budget.remainingCents < 0 ? "de dépassement" : "restants"}
          </p>
          <div
            aria-label={`${budget.percentageConsumed} % du budget ${budget.category} consommé`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={budget.progressPercent}
            className="mt-4 h-2 overflow-hidden rounded-full bg-stone-200"
            role="progressbar"
          >
            <span
              className={`block h-full rounded-full ${budget.status === "exceeded" ? "bg-red-600" : budget.status === "near" || budget.status === "reached" ? "bg-amber-500" : "bg-[var(--forest)]"}`}
              style={{ width: `${budget.progressPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-bold text-[var(--ink-soft)]">{budget.percentageConsumed} % consommé</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="min-h-10 rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-bold hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)]" onClick={() => setIsEditing(true)} type="button">
            Modifier
          </button>
          <button className="min-h-10 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-800 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700" onClick={() => setIsConfirmingDelete(true)} type="button">
            Supprimer
          </button>
        </div>
      </div>

      {deleteState.status === "error" ? <p className="mt-3 text-xs text-red-700" role="alert">{deleteState.message}</p> : null}
      {isConfirmingDelete ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4" role="group">
          <p className="text-sm font-bold text-red-900">Supprimer le budget {budget.category} ?</p>
          <p className="mt-1 text-xs text-red-800">Les transactions restent enregistrées.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <form action={deleteAction}><DeleteButton /></form>
            <button className="min-h-10 rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-xs font-bold" onClick={() => setIsConfirmingDelete(false)} type="button">Annuler</button>
          </div>
        </div>
      ) : null}
    </li>
  );
}
