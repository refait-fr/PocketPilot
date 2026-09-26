import { getCategoryInitial } from "@/lib/design/category-initial";

type CategoryIconProps = {
  category: string;
};

/**
 * Icône de catégorie cohérente partout : fond neutre gris + initiale,
 * aucun traitement isolé (correction mockup n°7 : ex. « Rent » en vert
 * plein supprimé). Système assumé et documenté ici : neutre unique.
 */
export function CategoryIcon({ category }: CategoryIconProps) {
  return (
    <span aria-hidden="true" className="premium-category-icon">
      {getCategoryInitial(category)}
    </span>
  );
}
