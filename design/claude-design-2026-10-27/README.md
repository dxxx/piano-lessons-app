# Claude Design prototype (saved 2026-10-27)

Source: claude.ai/design project `420c7f15-fb80-40f5-9c4d-52dc56dacaa7`, which closes with standalone Claude Design by 2026-12-14. Everything is copied here so it survives.

| File | What |
|---|---|
| `Piano Lessons App.dc.html` | Main app prototype: home, splash, lessons, play along, maths quiz, wrong/right answer, trick visuals, locks, PIN, Menu, Activity |
| `Learning Modules.dc.html` | Column sums (carry and trade), multiply, divide, handwriting, colouring, calligraphy |
| `support.js` | The design-canvas runtime the two pages need |
| `assets/colour/*.png` | 4 of the app's own colouring pages, used by the colouring screen |
| `DESIGN-NOTES.md` | The designer's notes, one section per screen |
| `github.md` | The screen map: which prototype screen matches which repo file |
| `screens/` | A PNG of every screen and every trick step, in both directions: `A-…` is Warm paper, `B-…` is Night room |

## Open it

```bash
cd design/claude-design-2026-10-27 && python -m http.server 8765
# then open http://127.0.0.1:8765/Piano%20Lessons%20App.dc.html
```

It needs the internet once, for React, Babel and the Nunito font from unpkg and Google Fonts.

## What the operator liked (2026-10-27)

"This screen has tips and tricks for MATH, I love the ideas it has, let's use them. Also see how it adopted the design, love it in most parts."

## Maths ideas: what the app has now and what is new

The app already has the four tricks (Count on/back, Make ten, Ones first, Tens and ones), hint arcs drawn over the question, a "Show me the trick" button, spoken step-by-step explanations, and column hints at levels 4–7 in three styles (magic numbers; blocks, where tens are sticks and ones are cubes; and "do it with me" on a keypad). The prototype adds:

| Idea | In the prototype | In the app now |
|---|---|---|
| **Trick visuals in 4 steps**, picked from tabs, with Back / Next step / Try it myself | Count on and Break ten: jumps on a number line. Make ten: two ten-frames, dots move across. Ones first and Tens and ones: tens-sticks and ones-cubes | Arcs and words for sums under 20; sticks and cubes only in the column hints (levels 4–7) |
| Steps as a numbered strip under the picture (done = green, current = red, next = faded) | yes | no |
| Column sums typed on a keypad, ones first, then tens | blue tens lane, pink ones lane; tap the tens digit to trade, it is crossed out and the new digit written small above | answer buttons; keypad only inside the "do it with me" hint |
| A kind message for each kind of slip | "Careful! It's 14 take away 9, not 9 take away 4." · "So close! Don't forget the 1 you carried." · "So close! Only the ones digit goes here. The ten goes up to the tens." · "Good trade! But that ten came from the 8, so it's 7 now." · "Not quite. Count the ones again: 7 + 5." | some (v1.9) |
| **Multiply** with a dot array | rows light up as he skip-counts (4 → 8 → 12); "Turn it round" swaps rows and columns; a right answer shows the 4 linked facts (×, × swapped, ÷, ÷) | not yet |
| **Divide** by sharing | counters dealt onto plates one at a time ("Share one each" / "Share them all"), leftovers shown, checked with × | not yet |
| **Maths path** | strip of levels 1–7, then planned 8 ×2 ×5 ×10 · 9 ×3 ×4 · 10 sharing ÷ · 11 ÷ with a remainder | levels exist, no path view |
| **Stop & think** | after 2 wrong answers in a row: 8-second breathing circle ("Breathe in… and out…"), then "I'm ready" | not yet |
| **Welcome back** | after a grown-up unlocks: "Back to my lesson" or "Easy warm-up sum" | not yet |
| Softer wrong answer | tinted background, "Not quite. Let's look together. You picked 12." and the steps appear one by one | whole screen flashes red and freezes for a few seconds |
| Activity: what he is practising | each sum with its trick and a status (Mastered / Review 1 of 2 / …) | lists only |

## Design ideas outside maths

See `DESIGN-NOTES.md`: five-tile home with progress, a splash per app, a big edge-to-edge piano, line icons instead of emoji on buttons, school-lined handwriting in 4 steps, colouring with 12 crayons and a progress bar, a new calligraphy module, and a grown-ups Menu grouped into cards.

## Not yet in the app: "Follow the keys" (prototype Piano tab, screen `A-app-07-piano.png`)
Noted 2026-10-27 at the operator's request. The prototype's Piano tab shows the lesson's notes as a row of letter tiles (C D E D C E F G); the current note is red and a red dot sits on the key to press. He plays the note himself, then the next tile lights. This is the reverse of the video lessons: the app waits for him, note by note, instead of him copying a video. Research fit: 06 R9–R12 (answer on the keyboard, notes from his song, copy-back), 01/03 errorless start. Not built yet.
