import Link from "next/link";

import { createCategoryBudget } from "@/app/budgets/actions";
import { BudgetForm } from "@/app/budgets/budget-form";
import { BudgetRow } from "@/app/budgets/budget-row";
import type { BudgetView } from "@/app/budgets/budget-types";
import { TRANSACTION_CATEGORIES } from "@/lib/transactions/categories";

export function BudgetManagement({
  budgets,
  currencyCode,
  isCurrentMonth,
  monthLabel,
  nextMonthHref,
  previousMonthHref,
}: {
  budgets: BudgetView[];
  currencyCode: string;
  isCurrentMonth: boolean;
  monthLabel: string;
  nextMonthHref: string;
  previousMonthHref: string;
}) {
  const configured = new Set(budgets.map((budget) => budget.category));
  const availableCategories = TRANSACTION_CATEGORIES.filter(
    (category) => !configured.has(category),
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(300px,0.72fr)_minmax(0,1.28fr)] xl:items-start">
      <section className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--paper)] p-6 shadow-[0_16px_50px_rgba(23,53,47,0.08)] sm:p-8 xl:sticky xl:top-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-dark)]">Nouveau plafond</p>
        <h2 className="font-display mt-3 text-3xl font-bold">Cadrez une catégorie.</h2>
        <p className="mb-7 mt-3 text-sm leading-6 text-[var(--ink-soft)]">
          Le même plafond s’applique à chaque mois. Il n’enlève rien au reste réel global.
        </p>
        {availableCategories.length > 0 ? (
          <BudgetForm
            action={createCategoryBudget}
            availableCategories={availableCategories}
            defaultValues={{ category: availableCategories[0], monthlyBudget: "" }}
            mode="create"
          />
        ) : (
          <p className="rounded-xl bg-[var(--sage)] p-4 text-sm font-semibold text-[var(--forest)]">
            Toutes les catégories ont déjà un budget.
          </p>
        )}
      </section>

      <section aria-labelledby="budget-list-title" className="min-w-0">
        <div className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--paper)] p-4 shadow-[0_10px_35px_rgba(23,53,47,0.05)] sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">{isCurrentMonth ? "Mois actuel" : "Mois consulté"}</p>
              <p className="font-display mt-1 text-2xl font-bold capitalize">{monthLabel}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link className="min-h-10 rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-bold hover:bg-white" href={previousMonthHref}>← Mois précédent</Link>
              {!isCurrentMonth ? <Link className="min-h-10 rounded-lg bg-[var(--forest)] px-3 py-2 text-xs font-bold text-white" href="/budgets">Mois actuel</Link> : null}
              <Link className="min-h-10 rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-bold hover:bg-white" href={nextMonthHref}>Mois suivant →</Link>
            </div>
          </div>
        </div>

        <div className="mb-4 mt-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">{budgets.length} budget{budgets.length > 1 ? "s" : ""}</p>
          <h2 className="font-display mt-1 text-3xl font-bold" id="budget-list-title">Suivi par catégorie</h2>
        </div>

        {budgets.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-white/60 p-8 text-center sm:p-12">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-[var(--sage)] font-display text-2xl font-bold">0</span>
            <h3 className="font-display mt-5 text-2xl font-bold">Aucun budget configuré</h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--ink-soft)]">Commencez par une catégorie que vous souhaitez surveiller ce mois-ci.</p>
          </div>
        ) : (
          <ul className="grid gap-4">
            {budgets.map((budget) => <BudgetRow budget={budget} currencyCode={currencyCode} key={budget.id} />)}
          </ul>
        )}
      </section>
    </div>
  );
}
