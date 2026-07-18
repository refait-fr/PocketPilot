"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="paper-grid grid min-h-screen place-items-center px-5 py-12">
      <section className="w-full max-w-xl rounded-[1.75rem] border border-[var(--line)] bg-[var(--paper)] p-8 text-center shadow-[0_20px_70px_rgba(23,53,47,0.1)] sm:p-12">
        <span className="mx-auto grid size-11 place-items-center rounded-full bg-[var(--forest)] font-display text-xl font-bold text-white">
          P
        </span>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">
          Chargement interrompu
        </p>
        <h1 className="font-display mt-3 text-4xl tracking-[-0.045em]">
          PocketPilot n’est pas disponible pour le moment.
        </h1>
        <p className="mt-4 leading-7 text-[var(--ink-soft)]">
          Vos données n’ont pas été modifiées. Réessayez dans un instant.
        </p>
        <button
          className="mt-8 rounded-xl bg-[var(--forest)] px-5 py-3 text-sm font-bold text-white transition-all duration-200 ease-in-out hover:bg-[#214b42] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--forest)]"
          onClick={reset}
          type="button"
        >
          Réessayer
        </button>
      </section>
    </main>
  );
}
