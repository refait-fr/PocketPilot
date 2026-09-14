import assert from "node:assert/strict";
import test from "node:test";

import {
  AUTH_INPUT_MESSAGES,
  AUTH_PASSWORD_MAX_LENGTH,
  AUTH_PASSWORD_MIN_LENGTH,
  getPasswordValidationMessage,
  getSignInPasswordMessage,
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

test("refuse les emails sans domaine ou à @ multiples", () => {
  for (const candidate of [
    "@example.com",
    "a@b",
    "a@b@c",
    "test..test@example.com",
    ".test@example.com",
    "test@example",
    "test@-example.com",
  ]) {
    assert.deepEqual(readEmailAddress(candidate), {
      valid: false,
      email: candidate.toLowerCase(),
      message: AUTH_INPUT_MESSAGES.invalidEmail,
    });
  }
});

test("accepte les adresses avec sous-domaine ou alias", () => {
  assert.equal(readEmailAddress("user+tag@example.co").valid, true);
  assert.equal(readEmailAddress("prenom.nom@sous.example.fr").valid, true);
});

test("accepte les limites de longueur du mot de passe", () => {
  assert.equal(getPasswordValidationMessage("ab12cd34"), undefined);
  assert.equal(
    getPasswordValidationMessage(`ab12${"cd34".repeat(17)}`),
    undefined,
  );
  assert.equal(AUTH_PASSWORD_MIN_LENGTH, 8);
});

test("refuse un mot de passe trop court ou trop long", () => {
  assert.equal(
    getPasswordValidationMessage("a1b2c3d"),
    AUTH_INPUT_MESSAGES.invalidPassword,
  );
  assert.equal(
    getPasswordValidationMessage(`ab12${"cd34".repeat(18)}`),
    AUTH_INPUT_MESSAGES.invalidPassword,
  );
  assert.ok(
    `ab12${"cd34".repeat(18)}`.length > AUTH_PASSWORD_MAX_LENGTH,
  );
});

test("refuse un mot de passe sans lettre ou sans chiffre", () => {
  assert.equal(
    getPasswordValidationMessage("motdepasse"),
    AUTH_INPUT_MESSAGES.weakPassword,
  );
  assert.equal(
    getPasswordValidationMessage("12345678"),
    AUTH_INPUT_MESSAGES.weakPassword,
  );
  assert.equal(getPasswordValidationMessage("pass1234"), undefined);
});

test("la connexion accepte un mot de passe historique sans chiffre", () => {
  assert.equal(getSignInPasswordMessage("motdepasse"), undefined);
  assert.equal(
    getSignInPasswordMessage(""),
    AUTH_INPUT_MESSAGES.invalidPassword,
  );
});

test("refuse deux mots de passe différents", () => {
  assert.deepEqual(validateNewPassword("motdepasse1", "autremotdepasse1"), {
    valid: false,
    fieldErrors: {
      passwordConfirmation: AUTH_INPUT_MESSAGES.passwordMismatch,
    },
  });
});

test("retourne un mot de passe valide sans le transformer", () => {
  assert.deepEqual(validateNewPassword(" motdepasse1 ", " motdepasse1 "), {
    valid: true,
    password: " motdepasse1 ",
  });
});
