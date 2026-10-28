# Feature list and test record

One master checklist of every feature and behaviour of Piano Lessons that was asked for or shipped, from 1.0 (2026-10-25) to 1.35 (2026-10-28), grouped by area. The child is called "Sam" or "he" here; his real name, the PIN and the private songs never go in this repo.

## How to use this file

- **Every new feature gets a row BEFORE it is built.** Write it as one testable line: what it must do, in words a tester can check on the tablet. Status `idea` until it ships.
- **A row is ticked only after it passes on the tablet** (the Huawei MatePad, 1024 × 607 CSS px landscape), not in desktop Chrome. Fill `Tablet test` with the version and date, e.g. `✅ 1.35 2026-10-28`, or `❌ 1.35 2026-10-28: Close hidden under the quiz` (then open a bug in [BUG-HISTORY.md](BUG-HISTORY.md)).
- **Status:** `done` = shipped; `parked` = the operator parked it for later; `idea` = on the roadmap ([ROADMAP-2.0.md](ROADMAP-2.0.md), [CONCEPTS-TEACHING.md](CONCEPTS-TEACHING.md)), not built.
- **Since** = the version that first shipped it (or the version that last changed the rule, when the rule changed).

## How to run the tests

```bash
# 1. Pure logic (explanations, hint steps for every sum at every level). Runs on the PC.
node tests/pure.test.js

# 2. On the tablet (real WebView, real size). Find the app's WebView socket, forward it, run the checks.
adb shell cat /proc/net/unix | grep webview_devtools_remote          # gives webview_devtools_remote_<pid>
adb forward tcp:$(port get piano-player tablet-devtools) localabstract:webview_devtools_remote_<pid>
PIN=<grown-up pin> node tests/device-check.mjs $(port get piano-player tablet-devtools) [shots-dir]

# 3. One-off checks inside the running app (any JS expression, result as JSON).
node tools/tabjs.mjs $(port get piano-player tablet-devtools) "document.body.className"
```

- The PIN only comes from the environment, never from a file. Without it the Menu checks are skipped.
- `device-check.mjs` touches saved state: back up localStorage with `tools/tabjs.mjs` first and restore it after. Results go to `tests/device-results.json` (no personal data).
- Never pick a port by hand: always `port get piano-player tablet-devtools`.

---

## Start screen (SCR)

| ID | Feature (what it must do, testable, one line) | Since | Status | Tablet test |
|---|---|---|---|---|
| SCR-1 | The app opens on "Hi! What do you want to do?" with big drawn activity cards | 1.11 | done | – |
| SCR-2 | Five tiles: Piano lessons, Maths, Writing, Colouring, Bigger or smaller | 1.23 | done | – |
| SCR-3 | In landscape all five tiles sit in one row that fits the screen; in portrait they wrap to two rows; a too-narrow screen scrolls sideways, no tile is cut off | 1.23.1 | done | – |
| SCR-4 | 🏠 goes back to the start screen from any activity, but never shows during the maths quiz between lessons | 1.11 | done | – |
| SCR-5 | Menu → Start screen: he chooses / Piano lessons / Maths only / Writing only / Colouring only; a fixed mode opens straight in it and hides 🏠 | 1.11 | done | – |
| SCR-6 | The grown-up can hide any tile; at least one always stays | 1.11 | done | – |
| SCR-7 | Night-sky look, rounded Fredoka font (bundled, works offline), chunky press-down buttons | 1.11 | done | – |
| SCR-8 | Every screen fits the tablet with no page scroll (quiz, mistake screen, mini-lessons shrink to fit) | 1.11 | done | – |
| SCR-9 | Tiles show progress ("Lesson 3 of 12", "Level 2 · 14 stars") and a 1.5 s splash per activity (roadmap A9) | – | idea | – |
| SCR-10 | Drawn line icons instead of emoji on buttons (lock, clock, star, play, speaker…) (roadmap A11) | – | idea | – |
| SCR-11 | Six tiles: a 🎹 "Play the piano" tile opens the piano straight in Piano only (keyboard, Songs, Follow the keys); "Piano lessons" goes back to the video | 1.36 | done | ✅ 1.36 2026-10-28 |
| SCR-12 | With 6 tiles in landscape they sit in two rows of three that fit 1024×640, no sideways scroll | 1.36 | done | – |
| SCR-13 | Menu → Start screen can hide "Play the piano" like any tile; at least one always stays | 1.36 | done | – |

## Lessons and video (LES)

| ID | Feature (what it must do, testable, one line) | Since | Status | Tablet test |
|---|---|---|---|---|
| LES-1 | Plays only the lessons of one YouTube playlist; no links out, no search, Back cannot leave the app | 1.0 | done | – |
| LES-2 | The playlist loads live: a video added to it shows up the next time the app opens | 1.0 | done | – |
| LES-3 | The app asks to pin itself to the screen (screen pinning) | 1.0 | done | – |
| LES-4 | Lesson rail: numbered thumbnails, the current one ringed and scrolled into view; tap = play it | 1.0 | done | – |
| LES-5 | Back / Next buttons and "Lesson N of M" under the video; disabled at the ends | 1.0 | done | – |
| LES-6 | No YouTube title or "more like this" overlays at the start; a tap on the video pauses it and shows the app's own ▶ Play screen | 1.3 | done | – |
| LES-7 | Pause and end screens never show YouTube's "More videos"; at the end: Next lesson ▶ or Start again | 1.1 | done | – |
| LES-8 | Big video: hides the Back/Next row, shrinks the rail to a strip; remembered between launches | 1.2 | done | – |
| LES-9 | Normal view shows the whole 16:9 video; Big video and Play along fill the width, crop the top, so the video's keyboard sits right above our piano | 1.11 | done | – |
| LES-10 | Least-watched lessons first: the list is sorted by time watched, the app opens on the least-watched one, ✓n shows full watches; the order is fixed per app start | 1.26 | done | – |
| LES-11 | A phone held sideways keeps the lesson strip at the side | 1.11 | done | – |
| LES-12 | Lesson videos rendered in the app's own look (Piano only + falling notes), one song first | – | parked | – |

## Play along and Piano only (PLY)

| ID | Feature (what it must do, testable, one line) | Since | Status | Tablet test |
|---|---|---|---|---|
| PLY-1 | 🎹 Play along shows an on-screen piano under the video; multi-touch, two fingers can play two keys | 1.4 | done | – |
| PLY-2 | Video-volume slider (🎬) in Play along; outside it the video plays at full volume | 1.4 | done | – |
| PLY-3 | The piano runs the full width under the video and the lesson strip | 1.13 | done | – |
| PLY-4 | Play along and Big video are remembered between launches and can be on together | 1.4 | done | – |
| PLY-5 | 🎹 Piano only hides the video and the strip, makes the keyboard bigger, and every note flies up as a glowing bar (blue = left hand, orange = right) | 1.14 | done | – |
| PLY-6 | Slow down: mashing (6+ keys within 0.25 s, or 14+ far-apart mostly-new presses in 2.5 s) brings a tortoise over the keys for 5 / 15 / 30 s within 10 min | 1.27 | done | – |
| PLY-7 | Real playing never triggers Slow down: scales, trills, slides, chords, broken chords and two-hand tunes all pass | 1.27 | done | – |
| PLY-8 | Slow down starts only on the 3rd burst within 10 s; one burst or one palm slam is only counted | 1.28 | done | – |
| PLY-9 | Slow down only on the piano, never under a game, the Menu or a lock; Menu → Piano → Slow-down pause ON/OFF | 1.27 | done | – |
| PLY-10 | Big piano as the default play-along layout (keyboard edge to edge, about 58 % of the height) (roadmap A12) | – | idea | – |

## Piano engine and sounds (SND)

| ID | Feature (what it must do, testable, one line) | Since | Status | Tablet test |
|---|---|---|---|---|
| SND-1 | Grand piano from real Salamander recordings, works offline; also Soft piano, Music box, Electric piano, Organ | 1.6 | done | – |
| SND-2 | Native grand piano: C++ AAudio engine (exclusive MMAP), about 8 ms output; native touch read in 2–3 ms | 1.12 | done | – |
| SND-3 | The native engine sounds the same as the page (same pan, compressor, room echo), no clipping | 1.12 | done | – |
| SND-4 | The native touch layer handles only keys nothing covers; a touch on no key passes through to the page | 1.24 | done | – |
| SND-5 | Recorded sounds skip their silent start (5–22 ms) and the sound starts before the key lights up | 1.11 | done | – |
| SND-6 | Key sensitivity: louder near the key's bottom edge or with a bigger touch; Menu Off / Normal / Strong | 1.6.1 | done | – |
| SND-7 | Surround 🎧: low notes left, high notes right, room echo; 🔈 Off / 🏠 Room / 🏛️ Big hall (Room default) | 1.11 | done | – |
| SND-8 | Synths: Robot voice (glide), Synth lead, 808, Chiptune, pads; recorded Warm pad and Polysynth; Xylophone | 1.7.2 | done | – |
| SND-9 | Recorded library (MusyngKite, FluidR3), every sound's loudness matched to the grand piano; 84 sounds in all | 1.15 | done | – |
| SND-10 | Long instruments sustain while held; plucked ones ring out on their own | 1.15 | done | – |
| SND-11 | Bass row: 808 Boom, Punch, Growl, Slide (Slide plays one note at a time and glides) | 1.16 | done | – |
| SND-12 | Silent recordings are skipped and the nearest real note is stretched, so every sound plays on every key (Sci-fi included) | 1.16 | done | – |
| SND-13 | Freestyle and Dance synths | 1.19 | done | – |
| SND-14 | Animals row: real recordings (middle C = as recorded) and Web Audio animals; no fake recordings (the Cat is a real meow) | 1.20 | done | – |
| SND-15 | Sound picker: full screen, one row per group, all sounds on one tablet screen, ✕ closes; scrolls on a shorter phone screen | 1.20 | done | – |
| SND-16 | Drawn instrument icons (73), none repeat; animals keep their emoji | 1.21 | done | – |
| SND-17 | Sound names follow the child's language; after a language change every button keeps its own label | 1.21 | done | – |
| SND-18 | Menu → Piano: loudness limit 100 / 80 / 60 % | 1.11 | done | – |
| SND-19 | Menu → Piano: lock the sound choice (the sound button disappears) | 1.11 | done | – |
| SND-20 | Menu → Piano → Sounds he can choose from: hide/show any sound; the first 12 always stay (🔒); Show all / Only the first 12; a hidden current sound falls back to the grand piano | 1.27 | done | – |
| SND-21 | Every sound is free-licensed and credited (README, SOUNDS-AND-ENGINES.md); nothing from Synthesia or FL Studio | 1.15 | done | – |
| SND-22 | Game sounds (quiz chime, buzzer, colouring bonk) also obey the loudness limit (known gap) | – | idea | – |
| SND-23 | Decode sound sets lazily, cache decoded buffers, cap voices per set (roadmap B3) | – | idea | – |

## Key names and zoom (KEY)

| ID | Feature (what it must do, testable, one line) | Since | Status | Tablet test |
|---|---|---|---|---|
| KEY-1 | White keys show their letter names like the lessons; C keys show the octave tag | 1.4 | done | – |
| KEY-2 | Black keys are labelled too | 1.11 | done | – |
| KEY-3 | Octave shift arrows move the keyboard | 1.4 | done | – |
| KEY-4 | Zoom − / +: 1 to 4 octaves, keeping the middle; size and octave remembered; the octave tag shows at every size | 1.13 | done | – |
| KEY-5 | Menu → Piano can lock the key size | 1.13 | done | – |
| KEY-6 | Key names: Letters (C D E) / Do Re Mi / Both | 1.14 | done | – |
| KEY-7 | Black keys written as: Sharps / Flats / Like the videos (Db Eb F# Ab Bb) / Both | 1.14 | done | – |
| KEY-8 | Key names "Both (Do + C)": Do Re Mi big, the letter small under it; the octave tag moves up and never covers the name | 1.33 | done | – |

## Beat (BEA)

| ID | Feature (what it must do, testable, one line) | Since | Status | Tablet test |
|---|---|---|---|---|
| BEA-1 | 🥁 Beat in Piano only opens a panel: tempo by animal (🐢 60, 🚶 80, 🐇 100, 🐆 120) with − / + fine steps | 1.26 | done | – |
| BEA-2 | 2, 3 or 4 beats in a bar; click loudness 1–3; Start / Stop | 1.26 | done | – |
| BEA-3 | Big numbered dots light on every beat; beat 1 bigger, orange, higher click | 1.26 | done | – |
| BEA-4 | A note within 0.12 s of a click lights only that beat's ring green for a moment and counts 🎯 | 1.26 | done | – |
| BEA-5 | Clicks are booked on the audio clock and never drift | 1.26 | done | – |
| BEA-6 | The beat rests while a concept game or any cover is up, and stops when he leaves Piano only (home, maths, writing, colouring, Bigger or smaller) or the app goes to the background | 1.26 | done | – |
| BEA-7 | Beat settings remembered (`beatCfg`); diary event `beat` | 1.26 | done | – |

## Songs: Follow the keys (SNG)

| ID | Feature (what it must do, testable, one line) | Since | Status | Tablet test |
|---|---|---|---|---|
| SNG-1 | 🎵 Songs opens a song list; songs are read from the tablet's app storage only, never in the APK or repo; with none copied the list says so | 1.27 | done | – |
| SNG-2 | The song waits for him: the next key glows with a red dot, no timer, no penalty for being slow | 1.27 | done | – |
| SNG-3 | A wrong key just sounds and the wanted key flashes brighter | 1.27 | done | – |
| SNG-4 | Hand choice Both (default) / Right / Left; with one hand the other hand plays itself softly | 1.27 | done | – |
| SNG-5 | End: 1–3 stars from notes right first time, "Well done! You played <song>.", progress kept per song | 1.27 | done | – |
| SNG-6 | Leaving Piano only stops the song; no concept game opens while a song is on | 1.27 | done | – |
| SNG-7 | No lucky hits: a right key pressed while 3+ wrong keys went down in the last 1.5 s does not move the song on | 1.29 | done | – |
| SNG-8 | In the list one tap = listen (card glows), two quick taps (< 0.45 s) = play along; a slow second tap, another song, closing the list, changing tab or hand stops listening | 1.29 | done | – |
| SNG-9 | One tap in the list plays the whole song, not just 20 s | 1.30 | done | – |
| SNG-10 | Notes fall onto their keys as key-wide bars in hand colours with note names; 0.8× speed, about 2 s lead-in | 1.30 | done | – |
| SNG-11 | Wait mode: a note that reaches its key sits on the key line and pulses until pressed, then bursts; an early right key also counts | 1.30 | done | – |
| SNG-12 | Listen inside a song plays the whole song from his note until he presses any key (that key does not count); button shows ⏸ Pause | 1.30 | done | – |
| SNG-13 | While a song is on, his own notes don't fly up (only the glow under his fingers) | 1.30 | done | – |
| SNG-14 | Song bar (title, Listen, ✕) at the top with a fade under it; beat dots smaller under it | 1.30 | done | – |
| SNG-15 | A caught long note keeps flowing into its key for its full length | 1.31 | done | – |
| SNG-16 | ♡ on every card: a tap toggles favourite (red heart, pink edge) without playing; favourites first in every tab; saved (`songFav`) | 1.32 | done | – |
| SNG-17 | Card text fits: title 15 px, details 12 px, long words wrap, two-line titles grow the row; nothing runs over the card edge | 1.32 | done | – |
| SNG-18 | Five tabs that fit: Easy · Medium · Hard · 🎸 Modern music · 🎬 My lessons | 1.33 | done | – |
| SNG-19 | Modern music: the playlist songs (not Synthesia), level stars on the cards, easier first | 1.33 | done | – |
| SNG-20 | My lessons: the songs of his YouTube lesson videos, in lesson order; songs from his lessons also come first in the other tabs | 1.33 | done | – |
| SNG-21 | One keyboard for the whole song: set once at start to cover every note (up to 85 keys), never moves; his zoom comes back at the end | 1.34 | done | – |
| SNG-27 | Every song opens on its own sound (index.json `snd`: carols celesta, Bach harpsichord, Linkin Park rock guitar, lullabies music box…; else grand) | 1.36 | done | ✅ 1.36 2026-10-28 |
| SNG-28 | He can change the sound inside a song; that pick is remembered for that song only (songSnd); leaving the song gives his own sound back | 1.36 | done | ✅ 1.36 2026-10-28 |
| SNG-29 | The song falls at HIS speed: each finished step nudges the speed (0.45–1.5×) toward his pace; a long pause does not count | 1.36 | done | ✅ 1.36 2026-10-28 |
| SNG-30 | A right key pressed while its note is still falling counts at once and the song jumps there (no stop for a fluent player) | 1.36 | done | ✅ 1.36 2026-10-28 |
| SNG-31 | A chord counts once half its keys are down; the app plays the rest softly | 1.36 | done | – |
| SNG-32 | Pressing the note he just played again (in rhythm) is just a sound: no miss, never blocks the right key; a flurry = 3+ DIFFERENT wrong keys in 1.5 s | 1.36 | done | ✅ 1.36 2026-10-28 |
| SNG-33 | No sponsor/intro jingle in a song (Skoove screens): the first notes are the song itself | 1.36 | done | ✅ 1.36 2026-10-28 |
| SNG-34 | One version per song on the tablet (duplicates removed by the grown-up: drop.txt) | 1.36 | done | ✅ 1.36 2026-10-28 |
| SNG-22 | Song parts: split songs into 8–12-note parts with stars, then joined | – | parked | – |
| SNG-23 | Play in time: 50 / 75 / 100 % speed, unlocked after ⭐⭐ | – | parked | – |
| SNG-24 | A path / unlock order through the songs | – | parked | – |
| SNG-25 | A gentle daily goal | – | parked | – |
| SNG-26 | Re-level the songs made from audio | – | parked | – |

## Maths quiz (MTH)

| ID | Feature (what it must do, testable, one line) | Since | Status | Tablet test |
|---|---|---|---|---|
| MTH-1 | Quiz between lessons every 1–4 lessons (Menu); it catches Next, thumbnails and autoplay; the next lesson plays after 1–3 right answers; resumes if the app closed mid-quiz | 1.5 | done | – |
| MTH-2 | Picture sums and take-aways at the low levels; three big coloured answer buttons that press down | 1.5 | done | – |
| MTH-3 | Levels 1–7 (sums to 10 with pictures → two-digit with carry/trade); up after 5 right in a row, down after 3 wrong | 1.9 | done | – |
| MTH-4 | Top level 4; level 5 opens only after 100 right in a row with no hint (a hinted answer restarts the count); Menu shows "n of 100"; a grown-up can still raise it | 1.26 | done | – |
| MTH-5 | 2 s think time after the question is read before the buttons can be tapped | 1.6 | done | – |
| MTH-6 | Wrong answer: "Stop and think!" screen with the right answer, freeze 5 s (+5 s per mistake in a row, max 20 s), then a new question | 1.6 | done | – |
| MTH-7 | Menu → Mistake screen Dramatic (red, buzzer) / Calm (grey, no buzzer) | 1.8 | done | – |
| MTH-8 | Every question is read aloud slowly, 🔊 hears it again | 1.8 | done | – |
| MTH-9 | Spoken praise with the full sum, 5 variants, never the same twice in a row | 1.8 | done | – |
| MTH-10 | Explanations per level spoken and shown step by step; each step lights up and its arc is drawn while it is spoken; the screen waits for the voice | 1.11 | done | – |
| MTH-11 | Right answer: the ? turns into the green answer and stays ≥ 1.5 s after the voice; confetti and "🎉 Yahoo! Correct!" | 1.11 | done | – |
| MTH-12 | Four named tricks everywhere: 👆 Count on/back, 🔟 Make ten, 1️⃣ Ones first, 🧱 Tens and ones | 1.8 | done | – |
| MTH-13 | Hint arcs draw over the sum after 20 / 30 / 45 s (Menu, or OFF), one step at a time, spoken "Easy trick: …" | 1.9 | done | – |
| MTH-14 | Mini-lesson the first time a level is reached and from 🧠 Show me the trick; skippable | 1.8 | done | – |
| MTH-15 | Trick pictures in 4 steps that follow the words: number-line hops, two ten-frames, jump to the ten, ten-sticks and ones-cubes | 1.21 | done | – |
| MTH-16 | A hinted answer counts for level and review but not for the earn-minutes streak; log `hint` 1–3 | 1.8 | done | – |
| MTH-17 | Two-digit levels are written as column sums like on paper | 1.7 | done | – |
| MTH-18 | Level 7 has carry (59 + 27) and trade (84 − 39); level 6 stays carry-free | 1.9 | done | – |
| MTH-19 | Trade written like on paper: the tens digit crossed out, the new one small above it; the word is "trade", never "borrow" | 1.9 | done | – |
| MTH-20 | Column sums first wiggle the ones column ("Start with the ones"), then an animated column hint (A Magic numbers / B Blocks / C Do it with me) | 1.9 | done | – |
| MTH-21 | Hint test: styles take turns, Results shows success per style, a 🏆 winner after 20 answers each; Menu → Hint style | 1.9 | done | – |
| MTH-22 | Slip checker: the classic carry/trade slip is one of the answers and is named kindly when picked; log `sl` | 1.9 | done | – |
| MTH-23 | Voice quiz (Menu, off by default): he reads the sum and says the answer; offline Vosk, English or Spanish; nothing sent anywhere | 1.7 | done | – |
| MTH-24 | Voice quiz: not heard = no penalty, after 3 tries the buttons appear; the grown-up can see what it heard | 1.7 | done | – |
| MTH-25 | Voice quiz hears the whole sentence across pauses; judges a wrong-sounding answer only after 2.5 s of silence | 1.7.1 | done | – |
| MTH-26 | The microphone opens only after the question has been read; think time starts after the speech | 1.8 | done | – |
| MTH-27 | Hearts ❤️: a wrong answer breaks one (a too-fast guess breaks two); 5 right in a row (no hint) win one back; no hearts = break screen; Menu 3/5/7/10 | 1.10 | done | – |
| MTH-28 | Mistake lock: 5 mistakes in 30 min (a wrong tap within 1.5 s counts double) locks the app until a grown-up unlocks or a 15-min break ends; settings in Menu | 1.8 | done | – |
| MTH-29 | Missed questions come back after 2–3 right answers and once more after ~10, then count as mastered ("🔁 Let's try this one again!") | 1.8 | done | – |
| MTH-30 | Earn minutes: 5 right in a row = +5 min today (max 30), ⭐ streak meter; "Earn more time with maths" from the time-over screen; streak/minutes/max are settings | 1.8 | done | – |
| MTH-31 | Maths only mode: non-stop quiz, star count, level, level-up celebration; remembered after a restart; time counted separately | 1.7 | done | – |
| MTH-32 | Results panel (behind the PIN): today / all-time right and wrong, level, streak, practising list, last 20 mistakes, hint-test table | 1.6 | done | – |
| MTH-33 | Menu → Show a quiz now (its answers never earn minutes) | 1.8 | done | – |
| MTH-34 | Softer wrong-answer screen: tinted panel, "Not quite. Let's look together.", steps one by one, then Next question (roadmap A2) | – | idea | – |
| MTH-35 | Stop & think after 2 wrong in a row: 8-second breathing circle, then "I'm ready" (roadmap A3) | – | idea | – |
| MTH-36 | Welcome back after a grown-up unlock: "Back to my lesson" / "Easy warm-up sum" (roadmap A4) | – | idea | – |
| MTH-37 | Column sums typed on a keypad, ones first, tap the tens digit to trade (roadmap A5) | – | idea | – |
| MTH-38 | Multiply ×2 ×5 ×10 then ×3 ×4 with dot arrays (roadmap A6, levels 8–9) | – | idea | – |
| MTH-39 | Divide by sharing onto plates (roadmap A7, levels 10–11) | – | idea | – |
| MTH-40 | Maths path strip across the top with the current level marked (roadmap A8) | – | idea | – |
| MTH-41 | Quiz rules written down (`docs/QUIZ-RULES.md`) and a 500-answer simulator (`tools/quiz-sim.js`) (roadmap B6) | – | idea | – |
| MTH-90 | Opening Piano lessons never starts in a maths question: a quiz left pending is dropped; he plays 2–4 lessons first (Menu: "First question after", default 3) | 1.36 | done | – |
| MTH-91 | Review questions above the current level are never asked (a grown-up who lowers the level does not get the hard misses back) | 1.36 | done | – |

## Bigger or smaller (CMP)

| ID | Feature (what it must do, testable, one line) | Since | Status | Tablet test |
|---|---|---|---|---|
| CMP-1 | Bigger or smaller tile on the start screen; stage and stars kept on the tablet; time counts in the day's activity; diary `compare` | 1.23 | done | – |
| CMP-2 | Stage 1 · Items: two rows lined up one to one; tap the row with more / fewer, or "The same"; 4 right in a row moves on | 1.23 | done | – |
| CMP-3 | Stage 2 · Numbers to 20 with ten-frames; < = > buttons that also say smaller / the same / bigger; a slip shows a number line; 6 in a row moves on | 1.23 | done | – |
| CMP-4 | Stage 3 · Numbers to 99 with tens-sticks and ones-cubes, the classic traps (47/42, 36/63, 39/41), sometimes three to put in order | 1.23 | done | – |
| CMP-5 | The sign is taught by its shape (open side faces the bigger number), not the crocodile | 1.23 | done | – |
| CMP-6 | Every wrong answer says why in school words, starting with his name | 1.23 | done | – |
| CMP-7 | Mixed practice: question types interleaved, earlier stages reviewed, the same type never three times in a row | 1.24 | done | – |
| CMP-8 | "Tap the bigger / smaller number": two cards with the number and its picture | 1.24 | done | – |
| CMP-9 | Every row of things shows its count at the start | 1.25 | done | – |
| CMP-10 | Menu → Maths → Bigger or smaller: set the stage, or start again | 1.23 | done | – |

## Concept games (CON)

| ID | Feature (what it must do, testable, one line) | Since | Status | Tablet test |
|---|---|---|---|---|
| CON-1 | After some minutes of real playing (default 5), at a pause in his notes, a 2-question game opens, then "Back to the piano!" | 1.25 | done | – |
| CON-2 | 20 concept pairs in research order (bigger/smaller, louder/quieter … brighter/dimmer) | 1.25 | done | – |
| CON-3 | One word first (shown before it is asked, the right one glows), then the other, then mixed; learned only after two different days | 1.25 | done | – |
| CON-4 | Learned concepts come back after 1, 2, 4, 7, 14 days; a miss steps back one gap | 1.25 | done | – |
| CON-5 | A new picture every question; two concepts in play; never the same concept twice in a row | 1.25 | done | – |
| CON-6 | Sound questions play real notes on his current piano sound | 1.25 | done | – |
| CON-7 | A movement break every 4th game (hands up high, touch the floor, clap) | 1.25 | done | – |
| CON-8 | At most 4 games an hour, 5 min apart; two misses end the game kindly; a fast right answer gets ⚡ | 1.25 | done | – |
| CON-9 | Also at a break in Colouring and in Bigger or smaller | 1.25 | done | – |
| CON-10 | Never opens over the Menu, quiz, mistake screen, sound picker, eye cover or a lock; closes quietly if a lock or the eye cover comes | 1.26 | done | – |
| CON-11 | Menu → Maths → Quick concept games: how often, how many questions, other activities, move breaks, try one now, start again | 1.25 | done | – |
| CON-12 | 3-picture checks once learned; counting sets; sound questions from his own song; the rest of the 127-pair map | – | idea | – |
| CON-90 | Piano breaks (lessons and Play along) are a coin toss: a maths question or a concept game; colouring and writing no longer get concept pop-ups | 1.36 | done | – |
| CON-91 | Every concept drawn by the research 08 drawing-spec (one dimension, a named anchor, depth by overlap+height+size, mine/yours said by a visible mascot) | 1.37 | partly | – |
| CON-92 | New concepts: near/far from you (road from his feet), yours/mine (the owl says "mine" in a speech bubble), his/hers (boy/girl, identical items); later whose?, ours/theirs, dark/light room | 1.37 | done | ✅ 1.37 2026-10-28 |
| CON-93 | The 5 flawed pictures fixed: between = 4 named animals, answer moves; in front/behind a house with a door (behind peeks out); brighter = same lamp both on; heavier = identical boxes, only the tilt; hot/cold = same mug, steam vs ice | 1.37 | done | ✅ 1.37 2026-10-28 |

## Writing (WRT)

| ID | Feature (what it must do, testable, one line) | Since | Status | Tablet test |
|---|---|---|---|---|
| WRT-1 | ✍️ Writing on UK school lines (top, dashed middle, red base line, tail line), British English | 1.11 | done | – |
| WRT-2 | Levels 1–8: letter families (curly caterpillar, long ladder, one-armed robot, zigzag), capitals, numbers, Year 1 and Year 2 tricky words | 1.11 | done | – |
| WRT-3 | Levels 9–15: days and months, word endings, apostrophes, listen-and-write Y1 / Y2 words, short sentences, listen-and-write sentences | 1.11 | done | – |
| WRT-4 | Each letter: a pen shows how → trace a thick guide → dotted line → on his own; words: dotted → on his own | 1.11 | done | – |
| WRT-5 | Every stroke checked in order: start at the green dot, follow the line; a miss flashes red and shakes the pad | 1.11 | done | – |
| WRT-6 | Finger or pen; pen pressure thickens the line; a resting palm is ignored while the pen is in use | 1.11 | done | – |
| WRT-7 | Listen-and-write hides the word: 🔊 again, two misses show the dotted line for that stroke, 👀 Show me writes it (logged as help) | 1.11 | done | – |
| WRT-8 | School words are always spoken in English | 1.11 | done | – |
| WRT-9 | Menu: Writing level 1–15; Letter check Gentle / Normal / Strict | 1.11 | done | – |
| WRT-10 | Watch → Trace → Dotted → On my own ladder with a numbered start dot and arrow (roadmap A14) | – | idea | – |
| WRT-11 | Calligraphy activity: wide nib, slant guides, three inks (roadmap A13) | – | idea | – |

## Colouring (COL)

| ID | Feature (what it must do, testable, one line) | Since | Status | Tablet test |
|---|---|---|---|---|
| COL-1 | 36 public-domain colouring pages from easy to hard, credited in `assets/colour/SOURCES.md` | 1.11 | done | – |
| COL-2 | The crayon paints only inside the shape where the stroke started | 1.11 | done | – |
| COL-3 | Over the line: picture shakes, lines flash red, soft bonk, short buzz, spoken warning | 1.11 | done | – |
| COL-4 | Spoken warnings vary by kind of slip and never repeat back to back | 1.11 | done | – |
| COL-5 | Done at about 85 % coloured; stars from crossings (0–1 ★★★, ≤ 4 ★★, more ★); finishing opens the next picture | 1.11 | done | – |
| COL-6 | 12 crayons, ↶ undo, 🖼️ gallery with stars and locks; the crayon gets thinner as pictures get harder | 1.11 | done | – |
| COL-7 | Over-the-line limit (Menu 6 / 10 / 15 / never): the picture stops, sad face, 1-min rest, then Try again | 1.11 | done | – |
| COL-8 | Memory game (on by default): the coloured model shows, fades, he colours from memory; 👀 peek twice; 3 → 8 colours; he hears how many he remembered | 1.11 | done | – |
| COL-9 | A strange colour for a part (black beak) gets one kind spoken hint per shape | 1.11 | done | – |
| COL-10 | Pen pressure and palm rejection as in Writing | 1.11 | done | – |
| COL-11 | Menu → Add a colouring picture from the tablet (stays on the tablet); Remove my own pictures | 1.11 | done | – |
| COL-12 | Menu: quiet mode (no shake or buzz), All pictures open, look time Short / Normal / Long | 1.11 | done | – |
| COL-13 | Crayons in a 4×3 grid, "Done at 85 %" progress bar, gallery strip (roadmap A15) | – | idea | – |
| COL-14 | ▶ Next picks a RANDOM open picture he has not coloured yet (all coloured: any other open one); each new picture finished opens one more | 1.36 | done | – |
| COL-15 | 37 built-in pictures (polar bear added); more CC0 line art from Wikimedia Commons | 1.36 | partly | – |

## Eye guard (EYE)

| ID | Feature (what it must do, testable, one line) | Since | Status | Tablet test |
|---|---|---|---|---|
| EYE-1 | The front camera checks his distance about once a second; two "too close" looks cover the screen, pause the video and hold the quiz clocks | 1.7.1 | done | – |
| EYE-2 | The cover lifts after 2 s at a good distance; no face seen = nothing happens | 1.7.1 | done | – |
| EYE-3 | On-device only: frames examined in memory, nothing saved or sent; camera off while the Menu is open and in the background | 1.7.1 | done | – |
| EYE-4 | Menu: Eye guard ON/OFF, sensitivity Normal / Strict, Calibrate distance (7 s), Use the automatic distance | 1.7.1 | done | – |
| EYE-5 | "Move back a little!" spoken (with his name) | 1.22 | done | – |
| EYE-6 | Activity counts "too close" times per day; diary `too_close` | 1.7.1 | done | – |

## Screen time and bedtime (TIM)

| ID | Feature (what it must do, testable, one line) | Since | Status | Tablet test |
|---|---|---|---|---|
| TIM-1 | Daily screen time limit, default 60 min (Off / 30 / 45 / 60 / 90 / 120) | 1.8 | done | – |
| TIM-2 | A banner and a spoken warning at 5 minutes left | 1.8 | done | – |
| TIM-3 | At the limit the lock screen comes: video paused and muted, piano, quiz and camera stopped, only Menu (and Close) work | 1.8 | done | – |
| TIM-4 | Menu → Today: + 15 min, + 30 min, No limit today | 1.8 | done | – |
| TIM-5 | Locks survive a restart; setting the tablet clock back gives no time back; the day resets at local midnight | 1.8 | done | – |
| TIM-6 | "Unlock now" on a used-up screen-time lock adds 15 minutes (the button says so) and stays unlocked | 1.21 | done | – |
| TIM-7 | Bedtime 19:00–21:00 (Menu), locked until 07:00; a grown-up unlock holds until the morning | 1.11 | done | – |
| TIM-8 | Lock rules written as a state machine (`docs/LOCKS.md`) and tested with a fake clock (roadmap B5) | – | idea | – |

## Grown-ups Menu, PIN and Close (MNU)

| ID | Feature (what it must do, testable, one line) | Since | Status | Tablet test |
|---|---|---|---|---|
| MNU-1 | 4-digit grown-up PIN, created on first use and typed twice; only a SHA-256 hash is stored in app-private storage | 1.1 | done | – |
| MNU-2 | 3 wrong PINs = 1 minute wait (Menu and Close count together) | 1.1 | done | – |
| MNU-3 | 🔒 Menu asks the PIN every time; relocks on close, in the background, after 60 s idle, or on a tap outside | 1.7 | done | – |
| MNU-4 | The keypad reacts on touch-down; the 4th right digit opens the Menu within ~30 ms; no OK button | 1.27 | done | – |
| MNU-5 | Full-screen settings sheet: sections Today · Start screen · Piano · Maths · Writing · Colouring · Voice & language · Screen time · Eye guard · General; switches; last section remembered | 1.11 | done | – |
| MNU-6 | The grown-up Menu, Activity and Results stay in English | 1.11 | done | – |
| MNU-7 | Menu → Today: status, Unlock now, Break 15 min then unlock, + 15 / + 30 min, No limit today | 1.11 | done | – |
| MNU-8 | Menu → Close the app | 1.1 | done | – |
| MNU-9 | ✕ Close next to Menu: PIN screen says "Close the app", the right PIN closes the app at once | 1.28 | done | – |
| MNU-10 | Menu and Close stay tappable at the top right above every full-screen kid layer (maths quiz, concept game, calm screen); the PIN pad still opens over them | 1.35 | done | – |
| MNU-11 | Maths-only mode shows ✕ Close too | 1.35 | done | – |
| MNU-12 | No overlapping screens: one `coverOn()` check (Menu, quiz, mistake screen, sound picker, eye cover, lock) decides what may open | 1.26 | done | – |
| MNU-13 | Menu → General → Change PIN | 1.11 | done | – |
| MNU-14 | Activity panel: Today / 7 days / Lessons / Quiz tabs, 7-day chart, locks and earned minutes; "Clear" needs two taps | 1.6.1 | done | – |
| MNU-15 | Readable Activity: minutes against the limit, status per practised sum (roadmap A10) | – | idea | – |
| MNU-16 | UX exits pass: what Back / Home do on every screen, what he can reach without the PIN, consistent button order (roadmap B7) | – | idea | – |

## Language, voice and messages with his name (LNG)

| ID | Feature (what it must do, testable, one line) | Since | Status | Tablet test |
|---|---|---|---|---|
| LNG-1 | Menu → Language English / Español: everything the child sees and hears follows it | 1.11 | done | – |
| LNG-2 | Read questions aloud and Spoken feedback are separate ON/OFF settings, independent of the voice quiz | 1.8 | done | – |
| LNG-3 | British English ("Maths", "Mum") and a British voice when the tablet has one | 1.11 | done | – |
| LNG-4 | Works with the SherpaTTS voice engine; the Menu says when no voice is installed | 1.10 | done | – |
| LNG-5 | Speech never freezes a screen: a cut-off voice always lets the screen move on; mini-lesson steps are not cut off | 1.10 | done | – |
| LNG-6 | Speech is slower; explanation steps have short pauses between them | 1.11 | done | – |
| LNG-7 | Menu → Voice & language → Child's name: corrections and tips start with the name and a real ~0.5 s pause ("Oye …" in Spanish); empty name = no change | 1.22 | done | – |
| LNG-8 | The name is stored on the tablet only, never in the app's files or this repo | 1.22 | done | – |
| LNG-9 | The name saves with ✓ Save and on every key typed; saving says it once | 1.26 | done | – |
| LNG-10 | Name-call variety: a context-aware opener pool (correction / tip / praise / safety / time), no repeats, the name only sometimes and never twice in a row; Spanish too | – | parked | – |

## Logs and records (LOG)

| ID | Feature (what it must do, testable, one line) | Since | Status | Tablet test |
|---|---|---|---|---|
| LOG-1 | Every maths answer recorded (question, answer, level, time, voice, hint, slip) | 1.6 | done | – |
| LOG-2 | Activity log: screen time per day, most-watched lessons, play-along time, favourite sound, quiz summary | 1.6.1 | done | – |
| LOG-3 | Permanent diary `events-YYYY-MM.jsonl`: every event as it happens, never trimmed or deleted by the app | 1.18 | done | – |
| LOG-4 | `snap-YYYY-MM-DD.json` snapshot of all in-app records every minute and on background; one per day | 1.18 | done | – |
| LOG-5 | Menu clear/reset buttons clear only the in-app copy, after taking a snapshot | 1.18 | done | – |
| LOG-6 | Every event kind is listed in `docs/LOGS.md` (quiz, write, colour, compare, concept, song*, song_fav, mash, beat, lock, earn, too_close…) | 1.18 | done | – |
| LOG-7 | The grown-up's PC can read the logs over USB (adb); nothing goes over the network | 1.11 | done | – |

## Build and tests (BLD)

| ID | Feature (what it must do, testable, one line) | Since | Status | Tablet test |
|---|---|---|---|---|
| BLD-1 | `bash build.sh` builds the APK with no Android Studio or Gradle; `install` puts it on every adb device | 1.0 | done | – |
| BLD-2 | `bash build.sh release <ver>` tags and publishes the APK with that version's CHANGELOG section as notes; no push without sign-off | 1.3 | done | – |
| BLD-3 | CHANGELOG entry for every version | 1.6 | done | – |
| BLD-4 | Signed with the same keystore; keystore, voice models, songs and the PIN never in git | 1.0 | done | – |
| BLD-5 | The WebView serves `sounds/`, `fonts/`, `colour/`, `js/` (and private `songs/`, JSON only) to the page | 1.21 | done | – |
| BLD-6 | `node tests/pure.test.js` checks explanations and hint steps for every sum at every level | 1.8 | done | – |
| BLD-7 | `tools/tabjs.mjs` runs JS inside the app on the tablet; `tests/device-check.mjs` checks the screens on the device | 1.35 | done | – |
| BLD-8 | Song keyboard check over all songs: 0 jumps, every note has a key | 1.34 | done | – |
| BLD-9 | Public repo uses a neutral example name ("Sam") everywhere | 1.22 | done | – |
| BLD-10 | Split `assets/index.html` into modules (roadmap B1) | – | idea | – |
| BLD-11 | Smoothness: one animation loop, no fighting timers, measured on the tablet (roadmap B2) | – | idea | – |
| BLD-12 | One `store` module over localStorage with a key registry and migrations (roadmap B4) | – | idea | – |
| BLD-13 | `build.sh` checks HTML syntax and `icons.js` freshness, one version source, APK size in the changelog (roadmap B8) | – | idea | – |
| BLD-14 | Device check screenshots every screen and compares with the last run (roadmap B9) | – | idea | – |
| BLD-15 | Code tidy: module shape, no stray globals, remove the losing column-hint styles (roadmap B10) | – | idea | – |
| BLD-16 | Install on the Samsung S22 | – | parked | – |
| BLD-17 | Close the research gaps listed in `research/APPLIED.md` | – | parked | – |

---

## Parked & ideas

**Parked by the operator** (order from the operator, 2026-10-27/28):
1. SNG-22 Song parts (8–12 notes, stars, then joined)
2. SNG-23 Play in time (50 / 75 / 100 %, after ⭐⭐)
3. SNG-24 A path / unlock order through the songs
4. SNG-25 A gentle daily goal
5. LNG-10 Name-call variety (no repeated "Hey <name>")
6. LES-12 Lesson videos in the app's own look
7. SNG-26 Re-level the songs made from audio
8. BLD-16 S22 install
9. BLD-17 Research gaps (`research/APPLIED.md`)

Items 1–4 are inspired by Yousician's design only; never take their licensed songs.

**Ideas (roadmap, not built):** SCR-9, SCR-10, PLY-10, SND-22, SND-23, MTH-34 … MTH-41, CON-12, WRT-10, WRT-11, COL-13, TIM-8, MNU-15, MNU-16, BLD-10 … BLD-15.

## UX review ideas (2026-10-28, agent review of the whole app; not built yet)

| ID | Feature (what it must do, testable, one line) | Since | Status | Tablet test |
|---|---|---|---|---|
| UX-1 | One quiet 🔒 grown-up button (long-press to close) instead of Menu + Close | – | idea | – |
| UX-2 | Lesson top bar cut to 3–4 controls | – | idea | – |
| UX-3 | Every label spoken (start greeting, card names, 🔊 replay everywhere) | – | idea | – |
| UX-4 | One predictable interruption pattern: "coming up" card, then a "back to piano" card | – | idea | – |
| UX-5 | Calm screen as the default mistake screen; freeze capped at 10 s; hearts OR lock, not both | – | idea | – |
| UX-6 | Quiz cleanup: one meter, coloured think-ring, no columns for one-digit sums | – | idea | – |
| UX-7 | 🏠 fixed top-left on every screen; Menu "Back" wording | – | idea | – |
| UX-8 | Kid-readable break screen (sand timer, spoken) | – | idea | – |
| UX-9 | Sound picker: 12 big spoken tiles by default; Surround moves to the Menu | – | idea | – |
| UX-10 | One star currency; progress shown on the start tiles | – | idea | – |
| UX-11 | Menu restructure + first-run setup (name, language, time, start screen) | – | idea | – |
| UX-12 | Same words everywhere ("Maths"; the Compare header) | – | idea | – |
| UX-13 | Never an empty pad on Writing/Colouring open | – | idea | – |
