import assert from "node:assert/strict";
import test from "node:test";

import { validateProfileSettings } from "./profile-settings.ts";

test("accepte un fuseau valide et une devise supportée", () => {
  const result = validateProfileSettings({
    currencyCode: "EUR",
    currentCurrencyCode: "EUR",
    hasFinancialData: true,
    timeZone: "America/New_York",
  });

  assert.equal(result.valid, true);
});

test("refuse un fuseau invalide", () => {
  const result = validateProfileSettings({
    currencyCode: "EUR",
    currentCurrencyCode: "EUR",
    hasFinancialData: false,
    timeZone: "Paris",
  });

  assert.equal(result.valid, false);
});

test("autorise un changement de devise seulement sans données financières", () => {
  const allowed = validateProfileSettings({
    currencyCode: "USD",
    currentCurrencyCode: "EUR",
    hasFinancialData: false,
    timeZone: "Europe/Paris",
  });
  const blocked = validateProfileSettings({
    currencyCode: "USD",
    currentCurrencyCode: "EUR",
    hasFinancialData: true,
    timeZone: "Europe/Paris",
  });

  assert.equal(allowed.valid, true);
  assert.equal(blocked.valid, false);
});
