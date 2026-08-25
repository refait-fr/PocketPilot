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
      className="ui-button-danger min-h-10 px-3 py-2 text-xs"
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
      <li className="ui-panel-flat border-[var(--accent)] bg-[var(--accent-soft)] p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-xl font-semibold tracking-[-0.03em]">
            Modifier l’objectif
          </h3>
          <span className="ui-badge bg-white text-[var(--accent-dark)]">
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
      className={`ui-panel-flat overflow-hidden ${
        goal.isReached ? "border-[#a7d6c7]" : ""
      }`}
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="break-words font-display text-xl font-semibold tracking-[-0.03em]">
                {goal.name}
              </h3>
              <span
                className={`ui-badge ${
                  goal.isReached
                    ? "bg-[var(--positive-soft)] text-[var(--positive)]"
                    : "bg-[var(--accent-soft)] text-[var(--accent-dark)]"
                }`}
              >
                {goal.isReached ? "Atteint" : "En route"}
              </span>
            </div>
            <p className="goal-remaining font-amount mt-3">
              <span>Il vous manque</span>
              <strong>{formatCents(goal.remainingAmountCents, currencyCode)}</strong>
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <button
              className="ui-button-quiet min-h-10 px-3 py-2 text-xs"
              onClick={() => setIsEditing(true)}
              type="button"
            >
              Modifier / actualiser
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

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-4 text-xs font-bold">
            <span>Progression</span>
            <span>{goal.progressPercent} %</span>
          </div>
          <div
            aria-label={`Progression de ${goal.name}`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={goal.progressPercent}
            className="ui-progress h-3"
            role="progressbar"
          >
            <div
              className="transition-[width] duration-500 ease-out"
              style={{ width: `${goal.progressPercent}%` }}
            />
          </div>
        </div>

        <p className="goal-guidance">
          {goal.isReached
            ? `Objectif atteint avec ${formatCents(goal.currentAmountCents, currencyCode)} épargnés.`
            : goal.estimatedMonths === null
              ? `${formatCents(goal.remainingAmountCents, currencyCode)} restants. Ajoutez une allocation mensuelle pour obtenir une estimation.`
              : `${formatCents(goal.remainingAmountCents, currencyCode)} restants · ${formatCents(goal.monthlyAllocationCents, currencyCode)} par mois · estimation ${goal.estimatedCompletionLabel}.`}
        </p>

        <dl className="goal-metrics mt-5 grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl bg-[var(--surface-muted)] p-3.5">
            <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
              Déjà épargné / cible
            </dt>
            <dd className="mt-2 break-words font-bold">
              {formatCents(goal.currentAmountCents, currencyCode)} / {formatCents(goal.targetAmountCents, currencyCode)}
            </dd>
          </div>
          <div className="rounded-xl bg-[var(--surface-muted)] p-3.5">
            <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
              Allocation / mois
            </dt>
            <dd className="mt-2 break-words font-bold">
              {formatCents(goal.monthlyAllocationCents, currencyCode)}
            </dd>
          </div>
          <div className="goal-estimate rounded-xl bg-[var(--surface-muted)] p-3.5">
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
            className="ui-feedback-error mt-5 p-4"
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
                className="ui-button-secondary min-h-10 px-3 py-2 text-xs"
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
