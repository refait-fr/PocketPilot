import Link from "next/link";

export function IncomeTabs({
  active,
}: {
  active: "ponctuels" | "recurrents";
}) {
  return (
    <nav aria-label="Types de revenus" className="mb-5 flex flex-wrap gap-2">
      <Link
        aria-current={active === "recurrents" ? "page" : undefined}
        className={
          active === "recurrents"
            ? "ui-button-primary min-h-10 px-4 py-2 text-xs"
            : "ui-button-secondary min-h-10 px-4 py-2 text-xs"
        }
        href="/incomes"
      >
        Récurrents
      </Link>
      <Link
        aria-current={active === "ponctuels" ? "page" : undefined}
        className={
          active === "ponctuels"
            ? "ui-button-primary min-h-10 px-4 py-2 text-xs"
            : "ui-button-secondary min-h-10 px-4 py-2 text-xs"
        }
        href="/incomes/ponctuels"
      >
        Ponctuels
      </Link>
    </nav>
  );
}
