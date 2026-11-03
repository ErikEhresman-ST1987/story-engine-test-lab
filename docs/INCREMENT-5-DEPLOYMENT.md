# Increment 5 — Deployment and verification instructions

## Objective
Verify a deliberate, explicitly versioned story-content migration without losing inventory, delivery receipts, or narrative phase. This is a **test-lab policy**, not a universal Ink save migration tool.

## Operational deployment
1. Keep work in `story-engine-test-lab`; do not modify Little Field Farm.
2. Commit source and tests to `main`. The repository's **Verify Ink Runtime** GitHub Actions workflow runs `npm test`, builds the site, and deploys GitHub Pages.
3. Under repository **Settings → Pages**, Source must be **GitHub Actions** (not branch deployment).
4. Verify both the `inkjs-tests` and `deploy` jobs are green. Use a fresh workflow run rather than rerunning a failed deploy job that may have conflicting `github-pages` artifacts.
5. Open https://erikehresman-st1987.github.io/story-engine-test-lab/ on iPad Safari. Reload online once before offline checks.
6. For compatibility testing, preserve the original `story-lab-integrated-v1` localStorage data. New tests should use separate keys and never silently replace or delete an incompatible save.

## Compatibility policy in this increment
- The story content version is distinct from the save schema version.
- An unchanged content version restores its serialized Ink state.
- An explicitly approved v1→v2 migration reconstructs Ink at a known narrative checkpoint based on validated gameplay state, rather than assuming old Ink instruction pointers are stable.
- The game remains authoritative for inventory, facts, and delivery receipts; migrations never replay gameplay effects.
- Unknown content versions, inconsistent receipts, and malformed saves must be rejected. Preserve the original bytes for recovery; do not overwrite them with defaults.
- Do not mark the migration as accepted until automated tests pass and the relevant browser/device behavior is demonstrated.

## Known limitations
This migration is narrowly tailored to Juliette's test story and four known phases. It does not prove arbitrary Ink content edits are compatible, support all future story layouts, guarantee power-loss atomicity, or migrate Little Field Farm saves.
