---
name: finance-domain
description: Safeguard PocketPilot financial logic whenever working with money, balances, transactions, budgets, income, expenses, forecasts, projections, financial imports, APIs, UI displays, or financial tests. Require integer-cent arithmetic, pure deterministic calculations, explicit assumptions, edge-case tests, and strict separation between AI explanations and user data changes.
---

# PocketPilot Finance Domain

## Represent money correctly

- Store, transmit, compare, and calculate monetary values as integers in the smallest currency unit, such as cents.
- Never use binary floating-point numbers for money. Convert input at a boundary using an explicit rounding rule and retain integer values thereafter.
- Keep calculation values separate from presentation. Apply locale, currency, sign, and display rounding only when formatting for the UI.
- Do not assume a currency, tax rule, interest rate, compounding method, or time basis that is not defined by the user or the domain model.

## Build deterministic financial logic

- Put calculations in small, pure TypeScript functions with explicit input and output types. Keep React state, API calls, database access, and LLM calls outside these functions.
- Validate at boundaries and define behavior for irregular income, `null` or missing values, zero, negative amounts, malformed or duplicate records, and impossible dates.
- Do not silently coerce invalid values or dates into plausible results. Return a typed failure, omit records only through a documented policy, or require correction.
- Guard integer arithmetic against the precision limits of JavaScript numbers and the eventual storage layer.
- Test standard cases and relevant boundaries: zero, negatives, missing values, irregular income periods, rounding thresholds, invalid dates, and date-range edges.

## Projections and AI

- Show a projection's inputs, assumptions, period, and uncertainty where it is presented.
- Describe projections as estimates or scenarios, never as guarantees, promises, or financial advice.
- Never delegate financial calculations, validation, or decisions to an LLM. AI may explain a result only after deterministic application code has computed it.
- Treat AI output as untrusted text. It must not directly create, update, approve, categorize conclusively, or delete user financial data; require an explicit user-confirmed application flow with normal validation.

## Completion check

- Verify a clear boundary between persisted cents, calculation functions, API payloads, and display formatters.
- Report any assumption that could materially change a calculation or projection.
