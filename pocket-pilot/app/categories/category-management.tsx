"use client";

import { useActionState, useId, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  createUserCategory,
  deleteUserCategory,
  renameUserCategory,
  type CategoryActionState,
} from "@/app/categories/actions";
import { TRANSACTION_CATEGORIES } from "@/lib/transactions/categories";

export type CategoryUsage = {
  budgets: number;
  transactions: number;
};

const initialCategoryState: CategoryActionState = {
  fieldErrors: {},
  message: "",
  status: "idle",
};

function CreateSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="ui-button-primary min-h-12 px-5 py-3" disabled={pending} type="submit">
      {pending ? "Ajout…" : "Ajouter la catégorie"}
    </button>
  );
}

function RenameSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="ui-button-primary min-h-10 px-3 py-2 text-xs" disabled={pending} type="submit">
      {pending ? "Enregistrement…" : "Renommer"}
    </button>
  );
}

function DeleteSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="ui-button-danger min-h-10 px-3 py-2 text-xs" disabled={pending} type="submit">
      {pending ? "Suppression…" : "Confirmer la suppression"}
    </button>
  );
}

function CreateCategoryForm() {
  const [state, formAction] = useActionState(createUserCategory, initialCategoryState);
  const idPrefix = useId();

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
      <label className="ui-label" htmlFor={`${idPrefix}-name`}>
        Nouvelle catégorie
        <input
          aria-describedby={state.fieldErrors.name ? `${idPrefix}-name-error` : `${idPrefix}-name-hint`}
          aria-invalid={Boolean(state.fieldErrors.name)}
          className="ui-input"
          id={`${idPrefix}-name`}
          maxLength={50}
          name="name"
          placeholder="Cadeaux, Animaux…"
          required
          type="text"
        />
        <span
          className={state.fieldErrors.name ? "text-xs text-red-700" : "text-xs font-normal text-[var(--ink-soft)]"}
          id={state.fieldErrors.name ? `${idPrefix}-name-error` : `${idPrefix}-name-hint`}
        >
          {state.fieldErrors.name ?? "50 caractères maximum, sans doublon avec les catégories existantes."}
        </span>
      </label>
      <CreateSubmitButton />
      {state.status !== "idle" ? (
        <p aria-live="polite" className={state.status === "error" ? "ui-feedback-error sm:col-span-2" : "ui-feedback-success sm:col-span-2"} role={state.status === "error" ? "alert" : "status"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

function CustomCategoryRow({
  name,
  usage,
}: {
  name: string;
  usage: CategoryUsage;
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [renameState, renameFormAction] = useActionState(
    renameUserCategory.bind(null, name),
    initialCategoryState,
  );
  const [deleteState, deleteFormAction] = useActionState(
    deleteUserCategory.bind(null, name),
    initialCategoryState,
  );
  const idPrefix = useId();
  const isUsed = usage.transactions > 0 || usage.budgets > 0;

  return (
    <li className="rounded-xl border border-[var(--line)] bg-white px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{name}</p>
          <p className="text-xs text-[var(--ink-soft)]">
            {isUsed
              ? `Utilisée par ${usage.transactions} transaction${usage.transactions > 1 ? "s" : ""} et ${usage.budgets} budget${usage.budgets > 1 ? "s" : ""}.`
              : "Aucune transaction ni budget ne l’utilise."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="ui-button-secondary min-h-10 px-3 py-2 text-xs"
            onClick={() => {
              setIsRenaming((current) => !current);
              setIsConfirmingDelete(false);
            }}
            type="button"
          >
            {isRenaming ? "Fermer" : "Renommer"}
          </button>
          <button
            className="ui-button-quiet min-h-10 px-3 py-2 text-xs"
            onClick={() => {
              setIsConfirmingDelete((current) => !current);
              setIsRenaming(false);
            }}
            type="button"
          >
            {isConfirmingDelete ? "Annuler" : "Supprimer"}
          </button>
        </div>
      </div>

      {isRenaming ? (
        <form action={renameFormAction} className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="ui-label" htmlFor={`${idPrefix}-rename`}>
            Nouveau nom
            <input
              aria-invalid={Boolean(renameState.fieldErrors.name)}
              className="ui-input"
              defaultValue={name}
              id={`${idPrefix}-rename`}
              maxLength={50}
              name="name"
              required
              type="text"
            />
            {renameState.fieldErrors.name ? (
              <span className="text-xs text-red-700">{renameState.fieldErrors.name}</span>
            ) : (
              <span className="text-xs font-normal text-[var(--ink-soft)]">L’historique suivra le nouveau nom.</span>
            )}
          </label>
          <RenameSubmitButton />
          {renameState.status !== "idle" ? (
            <p aria-live="polite" className={renameState.status === "error" ? "ui-feedback-error sm:col-span-2" : "ui-feedback-success sm:col-span-2"} role={renameState.status === "error" ? "alert" : "status"}>
              {renameState.message}
            </p>
          ) : null}
        </form>
      ) : null}

      {isConfirmingDelete ? (
        <form action={deleteFormAction} className="mt-3">
          <p className="text-xs leading-5 text-[var(--ink-soft)]">
            {isUsed
              ? "Cette catégorie est encore utilisée : la suppression sera refusée tant que des lignes la référencent."
              : "La suppression est définitive."}
          </p>
          <div className="mt-2">
            <DeleteSubmitButton />
          </div>
          {deleteState.status !== "idle" ? (
            <p aria-live="polite" className={deleteState.status === "error" ? "ui-feedback-error mt-2" : "ui-feedback-success mt-2"} role={deleteState.status === "error" ? "alert" : "status"}>
              {deleteState.message}
            </p>
          ) : null}
        </form>
      ) : null}
    </li>
  );
}

export function CategoryManagement({
  customCategories,
  usageByCategory,
}: {
  customCategories: readonly string[];
  usageByCategory: Record<string, CategoryUsage>;
}) {
  return (
    <div className="grid gap-6">
      <div>
        <p className="ui-kicker">Huit catégories fournies par défaut</p>
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Catégories par défaut">
          {TRANSACTION_CATEGORIES.map((category) => (
            <li key={category}>
              <span className="ui-badge ui-badge-positive">{category}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs leading-5 text-[var(--ink-soft)]">Les catégories par défaut ne peuvent pas être renommées ni supprimées.</p>
      </div>

      <CreateCategoryForm />

      <div>
        <p className="ui-kicker">Vos catégories ({customCategories.length})</p>
        {customCategories.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-[var(--line)] px-4 py-5 text-sm leading-6 text-[var(--ink-soft)]">
            Aucune catégorie personnelle pour le moment. Ajoutez-en une ci-dessus pour l’utiliser dans vos transactions, budgets et imports.
          </p>
        ) : (
          <ul className="mt-3 grid gap-2">
            {customCategories.map((name) => (
              <CustomCategoryRow
                key={name}
                name={name}
                usage={usageByCategory[name] ?? { budgets: 0, transactions: 0 }}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
