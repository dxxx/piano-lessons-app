// Run: node tests/pure.test.js - extracts the <pure> block of assets/index.html and tests it.
const fs = require("fs"), assert = require("assert"), path = require("path");
const html = fs.readFileSync(path.join(__dirname, "..", "assets", "index.html"), "utf8");
const src = html.slice(html.indexOf("// <pure>"), html.indexOf("// </pure>"));
const P = new Function(src + "; return { explain, eqSay, qSay, rightSay, wrongSay, pickIdx, mistakeCount, heartState, heartsHtml, dayStep, clockBehind, limitLeft, earnStep, qKey, reviewAfter, reviewDue, trickName, splitText, easyIntro, PRAISE, slipAnswers, slipKind, slipSay, hintPick, hintStats, needsRegroup };")();
const say = (a, b, plus, lv, l) => P.explain(a, b, plus, lv, l).say;
const eq = (got, want) => assert.strictEqual(got, want);

// L1-L2: counting, make ten, break ten
eq(say(5, 3, true, 1, "en"), "Start at 5, count 3 more: 6, 7, 8.");
eq(say(9, 3, false, 1, "en"), "Start at 9, count back 3: 8, 7, 6.");
eq(say(3, 6, true, 1, "en"), "Start at 6, count 3 more: 7, 8, 9.");
eq(say(8, 3, true, 2, "en"), "8 plus 2 makes 10, then 1 more: 11.");
eq(say(8, 5, true, 2, "en"), "8 plus 2 makes 10, then 3 more: 13.");
eq(say(15, 7, false, 2, "en"), "Take away 5 to get 10, then 2 more: 8.");
eq(say(5, 3, true, 1, "es"), "Empieza en 5, cuenta 3 más: 6, 7, 8.");
eq(say(8, 5, true, 2, "es"), "8 más 2 son 10, luego 3 más: 13.");
assert(/^17 minus 10 is 7, /.test(say(17, 12, false, 2, "en")));
// L3
eq(say(15, 7, false, 3, "en"), "Take away 5 to get 10, then 2 more: 8.");
eq(say(14, 3, true, 3, "en"), "4 plus 3 is 7, so 17.");
eq(say(17, 4, false, 3, "es"), "7 menos 4 son 3, así que 13.");
eq(say(15, 7, true, 3, "en"), "5 more makes 20, then 2 more: 22.");
// L4
eq(say(39, 4, false, 4, "en"), "Tens stay 3, ones 9 minus 4 is 5, so 35.");
eq(say(42, 5, true, 4, "es"), "Las decenas se quedan en 4, unidades 2 más 5 son 7, así que 47.");
eq(say(21, 1, false, 4, "es"), "Las decenas se quedan en 2, unidades 1 menos 1 son 0, así que 20.");
// L5
eq(say(43, 7, false, 5, "en"), "Take away 3 to get 40, then 4 more: 36.");
eq(say(38, 5, true, 5, "en"), "2 more makes 40, then 3 more: 43.");
eq(say(38, 2, true, 5, "en"), "2 more makes 40.");
eq(say(40, 7, false, 5, "en"), "Take away 10 to get 30, that is 3 too many, so add 3 back: 33.");
eq(say(43, 7, false, 5, "es"), "Quita 3 para llegar a 40, luego quita 4 más: 36.");
// L6
eq(say(65, 54, false, 6, "en"), "Ones, 5 minus 4 is 1. Tens, 6 minus 5 is 1. So 11.");
eq(say(23, 41, true, 6, "es"), "Unidades, 3 más 1 son 4. Decenas, 2 más 4 son 6. Así que 64.");
eq(say(70, 20, false, 6, "en"), "Ones, 0 minus 0 is 0. Tens, 7 minus 2 is 5. So 50.");
// L7: carry and trade, ones first; the crossed-out tens digit is named
eq(say(84, 39, false, 7, "en"), "Ones, 4 take away 9? Not enough ones, so trade 1 ten for 10 ones: 8 becomes 7, 4 becomes 14. 14 minus 9 is 5. Tens, 7 minus 3 is 4. So 45.");
eq(say(59, 27, true, 7, "en"), "Ones, 9 plus 7 is 16: write 6 and the ten goes up to the tens. Tens, 1 plus 5 plus 2 is 8. So 86.");
// slips: the classic wrong answers of column sums
eq(P.slipAnswers(84, 39, false).join(","), "55"); eq(P.slipAnswers(72, 38, false).join(","), "46,44"); eq(P.slipAnswers(38, 27, true).join(","), "55");
eq(P.slipAnswers(65, 54, false).length, 0);
eq(P.slipKind(72, 38, false, 46), "flip"); eq(P.slipKind(72, 38, false, 44), "kept"); eq(P.slipKind(38, 27, true, 55), "carry"); eq(P.slipKind(72, 38, false, 40), "");
// the hint test: least-shown style first; score = right on the next same-kind column sum without a hint
eq(P.hintPick([{ hs: "A" }, { hs: "B" }], 0), "C"); eq(P.hintPick([], 0.99), "C"); eq(P.hintPick([], 0), "A");
{ const L = [{ hs: "A", col: 1, reg: 1, ok: 0 }, { col: 1, reg: 0, ok: 1 }, { col: 1, reg: 1, ok: 1 }, { hs: "B", col: 1, reg: 1, ok: 1, hint: 2 }, { col: 1, reg: 1, ok: 0 }];
  const st = P.hintStats(L); eq(st.s.A.nx + "/" + st.s.A.nok, "1/1"); eq(st.s.B.nx + "/" + st.s.B.nok, "1/0"); eq(st.s.C.n, 0); eq(st.win, ""); }
// every sum of every level: 1-4 steps, and the last number said is the answer
for (const l of ["en", "es"]) for (let lv = 1; lv <= 7; lv++) for (let a = 1; a <= 99; a++) for (let b = 1; b <= 99; b++) for (const plus of [true, false]) {
  if (!plus && a <= b) continue; if (plus && a + b > 99) continue; if (lv <= 2 && a > 20) continue; if (lv === 3 && a > 19) continue;
  const r = plus ? a + b : a - b, x = P.explain(a, b, plus, lv, l), nums = x.say.match(/\d+/g);
  assert(x.steps.length >= 1 && x.steps.length <= 4, `steps ${a}${plus}${b} L${lv}`);
  assert(+nums[nums.length - 1] === r, `result ${a}${plus ? "+" : "-"}${b} L${lv} ${l}: ${x.say}`);
}

// hints (arcs) come from the same steps: refs exist, the order is 1..n, the last label ends in the answer
const REFS = (a, b) => { const r = ["a", "b", "q", "a0", "b0"]; if (a >= 10) r.push("a1"); if (b >= 10) r.push("b1"); return r; };
let nh = 0;
for (const l of ["en", "es"]) for (let lv = 1; lv <= 7; lv++) for (let a = 1; a <= 99; a++) for (let b = 1; b <= 99; b++) for (const plus of [true, false]) {
  if (!plus && a <= b) continue; if (plus && a + b > 99) continue; if (lv <= 2 && a > 20) continue; if (lv === 3 && a > 19) continue;
  const r = plus ? a + b : a - b, x = P.explain(a, b, plus, lv, l), hs = x.hints, ok = REFS(a, b);
  assert(hs.length >= 2 && hs.length <= 3, `hints count ${a}${plus}${b} L${lv}: ${hs.length}`);
  hs.forEach((h, i) => {
    eq(h.k, i + 1); assert(h.say.length > 5 && h.arcs.length >= 1, "hint text");
    h.arcs.forEach(c => { assert(ok.includes(c.f) && ok.includes(c.t), `ref ${c.f}->${c.t} for ${a}${plus ? "+" : "-"}${b} L${lv}`); assert(c.l.length > 1, "label"); });
  });
  const last = hs[hs.length - 1].arcs[0].l.match(/\d+/g);
  assert(+last[last.length - 1] === r, `last hint ends in the answer ${a}${plus ? "+" : "-"}${b} L${lv}: ${hs[hs.length - 1].arcs[0].l}`);
  assert(["count", "ten", "ones", "tens"].includes(x.trick)); nh++;
}
const hl = (a, b, plus, lv, l) => P.explain(a, b, plus, lv, l).hints.map(h => h.arcs[0].f + ">" + h.arcs[0].t + " [" + h.arcs[0].l + "]").join(" ; ");
eq(hl(15, 5, true, 3, "en"), "a0>b [5 + 5 = 10] ; a1>q [10 + 10 = 20]");                       // the operator's drawing: 5 to 5, then the 1 to the ?
eq(hl(39, 4, false, 4, "en"), "a0>b [9 − 4 = 5] ; a1>q [3 tens stay → 35]");
eq(hl(43, 7, false, 5, "en"), "a>b [43 − 3 = 40] ; b>q [40 − 4 = 36]");
eq(hl(8, 5, true, 2, "en"), "a>b [8 + 2 = 10] ; b>q [10 + 3 = 13]");
eq(hl(5, 3, true, 1, "en"), "a>b [5 → 6, 7, 8] ; b>q [= 8]");
eq(hl(65, 54, false, 6, "en"), "a0>b0 [5 − 4 = 1] ; a1>b1 [6 − 5 = 1] ; b1>q [= 11]");
eq(P.explain(15, 5, true, 3, "en").hints[0].say, "just do the ones first! 5 plus 5 is 10.");
eq(P.explain(15, 5, true, 3, "es").hints[0].say, "¡haz primero las unidades! 5 más 5 son 10.");
eq(P.explain(43, 7, false, 5, "en").trick, "ten"); eq(P.explain(65, 54, false, 6, "en").trick, "tens");
eq(P.explain(14, 3, true, 3, "en").trick, "ones"); eq(P.explain(5, 3, true, 1, "en").trick, "count");
eq(P.trickName("ten", true, "en"), "🔟 Make ten"); eq(P.trickName("count", false, "es"), "👆 Contar hacia atrás");
eq(P.easyIntro("en"), "Easy trick: ");
eq(P.splitText(15, 4, true, "ones"), "15 = 10 + 5"); eq(P.splitText(8, 5, true, "ten"), "5 = 2 + 3");
eq(P.splitText(43, 7, false, "ten"), "7 = 3 + 4"); eq(P.splitText(5, 3, true, "count"), "");

// spoken sentences
eq(P.qSay(12, 3, false, "en"), "What is 12 minus 3?");
eq(P.qSay(12, 3, false, "es"), "¿Cuánto es 12 menos 3?");
eq(P.rightSay(12, 3, false, "en", "Great job!", false, 0), "Great job! 12 minus 3 is 9.");
eq(P.rightSay(12, 3, false, "es", "¡Muy bien!", false, 5), "¡Muy bien! 12 menos 3 son 9. ¡Ganaste 5 minutos más!");
eq(P.wrongSay(12, 3, false, 3, "en", 8), "You said 8. Let's see… Take away 2 to get 10, then 1 more: 9. So 12 minus 3 is 9.");
for (let i = 0; i < 200; i++) { const last = i % 5; assert.notStrictEqual(P.pickIdx(5, last, Math.random()), last); }
assert(P.PRAISE.en.length >= 4 && P.PRAISE.es.length >= 4);

// rolling mistake window
const NOW = Date.parse("2026-10-25T12:00:00Z"), at = m => new Date(NOW - m * 60000).toISOString();
const log = [{ t: at(40), ok: false }, { t: at(29), ok: false }, { t: at(20), ok: true }, { t: at(10), ok: false }, { t: at(5), ok: false, fast: 1 }];
eq(P.mistakeCount(log, NOW, 30, 0), 4);          // the 40-min-old one has left the window; the fast one counts 2
eq(P.mistakeCount(log, NOW, 60, 0), 5);
eq(P.mistakeCount(log, NOW, 15, 0), 3);
eq(P.mistakeCount(log, NOW, 30, NOW - 12 * 60000), 3);   // "Unlock now" 12 min ago clears what came before it
eq(P.mistakeCount(log, NOW + 21 * 60000, 30, 0), 2);     // 21 min later only the fast one is left
eq(P.mistakeCount([{ t: at(-90), ok: false }], NOW, 30, 0), 1);   // clock set back: a "future" mistake still counts

// hearts: a mistake breaks one (a fast one 2); 5 right in a row (no hint) win one back; nothing banks while all hearts are full
const H = (l, now) => JSON.stringify(P.heartState(l, now || NOW, 30, 0, 5));
eq(H(log), JSON.stringify({ lost: 4, run: 0 }));
const R = k => ({ t: at(4 - k * 0.1), ok: true });
eq(H(log.concat([R(1), R(2), R(3), R(4)])), JSON.stringify({ lost: 4, run: 4 }));
eq(H(log.concat([R(1), R(2), R(3), R(4), R(5)])), JSON.stringify({ lost: 3, run: 0 }));
eq(H(log.concat([R(1), R(2), { t: at(3.5), ok: true, hint: 1 }, R(4), R(5), R(6)])), JSON.stringify({ lost: 3, run: 0 }));   // a hinted answer neither counts nor breaks the run
eq(H(log.concat([R(1), R(2), { t: at(3.5), ok: false }, R(4), R(5)])), JSON.stringify({ lost: 5, run: 2 }));                 // a mistake restarts the run
eq(H([R(1), R(2), R(3), R(4), R(5), { t: at(1), ok: false }]), JSON.stringify({ lost: 1, run: 0 }));                         // full hearts: right answers don't bank
eq(P.heartsHtml(3, 1, 2), '<i class="">❤️</i><i class="off lost">❤️</i><i class="off">❤️</i>');
eq(P.heartsHtml(3, 2, 1).indexOf('class="won"') > 0, true);

// midnight reset and clock tamper
let g = { day: "2026-10-25", used: 3500, seen: NOW, x: 15, e: 10, s: 3, lv0: 4, none: true, w: true };
P.dayStep(g, NOW + 1000, "2026-10-25"); eq(g.used, 3500); eq(g.e, 10);
P.dayStep(g, NOW + 3600e3, "2026-10-26"); eq(g.used, 0); eq(g.x, 0); eq(g.e, 0); eq(g.s, 0); eq(g.none, false); eq(g.day, "2026-10-26");
g.used = 1800; g.e = 5; P.dayStep(g, NOW - 86400e3, "2026-10-25"); eq(g.used, 1800); eq(g.e, 5); eq(g.day, "2026-10-26"); eq(P.clockBehind(g, NOW - 86400e3), true);   // clock back: no reset
eq(P.clockBehind(g, g.seen - 30000), false);
eq(P.limitLeft({ used: 3300, x: 0, e: 0, none: false }, 60), 300);
eq(P.limitLeft({ used: 3300, x: 15, e: 5, none: false }, 60), 1500);
eq(P.limitLeft({ used: 99999, x: 0, e: 0, none: true }, 60), Infinity);
eq(P.limitLeft({ used: 99999, x: 0, e: 0, none: false }, 0), Infinity);

// earning: streak of 5 = +5 min, a mistake resets, the daily cap holds
const E = { day: "d", used: 0, seen: 0, x: 0, e: 0, s: 0 };
let got = [];
for (let i = 0; i < 5; i++) got.push(P.earnStep(E, true, true, 5, 5, 30));
eq(got.join(), "0,0,0,0,5"); eq(E.e, 5); eq(E.s, 0);
for (let i = 0; i < 4; i++) P.earnStep(E, true, true, 5, 5, 30);
eq(E.s, 4); eq(P.earnStep(E, false, true, 5, 5, 30), 0); eq(E.s, 0);                  // 4 right then a mistake: back to zero
for (let i = 0; i < 4; i++) P.earnStep(E, true, true, 5, 5, 30);
eq(P.earnStep(E, true, false, 5, 5, 30), 0); eq(E.s, 4);                                 // a hinted answer / parent's quiz: neither grows nor resets
eq(P.earnStep(E, true, true, 5, 5, 30), 5); eq(E.e, 10);
const C = { e: 25, s: 0 };
for (let i = 0; i < 4; i++) P.earnStep(C, true, true, 5, 10, 30);
eq(P.earnStep(C, true, true, 5, 10, 30), 5); eq(C.e, 30);                                // 10 would pass the cap: only 5 added
for (let i = 0; i < 4; i++) P.earnStep(C, true, true, 5, 10, 30);
eq(P.earnStep(C, true, true, 5, 10, 30), 0); eq(C.e, 30); eq(C.s, 0);                    // capped: nothing more, the streak starts over
const N = { e: 0, s: 0 };
eq([1, 2, 3].map(() => P.earnStep(N, true, true, 3, 2, 15)).join(), "0,0,2");
eq(P.limitLeft({ used: 3600, x: 0, e: 5, none: false }, 60), 300);                      // earned minutes extend today's limit

// review scheduler: wrong -> back after 2-3 right answers; right twice -> mastered; cap 30; one review per 3 questions
const Q = [], A = (a, b, plus, lv) => ({ a, b, plus, lv });
P.reviewAfter(Q, { ...A(12, 3, false, 3), ok: false }, 0);   eq(Q[0].w, 2);
P.reviewAfter(Q, { ...A(12, 3, false, 3), ok: false }, 0.99); eq(Q.length, 1); eq(Q[0].w, 3);   // wrong again: re-scheduled, not duplicated
const other = { ...A(5, 2, true, 1), ok: true };
eq(P.reviewDue(Q, 9, ""), null);                          // not due yet
P.reviewAfter(Q, other, 0); P.reviewAfter(Q, other, 0); eq(P.reviewDue(Q, 9, ""), null);
P.reviewAfter(Q, other, 0); eq(P.reviewDue(Q, 9, "").a, 12);                                  // 3 right answers later it is due
eq(P.reviewDue(Q, 2, ""), null);                          // but not within 3 questions of the last review
eq(P.reviewDue(Q, 9, P.qKey(12, 3, false)), null);        // never the question just asked
eq(P.reviewAfter(Q, { ...A(12, 3, false, 3), ok: true, rv: 1 }, 0), false);                  // first return right: one more check later
eq(Q[0].st, 1); eq(Q[0].w, 10);
for (let i = 0; i < 9; i++) P.reviewAfter(Q, other, 0);
eq(P.reviewDue(Q, 9, ""), null); P.reviewAfter(Q, other, 0); eq(P.reviewDue(Q, 9, "").a, 12);
eq(P.reviewAfter(Q, { ...A(12, 3, false, 3), ok: true, rv: 1 }, 0), true); eq(Q.length, 0);   // right twice: mastered
P.reviewAfter(Q, { ...A(12, 3, false, 3), ok: false }, 0); P.reviewAfter(Q, other, 0); P.reviewAfter(Q, other, 0);
P.reviewAfter(Q, { ...A(12, 3, false, 3), ok: true, rv: 1 }, 0);                               // right once...
P.reviewAfter(Q, { ...A(12, 3, false, 3), ok: false, rv: 1 }, 0); eq(Q[0].st, 0); eq(Q[0].w, 2);   // ...then wrong: back to the front schedule
P.reviewAfter(Q, other, 0); P.reviewAfter(Q, other, 0);
eq(P.reviewAfter(Q, { ...A(12, 3, false, 3), ok: true, rv: 1, hint: true }, 0), false); eq(Q[0].st, 0); eq(Q[0].w, 10);   // right only with a hint: not progress, once more later
Q.length = 0;
for (let i = 0; i < 40; i++) P.reviewAfter(Q, { ...A(20 + i, 1, true, 4), ok: false }, 0);
eq(Q.length, 30); eq(Q[0].a, 30); eq(Q[29].a, 59);        // cap 30, oldest dropped
eq(Q[0].lv, 4);                                           // an item keeps its own level
console.log("OK", nh, "sums checked for hints");
