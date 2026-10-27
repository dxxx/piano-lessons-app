// ---- Slow down: random key mashing gets a short calm pause ----
// The operator: "if he plays just random notes without thinking… slow down, Alex. If you want to play, play. If you don't
// want to play, make a pause." Real playing (even fast) is steps, repeats, trills and chords; mashing is many keys, far apart, fast.
//   - slam: 6+ different keys within 0.25 s (a fist, a palm, both arms); a child's chord is 2-4 keys
//   - scramble: in the last 2.5 s, 14+ presses, at least 3 in 4 of them on a key not used yet in that stretch, jumping 5+
//     semitones on average. Music repeats its keys (a tune, broken chords, a bass line); mashing hardly ever does. A scale,
//     a trill or a slide along the keys moves by 1-2, so they never count either.
//   - a little fun is fine (operator 2026-10-27: "make this limit x3 bigger, some little fun is ok"): one slam or scramble is
//     only counted; the pause comes on the 3rd burst within 10 s, i.e. mashing kept up three times as long
//   - first time: the voice says it ("Hey Sam, slow down. If you want to play, play. If you don't, take a little pause.")
//     and a tortoise covers the keys for 5 s; again within 10 minutes: 15 s, then 30 s. Ten calm minutes reset it.
//   - only in Play along / Piano only, never while a game, the Menu, a lock or the eye cover is up
// Uses hey, voice, diary, coverOn (index.html). Setting: localStorage calmOn ("0" = off), Menu → Piano. Diary event: mash.
var calm = (function () {
  var $ = function (id) { return document.getElementById(id); };
  var SLAM_N = 6, SLAM_MS = 250, WIN_MS = 2500, SCR_N = 14, SCR_NEW = 0.75, SCR_JUMP = 5, PAUSES = [5, 15, 30], RESET_MS = 600000, BURSTS = 3, BURST_MS = 10000;
  var on = true, hits = [], bursts = [], strikes = 0, lastStrike = 0, until = 0, timer = 0;
  try { on = localStorage.getItem("calmOn") !== "0"; } catch (e) {}
  function L2(en, es) { return window.voice && voice.cfg.lang === "es" ? es : en; }
  function live() {
    var b = document.body.classList;
    return on && b.contains("play") && !b.contains("athome") && !b.contains("inconcept") && !(window.coverOn && coverOn());
  }
  function check(now) {
    var slam = {}, ns = 0;
    for (var i = hits.length - 1; i >= 0 && now - hits[i].t <= SLAM_MS; i--) if (!slam[hits[i].m]) { slam[hits[i].m] = 1; ns++; }
    if (ns >= SLAM_N) return "slam";
    if (hits.length < SCR_N) return "";
    var keys = {}, nk = 0, jump = 0;
    for (var j = 0; j < hits.length; j++) {
      if (!keys[hits[j].m]) { keys[hits[j].m] = 1; nk++; }
      if (j) jump += Math.abs(hits[j].m - hits[j - 1].m);
    }
    return nk >= SCR_NEW * hits.length && jump / (hits.length - 1) >= SCR_JUMP ? "scramble" : "";
  }
  function note(m) {                                        // every key he presses (act.note)
    var now = Date.now();
    if (now < until || !live()) { hits = []; return; }
    hits.push({ t: now, m: m });
    while (hits.length && now - hits[0].t > WIN_MS) hits.shift();
    var kind = check(now);
    if (!kind) return;
    hits = [];                                              // the next burst needs fresh presses
    bursts.push(now); while (bursts.length && now - bursts[0] > BURST_MS) bursts.shift();
    if (bursts.length >= BURSTS) { bursts = []; strike(kind, now); }
  }
  function strike(kind, now) {
    var n = BURSTS; hits = [];
    if (now - lastStrike > RESET_MS) strikes = 0;
    var sec = PAUSES[Math.min(strikes, PAUSES.length - 1)];
    strikes++; lastStrike = now; until = now + sec * 1000;
    if (window.diary) diary.ev("mash", { kind: kind, bursts: n, strike: strikes, pause: sec });
    if (window.pianoStopAll) pianoStopAll();
    var c = $("calm");
    $("calmMsg").textContent = L2("Slow down", "Más despacio");
    $("calmSub").textContent = L2("If you want to play, play. If you don't, take a little pause.", "Si quieres tocar, toca. Si no, haz una pausa.");
    c.classList.add("on");
    var line = L2("slow down. If you want to play, play. If you don't, take a little pause.", "más despacio. Si quieres tocar, toca. Si no, haz una pausa.");
    if (window.voice && voice.say) voice.say(window.hey ? hey(line.charAt(0).toUpperCase() + line.slice(1), voice.cfg.lang) : line);
    count();
  }
  function count() {                                        // the dots run down, then the keys come back
    clearTimeout(timer);
    var left = Math.ceil((until - Date.now()) / 1000);
    if (left <= 0) { $("calm").classList.remove("on"); hits = []; return; }
    $("calmLeft").textContent = left;
    timer = setTimeout(count, 250);
  }
  return {
    note: note,
    isOn: function () { return on; },
    set: function (v) { on = !!v; try { localStorage.setItem("calmOn", on ? "1" : "0"); } catch (e) {} },
    _state: function () { return { hits: hits.length, bursts: bursts.length, strikes: strikes, pause: Math.max(0, Math.ceil((until - Date.now()) / 1000)) }; }
  };
})();
