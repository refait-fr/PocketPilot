import Link from "next/link";

import { AppShell } from "@/app/_components/app-shell";
import { requireAuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";

export default async function SettingsPage() {
  const { profile } = await requireAuthenticatedProfile();

  return (
    <AppShell
      activePath="/settings"
      description="Retrouvez les deux repères qui garantissent la cohérence de votre plan financier."
      eyebrow="Réglages"
      profile={profile}
      title="Votre cadre de calcul."
    >
      <section className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--paper)] p-7 shadow-[0_16px_50px_rgba(23,53,47,0.08)] sm:p-10">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--line)] bg-white/60 p-5">
            <dt className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
              Devise
            </dt>
            <dd className="font-display mt-3 text-3xl font-bold">
              {profile.currencyCode}
            </dd>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-white/60 p-5">
            <dt className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
              Fuseau horaire
            </dt>
            <dd className="mt-3 break-words text-lg font-bold">
              {profile.timeZone}
            </dd>
          </div>
        </dl>
        <p className="mt-6 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
          La modification de ces réglages sera ajoutée avec les prochains formulaires.
        </p>
        <Link
          className="mt-8 inline-flex rounded-xl bg-[var(--forest)] px-5 py-3 text-sm font-bold text-white transition-all duration-200 ease-in-out hover:bg-[#214b42] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--forest)]"
          href="/"
        >
          Retour au tableau de bord
        </Link>
      </section>
    </AppShell>
  );
}
