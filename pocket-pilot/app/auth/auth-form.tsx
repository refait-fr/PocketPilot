"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";

import { signIn, signUp, type AuthActionState } from "@/app/auth/actions";
import type { AuthNotice } from "@/lib/auth/auth-notice";

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
      className="ui-button-primary mt-2 min-h-12 w-full px-5 py-3"
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
      className={state.status === "error" ? "ui-feedback-error" : "ui-feedback-success"}
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
      <label className="ui-label" htmlFor="email">
        Adresse email
        <input autoComplete="email" className="ui-input" defaultValue={defaultEmail} id="email" maxLength={254} name="email" placeholder="vous@exemple.fr" required type="email" />
      </label>
      <label className="ui-label" htmlFor="password">
        Mot de passe
        <input autoComplete={mode === "login" ? "current-password" : "new-password"} className="ui-input" id="password" maxLength={72} minLength={8} name="password" placeholder="8 caractères minimum" required type="password" />
      </label>
    </>
  );
}

export function AuthForm({ initialNotice }: { initialNotice?: AuthNotice }) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [loginState, loginAction] = useActionState(signIn, initialState);
  const [signupState, signupAction] = useActionState(signUp, initialState);
  const state = mode === "login" ? loginState : signupState;

  return (
    <div>
      <div
        aria-label="Choisir entre connexion et inscription"
        className="mb-8 grid grid-cols-2 rounded-xl bg-[var(--surface-strong)] p-1"
        role="group"
      >
        {(["login", "signup"] as const).map((item) => (
          <button
            aria-pressed={mode === item}
            className={`min-h-11 rounded-lg px-3 py-2.5 text-sm font-extrabold transition ${mode === item ? "bg-[var(--paper)] text-[var(--foreground)] shadow-sm" : "text-[var(--ink-soft)] hover:text-[var(--foreground)]"}`}
            key={item}
            onClick={() => setMode(item)}
            type="button"
          >
            {item === "login" ? "Connexion" : "Inscription"}
          </button>
        ))}
      </div>

      {initialNotice ? (
        <div className={`mb-5 ${initialNotice.kind === "error" ? "ui-feedback-error" : "ui-feedback-success"}`} role={initialNotice.kind === "error" ? "alert" : "status"}>{initialNotice.message}</div>
      ) : null}

      <form action={mode === "login" ? loginAction : signupAction} className="grid gap-5">
        <Feedback state={state} />
        <Fields defaultEmail={state.email} mode={mode} />
        {mode === "signup" ? <p className="-mt-2 text-xs leading-5 text-[var(--ink-soft)]">Un lien de confirmation vous sera envoyé avant la première connexion.</p> : null}
        <SubmitButton mode={mode} />
      </form>
      <div className="mt-5 flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:justify-between">
        {mode === "login" ? (
          <Link
            className="w-fit rounded-md font-bold text-[var(--forest)] underline decoration-[var(--accent)] underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--forest)]"
            href="/auth/forgot-password"
          >
            Mot de passe oublié ?
          </Link>
        ) : null}
        <Link
          className="w-fit rounded-md font-bold text-[var(--forest)] underline decoration-[var(--accent)] underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--forest)]"
          href="/auth/resend-confirmation"
        >
          Renvoyer l’email de confirmation
        </Link>
      </div>
    </div>
  );
}
