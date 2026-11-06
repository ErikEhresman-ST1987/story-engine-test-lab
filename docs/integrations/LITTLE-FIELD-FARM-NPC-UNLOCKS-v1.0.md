# NPC Story Unlock Progression — Reusable Implementation Note v1.0

**Source project:** Little Field Farm  
**Verified:** 2026-11-06, user playtested Juliette order unlocking and reported it working and more natural. Automated regression tests passed on the development branch.  
**Merged:** PR #3, commit `8e712d49aca54215b1898eb5ab080b96920bc769`.

## Problem and outcome
Originally Juliette's story invitation was available immediately, disconnected from farming. Completing ordinary customer orders now builds toward a story invitation. This makes stories feel earned without an artificial relationship meter.

## Implementation locations
- `scene-rebuild/story-unlocks.js`: small reusable progression gate, independent of Ink narrative text.
- `scene-rebuild/main.js`: records the customer index when an actual Order Board delivery succeeds, saves progression, and hides Juliette's invitation until unlocked.
- `scene-rebuild/index.html`: loads the progression helper before the main farm module.
- `tests/story-unlocks.test.cjs`: variable threshold, NPC specificity, persistence, completion, capacity and prerequisite checks.
- `scene-rebuild/story-ink-entry.cjs`: existing approved Ink story and coordinator, intentionally kept separate.

## Rules
1. Each story definition has `id`, `customer`, `minOrders`, `maxOrders`, and `requires` (array of prerequisite story IDs).
2. On initialization, draw and save one integer threshold in the inclusive range. Do not redraw on refresh.
3. Count **fulfilled** customer orders only. Do not count harvesting, story ingredient deliveries, or orders for other NPCs.
4. A story becomes eligible when its customer's count reaches the saved threshold and all prerequisite stories are completed.
5. `unlocked` holds up to **two** pending/active opportunities. Completing a story frees a slot, then eligible stories can unlock.
6. `completed` prevents reissuing the same invitation.
7. Persist `counts`, `thresholds`, `unlocked`, and `completed` with the farm save; validate incoming data.

## Current configuration
`STORIES=[{id:'juliette',customer:0,minOrders:2,maxOrders:4,requires:[]}]`.
Juliette is the only registered story today. The two-slot and prerequisite behavior are automated-test-covered, **not yet player-tested with multiple real stories**.

## Integration sequence for another game
- Define stable NPC IDs (prefer IDs rather than array positions for new projects).
- Register stories and their thresholds/prerequisites.
- Initialize saved unlock progress once.
- On successful customer-order completion, call `FarmStoryUnlocks.delivered(progress,customerIndex)`.
- Gate invitations on membership in `progress.unlocked`.
- When the narrative coordinator reports completion, call `FarmStoryUnlocks.complete(progress,storyId)` and save.
- Verify refresh/reload, unrelated NPC orders, exactly-once unlock, slot release, and prerequisite ordering.

## Important boundaries and improvements
- The current helper uses positional customer indices and four saved counts, matching Little Field Farm's four customers. **Do not copy that constraint unchanged** into a game with different NPCs; adapt to stable IDs and dynamic counts.
- The current engine has a single approved story; adding story definitions to the unlock registry does **not** create narrative content or register it in the Ink coordinator. Both registrations are needed.
- Thresholds currently represent total lifetime completed orders per NPC, not additional orders after each story. For multi-episode arcs, define explicit per-episode cumulative thresholds or a baseline/reset rule before implementation.
- The generic eligibility scan follows definition order; if many stories qualify while two slots are full, selection is not randomized. Randomness currently applies to the **threshold**, not the selection of stories.
- Do not expose locked stories as a quest checklist by default. The player should discover invitations through regular farm play.
- Keep story unlock progression separate from chapter objective tracking. Completing Juliette's story ingredient deliveries does not increment her ordinary order count.
- For future use, consider testing corrupted save structures and migration from earlier save versions before expanding the registry.

## Verification and reusable lesson
The reliable increment was: introduce one isolated progression helper; connect it at the existing successful order-delivery point; gate one real story; add tests; publish an isolated preview with a separate save; obtain a real player acceptance; merge only after approval.

**Lesson:** Make stories a consequence of existing meaningful gameplay, not an unrelated menu feature. Preserve simplicity: order counts + saved thresholds + story prerequisites + two slots are sufficient for the present design.
