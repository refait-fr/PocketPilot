"use client";

import {
  recurringEntryCopy,
  type RecurringEntryKind,
} from "@/app/_components/recurring-entry/recurring-entry-copy";
import { RecurringEntryForm } from "@/app/_components/recurring-entry/recurring-entry-form";
import { RecurringEntryRow } from "@/app/_components/recurring-entry/recurring-entry-row";
import type {
  RecurringEntryDeleteAction,
  RecurringEntryFormAction,
  RecurringEntryToggleAction,
  RecurringEntryUpdateAction,
  RecurringEntryView,
} from "@/app/_components/recurring-entry/recurring-entry-types";
import { CreationDisclosure } from "@/app/_components/creation-disclosure";
import { formatCents } from "@/lib/finance/format-cents";
import { summarizeRecurringEntries } from "@/lib/dashboard/recurring-entry-detail";

export function RecurringEntryManagement({
  createEntry,
  currencyCode,
  deleteEntry,
  entries,
  kind,
  setEntryActive,
  updateEntry,
}: {
  createEntry: RecurringEntryFormAction;
  currencyCode: string;
  deleteEntry: RecurringEntryDeleteAction;
  entries: RecurringEntryView[];
  kind: RecurringEntryKind;
  setEntryActive: RecurringEntryToggleAction;
  updateEntry: RecurringEntryUpdateAction;
}) {
  const summary = summarizeRecurringEntries(entries);
  const copy = recurringEntryCopy[kind];
  const listTitleId = `${kind}-list-title`;

  return (
    <div className="management-stack">
      <section aria-labelledby={listTitleId} className="min-w-0">
        <dl className="finance-summary recurring-summary" aria-label={kind === "income" ? "Synthèse des revenus" : "Synthèse des charges fixes"}>
          <div className="pilot-metric pilot-metric-primary">
            <dt>Total mensuel actif</dt>
            <dd>{formatCents(summary.totalActiveCents, currencyCode)}</dd>
          </div>
          <div className="pilot-metric">
            <dt>Entrées actives</dt>
            <dd>{summary.activeCount}</dd>
          </div>
          <div className="pilot-metric">
            <dt>En pause</dt>
            <dd>{summary.inactiveCount}</dd>
          </div>
        </dl>

        <div className="management-list-heading">
          <div>
            <p className="ui-kicker">
              {summary.totalCount} entrée{summary.totalCount > 1 ? "s" : ""}
            </p>
            <h2
              className="management-title"
              id={listTitleId}
            >
              {copy.listTitle}
            </h2>
          </div>
          <span className="ui-badge">{summary.activeCount} active{summary.activeCount > 1 ? "s" : ""}</span>
        </div>

        {entries.length === 0 ? (
          <div className="ui-empty">
            <h3>
              {copy.emptyTitle}
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--ink-soft)]">
              {copy.emptyDescription}
            </p>
          </div>
        ) : (
          <ul className="ui-divider-list ui-panel dense-finance-list overflow-hidden">
            {entries.map((entry) => (
              <RecurringEntryRow
                currencyCode={currencyCode}
                deleteEntry={deleteEntry}
                entry={entry}
                key={entry.id}
                kind={kind}
                setEntryActive={setEntryActive}
                updateEntry={updateEntry}
              />
            ))}
          </ul>
        )}
      </section>
      <CreationDisclosure
        buttonLabel={kind === "income" ? "Ajouter un revenu" : "Ajouter une charge"}
        defaultOpen={entries.length === 0}
        description={copy.formDescription}
        eyebrow={copy.formEyebrow}
        title={copy.formTitle}
      >
        <RecurringEntryForm action={createEntry} kind={kind} mode="create" />
      </CreationDisclosure>
    </div>
  );
}
