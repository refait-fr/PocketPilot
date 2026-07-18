export const MAX_RECURRING_ENTRY_LABEL_LENGTH = 100;

export type RecurringEntryInputValues = {
  label: string;
  monthlyAmount: string;
};

export type RecurringEntryInputFieldErrors = {
  label?: string;
  monthlyAmount?: string;
};

export type RecurringEntryInputValidation =
  | {
      valid: true;
      data: { label: string; amountCents: number };
      values: RecurringEntryInputValues;
    }
  | {
      valid: false;
      fieldErrors: RecurringEntryInputFieldErrors;
      values: RecurringEntryInputValues;
    };

function readText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function parsePositiveMonthlyAmount(value: string):
  | { valid: true; amountCents: number }
  | { valid: false; message: string } {
  const amount = value.trim();

  if (!amount) {
    return {
      valid: false,
      message: "Saisissez un montant mensuel.",
    };
  }

  if (amount.startsWith("-")) {
    return {
      valid: false,
      message: "Le montant doit être strictement supérieur à 0.",
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
    return {
      valid: false,
      message: "Saisissez un montant numérique, par exemple 1250,00.",
    };
  }

  const [wholePart, fractionalPart = ""] = amount.replace(",", ".").split(".");
  const cents =
    BigInt(wholePart) * BigInt(100) +
    BigInt(fractionalPart.padEnd(2, "0"));

  if (cents <= BigInt(0)) {
    return {
      valid: false,
      message: "Le montant doit être strictement supérieur à 0.",
    };
  }

  if (cents > BigInt(Number.MAX_SAFE_INTEGER)) {
    return {
      valid: false,
      message: "Ce montant dépasse la précision autorisée.",
    };
  }

  return { valid: true, amountCents: Number(cents) };
}

export function validateRecurringEntryInput(input: {
  label: unknown;
  monthlyAmount: unknown;
}): RecurringEntryInputValidation {
  const values = {
    label: readText(input.label),
    monthlyAmount: readText(input.monthlyAmount),
  };
  const label = values.label.trim();
  const fieldErrors: RecurringEntryInputFieldErrors = {};

  if (!label) {
    fieldErrors.label = "Ajoutez un libellé.";
  } else if (label.length > MAX_RECURRING_ENTRY_LABEL_LENGTH) {
    fieldErrors.label = `Le libellé ne peut pas dépasser ${MAX_RECURRING_ENTRY_LABEL_LENGTH} caractères.`;
  }

  const parsedAmount = parsePositiveMonthlyAmount(values.monthlyAmount);

  if (!parsedAmount.valid) {
    fieldErrors.monthlyAmount = parsedAmount.message;
  }

  if (fieldErrors.label || fieldErrors.monthlyAmount || !parsedAmount.valid) {
    return { valid: false, fieldErrors, values };
  }

  return {
    valid: true,
    data: { label, amountCents: parsedAmount.amountCents },
    values: { label, monthlyAmount: values.monthlyAmount.trim() },
  };
}

export function readPositiveStoredCents(value: unknown): number {
  const amount =
    typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value;

  if (
    typeof amount !== "number" ||
    !Number.isSafeInteger(amount) ||
    amount <= 0
  ) {
    throw new Error("Le montant stocké doit être un entier positif en centimes.");
  }

  return amount;
}

export function formatCentsForInput(amountCents: number): string {
  const amount = readPositiveStoredCents(amountCents);
  const wholePart = Math.floor(amount / 100);
  const fractionalPart = String(amount % 100).padStart(2, "0");

  return `${wholePart},${fractionalPart}`;
}
