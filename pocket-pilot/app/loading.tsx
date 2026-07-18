export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="dashboard-grid min-h-screen px-5 py-12 sm:px-8"
    >
      <div className="mx-auto w-full max-w-5xl">
        <div className="h-9 w-44 rounded-xl bg-[var(--sage)] motion-safe:animate-pulse" />
        <div className="mt-20 h-4 w-32 rounded bg-[var(--line)] motion-safe:animate-pulse" />
        <div className="mt-4 h-14 max-w-xl rounded-xl bg-[var(--line)] motion-safe:animate-pulse" />
        <div className="mt-10 h-72 rounded-[1.75rem] bg-[var(--forest)] opacity-90 motion-safe:animate-pulse" />
        <p className="sr-only">Chargement du tableau de bord…</p>
      </div>
    </main>
  );
}
