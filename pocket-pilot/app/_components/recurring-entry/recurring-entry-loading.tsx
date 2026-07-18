export function RecurringEntryLoading({ label }: { label: string }) {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="dashboard-grid min-h-screen px-5 py-10 sm:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="h-9 w-44 rounded-xl bg-[var(--sage)] motion-safe:animate-pulse" />
        <div className="mt-16 h-12 max-w-xl rounded-xl bg-[var(--line)] motion-safe:animate-pulse" />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="h-96 rounded-[1.75rem] bg-[var(--paper)] motion-safe:animate-pulse" />
          <div className="h-72 rounded-[1.75rem] bg-[var(--paper)] motion-safe:animate-pulse" />
        </div>
        <p className="sr-only">Chargement {label}…</p>
      </div>
    </main>
  );
}
