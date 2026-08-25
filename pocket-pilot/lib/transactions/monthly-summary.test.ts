import assert from "node:assert/strict";
import test from "node:test";

import { summarizeMonthlyTransactions } from "./monthly-summary.ts";

test("summarizeMonthlyTransactions returns an empty summary", () => {
  assert.deepEqual(summarizeMonthlyTransactions([]), {
    topCategory: null,
    topCategoryCents: 0,
    totalCents: 0,
    transactionCount: 0,
  });
});

test("summarizeMonthlyTransactions totals cents and identifies the leading category", () => {
  assert.deepEqual(
    summarizeMonthlyTransactions([
      { amountCents: 1_250, category: "Alimentation" },
      { amountCents: 2_500, category: "Transport" },
      { amountCents: 2_000, category: "Alimentation" },
    ]),
    {
      topCategory: "Alimentation",
      topCategoryCents: 3_250,
      totalCents: 5_750,
      transactionCount: 3,
    },
  );
});
