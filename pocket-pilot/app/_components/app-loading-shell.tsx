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
          <div className="dashboard-layout">
            <div className="dashboard-kpi-grid">
              <div className="ui-skeleton h-44" />
              <div className="ui-skeleton h-44" />
              <div className="ui-skeleton h-44" />
              <div className="ui-skeleton h-44" />
            </div>
            <div className="dashboard-content-grid">
              <div className="ui-skeleton h-[36rem]" />
              <div className="ui-skeleton h-[36rem]" />
            </div>
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
