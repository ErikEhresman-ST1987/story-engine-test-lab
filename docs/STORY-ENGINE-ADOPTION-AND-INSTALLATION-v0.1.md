# Story Engine — Adoption and Installation Guide v0.1

**Audience:** Future game-development projects that need offline, player-driven narrative. **Status:** Lab-verified building blocks; not yet a production-ready drop-in installer. This document is the starting point for evaluating and integrating the system.

## Start here: suitability
Use when the game needs NPC dialogue, choices, invitations, multi-chapter stories, persistent narrative state or gameplay-confirmed objectives. Do not install for static text alone. Works with local browser JavaScript and bundled inkjs; no backend or runtime AI required.

## Sources and boundaries
- Source repository: https://github.com/ErikEhresman-ST1987/story-engine-test-lab
- Generic code: `packages/story-engine/`
- Story examples (NOT approved canon): `fixtures/three-chapter/`
- Creative profile: `docs/GAME-NARRATIVE-PROFILE-HANDOFF-v0.1.md`
- Creative-to-development procedure: `docs/OMNIQUEST-TO-INK-WORKFLOW-v0.1.md`
- Acceptance gates: `docs/STEP-1-READINESS-GATE-v0.1.md`
- Tests: `tests/`

OmniQuest produces approved narrative. Development creates segmentation, Ink, manifests and host adapters. Never silently rewrite approved story outcomes.

## Installation process for a future project

1. **Gate:** Create a Goal Box / project foundation, identify the actual story need and decide whether the system removes friction. Record existing game version, save key/schema and rollback point.
2. **Isolated branch:** Do not install directly into a live game. Copy the reviewed `packages/story-engine/` modules into the game or adopt them through a deliberate dependency strategy. Pin the tested `inkjs` version (currently 2.4.0 in the lab); bundle it locally for offline play. These CommonJS modules require a browser bundler such as the lab's esbuild setup; they are **not** standalone browser script tags.
3. **Content:** Approve a Game Narrative Profile before Foundry blueprint/draft. Receive exact approved source and context. Record chapter/encounter boundaries and typical-playthrough length. Build `manifest.json` plus Ink chapter files; do not use the sample fixture as canon.
4. **Compile:** Call `compilePackage(manifest, inkFiles, hostContract)` from `packages/story-engine/compile-package.cjs`. Its returned `chapters` contain compiled Ink JSON and entry/completion checkpoints. Verify manifest schema and declared capabilities against the actual game.
5. **Host adapter:** Implement inventory/objective verification and idempotent receipts in the **game**, not Ink. Provide host snapshot/restore/event functions. Use `validateHostContract` for declared event/effect names. Do not grant resources from dialogue or a manifest.
6. **Runtime choice:** `StoryCoordinator` is a single-objective reference; `StoryRegistry` handles multiple invitations and facts; `ChapterSession` is a **lab-only ordered-chapter prototype**. An additive `MultiChapterRegistry` prototype now groups multiple independent `ChapterSession` instances into one snapshot envelope; it does not yet integrate the invitation/fact logic of `StoryRegistry`. Do not assume all three are interchangeable.
7. **Persistence:** The game must own one coherent save containing game resources, receipts, story ID, content version, chapter index, and Ink state. Validate a candidate before replacing a valid save. Preserve existing save keys and add migration only with explicit tests. ChapterSession now advances a chapter checkpoint only when its host adapter returns both `changed:true` and `completed:true` from an event. No public `completeChapter` method is exposed. **Remaining risk:** the host adapter must be trusted and enforce real prerequisites; the prototype does not yet guarantee a crash-safe atomic write.
8. **Tests:** Run `npm test` and `npm run build` in the lab or equivalent game pipeline. Test branch choices, early/duplicate completion, reload at each chapter, wrong content version, malformed save, two concurrent stories where applicable, and host event denial. Check all production changes against the original game regression suite.
9. **Safari/offline acceptance:** In an isolated deployed branch, test invitation, each chapter, game objective, refresh, closing/reopening, airplane mode, backup/restore and upgrade behavior. Give the human tester exact URL, steps and expected results.
10. **Rollout and rollback:** Only after approval, release versioned assets with a cache update path. Retain the previous build and backup. If regression occurs, revert the code without clearing or rewriting user data.

## Minimum implementation contract

```js
const {compilePackage}=require('./packages/story-engine/compile-package.cjs');
const {ChapterSession}=require('./packages/story-engine/chapter-session.cjs');
const compiled=compilePackage(manifest,inkFiles,hostContract);
const session=new ChapterSession({
 manifest,compiledChapters:compiled.chapters,host:gameAdapter
});
// Persist session.snapshot() together with host-owned data.
// The host must validate gameplay completion before chapter checkpoint advancement.
```

The snippet is an **integration illustration**, not an approved production install recipe. A future project must implement its own host adapter and atomic save owner.

## Known blockers to full production release
- Host-verified completion is now linked to chapter advancement in the lab; verify it with real game adapters and atomic save handling.
- `MultiChapterRegistry` now groups independent chapter sessions and validates complete save envelopes before replacing runtime state; invitation/fact scheduling, host-wide resource ownership, and crash-safe persistent writes remain unfinished.
- Real approved narrative conversion and human dialogue-fidelity review.
- Verified migration/rollback and isolated Safari deployment in a real host game.

**Rule:** A green GitHub Actions run proves scoped tests only. Do not claim production installation or complete creative workflow until the above gates are satisfied.

## Increment: multi-chapter registry prototype (2026-11-05)

- Module: `packages/story-engine/multi-chapter-registry.cjs`; tests: `tests/multi-chapter-registry.test.cjs`.
- Pass `packages: [{manifest,compiledChapters}]` and `hostFactory(storyId)`. Call `view(id)`, `choose(id,index)`, `event(id,name)`, `nextChapter(id)`, `snapshot()`, and `restore(save)`.
- Each story has an independent chapter session and host fixture. Restore creates candidate sessions and replaces the registry only after all validate; an invalid second story must leave the first intact.
- **Important limitation:** this is a prototype for independent host fixtures, **not** the production pattern for a shared Farm inventory. Real games need one authoritative host save owner, coordinated effects, invitations and facts, plus safe durable storage. Do not install this prototype into production unchanged.

## Increment: unified narrative manager prototype (2026-11-05)

- `packages/story-engine/narrative-manager.cjs` combines invitation states (hidden, available, deferred, declined, active, completed), eligibility facts, dependent-story unlocks, and the multi-chapter registry. Tests: `tests/narrative-manager.test.cjs`.
- Instantiate `new NarrativeManager({packages,hostFactory,save})`; use `view(id)`, `decide(id,'accept'|'later'|'decline')`, `revisit(id)`, `fact(name,true)`, `choose(id,index)`, `event(id,name)`, `nextChapter(id)`, and `snapshot()`/`restore(save)`.
- Save validation creates a candidate registry before replacing live narrative state. Completion unlocks dependent stories by setting `<storyId>_completed`.
- **Still not production-ready:** each story currently gets a separate host adapter instance; shared farm inventory, truly atomic durable writes, migration and invitation-to-dialogue presentation remain to be integrated and tested. Host adapters must be trusted to verify objective completion. Do not copy this prototype into a production game without these gates.
