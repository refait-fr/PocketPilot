"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { signIn, signUp, type AuthActionState } from "@/app/auth/actions";

type AuthMode = "login" | "signup";

const initialState: AuthActionState = {
  status: "idle",
  message: "",
  email: "",
};

function SubmitButton({ mode }: { mode: AuthMode }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="mt-2 flex min-h-12 w-full items-center justify-center rounded-xl bg-[var(--forest)] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#244c43] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)] disabled:cursor-wait disabled:opacity-70"
      disabled={pending}
      type="submit"
    >
      {pending
        ? mode === "login"
          ? "Connexion en cours…"
          : "Création du compte…"
        : mode === "login"
          ? "Se connecter"
          : "Créer mon compte"}
    </button>
  );
}

function Feedback({ state }: { state: AuthActionState }) {
  if (state.status === "idle") return null;

  return (
    <div
      aria-live="polite"
      className={`rounded-xl border px-4 py-3 text-sm leading-6 ${state.status === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}
      role={state.status === "error" ? "alert" : "status"}
    >
      {state.message}
    </div>
  );
}

function Fields({
  defaultEmail,
  mode,
}: {
  defaultEmail: string;
  mode: AuthMode;
}) {
  return (
    <>
      <label className="grid gap-2 text-sm font-semibold" htmlFor="email">
        Adresse email
        <input autoComplete="email" className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 text-base font-normal outline-none transition placeholder:text-stone-400 focus:border-[var(--forest)] focus:ring-3 focus:ring-[#c9d5c380]" defaultValue={defaultEmail} id="email" maxLength={254} name="email" placeholder="vous@exemple.fr" required type="email" />
      </label>
      <label className="grid gap-2 text-sm font-semibold" htmlFor="password">
        Mot de passe
        <input autoComplete={mode === "login" ? "current-password" : "new-password"} className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 text-base font-normal outline-none transition placeholder:text-stone-400 focus:border-[var(--forest)] focus:ring-3 focus:ring-[#c9d5c380]" id="password" maxLength={72} minLength={8} name="password" placeholder="8 caractères minimum" required type="password" />
      </label>
    </>
  );
}

export function AuthForm({ initialNotice }: { initialNotice?: { kind: "error" | "success"; message: string } }) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [loginState, loginAction] = useActionState(signIn, initialState);
  const [signupState, signupAction] = useActionState(signUp, initialState);
  const state = mode === "login" ? loginState : signupState;

  return (
    <div>
      <div
        aria-label="Choisir entre connexion et inscription"
        className="mb-8 grid grid-cols-2 rounded-xl bg-[#e8e6dc] p-1"
        role="group"
      >
        {(["login", "signup"] as const).map((item) => (
          <button
            aria-pressed={mode === item}
            className={`rounded-lg px-3 py-2.5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)] ${mode === item ? "bg-[var(--paper)] text-[var(--forest)] shadow-sm" : "text-[var(--ink-soft)] hover:text-[var(--forest)]"}`}
            key={item}
            onClick={() => setMode(item)}
            type="button"
          >
            {item === "login" ? "Connexion" : "Inscription"}
          </button>
        ))}
      </div>

      {initialNotice ? (
        <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${initialNotice.kind === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`} role={initialNotice.kind === "error" ? "alert" : "status"}>{initialNotice.message}</div>
      ) : null}

      <form action={mode === "login" ? loginAction : signupAction} className="grid gap-5">
        <Feedback state={state} />
        <Fields defaultEmail={state.email} mode={mode} />
        {mode === "signup" ? <p className="-mt-2 text-xs leading-5 text-[var(--ink-soft)]">Un lien de confirmation vous sera envoyé avant la première connexion.</p> : null}
        <SubmitButton mode={mode} />
      </form>
    </div>
  );
}
