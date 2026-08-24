import { redirect } from "next/navigation";
import { OnboardingForm } from "@/app/onboarding/onboarding-form";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  if (claimsError) throw new Error("Impossible de vérifier la session utilisateur.");

  const userId = claimsData?.claims.sub;
  if (!userId) redirect("/auth");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error("Impossible de vérifier le profil utilisateur.");
  if (profile) redirect("/");

  return (
    <main className="min-h-screen bg-[var(--canvas)] px-5 py-7 sm:px-8 sm:py-10">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between"><span className="font-display text-2xl font-semibold tracking-[-0.04em]">PocketPilot</span><span className="ui-badge bg-[var(--surface-strong)] text-[var(--ink-soft)]">Étape 1 sur 1</span></div>
      <section className="ui-panel mx-auto mt-10 grid w-full max-w-6xl overflow-hidden lg:grid-cols-[0.92fr_1.08fr]">
        <div className="auth-showcase p-8 text-white sm:p-12 lg:min-h-[580px]">
          <p className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#8dd0bd]">Ton point de départ</p>
          <h1 className="font-display max-w-lg text-4xl font-medium leading-[1.02] tracking-[-0.055em] sm:text-6xl">PocketPilot calcule ce qu’il te reste réellement chaque mois.</h1>
          <p className="mt-7 max-w-md text-base leading-7 text-[#bdc9c4]">Ta devise garantit des montants cohérents. Ton fuseau horaire place chaque mois au bon moment.</p>
          <ul className="mt-10 hidden space-y-3 text-sm font-bold text-[#e4ebe8] sm:block">
            <li className="border-l-2 border-[var(--accent)] pl-4">Montants conservés en centimes précis</li>
            <li className="border-l-2 border-[var(--accent)] pl-4">Dates et projections alignées sur ton fuseau</li>
          </ul>
        </div>
        <div className="flex items-center p-8 sm:p-12 lg:p-16"><div className="w-full max-w-md"><p className="mb-3 text-xs font-extrabold uppercase tracking-[0.17em] text-[var(--accent)]">Profil financier</p><h2 className="font-display text-4xl font-medium leading-tight tracking-[-0.045em]">Deux repères, puis c’est parti.</h2><p className="mb-8 mt-4 leading-7 text-[var(--ink-soft)]">Ces informations suffisent pour dater et afficher correctement tes futurs calculs.</p><OnboardingForm /></div></div>
      </section>
    </main>
  );
}
