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
          className={`rounded-xl border px-4 py-3 text-sm leading-6 ${
            isSuccess
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
          role={isSuccess ? "status" : "alert"}
        >
          {state.message}
        </div>
      ) : null}

      {!isSuccess ? (
        <form action={formAction} className="grid gap-5">
          <label className="grid gap-2 text-sm font-semibold" htmlFor={inputId}>
            Adresse email
            <input
              autoComplete="email"
              className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 text-base font-normal outline-none transition placeholder:text-stone-400 focus:border-[var(--forest)] focus:ring-3 focus:ring-[#c9d5c380]"
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
            className="flex min-h-12 items-center justify-center rounded-xl bg-[var(--forest)] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#244c43] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)] disabled:cursor-wait disabled:opacity-70"
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
