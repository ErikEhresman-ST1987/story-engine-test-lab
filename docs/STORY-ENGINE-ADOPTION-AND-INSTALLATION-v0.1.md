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
6. **Runtime choice:** `StoryCoordinator` is a single-objective reference; `StoryRegistry` handles multiple invitations and facts; `ChapterSession` is a **lab-only ordered-chapter prototype**. They are not yet one combined production orchestrator. Do not assume all three are interchangeable.
7. **Persistence:** The game must own one coherent save containing game resources, receipts, story ID, content version, chapter index, and Ink state. Validate a candidate before replacing a valid save. Preserve existing save keys and add migration only with explicit tests. Current ChapterSession accepts a caller-provided completion confirmation; it does **not** independently prove the confirmation came from the host, so production code must not expose that method to untrusted callers.
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
- Host-verified completion must be bound to chapter advancement without caller-forged confirmation.
- Unified multi-story and multi-chapter coordinator, including coherent save transactions.
- Real approved narrative conversion and human dialogue-fidelity review.
- Verified migration/rollback and isolated Safari deployment in a real host game.

**Rule:** A green GitHub Actions run proves scoped tests only. Do not claim production installation or complete creative workflow until the above gates are satisfied.
