"use client";

import { useActionState, useId, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  createShortcutToken,
  revokeShortcutToken,
  type ShortcutTokenActionState,
  type ShortcutTokenView,
} from "@/app/settings/actions";

const initialCreateState: ShortcutTokenActionState = {
  message: "",
  status: "idle",
  token: null,
  tokenName: "",
};

function CreateSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="ui-button-primary min-h-12 px-5 py-3" disabled={pending} type="submit">
      {pending ? "Création…" : "Créer le jeton"}
    </button>
  );
}

function RevokeSubmitButton({ revoked }: { revoked: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button className="ui-button-danger min-h-10 px-3 py-2 text-xs" disabled={pending || revoked} type="submit">
      {pending ? "Révocation…" : revoked ? "Révoqué" : "Révoquer"}
    </button>
  );
}

function formatTokenDate(value: string | null): string {
  if (!value) {
    return "Jamais utilisé";
  }

  return new Date(value).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function CreatedTokenNotice({ state }: { state: ShortcutTokenActionState }) {
  const [copied, setCopied] = useState(false);

  if (state.status !== "success" || !state.token) {
    return null;
  }

  async function copyToken() {
    try {
      await navigator.clipboard.writeText(state.token ?? "");
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="ui-feedback-success" role="status">
      <p aria-live="polite">{state.message}</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          aria-label={`Jeton ${state.tokenName}, à copier maintenant`}
          className="ui-input font-mono"
          onFocus={(event) => event.target.select()}
          readOnly
          type="text"
          value={state.token}
        />
        <button className="ui-button-secondary min-h-10 shrink-0 px-3 py-2 text-xs" onClick={copyToken} type="button">
          {copied ? "Copié !" : "Copier"}
        </button>
      </div>
    </div>
  );
}

function RevokeTokenForm({ token }: { token: ShortcutTokenView }) {
  const revokeAction = revokeShortcutToken.bind(null, token.id);
  const [state, formAction] = useActionState(revokeAction, {
    message: "",
    status: "idle" as const,
  });

  return (
    <form action={formAction} className="flex flex-col items-start gap-2">
      <RevokeSubmitButton revoked={token.revokedAt !== null} />
      {state.status !== "idle" ? (
        <p aria-live="polite" className={state.status === "error" ? "text-xs text-red-700" : "text-xs text-[var(--accent)]"} role={state.status === "error" ? "alert" : "status"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function ShortcutTokenManagement({ tokens }: { tokens: ShortcutTokenView[] }) {
  const [state, formAction] = useActionState(createShortcutToken, initialCreateState);
  const idPrefix = useId();

  return (
    <div className="grid gap-6">
      <form action={formAction} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="ui-label" htmlFor={`${idPrefix}-name`}>
          Nom du jeton
          <input
            className="ui-input"
            id={`${idPrefix}-name`}
            maxLength={50}
            name="name"
            placeholder="iPhone"
            required
            type="text"
          />
          <span className="text-xs font-normal text-[var(--ink-soft)]" id={`${idPrefix}-name-hint`}>
            Un jeton par appareil, pour pouvoir le révoquer séparément.
          </span>
        </label>
        <CreateSubmitButton />
        {state.status === "error" ? (
          <p aria-live="polite" className="ui-feedback-error sm:col-span-2" role="alert">{state.message}</p>
        ) : null}
      </form>

      <CreatedTokenNotice state={state} />

      {tokens.length === 0 ? (
        <p className="text-sm leading-6 text-[var(--ink-soft)]">Aucun jeton pour l’instant. Créez-en un, collez-le dans votre Raccourci, et le double-tap enregistrera sans ouvrir l’appli.</p>
      ) : (
        <ul className="grid gap-3">
          {tokens.map((token) => (
            <li className="ui-panel-flat flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between" key={token.id}>
              <div>
                <p className="text-sm font-bold">{token.name}</p>
                <p className="mt-1 text-xs text-[var(--ink-soft)]">
                  Créé le {formatTokenDate(token.createdAt)} · Dernier usage : {formatTokenDate(token.lastUsedAt)}
                  {token.revokedAt ? " · Révoqué" : ""}
                </p>
              </div>
              <RevokeTokenForm token={token} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
