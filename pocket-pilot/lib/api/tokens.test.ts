import assert from "node:assert/strict";
import test from "node:test";

import {
  generateApiToken,
  hashApiToken,
  parseBearerToken,
} from "./tokens.ts";

test("génère des jetons préfixés uniques", async () => {
  const first = await generateApiToken();
  const second = await generateApiToken();

  assert.ok(first.startsWith("pp_"));
  assert.ok(second.startsWith("pp_"));
  assert.notEqual(first, second);
  assert.equal(first.length, second.length);
});

test("hache de façon déterministe en hexadécimal SHA-256", async () => {
  const token = await generateApiToken();
  const first = await hashApiToken(token);
  const second = await hashApiToken(token);

  assert.match(first, /^[0-9a-f]{64}$/);
  assert.equal(first, second);
  assert.notEqual(await hashApiToken(`${token}x`), first);
});

test("extrait le porteur d’un en-tête Authorization valide", async () => {
  const token = await generateApiToken();

  assert.equal(parseBearerToken(`Bearer ${token}`), token);
  assert.equal(parseBearerToken(`  Bearer ${token}  `), token);
});

test("rejette les en-têtes mal formés ou étrangers", () => {
  assert.equal(parseBearerToken(null), null);
  assert.equal(parseBearerToken(""), null);
  assert.equal(parseBearerToken("Bearer "), null);
  assert.equal(parseBearerToken("Basic abc123"), null);
  assert.equal(parseBearerToken("Bearer not-a-pocketpilot-token"), null);
  assert.equal(parseBearerToken("Bearer pp_avec espace"), null);
});
