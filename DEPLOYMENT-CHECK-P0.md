# DEPLOYMENT CHECK — P0 player action screens

Status: locally verified candidate; not deployed to staging or live.
Target proposed: LIVE https://scouting-app-eta.vercel.app
Version: App v1.8.2 · Build 2026.09.26.1. Export schema remains 1.7.
Branch: repair/player-icons-v1.8.2
Baseline/rollback source: 91a04de225eca7d80fad5bde79cfa6da2166bb9a (live v1.8.1).

## Cause and repair
Live main.js/model.js byte-matched the released v1.8.1 source on 26 September.
restoreGoalkeeperDesignations compared absent sourceId values: undefined === undefined. Any recorded GK could therefore designate unrelated players as GK on load, and those flags were persisted. The shared action views were not overwritten.

Require populated matching IDs or a unique same-team name-and-number match. Reconcile affected imported players against explicit boolean goalkeeper designations in the confirmed lineup, including previously corrupted flags. Leave ambiguous/unmatched records and manual GK designations unchanged. Do not infer positions from shirt numbers. A corrupted GK position on a confirmed imported outfielder returns to the original import default (blank, or SUB for initial substitutes).
Existing event evidence is unchanged; historical observations are not rewritten.

## Exact changed files
- src/model.js: identity recovery repair and version/build marker.
- sw.js: new release cache key.
- package.json: version 1.8.2.
- test/model.test.js: missing identifiers, persisted corruption, ambiguity, manual designation, idempotence and evidence preservation.
- test/ui.test.js: cache marker expectation.
- scripts/gk-workflow-acceptance.mjs: realistic imported/corrupted fixtures and dynamic GK/two-outfielder switching.
- scripts/launch-acceptance.mjs: footer expectation.
- DEPLOYMENT-CHECK-P0.md: this record.

src/main.js, src/goalkeeper-workflow.js and src/styles.css are unchanged from production. FIP and other worktrees are untouched by the repair.

## Validation
- Reproduced old code promoting both keeper and outfielder; repaired code restores the outfielder.
- 90/90 unit tests; production build; clean diff whitespace check.
- 13/13 mobile Chromium scenarios at 390x844: repeated GK/two-outfielder switching without reload, original outfield icons, GK save/goal location and additional actions, outfield action capture, timeline/reload persistence, cards and storage-failure recovery.
- 7/7 launch/recovery scenarios with new footer and preserved evidence.
- Screen implementation and styling unchanged byte-for-byte.
Physical iPhone/Safari acceptance remains required after deployment. No user device storage was accessed or cleared.

## Expected live result and rollback
After updating online, footer reads App v1.8.2 / Build 2026.09.26.1. Open Recent matches: uniquely matched confirmed imported outfielders recover automatically; GK and outfield action sets follow the selected player.
Rollback can redeploy source 91a04de, but that source contains the known regression and can reintroduce corrupted flags on load. Preserve match backups and do not clear site data. Ambiguous or missing lineup evidence requires individual review rather than guessing.
