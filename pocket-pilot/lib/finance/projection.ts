import {
  addCalendarMonths,
  getCalendarMonthRange,
  parseCalendarMonthParam,
} from "./calendar-month.ts";
import { addCents, readStoredCents, subtractCents } from "./money.ts";
import { isValidTransactionDate } from "../transactions/transaction-input.ts";

export const MIN_PROJECTION_MONTHS = 1;
export const MAX_PROJECTION_MONTHS = 60;

export type ProjectionRecurringEntry = {
  amountCents: unknown;
  isActive: unknown;
  startDate: unknown;
};

export type ProjectionGoal = {
  monthlyAllocationCents: unknown;
};

export type ProjectedMonth = {
  month: string;
  totalFixedExpensesCents: number;
  totalGoalAllocationsCents: number;
  totalIncomeCents: number;
  projectedAvailableCents: number;
};

type ValidatedRecurringEntry = {
  amountCents: number;
  isActive: boolean;
  startDate: string;
};

function readRecurringEntry(
  entry: ProjectionRecurringEntry,
  fieldName: string,
): ValidatedRecurringEntry {
  if (typeof entry.isActive !== "boolean") {
    throw new Error(`${fieldName} contient un état d’activation invalide.`);
  }

  if (!isValidTransactionDate(entry.startDate)) {
    throw new Error(`${fieldName} contient une date de début invalide.`);
  }

  return {
    amountCents: readStoredCents(entry.amountCents, {
      allowZero: false,
      fieldName,
    }),
    isActive: entry.isActive,
    startDate: entry.startDate,
  };
}

function sumStartedEntries(
  entries: readonly ValidatedRecurringEntry[],
  monthEndExclusive: string,
): number {
  let total = 0;

  for (const entry of entries) {
    // Comparaison ISO sûre : l’entrée compte dès que son début est atteint,
    // c’est-à-dire start_date < 1er jour du mois suivant (même convention
    // que le tableau de bord mensuel).
    if (entry.isActive && entry.startDate < monthEndExclusive) {
      total = addCents(total, entry.amountCents);
    }
  }

  return total;
}

export function projectFutureMonths({
  expenses,
  goals,
  incomes,
  monthCount,
  startMonth,
}: {
  expenses: readonly ProjectionRecurringEntry[];
  goals: readonly ProjectionGoal[];
  incomes: readonly ProjectionRecurringEntry[];
  monthCount: unknown;
  startMonth: unknown;
}): ProjectedMonth[] {
  const start = parseCalendarMonthParam(startMonth);

  if (!start) {
    throw new Error("Le mois de départ de la projection est invalide.");
  }

  if (
    typeof monthCount !== "number" ||
    !Number.isSafeInteger(monthCount) ||
    monthCount < MIN_PROJECTION_MONTHS ||
    monthCount > MAX_PROJECTION_MONTHS
  ) {
    throw new Error(
      `Le nombre de mois projetés doit être compris entre ${MIN_PROJECTION_MONTHS} et ${MAX_PROJECTION_MONTHS}.`,
    );
  }

  const validatedIncomes = incomes.map((entry) =>
    readRecurringEntry(entry, "Le revenu récurrent"),
  );
  const validatedExpenses = expenses.map((entry) =>
    readRecurringEntry(entry, "La charge récurrente"),
  );
  // Hypothèse explicite : les allocations mensuelles des objectifs restent
  // constantes sur toute la projection (aucune revalorisation ni plafonnement
  // au restant, contrairement au snapshot du mois courant).
  let totalGoalAllocationsCents = 0;

  for (const goal of goals) {
    totalGoalAllocationsCents = addCents(
      totalGoalAllocationsCents,
      readStoredCents(goal.monthlyAllocationCents, {
        allowZero: true,
        fieldName: "L’allocation mensuelle de l’objectif",
      }),
    );
  }

  const months: ProjectedMonth[] = [];

  for (let offset = 0; offset < monthCount; offset += 1) {
    const month = addCalendarMonths(start, offset);
    const range = getCalendarMonthRange(month);
    const totalIncomeCents = sumStartedEntries(
      validatedIncomes,
      range.endExclusive,
    );
    const totalFixedExpensesCents = sumStartedEntries(
      validatedExpenses,
      range.endExclusive,
    );
    const projectedAvailableCents = subtractCents(
      subtractCents(totalIncomeCents, totalFixedExpensesCents),
      totalGoalAllocationsCents,
    );

    months.push({
      month: `${range.startInclusive.slice(0, 7)}`,
      projectedAvailableCents,
      totalFixedExpensesCents,
      totalGoalAllocationsCents,
      totalIncomeCents,
    });
  }

  return months;
}
