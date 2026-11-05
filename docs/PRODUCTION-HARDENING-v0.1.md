# Production hardening checkpoint v0.1

The isolated lab now has two additional boundaries.

## Gameplay authorization
`packages/story-engine/authorized-game.cjs` accepts a trusted game and event policies. Policies receive `{storyId,chapterId}` and the current game snapshot. Denied requests do not call the game's event handler. `SharedGameNarrative` now supplies story and chapter context to game events. The game must still own resource consumption and durable idempotency receipts. The sample receipt test proves one authorized delivery cannot be repeated for the same story/chapter; it does not prove transaction atomicity.

## Content versions
`packages/story-engine/migrate-narrative-save.cjs` supports explicit candidate transformation with source-version checks and a caller-supplied validator. Unknown versions are rejected. No automatic Ink state migration is provided. A real migration must translate Ink state or restart at an approved checkpoint and validate the resulting entire narrative against the target compiled content. The helper does not independently prove that compatibility.

## Verification and remaining gates
`tests/production-hardening.test.cjs` exercises denied events, duplicate delivery prevention, unknown versions, and non-mutating candidate migration. Before production: implement real game-specific authorization rules; transactional save/reward semantics; real content-version migration fixtures; rollback and external backup; integration in an isolated Farm branch; and Safari acceptance of those integrations. Do not touch production storage.
