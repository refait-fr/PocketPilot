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

export function DeleteAccountForm() {
  const initialState: DeleteAccountActionState = { message: "", status: "idle" };
  const [state, formAction] = useActionState(deleteAccount, initialState);
  const inputId = useId();

  return (
    <form action={formAction} className="mt-6 grid max-w-lg gap-4">
      {state.status === "error" ? (
        <p aria-live="polite" className="ui-feedback-error" role="alert">{state.message}</p>
      ) : null}
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
      <div><DeleteButton /></div>
    </form>
  );
}
