import { parseMoneyInput, subtractCents } from "./money.ts";

export const PURCHASE_CHECKER_THRESHOLDS = {
  comfortablePercent: 25,
  significantPercent: 75,
} as const;

export const MAX_PURCHASE_NAME_LENGTH = 200;

export type PurchaseClassification =
  | "comfortable"
  | "significant"
  | "tight"
  | "over-budget";

export type PurchaseInputValues = {
  name: string;
  price: string;
};

export type PurchaseInputValidation =
  | {
      valid: true;
      data: { name: string; priceCents: number };
      values: PurchaseInputValues;
    }
  | {
      valid: false;
      fieldErrors: Partial<Record<keyof PurchaseInputValues, string>>;
      values: PurchaseInputValues;
    };

export type PurchaseImpactBar = {
  direction: "left" | "right";
  widthPercent: number;
};

export function calculatePurchaseImpactBars(
  currentRealAvailableCents: number,
  remainingAfterPurchaseCents: number,
): { after: PurchaseImpactBar; before: PurchaseImpactBar } {
  if (
    !Number.isSafeInteger(currentRealAvailableCents) ||
    !Number.isSafeInteger(remainingAfterPurchaseCents)
  ) {
    throw new Error("Les montants de comparaison doivent être des entiers sûrs en centimes.");
  }

  const beforeMagnitude = currentRealAvailableCents < 0
    ? -BigInt(currentRealAvailableCents)
    : BigInt(currentRealAvailableCents);
  const afterMagnitude = remainingAfterPurchaseCents < 0
    ? -BigInt(remainingAfterPurchaseCents)
    : BigInt(remainingAfterPurchaseCents);
  const largestMagnitude = beforeMagnitude > afterMagnitude
    ? beforeMagnitude
    : afterMagnitude;

  function buildBar(amountCents: number, magnitude: bigint): PurchaseImpactBar {
    const scaledWidth = largestMagnitude === BigInt(0)
      ? 0
      : Number((magnitude * BigInt(50)) / largestMagnitude);

    return {
      direction: amountCents < 0 ? "left" : "right",
      widthPercent: magnitude > BigInt(0) ? Math.max(2, scaledWidth) : 0,
    };
  }

  return {
    after: buildBar(remainingAfterPurchaseCents, afterMagnitude),
    before: buildBar(currentRealAvailableCents, beforeMagnitude),
  };
}

function readText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function validatePurchaseInput(input: {
  name: unknown;
  price: unknown;
}): PurchaseInputValidation {
  const values = {
    name: readText(input.name),
    price: readText(input.price),
  };
  const name = values.name.trim();
  const fieldErrors: Partial<Record<keyof PurchaseInputValues, string>> = {};
  const parsedPrice = parseMoneyInput(values.price, {
    allowZero: false,
    emptyMessage: "Saisissez le prix de l’achat.",
    invalidMessage: "Saisissez un prix numérique, par exemple 49,90.",
  });

  if (!name) {
    fieldErrors.name = "Donnez un nom à cet achat.";
  } else if (name.length > MAX_PURCHASE_NAME_LENGTH) {
    fieldErrors.name = `Le nom ne peut pas dépasser ${MAX_PURCHASE_NAME_LENGTH} caractères.`;
  }

  if (!parsedPrice.valid) {
    fieldErrors.price = parsedPrice.message;
  }

  if (!name || name.length > MAX_PURCHASE_NAME_LENGTH || !parsedPrice.valid) {
    return { valid: false, fieldErrors, values };
  }

  return {
    valid: true,
    data: { name, priceCents: parsedPrice.amountCents },
    values: { name, price: values.price.trim() },
  };
}

export function classifyPurchase(
  currentRealAvailableCents: number,
  purchasePriceCents: number,
): PurchaseClassification {
  if (!Number.isSafeInteger(currentRealAvailableCents)) {
    throw new Error("Le reste réel doit être un entier sûr en centimes.");
  }

  if (!Number.isSafeInteger(purchasePriceCents) || purchasePriceCents <= 0) {
    throw new Error("Le prix doit être un entier sûr strictement positif en centimes.");
  }

  if (
    currentRealAvailableCents <= 0 ||
    purchasePriceCents > currentRealAvailableCents
  ) {
    return "over-budget";
  }

  const scaledPrice = BigInt(purchasePriceCents) * BigInt(100);
  const scaledAvailable = BigInt(currentRealAvailableCents);

  if (
    scaledPrice <=
    scaledAvailable * BigInt(PURCHASE_CHECKER_THRESHOLDS.comfortablePercent)
  ) {
    return "comfortable";
  }

  if (
    scaledPrice <=
    scaledAvailable * BigInt(PURCHASE_CHECKER_THRESHOLDS.significantPercent)
  ) {
    return "significant";
  }

  return "tight";
}

export function calculatePurchaseImpact(
  currentRealAvailableCents: number,
  purchasePriceCents: number,
) {
  const classification = classifyPurchase(
    currentRealAvailableCents,
    purchasePriceCents,
  );

  return {
    classification,
    remainingAfterPurchaseCents: subtractCents(
      currentRealAvailableCents,
      purchasePriceCents,
    ),
  };
}
