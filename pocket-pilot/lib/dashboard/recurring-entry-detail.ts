export type RecurringEntryDashboardKind = "expense" | "income";

import { addCents, readStoredCents } from "../finance/money.ts";

type RecurringEntrySummaryInput = {
  amountCents: number;
  isActive: boolean;
};

export type RecurringEntrySummary = {
  activeCount: number;
  inactiveCount: number;
  totalActiveCents: number;
  totalCount: number;
};

export function summarizeRecurringEntries(
  entries: readonly RecurringEntrySummaryInput[],
): RecurringEntrySummary {
  let activeCount = 0;
  let totalActiveCents = 0;

  for (const entry of entries) {
    const amountCents = readStoredCents(entry.amountCents, {
      allowZero: false,
      fieldName: "Le montant récurrent",
    });

    if (entry.isActive) {
      activeCount += 1;
      totalActiveCents = addCents(totalActiveCents, amountCents);
    }
  }

  return {
    activeCount,
    inactiveCount: entries.length - activeCount,
    totalActiveCents,
    totalCount: entries.length,
  };
}

type RecurringEntryCounts = {
  activeCount: number;
  totalCount: number;
};

function validateCounts({ activeCount, totalCount }: RecurringEntryCounts) {
  if (
    !Number.isSafeInteger(activeCount) ||
    !Number.isSafeInteger(totalCount) ||
    activeCount < 0 ||
    totalCount < 0 ||
    activeCount > totalCount
  ) {
    throw new Error("Les compteurs d’entrées récurrentes sont invalides.");
  }
}

export function getRecurringEntryDashboardDetail(
  kind: RecurringEntryDashboardKind,
  counts: RecurringEntryCounts,
): string {
  validateCounts(counts);

  const { activeCount, totalCount } = counts;

  if (totalCount === 0) {
    return kind === "income"
      ? "Aucun revenu récurrent enregistré."
      : "Aucune dépense fixe enregistrée.";
  }

  if (activeCount === 0) {
    if (totalCount === 1) {
      return kind === "income"
        ? "Votre revenu récurrent est désactivé."
        : "Votre dépense fixe est désactivée.";
    }

    return kind === "income"
      ? "Tous vos revenus récurrents sont désactivés."
      : "Toutes vos dépenses fixes sont désactivées.";
  }

  if (activeCount < totalCount) {
    return kind === "income"
      ? `${activeCount} revenu${activeCount > 1 ? "s" : ""} actif${activeCount > 1 ? "s" : ""} sur ${totalCount} enregistrés.`
      : `${activeCount} dépense${activeCount > 1 ? "s" : ""} fixe${activeCount > 1 ? "s" : ""} active${activeCount > 1 ? "s" : ""} sur ${totalCount} enregistrées.`;
  }

  if (kind === "income") {
    return `${activeCount} revenu${activeCount > 1 ? "s" : ""} actif${activeCount > 1 ? "s" : ""}.`;
  }

  return `${activeCount} dépense${activeCount > 1 ? "s" : ""} fixe${activeCount > 1 ? "s" : ""} active${activeCount > 1 ? "s" : ""}.`;
}
