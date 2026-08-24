"use client";

import { useState, type FormEvent } from "react";

import { PurchaseTransactionConfirmation } from "@/app/purchase-checker/purchase-transaction-confirmation";
import type { CategoryBudgetUsage } from "@/lib/budgets/category-budget";
import { formatCents } from "@/lib/finance/format-cents";
import {
  calculatePurchaseImpact,
  MAX_PURCHASE_NAME_LENGTH,
  type PurchaseClassification,
  validatePurchaseInput,
} from "@/lib/finance/purchase-checker";

type PurchaseResult = {
  classification: PurchaseClassification;
  name: string;
  priceCents: number;
  remainingAfterPurchaseCents: number;
};

const classificationPresentation = {
  comfortable: {
    label: "Achat confortable",
    message: "Cet achat semble compatible avec ton budget actuel.",
  },
  significant: {
    label: "Impact significatif",
    message: "Cet achat utiliserait une part notable de ton reste disponible ce mois-ci.",
  },
  tight: {
    label: "Budget serré",
    message: "Cet achat est possible, mais il réduirait fortement ton reste disponible ce mois-ci.",
  },
  "over-budget": {
    label: "Dépassement",
    message: "",
  },
} satisfies Record<PurchaseClassification, { label: string; message: string }>;

export function PurchaseChecker({
  categoryBudgets,
  currencyCode,
  currentDate,
  currentRealAvailableCents,
}: {
  categoryBudgets: CategoryBudgetUsage[];
  currencyCode: string;
  currentDate: string;
  currentRealAvailableCents: number;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    price?: string;
  }>({});
  const [formError, setFormError] = useState("");
  const [result, setResult] = useState<PurchaseResult | null>(null);

  function clearResult() {
    setResult(null);
    setFormError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validatePurchaseInput({ name, price });

    if (!validation.valid) {
      setFieldErrors(validation.fieldErrors);
      setResult(null);
      return;
    }

    try {
      const impact = calculatePurchaseImpact(
        currentRealAvailableCents,
        validation.data.priceCents,
      );
      setFieldErrors({});
      setFormError("");
      setResult({
        ...impact,
        name: validation.data.name,
        priceCents: validation.data.priceCents,
      });
    } catch {
      setResult(null);
      setFormError(
        "Ce calcul dépasse la précision financière disponible. Saisissez un prix plus petit.",
      );
    }
  }

  const presentation = result
    ? classificationPresentation[result.classification]
    : null;
  const resultMessage =
    result?.classification === "over-budget"
      ? `Cet achat dépasserait ton budget disponible actuel de ${formatCents(
          Math.abs(result.remainingAfterPurchaseCents),
          currencyCode,
        )}.`
      : presentation?.message;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
      <section className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--paper)] p-6 shadow-[0_16px_50px_rgba(23,53,47,0.08)] sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-dark)]">
          Achat à vérifier
        </p>
        <h2 className="font-display mt-3 text-3xl font-bold tracking-[-0.04em]">
          Testez l’impact, sans rien enregistrer.
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
          Votre reste réel actuel est de {formatCents(currentRealAvailableCents, currencyCode)}.
        </p>

        <form className="mt-7 grid gap-5" onSubmit={handleSubmit}>
          {formError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              {formError}
            </div>
          ) : null}

          <label className="grid gap-2 text-sm font-semibold" htmlFor="purchase-name">
            Nom de l’achat
            <input
              aria-describedby={fieldErrors.name ? "purchase-name-error" : "purchase-name-hint"}
              aria-invalid={Boolean(fieldErrors.name)}
              className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 text-base font-normal outline-none transition-all focus:border-[var(--forest)] focus:ring-3 focus:ring-[#c9d5c380]"
              id="purchase-name"
              maxLength={MAX_PURCHASE_NAME_LENGTH}
              onChange={(event) => {
                setName(event.target.value);
                clearResult();
              }}
              placeholder="Casque, billet de train…"
              type="text"
              value={name}
            />
            <span
              className={fieldErrors.name ? "text-xs text-red-700" : "text-xs font-normal text-[var(--ink-soft)]"}
              id={fieldErrors.name ? "purchase-name-error" : "purchase-name-hint"}
            >
              {fieldErrors.name ?? `${MAX_PURCHASE_NAME_LENGTH} caractères maximum.`}
            </span>
          </label>

          <label className="grid gap-2 text-sm font-semibold" htmlFor="purchase-price">
            Prix
            <input
              aria-describedby={fieldErrors.price ? "purchase-price-error" : "purchase-price-hint"}
              aria-invalid={Boolean(fieldErrors.price)}
              className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-4 text-base font-normal outline-none transition-all focus:border-[var(--forest)] focus:ring-3 focus:ring-[#c9d5c380]"
              id="purchase-price"
              inputMode="decimal"
              maxLength={32}
              onChange={(event) => {
                setPrice(event.target.value);
                clearResult();
              }}
              placeholder="49,90"
              type="text"
              value={price}
            />
            <span
              className={fieldErrors.price ? "text-xs text-red-700" : "text-xs font-normal text-[var(--ink-soft)]"}
              id={fieldErrors.price ? "purchase-price-error" : "purchase-price-hint"}
            >
              {fieldErrors.price ?? "Prix strictement positif, avec deux décimales maximum."}
            </span>
          </label>

          <button
            className="min-h-12 rounded-xl bg-[var(--forest)] px-5 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#214b42] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--forest)]"
            type="submit"
          >
            Vérifier cet achat
          </button>
        </form>
      </section>

      <section
        aria-live="polite"
        className="min-h-80 rounded-[1.75rem] border border-[var(--line)] bg-[color:rgba(255,253,247,0.72)] p-6 shadow-[0_14px_45px_rgba(23,53,47,0.06)] sm:p-8"
      >
        {result && presentation ? (
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-dark)]">
              {presentation.label}
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-[-0.04em]">
              {result.name}
            </h2>
            <dl className="mt-7 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-4">
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">Reste actuel</dt>
                <dd className="mt-2 break-words font-display text-xl font-bold">{formatCents(currentRealAvailableCents, currencyCode)}</dd>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">Prix</dt>
                <dd className="mt-2 break-words font-display text-xl font-bold">{formatCents(result.priceCents, currencyCode)}</dd>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">Reste après achat</dt>
                <dd className="mt-2 break-words font-display text-xl font-bold">{formatCents(result.remainingAfterPurchaseCents, currencyCode)}</dd>
              </div>
            </dl>
            <p className="my-6 rounded-2xl bg-[var(--sage)] p-5 text-sm font-semibold leading-6 text-[var(--forest)]">
              {resultMessage}
            </p>
            <PurchaseTransactionConfirmation
              categoryBudgets={categoryBudgets}
              currencyCode={currencyCode}
              currentDate={currentDate}
              key={`${result.name}-${result.priceCents}`}
              name={result.name}
              priceCents={result.priceCents}
            />
          </div>
        ) : (
          <div className="grid min-h-64 place-items-center text-center">
            <div>
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-[var(--sage)] font-display text-2xl font-bold">?</span>
              <h2 className="font-display mt-5 text-2xl font-bold">Votre résultat apparaîtra ici.</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--ink-soft)]">
                Le calcul utilise le snapshot du mois : plan récurrent, épargne prévue et transactions déjà enregistrées.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
