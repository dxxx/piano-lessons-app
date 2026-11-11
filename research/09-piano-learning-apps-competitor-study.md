# 09 — Piano learning apps: what rivals do, what the evidence says, what to borrow
Last updated: 2026-11-01 · Researcher: subagents (4 dossiers + 2 gap passes + report writer) · Keywords: flowkey, skoove, simply piano, yousician, synthesia, piano marvel, hoffman, wait mode, loop, finger numbers, tempo, rewards, streaks, competitor, pedagogy

Full report with the comparison table, the price table and the evidence scorecard: `research/reports/Piano learning apps competitor study.md`. Raw notes: `research/research_notes/Piano learning apps competitor study/` (6 files, every claim with its URL).

## Answer in 5 lines
The app already has what the paid apps charge for: wait mode (Follow the keys, with pace adaptation nobody else has), hands separate with the other hand soft, 50/75/100 % speed, listen-first preview, stars, a metronome. Its edge is the on-screen piano: the rivals' top complaint is missed notes by microphone, and we have none. No rival is built for a 6-year-old (Skoove says 7+, Simply's child mode is iOS-only). No controlled study tests any piano-app mechanic in 5-7-year-olds; almost everything is teacher opinion or adult research. So the next gains are cheap and low-pressure: a calm wrong-note response, a "keep going" step after clean passes, phrase loops, fading finger numbers. Do not copy streaks, points multipliers, countdowns or red fail states.

## Findings
### F1. The three beginner apps all stop or hint on a wrong note; only the strict MIDI apps score harshly  `evidence: moderate (official help pages)`
Simply: blue = right, yellow = right after a hint, red only in "moving stages"; the correct key is lit yellow on the keyboard. flowkey Wait Mode holds for the right note or chord; "Just Play" keeps going through misses. Playground Sessions and Melodics turn notes red and reset streaks (reviewers call Playground "near-perfect or nothing"). No app documents how a chord is judged (all keys or any). [S1][S2][S3]
### F2. Only Yousician documents its loop and tempo mechanics  `evidence: strong for Yousician, weak for the rest`
Loop = two sliders on the progress bar plus an optional one-bar count-in; Practice mode restarts at the end of each pass; auto speed 25-125 % in 5 % steps. flowkey lists Loop and 50/75 % speeds (reviewer figures); Skoove has a Tempo button but not in every step; Simply shows tempo options only in moving stages. [S4][S5]
### F3. Finger guidance exists in every falling-notes product and is swapped for hand icons for young children  `evidence: moderate (official pages)`
Synthesia prints finger numbers on the blocks, left hand blue / right hand green, and lets a Part be Left, Right or Background (the app plays it). Yousician shows numbers 1-5 plus finger colours. Simply replaces numbers with hand icons for ages 4-10 in the first courses. Casio's lit keyboards speak the finger number and let the lights be switched off. [S6][S7][S2][S8]
### F4. Per-song difficulty levels: flowkey 4, Simply 3; nobody documents how the arrangement is simplified  `evidence: moderate for the counts, none for the method`
[S3][S9]
### F5. Rewards: the apps use weekly streaks with "freezes", XP, points multipliers 3x-5x; the research on children points the other way  `evidence: contested`
Deci, Koestner & Ryan 1999 (128 studies, abstract only): expected tangible rewards undermine free-choice motivation (d = -0.28 to -0.40), more in children; positive informational feedback helps (d = +0.33). Cameron & Pierce dispute it. Radesky et al. 2022 (160 children aged 3-5, 133 apps, full text): 64.7 % of apps had play-prolonging features, 45.1 % reward "lures", 17.3 % time pressure. Extending to age 6 is inference. [S10][S11][S12]
### F6. Practice quality beats practice quantity, in adults  `evidence: moderate, abstract only`
Duke, Simmons & Cash 2009 (17 piano majors, one 3-bar passage): the share of correct attempts predicted next-day retention; total time and repetition count did not. The often-quoted "slow down before the error spot" list is the authors' recommendation, not a measured finding. Interleaved vs blocked practice: Carter & Grahn 2016 (10 clarinettists) slightly favours interleaving, not significant. [S13][S14]
### F7. Six-year-olds synchronise to a beat more easily than they keep one alone; very slow beats are hard  `evidence: moderate, paper identification partly unconfirmed`
5-year-olds struggled with intervals around 1.5 s (about 40 BPM); children's spontaneous tapping tempo is about 400-500 ms (120-150 BPM) and slows with age. The "150-200 BPM natural tempo" figure in the first pass could not be matched to its paper. [S15][S16]
### F8. Session length for ages 6-8: 10-20 minutes, stop before frustration  `evidence: expert opinion`
Simply's own parent guidance: 10-15 minutes a few times a week. Teacher sources: 15-20 minutes at 6-8, 5-10 at 4-6. The AAP January 2026 statement (abstract only) leans on quality and "crowding out", not hour caps. [S17]
### F9. Falling notes vs staff notation: no transfer study exists; the "Synthesia trap" is competitor and teacher opinion  `evidence: expert opinion`
Method books agree on the order: black-key groups, middle-C position with finger numbers, five-finger patterns, steps and skips, note values, then staff from landmark notes (sound-before-symbol tradition: Kodály, Orff, Suzuki, Gordon). When hands-together and finger-number fading begin is not documented. [S18][S19]
### F10. Prices (for the record; all with conflicts)  `evidence: moderate`
Skoove official GBP: £24.99/mo, £49.99/3 mo, £124.99/yr. flowkey USD help-centre example: Classic $16.49/mo or $99.99/yr, Premium $24.99/mo or $149.99/yr, Family $37.49/mo or $224.99/yr; UK App Store tiers £19.99-£164.99 unlabelled. Simply publishes no list price (UK App Store tiers £13.99-£125.99). Yousician ~$119.99/yr (aggregator). Piano Marvel $17.99/mo, $129.99/yr. Synthesia £7.99 one-off (iOS UK). Hoffman $24/mo or $239/yr, videos free. [S20][S21][S22]

## Design rules for the app
- R1. Wrong note = calm: no buzzer, no red; the target key glows softly, retry allowed; several wrong presses within ~2 s pause with "Let's look at the glowing key" (F1, F5). *Check against the existing wrong-key flash and the mashing tortoise.*
- R2. After 2-3 clean wait-mode passes of a phrase, offer one "keep going" pass at his pace with no penalty; fall back to waiting after 1-2 errors (F1, F6; inference, thresholds are ours).
- R3. "Try this bit again": loop the 2-4 bar phrase he just struggled with, optional one-bar count-in, built from the MIDI steps (F2).
- R4. Finger numbers (or hand icons) on the lit key, fading to the first note of each phrase after a few successes; on/off in the grown-ups menu; TTS can say the number (F3).
- R5. Per-hand colours stay consistent everywhere (we use blue left / orange right already) (F3).
- R6. Spoken praise names effort and strategy ("You slowed down and got it"), never "wrong"; stars mark progress, never a bribe (F5).
- R7. After several clean plays of a song, dim the next-key cue so he finds keys from memory; the "lights are a gimmick" critique of lit keyboards (F3).
- R8. End of song: one friendly replay of the one or two tricky bars, not interruption mid-song (F1, Flashnote Derby pattern).
- R9. Grown-ups menu: weekly minutes and songs finished; a soft "that's enough for today" after 10-15 minutes, switchable (F8).
- R10. Beat: keep it optional with a visual pulse, avoid beats under ~60 BPM, judge timing leniently; a tap-along game with a 1-2-3-4 count-in before asking him to keep time while playing (F7).
- R11. Later and large: easier versions of a song generated from the MIDI (melody only → melody + root notes → full), and a small staff with landmark notes after ear and hand work (F4, F9).
- R12. Never: streaks with freezes, points multipliers, XP unlocks, leaderboards, countdowns, red fail states, speed-up rewards, a microphone path (F5, F1).

## Open questions / conflicting evidence
- How rivals judge chords (all keys vs any) and whether their wait modes have a fail state: undocumented.
- Whether wait mode, finger numbers or looping help a 6-year-old: no study; test on our one learner with every feature switchable.
- Beat papers from the first pass (Frontiers 2014, Sci Rep 2023) not matched exactly; the 150-200 BPM figure unconfirmed.
- Prices conflict between App Store tiers, help centres and reviewers; no Android GBP list found.
- Piano Maestro's 2026 status unclear (Simply's site no longer lists it).

## Sources
- [S1] Simply Piano help, 2026-09-14. *Learning with Simply Piano: the basics.* https://piano-help.hellosimply.com/en/articles/7943490-learning-with-simply-piano-the-basics — colour feedback and yellow hint key. (type: vendor help)
- [S2] Simply Piano help, 2026-06-15. *Is the app experience different for children?* https://piano-help.hellosimply.com/en/articles/8053114-is-the-app-experience-different-for-children — hand icons for ages 4-10. (vendor help)
- [S3] flowkey, Google Play listing, 2026-10-16. https://play.google.com/store/apps/details?id=com.flowkey.app — Wait Mode, Just Play, Loop, 4 levels. (store listing)
- [S4] Yousician help. *Practice and Play modes in piano.* https://support.yousician.com/hc/en-us/articles/204796991-Practice-and-Play-modes-in-piano — loop sliders, lead-in, 25-125 % speed. (vendor help)
- [S5] Skoove help (pre-2024). *Can I adjust the tempo?* https://help.skoove.com/en/articles/5421914-can-i-adjust-the-tempo-of-the-pieces-on-skoove (vendor help)
- [S6] Synthesia. *Your first song.* https://synthesia.app/support/guide/firstSong — Melody Practice, finger numbers, colours. (vendor guide)
- [S7] Yousician help (2024-era). *Notation options in piano.* https://support.yousician.com/hc/en-us/articles/208678605-Notation-options-in-piano (vendor help)
- [S8] Casio UK blog. *Will lighted keys teach me to play properly?* https://www.casio.com/uk/casio-blog/blog-post/will-lighted-keys-teach-me-to-play-properly/ (promotional, weak)
- [S9] HackerNoon, Feb 2026. *Best piano learning apps in 2026.* https://hackernoon.com/best-piano-learning-apps-in-2026-an-in-depth-comparison-of-music-education-technology (affiliate review, weak)
- [S10] Deci, Koestner & Ryan, 1999. *A meta-analytic review of experiments examining the effects of extrinsic rewards on intrinsic motivation.* Psychological Bulletin 125(6). DOI 10.1037/0033-2909.125.6.627 — abstract only. (meta-analysis)
- [S11] Radesky et al., 2022. *Prevalence and characteristics of manipulative design in mobile applications used by children.* JAMA Network Open. PMC9206186 — full text; ages 3-5. (descriptive study)
- [S12] Mueller & Dweck, 1998. *Praise for intelligence can undermine children's motivation and performance.* JPSP 75(1) — ages ~10-11, primary scan unreadable. (experiment)
- [S13] Duke, Simmons & Cash, 2009. *It's not how much; it's how.* JRME 56(4). DOI 10.1177/0022429408328851 — abstract via Crossref. (observational, n=17 adults)
- [S14] Carter & Grahn, 2016. *Optimizing music learning: exploring how blocked and interleaved practice schedules affect advanced performance.* Frontiers in Psychology — full text, n=10. (experiment)
- [S15] Bobin-Bègue et al., 2014. Tapping in 3- and 5-year-olds. https://pmc.ncbi.nlm.nih.gov/articles/PMC4256987 (experiment)
- [S16] Children's spontaneous tempo ~400-500 ms. https://pmc.ncbi.nlm.nih.gov/articles/PMC4166894/ (experiment)
- [S17] Simply Piano help. *Effortless ways you can help your child.* https://piano-help.hellosimply.com/en/articles/9202884-effortless-ways-you-can-help-your-child-to-get-the-most-from-simply-piano (vendor guidance, weak)
- [S18] Pianist's Compass, 2026-01-28. Hoffman Academy review and sound-before-symbol tradition. https://pianistscompass.org/?p=12549 (practitioner review)
- [S19] Cheng et al., 2024. *Exploring the comprehensibility of ten different musical notation systems.* https://eprints.whiterose.ac.uk/220861/ — search summary only. (study)
- [S20] Skoove help, 2026-02-11. *What is Skoove Premium and how much does it cost?* https://help.skoove.com/en/articles/5417607-what-is-skoove-premium-and-how-much-does-it-cost (vendor help)
- [S21] flowkey help. *Which subscription plans are available?* https://help.flowkey.com/en/articles/4466337-which-subscription-plans-are-available (vendor help)
- [S22] Piano Marvel pricing. https://pianomarvel.com/pricing (vendor)
