import assert from "node:assert/strict";
import test from "node:test";

import { resolveActiveTab } from "./navigation.ts";

test("retourne l’onglet exact pour chaque écran principal", () => {
  assert.equal(resolveActiveTab("/dashboard"), "/dashboard");
  assert.equal(resolveActiveTab("/transactions"), "/transactions");
  assert.equal(resolveActiveTab("/budgets"), "/budgets");
  assert.equal(resolveActiveTab("/goals"), "/goals");
  assert.equal(resolveActiveTab("/purchase-checker"), "/purchase-checker");
});

test("associe les sous-routes à leur onglet parent", () => {
  assert.equal(resolveActiveTab("/transactions/rapide"), "/transactions");
  assert.equal(resolveActiveTab("/transactions/importer"), "/transactions");
  assert.equal(resolveActiveTab("/goals/nouveau"), "/goals");
});

test("ne met jamais Home actif sur un écran qui n’est pas le Home", () => {
  assert.notEqual(resolveActiveTab("/goals"), "/dashboard");
  assert.equal(resolveActiveTab("/goals"), "/goals");
  assert.notEqual(resolveActiveTab("/budgets"), "/dashboard");
});

test("retourne null pour les écrans sans onglet dédié", () => {
  assert.equal(resolveActiveTab("/settings"), null);
  assert.equal(resolveActiveTab("/incomes"), null);
  assert.equal(resolveActiveTab("/expenses"), null);
  assert.equal(resolveActiveTab("/projection"), null);
  assert.equal(resolveActiveTab("/"), null);
});
