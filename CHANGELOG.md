# Changelog — Piano Lessons

Every version, newest first. Each released version has a download on the
[Releases page](https://github.com/dxxx/piano-lessons-app/releases).
`bash build.sh release <version>` publishes the APK with that version's section below as its notes.

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
