import assert from "node:assert/strict";
import test from "node:test";

import { getCategoryInitial } from "./category-initial.ts";

test("retourne l’initiale majuscule de la catégorie", () => {
  assert.equal(getCategoryInitial("Alimentation"), "A");
  assert.equal(getCategoryInitial("Transport"), "T");
  assert.equal(getCategoryInitial("Santé"), "S");
});

test("ignore les espaces superflus", () => {
  assert.equal(getCategoryInitial("  Loisirs  "), "L");
});

test("retourne un tiret pour une catégorie vide", () => {
  assert.equal(getCategoryInitial(""), "–");
  assert.equal(getCategoryInitial("   "), "–");
});
