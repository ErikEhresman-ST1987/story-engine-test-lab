# Verified host integration — Little Field Farm (2026-11-05)

The reusable `SharedGameNarrative` coordinator was integrated into `ErikEhresman-ST1987/little-field-farm` on branch `story-engine-integration`, with a separate Safari preview at `/little-field-farm/story-preview/`.

**Player acceptance:** Three sample Ink chapters completed on iPad Safari. The player refreshed after each stage and confirmed farm and narrative persistence. Two wheat harvest events advanced Chapter 1, a real neighbor-order delivery advanced Chapter 2, and an explicit finish action completed Chapter 3. Completed status remained after refresh. Automated farm integration tests passed.

**Reusable pattern:** The host game owns crops, inventory, coins, order delivery, and save policy. A host adapter exposes `snapshot()`, `restore(save)`, and `event(name,{storyId,chapterId})`. Real gameplay sends declared events to `SharedGameNarrative.event(storyId,name)`; narrative progress and Ink state are saved together with game state. The coordinator must not independently award or consume farm inventory.

**Boundary:** This proves the integration seam for one sample story, not the creative quality of approved narrative content or multi-story behavior in the farm. The farm currently vendors copies of the lab's coordinator modules. The sample Juliette dialogue is test-only, not an approved story.

Implementation and limitations: `little-field-farm/docs/STORY-INTEGRATION-PROTOTYPE.md` on the integration branch.
