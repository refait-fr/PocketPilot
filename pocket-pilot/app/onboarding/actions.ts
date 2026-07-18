"use server";

import { redirect } from "next/navigation";
import { isCurrencyCode } from "@/lib/profile-options";
import { createClient } from "@/lib/supabase/server";

export type OnboardingActionState = { status: "idle" | "error"; message: string };

function isValidTimeZone(value: string) {
  try { new Intl.DateTimeFormat("fr-FR", { timeZone: value }).format(); return true; } catch { return false; }
}

export async function saveProfile(_previousState: OnboardingActionState, formData: FormData): Promise<OnboardingActionState> {
  const currencyCode = String(formData.get("currencyCode") ?? "");
  const timeZone = String(formData.get("timeZone") ?? "").trim();
  if (!isCurrencyCode(currencyCode)) return { status: "error", message: "Choisissez une devise proposée." };
  if (!timeZone || timeZone.length > 64 || !isValidTimeZone(timeZone)) return { status: "error", message: "Saisissez un fuseau horaire IANA valide, par exemple Europe/Paris." };

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub;
  if (!userId) redirect("/auth");

  const { data: existingProfile } = await supabase.from("profiles").select("user_id").eq("user_id", userId).maybeSingle();
  if (existingProfile) redirect("/");

  const { error } = await supabase.from("profiles").insert({ user_id: userId, currency_code: currencyCode, time_zone: timeZone });
  if (error) return { status: "error", message: "Le profil n’a pas pu être enregistré. Réessayez dans un instant." };
  redirect("/");
}
