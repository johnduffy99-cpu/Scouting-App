# Single Player: optional surrounding names

Prepared locally, 4 November 2026. App 1.8.3, build 2026.11.04.1. Not deployed.

## Behaviour

Choose Single Player in Match details, identify the named target and their home/away team (shirt number optional), then choose either:

- Add other player names / full or partial team line-ups: opens the existing reviewed import flow; manual Add player also remains available with team selection and optional shirt number.
- Continue without other player names: creates no surrounding records and requires no team sheet.

Both routes retain normal target actions, goalkeeper actions when designated GK, assessments, notes, timeline, pitch placement/capture, backups and reports. Confirm known player positions before kick-off. A partial sheet does not trigger the Full Match Team 2 gate or hide the target. The choice can be reopened; switching choices does not delete recorded players or evidence. A uniquely matching imported target retains its original ID, assessments and coordinates. Ambiguous identities are not automatically merged.

## Compatibility

Uses existing `scouting-player` assignment type. Optional `match.otherPlayerNames` stores `pending`, `add` or `skip`; exports add `assignment.otherPlayerNames` only for opted-in sessions. Export schema remains 1.7. Absent line-ups remain null; no placeholders, synthetic squads or database migration. Original Full Match/GK Only gates remain unchanged; legacy player-specific assignments retain their gates until the scout explicitly chooses a route. Opted-in Single Player assignments require exactly one target. Existing multiple-target assignments remain supported through the legacy player-specific flow.

The source JSON preserves the choice. FIP's existing normalizer uses the known assignment type and does not need this extra field to import players. Its importer tolerates absent/partial sheets; player records originate from supplied players, not fabricated lineup slots. No FIP source or database was changed.

## Validation

- 112 app tests passed, including 10 new checks covering both choices, zero/one/two sheets, placement confirmation, invalid targets, identity merge, legacy gates, evidence capture, ratings, notes, backup/restore, handoff and submission packaging.
- Static production build and whitespace checks passed.
- `scripts/verify-single-player-import.mjs ../FIP-refresh-2026-10-25`: all six read-only compatibility cases passed against the local FIP importer, with exactly one supplied player retained and correct rating/observation attribution. This invokes no database/provider endpoint.
- Browser: Single Player → target → choice; skip → confirm positions → start match → normal target action panel. Add route → existing import review → two-player partial away sheet accepted, target shown once. Reload/resume retained assignment, choice and players. Final choice screen inspected and saved in `verification/other-player-names.png`.
- Physical phone, installed PWA upgrade, authenticated server submission, live database persistence and downstream production reports were not exercised.

## Release boundary

Isolated branch `optional-player-names`, checkout `Scouting-App-optional-names`, based on prepared release commit `9eb63e2`. That baseline already includes the separately prepared Own Goal change. The older primary checkout has unrelated uncommitted position-snapshot work; it was not changed. No remote fetch, push, production deployment or migration was performed. Before release reconcile the current remote baseline and decide explicitly whether the previously held Own Goal change is included; then verify the production cache/build and physical-phone behaviour.
