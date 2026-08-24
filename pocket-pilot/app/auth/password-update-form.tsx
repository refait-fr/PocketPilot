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
          className={
            isSuccess
              ? "ui-feedback-success"
              : needsReauthentication || needsCurrentPassword
                ? "ui-feedback-warning"
                : "ui-feedback-error"
          }
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
          <label className="ui-label" htmlFor="new-password">
            Nouveau mot de passe
            <input
              aria-describedby={state.fieldErrors.password ? "new-password-error" : undefined}
              aria-invalid={Boolean(state.fieldErrors.password)}
              autoComplete="new-password"
              className="ui-input"
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

          <label className="ui-label" htmlFor="password-confirmation">
            Confirmer le nouveau mot de passe
            <input
              aria-describedby={state.fieldErrors.passwordConfirmation ? "password-confirmation-error" : undefined}
              aria-invalid={Boolean(state.fieldErrors.passwordConfirmation)}
              autoComplete="new-password"
              className="ui-input"
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
            <label className="ui-label" htmlFor="reauthentication-nonce">
              Code de sécurité
              <input
                aria-describedby={state.fieldErrors.nonce ? "reauthentication-nonce-error" : undefined}
                aria-invalid={Boolean(state.fieldErrors.nonce)}
                autoComplete="one-time-code"
                className="ui-input tracking-[0.2em]"
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
            <label className="ui-label" htmlFor="current-password">
              Mot de passe actuel
              <input
                aria-describedby={state.fieldErrors.currentPassword ? "current-password-error" : undefined}
                aria-invalid={Boolean(state.fieldErrors.currentPassword)}
                autoComplete="current-password"
                className="ui-input"
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
            className="ui-button-primary min-h-12 px-5 py-3"
            disabled={isPending}
            type="submit"
          >
            {isPending ? "Mise à jour…" : "Mettre à jour le mot de passe"}
          </button>
        </form>
      ) : null}

      {(isSuccess || isSessionInvalid) ? (
        <Link
          className="ui-button-primary w-fit"
          href={isSessionInvalid ? "/auth" : returnHref}
        >
          {isSessionInvalid ? "Revenir à la connexion" : returnLabel}
        </Link>
      ) : null}
    </div>
  );
}
