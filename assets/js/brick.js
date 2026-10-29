// ---- Mini games (1.41): one Brick Game console (the 9999-in-1 handheld with the grey-green screen) and its cartridges.
// One screen of bricks and ONE set of buttons for every game, so a new game is only a new cartridge:
//   left thumb: the arrow pad (up, down, left, right); right thumb: A (big, red) and B (small, blue); top: back, pause, sound.
//   Swipe on the screen = the arrows; drag on the screen moves the paddle / ship where a game says so; a PC keyboard maps to the
//   same actions (arrows, Space = A, X = B, P = pause), which is how the games are tested by script.
// Learning sits INSIDE the games (the answer is the thing you eat, shoot or catch), about once every 20 s; a wrong answer never
// ends a game, it shows and says the right one. A boss question pauses the game every N minutes of play (default 10).
// Hidden until a grown-up turns games on (Menu > Mini games). Anything that covers the screen (Menu, lock, eye guard) pauses it.
// Uses voice, L, quiz, appMode, onLang, pianoAudio, pianoLoud from index.html, at call time only.
// Settings: localStorage gamesCfg. Progress (high scores, answers): gamesProg.
var brick = (function () {
  var $ = function (id) { return document.getElementById(id); };
  var DEF = { on: false, games: { snake: true, blocks: true, space: true, bricks: true, tank: true }, every: 10, need: 1, learn: "sumbig", slow: false, left: false, auto: false, snd: true };
  var cfg = JSON.parse(JSON.stringify(DEF));
  try {
    var c0 = JSON.parse(localStorage.getItem("gamesCfg") || "null");
    if (c0) { Object.keys(DEF).forEach(function (k) { if (k in c0) cfg[k] = c0[k]; }); cfg.games = Object.assign({}, DEF.games, c0.games || {}); }
  } catch (e) {}
  function saveCfg() { try { localStorage.setItem("gamesCfg", JSON.stringify(cfg)); } catch (e) {} }
  var prog = { hi: {}, right: 0, wrong: 0, log: [] };
  try { var p0 = JSON.parse(localStorage.getItem("gamesProg") || "null"); if (p0 && p0.hi) prog = p0; } catch (e) {}
  function saveProg() { try { prog.log = prog.log.slice(-300); localStorage.setItem("gamesProg", JSON.stringify(prog)); } catch (e) {} }
  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = rnd(0, i), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function tr(en, es) { return typeof L === "function" ? L(en, es) : en; }
  function say(t) { try { if (typeof voice !== "undefined") voice.say(t); } catch (e) {} }
  function tell(t) { try { if (typeof voice !== "undefined" && !voice.tell(t)) voice.say(t); } catch (e) {} }   // questions: either speech setting
  function hush() { try { if (typeof voice !== "undefined") voice.hush(true); } catch (e) {} }

  // ---- Sound: square-wave beeps like the handheld, capped by the grown-up loudness limit. Every food / hit plays the next
  // note of the C major scale (quiet ear training).
  function tone(m, dur, type, vol, at) {
    if (!cfg.snd || !window.pianoAudio) return;
    try {
      var ac = pianoAudio(), t = ac.currentTime + (at || 0), o = ac.createOscillator(), g = ac.createGain();
      var v = (vol || 0.1) * ((window.pianoLoud ? pianoLoud() : 100) / 100);
      o.type = type || "square"; o.frequency.value = 440 * Math.pow(2, (m - 69) / 12);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur + 0.03);
    } catch (e) {}
  }
  var SCALE = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83, 84], sc = 0;
  function seq(ns, gap, dur, type, vol) { ns.forEach(function (m, i) { tone(m, dur || 0.12, type, vol, i * (gap || 0.08)); }); }
  function sfx(n) {
    if (n === "note") { tone(SCALE[sc % SCALE.length], 0.13, "square", 0.08); sc++; }
    else if (n === "line") seq([72, 76, 79, 84], 0.07, 0.12);
    else if (n === "right") seq([72, 76, 79, 84], 0.09, 0.18, "triangle", 0.2);
    else if (n === "wrong") seq([64, 60], 0.16, 0.22, "triangle", 0.15);
    else if (n === "die") seq([67, 64, 60, 55], 0.1, 0.14, "square", 0.1);
    else if (n === "shot") tone(88, 0.04, "square", 0.04);
    else if (n === "hit") tone(45, 0.09, "square", 0.12);
    else if (n === "turn") tone(79, 0.03, "square", 0.04);
    else if (n === "level") seq([60, 64, 67, 72, 67, 72], 0.09, 0.12);
    else if (n === "over") seq([72, 67, 64, 60, 55, 48], 0.14, 0.2);
  }

  // ---- Learning: one question shape for every game: { text, say, ans, choices[3], full, fullSay }
  function sumQ() {
    var s = null;
    try { if (typeof quiz !== "undefined" && quiz.gameSum) s = quiz.gameSum(); } catch (e) {}
    if (!s) { var a = rnd(1, 9), b = rnd(1, 10 - a); s = { a: a, b: b, plus: true, ans: a + b }; }
    var op = s.plus ? " + " : " − ", w = s.plus ? tr(" plus ", " más ") : tr(" take away ", " menos ");
    return { kind: "sum", text: s.a + op + s.b, say: tr("What is ", "¿Cuánto es ") + s.a + w + s.b + "?", ans: s.ans,
      full: s.a + op + s.b + " = " + s.ans, fullSay: s.a + w + s.b + tr(" is ", " es ") + s.ans + "." };
  }
  function bondQ() {
    var T = Math.random() < 0.6 ? 10 : 20, a = rnd(1, T - 1);
    return { kind: "bond", text: a + " + ? = " + T, say: tr("What goes with " + a + " to make " + T + "?", "¿Cuánto le falta a " + a + " para " + T + "?"), ans: T - a,
      full: a + " + " + (T - a) + " = " + T, fullSay: a + tr(" and ", " y ") + (T - a) + tr(" make ", " son ") + T + "." };
  }
  function tensQ() {
    var t = rnd(1, 9), o = rnd(0, 9), n = t * 10 + o;
    return { kind: "tens", text: tr(t + " tens " + o + " ones", t + " decenas " + o + " unidades"), say: tr(t + " tens and " + o + " ones. Which number?", t + " decenas y " + o + " unidades. ¿Qué número?"), ans: n,
      full: tr(t + " tens " + o + " ones = " + n, t + " decenas " + o + " unidades = " + n), fullSay: tr(t + " tens and " + o + " ones is " + n + ".", t + " decenas y " + o + " unidades es " + n + ".") };
  }
  function countQ() {
    var st = [2, 5, 10][rnd(0, 2)], k = rnd(0, 6), s = [k * st, (k + 1) * st, (k + 2) * st];
    return { kind: "count", text: s.join(", ") + ", ?", say: tr("Count in " + st + "s: " + s.join(", ") + ", what comes next?", "Cuenta de " + st + " en " + st + ": " + s.join(", ") + ", ¿qué sigue?"), ans: (k + 3) * st,
      full: s.join(", ") + ", " + (k + 3) * st, fullSay: tr("Next comes ", "Sigue el ") + (k + 3) * st + "." };
  }
  // Bigger or smaller (operator 2026-10-29: "what number is bigger, 9 or 2?"): two numbers, tap / eat / shoot the bigger
  // (sometimes the smaller). The range follows his Bigger-or-smaller stage: to 10, to 20, then two-digit pairs with the tens
  // trap (36 or 63) that school uses.
  function bigQ() {
    var st = 2; try { if (typeof compare !== "undefined" && compare.stage) st = compare.stage(); } catch (e) {}
    var a, b, n = 0;
    do {
      if (st <= 1) { a = rnd(1, 10); b = rnd(1, 10); }
      else if (st === 2) { a = rnd(0, 20); b = rnd(0, 20); }
      else if (Math.random() < 0.4) { var t = rnd(1, 9), o = rnd(1, 9); a = t * 10 + o; b = o * 10 + t; }
      else { a = rnd(10, 99); b = Math.random() < 0.5 ? a + rnd(-9, 9) : rnd(10, 99); }
    } while ((a === b || a < 0 || b < 0 || b > 99) && ++n < 50);
    var big = Math.random() < 0.7, ans = big ? Math.max(a, b) : Math.min(a, b), other = ans === a ? b : a;
    var W = big ? tr("bigger", "mayor") : tr("smaller", "menor");
    return { kind: "big", text: (big ? tr("Bigger: ", "Mayor: ") : tr("Smaller: ", "Menor: ")) + a + tr(" or ", " o ") + b + "?",
      say: tr("Which number is " + W + ", " + a + " or " + b + "?", "¿Qué número es " + W + ", " + a + " o " + b + "?"), ans: ans,
      full: ans + (big ? " > " : " < ") + other, fullSay: ans + tr(" is " + W + " than ", " es " + W + " que ") + other + ".", choices: shuffle([a, b]) };
  }
  function withChoices(q) {
    if (q.choices) return q;
    var a = q.ans, c = [a], cand = shuffle([a + 1, a - 1, a + 2, a - 2, a + 10, a - 10]);
    if (q.kind === "tens" && a % 10 && Math.floor(a / 10) !== a % 10) cand.unshift(+(String(a % 10) + String(Math.floor(a / 10))));   // 47 vs 74: the place-value slip
    if (q.kind === "count") cand.unshift(a + (a % 10 === 0 ? 5 : 1));
    cand.forEach(function (v) { if (c.length < 3 && v >= 0 && c.indexOf(v) < 0) c.push(v); });
    q.choices = shuffle(c); return q;
  }
  var lastKind = "";
  function makeQ(boss) {
    var L2 = { maths: [sumQ], big: [bigQ], sumbig: [sumQ, bigQ], mix: [sumQ, bigQ, bondQ, tensQ, countQ] }[boss ? "maths" : cfg.learn] || [sumQ, bigQ];
    var f = L2[rnd(0, L2.length - 1)];
    if (L2.length > 1 && f.name === lastKind) f = L2[(L2.indexOf(f) + 1) % L2.length];      // take turns: never the same kind twice in a row
    lastKind = f.name; return withChoices(f());
  }
  var PRAISE = [["Yes!", "¡Sí!"], ["Brilliant!", "¡Genial!"], ["That's it!", "¡Eso es!"], ["Well done!", "¡Bien hecho!"], ["Spot on!", "¡Exacto!"]];
  function praise() { var p = PRAISE[rnd(0, PRAISE.length - 1)]; return tr(p[0], p[1]); }
  function record(game, q, v, ok) {
    if (ok) prog.right++; else prog.wrong++;
    prog.log.push({ t: new Date().toISOString(), g: game, q: q.text, a: v, c: q.ans, ok: ok }); saveProg();
  }

  // ---- The console
  var GAMES = {}, ORDER = ["snake", "blocks", "space", "bricks", "tank"];
  var el = null, cv = null, cx = null, nv = null, nx = null, C = 10, R = 20, S = 24, dpr = 1;
  var game = null, gid = null, state = "room", paused = false, raf = 0, last = 0, playMs = 0, bossMs = 0, coverT = 0, isCovered = false;
  var score = 0, lives = 3, level = 1, cur = null, lastQEnd = 0, firstQ = true, overT = 0, chooser = null, autoT = 0, powerTxt = "";
  var held = {}, rep = {}, grid = [], labels = [];
  var LCD = "#9eac82", INK = "#1b2213", GHOST = "rgba(27,34,19,.09)", CHIP = "#cdd7b2";

  function build() {
    el = document.createElement("div"); el.className = "brick"; el.id = "brick";
    el.innerHTML =
      '<div class="bkroom"><h2 id="bkRoomT"></h2><div class="bkcards" id="bkCards"></div><div class="bkstat" id="bkStat"></div></div>' +
      '<div class="bkdev">' +
      '<div class="bkpad" id="bkPad"><i data-d="up">&#9650;</i><i data-d="left">&#9664;</i><i data-d="right">&#9654;</i><i data-d="down">&#9660;</i><span></span></div>' +
      '<div class="bkmid"><div class="bktop"><button id="bkBack">&#11013;&#65039;</button><b class="bkname" id="bkName"></b><button id="bkPause"></button><button id="bkSnd"></button></div>' +
      '<div class="bklcd"><div class="bkscreen" id="bkScreen"><canvas id="bkCv"></canvas><div class="bkchoose" id="bkChoose"></div><div class="bkpaused" id="bkPaused"></div></div>' +
      '<div class="bkside"><div class="bkq" id="bkQ"></div><div>SCORE<b class="big" id="bkScore">0</b></div><div>HI-SCORE<b id="bkHi">0</b></div>' +
      '<div id="bkNextW">NEXT<canvas id="bkNext"></canvas></div><div>LEVEL<b id="bkLv">1</b></div><div id="bkLivesW">LIVES<b id="bkLives"></b></div><div class="bkpow" id="bkPow"></div><div class="bkhelp" id="bkHelp"></div></div></div>' +
      '<div class="bkbrand">BRICK GAME</div></div>' +
      '<div class="bkbtns"><button id="bkB">B</button><button id="bkA">A</button></div>' +
      '</div>' +
      '<div class="bkask" id="bkAsk"><h2 id="bkAskT"></h2><div class="bkaskq" id="bkAskQ"></div><div class="bkaskc" id="bkAskC"></div><div class="bkaskm" id="bkAskM"></div></div>';
    document.body.appendChild(el);
    cv = $("bkCv"); cx = cv.getContext("2d"); nv = $("bkNext"); nx = nv.getContext("2d");
    bindInput();
    $("bkBack").onclick = function () { room(); };
    $("bkPause").onclick = function () { if (state === "play") { paused = !paused; ui(); } };
    $("bkSnd").onclick = function () { cfg.snd = !cfg.snd; saveCfg(); ui(); };
    window.addEventListener("resize", function () { if (state !== "room") resize(); });
    if (typeof onLang === "function") onLang(function () { $("bkRoomT").textContent = tr("🎮 Pick a game", "🎮 Elige un juego"); if (state === "room") cards(); });
  }

  function resize() {
    var scr = $("bkScreen"), box = scr.parentElement, H = box.clientHeight - 6, Wmax = Math.max(160, Math.min(360, window.innerWidth - 720));
    S = Math.max(12, Math.floor(Math.min(H / R, Wmax / C)));
    dpr = window.devicePixelRatio || 1;
    cv.width = C * S * dpr; cv.height = R * S * dpr; cv.style.width = C * S + "px"; cv.style.height = R * S + "px";
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var ns = 12; nv.width = 4 * ns * dpr; nv.height = 2 * ns * dpr; nv.style.width = 4 * ns + "px"; nv.style.height = 2 * ns + "px"; nx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function cell(c, x, y, s, on) {
    var p = s * 0.09, w = s * 0.1;
    c.strokeStyle = on ? INK : GHOST; c.fillStyle = on ? INK : GHOST; c.lineWidth = w;
    c.strokeRect(x + p + w / 2, y + p + w / 2, s - 2 * p - w, s - 2 * p - w);
    c.fillRect(x + s * 0.3, y + s * 0.3, s * 0.4, s * 0.4);
  }
  function draw() {
    if (!cx) return;
    cx.fillStyle = LCD; cx.fillRect(0, 0, C * S, R * S);
    var blink = Math.floor(performance.now() / 180) % 2 === 0;
    for (var y = 0; y < R; y++) for (var x = 0; x < C; x++) { var v = grid[y * C + x]; cell(cx, x * S, y * S, S, v === 1 || (v === 2 && blink)); }
    labels.forEach(function (l) {
      var x = l.x * S + 2, y = l.y * S + 2, w = l.w * S - 4, h = l.h * S - 4;
      cx.fillStyle = l.dim ? "#b9c39c" : CHIP; cx.strokeStyle = INK; cx.lineWidth = 2.5;
      cx.beginPath(); if (cx.roundRect) cx.roundRect(x, y, w, h, 5); else cx.rect(x, y, w, h); cx.fill(); cx.stroke();
      var t = String(l.t), fs = Math.min(h * 0.8, (w * 1.6) / Math.max(1, t.length));
      cx.fillStyle = INK; cx.font = "800 " + Math.floor(fs) + "px Fredoka, system-ui, sans-serif"; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(t, x + w / 2, y + h / 2 + 1);
    });
  }
  function clearGrid() { grid = new Array(C * R).fill(0); labels = []; }

  // ---- The API every cartridge gets
  var api = {
    px: function (x, y, v) { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < C && y >= 0 && y < R) grid[y * C + x] = v === undefined ? 1 : v; },
    label: function (x, y, w, h, t, dim) { labels.push({ x: x, y: y, w: w, h: h, t: t, dim: dim }); },
    rnd: rnd, shuffle: shuffle, sfx: sfx, cfg: cfg,
    held: function (a) { return !!held[a]; },
    speed: function (ms) { return ms * (cfg.slow ? 1.4 : 1); },
    lv: function () { return level; },
    score: function (n) { score += n; ui(); },
    levelUp: function () { level = Math.min(10, level + 1); sfx("level"); ui(); },
    lifeLost: function () { lives--; sfx("die"); ui(); if (lives <= 0) { over(); return false; } return true; },
    over: function () { over(); },
    next: function (cells) {                                  // the NEXT window (Falling Blocks)
      var s = 12; nx.fillStyle = LCD; nx.fillRect(0, 0, 4 * s, 2 * s);
      for (var y = 0; y < 2; y++) for (var x = 0; x < 4; x++) cell(nx, x * s, y * s, s, !!cells && cells.some(function (c) { return c[0] === x && c[1] === y; }));
    },
    power: function (t) { if ((t || "") !== powerTxt) { powerTxt = t || ""; ui(); } },
    // learning moments
    wantQ: function () { return cfg.learn !== "off" && !cur && !chooser && playMs - lastQEnd > (firstQ ? 8000 : 20000); },
    startQ: function () { cur = makeQ(false); cur.t0 = playMs; firstQ = false; ui(); hush(); tell(cur.say); return cur; },
    q: function () { return cur; },
    qAge: function () { return cur ? playMs - cur.t0 : 0; },
    answer: function (v) {
      if (!cur) return false;
      var ok = +v === cur.ans; record(gid, cur, v, ok); hush();
      if (ok) { sfx("right"); var pr = praise(); say(pr + " " + cur.fullSay); flash(pr + " " + cur.full, true); cur = null; lastQEnd = playMs; }
      else { sfx("wrong"); say(tr("Not " + v + ". ", "No es " + v + ". ") + cur.fullSay); flash(cur.full, false); }
      ui(); return ok;
    },
    endQ: function () { if (!cur) return; say(cur.fullSay); flash(cur.full, false); cur = null; lastQEnd = playMs; ui(); },
    choose: function (items, done) { openChooser(items, done); }
  };
  var flashT = null;
  function flash(t, ok) { var q = $("bkQ"); q.textContent = t; q.className = "bkq show " + (ok ? "ok" : "no"); clearTimeout(flashT); flashT = setTimeout(function () { flashT = null; ui(); }, 2600); }

  function ui() {
    if (!el) return;
    $("bkScore").textContent = score; $("bkLv").textContent = level;
    $("bkHi").textContent = Math.max(score, (gid && prog.hi[gid]) || 0);
    $("bkLives").textContent = new Array(Math.max(0, lives) + 1).join("■ ");
    $("bkSnd").innerHTML = cfg.snd ? "&#128266;" : "&#128263;";
    $("bkPause").innerHTML = paused ? "&#9654;&#65039;" : "&#9208;&#65039;";
    var showOver = state === "over" && overT > 900;
    $("bkPaused").textContent = paused ? tr("PAUSE", "PAUSA") : showOver ? tr("GAME OVER – press A", "FIN – pulsa A") : "";
    $("bkPaused").classList.toggle("on", paused || showOver);
    $("bkPow").textContent = powerTxt;
    if (!flashT) { var q = $("bkQ"); q.textContent = cur ? cur.text : ""; q.className = "bkq" + (cur ? " show" : ""); }
    el.classList.toggle("swap", !cfg.left);   // default (operator, right-handed): arrow pad on the RIGHT, A + B on the left
  }

  function cards() {
    var box = $("bkCards"); box.innerHTML = "";
    ORDER.filter(function (k) { return cfg.games[k]; }).forEach(function (k) {
      var g = GAMES[k], b = document.createElement("button"); b.className = "bkcard"; b.dataset.g = k;
      b.innerHTML = "<b>" + g.icon + "</b>" + tr(g.name[0], g.name[1]) + "<small>" + tr("Best: ", "Mejor: ") + (prog.hi[k] || 0) + "</small>";
      b.onclick = function () { play(k); }; box.appendChild(b);
    });
    var n = prog.right + prog.wrong;
    $("bkStat").textContent = n ? tr("Answers in games: " + prog.right + " right of " + n, "Respuestas en juegos: " + prog.right + " bien de " + n) : "";
  }
  function keepHi() { if (gid && score > (prog.hi[gid] || 0)) { prog.hi[gid] = score; saveProg(); } }
  function room() {
    keepHi();
    state = "room"; game = null; gid = null; paused = false; closeChooser(); cur = null; powerTxt = ""; hush();
    el.classList.remove("playing"); cards();
  }
  function play(k) {
    gid = k; var G = GAMES[k];
    game = Object.create(G); C = G.cols; R = G.rows;
    score = 0; lives = G.lives === undefined ? 3 : G.lives; level = 1; cur = null; lastQEnd = playMs; firstQ = true; paused = false; overT = 0; powerTxt = ""; closeChooser();
    el.classList.add("playing"); $("bkName").textContent = G.icon + " " + tr(G.name[0], G.name[1]);
    $("bkHelp").textContent = tr(G.help[0], G.help[1]);
    $("bkNextW").style.display = G.nextWin ? "" : "none"; $("bkLivesW").style.display = lives ? "" : "none";
    resize(); clearGrid(); api.next(null); game.init(api); state = "play"; ui();
    hush(); say(tr(G.name[0] + "!", G.name[1] + "!"));
  }
  function over() {
    if (state !== "play") return;
    state = "over"; overT = 0; cur = null; closeChooser(); sfx("over");
    if (score > (prog.hi[gid] || 0)) { keepHi(); say(tr("Game over. A new best score!", "Fin. ¡Nuevo récord!")); }
    else say(tr("Game over. Press A to play again.", "Fin del juego. Pulsa A para jugar otra vez."));
    ui();
  }

  // ---- Boss question: the game pauses every cfg.every minutes of play; cfg.need right answers carry on
  var boss = null;
  function bossOpen() {
    state = "boss"; boss = { right: 0 }; closeChooser(); releaseAll(); hush();
    $("bkAskT").textContent = tr("🧠 Boss question!", "🧠 ¡Pregunta jefe!");
    $("bkAsk").classList.add("on"); bossAsk();
  }
  function bossAsk() {
    if (!boss) return;
    var q = boss.q = makeQ(true), box = $("bkAskC"); boss.busy = false;
    $("bkAskQ").textContent = q.text; $("bkAskM").textContent = cfg.need > 1 ? tr(boss.right + " of " + cfg.need + " right", boss.right + " de " + cfg.need + " bien") : "";
    box.innerHTML = "";
    q.choices.forEach(function (v, i) {
      var b = document.createElement("button"); b.textContent = v; b.className = "c" + i;
      b.onclick = function () {
        if (!boss || boss.busy) return; boss.busy = true;
        var ok = v === q.ans; record("boss", q, v, ok); hush();
        if (ok) {
          b.classList.add("right"); sfx("right"); boss.right++;
          if (boss.right >= cfg.need) { say(praise() + " " + tr("Back to the game!", "¡A jugar!")); setTimeout(bossClose, 1300); }
          else { say(praise()); setTimeout(bossAsk, 1300); }
        } else {
          b.classList.add("wrong"); sfx("wrong"); [].forEach.call(box.children, function (x) { if (+x.textContent === q.ans) x.classList.add("right"); });
          $("bkAskM").textContent = q.full; say(tr("Not " + v + ". ", "No es " + v + ". ") + q.fullSay); setTimeout(bossAsk, 3200);
        }
      };
      box.appendChild(b);
    });
    tell(q.say);
  }
  function bossClose() { $("bkAsk").classList.remove("on"); boss = null; bossMs = 0; state = game ? "play" : "room"; }

  // ---- Chooser (Falling Blocks: pick the next piece by its answer). Pad left/right + A works too.
  function openChooser(items, done) {
    chooser = { items: items, done: done, sel: Math.floor((items.length - 1) / 2), busy: false }; var box = $("bkChoose"); box.innerHTML = "";
    items.forEach(function (it, i) {
      var b = document.createElement("button"); b.innerHTML = (it.svg || "") + "<b>" + it.v + "</b>";
      b.onclick = function () { pick(i); }; box.appendChild(b);
    });
    box.classList.add("on"); markSel();
  }
  function markSel() { if (!chooser) return; [].forEach.call($("bkChoose").children, function (b, i) { b.classList.toggle("sel", i === chooser.sel); }); }
  function pick(i) {
    if (!chooser || chooser.busy) return; chooser.busy = true;
    var ch = chooser, it = ch.items[i], ans = cur ? cur.ans : null, ok = api.answer(it.v), bs = $("bkChoose").children;
    bs[i].classList.add(ok ? "right" : "wrong");
    if (!ok) { ch.items.forEach(function (x, j) { if (x.v === ans) bs[j].classList.add("right"); }); cur = null; lastQEnd = playMs; ui(); }
    setTimeout(function () { if (chooser !== ch) return; closeChooser(); ch.done(ok ? it : null); }, ok ? 700 : 2000);
  }
  function closeChooser() { chooser = null; var b = $("bkChoose"); if (b) { b.classList.remove("on"); b.innerHTML = ""; } }

  // ---- Input: every source becomes one of up, down, left, right, a, b (+ pause)
  function press(a) {
    if (state === "over") { if ((a === "a" || a === "b") && overT > 900) play(gid); return; }
    if (state !== "play" || paused) return;
    if (chooser) {
      var n = chooser.items.length;
      if (a === "left") { chooser.sel = (chooser.sel + n - 1) % n; markSel(); } else if (a === "right") { chooser.sel = (chooser.sel + 1) % n; markSel(); }
      else if (a === "a" || a === "b") pick(chooser.sel);
      return;
    }
    if (game && game.press) game.press(a);
  }
  function down(a) {
    if (held[a]) return; held[a] = true;
    try { if (navigator.vibrate) navigator.vibrate(8); } catch (e) {}
    press(a);
    var r = game && game.repeat ? game.repeat[a] : undefined;
    if (r === undefined && /^(left|right|down|up)$/.test(a)) r = [200, 90];
    rep[a] = r ? { t: r[0], every: r[1] } : null;
  }
  function up(a) { held[a] = false; rep[a] = null; }
  function releaseAll() {
    Object.keys(held).forEach(up);
    if (el) [].forEach.call(el.querySelectorAll(".on[data-d], #bkA.on, #bkB.on"), function (e) { e.classList.remove("on"); });
  }
  function repeatTick(dt) {
    Object.keys(rep).forEach(function (a) { var r = rep[a]; if (!r || !held[a]) return; r.t -= dt; if (r.t <= 0) { r.t += r.every; press(a); } });
  }
  function bindInput() {
    var pad = $("bkPad"), padDir = null, padId = null;
    function dirAt(e) {
      var r = pad.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      if (Math.hypot(dx, dy) < r.width * 0.12) return null;
      return Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : (dy < 0 ? "up" : "down");
    }
    function setDir(d) {
      if (d === padDir) return;
      if (padDir) { up(padDir); var o = pad.querySelector('[data-d="' + padDir + '"]'); if (o) o.classList.remove("on"); }
      padDir = d;
      if (d) { var n = pad.querySelector('[data-d="' + d + '"]'); if (n) n.classList.add("on"); down(d); }
    }
    pad.addEventListener("pointerdown", function (e) { e.preventDefault(); padId = e.pointerId; try { pad.setPointerCapture(e.pointerId); } catch (x) {} setDir(dirAt(e)); });
    pad.addEventListener("pointermove", function (e) { if (e.pointerId === padId) setDir(dirAt(e)); });
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (t) { pad.addEventListener(t, function (e) { if (e.pointerId === padId) { padId = null; setDir(null); } }); });
    [["bkA", "a"], ["bkB", "b"]].forEach(function (x) {
      var b = $(x[0]);
      b.addEventListener("pointerdown", function (e) { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (z) {} b.classList.add("on"); down(x[1]); });
      ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (t) { b.addEventListener(t, function () { b.classList.remove("on"); up(x[1]); }); });
    });
    // the screen: drag (games that ask for it), swipe = arrows, a tap = A
    var sw = null;
    cv.addEventListener("pointerdown", function (e) {
      e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (z) {}
      sw = { x: e.clientX, y: e.clientY, moved: false, t: performance.now() };
      if (game && game.dragTo && state === "play" && !paused) { var r = cv.getBoundingClientRect(); game.dragTo(Math.floor((e.clientX - r.left) / S)); sw.drag = true; }
    });
    cv.addEventListener("pointermove", function (e) {
      if (!sw) return;
      if (sw.drag) { if (state === "play" && !paused && game) { var r = cv.getBoundingClientRect(); game.dragTo(Math.floor((e.clientX - r.left) / S)); } if (Math.abs(e.clientX - sw.x) > 6) sw.moved = true; return; }
      var dx = e.clientX - sw.x, dy = e.clientY - sw.y;
      if (Math.hypot(dx, dy) >= 30) { var d = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : (dy < 0 ? "up" : "down"); press(d); sw.x = e.clientX; sw.y = e.clientY; sw.moved = true; }
    });
    cv.addEventListener("pointerup", function () {
      if (sw && !sw.moved && performance.now() - sw.t < 350) { if (state === "over") press("a"); else if (game && game.tapIsA !== false) press("a"); }
      sw = null;
    });
    cv.addEventListener("pointercancel", function () { sw = null; });
    el.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    var KEYS = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", " ": "a", x: "b", X: "b", z: "b", Z: "b" };
    document.addEventListener("keydown", function (e) {
      if (!document.body.classList.contains("ingames") || state === "room") return;
      if (e.key === "p" || e.key === "P") { $("bkPause").click(); return; }
      var a = KEYS[e.key]; if (!a) return; e.preventDefault(); if (!e.repeat) down(a);
    });
    document.addEventListener("keyup", function (e) { var a = KEYS[e.key]; if (a) up(a); });
  }

  // ---- The loop. Anything over the screen (Menu, lock, eye guard, a hidden app) pauses the game.
  function covered() {
    if (document.hidden) return true;
    var r = cv.getBoundingClientRect(); if (!r.width) return true;
    var e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return !e || !el.contains(e);
  }
  function frame(t) {
    raf = requestAnimationFrame(frame);
    var dt = Math.min(50, t - (last || t)); last = t;
    step(dt, false);
  }
  function step(dt, test) {                                  // test = driven by brick.tick() from a script: no cover check
    if (state === "room" || !game) return;
    if (test) isCovered = false;
    else { coverT -= dt; if (coverT <= 0) { coverT = 250; var was = isCovered; isCovered = covered(); if (isCovered && !was) releaseAll(); } }
    clearGrid();
    if (state === "play" && !paused && !isCovered && !chooser) {
      playMs += dt; bossMs += dt; repeatTick(dt);
      if (cfg.auto && game.autofire) { autoT -= dt; if (autoT <= 0) { autoT = 320; game.press("a"); } }
      game.update(dt);
      if (state === "play" && cfg.every && bossMs >= cfg.every * 60000) bossOpen();
    }
    if (state === "over") { overT += dt; if (overT > 900 && overT - dt <= 900) ui(); }
    if (game) game.draw(api);
    if (state === "over") { var rows = Math.min(R, Math.floor(overT / 45)); for (var y = R - rows; y < R; y++) for (var x = 0; x < C; x++) grid[y * C + x] = 1; if (rows >= R) labels = []; }
    draw();
  }
  function start() {
    if (!el) build();
    room(); last = 0;
    if (!raf) raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (!el) return;
    keepHi();
    cancelAnimationFrame(raf); raf = 0; releaseAll(); closeChooser();
    if (boss) { $("bkAsk").classList.remove("on"); boss = null; }       // bossMs is kept: leaving and coming back does not skip the question
    state = "room"; game = null; gid = null; cur = null; el.classList.remove("playing");
  }
  function visible() { return !!cfg.on && ORDER.some(function (k) { return cfg.games[k]; }); }
  function homeTile() {
    var b = $("homeGames"); if (!b) return;
    b.hidden = !visible();
    try { if (typeof appMode !== "undefined" && appMode.cards) appMode.cards(); } catch (e) {}
  }

  // ---- Grown-ups menu: Mini games
  function menu() {
    var M = {
      gmOn: function () { return "🎮 Mini games: " + (cfg.on ? "ON (a Games tile on the start screen)" : "OFF (hidden from him)"); },
      gmEvery: function () { return "🧠 Boss question every: " + cfg.every + " min of play"; },
      gmNeed: function () { return "Right answers to carry on: " + cfg.need; },
      gmLearn: function () { return "📚 Inside the games: " + { sumbig: "sums at his level + bigger or smaller", maths: "sums at his level", big: "bigger or smaller", mix: "everything mixed (sums, bigger or smaller, make 10, tens and ones, counting)", off: "just play" }[cfg.learn]; },
      gmSlow: function () { return "🐢 Speed: " + (cfg.slow ? "slow" : "normal"); },
      gmAuto: function () { return "Auto-fire in Space Defenders: " + (cfg.auto ? "ON" : "OFF"); },
      gmLeft: function () { return "✋ Buttons: " + (cfg.left ? "arrow pad on the LEFT, A and B on the right" : "arrow pad on the RIGHT, A and B on the left") + " (tap to switch)"; },
      gmStats: function () { var n = prog.right + prog.wrong; return "Answers in games: " + (n ? prog.right + " right of " + n : "none yet") + " (tap to see the last ones)"; }
    };
    ORDER.forEach(function (k) { M["gm_" + k] = function () { var g = GAMES[k]; return g.icon + " " + g.name[0] + ": " + (cfg.games[k] ? "ON" : "OFF"); }; });
    function label() { Object.keys(M).forEach(function (id) { var b = $(id); if (b) { b.textContent = M[id](); if (b.classList.contains("dep")) b.disabled = !cfg.on; } }); }
    var ACT = {
      gmOn: function () { cfg.on = !cfg.on; },
      gmEvery: function () { var E = [5, 10, 15, 20]; cfg.every = E[(E.indexOf(cfg.every) + 1) % E.length]; },
      gmNeed: function () { cfg.need = cfg.need % 3 + 1; },
      gmLearn: function () { var E = ["sumbig", "maths", "big", "mix", "off"]; cfg.learn = E[(E.indexOf(cfg.learn) + 1) % E.length]; },
      gmSlow: function () { cfg.slow = !cfg.slow; },
      gmAuto: function () { cfg.auto = !cfg.auto; }, gmLeft: function () { cfg.left = !cfg.left; },
      gmStats: function () {
        var l = prog.log.slice(-8).reverse().map(function (e) { return (e.ok ? "✔ " : "✖ ") + e.q + " → " + e.a + (e.ok ? "" : " (" + e.c + ")") + " · " + e.g; });
        var n = $("gmLog"); if (n) n.textContent = l.length ? l.join("\n") : "No answers yet.";
      }
    };
    ORDER.forEach(function (k) { ACT["gm_" + k] = function () { cfg.games[k] = !cfg.games[k]; }; });
    Object.keys(ACT).forEach(function (id) { var b = $(id); if (b) b.onclick = function () { ACT[id](); saveCfg(); label(); homeTile(); ui(); }; });
    label();
  }

  // =============================== CARTRIDGES ===============================
  // A cartridge: { name, icon, cols, rows, help, init(api), update(dt), draw(api), press(action), optional: dragTo(col),
  // repeat {action: [first ms, then every ms] | null}, lives (0 = none), nextWin, autofire, tapIsA }.
  var DIRS = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };

  // ---- Snake: eat the dots; in a learning moment three numbers appear, eat the answer (grows 3). A wrong one shrinks it by 1.
  GAMES.snake = {
    name: ["Snake", "Serpiente"], icon: "🐍", cols: 10, rows: 16, lives: 0, repeat: { up: null, down: null, left: null, right: null, a: null, b: null }, tapIsA: false,
    help: ["Arrows or swipe to steer, hold A to go fast. Eat the answer! Bite your tail and it just gets shorter.", "Flechas o desliza para girar, mantén A para correr. ¡Cómete la respuesta! Si te muerdes la cola, solo se acorta."],
    init: function (a) { this.a = a; this.foods = []; this.food = null; this.reset(); this.acc = 0; this.eaten = 0; this.grow = 0; this.place(); },
    reset: function () { this.body = [{ x: 4, y: 9 }, { x: 4, y: 10 }, { x: 4, y: 11 }]; this.dir = DIRS.up; this.q = []; this.inv = 1200; },
    taken: function (x, y) {
      return this.body.some(function (b) { return b.x === x && b.y === y; }) || (this.food && this.food.x === x && this.food.y === y) ||
        this.foods.some(function (f) { return f.x === x && f.y === y; });
    },
    free: function () { var h = this.body[0], p, n = 0; do { p = { x: rnd(0, 9), y: rnd(0, 15) }; } while ((this.taken(p.x, p.y) || Math.abs(p.x - h.x) + Math.abs(p.y - h.y) < 3) && ++n < 400); return p; },
    place: function () { this.food = null; this.food = this.free(); },
    press: function (k) {
      var d = DIRS[k]; if (!d) return;
      var lastD = this.q.length ? this.q[this.q.length - 1] : this.dir;
      if ((d.x === -lastD.x && d.y === -lastD.y) || d === lastD) return;
      if (this.q.length < 2) { this.q.push(d); this.a.sfx("turn"); }
    },
    update: function (dt) {
      var s = this, a = s.a; s.acc += dt; if (s.inv > 0) s.inv -= dt;
      if (!s.foods.length && a.wantQ()) { var q = a.startQ(); q.choices.forEach(function (v) { var p = s.free(); p.v = v; s.foods.push(p); }); }
      if (s.foods.length && a.qAge() > 35000) a.endQ();
      if (s.foods.length && !a.q()) s.foods = [];
      var st = a.speed(Math.max(120, 330 - a.lv() * 20)) * (a.held("a") || a.held("b") ? 0.45 : 1);
      while (s.acc >= st) { s.acc -= st; if (!s.move()) { s.acc = 0; break; } }
    },
    move: function () {
      var s = this, a = s.a; if (s.q.length) s.dir = s.q.shift();
      var h = s.body[0], n = { x: h.x + s.dir.x, y: h.y + s.dir.y };
      n.x = (n.x + 10) % 10; n.y = (n.y + 16) % 16;            // the walls wrap round (operator 2026-10-29: an endless game)
      for (var i = 1; i < s.body.length - 1; i++) if (s.body[i].x === n.x && s.body[i].y === n.y) {   // bit his tail: it breaks off there, nothing else
        s.body = s.body.slice(0, Math.max(i, 3)); s.grow = 0; a.sfx("hit"); break;
      }
      s.body.unshift(n);
      if (s.food && n.x === s.food.x && n.y === s.food.y) { s.grow += 1; a.score(1); a.sfx("note"); s.eaten++; if (s.eaten % 10 === 0) a.levelUp(); s.place(); }
      for (var j = 0; j < s.foods.length; j++) {
        var f = s.foods[j];
        if (f.x === n.x && f.y === n.y) {
          if (a.answer(f.v)) { s.grow += 3; a.score(5); s.foods = []; }
          else { s.foods.splice(j, 1); if (s.body.length > 3) s.body.pop(); }
          break;
        }
      }
      if (s.grow > 0) s.grow--; else s.body.pop();
      return true;
    },
    draw: function (a) {
      var s = this, b = s.inv > 0 ? 2 : 1;
      s.body.forEach(function (p) { a.px(p.x, p.y, b); });
      if (s.food) a.px(s.food.x, s.food.y, 2);
      s.foods.forEach(function (f) { a.label(f.x, f.y, 1, 1, f.v); });
    }
  };

  // ---- Falling Blocks: the classic. A full line is a TEN (score counts in tens). Every few pieces he picks the next piece
  // by tapping the right answer (or pad + A): right = the piece he picked, wrong = a surprise piece.
  var SH = { I: [[0, 1], [1, 1], [2, 1], [3, 1]], O: [[1, 0], [2, 0], [1, 1], [2, 1]], T: [[1, 0], [0, 1], [1, 1], [2, 1]], S: [[1, 0], [2, 0], [0, 1], [1, 1]],
    Z: [[0, 0], [1, 0], [1, 1], [2, 1]], J: [[0, 0], [0, 1], [1, 1], [2, 1]], L: [[2, 0], [0, 1], [1, 1], [2, 1]] }, KINDS = Object.keys(SH);
  function shapeSvg(k) {
    return '<svg viewBox="0 0 4 2" aria-hidden="true">' + SH[k].map(function (c) { return '<rect x="' + (c[0] + 0.08) + '" y="' + (c[1] + 0.08) + '" width=".84" height=".84" rx=".12"/>'; }).join("") + "</svg>";
  }
  GAMES.blocks = {
    name: ["Falling Blocks", "Bloques"], icon: "🧱", cols: 10, rows: 20, lives: 0, nextWin: true,
    repeat: { up: null, a: null, b: null, left: [170, 70], right: [170, 70], down: [0, 45] },
    help: ["◀ ▶ move, A or ▲ turns, ▼ drops, B drops at once. A full line = 10!", "◀ ▶ mover, A o ▲ gira, ▼ baja, B cae de golpe. ¡Una línea = 10!"],
    init: function (a) {
      this.a = a; this.board = []; for (var y = 0; y < 20; y++) this.board.push(new Array(10).fill(0));
      this.acc = 0; this.n = 0; this.lines = 0; this.clearing = null; this.p = null; this.nextK = KINDS[rnd(0, 6)]; this.spawn();
    },
    spawn: function () {
      var k = this.nextK; this.nextK = KINDS[rnd(0, 6)]; this.a.next(SH[this.nextK]);
      this.p = { k: k, c: SH[k].map(function (c) { return c.slice(); }), x: 3, y: 0 }; this.acc = 0;
      if (this.hit(this.p.c, this.p.x, this.p.y)) { this.p = null; this.a.over(); }
    },
    hit: function (cells, x, y) {
      var b = this.board;
      return cells.some(function (c) { var X = c[0] + x, Y = c[1] + y; return X < 0 || X > 9 || Y > 19 || (Y >= 0 && b[Y][X]); });
    },
    rot: function () {
      var p = this.p; if (!p || p.k === "O") return;
      var n = p.k === "I" ? 4 : 3, nc = p.c.map(function (c) { return [n - 1 - c[1], c[0]]; }), self = this;
      if ([0, -1, 1, -2, 2].some(function (dx) { if (!self.hit(nc, p.x + dx, p.y)) { p.c = nc; p.x += dx; return true; } return false; })) this.a.sfx("turn");
    },
    press: function (k) {
      var p = this.p; if (!p || this.clearing) return;
      if (k === "left" || k === "right") { var dx = k === "left" ? -1 : 1; if (!this.hit(p.c, p.x + dx, p.y)) p.x += dx; }
      else if (k === "a" || k === "up") this.rot();
      else if (k === "down") { if (!this.hit(p.c, p.x, p.y + 1)) { p.y++; this.acc = 0; } else this.lock(); }
      else if (k === "b") { while (!this.hit(p.c, p.x, p.y + 1)) p.y++; this.lock(); }
    },
    update: function (dt) {
      var s = this;
      if (s.clearing) {
        s.clearing.t -= dt;
        if (s.clearing.t <= 0) { s.board = s.board.filter(function (row, y) { return s.clearing.rows.indexOf(y) < 0; }); while (s.board.length < 20) s.board.unshift(new Array(10).fill(0)); s.clearing = null; s.after(); }
        return;
      }
      if (!s.p) return;
      s.acc += dt; var g = s.a.speed(Math.max(90, 850 - (s.a.lv() - 1) * 80));
      if (s.acc >= g) { s.acc = 0; if (!s.hit(s.p.c, s.p.x, s.p.y + 1)) s.p.y++; else s.lock(); }
    },
    lock: function () {
      var s = this, p = s.p; if (!p) return;
      p.c.forEach(function (c) { if (c[1] + p.y >= 0) s.board[c[1] + p.y][c[0] + p.x] = 1; });
      s.p = null; s.n++; s.a.sfx("hit");
      var rows = []; for (var y = 0; y < 20; y++) if (s.board[y].every(Boolean)) rows.push(y);
      if (rows.length) {
        s.clearing = { rows: rows, t: 320 }; s.lines += rows.length; s.a.score(rows.length * 10 + (rows.length === 4 ? 10 : 0)); s.a.sfx("line");
        if (Math.floor(s.lines / 10) + 1 > s.a.lv()) s.a.levelUp();
      } else s.after();
    },
    after: function () {
      var s = this, a = s.a;
      if (s.n % 3 === 0 && a.wantQ()) {
        var q = a.startQ(), ks = shuffle(KINDS.slice()).slice(0, 3);
        a.choose(q.choices.map(function (v, i) { return { v: v, k: ks[i], svg: shapeSvg(ks[i]) }; }), function (it) { if (it) { s.nextK = it.k; a.score(5); } s.spawn(); });
      } else s.spawn();
    },
    draw: function (a) {
      var s = this;
      for (var y = 0; y < 20; y++) for (var x = 0; x < 10; x++) if (s.board[y][x]) a.px(x, y, s.clearing && s.clearing.rows.indexOf(y) >= 0 ? 2 : 1);
      if (s.p) s.p.c.forEach(function (c) { a.px(c[0] + s.p.x, c[1] + s.p.y); });
    }
  };

  // ---- Space Defenders (Galaga-style): shoot the marching ships; one at a time dives at you. In a learning moment three
  // answer ships cross the top and the fleet holds still and stops shooting: shoot the right answer for a double shot.
  GAMES.space = {
    name: ["Space Defenders", "Defensores"], icon: "🚀", cols: 12, rows: 20, autofire: true,
    repeat: { up: [260, 260], down: null, a: [260, 260], b: [260, 260], left: [150, 70], right: [150, 70] },
    help: ["◀ ▶ or drag to move, A to fire. Shoot the ship with the answer!", "◀ ▶ o arrastra para mover, A dispara. ¡Dispara a la nave con la respuesta!"],
    init: function (a) { this.a = a; this.x = 4; this.shots = []; this.bombs = []; this.ans = []; this.inv = 0; this.dbl = 0; this.cd = 0; this.st = 0; this.bm = 0; this.wave(); },
    wave: function () {
      var e = []; for (var r = 0; r < 3; r++) for (var c = 0; c < 5; c++) e.push({ bx: 1 + c * 2, by: 3 + r * 2 });
      this.en = e; this.fx = 0; this.fy = 0; this.fd = 1; this.mt = 0; this.bt = 0; this.dt = 0; this.dive = null; this.bombs = [];
    },
    pos: function (e) { return e === this.dive ? { x: e.dx, y: e.dy } : { x: e.bx + this.fx, y: e.by + this.fy }; },
    dragTo: function (cx) { this.x = Math.max(0, Math.min(9, cx - 1)); },
    press: function (k) {
      if (k === "left") this.x = Math.max(0, this.x - 1); else if (k === "right") this.x = Math.min(9, this.x + 1);
      else if (k === "a" || k === "b" || k === "up") {
        if (this.cd > 0) return; this.cd = 200; this.a.sfx("shot");
        if (this.dbl > 0) this.shots.push({ x: this.x, y: 17 }, { x: this.x + 2, y: 17 }); else this.shots.push({ x: this.x + 1, y: 17 });
      }
    },
    shipHit: function (x, y) { return (y === 18 && x === this.x + 1) || (y === 19 && x >= this.x && x <= this.x + 2); },
    update: function (dt) {
      var s = this, a = s.a, i;
      s.cd -= dt; if (s.inv > 0) s.inv -= dt; if (s.dbl > 0) { s.dbl -= dt; a.power(s.dbl > 0 ? "✨ x2" : ""); }
      if (!s.ans.length && a.wantQ()) { var q = a.startQ(); s.ans = q.choices.map(function (v, k) { return { x: k * 4, v: v }; }); s.ad = 1; s.at = 0; }
      if (s.ans.length && a.qAge() > 35000) a.endQ();
      if (s.ans.length && !a.q()) s.ans = [];
      if (s.ans.length) {
        s.at += dt;
        if (s.at > a.speed(420)) {
          s.at = 0; var mn = Math.min.apply(null, s.ans.map(function (q) { return q.x; })), mx = Math.max.apply(null, s.ans.map(function (q) { return q.x + 2; }));
          if ((s.ad > 0 && mx >= 11) || (s.ad < 0 && mn <= 0)) s.ad = -s.ad;
          s.ans.forEach(function (q) { q.x += s.ad; });
        }
      }
      s.st += dt;
      while (s.st >= 40) {
        s.st -= 40;
        for (i = s.shots.length - 1; i >= 0; i--) {
          var b = s.shots[i]; b.y--; if (b.y < 0) { s.shots.splice(i, 1); continue; }
          var hit = false;
          for (var k = 0; k < s.ans.length; k++) {
            var q2 = s.ans[k];
            if (b.y === 1 && b.x >= q2.x && b.x <= q2.x + 2) { hit = true; if (a.answer(q2.v)) { s.ans = []; s.dbl = 12000; a.score(5); } else s.ans.splice(k, 1); break; }
          }
          if (!hit) for (var j = 0; j < s.en.length; j++) {
            var p = s.pos(s.en[j]);
            if (p.x === b.x && p.y === b.y) { if (s.en[j] === s.dive) s.dive = null; s.en.splice(j, 1); hit = true; a.score(1); a.sfx("note"); break; }
          }
          if (hit) s.shots.splice(i, 1);
        }
      }
      if (!s.en.length) { a.levelUp(); s.wave(); return; }
      if (a.q()) return;                                       // a question: the fleet holds still and does not shoot
      s.mt += dt;
      if (s.mt > a.speed(Math.max(220, 700 - a.lv() * 50))) {
        s.mt = 0; var xs = s.en.filter(function (e) { return e !== s.dive; }).map(function (e) { return e.bx; });
        if (xs.length) { var lo = Math.min.apply(null, xs) + s.fx, hi = Math.max.apply(null, xs) + s.fx; if ((s.fd > 0 && hi >= 11) || (s.fd < 0 && lo <= 0)) { s.fd = -s.fd; s.fy++; } else s.fx += s.fd; }
      }
      s.dt += dt;
      if (!s.dive && s.dt > a.speed(4000) && s.en.length > 1) { s.dt = 0; var e = s.en[rnd(0, s.en.length - 1)], pp = s.pos(e); s.dive = e; e.dx = pp.x; e.dy = pp.y; e.dm = 0; }
      if (s.dive) {
        var d = s.dive; d.dm += dt;
        if (d.dm > a.speed(170)) {
          d.dm = 0; d.dy++; d.dx += d.dx < s.x + 1 ? 1 : d.dx > s.x + 1 ? -1 : 0;
          if (d.dy > 19) s.dive = null;                          // flew past: back to its place in the fleet
          else if (s.shipHit(d.dx, d.dy)) { s.en.splice(s.en.indexOf(d), 1); s.dive = null; s.hurt(); }
        }
      }
      s.bt += dt;
      if (s.bt > a.speed(Math.max(700, 1600 - a.lv() * 80))) { s.bt = 0; var sh = s.en[rnd(0, s.en.length - 1)], bp = s.pos(sh); s.bombs.push({ x: bp.x, y: bp.y + 1 }); }
      s.bm += dt;
      while (s.bm >= 110) {
        s.bm -= 110;
        for (i = s.bombs.length - 1; i >= 0; i--) { var o = s.bombs[i]; o.y++; if (o.y > 19) s.bombs.splice(i, 1); else if (s.shipHit(o.x, o.y)) { s.bombs.splice(i, 1); s.hurt(); } }
      }
      if (s.en.some(function (e) { return e !== s.dive && e.by + s.fy >= 16; })) { if (a.lifeLost()) s.wave(); }
    },
    hurt: function () { if (this.inv > 0) return; this.a.sfx("hit"); if (this.a.lifeLost()) { this.inv = 1600; this.bombs = []; } },
    draw: function (a) {
      var s = this, v = s.inv > 0 ? 2 : 1;
      a.px(s.x + 1, 18, v); a.px(s.x, 19, v); a.px(s.x + 1, 19, v); a.px(s.x + 2, 19, v);
      s.en.forEach(function (e) { var p = s.pos(e); a.px(p.x, p.y); });
      s.shots.forEach(function (b) { a.px(b.x, b.y); }); s.bombs.forEach(function (b) { a.px(b.x, b.y, 2); });
      s.ans.forEach(function (q) { a.label(q.x, 1, 3, 1, q.v); });
    }
  };

  // ---- Brick Breaker: keep the ball up with the paddle. In a learning moment three answer bricks hang under the wall:
  // hit the right one and it blows up the bricks above it and the paddle grows.
  GAMES.bricks = {
    name: ["Brick Breaker", "Rompe ladrillos"], icon: "🏓", cols: 12, rows: 20, repeat: { up: null, down: null, a: null, b: null, left: [120, 60], right: [120, 60] },
    help: ["Drag or ◀ ▶ to move, A to launch. Hit the brick with the answer!", "Arrastra o ◀ ▶ para mover, A lanza. ¡Dale al ladrillo con la respuesta!"],
    init: function (a) { this.a = a; this.w = 3; this.x = 4; this.big = 0; this.ans = []; this.wall(); this.serve(); },
    wall: function () {
      var lv = this.a.lv(); this.b = {};
      for (var y = 2; y <= 6; y++) for (var x = 0; x < 12; x++) if (lv % 2 || (x + y) % 2 === 0) this.b[x + "," + y] = 1;
    },
    serve: function () { this.stuck = 1500; this.ball = { x: this.x + 1, y: 18, dx: Math.random() < 0.5 ? -1 : 1, dy: -1 }; this.acc = 0; },
    dragTo: function (cx) { this.x = Math.max(0, Math.min(12 - this.w, cx - Math.floor(this.w / 2))); },
    press: function (k) {
      if (k === "left") this.x = Math.max(0, this.x - 1); else if (k === "right") this.x = Math.min(12 - this.w, this.x + 1);
      else if (k === "a" || k === "b" || k === "up") this.stuck = 0;
    },
    at: function (x, y) {
      if (this.b[x + "," + y]) return { t: "b" };
      for (var i = 0; i < this.ans.length; i++) { var q = this.ans[i]; if (y === 9 && x >= q.x && x <= q.x + 2) return { t: "q", i: i }; }
      return null;
    },
    smash: function (h, x, y) {
      var s = this, a = s.a;
      if (h.t === "b") { delete s.b[x + "," + y]; a.score(1); a.sfx("note"); return; }
      var q = s.ans[h.i];
      if (a.answer(q.v)) {
        s.ans = []; a.score(5); s.big = 15000; s.w = 5; s.x = Math.min(s.x, 7);
        for (var yy = 2; yy <= 8; yy++) for (var dx = -1; dx <= 3; dx++) delete s.b[(q.x + dx) + "," + yy];
      } else s.ans.splice(h.i, 1);
    },
    update: function (dt) {
      var s = this, a = s.a;
      if (s.big > 0) { s.big -= dt; a.power(s.big > 0 ? "↔ BIG" : ""); if (s.big <= 0) { s.w = 3; s.x = Math.min(s.x, 9); } }
      if (!s.ans.length && a.wantQ()) { var q = a.startQ(); s.ans = q.choices.map(function (v, k) { return { x: k * 4, v: v }; }); }
      if (s.ans.length && a.qAge() > 40000) a.endQ();
      if (s.ans.length && !a.q()) s.ans = [];
      if (s.stuck > 0) { s.stuck -= dt; s.ball.x = s.x + Math.floor(s.w / 2); s.ball.y = 18; return; }
      s.acc += dt; var st = a.speed(Math.max(70, 150 - a.lv() * 8));
      while (s.acc >= st) { s.acc -= st; if (!s.step()) break; }
      if (!Object.keys(s.b).length) { a.levelUp(); s.wall(); s.serve(); }
    },
    step: function () {
      var s = this, b = s.ball, h;
      if (b.x + b.dx < 0 || b.x + b.dx > 11) b.dx = -b.dx;
      if (b.y + b.dy < 0) b.dy = 1;
      if ((h = s.at(b.x + b.dx, b.y))) { s.smash(h, b.x + b.dx, b.y); b.dx = -b.dx; }
      if ((h = s.at(b.x, b.y + b.dy))) { s.smash(h, b.x, b.y + b.dy); b.dy = -b.dy; }
      else if ((h = s.at(b.x + b.dx, b.y + b.dy))) { s.smash(h, b.x + b.dx, b.y + b.dy); b.dy = -b.dy; }
      if (b.dy > 0 && b.y + 1 === 19) {
        var nxp = b.x + b.dx;
        if (nxp >= s.x - 1 && nxp <= s.x + s.w) {                  // the paddle: the end you hit sends it that way
          var rel = nxp - s.x; b.dy = -1; if (rel <= 0) b.dx = -1; else if (rel >= s.w - 1) b.dx = 1; s.a.sfx("turn");
          return true;
        }
      }
      if (b.x + b.dx < 0 || b.x + b.dx > 11) b.dx = -b.dx;
      b.x += b.dx; b.y += b.dy;
      if (b.y > 19) { if (s.a.lifeLost()) s.serve(); return false; }
      return true;
    },
    draw: function (a) {
      var s = this; Object.keys(s.b).forEach(function (k) { var p = k.split(","); a.px(+p[0], +p[1]); });
      for (var i = 0; i < s.w; i++) a.px(s.x + i, 19);
      a.px(s.ball.x, s.ball.y, s.stuck > 0 ? 2 : 1);
      s.ans.forEach(function (q) { a.label(q.x, 9, 3, 1, q.v); });
    }
  };

  // ---- Tank Battle: drive with the arrows, A fires. In a learning moment the enemy tanks carry numbers: only the tank with
  // the answer can be hit (the others shrug the shot off and the answer is said), and nobody fires at him meanwhile.
  var TK = { up: [[0, 1, 0], [1, 1, 1], [1, 0, 1]], down: [[1, 0, 1], [1, 1, 1], [0, 1, 0]], left: [[0, 1, 1], [1, 1, 0], [0, 1, 1]], right: [[1, 1, 0], [0, 1, 1], [1, 1, 0]] };
  GAMES.tank = {
    name: ["Tank Battle", "Tanques"], icon: "🛡️", cols: 12, rows: 20, repeat: { a: null, b: null, up: [180, 150], down: [180, 150], left: [180, 150], right: [180, 150] },
    help: ["Arrows drive, A fires. Hit the tank with the answer!", "Flechas para conducir, A dispara. ¡Dale al tanque con la respuesta!"],
    init: function (a) { this.a = a; this.kills = 0; this.shots = []; this.en = []; this.spT = 0; this.freeze = 0; this.bt = 0; this.p = null; this.walls(); this.respawn(); },
    respawn: function () { this.p = { x: 4, y: 17, d: "up" }; this.inv = 2000; },
    walls: function () {
      var w = this.w = {};
      [[1, 6], [2, 6], [9, 6], [10, 6], [1, 7], [10, 7], [5, 9], [6, 9], [5, 10], [6, 10], [1, 12], [2, 12], [9, 12], [10, 12], [3, 14], [8, 14]].forEach(function (c) { w[c[0] + "," + c[1]] = 1; });
      for (var i = 0; i < 4 + this.a.lv(); i++) { var x = rnd(0, 11), y = rnd(5, 13); w[x + "," + y] = 1; w[(11 - x) + "," + y] = 1; }
    },
    free: function (x, y, me) {
      if (x < 0 || y < 0 || x > 9 || y > 17) return false;
      for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) if (this.w[(x + i) + "," + (y + j)]) return false;
      return !this.en.concat(this.p ? [this.p] : []).some(function (t) { return t !== me && Math.abs(t.x - x) < 3 && Math.abs(t.y - y) < 3; });
    },
    drive: function (t, d) { t.d = d; var v = DIRS[d]; if (this.free(t.x + v.x, t.y + v.y, t)) { t.x += v.x; t.y += v.y; return true; } return false; },
    fire: function (t, own) {
      var v = DIRS[t.d], x = t.x + 1 + v.x * 2, y = t.y + 1 + v.y * 2;
      if (own && this.shots.filter(function (b) { return b.own; }).length >= 2) return;
      this.shots.push({ x: x, y: y, dx: v.x, dy: v.y, own: own }); if (own) this.a.sfx("shot");
    },
    press: function (k) { if (DIRS[k]) this.drive(this.p, k); else if (k === "a" || k === "b") this.fire(this.p, true); },
    inTank: function (t, x, y) { return x >= t.x && x <= t.x + 2 && y >= t.y && y <= t.y + 2; },
    update: function (dt) {
      var s = this, a = s.a, i, q = a.q();
      if (s.inv > 0) s.inv -= dt;
      if (s.freeze > 0) { s.freeze -= dt; a.power(s.freeze > 0 ? "❄ FREEZE" : ""); }
      s.spT -= dt;
      if (s.spT <= 0 && s.en.length < 3) { s.spT = a.speed(2500); var xs = shuffle([0, 4, 9]); for (i = 0; i < 3; i++) if (s.free(xs[i], 0)) { s.en.push({ x: xs[i], y: 0, d: "down", mt: 0, ft: rnd(800, 1800), v: null }); break; } }
      if (!q && s.en.length >= 2 && a.wantQ()) {
        q = a.startQ();
        var vs = s.en.length >= q.choices.length ? q.choices.slice() : [q.ans].concat(q.choices.filter(function (v) { return v !== q.ans; })).slice(0, s.en.length);
        shuffle(vs); s.en.forEach(function (e, k) { e.v = k < vs.length ? vs[k] : null; e.no = false; });
      }
      if (q && a.qAge() > 40000) { a.endQ(); q = null; }
      if (!q) s.en.forEach(function (e) { e.v = null; });
      if (s.freeze <= 0) s.en.forEach(function (e) {
        e.mt += dt; e.ft -= dt;
        if (e.mt > a.speed(Math.max(260, 560 - a.lv() * 30))) {
          e.mt = 0;
          if (Math.random() < 0.2 || !s.drive(e, e.d)) { var ds = shuffle(["up", "down", "left", "right"]); for (var k = 0; k < 4; k++) if (s.drive(e, ds[k])) break; }
        }
        if (!q && e.ft <= 0) {
          e.ft = a.speed(rnd(1400, 2600));
          if (Math.abs(e.x - s.p.x) <= 1) e.d = e.y < s.p.y ? "down" : "up"; else if (Math.abs(e.y - s.p.y) <= 1) e.d = e.x < s.p.x ? "right" : "left";
          s.fire(e, false);
        }
      });
      s.bt += dt;
      while (s.bt >= 45) { s.bt -= 45; s.move(); }
    },
    move: function () {
      var s = this, a = s.a, i, b, gone;
      s.shots.forEach(function (x) { x.x += x.dx; x.y += x.dy; });
      for (i = 0; i < s.shots.length; i++) for (var k = i + 1; k < s.shots.length; k++) {
        var p = s.shots[i], o = s.shots[k]; if (p.own !== o.own && p.x === o.x && p.y === o.y) { p.dead = o.dead = true; }   // shots cancel each other
      }
      for (i = s.shots.length - 1; i >= 0; i--) {
        b = s.shots[i]; gone = !!b.dead;
        if (!gone && (b.x < 0 || b.x > 11 || b.y < 0 || b.y > 19)) gone = true;
        else if (!gone && s.w[b.x + "," + b.y]) { delete s.w[b.x + "," + b.y]; gone = true; a.sfx("hit"); }
        else if (!gone && b.own) {
          for (var j = 0; j < s.en.length; j++) {
            var e = s.en[j]; if (!s.inTank(e, b.x, b.y)) continue;
            gone = true; var q = a.q();
            if (q && e.v !== null) {
              if (e.v === q.ans) { a.answer(e.v); s.en.splice(j, 1); a.score(5); s.freeze = 5000; s.killed(); }
              else if (!e.no) { e.no = true; a.answer(e.v); } else a.sfx("turn");
            } else { s.en.splice(j, 1); a.score(1); a.sfx("note"); s.killed(); }
            break;
          }
        } else if (!gone && s.inTank(s.p, b.x, b.y)) { gone = true; if (s.inv <= 0) { a.sfx("hit"); if (a.lifeLost()) s.respawn(); } }
        if (gone) s.shots.splice(i, 1);
      }
    },
    killed: function () { this.kills++; if (this.kills % 8 === 0) this.a.levelUp(); },
    sprite: function (a, t, v) { var m = TK[t.d]; for (var j = 0; j < 3; j++) for (var i = 0; i < 3; i++) if (m[j][i]) a.px(t.x + i, t.y + j, v); },
    draw: function (a) {
      var s = this, q = a.q();
      Object.keys(s.w).forEach(function (k) { var p = k.split(","); a.px(+p[0], +p[1]); });
      if (s.p) s.sprite(a, s.p, s.inv > 0 ? 2 : 1);
      s.en.forEach(function (e) { s.sprite(a, e, 1); if (q && e.v !== null) a.label(e.x, e.y + 0.5, 3, 2, e.v, e.no); });
      s.shots.forEach(function (b) { a.px(b.x, b.y, b.own ? 1 : 2); });
    }
  };

  // ---- wiring
  setTimeout(function () {
    menu(); homeTile();
    if (typeof onLang === "function") onLang(function () { var b = $("homeGames"); if (b) b.querySelector("span").textContent = tr("Games", "Juegos"); });
  }, 0);
  return {
    start: start, stop: stop, visible: visible, cfg: cfg, menu: menu, prog: function () { return prog; },
    state: function () { return { state: state, game: gid, score: score, lives: lives, level: level, q: cur && cur.text, ans: cur && cur.ans, paused: paused, covered: isCovered, bossMs: Math.round(bossMs), playMs: Math.round(playMs), chooser: !!chooser, boss: !!boss }; },
    play: function (k) { if (!el) start(); play(k); },     // for the grown-up's computer (tests)
    debug: function () { return game; },
    bossNow: function () { if (state === "play") bossOpen(); },
    tick: function (ms) { for (var t = 0; t < ms; t += 16) step(16, true); },               // tests: run the game clock by hand
    key: function (a, on) { if (on === false) up(a); else if (on === true) down(a); else { down(a); up(a); } }
  };
})();
