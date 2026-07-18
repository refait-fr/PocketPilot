import { redirect } from "next/navigation";
import { OnboardingForm } from "@/app/onboarding/onboarding-form";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub;
  if (!userId) redirect("/auth");
  const { data: profile } = await supabase.from("profiles").select("user_id").eq("user_id", userId).maybeSingle();
  if (profile) redirect("/");

  return (
    <main className="paper-grid min-h-screen px-5 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between"><span className="font-display text-2xl font-bold tracking-[-0.04em]">PocketPilot</span><span className="rounded-full border border-[var(--line)] bg-[#fffdf7aa] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)] backdrop-blur">Étape 1 sur 1</span></div>
      <section className="mx-auto mt-12 grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--paper)] shadow-[0_24px_80px_rgba(23,53,47,0.12)] lg:grid-cols-[0.92fr_1.08fr]">
        <div className="relative overflow-hidden bg-[var(--sage)] p-8 sm:p-12 lg:min-h-[620px]">
          <div className="absolute -bottom-28 -left-20 size-64 rounded-full border-[42px] border-[#17352f1a]" />
          <p className="relative mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-dark)]">Votre boussole</p>
          <h1 className="font-display relative max-w-lg text-5xl leading-[1.02] tracking-[-0.055em] sm:text-6xl">Deux repères, puis on trace la route.</h1>
          <p className="relative mt-7 max-w-md text-base leading-7 text-[#38534c]">Votre devise garantit des calculs cohérents. Votre fuseau place chaque échéance au bon moment.</p>
          <div className="relative mt-12 grid max-w-md grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[#17352f1a] bg-[#fffdf799] p-5 backdrop-blur"><span className="block text-2xl">€</span><span className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-[#456059]">Des centimes précis</span></div>
            <div className="rounded-2xl border border-[#17352f1a] bg-[#fffdf799] p-5 backdrop-blur"><span className="block text-2xl">24h</span><span className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-[#456059]">Des dates justes</span></div>
          </div>
        </div>
        <div className="flex items-center p-8 sm:p-12 lg:p-16"><div className="w-full max-w-md"><p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">Profil financier</p><h2 className="font-display text-4xl leading-tight tracking-[-0.045em]">Posez votre point de départ.</h2><p className="mb-8 mt-4 leading-7 text-[var(--ink-soft)]">Ces réglages structurent vos futurs calculs. Vous pourrez modifier votre fuseau plus tard.</p><OnboardingForm /></div></div>
      </section>
    </main>
  );
}
