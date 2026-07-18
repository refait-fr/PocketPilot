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

export type CalendarMonth = {
  month: number;
  year: number;
};

function readText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function parseAmount(
  value: string,
  { allowZero, fieldLabel }: { allowZero: boolean; fieldLabel: string },
): { valid: true; amountCents: number } | { valid: false; message: string } {
  const amount = value.trim();

  if (!amount) {
    return { valid: false, message: `Saisissez ${fieldLabel}.` };
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
    return {
      valid: false,
      message: "Saisissez un montant numérique, par exemple 5000,00.",
    };
  }

  const [wholePart, fractionalPart = ""] = amount.replace(",", ".").split(".");
  const cents =
    BigInt(wholePart) * BigInt(100) +
    BigInt(fractionalPart.padEnd(2, "0"));

  if ((!allowZero && cents === BigInt(0)) || cents < BigInt(0)) {
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

export function getCalendarMonthInTimeZone(
  referenceDate: Date,
  timeZone: string,
): CalendarMonth {
  if (Number.isNaN(referenceDate.getTime())) {
    throw new Error("La date de référence est invalide.");
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    timeZone,
    year: "numeric",
  }).formatToParts(referenceDate);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);

  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    throw new Error("Le mois de référence est invalide.");
  }

  return { year, month };
}

export function formatCalendarMonth(calendarMonth: CalendarMonth): string {
  const { year, month } = estimateCompletionMonth(calendarMonth, 1);

  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export function formatSavingsGoalCentsForInput(amountCents: number): string {
  const amount = readStoredCents(amountCents, {
    allowZero: true,
    fieldName: "Le montant",
  });
  const wholePart = Math.floor(amount / 100);
  const fractionalPart = String(amount % 100).padStart(2, "0");

  return `${wholePart},${fractionalPart}`;
}
