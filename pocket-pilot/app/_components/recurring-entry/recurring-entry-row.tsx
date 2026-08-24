"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  recurringEntryCopy,
  type RecurringEntryKind,
} from "@/app/_components/recurring-entry/recurring-entry-copy";
import { RecurringEntryForm } from "@/app/_components/recurring-entry/recurring-entry-form";
import type {
  RecurringEntryActionState,
  RecurringEntryDeleteAction,
  RecurringEntryToggleAction,
  RecurringEntryUpdateAction,
  RecurringEntryView,
} from "@/app/_components/recurring-entry/recurring-entry-types";
import { formatCents } from "@/lib/finance/format-cents";
import { formatCentsForInput } from "@/lib/finance/recurring-entry-input";

const initialMutationState: RecurringEntryActionState = {
  status: "idle",
  message: "",
  fieldErrors: {},
  values: { label: "", monthlyAmount: "" },
};

function PendingButton({
  children,
  pendingLabel,
  tone = "neutral",
}: {
  children: React.ReactNode;
  pendingLabel: string;
  tone?: "danger" | "neutral";
}) {
  const { pending } = useFormStatus();

  return (
    <button
      className={`min-h-10 px-3 py-2 text-xs ${
        tone === "danger"
          ? "ui-button-danger"
          : "ui-button-secondary"
      }`}
      disabled={pending}
      type="submit"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

function MutationFeedback({ state }: { state: RecurringEntryActionState }) {
  if (state.status === "idle") {
    return null;
  }

  return (
    <p
      aria-live="polite"
      className={`mt-3 text-xs leading-5 ${
        state.status === "error" ? "text-red-700" : "text-emerald-800"
      }`}
      role={state.status === "error" ? "alert" : "status"}
    >
      {state.message}
    </p>
  );
}

export function RecurringEntryRow({
  currencyCode,
  deleteEntry,
  entry,
  kind,
  setEntryActive,
  updateEntry,
}: {
  currencyCode: string;
  deleteEntry: RecurringEntryDeleteAction;
  entry: RecurringEntryView;
  kind: RecurringEntryKind;
  setEntryActive: RecurringEntryToggleAction;
  updateEntry: RecurringEntryUpdateAction;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const updateAction = updateEntry.bind(null, entry.id);
  const toggleAction = setEntryActive.bind(null, entry.id, !entry.isActive);
  const deleteAction = deleteEntry.bind(null, entry.id);
  const [toggleState, toggleFormAction] = useActionState(
    toggleAction,
    initialMutationState,
  );
  const [deleteState, deleteFormAction] = useActionState(
    deleteAction,
    initialMutationState,
  );
  const copy = recurringEntryCopy[kind];

  if (isEditing) {
    return (
      <li className="bg-[var(--accent-soft)] p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h3 className="font-display text-2xl font-medium tracking-[-0.035em]">
            {copy.editTitle}
          </h3>
          <span className="ui-badge bg-white text-[var(--accent-dark)]">
            Édition
          </span>
        </div>
        <RecurringEntryForm
          action={updateAction}
          cancelEditing={() => setIsEditing(false)}
          defaultValues={{
            label: entry.label,
            monthlyAmount: formatCentsForInput(entry.amountCents),
          }}
          kind={kind}
          mode="edit"
        />
      </li>
    );
  }

  return (
    <li
      className={`bg-[var(--paper)] p-5 transition-opacity sm:p-6 ${
        entry.isActive
          ? ""
          : "opacity-65"
      }`}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-words text-base font-extrabold">
              {entry.label}
            </h3>
            <span
              className={`ui-badge ${
                entry.isActive
                  ? "bg-[var(--positive-soft)] text-[var(--positive)]"
                  : "bg-[var(--surface-muted)] text-[var(--ink-soft)]"
              }`}
            >
              {entry.isActive ? "Actif" : "En pause"}
            </span>
          </div>
          <p className="font-amount mt-2 break-words text-2xl font-extrabold text-[var(--foreground)]">
            {formatCents(entry.amountCents, currencyCode)}
            <span className="ml-1 text-sm font-normal text-[var(--ink-soft)]">
              / mois
            </span>
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
          <form action={toggleFormAction}>
            <PendingButton pendingLabel="Mise à jour…">
              {entry.isActive ? "Désactiver" : "Activer"}
            </PendingButton>
          </form>
          <button
            className="ui-button-danger min-h-10 px-3 py-2 text-xs"
            onClick={() => setIsConfirmingDelete(true)}
            type="button"
          >
            Supprimer
          </button>
        </div>
      </div>

      <MutationFeedback state={toggleState} />
      <MutationFeedback state={deleteState} />

      {isConfirmingDelete ? (
        <div
          aria-labelledby={`delete-${entry.id}`}
          className="ui-feedback-error mt-5 p-4"
          role="group"
        >
          <p className="text-sm font-bold text-red-900" id={`delete-${entry.id}`}>
            Supprimer définitivement « {entry.label} » ?
          </p>
          <p className="mt-1 text-xs leading-5 text-red-800">
            {copy.deleteDashboardNote}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <form action={deleteFormAction}>
              <PendingButton pendingLabel="Suppression…" tone="danger">
                Confirmer la suppression
              </PendingButton>
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
