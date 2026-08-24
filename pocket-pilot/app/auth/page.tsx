import { AuthForm } from "@/app/auth/auth-form";
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
        <div className="flex items-center gap-3"><span className="brand-mark">P</span><span className="font-display text-2xl font-semibold tracking-[-0.04em]">PocketPilot</span></div>
        <div className="max-w-2xl">
          <p className="mb-6 text-xs font-extrabold uppercase tracking-[0.2em] text-[#8dd0bd]">Planifier avec un cap clair</p>
          <h1 className="font-display text-6xl font-medium leading-[0.98] tracking-[-0.055em] xl:text-7xl">Ce qu’il te reste. Ce vers quoi tu avances.</h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-[#bdc9c4]">PocketPilot transforme revenus, charges et objectifs en une vision simple de ton mois.</p>
        </div>
        <p className="max-w-lg border-l-2 border-[var(--accent)] pl-4 text-sm leading-6 text-[#aebdb7]">Pas de complexité bancaire. Des calculs déterministes, centrés sur tes projets.</p>
      </section>
      <section className="auth-form-stage flex min-h-screen items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
        <div className="w-full max-w-lg">
          <div className="mb-12 flex items-center gap-3 lg:hidden"><span className="brand-mark">P</span><span className="font-display text-2xl font-semibold tracking-[-0.04em]">PocketPilot</span></div>
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.17em] text-[var(--accent)]">Bienvenue</p>
          <h2 className="font-display text-4xl font-medium leading-tight tracking-[-0.045em] sm:text-5xl">Reprends le fil de ton mois.</h2>
          <p className="mb-8 mt-4 leading-7 text-[var(--ink-soft)]">Connecte-toi ou crée ton espace personnel. Cela ne prend qu’un instant.</p>
          <AuthForm initialNotice={initialNotice} />
        </div>
      </section>
    </main>
  );
}
