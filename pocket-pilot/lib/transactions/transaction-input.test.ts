import assert from "node:assert/strict";
import test from "node:test";

import {
  isTransactionCategory,
  TRANSACTION_CATEGORIES,
} from "./categories.ts";
import {
  isValidTransactionDate,
  validateTransactionInput,
} from "./transaction-input.ts";

test("valide une transaction et convertit son montant en centimes", () => {
  const result = validateTransactionInput({
    amount: "137,00",
    category: "Alimentation",
    description: "  Courses du mois  ",
    transactionDate: "2026-08-24",
  });

  assert.equal(result.valid, true);

  if (result.valid) {
    assert.deepEqual(result.data, {
      amountCents: 13_700,
      category: "Alimentation",
      description: "Courses du mois",
      transactionDate: "2026-08-24",
    });
  }
});

test("accepte la limite monétaire et refuse son dépassement", () => {
  const maximum = validateTransactionInput({
    amount: "90071992547409,91",
    category: "Autre",
    description: "",
    transactionDate: "2026-08-24",
  });
  const overflow = validateTransactionInput({
    amount: "90071992547409,92",
    category: "Autre",
    description: "",
    transactionDate: "2026-08-24",
  });

  assert.equal(maximum.valid, true);
  if (maximum.valid) {
    assert.equal(maximum.data.amountCents, Number.MAX_SAFE_INTEGER);
  }
  assert.equal(overflow.valid, false);
});

test("refuse les montants non positifs et conserve les valeurs en erreur", () => {
  const values = {
    amount: "0",
    category: "Transport",
    description: "Métro",
    transactionDate: "2026-08-24",
  };
  const result = validateTransactionInput(values);

  assert.equal(result.valid, false);
  if (!result.valid) {
    assert.deepEqual(result.values, values);
  }
});

test("centralise et valide les catégories autorisées", () => {
  for (const category of TRANSACTION_CATEGORIES) {
    assert.equal(isTransactionCategory(category), true);
  }

  for (const category of ["", "Restaurant", "alimentation", 123]) {
    assert.equal(isTransactionCategory(category), false);
  }

  assert.equal(
    validateTransactionInput({
      amount: "10",
      category: "Restaurant",
      description: "",
      transactionDate: "2026-08-24",
    }).valid,
    false,
  );
});

test("refuse les dates calendaires impossibles", () => {
  assert.equal(isValidTransactionDate("2024-02-29"), true);

  for (const value of ["", "2026-2-01", "2026-02-30", "banana"]) {
    assert.equal(isValidTransactionDate(value), false);
  }
});

test("refuse une transaction future selon la date du profil", () => {
  const baseInput = {
    amount: "10",
    category: "Autre",
    description: "",
    maximumTransactionDate: "2026-08-27",
  };

  for (const transactionDate of ["2026-08-26", "2026-08-27"]) {
    assert.equal(validateTransactionInput({ ...baseInput, transactionDate }).valid, true);
  }

  const tomorrow = validateTransactionInput({
    ...baseInput,
    transactionDate: "2026-08-28",
  });
  assert.equal(tomorrow.valid, false);
  if (!tomorrow.valid) {
    assert.equal(
      tomorrow.fieldErrors.transactionDate,
      "Une transaction future ne peut pas être enregistrée.",
    );
  }
});

test("applique correctement la limite aux changements de mois", () => {
  const januaryLimit = {
    amount: "10",
    category: "Autre",
    description: "",
    maximumTransactionDate: "2027-01-31",
  };

  assert.equal(
    validateTransactionInput({ ...januaryLimit, transactionDate: "2027-01-31" }).valid,
    true,
  );
  assert.equal(
    validateTransactionInput({ ...januaryLimit, transactionDate: "2027-02-01" }).valid,
    false,
  );
});
