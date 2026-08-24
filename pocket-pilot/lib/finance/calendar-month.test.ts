import assert from "node:assert/strict";
import test from "node:test";

import {
  addCalendarMonths,
  getCalendarDateInTimeZone,
  getCalendarMonthInTimeZone,
  getCalendarMonthRange,
  parseCalendarMonthParam,
} from "./calendar-month.ts";

test("détermine le mois selon le fuseau du profil", () => {
  const reference = new Date("2026-01-01T00:30:00.000Z");

  assert.deepEqual(getCalendarMonthInTimeZone(reference, "Europe/Paris"), {
    month: 1,
    year: 2026,
  });
  assert.deepEqual(getCalendarMonthInTimeZone(reference, "America/New_York"), {
    month: 12,
    year: 2025,
  });
  assert.equal(
    getCalendarDateInTimeZone(reference, "America/New_York"),
    "2025-12-31",
  );
});

test("passe correctement de décembre à janvier", () => {
  assert.deepEqual(addCalendarMonths({ month: 12, year: 2026 }, 1), {
    month: 1,
    year: 2027,
  });
  assert.deepEqual(addCalendarMonths({ month: 1, year: 2027 }, -1), {
    month: 12,
    year: 2026,
  });
  assert.deepEqual(getCalendarMonthRange({ month: 12, year: 2026 }), {
    startInclusive: "2026-12-01",
    endExclusive: "2027-01-01",
  });
});

test("valide strictement le paramètre month", () => {
  assert.deepEqual(parseCalendarMonthParam("2026-08"), {
    month: 8,
    year: 2026,
  });

  for (const invalid of [
    undefined,
    "",
    "2026-8",
    "2026-00",
    "2026-13",
    "0000-01",
    "2026-08?next=evil",
    ["2026-08"],
  ]) {
    assert.equal(parseCalendarMonthParam(invalid), null);
  }
});
