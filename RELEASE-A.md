# Release A — Mobile App v1.8.1

Status: prepared and locally verified; NOT deployed or production accepted.

## Deployment check

- Target: Mobile App only. FIP unchanged.
- Intended environment: Production at https://scouting-app-eta.vercel.app, only after John confirms this deployment check. No staging or Production deployment performed.
- Version: v1.8.1, build 2026.09.21.1, existing shared page footer; export schema remains 1.7.
- Source: release/a-v1.8.1 in Scouting-App-release-a-v1.8.1, based on 123dab5739e09879b33e639c647c7bc76385ce3b. The commit containing this document identifies the candidate.
- Rollback: 123dab5739e09879b33e639c647c7bc76385ce3b, v1.8.0 build 2026.09.19.1. Public live main.js, model.js and sw.js byte-matched this source on 21 September; see verification/production-baseline.json. Redeploy that source or restore its existing Production deployment, preserving browser match storage. Retest service-worker refresh and saved-match recovery after rollback.

## Exact scope

A1 recovers the approved GK implementation from GK-workflow-2026-09-19, not its older full archive. Nine main actions and fourteen additional actions retain approved icons. Quality/contact selection, Save to Timeline and Quick Note, conditional combined Save/Goal Location and Shot Origin, Back preservation, Observation Saved, Add Another Observation and Close are integrated into the current released App. Ordinary GK actions save directly; Goal/Save require both locations. Multiple actions, notes, cards, timeline, backup/export and failed-write draft recovery are preserved. The existing explicit-lineup goalkeeper restoration remains intact.

The recovered module uses the current source's separate goalkeeperSaveAction definition. The current export already retains action arrays, so no archive export code or player-report changes were imported. Outfield controls remain unchanged. Offline cache includes the new module and has a new version key.

A2 initializes navigation to Home without resetting the saved match or running clock. Select the existing Recent matches card to resume live play or open a completed/unfinished report. New page loads/reloads start at Home. Returning to an already-running foreground/background app is not a fresh load and retains its current screen.

A3 code in the original Scouting-App checkout was not edited or included. No FIP files changed.

## Verification and remaining acceptance

88/88 unit tests; production build; 12/12 mobile browser scenarios at 390x844; 7/7 launch/recovery scenarios; diff whitespace checks. Screenshot review covers main actions, additional actions, location and completion. Tests exercise saved evidence after reload, multiple actions, spatial validation, Back preservation, card outcomes, failed local storage and outfield regression. Launch fixtures cover no match, pre-match, running first half, half-time, second half, full-time unfinished report and termination, preserving evidence and clock state.

Remaining before declaring DONE: actual iPhone/Safari acceptance and, after explicit deployment confirmation, authenticated/real-device Production verification of v1.8.1, Home launch, deliberate recovery and the GK workflow. Real microphone input was not tested. This preparation is not Production verification.
