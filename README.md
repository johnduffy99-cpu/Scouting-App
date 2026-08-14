# Scoutline — Sprint 1

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

## Next sprint

Add Supabase authentication and encrypted cloud sync, reusable squads, match export, reporting, and multi-device continuity while retaining the offline queue.
