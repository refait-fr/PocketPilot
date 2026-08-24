export type CalendarMonth = {
  month: number;
  year: number;
};

export type CalendarMonthRange = {
  endExclusive: string;
  startInclusive: string;
};

function assertCalendarMonth({ month, year }: CalendarMonth): void {
  if (
    !Number.isInteger(year) ||
    year < 1 ||
    year > 9999 ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    throw new Error("Le mois calendaire est invalide.");
  }
}

export function parseCalendarMonthParam(value: unknown): CalendarMonth | null {
  if (typeof value !== "string") {
    return null;
  }

  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);

  return year >= 1 ? { month, year } : null;
}

export function formatCalendarMonthParam(calendarMonth: CalendarMonth): string {
  assertCalendarMonth(calendarMonth);
  return `${String(calendarMonth.year).padStart(4, "0")}-${String(calendarMonth.month).padStart(2, "0")}`;
}

export function addCalendarMonths(
  calendarMonth: CalendarMonth,
  offset: number,
): CalendarMonth {
  assertCalendarMonth(calendarMonth);

  if (!Number.isSafeInteger(offset)) {
    throw new Error("Le déplacement mensuel est invalide.");
  }

  const monthIndex =
    calendarMonth.year * 12 + calendarMonth.month - 1 + offset;
  const result = {
    year: Math.floor(monthIndex / 12),
    month: (monthIndex % 12) + 1,
  };

  assertCalendarMonth(result);
  return result;
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
  const calendarMonth = { month, year };

  assertCalendarMonth(calendarMonth);
  return calendarMonth;
}

export function getCalendarDateInTimeZone(
  referenceDate: Date,
  timeZone: string,
): string {
  if (Number.isNaN(referenceDate.getTime())) {
    throw new Error("La date de référence est invalide.");
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(referenceDate);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("La date locale est invalide.");
  }

  return `${year}-${month}-${day}`;
}

export function getCalendarMonthRange(
  calendarMonth: CalendarMonth,
): CalendarMonthRange {
  const nextMonth = addCalendarMonths(calendarMonth, 1);

  return {
    startInclusive: `${formatCalendarMonthParam(calendarMonth)}-01`,
    endExclusive: `${formatCalendarMonthParam(nextMonth)}-01`,
  };
}

export function formatCalendarMonth(calendarMonth: CalendarMonth): string {
  assertCalendarMonth(calendarMonth);

  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(
    new Date(Date.UTC(calendarMonth.year, calendarMonth.month - 1, 1)),
  );
}

export function isSameCalendarMonth(
  first: CalendarMonth,
  second: CalendarMonth,
): boolean {
  return first.month === second.month && first.year === second.year;
}
