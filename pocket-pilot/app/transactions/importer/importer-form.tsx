"use client";

import Link from "next/link";
import { useActionState, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  confirmCsvImport,
  previewCsvImport,
  type ImporterConfirmState,
  type ImporterPreviewState,
} from "@/app/transactions/importer/actions";
import { formatCents } from "@/lib/finance/format-cents";

const initialPreviewState: ImporterPreviewState = {
  message: "",
  preview: null,
  status: "idle",
};

const initialConfirmState: ImporterConfirmState = {
  committedCount: 0,
  message: "",
  skippedCount: 0,
  status: "idle",
};

function AnalyzeSubmitButton({ fileName }: { fileName: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="ui-button-primary min-h-12 px-5 py-3"
      disabled={pending || fileName.length === 0}
      type="submit"
    >
      {pending ? "Analyse…" : "Analyser le fichier"}
    </button>
  );
}

function ConfirmSubmitButton({ count }: { count: number }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="ui-button-primary min-h-12 px-5 py-3"
      disabled={pending}
      type="submit"
    >
      {pending
        ? "Import…"
        : `Confirmer l’import de ${count} transaction${count > 1 ? "s" : ""}`}
    </button>
  );
}

export function ImporterForm({ currencyCode }: { currencyCode: string }) {
  const [previewState, previewFormAction] = useActionState(previewCsvImport, initialPreviewState);
  const [confirmState, confirmFormAction] = useActionState(confirmCsvImport, initialConfirmState);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();
  const preview = previewState.status === "success" ? previewState.preview : null;

  return (
    <div className="grid gap-6">
      <form action={previewFormAction} className="grid gap-4">
        <label className="ui-label" htmlFor={fileInputId}>
          Fichier CSV
          <input
            accept=".csv,text/csv"
            className="ui-input"
            id={fileInputId}
            name="file"
            onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
            ref={fileInputRef}
            required
            type="file"
          />
          <span className="text-xs font-normal text-[var(--ink-soft)]">
            {fileName ? `Fichier choisi : ${fileName}.` : "Sépareur point-virgule, 200 Ko et 500 lignes maximum."}
          </span>
        </label>
        <div>
          <AnalyzeSubmitButton fileName={fileName} />
        </div>
        {previewState.status !== "idle" && !preview ? (
          <p aria-live="polite" className="ui-feedback-error" role="alert">
            {previewState.message}
          </p>
        ) : null}
      </form>

      {preview ? (
        <section aria-label="Aperçu de l’import" className="grid gap-4">
          <p aria-live="polite" className="ui-feedback-success" role="status">
            {previewState.message}
          </p>

          {preview.validRows.length > 0 ? (
            <div>
              <h3 className="management-title">Lignes valides ({preview.validRows.length})</h3>
              <div className="dashboard-table-scroll mt-3">
                <table className="dashboard-transactions-table">
                  <caption className="sr-only">Lignes du fichier prêtes à être importées</caption>
                  <thead><tr><th>Ligne</th><th>Date</th><th>Libellé</th><th>Catégorie</th><th>Montant</th></tr></thead>
                  <tbody>
                    {preview.validRows.map((row) => (
                      <tr key={row.lineNumber}>
                        <td>{row.lineNumber}</td>
                        <td>{row.date}</td>
                        <td><strong>{row.label}</strong></td>
                        <td>{row.category}</td>
                        <td className="font-amount">{formatCents(row.amountCents, currencyCode)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {preview.rowErrors.length > 0 ? (
            <div>
              <h3 className="management-title">Lignes en erreur ({preview.rowErrors.length})</h3>
              <ul className="mt-3 grid gap-2">
                {preview.rowErrors.map((error) => (
                  <li key={error.lineNumber} className="ui-feedback-error">
                    Ligne {error.lineNumber} : {error.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {preview.validRows.length > 0 ? (
            <form action={confirmFormAction} className="grid gap-3">
              <input name="content" type="hidden" value={preview.content} />
              <div className="flex flex-col gap-3 sm:flex-row">
                <ConfirmSubmitButton count={preview.validRows.length} />
                <Link className="ui-button-secondary min-h-12 px-5 py-3" href="/transactions">
                  Retour aux transactions
                </Link>
              </div>
              {confirmState.status !== "idle" ? (
                <p
                  aria-live="polite"
                  className={confirmState.status === "error" ? "ui-feedback-error" : "ui-feedback-success"}
                  role={confirmState.status === "error" ? "alert" : "status"}
                >
                  {confirmState.message}{" "}
                  {confirmState.status === "success" ? (
                    <Link href="/transactions">Voir les transactions<span aria-hidden="true">↗</span></Link>
                  ) : null}
                </p>
              ) : null}
            </form>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
