import {
  type CurrencyCode,
  isCurrencyCode,
  isValidTimeZone,
} from "./profile-options.ts";

export type ProfileSettingsValues = {
  currencyCode: string;
  timeZone: string;
};

export type ProfileSettingsValidation =
  | {
      valid: true;
      data: { currencyCode: CurrencyCode; timeZone: string };
      values: ProfileSettingsValues;
    }
  | {
      valid: false;
      message: string;
      values: ProfileSettingsValues;
    };

export function validateProfileSettings(input: {
  currencyCode: unknown;
  currentCurrencyCode: CurrencyCode;
  hasFinancialData: boolean;
  timeZone: unknown;
}): ProfileSettingsValidation {
  const values = {
    currencyCode: typeof input.currencyCode === "string" ? input.currencyCode : "",
    timeZone: typeof input.timeZone === "string" ? input.timeZone.trim() : "",
  };

  if (!isCurrencyCode(values.currencyCode)) {
    return { valid: false, message: "Choisissez une devise proposée.", values };
  }

  if (!isValidTimeZone(values.timeZone)) {
    return {
      valid: false,
      message: "Saisissez un fuseau horaire IANA valide, par exemple Europe/Paris.",
      values,
    };
  }

  if (
    input.hasFinancialData &&
    values.currencyCode !== input.currentCurrencyCode
  ) {
    return {
      valid: false,
      message:
        "La devise ne peut plus être modifiée tant que des données financières existent. PocketPilot ne convertit pas automatiquement les montants.",
      values,
    };
  }

  return {
    valid: true,
    data: { currencyCode: values.currencyCode, timeZone: values.timeZone },
    values,
  };
}
