// garden.js — Ruby. Two connected games. The jumbled gem is a paint-by-numbers
// stone: pour colour from the wells, settle every facet, and the click ledger
// becomes an svg draft — kept in the satchel or planted in the garden bed as a
// seed. Planted seeds bloom into black-and-white paint-by-number flowers that
// learn their colours from what is painted onto them. No shared imports.
// PRNG mirrors src/prompt-engine.js (xmur3 + mulberry32); features never
// import each other, so the pattern is copied, not linked.

(function () {
  var app = document.querySelector('.garden-app');
  var gemSvg = document.getElementById('garden-gem-svg');
  var gemCount = document.getElementById('garden-gem-count');
  var gemNote = document.getElementById('garden-gem-note');
  var slotsEl = document.getElementById('garden-slots');
  var plotsEl = document.getElementById('garden-plots');
  var stage = document.getElementById('garden-stage');

  // the six shades ruby keeps — token values mirror garden.css; the order is
  // the paint-by-number order (facet numeral n paints GEM_COLORS[n-1]).
  var GEM_COLORS = [
    { id: 'teal', hex: '#2f6f6a' },
    { id: 'terracotta', hex: '#b5763c' },
    { id: 'cream', hex: '#ede0c8' },
    { id: 'sage', hex: '#8a9a6b' },
    { id: 'plum', hex: '#7a4a5e' },
    { id: 'gold', hex: '#c9a227' }
  ];
  var NEUTRALS = [
    { id: 'cream', hex: '#ede0c8' },
    { id: 'ink', hex: '#241d16' }
  ];

  // hand-authored faceted stone, points in a 400x400 viewBox (centre 200,200):
  // an octagonal table, a crown ring of 8 trapezoids, a pavilion ring of 8
  // points. target is an index into GEM_COLORS — the solved gem's scheme.
  var FACETS = [
    { id: 'f0',  target: 5, points: '257.3,223.7 223.7,257.3 176.3,257.3 142.7,223.7 142.7,176.3 176.3,142.7 223.7,142.7 257.3,176.3' },
    { id: 'f1',  target: 0, points: '257.3,223.7 223.7,257.3 249,318.3 318.3,249' },
    { id: 'f2',  target: 2, points: '318.3,249 249,318.3 325.9,325.9' },
    { id: 'f3',  target: 1, points: '223.7,257.3 176.3,257.3 151,318.3 249,318.3' },
    { id: 'f4',  target: 5, points: '249,318.3 151,318.3 200,378' },
    { id: 'f5',  target: 4, points: '176.3,257.3 142.7,223.7 81.7,249 151,318.3' },
    { id: 'f6',  target: 2, points: '151,318.3 81.7,249 74.1,325.9' },
    { id: 'f7',  target: 3, points: '142.7,223.7 142.7,176.3 81.7,151 81.7,249' },
    { id: 'f8',  target: 2, points: '81.7,249 81.7,151 22,200' },
    { id: 'f9',  target: 0, points: '142.7,176.3 176.3,142.7 151,81.7 81.7,151' },
    { id: 'f10', target: 5, points: '81.7,151 151,81.7 74.1,74.1' },
    { id: 'f11', target: 1, points: '176.3,142.7 223.7,142.7 249,81.7 151,81.7' },
    { id: 'f12', target: 2, points: '151,81.7 249,81.7 200,22' },
    { id: 'f13', target: 4, points: '223.7,142.7 257.3,176.3 318.3,151 249,81.7' },
    { id: 'f14', target: 5, points: '249,81.7 318.3,151 325.9,74.1' },
    { id: 'f15', target: 0, points: '257.3,176.3 257.3,223.7 318.3,249 318.3,151' },
    { id: 'f16', target: 2, points: '318.3,151 318.3,249 378,200' }
  ];
  var SILHOUETTE = '325.9,325.9 249,318.3 200,378 151,318.3 74.1,325.9 81.7,249 22,200 81.7,151 74.1,74.1 151,81.7 200,22 249,81.7 325.9,74.1 318.3,151 378,200 318.3,249';

  var SVG_NS = 'http://www.w3.org/2000/svg';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // xmur3 string hash + mulberry32 PRNG (mirrors src/prompt-engine.js).
  function hashSeed(str) {
    var h = 1779033703 ^ str.length;
    for (var i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return (h ^= h >>> 16) >>> 0;
  }

  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function chime() {
    if (window.Liber && window.Liber.sound) window.Liber.sound.play('chime');
  }

  function svgPoint(evt) {
    var m = gemSvg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    var pt = gemSvg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    var p = pt.matrixTransform(m.inverse());
    return { x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10 };
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS(SVG_NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  // ─── game 1: the empty gem ─────────────────────────────────────────────

  var gemPaint = [];   // per facet: hex currently poured on, or null (cleared)
  var gemSettled = []; // per facet: true once filled
  var ledger = [];     // the click ledger: { x, y, color, act } in svg coords
  var slots = [];      // 6 palette slots: hex or null
  var selectedSlot = -1;
  var gemDoneTimer = null; // the fill→draft handoff; cancelled if the gem moves on early

  function scrambleGem() {
    if (gemDoneTimer) { clearTimeout(gemDoneTimer); gemDoneTimer = null; }
    gemPaint = [];
    gemSettled = [];
    ledger = [];
    slots = [null, null, null, null, null, null];
    selectedSlot = -1;
    if (gemSvg) gemSvg.classList.remove('garden-gem-done');
    for (var i = 0; i < FACETS.length; i++) {
      gemPaint.push(null);
      gemSettled.push(false);
    }
    renderGem();
    renderSlots();
    setNote('the gem is empty. fill every facet.');
  }

  function setNote(t) { if (gemNote) gemNote.textContent = t; }

  function settledCount() {
    var n = 0;
    for (var i = 0; i < gemSettled.length; i++) if (gemSettled[i]) n++;
    return n;
  }

  function syncCount() {
    if (gemCount) gemCount.textContent = settledCount() + ' of ' + FACETS.length + ' filled';
  }

  function renderGem() {
    if (!gemSvg) return;
    gemSvg.innerHTML = '';
    var wells = svgEl('g', { 'class': 'garden-wells' });
    for (var k = 0; k < GEM_COLORS.length; k++) {
      (function (color, k) {
        var cy = 70 + k * 46;
        var ring = svgEl('circle', { 'class': 'garden-well-ring', cx: 45, cy: cy, r: 20 });
        var well = svgEl('circle', { 'class': 'garden-well', 'data-well': k, cx: 45, cy: cy, r: 15, fill: color.hex });
        well.addEventListener('click', function (e) {
          var p = svgPoint(e);
          ledger.push({ x: p.x, y: p.y, color: color.hex, act: 'well' });
          for (var s = 0; s < slots.length; s++) {
            if (slots[s] === null) slots[s] = color.hex;
          }
          renderSlots();
        });
        wells.appendChild(ring);
        wells.appendChild(well);
      })(GEM_COLORS[k], k);
    }
    gemSvg.appendChild(wells);

    var gem = svgEl('g', { transform: 'translate(75 0)' });
    var facets = svgEl('g', { 'class': 'garden-facets' });
    for (var i = 0; i < FACETS.length; i++) {
      (function (f, i) {
        var g = svgEl('g', { 'class': 'garden-facet', 'data-facet': i });
        var poly = svgEl('polygon', { points: f.points, fill: gemPaint[i] || 'transparent' });
        g.appendChild(poly);
        g.addEventListener('click', function (e) { facetClick(i, e); });
        facets.appendChild(g);
      })(FACETS[i], i);
    }
    gem.appendChild(facets);
    gemSvg.appendChild(gem);
    // classes live on the wrapper groups; re-apply facet states
    facetStates();
    syncCount();
  }

  // keep class state in sync without rebuilding the svg (fills change often)
  function facetStates() {
    var gs = gemSvg.querySelectorAll('.garden-facet');
    for (var i = 0; i < gs.length; i++) {
      var poly = gs[i].querySelector('polygon');
      if (poly) poly.setAttribute('fill', gemPaint[i] || 'transparent');
      gs[i].classList.toggle('settled', !!gemSettled[i]);
    }
  }

  function renderSlots() {
    if (!slotsEl) return;
    slotsEl.innerHTML = '';
    for (var i = 0; i < slots.length; i++) {
      (function (i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'garden-slot' + (slots[i] ? ' filled' : '') + (i === selectedSlot ? ' selected' : '');
        b.setAttribute('aria-label', slots[i] ? 'palette slot ' + (i + 1) + ', filled' : 'palette slot ' + (i + 1) + ', empty');
        if (slots[i]) b.style.background = slots[i];
        b.addEventListener('click', function () {
          if (!slots[i]) return;
          selectedSlot = (selectedSlot === i) ? -1 : i;
          renderSlots();
        });
        slotsEl.appendChild(b);
      })(i);
    }
  }

  function facetClick(i, e) {
    var p = svgPoint(e);
    var poured = selectedSlot >= 0 ? slots[selectedSlot] : null;
    if (poured) {
      gemPaint[i] = poured;
      gemSettled[i] = true;
      ledger.push({ x: p.x, y: p.y, color: poured, act: 'pour' });
      slots[selectedSlot] = null;
      selectedSlot = -1;
      chime();
      renderSlots();
      facetStates();
      syncCount();
      if (settledCount() === FACETS.length) {
        // the fill: the stone breathes once, then the draft arrives asking
        if (gemSvg) {
          gemSvg.classList.remove('garden-gem-done');
          void gemSvg.offsetWidth;
          gemSvg.classList.add('garden-gem-done');
        }
        setNote('complete. every facet filled.');
        gemDoneTimer = setTimeout(function () {
          gemDoneTimer = null;
          // the gem may have moved on before the breathe finished — only
          // open the complete draft if it still is
          if (settledCount() !== FACETS.length || !ledger.length) return;
          if (gemSvg) gemSvg.classList.remove('garden-gem-done');
          openDraft(true);
        }, 1050);
      }
    } else if (gemPaint[i]) {
      ledger.push({ x: p.x, y: p.y, color: gemPaint[i], act: 'clear' });
      gemPaint[i] = null;
      gemSettled[i] = false;
      facetStates();
      syncCount();
    }
  }

  // the draft — an svg of this attempt's actual choreography: the stone's
  // faint outline, a polyline through every pour/clear click in order, and a
  // small circle at each point in the colour used there.
  function draftSvg() {
    var pts = [];
    for (var i = 0; i < ledger.length; i++) {
      if (ledger[i].act === 'pour' || ledger[i].act === 'clear') pts.push(ledger[i]);
    }
    var s = '<svg xmlns="' + SVG_NS + '" viewBox="0 0 500 400">';
    s += '<rect width="500" height="400" fill="#f2ead6"/>';
    s += '<g transform="translate(75 0)"><polygon points="' + SILHOUETTE + '" fill="none" stroke="rgba(36,29,22,0.32)" stroke-width="1.4" stroke-linejoin="round"/></g>';
    if (pts.length) {
      var line = '';
      for (var j = 0; j < pts.length; j++) line += (j ? ' ' : '') + pts[j].x + ',' + pts[j].y;
      s += '<polyline points="' + line + '" fill="none" stroke="rgba(36,29,22,0.55)" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/>';
      for (var n = 0; n < pts.length; n++) {
        s += '<circle cx="' + pts[n].x + '" cy="' + pts[n].y + '" r="3.5" fill="' + pts[n].color + '" stroke="rgba(36,29,22,0.45)" stroke-width="0.8"/>';
      }
    }
    s += '</svg>';
    return s;
  }

  function openDraft(complete) {
    var panel = document.getElementById('garden-draft');
    var view = document.getElementById('garden-draft-view');
    var name = document.getElementById('garden-draft-name');
    var title = document.getElementById('garden-draft-title');
    if (!panel || !view) return;
    view.innerHTML = draftSvg();
    if (name) name.value = '';
    if (title) title.textContent = complete ? 'complete. plant it?' : 'the draft so far. plant it when ready.';
    panel.classList.add('open');
    panel.removeAttribute('inert');
    setNote(complete ? 'the gem is filled. plant it below.' : 'the draft so far — it grows with every pour.');
  }

  function closeDraft(msg) {
    var panel = document.getElementById('garden-draft');
    if (!panel) return;
    if (gemDoneTimer) { clearTimeout(gemDoneTimer); gemDoneTimer = null; }
    panel.classList.remove('open');
    panel.setAttribute('inert', '');
    ledger = [];
    if (msg) setNote(msg);
  }

  function pourLedgerCount() {
    var n = 0;
    for (var i = 0; i < ledger.length; i++) {
      if (ledger[i].act === 'pour' || ledger[i].act === 'clear') n++;
    }
    return n;
  }

  // saving plants: the draft is kept in the satchel with its picture,
  // and the seed goes straight into the bed. One button, no fork.
  function saveDraft() {
    if (!window.Liber || !window.Liber.state) return;
    var nameEl = document.getElementById('garden-draft-name');
    var given = nameEl ? nameEl.value.trim() : '';
    var svg = draftSvg();
    var shot = null;
    try { shot = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg); } catch (e) {}
    window.Liber.state.addArtifact('satchel', {
      kind: 'gem-draft',
      name: given || 'a draft of colouring',
      svg: svg,
      shot: shot,
      points: pourLedgerCount(),
      ts: Date.now()
    });
    var palette = GEM_COLORS.map(function (c) { return c.hex; });
    var digest = ('00000000' + hashSeed(JSON.stringify(ledger)).toString(16)).slice(-8);
    window.Liber.state.addArtifact('garden', {
      kind: 'seed',
      name: given || 'a seed',
      gemPalette: palette,
      pattern: { points: ledger.slice(), digest: digest },
      shot: shot,
      bloom: null
    });
    if (window.Liber && window.Liber.soundscape) {
      try { window.Liber.soundscape.motif('ruby'); } catch (e) {}
    }
    closeDraft('planted in the bed. a new empty stone waits below.');
    scrambleGem();
    renderBed();
    chime();
  }

  // ─── game 2: the garden bed ──────────────────────────────────────────────

  var openSeedId = null;
  var openSubject = 'flower';
  var seedFills = {};      // regionId -> hex, every subject's paints (ids are subject-prefixed)
  var flowerRegions = [];  // region defs for the subject currently open
  var selectedPaint = -1;  // index into the open bloom's palette
  var flowerPalette = [];  // hexes offered for the open bloom

  // the colouring shelf — ruby keeps more than one thing that blooms
  var SUBJECTS = ['flower', 'bee', 'butterfly', 'moth', 'mushroom'];

  var MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  function fmtDate(ts) {
    var d = new Date(ts);
    return d.getDate() + ' ' + MONTHS[d.getMonth()];
  }

  function seeds() {
    var all = (window.Liber && window.Liber.state) ? window.Liber.state.get().garden : [];
    var out = [];
    for (var i = 0; i < (all || []).length; i++) {
      if (all[i] && all[i].kind === 'seed') out.push(all[i]);
    }
    return out;
  }

  // weighted blend of the learned scheme — the bed's miniature tint
  function learnedTint(learned) {
    var r = 0, g = 0, b = 0, n = 0;
    for (var hex in learned) {
      var c = learned[hex] || 0;
      if (c <= 0) continue;
      r += parseInt(hex.slice(1, 3), 16) * c;
      g += parseInt(hex.slice(3, 5), 16) * c;
      b += parseInt(hex.slice(5, 7), 16) * c;
      n += c;
    }
    if (!n) return '';
    function h(v) { return ('0' + Math.round(v / n).toString(16)).slice(-2); }
    return '#' + h(r) + h(g) + h(b);
  }

  function bloomState(entry) {
    if (!entry.bloom) return 'unopened';
    return entry.painted ? 'in full colour' : 'in ink';
  }

  function renderBed() {
    if (!plotsEl) return;
    var list = seeds();
    plotsEl.innerHTML = '';
    if (!list.length) {
      var empty = document.createElement('div');
      empty.className = 'garden-empty';
      empty.textContent = 'the bed is empty. fill a gem above and plant it here.';
      plotsEl.appendChild(empty);
      var gi;
      for (gi = 1; gi <= 3; gi++) {
        var ghost = document.createElement('div');
        ghost.className = 'garden-ghost';
        ghost.textContent = 'an empty patch of soil — fill a gem to plant here';
        plotsEl.appendChild(ghost);
      }
      return;
    }
    for (var i = 0; i < list.length; i++) {
      (function (entry) {
        var row = document.createElement('div');
        row.className = 'garden-plot' + (entry.painted ? ' grown' : '');
        row.setAttribute('data-seed', entry.id);
        var tint = document.createElement('div');
        tint.className = 'garden-plot-tint';
        var learned = entry.bloom && entry.bloom.learned;
        var tintHex = learned ? learnedTint(learned) : '';
        if (tintHex) tint.style.background = tintHex;
        var pot = document.createElement('div');
        pot.className = 'garden-pot';
        var sprout = document.createElement('div');
        sprout.className = 'garden-sprout';
        sprout.setAttribute('aria-hidden', 'true');
        var name = document.createElement('div');
        name.className = 'garden-plot-name';
        name.textContent = entry.name || 'a seed';
        var meta = document.createElement('div');
        meta.className = 'garden-plot-meta';
        meta.textContent = 'sown ' + fmtDate(entry.ts || Date.now()) + ' · ' + bloomState(entry);
        row.appendChild(pot);
        row.appendChild(sprout);
        row.appendChild(name);
        row.appendChild(meta);
        row.appendChild(tint);
        row.addEventListener('click', function () { openFlower(entry.id); });
        plotsEl.appendChild(row);
      })(list[i]);
    }
  }

  // a flower drawn from the seed itself: petal count, petal reach and width
  // all come from the seed's id, so the same seed opens the same flower.
  function flowerRegionsFor(entry) {
    var rng = mulberry32(hashSeed(entry.id));
    var petalN = 5 + Math.floor(rng() * 4);      // 5-8 petals
    var ph = 56 + rng() * 14;                    // petal reach
    var pw = 15 + rng() * 5;                     // petal half-width
    var r0 = 16;
    var cx = 150, cy = 118;
    var regions = [];

    var petalD = 'M 0 ' + (-r0) +
      ' C ' + (-pw).toFixed(2) + ' ' + (-r0 - ph * 0.28).toFixed(2) + ' ' + (-pw * 0.9).toFixed(2) + ' ' + (-ph).toFixed(2) + ' 0 ' + (-ph).toFixed(2) +
      ' C ' + (pw * 0.9).toFixed(2) + ' ' + (-ph).toFixed(2) + ' ' + pw.toFixed(2) + ' ' + (-r0 - ph * 0.28).toFixed(2) + ' 0 ' + (-r0) + ' Z';

    for (var k = 0; k < petalN; k++) {
      var ang = k * (360 / petalN);
      var rad = ang * Math.PI / 180;
      var nx = cx + Math.sin(rad) * (r0 + (ph - r0) * 0.55);
      var ny = cy - Math.cos(rad) * (r0 + (ph - r0) * 0.55);
      regions.push({
        id: 'p' + k, num: regions.length + 1, nx: nx, ny: ny,
        shape: '<path d="' + petalD + '" transform="translate(' + cx + ' ' + cy + ') rotate(' + ang.toFixed(2) + ')"/>'
      });
    }
    regions.push({ id: 'center', num: regions.length + 1, nx: cx, ny: cy + 3.5, shape: '<circle cx="' + cx + '" cy="' + cy + '" r="21"/>' });
    regions.push({
      id: 'stem', num: regions.length + 1, nx: 167, ny: 205,
      shape: '<path d="M 145 138 C 143 210 156 250 146 348 L 155 348 C 159 250 152 210 156 138 Z"/>'
    });
    regions.push({
      id: 'leaf0', num: regions.length + 1, nx: 122, ny: 274,
      shape: '<path d="M 149 268 C 122 258 104 262 96 276 C 110 290 134 288 149 272 Z"/>'
    });
    regions.push({
      id: 'leaf1', num: regions.length + 1, nx: 182, ny: 312,
      shape: '<path d="M 151 306 C 178 296 196 300 204 314 C 190 328 166 326 151 310 Z"/>'
    });
    return regions;
  }

  // the bee — hand-authored paint-by-number: head, thorax, three abdomen
  // bands, stinger, two wings. ids prefixed bee- so fills never collide
  // across subjects.
  function beeRegionsFor() {
    var regions = [];
    regions.push({ id: 'bee0', num: 1, nx: 150, ny: 92, shape: '<circle cx="150" cy="90" r="20"/>' });
    regions.push({ id: 'bee1', num: 2, nx: 150, ny: 130, shape: '<ellipse cx="150" cy="128" rx="24" ry="20"/>' });
    regions.push({ id: 'bee2', num: 3, nx: 150, ny: 170, shape: '<ellipse cx="150" cy="168" rx="30" ry="14"/>' });
    regions.push({ id: 'bee3', num: 4, nx: 150, ny: 198, shape: '<ellipse cx="150" cy="196" rx="26" ry="13"/>' });
    regions.push({ id: 'bee4', num: 5, nx: 150, ny: 224, shape: '<ellipse cx="150" cy="222" rx="16" ry="12"/>' });
    regions.push({ id: 'bee5', num: 6, nx: 150, ny: 246, shape: '<path d="M 144 234 L 156 234 L 150 252 Z"/>' });
    regions.push({ id: 'bee6', num: 7, nx: 100, ny: 98, shape: '<ellipse cx="105" cy="104" rx="34" ry="15" transform="rotate(-32 105 104)"/>' });
    regions.push({ id: 'bee7', num: 8, nx: 200, ny: 98, shape: '<ellipse cx="195" cy="104" rx="34" ry="15" transform="rotate(32 195 104)"/>' });
    return regions;
  }

  // the butterfly — head, body, four wings, two wing spots.
  function butterflyRegionsFor() {
    var regions = [];
    regions.push({ id: 'bf0', num: 1, nx: 150, ny: 120, shape: '<circle cx="150" cy="118" r="12"/>' });
    regions.push({ id: 'bf1', num: 2, nx: 150, ny: 175, shape: '<ellipse cx="150" cy="175" rx="9" ry="34"/>' });
    regions.push({
      id: 'bf2', num: 3, nx: 96, ny: 122,
      shape: '<path d="M 142 130 C 108 96 70 88 52 104 C 38 118 44 142 66 152 C 92 164 126 156 142 140 Z"/>'
    });
    regions.push({
      id: 'bf3', num: 4, nx: 204, ny: 122,
      shape: '<path d="M 158 130 C 192 96 230 88 248 104 C 262 118 256 142 234 152 C 208 164 174 156 158 140 Z"/>'
    });
    regions.push({
      id: 'bf4', num: 5, nx: 112, ny: 200,
      shape: '<path d="M 142 158 C 116 162 88 178 84 202 C 82 224 100 238 122 232 C 138 228 146 206 146 186 Z"/>'
    });
    regions.push({
      id: 'bf5', num: 6, nx: 188, ny: 200,
      shape: '<path d="M 158 158 C 184 162 212 178 216 202 C 218 224 200 238 178 232 C 162 228 154 206 154 186 Z"/>'
    });
    regions.push({ id: 'bf6', num: 7, nx: 86, ny: 122, shape: '<circle cx="86" cy="120" r="8"/>' });
    regions.push({ id: 'bf7', num: 8, nx: 214, ny: 122, shape: '<circle cx="214" cy="120" r="8"/>' });
    return regions;
  }

  // the moth — rounder wings, fuzzy split body, two eye spots.
  function mothRegionsFor() {
    var regions = [];
    regions.push({ id: 'mo0', num: 1, nx: 150, ny: 108, shape: '<circle cx="150" cy="106" r="11"/>' });
    regions.push({ id: 'mo1', num: 2, nx: 150, ny: 138, shape: '<ellipse cx="150" cy="138" rx="16" ry="22"/>' });
    regions.push({ id: 'mo2', num: 3, nx: 150, ny: 196, shape: '<ellipse cx="150" cy="196" rx="14" ry="40"/>' });
    regions.push({
      id: 'mo3', num: 4, nx: 94, ny: 124,
      shape: '<path d="M 140 120 C 108 92 66 88 48 108 C 34 126 44 150 70 158 C 98 166 128 152 140 138 Z"/>'
    });
    regions.push({
      id: 'mo4', num: 5, nx: 206, ny: 124,
      shape: '<path d="M 160 120 C 192 92 234 88 252 108 C 266 126 256 150 230 158 C 202 166 172 152 160 138 Z"/>'
    });
    regions.push({
      id: 'mo5', num: 6, nx: 114, ny: 214,
      shape: '<path d="M 142 176 C 112 182 86 202 88 228 C 90 248 110 258 128 250 C 142 244 148 220 148 204 Z"/>'
    });
    regions.push({
      id: 'mo6', num: 7, nx: 186, ny: 214,
      shape: '<path d="M 158 176 C 188 182 214 202 212 228 C 210 248 190 258 172 250 C 158 244 152 220 152 204 Z"/>'
    });
    regions.push({ id: 'mo7', num: 8, nx: 84, ny: 126, shape: '<circle cx="84" cy="124" r="7"/>' });
    regions.push({ id: 'mo8', num: 9, nx: 216, ny: 126, shape: '<circle cx="216" cy="124" r="7"/>' });
    return regions;
  }

  // the mushroom — a three-band cap, two spots, stem, skirt, the ground.
  function mushroomRegionsFor() {
    var regions = [];
    regions.push({
      id: 'mu0', num: 1, nx: 96, ny: 130,
      shape: '<path d="M 72 152 C 76 108 106 84 148 82 L 144 152 Z"/>'
    });
    regions.push({
      id: 'mu1', num: 2, nx: 150, ny: 120,
      shape: '<path d="M 148 82 L 144 152 L 156 152 L 157 84 C 154 83 151 82 148 82 Z"/>'
    });
    regions.push({
      id: 'mu2', num: 3, nx: 196, ny: 128,
      shape: '<path d="M 157 84 C 190 90 220 116 228 152 L 156 152 Z"/>'
    });
    regions.push({ id: 'mu3', num: 4, nx: 110, ny: 114, shape: '<circle cx="110" cy="112" r="9"/>' });
    regions.push({ id: 'mu4', num: 5, nx: 192, ny: 108, shape: '<circle cx="192" cy="106" r="7"/>' });
    regions.push({
      id: 'mu5', num: 6, nx: 150, ny: 215,
      shape: '<path d="M 132 152 C 130 210 128 250 124 282 L 176 282 C 172 250 170 210 168 152 Z"/>'
    });
    regions.push({
      id: 'mu6', num: 7, nx: 150, ny: 298,
      shape: '<path d="M 118 282 C 116 296 112 306 106 314 L 194 314 C 188 306 184 296 182 282 Z"/>'
    });
    regions.push({ id: 'mu7', num: 8, nx: 150, ny: 322, shape: '<ellipse cx="150" cy="322" rx="96" ry="12"/>' });
    return regions;
  }

  function regionsFor(subject, entry) {
    if (subject === 'bee') return beeRegionsFor();
    if (subject === 'butterfly') return butterflyRegionsFor();
    if (subject === 'moth') return mothRegionsFor();
    if (subject === 'mushroom') return mushroomRegionsFor();
    return flowerRegionsFor(entry);
  }

  function subjectSvg(subject, regions, entry) {
    var labels = {
      flower: 'a flower in ink', bee: 'a bee in ink', butterfly: 'a butterfly in ink',
      moth: 'a moth in ink', mushroom: 'a mushroom in ink'
    };
    var fresh = !(entry.bloom && entry.bloom.fills && Object.keys(entry.bloom.fills).length);
    var svg = '<svg class="garden-flower-svg" viewBox="0 0 300 360" role="img" aria-label="' + (labels[subject] || 'a bloom in ink') + '">';
    svg += '<g class="garden-bloom-origin' + (fresh ? ' garden-bloom-in' : '') + '">';
    for (var i = 0; i < regions.length; i++) {
      var rg = regions[i];
      var fillHex = seedFills[rg.id] || '';
      var fillAttr = fillHex ? ' fill="' + fillHex + '"' : '';
      svg += '<g class="garden-region' + (fillHex ? ' filled' : '') + '" data-region="' + rg.id + '">';
      svg += rg.shape.replace('/>', fillAttr + '/>');
      svg += '<text class="garden-region-num" x="' + rg.nx.toFixed(1) + '" y="' + rg.ny.toFixed(1) + '" text-anchor="middle">' + rg.num + '</text>';
      svg += '</g>';
    }
    svg += '</g></svg>';
    flowerRegions = regions;
    return svg;
  }

  function learnedCounts() {
    var learned = {};
    for (var id in seedFills) {
      var hex = seedFills[id];
      learned[hex] = (learned[hex] || 0) + 1;
    }
    return learned;
  }

  function renderLearned() {
    var strip = document.getElementById('garden-learned');
    if (!strip) return;
    var learned = learnedCounts();
    strip.innerHTML = '';
    var any = false;
    var seen = {};
    var order = flowerPalette;
    for (var i = 0; i < order.length; i++) {
      var hex = order[i];
      if (!learned[hex] || seen[hex]) continue;
      seen[hex] = true;
      any = true;
      var chip = document.createElement('span');
      chip.className = 'garden-lchip';
      var dot = document.createElement('span');
      dot.className = 'garden-lchip-dot';
      dot.style.background = hex;
      chip.appendChild(dot);
      chip.appendChild(document.createTextNode('× ' + learned[hex]));
      strip.appendChild(chip);
    }
    if (!any) strip.textContent = 'nothing learned yet — the ink waits.';
  }

  function renderFlowerPalette() {
    var wrap = document.getElementById('garden-fpalette');
    if (!wrap) return;
    wrap.innerHTML = '';
    for (var i = 0; i < flowerPalette.length; i++) {
      (function (i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'garden-fchip' + (i === selectedPaint ? ' selected' : '');
        b.style.background = flowerPalette[i];
        b.setAttribute('aria-label', 'paint ' + flowerPalette[i]);
        b.addEventListener('click', function () {
          selectedPaint = (selectedPaint === i) ? -1 : i;
          renderFlowerPalette();
        });
        wrap.appendChild(b);
      })(i);
    }
  }

  function paintRegion(regionId) {
    if (selectedPaint < 0) return;
    var hex = flowerPalette[selectedPaint];
    seedFills[regionId] = hex;
    var g = stage.querySelector('.garden-region[data-region="' + regionId + '"]');
    if (g) {
      var shape = g.querySelector('path, circle, ellipse');
      if (shape) shape.setAttribute('fill', hex);
      g.classList.add('filled');
    }
    renderLearned();
  }

  function openFlower(seedId) {
    var entry = null;
    var list = seeds();
    for (var i = 0; i < list.length; i++) if (list[i].id === seedId) entry = list[i];
    if (!entry || !stage) return;
    openSeedId = seedId;
    openSubject = (entry.bloom && entry.bloom.subject) || 'flower';
    seedFills = {};
    var saved = (entry.bloom && entry.bloom.fills) || {};
    for (var k in saved) seedFills[k] = saved[k];
    flowerPalette = (Array.isArray(entry.gemPalette) && entry.gemPalette.length === GEM_COLORS.length
      ? entry.gemPalette
      : GEM_COLORS.map(function (c) { return c.hex; })
    ).concat(NEUTRALS.map(function (c) { return c.hex; }));
    selectedPaint = -1;

    var regions = regionsFor(openSubject, entry);
    stage.innerHTML =
      '<div class="garden-stage-inner">' +
        '<div class="garden-stage-head">' +
          '<span class="garden-stage-name">' + esc(entry.name || 'a seed') + '</span>' +
          '<button type="button" class="garden-stage-close" id="garden-stage-close" aria-label="close">×</button>' +
        '</div>' +
        '<div class="garden-subjects" id="garden-subjects" role="group" aria-label="what this seed grows into"></div>' +
        '<div class="garden-flower-wrap">' + subjectSvg(openSubject, regions, entry) + '</div>' +
        '<div class="garden-flower-palette" id="garden-fpalette"></div>' +
        '<div class="garden-learned" id="garden-learned"></div>' +
        '<div class="garden-stage-note" id="garden-stage-note">paint by number. unpainted regions stay ink.</div>' +
        '<div class="garden-stage-actions">' +
          '<button type="button" class="garden-action" id="garden-tend">tend the flower</button>' +
        '</div>' +
      '</div>';

    stage.classList.add('open');
    stage.removeAttribute('inert');

    var closeBtn = document.getElementById('garden-stage-close');
    if (closeBtn) closeBtn.addEventListener('click', closeFlower);

    renderSubjects();

    var regionGs = stage.querySelectorAll('.garden-region');
    for (var r = 0; r < regionGs.length; r++) {
      (function (g) {
        g.addEventListener('click', function () { paintRegion(g.getAttribute('data-region')); });
      })(regionGs[r]);
    }

    renderFlowerPalette();
    renderLearned();

    var tend = document.getElementById('garden-tend');
    if (tend) tend.addEventListener('click', tendFlower);
  }

  // the colouring shelf: what the seed grows into. the choice is remembered
  // on the seed the moment it is made.
  function renderSubjects() {
    var row = document.getElementById('garden-subjects');
    if (!row) return;
    row.innerHTML = '';
    for (var i = 0; i < SUBJECTS.length; i++) {
      (function (s) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'garden-subject' + (s === openSubject ? ' selected' : '');
        b.textContent = s;
        b.setAttribute('aria-pressed', s === openSubject ? 'true' : 'false');
        b.addEventListener('click', function () {
          if (s === openSubject) return;
          openSubject = s;
          var st = window.Liber && window.Liber.state;
          if (st) {
            var entry = findSeed(openSeedId);
            // switching shelves keeps what was painted: fills + learned ride along
            var bloom = Object.assign({}, (entry && entry.bloom) || {}, {
              subject: s,
              fills: (function () { var f = {}; for (var id in seedFills) f[id] = seedFills[id]; return f; })(),
              learned: learnedCounts()
            });
            st.updateArtifact('garden', openSeedId, { bloom: bloom });
          }
          openFlower(openSeedId);
        });
        row.appendChild(b);
      })(SUBJECTS[i]);
    }
  }

  function findSeed(id) {
    var list = seeds();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function closeFlower() {
    if (!stage) return;
    stage.innerHTML = '';
    stage.classList.remove('open');
    stage.setAttribute('inert', '');
    openSeedId = null;
    openSubject = 'flower';
    seedFills = {};
    selectedPaint = -1;
  }

  function tendFlower() {
    if (!window.Liber || !window.Liber.state || !openSeedId) return;
    var learned = learnedCounts();
    var painted = flowerRegions.length > 0;
    for (var i = 0; i < flowerRegions.length; i++) {
      if (!seedFills[flowerRegions[i].id]) { painted = false; break; }
    }
    var fills = {};
    for (var id in seedFills) fills[id] = seedFills[id];
    window.Liber.state.updateArtifact('garden', openSeedId, {
      bloom: { subject: openSubject, fills: fills, learned: learned },
      painted: painted
    });
    chime();
    var note = document.getElementById('garden-stage-note');
    if (note) {
      note.textContent = painted
        ? 'complete. the ' + openSubject + ' is in full colour. the bed remembers.'
        : 'the bed remembers.';
    }
    renderBed();
  }

  // ─── room wiring ─────────────────────────────────────────────────────────

  function showRoom(room) {
    if (app) app.setAttribute('data-state', room);
    var bed = document.getElementById('garden-room-bed');
    var gem = document.getElementById('garden-room-gem');
    if (bed) {
      if (room === 'bed') bed.removeAttribute('inert'); else bed.setAttribute('inert', '');
    }
    if (gem) {
      if (room === 'gem') gem.removeAttribute('inert'); else gem.setAttribute('inert', '');
    }
    var tabGem = document.getElementById('garden-tab-gem');
    var tabBed = document.getElementById('garden-tab-bed');
    if (tabGem) tabGem.classList.toggle('active', room === 'gem');
    if (tabBed) tabBed.classList.toggle('active', room === 'bed');
    if (room === 'bed') renderBed();
  }

  // the watering can: drag it onto a plot to open the colouring window.
  // Pointer-based (reliable file://); plots also open on plain click.
  function wireCan() {
    var can = document.getElementById('garden-can');
    if (!can || !plotsEl) return;
    var ghost = null;
    function moveGhost(ev) {
      if (!ghost) return;
      ghost.style.left = ev.clientX + 'px';
      ghost.style.top = ev.clientY + 'px';
    }
    function up(ev) {
      document.removeEventListener('pointermove', moveGhost);
      document.removeEventListener('pointerup', up);
      if (ghost && ghost.parentNode) ghost.parentNode.removeChild(ghost);
      ghost = null;
      var el = null;
      try { el = document.elementFromPoint(ev.clientX, ev.clientY); } catch (e) {}
      var plot = el && el.closest ? el.closest('.garden-plot') : null;
      if (plot && plot.getAttribute('data-seed')) openFlower(plot.getAttribute('data-seed'));
    }
    can.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      ghost = document.createElement('div');
      ghost.className = 'garden-can-ghost';
      ghost.innerHTML = can.innerHTML;
      ghost.style.left = e.clientX + 'px';
      ghost.style.top = e.clientY + 'px';
      document.body.appendChild(ghost);
      document.addEventListener('pointermove', moveGhost);
      document.addEventListener('pointerup', up);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var newGem = document.getElementById('garden-gem-new');
    if (newGem) newGem.addEventListener('click', scrambleGem);

    // the draft exists from the first pour — planting a seed is allowed
    // at any moment, not only at the settle
    var gemDraft = document.getElementById('garden-gem-draft');
    if (gemDraft) gemDraft.addEventListener('click', function () { openDraft(false); });

    var exit = document.getElementById('garden-exit');
    if (exit) exit.addEventListener('click', function () {
      if (history.length > 1) history.back(); else location.href = 'desktop.html';
    });

    var helpBtn = document.getElementById('garden-help');
    var riason = document.getElementById('garden-raison');
    var riasonClose = document.getElementById('garden-raison-close');
    function openRiason() { if (riason) { riason.classList.add('open'); riason.removeAttribute('inert'); } }
    function closeRiason() { if (riason) { riason.classList.remove('open'); riason.setAttribute('inert', ''); } }
    if (helpBtn) helpBtn.addEventListener('click', openRiason);
    if (riasonClose) riasonClose.addEventListener('click', closeRiason);
    if (riason) riason.addEventListener('click', function (e) { if (e.target === riason) closeRiason(); });

    var plant = document.getElementById('garden-draft-plant');
    var draftClose = document.getElementById('garden-draft-close');
    if (plant) plant.addEventListener('click', function () { saveDraft(); });
    var draftName = document.getElementById('garden-draft-name');
    if (draftName) draftName.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); saveDraft(); }
    });
    if (draftClose) draftClose.addEventListener('click', function () { closeDraft('the draft faded. begin a new gem when ready.'); });
    var draft = document.getElementById('garden-draft');
    if (draft) draft.addEventListener('click', function (e) {
      if (e.target === draft) closeDraft('the draft faded. begin a new gem when ready.');
    });

    var tabGem = document.getElementById('garden-tab-gem');
    var tabBed = document.getElementById('garden-tab-bed');
    if (tabGem) tabGem.addEventListener('click', function () { showRoom('gem'); });
    if (tabBed) tabBed.addEventListener('click', function () { showRoom('bed'); });

    // the bed re-reads itself whenever state moves (saves, bfcache resync)
    if (window.Liber && window.Liber.state) {
      window.Liber.state.on('change', function () { renderBed(); });
    }

    wireCan();
    showRoom('gem');
    scrambleGem();
    renderBed();
  });

  window.Liber = window.Liber || {};
  window.Liber.garden = {
    newGem: scrambleGem,
    gemSummary: function () {
      return { settled: settledCount(), total: FACETS.length, clicks: pourLedgerCount() };
    },
    openSeed: openFlower
  };
})();
