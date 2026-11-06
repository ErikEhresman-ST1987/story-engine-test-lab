# Story Engine Test Lab

**For current cross-game story integration guidance, start with [Story Integration — START HERE](docs/integrations/START-HERE.md).** The original lab-readiness notes below describe an earlier testing stage and are retained as historical context.

Standalone verification of **Ink + inkjs** for offline-first browser games. Separate from Little Field Farm: no farm saves or game code are changed.

## Automated verification

Open **Actions → Verify Ink Runtime**. Every push triggers Node.js installation and `npm test`. The first four tests cover independent narratives, branching, serialized narrative state, shared facts, and duplicate effect IDs.

**Limits:** Duplicate-effect testing proves in-memory and restored-ID deduplication, **not atomic saving** of resources and story state. Story updates, gameplay-event gating, actual browser execution, and iPad offline behavior remain unverified. A green workflow does not mean production readiness.

## Local run

```sh
npm install
npm test
```

Story source is in `stories/`, runtime adapter in `src/`, and tests in `tests/`.

## Next

Inspect Actions results. Then test browser/offline operation, event gating, atomic persistence, and changed story compatibility before approving the runtime.
