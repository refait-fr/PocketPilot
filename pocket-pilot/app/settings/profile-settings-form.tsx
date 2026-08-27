"use client";

import { useActionState, useId } from "react";
import { useFormStatus } from "react-dom";

import {
  updateProfileSettings,
  type ProfileSettingsActionState,
} from "@/app/settings/actions";
import {
  currencyOptions,
  type CurrencyCode,
  MAX_TIME_ZONE_LENGTH,
} from "@/lib/profile-options";

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button className="ui-button-primary min-h-12 px-5 py-3" disabled={pending} type="submit">
      {pending ? "Enregistrement…" : "Enregistrer les préférences"}
    </button>
  );
}

export function ProfileSettingsForm({
  canChangeCurrency,
  currencyCode,
  timeZone,
}: {
  canChangeCurrency: boolean;
  currencyCode: CurrencyCode;
  timeZone: string;
}) {
  const initialState: ProfileSettingsActionState = {
    message: "",
    status: "idle",
    values: { currencyCode, timeZone },
  };
  const [state, formAction] = useActionState(
    updateProfileSettings,
    initialState,
  );
  const idPrefix = useId();

  return (
    <form action={formAction} className="grid gap-5">
      {state.status !== "idle" ? (
        <p
          aria-live="polite"
          className={state.status === "error" ? "ui-feedback-error" : "ui-feedback-success"}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.message}
        </p>
      ) : null}

      <label className="ui-label" htmlFor={`${idPrefix}-currency`}>
        Devise
        <select
          className="ui-select"
          defaultValue={state.values.currencyCode}
          disabled={!canChangeCurrency}
          id={`${idPrefix}-currency`}
          name="currencyCode"
        >
          {currencyOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        {!canChangeCurrency ? (
          <>
            <input name="currencyCode" type="hidden" value={currencyCode} />
            <span className="text-xs font-normal leading-5 text-[var(--ink-soft)]">
              La devise est verrouillée car des données financières existent. Aucun montant n’est converti automatiquement.
            </span>
          </>
        ) : (
          <span className="text-xs font-normal leading-5 text-[var(--ink-soft)]">
            La devise peut être choisie tant que le compte ne contient aucune donnée financière.
          </span>
        )}
      </label>

      <label className="ui-label" htmlFor={`${idPrefix}-timezone`}>
        Fuseau horaire
        <input
          className="ui-input"
          defaultValue={state.values.timeZone}
          id={`${idPrefix}-timezone`}
          list={`${idPrefix}-timezone-options`}
          maxLength={MAX_TIME_ZONE_LENGTH}
          name="timeZone"
          required
          type="text"
        />
        <datalist id={`${idPrefix}-timezone-options`}>
          <option value="Europe/Paris" />
          <option value="America/New_York" />
          <option value="UTC" />
        </datalist>
        <span className="text-xs font-normal leading-5 text-[var(--ink-soft)]">
          Le mois courant et la date maximale des transactions utilisent ce fuseau horaire.
        </span>
      </label>

      <div><SaveButton /></div>
    </form>
  );
}
