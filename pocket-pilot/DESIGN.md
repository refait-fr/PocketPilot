# Design Read
Reading this as: a household money cockpit for French users, in a "registre de comptable moderne" (modern ledger book) style, dial ENERGY 2 / RHYTHM 2 / MOTION 2.
Fixed light theme is an explicit identity choice (daylight finance use, paper metaphor; `color-scheme: light` kept).

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
