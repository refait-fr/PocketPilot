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

export type RawProfile = {
  currencyCode: string;
  timeZone: string;
};

export async function requireAuthenticatedUser() {
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

  return { supabase, userId };
}

export async function requireRawProfile() {
  const { supabase, userId } = await requireAuthenticatedUser();

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

  const rawProfile: RawProfile = {
    currencyCode:
      typeof profile.currency_code === "string" ? profile.currency_code : "",
    timeZone: typeof profile.time_zone === "string" ? profile.time_zone : "",
  };

  return { rawProfile, supabase, userId };
}

export async function requireAuthenticatedProfile() {
  const { rawProfile, supabase, userId } = await requireRawProfile();

  if (
    !isCurrencyCode(rawProfile.currencyCode) ||
    !isValidTimeZone(rawProfile.timeZone)
  ) {
    // Chemin de réparation : les paramètres n'exigent pas un profil valide
    // et permettent de corriger devise et fuseau au lieu d'afficher un 500.
    redirect("/settings?notice=profile-invalid");
  }

  return {
    profile: {
      currencyCode: rawProfile.currencyCode,
      timeZone: rawProfile.timeZone,
    } satisfies AuthenticatedProfile,
    supabase,
    userId,
  };
}
