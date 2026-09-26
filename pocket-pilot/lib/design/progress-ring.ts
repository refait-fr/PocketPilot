export function clampRingProgress(percentage: number): number {
  if (typeof percentage !== "number" || !Number.isFinite(percentage)) {
    throw new Error("La progression de l’anneau est invalide.");
  }

  if (percentage <= 0) {
    return 0;
  }

  if (percentage >= 100) {
    return 100;
  }

  return percentage;
}

export function getRingGeometry({
  percentage,
  radius,
}: {
  percentage: number;
  radius: number;
}): { circumference: number; dashOffset: number; progress: number } {
  if (typeof radius !== "number" || !Number.isFinite(radius) || radius <= 0) {
    throw new Error("Le rayon de l’anneau est invalide.");
  }

  const progress = clampRingProgress(percentage);
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress / 100);

  return { circumference, dashOffset, progress };
}
