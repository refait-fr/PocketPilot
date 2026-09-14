import { isAllowedCategory } from "./allowed-categories.ts";
import {
  MAX_TRANSACTION_DESCRIPTION_LENGTH,
  type TransactionInputValues,
} from "./transaction-input.ts";

const MAX_PREFILL_AMOUNT_LENGTH = 32;
const FALLBACK_CATEGORY = "Alimentation";

function readFirstParam(value: unknown): string {
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === "string" ? first : "";
  }

  return typeof value === "string" ? value : "";
}

/**
 * Normalise les paramètres de pré-remplissage de l’ajout rapide
 * (`/transactions/rapide?montant=…&categorie=…&description=…`), pensés pour
 * être construits par un Raccourci iOS. Ne valide pas le montant : le
 * formulaire et la server action appliquent les règles métier au submit.
 */
export function parseQuickAddParams(
  params: {
    categorie?: unknown;
    description?: unknown;
    montant?: unknown;
  },
  customCategories: readonly string[],
  todayIso: string,
): TransactionInputValues {
  const rawCategory = readFirstParam(params.categorie).trim();

  return {
    amount: readFirstParam(params.montant).trim().slice(0, MAX_PREFILL_AMOUNT_LENGTH),
    category: isAllowedCategory(rawCategory, customCategories)
      ? rawCategory
      : FALLBACK_CATEGORY,
    description: readFirstParam(params.description)
      .trim()
      .slice(0, MAX_TRANSACTION_DESCRIPTION_LENGTH),
    transactionDate: todayIso,
  };
}
