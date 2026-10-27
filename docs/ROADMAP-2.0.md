# Piano Lessons 2.0 — plan

Written 2026-10-27 after saving the Claude Design prototype (`design/claude-design-2026-10-27/`). 2.0 = the design's best ideas + an engineering and UX polish pass. Each line is one shippable step; order is the suggested order. Nothing here is started unless marked.

## A. From the design prototype

| # | What | Why | Status |
|---|---|---|---|
| A1 | Trick pictures in 4 steps (number line, ten-frames, sticks and cubes) | The tricks were words and arcs only; he needs to *see* the ten being made | **DONE 1.21** |
| A2 | Softer wrong-answer screen: tinted panel, "Not quite. Let's look together. You picked 12.", steps appear one by one, then "Next question" | The whole-screen red flash is the most-complained-about screen; the design keeps the pause without the fright. Keep "Dramatic" as a Menu option | next |
| A3 | Stop & think: after 2 wrong in a row, an 8-second breathing circle ("Breathe in… and out…"), then "I'm ready" | Breaks the guessing spiral before the mistake lock has to | next |
| A4 | Welcome back after a grown-up unlock: "Back to my lesson" / "Easy warm-up sum" | A soft restart instead of landing on the sum he just failed | small |
| A5 | Column sums typed on a keypad, ones first then tens, tap the tens digit to trade; one kind message per kind of slip ("So close! Don't forget the 1 you carried.") | Levels 6–7 are multiple choice now; typing each column is how school does it. The "do it with me" hint already has the keypad, so most code exists | medium |
| A6 | Multiply: dot array that lights up row by row with skip counting, "Turn it round", the 4 linked facts | Year 2 ×2 ×5 ×10 is the next thing school asks for (see the UK roadmap note). New level 8 (×2 ×5 ×10) and 9 (×3 ×4) | big |
| A7 | Divide by sharing: counters dealt onto plates one at a time, leftovers shown, checked with × | Levels 10–11 | big, after A6 |
| A8 | Maths path strip: levels as a path across the top with the current one marked and the next ones greyed | Shows him where he is and what comes next; also the Menu's level picker | small |
| A9 | Home with 5 tiles that show progress ("Lesson 3 of 12", "Level 2 · 14 stars", "36 pictures") + a 1.5 s splash per app | Progress on the tile is the design's best home-screen idea; the splash gives the app a feel of "rooms" | small |
| A10 | Activity: today's minutes against the limit, "what he's practising" with a status per sum (Mastered / Review 1 of 2), events list | The diary already logs all of this; this is the readable view for grown-ups | medium |
| A11 | Line icons instead of emoji on buttons (lock, clock, star, play, back, speaker, bulb) | Same reason as the instrument icons: emoji differ by device and look like stickers | small |
| A12 | Big piano as the default play-along layout: keyboard edge to edge (~58 % of the height), video above lined up to the bottom, 4-thumbnail lesson strip on the right | Already partly there (`body.big`); make it the default and tidy the strip | medium |
| A13 | Calligraphy module (wide nib, slant guides, downstrokes/ovals/arches/waves, 3 inks) | New activity from the design; fun, low risk | later |
| A14 | Writing: Watch → Trace → Dotted → On my own, green start dot with stroke number and arrow | The app has the lines and the stroke check; add the 4-step ladder | medium |
| A15 | Colouring: crayons in a 4×3 grid, Undo, "Done at 85 %" progress bar, gallery strip | Polish of the existing module | small |

Not taking from the design: the cream "Warm paper" theme (the night-sky look is his and works on the tablet), hearts in the top bar on every screen (noise), and the splash's extra wait on a slow tablet beyond 1.5 s.

## B. Engineering polish (the part that must be done for 2.0)

| # | What | Why |
|---|---|---|
| B1 | **Split `assets/index.html`** (5,000+ lines) into modules: `css/`, `js/{names,sounds,picker,quiz,tricks,colhint,guard,diary,activity,menu}.js`, keep one HTML. Same WebView, no bundler: plain `<script src>` in order | Every change now means searching one 5k-line file; reviews and the 2.0 features need boundaries |
| B2 | **Smoothness**: the piano key overlay, fly-out notes and trick animations on one `requestAnimationFrame` loop; no `setInterval` timers that fight each other; `will-change`/`transform` only, no layout-triggering styles in loops; measure with the WebView's performance panel on the tablet | The MatePad is a mid-range tablet; frame drops show up first in the fly-out notes and the colouring |
| B3 | **Audio**: decode sound sets lazily and cache decoded buffers across sound changes (today a change re-decodes); cap simultaneous voices per set; release AudioContext on background | 84 sets × 25 samples: memory and decode time are the budget |
| B4 | **State**: one `store` module over localStorage with a key registry (today 5 copies of `get/put` and 60+ free-form keys), versioned, with a migration step; the diary snapshot reads the same registry | Needed for A9/A10 and for any reset/restore without losing settings |
| B5 | **Timers and locks review**: screen-time, bedtime, mistake lock, break, earning — write the state machine down (`docs/LOCKS.md`), then test each transition with a fake clock. The 1.21 unlock bug came from this area | This is the part parents touch and the part with the most edge cases (clock changes, sleep, midnight) |
| B6 | **Quiz logic review**: level up/down rules, review scheduling, hint timing, voice vs buttons; write the rules down in `docs/QUIZ-RULES.md` and add a headless test (`tools/quiz-sim.js`) that plays 500 answers and checks levels move as documented | We tune this by feel; a sim makes the tuning visible |
| B7 | **UX logic pass**: every screen's exits (what does Back do, what does Home do, what can the kid reach without the PIN), consistent button order (primary right), one copy voice ("Not quite" not "Wrong"), Spanish strings complete | The design's screens are consistent; ours grew one feature at a time |
| B8 | **Build and release**: `build.sh` to check the HTML syntax and `icons.js` freshness, bump version from one place, write the APK size to the changelog; keep the "no push without sign-off" rule | So every version is reproducible |
| B9 | **Tests on device**: a `tools/device-check.sh` that installs, opens each screen via CDP, screenshots, and compares with the last run | Replaces the by-hand screenshot rounds |
| B10 | Code quality: ES5 is fine for the WebView but adopt consistent module shape, no globals except the modules, JSDoc on the public functions, remove the dead "three styles under test" column-hint code once one wins | |

## C. Suggested order

1. 1.21 (done): trick pictures, icons, unlock fix.
2. 1.22: A2 softer wrong answer + A3 Stop & think + A4 Welcome back (all in the quiz, same screen family).
3. 1.23: B1 split the file + B4 store module (no visible change; a release on its own so regressions are easy to spot).
4. 1.24: A9 home tiles with progress + A8 maths path + A11 line icons.
5. 1.25: A5 typed column sums.
6. 1.26: B5 locks review + B6 quiz sim + B7 UX pass.
7. 2.0: A6 multiply + A7 divide + A10 Activity + B2/B3 smoothness, then B8/B9 and the release.
