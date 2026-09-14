import assert from "node:assert/strict";
import test from "node:test";

import {
  isValidOneTimeIncomeDate,
  validateOneTimeIncomeInput,
} from "./one-time-income-input.ts";

test("valide un dépôt ponctuel et convertit son montant en centimes", () => {
  const result = validateOneTimeIncomeInput({
    amount: "20,00",
    incomeDate: "2026-09-14",
    label: "Dépôt banque",
    maximumIncomeDate: "2026-09-14",
  });

  assert.equal(result.valid, true);

  if (result.valid) {
    assert.deepEqual(result.data, {
      amountCents: 2000,
      incomeDate: "2026-09-14",
      label: "Dépôt banque",
    });
  }
});

test("refuse les montants non positifs et conserve les valeurs en erreur", () => {
  for (const amount of ["", "0", "0,00", "-20", "abc"]) {
    const result = validateOneTimeIncomeInput({
      amount,
      incomeDate: "2026-09-14",
      label: "Dépôt banque",
    });

    assert.equal(result.valid, false);

    if (!result.valid) {
      assert.ok(result.fieldErrors.amount);
      assert.equal(result.values.amount, amount);
    }
  }
});

test("refuse les libellés vides ou trop longs", () => {
  assert.equal(
    validateOneTimeIncomeInput({
      amount: "20,00",
      incomeDate: "2026-09-14",
      label: "   ",
    }).valid,
    false,
  );
  assert.equal(
    validateOneTimeIncomeInput({
      amount: "20,00",
      incomeDate: "2026-09-14",
      label: "a".repeat(101),
    }).valid,
    false,
  );
});

test("refuse les dates impossibles et les revenus futurs", () => {
  assert.equal(isValidOneTimeIncomeDate("2026-02-30"), false);
  assert.equal(isValidOneTimeIncomeDate("14/09/2026"), false);

  const future = validateOneTimeIncomeInput({
    amount: "20,00",
    incomeDate: "2026-09-15",
    label: "Dépôt banque",
    maximumIncomeDate: "2026-09-14",
  });

  assert.equal(future.valid, false);

  if (!future.valid) {
    assert.equal(
      future.fieldErrors.incomeDate,
      "Un revenu futur ne peut pas être enregistré.",
    );
  }
});
