# Little Field Farm Story Engine Integration Blueprint v0.1

Status: planning only. Reviewed current `ErikEhresman-ST1987/little-field-farm` scene-rebuild source on 2026-11-05. No Farm code or saves changed.

## Confirmed current architecture
- Entry: `scene-rebuild/index.html` loads `scene-rebuild/main.js` as a browser ES module; canvas farm with HTML panels and navigation.
- Existing farm state is `version:3`, stored under `little-field-farm-scene-rebuild-v3`. `validateSave` checks crop beds, inventory, queues, animals, unlocks, and pending orders. Invalid saves block subsequent writes pending backup restore.
- Inventory is `state.inventory`, with items including wheat, rainbow chard, pineapple, strawberry, squash, animal products and manufactured goods. **Do not use carrots** from the Story Lab fixture.
- `tapBed` handles harvest; `orders` handles rotating customer requests, resource deduction, coin rewards, and saving. Customers include Juliette Childers, Sheriff Andy Tiller, Miss Keiko O'Brien, Felix Underwood.
- `openPanel`, `entry`, and `button` provide a touch-friendly UI. Backup panel exports/imports farm JSON.

## Proposed boundaries
1. Introduce story integration only in a **separate experimental branch or isolated route**, with a separate save key. Do not alter production `scene-rebuild-v3` storage.
2. Provide a small farm adapter exposing read-only inventory snapshots, validated game-owned event handling, and unique idempotency receipts. Story code never mutates `state.inventory` or coins directly.
3. Add a separate Stories entry to the existing panel UI; do not replace or intercept the rotating Orders system. Invitations and chapter choices use the Story Engine manager.
4. Start with one test-only Juliette story requiring real current farm items (e.g. wheat) and host-confirmed delivery. Preserve actual approved narrative for a later content checkpoint.
5. Keep one authoritative combined save envelope in the isolated prototype, including farm state, narrative state, receipts and version metadata. Validate candidate restores before changing live state; add export and explicit rollback. Do not maintain independently authoritative farm and story storage keys.
6. Check the real farm save/restore, harvest, order delivery, inventory, UI, offline operation, and version upgrades with automated tests and manual Safari acceptance before any production merge.

## Critical risk to resolve before coding
The current farm writes its own `state` directly in `save()`, `tapBed()`, and `orders()`. Merely bolting on a second narrative save would allow partial game/story writes. The isolated integration must route relevant game and story transactions through a single validated save owner, with rollback behavior on write failure. No direct production edits are authorized by this blueprint.

## Acceptance and rollback
- Existing production save is never read, overwritten, migrated or deleted during prototype tests.
- A failed event does not deduct inventory, grant coins, or advance Ink.
- A repeated completion does not issue duplicate rewards.
- Reload restores farm and narrative consistently; malformed saves are preserved for recovery.
- Disabling the experiment restores the prior game behavior and does not affect production progress.
- Manual Safari test and explicit approval required before integration into the live farm.
