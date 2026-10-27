# Follow the keys (1.27)

The second way to learn in the app. The video lessons are "watch, then copy"; Follow the keys is "play a song you know, one note at a time, and the song waits for you". It is Synthesia's *Melody practice* and the Piano tab of the Claude Design prototype (`design/claude-design-2026-10-27`, screen `A-app-07-piano.png`). Code: `assets/js/follow.js`.

## How it works (1.30: falling notes)
- The notes **fall onto their keys** on the Piano only canvas (`fall()` in `index.html`, fed each frame by `follow.frame(now)`): bar bottom = note start, `pos` = song time; `pos` moves at `SPEED` 0.8 song-s per real s, 150 px per song-second (`follow.PX`), starting `LEAD` 2.2 s before the first note. It never passes the current step's start: there the song **waits**, the bar pulses on the key line and the keys get `.want`. A caught step bursts (`pops`, 450 ms). Rising bars of his own notes are hidden while a song is on.
- **Listen** (`lis`): from the current step, the whole song plays in real time (all notes, both hands, via `pianoPlayNote` from the frame loop), the falling bars move with it and burst on the line. Any key (`note()`) or the ⏸ button ends it without counting; `pos` goes back to 1.2 s before his step so it falls in again.
- **In the list (1.29):** one tap = listen (the first 20 s, both hands, the card glows); two quick taps (< 0.45 s) = play along. A slow second tap on the playing song stops listening.
- **No lucky hits (1.29):** a right key in a flurry of wrong ones (3+ wrong keys in the last 1.5 s) does not move the song on.
- **🎵 Songs** in Play along / Piano only opens the list: Easy / Medium / Hard tabs, songs from his video lessons first (🎬), stars he got before. Hand: **Both hands** (default), Right, Left.
- A **step** = the notes of the chosen hand(s) that start within 60 ms of each other. The step's keys glow (`.want`, with a red dot); the tile row shows this step big and the next 7. Blue tile = left hand, orange = right.
- He presses the keys of the step in any order. When all are down once, the song moves on. A wrong key sounds as normal, the wanted keys flash (`.wantx`), and the step no longer counts as "first time".
- One hand only: when he moves on, the other hand's notes for that stretch play softly in time (`accompany`, volume 0.45).
- **Listen**: the next 6 steps are played for him at the song's timing (at most 4 s), then it waits again.
- The keyboard moves (`pianoKeys.show(lo, hi)`) so the step is on screen, and comes back to his saved octave (`pianoKeys.restore()`) at the end.
- End: stars from steps right first time (90 % → 3, 70 % → 2, else 1), "Well done! You played <title>.", saved in `songProg { id: { best, plays, last } }`; the screen closes after 6 s. Leaving Piano only stops the song.
- The slow-down pause (js/calm.js) also covers the keys here if he mashes.

## Where the songs come from (private)
Pop songs and Synthesia songs must never be in this public repo or the APK. They live in the private `piano-tutorials` folder:
```
python tools/export_app_songs.py                          # songs/*.notes.json -> app-songs/index.json + <id>.json
python tools/export_app_songs.py --push 192.168.1.210:5555 # adb push to the tablet
```
On the device they sit in `Android/data/md.home.pianolessons/files/songs/`; `MainActivity` serves them at `songs/` (JSON only, no `..`, 404 when missing).
- `index.json`: `[{id, t, src (syn | midi | video), yt, n, secs, lv 1-3, lo, hi, hands}]`, easiest first.
- `<id>.json`: `{t, notes: [[midi, start_s, end_s, "R"|"L"]]}`, times from 0.
- Level: onset groups of the tune (all notes for Synthesia songs, right hand for others): steps per second, chords, top-line jumps over 7 semitones, length over 60 / 150 steps, range over 16.
- Videos with a bad hand split (right hand < 30 % or > 95 %): the top note of each moment becomes the right hand.

## Settings and logs
`songCfg { hand, acc }`, `songProg`. Diary: `song_start`, `song`, `song_stop` (docs/LOGS.md).
