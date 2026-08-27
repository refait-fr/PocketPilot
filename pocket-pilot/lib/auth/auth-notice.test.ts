import assert from "node:assert/strict";
import test from "node:test";

import { getAuthNotice } from "./auth-notice.ts";

test("retourne uniquement les messages Auth internes autorisés", () => {
  assert.deepEqual(getAuthNotice("account-deleted"), {
    kind: "success",
    message: "Votre compte et ses données ont été supprimés.",
  });
  assert.deepEqual(getAuthNotice("signed-out"), {
    kind: "success",
    message: "Vous êtes déconnecté.",
  });
  assert.deepEqual(getAuthNotice("confirmation-link-invalid"), {
    kind: "error",
    message: "Le lien de confirmation est invalide ou a expiré.",
  });
  assert.deepEqual(getAuthNotice("confirmation-failed"), {
    kind: "error",
    message:
      "La confirmation n’a pas pu être finalisée. Demandez un nouveau lien.",
  });
  assert.deepEqual(getAuthNotice("recovery-link-invalid"), {
    kind: "error",
    message: "Le lien de réinitialisation est invalide ou a expiré.",
  });
});

test("ignore les messages Auth inconnus ou contrôlés par l’URL", () => {
  for (const value of [
    undefined,
    null,
    "",
    "Votre compte a été piraté",
    "<script>alert(1)</script>",
    "javascript:alert(1)",
    "constructor",
    "toString",
    "__proto__",
    ["signed-out"],
  ]) {
    assert.equal(getAuthNotice(value), undefined);
  }
});
