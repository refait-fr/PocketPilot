import type { SupabaseClient } from "@supabase/supabase-js";

import { logServerError } from "@/lib/observability/server-log";

/**
 * Charge les noms des catégories personnelles de l’utilisateur, triés
 * par ordre alphabétique français. Retourne une liste vide en cas
 * d’échec de lecture pour laisser les 8 catégories par défaut utilisables.
 */
export async function fetchUserCategoryNames({
  supabase,
  userId,
}: {
  supabase: SupabaseClient;
  userId: string;
}): Promise<string[]> {
  const { data, error } = await supabase
    .from("user_categories")
    .select("name")
    .eq("user_id", userId)
    .order("name");

  if (error) {
    logServerError("user-categories:list", error);
    return [];
  }

  const names: string[] = [];

  for (const row of data ?? []) {
    if (typeof row.name === "string" && row.name.trim().length > 0) {
      names.push(row.name);
    }
  }

  return names.sort((first, second) => first.localeCompare(second, "fr"));
}
