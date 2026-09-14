import { redirect } from "next/navigation";

import { AppShell } from "@/app/_components/app-shell";
import { OneTimeIncomeManagement } from "@/app/incomes/ponctuels/one-time-income-management";
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
import { addCents } from "@/lib/finance/money";
import {
  isValidOneTimeIncomeDate,
  readPositiveOneTimeIncomeCents,
} from "@/lib/finance/one-time-income-input";
import { fetchAllWithRange } from "@/lib/supabase/paginate";
import { requireAuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";

function readFirstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function OneTimeIncomesPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[] }>;
}) {
  const { profile, supabase, userId } = await requireAuthenticatedProfile();
  const currentMonth = getCalendarMonthInTimeZone(new Date(), profile.timeZone);
  const maximumIncomeDate = getCalendarDateInTimeZone(new Date(), profile.timeZone);
  const rawMonth = readFirstParam((await searchParams).month);
  const selectedMonth =
    rawMonth === "" ? currentMonth : parseCalendarMonthParam(rawMonth);

  if (!selectedMonth) {
    redirect(`/incomes/ponctuels?month=${formatCalendarMonthParam(currentMonth)}`);
  }

  const range = getCalendarMonthRange(selectedMonth);
  let data: {
    id: unknown;
    label: unknown;
    amount_cents: unknown;
    income_date: unknown;
  }[];

  try {
    data = await fetchAllWithRange((from, to) =>
      supabase
        .from("one_time_incomes")
        .select("id, label, amount_cents, income_date, created_at")
        .eq("user_id", userId)
        .gte("income_date", range.startInclusive)
        .lt("income_date", range.endExclusive)
        .order("income_date", { ascending: false })
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(from, to),
    );
  } catch {
    throw new Error("Impossible de charger les revenus ponctuels du mois.");
  }

  const incomes = (data ?? []).map((income) => {
    if (
      typeof income.id !== "string" ||
      typeof income.label !== "string" ||
      income.label.trim().length > 100 ||
      income.label.trim().length === 0 ||
      !isValidOneTimeIncomeDate(income.income_date)
    ) {
      throw new Error("Un revenu ponctuel contient des données invalides.");
    }

    return {
      amountCents: readPositiveOneTimeIncomeCents(income.amount_cents),
      id: income.id,
      incomeDate: income.income_date,
      label: income.label.trim(),
    };
  });
  const previousMonth = addCalendarMonths(selectedMonth, -1);
  const nextMonth = addCalendarMonths(selectedMonth, 1);
  const totalCents = incomes.reduce(
    (total, income) => addCents(total, income.amountCents),
    0,
  );

  return (
    <AppShell
      activePath="/incomes"
      description="Dépôts et primes intégrés au revenu du mois de leur date."
      eyebrow="Entrées exceptionnelles"
      profile={profile}
      title="Revenus ponctuels"
    >
      <OneTimeIncomeManagement
        allowNextMonth={
          formatCalendarMonthParam(nextMonth) <=
          formatCalendarMonthParam(currentMonth)
        }
        currencyCode={profile.currencyCode}
        incomes={incomes}
        isCurrentMonth={isSameCalendarMonth(selectedMonth, currentMonth)}
        maximumIncomeDate={maximumIncomeDate}
        monthLabel={formatCalendarMonth(selectedMonth)}
        nextMonthHref={`/incomes/ponctuels?month=${formatCalendarMonthParam(nextMonth)}`}
        previousMonthHref={`/incomes/ponctuels?month=${formatCalendarMonthParam(previousMonth)}`}
        totalCents={totalCents}
      />
    </AppShell>
  );
}
