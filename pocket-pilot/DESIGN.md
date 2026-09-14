# Design Read
Reading this as: a household money cockpit for French users, in a "registre de comptable moderne" (modern ledger book) style, dial ENERGY 2 / RHYTHM 2 / MOTION 1.
Fixed light theme is an explicit identity choice (daylight finance use, paper metaphor; `color-scheme: light` kept).

## Decisions (R-31, one line each)
- Warm parchment canvas (#ece8dc) + paper cards (#fffdf7): a ledger page, not a sterile grey default.
- One accent, deep ledger green (#1d4a34): reserved for the key moment (Reste réel, primary CTA, active nav).
- Paper sidebar on desktop with a green active marker: the logo asset is only proven on light surfaces, so dark stays in showcase sections.
- Kicker with a leading rule + double-rule under plan totals: the accounting-book motif, repeated.
- Tabular numerals for every amount: columns must align like a ledger.
- Chart line in ledger green: the curve is the month's handwriting.
- MOTION 1: hover states and existing reveals only, no new animation, `prefers-reduced-motion` kept.
- No gradient/glow color treatment: the lavender hero glow becomes monochrome paper light.
- Manrope kept: rounded enough for households, serious enough for money.
