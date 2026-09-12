// toybox.js — Pip's room, native. One big sand game with movable props:
// the full powder engine (sand, water, fire, oil, salt, seed, steam,
// sprouts, wall), element jars, a draggable crab that walks piles flat
// and a shell that plows (terrain restored on lift). No tutorial, no
// walkthrough: every prop reacts the instant it is touched. Keeps save
// to games + satchel with a polaroid. No shared imports.
(function () {
  'use strict';

  var CELL = 3, PW = 360, PH = 450;
  var GW = 120, GH = 150;

  var JARS = [
    { id: 2, name: 'sand' },
    { id: 3, name: 'water' },
    { id: 4, name: 'fire' },
    { id: 5, name: 'oil' },
    { id: 6, name: 'salt' },
    { id: 7, name: 'seed' },
    { id: 1, name: 'wall' },
    { id: -1, name: 'erase' }
  ];
  var JAR_COLORS = { 2: '#d8aa50', 3: '#4a8ac8', 4: '#e05a20', 5: '#8a7a2a', 6: '#cfc8bb', 7: '#7a9a3a', 1: '#7a6e60', '-1': '#888' };

  var sim = null;
  var crew = null;
  var cv = null, ctx = null, img = null;
  var pit = null, resultEl = null;
  var el = 2, brush = 2, pouring = false;
  var crewPick = null;   // pending spawn: 'crab' | 'snail' | 'duck'
  var paused = false;
  var lastTick = 0;
  var CREW_KINDS = ['crab', 'snail', 'duck'];

  // the shell toy: a scallop chip, hand-pixelled (the crab toy reuses the
  // resident's own sprite — the travellers left toys of the real crew)
  var SHELL_ART = { w: 9, h: 8, pal: { s: '#e8dcc0', c: '#c8b088', h: '#f4ecd8', d: '#8a7048' }, rows: [
    '....s....',
    '...scs...',
    '..schcs..',
    '.schhhcs.',
    'scchhhhcs',
    'scchhhhcs',
    '.scccccs.',
    '..ddddd..'
  ] };

  function drawArt(cv2, art, scale) {
    cv2.width = art.w * scale;
    cv2.height = art.h * scale;
    var x2 = cv2.getContext('2d');
    for (var r = 0; r < art.h; r++) {
      for (var q = 0; q < art.w; q++) {
        var ch = art.rows[r][q];
        if (ch === '.' || !art.pal[ch]) continue;
        x2.fillStyle = art.pal[ch];
        x2.fillRect(q * scale, r * scale, scale, scale);
      }
    }
  }

  // the basin fits the world exactly: largest 4:5 well between the
  // splashback and the floor line, so the canvas never distorts
  function fitBasin() {
    if (!pit || !pit.parentElement) return;
    var app = pit.parentElement;
    var aw = app.clientWidth, ah = app.clientHeight;
    if (!aw || !ah) return;
    var topPad = 162;   /* below the splashback + drip rack (118+38=156) */
    var botPad = 46;
    app.style.setProperty('--basin-half', '110px');
    var availH = ah - topPad - botPad;
    var availW = aw - 18;
    if (availH < 150 || availW < 160) {
      var fw = Math.max(110, Math.min(160, availW));
      var fh = Math.round(fw * 1.25);
      app.style.setProperty('--basin-half', Math.round(fw / 2) + 'px');
      pit.style.width = fw + 'px';
      pit.style.height = fh + 'px';
      pit.style.left = Math.round((aw - fw) / 2) + 'px';
      pit.style.top = Math.max(40, Math.round((ah - fh) / 2)) + 'px';
      pit.style.transform = 'none';
      return;
    }
    var w = Math.min(availW, availH * 0.8, 340);
    w = Math.max(150, Math.round(w));
    var h = Math.round(w * 1.25);
    if (h > availH) {
      h = availH;
      w = Math.max(120, Math.round(Math.min(w, h * 0.8)));
      h = Math.round(w * 1.25);
    }
    app.style.setProperty('--basin-half', Math.round(w / 2) + 'px');
    pit.style.width = w + 'px';
    pit.style.height = h + 'px';
    pit.style.left = Math.round((aw - w) / 2) + 'px';
    pit.style.top = topPad + Math.round((availH - h) / 2) + 'px';
    pit.style.transform = 'none';
  }

  function tick() {
    var now = Date.now();
    if (now - lastTick < 160) return;
    lastTick = now;
    if (window.Liber && window.Liber.sound) { try { window.Liber.sound.play('tick'); } catch (e) {} }
  }
  function thunk() {
    if (window.Liber && window.Liber.sound) { try { window.Liber.sound.play('thunk'); } catch (e) {} }
  }

  function thumb(srcCanvas, w) {
    try {
      w = w || 160;
      var scale = w / srcCanvas.width;
      var c = document.createElement('canvas');
      c.width = w;
      c.height = Math.max(1, Math.round(srcCanvas.height * scale));
      var x = c.getContext('2d');
      x.fillStyle = '#101010';
      x.fillRect(0, 0, c.width, c.height);
      x.drawImage(srcCanvas, 0, 0, c.width, c.height);
      return c.toDataURL('image/jpeg', 0.72);
    } catch (e) { return null; }
  }

  function saveKeep(names, shot) {
    if (!window.Liber || !window.Liber.state) return;
    var st = sim.state();
    var payload = { kind: 'toybox', name: 'pip’s toybox', glyph: '◍', result: { strokes: st.strokes, elements: names }, ts: Date.now() };
    if (shot) payload.shot = shot;
    if (window.Liber.state.addArtifact) window.Liber.state.addArtifact('games', payload);
    if (window.Liber.state.addArtifact) {
      var mirror = { kind: 'game', ref: 'toybox', name: 'pip’s toybox', result: payload.result, ts: Date.now() };
      if (shot) mirror.shot = shot;
      window.Liber.state.addArtifact('satchel', mirror);
    }
    if (window.Liber.sound) { try { window.Liber.sound.play('chime'); } catch (e) {} }
  }

  function cellPos(e) {
    var r = cv.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(GW - 1, Math.floor((e.clientX - r.left) * (GW / r.width)))),
      y: Math.max(0, Math.min(GH - 1, Math.floor((e.clientY - r.top) * (GH / r.height))))
    };
  }

  function paint() {
    var px = img.data;
    var pals = window.LiberPowder.PALETTES;
    for (var y = 0; y < GH; y++) {
      for (var x = 0; x < GW; x++) {
        var v = sim.at(x, y);
        var rC = 40, gC = 48, bC = 44;   /* dim porcelain under the bulb */
        if (v !== 0) {
          var pal = pals[v] || [[200, 200, 200]];
          var cc = pal[sim.shadeAt(x, y) % pal.length];
          rC = cc[0]; gC = cc[1]; bC = cc[2];
        }
        for (var sy = 0; sy < CELL; sy++) {
          for (var sx = 0; sx < CELL; sx++) {
            var o = (((y * CELL + sy) * PW) + (x * CELL + sx)) * 4;
            px[o] = rC; px[o + 1] = gC; px[o + 2] = bC; px[o + 3] = 255;
          }
        }
      }
    }
    ctx.putImageData(img, 0, 0);
    // the crew draws over the powder, in cell scale
    crew.draw(ctx, CELL, Date.now() / 100);
  }

  // ── toys: one verb, one sound, zero text ────────────────────────────

  function toyCenter(t) {
    var pr = pit.getBoundingClientRect();
    var r = t.getBoundingClientRect();
    return {
      x: (r.left + r.width / 2 - pr.left) * (GW / pr.width),
      y: (r.top + r.height / 2 - pr.top) * (GH / pr.height)
    };
  }

  function makeDraggable(node, hooks) {
    var active = false;
    function move(e) {
      if (!active) return;
      var pr = pit.getBoundingClientRect();
      var x = e.clientX - pr.left - 23;
      var y = e.clientY - pr.top - 23;
      x = Math.max(0, Math.min(pr.width - 46, x));
      y = Math.max(0, Math.min(pr.height - 46, y));
      node.style.left = x + 'px';
      node.style.top = y + 'px';
      if (hooks && hooks.hold) hooks.hold();
    }
    node.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      active = true;
      try { node.setPointerCapture(e.pointerId); } catch (err) {}
      node.classList.add('held');
      move(e);
    });
    node.addEventListener('pointermove', move);
    function up() {
      if (!active) return;
      active = false;
      node.classList.remove('held');
      if (hooks && hooks.release) hooks.release();
    }
    node.addEventListener('pointerup', up);
    node.addEventListener('pointercancel', up);
  }

  var shellStamped = [];

  function erodeAt(gx, gy, r) {
    for (var dy = -r; dy <= r; dy++) {
      for (var dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy > r * r) continue;
        var x = Math.round(gx + dx), y = Math.round(gy + dy);
        if (x < 0 || y < 0 || x >= GW || y >= GH) continue;
        var v = sim.at(x, y);
        if (v !== 0 && v !== 1) sim.setAt(x, y, 0, 0, 0);
      }
    }
  }

  function wireToys() {
    var crab = document.getElementById('toy-crab');
    var shell = document.getElementById('toy-shell');
    if (!crab || !shell) return;
    // enamel-chip portraits of the residents themselves
    try {
      var spr = window.LiberCrew && window.LiberCrew.SPRITES;
      if (spr && spr.crab && spr.crab.walk && spr.crab.walk[0]) {
        var cc = document.createElement('canvas');
        drawArt(cc, { w: spr.crab.w, h: spr.crab.h, pal: spr.crab.pal, rows: spr.crab.walk[0] }, 3);
        crab.textContent = '';
        crab.appendChild(cc);
      }
    } catch (e) {}
    var sc = document.createElement('canvas');
    drawArt(sc, SHELL_ART, 3);
    shell.textContent = '';
    shell.appendChild(sc);
    makeDraggable(crab, {
      hold: function () {
        var g = toyCenter(crab);
        erodeAt(g.x, g.y, 5);
        tick();
      }
    });
    makeDraggable(shell, {
      hold: function () {
        var g = toyCenter(shell);
        for (var dy = -2; dy <= 2; dy++) {
          for (var dx = -2; dx <= 2; dx++) {
            var x = Math.round(g.x + dx), y = Math.round(g.y + dy);
            if (x < 0 || y < 0 || x >= GW || y >= GH) continue;
            if (sim.at(x, y) === 0) {
              sim.setAt(x, y, 1, 0, 0);
              shellStamped.push([x, y]);
            }
          }
        }
        tick();
      },
      release: function () {
        // terrain restored on lift
        for (var i = 0; i < shellStamped.length; i++) {
          var c = shellStamped[i];
          if (sim.at(c[0], c[1]) === 1) sim.setAt(c[0], c[1], 0, 0, 0);
        }
        shellStamped = [];
      }
    });
  }

  function buildJars() {
    var bar = document.getElementById('toybox-jars');
    if (!bar) return;
    bar.innerHTML = '';
    JARS.forEach(function (o) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'toybox-jar' + (o.id === el ? ' on' : '');
      b.textContent = o.name;
      b.style.setProperty('--jc', JAR_COLORS[o.id] || '#c8a878');
      b.addEventListener('click', function () {
        el = o.id;
        var sibs = bar.querySelectorAll('.toybox-jar');
        for (var k = 0; k < sibs.length; k++) sibs[k].classList.remove('on');
        b.classList.add('on');
      });
      bar.appendChild(b);
    });
  }

  function loop() {
    if (document.body.contains(cv) && !document.hidden) {
      if (!paused) {
        sim.step();
        crew.step();
      }
      paint();
    }
    requestAnimationFrame(loop);
  }

  function paintCrewButtons() {
    var bar = document.getElementById('toybox-crew');
    if (!bar || !window.LiberCrew) return;
    CREW_KINDS.forEach(function (kind) {
      var b = bar.querySelector('[data-crew="' + kind + '"]');
      if (!b) return;
      var sp = window.LiberCrew.SPRITES[kind];
      var c = document.createElement('canvas');
      c.width = sp.w * 3; c.height = sp.h * 3;
      var x2 = c.getContext('2d');
      var frame = sp.walk[0];
      for (var r = 0; r < sp.h; r++) {
        for (var q = 0; q < sp.w; q++) {
          var ch = frame[r][q];
          if (ch === '.') continue;
          x2.fillStyle = sp.pal[ch];
          x2.fillRect(q * 3, r * 3, 3, 3);
        }
      }
      c.className = 'toybox-crew-art';
      b.textContent = '';
      b.appendChild(c);
      var lbl = document.createElement('span');
      lbl.className = 'toybox-crew-name';
      lbl.textContent = kind;
      b.appendChild(lbl);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!window.LiberPowder) return;
    sim = window.LiberPowder.create();
    crew = window.LiberCrew.create(sim);
    cv = document.getElementById('toybox-canvas');
    pit = document.getElementById('toybox-pit');
    resultEl = document.getElementById('toybox-result');
    if (!cv || !pit) return;
    ctx = cv.getContext('2d');
    img = ctx.createImageData(PW, PH);

    buildJars();
    wireToys();
    paintCrewButtons();
    fitBasin();
    window.addEventListener('resize', fitBasin);

    // probe hooks (acceptance passes read these; harmless in production)
    window.__sinkSim = sim;
    try {
      Object.defineProperty(window, '__sinkCrew', { get: function () { return crew.list(); }, configurable: true });
    } catch (e) { window.__sinkCrew = crew.list(); }

    cv.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      pouring = true;
      try { cv.setPointerCapture(e.pointerId); } catch (err) {}
      var p = cellPos(e);
      if (crewPick) { placeCrew(p); pouring = false; return; }
      sim.pour(p.x, p.y, el, brush);
    });
    cv.addEventListener('pointermove', function (e) {
      if (!pouring) return;
      var p = cellPos(e);
      sim.pour(p.x, p.y, el, brush);
    });
    function stopPour() { pouring = false; }
    cv.addEventListener('pointerup', stopPour);
    cv.addEventListener('pointercancel', stopPour);
    cv.addEventListener('pointerleave', stopPour);

    var sweep = document.getElementById('toybox-sweep');
    if (sweep) sweep.addEventListener('click', function () {
      sim.reset();
      shellStamped = [];
      if (resultEl) resultEl.textContent = 'clean sand. touch everything.';
    });

    // pause / drain: the tray obeys, the crew keeps its place
    var pauseBtn = document.getElementById('toybox-pause');
    if (pauseBtn) pauseBtn.addEventListener('click', function () {
      paused = !paused;
      var pauseLabel = pauseBtn.querySelector('span');
      if (pauseLabel) pauseLabel.textContent = paused ? 'tap off' : 'tap on';
      pauseBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
      if (resultEl) resultEl.textContent = paused ? 'the tap squeaks shut. the world holds its breath.' : 'the tap opens. the world runs.';
    });
    var drainBtn = document.getElementById('toybox-drain');
    if (drainBtn) drainBtn.addEventListener('click', function () {
      for (var y = 0; y < GH; y++) {
        for (var x = 0; x < GW; x++) {
          var v = sim.at(x, y);
          if (v === sim.WATER || v === sim.OIL || v === sim.STEAM) sim.setAt(x, y, 0, 0, 0);
        }
      }
      if (resultEl) resultEl.textContent = 'the plug pulls. the wet things go to the sea.';
    });

    // crew dispensers: pick a resident, click the tray to place it
    var crewBar = document.getElementById('toybox-crew');
    if (crewBar) {
      var crewBtns = crewBar.querySelectorAll('[data-crew]');
      Array.prototype.forEach.call(crewBtns, function (b) {
        b.addEventListener('click', function () {
          var kind = b.getAttribute('data-crew');
          if (crewPick === kind) {
            crewPick = null;
            b.classList.remove('on');
            if (resultEl) resultEl.textContent = 'crew picker set down.';
            return;
          }
          crewPick = kind;
          Array.prototype.forEach.call(crewBtns, function (o) { o.classList.remove('on'); });
          b.classList.add('on');
          if (resultEl) resultEl.textContent = kind + ' in hand — click the tray to place.';
        });
      });
    }
    function placeCrew(p) {
      var kind = crewPick;
      crewPick = null;
      Array.prototype.forEach.call(document.querySelectorAll('#toybox-crew [data-crew]'), function (o) { o.classList.remove('on'); });
      crew.removeAt(p.x, p.y, 4); // one resident per spot
      crew.spawn(kind, p.x, p.y - 2);
      thunk();
      if (resultEl) resultEl.textContent = 'a ' + kind + ' moves in.';
    }

    var keep = document.getElementById('toybox-keep');
    if (keep) keep.addEventListener('click', function () {
      var st = sim.state();
      if (!st.strokes && !crew.count()) {
        if (resultEl) resultEl.textContent = 'pour something first — the box is still empty.';
        return;
      }
      paint(); // crew composited into the shot
      var shot = thumb(cv);
      var names = sim.census();
      var residents = crew.list().map(function (c) { return c.kind; });
      if (residents.length) names.push(residents.length + ' crew');
      saveKeep(names, shot);
      if (resultEl) resultEl.textContent = 'kept. pip keeps the picture' + (residents.length ? ' — crew and all.' : '.');
      thunk();
    });

    var exit = document.getElementById('toybox-exit');
    if (exit) exit.addEventListener('click', function () {
      if (history.length > 1) history.back(); else location.href = 'desktop.html';
    });

    var helpBtn = document.getElementById('toybox-help');
    var raison = document.getElementById('toybox-raison');
    var raisonClose = document.getElementById('toybox-raison-close');
    function openRaison() {
      if (raison) { raison.classList.add('open'); raison.removeAttribute('inert'); }
    }
    function closeRaison() {
      if (raison) { raison.classList.remove('open'); raison.setAttribute('inert', ''); }
    }
    if (helpBtn) helpBtn.addEventListener('click', openRaison);
    if (raisonClose) raisonClose.addEventListener('click', closeRaison);
    if (raison) raison.addEventListener('click', function (e) { if (e.target === raison) closeRaison(); });
    if (window.LiberRoomShell) window.LiberRoomShell.bindRoomOverlays({ overlays: [
      { id: 'toybox-raison', close: closeRaison }
    ] });

    requestAnimationFrame(loop);
  });
})();
