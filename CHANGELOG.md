# Changelog — Piano Lessons

Every version, newest first. Each released version has a download on the
[Releases page](https://github.com/dxxx/piano-lessons-app/releases).
`bash build.sh release <version>` publishes the APK with that version's section below as its notes.

## 1.31 — 2026-10-27
- **Songs: long notes stay their full length.** A note he has caught no longer vanishes at once: its bar keeps flowing down into the key until its time is up, so a long note shows as long (it vanished the moment he pressed it).

## 1.30 — 2026-10-27
- **Songs: the notes fall onto the keys** (instead of a row of note tiles). The same glowing bars as Piano only, in the same hand colours with the note name on each, now fall from the top onto their keys, exactly key-wide. When a note reaches its key **the song waits there**: the bar sits on the key line and pulses, the key glows with its red dot, until he presses it; then it bursts and the song falls on (Synthesia's wait mode). Pressing the right key early also counts. Notes fall at 0.8× the song's speed; the first ones start about 2 s above. The keyboard moves to fit the next few notes, so it shifts less often. While a song is on, the notes he plays don't rise (only the glow under his fingers). The song bar (title, Listen, ✕) moved to the top, with a fade under it; the beat dots sit smaller under it.
- **Listen plays the whole song**, from the note he is on, with the notes falling in real time and bursting on the keys, **until he presses any key**: that key is the pause signal (it does not count as a note), and the song waits again at the note he was on, which falls back in. The button shows ⏸ Pause while it plays (tap to stop too).
- **One tap in the song list plays the whole song** (not just the first 20 s); a slow second tap, another song or closing the list stops it.

## 1.29 — 2026-10-27
- **Songs: listen first.** In the song list, **one tap plays the start of the song** (up to 20 s, both hands) so you can hear it before choosing; the card glows while it plays. **Two quick taps** (within 0.45 s) pick the song and he plays along. Tapping another song switches the listening; a slow second tap on the playing song stops it; closing the list, changing tab or hand, or starting a song stops it too. A line under the tabs says "Tap a song once to listen. Tap it twice to play it yourself."
- **No lucky hits in Songs.** Banging keys no longer plays the song for him: a right key pressed while 3 or more wrong keys went down in the last 1.5 s does not move the song on (it counts as a miss and the right key flashes). One calm press of the right key does; a single slip before the right key is fine.

## 1.28 — 2026-10-27
- **✕ Close next to Menu.** A quick way for a grown-up to close the app: tap ✕ Close in the top bar, type the PIN, and the app closes at once (the same as Menu → Close the app, without opening the Menu). The PIN screen says "Close the app" so it is clear what will happen. Wrong PINs count the same as for the Menu (3 wrong = 1 minute wait).
- **Slow down is 3× more forgiving** ("a little fun is OK"): one burst of mashing or a palm slam is only counted; the tortoise pause comes on the **3rd burst within 10 seconds** (mashing kept up three times as long). The pauses stay 5 / 15 / 30 s. Diary `mash` now logs `bursts`.

## 1.27 — 2026-10-27
- **🎵 Songs: Follow the keys.** A new way to learn, the reverse of the video lessons: he picks a song he knows and plays it note by note. The next note glows on its key (with a red dot) and sits first in a row of note tiles; **the song waits for him**, with no timer and no penalty for being slow (Synthesia's "Melody practice"). A wrong key just sounds and the right key flashes brighter. The keyboard moves to show the notes he needs and goes back to his own octave at the end. Both hands by default (Synthesia's beginner songs share the tune between the hands), or right / left only, where the other hand plays itself softly when he moves on. **Listen** plays the next few notes for him. At the end: 1–3 stars from how many notes were right first time, "Well done! You played <song>.", progress remembered per song. Songs from his video lessons are listed first; Easy / Medium / Hard tabs. Diary events `song_start`, `song`, `song_stop`. See [docs/FOLLOW-THE-KEYS.md](docs/FOLLOW-THE-KEYS.md).
  - The songs are **not in the app or this repo** (they are pop songs): a grown-up copies them from the computer to the tablet's app storage (`Android/data/md.home.pianolessons/files/songs/`); the app reads them from there. With none copied, the list says so.
- **Choose which sounds he can use** (Menu → Piano → Sounds he can choose from). Tap the line to open every sound by group: tap a sound to hide or show it, or **Show all** / **Only the first 12**. The first 12 sounds (the set before the big library of 1.15: grand, soft and electric piano, organ, music box, robot voice, synth lead, 808 bass, chiptune, warm pad, polysynth, xylophone) are always there, marked 🔒. Hidden sounds disappear from his sound picker (a group with none left disappears whole); if he was on one, the grand piano comes back. Saved as `sndHide`.
- **Slow down.** Random key mashing gets a short calm pause: "Hey <name>, slow down. If you want to play, play. If you don't, take a little pause." and a tortoise covers the keys for 5 s, then 15 s, then 30 s if it happens again within 10 minutes (10 calm minutes start it over). It counts as mashing when 6+ different keys go down within a quarter of a second (a fist or a palm), or 14+ presses in 2.5 s on keys that are mostly new and jump far apart. Real playing does not set it off: scales, trills, slides, chords, broken chords and two-hand tunes were all tested and pass. Only on the piano, never under a game, the Menu or a lock. Menu → Piano → Slow-down pause: ON / OFF. Diary event `mash`.
- **PIN** opens the Menu 30 ms after the 4th digit (a frame callback could wait in the background).

## 1.26 — 2026-10-27
- **Beat (metronome) in Piano only.** A 🥁 Beat button opens a panel: how fast by animal (🐢 60, 🚶 80, 🐇 100, 🐆 120 beats a minute) with − / + for fine steps, 2, 3 or 4 beats in a bar, click loudness 1–3, Start / Stop. While it runs, big numbered dots light on every beat (beat 1 bigger and orange, with a higher click); a note played on the beat lights its dot green and counts 🎯. The clicks are timed on the audio clock, so they stay steady. It rests while a quick concept game is open and stops when Piano only closes. Settings remembered; diary event `beat`. Details in [docs/SOUNDS-AND-ENGINES.md](docs/SOUNDS-AND-ENGINES.md#metronome-126).
- **Least-watched lessons first.** The lesson list is sorted by how long he has watched each lesson: the ones he has seen most go to the end, the ones he has seen least come first, and the app opens on the least-watched one. Numbers, "Lesson N of M", Back / Next and "Lesson N is next" follow the new order. A small ✓n shows how many times a lesson was watched to the end. The order is set when the app starts, so the list does not jump while he is using it.
- **Maths top level is now 4** (level 5 was still hard). Level 5 opens only after **100 right in a row with no hint** at level 4: a wrong answer, or a right answer after a hint or a trick, starts the count again. A saved level 5 comes back to 4 once (`quizCapV`). The Menu shows "level 5 opens after 100 right in a row with no hint: n of 100". A grown-up who sets a higher level in the Menu still raises the top.
- **The child's name now saves for sure.** Menu → Voice & language → Child's name has a green **✓ Save** button, and the name is also kept on every key typed (before, it saved only when the field lost focus; closing the Menu first lost it, so the voice never said the name). Saving says it once: "Hey <name>, this is how I will say your name." Corrections and tips (maths explanations and hints, writing and colouring, Bigger or smaller, concept games, the eye guard, "5 minutes left") then start with "Hey <name>,".
- **PIN reacts at once**: the keypad reacts on touch-down and the 4th right digit opens the Menu on the next frame (was 150 ms after the finger lifted). There is no OK button to press.
- **No overlapping screens**: one check `coverOn()` (Menu, maths quiz, red screen, sound picker, eye-guard cover, time lock). A concept game never opens on top of these; if a time lock or the eye cover comes while a game is open, the game closes quietly. The metronome rests while any of them is up. The native piano-key layer now re-checks at once when the sound picker, quiz, red screen, concept game, eye cover or lock screen opens or closes (before, only the Menu and body changes did; the rest waited up to 0.4 s).
- **Beat fixes from the tablet test drive**: the green "on the beat" ring now flashes on the beat he hit for a moment (it stayed on every dot before), and the beat stops clicking when he leaves Piano only for the home screen, maths, writing, colouring or Bigger or smaller (the body keeps `solo` under those screens).

## 1.25 — 2026-10-27
- **Quick concept games while he plays.** After some minutes of real piano playing (default 5), at a pause in his notes, a short game opens: 2 questions, then "Back to the piano!" They teach 20 basic concepts in a research-based order: bigger/smaller, louder/quieter, longer/shorter, higher/lower notes, taller, full/empty, heavier/lighter (see-saw), closer/further, above/below, inside/outside, in front/behind, between, first/last, faster/slower, long/short notes, thicker/thinner, wider/narrower, hot/cold, darker/lighter colour, brighter/dimmer. See [docs/CONCEPTS-TEACHING.md](docs/CONCEPTS-TEACHING.md).
  - One word of a pair first, shown before it is asked (the right one glows), then the other word, then both mixed; learned only after two different days; learned ones come back after 1, 2, 4, 7, 14 days. A new picture every question; two concepts in play at once.
  - Sound questions play real notes on his piano sound. A movement break every 4th game (hands up high, touch the floor, clap in front of you). At most 4 games an hour; two misses end the game kindly. Fast right answers get a ⚡.
  - Also at a break in Colouring and in Bigger or smaller. Menu → Maths → Quick concept games: how often, how many questions, other activities, move breaks, try one now, start again. Diary event `concept`.
- **Research folder** [research/](research/INDEX.md): seven files (basic concepts, attention and focus, learning science, concepts in pictures, kids' app design, music concepts, UK curriculum map with 127 concept pairs), about 200 sources, with an index by question.
- **Maths level ceiling**: level 5 is the top for now (level 7 was too hard). Level 6 opens only after 100 right first time in a row at level 5 (a wrong answer starts the count again); the same for 7 after that. A saved level above the ceiling comes down to it. Menu → Maths → Level shows the count.
- **Bigger or smaller**: every row of things shows its number at the start.

## 1.24 — 2026-10-27
- **Fix: piano notes sounding from other screens.** With the grand piano, the app lays a native touch layer over the keys for fast response. It stayed active under the home screen, Colouring, Bigger or smaller and the grown-ups' Menu, so drawing or tapping settings over where the keys sit played notes. Now each key is handed to the native layer only while nothing covers it (checked at the key's own spot, again at once when a screen or the Menu opens), and a touch that lands on no key passes through to the page.
- **Bigger or smaller is mixed, never blocked**: every stage now interleaves question types and reviews earlier stages, and the same type never comes three times in a row.
  - Stage 1: rows of things (75 %), plus "tap the bigger/smaller number" to 10 with ten-frames.
  - Stage 2: signs to 20, tap the bigger/smaller number, rows, put three in order.
  - Stage 3: signs to 99, tap the bigger/smaller with tens and ones, order, and review of signs to 20 and rows.
  - New question type "Tap the bigger number" / "Tap the smaller number": two cards with the number and its picture. Diary `compare` events now carry `t` (rows, pick, sign, order).

## 1.23.1 — 2026-10-27
- **Home fits all five tiles**: in landscape the five activities sit in one row that fits the screen (they ran off both edges in 1.23); in portrait they wrap to two rows. A screen too narrow for them scrolls sideways instead of cutting tiles off.

## 1.23 — 2026-10-27
- **New home tile: Bigger or smaller** (the 4th activity next to piano, maths and colouring). Teaches more / fewer / the same and the < = > signs the way UK schools do in Year 1–2 (see [docs/COMPARE-TEACHING.md](docs/COMPARE-TEACHING.md)):
  - **Stage 1 · Items**: two rows of the same thing lined up one to one, so the extras stick out; tap the row with more (or fewer), or "The same". 4 right in a row moves on.
  - **Stage 2 · Numbers to 20**: a ? b with a ten-frame under each number; pick < = > (each button also says smaller / the same / bigger). A slip shows both numbers on a number line. 6 in a row moves on.
  - **Stage 3 · Numbers to 99**: tens-sticks and ones-cubes in each number's colour, with the classic traps (47 vs 42, 36 vs 63, 39 vs 41); now and then three numbers to put in order.
  - The sign is taught by its shape (the open side faces the bigger number), not the crocodile. Every wrong answer says why in school words, with his name ("Hey Sam, not quite. Tens first: …").
  - Menu → Maths → Bigger or smaller: set the stage, or start again. Stars and stage are kept on the tablet. Diary event `compare`; time counts in the day's activity.

## 1.22 — 2026-10-27
- **Messages with his name**: Menu → Voice & language → **Child's name**. With a name set, corrections and tips start with "Hey Sam," and a short pause, so he knows the message is for him:
  - maths mistake: "Hey Sam, … you said 9. Let's see…"; the first hint: "Hey Sam, … easy trick: make ten! 8 needs 2."; the mini-lesson: "Hey Sam, … look how easy this is."
  - writing: "Hey Sam, … follow the line. Try again!"; colouring: "Hey Sam, … stay inside the lines."
  - screen time, bedtime and mistake locks, the 5-minute warning, and the eye guard's "move back a little"
  - Spanish says "Oye Sam,". The name is stored on the tablet only (never in the app's files); leave it empty and nothing changes
- The pause is a real gap in the speech (about half a second), not just a comma

## 1.21 — 2026-10-27
- **Trick pictures**: "Show me the trick" now draws the trick while it talks, in 4 steps that follow the words (from the Claude Design prototype saved in `design/`):
  - Count on / count back: hops on a number line, one per count
  - Make ten (8 + 5): two ten-frames; the dots that fill the first ten fly across, then "10 + 3"
  - Over a ten (28 + 5, 12 − 3, 40 − 7): the jump to the ten, then the rest, on a number line
  - Ones first (14 + 3, 17 − 5): a ten-stick and ones-cubes; the new ones join, or the taken ones fade
  - Column sums (levels 6–7) keep their animated column hint
- **Drawn instrument icons**: every instrument sound has its own drawn icon instead of an emoji (73 icons: a grand piano with its lid up, a vibraphone with mallet, a flying-V for Rock guitar, a UFO for Sci-fi …). Animals keep their emoji, which already show the animal. Source: `tools/build-icons.js` → `assets/js/icons.js`; preview: `tools/icon-preview.html`
- **Fix: "Unlock now" on a used-up screen-time lock**: it cleared the lock, then a second later the app saw the time still used up and locked again, so the grown-up could not unlock at all. It now adds 15 minutes with the unlock (the button says so). Workaround on older versions: Menu → "+ 15 min today"
- Fix: after a language change the sound picker relabelled its buttons in the wrong order

## 1.20 — 2026-10-27
- **Sound picker scrolls on phones**: on a screen shorter than the tablet (the S20) the picker was cut off and could not scroll. It now scrolls, with wider buttons so the names fit; the tablet still shows everything on one screen
- **Animals fixed**: the old 🐱 Cat recording sounded like a revving engine, and the 🐮 Cow and 🦆 Duck files turned out to be people saying the word, not animals. The new Cat is a real meow (Wikimedia Commons "Meow of a pleading cat", public domain). Cow, Duck, 🐘 Elephant and 🐸 Frog are removed. Animals now: Whale, Dolphin, Cat, Sheep, Rooster, Owl, Wolf, Bird, Bee, Mosquito, Cricket
- 84 sounds in all

## 1.19 — 2026-10-27
- **New Animals row (15)**: 🐳 Whale, 🐬 Dolphin, 🐱 Cat, 🐮 Cow, 🐑 Sheep, 🦆 Duck, 🐓 Rooster, 🐘 Elephant, 🐸 Frog, 🦉 Owl, 🐺 Wolf, 🐤 Bird, 🐝 Bee, 🦟 Mosquito, 🦗 Cricket
  - Cat, cow, sheep, duck, rooster and elephant are real recordings (Wikimedia Commons, CC0 / public domain), pitched across the keys: middle C plays the animal as recorded
  - Whale, dolphin, frog, owl, wolf, bee, mosquito and cricket are made by Web Audio, so they play nicely on every note (the whale moans with an underwater echo; the frog says "rib-bit"; the cricket keeps chirping while held)
- **2 new synths**: 🎧 Freestyle (chunky electro lead with glide, in the style of early-2000s electro) and 💃 Dance synth (bright, bouncy stab)
- **Icons reviewed**: every icon now says what the sound is and none repeats (⚡ Electric piano, 🪶 Soft piano, 🎸 Guitar, 🪕 Banjo, 🪵 Marimba, 🦣 Double bass, 🎼 Strings, 🎋 Flute, 🐐 Pan flute, 🕰️ Woodblock, 🎁 Music box …)
- Sound picker: 15 per row, the Surround choice moved up next to ✕, so all **88 sounds** fit on one screen

## 1.18 — 2026-10-27
- **Permanent logs**: every record is now also saved in files on the tablet (`Android/data/md.home.pianolessons/files/diary/`). The app never trims or deletes them, and the Menu's clear/reset buttons only clear the in-app copy (a snapshot is taken first), so old records stay until a grown-up pulls them with adb
  - `events-YYYY-MM.jsonl`: every event as it happens: maths answers, writing tries, colouring results, lessons started and finished, piano sessions (time, Piano only time, notes, sounds used), sound changes, level changes, locks, earned time, eye guard, resets
  - `snap-YYYY-MM-DD.json`: a full copy of all in-app records, every minute, one file per day
  - How to read them and what each event means: `docs/LOGS.md`
- The daily activity now also counts time in Piano only

## 1.17 — 2026-10-27
- **41 more sounds, 72 in all**, all on one screen:
  - Keys: 🤠 Honky-tonk, 👑 Harpsichord, 🕺 Funky clav, ✨ Celesta, 💎 Vibraphone, 🪗 Accordion
  - Synths: 🟦 Square lead, 🎠 Calliope, ⚡ Charang, 🌀 Fifths, 📯 Synth brass, 🌊 Synth strings, 😇 Halo pad, 🌬️ Sweep pad, 🔮 Crystal, 🪐 Echoes
  - Bass: 🔌 Electric bass, 👋 Slap bass, 🐘 Double bass, 🐋 Fretless bass
  - Band: 🎸 Electric guitar, 🔥 Distortion, 🐴 Banjo, 🌵 Harmonica, 🦒 Trombone, 🦉 Clarinet
  - Orchestra: 🐻 Cello, 💧 Pizzicato, 🦢 Oboe, 🐌 French horn, 🪘 Timpani, 💫 Orchestra hit
  - Fun & world: 🛎️ Tube bells, 🎋 Pan flute, 🥚 Ocarina, 😙 Whistle, 🐤 Bird, 🪵 Woodblock, 🏯 Taiko drum, 🌸 Koto, 🧞 Sitar
- All recorded (MusyngKite, CC-BY-SA 3.0); loudness and hold-or-ring-out measured for each sound
- **Sound picker**: back to small buttons (as in 1.15), 12 per row next to the group name, all 72 on one full screen; ✕ closes it
- "Pianos" group renamed **Keys**

## 1.16 — 2026-10-27
- **4 more 808s**, in a new **Bass** row: 💣 808 Boom (long deep sub), 💥 808 Punch (short and hard, with a click), 🦁 808 Growl (distorted), 🏄 808 Slide (trap glide: plays one note at a time and slides from the last note). All made by Web Audio synthesis, like the 808
- **Sci-fi plays on every key**: its recordings are silent from F#6 up (the sound set has none there), so the app now skips any silent recording and stretches the nearest real note up instead. This applies to every recorded sound
- **Full-screen sound picker**: "Choose a sound" fills the whole screen, one row per group (Pianos · Synths · Bass · Band · Orchestra · Fun), big buttons that stretch to fill it, ✕ to close; surround choice at the bottom
- 31 sounds in all

## 1.15 — 2026-10-27
- **15 new sounds, 27 in all**, and the sound picker is now grouped: Pianos · Synths · Band · Orchestra · Fun
  - New Synths: 🔉 Synth bass, 🎤 Voice ooh, 🚀 Sci-fi. 🎛️ Synth lead is now a real recording (it was made by Web Audio)
  - Band: 🪕 Guitar, 🤘 Rock guitar, 🎷 Saxophone, 🎺 Trumpet, 🥁 Marimba, 🏝️ Steel drums
  - Orchestra: 🎻 Violin, 🌠 Strings, 🐦 Flute, 🧚 Harp
  - Fun: 🎐 Kalimba, 🔔 Bells
  - All are recorded notes from the free MusyngKite sound set (CC-BY-SA 3.0); each sound's loudness is matched to the grand piano
  - Held notes keep sounding on the long instruments (violin, strings, flute, sax, trumpet, voice, synth lead, sci-fi, rock guitar); plucked ones and the synth bass ring out on their own
- Grand piano and soft piano are unchanged
- New file `docs/SOUNDS-AND-ENGINES.md`: every sound, the engine that plays it, where it comes from and the version that added it

## 1.14 — 2026-10-27
- **🎹 Piano only** (inside Play along): hides the video and the lesson strip, makes the keyboard bigger, and every note he plays flies up out of its key as a glowing bar, like Synthesia's free play (blue = left hand, orange = right hand)
- **Key names** (Menu → Piano): Letters (C D E), Do Re Mi (Do Re Mi Fa Sol La Si), or Both
- **Black keys written as** (Menu → Piano): Sharps (C#), Flats (Db), Like the videos (Db Eb F# Ab Bb), or Both

## 1.13 — 2026-10-27
- **Key size zoom**: − / + make the keys bigger or smaller (1 to 4 octaves, keeping the middle); the size and the octave are remembered. Menu → Piano can lock the size
- Play along: the piano runs the full width under the video and the lesson strip

## 1.12 — 2026-10-27
- **Native grand piano**: a C++ sound engine (AAudio, exclusive MMAP) answers in about 8 ms (it was about 120 ms), and touches on the keys are read natively in 2–3 ms. That is faster than Synthesia on the same kind of tablet
- The native engine's sound matches the page's (same pan, compressor and room echo)

## 1.11 — 2026-10-26
- **Start screen**: the app opens on "Hi! What do you want to do?" with two big drawn cards, 🎹 **Piano lessons** and 🧮 **Math**; a 🏠 button goes back to it (never from the quiz between lessons). Menu → **Start screen** sets he chooses / always piano / always math
- **New look**: a rounded kids' font (Fredoka, bundled, works offline), a night-sky background, chunky press-down buttons, coloured answer buttons, softer red screen
- **Everything fits on the screen**: the quiz, the "Stop and think" screen and the mini-lessons shrink to the screen instead of scrolling (tablet and phone), text a bit smaller, and a phone held sideways keeps the lesson strip at the side
- **Step-by-step explanations**: after a mistake the explanation is told one step at a time with a short pause between steps; each step lights up while it is spoken and its arc is drawn on the sum at that moment. Speech is a little slower
- **Right answer**: the **?** turns into the answer in green and stays on screen (at least 1.5 s after the voice), with confetti and "🎉 Yahoo! Correct!"
- **One language at a time**: everything he sees (buttons, lessons, quiz, PIN screen, sound names) follows Menu → Language; the grown-up menu stays English
- **Black keys are labelled too** (C#, D#, F#, G#, A#), like the white keys
- **Wider video**: in Big video and Play along the video fills the whole width and the top is cut off instead of the bottom, so the keyboard in the lesson video sits right above the piano
- **✍️ Writing** (new, third card on the start screen): handwriting practice on school lines (top, dashed middle, red base line, tail line), made for school in England. Levels go from Year 1 to Year 2 like the maths: lower-case letters by family (curly caterpillar c a d o g q e s f, long ladder l i t u j y, one-armed robot r n m h b p k, zigzag v w x z), capitals, numbers, Year 1 tricky words, Year 2 tricky words. Each letter: a pen shows how, then he traces a thick guide, then a dotted line, then writes it on his own; words: dotted, then on his own. Every stroke is checked in order: start at the green dot, follow the line. Works with a finger or the tablet's pen (pressure makes the line thicker; a hand resting on the screen is ignored while the pen is in use). Menu → Writing level, Menu → Start screen can fix "Writing only"
- **Writing levels 9-15** (harder, Year 2): days and months (capital letters), word endings (-ing, -ed, -er, -est, -ful, -less, -ness, -ment, -ly), apostrophes (can't, didn't, I'm), 👂 listen and write Year 1 words, 👂 listen and write Year 2 words, short sentences (capital letter, finger spaces, full stop; long ones on two lines), 👂 listen and write sentences. Listen-and-write hides the word: 🔊 hears it again, two misses show the dotted line for that stroke, 👀 Show me writes it (logged as help). On his own every letter is checked where he starts it, still on the lines. School words are always spoken in English
- **🎨 Colouring** (fourth card on the start screen): 36 real colouring pages from easy to hard (rocket, penguin, frog, kitten, octopus, owl, butterfly, triceratops, robot, puppy, aeroplane, monster, shark, sea turtle, dinosaur, sandcastle, unicorn, elephant, tiger, dragon, tortoise, lion, footballer, astronaut, crocodile, horse, pirate, flying unicorn, mermaid, rescue team, under the sea) - public domain, from Openclipart (credits in assets/colour/SOURCES.md). The goal is colouring **inside the lines**: the crayon only paints inside the shape where the stroke started, and going over a line makes the picture shake, the lines flash red, a soft bonk and a short buzz ("Oops! Stay inside the lines."). A picture is done when it is about 85% coloured; stars count the line crossings (0-1 = ★★★, up to 4 = ★★, more = ★), finishing opens the next one. 12 crayons, ↶ undo, 🖼️ gallery with stars and locks, the crayon gets thinner as the pictures get harder, pen pressure and palm rejection as in Writing. Progress `colourProg`, log `colourLog`
- **Your own colouring pictures**: Menu → 🎨 *Add a colouring picture* picks any black-and-white page from the tablet (it stays on the tablet, never in the app or on GitHub); the app finds its shapes by itself. *Remove my own colouring pictures* clears them
- **Grown-ups menu redesigned**: a full-screen settings sheet with one section per thing it controls (Today · Start screen · Piano · Maths · Writing · Colouring · Voice & language · Screen time · Eye guard · General), on/off switches, grouped rows, units on every value; the last section opened is remembered
- **New grown-up controls**: show or hide each activity on the start screen (at least one stays); piano loudness limit (100 / 80 / 60 %); lock the piano sound choice; writing letter check Gentle / Normal / Strict; colouring quiet mode (no shake or buzz, the lines only flash red) and *All pictures open*; **bedtime** (19:00–21:00, locked until 07:00; a grown-up unlock holds until the morning)
- **Colouring memory game** (on by default): the coloured picture shows for a few seconds, fades, and he colours it from memory; 👀 peek twice; at the end the model comes back and he hears how many colours he remembered (a wrong colour never blocks him). Starts with 3 colours to remember and grows to 8 as he gets good. Hand-made colour maps for all 36 pictures (sensible colours: green frog, orange beak...)
- **Colour hints**: a strange colour for a part (a black beak, a black eye) gets a kind spoken hint, once per shape
- **Varied spoken warnings**: many lines, never the same twice in a row, chosen by the kind of slip (first slip, lots of slips, nearly done, close to the limit)
- **Over-the-line limit**: at 10 crossings (Menu: 6 / 10 / 15 / never) the picture stops, a sad face says "Take your time, have a rest and come back more focused", 1 min rest, then *Try again*
- **British English**: "Maths", "Mum", and a British voice when the tablet has one
- **New sound: Xylophone** 🌈 (wooden bars with a mallet tap), the 12th sound in the sound picker
- **Faster keys**: the grand piano and the other recorded sounds skip the silent start of each recording (5-22 ms), and the sound now starts before the key lights up
- **Surround sound** 🎧: each note comes from its own place, low notes on the left and high notes on the right like a real piano, with a soft room echo that fills the tablet's 4 speakers. Pick 🔈 Off / 🏠 Room / 🏛️ Big hall under the sound button (Room by default)
- The grown-up's computer can read the quiz and activity log over USB (USB debugging must be on; nothing goes over the network)

## 1.10 — 2026-10-25
- **Hearts** ❤️: the mistake lock is now a row of hearts on the math screen and on the "Stop and think" screen. A wrong answer breaks one (it shakes and goes grey; a too-fast guess breaks two); **5 right in a row win one back** (it pops in, and the voice says "And you won a heart back!"). Answers after a hint don't count toward the 5, and nothing is banked while all hearts are full. No hearts left = the break screen. Menu → ❤️ Hearts sets how many (3 / 5 / 7 / 10)
- **Voice fix, no more freezes**: when speech was cut off (lock screen, a voice setting switched off, a language change), the screen waiting for it could stay on 🔊 forever; now it always moves on. The safety timer also allows for voices that prepare the whole sentence before speaking (SherpaTTS), and mini-lesson steps are no longer cut off after 15 s
- Works with the free **SherpaTTS** voice engine (F-Droid) on tablets whose own engine has no English or Spanish voice

## 1.9 — 2026-10-25
- **Animated column hints, 3 styles under test** (column sums, levels 4-7). The sum is redrawn in two lanes (blue tens, pink ones) and the digits move: **A ✨ Magic numbers** (copies of the digits fly into the answer box, shrink, the − or + flashes between them and they crash into the result), **B 🧱 Blocks** (tens are sticks, ones are cubes; a stick breaks into 10 cubes for a trade, 10 cubes snap into a stick for a carry), **C 🙋 Do it with me** (he types each column on a keypad; after two misses it shows him). Steps pause at least 2.6 s (or until he taps)
- **Trading, written like on paper**: "Trade 1 ten for 10 ones" (never "borrow"). The top tens digit is crossed out and the new one is written small above it, so 84 − 39 keeps its 8 on screen with a 7 above it, and the 4 becomes ¹4
- **More time to think**: hints now start after 20 s (Menu: 20 / 30 / 45 s / OFF). Column sums first only wiggle the ones column ("Start with the ones"); the full animated hint comes after twice that, or at once from 💡 "Show me"
- **New level 7**: two-digit sums with a carry (59 + 27) or a trade (84 − 39), answers under 100. Level 6 stays carry-free. The level-7 mini-lesson and explanations go ones first, then tens
- **Mistake checker**: the classic slip of a carry/trade sum is one of the answer buttons; picking it is named kindly on the mistake screen and in speech ("Careful! It's 4 take away 9, not 9 take away 4…", "Good trade! But that ten came from the 8…", "So close! 16 ones have a ten hiding inside…"). The log records it (`sl`: flip / kept / carry)
- **Hint test**: styles A, B, C take turns (least-shown first); Results shows, per style, the hints given and how often the NEXT column sum of the same kind was right without a hint. A 🏆 winner is named once every style has 20 such answers; Menu → 🎨 Hint style switches to one style or back to "test all 3". Log fields: `col`, `reg`, `hs`

## 1.8 — 2026-10-25
- **Read aloud**: every question is spoken slowly ("What is 12 minus 3?" / "¿Cuánto es 12 menos 3?"), with a 🔊 button next to it to hear it again. With Voice quiz on, the microphone opens only after the question has been read; think time starts after the speech
- **Spoken praise**: "Great job! 12 minus 3 is 9." (five variants per language, never the same twice in a row)
- **Spoken + shown explanations** on a wrong answer, calm and kind: "You said 8. Let's see…" then the steps, then the result. Per level: counting on/back (L1-2), make ten / break ten (L1-3), ones only (L3), tens stay and ones change (L4), jump to the ten (L5), tens and ones columns (L6). The red screen shows the same steps (dots at L1-2, tens/ones colours at L4-6) and stays until the voice has finished
- **Language** setting (English / Español) now governs all speech and voice-answer recognition; "Read questions aloud" and "Spoken feedback" are separate ON/OFF settings that work with Voice quiz off. Quiz log marks explanations (`ex`)
- **Animated tricks that show how easy each kind of sum is**: four tricks, named the same everywhere (👆 Count on/back, 🔟 Make ten, 1️⃣ Ones first, 🧱 Tens and ones). After 5 seconds without an answer, red arcs draw over the sum between the digits that go together, with a small label ("5 + 5 = 10", then "10 + 10 = 20"), one step per 5 s, spoken as "Easy trick: …" (Menu: Hints OFF / after 5 s / after 10 s). Works side by side and in the written columns (ones on the right, tens on the left). The first time he reaches a level, and from the 🧠 "Show me the trick" button, a 15-20 s animated mini-lesson plays on a worked example ("See? Easy! Now you try."); the red screen draws the same arcs while it explains. An answer after a hint or the trick still counts for level and review, but does not advance the earn-minutes streak (log `hint` 1-2, 3 = trick), and a missed question answered right only with a hint comes back once more
- **Mistake lock**: 5 mistakes in 30 minutes (a wrong tap within 1.5 s counts double) locks the app with a calm "Time for a break" screen until a grown-up unlocks it in the Menu (or a timed 15-minute break ends). Settings: lock ON/OFF, mistakes allowed, window, and Mistake screen Dramatic / Calm (grey, no buzzer)
- **Daily screen time** limit (default 60 min; Off/30/45/60/90/120) with a 5-minutes-left warning, the lock screen at the limit, and "+15 min", "+30 min", "No limit today" in the Menu. Locks survive a restart; a tablet clock set back does not give time back
- **Earn minutes with math**: 5 right answers in a row = +5 minutes today (max 30), with a ⭐ streak meter; also from the "Earn more time with math" button on the time-over screen. A mistake resets the streak and counts toward the mistake lock
- **Missed questions come back**: after 2-3 right answers, and once more after ~10, then they count as mastered ("🔁 Let's try this one again!"). Results and Activity show what he is practising, what was mastered today, locks and earned minutes

## 1.7.3 — 2026-10-25
- Pads are now real recorded sounds (FluidR3 soundfont): 🌌 Warm pad replaces the synth pad, new 🎹 Polysynth

## 1.7.2 — 2026-10-25
- 5 new synth sounds: 🤖 Robot voice (talkbox/auto-tune style with glide), 🎛️ Synth lead, 🔊 808 bass, 👾 Chiptune, 🌌 Space pad
- Sound picker is now a grid of big buttons instead of tap-to-cycle

## 1.7.1 — 2026-10-25
- Voice quiz hears the whole sentence: pauses no longer cut it off ("twelve minus three … is nine" counts as one answer); a wrong-sounding answer is judged only after 2.5 s of silence, so he can finish
- **Eye guard**: the front camera checks his distance once a second; too close covers the screen and pauses the video until he moves back (on-device only, nothing saved or sent); calibrate in the Menu. The Activity panel counts how many times per day

## 1.7 — 2026-10-25
- **Voice quiz** (grown-up setting, off by default): he reads the question aloud and says the answer ("twelve minus three is nine"); the tablet listens offline, in English or Spanish, and checks. Nothing is sent anywhere; the first time it asks for the microphone
- Right answer: "Great job!" / "¡Muy bien!" spoken. Wrong answer (operands said, wrong result): the same red stop-and-think screen, now also spoken with the worked answer. Not heard: no penalty, "try again" and after 3 tries the answer buttons appear. The grown-up can see what it heard under the question
- **Written column sums** for the two-digit levels 4-6: the sum is shown like on paper, tens over tens and ones over ones, a line, and a "?" box; the red screen shows the worked answer the same way
- **Math only mode**: the grown-up Menu (the 🔒 button, now called Menu) has a switch Piano lessons / Math only. Math only has no videos or piano, just a non-stop quiz with a star count, the level and a level-up celebration; it comes back after a restart. The Activity panel counts math-only time separately
- Grown-up menu is locked: PIN asked every time it opens; it relocks when closed, when the app goes to the background, or after 60 s idle
- Voice answers are logged with what was heard; the grown-up menu has Voice quiz ON/OFF and Voice language English / Español

## 1.6.1 — 2026-10-25
- Key sensitivity: louder when a key is pressed nearer its bottom edge or with a bigger touch; grown-up setting Off / Normal / Strong
- Activity log for parents (behind the PIN): screen time per day, most-watched lessons, play-along time and favourite sound, quiz summary

## 1.6 — 2026-10-25
- 5 piano sounds, picker in Play along: **Grand piano** (real Salamander Grand Piano recordings, works offline), Soft piano, Music box, Electric piano, Organ
- Math quiz made strict: a mistake shows a red "Stop and think!" screen with a buzzer and the right answer, then freezes 5 s (+5 s per further mistake, max 20 s) and changes the question; 2 s think time before answers can be tapped; no more guessing by elimination
- Quiz levels 1–6, from sums up to 10 with pictures to two-digit ± two-digit; up a level after 5 right in a row, down after 3 wrong in a row
- Answer records and a 📊 Results panel (behind the PIN); setting for how many correct answers are needed before the lesson plays

## 1.5 — 2026-10-25
- Math quiz between lessons: picture sums and take-aways with 3 big answer buttons; settings for how often and how big the numbers are
- Play-along fixes: volume at start-up, first key sound, stuck notes, video fit

## 1.4 — 2026-10-25
- **Play along**: on-screen piano (2 octaves, octave shift, multi-touch, letter names like the lessons) under the video, with a video-volume slider

## 1.3 — 2026-10-25
- No YouTube title or "more like this" overlays at the start of a video; tapping the video pauses it and shows the app's own Play screen
- First public release on GitHub

## 1.2 — 2026-10-25
- **Big video** mode: no Back/Next row, thumbnails shrink to a narrow strip (remembered)

## 1.1 — 2026-10-25
- 🔒 Close button with a 4-digit grown-up PIN (3 wrong tries = 1 minute lockout)
- Pause/end screens hide YouTube's "More videos"

## 1.0 — 2026-10-25
- Locked player for one YouTube playlist on the MatePad: no links out, no ads browsing, back button can't leave the app
