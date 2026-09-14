import Link from "next/link";

import { CreationDisclosure } from "@/app/_components/creation-disclosure";
import { createOneTimeIncome } from "@/app/incomes/one-time-actions";
import type { OneTimeIncomeView } from "@/app/incomes/one-time-types";
import { OneTimeIncomeForm } from "@/app/incomes/ponctuels/one-time-income-form";
import { OneTimeIncomeRow } from "@/app/incomes/ponctuels/one-time-income-row";
import { formatCents } from "@/lib/finance/format-cents";

export function OneTimeIncomeManagement({
  allowNextMonth,
  currencyCode,
  incomes,
  isCurrentMonth,
  maximumIncomeDate,
  monthLabel,
  nextMonthHref,
  previousMonthHref,
  totalCents,
}: {
  allowNextMonth: boolean;
  currencyCode: string;
  incomes: OneTimeIncomeView[];
  isCurrentMonth: boolean;
  maximumIncomeDate: string;
  monthLabel: string;
  nextMonthHref: string;
  previousMonthHref: string;
  totalCents: number;
}) {
  return (
    <div className="management-stack transaction-management">
      <section aria-labelledby="one-time-income-list-title" className="min-w-0">
        <div className="period-toolbar period-toolbar-compact">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="ui-kicker">
                {isCurrentMonth ? "Mois actuel" : "Mois consulté"}
              </p>
              <p className="period-title">
                {monthLabel}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link className="ui-button-secondary min-h-10 px-3 py-2 text-xs" href={previousMonthHref}>
                ← Mois précédent
              </Link>
              {!isCurrentMonth ? (
                <Link className="ui-button-primary min-h-10 px-3 py-2 text-xs" href="/incomes/ponctuels">
                  Mois actuel
                </Link>
              ) : null}
              {allowNextMonth ? (
                <Link className="ui-button-secondary min-h-10 px-3 py-2 text-xs" href={nextMonthHref}>
                  Mois suivant →
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <dl className="finance-summary finance-summary-transactions" aria-label={`Synthèse de ${monthLabel}`}>
          <div className="pilot-metric pilot-metric-primary">
            <dt>Total perçu</dt>
            <dd>{formatCents(totalCents, currencyCode)}</dd>
          </div>
          <div className="pilot-metric">
            <dt>Revenus ponctuels</dt>
            <dd>{incomes.length}</dd>
          </div>
        </dl>

        <div className="management-list-heading">
          <div><p className="ui-kicker">Détail du mois</p><h2 className="management-title" id="one-time-income-list-title">Détail des revenus ponctuels</h2></div>
        </div>

        {incomes.length === 0 ? (
          <div className="ui-empty">
            <h3>
              {isCurrentMonth ? "Aucun revenu ponctuel ce mois-ci" : `Aucun revenu ponctuel en ${monthLabel}`}
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--ink-soft)]">
              {isCurrentMonth
                ? "Ajoutez un dépôt ou une prime pour l’intégrer au revenu du mois."
                : "Ce mois ne contient aucun revenu ponctuel enregistré."}
            </p>
          </div>
        ) : (
          <ul className="ui-divider-list ui-panel dense-finance-list overflow-hidden">
            {incomes.map((income) => (
              <OneTimeIncomeRow
                currencyCode={currencyCode}
                income={income}
                key={income.id}
                maximumIncomeDate={maximumIncomeDate}
              />
            ))}
          </ul>
        )}
      </section>
      <CreationDisclosure
        buttonLabel="Ajouter un revenu ponctuel"
        defaultOpen={incomes.length === 0 && isCurrentMonth}
        description="Un libellé, un montant et une date suffisent."
        eyebrow="Entrée exceptionnelle"
        title="Ajouter un revenu ponctuel"
      >
        <OneTimeIncomeForm
          action={createOneTimeIncome}
          defaultValues={{ amount: "", incomeDate: maximumIncomeDate, label: "" }}
          maximumIncomeDate={maximumIncomeDate}
          mode="create"
        />
      </CreationDisclosure>
    </div>
  );
}
