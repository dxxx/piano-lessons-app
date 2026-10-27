# Design ideas for piano-lessons-app

From the design prototype. Nothing was changed in the repo; these notes are for whoever builds it.
Open `Piano Lessons App.dc.html` and `Learning Modules.dc.html` to see each idea working.

## Look and feel
- Two directions to choose from. **A · Warm paper**: cream, walnut and felt red. **B · Night room**: ink blue with warm gold. B fits the current night-sky look in v1.11.
- One rounded font everywhere (Fredoka is already bundled, so keep it).
- Simple line icons instead of emoji in buttons: lock, clock, star, play, back/next, speaker, bulb. Emoji can stay in what the child hears.
- The "?" and wrong-answer screens are softer: a tinted background instead of flashing red. The calm grey screen could be the default.

## Start screen
- Five tiles: Piano, Maths, Writing, Colouring, Calligraphy. Each tile shows progress, e.g. "Lesson 3 of 12" or "Level 2 · 14 stars".
- Each app has a short splash screen in its own colour (about 1.5 s). Leaving it early cancels it.

## Play along (`.piano`, `.keys-row`, `.wk`, `.bk`, `.oct`)
- The big piano is the default: the keyboard runs edge to edge and takes about 58% of the height.
- The video fills the space above and is lined up to the bottom, so the keyboard in the lesson sits just above ours (as in `body.big`).
- A narrow strip of 4 lesson thumbnails sits on the right, with a "Big piano" toggle at the top.
- Slim ◀ ▶ octave arrows at each end; black keys labelled C# D# F# G# A#.

## Maths
- A **Maths path** strip runs across the top: levels 1–7 now, then planned 8 ×2 ×5 ×10, 9 ×3 ×4, 10 sharing ÷ and 11 ÷ with a remainder.
- **Trick visuals**, each in 4 steps:
  - Count on and Break ten: jumps on a number line.
  - Make ten: two ten-frames with dots moving across.
  - Ones first and Tens and ones: tens-sticks and ones-cubes.
- **Column sums**: tens and ones in blue and pink lanes. He taps the tens digit to "Trade 1 ten for 10 ones"; it is crossed out, the new digit is written small above, and the ones become ¹4. He types ones first, then tens, on a keypad. Each kind of slip gets its own kind message (as in v1.9).
- **Multiply**: a grid of dots in rows that light up with skip-counting (4 → 8 → 12). "Turn it round" swaps rows and columns. A right answer shows the 4 linked facts (×, × swapped, ÷, ÷).
- **Divide**: counters are dealt onto plates one at a time; any left over are shown, and the answer is checked with ×.
- **Stop & think**: after 2 wrong answers in a row, an 8-second breathing circle, then "I'm ready".
- **Welcome back**: after a grown-up unlocks, he chooses "Back to my lesson" or "Easy warm-up sum".
- Hearts shown in the top bar on every maths screen.

## Writing
- School lines, with the base line in red.
- Four steps for each letter: Watch (animated pen), Trace (thick guide), Dotted, On my own.
- Green start dot with the stroke number and a direction arrow.
- A gentle shake and "Oops, stay on the line"; stars are based on how often he went off the line.

## Colouring (`assets/colour`)
- 12 crayons in a 4×3 grid at the side, Undo, Start over, a progress bar ("Done at 85%"), and a gallery strip.
- A crossing into another shape shakes the picture and flashes the lines red, and counts toward the stars (0–1 ★★★, up to 4 ★★).

## Calligraphy (new)
- A wide pen nib at 40° on a ruled page with slant lines.
- Guides for downstrokes, ovals, arches, waves, and a free page.
- Choice of nib width (Thin / Medium / Wide) and 3 inks.

## Grown-ups
- The Menu is grouped into cards (Mode, Quiz, Mistakes, Screen time, Eye guard, App). It uses masonry columns in landscape and one column in portrait.
- The Activity page shows today's minutes against the limit, the questions he is practising with a status for each, and a list of events.
