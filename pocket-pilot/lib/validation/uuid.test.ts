import assert from "node:assert/strict";
import test from "node:test";

import { isUuid } from "./uuid.ts";

test("accepte les UUID v4 et v7", () => {
  assert.equal(isUuid("550e8400-e29b-41d4-a716-446655440000"), true);
  assert.equal(isUuid("0190e2c9-7b3e-7a1e-9c9c-9c9c9c9c9c9c"), true);
});

test("refuse les identifiants qui ne sont pas des UUID", () => {
  assert.equal(isUuid("not-an-uuid"), false);
  assert.equal(isUuid("550e8400-e29b-41d4-a716"), false);
  assert.equal(isUuid("550e8400-e29b-41d4-a716-44665544000g"), false);
  assert.equal(isUuid(123), false);
  assert.equal(isUuid(null), false);
});
