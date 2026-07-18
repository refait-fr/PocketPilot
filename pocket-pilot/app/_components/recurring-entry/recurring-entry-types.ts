import type {
  RecurringEntryInputFieldErrors,
  RecurringEntryInputValues,
} from "@/lib/finance/recurring-entry-input";

export type RecurringEntryActionState = {
  status: "idle" | "error" | "success";
  message: string;
  fieldErrors: RecurringEntryInputFieldErrors;
  values: RecurringEntryInputValues;
};

export type RecurringEntryView = {
  id: string;
  label: string;
  amountCents: number;
  isActive: boolean;
};

export type RecurringEntryFormAction = (
  state: RecurringEntryActionState,
  formData: FormData,
) => Promise<RecurringEntryActionState>;

export type RecurringEntryUpdateAction = (
  entryId: string,
  state: RecurringEntryActionState,
  formData: FormData,
) => Promise<RecurringEntryActionState>;

export type RecurringEntryToggleAction = (
  entryId: string,
  nextIsActive: boolean,
  state: RecurringEntryActionState,
  formData: FormData,
) => Promise<RecurringEntryActionState>;

export type RecurringEntryDeleteAction = (
  entryId: string,
  state: RecurringEntryActionState,
  formData: FormData,
) => Promise<RecurringEntryActionState>;
