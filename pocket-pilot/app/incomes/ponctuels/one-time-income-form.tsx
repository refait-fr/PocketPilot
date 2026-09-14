"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { useFormStatus } from "react-dom";

import type {
  OneTimeIncomeActionState,
  OneTimeIncomeFormAction,
} from "@/app/incomes/one-time-types";
import {
  MAX_ONE_TIME_INCOME_LABEL_LENGTH,
  type OneTimeIncomeInputValues,
} from "@/lib/finance/one-time-income-input";

type OneTimeIncomeFormProps = {
  action: OneTimeIncomeFormAction;
  cancelEditing?: () => void;
  defaultValues: OneTimeIncomeInputValues;
  maximumIncomeDate: string;
  mode: "create" | "edit";
};

function SubmitButton({ mode }: { mode: OneTimeIncomeFormProps["mode"] }) {
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
          ? "Ajouter le revenu"
          : "Enregistrer les modifications"}
    </button>
  );
}

export function OneTimeIncomeForm({
  action,
  cancelEditing,
  defaultValues,
  maximumIncomeDate,
  mode,
}: OneTimeIncomeFormProps) {
  const initialState: OneTimeIncomeActionState = {
    fieldErrors: {},
    message: "",
    status: "idle",
    values: defaultValues,
  };
  const [state, formAction] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const idPrefix = useId();

  useEffect(() => {
    if (mode === "create" && state.status === "success") {
      formRef.current?.reset();
    }
  }, [mode, state.status]);

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

      <label className="ui-label" htmlFor={`${idPrefix}-label`}>
        Libellé
        <input
          aria-describedby={state.fieldErrors.label ? `${idPrefix}-label-error` : `${idPrefix}-label-hint`}
          aria-invalid={Boolean(state.fieldErrors.label)}
          className="ui-input"
          defaultValue={state.values.label}
          id={`${idPrefix}-label`}
          maxLength={MAX_ONE_TIME_INCOME_LABEL_LENGTH}
          name="label"
          placeholder="Dépôt banque, prime…"
          required
          type="text"
        />
        <span
          className={state.fieldErrors.label ? "text-xs text-red-700" : "text-xs font-normal text-[var(--ink-soft)]"}
          id={state.fieldErrors.label ? `${idPrefix}-label-error` : `${idPrefix}-label-hint`}
        >
          {state.fieldErrors.label ?? `${MAX_ONE_TIME_INCOME_LABEL_LENGTH} caractères maximum.`}
        </span>
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="ui-label" htmlFor={`${idPrefix}-amount`}>
          Montant
          <input
            aria-describedby={state.fieldErrors.amount ? `${idPrefix}-amount-error` : `${idPrefix}-amount-hint`}
            aria-invalid={Boolean(state.fieldErrors.amount)}
            className="ui-input"
            defaultValue={state.values.amount}
            id={`${idPrefix}-amount`}
            inputMode="decimal"
            maxLength={32}
            name="amount"
            placeholder="20,00"
            required
            type="text"
          />
          <span
            className={state.fieldErrors.amount ? "text-xs text-red-700" : "text-xs font-normal text-[var(--ink-soft)]"}
            id={state.fieldErrors.amount ? `${idPrefix}-amount-error` : `${idPrefix}-amount-hint`}
          >
            {state.fieldErrors.amount ?? "Deux décimales maximum, converties en centimes."}
          </span>
        </label>

        <label className="ui-label" htmlFor={`${idPrefix}-date`}>
          Date
          <input
            aria-describedby={state.fieldErrors.incomeDate ? `${idPrefix}-date-error` : undefined}
            aria-invalid={Boolean(state.fieldErrors.incomeDate)}
            className="ui-input"
            defaultValue={state.values.incomeDate}
            id={`${idPrefix}-date`}
            name="incomeDate"
            max={maximumIncomeDate}
            required
            type="date"
          />
          {state.fieldErrors.incomeDate ? (
            <span className="text-xs text-red-700" id={`${idPrefix}-date-error`}>
              {state.fieldErrors.incomeDate}
            </span>
          ) : null}
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SubmitButton mode={mode} />
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
