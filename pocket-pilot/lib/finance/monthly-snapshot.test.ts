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
      realAvailableCents: 0,
      totalTransactionsCents: 0,
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
      realAvailableCents: 60_000,
      totalTransactionsCents: 0,
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

test("conserve l’allocation mensuelle quand l’objectif est loin de la cible", () => {
  const snapshot = calculateMonthlySnapshot({
    incomeAmountsCents: [200_000],
    fixedExpenseAmountsCents: [],
    goals: [
      {
        currentAmountCents: 10_000,
        targetAmountCents: 100_000,
        monthlyAllocationCents: 25_000,
      },
    ],
  });

  assert.equal(snapshot.totalGoalAllocationsCents, 25_000);
  assert.equal(snapshot.availableCents, 175_000);
});

test("plafonne l’allocation du dernier mois au montant restant", () => {
  const snapshot = calculateMonthlySnapshot({
    incomeAmountsCents: [200_000],
    fixedExpenseAmountsCents: [],
    goals: [
      {
        currentAmountCents: 95_000,
        targetAmountCents: 100_000,
        monthlyAllocationCents: 10_000,
      },
    ],
  });

  assert.equal(snapshot.totalGoalAllocationsCents, 5_000);
  assert.equal(snapshot.availableCents, 195_000);
});

test("conserve une allocation exactement egale au montant restant", () => {
  const snapshot = calculateMonthlySnapshot({
    incomeAmountsCents: [200_000],
    fixedExpenseAmountsCents: [],
    goals: [
      {
        currentAmountCents: 90_000,
        targetAmountCents: 100_000,
        monthlyAllocationCents: 10_000,
      },
    ],
  });

  assert.equal(snapshot.totalGoalAllocationsCents, 10_000);
  assert.equal(snapshot.availableCents, 190_000);
});

test("refuse un objectif dont le montant actuel depasse la cible", () => {
  assert.throws(() =>
    calculateMonthlySnapshot({
      incomeAmountsCents: [],
      fixedExpenseAmountsCents: [],
      goals: [
        {
          currentAmountCents: 100_001,
          targetAmountCents: 100_000,
          monthlyAllocationCents: 10_000,
        },
      ],
    }),
  );
});

test("conserve un reste négatif explicite", () => {
  const snapshot = calculateMonthlySnapshot({
    incomeAmountsCents: [50_000],
    fixedExpenseAmountsCents: [65_000],
    goals: [],
  });

  assert.equal(snapshot.availableCents, -15_000);
});

test("calcule le total des transactions et le reste réel", () => {
  const snapshot = calculateMonthlySnapshot({
    fixedExpenseAmountsCents: [45_000],
    goals: [
      {
        currentAmountCents: 0,
        monthlyAllocationCents: 20_000,
        targetAmountCents: 100_000,
      },
    ],
    incomeAmountsCents: [120_000],
    transactionAmountsCents: [10_000, 3_700],
  });

  assert.equal(snapshot.availableCents, 55_000);
  assert.equal(snapshot.totalTransactionsCents, 13_700);
  assert.equal(snapshot.realAvailableCents, 41_300);
});

test("conserve un reste réel négatif et gère zéro transaction", () => {
  const withoutTransactions = calculateMonthlySnapshot({
    fixedExpenseAmountsCents: [],
    goals: [],
    incomeAmountsCents: [5_000],
    transactionAmountsCents: [],
  });
  const overspent = calculateMonthlySnapshot({
    fixedExpenseAmountsCents: [],
    goals: [],
    incomeAmountsCents: [5_000],
    transactionAmountsCents: [7_500],
  });

  assert.equal(withoutTransactions.totalTransactionsCents, 0);
  assert.equal(withoutTransactions.realAvailableCents, 5_000);
  assert.equal(overspent.realAvailableCents, -2_500);
});

test("refuse un total de transactions dépassant la précision sûre", () => {
  assert.throws(() =>
    calculateMonthlySnapshot({
      fixedExpenseAmountsCents: [],
      goals: [],
      incomeAmountsCents: [],
      transactionAmountsCents: [Number.MAX_SAFE_INTEGER, 1],
    }),
  );
  assert.throws(() =>
    calculateMonthlySnapshot({
      fixedExpenseAmountsCents: [],
      goals: [],
      incomeAmountsCents: [],
      transactionAmountsCents: [0],
    }),
  );
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
