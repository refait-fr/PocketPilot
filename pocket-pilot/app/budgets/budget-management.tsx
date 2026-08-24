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
    <div className="management-grid">
      <section className="ui-panel management-form-panel">
        <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--accent)]">Nouveau plafond</p>
        <h2 className="font-display mt-2 text-3xl font-medium">Cadrez une catégorie.</h2>
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
          <p className="ui-feedback-success">
            Toutes les catégories ont déjà un budget.
          </p>
        )}
      </section>

      <section aria-labelledby="budget-list-title" className="min-w-0">
        <div className="ui-panel-flat p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--ink-soft)]">{isCurrentMonth ? "Mois actuel" : "Mois consulté"}</p>
              <p className="font-display mt-1 text-2xl font-medium capitalize">{monthLabel}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link className="ui-button-secondary min-h-10 px-3 py-2 text-xs" href={previousMonthHref}>← Mois précédent</Link>
              {!isCurrentMonth ? <Link className="ui-button-primary min-h-10 px-3 py-2 text-xs" href="/budgets">Mois actuel</Link> : null}
              <Link className="ui-button-secondary min-h-10 px-3 py-2 text-xs" href={nextMonthHref}>Mois suivant →</Link>
            </div>
          </div>
        </div>

        <div className="mb-4 mt-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--ink-soft)]">{budgets.length} budget{budgets.length > 1 ? "s" : ""}</p>
          <h2 className="font-display mt-1 text-3xl font-medium" id="budget-list-title">Suivi par catégorie</h2>
        </div>

        {budgets.length === 0 ? (
          <div className="ui-empty">
            <h3 className="font-display text-2xl font-medium">Aucun budget configuré</h3>
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
