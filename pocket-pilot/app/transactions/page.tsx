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
import { fetchAllWithRange } from "@/lib/supabase/paginate";
import { isTransactionCategory } from "@/lib/transactions/categories";
import { summarizeMonthlyTransactions } from "@/lib/transactions/monthly-summary";
import {
  isValidTransactionDate,
  MAX_TRANSACTION_DESCRIPTION_LENGTH,
  readPositiveTransactionCents,
} from "@/lib/transactions/transaction-input";
import { requireAuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";

function readFirstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string | string[];
    month?: string | string[];
    q?: string | string[];
  }>;
}) {
  const { profile, supabase, userId } = await requireAuthenticatedProfile();
  const currentMonth = getCalendarMonthInTimeZone(new Date(), profile.timeZone);
  const maximumTransactionDate = getCalendarDateInTimeZone(new Date(), profile.timeZone);
  const params = await searchParams;
  const rawMonth = readFirstParam(params.month);
  const selectedMonth =
    rawMonth === "" ? currentMonth : parseCalendarMonthParam(rawMonth);
  const activeCategory = readFirstParam(params.category);
  const categoryFilter = isTransactionCategory(activeCategory) ? activeCategory : "";
  const searchQuery = readFirstParam(params.q).trim().slice(0, 100);

  if (!selectedMonth) {
    redirect(`/transactions?month=${formatCalendarMonthParam(currentMonth)}`);
  }

  const range = getCalendarMonthRange(selectedMonth);
  let data: {
    id: unknown;
    amount_cents: unknown;
    category: unknown;
    description: unknown;
    transaction_date: unknown;
  }[];

  try {
    data = await fetchAllWithRange((from, to) =>
      supabase
        .from("transactions")
        .select("id, amount_cents, category, description, transaction_date, created_at")
        .eq("user_id", userId)
        .gte("transaction_date", range.startInclusive)
        .lt("transaction_date", range.endExclusive)
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(from, to),
    );
  } catch {
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
  const normalizedQuery = searchQuery.toLowerCase();
  const visibleTransactions = transactions.filter(
    (transaction) =>
      (!categoryFilter || transaction.category === categoryFilter) &&
      (!normalizedQuery ||
        transaction.description.toLowerCase().includes(normalizedQuery)),
  );

  return (
    <AppShell
      activePath="/transactions"
      description="Consultez et ajoutez les dépenses ponctuelles du mois."
      eyebrow="Dépenses ponctuelles"
      profile={profile}
      title="Transactions"
    >
      <TransactionManagement
        activeCategory={categoryFilter}
        allowNextMonth={
          formatCalendarMonthParam(nextMonth) <=
          formatCalendarMonthParam(currentMonth)
        }
        currencyCode={profile.currencyCode}
        defaultValues={{
          amount: "",
          category: "Alimentation",
          description: "",
          transactionDate: maximumTransactionDate,
        }}
        isCurrentMonth={isSameCalendarMonth(selectedMonth, currentMonth)}
        maximumTransactionDate={maximumTransactionDate}
        monthLabel={formatCalendarMonth(selectedMonth)}
        monthParam={formatCalendarMonthParam(selectedMonth)}
        nextMonthHref={`/transactions?month=${formatCalendarMonthParam(nextMonth)}`}
        previousMonthHref={`/transactions?month=${formatCalendarMonthParam(previousMonth)}`}
        searchQuery={searchQuery}
        summary={summary}
        totalCount={transactions.length}
        transactions={visibleTransactions}
      />
    </AppShell>
  );
}
