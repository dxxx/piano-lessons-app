# flowkey, Skoove, Simply Piano: feature and mechanics dossier (as of 1 Nov 2026)

Research limits: about 20 tool calls. Several fetches failed (flowkey pricing page 404, pianoers pages, most unstar pages). No Reddit threads, Trustpilot, Play Store pages, patents or engineering talks were reached. Many "review" sites are templated or aggregator pages; weight accordingly. Items under Gaps were NOT found.

## Lesson/song screen layout, cueing, and right/wrong/chord feedback

### Takeaway
flowkey = split screen of overhead pianist-hands video plus synced scrolling sheet music, with upcoming notes lit on a keyboard graphic. Simply Piano = scrolling-note interface with Soloist and Chords tracks. Skoove = sheet music from lesson 1 in a Listen/Learn/Play structure with hand-position video. Per-event right/wrong/chord feedback details were mostly not found.

### Cited Findings
- flowkey (own App Store text): "Video: watch a professional pianist, with upcoming notes highlighted on a keyboard graphic"; "Full Sheet Music View: traditional notation in portrait mode on tablets"; "Just Play: keeps pace with the score even if you miss a few notes"; "Wait Mode: the score waits for the correct notes or chords." — [App Store UK](https://apps.apple.com/gb/app/id1020357408)
- flowkey layout per a 2026 comparison: split screen, overhead view of pianist's hands beside sheet music scrolling in sync — [HackerNoon](https://hackernoon.com/best-piano-learning-apps-in-2026-an-in-depth-comparison-of-music-education-technology)
- Skoove: shows sheet music from the first lesson, not only falling notes; lessons follow right hand, left hand, hands together — [HackerNoon](https://hackernoon.com/best-piano-learning-apps-in-2026-an-in-depth-comparison-of-music-education-technology)
- Skoove lessons structured Listen / Learn / Play: full-song preview first, then watch with notation and hand-position video, then play; learners can repeat a stage before advancing — secondary summary of reviews via [search result](https://pianoers.com/skoove-review/) (page itself not fetched)
- Skoove AI "pauses when you slow down and flags wrong notes so you can correct them" (reviewer description) — [HackerNoon](https://hackernoon.com/best-piano-learning-apps-in-2026-an-in-depth-comparison-of-music-education-technology)
- Simply Piano: scrolling-note interface with two tracks, "Soloist" (melody) and "Chords" (accompaniment); reviewer opinion that scrolling notes can hinder sight-reading — [HackerNoon](https://hackernoon.com/best-piano-learning-apps-in-2026-an-in-depth-comparison-of-music-education-technology)
- Simply Piano App Store: "live feedback: immediate responses on your playing"; lessons move from reading notation to both hands; user review: progression "from a few notes to full backing tracks" — [App Store UK](https://apps.apple.com/gb/app/simply-piano-learn-piano-fast/id1019442026)

### Inferences
- Borrowable: upcoming-note highlight on the keyboard graphic (flowkey), wait-for-all-notes-of-a-chord, Listen/Learn/Play staging (Skoove). Wait mode is the lowest-frustration pattern for a 6-year-old.

### Gaps
- Exact right/wrong-note animations, sounds, colours and chord handling per app: not found.
- Finger-number display: not confirmed for any app.

## Practice tools (wait, tempo, loop, hands, metronome, backing, auto-scroll)

### Takeaway
flowkey has the richest documented toolset. Skoove advertises tempo control and looping. Simply lets library songs be slowed.

### Cited Findings
- flowkey: Loop ("repeat chosen sections"), Select a Hand, Wait Mode, Just Play — [App Store UK](https://apps.apple.com/gb/app/id1020357408)
- flowkey slow playback at 50% and 75%, left/right/both toggle, looping, and NO built-in metronome — [HackerNoon](https://hackernoon.com/best-piano-learning-apps-in-2026-an-in-depth-comparison-of-music-education-technology); 50%/75% also in a teacher review snippet, [Pianoers via search](https://pianoers.com/flowkey-review/), which also lists "feedback system is too forgiving" as a con
- Skoove: "practice tools, including tempo control and looping" — [App Store UK](https://apps.apple.com/gb/app/skoove-learn-piano/id1160668178). User requests there: "a constant repeat mode even when successful," ability to select sections for practice, no search or bookmarking (only three reviews were visible)
- Skoove: a late intermediate lesson ramps boogie-woogie speed stage by stage up to 260 bpm — secondary review via [search](https://pianoers.com/skoove-review/)
- Simply Piano: "library songs can be slowed down"; personalised five-minute workouts — [App Store UK](https://apps.apple.com/gb/app/simply-piano-learn-piano-fast/id1019442026)

### Inferences
- No source says how loop sections are chosen (manual drag vs auto phrase). A kid app should auto-segment MIDI into phrases/bars.

### Gaps
- Exact Skoove and Simply tempo percentages; Simply loop/hand-split; backing-track controls; auto-scroll behaviour: not found.

## Input: mic vs MIDI, accuracy, latency, polyphony

### Takeaway
All three support microphone and MIDI/Bluetooth; MIDI is reported as more reliable. Mic note-miss complaints are the top theme. An on-screen piano avoids this entirely.

### Cited Findings
- flowkey: microphone or Bluetooth/MIDI; App Store review themes include missed-note detection and screen freezing — [App Store UK](https://apps.apple.com/gb/app/id1020357408). Mic misses fast passages — [HackerNoon](https://hackernoon.com/best-piano-learning-apps-in-2026-an-in-depth-comparison-of-music-education-technology). One user says wait mode sometimes misses correct notes, another says only advanced songs — [search summary](https://pianoers.com/flowkey-review/)
- Skoove: USB MIDI, Bluetooth MIDI, or mic; a user says audio input "often doesn't recognise a note"; developer reply says MIDI/USB/Bluetooth are unsupported in "Piano Beginner 1" for "technical reasons" — [App Store UK](https://apps.apple.com/gb/app/skoove-learn-piano/id1160668178). Mic good on two-hand passages, MIDI more accurate — HackerNoon
- Simply Piano: reviewer names the engine "MusicSense"; good on single-note melodies, misreads fast polyphonic passages and noisy rooms — HackerNoon. App Store review: mic input intermittently stops recognising after a MIDI connection was detected — [App Store UK](https://apps.apple.com/gb/app/simply-piano-learn-piano-fast/id1019442026)
- Aggregator claim: pitch mishearing is 28% of low ratings across five apps (not per app; methodology unclear) — [Unstar via search](https://unstar.app/blog/yousician-simply-piano-flowkey-fender-play-music-learning-apps-ranked-2026)

### Inferences
- With touch keys, hit detection is exact, so timing tolerance can be set purely for pedagogy.

### Gaps
- Latency numbers, polyphony limits, patents, engineering blog posts or talks on detection engines or arrangement simplification: none found.

## Progression, difficulty levels, scoring, streaks, rewards

### Takeaway
flowkey: every song in four difficulty levels. Skoove: course/lesson path with adaptive-pacing claims. Simply: linear course path with gamified rewards and 5-minute workouts. Stars/% scoring specifics not confirmed.

### Cited Findings
- flowkey: "thousands of arranged pieces ... each available at four difficulty levels"; beginner courses cover reading, keyboard navigation, both hands; advanced cover scales, chords, improvisation — [App Store UK](https://apps.apple.com/gb/app/id1020357408)
- Skoove: "500+ lessons and courses, split into short segments"; developer claims 2 million+ users — [App Store UK](https://apps.apple.com/gb/app/skoove-learn-piano/id1160668178). Another review says 400+ lessons across 10 courses (conflicts, likely older) — [search](https://pianoers.com/skoove-review/)
- Skoove marketing claims a flexible curriculum with no fixed sequence and adaptation to pace (own marketing, unverified); describes Simply as "linear progression" (competitor's wording) — [Skoove blog](https://www.skoove.com/blog/?p=10044)
- Simply: courses organised by style and skill level; two free courses; Premium adds more with new content monthly — [App Store UK](https://apps.apple.com/gb/app/simply-piano-learn-piano-fast/id1019442026). Course count conflicts: 28 in two paths (Pianoers) vs 33+ (Learnopoly) — [search](https://pianoers.com/simply-piano/)
- Reviewer: Simply gamified rewards drive motivation; Skoove "mature interface without heavy gamification" — HackerNoon

### Inferences
- Four levels per song maps to MIDI: derive easier variants (melody only, one hand, simpler rhythm) from one file.

### Gaps
- How levels simplify arrangements, star/% scoring, streak rules, daily goals: not found.

## Onboarding and kid/family features

### Takeaway
None is built for a 6-year-old; Simply has the most explicit child content. All show App Store age rating 4+.

### Cited Findings
- Age rating 4+ for all three — App Store UK listings linked above
- flowkey Family: separate Premium accounts for up to 5 people — [App Store UK](https://apps.apple.com/gb/app/id1020357408). Kids not addressed; interface adult-focused (reviewer) — HackerNoon
- Skoove: recommended for ages 6-14 (reviewer, HackerNoon); Skoove's own page claims a browsable kids' song library, and says Simply gives ages 4-10 a "customized experience" but only the first few courses (competitor marketing) — [Skoove blog](https://www.skoove.com/blog/?p=10044)
- Simply: Touch Courses use the device screen as a virtual keyboard — [App Store UK](https://apps.apple.com/gb/app/simply-piano-learn-piano-fast/id1019442026). User reviews there say it works for children and adults. Reviewer: gamified supplement for under-6s — HackerNoon
- Simply family: UK App Store lists "Family Plan" £125.99 (and £25.49, period unlabelled); a promo page claims 6 members for $89.99/yr (unverified) — [search](https://pianoers.com/simply-piano/)

### Inferences
- Touch Courses are the closest competitor precedent for an on-screen-piano design.

### Gaps
- Parental controls, child-privacy behaviour, Soloist vs Chords specifics, onboarding flow: not found.

## Library size, genres, additions, licensing

### Takeaway
Counts are inconsistent and mostly unverified.

### Cited Findings
- flowkey: "thousands" of arrangements; genres Classical, Pop, Film & TV; new songs with updates — [App Store UK](https://apps.apple.com/gb/app/id1020357408). Reviewer reports licensed songs being removed — HackerNoon. flowkey Classic tier = classical and non-copyrighted songs only (App Store UK)
- Skoove: reviewer says 800+ songs, smaller than flowkey/Simply — HackerNoon; chart hits and classical per App Store listing
- Simply: pop and classical titles; monthly new content; no exact count — App Store UK, HackerNoon

### Inferences
- Public-domain songs avoid licence trouble; flowkey itself sells a non-copyright Classic tier.

### Gaps
- Actual licensing complaint threads: not found.

## Pricing and free tiers

### Takeaway
Sources conflict; UK App Store lists don't label billing periods. Verify on official pages before quoting.

### Cited Findings
- flowkey UK App Store IAPs: Premium £19.99, £27.99, £119.99, £164.99; Classic £18.99, £28.99, £109.99; yearly includes 7-day trial; free: limited beginner lessons and classical songs — [App Store UK](https://apps.apple.com/gb/app/id1020357408)
- flowkey USD (Feb 2026, reviewer): $19.99/mo or $119.88/yr; about 8 free songs; family about $269.99/yr — [HackerNoon](https://hackernoon.com/best-piano-learning-apps-in-2026-an-in-depth-comparison-of-music-education-technology). flowkey.com/en/pricing returned 404.
- Skoove UK App Store tiers: £17.99, £24.99, £32.99, £49.99, £124.99; trial tiers £8.99, £29.99, £49.99, £79.99, £99.99 — [App Store UK](https://apps.apple.com/gb/app/skoove-learn-piano/id1160668178)
- Skoove USD conflicts: $29.99/mo, $59.99/3mo, $149.99/yr, 25 free lessons (HackerNoon) vs $19.99/mo, $39.99/3mo, $119.99/12mo, 7-day trial without card (Skoove blog, own marketing). Lifetime list $299.99, deal prices $99.97-$149.99 in 2026 — [Boing Boing, Aug 2026](https://boingboing.net/2026/08/17/level-up-your-piano-skills-with-this-150-skoove-lifetime-subscription.html)
- Simply UK App Store IAPs range £13.99 to £125.99 (individual £83.99; 12-month with trial £83.99/£104.99; 20% off £66.99; family £125.99) — [App Store UK](https://apps.apple.com/gb/app/simply-piano-learn-piano-fast/id1019442026). USD: $19.99-$24.99/mo or $119-$150/yr, family about $179.99/yr (HackerNoon); Pianoers frames about $170/yr (Feb 2026). Two courses free.

### Gaps
- Official price pages not reached.

## User praise and complaints (2025-2026)

### Cited Findings
- Praise: flowkey wait mode, looping, arrangement quality (App Store UK, HackerNoon); Skoove Bluetooth pairing, interface, support replies (App Store UK); Simply fun, motivating, progression (App Store UK)
- flowkey complaints: missed detection, freezing, access problems after subscribing (App Store UK); no metronome, removed songs (HackerNoon)
- Skoove complaints: smaller library, no song search, steep monthly price, less motivating (HackerNoon, App Store UK)
- Simply complaints: billing/auto-renewal and hard cancellation heaviest of apps covered (Unstar 2026, aggregator) — [Unstar via search](https://unstar.app/blog/yousician-simply-piano-flowkey-fender-play-music-learning-apps-ranked-2026); overpriced, no monthly plan (Equipboard summary of Reddit); aggressive paywall (Marlvel)
- UK App Store ratings: flowkey 4.7 (~18k), Skoove 4.5 (~5.1k), Simply 4.7 (~178k) — listings above

### Gaps
- Trustpilot, Play Store and r/piano threads were not read directly.
