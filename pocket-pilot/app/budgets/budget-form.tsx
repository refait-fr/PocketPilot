"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { useFormStatus } from "react-dom";

import type {
  BudgetActionState,
  BudgetFormAction,
} from "@/app/budgets/budget-types";
import type { TransactionCategory } from "@/lib/transactions/categories";

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
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
          ? "Ajouter ce budget"
          : "Enregistrer le plafond"}
    </button>
  );
}

export function BudgetForm({
  action,
  availableCategories,
  cancelEditing,
  defaultValues,
  mode,
}: {
  action: BudgetFormAction;
  availableCategories: readonly TransactionCategory[];
  cancelEditing?: () => void;
  defaultValues: BudgetActionState["values"];
  mode: "create" | "edit";
}) {
  const [state, formAction] = useActionState<BudgetActionState, FormData>(
    action,
    { fieldErrors: {}, message: "", status: "idle", values: defaultValues },
  );
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

      <label className="ui-label" htmlFor={`${idPrefix}-category`}>
        Catégorie
        {mode === "create" ? (
          <select
            aria-describedby={state.fieldErrors.category ? `${idPrefix}-category-error` : undefined}
            aria-invalid={Boolean(state.fieldErrors.category)}
            className="ui-select"
            defaultValue={state.values.category}
            id={`${idPrefix}-category`}
            name="category"
            required
          >
            {availableCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        ) : (
          <>
            <input name="category" type="hidden" value={state.values.category} />
            <span className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-base font-normal">
              {state.values.category}
            </span>
          </>
        )}
        {state.fieldErrors.category ? (
          <span className="text-xs text-red-700" id={`${idPrefix}-category-error`}>
            {state.fieldErrors.category}
          </span>
        ) : null}
      </label>

      <label className="ui-label" htmlFor={`${idPrefix}-amount`}>
        Plafond mensuel
        <input
          aria-describedby={state.fieldErrors.monthlyBudget ? `${idPrefix}-amount-error` : `${idPrefix}-amount-hint`}
          aria-invalid={Boolean(state.fieldErrors.monthlyBudget)}
          className="ui-input"
          defaultValue={state.values.monthlyBudget}
          id={`${idPrefix}-amount`}
          inputMode="decimal"
          maxLength={32}
          name="monthlyBudget"
          placeholder="100,00"
          required
          type="text"
        />
        <span
          className={state.fieldErrors.monthlyBudget ? "text-xs text-red-700" : "text-xs font-normal text-[var(--ink-soft)]"}
          id={state.fieldErrors.monthlyBudget ? `${idPrefix}-amount-error` : `${idPrefix}-amount-hint`}
        >
          {state.fieldErrors.monthlyBudget ?? "Montant strictement positif, avec deux décimales maximum."}
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
