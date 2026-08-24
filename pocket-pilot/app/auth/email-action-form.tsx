"use client";

import { useActionState } from "react";
import Link from "next/link";

import {
  requestPasswordReset,
  resendConfirmationEmail,
  type AuthEmailActionState,
} from "@/app/auth/email-actions";

type EmailActionMode = "password-reset" | "confirmation-resend";

const initialState: AuthEmailActionState = {
  status: "idle",
  message: "",
  email: "",
};

export function EmailActionForm({ mode }: { mode: EmailActionMode }) {
  const action =
    mode === "password-reset"
      ? requestPasswordReset
      : resendConfirmationEmail;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const isSuccess = state.status === "success";
  const inputId = `${mode}-email`;

  return (
    <div className="grid gap-5">
      {state.status !== "idle" ? (
        <div
          aria-live="polite"
          className={
            isSuccess
              ? "ui-feedback-success"
              : "ui-feedback-error"
          }
          role={isSuccess ? "status" : "alert"}
        >
          {state.message}
        </div>
      ) : null}

      {!isSuccess ? (
        <form action={formAction} className="grid gap-5">
          <label className="ui-label" htmlFor={inputId}>
            Adresse email
            <input
              autoComplete="email"
              className="ui-input"
              defaultValue={state.email}
              disabled={isPending}
              id={inputId}
              maxLength={254}
              name="email"
              placeholder="vous@exemple.fr"
              required
              type="email"
            />
          </label>
          <button
            className="ui-button-primary min-h-12 px-5 py-3"
            disabled={isPending}
            type="submit"
          >
            {isPending
              ? "Envoi en cours…"
              : mode === "password-reset"
                ? "Recevoir le lien"
                : "Renvoyer l’email"}
          </button>
        </form>
      ) : null}

      <Link
        className="w-fit rounded-md text-sm font-bold text-[var(--forest)] underline decoration-[var(--accent)] underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--forest)]"
        href="/auth"
      >
        Retour à la connexion
      </Link>
    </div>
  );
}
