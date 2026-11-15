# Live dictation repair — review candidate, 15 November 2026

Status: technically validated candidate; not a claim of iPhone or stadium acceptance.
Baseline: main a0a870b34445c4866664f6be461c2d4a78a1f8f9. Candidate build: 2026.11.15.1, app v1.8.3, export schema v1.7.

## Customer evidence

John reports an iPhone 17 running the installed Scoutline Mobile App. The orange microphone indicator and app speaking prompt appeared. The first dictation worked; subsequent attempts missed words, added incorrect wording or ended prematurely. No recording, iOS version or measured failure rate is available. Cold stadium use is context, not a confirmed cause.

Single-player scouting and adding another player during a match worked well. Preserve those workflows. The separate request for direct home/away score correction in single-player mode remains queued at low priority; it must not require a scorer, player observation or surrounding lineups.

## Findings and repair

The live main.js byte-matched the main baseline during this investigation. The original code used single-result recognition, announced listening before audio capture was confirmed, disabled stop control, and did not cancel recognition on note navigation/save. These are confirmed implementation weaknesses, not a proven complete explanation for John's phone failures. Recognition accuracy remains device/service dependent.

The new controller:

- Uses continuous en-GB recognition and reports starting/audio capture/speech/results separately.
- Allows tap-to-stop with up to three seconds to collect final results.
- Rebuilds text from the full session result list so revised/disappearing interim entries are handled without append-only duplication.
- Tries at most two reconnections after a browser-ended/no-speech session, preserving the visible note. It never retries permission, microphone or network errors silently.
- Ends a startup that produces no readiness signal after 12 seconds, or an active microphone returning no words after 15 seconds. A session is capped at 90 seconds.
- Retains visible interim words and identifies them as unconfirmed on interruption. Scouts must review words before saving.
- Cancels on typing, submit, render/navigation, panel removal, hidden page or page exit, and ignores late callbacks. It does not record or upload audio to a new backend.
- Provides a stable 44px microphone button and caches the new module for offline app launch. Recognition service availability offline is not guaranteed.

The browser speech service itself is unchanged. This candidate cannot guarantee improved acoustic recognition in crowd/wind noise.

## Validation completed

132/132 Node tests passed, including 20 dictation lifecycle cases. Production static build and whitespace check passed.

Mobile Chromium interface at 393×852 with synthetic recognition events passed: ten consecutive dictations with interim-to-final revision; single-player quick note with no surrounding lineup; comment preview; saving while active; rejection of late callbacks; manual edit; panel close; half-time/full-time notes; goalkeeper draft retention across navigation. This is not real microphone, iOS, or stadium validation.

## Required iPhone acceptance

On a preview before adopting for match use, record iOS version, installed-app versus Safari behavior and connection type. Use a disposable test match; do not clear existing app data.

1. Dictate and save ten separate scouting notes in succession. Include two-to-three-second pauses and stop/restart the microphone. Record attempts, failures and prematurely truncated notes.
2. Repeat in representative crowd/wind noise, with the phone/microphone held as during scouting and the same headset if used. Include cold-weather handling when practical; do not infer an acoustic cause from temperature.
3. Compare each saved note with the words actually spoken, including football terms and names. Check for omitted, substituted or repeated words. A recording or written reference is needed for an auditable accuracy comparison.
4. Check interrupted connection, background/foreground and permission denial; typed text and prior match evidence must remain safe.
5. Verify single-player use and adding a second player still work.

John's practical acceptance remains outstanding. If capture still fails after the first attempt or wording remains unusable, gather the failed attempt's iOS version, app/browser mode, connection and reference utterance before choosing a different transcription service. Do not mark this issue resolved solely from mocked tests.

## Release and rollback

Publish through a review branch/PR; main and production must remain unchanged until the candidate is adopted. Vercel's normal branch preview may require owner access. Command-line GitHub write authentication is unavailable; the signed-in GitHub browser provides the review publishing route.

Rollback is the unchanged baseline a0a870b (build 2026.11.04.1). No match schema migration or data clearing is required. Re-run tests and compare the remote review tree with the local tested tree before merge.

## API references consulted

- https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/continuous
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognitionEvent/results
- https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/audiostart_event
- https://webkit.org/blog/11648/new-webkit-features-in-safari-14-1/
