# Bug history

Every bug fixed in Piano Lessons, newest first, from the CHANGELOG and the commit messages. Each entry says what was seen, why (when it was recorded), how it was fixed, and the rule that would have caught it. The child is "Sam" or "he" here. The device is the Huawei MatePad, 1024 × 607 CSS px landscape.

When a tablet test in [FEATURES.md](FEATURES.md) fails, add an entry here once it is fixed, and put its check under **Patterns** if it is a new kind of bug.

---

### 1.35 — Menu and Close hidden under the maths quiz
- **Symptom:** during the maths quiz between lessons (also the quick concept game and the calm screen) the 🔒 Menu and ✕ Close buttons could not be tapped until the sum was solved. In Maths-only, Writing, Colouring and Bigger or smaller there was no Close at all (found by the first run of `tests/device-check.mjs` on the tablet).
- **Cause:** the quiz layer is `position: fixed`, `z-index: 9`, full screen, so it covered the header with both buttons.
- **Fix:** a MutationObserver on `#quiz`, `#concept` and `#calm` sets `body.kidtop` while any of them is open; CSS then lifts `#lock` and `#quitBtn` to the top right at `z-index: 10`. The PIN gate comes later in the DOM, so it still opens over them. Maths-only, Writing, Colouring and Bigger or smaller keep Close in their top bar (`:not(#quitBtn)` added to their hide rules).
- **Lesson / check next time:** every new full-screen layer must be added to `kidLayers`, and checked with `document.elementFromPoint()` on the centre of Menu and Close while it is open: the element found must be the button.

### 1.34 — Song notes with no key ("lots of fails")
- **Symptom:** in some songs (Interstellar) notes could not be played; the keyboard also jumped during songs.
- **Cause:** the keyboard showed 2 octaves and shifted to follow the notes; with the hands 3 octaves apart (left E2, right up to E5) some notes had no key on screen.
- **Fix:** `pianoKeys.fit(lo, hi)` sets the keyboard once at song start to cover every note (up to 85 keys) and it never moves; `restore()` puts his zoom back at the end.
- **Lesson / check next time:** run a check over ALL songs, not one: 0 jumps and every note has a visible key.

### 1.32 — Song card text spilled out of the card
- **Symptom:** song cards with a two-line title pushed their note count out of the card (Hard and Custom tabs).
- **Cause:** not recorded (rows did not grow with the text, and long words did not wrap).
- **Fix:** rows grow to fit, smaller text (15 / 12 px), long words wrap. Checked: 0 overflowing cards in all tabs.
- **Lesson / check next time:** for any list, test the longest title in every tab and check each card's `scrollHeight <= clientHeight`.

### 1.31 — Caught long notes vanished at once
- **Symptom:** a long note disappeared the moment he pressed it, so it looked short.
- **Cause:** not recorded (the caught bar was removed on the press instead of at its end time).
- **Fix:** a caught bar keeps flowing into its key until its time is up.
- **Lesson / check next time:** a visual for a timed thing must last as long as the thing; test with a song that has long notes.

### 1.29 — Lucky hits by banging keys
- **Symptom:** banging many keys moved the song on, as if he had played it.
- **Cause:** any press of the right key counted, even among many wrong ones.
- **Fix:** a right key pressed while 3+ wrong keys went down in the last 1.5 s counts as a miss.
- **Lesson / check next time:** every "correct" check in a game must be tested against random mashing, not only against the right answer.

### 1.28 — Slow-down pause too strict
- **Symptom:** one burst of fun mashing or one palm slam already paused the piano (operator: "a little fun is OK").
- **Cause:** the pause came on the first burst.
- **Fix:** it starts on the 3rd burst within 10 s; the diary `mash` logs `bursts`.
- **Lesson / check next time:** a behaviour limit needs a tolerance setting and a test with real child play, not only with adult tests.

### 1.27 — PIN waited before opening the Menu
- **Symptom:** after the 4th digit the Menu sometimes opened late.
- **Cause:** the submit was on a frame callback (`requestAnimationFrame`), which can wait while the page is busy or in the background.
- **Fix:** submit with `setTimeout` 30 ms.
- **Lesson / check next time:** never put a must-happen action on a frame callback; use a timer.

### 1.26 — The child's name did not save
- **Symptom:** the name typed in the Menu was lost, so the voice never said it.
- **Cause:** it saved only when the field lost focus; closing the Menu first skipped that.
- **Fix:** a visible ✓ Save button, plus saving on every key typed; saving says the name once.
- **Lesson / check next time:** any setting that is typed must save on input, not on blur; test by typing and closing the Menu at once, then reopening.

### 1.26 — PIN keypad slow to react
- **Symptom:** the keypad felt slow; the Menu opened 150 ms after the finger lifted.
- **Cause:** the keypad reacted on `click` (when the finger lifts) and waited 150 ms.
- **Fix:** keys react on touch-down; the 4th right digit submits at once.
- **Lesson / check next time:** buttons a child or a hurried grown-up taps react on `pointerdown`.

### 1.26 — Screens opening over each other
- **Symptom:** a concept game could open on top of the Menu, the quiz, the mistake screen, the sound picker, the eye cover or a lock; the native key layer took up to 0.4 s to notice a new screen.
- **Cause:** each screen decided on its own; the native layer only re-checked on Menu and body changes.
- **Fix:** one `coverOn()` check; a concept game never opens over a cover and closes quietly if a lock or the eye cover comes; the native layer re-checks at once when any of these opens or closes.
- **Lesson / check next time:** one list of covers, one function; every new layer is added to it and to the native layer's observer.

### 1.26 — Beat ring stuck and beat clicking on other screens
- **Symptom (tablet test drive):** the green "on the beat" ring stayed on every dot; the beat kept clicking on the home screen, maths, writing, colouring and Bigger or smaller.
- **Cause:** the ring stayed lit after its beat; the body keeps the `solo` class under those screens, so the beat thought Piano only was still open.
- **Fix:** the ring flashes on the hit beat for a moment; the beat stops when he leaves Piano only for any other screen.
- **Lesson / check next time:** never use a mode class that stays on under other screens to decide whether audio runs; check every exit from the screen.

### 1.25 / 1.26 — Maths levels too hard
- **Symptom:** level 7 (1.25) and then level 5 (1.26) were too hard for him.
- **Cause:** levels went up after 5 right in a row with no ceiling on how high.
- **Fix:** top level 4; level 5 opens only after 100 right in a row with no hint; a saved level 5 comes back to 4 once (`quizCapV`).
- **Lesson / check next time:** level rules need a ceiling and a migration for saved levels; watch the diary for long runs of mistakes at a new level.

### 1.24 — Piano notes sounding from other screens
- **Symptom:** with the grand piano, drawing in Colouring, tapping Bigger or smaller, the home screen or Menu settings over where the keys sit played notes.
- **Cause:** the native touch layer over the keys stayed live under those screens (the body keeps the `play` class under them).
- **Fix:** a key is handed to the native layer only while `elementFromPoint` shows it uncovered, re-checked at once when a screen opens; a touch that lands on no key passes through to the page.
- **Lesson / check next time:** native layers above the WebView must ask "is this spot visible?", not "which mode is on?"; test by tapping where the keys were on every other screen.

### 1.24 — Bigger or smaller stuck on one kind of question
- **Symptom:** a stage asked the same type of question again and again, and he could get blocked at a stage.
- **Cause:** not recorded (stages did not mix question types).
- **Fix:** every stage mixes types and reviews earlier stages; the same type never three times in a row.
- **Lesson / check next time:** practice games interleave; check the question sequence for runs.

### 1.23.1 — Home tiles ran off both edges
- **Symptom:** with five tiles (1.23) the home screen cut tiles off on both sides.
- **Cause:** not recorded (the tile size was not reworked for a fifth tile).
- **Fix:** one row that fits in landscape, two rows in portrait, sideways scroll on a too-narrow screen.
- **Lesson / check next time:** after adding an item to any row, check at 1024 × 607 that no element's box goes past the window.

### 1.22 — Example name in public files
- **Symptom:** the changelog example and the name field placeholder did not use a neutral name.
- **Cause:** not recorded.
- **Fix:** neutral example name ("Sam") in the changelog and the placeholder.
- **Lesson / check next time:** before every commit, grep the diff for the child's name, the PIN and private song titles; the repo is public.

### 1.21 — Icons missing on the tablet
- **Symptom:** the drawn instrument icons showed fine in desktop Chrome but not on the tablet.
- **Cause:** the WebView asset loader served only `sounds/`, `fonts/` and `colour/`, so `js/icons.js` came back empty.
- **Fix:** the loader also serves `js/` as `application/javascript`.
- **Lesson / check next time:** every new asset folder needs a loader route; desktop Chrome is not a test, check on the device.

### 1.21 — "Unlock now" could not unlock a used-up screen-time lock
- **Symptom:** the grown-up tapped Unlock now; a second later the lock came back, so the app could not be unlocked at all (workaround: + 15 min today).
- **Cause:** the unlock cleared the lock but the time was still used up, so the next tick locked again.
- **Fix:** Unlock now adds 15 minutes when the limit is used up; the button says so.
- **Lesson / check next time:** test every unlock with the condition that caused the lock still true, and wait for the next tick.

### 1.21 — Sound picker labels in the wrong order after a language change
- **Symptom:** after changing language, sound buttons showed other sounds' names.
- **Cause:** the relabel used the `INSTR` order, not each button's id.
- **Fix:** each button is found by its id.
- **Lesson / check next time:** relabel by id, never by position; test a language change after the list changed.

### 1.20 — Sound picker cut off on phones
- **Symptom:** on a screen shorter than the tablet (S20, 696 × 346) the picker was cut off and could not scroll.
- **Cause:** sized for the tablet only, with no scrolling.
- **Fix:** it scrolls, with wider buttons, when the screen is shorter; the tablet still shows all on one screen.
- **Lesson / check next time:** test full-screen panels on the smallest device in use too.

### 1.20 — Wrong animal recordings
- **Symptom:** the Cat sounded like a revving engine; Cow and Duck were people saying the word.
- **Cause:** the Wikimedia files were not what their names said.
- **Fix:** a real meow (checked by spectrogram); Cow, Duck, Elephant, Frog removed.
- **Lesson / check next time:** listen to (or look at the spectrogram of) every new recording before shipping.

### 1.16 — Sci-fi silent at the top
- **Symptom:** Sci-fi made no sound from F#6 up.
- **Cause:** the sound set's recordings there are silent.
- **Fix:** silent recordings (peak < 0.001) are marked and skipped; the nearest real note is stretched. Applies to every sound.
- **Lesson / check next time:** check every new sound set for silent notes across the whole range.

### 1.13 — Octave tag hidden at some key sizes
- **Symptom:** at some zoom sizes the octave tag was not visible.
- **Cause:** not recorded (it sat where the black keys cover it).
- **Fix:** the tag moved below the black keys.
- **Lesson / check next time:** test labels at every zoom size, not the default only.

### 1.12 — Piano answered slowly (~120 ms)
- **Symptom:** a delay between a touch and the note.
- **Cause:** Huawei routes Java audio streams to the deep primary output (~120 ms); the page touch path added 9–15 ms.
- **Fix:** a C++ AAudio engine with an exclusive MMAP stream (~8 ms) and native touch over the keys (2–3 ms).
- **Lesson / check next time:** measure touch-to-sound on the device (`window.pianoLag`), never assume.

### 1.12 — First native engine clipped
- **Symptom:** the native piano distorted when loud.
- **Cause:** the pan gave × 1.414 and a hard soft-clip.
- **Fix:** the output stage copies the page's chain (equal-power pan, Chrome-default compressor with make-up gain, loudness limit).
- **Lesson / check next time:** a second engine must match the first one's output stage; A/B test them on the device.

### 1.11 — Video oversized in Normal view
- **Symptom:** in Normal view the video was cropped like Big video.
- **Cause:** not recorded (the oversize rule applied to Normal view too).
- **Fix:** only Big video (and Play along) is oversized; Normal view shows the whole 16:9 video.
- **Lesson / check next time:** test every layout mode after a video-size change.

### 1.11 — Key sound late
- **Symptom:** the key felt laggy.
- **Cause:** samples have 5–22 ms of silence at the start, and the sound started after the key highlight restyle.
- **Fix:** sampled sets start past their silence; the sound starts before the highlight.
- **Lesson / check next time:** sound first, visuals after; trim sample onsets.

### 1.11 — Screens scrolled instead of fitting
- **Symptom:** the quiz, the "Stop and think" screen and the mini-lessons scrolled on the tablet and the phone.
- **Cause:** fixed sizes taller than the screen.
- **Fix:** they scale down (never up) to fit, with no scrolling.
- **Lesson / check next time:** no page scroll at 1024 × 607: check `document.scrollingElement.scrollHeight <= innerHeight` on every screen.

### 1.10 — Screen stuck on 🔊 (speech freezes)
- **Symptom:** when speech was cut off (lock screen, a voice setting switched off, a language change), the mistake screen could wait on 🔊 forever; mini-lesson steps were cut after 15 s; slow voices (SherpaTTS) broke the timer.
- **Cause:** the cut-off speech never called back the screen waiting for it; the safety timer did not allow for voices that prepare the whole sentence first.
- **Fix:** `hush()` tells the waiting caller; the lost-callback timer is generous until audio starts, then sized to the speech; mini-lesson step caps are sized to the text.
- **Lesson / check next time:** every wait on speech has a timeout and a cancel path; test with speech off, with a lock in the middle, and with a slow voice engine.

### 1.7.1 — Voice quiz cut him off
- **Symptom:** a pause in "twelve minus three … is nine" ended the answer early and it was judged wrong.
- **Cause:** not recorded (each pause ended the answer).
- **Fix:** pauses are joined into one sentence; a wrong-sounding answer is judged only after 2.5 s of silence.
- **Lesson / check next time:** test voice input with a child's pace, pauses included.

### 1.6 — Guessing by elimination
- **Symptom:** he could tap answers until one was right.
- **Cause:** not recorded (a wrong tap cost nothing).
- **Fix:** "Stop and think" screen, a freeze that grows, a new question after a mistake, 2 s think time.
- **Lesson / check next time:** for every quiz, ask "can random tapping win?".

### 1.5 — Video volume wrong at start-up
- **Symptom:** the video volume was not right when the app started.
- **Cause:** not recorded.
- **Fix:** the volume is restored at start.
- **Lesson / check next time:** check saved settings are applied on a cold start.

### 1.5 — First key made no sound
- **Symptom:** the first key press was silent.
- **Cause:** not recorded (the fix resumes audio on the first touch, so the audio was still suspended).
- **Fix:** audio resumes on the first touch.
- **Lesson / check next time:** test the very first touch after a cold start.

### 1.5 — Stuck notes and two fingers on one key
- **Symptom:** notes kept sounding; two fingers on one key misbehaved.
- **Cause:** releases were lost when the window lost focus; the two-finger case is not recorded.
- **Fix:** all notes stop on blur; a key tracks every touch on it.
- **Lesson / check next time:** test multi-touch, sliding off a key, and leaving the app with keys held.

### 1.5 — Video cropped in play/big mode
- **Symptom:** the video was cut off in Play along / Big video.
- **Cause:** not recorded.
- **Fix:** letterboxed (later, 1.11, cropped on purpose at the top so the lesson keyboard lines up).
- **Lesson / check next time:** check the video fit in every mode after any layout change.

### 1.3 — YouTube overlays at the start of a video
- **Symptom:** YouTube's title and "more like this" overlays showed, a way out of the playlist.
- **Cause:** the embed's own overlays.
- **Fix:** the iframe is drawn 120 px taller so the overlays fall outside; a tap pauses and shows the app's own Play screen.
- **Lesson / check next time:** on every lockdown change, look for any YouTube link or suggestion on start, pause and end.

### 1.1 — "More videos" on pause and end
- **Symptom:** the pause and end screens showed YouTube's "More videos".
- **Cause:** the embed's pause/end screens.
- **Fix:** the app covers them with its own screens.
- **Lesson / check next time:** same as 1.3.

---

## Patterns

Recurring bug classes, and the check that catches each.

| Bug class | Seen in | Check that catches it |
|---|---|---|
| **Overlapping layers / z-index**: one screen covers the grown-up buttons or opens over another | 1.35, 1.26 (covers), 1.24 (native layer) | Every full-screen layer is in `kidLayers` and `coverOn()`. With each layer open, `elementFromPoint` on the centre of Menu and Close must return those buttons; the PIN gate must still open above. |
| **Audio or input leaking between screens**: a mode class stays on under another screen | 1.26 (beat), 1.24 (piano notes) | Decide by "is it visible?" (`elementFromPoint`), not by a body class. From every screen with sound, go to every other screen and check silence; tap where the keys were. |
| **Layout overflow on the 1024 × 607 tablet** (and smaller phones) | 1.23.1 tiles, 1.32 cards, 1.20 picker, 1.11 scroll, 1.13/1.33 labels | On every screen and tab: no page scroll, no element box past the window, card `scrollHeight <= clientHeight`; repeat at every zoom size and on the smallest phone. |
| **Saving state**: a setting lost or a lock that never clears | 1.26 name, 1.21 unlock, 1.18 records, 1.5 volume | Type and close at once, then cold-start and check. Unlock with the cause still true and wait for the next tick. Saved values above a new limit need a one-time migration. |
| **Voice and speech freezes** | 1.10, 1.7.1 | Every wait on speech has a timeout and a cancel; test with voice off, with a lock arriving mid-speech, with a slow engine, and with a child's pauses. |
| **Timing on frame callbacks or click** | 1.27 PIN, 1.26 keypad | Must-happen actions use timers, not `requestAnimationFrame`; kid and PIN buttons react on `pointerdown`. |
| **Device-only differences** (desktop Chrome passes, tablet fails) | 1.21 icons, 1.12 latency | Every change is ticked only after it passes on the tablet (`tests/device-check.mjs`); new asset folders need a loader route. |
| **Games that random tapping can win, or that are too hard** | 1.29, 1.28, 1.25/1.26, 1.24, 1.6 | Test each game with mashing and random taps; levels have a ceiling; watch the diary for runs of mistakes. |
| **Content that is not what it says** (sounds, songs) | 1.20 animals, 1.16 sci-fi, 1.34 songs | Listen / spectrogram every recording; check every note of every sound and every song, not a sample. |
| **Privacy in the public repo** | 1.22 | Grep every diff for the child's name, the PIN, keys and private song titles before committing. |
