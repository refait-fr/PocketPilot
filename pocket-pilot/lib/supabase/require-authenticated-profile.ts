import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AuthenticatedProfile = {
  currencyCode: string;
  timeZone: string;
};

export async function requireAuthenticatedProfile() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub;

  if (!userId) {
    redirect("/auth");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("currency_code, time_zone")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error("Impossible de charger le profil utilisateur.");
  }

  if (!profile) {
    redirect("/onboarding");
  }

  if (
    typeof profile.currency_code !== "string" ||
    !/^[A-Z]{3}$/.test(profile.currency_code) ||
    typeof profile.time_zone !== "string" ||
    profile.time_zone.length === 0
  ) {
    throw new Error("Le profil financier est invalide.");
  }

  return {
    profile: {
      currencyCode: profile.currency_code,
      timeZone: profile.time_zone,
    } satisfies AuthenticatedProfile,
    supabase,
    userId,
  };
}
