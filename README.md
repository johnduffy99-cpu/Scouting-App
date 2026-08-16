# Scoutline — Version 1.5

Roadmap styles:

- [Clean editable roadmap](docs/scouting-app-roadmap.html)
- [Illustrated football roadmap](docs/scouting-app-roadmap-illustrated.png)

Mobile-first, offline-first football scouting PWA. Sprint 1 includes:

- Match home screen and live match workspace
- Interactive pitch with draggable player markers
- Add-player flow with number and position
- Match clock and chronological event timeline
- Player observations: quality, action, detail, and private typed notes
- Optional browser speech recognition for dictating notes
- Local device persistence using `localStorage`
- Installable PWA manifest and network-first service worker
- Responsive dark touchline UI

## Sprint 1.1 — confirmed line-ups

- Source-neutral import blocks prepared from photographed sheets, official social accounts, club sites, or league sources
- Mandatory editable review before a line-up is accepted
- Official source link, publication detail, status, and uncertainty retention
- Automatic two-team starting positions on the pitch
- Separate substitutes bench with players available for observations
- Missing-source, missing-number, uncertainty, and non-11-player warnings
- Re-import support that replaces only the previously imported side

```text
Team: Example FC
Opponent: Another FC
Status: Confirmed
Source: Official Example FC account
Source URL: https://example.com/team-news
Published: 14 August 2026, 14:00
Starting XI:
1 | Player Name
2 | Player Name
Substitutes:
12 | Player Name
Uncertainties:
None
```

## Sprint 1.2 — observation capture

- Four-colour Great, Good, Reasonable, and Poor quality scale with no default selection
- Icon-led foot/body-part and 13-action grids, including Goal
- Two-screen capture flow with an optional visual pitch-area selector
- Goalkeeper identification during lineup import and review
- Goalkeeper-specific contact and action choices with a nine-zone save-location goal
- Offline football-specific sentence generation with an editable timeline preview
- Permanent player-to-team linkage in each new observation
- Structured selections, original private note, generated prose, and final edited comment stored separately
- Backward-compatible display of Sprint 1 and Sprint 1.1 timeline entries

## Sprint 1.3 — match management

- First-half, half-time, and second-half clock states with stoppage-time display
- Confirmed half-time transition with private typed or dictated notes
- Team-based substitutions that exchange pitch and bench players
- Incoming players inherit the outgoing player’s pitch position
- Half-time notes and substitutions are retained as distinct timeline events
- Separate Full-time and End scouting early workflows with closing notes or dictation
- Early-ending reasons retained without incorrectly marking the match as completed
- Final match summary with score, elapsed time, event totals, closing note, and complete timeline
- Safe Reopen session control for correcting an accidental ending or continuing a test

## Version 1.4 — match-day fixes

- Touch-friendly Save to timeline control stays visible at the bottom of the observation panel
- Immediate saved confirmation and a submission lock prevent uncertain or duplicate saves
- Match clock requires a deliberate 1.2-second hold to pause or resume
- Running, paused, half-time, full-time, and ended clock states use explicit status labels and colours
- Match-day action grid uses Run and Skill in place of the unused Foul won and Foul choices
- Dictation shows listening, live recognition, completion, unsupported-browser, and error states while preserving typed notes
- Finish Later stops and preserves the completed match, flags the report as unfinished, retains a final-note draft, and resumes without duplicating the full-time timeline event
- Terminate scouting also supports Finish Later, preserving the selected reason and closing-note draft and updating a single early-ending timeline event when completed
- Live note fields use a mobile-safe text size to prevent focus zoom; pitch and rapid-selection surfaces block pinch scaling while page-level accessibility zoom remains available elsewhere

## Version 1.5 — capture-to-report workflow

- A stable, versioned structured JSON export preserves match details, confirmed line-ups, players, clock state, score evidence, timestamped observations, substitutions, closing events, notes, and data-quality warnings.
- Observation exports keep the original note, generated wording, and scout-edited final comment as separate fields.
- A standard Markdown AI handoff report is generated from the same structured record, with fixed match, team-sheet, timeline, tactical, player, closing-assessment, and data-quality sections.
- The handoff explicitly tells onward AI not to invent missing details and to distinguish recorded evidence from inference.
- Export filenames use the fixture and match date and remain safe across common filesystems.
- The completed-match screen provides separate downloads for structured match data, the AI handoff report, and the existing safety backup.

See [Version 1.5 change and deployment notes](docs/V1.5-CHANGELOG.md).

## Version 2.0 workload

- Configurable action-icon bank containing common football observation words
- Let each user select and arrange their preferred actions for the main match-day grid
- Keep sensible role-based defaults while supporting different scouting assignments and personal workflows

## Run locally

Requires Node.js 20+ and Python 3 for the local static server. The app has no package dependencies.

```bash
npm run dev
```

Open the local address shown in the terminal. To run the automated model tests:

```bash
npm test
```

To test the production build:

```bash
npm run build
npm run preview
```

## Deploy on Vercel

1. Push this folder to the `Scouting-App` GitHub repository.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Set the build command to `npm run build` and the output directory to `dist`.
4. Select **Deploy**.

No environment variables or backend are required for Sprint 1. Data stays in the browser and is private to that browser profile. Clearing site data removes it. Browser dictation availability varies; Chrome-family browsers provide the widest support and will request microphone permission.

## Match backup

While a match exists, **Download match backup** is available in both the live workspace and the completed-match summary. It downloads a JSON copy containing the complete current match state, including match details, players, line-ups, clock, timeline/events, notes, status, and any other stored fields. Exporting does not change the match saved in the browser. Restoring a backup is intentionally not included yet; restore will be a separate, validated step to prevent a backup from overwriting a good live session.

## Recorded post-V1.5 backlog

- Improve captain-label readability on pitch markers.
- Add disciplinary events and sent-off player state.
- Add an Other action bank and a direct Quick Note route.
- Bring standardised photo, screenshot, and verified online line-up acquisition into the app while keeping every imported line-up editable.

## Later roadmap

Add Supabase authentication and encrypted cloud sync, reusable squads, validated match restore, reporting, and multi-device continuity while retaining the offline queue.
