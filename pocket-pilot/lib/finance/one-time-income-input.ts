import {
  parseMoneyInput,
  readStoredCents,
} from "../finance/money.ts";
import { isValidTransactionDate } from "../transactions/transaction-input.ts";

export const MAX_ONE_TIME_INCOME_LABEL_LENGTH = 100;

export type OneTimeIncomeInputValues = {
  amount: string;
  incomeDate: string;
  label: string;
};

export type OneTimeIncomeInputFieldErrors = Partial<
  Record<keyof OneTimeIncomeInputValues, string>
>;

export type OneTimeIncomeInputValidation =
  | {
      valid: true;
      data: {
        amountCents: number;
        incomeDate: string;
        label: string;
      };
      values: OneTimeIncomeInputValues;
    }
  | {
      valid: false;
      fieldErrors: OneTimeIncomeInputFieldErrors;
      values: OneTimeIncomeInputValues;
    };

function readText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function isValidOneTimeIncomeDate(value: unknown): value is string {
  return isValidTransactionDate(value);
}

export function validateOneTimeIncomeInput(input: {
  amount: unknown;
  incomeDate: unknown;
  label: unknown;
  maximumIncomeDate?: string;
}): OneTimeIncomeInputValidation {
  const values = {
    amount: readText(input.amount),
    incomeDate: readText(input.incomeDate),
    label: readText(input.label),
  };
  const label = values.label.trim();
  const fieldErrors: OneTimeIncomeInputFieldErrors = {};
  const parsedAmount = parseMoneyInput(values.amount, {
    allowZero: false,
    emptyMessage: "Saisissez un montant.",
    invalidMessage: "Saisissez un montant numérique, par exemple 20,00.",
  });

  if (!parsedAmount.valid) {
    fieldErrors.amount = parsedAmount.message;
  }

  if (!label) {
    fieldErrors.label = "Ajoutez un libellé.";
  } else if (label.length > MAX_ONE_TIME_INCOME_LABEL_LENGTH) {
    fieldErrors.label = `Le libellé ne peut pas dépasser ${MAX_ONE_TIME_INCOME_LABEL_LENGTH} caractères.`;
  }

  if (!isValidOneTimeIncomeDate(values.incomeDate)) {
    fieldErrors.incomeDate = "Choisissez une date valide.";
  } else if (
    input.maximumIncomeDate &&
    values.incomeDate > input.maximumIncomeDate
  ) {
    fieldErrors.incomeDate = "Un revenu futur ne peut pas être enregistré.";
  }

  if (
    !parsedAmount.valid ||
    fieldErrors.label ||
    fieldErrors.incomeDate
  ) {
    return { valid: false, fieldErrors, values };
  }

  return {
    valid: true,
    data: {
      amountCents: parsedAmount.amountCents,
      incomeDate: values.incomeDate,
      label,
    },
    values: {
      amount: values.amount.trim(),
      incomeDate: values.incomeDate,
      label,
    },
  };
}

export function readPositiveOneTimeIncomeCents(value: unknown): number {
  return readStoredCents(value, {
    allowZero: false,
    fieldName: "Le montant du revenu ponctuel",
  });
}
