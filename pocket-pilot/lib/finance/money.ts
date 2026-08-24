export const MAX_MONEY_CENTS = Number.MAX_SAFE_INTEGER;

type MoneyInputOptions = {
  allowZero: boolean;
  emptyMessage: string;
  invalidMessage: string;
};

export type MoneyInputResult =
  | { valid: true; amountCents: number }
  | { valid: false; message: string };

export function parseMoneyInput(
  value: string,
  { allowZero, emptyMessage, invalidMessage }: MoneyInputOptions,
): MoneyInputResult {
  const amount = value.trim();

  if (!amount) {
    return { valid: false, message: emptyMessage };
  }

  if (amount.startsWith("-")) {
    return {
      valid: false,
      message: allowZero
        ? "Le montant ne peut pas être négatif."
        : "Le montant doit être strictement supérieur à 0.",
    };
  }

  if (amount.length > 32) {
    return {
      valid: false,
      message: "Ce montant dépasse la précision autorisée.",
    };
  }

  if (/^\d+[.,]\d{3,}$/.test(amount)) {
    return {
      valid: false,
      message: "Utilisez au maximum deux chiffres après la virgule.",
    };
  }

  if (!/^\d+(?:[.,]\d{1,2})?$/.test(amount)) {
    return { valid: false, message: invalidMessage };
  }

  const [wholePart, fractionalPart = ""] = amount.replace(",", ".").split(".");
  const cents =
    BigInt(wholePart) * BigInt(100) +
    BigInt(fractionalPart.padEnd(2, "0"));

  if (cents < BigInt(0) || (!allowZero && cents === BigInt(0))) {
    return {
      valid: false,
      message: allowZero
        ? "Le montant ne peut pas être négatif."
        : "Le montant doit être strictement supérieur à 0.",
    };
  }

  if (cents > BigInt(MAX_MONEY_CENTS)) {
    return {
      valid: false,
      message: "Ce montant dépasse la précision autorisée.",
    };
  }

  return { valid: true, amountCents: Number(cents) };
}

export function readStoredCents(
  value: unknown,
  { allowZero, fieldName }: { allowZero: boolean; fieldName: string },
): number {
  const amount =
    typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value;

  if (
    typeof amount !== "number" ||
    !Number.isSafeInteger(amount) ||
    amount < 0 ||
    (!allowZero && amount === 0)
  ) {
    throw new Error(`${fieldName} doit être un entier sûr en centimes.`);
  }

  return amount;
}

export function addCents(total: number, amount: number): number {
  const result = total + amount;

  if (!Number.isSafeInteger(result)) {
    throw new Error("Le total financier dépasse la précision entière disponible.");
  }

  return result;
}

export function subtractCents(total: number, amount: number): number {
  const result = total - amount;

  if (!Number.isSafeInteger(result)) {
    throw new Error("Le total financier dépasse la précision entière disponible.");
  }

  return result;
}

export function sumStoredCents(
  values: readonly unknown[],
  fieldName: string,
): number {
  return values.reduce<number>(
    (total, value) =>
      addCents(total, readStoredCents(value, { allowZero: true, fieldName })),
    0,
  );
}

export function sumPositiveStoredCents(
  values: readonly unknown[],
  fieldName: string,
): number {
  return values.reduce<number>(
    (total, value) =>
      addCents(total, readStoredCents(value, { allowZero: false, fieldName })),
    0,
  );
}

export function formatCentsForInput(
  amountCents: number,
  { allowZero = true, fieldName = "Le montant" } = {},
): string {
  const amount = readStoredCents(amountCents, { allowZero, fieldName });
  const wholePart = Math.floor(amount / 100);
  const fractionalPart = String(amount % 100).padStart(2, "0");

  return `${wholePart},${fractionalPart}`;
}
