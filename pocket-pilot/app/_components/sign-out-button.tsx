"use client";

import { useFormStatus } from "react-dom";

import { AppIcon } from "@/app/_components/app-icon";

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      aria-label={compact ? "Déconnexion" : undefined}
      className={`ui-button-quiet min-h-10 w-full px-3 py-2 text-xs sm:w-auto ${compact ? "signout-compact" : ""}`}
      disabled={pending}
      type="submit"
    >
      {compact ? <AppIcon name="logout" /> : pending ? "Déconnexion…" : "Déconnexion"}
    </button>
  );
}
