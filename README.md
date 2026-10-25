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
appear). Spoken output uses Android text-to-speech (see Spoken quiz; the Menu shows a note if the tablet lacks the voice). Needs the microphone permission (asked the first time; or
`adb shell pm grant md.home.pianolessons android.permission.RECORD_AUDIO`).

Speech recognition is [Vosk](https://alphacephei.com/vosk/) (Apache-2.0) with the small models
`vosk-model-small-en-us-0.15` and `vosk-model-small-es-0.42` (Apache-2.0, alphacephei.com), plus JNA (Apache-2.0 / LGPL-2.1). Jars and arm64 libraries
are in `third_party/vosk/`; the models (~80 MB) are not in git. `build.sh` copies them into `assets/models/<lang>/` from
`$MODELS_SRC` (default `/e/Home-Apps/_staging/vosk/models`) or downloads them from alphacephei.com when `assets/models/` is missing.
The APK is about 86 MB; the models unpack to the app's private storage the first time each language is used.

## Spoken quiz
Questions are read aloud slowly in English or Spanish (Menu: **Read questions aloud**, **Spoken feedback**, **Language**; all independent of
Voice quiz), with a 🔊 button to hear a question again. A right answer is praised with the full sentence ("Great job! 12 minus 3 is 9.");
a wrong one is explained, spoken and shown on the red screen as 2-4 short steps chosen by level: counting on/back, make ten / break ten,
ones only, tens stay and ones change, jump to the ten, tens and ones columns. The freeze lasts at least until the voice finishes plus one second.
Speech never blocks the quiz: with no installed voice (the Menu says so) everything stays on the screen, and a timer covers a lost "done" signal.
The explanation generator is a pure function; test it with `node tests/pure.test.js`.

## Hints and tricks
The explanation generator (`explain` in `assets/index.html`) also produces the *hints*: each step carries arcs between the digits (refs a/b/q and the tens/ones digits).
After 5 s (Menu: Hints OFF / after 5 s / after 10 s) the first arc draws itself over the question, 5 s later the next one, with a short spoken line
("Easy trick: just do the ones first! 5 plus 5 is 10."). Four named tricks are used everywhere: 👆 Count on/back (levels 1-2), 🔟 Make ten (2, 3, 5), 1️⃣ Ones first (3, 4),
🧱 Tens and ones (6). The first time a level is reached, and from the 🧠 "Show me the trick" button, a 15-20 s animated mini-lesson plays on a worked example
(skippable); the red wrong-answer screen draws the same arcs. Arcs are placed from the real digit boxes (side by side: over the top; columns: to the side) and redrawn on resize.
A hinted answer counts as right for level and review but does not advance the earn-minutes streak; the quiz log has `hint` 1-2 (step shown) or 3 (trick button).
The hint steps are unit-tested for all sums at all levels: `node tests/pure.test.js`.

## Limits
- **Mistake lock** (Menu, default ON): 5 mistakes in 30 minutes, lesson quizzes and Math only together (a wrong tap within 1.5 s of the buttons counts as 2),
  locks the app with a calm break screen: video paused and muted, piano, quiz and camera stopped, only 🔒 Menu works. Unlock in the Menu with
  **Unlock now** (also clears the mistake window) or **Break 15 min, then unlock**. "Mistake screen: Calm" swaps the red flash and buzzer for a grey screen.
- **Daily screen time** (default 60 min, from the screen time the Activity panel counts): a banner and a spoken warning at 5 minutes left, then the
  lock screen. The Menu offers +15 min, +30 min and No limit today; the day resets at local midnight.
- **Earn minutes** (default ON): every 5 right answers in a row add 5 minutes to today's limit, at most 30 a day (streak needed, minutes and maximum are
  settings). Answers from the Menu's "Show a quiz now" and answers at a level more than one below the day's starting level do not count; a mistake resets the streak.
  The time-over screen offers "Earn more time with math", an earn-only Math session that unlocks the app when the minutes are in; the mistake lock still wins there.
- **Repeat missed questions** (default ON): a missed question returns after 2-3 right answers (at its own level, at most one review per 3 questions) and once more
  after about 10; right both times = mastered. Results and Activity list what he is practising.
- Lock state, minutes used and earned persist across restarts. Minutes are counted with a monotonic clock, and setting the tablet clock back neither
  gives time back nor lifts a lock (setting it forward past midnight still starts a new day). Lock and earn events are listed in Activity.

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
or an organ, plus synth voices and two sampled pads (Warm pad, Polysynth; they sustain by looping the steady part of
the sample); the choice is remembered. Sampled sounds use recordings bundled in `assets/sounds/<instrument>/`
and served to the page by the WebView (no network needed).

Grand piano samples: Salamander Grand Piano by Alexander Holm, CC-BY 3.0.
Synth pads: FluidR3_GM soundfont by Frank Wen, MIT licence (per-note renders from gleitz/midi-js-soundfonts; that
project's README labels the renders CC-BY 3.0, so credit is given here either way).
