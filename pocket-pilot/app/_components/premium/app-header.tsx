import Link from "next/link";

import { AppIcon } from "@/app/_components/app-icon";
import { PocketPilotLogo } from "@/app/_components/pocketpilot-logo";

type AppHeaderProps = {
  currencyCode: string;
};

/**
 * Header unique partagé sur tous les écrans authentifiés
 * (correction mockup n°1 : jamais de titre nu sans header).
 * Logo + notifications + profil. La cloche est décorative pour l’instant
 * (aucun système de notifications en base) : bouton désactivé avec
 * aria-label « bientôt disponible » plutôt qu’un lien mensonger.
 */
export function AppHeader({ currencyCode }: AppHeaderProps) {
  return (
    <div className="premium-header-inner">
      <Link
        aria-label="PocketPilot, tableau de bord"
        className="brand-lockup"
        href="/dashboard"
      >
        <span aria-hidden="true" className="brand-mark">
          <PocketPilotLogo size={32} />
        </span>
        <span className="brand-name">PocketPilot</span>
      </Link>
      <div className="premium-header-actions">
        <span
          aria-label="Notifications, bientôt disponible"
          className="premium-icon-button"
          role="img"
          title="Notifications, bientôt disponible"
        >
          <AppIcon name="bell" />
        </span>
        <Link
          aria-label={`Ouvrir les paramètres du profil, devise ${currencyCode}`}
          className="header-profile"
          href="/settings"
        >
          <span>{currencyCode}</span>
          <span className="profile-avatar">{currencyCode.slice(0, 1)}</span>
        </Link>
      </div>
    </div>
  );
}
