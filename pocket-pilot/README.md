# PocketPilot

PocketPilot est un MVP de planification financière par objectifs pour étudiants et jeunes actifs. Il relie revenus récurrents, dépenses fixes et allocations d’épargne pour calculer un reste mensuel disponible, sans suivi exhaustif des transactions.

## Périmètre du MVP

Le produit couvre l’authentification email/mot de passe, le profil financier en devise unique, les revenus récurrents, les dépenses fixes récurrentes, les objectifs d’épargne et un dashboard synthétique.

Il ne couvre pas les transactions quotidiennes, les catégories budgétaires, la synchronisation bancaire, la multi-devise, les investissements, l’IA ni les graphiques avancés.

## Stack

- Next.js 16 avec App Router, React 19 et TypeScript strict ;
- Tailwind CSS 4 ;
- Supabase pour PostgreSQL, Auth et Row Level Security ;
- tests unitaires avec le module `node:test`.

## Prérequis

- Node.js 20.9 ou une version ultérieure compatible ;
- npm ;
- un projet Supabase dont la migration [`supabase/migrations/20260718133000_create_pocketpilot_foundation.sql`](supabase/migrations/20260718133000_create_pocketpilot_foundation.sql) a été appliquée.

## Installation

```powershell
git clone <url-du-depot>
cd PocketPilot/pocket-pilot
npm ci
Copy-Item .env.example .env.local
```

Renseignez ensuite les deux valeurs de `.env.local`.

## Variables d’environnement

| Variable | Obligatoire | Rôle |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | oui | URL publique de l’API du projet Supabase ciblé par l’environnement |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | oui | clé publique navigateur utilisée avec les sessions Auth et les politiques RLS |

La clé publishable est publique par conception. Une clé `service_role`, `sb_secret_...` ou tout autre secret privilégié ne doit jamais être ajouté à l’application, à une variable préfixée par `NEXT_PUBLIC_` ou au dépôt. Voir la [documentation des clés Supabase](https://supabase.com/docs/guides/getting-started/api-keys).

Utilisez de préférence deux projets Supabase distincts :

| Environnement | `NEXT_PUBLIC_SUPABASE_URL` | Configuration Auth |
| --- | --- | --- |
| local | URL du projet de développement | `Site URL` : `http://localhost:3000` |
| production | URL du projet de production | `Site URL` : `https://<domaine-production>` |

Ne copiez pas automatiquement l’URL du projet local dans l’environnement de production. Les valeurs de production sont configurées dans l’hébergeur et ne sont pas vérifiables depuis ce dépôt.

## Configuration Supabase Auth

Dans **Authentication > URL Configuration** :

1. définissez la `Site URL` sur l’origine exacte de l’environnement ;
2. autorisez les URLs exactes `http://localhost:3000/auth/confirm` et `http://localhost:3000/auth/callback` pour le développement ;
3. autorisez `https://<domaine-production>/auth/confirm` et `https://<domaine-production>/auth/callback` pour la production ;
4. évitez les jokers pour le domaine de production.

Dans le modèle **Confirm signup**, utilisez le point d’entrée SSR :

```html
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```

Le code actuel ne fournit pas de `redirectTo` lors de l’inscription : la `Site URL` du projet Supabase détermine donc l’origine du lien. Avec un projet Supabase partagé, changer cette valeur pour la production affecte aussi les inscriptions locales. La [documentation Supabase sur les redirections](https://supabase.com/docs/guides/auth/redirect-urls) recommande des URLs de production exactes.

## Lancement local

```powershell
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000). Une session anonyme est redirigée vers `/auth`, une session sans profil vers `/onboarding`, puis un profil complet vers le dashboard.

## Tests et qualité

```powershell
npm run lint
npm run typecheck
npm test
npm run build
```

Les tests unitaires couvrent les conversions en centimes, les limites de précision, les calculs du dashboard et les projections d’objectifs. Les parcours Auth et CRUD nécessitent en complément un projet Supabase joignable et une validation Playwright.

## Architecture

| Zone | Responsabilité |
| --- | --- |
| `app/` | routes App Router, Server Components, Server Actions et états UI |
| `app/_components/` | composants partagés du shell, du dashboard et des entrées récurrentes |
| `lib/finance/` | validation et calculs financiers purs et déterministes |
| `lib/supabase/` | clients SSR/navigateur et garde de session avec profil |
| `proxy.ts` | rafraîchissement de session et redirections Auth/onboarding |
| `supabase/migrations/` | schéma PostgreSQL, contraintes, index, droits et politiques RLS |

Les Server Actions récupèrent `userId` depuis la session Supabase SSR. Elles imposent cet identifiant à la création et le filtrent explicitement sur les modifications et suppressions. Les politiques RLS restent la seconde barrière d’autorisation.

## Règles financières

- tous les montants persistés et calculés sont des centimes entiers ;
- les entrées utilisateur sont converties avec `BigInt` à la frontière, puis refusées au-delà de `Number.MAX_SAFE_INTEGER` ;
- seuls les revenus et dépenses actifs participent au dashboard ;
- seules les allocations des objectifs non atteints réduisent le reste disponible ;
- un objectif est atteint lorsque son montant actuel est égal à sa cible ;
- le nombre de mois estimé est `ceil(montant restant / allocation mensuelle)` ;
- le mois courant compte comme premier mois d’allocation ;
- une allocation nulle ne produit aucune estimation ;
- les projections sont des estimations, jamais des garanties.

## Build et déploiement

```powershell
npm ci
npm run build
npm start
```

Avant la mise en production :

1. configurez les deux variables publiques sur l’hébergeur ;
2. appliquez la migration au projet Supabase de production ;
3. vérifiez les quatre tables et leurs politiques RLS dans le Dashboard Supabase ;
4. configurez la `Site URL`, les Redirect URLs et le modèle d’email ;
5. activez le fournisseur email/mot de passe et vérifiez le service d’envoi d’emails ;
6. exécutez lint, typecheck, tests, build et un parcours Auth/CRUD sur l’URL déployée.

## Limites connues

- les réglages affichent la devise et le fuseau horaire mais ne permettent pas encore leur modification ;
- aucun test d’intégration automatisé n’est livré contre une base Supabase réelle ;
- les erreurs techniques Supabase restent volontairement remplacées par des messages génériques ;
- le déploiement de production, son domaine et sa configuration Supabase externe ne peuvent pas être validés depuis le dépôt local.

Dernière révision : 18 juillet 2026.
