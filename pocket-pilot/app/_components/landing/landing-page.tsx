import Link from "next/link";

import { AppIcon } from "@/app/_components/app-icon";
import { LandingAnimations } from "@/app/_components/landing/landing-animations";
import { LandingDashboardPreview } from "@/app/_components/landing/landing-dashboard-preview";
import { PocketPilotLogo } from "@/app/_components/pocketpilot-logo";

const marginSteps = [
  { label: "Revenus mensuels", operator: "", value: "1 450 €" },
  { label: "Charges fixes", operator: "−", value: "492 €" },
  { label: "Allocations aux objectifs", operator: "−", value: "130 €" },
  { label: "Transactions", operator: "−", value: "200 €" },
] as const;

const transactionRows = [
  { category: "Shopping", label: "Chaussures", value: "−72,00 €" },
  { category: "Alimentation", label: "Courses", value: "−38,40 €" },
  { category: "Transport", label: "Essence", value: "−45,00 €" },
  { category: "Loisirs", label: "Cinéma", value: "−19,00 €" },
] as const;

const budgets = [
  { label: "Shopping", percent: 72, value: "72 / 100 €" },
  { label: "Transport", percent: 44, value: "35 / 80 €" },
  { label: "Alimentation", percent: 66, value: "164 / 250 €" },
] as const;

function BrandLink({ light = false }: { light?: boolean }) {
  return (
    <Link aria-label="PocketPilot, accueil" className="landing-brand" href="/">
      <PocketPilotLogo priority size={32} tone={light ? "light" : "dark"} />
      <span>PocketPilot</span>
    </Link>
  );
}

export function LandingPage() {
  return (
    <main className="landing" data-landing-root>
      <a className="skip-link" href="#landing-content">Aller au contenu</a>
      <LandingAnimations />

      <header className="landing-header" data-landing-header>
        <BrandLink />
        <nav aria-label="Navigation publique">
          <Link className="landing-sign-in" href="/auth">Se connecter</Link>
          <Link className="landing-button landing-button-dark" href="/auth">Commencer</Link>
        </nav>
      </header>

      <div id="landing-content">
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-hero-glow" aria-hidden="true" />
          <div className="landing-hero-copy">
            <p className="landing-eyebrow js-hero-reveal">Votre mois, rendu lisible.</p>
            <h1 id="landing-title">
              <span className="js-hero-reveal">Sachez ce qu’il vous</span>
              <span className="js-hero-reveal">reste vraiment.</span>
            </h1>
            <p className="landing-hero-lead js-hero-reveal">
              PocketPilot transforme vos revenus, charges, budgets et objectifs en un seul chiffre clair.
            </p>
            <div className="landing-hero-actions js-hero-reveal">
              <Link className="landing-button landing-button-dark" href="/auth">Créer mon compte <span aria-hidden="true">↗</span></Link>
              <a className="landing-text-link" href="#how-it-works">Voir comment ça marche <span aria-hidden="true">↓</span></a>
            </div>
            <p className="landing-demo-note js-hero-reveal">Gratuit pour commencer · Saisie manuelle · Aucune connexion bancaire</p>
          </div>
          <div className="landing-hero-preview js-hero-preview">
            <LandingDashboardPreview />
          </div>
        </section>

        <section className="landing-margin" id="how-it-works" aria-labelledby="margin-title">
          <div className="landing-section-intro" data-reveal>
            <p className="landing-eyebrow">Le chiffre qui compte</p>
            <h2 id="margin-title">Un seul chiffre.<br />Votre vraie marge mensuelle.</h2>
            <p>Les revenus ne sont que le début. PocketPilot soustrait ce qui est déjà engagé, pour un mois qui commence avec du contexte.</p>
          </div>
          <div className="landing-margin-equation" aria-label="Exemple de calcul de la marge mensuelle réelle">
            <p className="landing-example-label">Exemple illustratif</p>
            <ol>
              {marginSteps.map((step) => (
                <li data-margin-step key={step.label}>
                  <span>{step.label}</span><strong><i>{step.operator}</i>{step.value}</strong>
                </li>
              ))}
            </ol>
            <div className="landing-margin-result" data-margin-result>
              <span>Vraiment restant</span><strong>628 €</strong><small>pour le reste du mois</small>
            </div>
          </div>
        </section>

        <section className="landing-cockpit" aria-labelledby="cockpit-title">
          <div className="landing-cockpit-heading" data-reveal>
            <p className="landing-eyebrow">Votre cockpit financier</p>
            <h2 id="cockpit-title">Tout le mois,<br />en un seul écran.</h2>
            <p>Marge réelle, dépenses récentes, plafonds par catégorie et prochain objectif restent liés au lieu de vivre dans des tableurs séparés.</p>
          </div>
          <div className="landing-cockpit-stage" data-cockpit-stage>
            <LandingDashboardPreview compact />
          </div>
        </section>

        <section className="landing-spending" aria-labelledby="spending-title">
          <div className="landing-spending-copy" data-reveal>
            <p className="landing-eyebrow">Transactions</p>
            <h2 id="spending-title">Voyez où part vraiment votre argent.</h2>
            <p>Ajoutez les achats qui rythment votre mois. PocketPilot met à jour votre marge réelle sans prétendre synchroniser un compte bancaire.</p>
          </div>
          <div className="landing-transaction-ledger" data-transaction-ledger>
            <div className="landing-ledger-heading"><span>Démonstration</span><strong>Dépensé ce mois-ci <i>200,00 €</i></strong></div>
            <ul>
              {transactionRows.map((transaction) => (
                <li data-transaction-row key={transaction.label}>
                  <span className="landing-ledger-icon"><AppIcon name="transaction" /></span>
                  <span><strong>{transaction.label}</strong><small>{transaction.category}</small></span>
                  <strong>{transaction.value}</strong>
                </li>
              ))}
            </ul>
            <div className="landing-ledger-total"><span>Marge réelle après ces écritures</span><strong>628,00 €</strong></div>
          </div>
        </section>

        <section className="landing-budgets" aria-labelledby="budgets-title">
          <div className="landing-section-intro" data-reveal>
            <p className="landing-eyebrow">Budgets par catégorie</p>
            <h2 id="budgets-title">Fixez des plafonds.<br />Gardez le contexte.</h2>
            <p>Les budgets montrent votre rythme. Ils ne bloquent jamais un achat ni ne décident à votre place.</p>
          </div>
          <div className="landing-budget-stack">
            {budgets.map((budget) => (
              <article data-budget-card key={budget.label}>
                <div><span>{budget.label}</span><strong>{budget.value}</strong></div>
                <div aria-label={`${budget.percent} % du budget d’exemple ${budget.label} utilisé`} aria-valuemax={100} aria-valuemin={0} aria-valuenow={budget.percent} className="landing-budget-track" role="progressbar"><span data-budget-fill style={{ "--budget-width": `${budget.percent}%` } as React.CSSProperties} /></div>
                <small>{budget.percent} % utilisé</small>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-purchase" aria-labelledby="purchase-title" data-purchase-section>
          <div className="landing-purchase-pin">
            <div className="landing-purchase-copy">
              <p className="landing-eyebrow">Purchase Checker</p>
              <h2 id="purchase-title">Avant d’acheter,<br />mesurez l’impact.</h2>
              <p>Testez un achat face à votre marge réelle actuelle. Le résultat est déterministe, privé à votre session et jamais généré par IA.</p>
            </div>
            <div className="landing-purchase-calculator" data-purchase-calculator>
              <p>Vérification illustrative</p>
              <div data-purchase-step><span>Marge réelle actuelle</span><strong>628 €</strong></div>
              <div data-purchase-step><span>Achat</span><strong>−149 €</strong></div>
              <div className="landing-purchase-rule" aria-hidden="true" />
              <div className="landing-purchase-result" data-purchase-result><span>Reste après achat</span><strong>479 €</strong></div>
              <span className="landing-comfort-badge" data-purchase-badge>Confortable</span>
            </div>
          </div>
        </section>

        <section className="landing-goals" aria-labelledby="goals-title">
          <div className="landing-goal-copy" data-reveal>
            <p className="landing-eyebrow">Objectifs</p>
            <h2 id="goals-title">Gardez vos objectifs<br />dans le même tableau.</h2>
            <p>Les allocations font partie de votre plan mensuel, pas un ajout après coup. PocketPilot estime la progression sans présenter les projections comme des garanties.</p>
          </div>
          <article className="landing-goal-demo" data-goal-demo>
            <div className="landing-goal-demo-top"><span>Objectif principal</span><span>52 % terminé</span></div>
            <div className="landing-goal-demo-main"><span className="landing-goal-icon"><AppIcon name="goal" /></span><div><h3>MacBook</h3><p><strong>780 €</strong> épargnés sur 1 500 €</p></div></div>
            <div className="landing-goal-progress"><span data-goal-fill /></div>
            <dl>
              <div><dt>Reste</dt><dd>720 €</dd></div>
              <div><dt>Allocation mensuelle</dt><dd>120 €</dd></div>
              <div><dt>Durée estimée</dt><dd>6 mois</dd></div>
            </dl>
            <small>Projection basée sur l’allocation de démonstration.</small>
          </article>
        </section>

        <section className="landing-privacy" aria-labelledby="privacy-title">
          <div className="landing-privacy-mark" aria-hidden="true"><PocketPilotLogo size={92} tone="light" /></div>
          <div data-reveal>
            <p className="landing-eyebrow">Confidentialité par compte</p>
            <h2 id="privacy-title">Vos données financières restent privées.</h2>
            <p>Vos écritures appartiennent à votre compte, l’accès est isolé entre utilisateurs, et vous pouvez supprimer définitivement votre compte et vos données PocketPilot.</p>
            <Link href="/privacy">Lire la politique de confidentialité <span aria-hidden="true">↗</span></Link>
          </div>
        </section>

        <section className="landing-final" aria-labelledby="final-title">
          <div className="landing-final-symbol" aria-hidden="true">P</div>
          <div data-reveal>
            <p className="landing-eyebrow">Votre prochain mois commence ici</p>
            <h2 id="final-title">Reprenez le contrôle<br />de ce qui reste.</h2>
            <Link className="landing-button landing-button-light" href="/auth">Commencer avec PocketPilot <span aria-hidden="true">↗</span></Link>
            <p>Déjà un compte ? <Link href="/auth">Se connecter</Link></p>
          </div>
        </section>
      </div>

      <footer className="landing-footer">
        <BrandLink />
        <nav aria-label="Navigation de pied de page"><span>Produit</span><Link href="/auth">Se connecter</Link><Link href="/privacy">Confidentialité</Link></nav>
        <p>Jovure · © {new Date().getFullYear()} PocketPilot.</p>
      </footer>
    </main>
  );
}
