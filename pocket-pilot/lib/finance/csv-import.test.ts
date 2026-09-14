import assert from "node:assert/strict";
import test from "node:test";

import { parseCsvImport } from "./csv-import.ts";

test("analyse un fichier valide avec en-tête et décimales françaises", () => {
  const result = parseCsvImport(
    "date;label;montant;categorie\n2026-08-24;Courses;25,90;Alimentation\n2026-08-23;Bus;2.50;Transport",
  );

  assert.deepEqual(result.rowErrors, []);
  assert.deepEqual(result.validRows, [
    {
      amountCents: 2590,
      category: "Alimentation",
      date: "2026-08-24",
      label: "Courses",
      lineNumber: 2,
    },
    {
      amountCents: 250,
      category: "Transport",
      date: "2026-08-23",
      label: "Bus",
      lineNumber: 3,
    },
  ]);
});

test("analyse sans en-tête et ignore les lignes vides et le BOM", () => {
  const result = parseCsvImport(
    "﻿2026-08-24;Courses;25,90;Alimentation\n\n2026-08-23;Bus;2,50;Transport\n",
  );

  assert.deepEqual(result.rowErrors, []);
  assert.equal(result.validRows.length, 2);
  assert.equal(result.validRows[1]?.lineNumber, 3);
});

test("signale chaque ligne invalide sans interrompre l’analyse", () => {
  const result = parseCsvImport(
    [
      "date;label;montant;categorie",
      "2026-08-24;Courses;25,90;Alimentation",
      "2026-02-30;Impossible;10,00;Autre",
      "2026-08-24;;10,00;Autre",
      "2026-08-24;Gratuit;0;Autre",
      "2026-08-24;Milliers;1 000,00;Autre",
      "2026-08-24;Inconnue;10,00;Voyage",
      "2026-08-24;Trop peu;10,00",
    ].join("\n"),
  );

  assert.equal(result.validRows.length, 1);
  assert.deepEqual(
    result.rowErrors.map((error) => error.lineNumber),
    [3, 4, 5, 6, 7, 8],
  );
  assert.ok(
    result.rowErrors.every((error) => error.message.length > 0),
  );
});

test("accepte les catégories personnelles fournies en paramètre", () => {
  const content = "2026-08-24;Cadeau;12,00;Perso";

  assert.equal(
    parseCsvImport(content).rowErrors.length,
    1,
  );
  const result = parseCsvImport(content, {
    customCategories: ["Perso"],
  });

  assert.deepEqual(result.rowErrors, []);
  assert.equal(result.validRows[0]?.category, "Perso");
});

test("refuse les montants négatifs, les dates malformées et les libellés trop longs", () => {
  const result = parseCsvImport(
    [
      "24/08/2026;Mauvais format;10,00;Autre",
      `2026-08-24;${"A".repeat(201)};10,00;Autre`,
      "2026-08-24;Négatif;-5,00;Autre",
    ].join("\n"),
  );

  assert.equal(result.validRows.length, 0);
  assert.equal(result.rowErrors.length, 3);
});

test("retourne un résultat vide pour un contenu vide", () => {
  assert.deepEqual(parseCsvImport(""), { rowErrors: [], validRows: [] });
  assert.deepEqual(parseCsvImport("\n  \n"), {
    rowErrors: [],
    validRows: [],
  });
});
