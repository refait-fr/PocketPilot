"use client";

import { useState, type FormEvent } from "react";

import { PurchaseTransactionConfirmation } from "@/app/purchase-checker/purchase-transaction-confirmation";
import type { CategoryBudgetUsage } from "@/lib/budgets/category-budget";
import { formatCents } from "@/lib/finance/format-cents";
import {
  calculatePurchaseImpact,
  calculatePurchaseImpactBars,
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
    tone: "bg-[var(--positive-soft)] text-[var(--positive)]",
  },
  significant: {
    label: "Impact significatif",
    message: "Cet achat utiliserait une part notable de ton reste disponible ce mois-ci.",
    tone: "bg-[var(--accent-soft)] text-[var(--accent-dark)]",
  },
  tight: {
    label: "Budget serré",
    message: "Cet achat est possible, mais il réduirait fortement ton reste disponible ce mois-ci.",
    tone: "bg-[var(--warning-soft)] text-[var(--warning)]",
  },
  "over-budget": {
    label: "Dépassement",
    message: "",
    tone: "bg-[var(--danger-soft)] text-[var(--danger)]",
  },
} satisfies Record<
  PurchaseClassification,
  { label: string; message: string; tone: string }
>;

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
  const impactBars = result
    ? calculatePurchaseImpactBars(
        currentRealAvailableCents,
        result.remainingAfterPurchaseCents,
      )
    : null;

  return (
    <div className="purchase-layout">
      <section className="ui-panel purchase-input-panel">
        <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--accent)]">
          Achat à vérifier
        </p>
        <h2 className="font-display mt-2 text-2xl font-semibold tracking-[-0.04em]">
          Tu veux acheter quoi ?
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
          Votre reste réel actuel est de {formatCents(currentRealAvailableCents, currencyCode)}.
        </p>

        <form className="mt-7 grid gap-5" onSubmit={handleSubmit}>
          {formError ? (
            <div className="ui-feedback-error" role="alert">
              {formError}
            </div>
          ) : null}

          <label className="ui-label" htmlFor="purchase-name">
            Nom de l’achat
            <input
              aria-describedby={fieldErrors.name ? "purchase-name-error" : "purchase-name-hint"}
              aria-invalid={Boolean(fieldErrors.name)}
              className="ui-input"
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

          <label className="ui-label" htmlFor="purchase-price">
            Prix
            <input
              aria-describedby={fieldErrors.price ? "purchase-price-error" : "purchase-price-hint"}
              aria-invalid={Boolean(fieldErrors.price)}
              className="ui-input font-amount text-xl"
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
            className="ui-button-primary min-h-12 px-5 py-3"
            type="submit"
          >
            Vérifier cet achat
          </button>
        </form>
      </section>

      <section
        aria-live="polite"
        className={`purchase-result-panel ${result ? "has-result" : ""}`}
      >
        {result && presentation ? (
          <div>
            <p className={`ui-badge ${presentation.tone}`}>
              {presentation.label}
            </p>
            <p className="font-amount mt-6 break-words text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-none tracking-[-0.07em]">
              {formatCents(result.priceCents, currencyCode)}
            </p>
            <h2 className="font-display mt-3 text-2xl font-semibold tracking-[-0.04em]">
              {result.name}
            </h2>
            <dl className="purchase-impact-grid">
              <div className="p-4 sm:border-r sm:border-[var(--line)]">
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">Reste actuel</dt>
                <dd className="font-amount mt-2 break-words text-xl font-extrabold">{formatCents(currentRealAvailableCents, currencyCode)}</dd>
              </div>
              <div className="border-t border-[var(--line)] p-4 sm:border-r sm:border-t-0">
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">Prix</dt>
                <dd className="font-amount mt-2 break-words text-xl font-extrabold">{formatCents(result.priceCents, currencyCode)}</dd>
              </div>
              <div className="border-t border-[var(--line)] p-4 sm:border-t-0">
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">Reste après achat</dt>
                <dd className="font-amount mt-2 break-words text-xl font-extrabold">{formatCents(result.remainingAfterPurchaseCents, currencyCode)}</dd>
              </div>
            </dl>
            {impactBars ? (
              <figure className="purchase-impact-figure" aria-labelledby="purchase-impact-title">
                <figcaption id="purchase-impact-title">
                  <span>Impact sur le reste réel</span>
                  <small>La ligne centrale représente zéro.</small>
                </figcaption>
                <div className="impact-comparison-row">
                  <span>Avant</span>
                  <div className="impact-comparison-track">
                    <i
                      className={`impact-comparison-bar is-${impactBars.before.direction}`}
                      style={{ width: `${impactBars.before.widthPercent}%` }}
                    />
                  </div>
                  <strong>{formatCents(currentRealAvailableCents, currencyCode)}</strong>
                </div>
                <div className="purchase-impact-delta">↓ achat de {formatCents(result.priceCents, currencyCode)}</div>
                <div className="impact-comparison-row">
                  <span>Après</span>
                  <div className="impact-comparison-track">
                    <i
                      className={`impact-comparison-bar is-${impactBars.after.direction} ${result.remainingAfterPurchaseCents < 0 ? "is-negative" : ""}`}
                      style={{ width: `${impactBars.after.widthPercent}%` }}
                    />
                  </div>
                  <strong>{formatCents(result.remainingAfterPurchaseCents, currencyCode)}</strong>
                </div>
              </figure>
            ) : null}
            <p className={`my-6 rounded-2xl p-5 text-sm font-semibold leading-6 ${presentation.tone}`}>
              {resultMessage}
            </p>
            <p className="mb-5 text-xs leading-5 text-[var(--ink-soft)]">
              {categoryBudgets.length > 0
                ? "Choisissez une catégorie lors de l’enregistrement pour voir l’impact exact sur son plafond."
                : "Aucun budget de catégorie n’est configuré : l’impact concerne uniquement votre reste réel."}
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
          <div className="grid min-h-[27rem] place-items-center text-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--accent)]">Avant de décider</p>
              <h2 className="font-display mt-3 text-2xl font-semibold">Voyez l’impact sur votre mois.</h2>
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
