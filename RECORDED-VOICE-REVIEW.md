# Recording-based voice notes — local review prototype

15 November 2026. Branch fix/recorded-voice. Build candidate 2026.11.15.3. Not published or enabled. Existing draft PR #5 and its build .2 preview are unchanged.

## Why this changes direction

John's two screenshots show audio-capture-ready UI with an empty note, followed by the application's 15-second no-words timeout. He reports a couple of successful notes beforehand. This is a repeat-use transcription stall, not a demonstrated permission failure. Earlier screenshot showed the Vercel preview toolbar, not an application error. The previously reported Home Screen exit remains unproven as to cause.

Browser implementation defects have been addressed, but build .2 did not meet the requirement for dependable repeated dictation. Similar silent-result failures are documented in WebKit, including cases involving audio playback; that does not prove the same trigger here. No user audio or native device logs were available.

## Reviewable alternative

The microphone opens a recording panel. Start recording explicitly requests microphone access. Stop saves the completed audio locally in IndexedDB. No SpeechRecognition instance is constructed, and opening notes does not focus the keyboard.

The scout can play back/download the saved audio, or choose Transcribe with OpenAI. That explicit action sends only the audio file, format and duration through the Scoutline server to OpenAI. The match/player label remains local. The returned transcript is editable and is added to the connected original note only when the scout chooses Add transcript. Completed recordings remain in a separate recovery list across reloads, including after a failed request, until explicitly deleted or browser data is cleared. Recordings interrupted before their final save are not guaranteed to survive a browser/device termination. Each recording is limited to 90 seconds.

## Service and cost

The new /api/transcribe-note route is disabled by default and requires all of: explicit environment enablement, exact allowed Origin, a pilot access code of at least 16 characters, and a server-side OPENAI_API_KEY. No key or real audio was used in tests. No paid request has been made.

The route uses gpt-transcribe with an English hint. Current documented price is $0.0045 per recorded minute (about $0.27 per recorded hour), excluding hosting, taxes and any future price changes. Actual account model access and deployed configuration remain unverified.

The pilot rate limit is per process/IP and is not a durable account quota or enforced monthly budget. A broadly accessible production release would require integration with suitable authenticated access and durable usage controls. This prototype is for a restricted preview, not a production release.

Approval is required before publishing these new files, enabling the paid service or sending John's audio to OpenAI. Original nine-file and six-file approvals do not include this new data flow.

## Validation boundaries

138 Node tests pass (including endpoint gating, origin/access rejection, invalid audio/size/duration, multipart request shape, upstream failure/empty response and format selection). WebKit 26.5 and Chromium browser acceptance both pass using each browser’s native MediaRecorder, a synthetic tone input (no physical microphone), and a mocked transcription response. Encoded audio loads successfully in the browser playback control; this is not a speech-quality measurement. It checks ten recordings/transcriptions, no uploads before the explicit action, microphone track release, text append, failed-upload retention, reload recovery and retry. Real microphone audio, actual transcription quality, background-noise performance and iPhone acceptance remain untested.

During local testing, WebKit failed to persist a Blob that Chromium accepted. Storage was changed to audio bytes with Blob reconstruction for playback. Both browser engines then passed, including completed-recording recovery after reload. This is a prototype finding, not an explanation of the user's existing live dictation stall.

## Sources

- https://developers.openai.com/api/docs/guides/speech-to-text
- https://developers.openai.com/api/docs/models/gpt-transcribe
- https://bugs.webkit.org/show_bug.cgi?id=321436

The next device test should first check a few recording/playback cycles without uploading. Only after approval and pilot configuration should completed audio be sent for transcription. Do not treat a mocked test pass as proof of improved acoustic accuracy.

The published recording-only app never enables the transcription controls: its recorder defaults to `allowTranscription=false`. Only the synthetic acceptance harness explicitly enables the mocked transcription path. No audio upload is available through the app UI in this preview.
