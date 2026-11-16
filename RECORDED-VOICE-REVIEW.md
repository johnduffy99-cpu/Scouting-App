# Recorded voice notes — release 1.8.4

Build 2026.11.16.2 replaces unreliable browser speech recognition with explicit recording, locally saved playback/recovery, and opt-in server transcription. The OpenAI API key stays server-side. A private device activation link stores the device access code locally and removes its fragment from the address bar. Successful manual access is also remembered, so normal use needs no repeated code entry. Clearing browser data removes device activation and saved audio.

Record from a player/team note, stop, transcribe, review, Add transcript to this note, close the recorder, and Save to timeline. Existing typed text is retained. The final text appears in structured JSON and AI handoff exports. Recovered recordings can be copied into the appropriate note; they are never silently attached to another player. Audio remains separately available until explicitly deleted. Each clip is limited to 90 seconds and transcription payloads to 1 MB.

The service remains gated by explicit enablement, exact allowed origins, a private access code of at least 16 characters, server credentials, payload validation and a per-process/IP request limiter. This is a private single-user release, not an unrestricted public transcription API. The limiter is not a durable monthly budget. Device access codes must not be committed, put in exports, or shared publicly.

Validation: 138 Node tests; Chromium/WebKit native recorder acceptance with synthetic input and mocked API; repeat recording, microphone release, failures and reload recovery; remembered access; activation fragment cleanup; timeline save and both exports. A real 6.04-second synthetic speech request through the deployed preview returned the reference word for word. The user accepted recording, recovery and transcription on iPhone. Pitch-side noise, name accuracy and interruption recovery are not guaranteed. Completed audio is saved locally; recording interrupted before completion can be lost.

User authorized production publication on 16 November 2026. Production release is complete only after deployment and live smoke checks. No source screenshots or user audio are included in this repository.
