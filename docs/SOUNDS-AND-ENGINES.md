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
| 🔉 Synth bass | `synthbass` | Samples (rings out, no loop) | MusyngKite `synth_bass_1` | 1.15 |
| 🎤 Voice ooh | `voice` | Samples, looped | MusyngKite `voice_oohs` | 1.15 |
| 🚀 Sci-fi | `scifi` | Samples, looped | MusyngKite `fx_8_scifi` | 1.15 |
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

MusyngKite and FluidR3 renders come from [gleitz/midi-js-soundfonts](https://github.com/gleitz/midi-js-soundfonts); MusyngKite files are CC-BY-SA 3.0 and stay under that licence. Gains in `SETS` were matched by measuring the first 0.6 s RMS of C3/C4/C5 against the grand piano.

## Rules

- Nothing from Synthesia or FL Studio goes in this app (licensed content). Only free-licence sound sets, credited here and in the README.
- Adding a sampled sound: download the 25 notes into `assets/sounds/<id>/`, add a `SETS` entry (gain from the RMS measurement, `loop: true` for sounds that sustain), add it to `INSTR` and to a group in `IGROUPS`, then add a row here and a CHANGELOG line.
