import { AppShell } from "@/app/_components/app-shell";
import { ImporterForm } from "@/app/transactions/importer/importer-form";
import { CSV_IMPORT_HEADER } from "@/lib/finance/csv-import";
import { getAllowedCategories } from "@/lib/transactions/allowed-categories";
import { fetchUserCategoryNames } from "@/lib/transactions/user-categories";
import { requireAuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";

export default async function TransactionImporterPage() {
  const { profile, supabase, userId } = await requireAuthenticatedProfile();
  const customCategoryNames = await fetchUserCategoryNames({ supabase, userId });
  const allowedCategories = getAllowedCategories(customCategoryNames);

  return (
    <AppShell
      activePath="/transactions"
      description="Contrôlez chaque ligne avant d’enregistrer quoi que ce soit."
      eyebrow="Dépenses ponctuelles"
      profile={profile}
      title="Importer des transactions"
    >
      <div className="management-stack">
        <section className="ui-panel p-6 sm:p-8" aria-labelledby="csv-format-title">
          <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--accent)]">Format attendu</p>
          <h2 className="font-display mt-2 text-2xl font-semibold tracking-[-0.035em]" id="csv-format-title">Un fichier CSV au format PocketPilot</h2>
          <p className="mb-4 mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
            Une ligne par transaction, colonnes séparées par des points-virgules. La première ligne est ignorée
            lorsqu’elle reprend l’en-tête, et les lignes vides sont ignorées.
          </p>
          <pre className="overflow-x-auto rounded-xl border border-[var(--line)] bg-white p-4 text-xs leading-6" aria-label="Exemple de fichier CSV">
{`${CSV_IMPORT_HEADER.join(";")}
2026-08-24;Courses;25,90;Alimentation
2026-08-23;Bus;2,50;Transport`}
          </pre>
          <ul className="mt-4 grid gap-2 text-sm leading-6 text-[var(--ink-soft)]">
            <li><strong>date</strong> : jour ISO AAAA-MM-JJ, sans date future.</li>
            <li><strong>label</strong> : libellé de la dépense, 200 caractères maximum.</li>
            <li><strong>montant</strong> : montant strictement positif en décimales françaises (virgule acceptée, sans séparateur de milliers).</li>
            <li><strong>categorie</strong> : {allowedCategories.join(", ")}.</li>
          </ul>
        </section>

        <section className="ui-panel p-6 sm:p-8" aria-labelledby="csv-upload-title">
          <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--accent)]">Envoi et contrôle</p>
          <h2 className="font-display mt-2 text-2xl font-semibold tracking-[-0.035em]" id="csv-upload-title">Envoyez puis confirmez</h2>
          <p className="mb-7 mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
            L’analyse signale chaque ligne en erreur sans rien enregistrer. La confirmation réexamine le contenu
            puis n’enregistre que les lignes valides.
          </p>
          <ImporterForm currencyCode={profile.currencyCode} />
        </section>
      </div>
    </AppShell>
  );
}
