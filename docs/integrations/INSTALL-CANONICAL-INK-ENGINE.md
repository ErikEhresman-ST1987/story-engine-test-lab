# Install the canonical Ink engine — developer trial

**Status:** A generic compiler and independent-host Node test have been added on the consolidation branch. They are **not yet an accepted browser/offline installation kit**. Keep using the existing farm installation until verification is complete.

## One engine

Canonical engine: `packages/story-engine/` in this repository. A new game copies/pins that directory, installs the tested `inkjs` version, and supplies a host adapter. Do not copy the farm's inventory, NPC rules or save key into another game.

## Compile a story

Story directory structure:

```text
my-story/
  manifest.json
  chapter-1.ink
  chapter-2.ink
```

A manifest must include `schema:1`, `storyId`, `contentVersion`, `sourceApproval`, nonempty `chapters` with `id`, `inkFile`, `entry`, `completion`, and arrays `requiresFacts`, `events`, `effects`. See `fixtures/three-chapter/` for a **test-only** example, not approved narrative.

Run from the repository root after `npm install`:

```sh
node scripts/compile-story-directory.cjs fixtures/three-chapter /tmp/compiled-story.json
npm test
```

The compiler calls the canonical `compilePackage`, validates the manifest and Ink checkpoints, and emits a JSON object with `manifest` and `compiledChapters`. It does not impose farm-specific customer indices, crops or globals.

## Connect a game

Use `MultiChapterRegistry({packages:[compiledPackage],hostFactory})` or the higher-level narrative manager when invitations/facts are needed. The host must implement `snapshot()`, `restore(save)` and `event(name)`; event completion must be verified by actual game state, returning `{changed:true,completed:true}` only on successful authorized completion. The independent example is `tests/portable-install.test.cjs`.

The host owns its UI, resource checks, durable saves, export/import, NPC invitations, versioned browser assets and offline service worker. A sample host that blindly accepts events is **test scaffolding**, never a production authorization policy.

## Still required

- Run the new test and existing suite in CI and inspect the result.
- Validate a separate browser host with locally bundled inkjs and offline reload.
- Test real resource authorization, duplicate events, restore, and backup/export in that host.
- Finalize a pinned release/installation checklist and only then call this turnkey-ready.

**Preservation:** Do not change Little Field Farm's working engine, approved story, or save key during these tests.
