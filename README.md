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
