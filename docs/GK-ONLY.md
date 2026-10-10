# GK Coach / GK Only — local implementation

Implemented in `Scouting-App-gk-only`, branch `feature/gk-only-assignment`, based on the clean `fbc26dc` goalkeeper-repair checkout. The primary `Scouting-App` checkout is older and has uncommitted PS-01 changes; it was left untouched. Local build identifier: 2026.10.10.1.

## Use

Choose **GK Coach / GK Only** when creating a session. Enter fixture details, then add one goalkeeper to the home or away slot, or add both. Name is required; shirt number is optional. Start the clock without importing team lineups or confirming outfield positions. Tap either keeper to use the existing specialist capture pages. Clock controls, timestamps, notes, assessments, closing reports, backups, resume and submission remain available.

For full team context, choose **Full Match**, load the teams, and choose **Goalkeeper Coaching — Specific** in Scouting assignment. Existing Full Match behaviour is retained.

Assignment changes preserve all players and evidence. Switching an existing session into GK Only is allowed only when it already contains one or two explicitly designated goalkeepers with unique home/away slots. Full squads are rejected, without removing players. Switching back uses existing Full Match lineup/placement checks.

## Code paths and schema

- `src/main.js`: session setup, goalkeeper entry, assignment assessment, live navigation, localStorage load/save, backups and submission handler.
- `src/assignment-mode.js`: GK-only identity, one/two-player and unique-slot checks, safe assignment changes, keeper creation and submission readiness.
- `src/model.js`: clock-start readiness, evidence packaging, schema-1.7 assignment export, assignment-specific quality notes and handoff context.
- `src/goalkeeper-workflow.js`: reused unchanged for capture, quick notes, save locations, shot origins and timestamps.
- `sw.js`: new local build cache and offline caching of assignment-mode module.

Uses the existing `players` array, home/away team sides, goalkeeper flags, pitch slots, timeline, storage key and schema-1.7 assignment field (`goalkeeper-only`). Unobserved sides retain null lineups. No dummy players, fabricated confirmed team sheets, database migration or parallel store.

The inspected `Scout-Workspace/lib/import-match.ts` accepts variable player counts, optional shirt numbers and null lineups, validates names/IDs/team sides and retains assignment type. This is source inspection, not staging acceptance. The mobile repository has an extraction API but no match-submissions endpoint implementation; the existing submission transport requires a configured reporting endpoint.

## Validation and status

- Clean starting baseline: 90 automated tests passed.
- Final automated suite: 98/98 passed, including home-only, away-only, two keepers, timestamps, ratings, backup/resume, assignment switching, invalid assignments and unchanged Full Match checks.
- Runtime tests execute the actual UI rendering and submission handler in a minimal DOM harness. One/two-GK commits use a mocked transport and preserve receipts across reload.
- Static production build and diff whitespace checks passed.
- Pre-deployment browser checks: GK Only end-to-end journey passed at 390×844; existing GK/Full Match suite passed 13/13 scenarios; saved-match Home launch/recovery passed 7/7 scenarios.
- `scripts/gk-only-acceptance.mjs` passed using an official Playwright Chromium installed in a temporary folder. It covers setup, away-only resume, two-keeper switching, capture, ratings, closing report and mocked submission/receipt reload. Set `PLAYWRIGHT_MODULE` to the installed Playwright module if necessary; `CHROME_EXECUTABLE` can select an existing browser.

Local implementation is ready for review. Local mobile browser acceptance passed. Physical iPhone/Safari acceptance, authenticated staging import/report/receipt acceptance and real submissions remain unverified. No staging/live deployment, provider call or real submission was performed. Deployment requires John's explicit approval.

## Changed files

`src/assignment-mode.js`, `src/main.js`, `src/model.js`, `sw.js`, `test/assignment-mode.test.js`, `test/gk-only-ui-runtime.test.js`, `test/ui.test.js`, `scripts/gk-only-acceptance.mjs`, `docs/GK-ONLY.md`.

## Approved deployment check — 10 October 2026

John approved production deployment after checks. Target: existing Mobile App at https://scouting-app-eta.vercel.app. FIP is unchanged. Current live build 2026.09.26.1 exactly matches remote main `e723c34efa990ccbe8edfa876a7e806a1d9c93dd` for main.js, model.js and sw.js. Candidate build: 2026.10.10.1. Expected change: GK Coach / GK Only in new-session setup. Rollback: redeploy the preserved remote-main commit through Vercel; retain localStorage, do not clear site data.

GitHub command-line publishing was unavailable. John subsequently signed in to the in-app GitHub browser; the release is published through an isolated branch and pull request. Compare uploaded source with this tested candidate before merge. Deployment verification must confirm the new build and source bytes at the production URL; physical-phone and real reporting receipts remain separate acceptance checks.
