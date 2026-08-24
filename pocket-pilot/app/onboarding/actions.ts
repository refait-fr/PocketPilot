"use server";

import { redirect } from "next/navigation";
import { isCurrencyCode, isValidTimeZone } from "@/lib/profile-options";
import { createClient } from "@/lib/supabase/server";

export type OnboardingActionState = {
  status: "idle" | "error";
  message: string;
};

export async function saveProfile(
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const currencyCode = String(formData.get("currencyCode") ?? "");
  const timeZone = String(formData.get("timeZone") ?? "").trim();

  if (!isCurrencyCode(currencyCode)) {
    return { status: "error", message: "Choisissez une devise proposée." };
  }

  if (!isValidTimeZone(timeZone)) {
    return {
      status: "error",
      message:
        "Saisissez un fuseau horaire IANA valide, par exemple Europe/Paris.",
    };
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError) {
    return {
      status: "error",
      message: "Impossible de vérifier votre session. Réessayez dans un instant.",
    };
  }

  const userId = claimsData?.claims.sub;
  if (!userId) redirect("/auth");

  const { data: existingProfile, error: profileLookupError } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (profileLookupError) {
    return {
      status: "error",
      message:
        "Impossible de vérifier le profil pour le moment. Réessayez dans un instant.",
    };
  }

  if (existingProfile) redirect("/");

  const { error } = await supabase.from("profiles").insert({
    user_id: userId,
    currency_code: currencyCode,
    time_zone: timeZone,
  });

  if (error) {
    return {
      status: "error",
      message:
        "Le profil n’a pas pu être enregistré. Réessayez dans un instant.",
    };
  }

  redirect("/");
}
