# Game Narrative Profile — OmniQuest handoff v0.1

**Purpose:** Give OmniQuest Game Story Foundry game-specific *creative constraints before blueprint drafting*, without modifying the Foundry or asking it to design game mechanics.

**Status:** Proposed reusable handoff template. Not yet tested with an approved complete story. Fill in and approve the profile for each narrative assignment. Do not treat examples as approved canon.

## 1. Assignment and story boundaries

- Game / project:
- Story assignment / working title:
- Relevant characters, places, continuity: refer to the separate OmniQuest Game Story Context Handoff (preserve ESTABLISHED / HUMAN-DIRECTED / PROPOSED / OPEN / EXCLUDED labels).
- Narrative purpose and desired emotional tone:
- Material to exclude or leave unresolved:

## 2. Narrative delivery profile (agree before blueprint)

- Intended story scale: brief encounter / short multi-encounter story / major arc / other:
- Episode or chapter count (target/range):
- Total **player-visible narrative words** (target/range):
- Words per chapter (target/range):
- Words per encounter (target/range):
- Approximate encounters per chapter:
- Natural stopping points and expected return-to-gameplay breaks:
- Player agency: what kinds of meaningful decisions belong in this story? (Creative intent only; do not specify engine variables or code.)
- Desired ending / local resolution and continuity carried forward:

**Counting rule:** Player-visible words include narration, NPC dialogue and player-choice text. Exclude technical annotations, headings, blueprint notes and optional unused alternatives when estimating the typical playthrough. Because choices branch, report both estimated typical-playthrough length and full authored text length where practical.

**Pacing rule:** The profile guides the blueprint and draft from the outset; do not draft a novella and silently compress it afterward. When a length or pacing constraint threatens narrative coherence, surface the tradeoff for human approval.

## 3. Optional example — Little Field Farm (NOT APPROVED STORY)

- Story scale: short, relaxed community story
- Chapters: 3
- Total typical-playthrough narrative: 1,200–2,400 words
- Typical encounter: 50–300 words; chapter target: 400–800 words
- Structure: multiple encounters with natural pauses for normal farming
- Player decisions: meaningful, low-pressure; no punitive countdowns
- Ending: satisfying chapter-level outcomes and a completed arc

These are initial design targets, **not mandatory defaults for other games**. The user may approve shorter or longer profiles.

## 4. Creative Foundry handoff instruction

> Use this Game Narrative Profile together with the separate story context packet when preparing the Story Blueprint. Show how the proposed chapter/episode structure, approximate length, encounters, and natural pauses fit the profile. Do not begin drafting until the human approves the blueprint. Preserve narrative quality and flag any profile conflicts for discussion rather than silently changing the constraints. Produce clearly labeled chapters/episodes and identifiable encounter boundaries in the approved draft. Do not write Ink, code, gameplay triggers, reward tables, or technical manifests.

## 5. Development-side receipt and acceptance

After the approved draft returns to development, record:
- Profile revision and human approval; approved blueprint and final draft source references
- Chapter and encounter map: exact start/end text anchors, order, choices, natural pause locations
- Typical-playthrough and full authored word counts, with any approved exceptions
- Participation boundary proposals: before player action / after confirmed action (implementation annotations, not rewritten prose)
- Any ambiguous split, missing dialogue, excessive encounter length, or mismatch requiring human review

**Stop conditions:** Missing approved story text; unclear chapter/encounter boundaries that would change meaning; length or pacing outside approved profile without approval; gameplay-dependent outcome with no verified host action. Do not ask the user to manually split long prose; prepare a proposed segmentation map and escalate only genuine ambiguities.

**Ownership:** OmniQuest owns creative story structure and prose; development owns segmentation into runtime checkpoints, Ink conversion, gameplay contracts, validation, and integration. A profile is not an instruction to alter the Foundry itself.
