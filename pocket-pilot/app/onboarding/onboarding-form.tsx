"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { saveProfile, type OnboardingActionState } from "@/app/onboarding/actions";
import { currencyOptions } from "@/lib/profile-options";

const initialState: OnboardingActionState = { status: "idle", message: "" };

function SaveButton() {
  const { pending } = useFormStatus();
  return <button className="mt-2 min-h-12 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[var(--accent-dark)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-dark)] disabled:cursor-wait disabled:opacity-70" disabled={pending} type="submit">{pending ? "Enregistrement…" : "Valider mon point de départ"}</button>;
}

export function OnboardingForm() {
  const [state, formAction] = useActionState(saveProfile, initialState);
  return (
    <form action={formAction} className="grid gap-6">
      {state.status === "error" ? <div aria-live="polite" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800" role="alert">{state.message}</div> : null}
      <label className="grid gap-2 text-sm font-semibold" htmlFor="currencyCode">Devise de référence
        <select className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 text-base font-normal outline-none transition focus:border-[var(--forest)] focus:ring-3 focus:ring-[#c9d5c380]" defaultValue="EUR" id="currencyCode" name="currencyCode" required>
          {currencyOptions.map((currency) => <option key={currency.value} value={currency.value}>{currency.label}</option>)}
        </select>
        <span className="text-xs font-normal leading-5 text-[var(--ink-soft)]">Une seule devise pour tout votre espace PocketPilot.</span>
      </label>
      <label className="grid gap-2 text-sm font-semibold" htmlFor="timeZone">Fuseau horaire
        <input className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 text-base font-normal outline-none transition placeholder:text-stone-400 focus:border-[var(--forest)] focus:ring-3 focus:ring-[#c9d5c380]" defaultValue="Europe/Paris" id="timeZone" list="time-zone-suggestions" maxLength={64} name="timeZone" placeholder="Europe/Paris" required type="text" />
        <datalist id="time-zone-suggestions"><option value="Europe/Paris" /><option value="Europe/London" /><option value="Europe/Brussels" /><option value="Africa/Algiers" /><option value="Africa/Casablanca" /><option value="America/Montreal" /><option value="America/New_York" /></datalist>
        <span className="text-xs font-normal leading-5 text-[var(--ink-soft)]">Utilisé pour dater correctement vos futures projections mensuelles.</span>
      </label>
      <SaveButton />
    </form>
  );
}
