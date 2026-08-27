import Link from "next/link";

import { AuthForm } from "@/app/auth/auth-form";
import { PocketPilotLogo } from "@/app/_components/pocketpilot-logo";
import { getAuthNotice } from "@/lib/auth/auth-notice";

type AuthPageProps = {
  searchParams: Promise<{ notice?: string | string[] }>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const { notice } = await searchParams;
  const initialNotice = getAuthNotice(notice);

  return (
    <main className="min-h-screen bg-[var(--canvas)] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(480px,0.78fr)]">
      <section className="auth-showcase hidden min-h-screen p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="flex items-center gap-3"><span className="brand-mark"><PocketPilotLogo priority size={34} tone="light" /></span><span className="font-display text-2xl font-semibold tracking-[-0.04em]">PocketPilot</span></div>
        <div className="max-w-2xl">
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.16em] text-[#b7b7bd]">Planification financière</p>
          <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-[-0.045em] xl:text-5xl">Pilote ton mois avec des repères fiables.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#c1c1c6]">Revenus, charges, budgets et objectifs réunis dans une vue claire.</p>
          <div aria-hidden="true" className="auth-pilot-visual">
            <div className="auth-pilot-route"><i /><i /><i /><i /></div>
            <div className="auth-pilot-labels"><span>Plan</span><span>Marge</span><span>Cap</span><span>Objectif</span></div>
          </div>
        </div>
        <p className="max-w-lg border-l-2 border-white pl-4 text-sm leading-6 text-[#b7b7bd]">Pas de complexité bancaire. Des calculs déterministes, centrés sur tes projets.</p>
      </section>
      <section className="auth-form-stage flex min-h-screen items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
        <div className="w-full max-w-lg">
          <div className="mb-12 flex items-center gap-3 lg:hidden"><span className="brand-mark"><PocketPilotLogo priority size={34} /></span><span className="font-display text-2xl font-semibold tracking-[-0.04em]">PocketPilot</span></div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--accent)]">Espace personnel</p>
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">Connexion à PocketPilot</h2>
          <p className="mb-7 mt-3 text-sm leading-6 text-[var(--ink-soft)]">Connecte-toi ou crée ton compte pour retrouver ton plan financier.</p>
          <AuthForm initialNotice={initialNotice} />
          <p className="mt-7 text-center text-xs leading-5 text-[var(--ink-soft)]">
            En utilisant PocketPilot, vous pouvez consulter notre{" "}
            <Link className="font-bold underline" href="/privacy">politique de confidentialité</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}
