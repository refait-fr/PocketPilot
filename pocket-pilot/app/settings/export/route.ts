import { NextResponse } from "next/server";

import { formatCentsForInput } from "@/lib/finance/money";
import { fetchAllWithRange } from "@/lib/supabase/paginate";
import { createClient } from "@/lib/supabase/server";

const CSV_HEADER = "type;date;label;montant_eur;categorie";

type ExportRow = {
  categorie: string;
  date: string;
  label: string;
  montantCents: unknown;
  type: string;
};

function readText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readDate(value: unknown): string {
  return typeof value === "string" ? value.slice(0, 10) : "";
}

function escapeCsvCell(value: string): string {
  if (/[";\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function formatMontantEur(amountCents: unknown): string {
  if (typeof amountCents !== "number" || !Number.isSafeInteger(amountCents)) {
    throw new Error("Une ligne exportée contient un montant invalide.");
  }

  return formatCentsForInput(amountCents, {
    allowZero: true,
    fieldName: "Le montant exporté",
  });
}

function buildCsv(rows: readonly ExportRow[]): string {
  const lines = rows.map((row) =>
    [
      row.type,
      row.date,
      row.label,
      formatMontantEur(row.montantCents),
      row.categorie,
    ]
      .map(escapeCsvCell)
      .join(";"),
  );

  return `\uFEFF${[CSV_HEADER, ...lines].join("\r\n")}\r\n`;
}

function safeExportFileName(todayIso: string): string {
  return `pocketpilot-export-${todayIso.replaceAll("-", "")}.csv`;
}

export async function GET() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError) {
    return NextResponse.json(
      { error: "Impossible de vérifier la session utilisateur." },
      { status: 500 },
    );
  }

  const userId = claimsData?.claims.sub;

  if (!userId) {
    return NextResponse.json(
      { error: "Authentification requise." },
      { status: 401 },
    );
  }

  try {
    const [
      recurringIncomes,
      recurringExpenses,
      savingsGoals,
      transactions,
      oneTimeIncomes,
      categoryBudgets,
      userCategories,
    ] = await Promise.all([
      fetchAllWithRange<{ amount_cents: unknown; label: unknown; start_date: unknown }>(
        (from, to) =>
          supabase
            .from("recurring_incomes")
            .select("amount_cents, label, start_date")
            .eq("user_id", userId)
            .order("start_date")
            .order("id")
            .range(from, to),
      ),
      fetchAllWithRange<{ amount_cents: unknown; label: unknown; start_date: unknown }>(
        (from, to) =>
          supabase
            .from("recurring_fixed_expenses")
            .select("amount_cents, label, start_date")
            .eq("user_id", userId)
            .order("start_date")
            .order("id")
            .range(from, to),
      ),
      fetchAllWithRange<{
        current_amount_cents: unknown;
        name: unknown;
        target_amount_cents: unknown;
      }>((from, to) =>
        supabase
          .from("savings_goals")
          .select("name, target_amount_cents, current_amount_cents")
          .eq("user_id", userId)
          .order("id")
          .range(from, to),
      ),
      fetchAllWithRange<{
        amount_cents: unknown;
        category: unknown;
        description: unknown;
        transaction_date: unknown;
      }>((from, to) =>
        supabase
          .from("transactions")
          .select("amount_cents, category, description, transaction_date")
          .eq("user_id", userId)
          .order("transaction_date", { ascending: false })
          .order("id", { ascending: false })
          .range(from, to),
      ),
      fetchAllWithRange<{
        amount_cents: unknown;
        income_date: unknown;
        label: unknown;
      }>((from, to) =>
        supabase
          .from("one_time_incomes")
          .select("amount_cents, label, income_date")
          .eq("user_id", userId)
          .order("income_date", { ascending: false })
          .order("id", { ascending: false })
          .range(from, to),
      ),
      fetchAllWithRange<{ category: unknown; monthly_budget_cents: unknown }>(
        (from, to) =>
          supabase
            .from("category_budgets")
            .select("category, monthly_budget_cents")
            .eq("user_id", userId)
            .order("id")
            .range(from, to),
      ),
      fetchAllWithRange<{ name: unknown }>((from, to) =>
        supabase
          .from("user_categories")
          .select("name")
          .eq("user_id", userId)
          .order("name")
          .order("id")
          .range(from, to),
      ),
    ]);

    const rows: ExportRow[] = [
      ...recurringIncomes.map((income) => ({
        categorie: "",
        date: readDate(income.start_date),
        label: readText(income.label),
        montantCents: income.amount_cents,
        type: "revenu_recurrent",
      })),
      ...recurringExpenses.map((expense) => ({
        categorie: "",
        date: readDate(expense.start_date),
        label: readText(expense.label),
        montantCents: expense.amount_cents,
        type: "charge_fixe",
      })),
      ...savingsGoals.map((goal) => ({
        categorie: "",
        date: "",
        label: readText(goal.name),
        montantCents: goal.target_amount_cents,
        type: "objectif_epargne",
      })),
      ...transactions.map((transaction) => ({
        categorie: readText(transaction.category),
        date: readDate(transaction.transaction_date),
        label: readText(transaction.description),
        montantCents: transaction.amount_cents,
        type: "transaction",
      })),
      ...oneTimeIncomes.map((income) => ({
        categorie: "",
        date: readDate(income.income_date),
        label: readText(income.label),
        montantCents: income.amount_cents,
        type: "revenu_ponctuel",
      })),
      ...categoryBudgets.map((budget) => ({
        categorie: readText(budget.category),
        date: "",
        label: "",
        montantCents: budget.monthly_budget_cents,
        type: "budget_categorie",
      })),
      ...userCategories.map((category) => ({
        categorie: readText(category.name),
        date: "",
        label: readText(category.name),
        montantCents: 0,
        type: "categorie_personnelle",
      })),
    ];

    const todayIso = new Date().toISOString().slice(0, 10);

    return new NextResponse(buildCsv(rows), {
      headers: {
        "Content-Disposition": `attachment; filename="${safeExportFileName(todayIso)}"`,
        "Content-Type": "text/csv; charset=utf-8",
      },
      status: 200,
    });
  } catch {
    return NextResponse.json(
      { error: "L’export n’a pas pu être généré. Réessayez dans un instant." },
      { status: 500 },
    );
  }
}
