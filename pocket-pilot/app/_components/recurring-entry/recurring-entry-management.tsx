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
    <div className="grid gap-6 xl:grid-cols-[minmax(300px,0.72fr)_minmax(0,1.28fr)] xl:items-start">
      <section className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--paper)] p-6 shadow-[0_16px_50px_rgba(23,53,47,0.08)] sm:p-8 xl:sticky xl:top-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-dark)]">
          {copy.formEyebrow}
        </p>
        <h2 className="font-display mt-3 text-3xl font-bold tracking-[-0.04em]">
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
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
              {activeEntryCount} actif{activeEntryCount > 1 ? "s" : ""}
            </p>
            <h2
              className="font-display mt-1 text-3xl font-bold tracking-[-0.04em]"
              id={listTitleId}
            >
              {copy.listTitle}
            </h2>
          </div>
          <span className="rounded-full border border-[var(--line)] bg-[var(--paper)] px-3 py-1.5 text-xs font-bold text-[var(--ink-soft)]">
            {entries.length} au total
          </span>
        </div>

        {entries.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[color:rgba(255,253,247,0.72)] p-8 text-center sm:p-12">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-[var(--sage)] font-display text-2xl font-bold">
              +
            </span>
            <h3 className="font-display mt-5 text-2xl font-bold tracking-[-0.035em]">
              {copy.emptyTitle}
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--ink-soft)]">
              {copy.emptyDescription}
            </p>
          </div>
        ) : (
          <ul className="grid gap-4">
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
