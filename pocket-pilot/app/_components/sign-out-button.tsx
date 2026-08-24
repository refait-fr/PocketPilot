"use client";

import { useFormStatus } from "react-dom";

export function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="ui-button-quiet min-h-10 w-full px-3 py-2 text-xs sm:w-auto"
      disabled={pending}
      type="submit"
    >
      {pending ? "Déconnexion…" : "Déconnexion"}
    </button>
  );
}
