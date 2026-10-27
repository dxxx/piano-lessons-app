// Builds tools/instrument-icons.js: var ICONS = { id: "<svg inner markup>" } for a 48x48 viewBox.
// Run: node tools/build-icons.js
// The first 12 (soft ... timpani) are the operator-approved sample, kept exactly as drawn.
var fs = require("fs"), path = require("path");

// ---- helpers (r / blacks are the approved ones, unchanged) ----
var K = '<rect x="X" y="Y" width="W" height="H" rx="R" fill="F"/>';
function r(x, y, w, h, rx, f) { return K.replace("X", x).replace("Y", y).replace("W", w).replace("H", h).replace("R", rx).replace("F", f); }
function blacks(x0, y, w, n, step, h) { var s = ""; for (var i = 0; i < n; i++) if ([2, 6].indexOf(i % 7) < 0) s += r(x0 + i * step + step * 0.6, y, step * 0.6, h, 0.4, "#2B2836"); return s; }
function c(cx, cy, rad, f) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + rad + '" fill="' + f + '"/>'; }
function P(d, f) { return '<path d="' + d + '" fill="' + f + '"/>'; }
function S(d, col, w) { return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"/>'; }
function E(cx, cy, rx, ry, f, rot) { return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '"' + (rot ? ' transform="rotate(' + rot + " " + cx + " " + cy + ')"' : "") + ' fill="' + f + '"/>'; }
function G(t, inner) { return '<g transform="' + t + '">' + inner + "</g>"; }
function map(n, fn) { var s = ""; for (var i = 0; i < n; i++) s += fn(i); return s; }
function spark(cx, cy, s, f) { return P("M" + cx + " " + (cy - s) + "Q" + cx + " " + cy + " " + (cx + s) + " " + cy + "Q" + cx + " " + cy + " " + cx + " " + (cy + s) + "Q" + cx + " " + cy + " " + (cx - s) + " " + cy + "Q" + cx + " " + cy + " " + cx + " " + (cy - s) + "Z", f); }
function star(cx, cy, n, ro, ri, f) { var d = ""; for (var i = 0; i < n * 2; i++) { var a = Math.PI * i / n - Math.PI / 2, rr = i % 2 ? ri : ro; d += (i ? "L" : "M") + (cx + rr * Math.cos(a)).toFixed(1) + " " + (cy + rr * Math.sin(a)).toFixed(1); } return P(d + "Z", f); }
function about(rot, s) { return "translate(24 24) rotate(" + rot + ")" + (s ? " scale(" + s + ")" : "") + " translate(-24 -24)"; }

var W = "#FFFDF8", BK = "#2B2836", WD = "#8B5A2B", WL = "#A0693A", WDK = "#6B4220", BR = "#E2A72E", BRL = "#F5B841", BRD = "#C98A12",
    SV = "#C9CFD8", SVD = "#9AA3AF", CR = "#F4EBD9", RED = "#E5484D", GREY = "#4a4560";

// synth keyboard at the bottom (motif goes in y 2..25)
function kb(col) { return r(3, 27, 42, 18, 3, col) + r(6, 33, 36, 10, 1, W) + blacks(6, 33, 8, 7, 4.5, 5.8) + c(8, 30, 1.3, W) + c(12, 30, 1.3, W) + c(16, 30, 1.3, W); }
// speaker driver
function spk(cx, cy, R) { return c(cx, cy, R, SV) + c(cx, cy, R * 0.78, BK) + c(cx, cy, R * 0.62, "#3d3850") + c(cx, cy, R * 0.28, SVD); }
// bowed body (approved cello shape), optional endpin
function bowed(col, pin) {
  return (pin ? '<line x1="24" y1="40" x2="24" y2="47" stroke="#9AA3AF" stroke-width="1.6"/>' : "") +
    P("M24 12 C16 12 15 17 17 21 C13 24 12 30 14 36 C16 41 32 41 34 36 C36 30 35 24 31 21 C33 17 32 12 24 12 Z", col) +
    r(22.6, 2, 2.8, 16, 1, "#3b2a1a") + c(24, 3.2, 2.2, "#3b2a1a") +
    S("M19.5 24 q-1 3 0 6 M28.5 24 q1 3 0 6", "#3b2a1a", 1.2) + r(22, 33, 4, 1.6, 0.5, "#3b2a1a") + '<path d="M23 16 V33 M25 16 V33" stroke="#F4EBD9" stroke-width=".6"/>';
}
// bass guitar (vertical, rotate with G)
function bass(body, neck, frets) {
  return P("M24 27 C16 25 13 31 15 36 C11 40 14 49 24 48 C34 49 37 41 33 36 C35 31 32 25 24 27 Z", body) +
    r(19, 33, 10, 7, 2, BK) + r(22, -1, 4, 34, 1, neck) + r(20.5, -8, 7, 8, 2, BK) +
    (frets ? map(6, function (i) { return r(22, 2 + i * 5, 4, 0.8, 0, SV); }) : "") +
    '<path d="M22.8 -4 V44 M23.6 -4 V44 M24.4 -4 V44 M25.2 -4 V44" stroke="#F4EBD9" stroke-width=".45"/>' + r(20.5, 42, 7, 2.2, 1, SV);
}
// solid-body electric guitar (vertical)
function eg(body, guard) {
  return P("M17 26 C13 21 10 26 13 31 C9 36 10 45 18 47.5 C24 49.5 32 48 34 43 C36 38 32 35 35 30 C38 25 34 21 31 25 C28 29 21 30 17 26 Z", body) +
    P("M16 31 C14 36 15 42 20 44 C26 46 31 42 30 38 Z", guard) + r(21.5, 0, 5, 30, 1, WL) + r(20.5, -7, 7, 8, 2, BK) +
    r(20, 33, 8, 2, 0.8, BK) + r(20, 37.5, 8, 2, 0.8, BK) + map(5, function (i) { return r(21.5, 3 + i * 5, 5, 0.7, 0, SV); }) +
    '<path d="M22.6 -3 V42 M24 -3 V42 M25.4 -3 V42" stroke="#F4EBD9" stroke-width=".5"/>';
}

var ICONS = {};
// ================= APPROVED SAMPLE (unchanged) =================
ICONS.soft = r(5, 6, 38, 6, 2, "#A0693A") + r(7, 10, 34, 28, 2, "#8B5A2B") + r(13, 14, 22, 6, 1, "#6B4220") +
  r(9, 24, 30, 8, 1, "#FFFDF8") + blacks(9, 24, 7, 6, 4.3, 4.6) + r(9, 38, 3, 6, 1, "#6B4220") + r(36, 38, 3, 6, 1, "#6B4220");
ICONS.epiano = '<path d="M14 34 L8 45 M34 34 L40 45 M14 34 L36 45 M34 34 L12 45" stroke="#4a4560" stroke-width="2.5" stroke-linecap="round"/>' +
  r(3, 15, 42, 19, 4, "#E5484D") + r(6, 23, 36, 9, 1, "#FFFDF8") + blacks(6, 23, 8, 7, 4.5, 5.2) +
  '<circle cx="10" cy="19" r="1.7" fill="#fff"/><circle cx="15" cy="19" r="1.7" fill="#fff"/><circle cx="20" cy="19" r="1.7" fill="#fff"/>';
ICONS.organ = r(6, 12, 36, 26, 2, "#7A4A24") + [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) { return r(10 + i * 3.6, 14, 2.2, 6, 0.6, ["#6B4220", "#6B4220", "#FFFDF8", "#FFFDF8", "#2B2836", "#FFFDF8", "#2B2836", "#FFFDF8"][i]); }).join("") +
  r(9, 22, 30, 5, 1, "#FFFDF8") + r(9, 29, 30, 5, 1, "#FFFDF8") + blacks(9, 22, 7, 6, 4.3, 3) + blacks(9, 29, 7, 6, 4.3, 3) +
  r(8, 38, 4, 6, 1, "#5a3518") + r(36, 38, 4, 6, 1, "#5a3518");
ICONS.harpsichord = '<path d="M4 21 L28 6 L45 21 Z" fill="#8B5A2B"/>' + '<path d="M4 21 H45 L41 31 H4 Z" fill="#D4A72C"/>' +
  r(4, 22, 13, 5, 1, "#FFFDF8") + blacks(4, 22, 4, 3, 4, 2.6) +
  '<path d="M8 31 V43 M24 31 V43 M38 31 V43" stroke="#6B4220" stroke-width="2.5" stroke-linecap="round"/>';
ICONS.marimba = [0, 1, 2, 3, 4, 5].map(function (i) { return r(5 + i * 6.6, 10 + i * 2, 5.4, 20 - i * 2.6, 1.2, i % 2 ? "#A0522D" : "#C0703A"); }).join("") +
  r(3, 32, 42, 2.5, 1, "#4a4560") + [0, 1, 2, 3, 4, 5].map(function (i) { return r(6.2 + i * 6.6, 34, 3, 10 - i, 1, "#9AA3AF"); }).join("");
ICONS.harp = '<path d="M11 42 V9 C18 3 27 13 39 7 L17 42 Z" fill="none" stroke="#C68642" stroke-width="4" stroke-linejoin="round"/>' +
  [0, 1, 2, 3, 4, 5].map(function (i) { var x = 15 + i * 3.6, y1 = 8.5 + (i < 3 ? i * 0.6 : 2.3 - (i - 3) * 0.3); return '<line x1="' + x + '" y1="' + y1 + '" x2="' + x + '" y2="' + (40 - i * 4.8) + '" stroke="#F4EBD9" stroke-width="1"/>'; }).join("") +
  r(8, 41, 13, 3, 1.2, "#8B5A2B");
ICONS.cello = '<line x1="24" y1="40" x2="24" y2="47" stroke="#9AA3AF" stroke-width="1.6"/>' +
  '<path d="M24 12 C16 12 15 17 17 21 C13 24 12 30 14 36 C16 41 32 41 34 36 C36 30 35 24 31 21 C33 17 32 12 24 12 Z" fill="#B5651D"/>' +
  r(22.6, 2, 2.8, 16, 1, "#3b2a1a") + '<circle cx="24" cy="3.2" r="2.2" fill="#3b2a1a"/>' +
  '<path d="M19.5 24 q-1 3 0 6 M28.5 24 q1 3 0 6" stroke="#3b2a1a" stroke-width="1.2" fill="none"/>' +
  r(22, 33, 4, 1.6, 0.5, "#3b2a1a") + '<path d="M23 16 V33 M25 16 V33" stroke="#F4EBD9" stroke-width=".6"/>';
ICONS.flute = '<g transform="rotate(-28 24 24)">' + r(1, 21.5, 46, 5, 2.5, "#C9CFD8") + r(8, 20, 5, 1.8, 0.8, "#9AA3AF") +
  [17, 22, 27, 32, 37, 41].map(function (x) { return '<circle cx="' + x + '" cy="24" r="1.5" fill="#8A93A0"/>'; }).join("") + "</g>";
ICONS.clarinet = '<g transform="rotate(28 24 24)">' + r(21, 3, 6, 3, 1, "#C9CFD8") + r(21.3, 5, 5.4, 33, 1.5, "#2B2836") + '<path d="M20 37 H28 L32 45 H16 Z" fill="#2B2836"/>' +
  [12, 20, 28].map(function (y) { return r(20.6, y, 6.8, 1.2, 0.5, "#C9CFD8"); }).join("") +
  [9, 16, 24, 32].map(function (y) { return '<circle cx="24" cy="' + y + '" r="1.2" fill="#C9CFD8"/>'; }).join("") + "</g>";
ICONS.horn = '<circle cx="20" cy="19" r="12" fill="none" stroke="#E2A72E" stroke-width="3.6"/>' + '<circle cx="20" cy="19" r="6.5" fill="none" stroke="#F5B841" stroke-width="2.6"/>' +
  '<path d="M26 28 L30 24 L45 30 L35 44 Z" fill="#F5B841"/>' + '<ellipse cx="40" cy="37" rx="9" ry="4.2" transform="rotate(-52 40 37)" fill="#C98A12"/>' +
  '<ellipse cx="40" cy="37" rx="6.5" ry="2.6" transform="rotate(-52 40 37)" fill="#7a5208"/>' +
  r(13, 30, 3, 6, 1, "#C98A12") + r(17.5, 30, 3, 6, 1, "#C98A12") + r(22, 30, 3, 6, 1, "#C98A12") +
  '<line x1="8" y1="19" x2="3" y2="13" stroke="#E2A72E" stroke-width="2.4" stroke-linecap="round"/>';
ICONS.trombone = '<path d="M8 19 H36 M8 29 H30 M8 19 Q3 24 8 29" fill="none" stroke="#E2A72E" stroke-width="3.2" stroke-linecap="round"/>' +
  '<path d="M34 19 L46 11 V27 Z" fill="#F5B841"/>' + '<line x1="22" y1="19" x2="22" y2="29" stroke="#C98A12" stroke-width="2"/>' + '<line x1="30" y1="29" x2="36" y2="34" stroke="#E2A72E" stroke-width="2.5" stroke-linecap="round"/>';
ICONS.timpani = '<path d="M8 22 H40 L36 36 C30 41 18 41 12 36 Z" fill="#C77B30"/>' + '<ellipse cx="24" cy="22" rx="16" ry="4.5" fill="#F4EBD9" stroke="#D9CBB0" stroke-width="1"/>' +
  '<path d="M14 37 L11 45 M34 37 L37 45 M24 40 V45" stroke="#4a4560" stroke-width="2" stroke-linecap="round"/>' +
  '<line x1="12" y1="4" x2="20" y2="16" stroke="#8B5A2B" stroke-width="1.8"/><circle cx="20.5" cy="16.5" r="2.6" fill="#F4EBD9"/>' +
  '<line x1="36" y1="4" x2="29" y2="15" stroke="#8B5A2B" stroke-width="1.8"/><circle cx="28.5" cy="15.5" r="2.6" fill="#F4EBD9"/>';

// ================= KEYS =================
ICONS.grand = S("M31 22 L33 11", SVD, 1.4) +
  P("M5 23 L38 4 Q41 3 41 6 L12 24 Z", "#5b5577") +
  '<path d="M3 23 H36 C43 23 46 26 45 31 H3 Z" fill="#2B2836" stroke="#8f88b8" stroke-width="1.2"/>' + r(3, 24, 42, 1.4, 0.7, "#6a6390") +
  r(1, 21, 10, 4, 0.8, W) + blacks(1, 21, 0, 3, 3.3, 2) +
  r(6, 31, 3, 13, 1, "#5b5577") + r(37, 31, 3, 13, 1, "#5b5577") + r(21, 31, 2.5, 8, 1, "#5b5577") + r(19, 38, 6.5, 3, 1, BRL);
ICONS.musicbox = P("M9 24 L5 6 H37 L41 24 Z", WD) + P("M11.5 22 L8.5 9 H34 L37 22 Z", "#C2415A") +
  r(12, 20, 22, 6, 3, BRL) + map(6, function (i) { return c(15 + i * 3.2, 23, 0.8, BRD); }) +
  r(7, 25, 32, 19, 2, WL) + r(10, 28, 26, 13, 1.5, WD) + c(23, 34.5, 2.2, BRL) +
  S("M39 33 H44 V26", SVD, 2.4) + r(42, 23, 4.5, 4, 1.5, RED);
ICONS.honkytonk = G("rotate(-7 24 28)",
  r(5, 15, 38, 4, 1.5, "#C77B30") + r(7, 18, 34, 22, 2, WL) + r(11, 20.5, 26, 5.5, 1, WDK) +
  r(5, 27, 38, 2.5, 1, WDK) + r(8, 29.5, 32, 5.5, 0.5, W) + blacks(8, 29.5, 0, 7, 4.5, 3.2) + r(21.6, 29.5, 4.4, 5.5, 0, "#3d3850") +
  r(9, 40, 3, 6, 1, WDK) + r(36, 40, 3, 4, 1, WDK) +
  E(17, 13, 10, 2.4, BRD) + P("M11 13 Q11 5 17 6 Q23 5 23 13 Z", BRL) + r(11.5, 10.5, 11, 1.6, 0.5, "#8B3A1A"));
ICONS.clavinet = S("M10 42 L13 33 M38 42 L35 33", GREY, 2.6) +
  P("M8 9 H40 L45 25 H3 Z", RED) + P("M8 9 H40 L41 12 H7 Z", "#F07A7E") + c(12, 17, 1.8, BK) + c(17, 17, 1.8, BK) + r(31, 15, 8, 2.4, 1.2, BK) +
  r(3, 25, 42, 9, 1, W) + blacks(3, 25, 0, 9, 4.67, 5.6) + r(2, 33, 44, 3.5, 1.5, BK);
ICONS.celesta = r(7, 4, 34, 3.5, 1.5, "#D4A72C") + r(8, 6, 32, 30, 2, "#C77B30") + r(11, 9, 26, 13, 1.5, "#3d3850") +
  map(5, function (i) { return r(13 + i * 5, 11 + i * 1.6, 3.6, 9 - i * 1.6, 0.8, i % 2 ? SVD : SV); }) +
  r(6, 23, 36, 2.5, 1, WDK) + r(8.5, 25.5, 31, 6.5, 0.6, W) + blacks(8.5, 25.5, 0, 7, 4.4, 3.8) +
  r(10, 36, 3, 9, 1, WDK) + r(35, 36, 3, 9, 1, WDK) + spark(42, 6, 4.5, "#FFE680") + spark(5, 14, 3, "#FFE680");
ICONS.vibes = map(6, function (i) { return r(4 + i * 6.6, 10 + i * 1.6, 5.4, 16 - i * 1.8, 1.2, i % 2 ? SVD : SV); }) +
  r(2, 28, 42, 2.5, 1, GREY) + map(6, function (i) { return r(5.2 + i * 6.6, 30.5, 3, 15 - i * 1.6, 1, i % 2 ? BRD : BR); }) +
  S("M43 21 L33 7", "#E8C07A", 2) + c(32, 5.5, 3.6, "#B98CFF");
ICONS.accordion = r(13, 11, 22, 28, 0, "#3d3850") + map(6, function (i) { return r(14.5 + i * 3.6, 11, 1.4, 28, 0, i % 2 ? "#C9CFD8" : "#FFFDF8"); }) +
  r(3, 8, 11, 34, 2.5, RED) + r(5, 10.5, 7, 29, 1, W) + map(5, function (i) { return r(5, 13 + i * 5.6, 4, 3, 0.4, BK); }) +
  r(34, 8, 11, 34, 2.5, RED) + map(4, function (i) { return c(37.5, 13 + i * 6.5, 1.6, W) + c(41.5, 16 + i * 6.5, 1.6, W); });

// ================= SYNTHS =================
ICONS.lead = kb("#2EC4B6") + S("M4 21 L13 6 V21 L22 6 V21 L31 6 V21 L40 6 V21 L44 14", "#FFE680", 3);
ICONS.freestyle = S("M10 27 V21 A14 14 0 0 1 38 21 V27", SV, 3.8) + r(5, 23, 10, 17, 4.5, RED) + r(33, 23, 10, 17, 4.5, RED) +
  r(7.5, 26, 5, 11, 2.5, "#B3262B") + r(35.5, 26, 5, 11, 2.5, "#B3262B") + S("M17 32 L19.5 27 L22.5 38 L25.5 25 L28.5 35 L31 31", "#7DF9FF", 2.4);
ICONS.dance = S("M24 0 V8", SVD, 1.5) + c(24, 23, 15, SV) +
  '<g fill="none" stroke="#7d8696" stroke-width="1"><ellipse cx="24" cy="23" rx="6.5" ry="15"/><ellipse cx="24" cy="23" rx="12" ry="15"/><path d="M24 8 V38 M10 17 H38 M9 23 H39 M10 29 H38"/></g>' +
  r(15, 13, 5, 4, 0.5, W) + r(26, 18, 5, 4, 0.5, "#FFE680") + r(17, 25, 5, 4, 0.5, "#7DF9FF") + r(29, 30, 4, 3, 0.5, "#FF8FC7") +
  spark(5, 7, 4.5, "#FFE680") + spark(43, 9, 3.5, "#FF8FC7") + spark(42, 40, 4, "#7DF9FF") + spark(6, 40, 3, W);
ICONS.squarelead = r(3, 7, 42, 34, 8, "#3B82F6") + r(6, 10, 36, 28, 6, "#2563EB") + S("M8 31 H15 V17 H24 V31 H33 V17 H40", W, 3.6);
ICONS.calliope = map(6, function (i) { var h = 22 - i * 2.6, x = 6 + i * 6; return r(x, 30 - h, 4.8, h, 1.2, i % 2 ? BR : BRL) + r(x + 1, 30 - h + 3, 2.8, 2.2, 0.6, "#7a5208"); }) +
  c(7.5, 5, 3.4, CR) + c(12, 3.5, 2.6, CR) + c(13.5, 7, 2.6, CR) +
  r(3, 29, 42, 10, 2, RED) + r(5, 31.5, 38, 2, 1, BRL) + c(12, 41, 4.5, BRL) + c(36, 41, 4.5, BRL) + c(12, 41, 1.6, BRD) + c(36, 41, 1.6, BRD);
ICONS.charang = G(about(42, 0.92), eg("#22D3EE", "#0E7490")) + P("M12 2 L4 17 H10 L6 28 L19 11 H13 L17 2 Z", "#FFE680");
ICONS.fifths = '<path d="M5 12 H43 M5 18 H43 M5 24 H43 M5 30 H43 M5 36 H43" stroke="#8f88b8" stroke-width=".8"/>' +
  E(13, 35, 5.2, 3.8, "#FF8FC7", -22) + E(13, 25, 5.2, 3.8, "#FF8FC7", -22) + E(33, 31, 5.2, 3.8, "#FF8FC7", -22) + E(33, 21, 5.2, 3.8, "#FF8FC7", -22) +
  r(16.6, 7, 2.6, 28, 1, "#FF8FC7") + r(36.6, 3, 2.6, 28, 1, "#FF8FC7") + P("M16.6 6 L39.2 2 V7.5 L16.6 11.5 Z", "#FF8FC7");
ICONS.synthbrass = kb("#F97316") + r(4, 11, 18, 5, 2, BR) + P("M20 10.5 L40 2 V25 L20 16.5 Z", BRL) + E(40, 13.5, 3.2, 11.5, BRD) + E(40.6, 13.5, 1.6, 9, "#7a5208") +
  r(9, 6, 3, 6, 1, BRD) + r(14, 6, 3, 6, 1, BRD);
ICONS.synthstrings = kb("#EC4899") + S("M5 20 L42 3", WD, 2.6) + S("M6.5 23 L42 7.5", CR, 1.2) + r(3, 18, 6, 6, 1.5, BK) + c(42.5, 4, 2, WDK) +
  S("M14 22 q2 3 0 4 M30 15 q2 3 0 4", "#FFE680", 1.4);
ICONS.robot = S("M24 9 V3", SVD, 2) + c(24, 3, 2.8, RED) + r(4, 18, 5, 10, 2, SVD) + r(39, 18, 5, 10, 2, SVD) +
  r(8, 9, 32, 28, 6, SV) + r(12, 14, 9, 8, 2.5, "#3d3850") + r(27, 14, 9, 8, 2.5, "#3d3850") + c(16.5, 18, 2.5, "#7DF9FF") + c(31.5, 18, 2.5, "#7DF9FF") +
  r(14, 27, 20, 6, 2, "#3d3850") + map(4, function (i) { return r(17 + i * 4.3, 28, 1.6, 4, 0.5, "#FFE680"); }) + r(18, 37, 12, 6, 2, SVD);
ICONS.voice = P("M24 6 H42 Q46 6 46 10 V20 Q46 24 42 24 H32 L26 29 L28 24 H24 Q20 24 20 20 V10 Q20 6 24 6 Z", W) +
  c(30, 18.5, 2.6, "#7C3AED") + r(31.6, 9, 1.8, 10, 0.6, "#7C3AED") + P("M31.6 9 Q37 10 38 15 Q35 12 33.4 12.5 Z", "#7C3AED") +
  E(15, 33, 12, 11, "#F2667B") + E(15, 33, 7, 6.5, "#5a1a1e") + E(15, 36.5, 4.5, 2.6, "#E5484D") + P("M9 25 Q15 22 21 25 Q15 27 9 25 Z", "#FF9AA8");
ICONS.chip = r(2, 14, 44, 22, 7, SV) + r(5, 17, 38, 16, 5, "#3d3850") +
  r(11, 19, 4, 12, 1, SV) + r(7, 23, 12, 4, 1, SV) + c(31, 27, 3, RED) + c(38, 22, 3, RED) + r(20, 23, 3, 1.8, 0.9, SVD) + r(25, 23, 3, 1.8, 0.9, SVD) +
  map(4, function (i) { return r(15 + i * 5, 3 + (i % 2) * 3, 4, 4, 0, ["#FFE680", "#7DF9FF", "#FF8FC7", "#A3E635"][i]); });
ICONS.warmpad = c(31, 15, 9, BRL) + map(7, function (i) { var a = -Math.PI * 0.95 + i * Math.PI * 0.32; return S("M" + (31 + 11.5 * Math.cos(a)).toFixed(1) + " " + (15 + 11.5 * Math.sin(a)).toFixed(1) + " L" + (31 + 15 * Math.cos(a)).toFixed(1) + " " + (15 + 15 * Math.sin(a)).toFixed(1), BRL, 2.2); }) +
  P("M10 41 Q2 41 3 34 Q4 27 12 28 Q13 19 22 19 Q30 19 32 26 Q38 24 42 29 Q47 34 42 39 Q40 41 37 41 Z", "#FFD9B0") +
  P("M10 41 Q4 41 3.5 36 Q16 39 30 36 Q40 34 45.5 33 Q46 39 40 41 Z", "#F7B98B");
ICONS.polysynth = r(2, 6, 44, 38, 4, WL) + r(6, 8, 36, 19, 2, BK) +
  map(10, function (i) { var x = 10 + (i % 5) * 7, y = i < 5 ? 13 : 21.5; return c(x, y, 2.6, ["#FFE680", RED, "#7DF9FF", "#A3E635", W][(i + (i < 5 ? 0 : 2)) % 5]); }) +
  r(6, 29, 36, 12, 1, W) + blacks(6, 29, 0, 8, 4.5, 7);
ICONS.halo = E(24, 26, 20, 11, "#FFE68033") + E(24, 26, 15, 7, "#FFE68044") +
  '<ellipse cx="24" cy="18" rx="15" ry="6" fill="none" stroke="#F5B841" stroke-width="4.2"/><ellipse cx="24" cy="18" rx="15" ry="6" fill="none" stroke="#FFF3B0" stroke-width="1.4"/>' +
  S("M24 3 V7 M8 6 L11 9 M40 6 L37 9 M3 18 H6 M42 18 H45", "#FFE680", 2) + spark(13, 37, 4, "#FFE680") + spark(35, 39, 5, W) + spark(24, 33, 2.6, "#FFE680");
ICONS.sweep = r(3, 6, 42, 36, 8, "#0EA5E9") + r(6, 9, 36, 30, 6, "#0369A1") +
  P("M8 22 H22 Q29 22 31 13 Q34 24 37 36 H8 Z", "#38BDF866") + S("M8 22 H22 Q29 22 31 13 Q34 24 37 36", "#FFE680", 3) +
  S("M12 32 H24 M21 29 L24.5 32 L21 35", W, 2.2);
ICONS.crystal = P("M13 7 H35 L44 18 L24 43 L4 18 Z", "#38BDF8") + P("M13 7 H35 L31 18 H17 Z", "#A5E8FF") + P("M4 18 H17 L24 43 Z", "#7DD3FC") +
  P("M31 18 H44 L24 43 Z", "#0EA5E9") + P("M13 7 L17 18 H4 Z", "#7DD3FC") + P("M35 7 L44 18 H31 Z", "#38BDF8") + spark(39, 5, 4, W) + spark(9, 33, 3, W);
ICONS.echoes = P("M1 43 L17 13 L25 26 L31 18 L47 43 Z", "#7C8DB5") + P("M17 13 L22 22.5 L19 21 L16 24 L13 20.5 Z", W) + P("M31 18 L35 24 L32 23 L29 24.5 Z", W) +
  S("M26 8 Q30 4 34 8 M22 6 Q30 -2 38 6 M18 4 Q30 -8 42 4", "#7DF9FF", 2) + P("M1 43 L10 30 L16 36 L22 32 L30 43 Z", "#5A6A92");
ICONS.scifi = P("M14 30 L6 46 H42 L34 30 Z", "#7DF9FF44") + E(24, 18, 9, 8.5, "#7DF9FF") + E(21, 14.5, 3, 2, "#E0FDFF", -25) +
  E(24, 23, 21, 6.5, SV) + E(24, 25.5, 14, 3.4, SVD) + c(10, 23.5, 1.8, "#FFE680") + c(18, 26, 1.8, "#FF8FC7") + c(30, 26, 1.8, "#FFE680") + c(38, 23.5, 1.8, "#FF8FC7") +
  spark(5, 6, 3, W) + spark(42, 8, 2.4, W);

// ================= BASS =================
ICONS["808"] = r(9, 2, 30, 44, 4, GREY) + r(10.5, 3.5, 27, 41, 3, "#5b5577") + spk(24, 12, 5.5) + spk(24, 31, 11.5);
ICONS.boom808 = S("M8 13 A15 15 0 0 0 8 35 M3 9 A20 20 0 0 0 3 39 M40 13 A15 15 0 0 1 40 35 M45 9 A20 20 0 0 1 45 39", "#FFE680", 2.6) + spk(24, 24, 13);
ICONS.punch808 = spk(18, 29, 15) + star(36, 12, 8, 12, 5.5, RED) + star(36, 12, 8, 7, 3.2, "#FFE680");
ICONS.growl808 = spk(16, 29, 14) + S("M22 10 L26 3 L29 12 L33 4 L36 13 L40 5 L43 14 L46 8", "#A3E635", 3);
ICONS.slide808 = spk(16, 30, 14) + S("M26 5 Q36 5 40 17", "#7DF9FF", 3.2) + P("M35.5 16 L44 24 L45 12.5 Z", "#7DF9FF");
ICONS.synthbass = kb("#7C3AED") + S("M3 15 C9 2 15 2 21 15 S33 28 39 15 S44 8 46 10", "#7DF9FF", 3.6);
ICONS.ebass = G(about(42, 0.95), bass(RED, WL, 1));
ICONS.slapbass = G(about(42, 0.95), bass("#3B82F6", WL, 1)) + star(37, 34, 7, 10, 4.5, "#FFE680") + star(37, 34, 7, 5, 2.4, W);
ICONS.fretless = G(about(42, 0.95), bass("#1F9D8B", "#3b2a1a", 0));
ICONS.doublebass = '<line x1="24" y1="42" x2="24" y2="48" stroke="#9AA3AF" stroke-width="1.8"/>' +
  P("M24 14 C19 14 17 18 18 22 C12 24 10 32 12 37 C14 44 34 44 36 37 C38 32 36 24 30 22 C31 18 29 14 24 14 Z", "#8B4513") +
  r(22.5, 1, 3, 20, 1, "#3b2a1a") + c(24, 2.5, 2.4, "#3b2a1a") + S("M18.5 27 q-1 3.5 0 7 M29.5 27 q1 3.5 0 7", "#3b2a1a", 1.2) +
  r(21.5, 34, 5, 1.8, 0.6, "#3b2a1a") + '<path d="M23 18 V34 M25 18 V34" stroke="#F4EBD9" stroke-width=".6"/>' + S("M4 36 L44 22", "#E8C07A", 2) + S("M5 38.5 L44 25", CR, 0.9) + r(2, 34, 4, 5, 1, BK);

// ================= BAND =================
ICONS.guitar = G(about(42, 0.95),
  P("M24 21 C17 21 15 26 17 30 C12 32 11 40 15 44 C19 49 29 49 33 44 C37 40 36 32 31 30 C33 26 31 21 24 21 Z", "#E8A84F") +
  c(24, 31, 3.6, "#3b2a1a") + r(21, 39, 6, 2, 0.6, "#3b2a1a") + r(22.2, -3, 3.6, 30, 1, WDK) + r(21, -9, 6, 7, 1.5, "#3b2a1a") +
  '<path d="M22.9 -5 V40 M23.6 -5 V40 M24.4 -5 V40 M25.1 -5 V40" stroke="#F4EBD9" stroke-width=".4"/>');
ICONS.eguitar = S("M12 37 C8 41 2 38 4 44 C5 47 9 46 9 43 C9 40 4 40 2 47", "#A3E635", 1.8) + G(about(42, 0.95), eg(RED, W));
ICONS.rockguitar = G(about(42, 0.95),
  P("M24 22 L11 49 L18 50 L24 39 L30 50 L37 49 Z", W) + P("M24 25 L13.5 47.5 L17.5 48 L24 35.5 L30.5 48 L34.5 47.5 Z", RED) +
  r(21.5, -3, 5, 32, 1, WL) + P("M20 -10 L28 -4 L27 -2 H21 Z", BK) + r(20, 34, 8, 2, 0.8, BK) + map(5, function (i) { return r(21.5, 0 + i * 5, 5, 0.7, 0, SV); }) +
  '<path d="M22.6 -4 V40 M24 -4 V40 M25.4 -4 V40" stroke="#F4EBD9" stroke-width=".5"/>') +
  P("M38 2 L32 12 H37 L33 21 L43 9 H38 L42 2 Z", "#FFE680");
ICONS.distortion = S("M3 14 L9 4 L13 16 L19 2 L24 14 L29 4 L34 16 L39 5 L45 13", RED, 3) +
  r(5, 20, 38, 25, 3, BK) + r(7, 21.5, 34, 5, 1.5, "#D4A72C") + map(5, function (i) { return c(11 + i * 6.5, 24, 1.4, BK); }) +
  r(8, 28.5, 32, 14, 1.5, "#5b5577") + '<path d="M8 32 H40 M8 35.5 H40 M8 39 H40" stroke="#4a4560" stroke-width="1"/>' + r(18, 33, 12, 4, 1, W);
ICONS.banjo = G(about(40, 0.95),
  r(22.4, -6, 3.2, 34, 1, WD) + r(21, -11, 6, 7, 2, WDK) + c(26.5, 6, 1.4, CR) +
  c(24, 35, 13, SV) + c(24, 35, 10.5, CR) + r(21, 38, 6, 1.6, 0.5, WDK) + map(5, function (i) { var a = i * Math.PI * 0.4 - 1.57; return c((24 + 11.8 * Math.cos(a)).toFixed(1), (35 + 11.8 * Math.sin(a)).toFixed(1), 0.9, SVD); }) +
  '<path d="M23 -8 V44 M23.7 -8 V44 M24.3 -8 V44 M25 -8 V44" stroke="#8B7355" stroke-width=".4"/>' + r(21, 44, 6, 3, 1, SVD));
ICONS.harmonica = G("rotate(-12 24 24)",
  r(3, 13, 42, 8, 2.5, SV) + r(4, 20, 40, 9, 1, WD) + map(8, function (i) { return r(6 + i * 4.75, 21.5, 2.9, 6, 0.6, BK); }) +
  r(3, 28, 42, 8, 2.5, SV) + '<path d="M8 16 H40 M8 32.5 H40" stroke="#9AA3AF" stroke-width="1.2"/>') +
  S("M36 39 q3 2 6 0 M38 44 q2 1.5 4 0", "#7DF9FF", 1.6);
ICONS.sax = S("M5 4 Q14 2 19.5 10", BR, 3.2) + r(2, 2, 5, 3.4, 1.2, BK) +
  P("M17 9 L22 9 L24 33 Q24.5 38.5 28 38 Q30.5 37.5 30.5 33 L29.5 24 L42 18 L39.5 34 Q37 46 26 46 Q16.5 46 16 36 Z", BRL) +
  E(35.8, 20.8, 7.2, 2.6, BRD, -24) + E(35.8, 20.8, 5, 1.5, "#7a5208", -24) +
  map(5, function (i) { return c(19.2 + i * 0.45, 14 + i * 4.6, 1.6, "#FFF3C4"); }) + r(15, 30, 3, 6, 1.5, BRD);
ICONS.trumpet = S("M10 30 H31 Q34 30 34 27", BR, 2.8) + r(1.5, 19.5, 4, 5, 1.5, SVD) +
  r(5, 20, 27, 4, 2, BR) + P("M30 19.5 L46 10 V34 L30 24.5 Z", BRL) + E(46, 22, 1.8, 12, BRD) +
  map(3, function (i) { var x = 14 + i * 5.5; return r(x, 11, 4, 22, 1, BRD) + r(x - 0.8, 7.5, 5.6, 3.5, 1.5, "#FFF3C4"); });
ICONS.steeldrums = S("M10 34 L6 46 M38 34 L42 46", GREY, 2.4) +
  P("M4 19 V30 Q24 42 44 30 V19 Z", "#2EC4B6") + E(24, 19, 20, 8.5, SV) + E(24, 19.5, 16.5, 6.2, "#E3E7EE") +
  E(17, 18, 3.6, 2.2, SVD) + E(29, 17, 3.6, 2.2, SVD) + E(23, 22.5, 3.4, 1.9, SVD) + E(24, 15, 2.6, 1.4, SVD) +
  S("M33 2 L40 13 M44 3 L41 13", "#E8C07A", 1.8) + c(32, 2.5, 2.6, RED) + c(44.5, 3, 2.6, RED);

// ================= ORCHESTRA =================
ICONS.violin = S("M5 7 L42 40", "#E8C07A", 2) + S("M7 9.5 L42.5 41", CR, 0.9) + r(3, 4, 4, 5, 1, BK) +
  G(about(-38, 0.95), bowed("#D9691E", 0) + E(28.5, 37, 3.6, 2, "#3b2a1a"));
ICONS.strings = G("translate(9 1) scale(.82)", bowed("#B5651D", 1)) +
  G("translate(13 17) rotate(-35) scale(.6) translate(-24 -24)", bowed("#E07B24", 0)) +
  S("M3 33 L18 4", "#E8C07A", 1.6) + S("M30 46 L46 18", "#E8C07A", 1.6);
ICONS.pizzicato = G("translate(-4 0)", bowed("#D9691E", 0)) +
  c(40, 9, 3, "#7DF9FF") + c(43, 19, 2.4, "#7DF9FF") + c(39.5, 28, 1.9, "#7DF9FF") + c(43, 36, 1.5, "#7DF9FF") +
  S("M28 22 Q33 18 35 12", "#7DF9FF", 1.4);
ICONS.oboe = G("rotate(-28 24 24)",
  P("M23.4 -1 H24.6 L25 5 H23 Z", "#E8C07A") + r(22.4, 4.5, 3.2, 2.5, 0.8, SV) + r(22.2, 6.5, 3.6, 34, 1.5, "#4A2E1A") +
  P("M21.8 39 H26.2 L27.6 46 H20.4 Z", "#4A2E1A") + r(21.8, 39, 4.4, 1.2, 0.5, SV) +
  S("M26.5 9 V37", SV, 0.9) + map(7, function (i) { return c(24, 10 + i * 4, 1, SV); }) + map(3, function (i) { return r(22, 13 + i * 10, 4.8, 1, 0.4, SV); }));
ICONS.orchhit = star(24, 24, 12, 23, 13, "#F97316") + star(24, 24, 12, 16, 9, "#FFE680") +
  G("rotate(-20 24 24)", r(11, 22.5, 18, 3, 1.5, BK) + P("M27 22 L37 16 V32 L27 26 Z", BK) + map(3, function (i) { return r(15 + i * 4, 18, 2.4, 6, 0.8, BK); }));

// ================= FUN & WORLD =================
ICONS.xylo = S("M5 12 L43 19 M5 38 L43 31", WD, 3) +
  map(7, function (i) { var x = 6 + i * 5.2, t = 9 + (x + 2 - 5) * 7 / 38, b = 41 - (x + 2 - 5) * 7 / 38; return r(x, t.toFixed(1), 4.4, (b - t).toFixed(1), 1.2, ["#E5484D", "#F97316", "#F5B841", "#A3E635", "#2EC4B6", "#3B82F6", "#B98CFF"][i]); }) +
  S("M45 2 L35 12", "#E8C07A", 2) + c(34, 13, 3.2, RED);
ICONS.kalimba = P("M9 7 H39 Q42 7 42.5 10 L45 41 Q45 45 41 45 H7 Q3 45 3 41 L5.5 10 Q6 7 9 7 Z", "#C68642") + c(24, 37, 4.2, "#3b2a1a") +
  map(9, function (i) { var top = 10 + Math.abs(i - 4) * 2.4; return r(10.6 + i * 3.2, top, 1.9, 27 - top, 0.9, i % 2 ? SVD : SV); }) +
  r(8, 22, 32, 2.6, 1, WDK) + r(8, 27, 32, 2.6, 1, SVD);
ICONS.bells = G("rotate(-18 24 24)",
  r(21.5, 1, 5, 12, 2.5, WD) + r(19.5, 12, 9, 3.5, 1.5, BRD) + P("M24 14 C15 14 15 23 14 31 L9 37 H39 L34 31 C33 23 33 14 24 14 Z", BRL) +
  r(8, 36, 32, 3.5, 1.7, BR) + c(24, 42, 3.2, BRD) + P("M19 18 Q17 25 17 31 L19.5 31 Q20 24 21.5 18 Z", "#FFE9A8")) +
  S("M41 30 q3 3 0 6 M44 27 q5 6 0 12", "#FFE680", 1.6);
ICONS.tubebells = r(3, 3, 42, 4, 1.5, WD) + S("M5 7 V45 M43 7 V45", WDK, 2.4) +
  map(5, function (i) { var x = 9 + i * 6.4; return r(x, 10, 4.6, 31 - i * 4.5, 2.3, i % 2 ? SVD : SV) + r(x - 0.4, 10, 5.4, 2.4, 1, BRD); });
ICONS.panflute = G("rotate(-10 24 24)",
  map(7, function (i) { var x = 5 + i * 5.4, h = 36 - i * 3.8; return r(x, 7, 4.8, h, 2, i % 2 ? "#D9B36C" : "#E8C88A") + E(x + 2.4, 8.4, 1.5, 0.9, "#6B4220"); }) +
  r(3, 18, 40, 4, 1, RED) + r(3, 18, 40, 1.2, 0.5, "#FF8C8F"));
ICONS.ocarina = r(1, 21, 10, 7, 2.5, "#B5562E") +
  P("M7 24 C7 13 20 9 30 11 C41 13 47 21 44 30 C41 38 30 40 20 38 C12 37 7 32 7 24 Z", "#D2693C") +
  P("M14 17 C19 12 28 11 34 13 C26 13 19 15 14 17 Z", "#F0A47E") + r(9, 22, 4, 2.5, 1, "#3b2a1a") +
  c(19, 22, 2, "#3b2a1a") + c(25, 20, 2, "#3b2a1a") + c(31, 20, 2, "#3b2a1a") + c(37, 23, 2, "#3b2a1a") + c(23, 30, 1.8, "#3b2a1a") + c(32, 30, 1.8, "#3b2a1a");
ICONS.whistle = S("M36 15 C42 8 46 14 42 20 C38 26 30 24 28 30", RED, 2) +
  c(29, 28, 12, SV) + c(29, 28, 7, SVD) + c(29, 28, 3, SV) + r(2, 15, 28, 10, 3, SV) + r(14, 13, 8, 3, 1, SVD) + S("M36 12 a3 3 0 1 1 0 6 a3 3 0 1 1 0 -6", SVD, 2) +
  S("M5 32 q-3 4 0 8 M10 36 q-2 3 0 6", "#7DF9FF", 1.8);
ICONS.woodblock = P("M7 36 C5 21 13 11 24 11 C35 11 43 21 41 36 Z", "#B5442B") + P("M9 28 Q24 35 39 28 L39 32 Q24 39 9 32 Z", "#2a0d0a") +
  P("M14 18 Q19 14 25 14 Q18 16 15 21 Z", "#D9725A") + r(4, 36, 40, 6, 2, WDK) + r(9, 42, 4, 4, 1, WDK) + r(35, 42, 4, 4, 1, WDK) +
  S("M45 2 L32 11", "#E8C07A", 2.6) + c(31, 12, 2.8, "#E8C07A");
ICONS.taiko = S("M11 37 L6 47 M37 37 L42 47 M9 42 H39", WDK, 2.6) +
  P("M8 13 Q3 25 8 38 H40 Q45 25 40 13 Z", "#B5442B") + E(24, 13, 16, 4.5, CR) + E(24, 38, 16, 2.6, "#8a2f1e") +
  map(8, function (i) { return c(10.5 + i * 3.85, 18.5, 0.9, BK) + c(10.5 + i * 3.85, 34, 0.9, BK); }) +
  c(24, 26, 4.8, BRL) + c(24, 26, 2, "#B5442B") +
  S("M6 2 L20 10 M42 2 L28 10", "#E8C07A", 2.4);
ICONS.koto = G("rotate(-38 24 24)", r(-2, 17, 52, 13, 4, "#C68642") + r(-2, 27, 52, 4, 2, "#9A5E2C") + r(-1, 18, 4, 11, 1.5, "#7A4A24") + r(45, 18, 4, 11, 1.5, "#7A4A24") +
  '<path d="M3 19.5 H45 M3 22 H45 M3 24.5 H45 M3 27 H45" stroke="#F4EBD9" stroke-width=".7"/>' +
  map(5, function (i) { var x = 9 + i * 7, y = [19.5, 22, 24.5, 27, 22][i]; return P("M" + (x - 2) + " " + (y + 1.8) + " L" + x + " " + (y - 1.6) + " L" + (x + 2) + " " + (y + 1.8) + " Z", W); }));
ICONS.sitar = G(about(40, 0.92),
  r(21.5, -10, 5, 46, 1.5, WD) + c(24, -9, 4, "#C77B30") + map(7, function (i) { return S("M21 " + (-4 + i * 4.4) + "q3 -1.5 6 0", SV, 0.9); }) +
  map(4, function (i) { return c(27.5, 6 + i * 5, 0.9, CR); }) +
  c(24, 41, 11, "#C77B30") + E(24, 37, 9, 7, "#E8A84F") + r(21, 41, 6, 2, 0.6, "#3b2a1a") +
  '<path d="M23 -6 V44 M24 -6 V44 M25 -6 V44" stroke="#4A2E1A" stroke-width=".4"/>');

// ---- tidy numbers and write ----
var ids = Object.keys(ICONS), out = "// Generated by tools/build-icons.js; do not edit by hand.\n// SVG inner markup for a 48x48 viewBox, one per instrument id.\nvar ICONS = {\n";
ids.forEach(function (id, i) {
  var s = ICONS[id].replace(/(\d+\.\d{3,})/g, function (m) { return String(+(+m).toFixed(2)); });
  out += "  " + JSON.stringify(id) + ": " + JSON.stringify(s) + (i < ids.length - 1 ? "," : "") + "\n";
});
out += "};\n";
fs.writeFileSync(path.join(__dirname, "instrument-icons.js"), out);
fs.writeFileSync(path.join(__dirname, "..", "assets", "js", "icons.js"), out);   // the copy the app loads
var big = ids.filter(function (id) { return ICONS[id].length > 1500; }).map(function (id) { return id + "=" + ICONS[id].length; });
console.log(ids.length + " icons written" + (big.length ? "; over 1.5 KB: " + big.join(", ") : ""));
