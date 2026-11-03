# Story Engine Test Lab — Development Journey and Lessons v0.1

**Checkpoint:** After Increment 4, before Increment 5 (November 2, 2026)  
**Status:** Working proof of concept, **not** production-ready reusable module  
**Repository:** https://github.com/ErikEhresman-ST1987/story-engine-test-lab  
**Live lab:** https://erikehresman-st1987.github.io/story-engine-test-lab/

## Why we started

Little Field Farm needs optional, character-driven stories with choices and persistent consequences. The same narrative capability should eventually support Stranded Colony, Haven's Reach, and future games. Building a separate engine for each game would repeat work and invite drift.

We explicitly compared existing narrative runtimes and selected **Ink + inkjs for verification**, rather than immediately writing a custom JavaScript narrative engine. A server was considered, but the user chose **offline-first**. GitHub Pages is static hosting; it can deliver an offline-capable browser app without operating a backend.

**Design boundary:** Ink owns authored dialogue and branching. Each game owns its inventory, economy, and gameplay. A reusable adapter passes deliberate events and outcomes between them.

## Why a separate repository mattered

The initial local test harness could not execute because the package registry was unreachable from the assistant's execution environment. Rather than require the user to run npm on a Windows laptop, we created a dedicated GitHub repository with **GitHub Actions** to install dependencies, execute automated tests, build a browser bundle, and deploy through GitHub Pages.

This isolated the experiment from Little Field Farm's working code and existing saves. It also created a durable place to improve and verify the eventual shared engine.

## Chronological record: problem → response → evidence

### Increment 1 — Establish the actual Ink runtime

- **Problem:** The initial test harness was prepared but not executed. A first GitHub Actions run failed because the pinned inkjs package did not expose the compiler at the import path used by the tests.
- **Change:** Updated inkjs dependency to a release exposing the required compiler export; retained the separate Node.js test suite.
- **Evidence:** GitHub Actions turned green. Tests exercised independent story instances, player choices, Ink state serialization/restoration, shared facts, and deduplication of effect identifiers.
- **Limit:** Deduplicating an effect ID in memory is not the same as guaranteeing that gameplay resources and story receipts are saved atomically.

### Increment 2 — Browser and offline delivery

- **Problem:** Node tests alone did not establish whether the runtime would work in Safari on an iPad or without connectivity.
- **Change:** Bundled the runtime and sample Ink content into a small browser demonstration; added a service worker and local persistence.
- **Deployment friction:** GitHub Pages was initially disabled, producing a 404. Later, branch-based Pages publishing showed the repository README instead of the browser application. We switched Pages Source to **GitHub Actions**.
- **Evidence:** The user played both sample stories on an iPad, observed saved story memory, and explicitly reported successful operation in airplane mode.
- **Lesson:** Static hosting plus cached local assets is sufficient for this authored-story proof. Deployment configuration is part of verification, not an afterthought.

### Increment 3 — Separate gameplay bridge

- **Problem:** We needed to verify that a story objective could coexist with ordinary gameplay without being completed accidentally.
- **Change:** Built an independent gameplay simulation with invitation acceptance, two carrots, one wheat, a deliberate delivery action, a persistent story fact, and a unique delivery receipt.
- **Evidence:** The user demonstrated that harvesting alone did not complete delivery, that delivery before acceptance was refused, and that accepted delivery consumed the correct ingredients and produced exactly one receipt. The user confirmed completion survived reloading Safari.
- **Lesson:** Routine transactions and story objectives must be distinct events. Resource deductions, completion facts, and receipts should be committed in one validated save record.
- **Limit:** This was still a separate adapter simulation, not connected to Ink's actual story flow.

### Increment 4 — Connected Ink → gameplay → Ink

- **Problem:** The Ink invitation and gameplay simulation had separate acceptance controls. A working reusable engine must pass a narrative choice to gameplay and return the gameplay outcome to Ink.
- **Change:** Added a connected proof: choosing to help Juliette activates ingredient collection; explicit delivery consumes resources and directs Ink to its completion passage. Integrated Ink state, inventory, progress, and delivery receipt are stored in one record.
- **Evidence:** The user completed the cycle on iPad and supplied screenshots showing Juliette's closing dialogue, zero remaining ingredients, one delivery receipt, and the completed story fact. After refreshing Safari, the user supplied another screenshot showing the completed state, zero inventory, and one receipt still present. The latest GitHub workflow was green.
- **Lesson:** The narrative engine does not need to own game resources. A narrow host adapter can coordinate story choices, gameplay actions, and story advancement.
- **Known cosmetic gap:** On reload, the closing dialogue is replaced with a generic “Dinner delivery complete” message. Progress is preserved; last-visible-text restoration is not.
- **Limit:** This proves one short integrated cycle, not full multi-chapter production storytelling or robust upgrade/migration behavior.

## Deployment lessons worth keeping

1. **Don't infer runtime failure from deployment failure.** Node tests, bundle construction, Pages configuration, and live-site behavior are separate checks.
2. **Use GitHub Actions as the Pages source** when the site is generated by a build step. Branch publishing can expose the wrong content.
3. **Avoid rerunning failed deployment jobs when artifacts collide.** Retrying a run led to duplicate `github-pages` artifacts. A fresh workflow run resolved that particular issue.
4. **Serialize overlapping workflow deployments.** A concurrency group was added after overlapping Pages deployments blocked each other.
5. **Require a real-device check.** Green automation did not substitute for the user's iPad Safari and airplane-mode tests.

## Architecture and reliability lessons

- **One narrative runtime, game-specific adapters.** Reuse story flow and persistence contracts, not game inventories or UI assumptions.
- **Offline first remains viable.** GitHub Pages serves the files; Ink and gameplay logic run on the device. No runtime AI, backend, or subscription is required.
- **Separate authoring from runtime.** The Ink text is authored content; inkjs interprets compiled stories; the host game supplies events and renders dialogue.
- **The game is authoritative for resources.** Story facts and receipts record consequences; they should not replace inventory ownership.
- **Treat save safety as a design contract.** Related effects must be persisted together; invalid or incompatible saves should fail safely, without overwriting recoverable data.
- **Use deliberate story triggers.** Routine harvests, orders, and background activity must not silently finish a narrative objective.
- **Preserve independent play.** Stories should be optional invitations; normal gameplay must remain enjoyable without them.
- **Small proofs can support a larger goal.** Each increment resolved one architectural uncertainty without modifying a working game.

## What has actually been verified

| Capability | Evidence | Assessment |
| --- | --- | --- |
| Ink/inkjs execution in automated tests | Green GitHub Actions | Verified for tested cases |
| Independent sample stories and choices | Automated tests and iPad interaction | Verified for tested cases |
| Story facts and local save | Browser demonstration | Verified for tested cases |
| iPad Safari operation | User screenshots | Verified |
| Offline operation | User's airplane-mode test | Verified for that session |
| Separate gameplay objective and delivery | Increment 3 tests and user screenshots | Verified |
| Integrated Ink → gameplay → Ink | Increment 4 tests and user screenshots | Verified |
| Integrated state after Safari refresh | User screenshot after refresh | Verified |
| Single receipt and blocked repeat delivery | Tests and UI state | Verified for tested cases |
| Crash/power-loss atomicity | No crash-injection test | **Not verified** |
| Save compatibility after changing Ink content | Not tested | **Not verified** |
| Multiple active multi-chapter arcs | Not tested in integrated browser app | **Not verified** |
| General reusable adapter across two different games | Not tested | **Not verified** |
| Recovery from corrupt production saves | Limited rejection tests only | **Not verified for production** |
| Restoration of last displayed dialogue | Generic completion message after reload | **Known gap** |

## Next planned increment — Story updates and save compatibility

Test a story revision against saved progress from an older content version. Cover unchanged stories, safe content changes, incompatible structure, explicit version checks, recovery behavior, and protection against repeating rewards. Do **not** silently discard old progress or claim universal compatibility.

After that, decide whether the proof is sufficiently reliable to formalize a reusable Story Engine Foundation Plan. A module should be adopted because it has been demonstrated in real use, not because its documentation sounds complete.

## Guardrails

- Keep all experimentation in `story-engine-test-lab` until the user approves integration.
- Do not change Little Field Farm's code, localStorage key, or save format as part of the lab.
- Preserve working story lab saves; new tests should use separate keys or explicit migrations.
- Do not claim full crash-safe persistence or universal Ink save compatibility without direct tests.
- Revisit the Goal Box and Foundation Plan when evidence justifies a change; they guide decisions rather than prohibit learning.

## Current decision

**Continue with Ink + inkjs as the leading candidate.** The runtime has earned further testing. The reusable engine is **not yet declared production-ready**.


## Increment 5 — Story-content update compatibility (in progress)

- **Problem:** Serialized Ink instruction pointers may no longer correspond to revised compiled story content. Silently loading old state into changed content risks broken progress and repeated gameplay consequences.
- **Change:** Added a separate compatibility-policy proof with explicit content versions, schema validation, a known v1→v2 checkpoint mapping, preservation of gameplay state, and fail-closed handling for unknown versions. The existing connected iPad demo and its storage key are unchanged.
- **Automated coverage added:** unchanged-version Ink restoration; migration from invitation, collecting, declined, and completed phases; receipt preservation; repeat-delivery prevention; invalid versions and inconsistent receipts.
- **Deployment playbook:** [Increment 5 deployment and verification](INCREMENT-5-DEPLOYMENT.md).
- **Status:** Code and tests committed; workflow and user-device acceptance are still required. Do not mark this increment verified merely because the code was committed.
- **Important limit:** This is an explicit migration for one small story, not a generic guarantee that arbitrary Ink revisions preserve saves.

### Increment 5 browser acceptance gate (November 2, 2026)

- Automated compatibility tests and Pages deployment passed in GitHub Actions run #34 (commit `d38d331`).
- Added a dedicated **v0.5 browser compatibility panel** with its own storage key, `story-lab-update-test-v1`. It creates v1 checkpoints, performs approved v1→v2 migration, checks gameplay state is unchanged, rejects unknown versions, and restores the panel's record after reload.
- Increment 4's `story-lab-integrated-v1` storage key is not touched.
- **Pending:** new v0.5 workflow success and user verification in iPad Safari, including reload and offline behavior. This panel is a focused migration demonstration, not a general content-editing interface.
