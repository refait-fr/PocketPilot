import assert from "node:assert/strict";
import test from "node:test";

import { MAX_MONEY_CENTS } from "../finance/money.ts";
import {
  calculateCategoryBudgetUsage,
  calculateCategoryBudgetUsages,
  summarizeCategoryBudgets,
  validateCategoryBudgetInput,
} from "./category-budget.ts";

const shoppingBudget = {
  category: "Shopping" as const,
  id: "shopping-budget",
  monthlyBudgetCents: 10_000,
};

test("totalise les transactions par catégorie", () => {
  const [shopping, transport] = calculateCategoryBudgetUsages(
    [shoppingBudget, { category: "Transport", id: "transport-budget", monthlyBudgetCents: 5_000 }],
    [
      { amountCents: 4_000, category: "Shopping" },
      { amountCents: 3_500, category: "Shopping" },
      { amountCents: 1_000, category: "Transport" },
    ],
  );
  assert.equal(shopping.spentCents, 7_500);
  assert.equal(transport.spentCents, 1_000);
});

test("calcule le restant et le pourcentage entier consommé", () => {
  const usage = calculateCategoryBudgetUsage({ budget: shoppingBudget, spentCents: 7_201 });
  assert.equal(usage.remainingCents, 2_799);
  assert.equal(usage.percentageConsumed, "72");
});

test("classe les statuts ok, proche, atteint et dépassé aux bornes", () => {
  assert.equal(calculateCategoryBudgetUsage({ budget: shoppingBudget, spentCents: 7_499 }).status, "ok");
  assert.equal(calculateCategoryBudgetUsage({ budget: shoppingBudget, spentCents: 7_500 }).status, "near");
  assert.equal(calculateCategoryBudgetUsage({ budget: shoppingBudget, spentCents: 9_999 }).status, "near");
  assert.equal(calculateCategoryBudgetUsage({ budget: shoppingBudget, spentCents: 10_000 }).status, "reached");
  assert.equal(calculateCategoryBudgetUsage({ budget: shoppingBudget, spentCents: 10_001 }).status, "exceeded");
});

test("gère un budget sans transaction", () => {
  const [usage] = calculateCategoryBudgetUsages([shoppingBudget], []);
  assert.deepEqual(
    { percentage: usage.percentageConsumed, remaining: usage.remainingCents, spent: usage.spentCents, status: usage.status },
    { percentage: "0", remaining: 10_000, spent: 0, status: "ok" },
  );
});

test("conserve un restant négatif en dépassement", () => {
  const usage = calculateCategoryBudgetUsage({ budget: shoppingBudget, spentCents: 10_500 });
  assert.equal(usage.remainingCents, -500);
  assert.equal(usage.percentageConsumed, "105");
});

test("recalcule après un changement de catégorie", () => {
  const before = calculateCategoryBudgetUsages([shoppingBudget], [
    { amountCents: 4_000, category: "Shopping" },
  ]);
  const after = calculateCategoryBudgetUsages([shoppingBudget], [
    { amountCents: 4_000, category: "Transport" },
  ]);
  assert.equal(before[0].spentCents, 4_000);
  assert.equal(after[0].spentCents, 0);
});

test("résume la catégorie la plus consommée et les dépassements", () => {
  const usages = calculateCategoryBudgetUsages(
    [shoppingBudget, { category: "Transport", id: "transport-budget", monthlyBudgetCents: 5_000 }],
    [
      { amountCents: 10_500, category: "Shopping" },
      { amountCents: 1_000, category: "Transport" },
    ],
  );
  const summary = summarizeCategoryBudgets(usages);
  assert.equal(summary.mostConsumed?.category, "Shopping");
  assert.equal(summary.exceededCount, 1);
  assert.equal(summary.totalBudgetCents, 15_000);
  assert.equal(summary.totalSpentCents, 11_500);
  assert.equal(summary.totalRemainingCents, 3_500);
});

test("valide la limite monétaire et refuse son dépassement", () => {
  assert.equal(
    validateCategoryBudgetInput({ category: "Autre", monthlyBudget: "90071992547409,91" }).valid,
    true,
  );
  assert.equal(
    validateCategoryBudgetInput({ category: "Autre", monthlyBudget: "90071992547409,92" }).valid,
    false,
  );
});

test("refuse une catégorie inconnue et un budget non positif", () => {
  assert.equal(validateCategoryBudgetInput({ category: "Voyage", monthlyBudget: "100" }).valid, false);
  assert.equal(validateCategoryBudgetInput({ category: "Shopping", monthlyBudget: "0" }).valid, false);
});

test("détecte les doublons et les overflows de transactions", () => {
  assert.throws(
    () => calculateCategoryBudgetUsages([shoppingBudget, { ...shoppingBudget, id: "duplicate" }], []),
    /plusieurs budgets/,
  );
  assert.throws(
    () => calculateCategoryBudgetUsages([shoppingBudget], [
      { amountCents: MAX_MONEY_CENTS, category: "Shopping" },
      { amountCents: 1, category: "Shopping" },
    ]),
    /précision entière/,
  );
});
