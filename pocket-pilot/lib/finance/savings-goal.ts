import type { CalendarMonth } from "./calendar-month.ts";
import {
  formatCentsForInput,
  parseMoneyInput,
  readStoredCents as readMoneyStoredCents,
} from "./money.ts";

export { formatCalendarMonth, getCalendarMonthInTimeZone } from "./calendar-month.ts";

export const MAX_SAVINGS_GOAL_NAME_LENGTH = 100;

export const FIRST_ALLOCATION_CONVENTION =
  "Le mois courant compte comme premier mois d’allocation.";

export type SavingsGoalInputValues = {
  name: string;
  targetAmount: string;
  currentAmount: string;
  monthlyAllocation: string;
};

export type SavingsGoalInputFieldErrors = Partial<
  Record<keyof SavingsGoalInputValues, string>
>;

export type SavingsGoalInputValidation =
  | {
      valid: true;
      data: {
        name: string;
        targetAmountCents: number;
        currentAmountCents: number;
        monthlyAllocationCents: number;
      };
      values: SavingsGoalInputValues;
    }
  | {
      valid: false;
      fieldErrors: SavingsGoalInputFieldErrors;
      values: SavingsGoalInputValues;
    };

export type SavingsGoalPlan = {
  estimatedMonths: number | null;
  isReached: boolean;
  progressPercent: number;
  remainingAmountCents: number;
};

function readText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function parseAmount(
  value: string,
  { allowZero, fieldLabel }: { allowZero: boolean; fieldLabel: string },
): { valid: true; amountCents: number } | { valid: false; message: string } {
  return parseMoneyInput(value, {
    allowZero,
    emptyMessage: `Saisissez ${fieldLabel}.`,
    invalidMessage: "Saisissez un montant numérique, par exemple 5000,00.",
  });
}

export function validateSavingsGoalInput(input: {
  name: unknown;
  targetAmount: unknown;
  currentAmount: unknown;
  monthlyAllocation: unknown;
}): SavingsGoalInputValidation {
  const values = {
    name: readText(input.name),
    targetAmount: readText(input.targetAmount),
    currentAmount: readText(input.currentAmount),
    monthlyAllocation: readText(input.monthlyAllocation),
  };
  const name = values.name.trim();
  const fieldErrors: SavingsGoalInputFieldErrors = {};

  if (!name) {
    fieldErrors.name = "Ajoutez un nom à l’objectif.";
  } else if (name.length > MAX_SAVINGS_GOAL_NAME_LENGTH) {
    fieldErrors.name = `Le nom ne peut pas dépasser ${MAX_SAVINGS_GOAL_NAME_LENGTH} caractères.`;
  }

  const targetAmount = parseAmount(values.targetAmount, {
    allowZero: false,
    fieldLabel: "un montant cible",
  });
  const currentAmount = parseAmount(values.currentAmount, {
    allowZero: true,
    fieldLabel: "le montant déjà épargné",
  });
  const monthlyAllocation = parseAmount(values.monthlyAllocation, {
    allowZero: true,
    fieldLabel: "une allocation mensuelle",
  });

  if (!targetAmount.valid) {
    fieldErrors.targetAmount = targetAmount.message;
  }

  if (!currentAmount.valid) {
    fieldErrors.currentAmount = currentAmount.message;
  }

  if (!monthlyAllocation.valid) {
    fieldErrors.monthlyAllocation = monthlyAllocation.message;
  }

  if (
    targetAmount.valid &&
    currentAmount.valid &&
    currentAmount.amountCents > targetAmount.amountCents
  ) {
    fieldErrors.currentAmount =
      "Le montant déjà épargné ne peut pas dépasser la cible.";
  }

  if (
    fieldErrors.name ||
    fieldErrors.targetAmount ||
    fieldErrors.currentAmount ||
    fieldErrors.monthlyAllocation ||
    !targetAmount.valid ||
    !currentAmount.valid ||
    !monthlyAllocation.valid
  ) {
    return { valid: false, fieldErrors, values };
  }

  return {
    valid: true,
    data: {
      name,
      targetAmountCents: targetAmount.amountCents,
      currentAmountCents: currentAmount.amountCents,
      monthlyAllocationCents: monthlyAllocation.amountCents,
    },
    values: {
      name,
      targetAmount: values.targetAmount.trim(),
      currentAmount: values.currentAmount.trim(),
      monthlyAllocation: values.monthlyAllocation.trim(),
    },
  };
}

function readStoredCents(
  value: unknown,
  { allowZero, fieldName }: { allowZero: boolean; fieldName: string },
): number {
  return readMoneyStoredCents(value, { allowZero, fieldName });
}

export function readStoredSavingsGoalAmounts(input: {
  targetAmountCents: unknown;
  currentAmountCents: unknown;
  monthlyAllocationCents: unknown;
}) {
  const targetAmountCents = readStoredCents(input.targetAmountCents, {
    allowZero: false,
    fieldName: "Le montant cible",
  });
  const currentAmountCents = readStoredCents(input.currentAmountCents, {
    allowZero: true,
    fieldName: "Le montant actuel",
  });
  const monthlyAllocationCents = readStoredCents(
    input.monthlyAllocationCents,
    {
      allowZero: true,
      fieldName: "L’allocation mensuelle",
    },
  );

  if (currentAmountCents > targetAmountCents) {
    throw new Error("Le montant actuel ne peut pas dépasser la cible.");
  }

  return {
    targetAmountCents,
    currentAmountCents,
    monthlyAllocationCents,
  };
}

export function calculateSavingsGoalPlan(input: {
  targetAmountCents: unknown;
  currentAmountCents: unknown;
  monthlyAllocationCents: unknown;
}): SavingsGoalPlan {
  const amounts = readStoredSavingsGoalAmounts(input);
  const isReached = amounts.currentAmountCents >= amounts.targetAmountCents;
  const remainingAmountCents =
    amounts.targetAmountCents - amounts.currentAmountCents;
  const progressPercent = isReached
    ? 100
    : Number(
        (BigInt(amounts.currentAmountCents) * BigInt(100)) /
          BigInt(amounts.targetAmountCents),
      );

  if (isReached) {
    return {
      estimatedMonths: 0,
      isReached,
      progressPercent,
      remainingAmountCents,
    };
  }

  if (amounts.monthlyAllocationCents === 0) {
    return {
      estimatedMonths: null,
      isReached,
      progressPercent,
      remainingAmountCents,
    };
  }

  const remaining = BigInt(remainingAmountCents);
  const allocation = BigInt(amounts.monthlyAllocationCents);
  const estimatedMonths = Number(
    (remaining + allocation - BigInt(1)) / allocation,
  );

  return {
    estimatedMonths,
    isReached,
    progressPercent,
    remainingAmountCents,
  };
}

/**
 * Convention de projection : le mois de référence est le mois 1.
 * Une estimation de 1 mois aboutit donc dans le mois courant, et une
 * estimation de N mois aboutit N - 1 mois calendaires après celui-ci.
 */
export function estimateCompletionMonth(
  reference: CalendarMonth,
  estimatedMonths: number,
): CalendarMonth {
  if (
    !Number.isInteger(reference.year) ||
    reference.year < 1 ||
    !Number.isInteger(reference.month) ||
    reference.month < 1 ||
    reference.month > 12 ||
    !Number.isSafeInteger(estimatedMonths) ||
    estimatedMonths <= 0
  ) {
    throw new Error("La projection mensuelle est invalide.");
  }

  const monthIndex =
    reference.year * 12 + reference.month - 1 + (estimatedMonths - 1);

  if (!Number.isSafeInteger(monthIndex)) {
    throw new Error("La date estimée dépasse la précision disponible.");
  }

  return {
    year: Math.floor(monthIndex / 12),
    month: (monthIndex % 12) + 1,
  };
}

export function formatSavingsGoalCentsForInput(amountCents: number): string {
  return formatCentsForInput(amountCents, {
    allowZero: true,
    fieldName: "Le montant",
  });
}
