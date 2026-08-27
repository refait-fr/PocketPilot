import Link from "next/link";

import { AppShell } from "@/app/_components/app-shell";
import { PasswordUpdateForm } from "@/app/auth/password-update-form";
import { DeleteAccountForm } from "@/app/settings/delete-account-form";
import { ProfileSettingsForm } from "@/app/settings/profile-settings-form";
import { requireAuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";

const financialTables = [
  "recurring_incomes",
  "recurring_fixed_expenses",
  "savings_goals",
  "transactions",
  "category_budgets",
] as const;

export default async function SettingsPage() {
  const { profile, supabase, userId } = await requireAuthenticatedProfile();
  const counts = await Promise.all(
    financialTables.map((table) =>
      supabase.from(table).select("id", { count: "exact", head: true }).eq("user_id", userId),
    ),
  );

  if (counts.some(({ error }) => error)) {
    throw new Error("Impossible de charger les préférences du compte.");
  }

  const canChangeCurrency = counts.every(({ count }) => (count ?? 0) === 0);

  return (
    <AppShell activePath="/settings" description="Profil financier, confidentialité et sécurité du compte." eyebrow="Réglages" profile={profile} title="Paramètres">
      <div className="settings-grid">
        <section className="ui-panel p-6 sm:p-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--accent)]">Préférences du profil</p>
          <h2 className="font-display mt-2 text-2xl font-semibold tracking-[-0.035em]">Repères de calcul</h2>
          <p className="mb-7 mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">Ces préférences déterminent l’affichage des montants et les limites calendaires du mois.</p>
          <ProfileSettingsForm canChangeCurrency={canChangeCurrency} currencyCode={profile.currencyCode} timeZone={profile.timeZone} />
        </section>

        <section className="ui-panel p-6 sm:p-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--accent)]">Sécurité du compte</p>
          <h2 className="font-display mt-2 text-2xl font-semibold tracking-[-0.035em]">Changer de mot de passe</h2>
          <p className="mb-7 mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">Choisissez un nouveau mot de passe et confirmez-le. Une vérification supplémentaire pourra être demandée par Supabase si votre session est ancienne.</p>
          <div className="max-w-lg"><PasswordUpdateForm returnHref="/settings" returnLabel="Rester dans les réglages" /></div>
        </section>

        <section className="ui-panel p-6 sm:p-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--accent)]">Confidentialité</p>
          <h2 className="font-display mt-2 text-2xl font-semibold tracking-[-0.035em]">Vos données</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">Consultez les données enregistrées, leur usage et les moyens d’exercer vos droits.</p>
          <Link className="ui-button-secondary mt-6" href="/privacy">Lire la politique de confidentialité</Link>
        </section>

        <section className="ui-panel border-red-200 p-6 sm:p-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-red-700">Zone dangereuse</p>
          <h2 className="font-display mt-2 text-2xl font-semibold tracking-[-0.035em]">Supprimer le compte</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">Cette action supprime définitivement le compte Auth et toutes ses données PocketPilot : profil, revenus, charges, objectifs, transactions et budgets.</p>
          <DeleteAccountForm />
        </section>
      </div>
    </AppShell>
  );
}
