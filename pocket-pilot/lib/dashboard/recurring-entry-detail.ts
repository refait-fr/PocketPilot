export type RecurringEntryDashboardKind = "expense" | "income";

import { addCents, readStoredCents } from "../finance/money.ts";

type RecurringEntrySummaryInput = {
  amountCents: number;
  isActive: boolean;
  startDate?: string;
};

export type RecurringEntrySummary = {
  activeCount: number;
  inactiveCount: number;
  totalActiveCents: number;
  totalCount: number;
  upcomingCount: number;
};

export function summarizeRecurringEntries(
  entries: readonly RecurringEntrySummaryInput[],
  // Date calendaire ISO du jour (fuseau du profil) : quand elle est fournie,
  // les entrées actives dont le début est futur sont comptées à part.
  todayIso?: string,
): RecurringEntrySummary {
  let activeCount = 0;
  let totalActiveCents = 0;
  let upcomingCount = 0;

  for (const entry of entries) {
    const amountCents = readStoredCents(entry.amountCents, {
      allowZero: false,
      fieldName: "Le montant récurrent",
    });

    if (
      todayIso !== undefined &&
      typeof entry.startDate === "string" &&
      entry.startDate > todayIso
    ) {
      upcomingCount += 1;
      continue;
    }

    if (entry.isActive) {
      activeCount += 1;
      totalActiveCents = addCents(totalActiveCents, amountCents);
    }
  }

  return {
    activeCount,
    inactiveCount: entries.length - activeCount - upcomingCount,
    totalActiveCents,
    totalCount: entries.length,
    upcomingCount,
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
