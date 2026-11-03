# Reusable Story Engine — Project Foundation Plan v0.1
**Prepared November 2, 2026 · Foundation draft for review, not implementation authorization**

This follows the approved Reusable Story Engine Goal Box and Project Foundation Base v3.0. Evidence: [Development Journey](DEVELOPMENT-JOURNEY-v0.1.md).

## 1. Grounded starting point

**Repository:** `ErikEhresman-ST1987/story-engine-test-lab`, branch `main`. **Delivery:** GitHub Actions → GitHub Pages. **Devices:** iPad/iPhone Safari and desktop browser; offline-first.

**Verified:** Ink/inkjs authored choices, independent sample stories, shared facts, local saves, iPad airplane-mode operation, a separate gameplay bridge, a connected Ink→gameplay→Ink delivery cycle, and an explicitly scoped v1→v2 migration preserving completion and receipt after refresh. All verified in a standalone lab, **not** inside Little Field Farm.

**Protected:** Existing lab storage keys (`story-lab-integrated-v1`, `story-lab-update-test-v1`), Little Field Farm source and its `little-field-farm-scene-rebuild-v3` save key, and all other working games. No farm modifications without separate approval.

**Unverified:** Portability to a genuinely different host game; concurrent multi-chapter arcs in a host; power-loss crash atomicity; general content migration; production backup/restore and corrupt-save recovery; preserving last displayed dialogue.

**Next experiential weakness:** The working cycle is still Juliette-specific. We must show that a different game can use the same narrative core without modifying it.

## 2. Suitable technical foundation

- **Narrative runtime:** Ink compiled stories + inkjs in the browser. Owns text, choices, branching, and serialized narrative state.
- **Reusable story coordinator (to extract):** Independent story instances, story IDs, narrative state, eligibility, shared facts, checkpoints, content version, and deliberate event/result routing. Must not import farm-specific inventory or UI.
- **Host adapter:** Small game-specific translation layer. Converts host events into named story events and applies authorized outcomes using host-owned state and transaction/receipt rules.
- **Host game:** Authoritative owner of inventory, economy, world simulation, UI/rendering, and durable game save. No hidden narrative-side deductions.
- **Story content:** Authored and approved separately, compiled into deployable local assets; no runtime AI/server required.
- **Presentation:** Host renders story invitations, choices, and responses. The lab may keep a minimal generic presentation for verification.
- **Build/deployment:** Node-based tests and browser bundling in GitHub Actions; GitHub Pages static distribution with versioned offline cache.

**Boundary contract:** Story requests an outcome; host validates/applies it and returns a success/failure event; the story advances only after successful host commitment. Stable story IDs, event names, effect/receipt IDs, and content versions are required. Avoid speculative plugin frameworks or generalized scripting APIs.

**Module Library check before extraction:** Review proven local JSON state, JSON backup/restore, offline app shell, versioned offline build, and storage-key-versus-release-version lessons. Reuse only what directly solves a demonstrated problem.

## 3. Data, safety, and recovery

- Each host game owns its canonical save. For the lab, use a separate isolated key for the second-adapter proof.
- Record schema version separately from story content version. Validate on load and reject unknown versions without overwriting original bytes.
- Keep story checkpoint, host resources, completed effect IDs, and receipts in a coherent saved transaction. Do not claim power-loss atomicity without interruption testing.
- Story migration must be explicit per content revision/checkpoint. Do not replay gameplay effects during migration.
- Preserve JSON export/import expectations for eventual host integration; do not silently change the farm's existing save structure.
- Protect recovery by leaving existing tests, keys, and last verified GitHub commit available. A failing new experiment must not block returning to the last known working lab.

## 4. Conditional contracts

- **Offline/PWA:** No server or runtime network dependency. Package story files, runtime, and required assets into the offline build; verify airplane mode on Safari.
- **Story invitations:** Optional, nonpunitive, and never completed by routine NPC orders or background activity.
- **Content scale:** One-chapter stories and 3/5/7-chapter arcs are intended; multiple concurrent opportunities and cross-story facts remain acceptance goals, not verified implementations.
- **Story authoring:** Use the OmniQuest Game Story Foundry process for narrative approval before integrating real content.
- **Visual/audio:** Host games retain their own graphics and sound systems; no graphics/audio requirements for the narrative core.

## 5. Next meaningful result — Increment 6: second host adapter

**Outcome:** Demonstrate the same extracted narrative coordinator with **two meaningfully different host adapters**, without changing the coordinator between them.

**Candidate second host:** A minimal Stranded Colony-style turn-based simulation, not Stranded Colony production code. Its story offers a choice about helping a stranded survey team; the host must gather a resource or complete a turn-based task and explicitly report success. Exact fiction and resources are test fixtures, not canon.

**Scope:** Extract only the proven generic narrative/event boundary; preserve Juliette's existing cycle; add the second host simulation and tests. No actual farm or colony integration, full quest UI, multiple chapters, AI content, cloud sync, or new asset pipeline.

**Material uncertainty:** Does the coordinator truly avoid farm-specific assumptions about inventory, time, action completion, and saved progress?

**Recovery point:** Existing verified Increment 5 lab on `main`; use isolated fixtures and save keys. Prefer a feature branch for refactoring if practical.

## 6. Acceptance and real-use question

1. Both hosts use the **same** narrative coordinator code; no host-specific conditionals inside the core.
2. Each host independently completes a choice→gameplay event→story response cycle; normal gameplay events do not accidentally finish objectives.
3. Saved story and host state survive reload; completed effects cannot be applied twice.
4. Invalid events, insufficient resources, incompatible saves, and refused updates fail without corrupting saved progress.
5. Existing Increment 1–5 automated tests remain green; build and GitHub Pages deploy green.
6. User verifies the second host in iPad Safari and, where relevant, offline mode.
7. **Real-use question:** Can we change the host game and its mechanics without rewriting narrative engine logic?

## 7. Handoff and stop rule

**Current authorization:** Foundation planning approved; no production game integration approved. Present this draft for user review before implementing Increment 6.

**Stop planning** when the two-host proof's ownership, safety, observable outcome, checks, and recovery are clear. Revisit only if the test uncovers a concrete architectural problem. After real-use verification, decide whether to package the coordinator as a reusable Module Library entry, with its problem, solution, verification, and known limits.

**Status:** Foundation Plan v0.1 drafted. Increment 6 not started.
