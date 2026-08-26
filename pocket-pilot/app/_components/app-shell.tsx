import type { ReactNode } from "react";
import Link from "next/link";

import { AppIcon } from "@/app/_components/app-icon";
import { PocketPilotLogo } from "@/app/_components/pocketpilot-logo";
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

const desktopNavigation = [
  ...primaryNavigation,
  ...planningNavigation,
  { href: "/purchase-checker", icon: "check", label: "Purchase Checker" },
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
      <span className="brand-mark" aria-hidden="true">
        <PocketPilotLogo size={compact ? 30 : 32} />
      </span>
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
      <span className="navigation-label" role="tooltip">{label}</span>
    </Link>
  );
}

function DesktopSidebar({ activePath, currencyCode }: { activePath?: AppPath; currencyCode: string }) {
  return (
    <aside className="app-sidebar">
      <Brand compact />
      <nav aria-label="Navigation principale" className="sidebar-navigation">
        <ul>{desktopNavigation.map((item) => <li key={item.href}><NavigationLink activePath={activePath} {...item} /></li>)}</ul>
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-account">
          <Link aria-current={activePath === "/settings" ? "page" : undefined} href="/settings" aria-label={`Paramètres du profil, devise ${currencyCode}`}>
            <span className="profile-avatar">{currencyCode.slice(0, 1)}</span>
            <span className="navigation-label" role="tooltip">Paramètres</span>
          </Link>
          <form action={signOut}><SignOutButton compact /></form>
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
  const isDashboard = activePath === "/";

  return (
    <div className="app-frame">
      <a href="#main" className="skip-link">Aller au contenu principal</a>
      <DesktopSidebar activePath={activePath} currencyCode={profile.currencyCode} />
      <div className="app-workspace">
        <header className="app-header"><Brand /><MobileMenu activePath={activePath} currencyCode={profile.currencyCode} /></header>
        <main className={`app-main ${isDashboard ? "is-dashboard" : ""}`} id="main" tabIndex={-1}>
          <div className="page-heading">
            <div>
              {isDashboard ? null : <p className="ui-kicker">{eyebrow}</p>}
              <h1>{title}</h1>
              {isDashboard ? <p className="dashboard-heading-description">{description}</p> : null}
            </div>
            <div className="page-heading-meta">
              {isDashboard ? null : <p>{description}</p>}
              <Link href="/settings" className="header-profile" aria-label={`Ouvrir les paramètres du profil, devise ${profile.currencyCode}`}>
                <span>{profile.currencyCode}</span>
                <span className="profile-avatar">{profile.currencyCode.slice(0, 1)}</span>
              </Link>
            </div>
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
