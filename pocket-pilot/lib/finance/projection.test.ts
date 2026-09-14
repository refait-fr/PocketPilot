import assert from "node:assert/strict";
import test from "node:test";

import {
  MAX_PROJECTION_MONTHS,
  projectFutureMonths,
} from "./projection.ts";

const income = (
  amountCents: unknown,
  isActive: unknown = true,
  startDate: unknown = "2026-01-01",
) => ({ amountCents, isActive, startDate });

test("projette des mois constants quand tout est déjà démarré", () => {
  const months = projectFutureMonths({
    expenses: [income(70_000)],
    goals: [{ monthlyAllocationCents: 10_000 }],
    incomes: [income(150_000)],
    monthCount: 3,
    startMonth: "2026-09",
  });

  assert.deepEqual(
    months.map((month) => month.month),
    ["2026-09", "2026-10", "2026-11"],
  );
  assert.ok(
    months.every(
      (month) =>
        month.totalIncomeCents === 150_000 &&
        month.totalFixedExpensesCents === 70_000 &&
        month.totalGoalAllocationsCents === 10_000 &&
        month.projectedAvailableCents === 70_000,
    ),
  );
});

test("ignore les entrées désactivées et les démarrages futurs", () => {
  const months = projectFutureMonths({
    expenses: [
      income(70_000, false),
      income(5_000, true, "2026-10-15"),
    ],
    goals: [],
    incomes: [
      income(150_000),
      income(20_000, true, "2026-11-01"),
    ],
    monthCount: 3,
    startMonth: "2026-09",
  });

  assert.equal(months[0]?.totalIncomeCents, 150_000);
  assert.equal(months[0]?.totalFixedExpensesCents, 0);
  assert.equal(months[1]?.totalFixedExpensesCents, 5_000);
  assert.equal(months[1]?.totalIncomeCents, 150_000);
  assert.equal(months[2]?.totalIncomeCents, 170_000);
  assert.equal(months[2]?.projectedAvailableCents, 165_000);
});

test("une entrée qui démarre en cours de mois compte pour ce mois", () => {
  const months = projectFutureMonths({
    expenses: [],
    goals: [],
    incomes: [income(10_000, true, "2026-09-30")],
    monthCount: 1,
    startMonth: "2026-09",
  });

  assert.equal(months[0]?.totalIncomeCents, 10_000);
});

test("projette un périmètre vide à zéro sans approximation", () => {
  const months = projectFutureMonths({
    expenses: [],
    goals: [],
    incomes: [],
    monthCount: 2,
    startMonth: "2026-09",
  });

  assert.equal(months.length, 2);
  assert.ok(
    months.every((month) => month.projectedAvailableCents === 0),
  );
});

test("conserve un disponible projeté négatif explicite", () => {
  const months = projectFutureMonths({
    expenses: [income(65_000)],
    goals: [],
    incomes: [income(50_000)],
    monthCount: 1,
    startMonth: "2026-09",
  });

  assert.equal(months[0]?.projectedAvailableCents, -15_000);
});

test("refuse un mois de départ ou un horizon invalide", () => {
  assert.throws(() =>
    projectFutureMonths({
      expenses: [],
      goals: [],
      incomes: [],
      monthCount: 3,
      startMonth: "2026-13",
    }),
  );
  assert.throws(() =>
    projectFutureMonths({
      expenses: [],
      goals: [],
      incomes: [],
      monthCount: 0,
      startMonth: "2026-09",
    }),
  );
  assert.throws(() =>
    projectFutureMonths({
      expenses: [],
      goals: [],
      incomes: [],
      monthCount: MAX_PROJECTION_MONTHS + 1,
      startMonth: "2026-09",
    }),
  );
  assert.throws(() =>
    projectFutureMonths({
      expenses: [],
      goals: [],
      incomes: [],
      monthCount: 2.5,
      startMonth: "2026-09",
    }),
  );
});

test("refuse les entrées récurrentes et allocations incohérentes", () => {
  assert.throws(() =>
    projectFutureMonths({
      expenses: [],
      goals: [],
      incomes: [income(-100)],
      monthCount: 1,
      startMonth: "2026-09",
    }),
  );
  assert.throws(() =>
    projectFutureMonths({
      expenses: [],
      goals: [],
      incomes: [income(100, "oui")],
      monthCount: 1,
      startMonth: "2026-09",
    }),
  );
  assert.throws(() =>
    projectFutureMonths({
      expenses: [],
      goals: [],
      incomes: [income(100, true, "2026-02-30")],
      monthCount: 1,
      startMonth: "2026-09",
    }),
  );
  assert.throws(() =>
    projectFutureMonths({
      expenses: [],
      goals: [{ monthlyAllocationCents: -5 }],
      incomes: [],
      monthCount: 1,
      startMonth: "2026-09",
    }),
  );
});

test("refuse un cumul qui dépasse la précision entière", () => {
  assert.throws(() =>
    projectFutureMonths({
      expenses: [],
      goals: [],
      incomes: [
        income(Number.MAX_SAFE_INTEGER),
        income(1),
      ],
      monthCount: 1,
      startMonth: "2026-09",
    }),
  );
});
