import assert from "node:assert/strict";
import test from "node:test";

import {
  getAllowedCategories,
  isAllowedCategory,
  MAX_CUSTOM_CATEGORY_NAME_LENGTH,
  parseCustomCategoryName,
} from "./allowed-categories.ts";
import { TRANSACTION_CATEGORIES } from "./categories.ts";

test("expose les huit catégories par défaut sans personnalisation", () => {
  assert.deepEqual(getAllowedCategories(), [...TRANSACTION_CATEGORIES]);
  assert.equal(getAllowedCategories().length, 8);
  assert.ok(isAllowedCategory("Alimentation"));
  assert.ok(!isAllowedCategory("Voyage"));
});

test("ajoute les catégories personnelles après les défauts", () => {
  assert.deepEqual(getAllowedCategories(["Perso", "Cadeaux"]), [
    ...TRANSACTION_CATEGORIES,
    "Perso",
    "Cadeaux",
  ]);
  assert.ok(isAllowedCategory("Perso", ["Perso"]));
  assert.ok(!isAllowedCategory("Perso"));
});

test("normalise les doublons et les noms invalides sans échouer", () => {
  assert.deepEqual(
    getAllowedCategories([" Perso ", "Perso", "", "  ", 42, null]),
    [...TRANSACTION_CATEGORIES, "Perso"],
  );
  assert.ok(isAllowedCategory("Perso", [" Perso "]));
});

test("écarte les doublons des défauts et les noms trop longs", () => {
  assert.deepEqual(getAllowedCategories(["shopping", "A".repeat(51)]), [
    ...TRANSACTION_CATEGORIES,
  ]);
  assert.ok(!isAllowedCategory("shopping", ["shopping"]));
});

test("valide un nom de catégorie personnelle", () => {
  assert.deepEqual(parseCustomCategoryName(["Perso"]), {
    valid: false,
    message: "Ajoutez un nom de catégorie.",
  });
  assert.deepEqual(parseCustomCategoryName(""), {
    valid: false,
    message: "Ajoutez un nom de catégorie.",
  });
  assert.deepEqual(parseCustomCategoryName("  "), {
    valid: false,
    message: "Ajoutez un nom de catégorie.",
  });
  assert.deepEqual(
    parseCustomCategoryName("A".repeat(MAX_CUSTOM_CATEGORY_NAME_LENGTH + 1)),
    {
      valid: false,
      message: `Le nom ne peut pas dépasser ${MAX_CUSTOM_CATEGORY_NAME_LENGTH} caractères.`,
    },
  );
  assert.deepEqual(parseCustomCategoryName("transport"), {
    valid: false,
    message: "Cette catégorie existe déjà.",
  });
  assert.deepEqual(parseCustomCategoryName("  Perso  "), {
    valid: true,
    name: "Perso",
  });
});
