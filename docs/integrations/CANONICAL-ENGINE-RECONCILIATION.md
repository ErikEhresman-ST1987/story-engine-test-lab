# Canonical engine reconciliation — 2026-11-06

## Decision

Maintain **one** reusable Ink/inkjs engine in `packages/story-engine/` in this repository. Little Field Farm is the first installed host. The temporary feature branch is only for safe changes to this same repository.

## Direct comparison of named modules on both main branches

| Module | Result |
| --- | --- |
| `shared-game-narrative.cjs` | Exact same Git blob SHA |
| `multi-chapter-registry.cjs` | Exact same Git blob SHA |
| `chapter-session.cjs` | Exact same Git blob SHA |
| `narrative-manager.cjs` | Exact same Git blob SHA |
| `validate-manifest.cjs` | Exact same Git blob SHA |
| `compile-package.cjs` | Lab-only; not a divergent farm implementation |
| `host-contract.cjs` | Lab-only |
| `story-registry.cjs` | Lab-only |
| `validate-paths.cjs` | Lab-only |
| `authorized-game.cjs` | Lab-only |
| `migrate-narrative-save.cjs` | Lab-only |

A name-based comparison is **not** a complete recursive directory audit. Do not claim full parity until a tree-wide comparison is performed.

## Real farm production build

The farm's `scene-rebuild/compile-ink-stories.cjs` discovers story directories, reads each `manifest.json` and `.ink` chapter, validates metadata and objectives, compiles Ink with `inkjs/full`, and writes `story-ink-generated.cjs` plus a browser-facing `story-ink-registry.js`. The farm then bundles `story-ink-entry.cjs` with esbuild. Its entry exposes `window.FarmInk.createCoordinator` using `SharedGameNarrative`.

**Do not copy this script unmodified as a universal engine installer.** It contains farm-specific assumptions: `unlockCustomer` limited to customer positions 0–3, `chapterObjectives` with farm delivery/advance/finish types, `FarmInkStoryRegistry` and `window.FarmInk` globals, and a host progress ledger. These belong in a farm adapter or configurable host layer, not the canonical engine.

The lab already provides `compilePackage`, manifest validation, and browser test builds. Reuse those components and add only the missing generic discovery/registry glue, rather than creating a parallel engine.

## Proven host responsibilities

- Game verifies real objective prerequisites, then authorizes events; Ink text alone never consumes or grants inventory.
- Host saves game and narrative together and rejects malformed restores.
- Host owns NPC unlock conditions, portraits, inventory, UI, and backup/export.
- Approved story text stays in source files; compiled assets are generated and versioned.
- A separate test save key prevents accidental overwrites. Changing production save keys needs deliberate migration.
- Safari acceptance confirmed story completion, reload persistence and backup/restore in the farm; this does **not** establish portability to a second host.

## Next implementation gate

Implement a minimal **generic** story package build in this canonical repo, consume it in an independent host, and test it. Keep farm unchanged until this works. Do not mark turnkey-ready from documentation alone.
