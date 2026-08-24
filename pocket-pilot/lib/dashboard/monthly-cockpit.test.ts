import assert from "node:assert/strict";
import test from "node:test";

import type { CategoryBudgetUsage } from "../budgets/category-budget.ts";
import {
  buildMonthlyBalanceTrend,
  buildMonthlyInsights,
  rankCategoryBudgets,
  selectFeaturedGoal,
} from "./monthly-cockpit.ts";

function budget(
  category: CategoryBudgetUsage["category"],
  spentCents: number,
  monthlyBudgetCents: number,
  status: CategoryBudgetUsage["status"],
): CategoryBudgetUsage {
  const percentage = (BigInt(spentCents) * BigInt(100)) / BigInt(monthlyBudgetCents);

  return {
    category,
    id: category,
    monthlyBudgetCents,
    percentageConsumed: percentage.toString(),
    progressPercent: Number(percentage > BigInt(100) ? BigInt(100) : percentage),
    remainingCents: monthlyBudgetCents - spentCents,
    spentCents,
    status,
  };
}

test("la courbe retire les transactions cumulées au jour exact", () => {
  const points = buildMonthlyBalanceTrend({
    availableCents: 100_000,
    monthDate: "2026-08-24",
    transactions: [
      { amountCents: 12_000, transactionDate: "2026-08-03" },
      { amountCents: 3_000, transactionDate: "2026-08-03" },
      { amountCents: 8_000, transactionDate: "2026-08-19" },
    ],
  });

  assert.equal(points.length, 32);
  assert.deepEqual(points[0], {
    day: 0,
    remainingCents: 100_000,
    spentCents: 0,
  });
  assert.equal(points[3]?.remainingCents, 85_000);
  assert.equal(points[18]?.remainingCents, 85_000);
  assert.equal(points[19]?.remainingCents, 77_000);
  assert.equal(points[31]?.spentCents, 23_000);
});

test("la courbe reste plate sans transaction", () => {
  const points = buildMonthlyBalanceTrend({
    availableCents: 42_500,
    monthDate: "2026-02-10",
    transactions: [],
  });

  assert.equal(points.length, 29);
  assert.ok(points.every((point) => point.remainingCents === 42_500));
});

test("la courbe refuse une date impossible ou hors du mois", () => {
  assert.throws(() =>
    buildMonthlyBalanceTrend({
      availableCents: 10_000,
      monthDate: "2026-02-10",
      transactions: [{ amountCents: 500, transactionDate: "2026-02-30" }],
    }),
  );
  assert.throws(() =>
    buildMonthlyBalanceTrend({
      availableCents: 10_000,
      monthDate: "2026-02-10",
      transactions: [{ amountCents: 500, transactionDate: "2026-03-01" }],
    }),
  );
});

test("l’objectif actif le plus avancé est mis en avant", () => {
  const featured = selectFeaturedGoal([
    {
      currentAmountCents: 20_000,
      monthlyAllocationCents: 10_000,
      name: "Permis",
      targetAmountCents: 100_000,
    },
    {
      currentAmountCents: 75_000,
      monthlyAllocationCents: 5_000,
      name: "Voyage",
      targetAmountCents: 100_000,
    },
  ]);

  assert.equal(featured?.name, "Voyage");
  assert.equal(featured?.progressPercent, 75);
  assert.equal(featured?.estimatedMonths, 5);
});

test("un objectif atteint n’est choisi que lorsqu’il n’existe aucun objectif actif", () => {
  const featured = selectFeaturedGoal([
    {
      currentAmountCents: 100_000,
      monthlyAllocationCents: 10_000,
      name: "Atteint",
      targetAmountCents: 100_000,
    },
    {
      currentAmountCents: 10_000,
      monthlyAllocationCents: 10_000,
      name: "Actif",
      targetAmountCents: 100_000,
    },
  ]);

  assert.equal(featured?.name, "Actif");
});

test("les budgets sont classés par taux de consommation sans flottants", () => {
  const ranked = rankCategoryBudgets([
    budget("Shopping", 50_000, 100_000, "ok"),
    budget("Transport", 9_000, 10_000, "near"),
  ]);

  assert.deepEqual(
    ranked.map((item) => item.category),
    ["Transport", "Shopping"],
  );
});

test("les insights signalent le reste, le budget critique et la progression", () => {
  const featuredGoal = selectFeaturedGoal([
    {
      currentAmountCents: 35_000,
      monthlyAllocationCents: 10_000,
      name: "Voyage",
      targetAmountCents: 100_000,
    },
  ]);
  const insights = buildMonthlyInsights({
    categoryBudgets: [budget("Shopping", 105_000, 100_000, "exceeded")],
    featuredGoal,
    realAvailableCents: 62_800,
  });

  assert.deepEqual(
    insights.map((insight) => insight.kind),
    ["real-available", "budget-exceeded", "goal-progress"],
  );
  assert.equal(
    insights.find((insight) => insight.kind === "budget-exceeded")?.overrunCents,
    5_000,
  );
});

test("les insights conservent un reste réel négatif explicite", () => {
  const [insight] = buildMonthlyInsights({
    categoryBudgets: [],
    featuredGoal: null,
    realAvailableCents: -2_500,
  });

  assert.deepEqual(insight, {
    amountCents: -2_500,
    kind: "real-available",
    tone: "negative",
  });
});
