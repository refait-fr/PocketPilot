import { addCents } from "../finance/money.ts";
import type { TransactionCategory } from "./categories.ts";

type MonthlyTransaction = {
  amountCents: number;
  category: TransactionCategory;
};

export type MonthlyTransactionSummary = {
  topCategory: TransactionCategory | null;
  topCategoryCents: number;
  totalCents: number;
  transactionCount: number;
};

export function summarizeMonthlyTransactions(
  transactions: readonly MonthlyTransaction[],
): MonthlyTransactionSummary {
  const totalsByCategory = new Map<TransactionCategory, number>();
  let totalCents = 0;

  for (const transaction of transactions) {
    totalCents = addCents(totalCents, transaction.amountCents);
    totalsByCategory.set(
      transaction.category,
      addCents(totalsByCategory.get(transaction.category) ?? 0, transaction.amountCents),
    );
  }

  let topCategory: TransactionCategory | null = null;
  let topCategoryCents = 0;

  for (const [category, categoryTotalCents] of totalsByCategory) {
    if (categoryTotalCents > topCategoryCents) {
      topCategory = category;
      topCategoryCents = categoryTotalCents;
    }
  }

  return {
    topCategory,
    topCategoryCents,
    totalCents,
    transactionCount: transactions.length,
  };
}
