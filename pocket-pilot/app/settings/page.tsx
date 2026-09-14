import Link from "next/link";

import { AppShell } from "@/app/_components/app-shell";
import { PasswordUpdateForm } from "@/app/auth/password-update-form";
import { DeleteAccountForm } from "@/app/settings/delete-account-form";
import { ProfileSettingsForm } from "@/app/settings/profile-settings-form";
import { requireRawProfile } from "@/lib/supabase/require-authenticated-profile";

const financialTables = [
  { label: "revenu(s) récurrent(s)", table: "recurring_incomes" },
  { label: "charge(s) fixe(s)", table: "recurring_fixed_expenses" },
  { label: "objectif(s) d’épargne", table: "savings_goals" },
  { label: "transaction(s)", table: "transactions" },
  { label: "revenu(s) ponctuel(s)", table: "one_time_incomes" },
  { label: "budget(s) par catégorie", table: "category_budgets" },
] as const;

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string | string[] }>;
}) {
  // Volontairement sans validation du profil : un profil invalide doit
  // pouvoir être réparé ici au lieu de produire une erreur.
  const { rawProfile, supabase, userId } = await requireRawProfile();
  const notice = (await searchParams).notice;
  const showInvalidProfileNotice = notice === "profile-invalid";
  const counts = await Promise.all(
    financialTables.map(({ table }) =>
      supabase.from(table).select("id", { count: "exact", head: true }).eq("user_id", userId),
    ),
  );

  if (counts.some(({ error }) => error)) {
    throw new Error("Impossible de charger les préférences du compte.");
  }

  const canChangeCurrency = counts.every(({ count }) => (count ?? 0) === 0);
  const dataSummary = financialTables
    .map(({ label }, index) => ({ count: counts[index]?.count ?? 0, label }))
    .filter(({ count }) => count > 0);

  return (
    <AppShell activePath="/settings" description="Profil financier, confidentialité et sécurité du compte." eyebrow="Réglages" profile={rawProfile} title="Paramètres">
      <div className="settings-grid">
        {showInvalidProfileNotice ? (
          <p aria-live="polite" className="ui-feedback-error" role="alert">
            Votre profil contient une devise ou un fuseau horaire invalide. Corrigez les préférences ci-dessous pour réactiver le tableau de bord.
          </p>
        ) : null}
        <section className="ui-panel p-6 sm:p-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--accent)]">Préférences du profil</p>
          <h2 className="font-display mt-2 text-2xl font-semibold tracking-[-0.035em]">Repères de calcul</h2>
          <p className="mb-7 mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">Ces préférences déterminent l’affichage des montants et les limites calendaires du mois.</p>
          <ProfileSettingsForm canChangeCurrency={canChangeCurrency} currencyCode={rawProfile.currencyCode} timeZone={rawProfile.timeZone} />
        </section>

        <section className="ui-panel p-6 sm:p-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--accent)]">Sécurité du compte</p>
          <h2 className="font-display mt-2 text-2xl font-semibold tracking-[-0.035em]">Changer de mot de passe</h2>
          <p className="mb-7 mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">Choisissez un nouveau mot de passe et confirmez-le. Votre mot de passe actuel est demandé pour valider la modification.</p>
          <div className="max-w-lg"><PasswordUpdateForm requireCurrentPassword returnHref="/settings" returnLabel="Rester dans les réglages" /></div>
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
          <DeleteAccountForm dataSummary={dataSummary} />
        </section>
      </div>
    </AppShell>
  );
}
