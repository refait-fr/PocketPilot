/**
 * Initiale affichée dans l’icône de catégorie neutre.
 * Style cohérent partout : fond neutre, pas de couleur par catégorie.
 */
export function getCategoryInitial(category: string): string {
  if (typeof category !== "string") {
    return "–";
  }

  const trimmed = category.trim();

  if (trimmed.length === 0) {
    return "–";
  }

  return trimmed.slice(0, 1).toUpperCase();
}
