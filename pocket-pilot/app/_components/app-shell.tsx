import type { ReactNode } from "react";
import Link from "next/link";

import { SignOutButton } from "@/app/_components/sign-out-button";
import { signOut } from "@/app/auth/actions";
import type { AuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";

const desktopNavigation = [
  { href: "/", label: "Vue d’ensemble" },
  { href: "/transactions", label: "Transactions" },
  { href: "/budgets", label: "Budgets" },
  { href: "/incomes", label: "Revenus" },
  { href: "/expenses", label: "Charges" },
  { href: "/goals", label: "Objectifs" },
] as const;

const mobileNavigation = [
  { href: "/", label: "Accueil", marker: "⌂" },
  { href: "/transactions", label: "Transactions", marker: "↗" },
  { href: "/budgets", label: "Budgets", marker: "◫" },
  { href: "/goals", label: "Objectifs", marker: "◎" },
  { href: "/purchase-checker", label: "Achat", marker: "✓" },
] as const;

const secondaryNavigation = [
  { href: "/incomes", label: "Revenus" },
  { href: "/expenses", label: "Charges" },
  { href: "/goals", label: "Objectifs" },
  { href: "/settings", label: "Paramètres" },
] as const;

type AppPath =
  | (typeof desktopNavigation)[number]["href"]
  | (typeof mobileNavigation)[number]["href"]
  | (typeof secondaryNavigation)[number]["href"];

type AppShellProps = {
  activePath?: AppPath;
  children: ReactNode;
  description: string;
  eyebrow: string;
  profile: AuthenticatedProfile;
  title: string;
};

function Brand() {
  return (
    <Link className="brand-lockup" href="/" aria-label="PocketPilot, accueil">
      <span className="brand-mark" aria-hidden="true">P</span>
      <span className="font-display text-[1.45rem] font-semibold tracking-[-0.05em]">PocketPilot</span>
    </Link>
  );
}

function DesktopNavigation({ activePath }: { activePath?: AppPath }) {
  return (
    <nav aria-label="Navigation principale" className="hidden min-w-0 flex-1 justify-center xl:flex">
      <ul className="nav-capsule">
        {desktopNavigation.map((item) => (
          <li key={item.href}>
            <Link
              aria-current={item.href === activePath ? "page" : undefined}
              className={item.href === activePath ? "is-active" : ""}
              href={item.href}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function MobileMenu({
  activePath,
  currencyCode,
}: {
  activePath?: AppPath;
  currencyCode: string;
}) {
  return (
    <details className="relative xl:hidden">
      <summary className="ui-menu-trigger">
        <span>Menu</span>
        <span aria-hidden="true">＋</span>
      </summary>
      <div className="mobile-menu-panel">
        <div className="flex items-center justify-between border-b border-[var(--line)] px-3 pb-3">
          <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--ink-soft)]">Planifier</span>
          <span className="ui-badge bg-[var(--surface-muted)] text-[var(--ink-soft)]">{currencyCode}</span>
        </div>
        <nav aria-label="Navigation secondaire">
          <ul className="mt-2 space-y-1">
            {secondaryNavigation.map((item) => (
              <li key={item.href}>
                <Link
                  aria-current={item.href === activePath ? "page" : undefined}
                  className="mobile-menu-link"
                  href={item.href}
                >
                  {item.label}
                  <span aria-hidden="true">↗</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <form action={signOut} className="mt-2 border-t border-[var(--line)] pt-2">
          <SignOutButton />
        </form>
      </div>
    </details>
  );
}

export function AppShell({
  activePath,
  children,
  description,
  eyebrow,
  profile,
  title,
}: AppShellProps) {
  const isDashboard = activePath === "/";

  return (
    <div className="app-frame min-h-screen">
      <a href="#main" className="skip-link">Aller au contenu principal</a>

      <header className="app-header">
        <div className="app-header-inner">
          <Brand />
          <DesktopNavigation activePath={activePath} />
          <div className="hidden items-center gap-2 xl:flex">
            <Link
              aria-current={activePath === "/purchase-checker" ? "page" : undefined}
              className="purchase-nav-action"
              href="/purchase-checker"
            >
              <span className="purchase-nav-dot" aria-hidden="true" />
              Vérifier un achat
            </Link>
            <Link
              aria-current={activePath === "/settings" ? "page" : undefined}
              className="profile-chip"
              href="/settings"
              aria-label={`Paramètres du profil, devise ${profile.currencyCode}`}
            >
              {profile.currencyCode}
            </Link>
            <form action={signOut}>
              <SignOutButton />
            </form>
          </div>
          <MobileMenu activePath={activePath} currencyCode={profile.currencyCode} />
        </div>
      </header>

      <main className="app-main" id="main" tabIndex={-1}>
        <div className={`page-heading ${isDashboard ? "is-dashboard" : ""}`}>
          <div>
            <p className="ui-kicker">{eyebrow}</p>
            <h1>{title}</h1>
          </div>
          <p>{description}</p>
        </div>
        {children}
      </main>

      <nav aria-label="Navigation principale mobile" className="mobile-tab-bar">
        <ul>
          {mobileNavigation.map((item) => (
            <li key={item.href}>
              <Link
                aria-current={item.href === activePath ? "page" : undefined}
                className={item.href === activePath ? "is-active" : ""}
                href={item.href}
              >
                <span aria-hidden="true">{item.marker}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
