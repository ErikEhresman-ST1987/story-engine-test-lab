# One Reusable Ink Engine — Consolidation Record

The Story Engine Test Lab is the canonical source. Little Field Farm is its first proven host, not a second engine.

## Verified identity (2026-11-06)

GitHub main-branch blob SHA comparisons confirm the following files are **identical** between `packages/story-engine/` here and `scene-rebuild/story-engine/` in Little Field Farm:

- `shared-game-narrative.cjs` — `8e89610d134798bb155a71c1e124880cfa3bdeda`
- `multi-chapter-registry.cjs` — `a734b97d74b6a7a0d33ba26e37180992e0719b30`
- `chapter-session.cjs` — `3fd971bc69ca5caa57ab9f9baabdefabdf4205f2`

These core components require **no reconciliation**. Other files still need checking.

## Reusable engine versus host

The farm's `compile-ink-stories.cjs`, `story-ink-entry.cjs`, manifest and Ink story folders, and browser bundle establish a working production pipeline. Its `main.js`, inventory, NPC unlock rules, and save key are **game-specific**. The lab's `scripts/build-web.cjs` builds a laboratory site; it is not yet a documented replacement for the farm's production compilation pipeline.

## Preserve what works

Do not overwrite the farm, change its save key, rewrite approved stories, or create a second engine. Keep the old catalog-runner notes as clearly historical. A temporary Git development branch is not an engine fork.

## Remaining acceptance

1. Compare **all** engine modules across both repositories.
2. Consolidate a generic manifest/compiler/browser registry procedure in this canonical repository.
3. Demonstrate a minimal independent host that consumes canonical modules unchanged.
4. Test choices, host-authorized objectives, repeated events, persistence, malformed-save handling and backup/restore.
5. Test browser/offline operation and document the exact installation sequence and limitations.

**Status:** Farm integration verified; universal portability and one-command installation **not yet verified**.
