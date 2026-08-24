"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { useFormStatus } from "react-dom";

import type {
  TransactionActionState,
  TransactionFormAction,
} from "@/app/transactions/transaction-types";
import { TRANSACTION_CATEGORIES } from "@/lib/transactions/categories";
import {
  MAX_TRANSACTION_DESCRIPTION_LENGTH,
  type TransactionInputValues,
} from "@/lib/transactions/transaction-input";

type TransactionFormProps = {
  action: TransactionFormAction;
  cancelEditing?: () => void;
  defaultValues: TransactionInputValues;
  mode: "create" | "edit";
};

function SubmitButton({ mode }: { mode: TransactionFormProps["mode"] }) {
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
          ? "Ajouter la transaction"
          : "Enregistrer les modifications"}
    </button>
  );
}

export function TransactionForm({
  action,
  cancelEditing,
  defaultValues,
  mode,
}: TransactionFormProps) {
  const initialState: TransactionActionState = {
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
          placeholder="25,90"
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

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="ui-label" htmlFor={`${idPrefix}-category`}>
          Catégorie
          <select
            aria-describedby={state.fieldErrors.category ? `${idPrefix}-category-error` : undefined}
            aria-invalid={Boolean(state.fieldErrors.category)}
            className="ui-select"
            defaultValue={state.values.category}
            id={`${idPrefix}-category`}
            name="category"
            required
          >
            {TRANSACTION_CATEGORIES.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {state.fieldErrors.category ? (
            <span className="text-xs text-red-700" id={`${idPrefix}-category-error`}>
              {state.fieldErrors.category}
            </span>
          ) : null}
        </label>

        <label className="ui-label" htmlFor={`${idPrefix}-date`}>
          Date
          <input
            aria-describedby={state.fieldErrors.transactionDate ? `${idPrefix}-date-error` : undefined}
            aria-invalid={Boolean(state.fieldErrors.transactionDate)}
            className="ui-input"
            defaultValue={state.values.transactionDate}
            id={`${idPrefix}-date`}
            name="transactionDate"
            required
            type="date"
          />
          {state.fieldErrors.transactionDate ? (
            <span className="text-xs text-red-700" id={`${idPrefix}-date-error`}>
              {state.fieldErrors.transactionDate}
            </span>
          ) : null}
        </label>
      </div>

      <label className="ui-label" htmlFor={`${idPrefix}-description`}>
        Description <span className="font-normal text-[var(--ink-soft)]">(facultative)</span>
        <input
          aria-describedby={state.fieldErrors.description ? `${idPrefix}-description-error` : `${idPrefix}-description-hint`}
          aria-invalid={Boolean(state.fieldErrors.description)}
          className="ui-input"
          defaultValue={state.values.description}
          id={`${idPrefix}-description`}
          maxLength={MAX_TRANSACTION_DESCRIPTION_LENGTH}
          name="description"
          placeholder="Courses, billet de train…"
          type="text"
        />
        <span
          className={state.fieldErrors.description ? "text-xs text-red-700" : "text-xs font-normal text-[var(--ink-soft)]"}
          id={state.fieldErrors.description ? `${idPrefix}-description-error` : `${idPrefix}-description-hint`}
        >
          {state.fieldErrors.description ?? `${MAX_TRANSACTION_DESCRIPTION_LENGTH} caractères maximum.`}
        </span>
      </label>

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
