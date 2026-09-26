import Link from "next/link";

import { AppIcon } from "@/app/_components/app-icon";

type FabProps = {
  href: string;
  label: string;
};

/**
 * Bouton d’action flottant (+) : z-index supérieur à la bottom nav,
 * safe-space géré côté CSS (.premium-fab-space ≥ 80px + safe-area).
 * (correction mockup n°2 : ne chevauche jamais le contenu.)
 */
export function Fab({ href, label }: FabProps) {
  return (
    <Link aria-label={label} className="premium-fab" href={href}>
      <AppIcon name="plus" />
    </Link>
  );
}
