import assert from "node:assert/strict";
import test from "node:test";

import {
  getRecurringEntryDashboardDetail,
  summarizeRecurringEntries,
} from "./recurring-entry-detail.ts";

test("résume uniquement les montants récurrents actifs", () => {
  assert.deepEqual(
    summarizeRecurringEntries([
      { amountCents: 120_000, isActive: true },
      { amountCents: 35_000, isActive: false },
      { amountCents: 80_000, isActive: true },
    ]),
    {
      activeCount: 2,
      inactiveCount: 1,
      totalActiveCents: 200_000,
      totalCount: 3,
    },
  );
});

test("distingue l’absence de revenus de revenus tous désactivés", () => {
  assert.equal(
    getRecurringEntryDashboardDetail("income", {
      activeCount: 0,
      totalCount: 0,
    }),
    "Aucun revenu récurrent enregistré.",
  );
  assert.equal(
    getRecurringEntryDashboardDetail("income", {
      activeCount: 0,
      totalCount: 2,
    }),
    "Tous vos revenus récurrents sont désactivés.",
  );
  assert.equal(
    getRecurringEntryDashboardDetail("income", {
      activeCount: 1,
      totalCount: 2,
    }),
    "1 revenu actif sur 2 enregistrés.",
  );
});

test("distingue l’absence de dépenses de dépenses toutes désactivées", () => {
  assert.equal(
    getRecurringEntryDashboardDetail("expense", {
      activeCount: 0,
      totalCount: 0,
    }),
    "Aucune dépense fixe enregistrée.",
  );
  assert.equal(
    getRecurringEntryDashboardDetail("expense", {
      activeCount: 0,
      totalCount: 2,
    }),
    "Toutes vos dépenses fixes sont désactivées.",
  );
  assert.equal(
    getRecurringEntryDashboardDetail("expense", {
      activeCount: 2,
      totalCount: 3,
    }),
    "2 dépenses fixes actives sur 3 enregistrées.",
  );
});

test("emploie un message singulier lorsque l’unique entrée est désactivée", () => {
  assert.equal(
    getRecurringEntryDashboardDetail("income", {
      activeCount: 0,
      totalCount: 1,
    }),
    "Votre revenu récurrent est désactivé.",
  );
  assert.equal(
    getRecurringEntryDashboardDetail("expense", {
      activeCount: 0,
      totalCount: 1,
    }),
    "Votre dépense fixe est désactivée.",
  );
});

test("refuse des compteurs incohérents", () => {
  assert.throws(() =>
    getRecurringEntryDashboardDetail("income", {
      activeCount: 2,
      totalCount: 1,
    }),
  );
});
