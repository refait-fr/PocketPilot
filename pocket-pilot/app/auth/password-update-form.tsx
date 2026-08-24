"use client";

import { useActionState } from "react";
import Link from "next/link";

import {
  updatePassword,
  type PasswordActionState,
} from "@/app/auth/password-actions";

const initialState: PasswordActionState = {
  status: "idle",
  message: "",
  fieldErrors: {},
  requirements: { currentPassword: false, nonce: false },
};

type PasswordUpdateFormProps = {
  returnHref: string;
  returnLabel: string;
};

export function PasswordUpdateForm({
  returnHref,
  returnLabel,
}: PasswordUpdateFormProps) {
  const [state, formAction, isPending] = useActionState(
    updatePassword,
    initialState,
  );
  const isSuccess = state.status === "success";
  const isSessionInvalid = state.status === "session-invalid";
  const needsReauthentication = state.requirements.nonce;
  const needsCurrentPassword = state.requirements.currentPassword;

  return (
    <div className="grid gap-5">
      {state.status !== "idle" ? (
        <div
          aria-live="polite"
          className={`rounded-xl border px-4 py-3 text-sm leading-6 ${
            isSuccess
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : needsReauthentication || needsCurrentPassword
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-red-200 bg-red-50 text-red-800"
          }`}
          role={
            isSuccess || needsReauthentication || needsCurrentPassword
              ? "status"
              : "alert"
          }
        >
          {state.message}
        </div>
      ) : null}

      {!isSuccess && !isSessionInvalid ? (
        <form action={formAction} className="grid gap-5">
          <label className="grid gap-2 text-sm font-semibold" htmlFor="new-password">
            Nouveau mot de passe
            <input
              aria-describedby={state.fieldErrors.password ? "new-password-error" : undefined}
              aria-invalid={Boolean(state.fieldErrors.password)}
              autoComplete="new-password"
              className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 text-base font-normal outline-none transition focus:border-[var(--forest)] focus:ring-3 focus:ring-[#c9d5c380]"
              disabled={isPending}
              id="new-password"
              maxLength={72}
              minLength={8}
              name="password"
              required
              type="password"
            />
            {state.fieldErrors.password ? (
              <span className="text-sm font-normal text-red-700" id="new-password-error">
                {state.fieldErrors.password}
              </span>
            ) : null}
          </label>

          <label className="grid gap-2 text-sm font-semibold" htmlFor="password-confirmation">
            Confirmer le nouveau mot de passe
            <input
              aria-describedby={state.fieldErrors.passwordConfirmation ? "password-confirmation-error" : undefined}
              aria-invalid={Boolean(state.fieldErrors.passwordConfirmation)}
              autoComplete="new-password"
              className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 text-base font-normal outline-none transition focus:border-[var(--forest)] focus:ring-3 focus:ring-[#c9d5c380]"
              disabled={isPending}
              id="password-confirmation"
              maxLength={72}
              minLength={8}
              name="passwordConfirmation"
              required
              type="password"
            />
            {state.fieldErrors.passwordConfirmation ? (
              <span className="text-sm font-normal text-red-700" id="password-confirmation-error">
                {state.fieldErrors.passwordConfirmation}
              </span>
            ) : null}
          </label>

          {needsReauthentication ? (
            <label className="grid gap-2 text-sm font-semibold" htmlFor="reauthentication-nonce">
              Code de sécurité
              <input
                aria-describedby={state.fieldErrors.nonce ? "reauthentication-nonce-error" : undefined}
                aria-invalid={Boolean(state.fieldErrors.nonce)}
                autoComplete="one-time-code"
                className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 text-base font-normal tracking-[0.2em] outline-none transition focus:border-[var(--forest)] focus:ring-3 focus:ring-[#c9d5c380]"
                disabled={isPending}
                id="reauthentication-nonce"
                inputMode="numeric"
                maxLength={6}
                name="nonce"
                pattern="[0-9]{6}"
                required
                type="text"
              />
              {state.fieldErrors.nonce ? (
                <span className="text-sm font-normal text-red-700" id="reauthentication-nonce-error">
                  {state.fieldErrors.nonce}
                </span>
              ) : null}
            </label>
          ) : null}

          {needsCurrentPassword ? (
            <label className="grid gap-2 text-sm font-semibold" htmlFor="current-password">
              Mot de passe actuel
              <input
                aria-describedby={state.fieldErrors.currentPassword ? "current-password-error" : undefined}
                aria-invalid={Boolean(state.fieldErrors.currentPassword)}
                autoComplete="current-password"
                className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 text-base font-normal outline-none transition focus:border-[var(--forest)] focus:ring-3 focus:ring-[#c9d5c380]"
                disabled={isPending}
                id="current-password"
                maxLength={72}
                name="currentPassword"
                required
                type="password"
              />
              {state.fieldErrors.currentPassword ? (
                <span className="text-sm font-normal text-red-700" id="current-password-error">
                  {state.fieldErrors.currentPassword}
                </span>
              ) : null}
            </label>
          ) : null}

          <button
            className="flex min-h-12 items-center justify-center rounded-xl bg-[var(--forest)] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#244c43] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)] disabled:cursor-wait disabled:opacity-70"
            disabled={isPending}
            type="submit"
          >
            {isPending ? "Mise à jour…" : "Mettre à jour le mot de passe"}
          </button>
        </form>
      ) : null}

      {(isSuccess || isSessionInvalid) ? (
        <Link
          className="w-fit rounded-xl bg-[var(--forest)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#244c43] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--forest)]"
          href={isSessionInvalid ? "/auth" : returnHref}
        >
          {isSessionInvalid ? "Revenir à la connexion" : returnLabel}
        </Link>
      ) : null}
    </div>
  );
}
