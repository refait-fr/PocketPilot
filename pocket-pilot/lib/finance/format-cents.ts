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

  const formatter = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  // Division exacte en centimes : amountCents / 100 en flottant peut décaler
  // d'un centime les très grands montants (demi-ulp > 0,005 au-delà de
  // ~4,6e15 centimes). On injecte donc les chiffres exacts dans le gabarit
  // Intl (séparateurs, symbole, signe) au lieu de formater un flottant.
  const magnitude =
    amountCents < 0 ? -BigInt(amountCents) : BigInt(amountCents);
  const template = formatter.formatToParts(amountCents < 0 ? -1234.56 : 1234.56);
  const groupedInteger = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(Number(magnitude / BigInt(100)));
  const fraction = (magnitude % BigInt(100)).toString().padStart(2, "0");

  let rendered = "";
  let integerRunRendered = false;

  for (const part of template) {
    if (part.type === "integer" || part.type === "group") {
      if (!integerRunRendered) {
        rendered += groupedInteger;
        integerRunRendered = true;
      }
      continue;
    }

    if (part.type === "fraction") {
      rendered += fraction;
      continue;
    }

    rendered += part.value;
  }

  return rendered;
}
