import Link from "next/link";

import { PocketPilotLogo } from "@/app/_components/pocketpilot-logo";
import { getPrivacyConfiguration } from "@/lib/legal/privacy-config";

export default function PrivacyPage() {
  const { contactEmail, controllerName } = getPrivacyConfiguration();

  return (
    <main className="min-h-screen bg-[var(--canvas)] px-5 py-8 sm:px-8 sm:py-12">
      <article className="ui-panel mx-auto max-w-4xl overflow-hidden">
        <header className="border-b border-[var(--line)] p-6 sm:p-10">
          <Link className="inline-flex items-center gap-3" href="/auth"><PocketPilotLogo priority size={34} /><span className="font-display text-2xl font-semibold tracking-[-0.04em]">PocketPilot</span></Link>
          <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--accent)]">Informations publiques</p>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Politique de confidentialité</h1>
          <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">Dernière mise à jour : 27 août 2026.</p>
        </header>

        <div className="grid gap-8 p-6 text-sm leading-7 sm:p-10">
          {controllerName && contactEmail ? null : <aside className="ui-feedback-error" role="note">Configuration obligatoire avant ouverture publique : renseigner le responsable de traitement et l’adresse de contact dans les variables d’environnement dédiées.</aside>}
          <section><h2 className="font-display text-xl font-semibold">Responsable et contact</h2><p className="mt-2 text-[var(--ink-soft)]">Responsable de traitement : {controllerName ?? "à renseigner avant l’ouverture publique"}. Contact confidentialité : {contactEmail ? <a className="underline" href={`mailto:${contactEmail}`}>{contactEmail}</a> : "à renseigner avant l’ouverture publique"}.</p></section>
          <section><h2 className="font-display text-xl font-semibold">Données enregistrées et finalités</h2><p className="mt-2 text-[var(--ink-soft)]">PocketPilot enregistre l’adresse email et les informations Auth nécessaires à la connexion, ainsi que la devise et le fuseau horaire du profil. Les données financières saisies comprennent les revenus récurrents, charges fixes, objectifs d’épargne, transactions ponctuelles et budgets par catégorie. Elles servent uniquement à fournir les calculs, projections et vues financières demandés dans l’application.</p></section>
          <section><h2 className="font-display text-xl font-semibold">Hébergement et prestataires</h2><p className="mt-2 text-[var(--ink-soft)]">Supabase fournit l’authentification et la base PostgreSQL. Vercel est prévu pour l’hébergement de l’application. Leurs conditions de traitement et localisations effectives doivent être vérifiées dans les projets de production avant le lancement.</p></section>
          <section><h2 className="font-display text-xl font-semibold">Conservation et sécurité</h2><p className="mt-2 text-[var(--ink-soft)]">Les données restent associées au compte jusqu’à sa suppression. Une durée précise pour les journaux techniques et sauvegardes doit être définie et documentée avant l’ouverture publique. Les accès applicatifs sont limités au propriétaire des lignes par les politiques Row Level Security de PostgreSQL.</p></section>
          <section><h2 className="font-display text-xl font-semibold">Vos droits</h2><p className="mt-2 text-[var(--ink-soft)]">Vous pouvez demander l’accès, la rectification, l’effacement, la limitation ou la portabilité de vos données via le contact indiqué ci-dessus. La suppression directe du compte est disponible dans Paramètres. Vous pouvez également adresser une réclamation à la CNIL.</p></section>
          <div><Link className="ui-button-secondary" href="/auth">Retour à la connexion</Link></div>
        </div>
      </article>
    </main>
  );
}
