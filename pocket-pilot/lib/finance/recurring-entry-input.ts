import {
  formatCentsForInput as formatMoneyCentsForInput,
  parseMoneyInput,
  readStoredCents,
} from "./money.ts";
import { isValidTransactionDate } from "../transactions/transaction-input.ts";

export const MAX_RECURRING_ENTRY_LABEL_LENGTH = 100;

export type RecurringEntryInputValues = {
  label: string;
  monthlyAmount: string;
  startDate: string;
};

export type RecurringEntryInputFieldErrors = {
  label?: string;
  monthlyAmount?: string;
  startDate?: string;
};

export type RecurringEntryInputValidation =
  | {
      valid: true;
      data: { label: string; amountCents: number; startDate: string };
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

export function isValidRecurringStartDate(value: unknown): value is string {
  // Le passé, le présent et le futur sont acceptés : un abonnement peut
  // débuter plus tard (ex. premier prélèvement dans deux mois).
  return isValidTransactionDate(value);
}

export function formatRecurringStartDate(startDate: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "numeric",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(`${startDate}T00:00:00Z`));
}

export function validateRecurringEntryInput(input: {
  label: unknown;
  monthlyAmount: unknown;
  startDate: unknown;
}): RecurringEntryInputValidation {
  const values = {
    label: readText(input.label),
    monthlyAmount: readText(input.monthlyAmount),
    startDate: readText(input.startDate),
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

  if (!isValidRecurringStartDate(values.startDate)) {
    fieldErrors.startDate = "Choisissez une date de début valide.";
  }

  if (
    fieldErrors.label ||
    fieldErrors.monthlyAmount ||
    fieldErrors.startDate ||
    !parsedAmount.valid
  ) {
    return { valid: false, fieldErrors, values };
  }

  return {
    valid: true,
    data: {
      label,
      amountCents: parsedAmount.amountCents,
      startDate: values.startDate,
    },
    values: {
      label,
      monthlyAmount: values.monthlyAmount.trim(),
      startDate: values.startDate,
    },
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
