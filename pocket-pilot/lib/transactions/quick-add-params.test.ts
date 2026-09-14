import assert from "node:assert/strict";
import test from "node:test";

import { MAX_TRANSACTION_DESCRIPTION_LENGTH } from "./transaction-input.ts";
import { parseQuickAddParams } from "./quick-add-params.ts";

const TODAY = "2026-09-14";

test("pré-remplit montant, catégorie et description valides", () => {
  assert.deepEqual(
    parseQuickAddParams(
      { categorie: "Transport", description: "Ticket de bus", montant: "2,50" },
      [],
      TODAY,
    ),
    {
      amount: "2,50",
      category: "Transport",
      description: "Ticket de bus",
      transactionDate: TODAY,
    },
  );
});

test("retombe sur Alimentation pour une catégorie inconnue", () => {
  const parsed = parseQuickAddParams(
    { categorie: "Voyage spatial", montant: "10" },
    ["Cadeaux"],
    TODAY,
  );

  assert.equal(parsed.category, "Alimentation");
  assert.equal(parsed.amount, "10");
});

test("accepte les catégories personnelles de l’utilisateur", () => {
  const parsed = parseQuickAddParams(
    { categorie: "Cadeaux" },
    ["Cadeaux"],
    TODAY,
  );

  assert.equal(parsed.category, "Cadeaux");
});

test("tronque la description et le montant sans échouer", () => {
  const parsed = parseQuickAddParams(
    {
      description: `  ${"x".repeat(MAX_TRANSACTION_DESCRIPTION_LENGTH + 20)}  `,
      montant: "9".repeat(60),
    },
    [],
    TODAY,
  );

  assert.equal(parsed.description.length, MAX_TRANSACTION_DESCRIPTION_LENGTH);
  assert.equal(parsed.amount.length, 32);
  assert.equal(parsed.transactionDate, TODAY);
});

test("ignore les tableaux et les valeurs non textuelles", () => {
  assert.deepEqual(
    parseQuickAddParams(
      { categorie: ["Transport", "Autre"], description: 42, montant: null },
      [],
      TODAY,
    ),
    {
      amount: "",
      category: "Transport",
      description: "",
      transactionDate: TODAY,
    },
  );
});
