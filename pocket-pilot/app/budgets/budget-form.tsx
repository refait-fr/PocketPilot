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
      className="min-h-12 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--accent-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-dark)] disabled:cursor-wait disabled:opacity-65"
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
          className={`rounded-xl border px-4 py-3 text-sm ${
            state.status === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-900"
          }`}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </div>
      ) : null}

      <label className="grid gap-2 text-sm font-semibold" htmlFor={`${idPrefix}-category`}>
        Catégorie
        {mode === "create" ? (
          <select
            aria-describedby={state.fieldErrors.category ? `${idPrefix}-category-error` : undefined}
            aria-invalid={Boolean(state.fieldErrors.category)}
            className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 text-base font-normal outline-none focus:border-[var(--forest)] focus:ring-3 focus:ring-[#c9d5c380]"
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

      <label className="grid gap-2 text-sm font-semibold" htmlFor={`${idPrefix}-amount`}>
        Plafond mensuel
        <input
          aria-describedby={state.fieldErrors.monthlyBudget ? `${idPrefix}-amount-error` : `${idPrefix}-amount-hint`}
          aria-invalid={Boolean(state.fieldErrors.monthlyBudget)}
          className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 text-base font-normal outline-none focus:border-[var(--forest)] focus:ring-3 focus:ring-[#c9d5c380]"
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
            className="min-h-12 rounded-xl border border-[var(--line)] px-5 py-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)]"
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
