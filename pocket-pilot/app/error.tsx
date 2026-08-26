"use client";

import type { ErrorInfo } from "next/error";

import { PocketPilotLogo } from "@/app/_components/pocketpilot-logo";

export default function ErrorPage({ retry }: ErrorInfo) {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--canvas)] px-5 py-12">
      <section className="ui-panel w-full max-w-xl p-8 text-center sm:p-12">
        <span className="brand-mark mx-auto">
          <PocketPilotLogo decorative={false} size={36} />
        </span>
        <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.17em] text-[var(--accent)]">
          Chargement interrompu
        </p>
        <h1 className="font-display mt-3 text-4xl font-medium tracking-[-0.045em]">
          PocketPilot n’est pas disponible pour le moment.
        </h1>
        <p className="mt-4 leading-7 text-[var(--ink-soft)]">
          PocketPilot ne peut pas charger votre profil ou vos données. Rien
          n’a été modifié. Réessayez dans un instant.
        </p>
        <button
          className="ui-button-primary mt-8"
          onClick={retry}
          type="button"
        >
          Recharger les données
        </button>
      </section>
    </main>
  );
}
