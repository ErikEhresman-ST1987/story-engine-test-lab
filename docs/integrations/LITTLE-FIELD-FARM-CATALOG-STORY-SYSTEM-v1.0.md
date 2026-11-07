# Little Field Farm — Reusable Story Catalog Integration v1.0

**Status:** Merged and player-tested in Little Field Farm on 2026-11-06. This document describes the **current farm implementation**, not the earlier Ink/inkjs prototype.

## Why the implementation changed

The previous farm implementation embedded a Juliette-specific narrative in an Ink-generated JavaScript bundle and included story-specific controls in `main.js`. That worked for the prototype, but each new story risked requiring engine and UI edits. The operator approved replacing this approach with a single reusable, easy-to-edit catalog system.

The farm's current narrative runtime is **not Ink**. The laboratory's Ink engine remains available as an alternative for games requiring richer branching or narrative features. Do not direct ordinary farm story additions through the old Ink compilation workflow.

## Current source of truth

Repository: [Little Field Farm](https://github.com/ErikEhresman-ST1987/little-field-farm).

- `scene-rebuild/story-catalog.js`: `window.FarmStoryCatalog`, an array of story definitions.
- `scene-rebuild/story-runner.js`: `window.FarmStories`, reusable UI, choice, objective and chapter progression.
- `scene-rebuild/story-unlocks.js`: separate NPC customer-order gate, now deriving registered story IDs and customer indices from the catalog.
- `scene-rebuild/main.js`: farm host, inventory, saving, story panel and NPC portrait rendering.
- `scene-rebuild/index.html`: loads catalog, runner, unlock gate and main game in that order.
- `story-preview/`: independent GitHub Pages preview path used for initial player acceptance. This is a copied preview, **not** an automatic branch deployment.
- [PR #9](https://github.com/ErikEhresman-ST1987/little-field-farm/pull/9): reusable catalog/runner merged into `main`.

**Important:** The farm repository still contains older Ink source, bundled runtime, build configuration and tests. These are legacy artifacts and are not loaded by the current `scene-rebuild/index.html`. Their presence does not mean the live farm uses Ink.

## Story catalog contract (implemented)

Each story currently has:
- `id`: stable identifier, e.g. `juliette`. Do not rename once saves depend on it.
- `title`, `lead`: display text.
- `unlockCustomer`: zero-based index in the farm's current customer list.
- `chapters`: ordered array of chapters, each with `title` and `lines`.
- Optional chapter `choices`: array of `{text, reply: [lines]}`. Current runner permits **one selected choice per chapter**.
- Optional chapter `objective`: `{type:'deliver',item,quantity,label}`. Only the `deliver` type is implemented. A successful delivery deducts inventory and saves progress.

Dialogue is plain strings; lines prefixed `Juliette:`, `Andy:`, `Keiko:` or `Felix:` receive their existing NPC portraits via the host. Other lines render as narration. Adding a new speaker portrait is **not** yet purely catalog-driven.

Progress is held in `state.storyEngine.stories[id]` with `chapter`, `choice`, `delivered`, and `completed`. The host validates and saves it with the farm state. The initial preview used a separate localStorage key; the merged scene-rebuild uses its own new save namespace. The user explicitly approved not preserving prototype saves.

The NPC unlock gate remains separate from chapter objectives. It uses completed customer orders and saved randomized thresholds of 2–4 for the current story. It currently assumes four positional customers and has a maximum of two simultaneously unlocked invitations. Do not claim these are universal rules for other games.

## First accepted story

**The Unexpected Dinner Guest** (Juliette, Keiko and Felix), three chapters:
1. An Old Friend Returns — one optional dialogue choice followed by delivery of two wheat.
2. A Recipe for Trouble — dialogue choice; no ingredient objective.
3. A Seat at the Table — reunion and completion.

Gramps is alive, retired and known affectionately by that name. The player is recognized as Gramps' grandchild. This is the approved story foundation; further narrative changes should follow story approval.

## Verified versus not yet verified

**Player reported successful in Safari on iPad:** farm loads, new Stories interface appears, full Juliette story completes, completed status displays, and completion persists after browser refresh. The player approved merging PR #9.

**Not yet established by that acceptance:** backup/export and restore, offline replay, second-story registration and progression, migration from old saves, resilience to later edits of completed stories, or automated regression of the new catalog runner. Earlier Ink engine tests do **not** substitute for tests of this different runner.

## Routine story addition workflow

1. Write and approve the story through OmniQuest, keeping character and continuity decisions with the narrative process.
2. Add one uniquely identified entry to `scene-rebuild/story-catalog.js`. Use only implemented chapter fields and objectives.
3. Select an existing `unlockCustomer` index; check the unlock gate's two-slot and threshold behavior.
4. Verify the story displays, choices progress, required delivery deducts exactly once, completion persists after refresh, and the other farm features still load.
5. Publish the ordinary content change to `main`. Use a branch and deeper regression checks when changing the runner, save schema, unlock mechanics or host integration.

**Current limitation:** New stories can be catalog-only when they use the existing four speakers, chapter format, choice format and `deliver` objective. New mechanics, speaker portraits, unlock patterns or complex branching may require engine work. Avoid promising zero testing.

## Architectural decision

Keep this simple catalog implementation as the **current Little Field Farm story system**. Keep the laboratory Ink/inkjs architecture as a separate, optional reference for future games. Do not silently reintroduce Ink or embed individual farm stories in `main.js`.
