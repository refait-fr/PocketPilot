import assert from "node:assert/strict";
import test from "node:test";

import { MAX_MONEY_CENTS } from "./money.ts";
import {
  calculatePurchaseImpact,
  classifyPurchase,
  validatePurchaseInput,
} from "./purchase-checker.ts";

test("classe un achat confortable", () => {
  assert.equal(classifyPurchase(50_000, 8_000), "comfortable");
});

test("classe un achat significatif", () => {
  assert.equal(classifyPurchase(50_000, 20_000), "significant");
});

test("classe un achat serré", () => {
  assert.equal(classifyPurchase(25_000, 20_000), "tight");
});

test("classe un achat qui dépasse le budget", () => {
  assert.deepEqual(calculatePurchaseImpact(12_000, 18_000), {
    classification: "over-budget",
    remainingAfterPurchaseCents: -6_000,
  });
});

test("tout achat dépasse un reste réel nul ou négatif", () => {
  assert.equal(classifyPurchase(0, 1), "over-budget");
  assert.equal(classifyPurchase(-100, 1), "over-budget");
});

test("un achat égal au reste réel est serré", () => {
  assert.equal(classifyPurchase(10_000, 10_000), "tight");
});

test("les seuils exacts de 25 % et 75 % sont inclus", () => {
  assert.equal(classifyPurchase(10_000, 2_500), "comfortable");
  assert.equal(classifyPurchase(10_000, 7_500), "significant");
  assert.equal(classifyPurchase(10_000, 7_501), "tight");
});

test("valide et convertit un prix d’un centime sans flottant", () => {
  assert.deepEqual(validatePurchaseInput({ name: "Bonbon", price: "0,01" }), {
    valid: true,
    data: { name: "Bonbon", priceCents: 1 },
    values: { name: "Bonbon", price: "0,01" },
  });
});

test("refuse les prix nuls, négatifs, imprécis ou trop grands", () => {
  for (const price of ["0", "-1", "1,001", "90071992547409,92"]) {
    const result = validatePurchaseInput({ name: "Test", price });
    assert.equal(result.valid, false, price);
  }
});

test("refuse un nom vide", () => {
  const result = validatePurchaseInput({ name: "   ", price: "10" });
  assert.equal(result.valid, false);
  if (!result.valid) {
    assert.equal(result.fieldErrors.name, "Donnez un nom à cet achat.");
  }
});

test("détecte un overflow lors du calcul du reste", () => {
  assert.throws(
    () => calculatePurchaseImpact(-MAX_MONEY_CENTS, 1),
    /précision entière/,
  );
});
