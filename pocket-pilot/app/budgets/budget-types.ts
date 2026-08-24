import type {
  CategoryBudgetInputFieldErrors,
  CategoryBudgetInputValues,
  CategoryBudgetUsage,
} from "@/lib/budgets/category-budget";

export type BudgetActionState = {
  fieldErrors: CategoryBudgetInputFieldErrors;
  message: string;
  status: "error" | "idle" | "success";
  values: CategoryBudgetInputValues;
};

export type BudgetFormAction = (
  state: BudgetActionState,
  formData: FormData,
) => Promise<BudgetActionState>;

export type BudgetView = CategoryBudgetUsage;
