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
      <section className="ui-panel mx-auto mt-8 grid w-full max-w-5xl overflow-hidden lg:grid-cols-[0.9fr_1.1fr]">
        <div className="auth-showcase onboarding-showcase p-8 text-white sm:p-10 lg:min-h-[500px]">
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.16em] text-[#aebde8]">Configuration initiale</p>
          <h1 className="font-display max-w-lg text-3xl font-semibold leading-[1.1] tracking-[-0.045em] sm:text-4xl">Configure ton profil financier.</h1>
          <p className="onboarding-showcase-copy mt-5 max-w-md text-sm leading-6 text-[#bdc9d9]">La devise et le fuseau horaire garantissent des montants et des périodes cohérents.</p>
          <ul className="mt-10 hidden space-y-3 text-sm font-bold text-[#e4ebe8] sm:block">
            <li className="border-l-2 border-[var(--accent)] pl-4">Montants conservés en centimes précis</li>
            <li className="border-l-2 border-[var(--accent)] pl-4">Dates et projections alignées sur ton fuseau</li>
          </ul>
        </div>
        <div className="flex items-center p-8 sm:p-10 lg:p-12"><div className="w-full max-w-md"><p className="mb-2 text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--accent)]">Profil financier</p><h2 className="font-display text-3xl font-semibold leading-tight tracking-[-0.04em]">Tes repères de calcul</h2><p className="mb-7 mt-3 text-sm leading-6 text-[var(--ink-soft)]">Ces deux informations suffisent pour commencer.</p><OnboardingForm /></div></div>
      </section>
    </main>
  );
}
