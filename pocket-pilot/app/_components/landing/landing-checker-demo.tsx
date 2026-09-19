"use client";

import { useState } from "react";

import { formatCents } from "@/lib/finance/format-cents";
import {
  calculatePurchaseImpact,
  validatePurchaseInput,
  type PurchaseClassification,
} from "@/lib/finance/purchase-checker";

const DEMO_BASE_CENTS = 62800;
const DEMO_CURRENCY = "EUR";

const badgeLabels: Record<PurchaseClassification, string> = {
  comfortable: "Confortable",
  significant: "Impact significatif",
  tight: "Budget serré",
  "over-budget": "Dépassement",
};

const badgeTones: Record<PurchaseClassification, string> = {
  comfortable: "",
  significant: "is-significant",
  tight: "is-tight",
  "over-budget": "is-over",
};

export function LandingCheckerDemo() {
  const [price, setPrice] = useState("149");
  const [lastValidCents, setLastValidCents] = useState(14900);

  const validation = validatePurchaseInput({ name: "Casque", price });

  let priceCents = lastValidCents;
  if (validation.valid) {
    try {
      calculatePurchaseImpact(DEMO_BASE_CENTS, validation.data.priceCents);
      priceCents = validation.data.priceCents;
    } catch {
      priceCents = lastValidCents;
    }
  }
  const impact = calculatePurchaseImpact(DEMO_BASE_CENTS, priceCents);

  function handlePriceChange(value: string) {
    setPrice(value);
    const next = validatePurchaseInput({ name: "Casque", price: value });
    if (next.valid) {
      try {
        calculatePurchaseImpact(DEMO_BASE_CENTS, next.data.priceCents);
        setLastValidCents(next.data.priceCents);
      } catch {
        /* conserve le dernier calcul valide */
      }
    }
  }

  return (
    <div className="landing-purchase-calculator" data-purchase-calculator>
      <p>Vérification illustrative</p>
      <div data-purchase-step>
        <span>Marge réelle actuelle</span>
        <strong>{formatCents(DEMO_BASE_CENTS, DEMO_CURRENCY)}</strong>
      </div>
      <div className="landing-checker-row" data-purchase-step>
        <label htmlFor="landing-checker-price">Achat testé</label>
        <span className="landing-checker-field">
          <input
            aria-describedby="landing-checker-hint"
            aria-invalid={!validation.valid}
            autoComplete="off"
            className="landing-checker-input font-amount"
            id="landing-checker-price"
            inputMode="decimal"
            maxLength={32}
            onChange={(event) => handlePriceChange(event.target.value)}
            type="text"
            value={price}
          />
          <span aria-hidden="true">€</span>
        </span>
      </div>
      <p className="landing-checker-hint" id="landing-checker-hint">
        {validation.valid
          ? "Montant déduit de la marge de démonstration."
          : ("fieldErrors" in validation && validation.fieldErrors.price) ||
            "Montant invalide : dernier calcul valide conservé."}
      </p>
      <div className="landing-purchase-rule" aria-hidden="true" />
      <div className="landing-purchase-result" data-purchase-result>
        <span>Reste après achat</span>
        <strong>{formatCents(impact.remainingAfterPurchaseCents, DEMO_CURRENCY)}</strong>
      </div>
      <span className={`landing-comfort-badge ${badgeTones[impact.classification]}`} data-purchase-badge>
        {badgeLabels[impact.classification]}
      </span>
    </div>
  );
}
