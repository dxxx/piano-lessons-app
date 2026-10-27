# Permanent logs (the diary)

Since 1.18 the app keeps every record in files on the tablet. The app never trims or deletes them: the Menu's clear and reset buttons only clear the in-app copy, and they take a snapshot first. The files stay until a grown-up pulls them. They are lost only if the app is uninstalled or its data is cleared in Android settings.

## Where

`/sdcard/Android/data/md.home.pianolessons/files/diary/`

| File | What | Written |
|---|---|---|
| `events-YYYY-MM.jsonl` | Every event, one JSON line each, never trimmed | at the moment it happens |
| `snap-YYYY-MM-DD.json` | Every in-app record (all localStorage keys: `actLog`, `quizLog`, `writeLog`, `colourLog`, progress, settings), `{at, ls}` | every minute and when the app goes to the background; one file per day is kept |

## Read them

```bash
adb connect 192.168.1.210:5555          # tablet over Wi-Fi (or plug in USB)
MSYS_NO_PATHCONV=1 adb pull /sdcard/Android/data/md.home.pianolessons/files/diary ./diary
```

`MSYS_NO_PATHCONV=1` is only needed in Git Bash on Windows. The analysis goes into Obsidian from the PC.

## Event kinds (`k`)

Every line has `k`, `at` (UTC ISO) and `day` (local "YYYY-MM-DD HH:MM").

| k | Extra fields |
|---|---|
| `open` | `ua`: Android version and device |
| `piano` | One Play along session: `from`, `sec`, `solo` (seconds in Piano only), `notes`, `sounds` {sound id: notes} |
| `solo_on`, `solo_off` | Piano only switched |
| `sound` | `id`: the sound he picked |
| `lesson` | A lesson video started: `id`, `t` (title) |
| `lesson_done` | Watched to 90 %: `id`, `t`, `sec` (total seconds on that lesson) |
| `quiz` | One maths answer: `q`, `a` (his answer), `c` (correct), `ok`, `lvl`, `ms`, plus `v`/`h` (voice, what was heard), `fast`, `rv`, `hint`, `ex`, `col`, `reg`, `sl`, `hs` (see the quiz code) |
| `level` | Maths level changed: `l` |
| `write` | One writing try: `d`, `it` (item), `lv`, `r` (round), `ok`, `why`, `pen` |
| `compare` | One Bigger-or-smaller answer: `st` (picture range: 1 rows, 2 to 20, 3 to 99), `t` (rows, pick, sign, order), `q` (question key), `a` (his answer), `c` (correct), `ok`, `ms` |
| `concept` | One quick-game answer: `c` (concept id), `w` (0/1 which word), `ok`, `ms`, `ph` (phase 0–3), `teach` (shown, not tested), `at` (piano, colour, compare, menu); or a move break: `move`, `at` |
| `song_start` | Follow the keys started: `id`, `hand` (RL / R / L), `steps` |
| `song` | A song played to the end: `id`, `t` (title), `hand`, `steps`, `first` (steps right first time), `miss` (wrong keys), `sec`, `stars` (1–3) |
| `song_stop` | A song stopped before the end: `id`, `at` (step reached), `steps` |
| `mash` | Slow-down pause after random key mashing: `kind` (slam / scramble, the last burst), `bursts` (3: bursts within 10 s that led to it), `strike` (1, 2, 3… within 10 min), `pause` (seconds) |
| `beat` | One metronome run in Piano only: `bpm`, `beats` (in a bar), `sec`, `notes` (played while it ran), `hits` (notes within 0.12 s of a click) |
| `colour` | One colouring result: `d`, `pic`, `crosses`, `strokes`, `sec`, `pen`, plus stars and memory-game fields |
| `lock`, `unlock` | Screen-time or mistake lock: `r` (reason), `how` |
| `earn` | Time earned with maths: `m` |
| `too_close` | The eye guard covered the screen |
| `reset` | A grown-up cleared records: `what` (`activity`, `quiz`); a snapshot was taken just before |
