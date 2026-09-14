import { createClient } from "@supabase/supabase-js";

/**
 * Client privilégié réservé aux routes API authentifiées par jeton
 * personnel (Raccourci iOS). Contourne le RLS : chaque requête doit donc
 * filtrer explicitement par le `user_id` résolu depuis le jeton.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase service-role key is not configured.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
