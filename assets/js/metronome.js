// ---- Beat: a metronome for Piano only ----
// A steady click so he can feel the pulse while he plays (KS1 music: steady beat, research/06).
//   - tempo by animal: tortoise 60, walking 80, rabbit 100, cheetah 120 beats a minute, then - / + in steps of 4
//   - 2, 3 or 4 beats in a bar; beat 1 is a higher click and a bigger dot (the accent)
//   - big numbered dots light up on every beat, so he sees the beat as well as hearing it
//   - a note played on the beat lights the dot green and counts as "on the beat"
//   - the clicks are scheduled ahead on the audio clock (Web Audio lookahead), so the timer never drifts
//   - it rests while a quick concept game, the Menu, the sound picker, the eye cover or a lock is up, and stops when Piano only closes
// Uses L, diary and window.pianoAudio (index.html). Settings: localStorage beatCfg.
var beat = (function () {
  var $ = function (id) { return document.getElementById(id); };
  var TEMPOS = [["🐢", "Tortoise", "Tortuga", 60], ["🚶", "Walking", "Caminando", 80],
                ["🐇", "Rabbit", "Conejo", 100], ["🐆", "Cheetah", "Guepardo", 120]];
  var MIN = 40, MAX = 160, VOLS = [0, 0.18, 0.35, 0.6];          // click loudness 1..3
  var cfg = { bpm: 80, beats: 4, vol: 2 };
  try { var s = JSON.parse(localStorage.getItem("beatCfg") || "{}"); for (var k in s) if (k in cfg) cfg[k] = +s[k] || cfg[k]; } catch (e) {}
  function save() { try { localStorage.setItem("beatCfg", JSON.stringify(cfg)); } catch (e) {} }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  cfg.bpm = clamp(cfg.bpm, MIN, MAX); cfg.beats = clamp(cfg.beats, 2, 4); cfg.vol = clamp(cfg.vol, 1, 3);

  var on = false, timer = null, nextT = 0, count = 0, queue = [], heard = [], ses = null, raf = 0;
  function ac() { return window.pianoAudio ? window.pianoAudio() : null; }
  function solo() { return document.body.classList.contains("solo") && document.body.classList.contains("play"); }
  function resting() { return document.body.classList.contains("inconcept") || document.hidden || (window.coverOn && coverOn()); }   // a game, the Menu, the quiz, the lock...

  // ---- Sound: a short wood-block "tock" (a falling sine plus a click of noise); beat 1 is higher ----
  var noise = null;
  function click(t, first) {
    var c = ac(); if (!c) return;
    var g = c.createGain(), v = VOLS[cfg.vol] * (first ? 1.25 : 1);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    g.connect(c.destination);
    var o = c.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(first ? 1760 : 1180, t); o.frequency.exponentialRampToValueAtTime(first ? 1250 : 820, t + 0.05);
    o.connect(g); o.start(t); o.stop(t + 0.08);
    if (!noise) { noise = c.createBuffer(1, Math.round(c.sampleRate * 0.01), c.sampleRate); var d = noise.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length); }
    var n = c.createBufferSource(), ng = c.createGain(); n.buffer = noise; ng.gain.value = v * 0.5; n.connect(ng); ng.connect(c.destination); n.start(t);
  }

  // ---- Scheduler: every 25 ms, book the clicks that fall in the next 0.12 s ----
  function tick() {
    var c = ac(); if (!c) return;
    if (!solo()) { stop(); return; }
    if (resting()) { nextT = 0; return; }                         // a quick game is open: pause, start again at beat 1
    if (!nextT) { nextT = c.currentTime + 0.12; count = 0; }
    var gap = 60 / cfg.bpm;
    while (nextT < c.currentTime + 0.12) {
      var b = count % cfg.beats;
      click(nextT, b === 0);
      queue.push({ t: nextT, b: b }); heard.push(nextT); if (heard.length > 8) heard.shift();
      nextT += gap; count++;
    }
  }
  function draw() {                                               // light the dot when its click is heard
    raf = 0; if (!on) return;
    var c = ac(); if (c) {
      var now = c.currentTime - (c.outputLatency || c.baseLatency || 0);
      while (queue.length && queue[0].t <= now) { light(queue.shift().b); }
    }
    raf = requestAnimationFrame(draw);
  }

  // ---- On the beat: a note within 0.12 s of a click ----
  var lastHit = -1;
  function note() {
    if (!on || !ses || resting()) return;
    var c = ac(); if (!c) return;
    var t = c.currentTime, best = 9;
    for (var i = 0; i < heard.length; i++) best = Math.min(best, Math.abs(t - heard[i]));
    ses.notes++;
    if (best < 0.12) {
      ses.hits++;
      var dots = $("beatDots").children, d = dots[cur]; if (d) { d.classList.remove("hit"); void d.offsetWidth; d.classList.add("hit"); }
      $("beatHits").textContent = "🎯 " + ses.hits;
    }
  }

  // ---- What he sees ----
  var cur = -1;
  function dots() {
    var h = "";
    for (var i = 0; i < cfg.beats; i++) h += '<i class="' + (i ? "" : "one") + '">' + (i + 1) + "</i>";
    $("beatDots").innerHTML = h; cur = -1;
  }
  function light(b) {
    var ds = $("beatDots").children; cur = b;
    for (var i = 0; i < ds.length; i++) ds[i].classList.toggle("now", i === b);
    var btn = $("beatBtn"); btn.classList.remove("pulse"); void btn.offsetWidth; btn.classList.add("pulse");
  }
  function tempoName() {
    for (var i = 0; i < TEMPOS.length; i++) if (TEMPOS[i][3] === cfg.bpm) return TEMPOS[i][0] + " " + L(TEMPOS[i][1], TEMPOS[i][2]);
    return "";
  }
  function render() {
    $("beatBtn").innerHTML = on ? "🥁 " + cfg.bpm : "🥁 " + L("Beat", "Ritmo");
    $("beatBtn").classList.toggle("on", on);
    $("beatGo").innerHTML = on ? "&#9632; " + L("Stop", "Parar") : "&#9654; " + L("Start the beat", "Empezar el ritmo");
    $("beatGo").classList.toggle("on", on);
    $("beatBpm").innerHTML = "<b>" + cfg.bpm + "</b> " + L("beats a minute", "pulsos por minuto") + (tempoName() ? "<br><span>" + tempoName() + "</span>" : "");
    $("beatTempos").innerHTML = TEMPOS.map(function (t) {
      return '<button data-bpm="' + t[3] + '"' + (t[3] === cfg.bpm ? ' class="sel"' : "") + '><span>' + t[0] + "</span>" + t[3] + "</button>";
    }).join("");
    $("beatBars").innerHTML = [2, 3, 4].map(function (n) {
      return '<button data-n="' + n + '"' + (n === cfg.beats ? ' class="sel"' : "") + ">" + n + "</button>";
    }).join("");
    $("beatVol").innerHTML = [1, 2, 3].map(function (n) {
      return '<button data-v="' + n + '"' + (n === cfg.vol ? ' class="sel"' : "") + ">" + ["🔈", "🔉", "🔊"][n - 1] + "</button>";
    }).join("");
    $("beatL1").textContent = L("How fast", "Qué rápido");
    $("beatL2").textContent = L("Beats in a bar", "Pulsos por compás");
    $("beatL3").textContent = L("Click", "Clic");
    $("beatFly").classList.toggle("on", on);
    if (!on) $("beatHits").textContent = "";
  }

  // ---- Start / stop ----
  function start() {
    if (on) return;
    var c = ac(); if (!c) return;
    on = true; nextT = 0; count = 0; queue = []; heard = [];
    ses = { t0: Date.now(), notes: 0, hits: 0 };
    dots(); timer = setInterval(tick, 25); tick();
    if (!raf) raf = requestAnimationFrame(draw);
    render();
  }
  function stop() {
    if (!on) return;
    on = false; clearInterval(timer); timer = null; queue = [];
    if (ses && window.diary) diary.ev("beat", { bpm: cfg.bpm, beats: cfg.beats, sec: Math.round((Date.now() - ses.t0) / 1000), notes: ses.notes, hits: ses.hits });
    ses = null;
    var ds = $("beatDots").children; for (var i = 0; i < ds.length; i++) ds[i].classList.remove("now", "hit");
    render();
  }
  function set(k, v) {
    cfg[k] = v; save();
    if (k === "beats") { dots(); count = count - (count % cfg.beats); }
    render();
  }
  function open(show) {
    var p = $("beatPanel"); show = show === undefined ? p.hidden : show;
    p.hidden = !show; $("beatBtn").classList.toggle("open", show);
  }

  function init() {
    if (!$("beatBtn")) return;
    $("beatBtn").onclick = function () { open(); };
    $("beatX").onclick = function () { open(false); };
    $("beatGo").onclick = function () { if (on) stop(); else { start(); open(false); } };
    $("beatDots").onclick = function () { open(true); };
    $("beatMinus").onclick = function () { set("bpm", clamp(cfg.bpm - 4, MIN, MAX)); };
    $("beatPlus").onclick = function () { set("bpm", clamp(cfg.bpm + 4, MIN, MAX)); };
    $("beatTempos").onclick = function (e) { var b = e.target.closest("button"); if (b) set("bpm", +b.dataset.bpm); };
    $("beatBars").onclick = function (e) { var b = e.target.closest("button"); if (b) set("beats", +b.dataset.n); };
    $("beatVol").onclick = function (e) { var b = e.target.closest("button"); if (b) { set("vol", +b.dataset.v); if (!on) { var c = ac(); if (c) click(c.currentTime + 0.02, true); } } };
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); });
    dots(); render();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();

  return { start: start, stop: stop, note: note, open: open, render: render, isOn: function () { return on; },
           cfg: function () { return { bpm: cfg.bpm, beats: cfg.beats, vol: cfg.vol }; }, set: set, TEMPOS: TEMPOS,
           _stats: function () { return ses ? { notes: ses.notes, hits: ses.hits } : null; } };
})();
