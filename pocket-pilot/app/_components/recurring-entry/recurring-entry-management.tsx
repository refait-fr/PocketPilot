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
  const activeEntryCount = entries.filter((entry) => entry.isActive).length;
  const copy = recurringEntryCopy[kind];
  const listTitleId = `${kind}-list-title`;

  return (
    <div className="management-grid">
      <section className="ui-panel management-form-panel">
        <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--accent)]">
          {copy.formEyebrow}
        </p>
        <h2 className="font-display mt-2 text-3xl font-medium tracking-[-0.04em]">
          {copy.formTitle}
        </h2>
        <p className="mb-7 mt-3 text-sm leading-6 text-[var(--ink-soft)]">
          {copy.formDescription}
        </p>
        <RecurringEntryForm action={createEntry} kind={kind} mode="create" />
      </section>

      <section aria-labelledby={listTitleId} className="min-w-0">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
              {activeEntryCount} actif{activeEntryCount > 1 ? "s" : ""}
            </p>
            <h2
              className="font-display mt-1 text-3xl font-medium tracking-[-0.04em]"
              id={listTitleId}
            >
              {copy.listTitle}
            </h2>
          </div>
          <span className="ui-badge bg-[var(--surface-muted)] text-[var(--ink-soft)]">
            {entries.length} au total
          </span>
        </div>

        {entries.length === 0 ? (
          <div className="ui-empty">
            <h3 className="font-display text-2xl font-medium tracking-[-0.035em]">
              {copy.emptyTitle}
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--ink-soft)]">
              {copy.emptyDescription}
            </p>
          </div>
        ) : (
          <ul className="ui-divider-list ui-panel overflow-hidden">
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
    </div>
  );
}
