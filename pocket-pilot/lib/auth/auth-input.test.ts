import assert from "node:assert/strict";
import test from "node:test";

import {
  AUTH_INPUT_MESSAGES,
  AUTH_PASSWORD_MAX_LENGTH,
  AUTH_PASSWORD_MIN_LENGTH,
  getPasswordValidationMessage,
  readEmailAddress,
  validateNewPassword,
} from "./auth-input.ts";

test("normalise une adresse email valide", () => {
  assert.deepEqual(readEmailAddress("  User@Example.com "), {
    valid: true,
    email: "user@example.com",
  });
});

test("refuse une adresse email invalide", () => {
  assert.deepEqual(readEmailAddress("adresse-invalide"), {
    valid: false,
    email: "adresse-invalide",
    message: AUTH_INPUT_MESSAGES.invalidEmail,
  });
});

test("accepte les limites de longueur du mot de passe", () => {
  assert.equal(getPasswordValidationMessage("a".repeat(AUTH_PASSWORD_MIN_LENGTH)), undefined);
  assert.equal(getPasswordValidationMessage("a".repeat(AUTH_PASSWORD_MAX_LENGTH)), undefined);
});

test("refuse un mot de passe trop court ou trop long", () => {
  assert.equal(
    getPasswordValidationMessage("a".repeat(AUTH_PASSWORD_MIN_LENGTH - 1)),
    AUTH_INPUT_MESSAGES.invalidPassword,
  );
  assert.equal(
    getPasswordValidationMessage("a".repeat(AUTH_PASSWORD_MAX_LENGTH + 1)),
    AUTH_INPUT_MESSAGES.invalidPassword,
  );
});

test("refuse deux mots de passe différents", () => {
  assert.deepEqual(validateNewPassword("motdepasse", "autremotdepasse"), {
    valid: false,
    fieldErrors: {
      passwordConfirmation: AUTH_INPUT_MESSAGES.passwordMismatch,
    },
  });
});

test("retourne un mot de passe valide sans le transformer", () => {
  assert.deepEqual(validateNewPassword(" motdepasse ", " motdepasse "), {
    valid: true,
    password: " motdepasse ",
  });
});
