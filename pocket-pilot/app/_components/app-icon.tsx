type AppIconName =
  | "budget"
  | "check"
  | "expense"
  | "goal"
  | "home"
  | "income"
  | "menu"
  | "settings"
  | "transaction"
  | "wallet";

const paths: Record<AppIconName, React.ReactNode> = {
  budget: <><path d="M4 6.5h16v11H4z" /><path d="M8 10v4M12 9v6M16 11v2" /></>,
  check: <><path d="m5 12 4 4L19 6" /></>,
  expense: <><path d="M5 7h14v12H5z" /><path d="M8 7V5h8v2M8 11h8M8 15h5" /></>,
  goal: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><path d="M12 4V2M20 12h2" /></>,
  home: <><path d="m4 11 8-7 8 7" /><path d="M6.5 10v9h11v-9M10 19v-5h4v5" /></>,
  income: <><path d="M12 3v13" /><path d="m7 11 5 5 5-5M5 20h14" /></>,
  menu: <><path d="M5 7h14M5 12h14M5 17h14" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" /></>,
  transaction: <><path d="M4 7h13" /><path d="m14 4 3 3-3 3M20 17H7" /><path d="m10 14-3 3 3 3" /></>,
  wallet: <><path d="M4 6.5h14a2 2 0 0 1 2 2v9.5H6a2 2 0 0 1-2-2z" /><path d="M4 8V6a2 2 0 0 1 2-2h11v2.5M15 12h5" /></>,
};

export function AppIcon({
  className,
  name,
}: {
  className?: string;
  name: AppIconName;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
    >
      {paths[name]}
    </svg>
  );
}
