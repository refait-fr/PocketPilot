import assert from "node:assert/strict";
import test from "node:test";

import { formatCents } from "./format-cents.ts";
import { MAX_MONEY_CENTS } from "./money.ts";

function reference(cents: number, currencyCode = "EUR"): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

test("formate les montants courants à l'identique de la référence", () => {
  for (const cents of [
    0, 1, 99, 100, 2590, 123456, 10_000_000, -1, -2590, -123456,
  ]) {
    assert.equal(formatCents(cents, "EUR"), reference(cents));
  }
});

test("conserve le centime exact au plafond des entiers sûrs", () => {
  const rendered = formatCents(MAX_MONEY_CENTS, "EUR");
  const digits = rendered.replace(/[^0-9,]/g, "");

  assert.equal(digits, "90071992547409,91");
});

test("conserve le signe et les chiffres pour le plafond négatif", () => {
  const rendered = formatCents(-MAX_MONEY_CENTS, "EUR");

  assert.ok(rendered.startsWith("-"));
  assert.equal(rendered.replace(/[^0-9,]/g, ""), "90071992547409,91");
});

test("applique le symbole de la devise demandée", () => {
  assert.ok(formatCents(123456, "USD").includes("$"));
});

test("refuse les montants non entiers et les devises invalides", () => {
  assert.throws(() => formatCents(12.5, "EUR"));
  assert.throws(() => formatCents(100, "EURO"));
  assert.throws(() => formatCents(100, "eur"));
});
