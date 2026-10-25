# Changelog — Piano Lessons

Every version, newest first. Each released version has a download on the
[Releases page](https://github.com/dxxx/piano-lessons-app/releases).
`bash build.sh release <version>` publishes the APK with that version's section below as its notes.

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
