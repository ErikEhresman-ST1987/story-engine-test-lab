# Story Integration — START HERE

**Integration index for offline-first game storytelling.** Updated 2026-11-06 after Little Field Farm merged its reusable catalog-based story system. The Ink/inkjs laboratory remains an optional, distinct implementation.

## Current Little Field Farm implementation (start here for farm stories)

**[Reusable Story Catalog Integration v1.0](LITTLE-FIELD-FARM-CATALOG-STORY-SYSTEM-v1.0.md)** is the authoritative description of the farm's current story runtime. The farm now uses editable `story-catalog.js`, generic `story-runner.js`, and catalog-driven `story-unlocks.js`, **not** the Ink runtime. Juliette's *The Unexpected Dinner Guest* was completed and persisted across Safari refresh in a player test; PR #9 merged into `main`. Backup/restore and second-story acceptance remain unverified. The earlier Ink Juliette contract and Ink integration examples below are historical references, not current farm authoring instructions.

## Optional Ink/inkjs path for other games
1. Decide whether the game needs dialogue, player choices, multi-chapter progression, or NPC invitations. Read [Adoption and Installation](../STORY-ENGINE-ADOPTION-AND-INSTALLATION-v0.1.md).
2. Approve narrative using [OmniQuest-to-Ink workflow](../OMNIQUEST-TO-INK-WORKFLOW-v0.1.md) and [Game Narrative Profile](../GAME-NARRATIVE-PROFILE-HANDOFF-v0.1.md). The engine does not author or change approved stories.
3. Reuse the reviewed engine code in [packages/story-engine](../../packages/story-engine/). It is CommonJS and must be bundled locally with inkjs for browser/offline use.
4. Implement a **host-owned adapter** for verified gameplay events, inventory, receipts and one coherent save. Use [Story Engine Foundation](../STORY-ENGINE-FOUNDATION-v0.1.md) and [Production Hardening](../PRODUCTION-HARDENING-v0.1.md).
5. For relationship-driven invitations, use [NPC Story Unlocks](LITTLE-FIELD-FARM-NPC-UNLOCKS-v1.0.md). Keep this gate separate from Ink chapter objectives.
6. Test in isolation, including refresh, save recovery, unrelated orders, chapter transitions and offline behavior. Use [Browser Acceptance](../BROWSER-ACCEPTANCE-v0.1.md), then a real player playtest before merging.

## Historical Ink farm example and reusable laboratory references
- [Earlier Juliette Ink story contract](LITTLE-FIELD-FARM-APPROVED-STORY.md) — historical prototype with wheat and vegetable deliveries; superseded in the farm by *The Unexpected Dinner Guest*.
- [NPC story progression implementation](LITTLE-FIELD-FARM-NPC-UNLOCKS-v1.0.md) — randomized saved order thresholds, two invitation slots, prerequisite story completion, test coverage, known limits.
- [Verified farm integration](../VERIFIED-FARM-INTEGRATION.md) — early Safari iPad sample-story integration proof.
- [Historical prototype notes](LITTLE-FIELD-FARM-HISTORICAL-PROTOTYPE.md) — **historical only**; sample content and 'not yet approved' statements are superseded.
- [Little Field Farm live implementation](https://github.com/ErikEhresman-ST1987/little-field-farm/tree/main/scene-rebuild); older [Ink tests](https://github.com/ErikEhresman-ST1987/little-field-farm/tree/main/tests) do not verify the new catalog runner.
- [Farm story merge PR #2](https://github.com/ErikEhresman-ST1987/little-field-farm/pull/2); [unlock merge PR #3](https://github.com/ErikEhresman-ST1987/little-field-farm/pull/3).

## Ownership boundaries
| Layer | Owns | Must not own |
| --- | --- | --- |
| OmniQuest | Approved narrative, character continuity and choices | Farm inventory changes |
| Ink story package | Dialogue, branching, chapters, declared events | Unverified resource awards |
| SharedGameNarrative | Narrative state, chapter checkpoint and story choices | Game-specific inventory or order fulfillment |
| NPC unlock gate | Per-NPC completed orders, saved thresholds, prerequisites, max two invitations | Ink prose or chapter objectives |
| Game host | Real gameplay, inventory, validated events, unified persistence, UI | Silent rewrites of approved narrative |

## Technical lessons and cautions
- **Current farm runtime is catalog-based, not Ink.** Older Ink modules remain in the farm repository as legacy artifacts; the farm does not automatically track this lab. Reconcile any future shared code deliberately.
- The NPC unlock helper lives in the farm at `scene-rebuild/story-unlocks.js`. It currently assumes four positional customer indices. For a new game, replace those with stable NPC IDs and adaptable counts.
- Thresholds count lifetime completed orders. For sequels, choose cumulative thresholds or per-episode baselines explicitly.
- Only Juliette is currently registered as a real farm story. Two-slot capacity and prerequisite logic passed earlier automated tests, but multi-story player acceptance of the new catalog runner is outstanding.
- Earlier lab documents describe their historical verification state. Do not interpret those old readiness warnings as the current status of the Juliette farm implementation, or interpret one successful farm integration as universal production readiness.
- Keep tests and experimental branches before changing a live game. Preserve the user's approved story text and avoid unrelated feature work.

## Reference library
[Production Consolidation](../PRODUCTION-CONSOLIDATION-v0.1.md) · [Production Hardening](../PRODUCTION-HARDENING-v0.1.md) · [Story Foundation](../STORY-ENGINE-FOUNDATION-v0.1.md) · [Step 1 Readiness Gate](../STEP-1-READINESS-GATE-v0.1.md) · [Little Field Farm Blueprint](../LITTLE-FIELD-FARM-INTEGRATION-BLUEPRINT-v0.1.md).

**Maintenance:** This index is the starting point for future games. Add new proven integration patterns here and link to focused notes. Keep historical evidence; avoid creating a second competing instruction system.
