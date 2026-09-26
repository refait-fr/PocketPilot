import assert from "node:assert/strict";
import test from "node:test";

import { getBudgetTone } from "./budget-tone.ts";

test("retourne ok sous 85 % (dans les clous)", () => {
  assert.equal(getBudgetTone(0), "ok");
  assert.equal(getBudgetTone(72), "ok");
  assert.equal(getBudgetTone(84.99), "ok");
});

test("retourne warning entre 85 % et 100 % inclus (attention)", () => {
  assert.equal(getBudgetTone(85), "warning");
  assert.equal(getBudgetTone(92), "warning");
  assert.equal(getBudgetTone(100), "warning");
});

test("retourne danger au-delà de 100 % (dépassé)", () => {
  assert.equal(getBudgetTone(100.01), "danger");
  assert.equal(getBudgetTone(105), "danger");
  assert.equal(getBudgetTone(250), "danger");
});

test("rejette les pourcentages non finis", () => {
  assert.throws(() => getBudgetTone(Number.NaN), /pourcentage/);
  assert.throws(() => getBudgetTone(Number.POSITIVE_INFINITY), /pourcentage/);
});
