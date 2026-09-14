import type {
  OneTimeIncomeInputFieldErrors,
  OneTimeIncomeInputValues,
} from "@/lib/finance/one-time-income-input";

export type OneTimeIncomeActionState = {
  fieldErrors: OneTimeIncomeInputFieldErrors;
  message: string;
  status: "error" | "idle" | "success";
  values: OneTimeIncomeInputValues;
};

export type OneTimeIncomeView = {
  amountCents: number;
  id: string;
  incomeDate: string;
  label: string;
};

export type OneTimeIncomeFormAction = (
  state: OneTimeIncomeActionState,
  formData: FormData,
) => Promise<OneTimeIncomeActionState>;

export type OneTimeIncomeUpdateAction = (
  incomeId: string,
  state: OneTimeIncomeActionState,
  formData: FormData,
) => Promise<OneTimeIncomeActionState>;

export type OneTimeIncomeDeleteAction = (
  incomeId: string,
  state: OneTimeIncomeActionState,
  formData: FormData,
) => Promise<OneTimeIncomeActionState>;
