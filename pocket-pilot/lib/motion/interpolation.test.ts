import assert from "node:assert/strict";
import test from "node:test";

import { interpolateCents } from "./interpolation.ts";

test("interpole au milieu en arrondissant au centime", () => {
  assert.equal(interpolateCents(0, 100, 0.5), 50);
  assert.equal(interpolateCents(0, 199, 0.5), 100);
});

test("borne la progression hors de l'intervalle", () => {
  assert.equal(interpolateCents(0, 1000, -0.2), 0);
  assert.equal(interpolateCents(0, 1000, 1.4), 1000);
});

test("retourne les bornes exactes aux extrémités", () => {
  assert.equal(interpolateCents(250, 750, 0), 250);
  assert.equal(interpolateCents(250, 750, 1), 750);
});

test("gère les montants négatifs et décroissants", () => {
  assert.equal(interpolateCents(1000, -1000, 0.5), 0);
  assert.equal(interpolateCents(-500, -100, 0.5), -300);
});

test("rejette les montants non sûrs et la progression invalide", () => {
  assert.throws(() => interpolateCents(1.5, 100, 0.5));
  assert.throws(() => interpolateCents(0, Number.MAX_SAFE_INTEGER + 1, 0.5));
  assert.throws(() => interpolateCents(0, 100, Number.NaN));
});
