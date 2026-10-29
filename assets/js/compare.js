// ---- Compare: bigger, smaller, the same. Its own activity (home tile), in three stages that follow how school teaches it
// (words before symbols, things before numbers, tens first for two-digit numbers; NCETM Mastering Number, White Rose Y1/Y2):
//   1 Items        "Which number is bigger, 9 or 2?" (or smaller): each number sits on its row of things, lined up one under
//                  the other, so he SEES the extra ones (operator 2026-10-29: ask about the numbers, the rows show why; no
//                  "which row has more", no "the same" here). Quick: 4 right in a row moves on.
//   2 Numbers to 20  a ? b with ten-frames under the numbers: pick < = > (the buttons also say smaller / the same / bigger).
//                  A slip is explained on a number line: the further along, the bigger.
//   3 Numbers to 99  tens-sticks and ones-cubes: tens first, then the ones (47 vs 42, 36 vs 63, 39 vs 41); now and then
//                  "put these three in order".
// The sign is taught by its shape (the open side faces the bigger number), not the crocodile. 6 right in a row moves him up;
// a wrong answer shows why with the same picture, then a similar question comes back.
// Mixed, never blocked: every stage interleaves question types (rows, "tap the bigger number", signs, order) and
// reviews the earlier stages, and the same type never comes three times in a row (MIX below).
// Uses voice, L, hey, diary from index.html (at call time only). Progress: localStorage cmpProg.
var compare = (function () {
  var $ = function (id) { return document.getElementById(id); };
  var STAGES = [null, ["Items", "Cosas"], ["Numbers to 20", "Números hasta 20"], ["Numbers to 99", "Números hasta 99"]];
  var NEED = [0, 4, 6, 6], MAX = 3;
  var THINGS = ["🍎", "🍓", "⭐", "🐟", "🎈", "🐥", "🍪", "🚗", "🌸", "🐞"];
  var PRAISE = [["Yes!", "¡Sí!"], ["Brilliant!", "¡Genial!"], ["That's it!", "¡Eso es!"], ["Well done!", "¡Bien hecho!"], ["Spot on!", "¡Exacto!"]];
  var prog = { stage: 1, run: 0, stars: 0, done: {} }, on = false, q = null, locked = true, t0 = 0, lastPraise = -1, busy = null, lastKey = "", seq = 0, picked = [];
  try { var p = JSON.parse(localStorage.getItem("cmpProg") || "null"); if (p && p.stage >= 1 && p.stage <= MAX) prog = p; } catch (e) {}
  function save() { try { localStorage.setItem("cmpProg", JSON.stringify(prog)); } catch (e) {} }
  function rnd(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
  function es() { return voice.cfg.lang === "es"; }
  function stageName(s) { return STAGES[s] ? L(STAGES[s][0], STAGES[s][1]) : ""; }
  function say(t, done) { if (!voice.say(t, done) && done) setTimeout(done, 400); }
  function tens(n) { return Math.floor(n / 10); }
  function signOf(a, b) { return a < b ? "<" : a > b ? ">" : "="; }
  function cmpWord(sign) { return sign === "<" ? L("smaller than", "menor que") : sign === ">" ? L("bigger than", "mayor que") : L("the same as", "igual que"); }

  // ---- Pictures ----
  function rowHtml(n, thing) {                              // one row of things in fixed cells, so two rows line up one to one;
    var h = '<div class="cmrow"><b class="cmcount">' + n + "</b>";   // the count first, in a fixed column, so he links the number to the row
    for (var i = 0; i < n; i++) h += "<i>" + thing + "</i>";
    return h + "</div>";
  }
  function frameHtml(n) {                                   // ten-frames (one or two) with n dots
    var h = '<div class="cmframes">', k;
    for (var f = 0; f < 2; f++) {
      if (f && n <= 10) break;
      h += '<div class="cmframe">';
      for (k = 0; k < 10; k++) h += '<i class="' + (f * 10 + k < n ? "on" : "") + '"></i>';
      h += "</div>";
    }
    return h + "</div>";
  }
  function blocksHtml(n) {                                  // tens as sticks, ones as cubes
    var h = '<div class="cmblocks">', t = tens(n), u = n % 10, k;
    for (k = 0; k < t; k++) h += '<b class="stick"></b>';
    if (u) { h += '<span class="cubes">'; for (k = 0; k < u; k++) h += "<b></b>"; h += "</span>"; }
    return h + "</div>";
  }
  function lineSvg(lo, hi, marks) {                         // a number line with marks [[n, cls], ...]
    var W = 900, pad = 40, dx = (W - 2 * pad) / (hi - lo), h = '<svg class="cmline" viewBox="0 0 ' + W + ' 120">';
    function X(v) { return pad + (v - lo) * dx; }
    h += '<line x1="' + (pad - 20) + '" y1="60" x2="' + (W - pad + 20) + '" y2="60" stroke="#e8e4ff" stroke-width="5" stroke-linecap="round"/>';
    var step = hi - lo > 30 ? 5 : 1;
    for (var v = lo; v <= hi; v++) {
      var big = v % 10 === 0;
      h += '<line x1="' + X(v) + '" y1="' + (60 - (big ? 12 : 7)) + '" x2="' + X(v) + '" y2="' + (60 + (big ? 12 : 7)) + '" stroke="' + (big ? "#ffc83d" : "#e8e4ff") + '" stroke-width="' + (big ? 4 : 2) + '"/>';
      if (step === 1 || v % 5 === 0) h += '<text x="' + X(v) + '" y="98" text-anchor="middle" font-size="22" font-weight="900" fill="#fbf8ff">' + v + "</text>";
    }
    marks.forEach(function (m) {
      h += '<circle class="' + m[1] + '" cx="' + X(m[0]) + '" cy="60" r="16"/>';
      h += '<text x="' + X(m[0]) + '" y="30" text-anchor="middle" font-size="26" font-weight="900" class="' + m[1] + ' lab">' + m[0] + "</text>";
    });
    return h + "</svg>";
  }
  var A = "ca", B = "cb";

  // ---- Questions ----
  function other(lo, hi, not) { var v; do { v = rnd(lo, hi); } while (not.indexOf(v) >= 0); return v; }
  function rows() {                                         // two numbers, each on its row of things: which number is bigger / smaller
    var a = rnd(1, 9), b = other(1, 9, [a]);
    var kind = Math.random() < 0.65 ? "big" : "small";
    return { s: 1, t: "rows", a: a, b: b, kind: kind, thing: THINGS[rnd(0, THINGS.length - 1)], ans: (kind === "big") === (a > b) ? "a" : "b" };
  }
  function pair(r) {                                        // two numbers in range r (1: to 10, 2: to 20, 3: to 99, with the classic traps)
    if (r < 3) { var hi = r === 1 ? 10 : 20, a = rnd(1, hi); return [a, Math.random() < 0.2 ? a : other(1, hi, [a])]; }
    a = rnd(10, 99); var b, k = rnd(0, 3);
    if (k === 0) b = tens(a) * 10 + other(0, 9, [a % 10]);                                       // same tens: 47 vs 42
    else if (k === 1) b = (a % 10) * 10 + tens(a);                                                // swapped digits: 36 vs 63
    else if (k === 2) b = a + (Math.random() < 0.5 ? -1 : 1) * rnd(1, 3);                         // close, often across a ten: 39 vs 41
    else b = Math.random() < 0.15 ? a : other(10, 99, [a]);
    if (b < 10 || b > 99) b = other(10, 99, [a]);
    return [a, b];
  }
  function sign(r) { var p = pair(r); return { s: Math.max(2, r), t: "sign", a: p[0], b: p[1], kind: "sign", ans: signOf(p[0], p[1]) }; }
  function pick(r) {                                        // tap the bigger (or smaller) number
    var p; do { p = pair(r); } while (p[0] === p[1]);
    var kind = Math.random() < 0.65 ? "big" : "small";
    return { s: Math.max(2, r), t: "pick", a: p[0], b: p[1], kind: kind, ans: (kind === "big") === (p[0] > p[1]) ? "a" : "b" };
  }
  function order(r) {                                       // put three in order
    var lo = r === 3 ? 10 : 1, hi = r === 3 ? 99 : 20, a = rnd(lo, hi), b = other(lo, hi, [a]), c = other(lo, hi, [a, b]), kind = Math.random() < 0.7 ? "up" : "down";
    return { s: r, t: "order", a: a, b: b, c: c, kind: kind, ans: [a, b, c].sort(function (x, y) { return kind === "up" ? x - y : y - x; }) };
  }
  // What each stage mixes, with weights. Earlier stages come back as review; the stage's own type is only the biggest share.
  var MIX = [null,
    [[75, rows], [25, function () { return pick(1); }]],
    [[40, function () { return sign(2); }], [25, function () { return pick(2); }], [20, rows], [15, function () { return order(2); }]],
    [[35, function () { return sign(3); }], [20, function () { return pick(3); }], [15, function () { return order((prog.done[3] || 0) < 12 ? 2 : 3); }], [15, function () { return sign(2); }], [15, rows]]];
  var lastT = [];                                           // the last two question types
  function makeQ(st) {
    var mix = MIX[st], tot = 0, i, x;
    for (var tries = 0; tries < 30; tries++) {
      tot = 0; for (i = 0; i < mix.length; i++) tot += mix[i][0];
      var r = Math.random() * tot;
      for (i = 0; i < mix.length; i++) { r -= mix[i][0]; if (r < 0) break; }
      x = mix[Math.min(i, mix.length - 1)][1]();
      if (!(lastT.length === 2 && lastT[0] === x.t && lastT[1] === x.t)) break;   // never three of the same type in a row
    }
    lastT = [lastT[lastT.length - 1], x.t].filter(Boolean);
    return x;
  }
  function key(x) { return x.s + x.t + ":" + x.a + "/" + x.b + "/" + (x.c || "") + x.kind; }

  // ---- Words ----
  function askText(x) {
    var e = !es();
    if (x.s === 1) return x.kind === "big" ? (e ? "Which number is bigger, " + x.a + " or " + x.b + "?" : "¿Qué número es mayor, " + x.a + " o " + x.b + "?")
      : (e ? "Which number is smaller, " + x.a + " or " + x.b + "?" : "¿Qué número es menor, " + x.a + " o " + x.b + "?");
    if (x.kind === "sign") return e ? "Which sign goes in the middle: smaller, the same, or bigger?" : "¿Qué signo va en medio: menor, igual o mayor?";
    if (x.t === "pick") return x.kind === "big" ? (e ? "Tap the bigger number." : "Toca el número mayor.") : (e ? "Tap the smaller number." : "Toca el número menor.");
    return x.kind === "up" ? (e ? "Tap the smallest first, then the next, then the biggest." : "Toca primero el menor, luego el siguiente, luego el mayor.")
      : (e ? "Tap the biggest first, then the next, then the smallest." : "Toca primero el mayor, luego el siguiente, luego el menor.");
  }
  function why(x) {                                         // how we know, in school words
    var e = !es(), a = x.a, b = x.b, big = Math.max(a, b), small = Math.min(a, b);
    if (x.s === 1) return e ? "Look at the rows: " + big + " has " + (big - small) + " more than " + small + ", so " + big + " is bigger and " + small + " is smaller."
      : "Mira las filas: " + big + " tiene " + (big - small) + " más que " + small + ", así que " + big + " es mayor y " + small + " es menor.";
    if (x.t === "order") return (e ? "In order: " : "En orden: ") + x.ans.join(", ") + ".";
    if (a === b) return e ? "Both are " + a + ", so the sign is equals: " + a + " = " + b + "." : "Los dos son " + a + ", así que el signo es igual: " + a + " = " + b + ".";
    var rule = x.t === "pick" ? "" : e ? " The open side of the sign faces the bigger number: " + a + " " + signOf(a, b) + " " + b + "." : " El lado abierto del signo mira al mayor: " + a + " " + signOf(a, b) + " " + b + ".";
    if (x.s === 2) return (e ? "On the number line, the further along, the bigger. " + big + " is further along than " + small + ", so " + big + " is bigger." : "En la recta, cuanto más adelante, mayor. " + big + " está más adelante que " + small + ", así que " + big + " es mayor.") + rule;
    if (tens(a) !== tens(b)) return (e ? "Tens first: " + big + " has " + tens(big) + " tens and " + small + " has " + tens(small) + " tens, so " + big + " is bigger." : "Primero las decenas: " + big + " tiene " + tens(big) + " y " + small + " tiene " + tens(small) + ", así que " + big + " es mayor.") + rule;
    return (e ? "Both have " + tens(a) + " tens, so look at the ones: " + (big % 10) + " is more than " + (small % 10) + ", so " + big + " is bigger." : "Las dos tienen " + tens(a) + " decenas; mira las unidades: " + (big % 10) + " es más que " + (small % 10) + ", así que " + big + " es mayor.") + rule;
  }
  function worked(x) {                                      // the solved question in words
    var e = !es();
    if (x.t === "order") return (e ? "In order: " : "En orden: ") + x.ans.join(", ") + ".";
    if (x.t === "pick" || x.t === "rows") { var w = x.ans === "a" ? x.a : x.b, o = x.ans === "a" ? x.b : x.a; return w + (e ? " is " : " es ") + (x.kind === "big" ? L("bigger than", "mayor que") : L("smaller than", "menor que")) + " " + o + "."; }
    return x.a + (e ? " is " : " es ") + cmpWord(x.ans) + " " + x.b + ".";
  }

  // ---- Screen ----
  function dots() { var h = ""; for (var i = 0; i < NEED[prog.stage]; i++) h += '<i class="' + (i < prog.run ? "ok" : "") + '"></i>'; $("cmDots").innerHTML = h; }
  function top() { $("cmLv").textContent = L("Stage ", "Etapa ") + prog.stage + " · " + stageName(prog.stage); $("cmStars").textContent = "⭐ " + prog.stars; dots(); }
  function btn(label, v, cls) { var b = document.createElement("button"); b.innerHTML = label; b.className = cls || ""; b.disabled = true; b.onclick = function () { answer(v, b); }; return b; }
  function signBtn(sign) {
    return btn("<b>" + (sign === "<" ? "&lt;" : sign === ">" ? "&gt;" : "=") + "</b><small>" + (sign === "<" ? L("smaller", "menor") : sign === ">" ? L("bigger", "mayor") : L("the same", "igual")) + "</small>", sign, "sign");
  }
  function render(x) {
    var st = $("cmStage"), an = $("cmAns");
    st.className = "cmstage s" + x.s; an.innerHTML = ""; st.innerHTML = "";
    if (x.s === 1) {
      st.innerHTML = '<button class="cmpick ' + A + '" data-v="a">' + rowHtml(x.a, x.thing) + '</button><button class="cmpick ' + B + '" data-v="b">' + rowHtml(x.b, x.thing) + "</button>";
    } else if (x.kind === "sign") {
      st.innerHTML = '<div class="cmeq"><span class="' + A + '">' + x.a + '</span><span class="cq" id="cmQ">?</span><span class="' + B + '">' + x.b + "</span></div>" +
        '<div class="cmpics"><div class="' + A + '">' + (x.s === 2 ? frameHtml(x.a) : blocksHtml(x.a)) + '</div><div class="' + B + '">' + (x.s === 2 ? frameHtml(x.b) : blocksHtml(x.b)) + "</div></div>" +
        '<div class="cmwhy" id="cmWhy"></div>';
      an.appendChild(signBtn("<")); an.appendChild(signBtn("=")); an.appendChild(signBtn(">"));
    } else if (x.t === "pick") {
      var pic = function (n) { return x.s === 2 ? frameHtml(n) : blocksHtml(n); };
      st.innerHTML = '<div class="cmpair"><button class="cmpick cmnum ' + A + '" data-v="a"><b>' + x.a + "</b>" + pic(x.a) + '</button><button class="cmpick cmnum ' + B + '" data-v="b"><b>' + x.b + "</b>" + pic(x.b) + "</button></div>" +
        '<div class="cmwhy" id="cmWhy"></div>';
    } else {
      st.innerHTML = '<div class="cmorder" id="cmOrder"><i></i><i></i><i></i></div>';
      [x.a, x.b, x.c].sort(function () { return Math.random() - 0.5; }).forEach(function (n) { an.appendChild(btn(n, n, "num")); });
    }
    [].forEach.call(st.querySelectorAll(".cmpick"), function (b) { b.disabled = true; b.onclick = function () { answer(b.dataset.v, b); }; });
    $("cmAsk").textContent = askText(x);
    $("cmMsg").textContent = "";
  }
  function enable(onoff) { locked = !onoff; [].forEach.call(document.querySelectorAll("#cmStage .cmpick, #cmAns button"), function (b) { b.disabled = !onoff; }); }
  function next() {
    if (!on) return;
    var tries = 0;
    do { q = makeQ(prog.stage); } while (key(q) === lastKey && ++tries < 20);
    lastKey = key(q); picked = [];
    top(); render(q); enable(false);
    var my = ++seq, said = askText(q) + (q.kind === "sign" ? " " + q.a + (es() ? " y " : " and ") + q.b + "." : q.t === "pick" ? " " + q.a + (es() ? " o " : " or ") + q.b + "?" : "");
    function go() { if (my !== seq || !on) return; enable(true); t0 = Date.now(); }
    if (!voice.tell(said, go)) setTimeout(go, 600);
  }
  function praise() { var i; do { i = rnd(0, PRAISE.length - 1); } while (i === lastPraise); lastPraise = i; return L(PRAISE[i][0], PRAISE[i][1]); }
  function markAnswer(x) {                                  // show the result on the picture
    var qb = $("cmQ"); if (qb && x.kind === "sign") { qb.textContent = x.ans; qb.classList.add("got"); }
    if (x.t === "rows" || x.t === "pick") {
      var win = x.ans;
      [].forEach.call(document.querySelectorAll("#cmStage .cmpick"), function (b) { b.classList.toggle("win", b.dataset.v === win); b.classList.toggle("tie", !win); });
    }
    if (x.s === 2 && (x.t === "sign" || x.t === "pick") && $("cmWhy")) $("cmWhy").innerHTML = lineSvg(0, 20, [[x.a, A], [x.b, B]]);   // the number line under it
  }
  function answer(v, b) {
    if (locked || !on) return;
    var x = q, ok, ms = Date.now() - t0, e = !es();
    if (x.t === "order") {              // order: three taps
      picked.push(v); b.disabled = true; b.classList.add("used");
      var slots = $("cmOrder").children; slots[picked.length - 1].textContent = v; slots[picked.length - 1].classList.add("on");
      if (v !== x.ans[picked.length - 1]) ok = false;
      else if (picked.length < 3) { if (picked.length === 1) voice.tell(L("Good. Now the next one.", "Bien. Ahora el siguiente.")); return; }
      else ok = true;
    } else ok = v === x.ans;
    enable(false);
    diary.ev("compare", { st: x.s, q: key(x), a: String(v), t: x.t, c: String(x.t === "order" ? x.ans.join(",") : x.ans), ok: ok, ms: ms });
    if (ok) {
      prog.stars++; prog.run++; prog.done[x.s] = (prog.done[x.s] || 0) + 1;
      var up = false;
      if (prog.run >= NEED[prog.stage] && prog.stage < MAX) { prog.stage++; prog.run = 0; up = true; }
      save(); top(); markAnswer(x);
      if (b && b.classList) b.classList.add("yes");
      var pr = praise(), w = worked(x);
      $("cmMsg").innerHTML = "🎉 " + pr + " " + w + (up ? "<br>⭐ " + L("Stage ", "Etapa ") + prog.stage + ": " + stageName(prog.stage) : "");
      say(pr + " " + w + (up ? (e ? " Stage " + prog.stage + ": " + stageName(prog.stage) + "!" : " ¡Etapa " + prog.stage + ": " + stageName(prog.stage) + "!") : ""), function () { busy = setTimeout(next, up ? 1800 : 900); });
    } else {
      prog.run = 0; save(); dots(); markAnswer(x);
      if (b && b.classList) b.classList.add("no");
      $("cmStage").classList.add("shake"); setTimeout(function () { $("cmStage").classList.remove("shake"); }, 450);
      var line = why(x);
      $("cmMsg").innerHTML = "🤔 " + line;
      say(hey((e ? "Not quite. " : "Casi. ") + line, voice.cfg.lang), function () { busy = setTimeout(next, 1600); });
    }
  }
  return {
    start: function () { on = true; clearTimeout(busy); top(); next(); },
    stop: function () { on = false; clearTimeout(busy); seq++; },
    stage: function (s) { if (s) { prog.stage = Math.min(MAX, Math.max(1, s)); prog.run = 0; save(); if (on) next(); } return prog.stage; },
    stageName: stageName, max: MAX,
    stars: function () { return prog.stars; },
    reset: function () { prog = { stage: 1, run: 0, stars: 0, done: {} }; save(); if (on) next(); }
  };
})();
