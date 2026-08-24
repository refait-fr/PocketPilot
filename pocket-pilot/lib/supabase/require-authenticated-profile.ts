import { redirect } from "next/navigation";

import {
  type CurrencyCode,
  isCurrencyCode,
  isValidTimeZone,
} from "@/lib/profile-options";
import { createClient } from "@/lib/supabase/server";

export type AuthenticatedProfile = {
  currencyCode: CurrencyCode;
  timeZone: string;
};

export async function requireAuthenticatedProfile() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError) {
    throw new Error("Impossible de vérifier la session utilisateur.");
  }

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
    !isCurrencyCode(profile.currency_code) ||
    !isValidTimeZone(profile.time_zone)
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
