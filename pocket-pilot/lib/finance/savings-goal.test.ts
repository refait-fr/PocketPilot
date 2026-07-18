import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateSavingsGoalPlan,
  estimateCompletionMonth,
  validateSavingsGoalInput,
} from "./savings-goal.ts";

test("valide la création d’un objectif et convertit chaque montant en centimes", () => {
  const result = validateSavingsGoalInput({
    name: "  Permis de conduire  ",
    targetAmount: "1800,00",
    currentAmount: "250,50",
    monthlyAllocation: "125,25",
  });

  assert.equal(result.valid, true);

  if (result.valid) {
    assert.deepEqual(result.data, {
      name: "Permis de conduire",
      targetAmountCents: 180_000,
      currentAmountCents: 25_050,
      monthlyAllocationCents: 12_525,
    });
  }
});

test("refuse une cible nulle, négative ou non numérique", () => {
  for (const targetAmount of ["0", "0,00", "-1", "objectif"]) {
    const result = validateSavingsGoalInput({
      name: "Voyage",
      targetAmount,
      currentAmount: "0",
      monthlyAllocation: "50",
    });

    assert.equal(result.valid, false);
  }
});

test("refuse un montant actuel négatif ou supérieur à la cible", () => {
  for (const currentAmount of ["-0,01", "1000,01"]) {
    const result = validateSavingsGoalInput({
      name: "Ordinateur",
      targetAmount: "1000",
      currentAmount,
      monthlyAllocation: "100",
    });

    assert.equal(result.valid, false);
  }
});

test("autorise un montant actuel égal à la cible", () => {
  const result = validateSavingsGoalInput({
    name: "Caution",
    targetAmount: "750",
    currentAmount: "750,00",
    monthlyAllocation: "0",
  });

  assert.equal(result.valid, true);
});

test("marque un objectif égal à sa cible comme atteint", () => {
  assert.deepEqual(
    calculateSavingsGoalPlan({
      targetAmountCents: 75_000,
      currentAmountCents: 75_000,
      monthlyAllocationCents: 10_000,
    }),
    {
      estimatedMonths: 0,
      isReached: true,
      progressPercent: 100,
      remainingAmountCents: 0,
    },
  );
});

test("n’estime aucune durée lorsque l’allocation est nulle", () => {
  const plan = calculateSavingsGoalPlan({
    targetAmountCents: 100_000,
    currentAmountCents: 20_000,
    monthlyAllocationCents: 0,
  });

  assert.equal(plan.isReached, false);
  assert.equal(plan.estimatedMonths, null);
});

test("estime une division mensuelle exacte", () => {
  const plan = calculateSavingsGoalPlan({
    targetAmountCents: 100_000,
    currentAmountCents: 20_000,
    monthlyAllocationCents: 20_000,
  });

  assert.equal(plan.estimatedMonths, 4);
});

test("arrondit une estimation au mois supérieur", () => {
  const plan = calculateSavingsGoalPlan({
    targetAmountCents: 100_001,
    currentAmountCents: 20_000,
    monthlyAllocationCents: 20_000,
  });

  assert.equal(plan.estimatedMonths, 5);
});

test("compte le mois courant comme premier mois d’allocation", () => {
  assert.deepEqual(estimateCompletionMonth({ year: 2026, month: 7 }, 1), {
    year: 2026,
    month: 7,
  });
  assert.deepEqual(estimateCompletionMonth({ year: 2026, month: 7 }, 4), {
    year: 2026,
    month: 10,
  });
});

test("refuse les sous-centimes et les valeurs dépassant la précision sûre", () => {
  for (const targetAmount of ["1000,001", "90071992547409,92"]) {
    const result = validateSavingsGoalInput({
      name: "Projet",
      targetAmount,
      currentAmount: "0",
      monthlyAllocation: "10",
    });

    assert.equal(result.valid, false);
  }
});

test("accepte exactement la cible monétaire sûre maximale", () => {
  const result = validateSavingsGoalInput({
    name: "a".repeat(100),
    targetAmount: "90071992547409,91",
    currentAmount: "90071992547409,91",
    monthlyAllocation: "0",
  });

  assert.equal(result.valid, true);

  if (result.valid) {
    assert.equal(result.data.targetAmountCents, Number.MAX_SAFE_INTEGER);
    assert.equal(result.data.currentAmountCents, Number.MAX_SAFE_INTEGER);
    assert.equal(result.data.name.length, 100);
  }
});

test("refuse les noms vides ou excessivement longs", () => {
  for (const name of ["   ", "a".repeat(101)]) {
    const result = validateSavingsGoalInput({
      name,
      targetAmount: "1000",
      currentAmount: "0",
      monthlyAllocation: "10",
    });

    assert.equal(result.valid, false);
  }
});
