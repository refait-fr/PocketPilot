import type { ReactNode } from "react";
import Link from "next/link";

import { signOut } from "@/app/auth/actions";
import { SignOutButton } from "@/app/_components/sign-out-button";
import type { AuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";

const navigationItems = [
  { href: "/", label: "Vue d’ensemble", number: "01" },
  { href: "/incomes", label: "Revenus", number: "02" },
  { href: "/expenses", label: "Dépenses", number: "03" },
  { href: "/transactions", label: "Transactions", number: "04" },
  { href: "/budgets", label: "Budgets", number: "05" },
  { href: "/goals", label: "Objectifs", number: "06" },
  { href: "/settings", label: "Réglages", number: "07" },
] as const;

type AppShellProps = {
  activePath?: (typeof navigationItems)[number]["href"];
  children: ReactNode;
  description: string;
  eyebrow: string;
  profile: AuthenticatedProfile;
  title: string;
};

export function AppShell({
  activePath,
  children,
  description,
  eyebrow,
  profile,
  title,
}: AppShellProps) {
  return (
    <div className="dashboard-grid min-h-screen">
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-[var(--forest)] px-4 py-3 text-sm font-bold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:outline-2 focus:outline-offset-2 focus:outline-white"
      >
        Aller au contenu principal
      </a>
      <header className="border-b border-[var(--line)] bg-[color:rgba(243,240,231,0.88)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
          <Link
            className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-dark)]"
            href="/"
          >
            <span className="grid size-9 place-items-center rounded-full bg-[var(--forest)] font-display text-lg font-bold text-white">
              P
            </span>
            <span className="font-display text-2xl font-bold tracking-[-0.045em]">
              PocketPilot
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-xs font-bold tracking-[0.12em] text-[var(--ink-soft)]">
              {profile.currencyCode}
            </span>
            <form action={signOut}>
              <SignOutButton />
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12 lg:px-10 lg:py-12">
        <aside className="min-w-0 lg:sticky lg:top-8 lg:self-start">
          <nav aria-label="Navigation principale">
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1">
              {navigationItems.map((item) => {
                const isActive = item.href === activePath;

                return (
                  <li key={item.href}>
                    <Link
                      aria-current={isActive ? "page" : undefined}
                      className={`group flex min-h-14 items-center gap-3 rounded-xl border px-3 py-3 text-sm transition-all duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)] lg:px-4 ${
                        isActive
                          ? "border-[var(--forest)] bg-[var(--forest)] text-white"
                          : "border-transparent text-[var(--ink-soft)] hover:border-[var(--line)] hover:bg-[var(--paper)] hover:text-[var(--forest)]"
                      }`}
                      href={item.href}
                    >
                      <span
                        className={`text-[10px] font-bold tracking-[0.16em] ${
                          isActive
                            ? "text-[#f0a47f]"
                            : "text-[var(--accent-dark)]"
                        }`}
                      >
                        {item.number}
                      </span>
                      <span className="font-semibold leading-tight">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <main className="min-w-0 pb-12" id="main" tabIndex={-1}>
          <div className="mb-8 max-w-3xl sm:mb-10">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-dark)]">
              {eyebrow}
            </p>
            <h1 className="font-display text-4xl leading-[1.02] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--ink-soft)] sm:text-lg">
              {description}
            </p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
