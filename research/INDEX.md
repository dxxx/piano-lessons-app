# Research index — Piano Lessons app

How to use this folder: find your question in **Ask → where** below, open the file, jump to the finding `F#` or rule `R#`, and follow its `[S#]` to the source list at the bottom of that file. Every file has the same layout ([_FORMAT.md](_FORMAT.md)): *Answer in 5 lines → Findings (with evidence grade) → Design rules → Open questions → Sources*.

Written 2026-10-27 by seven parallel research agents (web search + reading sources), for the concept pop-up games (`assets/js/concepts.js`) and the app as a whole. Summaries are in our own words; quotes stay short; sources are linked, not copied.

## Files

| # | File | Topic | Findings | Sources | Read it when… |
|---|---|---|---|---|---|
| 01 | [01-basic-concepts-teaching.md](01-basic-concepts-teaching.md) | Teaching basic/relational concepts (SLT, Boehm-3, Bracken, CELF): order of acquisition, what is still hard at 6–7, teaching methods, picture-choice testing | 17 | 35 | adding a concept, choosing words, checking mastery |
| 02 | [02-attention-and-focus.md](02-attention-and-focus.md) | Attention and focus at 5–8 (medical + education): what raises on-task time, movement breaks, rewards, screen media, brain training, interrupting play | 18 | 40 | pop-up length/frequency, movement cards, rewards, anything "focus" |
| 03 | [03-learning-science-young-children.md](03-learning-science-young-children.md) | Retrieval practice, spacing, interleaving, feedback, errorless learning, CPA/manipulatives, praise and rewards — what works for 4–8 vs adults | 16 | 40 | scheduling reviews, mastery rules, feedback wording, stars |
| 04 | [04-perceptual-concepts-in-pictures.md](04-perceptual-concepts-in-pictures.md) | How 4–8-year-olds read size, depth, light/colour, weight, position, speed, temperature and sound in pictures; per-concept drawing rules; colour-blind safety; touch targets | 16 | 27 | drawing any concept picture or sound question |
| 05 | [05-educational-app-design-for-kids.md](05-educational-app-design-for-kids.md) | Evidence-based kids' app design: four pillars, seductive details, dark patterns, gamification, error feedback, accessibility, parent view, ICO children's code | 15 | 24 | any UI / reward / feedback / privacy decision |
| 06 | [06-music-concepts-and-piano.md](06-music-concepts-and-piano.md) | KS1 music + Model Music Curriculum Y1–2, pitch-direction naming, left-low/right-high on the keyboard, Kodály/Orff/Dalcroze, music and attention (honest) | 10 | 23 | sound questions, piano teaching features |
| 07 | [07-uk-curriculum-concept-map.md](07-uk-curriculum-concept-map.md) | Every basic concept by end of Year 2 from EYFS + KS1 (maths, science, English, music, art): **master table of 127 concept pairs**, 11 teaching units | 13 | 17 | "what is still missing?", unit order, curriculum wording |

**Audit of what the app actually uses:** [APPLIED.md](APPLIED.md) — all 111 rules: 47 done, 39 partly, 24 not yet (2026-10-27, v1.26).

## Ask → where

| Question | Look in |
|---|---|
| Which concepts exist, and which should come next? | 07 master table + unit list; 01 concept table with ages |
| At what age is a concept usually secure? (left/right, between, before/after, less) | 01 F-sections on acquisition order; 04 (left/right ~7 own body, 8–9 on others) |
| How do I teach a brand-new concept? | 01 (one pole first, "big / not big", then the contrast, then -er); 03 (block new, then mix) |
| How many questions per pop-up, how long, how often? | 02 rules (2–3 questions, 30–60 s, ≤ ~1 per 5 min, ~4 an hour); 03 (2–4 items) |
| When is a concept "learned"? When does it come back? | 03 rules (≥80 % over ≥3 days and ≥3 picture sets; review +1, +2, +4, +7, +14 days; a miss steps back one gap); 01 (never judge from one pop-up) |
| Should we mix concepts or keep one at a time? | 03 (interleaving evidence thin below 8: block first, then mix); 01 |
| What do we say after a wrong answer? After a right one? | 03 (immediate, show the right one, process praise); 05 (informational praise, no buzzer, no coins) |
| Stars, ⚡ speed stars, badges: good or bad? | 03 (Deci 1999: expected rewards cut children's interest, d ≈ −0.4); 05 (no per-tap rewards); 02 (small immediate rewards help attention) — tension noted in both |
| Movement breaks: do they help? How long? | 02 (Mahar 2006 +8 % on-task, least-focused +20 %; Watson 2017; ~1 in 4 pop-ups, 20–60 s) |
| Does the app "train attention"? | No — 02 and 06 (near transfer only; music → attention g ≈ 0–0.26). Do not claim it. |
| How to draw darker/lighter safely for colour-blind boys? | 04 (same hue, lightness step ≥ 20 L*, greyscale test); 05 |
| How to draw closer/further, heavier, full/empty, fast/slow, in front/behind? | 04 per-concept rules |
| How to ask high/low, loud/quiet, long/short with real notes? | 06 rules (big gaps first: ≥ an octave, never < 2 semitones; one dimension at a time; tie to the keys); 04 sound section |
| Which words have two meanings (light, short, high, soft)? | 07 (rule R4: one meaning per unit, with a context icon); 04 |
| How big should answer targets be? Where on screen? | 04 (avoid top-left/edges, big cards, balanced correct side); 05 (≥ 2 cm) |
| Can we interrupt his piano playing? When? | 02 (natural pause only, visible "N more then back to your song", return to the same place) |
| Privacy / what a parent sees | 05 (ICO children's code defaults: on-device only, no profiling; tell the child) |
| What does the curriculum literally require (vs non-statutory notes)? | 07 F-sections |

## What the app already follows (concepts.js, 2026-10-27)

| Rule | Source | In the app |
|---|---|---|
| One word of a pair first, then the other, then mixed | 01, 03 | phases 0 → 1 → 2 |
| First sight of a word is shown, not tested (errorless start) | 01, 03 | teach card: the right one glows, he taps it |
| New picture every question (multiple exemplars) | 01, 03, 04 | every question is generated: other objects, colours, sizes |
| One dimension changes, others equal; big steps | 04 | same object/glass/hue; sizes ≥ 1.8×; lightness 24–32 vs 70–80 %; heavy and light drawn the same size |
| Learned only after ≥ 2 different days; reviews +1/+2/+4/+7/+14 days; a miss steps back one gap | 03 | `NEED`, `days`, `GAP` (days) |
| 2 questions (1–3), natural pause, "N questions, then back to your song" | 02 | every 5 min of playing (3/5/8/10/off), after 1.5 s without notes; title line |
| ≤ 4 pop-ups an hour | 02 | `HOUR_MAX` |
| Stop kindly after 2 misses (fatigue) | 02, 03 | ends the game, back to playing |
| Movement card ~1 in 4 | 02 | every 4th pop-up, 7 s auto-continue |
| Darker/lighter late (Y3 enrichment), same hue | 04, 07 | last in the order; one hue |
| Left/right not a target yet | 01, 04 | not included |
| Sounds: big pitch gaps, one dimension each, tie to the keyboard | 06 | 12–19 semitones; same note for loud/quiet and long/short; "high notes live on the right" |
| Two meanings kept apart | 07 | "lighter colour" vs "see-saw … lighter" |

## Open / not yet applied (decide with the operator)

- 3 pictures (small–medium–large) for *checking* once learned (01) — now always 2.
- ≥ 3 different picture sets before "learned" (03) — pictures vary, but sets are not counted yet.
- ⚡ speed star vs research against expected rewards (03/05) — kept because the operator wants fast, correct answers; watch his interest.
- "Skip" button on the pop-up (05: no blocked exits) vs the operator's wish that he answers to get back — currently no skip; the Menu still works.
- Use notes from the song he is playing for sound questions (06).
- Remaining concept pairs from the 07 master table (more/fewer → compare, before/after, earlier/later, half/whole, hard/soft, rough/smooth, shiny/dull, turns…).
