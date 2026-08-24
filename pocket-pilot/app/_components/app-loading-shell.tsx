export function AppLoadingShell({
  label,
  variant = "management",
}: {
  label: string;
  variant?: "dashboard" | "management" | "purchase";
}) {
  return (
    <main aria-busy="true" aria-live="polite" className="app-frame min-h-screen">
      <div className="border-b border-[var(--line)] px-5 py-4">
        <div className="mx-auto flex max-w-[94rem] items-center justify-between gap-4">
          <div className="ui-skeleton h-9 w-40" />
          <div className="ui-skeleton hidden h-10 w-[34rem] rounded-full lg:block" />
          <div className="ui-skeleton h-10 w-20 rounded-full" />
        </div>
      </div>
      <div className="app-main">
        <div className="page-heading">
          <div>
            <div className="ui-skeleton h-3 w-28" />
            <div className="ui-skeleton mt-4 h-14 max-w-2xl" />
          </div>
          <div className="ui-skeleton h-14 w-full max-w-md" />
        </div>
        {variant === "dashboard" ? (
          <div className="cockpit-grid">
            <div className="ui-skeleton h-[25rem] lg:col-span-7 xl:col-span-8" />
            <div className="ui-skeleton h-[25rem] lg:col-span-5 xl:col-span-4" />
            <div className="ui-skeleton h-72 lg:col-span-6 xl:col-span-5" />
            <div className="ui-skeleton h-72 lg:col-span-6 xl:col-span-3" />
            <div className="ui-skeleton h-72 lg:col-span-12 xl:col-span-4" />
          </div>
        ) : (
          <div className={variant === "purchase" ? "purchase-layout" : "management-grid"}>
            <div className="ui-skeleton h-[34rem] rounded-[var(--radius-lg)]" />
            <div className="ui-skeleton h-[28rem] rounded-[var(--radius-lg)]" />
          </div>
        )}
        <p className="sr-only">Chargement {label}…</p>
      </div>
    </main>
  );
}
