// Identifiants UUID v1 à v8 : restreindre aux versions 1-5 casserait les
// futurs générateurs (v6/v7) alors que la base émet déjà des UUID opaques.
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}
