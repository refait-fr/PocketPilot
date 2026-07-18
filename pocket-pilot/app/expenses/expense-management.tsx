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
}: {
  currencyCode: string;
  entries: RecurringEntryView[];
}) {
  return (
    <RecurringEntryManagement
      createEntry={createExpense}
      currencyCode={currencyCode}
      deleteEntry={deleteExpense}
      entries={entries}
      kind="expense"
      setEntryActive={setExpenseActive}
      updateEntry={updateExpense}
    />
  );
}
