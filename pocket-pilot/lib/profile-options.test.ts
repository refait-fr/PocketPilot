import assert from "node:assert/strict";
import test from "node:test";

import { isCurrencyCode, isValidTimeZone } from "./profile-options.ts";

test("accepte uniquement les devises prises en charge par PocketPilot", () => {
  for (const currencyCode of ["EUR", "CHF", "GBP", "USD", "CAD", "MAD", "DZD"]) {
    assert.equal(isCurrencyCode(currencyCode), true);
  }
});

test("refuse les codes de devise invalides ou non pris en charge", () => {
  for (const currencyCode of ["ZZZ", "AAA", "123", "EURO", "eur", "", null]) {
    assert.equal(isCurrencyCode(currencyCode), false);
  }
});

test("accepte les fuseaux horaires reconnus par Intl", () => {
  for (const timeZone of ["Europe/Paris", "America/New_York", "UTC"]) {
    assert.equal(isValidTimeZone(timeZone), true);
  }
});

test("refuse les fuseaux horaires invalides ou mal formés", () => {
  for (const timeZone of ["banana", "Paris", "", " Europe/Paris", null]) {
    assert.equal(isValidTimeZone(timeZone), false);
  }
});
