import assert from "node:assert/strict";
import test from "node:test";

import {
  buildAuthEmailRedirectUrl,
  resolveSiteOrigin,
} from "./auth-redirect-url.ts";

test("construit les redirections Auth locales et de production", () => {
  assert.equal(
    buildAuthEmailRedirectUrl("http://localhost:3000", "confirmation"),
    "http://localhost:3000/auth/confirm",
  );
  assert.equal(
    buildAuthEmailRedirectUrl("https://app.pocketpilot.example", "recovery"),
    "https://app.pocketpilot.example/auth/callback?next=%2Fauth%2Freset-password",
  );
});

test("utilise localhost uniquement hors production quand SITE_URL manque", () => {
  assert.equal(resolveSiteOrigin(undefined, "development"), "http://localhost:3000");
  assert.throws(() => resolveSiteOrigin(undefined, "production"));
});

test("refuse une origine Auth non sûre ou contenant un chemin", () => {
  for (const value of [
    "https://evil.example@pocketpilot.example",
    "http://pocketpilot.example",
    "javascript:alert(1)",
    "//evil.example",
    "https://pocketpilot.example/auth",
    "https://pocketpilot.example?next=https://evil.example",
    "https://pocketpilot.example#evil",
  ]) {
    assert.throws(() => resolveSiteOrigin(value, "production"));
  }
});
