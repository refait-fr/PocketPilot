import {
  formatCentsForInput as formatMoneyCentsForInput,
  parseMoneyInput,
  readStoredCents,
} from "./money.ts";

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
  return parseMoneyInput(value, {
    allowZero: false,
    emptyMessage: "Saisissez un montant mensuel.",
    invalidMessage: "Saisissez un montant numérique, par exemple 1250,00.",
  });
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
  return readStoredCents(value, {
    allowZero: false,
    fieldName: "Le montant stocké",
  });
}

export function formatCentsForInput(amountCents: number): string {
  return formatMoneyCentsForInput(amountCents, {
    allowZero: false,
    fieldName: "Le montant stocké",
  });
}
