export const SUPABASE_PAGE_SIZE = 1000;

type PageResult<T> = {
  data: readonly T[] | null;
  error: unknown;
};

/**
 * Charge toutes les lignes d'une requête Supabase par pages.
 *
 * L'API PostgREST plafonne les réponses à `max_rows` (1000) sans erreur :
 * sans pagination, un mois de plus de 1000 transactions produirait un
 * snapshot silently faux. Le parcours s'arrête dès qu'une page est
 * incomplète ; l'erreur brute est propagée pour que l'appelant la traduise.
 */
export async function fetchAllWithRange<T>(
  // PromiseLike car le builder Supabase est thenable sans catch/finally.
  fetchPage: (from: number, to: number) => PromiseLike<PageResult<T>>,
): Promise<T[]> {
  const rows: T[] = [];
  let offset = 0;

  for (;;) {
    const { data, error } = await fetchPage(
      offset,
      offset + SUPABASE_PAGE_SIZE - 1,
    );

    if (error) {
      throw error;
    }

    const page = data ?? [];
    rows.push(...page);

    if (page.length < SUPABASE_PAGE_SIZE) {
      return rows;
    }

    offset += SUPABASE_PAGE_SIZE;
  }
}
