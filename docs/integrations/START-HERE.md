# Story Integration — START HERE

**Current direction (2026-11-06):** Ink/inkjs is the active narrative runtime in Little Field Farm after [restoration PR #10](https://github.com/ErikEhresman-ST1987/little-field-farm/pull/10). The earlier catalog-runner implementation in [PR #9](https://github.com/ErikEhresman-ST1987/little-field-farm/pull/9) is historical, not the current installation recipe.

## Working implementation and evidence
- [Little Field Farm current runtime](https://github.com/ErikEhresman-ST1987/little-field-farm/tree/main/scene-rebuild): `story-engine/`, `stories/juliette/*.ink`, `stories/juliette/manifest.json`, `compile-ink-stories.cjs`, `story-ink-entry.cjs`, generated `story-ink-bundle.js` and `story-ink-registry.js`, `story-unlocks.js`, and the host integration in `main.js`.
- The farm build command is `npm run build:story`; its GitHub workflow checks compiled output, integration, syntax, save isolation, dialogue ordering and browser script dependencies.
- Human iPad Safari playtesting confirmed *The Unexpected Dinner Guest* completes, progress survives reopening, and farm backup/restore works. The player also confirmed the merged build and test progress after returning Pages to `main`.
- **Not yet proven:** a zero-rework installation into a different game, a second independent story, full offline acceptance in a second host, and crash-safe atomic persistence. Do not call this a drop-in engine until the portability test passes.

## Install into a new game — current provisional route
1. Start with [Adoption and Installation](../STORY-ENGINE-ADOPTION-AND-INSTALLATION-v0.1.md) and the **actual working farm integration** above. The laboratory's `packages/story-engine/` is related but is not automatically synchronized with the farm's deployed copy.
2. Preserve the approved story text. Author a manifest and chapter `.ink` files; compile them with a local pinned Ink/inkjs toolchain.
3. Connect game-owned events, inventory, unlock rules, and unified save through a host adapter. The engine must not silently grant resources.
4. Use versioned browser assets, local bundling, and an isolated save key for tests.
5. Verify dialogue, objectives, repeated events, reload, backup/restore, malformed saves, and Safari/offline behavior before release.

**Portability work is in progress.** These are known implementation steps, not a claim that a ready-to-copy generic installer exists. The next deliverable is a minimal independent host that proves which files/configuration are reusable and which adapter responsibilities remain game-specific.

## Historical references — preserve, do not use as current farm instructions
- [Catalog Story System v1.0](LITTLE-FIELD-FARM-CATALOG-STORY-SYSTEM-v1.0.md) — working earlier JavaScript runner, superseded by PR #10.
- [Earlier Juliette Ink contract](LITTLE-FIELD-FARM-APPROVED-STORY.md) and [historical prototype](LITTLE-FIELD-FARM-HISTORICAL-PROTOTYPE.md) — previous story/implementation stages.
- [NPC Unlocks](LITTLE-FIELD-FARM-NPC-UNLOCKS-v1.0.md) — farm-specific unlock design; verify against current implementation before reuse.
- [Production Hardening](../PRODUCTION-HARDENING-v0.1.md), [Browser Acceptance](../BROWSER-ACCEPTANCE-v0.1.md), and [OmniQuest-to-Ink workflow](../OMNIQUEST-TO-INK-WORKFLOW-v0.1.md).

## Ownership boundaries
| Layer | Owns | Does not own |
| --- | --- | --- |
| OmniQuest | Approved narrative and continuity | Farm resources |
| Ink package | Dialogue, choices, chapters, declared story events | Unverified gameplay rewards |
| Story coordinator | Narrative progress and checkpoint state | Inventory authorization |
| NPC unlock gate | Invitations and prerequisites | Ink prose |
| Game host | Inventory, verified events, persistence, UI and backups | Unapproved narrative changes |

## Lessons retained
- A green CI run proves only its tested scope; real Safari playtesting exposed the necessary final verification gate.
- Avoid stale Safari assets with versioned script references.
- Prevent ingredient delivery from skipping an outstanding dialogue choice.
- A recovery-only save key protects live data during testing; decide the production save-key strategy explicitly.
- Story completion must be confirmed before deducting items permanently; duplicate events must not pay twice.
- Keep new story content declarative and avoid story-specific changes in the host whenever possible.
- Do not infer universal portability from one successfully integrated game.
