"use client";

import { useFormStatus } from "react-dom";

export function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="rounded-full border border-[var(--line)] px-3 py-2 text-xs font-semibold transition-all duration-200 ease-in-out hover:border-[var(--forest)] hover:bg-[var(--paper)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)] disabled:cursor-wait disabled:opacity-65 sm:px-4 sm:text-sm"
      disabled={pending}
      type="submit"
    >
      {pending ? "Déconnexion…" : "Déconnexion"}
    </button>
  );
}
