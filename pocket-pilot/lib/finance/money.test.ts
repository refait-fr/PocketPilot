import assert from "node:assert/strict";
import test from "node:test";

import { parseMoneyInput } from "./money.ts";

const options = {
  allowZero: false,
  emptyMessage: "Saisissez un montant.",
  invalidMessage: "Saisissez un montant numérique.",
};

test("convertit un montant français en centimes", () => {
  assert.deepEqual(parseMoneyInput("1000,00", options), {
    valid: true,
    amountCents: 100_000,
  });
  assert.deepEqual(parseMoneyInput("25.9", options), {
    valid: true,
    amountCents: 2590,
  });
});

test("signale les séparateurs de milliers au lieu des décimales", () => {
  for (const candidate of ["1,000", "1.000", "12 000", "1.000,00"]) {
    assert.equal(parseMoneyInput(candidate, options).valid, false);
  }

  assert.deepEqual(parseMoneyInput("1,000", options), {
    valid: false,
    message: "N’utilisez pas de séparateur de milliers, par exemple 1000,00.",
  });
  assert.deepEqual(parseMoneyInput("1.000,00", options), {
    valid: false,
    message: "N’utilisez pas de séparateur de milliers, par exemple 1000,00.",
  });
});
