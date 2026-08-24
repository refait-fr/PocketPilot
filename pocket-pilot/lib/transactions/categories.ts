export const TRANSACTION_CATEGORIES = [
  "Alimentation",
  "Transport",
  "Shopping",
  "Loisirs",
  "Abonnements",
  "Santé",
  "Études",
  "Autre",
] as const;

export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];

export function isTransactionCategory(
  value: unknown,
): value is TransactionCategory {
  return (
    typeof value === "string" &&
    TRANSACTION_CATEGORIES.some((category) => category === value)
  );
}
