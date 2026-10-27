# Piano Lessons: full app description (for the design language)

Written from the code as of version **1.11** (`AndroidManifest.xml`: versionCode 16, versionName 1.11), commit `241e480`, 2026-10-27.
It describes every screen, panel, component, state and interaction that exists today, so a visual system can be designed against it.
Line numbers refer to `assets/index.html` unless another file is named.

---

## 1. Purpose and audience

| | |
|---|---|
| **Child user** | One 6-year-old beginner, UK school Year 2 (British English, "Maths", "Mum"). Cannot read long text, taps with a finger or the tablet pen, may press hard or with several fingers. |
| **Grown-up user** | A parent who sets the app up, unlocks it, and reads the progress. Everything grown-up sits behind a 4-digit PIN. The grown-up menu is in English only. |
| **Device** | Huawei MatePad 11 tablet, always landscape (`android:screenOrientation="sensorLandscape"`). Design target viewport: about **1024 x 606 CSS px** landscape. Runs on any Android 7+ (minSdk 24, targetSdk 34). |
| **Job** | A locked single-purpose "practice tablet": piano lesson videos with an on-screen piano to play along, and three school activities (Maths, Writing, Colouring). No way out to YouTube, other apps, links or ads browsing. Screen time, mistakes, bedtime and eye distance are limited for the child. |
| **Languages** | Everything the child sees follows Menu > Language: English or Spanish (`L(en, es)`, line 819). School words in Writing are always spoken in English. |

The app began as "a locked YouTube playlist player" (v1.0) and grew into a small kids' learning suite (v1.11). The name, launcher icon and the default mode are still "Piano Lessons".

---

## 2. Information architecture

### 2.1 Screen map

```
App launch
 └─ (Menu > Start screen = "he chooses")  START SCREEN  "Hi! What do you want to do?"
       ├─ Piano lessons card ─> PIANO LESSONS (video + lesson rail)
       │       ├─ Big video  <-> Normal view          (toggle)
       │       ├─ Play along <-> Close piano          (toggle: on-screen piano)
       │       │      └─ sound button ─> SOUND PICKER popup (12 sounds + Surround row)
       │       └─ every N lessons ─> MATHS QUIZ overlay ─> RED "Stop and think" screen / mini-lesson
       ├─ Maths card ─────────> MATHS ONLY (non-stop quiz)
       ├─ Writing card ───────> WRITING (handwriting pad)
       └─ Colouring card ─────> COLOURING (crayons + picture)  ─> gallery / rest screen
 (Menu > Start screen = a fixed mode) the app opens straight in that mode; no 🏠 button.

Always on top, from anywhere:
  🔒 Menu ─> PIN PAD ─> GROWN-UPS MENU (settings sheet) ─> Activity panel / Maths results panel
  LOCK SCREEN (break / screen time over / bedtime)       only 🔒 Menu works
  EYE GUARD cover ("Move back a little!")                 automatic, camera-driven
  5-MINUTES-LEFT banner                                   automatic
```

Modes are body classes: `athome`, (none) = piano lessons, `math`, `inwrite`, `incolour`; sub-states `play`, `big`, `locked`, `earning`, `sndfix`, `fixedStart` (CSS lines 64-120, 184-188, 296-303, 444-471; JS `appMode` lines 3716-3784).

### 2.2 Top bar (header, lines 555-562)

One row of pill buttons. What shows depends on the mode:

| Element | Label / icon | Shown when | Action |
|---|---|---|---|
| Keys glyph + title | striped keys + "Piano Lessons" (gradient text) | Piano lessons, Normal view only (hidden in Play along and Big video, line 367) | none |
| Video volume | 🎬 + slider 0-100 (default 50) | Play along only | sets the YouTube player's volume (line 1747); outside Play along the video plays at 100 |
| Sound button | current sound, e.g. "🎹 Grand piano" | Play along, unless Menu locked the sound (`sndfix`) | opens the Sound picker |
| "Loading sound…" hint | muted small text | while a sampled sound set is loading | - |
| Play along toggle | "🎹 Play along" / "✕ Close piano" | Piano lessons | shows / hides the on-screen piano (lines 1749-1756) |
| Video size toggle | "⛶ Big video" / "▢ Normal view" | Piano lessons | toggles `big` (lines 1305-1318) |
| Home | 🏠 | Start screen choice is "he chooses", not on the start screen, never during the quiz between lessons (line 3763) | back to the Start screen |
| Menu | "🔒 Menu" | always; on lock / maths / writing / colouring screens it floats top-right (line 186) | opens the PIN pad |

Play along and Big video are remembered between launches (`playMode`, `bigMode`). They can be on together.

### 2.3 Piano lessons screen (layout)

- CSS grid: video stage on the left, **lesson rail** on the right (`.app` 1fr / 300 px, line 17). In Play along or Big video the rail shrinks to **150 px**, padding drops to 8-10 px (lines 73, 114).
- Stage, top to bottom: header, video, then either the **Back / Next row** (Normal view only) or the **piano** (Play along).
- Back / Next row: "◀ Back" and "Next ▶" big candy buttons, between them "Lesson 3 of 12" (accent colour) and the video title (one line, ellipsis). Disabled at the ends (opacity .35).
- Video sizing: Normal view fits the whole 16:9 video. Big video makes the video fill the full width and anchor to the bottom, so the top is cropped and the keyboard inside the lesson video sits right above our piano (lines 66-71).
- Phone fallbacks: under 800 px wide the rail moves under the video as a horizontal strip (line 339); short landscape screens (height under 500 px) keep a 140 px side rail and hide Back/Next (line 429). Neither applies on the MatePad.

### 2.4 Lesson rail ("All lessons")

A scrolling column of 16:9 thumbnails (YouTube `mqdefault.jpg`), each with a round number badge top-left (`.lesson .num`). The current lesson gets a 3 px accent ring and a filled accent badge, and is scrolled into view (lines 1280-1284). Tap = play that lesson. Thumbnails have a 4 px dark "ledge" shadow (line 369).

### 2.5 Video player and its own cover

- YouTube's official IFrame player (`listType: "playlist"`, `controls: 0`, `disablekb`, `fs: 0`, lines 1215-1225). The iframe is drawn 120 px taller than its box and shifted, so YouTube's title / "More videos" overlays fall outside the visible area (lines 33-37).
- A transparent **shield** over the video catches every tap: tap = pause / play (line 1251).
- **Cover** screen (our own, never YouTube's): on pause or before start, a big "▶ Play" candy pill; on end, "Next lesson ▶" plus "Lesson 4 is next", or after the last one "↻ Start again" plus "You finished all the lessons!" (lines 1255-1266). Background: purple radial glow (line 372).
- Errors: a video that cannot play is skipped after 1.5 s; after 3 failures in a row the player is replaced by a message "The lessons can't play right now. Check the Wi-Fi and try again." with a "Try again" button (lines 1295-1303). Playlist not loaded after 10 s: "The lessons didn't load. Check the Wi-Fi and try again."
- The last lesson is remembered (`lastLesson`).
- **Least-watched first (1.26):** when the app starts, the lesson list is sorted by seconds watched (`actLog.les[id].sec`), least first; ties keep the playlist order. The numbers on the thumbnails, "Lesson N of M", Back / Next, "Lesson N is next" and skipping a broken video all follow this order. A small ✓n on a thumbnail = watched to the end n times. The app opens on the least-watched lesson (playlist ids cached in `lessonIds`). The order is fixed for the session so the list never jumps while he uses it.

---

## 3. Components

### 3.1 On-screen keyboard (Play along)

Code: CSS lines 63-90 and 364-375, markup 571-575, JS 1333-1793.

| Property | As built |
|---|---|
| Size | Under the video, `height: 36vh` (min 190 px), full stage width (line 63). About 218 px tall at 606 px. |
| Keys | **2 octaves + top C = 25 keys: 15 white, 10 black** (loop `base..base+24`, line 1665). |
| Default range | **C3 to C5** (`base = 48`, MIDI 48 = C3, line 1338). Middle C (MIDI 60) is the C in the middle and is labelled **C4**. |
| Octave shift | Two slim arrow buttons, ◀ left / ▶ right, **30 px wide**, full keyboard height (line 364). Shift by 12 semitones; leftmost C can go from **C1 (MIDI 24) to C5 (MIDI 72)**, so the whole range is C1-C7 (lines 1745-1746). The shift is **not remembered**: every launch starts at C3. Arrows use `onclick`. |
| White key labels | Note letter at the bottom, 20 px bold, colour `#4a4560` ("C", "D", "E"...). Only C keys also get a small octave tag at the top: "C3", "C4", "C5" (12 px, `#a39fbd`, line 1670). |
| Black key labels | Sharps only: **C#, D#, F#, G#, A#** (12 px, `#cfc8f0`, line 1676). No flats anywhere. |
| Octave numbering | Scientific / MIDI style: `Math.floor(midi / 12) - 1` (line 1670). It is **absolute**, not "relative to the leftmost C": after shifting down one octave the left C reads C2. |
| White key look | Cream vertical gradient `#f4f1ea -> #fffdf8 70% -> #e9e4d8`, bottom radius 8 px, 1.5 px gaps on black (line 82). |
| Black key look | 60 % of key height, 64 % of a white key wide, gradient `#2b2836 -> #111018`, bottom radius 6 px, shadow `0 3px 4px rgba(0,0,0,.5)` (line 85). |
| Pressed state | Class `.on`. White: yellow gradient `#ffc83d -> #ffe08a`, label `#1e1b2e`. Black: `#c98a12 -> #f5b841`, label `#2a1c00` (lines 87-90, 375). No motion, only colour. |
| Multi-touch | Yes: one entry per `pointerId`; several fingers can hold several keys; two fingers on one key do not cut each other off (`fingers` counter, line 1711). |
| Glissando | Sliding a finger moves the note to the key under it (`pointermove`, line 1734). |
| Velocity | 0.25-1.0 from where the key is hit (nearer the bottom = louder), touch contact size, and pen pressure when the screen reports it (lines 1696-1710). Menu > Piano key sensitivity Off / Normal / Strong. |
| Sound | 12 sounds, see 3.2. Surround placement low = left, high = right. |
| Volume | Menu loudness limit 100 / 80 / 60 % of the app's own output. A separate slider controls the lesson video's volume. |

### 3.2 Sound picker popup and sounds

A modal over everything (`#instPop`, lines 102-108, 1759-1782): a 4-column grid of big tiles (2 columns under 560 px), each a 38 px emoji over the name; the current one has an accent border. Tap outside closes. A bottom row "🎧 Surround" with three buttons: 🔈 Off, 🏠 Room (default), 🏛️ Big hall.

| id | Tile | Kind |
|---|---|---|
| grand | 🎹 Grand piano (default) | recorded samples, `assets/sounds/grand/` |
| soft | 🎼 Soft piano | Web Audio synth |
| musicbox | 🎵 Music box | synth |
| epiano | 🎸 Electric piano | FM synth |
| organ | 🎶 Organ | synth, sustains while held |
| robot | 🤖 Robot voice | synth "talkbox", mono, glides between notes |
| lead | 🎛️ Synth lead | synth |
| 808 | 🔊 808 bass | synth, one octave down |
| chip | 👾 Chiptune | synth, sustains |
| warmpad | 🌌 Warm pad | recorded samples, looped while held, `assets/sounds/warmpad/` |
| polysynth | 🎚️ Polysynth | recorded samples, looped, `assets/sounds/polysynth/` |
| xylo | 🌈 Xylophone | synth with a mallet "tok" |

Sample sets: 25 MP3s each, one every 3 semitones (C, D#/Eb, F#/Gb, A over octaves 1-6, plus C7), pitched to the nearest sample (lines 1396-1411). Credits: Salamander Grand Piano (CC-BY 3.0), FluidR3_GM (MIT).

### 3.3 Maths quiz (between lessons, and Maths only)

Overlay `#quiz` (lines 783-810, CSS 132-295, JS 2264-2835). A big rounded card centred on a dark purple scrim, scaled down (never up) to fit the screen with no scrolling (`fitInto`, line 2233).

- **When**: between lessons after every 1-4 lessons (Menu), the next lesson plays only after 1-3 right answers. It catches Next, thumbnails and autoplay. In Maths only it never ends. The video pauses behind it.
- **Card contents, top to bottom**: title ("🧠 Maths time! Solve it to play the next lesson" / "Math time!" / "➗ Earn more time with maths!"), progress (Maths only: "⭐ 12 · Level 3"), hearts row, picture row (levels 1-2: emoji fruit/stars/fish etc., crossed-out items for take-aways), the sum, a 🔊 "hear it again" round button (84 px), the earn-minutes streak (⭐⭐⚪⚪⚪), **three answer buttons**, voice panel, "🧠 Show me the trick" / "💡 Show me" pill, a message line ("🤔 Think…").
- **Sum**: levels 1-3 written side by side ("12 − 3 = ?", 96 px; 54 px with pictures). Levels 4-7 written as column arithmetic like on paper, monospace, 70 px, a dashed accent "?" box (lines 167-174).
- **Answer buttons**: 120 x 96 px, 50 px digits, radius 26 px, white text with a 3D ledge. Fixed colours by position: blue `#7fd4ff -> #3e9bff` (ledge `#2367c9`), green `#b9f47e -> #4cc95d` (`#2c8a3a`), pink `#ffb0d6 -> #ff6fa8` (`#c23f78`). Disabled for a 2 s think time after the question is read (opacity .45). Pressed = moves down 5 px. Right one = gold and scaled 1.12.
- **Right answer**: the "?" turns into the answer in green `#5ee6a0` with a pop; "🎉 Yahoo! Correct!" in a gold-green-blue gradient; confetti over the whole screen (~3 s, 6 colours, line 2246); a rising 4-note triangle-wave chime; spoken praise ("Great job! 12 minus 3 is 9."). Level up after 5 right in a row (7 levels).
- **Wrong answer**: full-screen **red "Stop and think!"** (`#qred`, radial `#ff4d5e -> #c3102a`), a harsh low sawtooth buzzer, the sum with the right answer, hearts, then the explanation steps told one by one (each lit in yellow `#ffe27a` and scaled while spoken, the others dimmed to 22 %), arcs drawn over the digits, dots for levels 1-2, a tens/ones legend for column sums, and a countdown "⏳ 5" (or 🔊 while speaking). Freeze = 5 s per mistake in a row, max 20 s, then a **new** question. Menu "Mistake screen: Calm" makes it grey (`#6f7894 -> #4c5470`), no buzzer, "🤔 Let's think together".
- **Hints**: after 20 / 30 / 45 s without an answer (Menu), red arcs (`#ff4d6d`, 5 px) draw themselves between digits with a yellow label chip; column sums first wiggle the ones column ("👉 Start with the ones"), then play an animated column hint in one of three styles (✨ Magic numbers, 🧱 Blocks, 🙋 Do it with me with a 6-key keypad). Colour code in hints: tens blue `#4cc9ff`, ones pink `#ff5a7a`, carry/trade gold `#ffd23f`, result green `#5ee6a0` (lines 239-271).
- **Mini-lesson** ("trick"): full-panel, 15-20 s animated worked example the first time a level is reached or from the trick button; trick name in 38 px accent, sum 76 px, caption 32 px, a "Skip ▶" pill bottom-right (lines 273-280, 2466-2491).
- **Voice answer** (Menu, off by default): a pulsing 🎤 (84 px), "Read it and say the answer!", and what was heard in small grey text. After 3 unheard tries the buttons appear.
- **Hearts** (mistake lock): a row of ❤️ (34 px); a lost heart shakes and turns grey, a won one pops in (lines 286-295).

### 3.4 Writing (handwriting practice)

Panel `#write` under the header (lines 444-464, 750-752, JS 2843-3178).
- **Top bar**: level name in accent ("Level 3 · One-armed robot letters"), a row of letter chips (done = green `#8ee6b5`, current = accent), round-progress dots (14 px), buttons 🔊 (listen levels only), "👀 Show me", ↺ clear.
- **Writing pad**: cream paper `#fffdf5`, radius 24 px, inset border `#f1e7c9`, with school lines per row: top line and dashed middle line `#9fc3ef`, red base line `#ef8f9f` (3 px), tail line `#cfdcef`.
- **Guides**: a green start dot `#2fbf71` with the stroke number, an orange dot running along the stroke to show direction, a pale thick guide (round 1), purple dotted line `#7b6fd0` (round 2), a small grey model top-left (round 3). An orange pen `#ff8a3d` demonstrates the letter.
- **Ink**: blue `#3d4bd6`; finished strokes turn green `#1fa463`; a miss flashes red `#e5484d` and the pad shakes (`wshake`, 0.35 s).
- **Levels 1-15**: letter families (curly caterpillar, long ladder, one-armed robot, zigzag), capitals, numbers, Year 1 and Year 2 tricky words, days and months, word endings, apostrophes, three "listen and write" levels, short sentences (lines 1082-1102).
- Finger or pen; pen pressure widens the line; a resting palm is ignored while the pen is in use. Praise + confetti per item, bigger confetti on level up.

### 3.5 Colouring (with the memory game)

Panel `#colour` (lines 467-499, 753-757, JS 3184-3714).
- **Top bar**: 🖼️ gallery, ◀ previous, title "🎨 3/36 · frog", stars ★★☆ (gold `#ffd21f`), progress text ("62% · over the line: 2/10" or "👀 7" countdown or "🧠 4/5"), **12 round crayons** (34 px, current one has a white ring and scales 1.18), 👀 peek (memory game, 2 per picture), ↶ undo, ▶ next (pulses green when the picture is done).
- **Crayon colours** (line 3251): red `#ff4d4d`, orange `#ff9f1c`, yellow `#ffd21f`, green `#2ecc71`, light blue `#4cc9ff`, blue `#3d5afe`, purple `#9b5de5`, pink `#ff6fb5`, brown `#a0522d`, skin `#f5d0a0`, grey `#9e9e9e`, black `#333333`.
- **Picture**: 36 public-domain line drawings (`assets/colour/`, credits in `SOURCES.md`) from easy to hard, plus the grown-up's own pictures (IndexedDB). Paint stays inside the shape where the stroke started; the crayon gets thinner as pictures get harder (30 px down to ~14 px).
- **Over the line**: the pad shakes, lines flash red for 0.45 s, a soft falling "bonk", a 120 ms vibration request, and a varied spoken warning. At the limit (6 / 10 / 15 / never) the picture stops with a **rest screen**: a sad yellow face, "Too many times over the lines. Take your time, have a rest and come back more focused.", a 1-minute countdown, then "Try again".
- **Done** at about 85 % coloured with no big holes; stars from crossings (0-1 = 3, up to 4 = 2, more = 1); the next picture unlocks.
- **Memory game** (on by default): the coloured model shows for a few seconds (3 s + 1.5 s per colour, Short / Normal / Long), fades (0.6 s), he colours from memory; at the end he hears how many colours he remembered. Starts with 3 colours to remember, grows to 8.
- **Gallery**: grid of white cards (min 150 px, 4:3) with stars or a 🔒 on faded locked pictures.

### 3.6 Start screen

Full screen `#home` (lines 189-200, 377-399, 465-499, 726-749). Night-sky gradient with twinkling star dots. Heading "Hi! What do you want to do?" in gold-pink-blue gradient text. Up to **four big square-ish cards** side by side (min(22vw, 250 px, 58vh), radius 36 px, a 10 px coloured ledge, gentle floating animation, staggered):

| Card | Gradient | Ledge | Drawn art (inline SVG) |
|---|---|---|---|
| 🎹 Piano lessons | `#6fd0ff -> #5b7cff` | `#2a5cc7` | keyboard with bobbing music notes |
| Maths | `#a6f27a -> #25c08a` | `#1f9a6a` | spinning star, "2 + 3" blocks |
| Writing | `#ffc36b -> #ff7a59` | `#c2541f` | lined paper with "abc" and a pencil |
| Colouring | `#8ef0c0 -> #3bb3a0` | `#2a7f62` | pink heart and a crayon |

The grown-up can hide any card (at least one stays).

### 3.7 Warnings and limits for the child

| Screen | Look | Trigger | Way out |
|---|---|---|---|
| **Lock screen** `#lockscr` (lines 296-303, 3880-3894) | Deep blue radial `#2f4a96 -> #18224a`, 110 px icon, 50 px headline, 28 px subline | 🛑 "Time for a break" (hearts gone: 5 mistakes in 30 min, a too-fast wrong tap counts double) / ⏰ "Screen time is over for today" + "Ask Mum or Dad" / 🌙 "Bedtime" + "Sleep well! See you in the morning" | Grown-up unlock, timed break ends, or "➗ Earn more time with maths" (screen-time lock only) |
| **5-minutes-left banner** `.tbanner` | Yellow `#ffd166` pill top-centre, 22 px bold, 8 s, also spoken | 5 min of daily time left | auto |
| **Eye guard cover** `.eyecov` (lines 309-315) | Dark `#14121f`, 👀 110 px, "Move back a little!" 54 px, "The screen comes back when you do" | Front camera sees his face too close twice in a row | Moves back for 2 s |
| **Red mistake screen** | see 3.3 | wrong answer | timed |
| **Colouring rest** | see 3.5 | too many crossings | 1-min timer |

While locked: video paused and muted, piano/quiz/camera stopped, only 🔒 Menu works. Locks survive a restart; minutes use a monotonic clock so changing the tablet clock does not help.

### 3.8 PIN lock (grown-up gate)

`#gate` (lines 58-61, 123-131, 580-589; JS 4005-4102, 4351-4363).
- A dark scrim `rgba(10,9,16,.92)` with a 340 px card: "For grown-ups", the prompt, the dots "••••" (34 px accent, 10 px letter-spacing), a red error line `#ff8a80`, and a 3 x 4 keypad (1-9, Cancel, 0, ⌫), 24 px digits, radius 16 px.
- First use: "Create a 4-digit PIN", then "Type the same PIN again". Later: "Enter the grown-up PIN". 3 wrong tries = 1 minute lock ("Too many tries, wait a minute").
- The PIN is never kept in the page: the Java bridge `Parent` stores only a SHA-256 hash in app-private SharedPreferences (`MainActivity.java` lines 523-567). This document does not, and cannot, state the PIN.
- The menu relocks when closed, after 60 s without a touch, when the app goes to the background, or on a tap outside the card. Its DOM is cloned in only after the PIN is accepted (`<template id="menuTpl">`, line 591).

### 3.9 Grown-ups menu (settings sheet)

Full-screen sheet (max 1120 px wide) with a top bar ("Grown-ups", "Close the app", gold "Back to lessons"), a **220 px left rail** of sections with line icons (inline SVG, 22 px, 1.9 stroke, accent when current), and a scrolling right pane (sections max 640 px). The last open section is remembered. Rows: label left (with small grey detail), value right in accent with a chevron; ON/OFF values automatically become **iOS-style switches** (48 x 28 px, green `#3fc77a` when on) (`rowify`, line 4029). Every tap cycles to the next value. Dependent rows are indented and disabled when their parent is off.

| Section | Contents |
|---|---|
| **Today** | status note (minutes used, lock state, earned); quick buttons: Unlock now (gold), Break 15 min then unlock, + 15 min today, + 30 min today, No limit today; rows: Activity, Maths results, Show a quiz now |
| **Start screen** | Opens with: he chooses / Piano lessons / Maths only / Writing only / Colouring only; show/hide each of the 4 cards |
| **Piano** | Loudness limit 100/80/60 %; Piano key sensitivity Off/Normal/Strong; He can change the sound ON/OFF |
| **Maths** | Maths quiz ON/OFF; Quiz after every 1-4 lessons; Correct answers needed 1-3; Level 1-7; Repeat missed questions; Hints after 20/30/45 s / OFF; Hint style test all 3 / A / B / C |
| **Writing** | Writing level 1-15; Letter check Gentle/Normal/Strict |
| **Colouring** | Memory game; Look time Short/Normal/Long; Stop the picture after 6/10/15/Never; Shake and buzz over the line; All pictures open; Add a colouring picture from the tablet; Remove my own pictures |
| **Voice & language** | Language English/Español; Read questions aloud; Spoken feedback; Voice quiz (answer by voice); status note |
| **Screen time** | Daily screen time Off/30/45/60/90/120 min (default 60); Bedtime Off/19:00/19:30/20:00/20:30/21:00 (locked until 07:00); Earn minutes with maths, Streak needed 3/5/10, Minutes per streak 2/5/10, Max earned per day 15/30/60; Mistake lock, Hearts 3/5/7/10, Within 15/30/60 min; Mistake screen Dramatic/Calm |
| **Eye guard** | Eye guard ON/OFF; sensitivity Normal/Strict; Calibrate distance (7 s); Use the automatic distance; status note |
| **General** | Change PIN |

**Activity panel** (`#act`): tabs Today / 7 days / Lessons / Quiz; rows of "label ... value", a 7-day bar chart (accent bars), lists of locks and earned minutes; "Clear activity" (tap twice). **Maths results panel** (`#res`): today and all-time right/wrong/%, level, streak, practising list, last 20 mistakes, hint-test table; "Clear records" (tap twice).

### 3.10 Updates (there is no OTA)

The app has **no in-app or over-the-air update mechanism** and no update check. A new version is installed by the grown-up:
- `bash build.sh install`: builds and runs `adb install -r` on every adb-connected device (USB or adb over Wi-Fi; the script just lists `adb devices`).
- `bash build.sh release <ver>`: tags and publishes the signed APK on the GitHub Releases page; the tablet downloads and installs it as an unknown-source APK.
Updates must be signed with the same `keystore/piano.jks`.

---

## 4. Current visual style (as implemented)

The page has two style layers: the original v1.0-1.10 rules (lines 9-345) and a **v1.11 "Look" layer that overrides them** (lines 346-548). The table gives the effective values.

### 4.1 Tokens (CSS variables)

Defined twice on `:root`; the second definition (line 348) wins:

| Token | v1.0 value (line 10-11) | **Effective (line 348)** | Used for |
|---|---|---|---|
| `--bg` | `#14121f` | **`#17123a`** | page, start screen, mini-lesson base |
| `--panel` | `#1e1b2e` | **`#251d52`** | cards, popups |
| `--panel2` | - | `#2e2563` | defined, **never used** |
| `--ink` | `#f4f1ff` | **`#fbf8ff`** | text |
| `--muted` | `#a39fbd` | **`#b3acd9`** | secondary text |
| `--accent` | `#f5b841` | **`#ffc83d`** | primary gold: buttons, current items, numbers |
| `--accent-ink` | `#1e1b2e` | **`#2a1c00`** | text on gold |
| `--ring` | `#f5b841` | **`#ffc83d`** | current lesson ring |
| `--arc` | - | `#ff4d6d` (fallback), white on red screen | hint arcs |
| `--edge` | - | per start card | card ledge colour |
| `--wtop` | - | header bottom + 8 px (set by JS) | top of Writing/Colouring panels |

Everything else is hard-coded hex. Recurring unnamed values a token set should absorb:

| Role | Values |
|---|---|
| Secondary button (dark candy) | gradient `#41357c -> #332a66`, ledge `#1b1540` (used 5+ times) |
| Older flat secondary | `#2b2742`, `#3a2f72`, `#3a3459`, `#2c2460` |
| Primary candy (gold) | gradient `#ffdb6e -> #ffb21e`, ledge `#c77d00`, inset highlight `rgba(255,255,255,.55)` |
| Card surface | gradient `#2e2566 -> #241d52`, border `#ffffff12` |
| Lesson rail | gradient `#271f57 -> #211a4a`, border `#ffffff0d` |
| Night sky glows | `#3d2c8d`, `#4a35a8` (top-left), `#134a7c`, `#155f93` (bottom-right) |
| Success | `#5ee6a0`, `#3fc77a`, `#2fbf71`, `#8ee6b5` |
| Error | `#ff8a80` (text), red screen `#ff4d5e -> #c3102a`, ink `#e5484d` |
| Highlight yellow | `#ffe27a`, `#ffd23f`, `#ffd86b`, `#ffd166` |
| Hint lanes | tens `#4cc9ff`, ones `#ff5a7a` |
| Paper | `#fffdf5` with `#f1e7c9` / `#e8dcb8` edges |
| Confetti | `#ffd23f #ff5a7a #4cc9ff #5ee6a0 #b18cff #ff9f43` |
| Native window (behind the WebView) | `#14121F` (`MainActivity.java` line 90); launcher icon `#1E1B2E` tile, white keys, `#F5B841` bar (`res/drawable/ic_piano.xml`) |

### 4.2 Typography

- **Fredoka** (variable 300-700, Latin subset, bundled `assets/fonts/fredoka-latin.woff2`, OFL), fallback system-ui (lines 347-351). Works offline.
- Column sums and keypads: monospace stack `ui-monospace, "Roboto Mono", "Courier New"`, weight 800-900, tabular numbers.
- Hint arc labels: `900 24px system-ui` (line 233), not Fredoka.
- Gradient text: app title and start heading (`#ffd86b -> #ff8fb1 -> #8fd3ff`), "Yahoo! Correct!" (`#ffe07a -> #7dffb5 -> #8fd3ff`).

Type scale in use (px): 12, 13, 14, 15, 16, 17, 18, 20, 21, 22, 24, 26, 28, 30, 32, 34, 38, 44, 46, 48, 50, 54, 56, 58, 60, 70, 72, 76, 84, 96, 110; start screen uses `clamp()` with `vh`. Child-facing text is mostly 22-110 px; grown-up text 13-22 px.

### 4.3 Shape, depth and motion

- **Radii**: 999 px pills (header and primary buttons), 8/10/12/14/16 (small), 18/20/22/24/26/28 (cards, popups, buttons), 34 px (quiz card), 36 px (start cards), 50 % (round buttons, crayons).
- **"Candy" depth**: a solid ledge shadow under the button (`0 4-10px 0 <darker>`) plus an inset top highlight; on press the button moves down by the ledge height and the ledge shrinks to 1-3 px. This is the single most consistent pattern.
- **Soft shadows**: video `0 10px 30px #0008`; quiz card `0 16px 40px #0008`; start cards add `0 18px 30px #0007`.
- **Motion** (CSS keyframes): `pop` (scale .3 > 1.2 > 1), `float` (start cards bob 10 px, 3.2 s), `twinkle` (stars), `bob`/`spin` (card art), `pulse` (mic), `nudge` (digit wiggle), `hlost`/`hwon` (hearts), `wshake` (writing/colouring error shake), `cgo` (next-button pulse), `flash` (old red screen, now off), arc stroke draw (0.6 s), confetti (Web Animations, 1.7-3 s), model fade (0.6 s), menu switch slide (0.18 s). No `prefers-reduced-motion` handling.

### 4.4 Icons

Almost all icons are **emoji** in button labels (🎹 🎬 ⛶ ▢ 🏠 🔒 ▶ ◀ ✕ 🧠 💡 🔊 🎤 ⭐ ❤️ 🎉 ⏳ 🛑 ⏰ 🌙 👀 ✍️ 🎨 🖼️ ↶ ↺ and the 12 sound emojis), rendered by the tablet's emoji font, so they look like Huawei/Google emoji, not a drawn set. Exceptions: the grown-up menu rail uses 10 custom line icons (inline SVG, lines 595-604) and the start cards use drawn SVG illustrations.

### 4.5 Sounds (non-piano)

All made live with Web Audio, no files: right-answer chime (4 rising triangle notes, line 2686), mistake buzzer (82/87/123 Hz sawtooth, 0.9 s, line 2318), colouring "bonk" (sine 330 > 110 Hz, 0.25 s, line 3547). Speech: Android text-to-speech, British English voice first, rate 0.85 (questions) / 0.9 (feedback).

---

## 5. Content model

| Content | Source | Stored where |
|---|---|---|
| **Lesson videos** | One **YouTube playlist** chosen by the grown-up (the `PLAYLIST` constant, line 813), loaded live through YouTube's IFrame API; adding a video to the playlist adds a lesson. Titles and thumbnails come from YouTube. | **Not on the device**: streamed, needs Wi-Fi. YouTube may show an ad before a video. Nothing in the code plays local video files. |
| Piano sounds | Bundled MP3 samples `assets/sounds/{grand,warmpad,polysynth}/` + synths | APK, served by the WebView interceptor |
| Colouring pages | 36 public-domain PNGs `assets/colour/` + grown-up's own pictures | APK; own pictures in IndexedDB `colouring` on the tablet only |
| Writing items | Built-in letter shapes and UK Year 1-2 word lists in the page | page |
| Maths questions | Generated at random per level | page |
| Speech models | Vosk small EN/ES (~80 MB, not in git) | APK `assets/models/`, unpacked to private storage |

---

## 6. Technical architecture

### 6.1 Shell

- One Android `Activity` (`MainActivity.java`) containing one full-screen `WebView`. No Gradle: `build.sh` runs aapt2 > javac > d8 > zipalign > apksigner (Android SDK platform 34, build-tools 37, JDK 21). APK about 86 MB (speech models).
- The page `assets/index.html` (one file, ~4,400 lines: HTML + CSS + vanilla JS, no framework) is loaded with `loadDataWithBaseURL("https://pianolessons.home/", ...)` (line 175) so YouTube gets an https referrer.
- `shouldInterceptRequest` serves `sounds/`, `fonts/` and `colour/` from the APK assets (lines 124-139). YouTube's script (`https://www.youtube.com/iframe_api`, line 4373) and thumbnails come from the network.
- Lock-down: every navigation and popup is refused (lines 119-121, 154-156); long-press disabled; Back only leaves fullscreen; immersive sticky mode hides the system bars; `startLockTask()` pins the app on every resume (lines 179-185); `FLAG_KEEP_SCREEN_ON`. "Close the app" (PIN) calls `stopLockTask()` + `finishAndRemoveTask()`.
- `WebView.setWebContentsDebuggingEnabled(true)` (line 92): the grown-up's PC can read the logs over USB debugging.

### 6.2 JavaScript bridges (`addJavascriptInterface`)

| Bridge | Methods | Page callback |
|---|---|---|
| `Parent` | `hasPin()`, `setPin(pin)`, `checkPin(pin)`, `unlock()` | - |
| `Voice` | `voiceInit(lang)`, `voiceListen()`, `voiceStop()`, `voiceRelease()`, `ttsInit()`, `speak(text, lang, rate, id)`, `speakStop()` | `window.voiceEvent(type, arg)`: loading / ready / denied / error / tts / started / spoke / partial / final / timeout / listenError |
| `Eye` | `config(on, strict)`, `menu(open)`, `ask()`, `calibrate()`, `resetCal()`, `hasCal()` | `window.eyeEvent(type, arg)`: close / ok / state / cal |

Speech recognition: Vosk offline with a numbers grammar (`assets/grammar/<lang>.json`). Eye guard: Camera2 front camera + `android.media.FaceDetector`, about once a second, frames never saved (`EyeGuard.java`).

### 6.3 Audio: exactly how sound is played

**Everything is Web Audio inside the WebView.** There is no `<audio>` element, no HTML audio for notes, and **no Android SoundPool / AudioTrack / native audio**; the Java side never touches app sound (only TextToSpeech). Details in section 8.

### 6.4 Touch events used

| Where | Events |
|---|---|
| Piano keys | `pointerdown` / `pointermove` / `pointerup` / `pointercancel` / `pointerleave` on the keys container, `touch-action: none` |
| Writing pad, colouring pad | `pointerdown` / `pointermove` (with `getCoalescedEvents`) / `pointerup` / `pointercancel`, pointer capture, `touch-action: none`, palm rejection |
| Grown-up scrims | `pointerdown` (tap outside closes) |
| Everything else (header buttons, octave arrows, sound tiles, thumbnails, answer buttons, menu rows, keypad, cards) | `click` (`onclick`) |

No `touchstart` listeners anywhere.

### 6.5 Storage

- `localStorage` (WebView DOM storage), about 50 keys: settings (`instrument`, `soundSpace`, `keySens`, `loudMax`, `sndFix`, `playMode`, `bigMode`, `appMode`, `startMode`, `homeHide`, `voice*`, `quiz*`, `hint*`, `lockOn`, `limitMin`, `bedMin`, `earn*`, `eye*`, `colour*`, `writeTol`, `menuSec`), progress (`quizLevel`, `writeProg`, `colourProg`, `lastLesson`, `trickSeen`), logs (`quizLog` 500, `writeLog` 3000, `colourLog` 1000, `actLog` daily aggregates), lock state `guardState`.
- IndexedDB `colouring`: the grown-up's own pictures.
- SharedPreferences `parent` (PIN hash) and `eye` (calibration). `allowBackup="false"`.

### 6.6 Versions

v1.0 to v1.11 all dated 2026-10-25/26 (`CHANGELOG.md`); git tags exist only for v1.3 and v1.6.1 (no v1.11 tag). The later work (Writing levels 9-15, the Grown-ups menu redesign, Colouring and its memory game, the Play-along video fit) is still versionName 1.11 and is listed under 1.11 in the changelog. Tests: `node tests/pure.test.js` (explanations, hints, writing checker).

---

## 7. Known gaps and inconsistencies a designer should know

1. **Note names vs. lesson videos.** The keyboard labels every white key with its letter and only C keys with an octave number in scientific/MIDI style (C3 default left, **middle C = C4**), and black keys with **sharps only** (C#, D#, F#, G#, A#). Lesson videos may name notes differently (flats such as Bb/Eb, solfège, no octave numbers, or "C1, C2, C3" counted from the leftmost C of their own keyboard). The app's numbers are absolute, so after an octave shift the same physical key position reads a different number. The design should decide one naming system and how it maps to the videos.
2. **Keyboard range.** Only 25 keys (2 octaves). The octave position is not remembered (always C3-C5 at launch) and nothing shows the current octave except the small "C3" tags.
3. **Small octave arrows.** 30 px wide (they were 46 px before v1.11), muted, low contrast: hard for a 6-year-old to find; they react on `click`, not on touch-down like the keys.
4. **Pressed key feedback is colour only** (gold), no depth or motion; the key highlight comes after the sound by design.
5. **Loudness limit does not cover game sounds.** The quiz chime, buzzer and colouring bonk connect straight to `ac.destination` (lines 2315, 2323, 3553), bypassing the grown-up's 100/80/60 % limit, although the Menu note says it caps them.
6. **Activity "Favourite sound"** names only 5 of the 12 sounds (line 4238); the others show their internal id (e.g. "xylo", "808").
7. **Two token layers.** `:root` is defined twice; `--panel2` is unused; most colours are hard-coded hex (5 near-identical dark purples for secondary buttons). There is no spacing scale.
8. **Header buttons all use the class `lock`** (from the old "🔒 Close" button), so every pill in the top bar shares one style regardless of importance (Play along vs Menu vs Home).
9. **Mixed spelling and language.** "Maths" (British) in most child text but "Math time!" in Maths-only mode (line 2554), "📊 Math results" panel title (line 774) vs "Maths results" menu row. The grown-up menu, Activity and Results panels are English only even when the child UI is Spanish.
10. **Emoji icons** depend on the device font, so their style and colour cannot be controlled; the menu rail is the only drawn icon set.
11. **Font gaps.** Arc labels use system-ui; column sums use the system monospace, so digits change style between the question and the hints.
12. **Video content** is a streamed YouTube playlist, not videos stored on the device: no Wi-Fi = no lessons, and YouTube can still insert an ad. If the plan is private on-device videos, that is not built yet.
13. **Vibration** in colouring calls `navigator.vibrate(120)`; there is no native vibrate bridge, so whether the tablet buzzes depends on the WebView (not verified).
14. **No reduced-motion option** although there are many looping animations (floating cards, twinkling stars, pulsing buttons).
15. **Comments and README lag the code**: some say quiz levels 1-6 (there are 7), and the README's feature list still calls the grown-up button "🔒 Close" (it is "🔒 Menu").
16. **Unused/legacy styles** remain (old flat `.btn` and `.lock` colours, the old red `flash` animation) under the v1.11 overrides.

---

## 8. The on-screen piano: sound and touch, precisely (for the responsiveness fix)

All in `assets/index.html`.

**Audio graph** (`audio()`, lines 1352-1377). One `AudioContext` created lazily on the first touch:
```js
ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: "interactive" });
var vol = ctx.createGain(); vol.gain.value = 0.6 * loud / 100;
out = ctx.createGain(); out.gain.value = loud / 100;
var comp = ctx.createDynamicsCompressor(); vol.connect(comp); comp.connect(out); out.connect(ctx.destination); master = vol;
reverb = ctx.createConvolver(); reverb.buffer = roomImpulse(ctx, 2.6); wet = ctx.createGain();
vol.connect(reverb); reverb.connect(wet); wet.connect(comp);
```
Each note: source(s) > note gain > its own `StereoPanner` (created per note, line 1612) > `master` (vol) > DynamicsCompressor (+ a 2.6 s stereo ConvolverNode reverb in parallel, wet 0 / 0.22 / 0.42) > out gain > destination. `if (ctx.state === "suspended") ctx.resume();` runs on every touch (line 1375).

**Sampled notes** (`sampled`, lines 1455-1461): an `AudioBufferSourceNode` per note, `playbackRate = 2^((midi - sampleMidi)/12)`, started at `ac.currentTime` with an offset past the recording's leading silence (`onsetOf`, lines 1449-1454):
```js
g.gain.value = set.gain * vg(v); src.connect(g); g.connect(master); src.start(t, buf.onset || 0);
```
Samples are fetched with `fetch("sounds/<set>/<name>.mp3")` and decoded with `decodeAudioData` lazily: when Play along opens or the sound is chosen (`loadSet`, lines 1423-1441). Until a sample is decoded the key falls back to the "soft" synth (line 1610), so early notes can sound different.

**Synth notes** (`VOICE`, lines 1462-1593): Oscillator / PeriodicWave / FM / filters built per note at `ac.currentTime`, attack ramps of 2-20 ms. **noteOff** (lines 1637-1647): `cancelAndHoldAtTime` then `setTargetAtTime(0, t, rel/5)`, sources stopped after the release, panner disconnected later with `setTimeout`.

**Touch path**:
```js
// line 1732
keysEl.addEventListener("pointerdown", function (e) { e.preventDefault(); var t0 = performance.now(); audio();
  press(e.pointerId, keyAt(e.clientX, e.clientY), e, true); lag.push({ w: ..., t: ..., v: <video state> }); ... });
// line 1734
keysEl.addEventListener("pointermove", function (e) { if (e.pointerId in held) press(e.pointerId, keyAt(e.clientX, e.clientY), e, false); });
// lines 1735-1737
["pointerup", "pointercancel", "pointerleave"] -> release(e.pointerId)
```
- `keyAt` (line 1682) uses `document.elementFromPoint(x, y)` and walks up to the element with `data-m`.
- `press` (lines 1712-1727) releases the finger's previous key, counts fingers per note, then `noteOn(m, velocity(e, el, isDown))` **before** `el.classList.add("on")`, then `act.note(...)` (activity counter).
- `velocity` (lines 1696-1710) calls `getBoundingClientRect()` on the key and `console.log`s the first 40 touches.
- `noteOn` (lines 1595-1618) first calls `noteOff(midi, true)` (retrigger), handles robot glide, `loadSet`, creates the per-note panner, then the voice.
- `.keys-row { touch-action: none; }` (line 80). Released on `window.blur` and `visibilitychange`.
- **Lag log**: `window.pianoLag` keeps the last 60 touches: `w` = ms from the touch timestamp to the handler running, `t` = ms to after the sound was scheduled, `v` = YouTube player state (1 = playing) (lines 1730-1733). Readable from the PC over USB (`chrome://inspect`).

**Latency suspects visible in the code** (not measured here):
- First touch pays `AudioContext` creation, the 2.6 s reverb impulse generation and possibly an async `resume()`.
- A `DynamicsCompressorNode` sits on the whole output; Chromium's compressor has a built-in look-ahead delay (about 6 ms).
- `latencyHint: "interactive"` only; `ctx.baseLatency` / `outputLatency` are not logged, and Android WebView output latency through the system mixer is typically tens of ms.
- Per touch: a forced layout from `elementFromPoint` + `getBoundingClientRect`, a new `StereoPannerNode`, an extra `noteOff`, `console.log` for the first 40 touches, and the activity counter.
- The YouTube iframe is decoding video in the same WebView while he plays (the lag log records the player state for exactly this reason).
- Samples not yet decoded fall back to a synth; large sets decode on the main thread at Play-along start.
- Octave arrows and the sound picker use `click`, which fires only after the finger lifts.
