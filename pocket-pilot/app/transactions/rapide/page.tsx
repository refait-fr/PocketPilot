import Link from "next/link";

import { PocketPilotLogo } from "@/app/_components/pocketpilot-logo";
import { createTransaction } from "@/app/transactions/actions";
import { TransactionForm } from "@/app/transactions/transaction-form";
import { getCalendarDateInTimeZone } from "@/lib/finance/calendar-month";
import { getAllowedCategories } from "@/lib/transactions/allowed-categories";
import { parseQuickAddParams } from "@/lib/transactions/quick-add-params";
import { fetchUserCategoryNames } from "@/lib/transactions/user-categories";
import { requireAuthenticatedProfile } from "@/lib/supabase/require-authenticated-profile";

/**
 * Ajout rapide de dépense, pensé pour être ouvert par un Raccourci iOS
 * (double-tap au dos → ouvrir l’URL). Mise en page volontairement légère,
 * montant focalisé et date du jour, avec pré-remplissage optionnel :
 * `/transactions/rapide?montant=12,50&categorie=Alimentation&description=Courses`
 */
export default async function QuickAddTransactionPage({
  searchParams,
}: {
  searchParams: Promise<{
    categorie?: string | string[];
    description?: string | string[];
    montant?: string | string[];
  }>;
}) {
  const { profile, supabase, userId } = await requireAuthenticatedProfile();
  const today = getCalendarDateInTimeZone(new Date(), profile.timeZone);
  const customCategoryNames = await fetchUserCategoryNames({ supabase, userId });
  const defaultValues = parseQuickAddParams(
    await searchParams,
    customCategoryNames,
    today,
  );

  return (
    <div className="quick-add-frame">
      <a href="#quick-add-main" className="skip-link">Aller au formulaire</a>
      <header className="quick-add-header">
        <Link
          aria-label="PocketPilot, retour au tableau de bord"
          className="brand-lockup"
          href="/dashboard"
        >
          <span className="brand-mark" aria-hidden="true">
            <PocketPilotLogo size={30} />
          </span>
          <span className="brand-name">PocketPilot</span>
        </Link>
        <Link className="ui-button-quiet min-h-10 px-3 py-2 text-xs" href="/transactions">
          Toutes les transactions
        </Link>
      </header>
      <main className="quick-add-main" id="quick-add-main">
        <p className="ui-kicker">Ajout rapide</p>
        <h1>Dépense du jour</h1>
        <p>Montant, catégorie, valider : la page reste ouverte pour enchaîner.</p>
        <div className="ui-panel quick-add-panel">
          <TransactionForm
            action={createTransaction}
            allowedCategories={getAllowedCategories(customCategoryNames)}
            autoFocusAmount
            defaultValues={defaultValues}
            maximumTransactionDate={today}
            mode="create"
          />
        </div>
      </main>
    </div>
  );
}
