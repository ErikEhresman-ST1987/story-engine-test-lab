# OmniQuest → Story Engine: Authoring Handoff v0.1

**Phase:** Production workflow development. **Status:** Draft implementation contract; not yet proven with an approved complete story.

## Preserve the two responsibilities

**OmniQuest Game Story Foundry v0.2** develops one narrative assignment at a time. Its governing rule is *earn the right to draft by first demonstrating understanding*. The human approves a Story Blueprint before narrative drafting. The Foundry produces **narrative material**, not code, gameplay triggers, reward tables, or technical specifications. Never insert implementation instructions into its prompt or silently change approved story outcomes.

**Game development** receives the human-approved blueprint, final narrative draft, relevant continuity, and any location/participation boundaries. Development creates the technical implementation package, checks game compatibility, and presents any narrative changes for human approval before altering the story.

## Repeatable workflow

1. **Prepare narrative context** using the existing *OmniQuest Game Story Context Handoff v0.1* packet. Keep ESTABLISHED / HUMAN-DIRECTED / PROPOSED / OPEN / EXCLUDED distinctions. Do not include developer mechanics in that packet.
2. **Create and approve** the Story Blueprint and narrative draft in a dedicated Foundry conversation. Preserve explicit approval status and the exact final text.
3. **Open a development handoff** containing the approved blueprint, approved story text, source revision, chapter boundaries, and relevant continuity. Missing approval or story text is a **stop**, not permission to invent.
4. **Mark participation boundaries** in development: player action required, dialogue before action, dialogue after verified action, locations and NPC ownership. These are implementation annotations only; do not rewrite narrative.
5. **Create an implementation manifest** (see below) and compile each Ink source with a pinned inkjs compiler. Use stable IDs and chapter checkpoints; declare allowed gameplay event names and effects.
6. **Validate** manifest structure, compilation, choice paths, chapter start/completion, and gameplay-event contracts with automated tests. Confirm the story cannot grant resources by itself.
7. **Human review:** Compare rendered dialogue and consequential choices against the approved narrative. Flag discrepancies; obtain approval for changes to meaning or canon.
8. **Game adapter integration:** Connect named events to host-owned resource checks and idempotent effects; save story state with host state. Preserve old saves and test restore/replay.
9. **Deploy and play:** Test offline Safari, chapter transitions, alternate choices, refresh, repeated events, and any supported migration. Keep a rollback point.

## Minimal implementation manifest contract (proposed)

A JSON file per story, paired with one or more Ink source files. Example fields:

```json
{
  "schema": 1,
  "storyId": "juliette-community-dinner",
  "contentVersion": "1.0.0",
  "sourceApproval": "approved-draft-reference",
  "chapters": [
    {"id": "chapter-1", "inkFile": "chapter-1.ink", "entry": "start", "completion": "chapter_1_complete"}
  ],
  "requiresFacts": [],
  "events": ["farm.harvest", "farm.deliver"],
  "effects": ["juliette:dinner:delivery"]
}
```

This is a **schema example, not an approved Juliette story implementation**. The event names and effects above are illustrative and must be reconciled against actual game adapters before use. No narrative text is being invented or approved here.

## Validation acceptance

- Reject missing approval reference, duplicate story/chapter IDs, empty chapters, invalid event/effect declarations, unsupported manifest schema, and missing chapter checkpoints.
- Compile Ink successfully and exercise every intended branch; verify player-dependent outcomes do not advance before host confirmation.
- Verify chapter-specific state, reload, no duplicate effects, and safe refusal of unsupported content migrations.
- A second story should follow the same procedure without changing the pipeline or core engine.

## First real production story

Juliette Childers' proposed three-chapter community dinner is the first end-to-end candidate. **Do not claim an approved final draft exists unless the approved blueprint and text are supplied or retrieved and verified.** Before conversion, locate the exact approved narrative material and record its source revision.

## Known limitations

The reusable Story Registry and coordinator have passed automated regression checks, but they are not yet integrated into a single host-transaction boundary. This workflow has not yet been validated against a complete approved OmniQuest narrative. Do not install into Little Field Farm until both gates pass.
