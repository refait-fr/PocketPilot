"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { useFormStatus } from "react-dom";

import {
  recurringEntryCopy,
  type RecurringEntryKind,
} from "@/app/_components/recurring-entry/recurring-entry-copy";
import type {
  RecurringEntryActionState,
  RecurringEntryFormAction,
} from "@/app/_components/recurring-entry/recurring-entry-types";
import { MAX_RECURRING_ENTRY_LABEL_LENGTH } from "@/lib/finance/recurring-entry-input";

type RecurringEntryFormProps = {
  action: RecurringEntryFormAction;
  cancelEditing?: () => void;
  defaultValues?: { label: string; monthlyAmount: string };
  kind: RecurringEntryKind;
  mode: "create" | "edit";
};

function SubmitButton({
  kind,
  mode,
}: {
  kind: RecurringEntryKind;
  mode: RecurringEntryFormProps["mode"];
}) {
  const { pending } = useFormStatus();

  return (
    <button
      className="ui-button-primary min-h-12 px-5 py-3"
      disabled={pending}
      type="submit"
    >
      {pending
        ? "Enregistrement…"
        : mode === "create"
          ? recurringEntryCopy[kind].createButton
          : "Enregistrer les modifications"}
    </button>
  );
}

export function RecurringEntryForm({
  action,
  cancelEditing,
  defaultValues = { label: "", monthlyAmount: "" },
  kind,
  mode,
}: RecurringEntryFormProps) {
  const initialState: RecurringEntryActionState = {
    status: "idle",
    message: "",
    fieldErrors: {},
    values: defaultValues,
  };
  const [state, formAction] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const idPrefix = useId();
  const labelId = `${idPrefix}-label`;
  const amountId = `${idPrefix}-amount`;

  useEffect(() => {
    if (mode === "create" && state.status === "success") {
      formRef.current?.reset();
    }
  }, [mode, state]);

  return (
    <form action={formAction} className="grid gap-5" ref={formRef}>
      {state.status !== "idle" ? (
        <div
          aria-live="polite"
          className={
            state.status === "error"
              ? "ui-feedback-error"
              : "ui-feedback-success"
          }
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </div>
      ) : null}

      <label className="ui-label" htmlFor={labelId}>
        Libellé
        <input
          aria-describedby={
            state.fieldErrors.label ? `${labelId}-error` : `${labelId}-hint`
          }
          aria-invalid={Boolean(state.fieldErrors.label)}
          className="ui-input"
          defaultValue={state.values.label}
          id={labelId}
          maxLength={MAX_RECURRING_ENTRY_LABEL_LENGTH}
          name="label"
          placeholder={recurringEntryCopy[kind].labelPlaceholder}
          required
          type="text"
        />
        <span
          className={
            state.fieldErrors.label
              ? "text-xs text-red-700"
              : "text-xs font-normal text-[var(--ink-soft)]"
          }
          id={state.fieldErrors.label ? `${labelId}-error` : `${labelId}-hint`}
        >
          {state.fieldErrors.label ??
            `${MAX_RECURRING_ENTRY_LABEL_LENGTH} caractères maximum.`}
        </span>
      </label>

      <label className="ui-label" htmlFor={amountId}>
        Montant mensuel
        <div className="relative">
          <input
            aria-describedby={
              state.fieldErrors.monthlyAmount
                ? `${amountId}-error`
                : `${amountId}-hint`
            }
            aria-invalid={Boolean(state.fieldErrors.monthlyAmount)}
            className="ui-input pr-16"
            defaultValue={state.values.monthlyAmount}
            id={amountId}
            inputMode="decimal"
            maxLength={32}
            name="monthlyAmount"
            placeholder="650,00"
            required
            type="text"
          />
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-bold tracking-[0.1em] text-[var(--ink-soft)]">
            / mois
          </span>
        </div>
        <span
          className={
            state.fieldErrors.monthlyAmount
              ? "text-xs text-red-700"
              : "text-xs font-normal text-[var(--ink-soft)]"
          }
          id={
            state.fieldErrors.monthlyAmount
              ? `${amountId}-error`
              : `${amountId}-hint`
          }
        >
          {state.fieldErrors.monthlyAmount ??
            "Deux décimales maximum, converties en centimes."}
        </span>
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SubmitButton kind={kind} mode={mode} />
        {cancelEditing ? (
          <button
            className="ui-button-secondary min-h-12 px-5 py-3"
            onClick={cancelEditing}
            type="button"
          >
            Annuler
          </button>
        ) : null}
      </div>
    </form>
  );
}
