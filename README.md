# Piano Lessons — a locked-down YouTube playlist player for kids

A tiny Android app (≈24 KB) that turns a tablet into a **single-purpose piano-lesson screen**: it plays the
videos of **one** YouTube playlist and nothing else — no search, no recommendations, no comments, no way out
to the rest of YouTube or to other apps.

Built for a child learning piano on a Huawei MatePad 11, but it runs on any Android 7+ phone or tablet.

**⬇ Download:** grab `PianoLessons-<version>.apk` from the [Releases](../../releases) page and install it
(allow "install unknown apps" for your browser or file manager once).

## Why
The YouTube app is a rabbit hole: a 5-minute lesson ends in "more videos like this" and an hour of cartoons.
This app keeps the lesson playlist and removes everything around it, so the tablet stays a practice tool.

## What it does
- Plays only the lessons in one playlist, loaded live — add a video to the playlist and it shows up the next
  time the app opens.
- Big thumbnail list with lesson numbers, **Back / Next** buttons, remembers the last lesson.
- **Big video** mode: hides the buttons and shrinks the list so the video fills the screen.
- YouTube's own controls, title bar, "More videos", share and logo are hidden; a tap on the video simply
  pauses it and shows a big ▶ Play button. When a lesson ends: **Next lesson ▶** (or **Start again**).
- Every link, popup and "Watch on YouTube" is refused; Back does nothing; the app pins itself to the screen.
- **🔒 Close** button protected by a grown-up PIN (set on first use, stored only as a hash on the device,
  3 wrong tries = 1 minute lockout).

## Use your own playlist
1. Make a playlist on YouTube (public or unlisted) and copy its ID — the part after `list=` in the URL.
2. Put it in `PLAYLIST` at the top of the script in [`assets/index.html`](assets/index.html).
3. Rebuild (below).

## Set up the lock on the tablet
- Settings → Security → **Screen pinning** → on, and **Ask for PIN before unpinning** → on.
- Open the app, accept "pin this app?", then tap **🔒 Menu** once to create your PIN.
- To leave: 🔒 Menu → PIN → Close the app.

## Build (no Android Studio, no Gradle)
Needs the Android command-line SDK (platform 34, build-tools 37) and JDK 21; paths are at the top of `build.sh`.
```
bash build.sh                # → out/PianoLessons.apk
bash build.sh install        # also installs on every adb-connected device
bash build.sh release 1.3    # builds, tags v1.3 and publishes the APK as a GitHub release (needs gh)
```
The first build also fetches the voice models (see Voice quiz below). `build.sh` creates a signing key in `keystore/` on first run. Keep that file safe and out of git — app updates
must be signed with the same key.

## Voice quiz
In the grown-up Menu (PIN) switch **Voice quiz** on and pick English or Español. The child reads the question aloud and says the
answer ("twelve minus three is nine" / "doce menos tres son nueve"); the app listens offline and checks that the two numbers
and the right answer were said. A wrong answer works like a wrong tap; nothing heard is not penalised (after 3 tries the buttons
appear). Praise and the stop-and-think line are spoken with Android text-to-speech if the tablet has the voice
(Settings shows a note if not). Needs the microphone permission (asked the first time; or
`adb shell pm grant md.home.pianolessons android.permission.RECORD_AUDIO`).

Speech recognition is [Vosk](https://alphacephei.com/vosk/) (Apache-2.0) with the small models
`vosk-model-small-en-us-0.15` and `vosk-model-small-es-0.42` (Apache-2.0, alphacephei.com), plus JNA (Apache-2.0 / LGPL-2.1). Jars and arm64 libraries
are in `third_party/vosk/`; the models (~80 MB) are not in git. `build.sh` copies them into `assets/models/<lang>/` from
`$MODELS_SRC` (default `/e/Home-Apps/_staging/vosk/models`) or downloads them from alphacephei.com when `assets/models/` is missing.
The APK is about 86 MB; the models unpack to the app's private storage the first time each language is used.

## Math only mode
The Menu (🔒 Menu) has **Mode: Piano lessons / Math only**. Math only is a non-stop quiz (no videos, no piano) with the same
levels, think time, stop-and-think freeze, voice answering and records, a star count and a level-up celebration. Levels 4-6 show the sum
as written column arithmetic. The mode is remembered; the Activity panel shows math-only time separately.

## Eye guard (distance check)
Too close to the screen? The front camera looks for one face about once a second (Android's built-in face finder, tiny frames,
rotated as needed). Two "too close" looks in a row cover the screen ("Move back a little!" / "¡Aléjate un poquito!", spoken if a voice is
installed and the Voice quiz is on), pause the video and hold the quiz clocks; it uncovers after 2 s at a good distance. No face seen = nothing happens.
Menu settings: **Eye guard ON/OFF** (asks for the camera the first time), **sensitivity Normal/Strict**, **Calibrate distance** (he sits at a
good distance, the grown-up taps it, 7 seconds; "too close" is then 35% (Normal) / 15% (Strict) nearer than that; without calibration it uses the camera's
field of view and a 5.5 cm eye spacing: about 30 cm Normal, 40 cm Strict). The camera is off while the Menu is open and while the app is in the
background. **Privacy:** frames are examined in memory and discarded; nothing is saved, logged or sent. On Android 12+ a green camera dot shows while it runs.
The Activity panel counts "too close" times per day.

## How it works
One Activity with a WebView. The page hosts YouTube's official IFrame player (`listType=playlist`,
`controls=0`); the iframe is drawn 120 px taller than its box so YouTube's edge overlays fall outside the
visible area, and a transparent layer catches every tap. The WebView refuses all navigation and new windows.
The PIN check goes through a small JavaScript bridge to the app (SHA-256 in private app storage).

## Limits
- Needs an internet connection; it streams from YouTube.
- YouTube may still show an ad before a video — the official embed player doesn't let apps remove them.
- Without Android "device owner" mode, pinning relies on the system screen-pinning prompt; turn on
  "Ask for PIN before unpinning" so the system unpin gesture also needs the device PIN.

## Sounds
The play-along piano can sound like a grand piano (default), a soft synth piano, a music box, an electric piano
or an organ; the choice is remembered. The grand piano uses recorded samples bundled in `assets/sounds/grand/`
and served to the page by the WebView (no network needed).

Grand piano samples: Salamander Grand Piano by Alexander Holm, CC-BY 3.0.
