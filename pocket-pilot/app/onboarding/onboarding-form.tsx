"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveProfile, type OnboardingActionState } from "@/app/onboarding/actions";
import { currencyOptions } from "@/lib/profile-options";

const initialState: OnboardingActionState = { status: "idle", message: "" };

function SaveButton() {
  const { pending } = useFormStatus();
  return <button className="ui-button-primary mt-2 min-h-12 px-5 py-3" disabled={pending} type="submit">{pending ? "Enregistrement…" : "Valider mon point de départ"}</button>;
}

function detectLocalTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Paris";
  } catch {
    return "Europe/Paris";
  }
}

export function OnboardingForm() {
  const [state, formAction] = useActionState(saveProfile, initialState);
  const [timeZone, setTimeZone] = useState(detectLocalTimeZone);
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
        <input className="ui-input" id="timeZone" list="time-zone-suggestions" maxLength={64} name="timeZone" onChange={(event) => setTimeZone(event.target.value)} placeholder="Europe/Paris" required type="text" value={timeZone} />
        <datalist id="time-zone-suggestions"><option value="Europe/Paris" /><option value="Europe/London" /><option value="Europe/Brussels" /><option value="Africa/Algiers" /><option value="Africa/Casablanca" /><option value="America/Montreal" /><option value="America/New_York" /><option value="America/Guadeloupe" /><option value="America/Cayenne" /><option value="Indian/Reunion" /><option value="Pacific/Noumea" /><option value="Asia/Ho_Chi_Minh" /></datalist>
        <span className="text-xs font-normal leading-5 text-[var(--ink-soft)]">Détecté depuis votre appareil, modifiable. Utilisé pour dater correctement vos projections mensuelles.</span>
      </label>
      <SaveButton />
    </form>
  );
}
