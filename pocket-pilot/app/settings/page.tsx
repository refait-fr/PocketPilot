import Link from "next/link";

import { AppShell } from "@/app/_components/app-shell";
import { PasswordUpdateForm } from "@/app/auth/password-update-form";
import { requireAuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";

export default async function SettingsPage() {
  const { profile } = await requireAuthenticatedProfile();

  return (
    <AppShell
      activePath="/settings"
      description="Profil financier et sécurité du compte."
      eyebrow="Réglages"
      profile={profile}
      title="Paramètres"
    >
      <div className="settings-grid">
      <section className="ui-panel overflow-hidden">
        <div className="border-b border-[var(--line)] px-6 py-5 sm:px-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--accent)]">Préférences du profil</p>
          <h2 className="font-display mt-2 text-2xl font-semibold tracking-[-0.035em]">Repères de calcul</h2>
        </div>
        <dl className="ui-divider-list">
          <div className="grid gap-2 px-6 py-5 sm:grid-cols-[180px_1fr] sm:items-center sm:px-8">
            <dt className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
              Devise
            </dt>
            <dd className="font-amount text-xl font-extrabold">
              {profile.currencyCode}
            </dd>
          </div>
          <div className="grid gap-2 px-6 py-5 sm:grid-cols-[180px_1fr] sm:items-center sm:px-8">
            <dt className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
              Fuseau horaire
            </dt>
            <dd className="break-words text-base font-extrabold">
              {profile.timeZone}
            </dd>
          </div>
        </dl>
        <p className="mx-6 mt-6 max-w-2xl text-sm leading-6 text-[var(--ink-soft)] sm:mx-8">
          La modification de ces réglages sera ajoutée avec les prochains formulaires.
        </p>
        <Link
          className="ui-button-secondary mx-6 mb-7 mt-6 sm:mx-8"
          href="/"
        >
          Retour au tableau de bord
        </Link>
      </section>
      <section className="ui-panel p-6 sm:p-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--accent)]">
          Sécurité du compte
        </p>
        <h2 className="font-display mt-2 text-2xl font-semibold tracking-[-0.035em]">
          Changer de mot de passe
        </h2>
        <p className="mb-7 mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
          Choisissez un nouveau mot de passe et confirmez-le. Une vérification
          supplémentaire pourra être demandée par Supabase si votre session est
          ancienne.
        </p>
        <div className="max-w-lg">
          <PasswordUpdateForm
            returnHref="/settings"
            returnLabel="Rester dans les réglages"
          />
        </div>
      </section>
      </div>
    </AppShell>
  );
}
