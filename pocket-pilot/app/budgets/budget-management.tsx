import Link from "next/link";

import { CreationDisclosure } from "@/app/_components/creation-disclosure";
import { createCategoryBudget } from "@/app/budgets/actions";
import { BudgetForm } from "@/app/budgets/budget-form";
import { BudgetRow } from "@/app/budgets/budget-row";
import type { BudgetView } from "@/app/budgets/budget-types";
import { TRANSACTION_CATEGORIES } from "@/lib/transactions/categories";
import { summarizeCategoryBudgets } from "@/lib/budgets/category-budget";
import { formatCents } from "@/lib/finance/format-cents";

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
  const summary = summarizeCategoryBudgets(budgets);

  return (
    <div className="management-stack">
      <section aria-labelledby="budget-list-title" className="min-w-0">
        <div className="period-toolbar period-toolbar-compact">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="ui-kicker">{isCurrentMonth ? "Mois actuel" : "Mois consulté"}</p>
              <p className="period-title">{monthLabel}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link className="ui-button-secondary min-h-10 px-3 py-2 text-xs" href={previousMonthHref}>← Mois précédent</Link>
              {!isCurrentMonth ? <Link className="ui-button-primary min-h-10 px-3 py-2 text-xs" href="/budgets">Mois actuel</Link> : null}
              <Link className="ui-button-secondary min-h-10 px-3 py-2 text-xs" href={nextMonthHref}>Mois suivant →</Link>
            </div>
          </div>
        </div>

        <dl className="finance-summary budget-summary" aria-label={`Synthèse des budgets de ${monthLabel}`}>
          <div className="pilot-metric pilot-metric-primary"><dt>Dépensé sur les budgets</dt><dd>{formatCents(summary.totalSpentCents, currencyCode)}</dd><small>sur {formatCents(summary.totalBudgetCents, currencyCode)}</small></div>
          <div className="pilot-metric"><dt>Solde des plafonds</dt><dd>{formatCents(summary.totalRemainingCents, currencyCode)}</dd></div>
          <div className="pilot-metric"><dt>Budgets dépassés</dt><dd>{summary.exceededCount}</dd><small>sur {summary.configuredCount}</small></div>
        </dl>

        <div className="management-list-heading">
          <div><p className="ui-kicker">{budgets.length} budget{budgets.length > 1 ? "s" : ""}</p>
          <h2 className="management-title" id="budget-list-title">Suivi par catégorie</h2></div>
        </div>

        {budgets.length === 0 ? (
          <div className="ui-empty">
            <h3>Aucun budget configuré</h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--ink-soft)]">Commencez par une catégorie que vous souhaitez surveiller ce mois-ci.</p>
          </div>
        ) : (
          <ul className="grid gap-3">
            {budgets.map((budget) => <BudgetRow budget={budget} currencyCode={currencyCode} key={budget.id} />)}
          </ul>
        )}
      </section>
      <CreationDisclosure
        buttonLabel="Ajouter un budget"
        defaultOpen={budgets.length === 0}
        description="Le même plafond s’applique à chaque mois et reste informatif."
        eyebrow="Nouveau plafond"
        title="Ajouter un budget"
      >
        {availableCategories.length > 0 ? (
          <BudgetForm action={createCategoryBudget} availableCategories={availableCategories} defaultValues={{ category: availableCategories[0], monthlyBudget: "" }} mode="create" />
        ) : <p className="ui-feedback-success">Toutes les catégories ont déjà un budget.</p>}
      </CreationDisclosure>
    </div>
  );
}
