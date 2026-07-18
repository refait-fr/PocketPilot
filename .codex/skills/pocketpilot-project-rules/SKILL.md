---
name: pocketpilot-project-rules
description: Apply PocketPilot's engineering conventions for every feature, bug fix, refactor, UI change, API integration, or test change in this Next.js repository. Enforce strict TypeScript, scoped and maintainable code, reusable UI, safe client-server boundaries, and intentional loading, empty, error, and success states.
---

# PocketPilot Project Rules

## Work within the existing stack

- Use TypeScript with the repository's existing strict configuration. Do not weaken `tsconfig.json` or use `any` to evade type safety.
- Follow the current Next.js App Router, React, Tailwind CSS, and ESLint setup. Do not introduce another framework, styling system, or test runner unless the request requires it and the dependency is justified.
- Reuse existing components, utilities, and styles before creating new ones. Search the application directory first.

## Keep the implementation simple

- Implement only the requested behavior. Do not add speculative features, configuration, dependencies, or unrelated refactors.
- Prefer explicit data flow, domain-oriented names, and small focused functions over implicit behavior, generic wrappers, or premature abstractions.
- Keep financial and other business rules out of React components. Place calculations and data transformations in typed modules that UI code calls.
- Split a file or component when it owns unrelated responsibilities or becomes hard to review; do not split code mechanically.
- Remove dead code, unused imports, debugging output, and temporary mocks before completion.

## UI and security requirements

- For each applicable asynchronous or data-driven UI flow, deliberately handle loading, empty, error, and success states.
- Keep secrets, privileged tokens, and server-only operations out of browser-delivered code. Treat all client code and client-side values as public.
- Validate data and enforce authorization at server or API trust boundaries; client-side checks are only UX.

## Decision check

- Add a dependency only when the built-in platform and current dependencies cannot solve the problem cleanly. State the maintenance justification.
- If an existing project convention conflicts with this skill, preserve the working convention unless the user asks to change it.
