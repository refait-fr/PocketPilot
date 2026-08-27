import {
  formatCentsForInput,
  parseMoneyInput,
  readStoredCents,
} from "../finance/money.ts";
import {
  isTransactionCategory,
  type TransactionCategory,
} from "./categories.ts";

export const MAX_TRANSACTION_DESCRIPTION_LENGTH = 200;

export type TransactionInputValues = {
  amount: string;
  category: string;
  description: string;
  transactionDate: string;
};

export type TransactionInputFieldErrors = Partial<
  Record<keyof TransactionInputValues, string>
>;

export type TransactionInputValidation =
  | {
      valid: true;
      data: {
        amountCents: number;
        category: TransactionCategory;
        description: string;
        transactionDate: string;
      };
      values: TransactionInputValues;
    }
  | {
      valid: false;
      fieldErrors: TransactionInputFieldErrors;
      values: TransactionInputValues;
    };

function readText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function isValidTransactionDate(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    year >= 1 &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function validateTransactionInput(input: {
  amount: unknown;
  category: unknown;
  description: unknown;
  maximumTransactionDate?: string;
  transactionDate: unknown;
}): TransactionInputValidation {
  const values = {
    amount: readText(input.amount),
    category: readText(input.category),
    description: readText(input.description),
    transactionDate: readText(input.transactionDate),
  };
  const description = values.description.trim();
  const fieldErrors: TransactionInputFieldErrors = {};
  const parsedAmount = parseMoneyInput(values.amount, {
    allowZero: false,
    emptyMessage: "Saisissez un montant.",
    invalidMessage: "Saisissez un montant numérique, par exemple 25,90.",
  });

  if (!parsedAmount.valid) {
    fieldErrors.amount = parsedAmount.message;
  }

  if (!isTransactionCategory(values.category)) {
    fieldErrors.category = "Choisissez une catégorie valide.";
  }

  if (description.length > MAX_TRANSACTION_DESCRIPTION_LENGTH) {
    fieldErrors.description = `La description ne peut pas dépasser ${MAX_TRANSACTION_DESCRIPTION_LENGTH} caractères.`;
  }

  if (!isValidTransactionDate(values.transactionDate)) {
    fieldErrors.transactionDate = "Choisissez une date valide.";
  } else if (
    input.maximumTransactionDate &&
    values.transactionDate > input.maximumTransactionDate
  ) {
    fieldErrors.transactionDate = "Une transaction future ne peut pas être enregistrée.";
  }

  if (
    !parsedAmount.valid ||
    !isTransactionCategory(values.category) ||
    fieldErrors.description ||
    fieldErrors.transactionDate
  ) {
    return { valid: false, fieldErrors, values };
  }

  return {
    valid: true,
    data: {
      amountCents: parsedAmount.amountCents,
      category: values.category,
      description,
      transactionDate: values.transactionDate,
    },
    values: {
      amount: values.amount.trim(),
      category: values.category,
      description,
      transactionDate: values.transactionDate,
    },
  };
}

export function readPositiveTransactionCents(value: unknown): number {
  return readStoredCents(value, {
    allowZero: false,
    fieldName: "Le montant de la transaction",
  });
}

export function formatTransactionCentsForInput(amountCents: number): string {
  return formatCentsForInput(amountCents, {
    allowZero: false,
    fieldName: "Le montant de la transaction",
  });
}

export function formatTransactionDate(value: string): string {
  if (!isValidTransactionDate(value)) {
    throw new Error("La date de transaction est invalide.");
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}
