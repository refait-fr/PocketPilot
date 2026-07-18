---
name: review-before-finish
description: Run PocketPilot's mandatory final review before claiming a coding, configuration, financial-domain, test, or UI task is complete. Use whenever files changed and a final handoff, completion report, or status claim is about to be sent; inspect the Git diff, run available Next.js validation commands, review security basics, and report unverified checks honestly.
---

# Review Before Finish

Complete each step before stating that a PocketPilot implementation is finished.

1. Re-read the user's request and identify the required outcome and explicit constraints.
2. Inspect `git diff --stat`, then the relevant file diffs. Confirm every changed file is necessary and there are no unrelated modifications.
3. Run the repository's available checks from the application directory: `npm run lint`, then `npm run build` as the type-checking and production-build validation for this Next.js project. Run targeted tests if a test suite exists when the task is performed.
4. If the UI changed, manually exercise the changed flow with Playwright when browser tooling is available. Verify narrow and wide layouts for overflow, clipping, readable hierarchy, and usable controls. Use `playwright-interactive` when its prerequisites are available.
5. Review changed code for exposed secrets, client-side privileged operations, missing server-side validation or authorization, unsafe untrusted input handling, and sensitive-data logging.
6. Remove dead code, temporary mocks, debugging output, unused imports, unused dependencies, and abstractions that do not reduce real complexity.
7. Re-run checks affected by cleanup.

## Reporting requirements

- Distinguish executed checks from inspection-only conclusions.
- If a check cannot run because no test suite, required service, or browser capability exists, state exactly what was not verified and why.
- End with a concise summary of files changed, behavior delivered, validations run and their result, and remaining verification gaps.

## Scope

- Coordinate final review only. Do not replace the dedicated `security-threat-model` skill: invoke it only when the user explicitly asks for threat modeling.
