import assert from "node:assert/strict";
import test from "node:test";

import { calculateMonthlySnapshot } from "./monthly-snapshot.ts";

test("calcule un mois vide sans approximation", () => {
  assert.deepEqual(
    calculateMonthlySnapshot({
      incomeAmountsCents: [],
      fixedExpenseAmountsCents: [],
      goals: [],
    }),
    {
      totalIncomeCents: 0,
      totalFixedExpensesCents: 0,
      totalGoalAllocationsCents: 0,
      availableCents: 0,
      activeGoalCount: 0,
    },
  );
});

test("soustrait les charges et les allocations des objectifs actifs", () => {
  assert.deepEqual(
    calculateMonthlySnapshot({
      incomeAmountsCents: [125_050, 24_950],
      fixedExpenseAmountsCents: [70_000, 5_000],
      goals: [
        {
          currentAmountCents: 20_000,
          targetAmountCents: 100_000,
          monthlyAllocationCents: 15_000,
        },
        {
          currentAmountCents: 50_000,
          targetAmountCents: 50_000,
          monthlyAllocationCents: 10_000,
        },
      ],
    }),
    {
      totalIncomeCents: 150_000,
      totalFixedExpensesCents: 75_000,
      totalGoalAllocationsCents: 15_000,
      availableCents: 60_000,
      activeGoalCount: 1,
    },
  );
});

test("recalcule le dashboard après une modification d’allocation", () => {
  const before = calculateMonthlySnapshot({
    incomeAmountsCents: [150_000],
    fixedExpenseAmountsCents: [70_000],
    goals: [
      {
        currentAmountCents: 20_000,
        targetAmountCents: 100_000,
        monthlyAllocationCents: 10_000,
      },
    ],
  });
  const after = calculateMonthlySnapshot({
    incomeAmountsCents: [150_000],
    fixedExpenseAmountsCents: [70_000],
    goals: [
      {
        currentAmountCents: 20_000,
        targetAmountCents: 100_000,
        monthlyAllocationCents: 15_000,
      },
    ],
  });

  assert.equal(before.availableCents, 70_000);
  assert.equal(after.availableCents, 65_000);
});

test("exclut l’allocation d’un objectif atteint", () => {
  const snapshot = calculateMonthlySnapshot({
    incomeAmountsCents: [150_000],
    fixedExpenseAmountsCents: [70_000],
    goals: [
      {
        currentAmountCents: 100_000,
        targetAmountCents: 100_000,
        monthlyAllocationCents: 25_000,
      },
    ],
  });

  assert.equal(snapshot.activeGoalCount, 0);
  assert.equal(snapshot.totalGoalAllocationsCents, 0);
  assert.equal(snapshot.availableCents, 80_000);
});

test("conserve un reste négatif explicite", () => {
  const snapshot = calculateMonthlySnapshot({
    incomeAmountsCents: [50_000],
    fixedExpenseAmountsCents: [65_000],
    goals: [],
  });

  assert.equal(snapshot.availableCents, -15_000);
});

test("recalcule le dashboard après une modification de revenu", () => {
  const before = calculateMonthlySnapshot({
    incomeAmountsCents: [100_000],
    fixedExpenseAmountsCents: [40_000],
    goals: [],
  });
  const after = calculateMonthlySnapshot({
    incomeAmountsCents: [125_000],
    fixedExpenseAmountsCents: [40_000],
    goals: [],
  });

  assert.equal(before.availableCents, 60_000);
  assert.equal(after.availableCents, 85_000);
});

test("recalcule le dashboard après une modification de dépense fixe", () => {
  const before = calculateMonthlySnapshot({
    incomeAmountsCents: [150_000],
    fixedExpenseAmountsCents: [65_000],
    goals: [],
  });
  const after = calculateMonthlySnapshot({
    incomeAmountsCents: [150_000],
    fixedExpenseAmountsCents: [70_000],
    goals: [],
  });

  assert.equal(before.totalFixedExpensesCents, 65_000);
  assert.equal(before.availableCents, 85_000);
  assert.equal(after.totalFixedExpensesCents, 70_000);
  assert.equal(after.availableCents, 80_000);
});

test("retire une dépense désactivée ou supprimée du dashboard", () => {
  const withExpense = calculateMonthlySnapshot({
    incomeAmountsCents: [150_000],
    fixedExpenseAmountsCents: [70_000],
    goals: [],
  });
  const withoutExpense = calculateMonthlySnapshot({
    incomeAmountsCents: [150_000],
    fixedExpenseAmountsCents: [],
    goals: [],
  });

  assert.equal(withExpense.availableCents, 80_000);
  assert.equal(withoutExpense.totalFixedExpensesCents, 0);
  assert.equal(withoutExpense.availableCents, 150_000);
});

test("refuse les montants négatifs et non entiers", () => {
  assert.throws(() =>
    calculateMonthlySnapshot({
      incomeAmountsCents: [-1],
      fixedExpenseAmountsCents: [],
      goals: [],
    }),
  );
  assert.throws(() =>
    calculateMonthlySnapshot({
      incomeAmountsCents: [10.5],
      fixedExpenseAmountsCents: [],
      goals: [],
    }),
  );
});

test("refuse les objectifs incohérents et les dépassements de précision", () => {
  assert.throws(() =>
    calculateMonthlySnapshot({
      incomeAmountsCents: [],
      fixedExpenseAmountsCents: [],
      goals: [
        {
          currentAmountCents: 101,
          targetAmountCents: 100,
          monthlyAllocationCents: 0,
        },
      ],
    }),
  );
  assert.throws(() =>
    calculateMonthlySnapshot({
      incomeAmountsCents: [Number.MAX_SAFE_INTEGER, 1],
      fixedExpenseAmountsCents: [],
      goals: [],
    }),
  );
});
