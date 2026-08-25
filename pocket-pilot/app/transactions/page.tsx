import { redirect } from "next/navigation";

import { AppShell } from "@/app/_components/app-shell";
import { TransactionManagement } from "@/app/transactions/transaction-management";
import {
  addCalendarMonths,
  formatCalendarMonth,
  formatCalendarMonthParam,
  getCalendarDateInTimeZone,
  getCalendarMonthInTimeZone,
  getCalendarMonthRange,
  isSameCalendarMonth,
  parseCalendarMonthParam,
} from "@/lib/finance/calendar-month";
import { isTransactionCategory } from "@/lib/transactions/categories";
import { summarizeMonthlyTransactions } from "@/lib/transactions/monthly-summary";
import {
  isValidTransactionDate,
  MAX_TRANSACTION_DESCRIPTION_LENGTH,
  readPositiveTransactionCents,
} from "@/lib/transactions/transaction-input";
import { requireAuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[] }>;
}) {
  const { profile, supabase, userId } = await requireAuthenticatedProfile();
  const currentMonth = getCalendarMonthInTimeZone(new Date(), profile.timeZone);
  const rawMonth = (await searchParams).month;
  const selectedMonth =
    rawMonth === undefined ? currentMonth : parseCalendarMonthParam(rawMonth);

  if (!selectedMonth) {
    redirect(`/transactions?month=${formatCalendarMonthParam(currentMonth)}`);
  }

  const range = getCalendarMonthRange(selectedMonth);
  const { data, error } = await supabase
    .from("transactions")
    .select("id, amount_cents, category, description, transaction_date, created_at")
    .eq("user_id", userId)
    .gte("transaction_date", range.startInclusive)
    .lt("transaction_date", range.endExclusive)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Impossible de charger les transactions du mois.");
  }

  const transactions = (data ?? []).map((transaction) => {
    if (
      typeof transaction.id !== "string" ||
      !isTransactionCategory(transaction.category) ||
      typeof transaction.description !== "string" ||
      transaction.description.trim().length > MAX_TRANSACTION_DESCRIPTION_LENGTH ||
      !isValidTransactionDate(transaction.transaction_date)
    ) {
      throw new Error("Une transaction contient des données invalides.");
    }

    return {
      amountCents: readPositiveTransactionCents(transaction.amount_cents),
      category: transaction.category,
      description: transaction.description.trim(),
      id: transaction.id,
      transactionDate: transaction.transaction_date,
    };
  });
  const previousMonth = addCalendarMonths(selectedMonth, -1);
  const nextMonth = addCalendarMonths(selectedMonth, 1);
  const summary = summarizeMonthlyTransactions(transactions);

  return (
    <AppShell
      activePath="/transactions"
      description="Consultez et ajoutez les dépenses ponctuelles du mois."
      eyebrow="Dépenses ponctuelles"
      profile={profile}
      title="Transactions"
    >
      <TransactionManagement
        currencyCode={profile.currencyCode}
        defaultValues={{
          amount: "",
          category: "Alimentation",
          description: "",
          transactionDate: getCalendarDateInTimeZone(new Date(), profile.timeZone),
        }}
        isCurrentMonth={isSameCalendarMonth(selectedMonth, currentMonth)}
        monthLabel={formatCalendarMonth(selectedMonth)}
        nextMonthHref={`/transactions?month=${formatCalendarMonthParam(nextMonth)}`}
        previousMonthHref={`/transactions?month=${formatCalendarMonthParam(previousMonth)}`}
        summary={summary}
        transactions={transactions}
      />
    </AppShell>
  );
}
