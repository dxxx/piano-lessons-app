# Changelog — Piano Lessons

Every version, newest first. Each released version has a download on the
[Releases page](https://github.com/dxxx/piano-lessons-app/releases).
`bash build.sh release <version>` publishes the APK with that version's section below as its notes.

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
