export function formatCents(
  amountCents: number,
  currencyCode: string,
): string {
  if (!Number.isSafeInteger(amountCents)) {
    throw new Error("Le montant à afficher doit être un entier sûr en centimes.");
  }

  if (!/^[A-Z]{3}$/.test(currencyCode)) {
    throw new Error("Le code devise doit respecter le format ISO 4217.");
  }

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountCents / 100);
}
