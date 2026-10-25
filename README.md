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
- Open the app, accept "pin this app?", then tap **🔒 Close** once to create your PIN.
- To leave: 🔒 Close → PIN → Close the app.

## Build (no Android Studio, no Gradle)
Needs the Android command-line SDK (platform 34, build-tools 37) and JDK 21; paths are at the top of `build.sh`.
```
bash build.sh                # → out/PianoLessons.apk
bash build.sh install        # also installs on every adb-connected device
bash build.sh release 1.3    # builds, tags v1.3 and publishes the APK as a GitHub release (needs gh)
```
`build.sh` creates a signing key in `keystore/` on first run. Keep that file safe and out of git — app updates
must be signed with the same key.

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
