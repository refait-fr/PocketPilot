"use server";

import { revalidatePath } from "next/cache";

import { getCalendarDateInTimeZone } from "@/lib/finance/calendar-month";
import {
  parseCsvImport,
  type CsvImportRow,
  type CsvImportRowError,
} from "@/lib/finance/csv-import";
import { fetchUserCategoryNames } from "@/lib/transactions/user-categories";
import { requireAuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";
import { logServerError } from "@/lib/observability/server-log";

const MAX_IMPORT_CONTENT_CHARS = 200_000;
const MAX_IMPORT_ROWS = 500;

export type ImporterPreview = {
  content: string;
  rowErrors: CsvImportRowError[];
  validRows: CsvImportRow[];
};

export type ImporterPreviewState = {
  message: string;
  preview: ImporterPreview | null;
  status: "error" | "idle" | "success";
};

export type ImporterConfirmState = {
  committedCount: number;
  message: string;
  skippedCount: number;
  status: "error" | "idle" | "success";
};

function previewError(message: string): ImporterPreviewState {
  return { message, preview: null, status: "error" };
}

async function readUploadedContent(formData: FormData): Promise<string | null> {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  if (file.size > MAX_IMPORT_CONTENT_CHARS) {
    throw new Error("Le fichier dépasse la taille maximale autorisée (200 Ko).");
  }

  return file.text();
}

/**
 * Applique la règle anti-futur des transactions aux lignes valides : une
 * ligne datée après aujourd’hui rejoint les erreurs au lieu d’être importée.
 */
function splitFutureRows(
  rows: readonly CsvImportRow[],
  maximumTransactionDate: string,
): { futureErrors: CsvImportRowError[]; keptRows: CsvImportRow[] } {
  const futureErrors: CsvImportRowError[] = [];
  const keptRows: CsvImportRow[] = [];

  for (const row of rows) {
    if (row.date > maximumTransactionDate) {
      futureErrors.push({
        lineNumber: row.lineNumber,
        message: "Une transaction future ne peut pas être enregistrée.",
      });
    } else {
      keptRows.push(row);
    }
  }

  futureErrors.sort((first, second) => first.lineNumber - second.lineNumber);

  return { futureErrors, keptRows };
}

export async function previewCsvImport(
  _previousState: ImporterPreviewState,
  formData: FormData,
): Promise<ImporterPreviewState> {
  let content: string;

  try {
    const uploaded = await readUploadedContent(formData);

    if (uploaded === null) {
      return previewError("Choisissez un fichier CSV à analyser.");
    }

    content = uploaded;
  } catch {
    return previewError("Le fichier dépasse la taille maximale autorisée (200 Ko).");
  }

  if (content.length > MAX_IMPORT_CONTENT_CHARS) {
    return previewError("Le fichier dépasse la taille maximale autorisée (200 Ko).");
  }

  const { profile, supabase, userId } = await requireAuthenticatedProfile();
  const customCategories = await fetchUserCategoryNames({ supabase, userId });
  const parsed = parseCsvImport(content, { customCategories });
  const maximumTransactionDate = getCalendarDateInTimeZone(new Date(), profile.timeZone);
  const { futureErrors, keptRows } = splitFutureRows(parsed.validRows, maximumTransactionDate);
  const rowErrors = [...parsed.rowErrors, ...futureErrors].sort(
    (first, second) => first.lineNumber - second.lineNumber,
  );

  if (keptRows.length + rowErrors.length > MAX_IMPORT_ROWS) {
    return previewError(
      `L’import est limité à ${MAX_IMPORT_ROWS} lignes : réduisez le fichier et réessayez.`,
    );
  }

  if (keptRows.length === 0 && rowErrors.length === 0) {
    return previewError("Le fichier ne contient aucune ligne à importer.");
  }

  return {
    message:
      keptRows.length === 0
        ? "Aucune ligne valide : corrigez le fichier et relancez l’analyse."
        : `${keptRows.length} ligne${keptRows.length > 1 ? "s" : ""} prête${keptRows.length > 1 ? "s" : ""} à importer${rowErrors.length > 0 ? `, ${rowErrors.length} en erreur` : ""}. Vérifiez l’aperçu puis confirmez.`,
    preview: { content, rowErrors, validRows: keptRows },
    status: "success",
  };
}

export async function confirmCsvImport(
  _previousState: ImporterConfirmState,
  formData: FormData,
): Promise<ImporterConfirmState> {
  const rawContent = formData.get("content");

  if (typeof rawContent !== "string" || rawContent.length === 0) {
    return { committedCount: 0, message: "Relancez l’analyse avant de confirmer.", skippedCount: 0, status: "error" };
  }

  if (rawContent.length > MAX_IMPORT_CONTENT_CHARS) {
    return { committedCount: 0, message: "Le contenu dépasse la taille maximale autorisée (200 Ko).", skippedCount: 0, status: "error" };
  }

  const { profile, supabase, userId } = await requireAuthenticatedProfile();
  const customCategories = await fetchUserCategoryNames({ supabase, userId });
  // Le contenu est réanalysé côté serveur au moment de la confirmation :
  // l’aperçu ne fait jamais foi pour l’écriture.
  const parsed = parseCsvImport(rawContent, { customCategories });
  const maximumTransactionDate = getCalendarDateInTimeZone(new Date(), profile.timeZone);
  const { keptRows } = splitFutureRows(parsed.validRows, maximumTransactionDate);

  if (keptRows.length === 0) {
    return { committedCount: 0, message: "Aucune ligne valide à importer.", skippedCount: parsed.rowErrors.length, status: "error" };
  }

  if (keptRows.length > MAX_IMPORT_ROWS) {
    return { committedCount: 0, message: `L’import est limité à ${MAX_IMPORT_ROWS} lignes.`, skippedCount: 0, status: "error" };
  }

  const { error } = await supabase.from("transactions").insert(
    keptRows.map((row) => ({
      amount_cents: row.amountCents,
      category: row.category,
      description: row.label,
      transaction_date: row.date,
      user_id: userId,
    })),
  );

  if (error) {
    logServerError("transactions:import", error);
    return { committedCount: 0, message: "L’import n’a pas pu être enregistré. Réessayez dans un instant.", skippedCount: 0, status: "error" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/budgets");
  revalidatePath("/purchase-checker");
  revalidatePath("/transactions");

  const skippedCount = parsed.rowErrors.length + (parsed.validRows.length - keptRows.length);

  return {
    committedCount: keptRows.length,
    message: `${keptRows.length} transaction${keptRows.length > 1 ? "s" : ""} importée${keptRows.length > 1 ? "s" : ""}${skippedCount > 0 ? `, ${skippedCount} ligne${skippedCount > 1 ? "s" : ""} ignorée${skippedCount > 1 ? "s" : ""}` : ""}.`,
    skippedCount,
    status: "success",
  };
}


