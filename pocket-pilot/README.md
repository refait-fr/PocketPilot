# PocketPilot

PocketPilot est un MVP de planification financière par objectifs pour étudiants et jeunes actifs. Il relie revenus récurrents, dépenses fixes, transactions ponctuelles, budgets et allocations d’épargne pour calculer un reste mensuel disponible.

## Périmètre du MVP

Le produit couvre l’authentification email/mot de passe, le profil financier en devise unique, les revenus récurrents, les dépenses fixes récurrentes, les objectifs d’épargne, les transactions ponctuelles, les budgets par catégorie, le Purchase Checker et un dashboard synthétique.

Il ne couvre pas la synchronisation bancaire, la multi-devise avec conversion, les investissements, l’IA ni les graphiques avancés.

## Stack

- Next.js 16 avec App Router, React 19 et TypeScript strict ;
- Tailwind CSS 4 ;
- Supabase pour PostgreSQL, Auth et Row Level Security ;
- tests unitaires avec le module `node:test` ;
- tests end-to-end avec Playwright et Chromium.

## Prérequis

- Node.js 22.x ;
- npm ;
- Docker Desktop ou un runtime Docker-compatible pour Supabase local ;
- un projet Supabase sur lequel toutes les migrations de `supabase/migrations/` ont été appliquées.

## Installation

```powershell
git clone <url-du-depot>
cd PocketPilot/pocket-pilot
npm ci
Copy-Item .env.example .env.local
```

Renseignez ensuite les cinq variables applicatives de `.env.local`. Les variables réservées aux tests sont documentées séparément dans `e2e/.env.example` et ne doivent pas être copiées vers un environnement de production.

## Variables d’environnement

| Variable | Obligatoire | Rôle |
| --- | --- | --- |
| `SITE_URL` | oui | origine publique exacte de l’application, par exemple `http://localhost:3000` ou `https://app.example.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | oui | URL publique de l’API du projet Supabase ciblé par l’environnement |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | oui | clé publique navigateur utilisée avec les sessions Auth et les politiques RLS |
| `PRIVACY_CONTROLLER_NAME` | avant ouverture publique | identité réelle du responsable de traitement affichée sur `/privacy` |
| `PRIVACY_CONTACT_EMAIL` | avant ouverture publique | adresse réelle pour l’exercice des droits relatifs aux données |

La clé publishable est publique par conception. Une clé `service_role`, `sb_secret_...` ou tout autre secret privilégié ne doit jamais être ajouté à l’application, à une variable préfixée par `NEXT_PUBLIC_` ou au dépôt. Voir la [documentation des clés Supabase](https://supabase.com/docs/guides/getting-started/api-keys).

Utilisez de préférence deux projets Supabase distincts :

| Environnement | `NEXT_PUBLIC_SUPABASE_URL` | Configuration Auth |
| --- | --- | --- |
| local | URL du projet de développement | `Site URL` : `http://localhost:3000` |
| production | URL du projet de production | `Site URL` : `https://<domaine-production>` |

Ne copiez pas automatiquement l’URL du projet local dans l’environnement de production. Les valeurs de production sont configurées dans l’hébergeur et ne sont pas vérifiables depuis ce dépôt.

### Variables Playwright

Playwright ne réutilise jamais implicitement les variables Supabase de l’application. Le fichier `e2e/.env.example` documente les variables suivantes, qui doivent être définies explicitement dans le terminal lançant les E2E :

| Variable | Obligatoire | Rôle |
| --- | --- | --- |
| `E2E_BASE_URL` | non | origine locale de Next.js ; `http://127.0.0.1:3000` par défaut |
| `E2E_SUPABASE_URL` | oui | URL d’un Supabase local ou d’un projet distant dédié aux tests |
| `E2E_SUPABASE_PUBLISHABLE_KEY` | oui | clé publique de ce projet de test |
| `E2E_SUPABASE_SERVICE_ROLE_KEY` | oui | clé privilégiée lue uniquement par les fixtures Node pour préparer et nettoyer les comptes |
| `E2E_CONFIRM_NON_PRODUCTION` | oui | doit valoir exactement `true` après vérification de la cible |
| `E2E_MAILPIT_URL` | oui | origine Mailpit ou de l’inbox de test ; `http://127.0.0.1:54324` avec Supabase local |

La clé privilégiée n’est jamais envoyée au serveur Next ni au navigateur. Elle ne doit être stockée que dans l’environnement local ou dans les secrets GitHub du dépôt de test.

## Configuration Supabase Auth

Dans **Authentication > URL Configuration** :

1. définissez la `Site URL` sur l’origine exacte de l’environnement ;
2. autorisez les URLs exactes `http://localhost:3000/auth/confirm` et `http://localhost:3000/auth/callback` pour le développement ;
3. autorisez `https://<domaine-production>/auth/confirm` et `https://<domaine-production>/auth/callback` pour la production ;
4. évitez les jokers pour le domaine de production.

Dans le modèle **Confirm signup**, utilisez le point d’entrée SSR :

```html
{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email
```

PocketPilot fournit une URL de redirection construite uniquement depuis `SITE_URL`. Dans le modèle **Reset password**, conservez `{{ .ConfirmationURL }}` afin que Supabase vérifie le lien puis renvoie le code PKCE vers `/auth/callback?next=/auth/reset-password`. Ajoutez les callbacks locaux et de production à la liste des Redirect URLs autorisées. La [documentation Supabase sur les redirections](https://supabase.com/docs/guides/auth/redirect-urls) recommande des URLs de production exactes.

## Lancement local

```powershell
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000). Une session anonyme est redirigée vers `/auth`, une session sans profil vers `/onboarding`, puis un profil complet vers le dashboard.

## Tests et qualité

```powershell
npm run lint
npm run typecheck
npm run test:unit
npm run build
npm run check
```

`npm test` reste un alias de `npm run test:unit`. `npm run check` exécute lint, TypeScript, tests unitaires et build dans cet ordre ; les E2E restent séparés car ils exigent un environnement Supabase jetable explicite.

Les tests unitaires couvrent les conversions en centimes, les limites de précision, les calculs du dashboard et les projections d’objectifs.

### Installer et lancer Playwright

Après `npm ci`, installez Chromium une fois :

```powershell
npm run test:e2e:install
```

Pour Supabase local, démarrez la stack puis utilisez le lanceur sécurisé. Il lit les credentials éphémères depuis `supabase status`, refuse une URL distante et ne les écrit dans aucun fichier :

```powershell
npm run supabase:start
npm run supabase:reset
npm run lint:db
npm run test:db
npm run test:e2e:local
```

`npm run test:e2e:local:stable` exécute la suite deux fois consécutivement. Pour un projet de test séparé, définissez explicitement les variables dans la session PowerShell :

```powershell
$env:E2E_SUPABASE_URL = "http://127.0.0.1:54321"
$env:E2E_SUPABASE_PUBLISHABLE_KEY = "<cle-publique-locale>"
$env:E2E_SUPABASE_SERVICE_ROLE_KEY = "<cle-service-role-locale>"
$env:E2E_CONFIRM_NON_PRODUCTION = "true"
$env:E2E_MAILPIT_URL = "http://127.0.0.1:54324"
npm run test:e2e
```

Le runner démarre lui-même Next.js sur `127.0.0.1:3000` avec les variables E2E. Arrêtez tout serveur déjà présent sur ce port : Playwright refuse volontairement de réutiliser un serveur qui pourrait viser le mauvais projet Supabase.

Commandes de diagnostic :

```powershell
npm run test:e2e:ui
npx playwright show-report
npx playwright show-trace test-results/<test>/trace.zip
```

Les traces et screenshots ne sont conservés qu’en cas d’échec ; la vidéo est désactivée car la trace contient déjà les actions, snapshots DOM, requêtes et captures nécessaires au diagnostic.

### Supabase dédié aux E2E

Deux configurations sont prises en charge :

1. **Supabase local**, recommandé : la CLI est installée comme dépendance de développement et `supabase/config.toml` active les confirmations email, les callbacks SSR exacts et Mailpit. Exécutez `npm run supabase:start`, puis `npm run supabase:reset` et `npm run test:e2e:local`. Le lanceur transmet les clés locales uniquement au processus Playwright ; la clé `service_role` est retirée de l’environnement du serveur Next et n’est jamais envoyée au navigateur.
2. **Projet Supabase de test séparé** : appliquez toutes les migrations, activez email/mot de passe et la confirmation email, configurez `http://127.0.0.1:3000` comme Site URL ainsi que les callbacks Auth locaux, puis fournissez les trois valeurs E2E. Ce projet doit être jetable, ne contenir aucune donnée réelle et utiliser un SMTP sandbox capable de recevoir les adresses uniques `@example.test` ; le service email de démonstration Supabase est trop limité pour une CI fiable.

Le scénario d’inscription utilise l’interface réelle, récupère le message dans Mailpit et ouvre le lien de confirmation SSR. Le scénario de récupération fait de même avec le lien Supabase réel. La suite complète exige donc une inbox lisible via `E2E_MAILPIT_URL` ; aucun parcours email n’est simulé par le SDK.

Les comptes ont des adresses uniques par exécution et sont supprimés par l’API Admin en fin de test. La clé privilégiée reste exclusivement dans les fixtures Node ; elle n’est jamais transmise au navigateur ni au serveur Next.js. Les données financières associées sont supprimées par les clés étrangères `ON DELETE CASCADE`.

### Couverture E2E

La suite Chromium couvre : Auth, onboarding, déconnexion/reconnexion, états du dashboard, CRUD et activation des revenus/dépenses, objectifs et allocation finale plafonnée, isolation visuelle entre deux utilisateurs, récupération neutre et responsive `390 × 844`. Elle vérifie également les erreurs console, erreurs JavaScript, requêtes réseau échouées, débordements horizontaux et éléments accessibles par rôle/label.

Restent dépendants d’une infrastructure email adaptée : lien de récupération expiré ou déjà utilisé, renvoi de confirmation, et variantes Supabase « Secure password change » / « Require current password ».

### Tests PostgreSQL et RLS

La suite `supabase/tests/database/pocketpilot_rls.test.sql` vérifie l’isolation des six tables, le verrouillage de la devise et la suppression en cascade entre plusieurs utilisateurs authentifiés. Elle s’exécute exclusivement contre une instance locale jetable :

```powershell
# Prérequis : Supabase CLI et Docker Desktop démarré.
npm run supabase:start
npm run supabase:reset
npm run lint:db
npm run test:db
```

`supabase db reset` détruit et recrée la base locale ; ne l’exécutez jamais avec une URL de base distante. La suite utilise une transaction annulée à la fin et ne requiert aucune clé `service_role`.

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
- seules les allocations effectives des objectifs non atteints réduisent le reste disponible ;
- l’allocation effective est plafonnée au montant restant à atteindre ;
- un objectif est atteint lorsque son montant actuel est égal à sa cible ;
- le nombre de mois estimé est `ceil(montant restant / allocation mensuelle)` ;
- le mois courant compte comme premier mois d’allocation ;
- une allocation nulle ne produit aucune estimation ;
- les projections sont des estimations, jamais des garanties.
- une transaction future est refusée selon la date du fuseau horaire du profil ;
- la devise peut changer uniquement avant la création de toute donnée financière, car aucune conversion automatique n’est effectuée.

## Build et déploiement

```powershell
npm ci
npm run build
npm start
```

Avant la mise en production :

1. configurez les cinq variables de `.env.example` sur l’hébergeur ;
2. appliquez la migration au projet Supabase de production ;
3. vérifiez les six tables, leurs politiques RLS et la fonction de suppression du compte dans le Dashboard Supabase ;
4. configurez la `Site URL`, les Redirect URLs et le modèle d’email ;
5. activez le fournisseur email/mot de passe et vérifiez le service d’envoi d’emails ;
6. exécutez lint, typecheck, tests, build et un parcours Auth/CRUD sur l’URL déployée.

## Limites connues

- l’identité du responsable de traitement, le contact confidentialité et les durées de conservation des sauvegardes/journaux doivent être confirmés avant ouverture publique ;
- les tests RLS et le lanceur E2E local nécessitent un moteur Docker-compatible actif ;
- la suite E2E complète nécessite Mailpit ou une inbox de test lisible ; elle échoue explicitement si `E2E_MAILPIT_URL` manque ;
- les erreurs techniques Supabase restent volontairement remplacées par des messages génériques ;
- le déploiement de production, son domaine et sa configuration Supabase externe ne peuvent pas être validés depuis le dépôt local.

## Intégration continue

Le workflow `.github/workflows/ci.yml` s’exécute sur les pushes vers `main` et les pull requests ciblant `main`, avec Node.js 22 et le cache npm. Le job qualité lance `npm ci`, l’audit, ESLint, TypeScript, les tests unitaires et le build.

Un second job obligatoire démarre une instance Supabase locale jetable sur le runner GitHub, applique et lint les migrations, exécute pgTAP puis Playwright avec `E2E_CONFIRM_NON_PRODUCTION=true`. Les credentials locaux sont découverts dynamiquement par le lanceur et aucun secret GitHub n’est requis. Un échec de démarrage Supabase ou d’E2E fait échouer la CI ; la couverture navigateur n’est donc plus signalée comme réussie lorsqu’elle est absente. Le rapport HTML et les traces d’échec sont déposés comme artefact pendant 14 jours.

Dernière révision : 27 août 2026.
