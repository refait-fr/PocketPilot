import assert from "node:assert/strict";
import test from "node:test";

import {
  formatCentsForInput,
  readPositiveStoredCents,
  validateRecurringEntryInput,
} from "./recurring-entry-input.ts";

test("convertit exactement les montants mensuels en centimes", () => {
  const cases = [
    ["1250", 125_000],
    ["1250,5", 125_050],
    ["1250.50", 125_050],
    ["0,01", 1],
  ] as const;

  for (const [monthlyAmount, expectedCents] of cases) {
    const result = validateRecurringEntryInput({
      label: "Loyer",
      monthlyAmount,
    });
    assert.equal(result.valid, true);

    if (result.valid) {
      assert.equal(result.data.amountCents, expectedCents);
    }
  }
});

test("refuse les montants nuls, négatifs et non numériques", () => {
  for (const monthlyAmount of ["", "0", "0,00", "-25", "abc", "12 50"]) {
    const result = validateRecurringEntryInput({
      label: "Loyer",
      monthlyAmount,
    });
    assert.equal(result.valid, false);
  }
});

test("conserve les valeurs saisies lorsqu’une correction est nécessaire", () => {
  const result = validateRecurringEntryInput({
    label: "  Stage été  ",
    monthlyAmount: "12,345",
  });

  assert.equal(result.valid, false);

  if (!result.valid) {
    assert.deepEqual(result.values, {
      label: "  Stage été  ",
      monthlyAmount: "12,345",
    });
  }
});

test("refuse les sous-centimes et les dépassements de précision", () => {
  for (const monthlyAmount of ["12,345", "90071992547409,92"]) {
    const result = validateRecurringEntryInput({
      label: "Loyer",
      monthlyAmount,
    });
    assert.equal(result.valid, false);
  }
});

test("accepte exactement la valeur monétaire sûre maximale", () => {
  const result = validateRecurringEntryInput({
    label: "a".repeat(100),
    monthlyAmount: "90071992547409,91",
  });

  assert.equal(result.valid, true);

  if (result.valid) {
    assert.equal(result.data.amountCents, Number.MAX_SAFE_INTEGER);
    assert.equal(result.data.label.length, 100);
  }
});

test("normalise le libellé et refuse les longueurs invalides", () => {
  const valid = validateRecurringEntryInput({
    label: "  Loyer étudiant  ",
    monthlyAmount: "650,00",
  });
  assert.equal(valid.valid, true);

  if (valid.valid) {
    assert.equal(valid.data.label, "Loyer étudiant");
  }

  assert.equal(
    validateRecurringEntryInput({ label: "   ", monthlyAmount: "10" }).valid,
    false,
  );
  assert.equal(
    validateRecurringEntryInput({
      label: "a".repeat(101),
      monthlyAmount: "10",
    }).valid,
    false,
  );
});

test("valide et reformate les centimes stockés sans arrondi", () => {
  assert.equal(readPositiveStoredCents("125050"), 125_050);
  assert.equal(formatCentsForInput(125_050), "1250,50");
  assert.throws(() => readPositiveStoredCents(0));
  assert.throws(() => readPositiveStoredCents(Number.MAX_SAFE_INTEGER + 1));
});
