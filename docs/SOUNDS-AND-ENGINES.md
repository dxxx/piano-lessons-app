# Sounds and engines

Every sound in the piano and how it is made. Update this file in the same commit as any sound or engine change.

## Engines

| Engine | Where | What it plays | Latency on the MatePad |
|---|---|---|---|
| **Native C++ (AAudio)** | `src/cpp/piano_engine.cpp`, `NativePiano.java` | Grand piano only, while Play along is open. EXCLUSIVE MMAP stream, 32 voices, reverb + compressor matched to the page | about 8 ms output, 2–3 ms touch (`KeyOverlay.java`) |
| **Web Audio, samples** | `assets/index.html` → `SETS`, `sampled()` | Every recorded sound below (MP3s in `assets/sounds/<dir>/`, 25 notes each: C, Eb/D#, Gb/F#, A over MIDI 24–96, pitched in between). Long sounds loop a steady part while the key is held | WebView output (about 120 ms on Huawei) |
| **Web Audio, synthesis** | `assets/index.html` → `VOICE` | Sounds built from oscillators and filters, no files | same as above |
| Fallback | `NativePiano.java` | A Java AudioTrack mixer, if the native engine cannot open | about 120 ms |

All Web Audio sounds pass through: per-note pan (low left, high right) → master → room echo (Off / Room / Big hall) → compressor → the grown-up loudness limit.

## Sounds

| Sound | id | Engine | Source | Added |
|---|---|---|---|---|
| 🎹 Grand piano | `grand` | Native C++ (Web Audio samples if native is off) | Salamander Grand Piano, CC-BY 3.0 | 1.6 (native 1.12) |
| 🎼 Soft piano | `soft` | Synthesis | own | 1.6 |
| 🎸 Electric piano | `epiano` | Synthesis | own | 1.6 |
| 🎶 Organ | `organ` | Synthesis | own | 1.6 |
| 🎵 Music box | `musicbox` | Synthesis | own | 1.6 |
| 🤖 Robot voice | `robot` | Synthesis (talkbox, glide) | own | 1.7.2 |
| 🎛️ Synth lead | `lead` | Samples (synthesis until 1.15) | MusyngKite `lead_2_sawtooth` | 1.7.2 (recorded 1.15) |
| 🔊 808 bass | `808` | Synthesis | own | 1.7.2 |
| 👾 Chiptune | `chip` | Synthesis | own | 1.7.2 |
| 🌌 Warm pad | `warmpad` | Samples, looped | FluidR3_GM `pad_2_warm` (MIT / CC-BY) | 1.7.3 |
| 🎚️ Polysynth | `polysynth` | Samples, looped | FluidR3_GM `pad_3_polysynth` | 1.7.3 |
| 🌈 Xylophone | `xylo` | Synthesis | own | 1.11 |
| 💣 808 Boom | `boom808` | Synthesis (`b808()`: long decay) | own | 1.16 |
| 💥 808 Punch | `punch808` | Synthesis (`b808()`: fast drop, hard drive, click) | own | 1.16 |
| 🦁 808 Growl | `growl808` | Synthesis (`b808()`: + square layer, heavy drive, low-pass) | own | 1.16 |
| 🏄 808 Slide | `slide808` | Synthesis (`b808()`: mono, glides from a note played < 0.6 s before) | own | 1.16 |
| 🔉 Synth bass | `synthbass` | Samples (rings out, no loop) | MusyngKite `synth_bass_1` | 1.15 |
| 🎤 Voice ooh | `voice` | Samples, looped | MusyngKite `voice_oohs` | 1.15 |
| 🚀 Sci-fi | `scifi` | Samples, looped (F#6 and up silent in the source: pitched from Eb6) | MusyngKite `fx_8_scifi` | 1.15 (fixed 1.16) |
| 🪕 Guitar | `guitar` | Samples | MusyngKite `acoustic_guitar_nylon` | 1.15 |
| 🤘 Rock guitar | `rockguitar` | Samples, looped | MusyngKite `overdriven_guitar` | 1.15 |
| 🎷 Saxophone | `sax` | Samples, looped | MusyngKite `alto_sax` | 1.15 |
| 🎺 Trumpet | `trumpet` | Samples, looped | MusyngKite `trumpet` | 1.15 |
| 🥁 Marimba | `marimba` | Samples | MusyngKite `marimba` | 1.15 |
| 🏝️ Steel drums | `steeldrums` | Samples | MusyngKite `steel_drums` | 1.15 |
| 🎻 Violin | `violin` | Samples, looped | MusyngKite `violin` | 1.15 |
| 🌠 Strings | `strings` | Samples, looped | MusyngKite `string_ensemble_1` | 1.15 |
| 🐦 Flute | `flute` | Samples, looped | MusyngKite `flute` | 1.15 |
| 🧚 Harp | `harp` | Samples | MusyngKite `orchestral_harp` | 1.15 |
| 🎐 Kalimba | `kalimba` | Samples | MusyngKite `kalimba` | 1.15 |
| 🔔 Bells | `bells` | Samples | MusyngKite `glockenspiel` | 1.15 |
| 🤠 Honky-tonk | `honkytonk` | Samples | MusyngKite `honkytonk_piano` | 1.17 |
| 👑 Harpsichord | `harpsichord` | Samples | MusyngKite `harpsichord` | 1.17 |
| 🕺 Funky clav | `clavinet` | Samples | MusyngKite `clavinet` | 1.17 |
| ✨ Celesta | `celesta` | Samples | MusyngKite `celesta` | 1.17 |
| 💎 Vibraphone | `vibes` | Samples | MusyngKite `vibraphone` | 1.17 |
| 🪗 Accordion | `accordion` | Samples, looped | MusyngKite `accordion` | 1.17 |
| 🟦 Square lead | `squarelead` | Samples | MusyngKite `lead_1_square` | 1.17 |
| 🎠 Calliope | `calliope` | Samples | MusyngKite `lead_3_calliope` | 1.17 |
| ⚡ Charang | `charang` | Samples, looped | MusyngKite `lead_5_charang` | 1.17 |
| 🌀 Fifths | `fifths` | Samples, looped | MusyngKite `lead_7_fifths` | 1.17 |
| 📯 Synth brass | `synthbrass` | Samples, looped | MusyngKite `synth_brass_1` | 1.17 |
| 🌊 Synth strings | `synthstrings` | Samples, looped | MusyngKite `synth_strings_1` | 1.17 |
| 😇 Halo pad | `halo` | Samples, looped | MusyngKite `pad_7_halo` | 1.17 |
| 🌬️ Sweep pad | `sweep` | Samples, looped | MusyngKite `pad_8_sweep` | 1.17 |
| 🔮 Crystal | `crystal` | Samples, looped | MusyngKite `fx_3_crystal` | 1.17 |
| 🪐 Echoes | `echoes` | Samples, looped | MusyngKite `fx_7_echoes` | 1.17 |
| 🔌 Electric bass | `ebass` | Samples | MusyngKite `electric_bass_finger` | 1.17 |
| 👋 Slap bass | `slapbass` | Samples | MusyngKite `slap_bass_1` | 1.17 |
| 🐘 Double bass | `doublebass` | Samples | MusyngKite `acoustic_bass` | 1.17 |
| 🐋 Fretless bass | `fretless` | Samples | MusyngKite `fretless_bass` | 1.17 |
| 🎸 Electric guitar | `eguitar` | Samples | MusyngKite `electric_guitar_clean` | 1.17 |
| 🔥 Distortion | `distortion` | Samples, looped | MusyngKite `distortion_guitar` | 1.17 |
| 🐴 Banjo | `banjo` | Samples | MusyngKite `banjo` | 1.17 |
| 🌵 Harmonica | `harmonica` | Samples, looped | MusyngKite `harmonica` | 1.17 |
| 🦒 Trombone | `trombone` | Samples, looped | MusyngKite `trombone` | 1.17 |
| 🦉 Clarinet | `clarinet` | Samples, looped | MusyngKite `clarinet` | 1.17 |
| 🐻 Cello | `cello` | Samples, looped | MusyngKite `cello` | 1.17 |
| 💧 Pizzicato | `pizzicato` | Samples | MusyngKite `pizzicato_strings` | 1.17 |
| 🦢 Oboe | `oboe` | Samples, looped | MusyngKite `oboe` | 1.17 |
| 🐌 French horn | `horn` | Samples, looped | MusyngKite `french_horn` | 1.17 |
| 🪘 Timpani | `timpani` | Samples | MusyngKite `timpani` | 1.17 |
| 💫 Orchestra hit | `orchhit` | Samples | MusyngKite `orchestra_hit` | 1.17 |
| 🎋 Pan flute | `panflute` | Samples, looped | MusyngKite `pan_flute` | 1.17 |
| 🥚 Ocarina | `ocarina` | Samples, looped | MusyngKite `ocarina` | 1.17 |
| 😙 Whistle | `whistle` | Samples, looped | MusyngKite `whistle` | 1.17 |
| 🐤 Bird | `bird` | Samples (Eb6 and up silent in the source: pitched from C6) | MusyngKite `bird_tweet` | 1.17 |
| 🪵 Woodblock | `woodblock` | Samples | MusyngKite `woodblock` | 1.17 |
| 🏯 Taiko drum | `taiko` | Samples | MusyngKite `taiko_drum` | 1.17 |
| 🌸 Koto | `koto` | Samples | MusyngKite `koto` | 1.17 |
| 🧞 Sitar | `sitar` | Samples | MusyngKite `sitar` | 1.17 |
| 🛎️ Tube bells | `tubebells` | Samples | MusyngKite `tubular_bells` | 1.17 |

| 🎧 Freestyle | `freestyle` | Synthesis (2 detuned saws + square, resonant filter sweep, glide < 0.25 s) | own | 1.19 |
| 💃 Dance synth | `dance` | Synthesis (3 detuned saws, snappy filter, pitch blip) | own | 1.19 |
| 🐳 Whale | `whale` | Synthesis (sine + triangle swoop, slow vibrato, delay echo) | own | 1.19 |
| 🐬 Dolphin | `dolphin` | Synthesis (3 clicks + swooping whistle) | own | 1.19 |
| 🦉 Owl | `owl` | Synthesis (two falling sine hoots) | own | 1.19 |
| 🐺 Wolf | `wolf` | Synthesis (saw through two formants, slides up, vibrato) | own | 1.19 |
| 🐝 Bee | `bee` | Synthesis (saw + square buzz, low-pass) | own | 1.19 |
| 🦟 Mosquito | `mosquito` | Synthesis (high saw, 31 Hz wing vibrato, drift) | own | 1.19 |
| 🦗 Cricket | `cricket` | Synthesis (4-pulse chirps repeating) | own | 1.19 |
| 🐱 Cat | `cat` | One recording (first meow, 0.2–1.8 s, high-pass 150 Hz) | Commons "Meow of a pleading cat.oga", public domain | 1.19 (replaced 1.20) |
| 🐑 Sheep | `sheep` | One recording | Commons "Sheep bleating.ogg" (PDSounds, earthcalling), public domain | 1.19 |
| 🐓 Rooster | `rooster` | One recording | Commons "Medium rooster crowing.ogg", public domain | 1.19 |
MusyngKite and FluidR3 renders come from [gleitz/midi-js-soundfonts](https://github.com/gleitz/midi-js-soundfonts); MusyngKite files are CC-BY-SA 3.0 and stay under that licence. Gains in `SETS` were matched by measuring the first 0.6 s RMS of C3/C4/C5 against the grand piano.

## Silent recordings

Since 1.16 `loadSet()` measures each decoded sample; a peak under 0.001 marks it `silent`, and `nearest()` never picks it, so the closest real note is pitched instead. Known cases: MusyngKite `fx_8_scifi` Gb6, A6, C7; `bird_tweet` Eb6, Gb6, A6, C7.

## One-recording sounds

Since 1.19 a `SETS` entry with `one: true` has a single file `sounds/<id>/C4.mp3`, played as recorded on middle C and pitched by `playbackRate` on other keys. Animal recordings were cut to their loudest call and loudness-normalised (ffmpeg `loudnorm`, -16 LUFS). The Commons whale recording (Akhumphi1x.ogg) was rejected: mostly underwater noise.

Icons were reviewed in 1.19: each is unique and says what the sound is (see the table above).

## Removed

- 1.20: Cow and Duck (the Commons "... in Vezo" files are word pronunciations, not animals), Elephant and Frog (operator: not good). The 1.19 Cat file ("Maullido de gata hembra joven") sounded like an engine and was replaced.
- Check before adding a recording: it must come from an animal-sound category (e.g. Category:Audio files of cats meowing), not a pronunciation file, and its spectrogram must show the call.

## Icons (1.21)

Every instrument sound has a drawn SVG icon (48×48 viewBox, flat shapes, wood / brass / silver palette). They are defined in `tools/build-icons.js`; `node tools/build-icons.js` writes `tools/instrument-icons.js` and the copy the app loads, `assets/js/icons.js` (`var ICONS = { id: "<svg inner markup>" }`). The picker and the sound button use `icon(x)`, which falls back to the emoji in `INSTR` when an id has no drawing. Animals keep their emoji on purpose. Check them in `tools/icon-preview.html`.

## Rules

- Nothing from Synthesia or FL Studio goes in this app (licensed content). Only free-licence sound sets, credited here and in the README.
- Adding a sampled sound: download the 25 notes into `assets/sounds/<id>/`, add a `SETS` entry (gain from the RMS measurement, `loop: true` for sounds that sustain), add it to `INSTR` and to a group in `IGROUPS`, then add a row here and a CHANGELOG line.
