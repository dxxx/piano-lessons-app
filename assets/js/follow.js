// ---- Follow the keys: the song waits for him ----
// The reverse of the video lessons: instead of copying a video, he plays a known song note by note. The notes fall onto their keys
// (the Piano only canvas, same bars as the notes he plays, run the other way); when a note reaches its key, the song waits there and
// the key glows until he presses it (no timer, no penalty for being slow). Operator 2026-10-27: "make the notes fall to the keys
// instead of showing keys to press, use the existing mechanism".
// Same idea as Synthesia's "Melody practice" and the Claude Design prototype's Piano tab (design/claude-design-2026-10-27).
//   - songs: our own note files (private: pushed by adb to the app's storage, served at songs/; never in the repo or the APK)
//   - hand: both (default: Synthesia's beginner songs share the melody between the hands), right or left; in one-hand mode the other hand plays itself, softly, when he moves on
//   - a step = the notes that start together; it is done when each of them has been pressed (any order)
//   - a wrong key just sounds; the right key glows brighter; stars from how many steps were right first time
//   - Listen (in the song): the whole song plays from where he is, the notes falling in time, until he presses any key: that key
//     is the pause signal (it does not count as a note) and the song waits again at the note he was on (operator 2026-10-27)
//   - in the list: ONE tap plays the song to listen to (the whole song, both hands), TWO quick taps pick it and he plays along
//     (operator: "single click makes songs play, double click selects it, so I can hear before I commit")
//   - the song falls at HIS speed (0.45-1.5x, learned from his last steps); a right key pressed early counts at once; a chord
//     counts once half its keys are down (the rest sound softly) - so a fluent run sounds like the real song (operator 2026-10-28)
//   - no lucky hits: a right key pressed in a flurry of wrong ones (3+ DIFFERENT wrong keys in the last 1.5 s; the note he just
//     played, pressed again, never counts) does not move the song on,
//     so banging keys never plays the song for him; one calm press of the right key does
//   - every song opens on ITS OWN sound (index.json "snd", picked per song on the PC: carols = celesta, Bach = harpsichord, Linkin
//     Park = rock guitar...). He can change it: that pick is remembered for that song (songSnd). Leaving the song gives him back his
//     own sound (operator 2026-10-28: "the default instrument per song must be auto selected", "we can change")
//   - player bar (operator 2026-10-29: "restart button, play pause, next, previous, like a player"): Previous / Next song go
//     through the list he picked from (same tab or search, wrapping round), Start again restarts this song from its first note,
//     Listen / Pause is the Listen above
//   - speed button (operator 2026-10-29): Auto (HIS SPEED below) or a fixed 50 / 75 / 100 %; a fixed speed sets the falling notes,
//     Listen and the other hand alike, and stops the auto nudging. Remembered in songCfg.spd (0 = Auto)
//   - the keyboard is set once to cover the whole song (all its notes, fewest keys), and goes back to his own zoom at the end
//   - 🔁 Repeat a bit (1.43, flowkey's loop, research/09): tap 🔁 where the hard bit starts, play it, tap 🔁 again where it ends
//     (tapped twice at once = the next 8 notes). That bit comes round again until he plays it clean (every note right first
//     time) TWICE in a row, then the song carries on by itself. A third tap ends the repeat. The bit shows yellow on the bar.
//     Stars count each note's LAST try, so practising a bit never spoils (or inflates) the song's stars.
//   - Carry on (1.43): leaving a song half way remembers it (songResume { id, t, si, n, hand }); the start screen offers
//     "Carry on: <song>" and opens it at that note. Finishing the song forgets it.
//   - Tricky bits (1.45, research/09 R8 "one friendly replay of the tricky bars at the END, never mid-song"): the app notes every
//     step he missed (hard[]). At the end it finds the 1-2 stretches (up to 8 notes, one note of run-up) with the most missed
//     notes (at least 2) and offers "🔁 Tricky bit" next to the stars. One tap plays just that bit ONCE (yellow on the bar), then
//     praise and the next one. Untapped, the song closes as before. Stars are saved before, so the replay never changes them.
//     A bit he already cleared with 🔁 does not come back.
// Research: answer on the keyboard, notes from his songs, errorless (research/06 R9-R12, 01 R9). Uses L, voice, diary, pianoKeys,
// pianoPlayNote (index.html). Progress: localStorage songProg { id: { best, plays, last } }; settings: songCfg { hand, acc }.
var follow = (function () {
  var $ = function (id) { return document.getElementById(id); };
  var NN = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  var LV = ["", "⭐", "⭐⭐", "⭐⭐⭐"];
  var SPEED = 0.8, LEAD = 2.2;                                   // song seconds per real second while falling; first notes start this far above
  var pos = 0, lastF = 0, arrived = false, pops = [], lis = null;
  // HIS SPEED (operator 2026-10-28: "if he plays faster let him go faster... don't stop the play", "more flexibility"): the song
  // falls at HIS pace, not a fixed 0.8. Every step he finishes compares his gap with the song's gap and nudges the speed
  // (smoothed, 0.45-1.5x); a right key pressed while its note is still falling counts at once and the song jumps there. It
  // still waits at a note he does not know - only then.
  var speed = SPEED, lastOk = 0, SPEED_MIN = 0.45, SPEED_MAX = 1.5;
  var index = null, loading = false, song = null, steps = [], si = 0, pressed = {}, firstTry = true, okFirst = 0, misses = 0, t0 = 0, tab = 1;
  var cfg = { hand: "RL", acc: 1, spd: 0 }, prog = {}, wrong = [], SPDS = [0, 0.5, 0.75, 1];
  var LUCKY_N = 3, LUCKY_MS = 1500;
  var queue = [], curId = null;                                  // player bar: the list he picked from, and the song on (kept after the end)
  var okArr = [], loop = null, mark = -1, LOOP_DEF = 8, LOOP_CLEAN = 2;   // okArr[i] = step i right first time (its last try); 🔁 repeat
  var hard = [], encore = null, ENC_MIN = 2, ENC_WAIT = 20000;    // hard[i] = he missed step i at least once; encore = the tricky-bits offer
  function getResume() { try { var r = JSON.parse(localStorage.getItem("songResume") || "null"); return r && r.id && r.si > 0 ? r : null; } catch (e) { return null; } }
  function saveResume() {
    if (!song || encore || si <= 0 || si >= steps.length) return;   // a tricky-bit replay is after the song: nothing to carry on
    try { localStorage.setItem("songResume", JSON.stringify({ id: song.id, t: song.t, si: si, n: steps.length, hand: cfg.hand })); } catch (e) {}
  }
  function dropResume(id) { var r = getResume(); if (r && r.id === id) try { localStorage.removeItem("songResume"); } catch (e) {} }
  try { var c = JSON.parse(localStorage.getItem("songCfg") || "{}"); if (/^(R|L|RL)$/.test(c.hand)) cfg.hand = c.hand; if (c.acc === 0) cfg.acc = 0; } catch (e) {}
  try { prog = JSON.parse(localStorage.getItem("songProg") || "{}") || {}; } catch (e) { prog = {}; }
  try { var c2 = JSON.parse(localStorage.getItem("songCfg") || "{}"); if (SPDS.indexOf(c2.spd) >= 0) cfg.spd = c2.spd; } catch (e) {}
  function rate() { return cfg.spd || speed; }                  // song seconds per real second while falling
  function spdLabel() { var b = $("fwSpd"); if (b) b.textContent = { 0: "✨ " + L("Auto", "Auto"), 0.5: "🐢 50%", 0.75: "🚶 75%", 1: "🏃 100%" }[cfg.spd]; }
  function saveCfg() { try { localStorage.setItem("songCfg", JSON.stringify(cfg)); } catch (e) {} }
  var own = null, songSnd = {};                                  // own = his sound before the song; songSnd = { id: sound he picked }
  try { songSnd = JSON.parse(localStorage.getItem("songSnd") || "{}") || {}; } catch (e) { songSnd = {}; }
  // the sound picker calls this while a song is open: his pick belongs to this song, not to his everyday sound
  window.followSound = function (id) { if (!song) return false; songSnd[song.id] = id; try { localStorage.setItem("songSnd", JSON.stringify(songSnd)); } catch (e) {} return true; };
  function saveProg() { try { localStorage.setItem("songProg", JSON.stringify(prog)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function solo() { var b = document.body.classList; return b.contains("solo") && b.contains("play") && !b.contains("athome"); }
  function name(m) { return window.pianoKeys ? pianoKeys.name(m) : NN[m % 12]; }

  // ---- The song list (index.json): easiest first, in three tabs ----
  function load(done) {
    if (index) return done();
    if (loading) return;
    loading = true;
    fetch("songs/index.json").then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (d) { index = d || []; loading = false; done(); })
      .catch(function () { index = []; loading = false; done(); });
  }
  function lessonIds() { try { return JSON.parse(localStorage.getItem("lessonIds") || "[]"); } catch (e) { return []; } }
  // ---- Favourites (operator 2026-10-27): a heart on every card; hearted songs go to the top of whichever tab they are in ----
  function favs() { try { return JSON.parse(localStorage.getItem("songFav") || "[]"); } catch (e) { return []; } }
  function toggleFav(id) {
    var f = favs(), i = f.indexOf(id);
    if (i >= 0) f.splice(i, 1); else f.push(id);
    try { localStorage.setItem("songFav", JSON.stringify(f)); } catch (e) {}
    if (window.diary) diary.ev("song_fav", { id: id, on: i < 0 });
    list();
  }
  function list() {
    var box = $("songList"), ids = lessonIds(), fav = favs();
    stopPreview();
    $("songTip").textContent = L("Tap a song once to listen. Tap it twice to play it yourself.", "Toca una canción una vez para escucharla. Dos veces para tocarla tú.");
    [].forEach.call($("songTabs").children, function (b) { b.classList.toggle("sel", String(b.dataset.lv) === String(tab)); });
    [].forEach.call($("songHand").children, function (b) { b.classList.toggle("sel", b.dataset.h === cfg.hand); });
    if (!index.length) { box.innerHTML = '<p class="songnone">' + L("No songs on this tablet yet. A grown-up adds them from the computer.", "Todavía no hay canciones en esta tableta.") + "</p>"; return; }
    // 4th tab "Modern music": songs that are not from Synthesia (our playlist videos, cat "custom"); 5th "My lessons": the songs of the
    // YouTube lesson videos he watches (lessonIds), in the lesson order. Operator 2026-10-27.
    var custom = tab === "c", lessons = tab === "l", q = $("songFind") ? $("songFind").value : "", find = !!q.trim();   // 1.40: typing searches every tab
    if (find) [].forEach.call($("songTabs").children, function (b) { b.classList.remove("sel"); });
    var mine = index.filter(function (s) { return find ? window.findMatch(s.t, q) : lessons ? s.yt && ids.indexOf(s.yt) >= 0 : custom ? s.cat === "custom" : s.lv === tab && s.cat !== "custom"; });
    mine.sort(function (a, b) { return (fav.indexOf(b.id) >= 0) - (fav.indexOf(a.id) >= 0) || (ids.indexOf(b.yt) >= 0) - (ids.indexOf(a.yt) >= 0) || (lessons ? ids.indexOf(a.yt) - ids.indexOf(b.yt) : 0) || (custom ? a.lv - b.lv : 0) || a.n - b.n; });   // hearted first, then songs from his lessons
    box.innerHTML = mine.map(function (s) {
      var p = prog[s.id], stars = p ? LV[p.best] : "", lesson = s.yt && ids.indexOf(s.yt) >= 0;
      var hf = fav.indexOf(s.id) >= 0;
      return '<button data-id="' + s.id + '"' + (hf ? ' class="fav"' : "") + '><i class="heart" role="button" aria-label="' + L("Favourite", "Favorita") + '">' + (hf ? "&#10084;&#65039;" : "&#9825;") + "</i><b>" + esc(s.t) + "</b><span>" + (lesson && !lessons ? "🎬 " + L("from your lessons", "de tus lecciones") + " · " : "") +
        (custom || lessons ? LV[s.lv] + " · " : "") + s.n + " " + L("notes", "notas") + (stars ? ' · <i class="st">' + stars + "</i>" : "") + "</span></button>";
    }).join("") || '<p class="songnone">' + (find ? L("No song with that name.", "Ninguna canción con ese nombre.") : lessons ? L("The songs from his video lessons show here.", "Aquí salen las canciones de sus lecciones en vídeo.") : "—") + "</p>";
  }
  // ---- Listen first: one tap plays the song (all of it; a slow tap again, another song or closing the list stops it); two quick taps (within 0.45 s) pick it ----
  var PREVIEW_S = 1e9, DOUBLE_MS = 450, cache = {}, pv = { id: null, timers: [] }, lastTap = { id: null, t: 0 };
  function getSong(id) {
    if (cache[id]) return Promise.resolve(cache[id]);
    return fetch("songs/" + id + ".json").then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (d) { cache[id] = d; return d; });
  }
  function stopPreview() {
    pv.timers.forEach(clearTimeout); pv.timers = []; pv.id = null;
    [].forEach.call(document.querySelectorAll("#songList .playing"), function (b) { b.classList.remove("playing"); });
  }
  function preview(id, btn) {
    var again = pv.id === id; stopPreview();
    if (again) return;                                        // a slow second tap on the song that is playing = stop listening
    pv.id = id; btn.classList.add("playing");
    getSong(id).then(function (d) {
      if (pv.id !== id || !window.pianoPlayNote) return;
      d.notes.forEach(function (n) {
        if (n[1] >= PREVIEW_S) return;
        var ms = Math.max(120, Math.min(2000, (n[2] - n[1]) * 1000));
        pv.timers.push(setTimeout(function () { if (pv.id === id) pianoPlayNote(n[0], n[3] === "R" ? 0.7 : 0.5, ms); }, 300 + n[1] * 1000));
      });
      var end = Math.min(PREVIEW_S, Math.max.apply(null, d.notes.map(function (n) { return n[2]; })));
      pv.timers.push(setTimeout(function () { if (pv.id === id) stopPreview(); }, 300 + end * 1000 + 600));
    }).catch(function () { stopPreview(); });
  }
  function tapSong(btn) {
    var id = btn.dataset.id, now = Date.now(), dbl = lastTap.id === id && now - lastTap.t < DOUBLE_MS;
    lastTap = { id: id, t: now };
    if (dbl) { lastTap = { id: null, t: 0 }; stopPreview(); start(id); } else preview(id, btn);
  }
  function openList() {
    $("songPop").classList.add("open");
    $("songList").innerHTML = '<p class="songnone">' + L("Loading songs…", "Cargando canciones…") + "</p>";
    load(list);
  }
  function closeList() { stopPreview(); $("songPop").classList.remove("open"); }

  // ---- Play one song ----
  function start(id, at) {
    if (song && si > 0 && window.diary) diary.ev("song_stop", { id: song.id, at: si, steps: steps.length });   // skipped or restarted
    var q = [].map.call($("songList").querySelectorAll("button[data-id]"), function (b) { return b.dataset.id; });
    if (q.indexOf(id) >= 0) queue = q; else if (queue.indexOf(id) < 0) queue = index ? index.map(function (s) { return s.id; }) : [id];
    curId = id;
    getSong(id).then(function (d) {
      var meta = index.filter(function (s) { return s.id === id; })[0] || { id: id, t: d.t };
      var mine = d.notes.filter(function (n) { return cfg.hand.indexOf(n[3]) >= 0; });
      if (!mine.length) mine = d.notes;
      steps = [];
      mine.forEach(function (n) {                                // notes that start within 60 ms of each other = one step
        var s = steps[steps.length - 1];
        if (s && n[1] - s.t < 0.06) { if (s.m.indexOf(n[0]) < 0) s.m.push(n[0]); s.n.push(n); } else steps.push({ t: n[1], m: [n[0]], h: n[3], n: [n] });
      });
      var other = cfg.hand === "RL" ? [] : d.notes.filter(function (n) { return cfg.hand.indexOf(n[3]) < 0; });
      song = { id: id, t: meta.t, other: other, all: d.notes };
      si = at > 0 && at < steps.length ? at : 0; pressed = {}; firstTry = true; okFirst = 0; misses = 0; wrong = []; t0 = Date.now();
      okArr = []; loop = null; mark = -1; hard = []; encore = null; loopLabel();
      pos = steps.length ? steps[si].t - LEAD : 0; lastF = 0; speed = SPEED; lastOk = 0; arrived = false; pops = []; lis = null; hintLabel();
      if (window.pianoSound) { if (own === null) own = pianoSound.now(); pianoSound.set(songSnd[id] || meta.snd || "grand"); }
      closeList(); document.body.classList.add("infollow"); $("follow").hidden = false;
      $("fwTitle").textContent = meta.t;
      if (window.pianoKeys && pianoKeys.fit && steps.length) {      // the whole song on one keyboard (operator 2026-10-28)
        var lo = 127, hi = 0;
        steps.forEach(function (st) { st.m.forEach(function (m) { if (m < lo) lo = m; if (m > hi) hi = m; }); });
        pianoKeys.fit(lo, hi);
      }
      show();
      if (window.diary) diary.ev("song_start", { id: id, hand: cfg.hand, steps: steps.length });
    }).catch(function () { $("songList").innerHTML = '<p class="songnone">' + L("That song did not load.", "Esa canción no cargó.") + "</p>"; });
  }
  function clearKeys() { [].forEach.call(document.querySelectorAll("#keys .want, #keys .wantx"), function (k) { k.classList.remove("want", "wantx"); }); }
  function want() {                                              // the note has reached its key: the key glows until he presses it
    var s = steps[si]; if (!s) return;
    s.m.forEach(function (m) { if (!pressed[m]) { var k = pianoKeys.el(m); if (k) k.classList.add("want"); } });
  }
  function show() {
    clearKeys();
    var cur = steps[si]; if (!cur) return;
    var lo = Math.min.apply(null, cur.m), hi = Math.max.apply(null, cur.m);
    if (window.pianoKeys) {                                      // keep the next few steps on the keyboard too, so it moves less often
      var lo2 = lo, hi2 = hi;
      for (var i = si + 1; i < Math.min(steps.length, si + 6); i++) { lo2 = Math.min(lo2, Math.min.apply(null, steps[i].m)); hi2 = Math.max(hi2, Math.max.apply(null, steps[i].m)); }
      if (!pianoKeys.show(lo2, hi2) || !pianoKeys.el(lo) || !pianoKeys.el(hi)) pianoKeys.show(lo, hi);
    }
    arrived = pos >= cur.t - 0.001; if (arrived) want();
    $("fwTiles").innerHTML = "";
    $("fwBar").style.width = Math.round(si / steps.length * 100) + "%";
    var on = encore && encore.on, lr = $("fwLoopR"), a = loop ? loop.a : on ? on.a : mark, b = loop ? loop.b : on ? on.b : si;
    if (lr) { lr.hidden = a < 0; if (a >= 0) { lr.style.left = (a / steps.length * 100) + "%"; lr.style.width = (Math.max(1, b - a) / steps.length * 100) + "%"; } }
    $("fwCount").textContent = si + " / " + steps.length;
  }
  // Called by the Piano only canvas every frame: moves the song on (up to the note he has to play) and says what to draw
  function frame(now) {                                          // (speed: see HIS SPEED above)
    if (!song || !steps[si]) return null;
    var dt = lastF ? Math.min(0.1, (now - lastF) / 1000) : 0; lastF = now;
    pops = pops.filter(function (p) { return now - p.t < 450; });
    if (lis) return listenFrame(now, dt);
    var target = steps[si].t;
    if (pos < target) { pos = Math.min(target, pos + dt * rate()); if (pos >= target - 0.001 && !arrived) { arrived = true; want(); } }
    var vis = [];                                                // notes he already caught stay until they have flowed into the key (long notes)
    for (var i = Math.max(0, si - 12); i < steps.length && steps[i].t - pos < 6; i++) if (i >= si || stepEnd(steps[i]) > pos) vis.push(steps[i]);
    return { pos: pos, steps: vis, cur: steps[si], waiting: arrived, pops: pops, now: now };
  }
  function note(m) {                                             // every key he presses (act.note)
    if (!song || !steps[si] || !solo()) return;
    if (lis) { endListen(); return; }                            // any key while listening = pause; it is not a note of the song
    var st = steps[si];
    var now = Date.now();
    while (wrong.length && now - wrong[0][0] > LUCKY_MS) wrong.shift();
    // a flurry = 3+ DIFFERENT wrong keys in 1.5 s (banging). Pressing one key again and again - mostly the note he just played,
    // in the song's rhythm - is not banging and must never block the right key (tablet 2026-10-28: Crawling, B pressed 8 times
    // after it was done, then the right G# did not count twice; he thought the app was broken)
    var prev = si > 0 ? steps[si - 1].m : [], flurry = wrong.filter(function (w, i, a) { return a.findIndex(function (x) { return x[1] === w[1]; }) === i; }).length >= LUCKY_N;
    if (st.m.indexOf(m) < 0 || flurry) {                         // not this one (or a lucky hit in a flurry): no penalty, the right key glows brighter
      if (st.m.indexOf(m) < 0 && prev.indexOf(m) >= 0) return;    // the note he just played, again: just a sound, not a miss
      if (st.m.indexOf(m) < 0) wrong.push([now, m]);
      firstTry = false; misses++; hard[si] = 1; if (encore && encore.on) encore.clean = false;
      st.m.forEach(function (x) { var k = pianoKeys.el(x); if (k && !pressed[x]) { k.classList.remove("wantx"); void k.offsetWidth; k.classList.add("wantx"); } });
      return;
    }
    pressed[m] = true; var k = pianoKeys.el(m); if (k) k.classList.remove("want", "wantx");
    // a chord counts once HALF its keys are down (rounded up): the app plays the rest softly, so the song keeps flowing
    var got = st.m.filter(function (x) { return pressed[x]; }).length;
    if (got < Math.ceil(st.m.length / 2)) return;
    st.m.forEach(function (x) { if (!pressed[x] && window.pianoPlayNote) pianoPlayNote(x, 0.35, 350); var kk = pianoKeys.el(x); if (kk) kk.classList.remove("want", "wantx"); });
    var nowS = performance.now();
    if (lastOk && si > 0) {                                      // his gap vs the song's gap -> speed (a long pause = thinking, not his tempo)
      var songGap = st.t - steps[si - 1].t, hisGap = (nowS - lastOk) / 1000, aim = songGap / Math.max(0.05, hisGap);
      if (!cfg.spd && songGap > 0.05 && aim >= 0.3) speed = Math.max(SPEED_MIN, Math.min(SPEED_MAX, speed * 0.7 + aim * 0.3));
    }
    lastOk = nowS;
    if (pos < st.t) pos = st.t;                                  // caught while still falling: the song jumps to him
    okArr[si] = firstTry;
    if (loop && !firstTry) loop.clean = false;
    var tnow = performance.now(); st.m.forEach(function (x) { pops.push({ m: x, h: st.h, t: tnow }); });
    accompany(st.t, steps[si + 1] ? steps[si + 1].t : st.t + 2);
    si++; pressed = {}; firstTry = true;
    if (encore && encore.on && si >= encore.on.b) { encoreDone(); return; }
    if (loop && si >= loop.b && loopRound()) return;
    if (si >= steps.length) finish(); else { saveResume(); show(); }
  }
  // ---- 🔁 Repeat a bit (see the top) ----
  function loopLabel() {
    var b = $("fwLoop"); if (!b) return;
    b.classList.toggle("on", !!loop || mark >= 0);
    b.innerHTML = loop ? "&#128257; " + loop.passes + "/" + LOOP_CLEAN : mark >= 0 ? "&#128257; &#8230;" : "&#128257;";
    b.setAttribute("aria-label", loop ? L("Stop repeating", "Dejar de repetir") : mark >= 0 ? L("The bit ends here", "Aquí acaba el trozo") : L("Repeat a bit", "Repetir un trozo"));
  }
  function goTo(i) { si = i; pressed = {}; firstTry = true; pos = steps[si].t - 1.2; arrived = false; lastOk = 0; show(); }
  function loopTap() {
    if (!song || !steps.length || encore) return;               // the song is over: the tricky-bit replay is its own short pass
    if (lis) endListen();
    if (loop) {                                                  // third tap: stop repeating, the song goes on from where he is
      if (window.diary) diary.ev("song_loop_off", { id: song.id, a: loop.a, b: loop.b, passes: loop.passes });
      loop = null; loopLabel(); show();
      return;
    }
    if (mark >= 0) { loopEnd(); return; }                        // second tap: the bit ends here
    mark = si; loopLabel(); show();                              // first tap: the bit starts here
  }
  function loopEnd() {                                           // second tap: the bit is mark .. here (or the next LOOP_DEF notes)
    var a = mark, b = si - a >= 2 ? si : Math.min(steps.length, a + LOOP_DEF);
    if (b - a < 2) { mark = -1; loopLabel(); show(); return; }   // too close to the end of the song for a bit
    loop = { a: a, b: b, passes: 0, clean: true }; mark = -1; loopLabel();
    if (window.diary) diary.ev("song_loop", { id: song.id, a: a, b: b });
    if (window.voice && voice.say) voice.say(L("Let's play this bit again.", "Toquemos este trozo otra vez."));
    goTo(a);
  }
  function loopRound() {                                         // he reached the end of the bit: again, or on with the song
    loop.passes = loop.clean ? loop.passes + 1 : 0; loop.clean = true;
    if (loop.passes >= LOOP_CLEAN) {
      if (window.diary) diary.ev("song_loop_done", { id: song.id, a: loop.a, b: loop.b });
      for (var i = loop.a; i < loop.b; i++) hard[i] = 0;          // cleared it twice: not a tricky bit any more
      loop = null; loopLabel();
      if (window.voice && voice.say) voice.say(L("Brilliant! Now carry on.", "¡Genial! Ahora sigue."));
      return false;                                              // the song goes on from here
    }
    loopLabel();
    goTo(loop.a);
    return true;
  }
  function accompany(from, to) {                                 // the other hand plays its notes of this stretch, softly, in time
    if (!cfg.acc || !song.other.length || !window.pianoPlayNote) return;
    song.other.forEach(function (n) {
      if (n[1] >= from - 0.03 && n[1] < to - 0.03) {
        var r = rate(), ms = Math.max(120, Math.min(1500, (n[2] - n[1]) * 1000 / r));
        setTimeout(function () { if (song) pianoPlayNote(n[0], 0.45, ms); }, Math.min(1500, (n[1] - from) * 1000 / r));
      }
    });
  }
  function finish() {
    okFirst = okArr.filter(Boolean).length; dropResume(song.id);
    var total = steps.length, pct = total ? okFirst / total : 0, stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : 1, sec = Math.round((Date.now() - t0) / 1000);
    var p = prog[song.id] || { best: 0, plays: 0 }; p.plays++; p.best = Math.max(p.best, stars); p.last = new Date().toISOString().slice(0, 10); prog[song.id] = p; saveProg();
    if (window.diary) diary.ev("song", { id: song.id, t: song.t, hand: cfg.hand, steps: total, first: okFirst, miss: misses, sec: sec, stars: stars });
    clearKeys();
    $("fwTiles").innerHTML = '<span class="fwdone">' + LV[stars] + " " + L("You played it!", "¡La tocaste!") + "</span>";
    $("fwBar").style.width = "100%"; $("fwCount").textContent = total + " / " + total;
    var bits = trickyBits();
    if (window.voice && voice.say) voice.say(L("Well done! You played ", "¡Muy bien! Tocaste ") + song.t + "." +
      (bits.length ? L(" Shall we try the tricky bit once more?", " ¿Probamos otra vez el trozo difícil?") : ""));
    if (bits.length) { encore = { bits: bits, i: 0, on: null, clean: true }; encoreOffer(stars); return; }
    closeSoon();
  }
  function closeSoon() { song = null; encore = null; setTimeout(function () { if (!song) stop(); }, 6000); }
  // ---- Tricky bits (see the top): one friendly replay of the bits he missed most, after the song ----
  function trickyBits() {
    var W = Math.min(LOOP_DEF, steps.length), bits = [];
    for (var k = 0; k < 2; k++) {
      var best = -1, bs = 0;
      for (var a = 0; a + W <= steps.length; a++) {
        if (bits.some(function (b) { return a < b.b && a + W > b.a; })) continue;
        var s = 0; for (var i = a; i < a + W; i++) if (hard[i]) s++;
        if (s > bs) { bs = s; best = a; }
      }
      if (best < 0 || bs < ENC_MIN) break;
      var f = best, l = best + W - 1;                             // trim to the missed notes, plus one note of run-up
      while (!hard[f]) f++; while (!hard[l]) l--;
      bits.push({ a: Math.max(0, f - 1), b: Math.min(steps.length, l + 1), n: bs });
    }
    return bits.sort(function (x, y) { return x.a - y.a; });
  }
  function encoreOffer(stars) {
    var e = encore, more = e.i > 0, left = e.bits.length - e.i;
    clearKeys();
    $("fwTiles").innerHTML = '<span class="fwdone">' + (more ? "&#128079;" : LV[stars] + " " + L("You played it!", "¡La tocaste!")) + "</span>" +
      '<button class="fwenc" id="fwEnc">&#128257; ' + (more ? L("One more tricky bit", "Otro trozo difícil") : L("Tricky bit", "Trozo difícil")) +
      (left > 1 ? " (" + left + ")" : "") + "</button>";
    $("fwBar").style.width = "100%"; $("fwCount").textContent = steps.length + " / " + steps.length; $("fwLoopR").hidden = true;
    var tok = e.tok = Date.now();
    setTimeout(function () { if (encore === e && !e.on && e.tok === tok) stop(); }, ENC_WAIT);   // not tapped: the song closes as before
  }
  function encorePlay() {
    var e = encore; if (!e || e.on || !song) return;
    e.on = e.bits[e.i]; e.clean = true;
    if (window.diary) diary.ev("song_encore", { id: song.id, a: e.on.a, b: e.on.b, n: e.on.n });
    $("fwTiles").innerHTML = "";
    goTo(e.on.a);
  }
  function encoreDone() {
    var e = encore, clean = e.clean;
    if (window.diary) diary.ev("song_encore_done", { id: song.id, a: e.on.a, b: e.on.b, clean: clean });
    if (window.voice && voice.say) voice.say(clean ? L("Perfect! That bit is yours now.", "¡Perfecto! Ese trozo ya es tuyo.")
                                                   : L("Good practice! It gets easier every time.", "¡Buena práctica! Cada vez es más fácil."));
    e.on = null; e.i++;
    if (e.i < e.bits.length) { encoreOffer(); return; }
    clearKeys(); $("fwLoopR").hidden = true;
    $("fwTiles").innerHTML = '<span class="fwdone">&#128079; ' + L("Great practice!", "¡Gran práctica!") + "</span>";
    $("fwBar").style.width = "100%"; $("fwCount").textContent = steps.length + " / " + steps.length;
    closeSoon();
  }
  function stop() {
    if (song && si > 0 && window.diary) diary.ev("song_stop", { id: song.id, at: si, steps: steps.length });
    saveResume();
    song = null; steps = []; lis = null; loop = null; mark = -1; encore = null; loopLabel(); hintLabel(); clearKeys();
    $("follow").hidden = true; document.body.classList.remove("infollow");
    if (window.pianoKeys) pianoKeys.restore();
    if (own !== null && window.pianoSound) pianoSound.set(own);
    own = null;
  }
  // ---- Listen: the whole song plays from his note on, falling in real time, until a key is pressed (or Listen again) ----
  function skip(d) { var i = queue.indexOf(curId); if (i >= 0 && queue.length) start(queue[(i + d + queue.length) % queue.length]); }
  function hintLabel() { var b = $("fwHint"); if (b) b.innerHTML = lis ? "&#9208; " + L("Pause", "Pausa") : "&#9654; " + L("Listen", "Escuchar"); }
  function hint() {
    if (!song || !steps[si]) return;
    if (lis) { endListen(); return; }
    lis = { pos: steps[si].t - 0.4 }; clearKeys(); hintLabel();
  }
  function endListen() {
    lis = null; pos = steps[si] ? steps[si].t - 1.2 : pos; arrived = false; hintLabel(); show();   // his note falls in again and waits
  }
  function stepEnd(s) { var e = 0; s.n.forEach(function (n) { e = Math.max(e, n[2]); }); return e; }
  function listenFrame(now, dt) {
    var r = cfg.spd || 1, from = lis.pos; lis.pos += dt * r;   // Listen: the real tempo in Auto, else the fixed speed
    song.all.forEach(function (n) {
      if (n[1] > from && n[1] <= lis.pos) {
        pianoPlayNote(n[0], n[3] === "R" ? 0.7 : 0.5, Math.max(120, Math.min(2000, (n[2] - n[1]) * 1000 / r)));
        pops.push({ m: n[0], h: n[3], t: now });
      }
    });
    var vis = [];
    for (var i = 0; i < steps.length && steps[i].t - lis.pos < 6; i++) {
      if (stepEnd(steps[i]) > lis.pos) vis.push(steps[i]);
    }
    if (!vis.length) { endListen(); return { pos: pos, steps: [], cur: steps[si], waiting: false, pops: pops, now: now }; }
    return { pos: lis.pos, steps: vis, cur: null, waiting: false, pops: pops, now: now };
  }

  function init() {
    if (!$("songBtn")) return;
    $("songBtn").onclick = function () { if (song) stop(); openList(); };
    $("songX").onclick = closeList;
    $("songPop").onclick = function (e) { if (e.target === $("songPop")) closeList(); };
    $("songFind").oninput = list;
    $("songFind").placeholder = L("Search a song…", "Busca una canción…");
    $("songTabs").onclick = function (e) { var b = e.target.closest("button"); if (b) { $("songFind").value = ""; tab = /^[cl]$/.test(b.dataset.lv) ? b.dataset.lv : +b.dataset.lv; list(); } };
    $("songHand").onclick = function (e) { var b = e.target.closest("button"); if (b) { cfg.hand = b.dataset.h; saveCfg(); list(); } };
    $("songList").onclick = function (e) { var h = e.target.closest(".heart"), b = e.target.closest("button[data-id]"); if (!b) return; if (h) { stopPreview(); toggleFav(b.dataset.id); } else tapSong(b); };
    $("fwStop").onclick = stop;
    $("fwHint").onclick = hint;
    $("fwRe").onclick = function () { if (curId) start(curId); };
    $("fwPrev").onclick = function () { skip(-1); };
    $("fwNext").onclick = function () { skip(1); };
    $("fwSpd").onclick = function () { cfg.spd = SPDS[(SPDS.indexOf(cfg.spd) + 1) % SPDS.length]; saveCfg(); spdLabel(); };
    if ($("fwLoop")) $("fwLoop").onclick = loopTap;
    $("fwTiles").onclick = function (e) { if (e.target.closest("#fwEnc")) encorePlay(); };
    spdLabel(); loopLabel(); if (window.onLang) onLang(function () { spdLabel(); loopLabel(); });
    $("songBtn").innerHTML = "🎵 " + L("Songs", "Canciones");
    // leaving Piano only ends the song
    new MutationObserver(function () { if ((song || !$("follow").hidden) && !solo()) stop(); }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();

  // Carry on (start screen): the song he left half way, at the note he was on, with the hand he was playing
  function resume() {
    var r = getResume(); if (!r) return false;
    if (/^(R|L|RL)$/.test(r.hand)) { cfg.hand = r.hand; saveCfg(); }
    load(function () { start(r.id, r.si); });
    return true;
  }
  return { note: note, open: openList, start: start, stop: stop, isOn: function () { return !!song; }, cfg: cfg, frame: frame, PX: 150,
           resumeInfo: getResume, resume: resume,
           _state: function () { return { speed: Math.round(speed * 100) / 100, si: si, steps: steps.length, ok: okArr.filter(Boolean).length, miss: misses, want: steps[si] && steps[si].m,
             loop: loop && { a: loop.a, b: loop.b, passes: loop.passes }, mark: mark,
             hard: hard.reduce(function (s, v, i) { if (v) s.push(i); return s; }, []), encore: encore && { bits: encore.bits, i: encore.i, on: encore.on } }; } };
})();
