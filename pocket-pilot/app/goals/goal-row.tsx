"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { deleteGoal, updateGoal } from "@/app/goals/actions";
import { GoalForm } from "@/app/goals/goal-form";
import type { GoalActionState, GoalView } from "@/app/goals/goal-types";
import { formatCents } from "@/lib/finance/format-cents";
import {
  FIRST_ALLOCATION_CONVENTION,
  formatSavingsGoalCentsForInput,
} from "@/lib/finance/savings-goal";

const initialDeleteState: GoalActionState = {
  status: "idle",
  message: "",
  fieldErrors: {},
  values: {
    name: "",
    targetAmount: "",
    currentAmount: "0,00",
    monthlyAllocation: "0,00",
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

export function GoalRow({
  currencyCode,
  goal,
}: {
  currencyCode: string;
  goal: GoalView;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const updateAction = updateGoal.bind(null, goal.id);
  const deleteAction = deleteGoal.bind(null, goal.id);
  const [deleteState, deleteFormAction] = useActionState(
    deleteAction,
    initialDeleteState,
  );

  if (isEditing) {
    return (
      <li className="rounded-[1.5rem] border border-[var(--forest)] bg-[var(--paper)] p-5 shadow-[0_14px_40px_rgba(23,53,47,0.08)] sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-2xl font-bold tracking-[-0.035em]">
            Modifier l’objectif
          </h3>
          <span className="rounded-full bg-[var(--sage)] px-3 py-1 text-xs font-bold text-[var(--forest)]">
            Édition
          </span>
        </div>
        <GoalForm
          action={updateAction}
          cancelEditing={() => setIsEditing(false)}
          defaultValues={{
            name: goal.name,
            targetAmount: formatSavingsGoalCentsForInput(
              goal.targetAmountCents,
            ),
            currentAmount: formatSavingsGoalCentsForInput(
              goal.currentAmountCents,
            ),
            monthlyAllocation: formatSavingsGoalCentsForInput(
              goal.monthlyAllocationCents,
            ),
          }}
          mode="edit"
        />
      </li>
    );
  }

  return (
    <li
      className={`overflow-hidden rounded-[1.5rem] border bg-[var(--paper)] shadow-[0_14px_40px_rgba(23,53,47,0.06)] ${
        goal.isReached ? "border-emerald-300" : "border-[var(--line)]"
      }`}
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="break-words font-display text-2xl font-bold tracking-[-0.035em] sm:text-3xl">
                {goal.name}
              </h3>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                  goal.isReached
                    ? "bg-emerald-100 text-emerald-900"
                    : "bg-[#f7d4c1] text-[#8b3518]"
                }`}
              >
                {goal.isReached ? "Atteint" : "En route"}
              </span>
            </div>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              {formatCents(goal.currentAmountCents, currencyCode)} sur {" "}
              {formatCents(goal.targetAmountCents, currencyCode)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <button
              className="min-h-10 rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-bold transition-all duration-200 ease-in-out hover:border-[var(--forest)] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)]"
              onClick={() => setIsEditing(true)}
              type="button"
            >
              Modifier / actualiser
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

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between gap-4 text-xs font-bold">
            <span>Progression</span>
            <span>{goal.progressPercent} %</span>
          </div>
          <div
            aria-label={`Progression de ${goal.name}`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={goal.progressPercent}
            className="h-3 overflow-hidden rounded-full bg-[#e7e2d7]"
            role="progressbar"
          >
            <div
              className={`h-full rounded-full transition-[width] duration-500 ease-out ${
                goal.isReached ? "bg-emerald-600" : "bg-[var(--accent)]"
              }`}
              style={{ width: `${goal.progressPercent}%` }}
            />
          </div>
        </div>

        <dl className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--line)] bg-[#f7f3ea] p-4">
            <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
              Restant
            </dt>
            <dd className="mt-2 break-words font-bold">
              {formatCents(goal.remainingAmountCents, currencyCode)}
            </dd>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-[#f7f3ea] p-4">
            <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
              Allocation / mois
            </dt>
            <dd className="mt-2 break-words font-bold">
              {formatCents(goal.monthlyAllocationCents, currencyCode)}
            </dd>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-[#f7f3ea] p-4">
            <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
              Estimation
            </dt>
            <dd className="mt-2 text-sm font-bold leading-5">
              {goal.isReached
                ? "Objectif atteint"
                : goal.estimatedMonths === null
                  ? "Aucune estimation"
                  : `${goal.estimatedMonths} mois · ${goal.estimatedCompletionLabel}`}
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-xs leading-5 text-[var(--ink-soft)]">
          {goal.isReached
            ? "L’allocation enregistrée n’est plus déduite du reste disponible."
            : goal.estimatedMonths === null
              ? "Définissez une allocation supérieure à 0 pour obtenir une estimation."
              : `Estimation non garantie. ${FIRST_ALLOCATION_CONVENTION}`}
        </p>

        {deleteState.status !== "idle" ? (
          <p
            aria-live="polite"
            className={`mt-3 text-xs leading-5 ${
              deleteState.status === "error"
                ? "text-red-700"
                : "text-emerald-800"
            }`}
            role={deleteState.status === "error" ? "alert" : "status"}
          >
            {deleteState.message}
          </p>
        ) : null}

        {isConfirmingDelete ? (
          <div
            aria-labelledby={`delete-goal-${goal.id}`}
            className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4"
            role="group"
          >
            <p
              className="text-sm font-bold text-red-900"
              id={`delete-goal-${goal.id}`}
            >
              Supprimer définitivement « {goal.name} » ?
            </p>
            <p className="mt-1 text-xs leading-5 text-red-800">
              Son allocation sera retirée du dashboard dès la suppression.
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
      </div>
    </li>
  );
}
