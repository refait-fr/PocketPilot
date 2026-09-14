"use client";

import { useActionState, useId } from "react";
import { useFormStatus } from "react-dom";

import {
  deleteAccount,
  type DeleteAccountActionState,
} from "@/app/settings/actions";

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button className="ui-button-danger min-h-12 px-5 py-3" disabled={pending} type="submit">
      {pending ? "Suppression…" : "Supprimer définitivement mon compte"}
    </button>
  );
}

export function DeleteAccountForm({
  dataSummary,
}: {
  dataSummary: readonly { count: number; label: string }[];
}) {
  const initialState: DeleteAccountActionState = { message: "", status: "idle" };
  const [state, formAction] = useActionState(deleteAccount, initialState);
  const inputId = useId();

  return (
    <form action={formAction} className="mt-6 grid max-w-lg gap-4">
      {state.status === "error" ? (
        <p aria-live="polite" className="ui-feedback-error" role="alert">{state.message}</p>
      ) : null}
      {dataSummary.length > 0 ? (
        <p className="text-sm leading-6 text-[var(--ink-soft)]">
          Seront supprimés :{" "}
          {dataSummary.map(({ count, label }) => `${count} ${label}`).join(", ")}.
        </p>
      ) : (
        <p className="text-sm leading-6 text-[var(--ink-soft)]">
          Aucune donnée financière enregistrée.
        </p>
      )}
      <label className="ui-label" htmlFor={inputId}>
        Saisissez SUPPRIMER pour confirmer
        <input
          autoComplete="off"
          className="ui-input"
          id={inputId}
          name="confirmation"
          pattern="SUPPRIMER"
          required
          type="text"
        />
      </label>
      <label className="ui-label" htmlFor={`${inputId}-password`}>
        Saisissez votre mot de passe pour valider
        <input
          autoComplete="current-password"
          className="ui-input"
          id={`${inputId}-password`}
          name="password"
          required
          type="password"
        />
      </label>
      <div><DeleteButton /></div>
    </form>
  );
}
