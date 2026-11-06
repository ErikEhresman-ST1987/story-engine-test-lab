**Historical integration proof: superseded by the approved Juliette implementation and NPC unlock progression. Do not treat its sample-story status as current.**

# Little Field Farm — Story Engine integration (verified v1)

## Status and evidence
**Integration verified in Safari on iPad, November 5, 2026.** Player completed all three sample chapters, refreshing after each stage, and confirmed narrative and farm progress persisted. Observed: invitation/Ink dialogue, two wheat harvests advancing Chapter 1, a normal neighbor order advancing Chapter 2, explicit final action completing Chapter 3, and completed-state persistence. Farm coins and order activity remained functional. GitHub Actions story-integration build/tests passed following approved narrative integration and navigation changes.

This is **an integration proof**, not an approved Juliette story. The chapter dialogue is marked TEST-FIXTURE-ONLY. No full narrative has been approved through OmniQuest Game Story Foundry.

## Proven components and boundaries
- The reusable `SharedGameNarrative`, `NarrativeManager`, `MultiChapterRegistry`, `ChapterSession`, and `validate-manifest` modules were imported from `story-engine-test-lab/packages/story-engine/` into `scene-rebuild/story-engine/`. Treat the lab as the reference source and reconcile changes deliberately; the farm currently contains a copy, not a package dependency.
- `scene-rebuild/story-ink-entry.cjs` compiles three sample Ink chapters with `inkjs/full`, builds the chapter manifest, and constructs `SharedGameNarrative` using a farm-specific `createGame` host adapter. `npm run build:story` bundles it into `story-ink-bundle.js` for offline browser execution.
- `scene-rebuild/main.js` owns actual crop inventory, orders, coins, and farm save. It sends confirmed `harvest.wheat` and `order.delivered` events to the coordinator; the coordinator does **not** deduct items or issue a second order reward.
- The sample host records at most two wheat harvests for Chapter 1 and one delivered order for Chapter 2. Chapter 3 uses explicit `finish.story`. The coordinator gates events by invitation and chapter; completed chapters do not repeat.
- The farm save includes `storyEngine` snapshot. `validateSave` validates this snapshot by reconstructing the coordinator. A failed existing save blocks overwriting until recovery. The preview uses a distinct localStorage key, `little-field-farm-story-preview-v1`, from the live farm.
- `farm-story.js` and the standalone `createSession` in `story-ink-entry.cjs` remain only as earlier prototype/test compatibility code. They are **not** the active narrative coordinator.

## How to reuse in another game
1. Start with an approved game Goal Box/Project Foundation and a story blueprint approved through OmniQuest before replacing fixture text.
2. Reuse the tested Story Engine coordinator modules from the lab; compile validated Ink chapters into `compiledChapters` and declare the chapter IDs, entry/completion paths, events, and effects in the manifest.
3. Implement a game-owned `createGame` adapter with `snapshot`, `restore`, and `event(name,{storyId,chapterId})`. Only the game decides what constitutes a legitimate gameplay event, changes game inventory, or grants rewards.
4. Connect real gameplay actions to `coordinator.event(storyId,eventName)`. Save the coordinator snapshot alongside game state and restore both together; do not independently mutate narrative internals.
5. Bundle inkjs and the coordinator for offline browser use. Test invitation, choices, chapter transitions, duplicate events, save/reload at every stage, and completed-state persistence in the actual target browser.

## Scope and known limits
- Only one three-chapter **sample** story has been manually accepted in this farm. Multi-story coexistence and approved story content have not been player-tested here.
- Chapter 3's finish action is a UI-triggered event, not a real-world farm order; the displayed instruction was corrected after acceptance.
- The preview is isolated at `/little-field-farm/story-preview/`; the live farm remains at `/little-field-farm/scene-rebuild/`. The preview is for development and must not be treated as the released game.
- The farm's preview publishing workflow copies the integration branch's browser assets into `main/story-preview/`; it does not replace the live farm.
- Automated tests include the shared coordinator's three-chapter progression, save/restore, and duplicate-event handling. Manual testing established iPad Safari behavior; it does not establish all-device compatibility.

## Acceptance outcome
**Pass for the current integration seam.** Next work: approve real Juliette story blueprint and Ink content, then test that content separately before release. Do not expand the module contract or add speculative features merely because the first integration succeeded.

## Player acceptance and lessons learned — November 5, 2026
The player completed the **approved** three-chapter *The Dinner That Almost Wasn't* on iPad Safari, supplying ingredients and reaching the completion panel. The player reported refreshing after each step and that the story worked perfectly. Screenshots show the opening wheat delivery prompt, normal farm play, and the completed story. The player also confirmed the revised collapsible navigation menu works well.

**Friction resolved:** Nine permanently displayed navigation buttons occupied three rows below the farm and reduced the visible play area. A compact **Menu** control now reveals those features on demand, preserving gameplay space. The user confirmed the revised menu works.

**Future idea only:** A touch-sensitive area over the farmhouse could open Stories, possibly with an invitation indicator. This is not part of the accepted release scope and is not implemented.

**Reusable lesson:** Preserve game ownership of real inventory, deliveries, and rewards. Use narrative events and saved Ink state to coordinate story progress without duplicating gameplay mechanics. Reuse the existing farm interface before creating additional systems.

## Merge readiness checklist — November 5, 2026
- [x] Approved three-chapter Juliette story implemented in Ink
- [x] Two crop paths (squash and rainbow chard) covered by automated progression/persistence tests
- [x] Two final conversational choices implemented in Ink
- [x] Chapter completion and save/restore covered by automated tests
- [x] Player completed approved story in isolated Safari preview and confirmed refresh persistence
- [x] Player confirmed collapsible menu fixes screen-space issue
- [x] Preview remains isolated from production; production farm not yet merged
- [x] Production save namespace restored on integration branch to `little-field-farm-scene-rebuild-v3` for eventual merge; isolated preview on `main/story-preview/` retains `little-field-farm-story-preview-v2`
- [ ] Confirm latest post-release-key-change CI succeeds
- [ ] Final PR mergeability / conflicts check at merge time
- [ ] Explicit decision to merge PR #2 into main

**Release caution:** The preview was tested with a fresh isolated save. Existing live version-3 farm saves are expected to be accepted by the code's backward-compatible `storyEngine` default, but that migration has not been independently verified in Safari. Preserve a JSON backup of any valued live save before first launch after merge. No merge or production deployment is authorized by this checklist alone.
