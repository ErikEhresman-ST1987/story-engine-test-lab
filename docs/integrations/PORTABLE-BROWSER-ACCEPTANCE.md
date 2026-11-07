# Independent browser acceptance — portable engine

**Test target:** `portable.html` in the Story Engine Test Lab build. This is an independent host of the canonical `packages/story-engine/` modules, not a copy of Little Field Farm.

## Automated gate

The existing `.github/workflows/verify.yml` runs `npm test` and `npm run build` for pull requests. The build now includes `portable.html` and `portable.js`; the service worker pre-caches both. Verify the latest PR commit has a successful check before merging. A successful build alone does not prove real-device behavior.

## Manual iPad Safari gate

1. Publish the feature branch to an isolated test URL or run the built `site/` on a local HTTPS test server; **do not switch production Pages without approval**.
2. Open `portable.html`. Confirm the sample dialogue and two choices render.
3. Tap Deliver before harvesting. It must deny the objective and preserve state.
4. Harvest two carrots and deliver once. Resources must decrease by two and chapter one must complete.
5. Tap Deliver again. No second deduction or second completion.
6. Advance to chapter two. Reload Safari; chapter, resources, and progress must persist.
7. Close and reopen Safari. Verify the same state.
8. With the page cached, enable airplane mode and reload. Confirm page, Ink engine, and saved progress still work.
9. Reset this test. Confirm it does not clear other Story Lab saves or Little Field Farm data.
10. Test corrupted storage in a development browser; the test must recover into a new isolated session with a visible warning.

## Evidence to record

Record device/browser, commit SHA, URL, and pass/fail for each step. Do not mark **browser accepted** until performed. No claim of crash-proof disk writes or automatic save migrations is made.

## Scope limitations

The sample game verifies two-carrot authorization and duplicate prevention; it is not a full farm adapter, production inventory ledger, backup/import UI, or release installer. The host is intentionally tiny so the portability test can expose engine coupling.
