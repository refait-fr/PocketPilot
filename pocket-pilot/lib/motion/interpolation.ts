export function interpolateCents(
  fromCents: number,
  toCents: number,
  progress: number,
): number {
  if (!Number.isSafeInteger(fromCents) || !Number.isSafeInteger(toCents)) {
    throw new Error(
      "Les montants à interpoler doivent être des entiers sûrs en centimes.",
    );
  }

  if (typeof progress !== "number" || !Number.isFinite(progress)) {
    throw new Error("La progression doit être un nombre fini entre 0 et 1.");
  }

  const clamped = Math.min(1, Math.max(0, progress));

  return Math.round(fromCents + (toCents - fromCents) * clamped);
}
