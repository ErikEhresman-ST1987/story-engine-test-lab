# Story Engine Production System — Consolidation Inventory v0.1

**Status:** Production-phase first checkpoint, November 3, 2026. This is an extraction plan, not a declaration of production readiness.

## Verified building blocks

| Existing file | What it demonstrates | Production disposition |
| --- | --- | --- |
| `src/story-coordinator.cjs` | Ink state, choices, deliberate completion event, saved last dialogue, host adapter boundary | **Starting point for reusable core**, but currently assumes one invitation, one objective and a fixed `delivered` path |
| `src/farm-host.cjs` and `src/colony-host.cjs` | Same coordinator used by different host mechanics | **Keep as reference adapters**, not part of engine core |
| `src/multi-story-lab.cjs` | Concurrent Ink instances, shared facts and receipts | **Extract concepts**, remove fixed garden/dinner IDs and hard-coded prose |
| `src/invitation-lab.cjs` | Eligibility, available/deferred/declined/active/completed states | **Extract invitation policy**, remove fixed NPC IDs and conditions |
| `src/story-update-compat.cjs` | Explicit v1→v2 checkpoint migration and rejection of unknown versions | **Extract migration contract**, not Juliette-specific migration logic |
| `src/integrated-cycle.cjs` | Ink→gameplay→Ink completion and single saved record | **Reference only**; avoid a second competing coordinator |
| `web/*entry.cjs` | Browser demonstrations and persistence checks | **Keep in lab**, do not ship test UI as engine |
| `tests/*.test.cjs` | Regression evidence for eight increments | **Retain**, add package-level tests before any replacement |

## Non-negotiable module boundaries

1. **Content:** Approved story package with stable story ID, chapter IDs, content version, compiled Ink, narrative checkpoint IDs, eligibility rules, and declared gameplay events/effects.
2. **Core:** Runs Ink, maintains separate story states and shared narrative facts, returns choices/invitations, and proposes typed gameplay requests. Does not import farm or colony code.
3. **Adapter:** Game-specific mapping of named gameplay events and authorized effects; host owns inventory, time, progression, and idempotent receipts.
4. **Save owner:** Host game owns one coherent save operation. Unknown schema/content versions must not overwrite existing data.
5. **Presentation:** Host UI displays invitations, story lines and choices. The engine must not require the lab's DOM.
6. **Build:** Local compiled assets and inkjs, no backend or runtime AI. GitHub Pages/Actions remains the demonstrated distribution route.

## Gaps before reusable v1.0

- A generalized **story registry** (no hard-coded NPCs, story count or `delivered` path).
- A tested **OmniQuest → implementation package → Ink compilation** workflow, with an explicit review boundary between creative approval and technical conversion.
- A clear **multi-chapter checkpoint contract**; three-chapter Juliette content is not yet authored/approved.
- A validated **host transaction boundary** that prevents Ink advancement from being persisted separately from game effects.
- Backup/restore and recovery guidance for production saves.
- Versioned content migrations that reject unsupported revisions safely.
- A repeatable **game installation checklist** and verification in Little Field Farm, without changing its existing storage key.

## First production implementation slice

Create a new `packages/story-engine/` directory in the test-lab repository. It should contain **only the generic engine**, a minimal public API, and focused tests. Do not move or delete the existing `src/` proofs yet. A farm/colony fixture should import the new package rather than being copied into it.

**First acceptance gate:** Both existing host fixtures can use the extracted package, and all existing tests remain green. Only then proceed to generalized multi-story scheduling and authored chapter checkpoints.

## Evidence and limitations

Increment 1–8 results are recorded in [Development Journey](DEVELOPMENT-JOURNEY-v0.1.md). Browser tests demonstrate the scoped behavior, not full crash safety, arbitrary Ink migrations, or complete production integration. The current test lab's simple completion buttons are not a substitute for real game event integration.

## Deployment and recovery sequence

1. Commit the extraction as additive files; preserve the existing lab and save keys.
2. Run `npm test` and `npm run build` in GitHub Actions.
3. Confirm GitHub Pages deployment succeeds; open Safari and check prior demonstrations still work.
4. Test the extracted engine through farm and colony fixture tests before adding any new browser surface.
5. If regression occurs, revert the extraction commit; do not reset localStorage or rewrite Little Field Farm saves.

**Next step:** Implement the isolated package and its two-host regression tests. This inventory is the checkpoint against accidental scope expansion.
