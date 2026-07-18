"use client";

import { useActionState, useId } from "react";
import { useFormStatus } from "react-dom";

import type {
  GoalActionState,
  GoalFormAction,
} from "@/app/goals/goal-types";
import {
  FIRST_ALLOCATION_CONVENTION,
  MAX_SAVINGS_GOAL_NAME_LENGTH,
  type SavingsGoalInputValues,
} from "@/lib/finance/savings-goal";

type GoalFormProps = {
  action: GoalFormAction;
  cancelEditing?: () => void;
  defaultValues?: SavingsGoalInputValues;
  mode: "create" | "edit";
};

type AmountFieldName = Exclude<keyof SavingsGoalInputValues, "name">;

const amountFieldCopy: Record<
  AmountFieldName,
  { label: string; hint: string; placeholder: string }
> = {
  targetAmount: {
    label: "Montant cible",
    hint: "Strictement supérieur à 0.",
    placeholder: "2500,00",
  },
  currentAmount: {
    label: "Déjà épargné",
    hint: "Entre 0 et le montant cible.",
    placeholder: "0,00",
  },
  monthlyAllocation: {
    label: "Allocation mensuelle",
    hint: "0 est autorisé, mais empêche toute estimation.",
    placeholder: "150,00",
  },
};

function SubmitButton({ mode }: { mode: GoalFormProps["mode"] }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="min-h-12 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-[var(--accent-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-dark)] disabled:cursor-wait disabled:opacity-65"
      disabled={pending}
      type="submit"
    >
      {pending
        ? "Enregistrement…"
        : mode === "create"
          ? "Créer cet objectif"
          : "Enregistrer les modifications"}
    </button>
  );
}

function AmountField({
  defaultValue,
  error,
  fieldName,
  id,
}: {
  defaultValue: string;
  error?: string;
  fieldName: AmountFieldName;
  id: string;
}) {
  const copy = amountFieldCopy[fieldName];

  return (
    <label
      className="grid min-w-0 gap-2 text-sm font-semibold"
      htmlFor={id}
    >
      {copy.label}
      <input
        aria-describedby={error ? `${id}-error` : `${id}-hint`}
        aria-invalid={Boolean(error)}
        className="min-h-12 w-full min-w-0 rounded-xl border border-[var(--line)] bg-white px-4 text-base font-normal outline-none transition-all duration-200 ease-in-out placeholder:text-stone-400 focus:border-[var(--forest)] focus:ring-3 focus:ring-[#c9d5c380]"
        defaultValue={defaultValue}
        id={id}
        inputMode="decimal"
        maxLength={32}
        name={fieldName}
        placeholder={copy.placeholder}
        required
        type="text"
      />
      <span
        className={
          error
            ? "text-xs text-red-700"
            : "text-xs font-normal text-[var(--ink-soft)]"
        }
        id={error ? `${id}-error` : `${id}-hint`}
      >
        {error ?? copy.hint}
      </span>
    </label>
  );
}

export function GoalForm({
  action,
  cancelEditing,
  defaultValues = {
    name: "",
    targetAmount: "",
    currentAmount: "0,00",
    monthlyAllocation: "0,00",
  },
  mode,
}: GoalFormProps) {
  const initialState: GoalActionState = {
    status: "idle",
    message: "",
    fieldErrors: {},
    values: defaultValues,
  };
  const [state, formAction] = useActionState(action, initialState);
  const idPrefix = useId();
  const nameId = `${idPrefix}-name`;
  const amountFields: AmountFieldName[] = [
    "targetAmount",
    "currentAmount",
    "monthlyAllocation",
  ];

  return (
    <form action={formAction} className="grid gap-5">
      {state.status !== "idle" ? (
        <div
          aria-live="polite"
          className={`rounded-xl border px-4 py-3 text-sm leading-6 ${
            state.status === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-900"
          }`}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </div>
      ) : null}

      <label className="grid gap-2 text-sm font-semibold" htmlFor={nameId}>
        Nom de l’objectif
        <input
          aria-describedby={
            state.fieldErrors.name ? `${nameId}-error` : `${nameId}-hint`
          }
          aria-invalid={Boolean(state.fieldErrors.name)}
          className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 text-base font-normal outline-none transition-all duration-200 ease-in-out placeholder:text-stone-400 focus:border-[var(--forest)] focus:ring-3 focus:ring-[#c9d5c380]"
          defaultValue={state.values.name}
          id={nameId}
          maxLength={MAX_SAVINGS_GOAL_NAME_LENGTH}
          name="name"
          placeholder="Permis, voyage, fonds d’urgence…"
          required
          type="text"
        />
        <span
          className={
            state.fieldErrors.name
              ? "text-xs text-red-700"
              : "text-xs font-normal text-[var(--ink-soft)]"
          }
          id={state.fieldErrors.name ? `${nameId}-error` : `${nameId}-hint`}
        >
          {state.fieldErrors.name ??
            `${MAX_SAVINGS_GOAL_NAME_LENGTH} caractères maximum.`}
        </span>
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        {amountFields.slice(0, 2).map((fieldName) => (
          <AmountField
            defaultValue={state.values[fieldName]}
            error={state.fieldErrors[fieldName]}
            fieldName={fieldName}
            id={`${idPrefix}-${fieldName}`}
            key={fieldName}
          />
        ))}
      </div>

      <AmountField
        defaultValue={state.values.monthlyAllocation}
        error={state.fieldErrors.monthlyAllocation}
        fieldName="monthlyAllocation"
        id={`${idPrefix}-monthlyAllocation`}
      />

      <p className="rounded-xl border border-[var(--line)] bg-[#f5f1e7] px-4 py-3 text-xs leading-5 text-[var(--ink-soft)]">
        Hypothèse de projection : {FIRST_ALLOCATION_CONVENTION.toLowerCase()}{" "}
        L’estimation reste indicative et ne constitue pas une garantie.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SubmitButton mode={mode} />
        {cancelEditing ? (
          <button
            className="min-h-12 rounded-xl border border-[var(--line)] px-5 py-3 text-sm font-bold transition-all duration-200 ease-in-out hover:border-[var(--forest)] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)]"
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
