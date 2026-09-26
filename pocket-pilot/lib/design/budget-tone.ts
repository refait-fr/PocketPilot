export type BudgetTone = "ok" | "warning" | "danger";

const WARNING_THRESHOLD = 85;
const DANGER_THRESHOLD = 100;

/**
 * Ton sémantique d'affichage pour les badges et barres de budget.
 * Seuils mockup : vert < 85 %, ambre 85–100 %, rouge > 100 %.
 * (Distinct du statut métier `CategoryBudgetStatus`, voir category-budget.ts.)
 */
export function getBudgetTone(percentage: number): BudgetTone {
  if (typeof percentage !== "number" || !Number.isFinite(percentage)) {
    throw new Error("Le pourcentage du budget est invalide.");
  }

  if (percentage > DANGER_THRESHOLD) {
    return "danger";
  }

  if (percentage >= WARNING_THRESHOLD) {
    return "warning";
  }

  return "ok";
}
