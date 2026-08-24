import assert from "node:assert/strict";
import test from "node:test";

import { classifyPasswordUpdateError } from "./auth-messages.ts";

test("classe les erreurs Auth de mot de passe connues", () => {
  assert.equal(classifyPasswordUpdateError({ code: "weak_password" }), "weak-password");
  assert.equal(classifyPasswordUpdateError({ code: "same_password" }), "same-password");
  assert.equal(
    classifyPasswordUpdateError({ code: "reauthentication_needed" }),
    "reauthentication-required",
  );
  assert.equal(
    classifyPasswordUpdateError({ code: "reauthentication_not_valid" }),
    "reauthentication-invalid",
  );
  assert.equal(
    classifyPasswordUpdateError({ code: "session_expired" }),
    "session-invalid",
  );
  assert.equal(
    classifyPasswordUpdateError({ code: "current_password_required" }),
    "current-password-required",
  );
  assert.equal(
    classifyPasswordUpdateError({ code: "current_password_invalid" }),
    "current-password-invalid",
  );
});

test("classe une erreur Auth inconnue sans exposer son contenu", () => {
  assert.equal(
    classifyPasswordUpdateError({ code: "message_controle_par_un_tiers" }),
    "unexpected",
  );
});
