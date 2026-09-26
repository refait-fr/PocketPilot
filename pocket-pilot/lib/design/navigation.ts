export type PremiumTabHref =
  | "/dashboard"
  | "/transactions"
  | "/budgets"
  | "/goals"
  | "/purchase-checker";

const EXACT_TABS: readonly PremiumTabHref[] = [
  "/dashboard",
  "/transactions",
  "/budgets",
  "/goals",
  "/purchase-checker",
];

/**
 * Onglet actif de la bottom nav / sidebar à partir du chemin réel.
 * Les sous-routes (ex. /transactions/rapide) retournent l’onglet parent,
 * les écrans sans onglet dédié (settings, incomes, expenses, projection…)
 * retournent null pour n’activer aucun onglet — jamais Home par défaut.
 */
export function resolveActiveTab(pathname: string): PremiumTabHref | null {
  if (typeof pathname !== "string" || pathname.length === 0) {
    return null;
  }

  for (const tab of EXACT_TABS) {
    if (pathname === tab || pathname.startsWith(`${tab}/`)) {
      return tab;
    }
  }

  return null;
}
