import { AuthForm } from "@/app/auth/auth-form";
import { getAuthNotice } from "@/lib/auth/auth-notice";

type AuthPageProps = {
  searchParams: Promise<{ notice?: string | string[] }>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const { notice } = await searchParams;
  const initialNotice = getAuthNotice(notice);

  return (
    <main className="min-h-screen bg-[var(--background)] lg:grid lg:grid-cols-[1.08fr_0.92fr]">
      <section className="paper-grid relative hidden min-h-screen overflow-hidden bg-[var(--forest)] p-12 text-[#f7f3e9] lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="absolute -right-24 top-16 size-72 rounded-full border border-[#f7f3e933]" />
        <div className="absolute -right-5 top-40 size-40 rounded-full bg-[var(--accent)] opacity-90" />
        <div className="relative flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full border border-[#f7f3e966] font-display text-xl font-bold">P</span><span className="font-display text-2xl font-bold tracking-[-0.04em]">PocketPilot</span></div>
        <div className="relative max-w-2xl">
          <p className="mb-6 text-xs font-bold uppercase tracking-[0.22em] text-[#f0a47f]">Le budget qui part de vos projets</p>
          <h1 className="font-display text-6xl leading-[0.98] tracking-[-0.055em] xl:text-7xl">Donnez une date à ce qui compte vraiment.</h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-[#d9e2dd]">PocketPilot transforme vos revenus et charges fixes en un plan simple pour avancer vers vos objectifs.</p>
        </div>
        <div className="relative flex items-center gap-4 text-sm text-[#c7d5cf]"><span className="h-px w-12 bg-[var(--accent)]" />Pas de synchronisation bancaire. Votre cap, simplement.</div>
      </section>
      <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10 lg:px-14">
        <div className="w-full max-w-md">
          <div className="mb-12 flex items-center gap-3 lg:hidden"><span className="grid size-9 place-items-center rounded-full bg-[var(--forest)] font-display text-lg font-bold text-white">P</span><span className="font-display text-2xl font-bold tracking-[-0.04em]">PocketPilot</span></div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-dark)]">Commencer ici</p>
          <h2 className="font-display text-4xl leading-tight tracking-[-0.045em] sm:text-5xl">Votre prochain objectif vous attend.</h2>
          <p className="mb-8 mt-4 leading-7 text-[var(--ink-soft)]">Connectez-vous ou créez votre espace personnel en quelques secondes.</p>
          <AuthForm initialNotice={initialNotice} />
        </div>
      </section>
    </main>
  );
}
