import { parseMoneyInput } from "./money.ts";
import { isAllowedCategory } from "../transactions/allowed-categories.ts";
import {
  isValidTransactionDate,
  MAX_TRANSACTION_DESCRIPTION_LENGTH,
} from "../transactions/transaction-input.ts";

export const CSV_IMPORT_HEADER = ["date", "label", "montant", "categorie"];

export type CsvImportRow = {
  amountCents: number;
  category: string;
  date: string;
  label: string;
  lineNumber: number;
};

export type CsvImportRowError = {
  lineNumber: number;
  message: string;
};

export type CsvImportResult = {
  rowErrors: CsvImportRowError[];
  validRows: CsvImportRow[];
};

function splitLines(content: string): string[] {
  return content
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/);
}

function isHeaderLine(cells: readonly string[]): boolean {
  return (
    cells.length === CSV_IMPORT_HEADER.length &&
    cells.every(
      (cell, index) =>
        cell.trim().toLowerCase() === CSV_IMPORT_HEADER[index],
    )
  );
}

function parseRow(
  cells: readonly string[],
  lineNumber: number,
  customCategories: readonly unknown[],
): { valid: true; row: CsvImportRow } | { valid: false; message: string } {
  if (cells.length !== 4) {
    return {
      valid: false,
      message: `La ligne doit contenir 4 colonnes séparées par des points-virgules (${cells.length} trouvées).`,
    };
  }

  const [rawDate = "", rawLabel = "", rawAmount = "", rawCategory = ""] =
    cells;
  const date = rawDate.trim();
  const label = rawLabel.trim();
  const category = rawCategory.trim();

  if (!isValidTransactionDate(date)) {
    return {
      valid: false,
      message: "La date doit être une date ISO valide (AAAA-MM-JJ).",
    };
  }

  if (!label) {
    return { valid: false, message: "Ajoutez un libellé." };
  }

  if (label.length > MAX_TRANSACTION_DESCRIPTION_LENGTH) {
    return {
      valid: false,
      message: `Le libellé ne peut pas dépasser ${MAX_TRANSACTION_DESCRIPTION_LENGTH} caractères.`,
    };
  }

  const parsedAmount = parseMoneyInput(rawAmount.trim(), {
    allowZero: false,
    emptyMessage: "Saisissez un montant.",
    invalidMessage: "Saisissez un montant numérique, par exemple 25,90.",
  });

  if (!parsedAmount.valid) {
    return { valid: false, message: parsedAmount.message };
  }

  if (!isAllowedCategory(category, customCategories)) {
    return { valid: false, message: "Choisissez une catégorie valide." };
  }

  return {
    valid: true,
    row: {
      amountCents: parsedAmount.amountCents,
      category,
      date,
      label,
      lineNumber,
    },
  };
}

/**
 * Analyse un export au format PocketPilot : une ligne par transaction,
 * colonnes `date;label;montant;categorie`, date ISO, montant en décimales
 * françaises (virgule acceptée, sans séparateur de milliers), catégorie
 * parmi les 8 défauts ou la liste personnelle fournie.
 *
 * La première ligne est ignorée lorsqu’elle reprend l’en-tête. Les lignes
 * vides sont ignorées. Chaque ligne en échec est signalée dans `rowErrors`
 * avec son numéro de ligne d’origine (base 1) sans interrompre l’analyse.
 */
export function parseCsvImport(
  content: string,
  { customCategories = [] }: { customCategories?: readonly unknown[] } = {},
): CsvImportResult {
  const validRows: CsvImportRow[] = [];
  const rowErrors: CsvImportRowError[] = [];
  const lines = splitLines(content);
  let headerSkipped = false;

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    if (!line.trim()) {
      return;
    }

    const cells = line.split(";");

    if (!headerSkipped && lineNumber === 1 && isHeaderLine(cells)) {
      headerSkipped = true;
      return;
    }

    const parsed = parseRow(cells, lineNumber, customCategories);

    if (parsed.valid) {
      validRows.push(parsed.row);
    } else {
      rowErrors.push({ lineNumber, message: parsed.message });
    }
  });

  return { rowErrors, validRows };
}
