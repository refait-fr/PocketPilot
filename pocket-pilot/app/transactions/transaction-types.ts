import type {
  TransactionInputFieldErrors,
  TransactionInputValues,
} from "@/lib/transactions/transaction-input";
import type { TransactionCategory } from "@/lib/transactions/categories";

export type TransactionActionState = {
  fieldErrors: TransactionInputFieldErrors;
  message: string;
  status: "error" | "idle" | "success";
  values: TransactionInputValues;
};

export type TransactionView = {
  amountCents: number;
  category: TransactionCategory;
  description: string;
  id: string;
  transactionDate: string;
};

export type TransactionFormAction = (
  state: TransactionActionState,
  formData: FormData,
) => Promise<TransactionActionState>;

export type TransactionUpdateAction = (
  transactionId: string,
  state: TransactionActionState,
  formData: FormData,
) => Promise<TransactionActionState>;

export type TransactionDeleteAction = (
  transactionId: string,
  state: TransactionActionState,
  formData: FormData,
) => Promise<TransactionActionState>;
