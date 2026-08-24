export const currencyOptions = [
  { value: "EUR", label: "Euro — EUR" },
  { value: "CHF", label: "Franc suisse — CHF" },
  { value: "GBP", label: "Livre sterling — GBP" },
  { value: "USD", label: "Dollar américain — USD" },
  { value: "CAD", label: "Dollar canadien — CAD" },
  { value: "MAD", label: "Dirham marocain — MAD" },
  { value: "DZD", label: "Dinar algérien — DZD" },
] as const;

export type CurrencyCode = (typeof currencyOptions)[number]["value"];

export const MAX_TIME_ZONE_LENGTH = 64;

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return (
    typeof value === "string" &&
    currencyOptions.some((option) => option.value === value)
  );
}

export function isValidTimeZone(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > MAX_TIME_ZONE_LENGTH ||
    value !== value.trim()
  ) {
    return false;
  }

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}
