import type { ReactNode } from "react";
import Link from "next/link";

import { AppIcon } from "@/app/_components/app-icon";
import { SignOutButton } from "@/app/_components/sign-out-button";
import { signOut } from "@/app/auth/actions";
import type { AuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";

const primaryNavigation = [
  { href: "/", icon: "home", label: "Vue d’ensemble" },
  { href: "/transactions", icon: "transaction", label: "Transactions" },
  { href: "/budgets", icon: "budget", label: "Budgets" },
  { href: "/goals", icon: "goal", label: "Objectifs" },
] as const;

const planningNavigation = [
  { href: "/incomes", icon: "income", label: "Revenus" },
  { href: "/expenses", icon: "expense", label: "Charges fixes" },
] as const;

const mobileNavigation = [
  { href: "/", icon: "home", label: "Accueil" },
  { href: "/transactions", icon: "transaction", label: "Transactions" },
  { href: "/budgets", icon: "budget", label: "Budgets" },
  { href: "/goals", icon: "goal", label: "Objectifs" },
  { href: "/purchase-checker", icon: "check", label: "Achat" },
] as const;

const secondaryNavigation = [
  ...planningNavigation,
  { href: "/settings", icon: "settings", label: "Paramètres" },
] as const;

type AppPath =
  | (typeof primaryNavigation)[number]["href"]
  | (typeof secondaryNavigation)[number]["href"]
  | "/purchase-checker";

type AppShellProps = {
  activePath?: AppPath;
  children: ReactNode;
  description: string;
  eyebrow: string;
  profile: AuthenticatedProfile;
  title: string;
};

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="brand-lockup" href="/" aria-label="PocketPilot, accueil">
      <span className="brand-mark" aria-hidden="true">P</span>
      {compact ? null : <span className="brand-name">PocketPilot</span>}
    </Link>
  );
}

function NavigationLink({ activePath, href, icon, label }: {
  activePath?: AppPath;
  href: AppPath;
  icon: Parameters<typeof AppIcon>[0]["name"];
  label: string;
}) {
  return (
    <Link
      aria-current={href === activePath ? "page" : undefined}
      className={href === activePath ? "is-active" : ""}
      href={href}
    >
      <AppIcon name={icon} />
      <span>{label}</span>
    </Link>
  );
}

function DesktopSidebar({ activePath, currencyCode }: { activePath?: AppPath; currencyCode: string }) {
  return (
    <aside className="app-sidebar">
      <Brand />
      <nav aria-label="Navigation principale" className="sidebar-navigation">
        <p className="sidebar-label">Pilotage</p>
        <ul>{primaryNavigation.map((item) => <li key={item.href}><NavigationLink activePath={activePath} {...item} /></li>)}</ul>
        <p className="sidebar-label">Plan mensuel</p>
        <ul>{planningNavigation.map((item) => <li key={item.href}><NavigationLink activePath={activePath} {...item} /></li>)}</ul>
      </nav>
      <div className="sidebar-footer">
        <Link
          aria-label="Vérifier un achat"
          aria-current={activePath === "/purchase-checker" ? "page" : undefined}
          className={`sidebar-purchase ${activePath === "/purchase-checker" ? "is-active" : ""}`}
          href="/purchase-checker"
        >
          <span className="sidebar-purchase-icon"><AppIcon name="check" /></span>
          <span><strong>Vérifier un achat</strong><small>Action PocketPilot · mesurer son impact</small></span>
        </Link>
        <div className="sidebar-account">
          <Link aria-current={activePath === "/settings" ? "page" : undefined} href="/settings" aria-label={`Paramètres du profil, devise ${currencyCode}`}>
            <span className="profile-avatar">{currencyCode.slice(0, 1)}</span>
            <span><strong>Mon profil</strong><small>{currencyCode}</small></span>
            <AppIcon name="settings" />
          </Link>
          <form action={signOut}><SignOutButton /></form>
        </div>
      </div>
    </aside>
  );
}

function MobileMenu({ activePath, currencyCode }: { activePath?: AppPath; currencyCode: string }) {
  return (
    <details className="mobile-menu">
      <summary className="ui-menu-trigger"><AppIcon name="menu" /><span>Menu</span></summary>
      <div className="mobile-menu-panel">
        <div className="mobile-menu-heading"><span>Planification</span><span className="ui-badge">{currencyCode}</span></div>
        <nav aria-label="Navigation secondaire">
          <ul>{secondaryNavigation.map((item) => <li key={item.href}><NavigationLink activePath={activePath} {...item} /></li>)}</ul>
        </nav>
        <form action={signOut} className="mobile-signout"><SignOutButton /></form>
      </div>
    </details>
  );
}

export function AppShell({ activePath, children, description, eyebrow, profile, title }: AppShellProps) {
  return (
    <div className="app-frame">
      <a href="#main" className="skip-link">Aller au contenu principal</a>
      <DesktopSidebar activePath={activePath} currencyCode={profile.currencyCode} />
      <div className="app-workspace">
        <header className="app-header"><Brand /><MobileMenu activePath={activePath} currencyCode={profile.currencyCode} /></header>
        <main className="app-main" id="main" tabIndex={-1}>
          <div className="page-heading">
            <div><p className="ui-kicker">{eyebrow}</p><h1>{title}</h1></div>
            <p>{description}</p>
          </div>
          {children}
        </main>
      </div>
      <nav aria-label="Navigation principale mobile" className="mobile-tab-bar">
        <ul>{mobileNavigation.map((item) => <li key={item.href}><NavigationLink activePath={activePath} {...item} /></li>)}</ul>
      </nav>
    </div>
  );
}
