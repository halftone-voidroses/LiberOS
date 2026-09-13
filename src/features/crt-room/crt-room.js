// crt-room.js — the Room Behind the CRT (redesign pitch SYSTEM 02).
// The screen shows the OS; behind it is a room, and the room is where the
// machine keeps what you did. Every hook is fed by real state — nothing
// decorative:
//
//   shelf    one ledger volume per satchel keep (s.satchel)
//   pool     rises with every sea release and graveyard burial (s.sea, s.graveyard)
//   candle   session arc — melts across the visit, relit on return
//            (s.sessionStart; the same owner gamification.js writes, never here)
//   board    one pinned card + red string per relation (s.relations)
//   trophies one tin trophy per patina tier on the CRT's top (shadow.js math)
//   window   the Glasshouse tree mirrored (s.tree read-only; garden owns it)
//   weather  Rainy Day falls here (s.shadowOn — one owner, mirrored everywhere)
//   patina   visits+keeps tiers age the dust, floor, and furniture
//
// Reads state only through window.Liber.state. No shared imports (covenant).
// Motion with consent; diegetic text only — the room's own labels.

(function () {
  'use strict';

  // Patina thresholds mirror src/shadow.js PATINA_TIERS (visits + keeps).
  var PATINA_TIERS = [2, 6, 12];
  var KEEP_KINDS = ['buddy', 'divination', 'games', 'learn', 'abstract',
    'sea', 'garden', 'dreams', 'satchel', 'methodology', 'council'];

  // The glasshouse tree's stage math, mirrored read-only from
  // src/features/garden/tree.js (which owns s.tree). 40 min per stage,
  // 5 stages; growth accrues from `seen` while unwatched.
  var TREE_STAGE_MS = 40 * 60 * 1000;
  var TREE_STAGES = 5;

  // The session candle: a fresh stick each sitting, a hair shorter per
  // minute spent at the machine. The machine keeps one hour of wax.
  var CANDLE_MS = 60 * 60 * 1000;
  var CANDLE_MIN_H = 10;   // px of stub left when the hour is spent

  var PAGE_KEY = (location.pathname.split('/').pop() || 'index.html')
    .replace(/\.html$/, '');

  function st() { return (window.Liber && window.Liber.state) || null; }

  function el(tag, cls) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ── state → scene facts ────────────────────────────────────────────────

  function tierOf(s) {
    var visits = Object.keys(s.visited || {}).length;
    var keeps = 0;
    for (var i = 0; i < KEEP_KINDS.length; i++) {
      if (Array.isArray(s[KEEP_KINDS[i]])) keeps += s[KEEP_KINDS[i]].length;
    }
    var t = 0;
    for (var j = 0; j < PATINA_TIERS.length; j++) {
      if (visits + keeps >= PATINA_TIERS[j]) t = j + 1;
    }
    return t;
  }

  // shelf: one volume per satchel keep; each keep kind stains its spine
  var SPINES = {
    note: '#7a6a8a', kept: '#8a5a3a', dream: '#5a6a8a', game: '#8a6a2a',
    'tree-pressing': '#5a7a4a', 'kept-reason': '#7a4a4a'
  };
  function shelfKeeps(s) {
    var arr = Array.isArray(s.satchel) ? s.satchel : [];
    return arr.slice(-24).map(function (e, i) {
      var h = 30 + ((i * 7 + arr.length * 3) % 22);
      return { kind: (e && e.kind) || 'kept', h: h, w: 6 + ((i * 5) % 5), i: i };
    });
  }

  // pool: releases + burials, the water table shared with the yard (S.6)
  function poolLevel(s) {
    var sea = Array.isArray(s.sea) ? s.sea.length : 0;
    var grave = Array.isArray(s.graveyard) ? s.graveyard.length : 0;
    return Math.min(1, (sea + grave) / 12);
  }

  // candle: melts across the sitting, relit on return (sitting = gamification's)
  function candleH(s) {
    if (!s.sessionStart) return 64;
    var spent = Date.now() - s.sessionStart;
    return Math.max(CANDLE_MIN_H, 64 - Math.floor(54 * Math.min(1, spent / CANDLE_MS)));
  }

  // window box: the glasshouse tree's stage, computed the same way it computes
  function treeStageOf(s) {
    var t = s.tree;
    if (!t || !t.planted) return -1;               // no seed yet: empty box
    var stageAt = t.stageAt || t.planted;
    var grown = t.grown || 0;
    // accrue what the tree would have grown while nobody watched —
    // the same arithmetic as tree.js accrue()+fold(), read-only here
    var seen = t.seen || stageAt;
    var away = Date.now() - seen;
    var stg = Math.floor((stageAt - t.planted) / TREE_STAGE_MS);
    if (stg < TREE_STAGES && away > 0) {
      var g = grown + away;
      while (g >= TREE_STAGE_MS && stg < TREE_STAGES) { g -= TREE_STAGE_MS; stg++; }
      if (stg < TREE_STAGES) grown = g;
    }
    return Math.max(0, Math.min(TREE_STAGES, stg));
  }

  // corkboard: pinned cards + red string per relation
  function relationPins(s) {
    return (Array.isArray(s.relations) ? s.relations : []).slice(-9)
      .map(function (r, i) {
        var rngx = (i * 61 + ((r.verb || '').length * 13)) % 100;
        var rngy = (i * 37 + ((r.from || '').length * 17)) % 100;
        return {
          x: 8 + (rngx % 78), y: 10 + (rngy % 72),
          nx: 8 + ((rngx + 31) % 78), ny: 10 + ((rngy + 43) % 72),
          twoWay: i % 2 === 0, verb: r.verb || 'relates to', i: i
        };
      });
  }

  // ── build ──────────────────────────────────────────────────────────────

  var ui = null;

  function build() {
    var scene = el('div', 'crt-room-scene');
    scene.id = 'crt-room';
    scene.setAttribute('aria-hidden', 'true');
    scene.setAttribute('data-tier', '0');

    var wall = el('div', 'crt-room-wall');
    var floor = el('div', 'crt-room-floor');
    var patina = el('div', 'crt-room-patina');

    // the window + sill + box
    var win = el('div', 'crt-window');
    var sky = el('div', 'crt-wb-sky');
    win.appendChild(sky);
    var sill = el('div', 'crt-windowbox');
    // (the box hangs beneath the window — appended to the scene, not the
    // window, which clips its overflow)
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'xMidYMax meet');
    svg.innerHTML =
      '<path class="crt-wb-pot" d="M38 78 L62 78 L59 96 L41 96 Z"/>' +
      '<path class="crt-wb-trunk" d="M49 78 L49 62 Q50 56 51 52"/>' +
      '<path class="crt-wb-bough" d="M51 52 Q40 46 36 38 Q48 42 52 48 Q56 40 66 38 Q60 46 52 52"/>' +
      '<circle class="crt-wb-crown" cx="50" cy="34" r="16"/>' +
      '<circle class="crt-wb-crown2" cx="38" cy="40" r="9"/>' +
      '<circle class="crt-wb-crown3" cx="62" cy="38" r="10"/>' +
      '<g class="crt-wb-fruit"></g>';
    sill.appendChild(svg);
    var glow = el('i', 'crt-wb-glow');
    sill.appendChild(glow);
    win.appendChild(sill);

    // the shelf — four boards, one row of volumes resting on each
    var shelf = el('div', 'crt-shelf');
    var shelfRows = [];
    for (var b = 0; b < 4; b++) {
      var board = el('i', 'crt-shelf-board');
      board.style.top = (b * 25 + 24) + '%';
      shelf.appendChild(board);
      var row = el('div', 'crt-shelf-row');
      row.style.top = (b * 25) + '%';
      shelf.appendChild(row);
      shelfRows.push(row);
    }

    // the corkboard
    var board = el('div', 'crt-board');
    var bsvg = document.createElementNS(NS, 'svg');
    bsvg.setAttribute('viewBox', '0 0 100 100');
    bsvg.setAttribute('preserveAspectRatio', 'none');
    bsvg.innerHTML = '<path class="crt-strings" d=""/>';
    board.appendChild(bsvg);

    // trophies
    var tro = el('div', 'crt-trophies');
    for (var t = 0; t < 3; t++) tro.appendChild(el('i', 'crt-trophy'));

    // the card box
    var cardbox = el('div', 'crt-cardbox');

    // the pool
    var pool = el('div', 'crt-pool');
    var pbody = el('i', 'crt-pool-body');
    pbody.id = 'crt-pool-body';
    var pline = el('i', 'crt-pool-line');
    pool.appendChild(pbody); pool.appendChild(pline);

    // the candle
    var candle = el('div', 'crt-candle');
    candle.id = 'crt-candle';
    var flame = el('i', 'crt-candle-flame');
    var stick = el('i', 'crt-candle-stick');
    candle.appendChild(flame); candle.appendChild(stick);

    scene.appendChild(wall);
    scene.appendChild(floor);
    scene.appendChild(patina);
    scene.appendChild(win);
    scene.appendChild(sill);
    scene.appendChild(shelf);
    scene.appendChild(board);
    scene.appendChild(tro);
    scene.appendChild(cardbox);
    scene.appendChild(pool);
    scene.appendChild(candle);

    document.body.appendChild(scene);

    // the trophies live on the machine's own top edge — they recede with it
    try {
      var machine = document.querySelector('.machine');
      if (machine) machine.appendChild(tro);
    } catch (e) {}

    // the look-behind affordance — plain label, the room's own function
    var toggle = el('button', 'crt-room-toggle');
    toggle.id = 'crt-room-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'crt-room');
    toggle.textContent = 'look behind';
    document.body.appendChild(toggle);

    ui = {
      scene: scene, toggle: toggle,
      poolBody: pbody, shelfRows: shelfRows, bsvgPath: bsvg.querySelector('.crt-strings'),
      trophies: tro.children, candle: candle, stick: stick,
      fruit: svg.querySelector('.crt-wb-fruit'),
      svg: svg, treeBits: {
        pot: svg.querySelector('.crt-wb-pot'), trunk: svg.querySelector('.crt-wb-trunk'),
        bough: svg.querySelector('.crt-wb-bough'),
        c1: svg.querySelector('.crt-wb-crown'), c2: svg.querySelector('.crt-wb-crown2'),
        c3: svg.querySelector('.crt-wb-crown3')
      }
    };

    toggle.addEventListener('click', function () { setOpen(!isInitedOpen()); });

    window.addEventListener('resize', function () {
      if (document.body.classList.contains('crt-room-open')) renderAll();
    });
  }

  function isInitedOpen() {
    return document.body.classList.contains('crt-room-open');
  }

  // ── open / close ───────────────────────────────────────────────────────

  function setOpen(open) {
    if (!ui) return;
    document.body.classList.toggle('crt-room-open', open);
    ui.scene.classList.toggle('open', open);
    ui.scene.setAttribute('aria-hidden', open ? 'false' : 'true');
    ui.toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    ui.toggle.textContent = open ? 'back to the screen' : 'look behind';
    // the gaze is a view preference of this visit, not a kept fact —
    // sessionStorage scope, one owner here
    try {
      if (open) sessionStorage.setItem('liber_crt_room_open', '1');
      else sessionStorage.removeItem('liber_crt_room_open');
    } catch (e) { /* private modes skip it */ }
    if (open) {
      try { if (window.Liber && window.Liber.sound) window.Liber.sound.play('chime'); } catch (e) {}
      renderAll();
      // Escape walks out the way it came in
      document.addEventListener('keydown', escOut, true);
    } else {
      document.removeEventListener('keydown', escOut, true);
    }
  }

  function escOut(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopImmediatePropagation();
      setOpen(false);
    }
  }

  // ── render: state → the room ───────────────────────────────────────────

  var lastSig = '';

  function renderAll() {
    if (!ui) return;
    var lib = st();
    if (!lib) return;
    var s = lib.get() || {};

    // signature: re-render only when a feed changed
    var sig = [
      (s.satchel || []).length, (s.sea || []).length, (s.graveyard || []).length,
      (s.relations || []).length, s.shadowOn ? 1 : 0, s.sessionStart || 0,
      s.tree ? (s.tree.stageAt || 0) + '-' + (s.tree.grown || 0) + '-' + (s.tree.seen || 0) : 'x'
    ].join('|');
    var open = isInitedOpen();
    if (sig === lastSig && document.querySelector('.crt-room-scene[data-tier]')) {
      if (!open) return;
    }
    lastSig = sig;

    // patina tier
    var tier = tierOf(s);
    if (String(tier) !== ui.scene.getAttribute('data-tier')) {
      ui.scene.setAttribute('data-tier', String(tier));
    }
    for (var i = 0; i < ui.trophies.length; i++) {
      ui.trophies[i].classList.toggle('on', i < tier);
    }

    // Rainy Day — the same owner as the machine's shadow-on class
    var rainy = !!s.shadowOn;
    ui.scene.classList.toggle('crt-room-rainy', rainy);

    // shelf: one volume per satchel keep — six to a board, four boards,
    // and the shelf fills the way a shelf fills: bottom board first
    var PER_ROW = 6;
    var ROWS = ui.shelfRows.length;
    var keeps = shelfKeeps(s);
    var want = Math.min(keeps.length, PER_ROW * ROWS);
    var have = ui.scene.querySelectorAll('.crt-volume').length;
    var filled = 0; // keeps already standing on the boards
    if (have < want) {
      // rows hold their full share before the next board takes any
      var perRowFill = [];
      for (var r = 0; r < ROWS; r++) {
        var rowCount = Math.max(0, Math.min(PER_ROW, want - r * PER_ROW));
        perRowFill.push(rowCount);
      }
      for (var k = have; k < want; k++) {
        var v = el('i', 'crt-volume' + (keeps[k].i % 7 === 3 ? ' leaned' : ''));
        v.style.height = keeps[k].h + 'px';
        v.style.width = keeps[k].w + 'px';
        var c = SPINES[keeps[k].kind] || '#6a5a44';
        var dk = shade(c, -1);
        v.style.background = 'linear-gradient(180deg,' + shade(c, 1) + ' 0%,' + c + ' 55%,' + dk + ' 100%)';
        ui.shelfRows[ROWS - 1 - Math.floor(k / PER_ROW)].appendChild(v);
      }
      filled = want;
    } else if (have > want) {
      var vols = ui.scene.querySelectorAll('.crt-volume');
      for (var d = vols.length - 1; d >= want; d--) vols[d].remove();
      filled = want;
    } else {
      filled = have;
    }
    var total = (s.satchel || []).length;
    if (total > PER_ROW * ui.shelfRows.length && !ui.scene.querySelector('.crt-shelf-more')) {
      var m = el('span', 'crt-shelf-more');
      m.textContent = '+' + (total - PER_ROW * ui.shelfRows.length) + ' on the lower shelves';
      ui.shelfRows[ui.shelfRows.length - 1].appendChild(m);
    } else if (total <= PER_ROW * ui.shelfRows.length) {
      var m2 = ui.scene.querySelector('.crt-shelf-more');
      if (m2) m2.remove();
    }

    // pool: releases + burials raise the water
    ui.poolBody.style.height = Math.max(4, Math.round(poolLevel(s) * 100)) + '%';

    // candle: melts across the sitting; relit by the next sessionStart
    var h = candleH(s);
    ui.stick.style.setProperty('--crt-candle-h', h + 'px');
    ui.candle.classList.toggle('spent', h <= CANDLE_MIN_H + 1);

    // corkboard: a pin + red string per relation
    var pins = relationPins(s);
    var oldPins = ui.bsvgPath.parentNode.querySelectorAll('.crt-pin');
    for (var p = 0; p < oldPins.length; p++) oldPins[p].remove();
    var d = '';
    for (var q = 0; q < pins.length; q++) {
      d += 'M' + pins[q].x.toFixed(1) + ' ' + pins[q].y.toFixed(1) +
           ' Q' + ((pins[q].x + pins[q].nx) / 2).toFixed(1) + ' ' +
           (Math.min(pins[q].y, pins[q].ny) - 6).toFixed(1) + ' ' +
           pins[q].nx.toFixed(1) + ' ' + pins[q].ny.toFixed(1) + ' ';
      var pin = el('i', 'crt-pin');
      pin.style.left = pins[q].x + '%';
      pin.style.top = pins[q].y + '%';
      ui.bsvgPath.parentNode.appendChild(pin);
    }
    ui.bsvgPath.setAttribute('d', d || 'M0 0');
    ui.bsvgPath.style.display = pins.length ? 'block' : 'none';

    // window box: the glasshouse tree, stage for stage with the garden
    var stage = treeStageOf(s);
    drawTree(stage);

    if (open) {
      // aria: the room keeps what you keep — say only what is new
      ui.toggle.setAttribute('title',
        'the shelf holds ' + total + ' · the pool sits at ' + Math.round(poolLevel(s) * 100) + '%');
    }
  }

  function shade(hex, dir) {
    var n = parseInt(hex.slice(1), 16);
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    var f = dir > 0 ? 1.25 : 0.65;
    r = Math.min(255, Math.round(r * f));
    g = Math.min(255, Math.round(g * f));
    b = Math.min(255, Math.round(b * f));
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  // five stages, then the seasonal crown — matching the glasshouse's own
  // stage names: planted → sapling → young wood → grown on → mature → in season
  function drawTree(stage) {
    var T = ui.treeBits, show;
    function disp(v) { T[v].style.display = show ? 'block' : 'none'; }
    // pot always there once a seed exists
    show = stage >= 0; disp('pot');
    show = stage >= 1; disp('trunk');
    show = stage >= 2; disp('bough');
    show = stage >= 2; disp('c1');
    show = stage >= 3; disp('c2');
    show = stage >= 4; disp('c3');
    // in season: fruit
    while (ui.fruit.firstChild) ui.fruit.removeChild(ui.fruit.firstChild);
    if (stage >= TREE_STAGES) {
      var spots = [[44, 26], [56, 30], [50, 40], [40, 36], [58, 22]];
      var NS = 'http://www.w3.org/2000/svg';
      for (var f = 0; f < spots.length; f++) {
        var c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', spots[f][0]); c.setAttribute('cy', spots[f][1]);
        c.setAttribute('r', 2.1);
        c.setAttribute('class', 'crt-wb-fruit-dot');
        ui.fruit.appendChild(c);
      }
    }
  }

  // ── settings mirror ────────────────────────────────────────────────────
  // settings.html's maintenance panel gets the same toggle; one owner
  // (s.crtRoomOn), mirrored everywhere.

  function settingsToggle() {
    var lib = st();
    if (!lib) return;
    var s = lib.get() || {};
    // undefined counts as on — the room is part of the machine unless hidden
    var nowOn = s.crtRoomOn !== false;
    lib.set({ crtRoomOn: !nowOn });
    if (nowOn && isInitedOpen()) setOpen(false); // hidden mid-gaze closes
  }

  // exported for settings.js and the acceptance script
  window.Liber = window.Liber || {};
  window.Liber.crtRoom = {
    open: function () { setOpen(true); },
    close: function () { setOpen(false); },
    isOpen: isInitedOpen,
    toggleSettings: settingsToggle,
    render: renderAll,
    facts: function () {
      var s = (st() && st().get()) || {};
      return {
        tier: tierOf(s),
        keeps: (s.satchel || []).length,
        pool: poolLevel(s),
        candle: candleH(s),
        relations: (s.relations || []).length,
        rainy: !!s.shadowOn,
        treeStage: treeStageOf(s),
        volumes: ui ? ui.scene.querySelectorAll('.crt-volume').length : 0,
        open: isInitedOpen()
      };
    }
  };

  // ── init ───────────────────────────────────────────────────────────────

  function init() {
    if (!st()) return;
    if (!document.getElementById('crt-room')) build();
    var s = st().get() || {};
    renderAll();
    if (st().on) st().on('change', renderAll);
    // the candle burns while you sit
    setInterval(function () { if (isInitedOpen()) renderAll(); }, 60 * 1000);
    // a gaze held across a reload — the visit keeps looking where it looked
    var wasOpen = false;
    try { wasOpen = sessionStorage.getItem('liber_crt_room_open') === '1'; } catch (e) {}
    if (s.crtRoomOn !== false) {
      ui.toggle.style.display = '';
      if (wasOpen) setOpen(true);
    } else {
      ui.toggle.style.display = 'none';
      if (wasOpen) setOpen(false);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
