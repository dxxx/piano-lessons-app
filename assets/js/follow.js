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
//   - no lucky hits: a right key pressed in a flurry of wrong ones (3+ wrong keys in the last 1.5 s) does not move the song on,
//     so banging keys never plays the song for him; one calm press of the right key does
//   - the keyboard moves to show the notes he needs, and goes back to his own octave at the end
// Research: answer on the keyboard, notes from his songs, errorless (research/06 R9-R12, 01 R9). Uses L, voice, diary, pianoKeys,
// pianoPlayNote (index.html). Progress: localStorage songProg { id: { best, plays, last } }; settings: songCfg { hand, acc }.
var follow = (function () {
  var $ = function (id) { return document.getElementById(id); };
  var NN = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  var LV = ["", "⭐", "⭐⭐", "⭐⭐⭐"];
  var SPEED = 0.8, LEAD = 2.2;                                   // song seconds per real second while falling; first notes start this far above
  var pos = 0, lastF = 0, arrived = false, pops = [], lis = null;
  var index = null, loading = false, song = null, steps = [], si = 0, pressed = {}, firstTry = true, okFirst = 0, misses = 0, t0 = 0, tab = 1;
  var cfg = { hand: "RL", acc: 1 }, prog = {}, wrong = [];
  var LUCKY_N = 3, LUCKY_MS = 1500;
  try { var c = JSON.parse(localStorage.getItem("songCfg") || "{}"); if (/^(R|L|RL)$/.test(c.hand)) cfg.hand = c.hand; if (c.acc === 0) cfg.acc = 0; } catch (e) {}
  try { prog = JSON.parse(localStorage.getItem("songProg") || "{}") || {}; } catch (e) { prog = {}; }
  function saveCfg() { try { localStorage.setItem("songCfg", JSON.stringify(cfg)); } catch (e) {} }
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
  function list() {
    var box = $("songList"), ids = lessonIds();
    stopPreview();
    $("songTip").textContent = L("Tap a song once to listen. Tap it twice to play it yourself.", "Toca una canción una vez para escucharla. Dos veces para tocarla tú.");
    [].forEach.call($("songTabs").children, function (b) { b.classList.toggle("sel", +b.dataset.lv === tab); });
    [].forEach.call($("songHand").children, function (b) { b.classList.toggle("sel", b.dataset.h === cfg.hand); });
    if (!index.length) { box.innerHTML = '<p class="songnone">' + L("No songs on this tablet yet. A grown-up adds them from the computer.", "Todavía no hay canciones en esta tableta.") + "</p>"; return; }
    var mine = index.filter(function (s) { return s.lv === tab; });
    mine.sort(function (a, b) { return (ids.indexOf(b.yt) >= 0) - (ids.indexOf(a.yt) >= 0) || a.n - b.n; });   // songs from his lessons first
    box.innerHTML = mine.map(function (s) {
      var p = prog[s.id], stars = p ? LV[p.best] : "", lesson = s.yt && ids.indexOf(s.yt) >= 0;
      return '<button data-id="' + s.id + '"><b>' + esc(s.t) + "</b><span>" + (lesson ? "🎬 " + L("from your lessons", "de tus lecciones") + " · " : "") +
        s.n + " " + L("notes", "notas") + (stars ? ' · <i class="st">' + stars + "</i>" : "") + "</span></button>";
    }).join("") || '<p class="songnone">—</p>';
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
  function start(id) {
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
      si = 0; pressed = {}; firstTry = true; okFirst = 0; misses = 0; wrong = []; t0 = Date.now();
      pos = steps.length ? steps[0].t - LEAD : 0; lastF = 0; arrived = false; pops = []; lis = null; hintLabel();
      closeList(); document.body.classList.add("infollow"); $("follow").hidden = false;
      $("fwTitle").textContent = meta.t;
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
    $("fwCount").textContent = si + " / " + steps.length;
  }
  // Called by the Piano only canvas every frame: moves the song on (up to the note he has to play) and says what to draw
  function frame(now) {
    if (!song || !steps[si]) return null;
    var dt = lastF ? Math.min(0.1, (now - lastF) / 1000) : 0; lastF = now;
    pops = pops.filter(function (p) { return now - p.t < 450; });
    if (lis) return listenFrame(now, dt);
    var target = steps[si].t;
    if (pos < target) { pos = Math.min(target, pos + dt * SPEED); if (pos >= target - 0.001 && !arrived) { arrived = true; want(); } }
    var vis = [];                                                // notes he already caught stay until they have flowed into the key (long notes)
    for (var i = Math.max(0, si - 12); i < steps.length && steps[i].t - pos < 6; i++) if (i >= si || stepEnd(steps[i]) > pos) vis.push(steps[i]);
    return { pos: pos, steps: vis, cur: steps[si], waiting: arrived, pops: pops, now: now };
  }
  function note(m) {                                             // every key he presses (act.note)
    if (!song || !steps[si] || !solo()) return;
    if (lis) { endListen(); return; }                            // any key while listening = pause; it is not a note of the song
    var st = steps[si];
    var now = Date.now();
    while (wrong.length && now - wrong[0] > LUCKY_MS) wrong.shift();
    if (st.m.indexOf(m) < 0 || wrong.length >= LUCKY_N) {         // not this one (or a lucky hit in a flurry): no penalty, the right key glows brighter
      if (st.m.indexOf(m) < 0) wrong.push(now);
      firstTry = false; misses++;
      st.m.forEach(function (x) { var k = pianoKeys.el(x); if (k && !pressed[x]) { k.classList.remove("wantx"); void k.offsetWidth; k.classList.add("wantx"); } });
      return;
    }
    pressed[m] = true; var k = pianoKeys.el(m); if (k) k.classList.remove("want", "wantx");
    for (var i = 0; i < st.m.length; i++) if (!pressed[st.m[i]]) return;
    if (firstTry) okFirst++;
    var tnow = performance.now(); st.m.forEach(function (x) { pops.push({ m: x, h: st.h, t: tnow }); });
    accompany(st.t, steps[si + 1] ? steps[si + 1].t : st.t + 2);
    si++; pressed = {}; firstTry = true;
    if (si >= steps.length) finish(); else show();
  }
  function accompany(from, to) {                                 // the other hand plays its notes of this stretch, softly, in time
    if (!cfg.acc || !song.other.length || !window.pianoPlayNote) return;
    song.other.forEach(function (n) {
      if (n[1] >= from - 0.03 && n[1] < to - 0.03) {
        var ms = Math.max(120, Math.min(1500, (n[2] - n[1]) * 1000));
        setTimeout(function () { if (song) pianoPlayNote(n[0], 0.45, ms); }, Math.min(1500, (n[1] - from) * 1000));
      }
    });
  }
  function finish() {
    var total = steps.length, pct = total ? okFirst / total : 0, stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : 1, sec = Math.round((Date.now() - t0) / 1000);
    var p = prog[song.id] || { best: 0, plays: 0 }; p.plays++; p.best = Math.max(p.best, stars); p.last = new Date().toISOString().slice(0, 10); prog[song.id] = p; saveProg();
    if (window.diary) diary.ev("song", { id: song.id, t: song.t, hand: cfg.hand, steps: total, first: okFirst, miss: misses, sec: sec, stars: stars });
    clearKeys();
    $("fwTiles").innerHTML = '<span class="fwdone">' + LV[stars] + " " + L("You played it!", "¡La tocaste!") + "</span>";
    $("fwBar").style.width = "100%"; $("fwCount").textContent = total + " / " + total;
    if (window.voice && voice.say) voice.say(L("Well done! You played ", "¡Muy bien! Tocaste ") + song.t + ".");
    song = null;
    setTimeout(function () { if (!song) stop(); }, 6000);
  }
  function stop() {
    if (song && si > 0 && window.diary) diary.ev("song_stop", { id: song.id, at: si, steps: steps.length });
    song = null; steps = []; lis = null; hintLabel(); clearKeys();
    $("follow").hidden = true; document.body.classList.remove("infollow");
    if (window.pianoKeys) pianoKeys.restore();
  }
  // ---- Listen: the whole song plays from his note on, falling in real time, until a key is pressed (or Listen again) ----
  function hintLabel() { var b = $("fwHint"); if (b) b.innerHTML = lis ? "&#9208; " + L("Pause", "Pausa") : "&#128066; " + L("Listen", "Escuchar"); }
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
    var from = lis.pos; lis.pos += dt;
    song.all.forEach(function (n) {
      if (n[1] > from && n[1] <= lis.pos) {
        pianoPlayNote(n[0], n[3] === "R" ? 0.7 : 0.5, Math.max(120, Math.min(2000, (n[2] - n[1]) * 1000)));
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
    $("songTabs").onclick = function (e) { var b = e.target.closest("button"); if (b) { tab = +b.dataset.lv; list(); } };
    $("songHand").onclick = function (e) { var b = e.target.closest("button"); if (b) { cfg.hand = b.dataset.h; saveCfg(); list(); } };
    $("songList").onclick = function (e) { var b = e.target.closest("button[data-id]"); if (b) tapSong(b); };
    $("fwStop").onclick = stop;
    $("fwHint").onclick = hint;
    $("songBtn").innerHTML = "🎵 " + L("Songs", "Canciones");
    // leaving Piano only ends the song
    new MutationObserver(function () { if ((song || !$("follow").hidden) && !solo()) stop(); }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();

  return { note: note, open: openList, start: start, stop: stop, isOn: function () { return !!song; }, cfg: cfg, frame: frame, PX: 150,
           _state: function () { return { si: si, steps: steps.length, ok: okFirst, miss: misses, want: steps[si] && steps[si].m }; } };
})();
