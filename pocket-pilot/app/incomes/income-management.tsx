"use client";

import { RecurringEntryManagement } from "@/app/_components/recurring-entry/recurring-entry-management";
import type { RecurringEntryView } from "@/app/_components/recurring-entry/recurring-entry-types";
import {
  createIncome,
  deleteIncome,
  setIncomeActive,
  updateIncome,
} from "@/app/incomes/actions";

export function IncomeManagement({
  currencyCode,
  entries,
}: {
  currencyCode: string;
  entries: RecurringEntryView[];
}) {
  return (
    <RecurringEntryManagement
      createEntry={createIncome}
      currencyCode={currencyCode}
      deleteEntry={deleteIncome}
      entries={entries}
      kind="income"
      setEntryActive={setIncomeActive}
      updateEntry={updateIncome}
    />
  );
}
