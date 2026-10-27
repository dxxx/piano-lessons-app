# What the app does with the research (audit, 2026-10-27, v1.26)

Every design rule (R#) in files 01–07 was checked against the code (`assets/js/concepts.js`, `metronome.js`, `compare.js`, `index.html`).
**✅ done · 🟡 partly · ❌ not yet · ⚠️ we chose differently (reason given)**. Update this file whenever a rule is built.

## Totals

| File | Rules | ✅ | 🟡 | ❌ |
|---|---|---|---|---|
| 01 basic concepts | 13 | 3 | 5 | 5 |
| 02 attention and focus | 16 | 9 | 4 | 3 |
| 03 learning science | 14 | 6 | 7 | 1 |
| 04 concepts in pictures | 23 | 12 | 7 | 4 |
| 05 kids' app design | 21 (1 n/a) | 8 | 9 | 3 |
| 06 music concepts | 14 | 5 | 4 | 5 |
| 07 UK curriculum map | 10 | 4 | 3 | 3 |
| **All** | **111** | **47 (42 %)** | **39 (35 %)** | **24 (22 %)** |

So: the research **shaped the whole concept-game system**, but only about 4 in 10 rules are fully in, and the research has **not yet been applied to the older parts** of the app (maths quiz, writing, colouring).

## Fully in (the core)

- Teaching order of the 20 concepts, one word first, errorless first sight, then the other word, then mixed (01 R2, R9; 03 R4).
- Spaced reviews +1/+2/+4/+7/+14 days, a miss steps back one gap, learned only on 2+ different days (03 R6).
- Pop-up shape: 2 questions (1–3), at a 1.5 s pause in his playing, "Quick game! 2 questions, then back to your song" with dots, ≤ 4 an hour, ~5 min apart, video paused and resumed (02 R1–R5; 05 R1, R2).
- No countdowns, no buzzer in the games, a ⚡ only as a small extra for speed (02 R8; 05 R14 mostly).
- Feedback names what is true, a miss shows the right one + one reason, starting "Hey <name>," (03 R2; 05 R7).
- Two misses end the game kindly (02 R13, part).
- Movement card every 4th game (02 R11).
- Pictures: one dimension changes; same hue for darker/lighter (L* gap ≥ 40); identical glasses; see-saw with same-size objects; walkers facing a flag for first/last; steam/ice objects for hot/cold, never colour only; no left/right (04 R1, R7, R9–R10, R12–R15, R17–R19; 07 R9).
- Sounds: same note for loud/quiet and long/short, pitch gaps ≥ an octave, "high notes live on the right", sound first, replay button (06 R2, R5, R11; 07 R5).
- Two-meaning words kept apart (light colour vs see-saw lighter) (07 R4).
- All data on the tablet (05 R20). Honest claims, no "trains attention" (02 R16; 06 R14).
- Metronome: steady beat is KS1 core (06); tempo animals tortoise→cheetah as in 04 R23's tortoise/hare; default 80 bpm.

## Partly in (biggest gaps first)

| Rule | What is missing |
|---|---|
| 01 R7, 03 R5 — mastery = ≥ 8/10 over ≥ 3 days and ≥ 3 picture sets, with 3-option checks | We use 2–3 right in a row + 2 different days, always 2 options. **Our "learned" is easier than the research's.** |
| 04 R2, 06 R3 — 3 difficulty levels per concept (big step → smaller step, back a level after a miss) | One level only (always the big, easy step). |
| 03 R7, 04 R6 — never put confusable pairs (bigger + taller, higher + louder) in the same pop-up until each is stable | Not guarded: the two concepts in play are the next two in the list. |
| 02 R13 — fatigue: answer time doubling, random fast taps, stop after 20–25 min, quiet hours before bedtime | Only "2 misses ends it". |
| 04 R20–R21 — answer pictures for sounds: arrow/bird up–down for pitch, open mouth vs finger-on-lips for loud | Sound answers are cards "1" and "2". |
| 06 R1, R6 — Year 1–2 sound types | We have high/low, loud/quiet, long/short. Missing: melody up/down/same, which instrument, fast/slow **music**. |
| 02 R15, 05 R18 — parent view per concept (tried / learned / confusions) | Menu shows "learned x of 20, learning A + B"; the diary has every answer but there is no per-concept screen. |
| 03 R3 — drop to an easier contrast after 2 wrong | Ends the game instead. |
| 03 R8 — max ~4–6 tries of one concept per day | Not capped. |
| 07 R3 — the 127-pair curriculum map in 11 units | 20 pairs built. |

## Not in yet

- **3-picture checks** (small–medium–large, middle one as the trap) (01 R4, R5).
- **Same-side tapping detection** and balanced answer sides (2 left / 2 right in every 4) (01 R6; 04 R4).
- **Skip / "back to piano" button** (02 R14; 05 R12) — ⚠️ the operator wants him to answer to get back; kept off.
- **Notes from his own song** in sound questions, and **answering on the keyboard** ("tap the higher of the two keys you heard") (06 R9, R10).
- **Copy-back games** ("play what I play", clap a 4-beat rhythm) (06 R12) — the metronome could drive this.
- **Surprise progress celebrations** ("You learned DARKER and LIGHTER!") (03 R12).
- **Tell the child a grown-up can see** what he practised (05 R19).
- **Choice of 2 games** at the start (02 R10).
- **Curriculum tags** (year + table row) on every question (07 R10); -est and "put 3 in order" for concepts (07 R2); shapes in many orientations (07 R7).
- **Test each game with him** and watch for mis-taps (05 R21) — pending, now that 1.26 is on the tablet.

## Chosen differently on purpose

- ⚠️ **Two concepts mixed in one pop-up from the start** (01 R1 and 03 R4 say one concept per pop-up until it passes). Operator: he gets bored with sameness and has a short focus window, so the app never asks the same concept twice in a row. Revisit if his accuracy on new concepts is low.
- ⚠️ **Glowing right answer on first sight** (04 R5 says no glow hints) — this follows the errorless-start rule (01 R9, 03 R4) and is used only on the first showing of each word.
- ⚠️ **"In front of / behind" uses a box** (04 R16 says use a house/person/car until he is consistent). Should be changed.
- ⚠️ **Maths quiz is strict** (red screen, buzzer, freeze, hearts lost) — this goes against 05 R8/R14 and 02 R7. It predates the research and is the operator's design. Not changed without the operator's say.
