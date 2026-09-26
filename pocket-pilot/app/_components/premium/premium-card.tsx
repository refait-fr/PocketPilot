import type { ReactNode } from "react";

type PremiumCardProps = {
  children: ReactNode;
  className?: string;
  labelledBy?: string;
};

/**
 * Carte glass réutilisable (dashboard, budgets, objectifs).
 * Fond légèrement plus clair que le background, bordure fine
 * semi-transparente, pas d’ombre lourde. Coins 12–16px via le thème.
 * (bundle-barrel-imports : import direct, pas de barrel.)
 */
export function PremiumCard({ children, className = "", labelledBy }: PremiumCardProps) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={`premium-card ${className}`.trim()}
    >
      {children}
    </section>
  );
}
