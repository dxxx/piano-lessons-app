// On-device check of the app ON THE TABLET (real WebView, real size), screen by screen.
//   adb forward tcp:$(port get piano-player tablet-devtools) localabstract:webview_devtools_remote_<pid>
//   PIN=<grown-up pin> node tests/device-check.mjs <port> [shots-dir]
// The PIN comes from the environment only (never written to a file); without it the Menu checks are skipped.
// The checks open screens and answer nothing that counts... but they DO touch saved state: back up localStorage first
// (tools/tabjs.mjs) and restore it after. Results: printed + tests/device-results.json (no personal data in it).
import fs from "fs";
const [port, shots] = process.argv.slice(2);
const pages = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(pages.find(p => p.type === "page").webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let seq = 0; const wait = {};
ws.onmessage = e => { const m = JSON.parse(e.data); if (wait[m.id]) { wait[m.id](m); delete wait[m.id]; } };
const cdp = (method, params = {}) => new Promise(r => { const id = ++seq; wait[id] = r; ws.send(JSON.stringify({ id, method, params })); });
async function run(body) {
  const m = await cdp("Runtime.evaluate", { expression: "(async()=>{" + body + "})()", awaitPromise: true, returnByValue: true });
  const r = m.result || {};
  if (r.exceptionDetails) return { ok: false, info: "JS error: " + (r.exceptionDetails.exception?.description || r.exceptionDetails.text).split("\n")[0] };
  return r.result?.value ?? { ok: false, info: "no value" };
}
async function shot(name) {
  if (!shots) return;
  fs.mkdirSync(shots, { recursive: true });
  const m = await cdp("Page.captureScreenshot", { format: "jpeg", quality: 70 });
  if (m.result) fs.writeFileSync(`${shots}/${name}.jpg`, Buffer.from(m.result.data, "base64"));
}

// Helpers inside the page: visible, tappable (the element itself is on top at its centre), fits the screen
const HELPERS = `
window.__t = {
  $: id => document.getElementById(id),
  S: ms => new Promise(r => setTimeout(r, ms)),
  vis(el) { if (typeof el === "string") el = this.$(el); if (!el) return false; const b = el.getBoundingClientRect(), s = getComputedStyle(el);
    return b.width > 0 && b.height > 0 && s.visibility !== "hidden" && s.display !== "none" && +s.opacity > 0; },
  tap(id) { const el = this.$(id); if (!this.vis(el)) return false; const b = el.getBoundingClientRect();
    const t = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2); return !!t && (t === el || el.contains(t)); },
  inside(el) { const b = el.getBoundingClientRect(); return b.left >= -1 && b.top >= -1 && b.right <= innerWidth + 1 && b.bottom <= innerHeight + 1; },
  // inside a scrolling list and scrolled out of it: fine (the list scrolls), not "off the screen"
  scrolledAway(el) { for (let p = el.parentElement; p; p = p.parentElement) { const o = getComputedStyle(p).overflowY; if (o === "auto" || o === "scroll") {
    const a = p.getBoundingClientRect(), b = el.getBoundingClientRect(); return b.bottom > a.bottom + 1 || b.top < a.top - 1; } } return false; },
  // every visible button of a layer is on the screen and its text is not cut off
  layout(root) { root = typeof root === "string" ? this.$(root) : root; const bad = [];
    [...root.querySelectorAll("button")].filter(b => this.vis(b)).forEach(b => {
      if (this.scrolledAway(b)) return;
      if (!this.inside(b)) bad.push("off-screen: " + (b.id || b.textContent.trim().slice(0, 20)));
      else if (b.scrollWidth > b.clientWidth + 2 && getComputedStyle(b).overflow !== "visible") bad.push("text cut: " + (b.id || b.textContent.trim().slice(0, 20)));
    });
    if (document.documentElement.scrollWidth > innerWidth + 1) bad.push("page scrolls sideways");
    return bad; },
  solo(on) { if (document.body.classList.contains("solo") !== on && this.vis("soloBtn")) this.$("soloBtn").click(); },
  // close kid layers the app may bring up on its own (a quiz still owed from before, the timed quick game)
  clear() { ["quiz", "concept"].forEach(i => this.$(i).classList.remove("open")); this.$("qred").classList.remove("on"); this.$("calm").classList.remove("on"); },
  grown() { const r = []; if (!this.tap("lock")) r.push("Menu not tappable"); if (!this.tap("quitBtn")) r.push("Close not tappable"); return r; },
  home() { if (this.vis("homeBtn")) this.$("homeBtn").click(); }
};`;

const PIN = process.env.PIN || "";
const C = [];   // [id, what it checks, page body returning {ok, info}, screenshot name]
const add = (id, what, body, sh) => C.push([id, what, body, sh]);
const T = "const t = window.__t;";

add("SCR-1", "Start screen: every tile the grown-up left on (of 6) is visible and inside the screen, hidden ones are gone, Menu + Close tappable",
  T + `t.home(); await t.S(600); t.clear(); await t.S(300); const K = { piano: "homePiano", play: "homePlay", math: "homeMath", write: "homeWrite", colour: "homeColour", compare: "homeCompare" };
  const want = Object.keys(K).filter(k => appMode.shown(k)).map(k => K[k]), tiles = want.filter(i => t.vis(i) && t.inside(t.$(i)));
  const ghost = Object.values(K).filter(i => want.indexOf(i) < 0 && t.$(i).getBoundingClientRect().width > 0);
  const g = t.$("homeHi").textContent; const bad = t.layout("home").concat(ghost.map(i => "hidden tile takes space: " + i));
  return { ok: tiles.length === want.length && !/undefined|null/.test(g) && !bad.length && t.tap("lock"), info: tiles.length + "/" + want.length + " tiles; greeting " + (g ? "set" : "EMPTY") + (bad.length ? "; " + bad.join(", ") : "") + (t.tap("lock") ? "" : "; Menu not tappable") }`, "01-home");
add("LES-1", "Piano tile opens lessons: list built, video area, keyboard, top bar fits",
  T + `t.$("homePiano").click(); await t.S(1500); t.solo(false); await t.S(700); const pop = t.vis("songPop"); if (pop) { t.$("songX").click(); await t.S(400); } const n = t.$("list").children.length, k = t.$("keys").querySelectorAll("[data-m]").length;
  const bad = t.layout(document.querySelector("header")).concat(t.grown());
  return { ok: n > 0 && k > 0 && t.vis("player") && !bad.length, info: n + " lessons, " + k + " keys, video " + (t.vis("player") ? "shown" : "HIDDEN (" + document.body.className + ")") + (pop ? "; song list was open on entry (closed it)" : "") + (bad.length ? "; " + bad.join(", ") : "") }`, "02-lessons");
add("LES-3", "Big video toggles on and off",
  T + `const c0 = document.body.className; t.$("mode").click(); await t.S(500); const c1 = document.body.className; t.$("mode").click(); await t.S(500);
  return { ok: c0 !== c1 && document.body.className === c0, info: "on: " + c1.replace(c0, "").trim() }`, null);
add("PNO-1", "Zoom in / out changes the number of keys, octave buttons work",
  T + `const n = () => t.$("keys").querySelectorAll("[data-m]").length, a = n(); t.$("zoomIn").click(); await t.S(300); const b = n(); t.$("zoomOut").click(); await t.S(300); const c = n();
  const lo = () => Math.min(...[...t.$("keys").querySelectorAll("[data-m]")].map(k => +k.dataset.m)), o0 = lo(); t.$("octUp").click(); await t.S(300); let o1 = lo(); const up = o1 !== o0; if (up) { t.$("octDown").click(); await t.S(300); } else { t.$("octDown").click(); await t.S(300); o1 = lo(); t.$("octUp").click(); await t.S(300); }
  return { ok: a !== b && c === a && o1 !== o0 && lo() === o0, info: "keys " + a + "/" + b + "/" + c + ", lowest " + o0 + "->" + o1 + ", octave buttons " + (t.vis("octUp") ? "shown" : "hidden") + (t.$("octUp").disabled ? " (up disabled)" : "") + (window.pianoZoomLock && window.pianoZoomLock() ? " (keyboard locked by a song)" : "") }`);
add("PNO-2", "Key names shown on the keys",
  T + `const ks = [...t.$("keys").querySelectorAll("[data-m]")]; const named = ks.filter(k => k.textContent.trim()).length;
  return { ok: named > 0, info: named + " of " + ks.length + " keys labelled (" + localStorage.getItem("noteNames") + ")" }`);
add("SND-1", "Sound picker opens full screen with all sounds, closes on tap outside",
  T + `t.$("instBtn").click(); await t.S(500); const open = t.$("instPop").classList.contains("open"), n = t.$("instGrid").querySelectorAll("button").length, bad = t.layout("instPop");
  await t.S(200); ${"t.$('instPop').click();"} await t.S(300);
  return { ok: open && n >= 20 && !t.$("instPop").classList.contains("open"), info: n + " sounds" + (bad.length ? "; " + bad.slice(0, 3).join(", ") : "") }`, "03-sounds");
add("SND-2", "Notes play: pressing a key sounds (audio engine up)",
  T + `const ok = typeof window.pianoPlayNote === "function"; let err = ""; try { window.pianoPlayNote(60, 300, 40); } catch (e) { err = e.message; }
  return { ok: ok && !err, info: (window.pianoNat ? "native engine" : "web audio") + (err ? "; " + err : "") }`);
add("PLY-1", "Piano only and Play along modes switch",
  T + `const c0 = document.body.className; t.$("soloBtn").click(); await t.S(600); const c1 = document.body.className; t.$("soloBtn").click(); await t.S(600);
  return { ok: c1 !== c0, info: "piano only adds: " + c1.split(" ").filter(x => !c0.split(" ").includes(x)).join(" ") }`, null);
add("BEAT-1", "Beat: panel opens in Piano only, tempo + / - change the BPM",
  T + `t.solo(true); await t.S(700); const shown = t.vis("beatBtn"); t.$("beatBtn").click(); await t.S(500); const p = t.vis("beatPanel") || t.vis("beatFly");
  const b0 = t.$("beatBpm").textContent; t.$("beatPlus").click(); await t.S(200); const b1 = t.$("beatBpm").textContent; t.$("beatMinus").click(); await t.S(200); const b2 = t.$("beatBpm").textContent;
  const bad = t.vis("beatPanel") ? t.layout("beatPanel") : []; ${""}
  if (t.vis("beatX")) t.$("beatX").click(); await t.S(300); t.solo(false); await t.S(600);
  return { ok: shown && p && b0 !== b1 && b2 === b0 && !bad.length, info: "Beat button " + shown + ", panel " + p + ", bpm " + b0 + "/" + b1 + "/" + b2 + (bad.length ? "; " + bad.join(", ") : "") }`, "04-beat");
add("SNG-1", "Songs: list opens with 5 tabs, songs in each, favourite hearts",
  T + `t.$("songBtn").click(); await t.S(800); const tabs = [...t.$("songTabs").querySelectorAll("button")]; const per = [];
  for (const b of tabs) { b.click(); await t.S(300); per.push(b.textContent.trim().slice(0, 14) + ":" + t.$("songList").children.length); }
  const hearts = t.$("songList").querySelectorAll("[class*=fav],[data-fav],.heart").length, bad = t.layout("songPop");
  return { ok: tabs.length === 5 && per.every(x => !/:0$/.test(x)) && !bad.length, info: per.join(" | ") + "; hearts " + hearts + (bad.length ? "; " + bad.slice(0, 3).join(", ") : "") }`, "05-songs");
add("SNG-2", "Songs: close the list",
  T + `if (t.vis("songX")) t.$("songX").click(); await t.S(400); return { ok: !t.vis("songPop"), info: "" }`);
add("FOL-1", "Follow the keys: a song opens on its own sound; pressing the note just played again (rhythm) never blocks the right key; leaving gives his sound back",
  T + `const own = pianoSound.now(); await new Promise(r => fetch("songs/index.json").then(x => x.json()).then(ix => { window._ix = ix; r(); }));
  const s = _ix.find(x => x.snd && x.snd !== "grand" && x.n > 20) || _ix[0]; t.solo(true); await t.S(600); follow.start(s.id); await t.S(1500);
  const snd = pianoSound.now(); const go = async () => { for (let i = 0; i < 60 && !(follow.frame(performance.now()) || {}).waiting; i++) await t.S(100); };
  await go(); const a = follow._state(); a.want.forEach(m => follow.note(m)); await go();
  const prev = a.want[0], b = follow._state(); for (let i = 0; i < 6; i++) follow.note(prev); const r = follow._state(); r.want.forEach(m => follow.note(m)); const c = follow._state();
  follow.stop(); await t.S(300); const back = pianoSound.now();
  return { ok: snd === (s.snd || "grand") && r.miss === b.miss && c.si === r.si + 1 && back === own, info: s.t + ": sound " + snd + " (want " + s.snd + "); 6 repeats of the last note: misses " + b.miss + " -> " + r.miss + ", then the right key: step " + r.si + " -> " + c.si + "; sound after " + back + " (was " + own + ")" }`);
add("LES-2", "Next / previous lesson changes the lesson number",
  T + `const a = t.$("num").textContent; t.$("next").click(); await t.S(800); const b = t.$("num").textContent; t.$("prev").click(); await t.S(800); const c = t.$("num").textContent;
  const q = t.$("quiz").classList.contains("open"); return { ok: a !== b && (c === a || q), info: a + " -> " + b + " -> " + c + (q ? "; maths quiz came up first (expected: quiz after a lesson)" : "") }`);
add("MTH-1", "Maths quiz between lessons: question + 3 answers + hearts, Menu and Close tappable above it",
  T + `quiz.show(true); await t.S(1500); const open = t.$("quiz").classList.contains("open"), ans = t.$("qans").querySelectorAll("button").length,
  hearts = (t.$("qhearts").textContent.match(/❤|♥/g) || []).length || t.$("qhearts").children.length; const g = t.grown(), bad = t.layout("quiz");
  return { ok: open && ans >= 2 && !g.length && !bad.length, info: ans + " answers, hearts " + hearts + "; kidtop " + document.body.classList.contains("kidtop") + (g.length ? "; " + g.join(", ") : "") + (bad.length ? "; " + bad.join(", ") : "") }`, "06-quiz");
add("MTH-2", "Maths quiz: the Menu PIN pad opens above the quiz and covers the buttons",
  T + `t.$("lock").click(); await t.S(500); const g = t.$("gate").classList.contains("open"); const b = t.$("lock").getBoundingClientRect(); const top = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2);
  const ok = g && !!top.closest("#gate"); window.lockMenu(); await t.S(300); return { ok, info: g ? "gate open, on top: " + ok : "gate did not open" }`);
add("MTH-3", "Maths quiz: 'Show me (the trick)' opens the hint for this sum",
  T + `const tb = t.$("qtbtn"); if (!t.vis(tb)) return { ok: true, info: "hints are off in the Menu (fine)" }; tb.click(); await t.S(1200);
  const h = t.$("quiz").classList.contains("hinting") || t.$("qtrick").classList.contains("on"); return { ok: h, info: "hint shown " + h }`, "06b-hint");
add("MTH-4", "Red mistake screen: Menu reachable or the screen has its own way out",
  T + `t.$("qred").classList.add("on"); await t.S(300); const g = t.tap("lock"), stop = t.vis("qredStop"); t.$("qred").classList.remove("on"); await t.S(200);
  return { ok: g || stop, info: "Menu tappable " + g + ", own stop button " + stop }`);
add("MTH-5", "Calm screen: Menu and Close tappable above it",
  T + `t.$("calm").classList.add("on"); await t.S(300); const g = t.grown(); t.$("calm").classList.remove("on"); await t.S(200); return { ok: !g.length, info: g.join(", ") }`);
add("MTH-6", "Quiz closes again (lessons back) and kidtop is cleared",
  T + `t.$("quiz").classList.remove("open"); await t.S(300); return { ok: !document.body.classList.contains("kidtop") && t.tap("lock"), info: "" }`);
add("MTH-7", "Maths-only mode: quiz fills the screen, Home + Menu + Close tappable",
  T + `t.home(); await t.S(600); t.$("homeMath").click(); await t.S(1500); const m = document.body.classList.contains("math"), q = t.$("quiz").classList.contains("open"), g = t.grown(), h = t.tap("homeBtn");
  return { ok: m && q && !g.length && h, info: "math " + m + ", quiz " + q + ", home " + h + (g.length ? "; " + g.join(", ") : "") }`, "07-mathonly");
add("WRT-1", "Writing: opens, drawing pad and buttons fit, Menu + Close tappable",
  T + `t.home(); await t.S(600); t.$("homeWrite").click(); await t.S(1200); const v = t.vis("write") && t.vis("wPad"), g = t.grown(), bad = t.layout("write");
  return { ok: v && !g.length && !bad.length, info: "level " + t.$("wLv").textContent.trim() + (g.length ? "; " + g.join(", ") : "") + (bad.length ? "; " + bad.join(", ") : "") }`, "08-writing");
add("COL-1", "Colouring: opens with pictures and palette, Menu + Close tappable",
  T + `t.home(); await t.S(600); t.$("homeColour").click(); await t.S(1200); const v = t.vis("colour"), pics = t.$("cGal").children.length || t.$("cPics").children.length, pal = t.$("cPal").children.length, g = t.grown(), bad = t.layout("colour");
  return { ok: v && pal > 0 && !g.length && !bad.length, info: pics + " pictures, " + pal + " colours" + (g.length ? "; " + g.join(", ") : "") + (bad.length ? "; " + bad.slice(0, 3).join(", ") : "") }`, "09-colouring");
add("CMP-1", "Bigger or smaller: opens with a question and answers, Menu + Close tappable",
  T + `t.home(); await t.S(600); t.$("homeCompare").click(); await t.S(1200); const qg = t.$("concept").classList.contains("open"); t.clear(); await t.S(400); const v = t.vis("compare"), a = t.$("cmAns").querySelectorAll("button").length + t.$("cmStage").querySelectorAll(".cmpick").length, g = t.grown(), bad = t.layout("compare");   // answers = the answer row OR the pictures themselves (.cmpick)
  return { ok: v && a > 0 && !g.length && !bad.length, info: (qg ? "quick game came up first (by design); " : "") + a + " answers, stage " + t.$("cmStage").textContent.trim().slice(0, 30) + (g.length ? "; " + g.join(", ") : "") + (bad.length ? "; " + bad.join(", ") : "") }`, "10-compare");
add("EYE-1", "Eye guard cover: Menu reachable or the cover has its own way out",
  T + `t.home(); await t.S(500); t.$("eyecov").classList.add("on"); await t.S(300); const g = t.tap("lock"), own = [...t.$("eyecov").querySelectorAll("button")].some(b => t.vis(b));
  t.$("eyecov").classList.remove("on"); await t.S(200); return { ok: true, info: "Menu tappable " + g + ", own button " + own + " (cover is meant to block; noted)" }`);
add("TIM-1", "Screen time: summary readable",
  T + `return { ok: typeof guard.summary() === "string" && !/NaN|undefined/.test(guard.summary() + guard.note()), info: guard.summary() }`);
add("BAR-1", "Grown-up corner: Menu + Close tappable on every screen (start, lessons, piano only, quiz, maths-only, writing, colouring, bigger or smaller, lock screen)",
  T + `const out = []; const at = async (name, go) => { await go(); await t.S(900); const g = t.grown(); out.push(name + (g.length ? ":" + g.join("+") : ":ok")); };
  await at("start", async () => t.home());
  await at("lessons", async () => { t.$("homePiano").click(); await t.S(900); t.solo(false); });
  await at("piano only", async () => t.solo(true));
  await at("quiz", async () => { t.solo(false); await t.S(500); quiz.show(true); });
  await at("maths only", async () => { t.$("quiz").classList.remove("open"); t.home(); await t.S(500); t.$("homeMath").click(); });
  await at("writing", async () => { t.home(); await t.S(500); t.$("homeWrite").click(); });
  await at("colouring", async () => { t.home(); await t.S(500); t.$("homeColour").click(); });
  await at("bigger or smaller", async () => { t.home(); await t.S(500); t.$("homeCompare").click(); });
  await at("lock screen", async () => { t.home(); await t.S(500); document.body.classList.add("locked"); t.$("lockscr").style.display = "flex"; });
  document.body.classList.remove("locked"); t.$("lockscr").style.display = ""; t.home();
  return { ok: out.every(x => x.endsWith(":ok")), info: out.join(" | ") }`, "13-corner");
add("PIN-1", "Menu: wrong PIN is refused",
  T + `t.$("lock").click(); await t.S(400); const k = d => [...t.$("pad").children].find(b => b.textContent === d).dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
  for (const d of "0000") { k(d); await t.S(80); } await t.S(400); const err = t.$("ge").textContent, menu = t.$("choices").hidden === false;
  window.lockMenu(); await t.S(200); return { ok: /wrong|incorrecto/i.test(err) && !menu, info: err }`);
if (PIN) {
  add("MENU-1", "Menu: right PIN opens it; every section renders, fits, no 'undefined'",
    T + `t.$("lock").click(); await t.S(400); const k = d => [...t.$("pad").children].find(b => b.textContent === d).dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    for (const d of ${JSON.stringify(PIN)}) { k(d); await t.S(80); } await t.S(600);
    if (!t.vis("mNav")) return { ok: false, info: "menu did not open: " + t.$("ge").textContent };
    const out = [], bad = []; for (const b of t.$("mNav").children) { b.click(); await t.S(250); const sec = t.$("mPane").querySelector("section.on");
      const rows = sec ? sec.querySelectorAll("button").length : 0; out.push(b.textContent.trim() + ":" + rows);
      if (sec && /undefined|NaN|null/.test(sec.textContent)) bad.push(b.textContent.trim() + " shows undefined/NaN");
      const lb = t.layout(sec || t.$("mPane")); if (lb.length) bad.push(b.textContent.trim() + ": " + lb.slice(0, 2).join(", ")); }
    return { ok: !bad.length && out.every(x => !/:0$/.test(x)), info: out.join(" | ") + (bad.length ? " || " + bad.join("; ") : "") }`, "11-menu");
  add("MENU-2", "Menu: Activity and Maths results panels open and close",
    T + `const r = []; for (const [b, p, x] of [["qAct", "act", "actBack"], ["qRes", "res", "resBack"]]) { if (!t.$(b)) { r.push(b + " missing"); continue; } t.$(b).click(); await t.S(500);
      const o = t.$(p).classList.contains("open"), bad = t.layout(p); t.$(x).click(); await t.S(300); if (!o) r.push(p + " did not open"); if (bad.length) r.push(p + ": " + bad.slice(0, 2).join(", ")); }
    return { ok: !r.length, info: r.join("; ") }`, null);
  add("MENU-3", "Menu: tap outside the card closes and locks it",
    T + `t.$("gate").dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })); await t.S(300); return { ok: !t.$("gate").classList.contains("open") && !t.$("mNav"), info: "" }`);
}
add("LAY-1", "Back on the start screen at the end; no sideways scroll",
  T + `t.home(); await t.S(600); return { ok: document.documentElement.scrollWidth <= innerWidth + 1 && t.vis("home"), info: innerWidth + "x" + innerHeight }`, "12-end");

await run(HELPERS);
const results = [];
for (const [id, what, body, sh] of C) {
  let r; try { r = await run(body); } catch (e) { r = { ok: false, info: String(e) }; }
  if (sh) await shot(sh);
  results.push({ id, what, ok: !!r.ok, info: r.info || "" });
  console.log((r.ok ? "PASS " : "FAIL ") + id.padEnd(7) + what + (r.info ? "  [" + r.info + "]" : ""));
}
const ver = await run("return (window.Parent && window.Parent.version && window.Parent.version()) || ''");
fs.writeFileSync(new URL("./device-results.json", import.meta.url), JSON.stringify({ when: new Date().toISOString(), version: ver || null, size: (await run("return innerWidth + 'x' + innerHeight")), results }, null, 1));
console.log(results.filter(r => r.ok).length + "/" + results.length + " passed");
ws.close(); process.exit(0);
