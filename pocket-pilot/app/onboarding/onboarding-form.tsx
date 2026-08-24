"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { saveProfile, type OnboardingActionState } from "@/app/onboarding/actions";
import { currencyOptions } from "@/lib/profile-options";

const initialState: OnboardingActionState = { status: "idle", message: "" };

function SaveButton() {
  const { pending } = useFormStatus();
  return <button className="ui-button-primary mt-2 min-h-12 px-5 py-3" disabled={pending} type="submit">{pending ? "Enregistrement…" : "Valider mon point de départ"}</button>;
}

export function OnboardingForm() {
  const [state, formAction] = useActionState(saveProfile, initialState);
  return (
    <form action={formAction} className="grid gap-6">
      {state.status === "error" ? <div aria-live="polite" className="ui-feedback-error" role="alert">{state.message}</div> : null}
      <label className="ui-label" htmlFor="currencyCode">Devise de référence
        <select className="ui-select" defaultValue="EUR" id="currencyCode" name="currencyCode" required>
          {currencyOptions.map((currency) => <option key={currency.value} value={currency.value}>{currency.label}</option>)}
        </select>
        <span className="text-xs font-normal leading-5 text-[var(--ink-soft)]">Une seule devise pour tout votre espace PocketPilot.</span>
      </label>
      <label className="ui-label" htmlFor="timeZone">Fuseau horaire
        <input className="ui-input" defaultValue="Europe/Paris" id="timeZone" list="time-zone-suggestions" maxLength={64} name="timeZone" placeholder="Europe/Paris" required type="text" />
        <datalist id="time-zone-suggestions"><option value="Europe/Paris" /><option value="Europe/London" /><option value="Europe/Brussels" /><option value="Africa/Algiers" /><option value="Africa/Casablanca" /><option value="America/Montreal" /><option value="America/New_York" /></datalist>
        <span className="text-xs font-normal leading-5 text-[var(--ink-soft)]">Utilisé pour dater correctement vos futures projections mensuelles.</span>
      </label>
      <SaveButton />
    </form>
  );
}
