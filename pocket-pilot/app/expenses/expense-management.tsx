"use client";

import { RecurringEntryManagement } from "@/app/_components/recurring-entry/recurring-entry-management";
import type { RecurringEntryView } from "@/app/_components/recurring-entry/recurring-entry-types";
import {
  createExpense,
  deleteExpense,
  setExpenseActive,
  updateExpense,
} from "@/app/expenses/actions";

export function ExpenseManagement({
  currencyCode,
  entries,
  todayIso,
}: {
  currencyCode: string;
  entries: RecurringEntryView[];
  todayIso: string;
}) {
  return (
    <RecurringEntryManagement
      createEntry={createExpense}
      currencyCode={currencyCode}
      deleteEntry={deleteExpense}
      entries={entries}
      kind="expense"
      setEntryActive={setExpenseActive}
      todayIso={todayIso}
      updateEntry={updateExpense}
    />
  );
}
