import { TRANSACTION_CATEGORIES } from "./categories.ts";

export const MAX_CUSTOM_CATEGORY_NAME_LENGTH = 50;

export const DEFAULT_ALLOWED_CATEGORIES: readonly string[] =
  TRANSACTION_CATEGORIES;

export type CustomCategoryNameResult =
  | { valid: true; name: string }
  | { valid: false; message: string };

function readName(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const name = value.trim();

  return name.length > 0 ? name : null;
}

function duplicatesDefaultCategory(name: string): boolean {
  const lowered = name.toLowerCase();

  return TRANSACTION_CATEGORIES.some(
    (category) => category.toLowerCase() === lowered,
  );
}

export function parseCustomCategoryName(
  value: unknown,
): CustomCategoryNameResult {
  const name = readName(value);

  if (!name) {
    return { valid: false, message: "Ajoutez un nom de catégorie." };
  }

  if (name.length > MAX_CUSTOM_CATEGORY_NAME_LENGTH) {
    return {
      valid: false,
      message: `Le nom ne peut pas dépasser ${MAX_CUSTOM_CATEGORY_NAME_LENGTH} caractères.`,
    };
  }

  if (duplicatesDefaultCategory(name)) {
    return { valid: false, message: "Cette catégorie existe déjà." };
  }

  return { valid: true, name };
}

function readCustomNames(customNames: readonly unknown[]): string[] {
  const names: string[] = [];
  const seen = new Set<string>();

  for (const candidate of customNames) {
    const name = readName(candidate);

    if (
      !name ||
      name.length > MAX_CUSTOM_CATEGORY_NAME_LENGTH ||
      duplicatesDefaultCategory(name) ||
      seen.has(name)
    ) {
      continue;
    }

    seen.add(name);
    names.push(name);
  }

  return names;
}

export function getAllowedCategories(
  customNames: readonly unknown[] = [],
): string[] {
  return [...TRANSACTION_CATEGORIES, ...readCustomNames(customNames)];
}

export function isAllowedCategory(
  value: unknown,
  customNames: readonly unknown[] = [],
): value is string {
  if (typeof value !== "string") {
    return false;
  }

  if (
    TRANSACTION_CATEGORIES.some((category) => category === value)
  ) {
    return true;
  }

  return readCustomNames(customNames).some(
    (category) => category === value,
  );
}
