// ---- Concepts: quick games that pop up while he plays (and now and then in the other activities) ----
// Basic relational concepts (bigger/smaller, darker/lighter, closer/further, above/below, higher/lower...), taught the way
// speech and language therapists teach them (research/01..07, docs/CONCEPTS-TEACHING.md):
//   - one word of a pair first ("darker" vs not), then the other word, then both mixed; a concept is learned after that
//   - the first time a word comes, it is shown, not asked: the right one glows and he taps it (errorless start)
//   - every question is a new picture (other objects, colours, sizes), so the word is not stuck to one picture
//   - little and often: 2 questions at a natural pause in his playing, then straight back to the piano
//   - learned concepts come back later (Leitner boxes, spread over the next pop-ups), mixed with the new one
//   - a short movement card now and then (hands up high, touch the floor...), which also acts out the space words
// Uses voice, L, hey, diary, confetti-free; plays notes through window.pianoPlayNote (index.html). Progress: localStorage conceptProg.
var concepts = (function () {
  var $ = function (id) { return document.getElementById(id); };
  function rnd(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
  function pick(a) { return a[rnd(0, a.length - 1)]; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = rnd(0, i), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function es() { return voice.cfg.lang === "es"; }
  function W(w) { return es() ? w[1] : w[0]; }

  // ---- Drawing helpers: every picture is an SVG card 240 x 180 ----
  var VB = '<svg viewBox="0 0 240 180" class="ccsvg" aria-hidden="true">';
  function emo(ch, x, y, size, extra) { return '<text x="' + x + '" y="' + y + '" font-size="' + size + '" text-anchor="middle" dominant-baseline="central"' + (extra || "") + ">" + ch + "</text>"; }
  function hsl(h, s, l) { return "hsl(" + h + "," + s + "%," + l + "%)"; }
  var SHAPES = {                                            // plain shapes centred on (0,0), about 100 px across
    ball: function (f) { return '<circle r="48" fill="' + f + '" stroke="#1e1b2e" stroke-width="4"/>'; },
    heart: function (f) { return '<path d="M0 40 C-60 0 -45 -45 0 -20 C45 -45 60 0 0 40z" fill="' + f + '" stroke="#1e1b2e" stroke-width="4"/>'; },
    star: function (f) { return '<path d="M0 -50 L14 -16 L50 -15 L22 8 L31 44 L0 24 L-31 44 L-22 8 L-50 -15 L-14 -16z" fill="' + f + '" stroke="#1e1b2e" stroke-width="4" stroke-linejoin="round"/>'; },
    square: function (f) { return '<rect x="-44" y="-44" width="88" height="88" rx="12" fill="' + f + '" stroke="#1e1b2e" stroke-width="4"/>'; },
    shirt: function (f) { return '<path d="M-20 -46 L-50 -30 L-42 -8 L-30 -14 L-30 46 L30 46 L30 -14 L42 -8 L50 -30 L20 -46 Q0 -32 -20 -46z" fill="' + f + '" stroke="#1e1b2e" stroke-width="4" stroke-linejoin="round"/>'; },
    leaf: function (f) { return '<path d="M-44 40 Q-50 -40 44 -44 Q40 40 -44 40z" fill="' + f + '" stroke="#1e1b2e" stroke-width="4"/><path d="M-40 36 L30 -30" stroke="#1e1b2e" stroke-width="3"/>'; }
  };
  var HUES = [0, 30, 120, 200, 260, 320];
  var THINGS = ["🐶", "🐱", "🐻", "🐸", "🦊", "🐰", "🐷", "🐵", "🦁", "🐼", "🐨", "🐯"];
  var NAME = { "🐶": ["dog", "el perro"], "🐱": ["cat", "el gato"], "🐻": ["bear", "el oso"], "🐸": ["frog", "la rana"], "🦊": ["fox", "el zorro"],
    "🐰": ["rabbit", "el conejo"], "🐷": ["pig", "el cerdo"], "🐵": ["monkey", "el mono"], "🦁": ["lion", "el león"], "🐼": ["panda", "el panda"],
    "🐨": ["koala", "el koala"], "🐯": ["tiger", "el tigre"] };
  var COLS = [["red", "roja", "#e53935"], ["blue", "azul", "#1e88e5"], ["green", "verde", "#43a047"], ["yellow", "amarilla", "#fdd835"], ["purple", "morada", "#8e24aa"]]   // no orange: that is HIS colour in mine/ours;
  var TOYS = ["⚽", "🍎", "🎈", "🚗", "⭐", "🍓", "🧸", "🎁", "🍩", "🌼"];
  function card(inner, bg) { return VB + '<rect width="240" height="180" rx="18" fill="' + (bg || "#fffdf5") + '"/>' + inner + "</svg>"; }

  // ---- The concepts: a pair of words, how to draw one question, why (in school words) ----
  // gen(side) draws a question for word[side]; returns { opts: [svg, svg], ans: index } or a scene / sound question.
  function two(side, mk) {                                  // two cards; mk(isTarget) draws one; the target is word[side]
    var t = rnd(0, 1), o = [mk(true), mk(false)];
    return { opts: t ? [o[1], o[0]] : o, ans: t };
  }
  var C = [                                                 // teaching order: research/07 units (size, sounds, position, order, measures; darker/lighter is Y3, last)
    { id: "size", cat: "size", w: [["bigger", "más grande"], ["smaller", "más pequeño"]],
      why: [["It takes up more space.", "Ocupa más espacio."], ["It takes up less space.", "Ocupa menos espacio."]],
      gen: function (side) { var e = pick(THINGS.concat(TOYS)), big = rnd(96, 120), sm = rnd(40, 54);
        return two(side, function (tg) { var s = (tg === (side === 0)) ? big : sm; return card(emo(e, 120, 92, s)); }); } },
    { id: "loud", cat: "sound", sound: true, w: [["louder", "más fuerte"], ["quieter", "más suave"]],
      why: [["We pressed the key hard, so it was louder.", "Tocamos la tecla fuerte, así que sonó más fuerte."], ["We pressed the key gently, so it was quieter.", "Tocamos la tecla suave, así que sonó más bajito."]],
      gen: function (side) { var m = rnd(55, 72), t = rnd(0, 1), v = [0, 0]; v[t] = side === 0 ? 1 : 0.18; v[1 - t] = side === 0 ? 0.18 : 1;
        return { sound: [[m, v[0], 700], [m, v[1], 700]], ans: t }; } },
    { id: "long", cat: "size", w: [["longer", "más largo"], ["shorter", "más corto"]],
      why: [["Start them at the same place: it goes further along.", "Empiezan en el mismo sitio: llega más lejos."], ["Start them at the same place: it stops sooner.", "Empiezan en el mismo sitio: se acaba antes."]],
      gen: function (side) { var h = pick(HUES), lo = rnd(70, 95), hi = rnd(180, 205), kind = rnd(0, 1);
        return two(side, function (tg) { var len = (tg === (side === 0)) ? hi : lo;
          var g = kind ? '<rect x="20" y="78" width="' + (len - 22) + '" height="24" rx="4" fill="' + hsl(h, 80, 60) + '" stroke="#1e1b2e" stroke-width="3"/><path d="M' + (len - 2) + ' 78 L' + (len + 16) + ' 90 L' + (len - 2) + ' 102z" fill="#f5d0a0" stroke="#1e1b2e" stroke-width="3"/>'   // pencil
            : '<path d="M20 90 Q' + (20 + len / 4) + ' 60 ' + (20 + len / 2) + ' 90 T' + (20 + len) + ' 90" fill="none" stroke="' + hsl(h, 70, 50) + '" stroke-width="16" stroke-linecap="round"/>';   // snake / rope
          return card('<line x1="18" y1="40" x2="18" y2="140" stroke="#bbb" stroke-width="2" stroke-dasharray="5 5"/>' + g); }); } },
    { id: "high", cat: "sound", sound: true, w: [["higher", "más agudo"], ["lower", "más grave"]],
      why: [["High notes are tiny, like a bird. They live on the right of the piano.", "Las notas agudas son finitas, como un pájaro. Están a la derecha del piano."], ["Low notes are big, like a bear. They live on the left of the piano.", "Las notas graves son gordas, como un oso. Están a la izquierda del piano."]],
      gen: function (side) { var lo = rnd(43, 55), hi = lo + rnd(12, 19), t = rnd(0, 1), n = [0, 0]; n[t] = side === 0 ? hi : lo; n[1 - t] = side === 0 ? lo : hi;
        return { sound: [[n[0], 0.8, 800], [n[1], 0.8, 800]], ans: t }; } },
    { id: "tall", cat: "size", w: [["taller", "más alto"], ["shorter", "más bajo"]],
      why: [["It goes higher up.", "Llega más arriba."], ["It does not go as high.", "No llega tan arriba."]],
      gen: function (side) { var h = pick(HUES), lo = rnd(2, 3), hi = rnd(5, 6);
        return two(side, function (tg) { var n = (tg === (side === 0)) ? hi : lo, s = "";
          for (var i = 0; i < n; i++) s += '<rect x="96" y="' + (150 - (i + 1) * 22) + '" width="48" height="22" rx="3" fill="' + hsl(h + i * 25, 75, 60) + '" stroke="#1e1b2e" stroke-width="3"/>';
          return card('<line x1="30" y1="150" x2="210" y2="150" stroke="#6b5" stroke-width="5"/>' + s); }); } },
    { id: "full", cat: "quantity", w: [["full", "lleno"], ["empty", "vacío"]],
      why: [["It has as much water as it can hold.", "Tiene toda el agua que cabe."], ["There is nothing in it.", "No tiene nada dentro."]],
      gen: function (side) {
        return two(side, function (tg) { var lvl = (tg === (side === 0)) ? 0.9 : 0, top = 150 - lvl * 110;
          return card('<path d="M80 35 L90 150 L150 150 L160 35" fill="#e8f6ff" stroke="#1e1b2e" stroke-width="4"/>' +
            (lvl ? '<path d="M' + (80 + (1 - lvl) * 10) + ' ' + top + ' L90 150 L150 150 L' + (160 - (1 - lvl) * 10) + ' ' + top + 'z" fill="#5ab8f0"/>' : "") +
            '<path d="M80 35 L90 150 L150 150 L160 35" fill="none" stroke="#1e1b2e" stroke-width="4"/>'); }); } },
    { id: "heavy", cat: "quantity", scene: true, w: [["heavier", "más pesado"], ["lighter", "más ligero"]],
      why: [["The heavy side goes down.", "El lado pesado baja."], ["The light side goes up.", "El lado ligero sube."]],
      gen: function (side) {                                // research 08 #7: two IDENTICAL boxes on an equal-arm see-saw; only the tilt tells
        var hvLeft = rnd(0, 1), h = pick(HUES), yL = hvLeft ? 112 : 58, yR = hvLeft ? 58 : 112;
        var s = VB + '<rect width="240" height="180" rx="18" fill="#fffdf5"/>' +
          '<path d="M120 112 L100 166 L140 166z" fill="#b08a5a" stroke="#1e1b2e" stroke-width="3"/>' +
          '<line x1="30" y1="' + (yL + 26) + '" x2="210" y2="' + (yR + 26) + '" stroke="#1e1b2e" stroke-width="6" stroke-linecap="round"/>';
        function box(x, y) { return '<rect x="' + (x - 24) + '" y="' + (y - 22) + '" width="48" height="44" rx="6" fill="' + hsl(h, 55, 62) + '" stroke="#1e1b2e" stroke-width="4"/><path d="M' + (x - 24) + ' ' + (y - 8) + ' H' + (x + 24) + '" stroke="#1e1b2e" stroke-width="3"/>'; }
        s += '<g class="ccopt" data-i="0">' + box(50, yL) + "</g>" + '<g class="ccopt" data-i="1">' + box(190, yR) + "</g>";
        var heavyIdx = hvLeft ? 0 : 1;
        return { scene: s + "</svg>", ans: side === 0 ? heavyIdx : 1 - heavyIdx }; } },
    { id: "near", cat: "position", w: [["closer to the house", "más cerca de la casa"], ["further from the house", "más lejos de la casa"]], ask: true,
      why: [["It is only a few steps from the house.", "Está a pocos pasos de la casa."], ["It has a long way to walk to the house.", "Tiene que andar mucho hasta la casa."]],
      gen: function (side) { var a = pick(THINGS);
        return two(side, function (tg) { var x = (tg === (side === 0)) ? 92 : 205;
          return card('<line x1="10" y1="140" x2="230" y2="140" stroke="#6b5" stroke-width="5"/>' + emo("🏠", 40, 110, 62) + emo(a, x, 118, 40, ' transform="translate(' + (2 * x) + ',0) scale(-1,1)"')); }); } },
    { id: "far", cat: "position", scene: true, w: [["near you", "cerca de ti"], ["far away", "lejos"]],
      why: [["It is close to your feet: big, low down, in front.", "Está junto a tus pies: grande, abajo, delante."], ["It is a long way up the road: small, high up, a bit hidden.", "Está lejos en el camino: pequeño, arriba, un poco tapado."]],
      gen: function (side) {                                // research 08 #9: a road from YOUR feet; far = higher AND smaller AND partly hidden (never size alone)
        var a = pick(THINGS), nearLeft = rnd(0, 1), xn = nearLeft ? 82 : 158, xf = nearLeft ? 150 : 92;
        var s = VB + '<rect width="240" height="180" rx="18" fill="#cdeefd"/><rect y="62" width="240" height="118" fill="#bfe6a0"/>' +
          '<path d="M96 180 L114 62 L126 62 L144 180z" fill="#e6d3b0"/>' + emo("👣", 120, 166, 22);
        s += '<g class="ccopt" data-i="' + (side === 0 ? 0 : 1) + '">' + emo(a, xn, 128, 58) + "</g>";
        s += '<g class="ccopt" data-i="' + (side === 0 ? 1 : 0) + '">' + emo(a, xf, 70, 26) + "</g>";
        s += '<path d="M' + (xf - 24) + ' 78 h48" stroke="#7cb35a" stroke-width="12" stroke-linecap="round"/>';   // a hedge hides its feet
        return { scene: s + "</svg>", ans: 0, say: side === 0 ? ["Your feet are at the bottom. Tap the one that is near you.", "Tus pies están abajo. Toca el que está cerca de ti."] : ["Your feet are at the bottom. Tap the one that is far away.", "Tus pies están abajo. Toca el que está lejos."] }; } },
    { id: "above", cat: "position", w: [["above the shelf", "encima de la estantería"], ["below the shelf", "debajo de la estantería"]], ask: true,
      why: [["Above means higher up than the shelf.", "Encima es más arriba que la estantería."], ["Below means lower down than the shelf.", "Debajo es más abajo que la estantería."]],
      gen: function (side) { var a = pick(TOYS);
        return two(side, function (tg) { var y = (tg === (side === 0)) ? 54 : 132;
          return card('<rect x="30" y="86" width="180" height="12" rx="3" fill="#b08a5a" stroke="#1e1b2e" stroke-width="3"/>' + emo(a, 120, y, 50)); }); } },
    { id: "inside", cat: "position", w: [["inside the box", "dentro de la caja"], ["outside the box", "fuera de la caja"]], ask: true,
      why: [["It is in the box, the box is all around it.", "Está en la caja, la caja lo rodea."], ["It is out of the box.", "Está fuera de la caja."]],
      gen: function (side) { var a = pick(TOYS);
        return two(side, function (tg) { var inn = tg === (side === 0);
          return card('<path d="M60 60 L60 150 L180 150 L180 60" fill="#f3d3a6" stroke="#1e1b2e" stroke-width="4"/>' + emo(a, inn ? 120 : 214, inn ? 112 : 128, inn ? 48 : 40) + '<path d="M60 60 L60 150 L180 150 L180 60" fill="none" stroke="#1e1b2e" stroke-width="4"/>'); }); } },
    { id: "front", cat: "position", w: [["in front of the house", "delante de la casa"], ["behind the house", "detrás de la casa"]], ask: true,
      why: [["We can see all of it, the house is behind it.", "Lo vemos entero, la casa queda detrás."], ["The house hides part of it.", "La casa tapa una parte."]],
      gen: function (side) { var a = pick(THINGS);          // research 08 #12: an anchor WITH a front (door), the behind one >= 40 % hidden
        var house = '<path d="M60 92 L120 46 L180 92z" fill="#e8705a" stroke="#1e1b2e" stroke-width="4" stroke-linejoin="round"/><rect x="70" y="90" width="100" height="62" fill="#f6e3b4" stroke="#1e1b2e" stroke-width="4"/><rect x="108" y="114" width="24" height="38" rx="3" fill="#8a5a3a" stroke="#1e1b2e" stroke-width="3"/>';
        return two(side, function (tg) { var front = tg === (side === 0);
          return card('<line x1="10" y1="152" x2="230" y2="152" stroke="#6b5" stroke-width="5"/>' + (front ? house + emo(a, 152, 140, 50) : emo(a, 174, 108, 48) + house)); }); } },
    { id: "between", cat: "position", scene: true, w: [["between", "en medio"], ["at the end", "en la punta"]], one: true,
      why: [["It has one friend on each side.", "Tiene un amigo a cada lado."], ["It has a friend on only one side.", "Tiene un amigo solo a un lado."]],
      gen: function (side) { var an = shuffle(THINGS.slice()).slice(0, 4), k = rnd(1, 2), s = VB + '<rect width="240" height="180" rx="18" fill="#fffdf5"/>';
        for (var i = 0; i < 4; i++) s += '<g class="ccopt" data-i="' + i + '">' + emo(an[i], 33 + i * 58, 96, 46) + "</g>";
        return { scene: s + "</svg>", ans: k, say: ["Tap the one between the " + NAME[an[k - 1]][0] + " and the " + NAME[an[k + 1]][0] + ".", "Toca el que está entre " + NAME[an[k - 1]][1] + " y " + NAME[an[k + 1]][1] + "."] }; } },
    { id: "first", cat: "order", scene: true, w: [["first", "el primero"], ["last", "el último"]],
      why: [["It is at the front, nearest the flag.", "Va delante, más cerca de la bandera."], ["It is at the back, furthest from the flag.", "Va detrás, más lejos de la bandera."]],
      gen: function (side) { var an = shuffle(THINGS.slice()).slice(0, 4), s = VB + '<rect width="240" height="180" rx="18" fill="#fffdf5"/><line x1="8" y1="128" x2="232" y2="128" stroke="#6b5" stroke-width="5"/>' + emo("🚩", 218, 92, 40);
        for (var i = 0; i < 4; i++) { var x = 30 + i * 46; s += '<g class="ccopt" data-i="' + i + '">' + emo(an[i], x, 106, 38, ' transform="translate(' + (2 * x) + ',0) scale(-1,1)"') + "</g>"; }   // all walk to the flag
        return { scene: s + "</svg>", ans: side === 0 ? 3 : 0 }; } },
    { id: "fast", cat: "movement", w: [["faster", "más rápido"], ["slower", "más lento"]],
      why: [["It gets there sooner.", "Llega antes."], ["It takes longer to get there.", "Tarda más en llegar."]],
      gen: function (side) { var v = pick(["🚗", "🚌", "🚲", "🐢", "🐌", "🚂"]);
        return two(side, function (tg) { var dur = (tg === (side === 0)) ? 1.2 : 4.2;
          return card('<line x1="10" y1="130" x2="230" y2="130" stroke="#999" stroke-width="4"/><g>' + emo(v, 0, 104, 44, ' transform="scale(-1,1)"') +
            '<animateTransform attributeName="transform" type="translate" from="40 0" to="215 0" dur="' + dur + 's" repeatCount="indefinite"/></g>'); }); } },
    { id: "longsnd", cat: "sound", sound: true, w: [["longer", "más largo"], ["shorter", "más corto"]],
      why: [["It kept ringing for longer.", "Siguió sonando más tiempo."], ["It stopped quickly.", "Se paró enseguida."]],
      gen: function (side) { var m = rnd(55, 70), t = rnd(0, 1), d = [0, 0]; d[t] = side === 0 ? 1800 : 220; d[1 - t] = side === 0 ? 220 : 1800;
        return { sound: [[m, 0.8, d[0]], [m, 0.8, d[1]]], ans: t }; } },
    { id: "thick", cat: "size", w: [["thicker", "más grueso"], ["thinner", "más fino"]],
      why: [["It is fatter from side to side.", "Es más gordo de lado a lado."], ["It is slimmer from side to side.", "Es más delgado de lado a lado."]],
      gen: function (side) { var h = pick(HUES);
        return two(side, function (tg) { var t = (tg === (side === 0)) ? rnd(56, 70) : rnd(10, 16);
          return card('<rect x="' + (120 - t / 2) + '" y="30" width="' + t + '" height="120" rx="5" fill="' + hsl(h, 70, 58) + '" stroke="#1e1b2e" stroke-width="3"/>'); }); } },
    { id: "wide", cat: "size", w: [["wider", "más ancho"], ["narrower", "más estrecho"]],
      why: [["It is bigger from side to side.", "Es más grande de lado a lado."], ["It is smaller from side to side.", "Es más pequeño de lado a lado."]],
      gen: function (side) { var h = pick(HUES);
        return two(side, function (tg) { var w = (tg === (side === 0)) ? rnd(150, 180) : rnd(46, 60);
          return card('<rect x="' + (120 - w / 2) + '" y="40" width="' + w + '" height="110" rx="8" fill="' + hsl(h, 60, 62) + '" stroke="#1e1b2e" stroke-width="4"/><circle cx="' + (120 + w / 2 - 14) + '" cy="98" r="5" fill="#1e1b2e"/>'); }); } },
    { id: "hot", cat: "sense", w: [["hot", "caliente"], ["cold", "frío"]],
      why: [["Steam is rising: it is hot.", "Sale vapor: está caliente."], ["Ice cubes and frost: it is cold.", "Cubitos de hielo y escarcha: está frío."]],
      gen: function (side) { var h = pick(HUES);              // the SAME mug on both cards; only steam vs ice changes
        var mug = '<rect x="78" y="70" width="76" height="80" rx="10" fill="' + hsl(h, 60, 62) + '" stroke="#1e1b2e" stroke-width="4"/><path d="M154 86 q26 0 26 22 q0 22 -26 22" fill="none" stroke="#1e1b2e" stroke-width="7"/>';
        return two(side, function (tg) { var hot = tg === (side === 0);
          var top = hot ? '<path d="M98 60 q-10 -14 0 -26 q10 -12 0 -24 M118 60 q-10 -14 0 -26 q10 -12 0 -24 M138 60 q-10 -14 0 -26 q10 -12 0 -24" fill="none" stroke="#9aa3ad" stroke-width="5" stroke-linecap="round"/>'
            : '<rect x="88" y="54" width="22" height="22" rx="4" fill="#dff4ff" stroke="#5aa9d6" stroke-width="3" transform="rotate(-12 99 65)"/><rect x="118" y="52" width="22" height="22" rx="4" fill="#dff4ff" stroke="#5aa9d6" stroke-width="3" transform="rotate(10 129 63)"/>' +
              '<path d="M84 100 l6 6 m-6 0 l6 -6 M146 120 l6 6 m-6 0 l6 -6 M100 136 l5 5 m-5 0 l5 -5" stroke="#8fd3ff" stroke-width="3"/>';
          return card(top + mug); }); } },
    { id: "dark", cat: "colour", w: [["darker", "más oscuro"], ["lighter", "más claro"]],
      why: [["It has more black in it, like the sky at night.", "Tiene más negro, como el cielo de noche."], ["It has more white in it, like the sky in the day.", "Tiene más blanco, como el cielo de día."]],
      gen: function (side) { var h = pick(HUES), sh = SHAPES[pick(Object.keys(SHAPES))], d = rnd(24, 32), l = rnd(70, 80);
        return two(side, function (tg) { return card('<g transform="translate(120,90)">' + sh(hsl(h, 70, (tg === (side === 0)) ? d : l)) + "</g>"); }); } },
    { id: "bright", cat: "colour", w: [["brighter", "más brillante"], ["dimmer", "más apagada"]],
      why: [["It shines more light: a big glow, lots of light on the floor.", "Da más luz: un brillo grande, mucha luz en el suelo."], ["It shines less light: a small glow.", "Da menos luz: un brillo pequeño."]],
      gen: function (side) {                                // both lamps ON (it was on vs off); halo, rays and floor patch >= 2:1
        return two(side, function (tg) { var hi = tg === (side === 0), r = hi ? 64 : 26, n = hi ? 12 : 0, rays = "";
          for (var i = 0; i < n; i++) { var an = i * Math.PI / 6; rays += '<line x1="' + (120 + Math.cos(an) * 44) + '" y1="' + (70 + Math.sin(an) * 44) + '" x2="' + (120 + Math.cos(an) * 66) + '" y2="' + (70 + Math.sin(an) * 66) + '" stroke="#ffe066" stroke-width="5" stroke-linecap="round"/>'; }
          return card('<ellipse cx="120" cy="160" rx="' + (hi ? 92 : 34) + '" ry="' + (hi ? 16 : 7) + '" fill="' + (hi ? "#ffe06699" : "#ffe06644") + '"/>' +
            '<circle cx="120" cy="70" r="' + r + '" fill="#ffe066' + (hi ? "66" : "33") + '"/>' + rays +
            '<circle cx="120" cy="70" r="30" fill="' + (hi ? "#fff6a8" : "#e8d27a") + '" stroke="#1e1b2e" stroke-width="4"/><rect x="106" y="98" width="28" height="22" rx="5" fill="#9aa" stroke="#1e1b2e" stroke-width="4"/><line x1="120" y1="120" x2="120" y2="158" stroke="#1e1b2e" stroke-width="5"/>', "#1d1a3a"); }); } },
    // ---- whose is it? (research 08 #23-26). "mine" is only ever said by the OWL, shown speaking; "you" = the bottom of the screen ----
    { id: "whose", cat: "owner", scene: true, w: [["whose? (the owner)", "¿de quién? (el dueño)"], ["the cat's (its thing)", "el del gato (su cosa)"]],
      why: [["The owner stands on the same colour as the thing.", "El dueño está sobre el mismo color que la cosa."], ["The thing in the animal's colour belongs to it.", "La cosa del color del animal es suya."]],
      gen: function (side) {                                // research 08 #26: ownership without a pronoun; owner colour = mat under the animal + the thing's colour
        var an = shuffle(THINGS.slice()).slice(0, 2), cs = shuffle(COLS.slice()).slice(0, 2), it = pick(["ball", "star"]), q = rnd(0, 1);
        var s = VB + '<rect width="240" height="180" rx="18" fill="#fffdf5"/>';
        for (var i = 0; i < 2; i++) { var x = i ? 176 : 64;   // the two owners, each on a mat in its colour
          var g = '<ellipse cx="' + x + '" cy="78" rx="44" ry="12" fill="' + cs[i][2] + '"/>' + emo(an[i], x, 50, 56);
          s += side === 0 ? '<g class="ccopt" data-i="' + i + '">' + g + "</g>" : g; }
        var flip = rnd(0, 1);                               // the things sit in a row below, NOT always under their owner
        for (var j = 0; j < 2; j++) { var o = flip ? 1 - j : j, xt = j ? 166 : 74;
          var th = '<g transform="translate(' + xt + ' 134) scale(0.42)">' + SHAPES[it](cs[o][2]) + "</g>";
          s += side === 1 ? '<g class="ccopt" data-i="' + o + '">' + th + "</g>" : th; }
        var c = cs[q], n = NAME[an[q]], thing = it === "ball" ? ["ball", "la pelota"] : ["star", "la estrella"];
        var de = n[1].indexOf("el ") === 0 ? "del " + n[1].slice(3) : "de " + n[1];
        return { scene: s + "</svg>", ans: q, say: side === 0
          ? ["Whose " + thing[0] + " is " + c[0] + "? Tap its owner.", "¿De quién es " + thing[1] + " " + c[1] + "? Toca a su dueño."]
          : ["Tap the " + n[0] + "'s " + thing[0] + ".", "Toca " + thing[1] + " " + de + "."] }; } },
    { id: "mine", cat: "owner", scene: true, w: [["yours", "tuyo"], ["mine (the owl's)", "mío (del búho)"]],
      why: [["It is next to you, at the bottom, with your orange ring.", "Está a tu lado, abajo, con tu aro naranja."], ["The owl says mine: it is the owl's, up by the owl, with the purple ring.", "El búho dice mío: es del búho, arriba junto al búho, con el aro morado."]],
      gen: function (side) { var t = pick(TOYS), xo = rnd(0, 1) ? 70 : 170, xy = 240 - xo;
        var s = VB + '<rect width="240" height="180" rx="18" fill="#fffdf5"/>' + emo("🦉", 106, 28, 44) +
          '<path d="M140 10 h80 a8 8 0 0 1 8 8 v18 a8 8 0 0 1 -8 8 h-70 l-10 8 v-8 a8 8 0 0 1 0 -34z" fill="#fff" stroke="#7c5cff" stroke-width="3"/>' +
          '<text x="186" y="32" font-size="15" font-weight="700" text-anchor="middle" fill="#3a2a8a">' + (es() ? (side ? "¡Mío!" : "¿El tuyo?") : (side ? "Mine!" : "Yours?")) + "</text>" +
          '<rect x="6" y="146" width="228" height="28" rx="10" fill="#ffe2c4"/>' + emo("🧒", 120, 160, 26);
        s += '<g class="ccopt" data-i="1"><circle cx="' + xo + '" cy="74" r="30" fill="none" stroke="#7c5cff" stroke-width="6"/>' + emo(t, xo, 74, 38) + "</g>";
        s += '<g class="ccopt" data-i="0"><circle cx="' + xy + '" cy="118" r="30" fill="none" stroke="#ff8a3d" stroke-width="6"/>' + emo(t, xy, 118, 38) + "</g>";
        return { scene: s + "</svg>", ans: side, say: side ? ["The owl says: Tap mine!", "El búho dice: ¡Toca el mío!"] : ["The owl says: Tap yours!", "El búho dice: ¡Toca el tuyo!"] }; } },
    { id: "his", cat: "owner", scene: true, w: [["his", "de él"], ["hers", "de ella"]],
      why: [["The boy's hat is his.", "El sombrero del niño es de él."], ["The girl's hat is hers.", "El sombrero de la niña es de ella."]],
      gen: function (side) { var it = pick(["🧢", "🎒", "🧸", "⚽", "🎈"]), boyLeft = rnd(0, 1), xb = boyLeft ? 64 : 176, xg = 240 - xb;
        var s = VB + '<rect width="240" height="180" rx="18" fill="#fffdf5"/><line x1="10" y1="150" x2="230" y2="150" stroke="#6b5" stroke-width="5"/>' +
          emo("👦", xb, 70, 56) + emo("👧", xg, 70, 56);
        s += '<g class="ccopt" data-i="0"><circle cx="' + xb + '" cy="126" r="24" fill="#8fd3ff66"/>' + emo(it, xb, 126, 34) + "</g>";
        s += '<g class="ccopt" data-i="1"><circle cx="' + xg + '" cy="126" r="24" fill="#ffa3cf66"/>' + emo(it, xg, 126, 34) + "</g>";
        return { scene: s + "</svg>", ans: side, say: side ? ["Tap hers: the girl's one.", "Toca el de ella: el de la niña."] : ["Tap his: the boy's one.", "Toca el de él: el del niño."] }; } },
    { id: "ours", cat: "owner", scene: true, w: [["ours (the owl's and yours)", "nuestro (del búho y tuyo)"], ["theirs (the other team's)", "suyo (del otro equipo)"]],
      why: [["Ours: the basket of our team, the owl and you, in orange.", "Nuestro: la cesta de nuestro equipo, el búho y tú, en naranja."], ["Theirs: the basket of the other two, in blue.", "Suyo: la cesta de los otros dos, en azul."]],
      gen: function (side) {                                // research 08 #25: two teams of two; the OWL (with you) says it, never the narrator
        var usLeft = rnd(0, 1), an = shuffle(THINGS.slice()).slice(0, 2), fr = pick(["🍎", "🍓", "🍌", "🍊", "🍇"]);
        var s = VB + '<rect width="240" height="180" rx="18" fill="#fffdf5"/>';
        function team(x0, us) { var col = us ? "#ff8a3d" : "#3d8bff", bg = us ? "#ffe2c4" : "#d4e6ff";
          var g = '<rect x="' + x0 + '" y="44" width="112" height="132" rx="14" fill="' + bg + '" stroke="' + col + '" stroke-width="4"/>' +
            (us ? emo("🦉", x0 + 30, 72, 36) + emo("🧒", x0 + 82, 74, 34) : emo(an[0], x0 + 30, 74, 36) + emo(an[1], x0 + 82, 74, 36));
          return g + '<g class="ccopt" data-i="' + (us ? 0 : 1) + '"><circle cx="' + (x0 + 56) + '" cy="136" r="30" fill="#fff" stroke="' + col + '" stroke-width="6"/>' +
            emo("🧺", x0 + 56, 142, 36) + emo(fr, x0 + 48, 124, 18) + emo(fr, x0 + 64, 126, 18) + "</g>"; }
        var xu = usLeft ? 4 : 124; s += team(xu, true) + team(usLeft ? 124 : 4, false);
        var bx = Math.min(Math.max(xu + 30, 46), 194);       // speech bubble above the owl
        s += '<rect x="' + (bx - 42) + '" y="4" width="84" height="28" rx="9" fill="#fff" stroke="#7c5cff" stroke-width="3"/><path d="M' + (xu + 24) + ' 31 l6 12 l6 -12" fill="#fff" stroke="#7c5cff" stroke-width="3"/>' +
          '<text x="' + bx + '" y="19" font-size="15" font-weight="700" text-anchor="middle" dominant-baseline="central" fill="#3a2a8a">' + (es() ? (side ? "¡El suyo!" : "¡El nuestro!") : (side ? "Theirs!" : "Ours!")) + "</text>";
        return { scene: s + "</svg>", ans: side, say: side ? ["The owl says: Tap theirs! The other team's basket.", "El búho dice: ¡Toca el suyo! La cesta del otro equipo."] : ["The owl says: Tap ours! The basket of the owl and you.", "El búho dice: ¡Toca el nuestro! La cesta del búho y tuya."] }; } }
  ];
  var BY = {}; C.forEach(function (c, i) { c.n = i; BY[c.id] = c; });
  function askText(c, side) {
    var w = W(c.w[side]);
    if (c.sound) return es() ? "Escucha. ¿Cuál sonó " + w + ", el 1 o el 2?" : "Listen. Which one was " + w + ", 1 or 2?";
    if (c.id === "dark") return es() ? "Toca el color " + w + "." : "Tap the " + w + " colour.";
    if (c.id === "heavy") return es() ? "Mira el balancín. Toca el " + w + "." : "Look at the see-saw. Tap the one that is " + w + ".";
    if (c.id === "first") return es() ? "Van hacia la bandera. Toca " + w + "." : "They are walking to the flag. Tap the one that is " + w + ".";
    if (c.id === "between") return es() ? "Toca el que está en medio de los otros dos." : "Tap the one that is between the other two.";
    if (c.ask || c.id === "full" || c.id === "hot") return es() ? "Toca el que está " + w + "." : "Tap the one that is " + w + ".";
    return es() ? "Toca el " + w + "." : "Tap the " + w + " one.";
  }
  function askQ(c, side) { return q && q.say ? (es() ? q.say[1] : q.say[0]) : askText(c, side); }   // the question's own words, if it has them
  function teachText(c, side) {                             // first time a word comes: show it
    var w = W(c.w[side]), y = W(c.why[side]);
    if (c.sound) return (es() ? "Escucha. Este es " + w + ". " : "Listen. This one is " + w + ". ") + y;
    return (es() ? "¡Mira! Este es " + w + ". " : "Look! This one is " + w + ". ") + y;
  }

  // ---- Progress: per concept a phase (0 word one, 1 word two, 2 mixed, 3 learned) and a run; learned ones in Leitner boxes ----
  var prog = { cur: 0, c: {}, pops: 0, stars: 0, fast: 0 };
  try { var p0 = JSON.parse(localStorage.getItem("conceptProg") || "null"); if (p0 && p0.c) prog = p0; } catch (e) {}
  function save() { try { localStorage.setItem("conceptProg", JSON.stringify(prog)); } catch (e) {} }
  function st(id) { var s = prog.c[id] || (prog.c[id] = { ph: 0, run: 0, seen: [0, 0], box: 0, due: 0 }); if (!s.days) s.days = []; return s; }
  var NEED = [2, 2, 3];                                     // right in a row to leave phase 0, 1, 2
  var GAP = [1, 2, 4, 7, 14];                               // days until a learned concept comes back, by box (research/03 R)
  var DAY = 86400000;
  function today() { var d = new Date(); return d.getFullYear() * 400 + d.getMonth() * 32 + d.getDate(); }
  function learning() {                                     // the (up to) two concepts he is learning now: the next ones not learned
    var out = [];
    for (var i = 0; i < C.length && out.length < 2; i++) { var c = C[i], s = st(c.id); if (s.ph < 3 && s.wait !== today()) out.push(c); }
    return out;
  }
  function dueReview(not) {                                 // the most overdue learned concept
    var best = null, bd = 1e9;
    C.forEach(function (c) { var s = st(c.id); if (s.ph === 3 && c !== not && s.due <= Date.now() && s.due < bd) { best = c; bd = s.due; } });
    return best;
  }
  function plan() {                                         // the questions of one pop-up: never the same concept twice in a row
    var n = cfg.n, list = [], lrn = learning(), rev, flip = prog.pops % 2;
    for (var k = 0; k < n; k++) {
      var prev = list.length ? list[list.length - 1].c : null;
      rev = (k % 2 === 1 || !lrn.length) ? dueReview(prev) : null;
      var cand = lrn.filter(function (x) { return x !== prev; }), cur = cand.length ? cand[(k + flip) % cand.length] : null;
      var c = rev || cur || lrn[0] || pick(C.filter(function (x) { return x !== prev; })), s = st(c.id);
      var side = s.ph === 0 ? 0 : s.ph === 1 ? 1 : rnd(0, 1);
      if (c.one) side = 0;
      list.push({ c: c, side: side, teach: s.ph < 3 && s.seen[side] === 0 && !(k && list[k - 1].c === c && list[k - 1].side === side) });
    }
    return list;
  }

  // ---- Settings (grown-ups' Menu) ----
  var EVERY = [0, 3, 5, 8, 10];                             // research/02 R: at most one pop-up per ~5 min and ~4 an hour
  var cfg = { every: 5, n: 2, move: 1 };
  var HOUR_MAX = 4, popTimes = [];
  try { var c0 = JSON.parse(localStorage.getItem("conceptCfg") || "null"); if (c0) for (var k in cfg) if (k in c0) cfg[k] = c0[k]; } catch (e) {}
  function saveCfg() { try { localStorage.setItem("conceptCfg", JSON.stringify(cfg)); } catch (e) {} }

  // ---- Movement cards (a move break that also acts out the space words) ----
  var MOVES = [["🙌", "Reach your hands up high!", "¡Estira las manos bien arriba!"], ["👇", "Now touch the floor, down low!", "¡Ahora toca el suelo, bien abajo!"],
    ["👏", "Clap three times in front of you!", "¡Da tres palmadas delante de ti!"], ["🤲", "Put your hands behind your back!", "¡Pon las manos detrás de la espalda!"],
    ["🐸", "Jump like a frog, one big jump!", "¡Salta como una rana, un salto grande!"], ["🌬️", "Take a big breath in... and slowly out.", "Respira hondo... y suelta despacio."],
    ["👋", "Wave your hand, fast! Now slow!", "¡Mueve la mano rápido! ¡Ahora despacio!"], ["🦒", "Stand up tall like a giraffe!", "¡Ponte alto como una jirafa!"]];

  // ---- The pop-up ----
  var misses = 0;
  var open = false, queue = [], qi = 0, q = null, locked = true, t0 = 0, seq = 0, onDone = null, where = "", lastPop = 0, sndT = [];
  function el() { return $("concept"); }
  function dots() { var h = ""; for (var i = 0; i < queue.length; i++) h += '<i class="' + (i < qi ? "ok" : i === qi ? "now" : "") + '"></i>'; $("ccDots").innerHTML = h; }
  function enable(on) { locked = !on; [].forEach.call(el().querySelectorAll(".ccopts button, .ccopt, #ccAgain"), function (b) { b.classList.toggle("off", !on); if (b.tagName === "BUTTON") b.disabled = !on; }); }
  function playSounds(snd, done) {                           // note 1, a gap, note 2; each button lights while its note sounds
    sndT.forEach(clearTimeout); sndT = [];
    var t = 300;
    snd.forEach(function (n, i) {
      sndT.push(setTimeout(function () { var b = el().querySelectorAll(".ccopts button")[i]; if (b) b.classList.add("lit"); try { window.pianoPlayNote && pianoPlayNote(n[0], n[1], n[2]); } catch (e) {} }, t));
      sndT.push(setTimeout(function () { var b = el().querySelectorAll(".ccopts button")[i]; if (b) b.classList.remove("lit"); }, t + Math.max(500, n[2])));
      t += Math.max(900, n[2] + 600);
    });
    sndT.push(setTimeout(function () { if (done) done(); }, t));
  }
  function render() {
    var it = queue[qi], c = it.c;
    q = c.gen(it.side); q.it = it;
    var box = $("ccOpts"); box.innerHTML = ""; box.className = "ccopts" + (q.scene ? " scene" : "") + (q.sound ? " sound" : "");
    $("ccMsg").textContent = ""; $("ccAgain").hidden = !q.sound;
    if (q.scene) {
      box.innerHTML = q.scene;
      [].forEach.call(box.querySelectorAll(".ccopt"), function (g) { g.onclick = function () { answer(+g.dataset.i, g); }; });
    } else if (q.sound) {
      [0, 1].forEach(function (i) { var b = document.createElement("button"); b.innerHTML = "<b>" + (i + 1) + "</b><small>🔊</small>"; b.onclick = function () { answer(i, b); }; box.appendChild(b); });
    } else {
      q.opts.forEach(function (svg, i) { var b = document.createElement("button"); b.innerHTML = svg; b.onclick = function () { answer(i, b); }; box.appendChild(b); });
    }
    $("ccAsk").textContent = it.teach ? teachText(c, it.side) : askQ(c, it.side);
    dots(); enable(false);
    var my = ++seq;
    function go() { if (my !== seq || !open) return; enable(true); t0 = Date.now(); if (it.teach) glow(); }
    function speak() { if (!voice.tell(it.teach ? teachText(c, it.side) + " " + (es() ? "¡Tócalo!" : "Tap it!") : askQ(c, it.side), q.sound ? function () { playSounds(q.sound, go); } : go)) (q.sound ? playSounds(q.sound, go) : setTimeout(go, 500)); }
    if (it.teach && q.sound) { voice.tell(es() ? "Escucha." : "Listen.", function () { playSounds(q.sound, function () { if (my === seq) speak2(); }); }); }
    else speak();
    function speak2() { var s = teachText(c, it.side) + " " + (es() ? "Es el " + (q.ans + 1) + ". ¡Tócalo!" : "It was number " + (q.ans + 1) + ". Tap it!"); if (!voice.tell(s, go)) setTimeout(go, 500); }
  }
  function targetEl() { var box = $("ccOpts"); return q.scene ? box.querySelector('.ccopt[data-i="' + q.ans + '"]') : box.querySelectorAll("button")[q.ans]; }
  function glow() { var t = targetEl(); if (t) t.classList.add("glow"); }
  function answer(i, b) {
    if (locked || !open) return;
    var it = q.it, c = it.c, s = st(c.id), ok = i === q.ans, ms = Date.now() - t0;
    if (it.teach && !ok) return;                            // errorless: only the glowing one counts the first time
    enable(false);
    var tg = targetEl(); if (tg) { tg.classList.remove("glow"); tg.classList.add("yes"); }
    diary.ev("concept", { c: c.id, w: it.side, ok: ok, ms: ms, ph: s.ph, teach: !!it.teach, at: where });
    s.seen[it.side]++;
    if (s.ph < 3) {
      if (it.teach) { /* shown, not tested */ }
      else if (ok) {
        s.run++; if (s.days.indexOf(today()) < 0) s.days.push(today());
        var last = c.one || s.ph === 2;                      // learned only after practice on two different days (spacing)
        if (s.run >= NEED[s.ph] && last && s.days.length < 2) s.wait = today();   // passed today: rests until another day
        if (s.run >= NEED[s.ph] && (!last || s.days.length >= 2)) { s.ph = c.one ? 3 : s.ph + 1; s.run = 0; if (s.ph === 3) { s.box = 0; s.due = Date.now() + GAP[0] * DAY; } }
      }
      else s.run = 0;
    } else {                                                // a learned one: up a box when right, back to the first box when wrong
      s.box = ok ? Math.min(GAP.length - 1, s.box + 1) : Math.max(0, s.box - 1); s.due = Date.now() + GAP[s.box] * DAY;   // a miss steps back one gap
    }
    var fast = ok && !it.teach && ms < 3000;
    if (ok) { prog.stars++; if (fast) prog.fast++; }
    save();
    var e = !es(), w = W(c.w[it.side]), y = W(c.why[it.side]), line;
    if (it.teach) line = (e ? "Yes! That one is " : "¡Sí! Ese es ") + w + ".";
    else if (ok) line = pick(e ? ["Yes!", "Brilliant!", "That's it!", "Spot on!"] : ["¡Sí!", "¡Genial!", "¡Eso es!", "¡Exacto!"]) + (fast ? " ⚡" : "") + " " + (e ? "That one is " : "Ese es ") + w + ".";
    else { line = (e ? "Not quite. This one is " : "Casi. Este es ") + w + ". " + y; if (b && b.classList) b.classList.add("no"); misses++; }
    if (misses >= 2) qi = queue.length - 1;                 // two misses in one game: tired, stop kindly and go back to playing
    $("ccMsg").textContent = (ok ? (fast ? "⚡⭐ " : "⭐ ") : "🤔 ") + line;
    var spoken = ok ? line.replace(" ⚡", "") : hey(line, voice.cfg.lang);
    if (s.ph === 3 && ok && !it.teach && s.box === 0) spoken += e ? " You know " + W(c.w[0]) + " and " + W(c.w[1]) + " now!" : " ¡Ya sabes " + W(c.w[0]) + " y " + W(c.w[1]) + "!";
    function nx() { setTimeout(next, ok ? 500 : 900); }
    if (!voice.say(spoken, nx)) setTimeout(nx, 1200);
  }
  function next() {
    if (!open) return;
    qi++;
    if (qi < queue.length) { render(); return; }
    var e = !es();
    $("ccOpts").innerHTML = '<div class="ccdone">⭐ ' + prog.stars + "</div>"; $("ccAsk").textContent = e ? "Back to it!" : "¡A seguir!"; $("ccMsg").textContent = ""; $("ccAgain").hidden = true; dots();
    var my = ++seq;
    function close() { if (my === seq) finish(); }
    if (!voice.say(where === "piano" ? (e ? "Great! Back to the piano!" : "¡Genial! ¡A tocar el piano!") : (e ? "Great! Back to it!" : "¡Genial! ¡A seguir!"), function () { setTimeout(close, 300); })) setTimeout(close, 1200);
  }
  function moveCard(done) {
    var m = pick(MOVES), e = !es();
    $("ccOpts").className = "ccopts move"; $("ccOpts").innerHTML = '<div class="ccmove">' + m[0] + '</div><button class="ccgo" id="ccGo">' + (e ? "Done ✓" : "Hecho ✓") + "</button>";
    $("ccAsk").textContent = (e ? "Move break! " : "¡A moverse! ") + (e ? m[1] : m[2]); $("ccMsg").textContent = ""; $("ccAgain").hidden = true;
    var my = ++seq, go = $("ccGo"); go.disabled = true;
    var auto = null;
    function fin() { if (my !== seq) return; clearTimeout(auto); seq++; done(); }
    go.onclick = fin;
    voice.tell((e ? "Move break! " : "¡A moverse! ") + (e ? m[1] : m[2]), function () { go.disabled = false; auto = setTimeout(fin, 7000); });
    setTimeout(function () { if (my === seq) go.disabled = false; }, 2500);
    diary.ev("concept", { move: m[0], at: where });
  }
  function show(at, done) {
    if (open) return false;
    open = true; where = at; onDone = done || null; queue = plan(); qi = 0; misses = 0; prog.pops++; lastPop = Date.now(); popTimes.push(lastPop); save();
    try { if (window.player && player.getPlayerState && player.getPlayerState() === 1) { player.pauseVideo(); resumeVid = true; } else resumeVid = false; } catch (e) { resumeVid = false; }
    el().classList.add("open"); document.body.classList.add("inconcept");
    $("ccTitle").textContent = es() ? "¡Juego rápido! " + queue.length + " preguntas y " + (at === "piano" ? "vuelves al piano" : "sigues") : "Quick game! " + queue.length + " questions, then " + (at === "piano" ? "back to your song" : "back to it");
    if (cfg.move && prog.pops % 4 === 0) moveCard(render); else render();
    return true;
  }
  var resumeVid = false;
  function finish() {
    open = false; seq++; sndT.forEach(clearTimeout);
    el().classList.remove("open"); document.body.classList.remove("inconcept");
    try { if (resumeVid && window.player && player.playVideo) player.playVideo(); } catch (e) {}
    var d = onDone; onDone = null; if (d) d();
  }

  // ---- When to pop up ----
  // Piano: after cfg.every minutes of actual playing, at the first pause of 1.5 s in his notes (never mid-phrase).
  var playMs = 0, lastNote = 0;
  function free() {                                         // nothing else is on top, and not too many games this hour
    var b = document.body.classList, now = Date.now();
    if (open || b.contains("locked")) return false;
    popTimes = popTimes.filter(function (t) { return now - t < 3600000; }); if (popTimes.length >= HOUR_MAX) return false;
    try { if (window.quiz && quiz.isOpen()) return false; } catch (e) {}
    if (window.coverOn && coverOn()) return false;          // Menu, sound picker, red screen, eye cover, lock: never on top of them
    return true;
  }
  function pianoMode() { var b = document.body.classList; return b.contains("play") && !b.contains("athome") && !b.contains("math") && !b.contains("inwrite") && !b.contains("incolour") && !b.contains("incompare") && !b.contains("infollow"); }   // not in the middle of a Follow-the-keys song
  $("ccAgain").onclick = function () { if (q && q.sound && !locked) { enable(false); playSounds(q.sound, function () { enable(true); }); } };
  setInterval(function () {
    // A time lock or the eye cover while a game is open: close it quietly (nothing counted), the lock screen must be the only thing showing
    if (open && where !== "test" && (document.body.classList.contains("locked") || ($("eyecov") && $("eyecov").classList.contains("on")))) { finish(); return; }
    if (!cfg.every || !pianoMode() || !free()) return;
    // The piano break is a coin: this quick game or a maths question (operator 1.36: piano time is focus time, mix them;
    // colouring and writing are never interrupted, he picks them himself).
    if (playMs >= cfg.every * 60000 && Date.now() - lastNote > 1500) { playMs = 0; if (window.quiz && quiz.cfg.on && Math.random() < 0.5) quiz.show(); else show("piano"); }
  }, 400);
  return {
    note: function () {                                     // every note he plays (index.html act.note)
      var now = Date.now();
      if (lastNote && now - lastNote < 4000) playMs += now - lastNote;   // gaps over 4 s are not playing
      lastNote = now;
    },
    show: function (at, done) { return !open && show(at || "menu", done); },   // the grown-up's "try one now", or the lesson-end break
    ready: function () { return !!cfg.every && free(); },
    isOpen: function () { return open; },
    again: function () { if (q && q.sound && !locked) { enable(false); playSounds(q.sound, function () { enable(true); }); } },
    // Menu
    cfg: cfg, EVERY: EVERY,
    set: function (k, v) { cfg[k] = v; saveCfg(); },
    count: function () { var n = 0; C.forEach(function (c) { if (st(c.id).ph === 3) n++; }); return n; },
    total: C.length,
    current: function () { return learning().map(function (c) { return W(c.w[0]) + (c.one ? "" : " / " + W(c.w[1])); }).join(" + "); },
    stars: function () { return prog.stars; },
    reset: function () { prog = { cur: 0, c: {}, pops: 0, stars: 0, fast: 0 }; save(); },
    _C: C, _q: function () { return { q: q, locked: locked, open: open, prog: prog }; },
    _one: function (id, side, teach) {                      // tests: open one question of one concept
      if (open) finish();
      open = true; where = "test"; onDone = null; qi = 0; queue = [{ c: BY[id], side: side || 0, teach: !!teach }];
      el().classList.add("open"); document.body.classList.add("inconcept"); $("ccTitle").textContent = "Quick game!"; render();
    },
    _move: function () { if (open) finish(); open = true; where = "test"; queue = [{ c: C[0], side: 0 }]; qi = 0; el().classList.add("open"); moveCard(render); }
  };
})();
