# Design Read
Reading this as: a household money cockpit for French users, direction premium dark (mockup IA de référence), dial ENERGY 2 / RHYTHM 2 / MOTION 2.
Le chrome applicatif connecté utilise le thème premium dark ci-dessous ; la landing et l’auth gardent leur identité claire (papier), hors périmètre du redesign.

## Thème premium dark (direction mockup IA, pas pixel-perfect)
- Fond charbon profond (#16181d, jamais #000000), cartes glass légèrement plus claires (blanc 4 %) avec bordure fine semi-transparente, aucune ombre lourde.
- Accent vert emerald unique (#10b981, #34d399 en texte) : CTA, montants positifs, progression — aucune couleur multiple qui se bat.
- Coins arrondis cohérents : 16px sur les cards (12px resserré), pills sur les badges.
- Typographie Manrope géométrique : gros chiffres bold tabulaires (font-amount), labels en gris moyen (#a7adb9).
- Barres fines : fond gris neutre (#333945), remplissage vert ; badges sémantiques vert < 85 %, ambre 85–100 %, rouge > 100 %.

## Corrections appliquées par rapport au mockup (bugs de génération)
1. Header unique partagé (AppHeader : logo + notifications + profil) sur tous les écrans authentifiés via AppShell — jamais de titre nu.
2. FAB (+) avec z-index 60 et safe-space ≥ 80px + safe-area en bas de liste (premium-fab-space) — ne chevauche jamais le contenu ; masqué sur desktop (sidebar présente).
3. Respiration en fin de liste (premium-list-breathe) : tout le contenu scrollable jusqu’au bout, aucune carte coupée par le bord ou la nav.
4. Bottom nav à état réel (resolveActiveTab) : /goals active « Objectifs », jamais « Home » ; les écrans sans onglet (settings, incomes, expenses, projection) n’activent rien. « Savings Goals » reste l’écran /goals existant, accessible via l’onglet dédié « Objectifs » — aucun écran séparé créé.
5. Objectifs : indicateur unique = anneau circulaire SVG avec % au centre (ProgressRing) ; barre linéaire redondante supprimée sur GoalRow (le dashboard utilisait déjà un anneau).
6. Badges/barres budget sémantiques (getBudgetTone) : vert < 85 %, ambre 85–100 %, rouge > 100 % ; seuil métier `near` aligné de 75 % → 85 % pour un système unique (tests unitaires + E2E mis à jour).
7. Icônes de catégorie neutres et cohérentes (CategoryIcon : fond gris + initiale, getCategoryInitial) — aucun traitement isolé ; système documenté ici : neutre unique, pas de couleur par catégorie.

## Composants premium (imports directs, pas de barrel)
- PremiumCard (glass) : dashboard, budgets, objectifs.
- ProgressRing (anneau SVG, géométrie testée) : objectifs.
- BudgetProgressBar (sémantique) : budget breakdown + dashboard.
- AppHeader (logo + cloche décorative « bientôt disponible » + profil) : tous les écrans via AppShell.
- Fab (+, vers /transactions/rapide sur l’écran Transactions) : safe-space géré en CSS.
- CategoryIcon (neutre) : transactions récentes du dashboard.
- Logique testée TDD (lib/design/) : budget-tone, progress-ring, navigation, category-initial (16 tests).

## Decisions (R-31, one line each)
- Warm parchment canvas (#ece8dc) + paper cards (#fffdf7): a ledger page, not a sterile grey default.
- One accent, deep ledger green (#1d4a34): reserved for the key moment (Reste réel, primary CTA, active nav).
- Paper sidebar on desktop with a green active marker: the logo asset is only proven on light surfaces, so dark stays in showcase sections.
- Kicker with a leading rule + double-rule under plan totals: the accounting-book motif, repeated.
- Tabular numerals for every amount: columns must align like a ledger.
- Chart line in ledger green: the curve is the month's handwriting.
- MOTION 2: restrained functional motion only, each with a written purpose below, `MotionConfig reducedMotion="user"` plus the global `prefers-reduced-motion` kill kept.
- AnimatedAmount counts the three dashboard KPIs and the Checker result: the eye lands on the key figure first.
- RollingDigits rolls the goal percent only: progress reads as movement, currency keeps tabular count-up (digit slots break on fr-FR grouping).
- TransitionPanel cross-fades Checker empty/result states: continuity between decision moments, `aria-live` kept.
- CreationDisclosure expands by height instead of `hidden` toggle: no brutal layout jump, keyboard and `aria-expanded` unchanged.
- Budget bars grow on first scroll into view: gauges read as gauges, values unchanged.
- ScrollProgress shows a 3px ledger-green bar on landing only: orientation on a long page.
- Panels, tables, plan list and chart stay static: calm ledger, motion never loops, amounts always settle on the exact centime.
- Apple-design pass: press feedback on all buttons (`:active` scale 0.97, 100ms), critically damped springs (bounce 0) on disclosure/panels/digits, symmetric enter/exit paths, count-up restarts from the displayed value, translucent landing header kept, `prefers-reduced-transparency` solid fallback added.
- Conscious deviations: app chrome stays opaque paper (ledger identity over translucent materials), height/width layout animations kept short and infrequent (no gesture scrub), Manrope kept over system font (recorded above).
- No gradient/glow color treatment: the lavender hero glow becomes monochrome paper light.
- Manrope kept: rounded enough for households, serious enough for money.
