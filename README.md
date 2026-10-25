# Piano Lessons — locked kid player for one YouTube playlist

- Playlist: PIANO LESSONS (operator's channel) `PLDVezc1Pgjccf0cePq-4SB1K6NExfYT6x` — loaded live, so added/removed lessons appear on next app start
- Package `md.home.pianolessons`, ~24 KB, version 1.3, minSdk 24 / target 34. Installed on MatePad 11 (2026-10-25)
- Build: `bash build.sh` → `out/PianoLessons.apk`; `bash build.sh install` installs on every adb device
  - Needs: Android cmdline SDK at C:\Android (platform 34, build-tools 37 — 34's d8 crashes on JDK 21), Microsoft OpenJDK 21
  - **Keep `keystore/piano.jks`** — updates must be signed with the same key (password: the debug-style default in build.sh)
- Change the playlist: edit `PLAYLIST` in `assets/index.html`, rebuild
- How it locks: WebView + official YouTube embed; all navigation/popups refused; long-press off; Back only leaves fullscreen; immersive; asks to pin (screen pinning) on every resume while unpinned
- Grown-up exit: **🔒 Close** button → PIN (created on first tap, typed twice; stored as SHA-256 in app prefs; 3 wrong = 1 min lockout) → Close / Change PIN / Back
- Paused / not started / ended → own cover screen (▶ Play / Next lesson / Start again) so YouTube's "More videos" never shows
- YouTube controls off (`controls=0`), iframe cropped 60 px top+bottom (edge overlays clipped), tap-shield over the video (tap = pause/play), YouTube fullscreen off
- **Big video** mode button: hides Back/Next row, narrow thumbnail strip, remembered between launches
- Device setup: Settings → Security → More settings → Screen pinning ON + "Ask for PIN before unpinning"
- Verified on device: playlist loads (20 lessons), video plays, "Watch on YouTube" tap stays in app
- Known limits: needs Wi-Fi; YouTube may show ads in embeds; pinning only holds once screen pinning is enabled and accepted
