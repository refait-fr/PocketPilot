export default function BudgetsLoading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1440px] px-5 py-10 sm:px-8 lg:px-10">
      <div aria-label="Chargement des budgets" className="animate-pulse space-y-6" role="status">
        <div className="h-5 w-36 rounded bg-stone-200" />
        <div className="h-14 max-w-2xl rounded bg-stone-200" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-96 rounded-[1.75rem] bg-stone-200" />
          <div className="h-96 rounded-[1.75rem] bg-stone-200" />
        </div>
        <span className="sr-only">Chargement…</span>
      </div>
    </main>
  );
}
