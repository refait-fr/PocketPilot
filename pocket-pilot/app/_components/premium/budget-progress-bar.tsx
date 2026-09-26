import { getBudgetTone, type BudgetTone } from "@/lib/design/budget-tone";

type BudgetProgressBarProps = {
  category: string;
  percentageConsumed: string;
  progressPercent: number;
};

const TONE_CLASS: Record<BudgetTone, string> = {
  danger: "is-danger",
  ok: "",
  warning: "is-warning",
};

/**
 * Barre de progression fine avec code couleur sémantique :
 * vert < 85 %, ambre 85–100 %, rouge > 100 % (correction mockup n°6).
 * Le % affiché vient de `percentageConsumed` (entier BigInt exact),
 * la largeur utilise `progressPercent` (borné à 100).
 */
export function BudgetProgressBar({
  category,
  percentageConsumed,
  progressPercent,
}: BudgetProgressBarProps) {
  const tone = getBudgetTone(Number(percentageConsumed));

  return (
    <div
      aria-label={`${percentageConsumed} % du budget ${category} consommé`}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={progressPercent}
      className="ui-progress premium-progress"
      role="progressbar"
    >
      <span
        className={TONE_CLASS[tone]}
        style={{ width: `${progressPercent}%` }}
      />
    </div>
  );
}
