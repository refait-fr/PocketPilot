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

export function isCurrencyCode(value: string): value is CurrencyCode {
  return currencyOptions.some((option) => option.value === value);
}
