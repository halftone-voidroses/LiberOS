// games.js — Whimsy Wow. Eight honest attractions around one midway;
// everything kept. The camera moves between posters before the stage opens.
// Results save to games + satchel with a polaroid shot. No shared imports.

(function () {
  var grid = document.getElementById('games-grid');
  var descBox = document.getElementById('games-desc');
  var stage = document.getElementById('games-stage');
  var app = document.querySelector('.games-app');
  var panLeft = document.getElementById('games-pan-left');
  var panRight = document.getElementById('games-pan-right');
  var cameraIndex = 1;
  var CAMERA_ORDER = ['mask', 'wheel', 'shield', 'circles', 'sand', 'tidepool', 'inkstorm', 'thimble'];

  function setView(view) {
    if (app) app.setAttribute('data-view', view);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  var GAMES = [
    { id: 'wheel', name: 'emotion wheel', glyph: '◉',
      material: 'painted wheel · three throws',
      pitch: 'Step right up! The wheel knows twelve feelings and your arm knows the truth. Throw a dart, land on one — no dodging! Then pick the color it feels like and watch it flood the tent. Three darts, three honest answers. Keep the prettiest.' },
    { id: 'mask', name: 'communication mask', glyph: '◭',
      material: 'split face · two truths',
      pitch: 'Everybody wears one — here is yours to paint! Left side: what you FEEL inside. Right side: what you SHOW the world. Same face, two truths. Paint it loud, then keep it.' },
    { id: 'shield', name: 'boundaries shield', glyph: '◈',
      material: 'four quarters · your rules',
      pitch: 'Four quarters, four boundaries: body, heart, clock, and mind. Color in how strong each wall is right now — bright means solid, dark means needs work. Your shield, your rules!' },
    { id: 'circles', name: 'relationship circles', glyph: '◎',
      material: 'three rings · honest seating',
      pitch: 'Three rings: closest, friends, distant. Write the names where they actually belong — not where they wish they belonged. An honest seating chart. Keep it.' },
    { id: 'sand', name: 'powder tent', glyph: '▦',
      material: 'loose grain · make a world',
      pitch: 'Liber powder! Pour sand, splash water, strike fire — it all falls and flows like the real stuff. Build a little world out of grains, then keep a picture before it settles.' },
    { id: 'tidepool', name: 'tide pool', glyph: '≋', unlock: 'tidepool',
      material: 'wet slate · the deep opens',
      pitch: 'Vanir’s pool, down in the deep. Drop a feeling while the tide is high and it floats; drop it low and it strands, waiting. The pool decides the pacing — you decide the honesty. No winning.',
      hint: '??? — the deep opens to those who release.' },
    { id: 'inkstorm', name: 'ink storm', glyph: '≣', unlock: 'inkstorm',
      material: 'phosphor glass · sealed words',
      pitch: 'Entity404’s terminal. Glyphs rain; type the word to execute it. Missed words simply dissolve — no failing here. The storm slows when you struggle, and tells you so, kindly.',
      hint: '??? — static gathers where words are sealed.' },
    { id: 'thimble', name: 'thimble garden', glyph: '❀', unlock: 'thimble',
      material: 'stitched canvas · patient growth',
      pitch: 'Ruby’s thimble pot. It grows while you are elsewhere in the OS — visit rooms, come back, find leaves. Harvest grants a petal for every paint box and a pressed flower for the book.',
      hint: '??? — ruby watches patient gardeners.' }
  ];

  var WHO_NAME = { whimsy: 'whimsy wow', vanir: 'vanir', ruby: 'ruby', elizabeth: 'e-lizabeth', riason: 'riason' };

  function affinity() { return (window.Liber && window.Liber.affinity) || null; }

  function isUnlocked(g) {
    if (!g.unlock) return true;
    var a = affinity();
    try { return a ? !!a.unlocked(g.unlock) : false; } catch (e) { return false; }
  }

  // invite lines, shown once each in the barker's voice-box
  function inviteLines() {
    var a = affinity();
    if (!a) return [];
    try {
      var inv = a.invites() || [];
      inv.forEach(function (u) { try { a.seen(u.id); } catch (e) {} });
      return inv;
    } catch (e) { return []; }
  }

  var current = null;

  function applyCamera() {
    if (!grid) return;
    grid.setAttribute('data-camera-index', String(cameraIndex));
    if (panLeft) panLeft.disabled = cameraIndex === 0;
    if (panRight) panRight.disabled = cameraIndex === CAMERA_ORDER.length - 1;
    var buttons = grid.querySelectorAll('.games-booth');
    for (var i = 0; i < buttons.length; i++) {
      var boothIndex = CAMERA_ORDER.indexOf(buttons[i].getAttribute('data-game'));
      var delta = boothIndex - cameraIndex;
      var position = delta === 0 ? 'center' : (delta === -1 ? 'left' : (delta === 1 ? 'right' : 'off'));
      buttons[i].setAttribute('data-camera-position', position);
      buttons[i].setAttribute('aria-hidden', position === 'off' ? 'true' : 'false');
      buttons[i].tabIndex = position === 'off' ? -1 : 0;
    }
  }

  function moveCamera(amount) {
    cameraIndex = Math.max(0, Math.min(CAMERA_ORDER.length - 1, cameraIndex + amount));
    applyCamera();
  }

  function buildPicker() {
    if (!grid) return;
    grid.innerHTML = '';
    for (var i = 0; i < GAMES.length; i++) {
      (function (g) {
        var locked = !isUnlocked(g);
        var div = document.createElement('button');
        div.type = 'button';
        div.className = 'games-booth' + (current && current.id === g.id ? ' current' : '') + (locked ? ' locked' : '');
        div.setAttribute('data-game', g.id);
        div.setAttribute('data-index', String(i));
        div.setAttribute('aria-label', (locked ? 'locked booth' : g.name) + (g.material ? ', ' + g.material : ''));
        div.innerHTML = '<span class="games-booth-scene" aria-hidden="true"></span>'
          + '<span class="games-booth-poster"><span class="games-booth-number">' + String(i + 1).padStart(2, '0') + '</span>'
          + '<span class="games-booth-glyph">' + (locked ? '?' : g.glyph) + '</span>'
          + '<span class="games-booth-copy"><span class="games-booth-name">' + esc(locked ? '???' : g.name) + '</span>'
          + '<span class="games-booth-material">' + esc(locked ? 'curtain still closed' : g.material) + '</span></span>'
          + '<span class="games-booth-mark" aria-hidden="true">›</span></span>';
        div.addEventListener('click', function () { selectGame(g); });
        grid.appendChild(div);
      })(GAMES[i]);
    }
    applyCamera();
  }

  function paintDesc(g) {
    if (!descBox) return;
    var html = '';
    inviteLines().forEach(function (u) {
      html += '<div class="games-invite"><span class="games-invite-who">' + esc(WHO_NAME[u.who] || u.who) + '</span> ' + esc(u.invite) + '</div>';
    });
    html += '<div class="games-desc-name">' + esc(g.name) + '</div><div>' + esc(g.pitch) + '</div>';
    descBox.innerHTML = html;
  }

  function paintLocked(g) {
    if (descBox) {
      descBox.innerHTML = '<div class="games-desc-name">???</div><div>' + esc(g.hint || 'not yet. keep playing.') + '</div>';
    }
    if (stage) {
      closeStage();
      stage.removeAttribute('inert');
      setView('attraction');
      stage.innerHTML = '<div class="games-stage-inner"><div class="games-stage-head">'
        + '<span class="games-stage-glyph">?</span>'
        + '<span class="games-stage-name">???</span>'
        + '<button type="button" class="games-stage-close" id="games-stage-close" aria-label="close">×</button>'
        + '</div><div class="games-locked">'
        + '<span class="games-locked-glyph">?</span>'
        + '<div>' + esc(g.hint || 'not yet. keep playing.') + '</div>'
        + '</div></div>';
      var lockedClose = document.getElementById('games-stage-close');
      if (lockedClose) lockedClose.addEventListener('click', closeStage);
    }
  }

  function selectGame(g) {
    current = g;
    buildPicker();
    if (!isUnlocked(g)) { paintLocked(g); return; }
    paintDesc(g);
    openPlay(g);
  }

  function byId(id) {
    for (var i = 0; i < GAMES.length; i++) if (GAMES[i].id === id) return GAMES[i];
    return null;
  }

  // ── personal bests (kept: scripts/verify-gamification.mjs pins this) ──

  var BEST_OF = {
    tip: { key: 'ice', label: 'ice held', dir: 'high' },
  };

  function recordBest(boothId, value) {
    if (!window.Liber || !window.Liber.state) return null;
    var metric = BEST_OF[boothId];
    if (!metric || typeof value !== 'number' || isNaN(value) || value <= 0) return null;
    var bests = Object.assign({}, window.Liber.state.get().bests || {});
    var prev = typeof bests[boothId] === 'number' ? bests[boothId] : null;
    var better = prev === null || (metric.dir === 'high' ? value > prev : prev < value);
    if (!better) return { newBest: false, value: value, best: prev, label: metric.label };
    bests[boothId] = value;
    window.Liber.state.set({ bests: bests });
    return { newBest: true, value: value, best: value, label: metric.label };
  }

  // ── saving ────────────────────────────────────────────────────────────

  function thumb(srcCanvas, w) {
    try {
      w = w || 160;
      var scale = w / srcCanvas.width;
      var c = document.createElement('canvas');
      c.width = w;
      c.height = Math.max(1, Math.round(srcCanvas.height * scale));
      var ctx = c.getContext('2d');
      ctx.fillStyle = '#101010';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(srcCanvas, 0, 0, c.width, c.height);
      return c.toDataURL('image/jpeg', 0.72);
    } catch (e) { return null; }
  }

  function saveToDesktopAndSatchel(b, result, shot) {
    if (!window.Liber || !window.Liber.state) return;
    var payload = { kind: b.id, name: b.name, glyph: b.glyph, result: result, ts: Date.now() };
    if (shot) payload.shot = shot;
    if (window.Liber.state.addArtifact) {
      window.Liber.state.addArtifact('games', payload);
    }
    if (window.Liber.state.addArtifact) {
      var mirror = { kind: 'game', ref: b.id, name: b.name, result: result, ts: Date.now() };
      if (shot) mirror.shot = shot;
      window.Liber.state.addArtifact('satchel', mirror);
    }
    if (window.Liber.sound) { try { window.Liber.sound.play('chime'); } catch (e) {} }
  }

  function promptSave(b, summary, doSave, doDiscard) {
    var prompt = document.getElementById('games-save-prompt');
    var body = document.getElementById('games-save-prompt-body');
    if (!prompt) { doSave(); return; }
    pendingPayload = { summary: summary, doSave: doSave, doDiscard: doDiscard };
    if (body) body.innerHTML = 'booth: <em>' + esc(b.name) + '</em>. ' + summary;
    prompt.classList.add('open');
    prompt.removeAttribute('inert');
  }

  var pendingPayload = null;

  function closePrompt() {
    var prompt = document.getElementById('games-save-prompt');
    if (!prompt) return;
    prompt.classList.remove('open');
    prompt.setAttribute('inert', '');
    pendingPayload = null;
  }

  function closeStage() {
    if (!stage) return;
    if (stage._teardown) { try { stage._teardown(); } catch (e) {} stage._teardown = null; }
    stage.innerHTML = '';
    stage.setAttribute('inert', '');
    setView('facade');
  }

  function openPlay(b) {
    if (!stage) return;
    closeStage();
    stage.removeAttribute('inert');
    setView('attraction');
    var html = '<div class="games-stage-inner">';
    html += '<div class="games-stage-head">';
    html += '<span class="games-stage-glyph">' + b.glyph + '</span>';
    html += '<span class="games-stage-name">' + esc(b.name) + '</span>';
    html += '<button type="button" class="games-stage-close" id="games-stage-close" aria-label="close">×</button>';
    html += '</div>';
    html += '<div class="games-stage-body" id="games-stage-body"></div>';
    html += '</div>';
    stage.innerHTML = html;
    var closeBtn = document.getElementById('games-stage-close');
    if (closeBtn) closeBtn.addEventListener('click', closeStage);
    var body = document.getElementById('games-stage-body');
    if (!body) return;
    renderPlay(b, body);
  }

  function renderPlay(b, body) {
    body.innerHTML = '';
    if (b.id === 'wheel') return playWheel(b, body);
    if (b.id === 'mask') return playPaint(b, body, 'mask');
    if (b.id === 'shield') return playPaint(b, body, 'shield');
    if (b.id === 'circles') return playPaint(b, body, 'circles');
    if (b.id === 'sand') return playSand(b, body);
    if (b.id === 'tidepool') return playTide(b, body);
    if (b.id === 'inkstorm') return playStorm(b, body);
    if (b.id === 'thimble') return playThimble(b, body);
  }

  function thunk() {
    if (window.Liber && window.Liber.sound) { try { window.Liber.sound.play('thunk'); } catch (e) {} }
  }

  // ── emotion wheel ─────────────────────────────────────────────────────

  var WHEEL_EMOTIONS = [
    { name: 'Anger', hex: '#C02424' },
    { name: 'Fear', hex: '#B2B2C2' },
    { name: 'Pride', hex: '#E04414' },
    { name: 'Pure Affection', hex: '#E22424' },
    { name: 'Depression', hex: '#3B3448' },
    { name: 'Sympathy', hex: '#79B879' },
    { name: 'Jealousy', hex: '#6B4A2E' },
    { name: 'Highest Intellect', hex: '#F2F200' },
    { name: 'Love for Humanity', hex: '#BE8FBE' },
    { name: 'Adaptability', hex: '#7A7A3C' },
    { name: 'Sensuality', hex: '#92605C' },
    { name: 'Devotion', hex: '#6E92D6' }
  ];

  var WHEEL_COLORS = ['#C02424', '#E09320', '#F2F200', '#79B879', '#2a8a8a', '#4a6ad4', '#7a3aaa', '#BE8FBE'];

  function polar(r, a) {
    return [150 + r * Math.cos(a), 150 + r * Math.sin(a)];
  }

  function wedgePath(i, n) {
    var a0 = (i / n) * Math.PI * 2 - Math.PI / 2;
    var a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
    var p0 = polar(140, a0), p1 = polar(140, a1);
    return 'M150 150 L' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1)
      + ' A140 140 0 0 1 ' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + ' Z';
  }

  function playWheel(b, body) {
    var n = WHEEL_EMOTIONS.length;
    var svg = '<svg id="wheel-svg" viewBox="0 0 300 300" role="img" aria-label="emotion dartboard">';
    for (var i = 0; i < n; i++) {
      var e = WHEEL_EMOTIONS[i];
      var mid = ((i + 0.5) / n) * Math.PI * 2 - Math.PI / 2;
      var lp = polar(108, mid);
      svg += '<path d="' + wedgePath(i, n) + '" fill="' + e.hex + '" stroke="#0a0a0a" stroke-width="2" data-wedge="' + i + '"/>'
        + '<text x="' + lp[0].toFixed(1) + '" y="' + lp[1].toFixed(1) + '" text-anchor="middle" dominant-baseline="middle"'
        + ' font-size="10" fill="#f0e8d8" transform="rotate(' + ((mid * 180 / Math.PI) + 90).toFixed(1) + ' ' + lp[0].toFixed(1) + ' ' + lp[1].toFixed(1) + ')">'
        + esc(e.name.split(' ')[0]) + '</text>';
    }
    svg += '<circle cx="150" cy="150" r="16" fill="#d4af37" stroke="#0a0a0a" stroke-width="2"/></svg>';

    body.innerHTML =
      '<div class="wheel-wrap" id="wheel-wrap">' + svg
      + '<div class="wheel-dart" id="wheel-dart" aria-hidden="true">'
      + '<svg viewBox="0 0 34 34" width="34" height="34"><path d="M17 2 L21 20 L17 26 L13 20 Z" fill="#e8c890" stroke="#5a3a10"/><circle cx="17" cy="8" r="2.5" fill="#c02424"/></svg>'
      + '</div><div class="wheel-seep" id="wheel-seep" aria-hidden="true"></div></div>'
      + '<div class="wheel-hint" id="wheel-hint">click the wheel to throw a dart.</div>'
      + '<div class="wheel-colors" id="wheel-colors" hidden></div>'
      + '<div class="games-actions">'
      + '<button type="button" class="games-action" id="wheel-again" hidden>another dart</button>'
      + '<button type="button" class="games-action" id="wheel-keep" disabled>keep it</button>'
      + '</div>'
      + '<div class="games-result" id="wheel-result"></div>';

    var wrap = document.getElementById('wheel-wrap');
    var dart = document.getElementById('wheel-dart');
    var seep = document.getElementById('wheel-seep');
    var colors = document.getElementById('wheel-colors');
    var hint = document.getElementById('wheel-hint');
    var again = document.getElementById('wheel-again');
    var keep = document.getElementById('wheel-keep');
    var result = document.getElementById('wheel-result');
    var thrown = null;   // { emotion, x, y (fractions), color }
    var darts = [];

    function dartXY(evt) {
      var r = wrap.getBoundingClientRect();
      return { x: (evt.clientX - r.left) / r.width, y: (evt.clientY - r.top) / r.height };
    }

    wrap.addEventListener('mousemove', function (e) {
      if (!dart || thrown) return;
      var p = dartXY(e);
      dart.style.transform = 'translate(' + (p.x * wrap.clientWidth).toFixed(1) + 'px,' + (p.y * wrap.clientHeight).toFixed(1) + 'px)';
    });
    wrap.addEventListener('mouseleave', function () {
      if (dart && !thrown) dart.style.transform = 'translate(-40px,-40px)';
    });

    function wedgeAt(x, y) {
      var dx = x - 0.5, dy = y - 0.5;
      var a = Math.atan2(dy, dx) + Math.PI / 2;
      if (a < 0) a += Math.PI * 2;
      var i = Math.floor(a / (Math.PI * 2) * n) % n;
      if (Math.sqrt(dx * dx + dy * dy) > 0.47) return -1;
      return i;
    }

    wrap.addEventListener('click', function (e) {
      if (thrown) return;
      var p = dartXY(e);
      var wi = wedgeAt(p.x, p.y);
      if (wi < 0) { if (hint) hint.textContent = 'off the board! aim inside the wheel.'; return; }
      var emo = WHEEL_EMOTIONS[wi];
      thrown = { emotion: emo.name, hex: emo.hex, x: p.x, y: p.y, color: null };
      if (dart) {
        dart.style.transform = 'translate(' + (p.x * wrap.clientWidth).toFixed(1) + 'px,' + (p.y * wrap.clientHeight).toFixed(1) + 'px)';
      }
      thunk();
      if (hint) hint.textContent = emo.name + ' — now pick the color it feels like.';
      if (colors) {
        colors.innerHTML = '';
        colors.hidden = false;
        WHEEL_COLORS.forEach(function (c) {
          var cb = document.createElement('button');
          cb.type = 'button';
          cb.className = 'wheel-color';
          cb.style.background = c;
          cb.setAttribute('aria-label', 'color ' + c);
          cb.addEventListener('click', function () { flood(c); });
          colors.appendChild(cb);
        });
      }
    });

    function flood(color) {
      if (!thrown || thrown.color) return;
      thrown.color = color;
      if (seep) {
        var wpx = wrap.clientWidth;
        seep.style.left = (thrown.x * 100) + '%';
        seep.style.top = (thrown.y * 100) + '%';
        seep.style.width = seep.style.height = (wpx * 2.4) + 'px';
        seep.style.background = 'radial-gradient(circle, ' + color + ' 0%, ' + color + '55 45%, transparent 72%)';
        void seep.offsetWidth;
        seep.classList.add('go');
      }
      if (dart) dart.classList.add('dropped');
      darts.push({ emotion: thrown.emotion, color: color });
      if (result) result.textContent = 'dart ' + darts.length + ': ' + thrown.emotion + ' in ' + color + '.';
      if (hint) hint.textContent = 'the color seeps out. throw another, or keep it.';
      if (again) again.hidden = false;
      if (keep) keep.disabled = false;
      thunk();
    }

    if (again) again.addEventListener('click', function () {
      thrown = null;
      if (seep) { seep.classList.remove('go'); }
      if (dart) { dart.classList.remove('dropped'); dart.style.transform = 'translate(-40px,-40px)'; }
      if (colors) colors.hidden = true;
      if (hint) hint.textContent = 'click the wheel to throw a dart.';
    });

    if (keep) keep.addEventListener('click', function () {
      if (!darts.length) return;
      var last = darts[darts.length - 1];
      var shot = wheelShot(last);
      promptSave(b, 'result: ' + darts.length + ' dart' + (darts.length === 1 ? '' : 's') + ', last landed ' + last.emotion + ' in ' + last.color + '.', function () {
        saveToDesktopAndSatchel(b, { darts: darts }, shot);
        if (result) result.textContent = 'kept. the tent remembers.';
      }, null);
    });

    function wheelShot(last) {
      try {
        var c = document.createElement('canvas');
        c.width = 160; c.height = 160;
        var ctx = c.getContext('2d');
        ctx.fillStyle = '#1a0008';
        ctx.fillRect(0, 0, 160, 160);
        var g = ctx.createRadialGradient(80, 80, 4, 80, 80, 90);
        g.addColorStop(0, last.color);
        g.addColorStop(1, '#1a0008');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 160, 160);
        ctx.fillStyle = '#f0e8d8';
        ctx.font = 'italic 15px Georgia';
        ctx.textAlign = 'center';
        ctx.fillText(last.emotion, 80, 84, 150);
        return c.toDataURL('image/jpeg', 0.72);
      } catch (e) { return null; }
    }
  }

  // ── paint games: mask / shield / circles ──────────────────────────────

  var PAINT_COLORS = ['#c02424', '#e09320', '#e8c832', '#3a8a3a', '#2a5aaa', '#6a3aaa', '#c86aa8', '#f0e8d8'];
  var PAINT_SIZES = [3, 7, 13];

  function playPaint(b, body, kind) {
    var names = kind === 'circles' ? { a: '', b: '', c: '' } : null;
    body.innerHTML =
      '<div class="paint-stack">'
      + '<canvas class="paint-tpl" id="paint-tpl" width="480" height="360"></canvas>'
      + '<canvas class="paint-top" id="paint-top" width="480" height="360"></canvas>'
      + '</div>'
      + (kind === 'circles'
        ? '<div class="paint-names">'
          + '<input id="paint-name-a" maxlength="24" aria-label="closest" placeholder="closest"/>'
          + '<input id="paint-name-b" maxlength="24" aria-label="friends" placeholder="friends"/>'
          + '<input id="paint-name-c" maxlength="24" aria-label="distant" placeholder="distant"/>'
          + '</div>' : '')
      + '<div class="paint-bar" id="paint-bar"></div>'
      + '<div class="games-actions">'
      + '<button type="button" class="games-action" id="paint-clear">wipe it</button>'
      + '<button type="button" class="games-action" id="paint-keep">keep it</button>'
      + '</div>'
      + '<div class="games-result" id="paint-result"></div>';

    var tpl = document.getElementById('paint-tpl');
    var top = document.getElementById('paint-top');
    var tctx = tpl.getContext('2d');
    var pctx = top.getContext('2d');
    var color = PAINT_COLORS[0];
    var size = PAINT_SIZES[1];
    var strokes = 0;

    function drawTemplate() {
      tctx.clearRect(0, 0, 480, 360);
      tctx.strokeStyle = '#4a3828';
      tctx.fillStyle = '#4a3828';
      tctx.lineWidth = 3;
      tctx.font = 'italic 17px Georgia';
      tctx.textAlign = 'center';
      if (kind === 'mask') {
        tctx.beginPath();
        tctx.ellipse(240, 185, 130, 155, 0, 0, Math.PI * 2);
        tctx.stroke();
        tctx.beginPath();
        tctx.moveTo(240, 30); tctx.lineTo(240, 340);
        tctx.stroke();
        tctx.fillText('FEELINGS', 165, 60);
        tctx.fillText('PRESENTATION', 315, 60);
      } else if (kind === 'shield') {
        tctx.beginPath();
        tctx.moveTo(240, 30);
        tctx.lineTo(370, 80); tctx.lineTo(370, 210);
        tctx.quadraticCurveTo(370, 300, 240, 340);
        tctx.quadraticCurveTo(110, 300, 110, 210);
        tctx.lineTo(110, 80);
        tctx.closePath();
        tctx.stroke();
        tctx.beginPath();
        tctx.moveTo(240, 30); tctx.lineTo(240, 340);
        tctx.moveTo(110, 185); tctx.lineTo(370, 185);
        tctx.stroke();
        tctx.fillText('physical', 175, 120);
        tctx.fillText('emotional', 305, 120);
        tctx.fillText('time-related', 175, 250);
        tctx.fillText('mental', 305, 250);
      } else {
        tctx.beginPath(); tctx.arc(240, 185, 55, 0, Math.PI * 2); tctx.stroke();
        tctx.beginPath(); tctx.arc(240, 185, 105, 0, Math.PI * 2); tctx.stroke();
        tctx.beginPath(); tctx.arc(240, 185, 150, 0, Math.PI * 2); tctx.stroke();
        tctx.fillText('closest', 240, 100);
        tctx.fillText('friends', 240, 60);
        tctx.fillText('distant', 240, 28);
        if (names.a) { tctx.fillText(names.a.slice(0, 20), 240, 190); }
        if (names.b) { tctx.fillText(names.b.slice(0, 20), 330, 150); }
        if (names.c) { tctx.fillText(names.c.slice(0, 20), 150, 300); }
      }
    }
    drawTemplate();

    if (names) {
      ['a', 'b', 'c'].forEach(function (k) {
        var inp = document.getElementById('paint-name-' + k);
        if (inp) inp.addEventListener('input', function () { names[k] = inp.value; drawTemplate(); });
      });
    }

    var bar = document.getElementById('paint-bar');
    var petalColors = PAINT_COLORS.slice();
    try {
      var gs = (window.Liber && window.Liber.state && window.Liber.state.get()) || {};
      (gs.palette || []).forEach(function (p) {
        if (petalColors.indexOf(p) < 0) petalColors.push(p);
      });
    } catch (e) {}
    petalColors.forEach(function (c, i) {
      var sw = document.createElement('button');
      sw.type = 'button';
      sw.className = 'paint-swatch' + (i === 0 ? ' on' : '');
      sw.style.background = c;
      sw.setAttribute('aria-label', 'paint ' + c);
      sw.addEventListener('click', function () {
        color = c;
        var sibs = bar.querySelectorAll('.paint-swatch');
        for (var k = 0; k < sibs.length; k++) sibs[k].classList.remove('on');
        sw.classList.add('on');
      });
      bar.appendChild(sw);
    });
    PAINT_SIZES.forEach(function (sz, i) {
      var zb = document.createElement('button');
      zb.type = 'button';
      zb.className = 'paint-size' + (i === 1 ? ' on' : '');
      zb.textContent = ['fine', 'hand', 'mop'][i];
      zb.addEventListener('click', function () {
        size = sz;
        var sibs = bar.querySelectorAll('.paint-size');
        for (var k = 0; k < sibs.length; k++) sibs[k].classList.remove('on');
        zb.classList.add('on');
      });
      bar.appendChild(zb);
    });

    function pos(e) {
      var r = top.getBoundingClientRect();
      return { x: (e.clientX - r.left) * (480 / r.width), y: (e.clientY - r.top) * (360 / r.height) };
    }
    var painting = false;
    function strokeTo(p) {
      pctx.strokeStyle = color;
      pctx.lineWidth = size;
      pctx.lineCap = 'round';
      pctx.lineJoin = 'round';
      pctx.lineTo(p.x, p.y);
      pctx.stroke();
      strokes++;
    }
    top.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      painting = true;
      try { top.setPointerCapture(e.pointerId); } catch (err) {}
      var p = pos(e);
      pctx.beginPath();
      pctx.moveTo(p.x, p.y);
      strokeTo(p);
    });
    top.addEventListener('pointermove', function (e) {
      if (!painting) return;
      strokeTo(pos(e));
    });
    function stopPaint() {
      if (!painting) return;
      painting = false;
      try { pctx.beginPath(); } catch (e) {}
    }
    top.addEventListener('pointerup', stopPaint);
    top.addEventListener('pointercancel', stopPaint);
    top.addEventListener('pointerleave', stopPaint);

    var clear = document.getElementById('paint-clear');
    if (clear) clear.addEventListener('click', function () {
      pctx.clearRect(0, 0, 480, 360);
      strokes = 0;
    });

    var keepBtn = document.getElementById('paint-keep');
    var result = document.getElementById('paint-result');
    if (keepBtn) keepBtn.addEventListener('click', function () {
      if (!strokes) {
        if (result) result.textContent = 'paint something first — the canvas is still clean.';
        return;
      }
      var merged = document.createElement('canvas');
      merged.width = 480; merged.height = 360;
      var mctx = merged.getContext('2d');
      mctx.fillStyle = '#e8dcc0';
      mctx.fillRect(0, 0, 480, 360);
      mctx.drawImage(tpl, 0, 0);
      mctx.drawImage(top, 0, 0);
      var shot = thumb(merged);
      var summary = kind === 'circles' && (names.a || names.b || names.c)
        ? 'result: ' + strokes + ' strokes; closest: ' + (names.a || '—') + ', friends: ' + (names.b || '—') + ', distant: ' + (names.c || '—') + '.'
        : 'result: ' + strokes + ' strokes of paint.';
      promptSave(b, summary, function () {
        saveToDesktopAndSatchel(b, { strokes: strokes, names: names }, shot);
        if (result) result.textContent = 'kept. the tent remembers.';
      }, null);
    });
  }

  // ── powder tent ───────────────────────────────────────────────────────

  var SAND_W = 120, SAND_H = 150, SAND_CELL = 3;
  var SAND_EMPTY = 0, SAND_WALL = 1, SAND_SAND = 2, SAND_WATER = 3, SAND_FIRE = 4;
  var SAND_COLORS = {
    1: [[122, 110, 96]],
    2: [[216, 170, 80], [226, 180, 92], [206, 158, 70]],
    3: [[64, 130, 200], [74, 142, 210], [56, 118, 188]],
    4: [[255, 120, 40], [255, 160, 60], [240, 90, 30]]
  };

  function playSand(b, body) {
    body.innerHTML =
      '<div class="sand-wrap">'
      + '<canvas class="sand-canvas" id="sand-canvas" width="' + (SAND_W * SAND_CELL) + '" height="' + (SAND_H * SAND_CELL) + '"></canvas>'
      + '<div class="sand-bar" id="sand-bar"></div>'
      + '<div class="sand-hint">pour, splash, strike. the tent keeps a picture when you keep it.</div>'
      + '<div class="games-actions" style="justify-content:center">'
      + '<button type="button" class="games-action" id="sand-clear">sweep it</button>'
      + '<button type="button" class="games-action" id="sand-keep">keep it</button>'
      + '</div>'
      + '<div class="games-result" id="sand-result"></div>'
      + '</div>';

    var cv = document.getElementById('sand-canvas');
    var ctx = cv.getContext('2d');
    var gridArr = new Uint8Array(SAND_W * SAND_H);
    var colArr = new Uint8Array(SAND_W * SAND_H);
    var lifeArr = new Int16Array(SAND_W * SAND_H);
    var EL = [
      { id: SAND_SAND, name: 'sand' },
      { id: SAND_WATER, name: 'water' },
      { id: SAND_FIRE, name: 'fire' },
      { id: SAND_WALL, name: 'wall' },
      { id: -1, name: 'erase' }
    ];
    var el = SAND_SAND;
    var brush = 2;
    var pouring = false;
    var strokes = 0;
    var used = {};
    var frame = 0;
    var raf = 0;
    var img = ctx.createImageData(cv.width, cv.height);

    function at(x, y) {
      if (x < 0 || y < 0 || x >= SAND_W || y >= SAND_H) return -1;
      return gridArr[y * SAND_W + x];
    }
    function setAt(x, y, v, c, life) {
      if (x < 0 || y < 0 || x >= SAND_W || y >= SAND_H) return;
      gridArr[y * SAND_W + x] = v;
      colArr[y * SAND_W + x] = c || 0;
      lifeArr[y * SAND_W + x] = life || 0;
    }
    function swapCells(x1, y1, x2, y2) {
      var i1 = y1 * SAND_W + x1, i2 = y2 * SAND_W + x2;
      var t = gridArr[i1]; gridArr[i1] = gridArr[i2]; gridArr[i2] = t;
      t = colArr[i1]; colArr[i1] = colArr[i2]; colArr[i2] = t;
      t = lifeArr[i1]; lifeArr[i1] = lifeArr[i2]; lifeArr[i2] = t;
    }

    function pour(cx, cy) {
      for (var dy = -brush; dy <= brush; dy++) {
        for (var dx = -brush; dx <= brush; dx++) {
          if (dx * dx + dy * dy > brush * brush + 1) continue;
          var x = cx + dx, y = cy + dy;
          if (x < 0 || y < 0 || x >= SAND_W || y >= SAND_H) continue;
          if (el === -1) {
            setAt(x, y, SAND_EMPTY, 0, 0);
          } else if (gridArr[y * SAND_W + x] === SAND_EMPTY) {
            var pal = SAND_COLORS[el].length;
            var pick = Math.abs((x * 31 + y * 17 + frame) % pal);
            setAt(x, y, el, pick, el === SAND_FIRE ? 4 + (Math.abs(x + y + frame) % 4) : 0);
          }
        }
      }
      strokes++;
      if (el > 0) used[el] = true;
    }

    function cellPos(e) {
      var r = cv.getBoundingClientRect();
      return {
        x: Math.floor((e.clientX - r.left) * (SAND_W / r.width)),
        y: Math.floor((e.clientY - r.top) * (SAND_H / r.height))
      };
    }
    cv.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      pouring = true;
      try { cv.setPointerCapture(e.pointerId); } catch (err) {}
      var p = cellPos(e);
      pour(p.x, p.y);
    });
    cv.addEventListener('pointermove', function (e) {
      if (!pouring) return;
      var p = cellPos(e);
      pour(p.x, p.y);
    });
    function stopPour() { pouring = false; }
    cv.addEventListener('pointerup', stopPour);
    cv.addEventListener('pointercancel', stopPour);
    cv.addEventListener('pointerleave', stopPour);

    var bar = document.getElementById('sand-bar');
    EL.forEach(function (o) {
      var eb = document.createElement('button');
      eb.type = 'button';
      eb.className = 'sand-el' + (o.id === el ? ' on' : '');
      eb.textContent = o.name;
      eb.addEventListener('click', function () {
        el = o.id;
        var sibs = bar.querySelectorAll('.sand-el');
        for (var k = 0; k < sibs.length; k++) sibs[k].classList.remove('on');
        eb.classList.add('on');
      });
      bar.appendChild(eb);
    });

    function step() {
      frame++;
      var dir = (frame % 2 === 0) ? 1 : -1;
      for (var y = SAND_H - 1; y >= 0; y--) {
        for (var xi = 0; xi < SAND_W; xi++) {
          var x = dir === 1 ? xi : (SAND_W - 1 - xi);
          var v = gridArr[y * SAND_W + x];
          if (v === SAND_EMPTY || v === SAND_WALL) continue;
          if (v === SAND_SAND) {
            if (at(x, y + 1) === SAND_EMPTY || at(x, y + 1) === SAND_WATER) swapCells(x, y, x, y + 1);
            else if (at(x - dir, y + 1) === SAND_EMPTY || at(x - dir, y + 1) === SAND_WATER) swapCells(x, y, x - dir, y + 1);
            else if (at(x + dir, y + 1) === SAND_EMPTY || at(x + dir, y + 1) === SAND_WATER) swapCells(x, y, x + dir, y + 1);
          } else if (v === SAND_WATER) {
            if (at(x, y + 1) === SAND_EMPTY) swapCells(x, y, x, y + 1);
            else if (at(x - dir, y + 1) === SAND_EMPTY) swapCells(x, y, x - dir, y + 1);
            else if (at(x + dir, y + 1) === SAND_EMPTY) swapCells(x, y, x + dir, y + 1);
            else if (at(x - dir, y) === SAND_EMPTY) swapCells(x, y, x - dir, y);
            else if (at(x + dir, y) === SAND_EMPTY) swapCells(x, y, x + dir, y);
            // fire + water: both hiss out
            var nb = [at(x, y - 1), at(x, y + 1), at(x - 1, y), at(x + 1, y)];
            for (var f = 0; f < nb.length; f++) {
              if (nb[f] === SAND_FIRE) { setAt(x, y, SAND_EMPTY, 0, 0); break; }
            }
          } else if (v === SAND_FIRE) {
            var i = y * SAND_W + x;
            lifeArr[i]--;
            if (lifeArr[i] <= 0) { setAt(x, y, SAND_EMPTY, 0, 0); continue; }
            if (at(x, y - 1) === SAND_WATER || at(x - 1, y) === SAND_WATER || at(x + 1, y) === SAND_WATER) {
              setAt(x, y, SAND_EMPTY, 0, 0);
              continue;
            }
            if (at(x, y - 1) === SAND_EMPTY) swapCells(x, y, x, y - 1);
            else if (at(x - dir, y - 1) === SAND_EMPTY) swapCells(x, y, x - dir, y - 1);
            else if (at(x + dir, y - 1) === SAND_EMPTY) swapCells(x, y, x + dir, y - 1);
          }
        }
      }
    }

    function paint() {
      var px = img.data;
      var p = 0;
      for (var y = 0; y < SAND_H; y++) {
        for (var x = 0; x < SAND_W; x++) {
          var v = gridArr[y * SAND_W + x];
          var rC = 10, gC = 8, bC = 5;
          if (v !== SAND_EMPTY) {
            var pal = SAND_COLORS[v] || [[200, 200, 200]];
            var cc = pal[colArr[y * SAND_W + x] % pal.length];
            rC = cc[0]; gC = cc[1]; bC = cc[2];
          }
          for (var sy = 0; sy < SAND_CELL; sy++) {
            for (var sx = 0; sx < SAND_CELL; sx++) {
              var o = (((y * SAND_CELL + sy) * cv.width) + (x * SAND_CELL + sx)) * 4;
              px[o] = rC; px[o + 1] = gC; px[o + 2] = bC; px[o + 3] = 255;
            }
          }
          p++;
        }
      }
      ctx.putImageData(img, 0, 0);
    }

    function loop() {
      if (!document.body.contains(cv)) return;
      step();
      paint();
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    if (stage) {
      stage._teardown = function () {
        try { cancelAnimationFrame(raf); } catch (e) {}
      };
    }

    var clear = document.getElementById('sand-clear');
    if (clear) clear.addEventListener('click', function () {
      gridArr = new Uint8Array(SAND_W * SAND_H);
      colArr = new Uint8Array(SAND_W * SAND_H);
      lifeArr = new Int16Array(SAND_W * SAND_H);
      strokes = 0;
      used = {};
    });

    var keepBtn = document.getElementById('sand-keep');
    var result = document.getElementById('sand-result');
    if (keepBtn) keepBtn.addEventListener('click', function () {
      if (!strokes) {
        if (result) result.textContent = 'pour something first — the tent is still empty.';
        return;
      }
      var shot = thumb(cv);
      var names = [];
      if (used[SAND_SAND]) names.push('sand');
      if (used[SAND_WATER]) names.push('water');
      if (used[SAND_FIRE]) names.push('fire');
      if (used[SAND_WALL]) names.push('wall');
      promptSave(b, 'result: a powder world of ' + (names.join(', ') || 'dust') + '.', function () {
        saveToDesktopAndSatchel(b, { strokes: strokes, elements: names }, shot);
        if (result) result.textContent = 'kept. the tent remembers.';
      }, null);
    });
  }

  // ── tide pool: Vanir's game ───────────────────────────────────────
  // A rock pool on a slow timer. Drop a feeling at high tide and it
  // floats; at low tide it strands. Release lets the floaters out.
  // No winning — the pool decides the pacing, you decide the honesty.

  function playTide(b, body) {
    body.innerHTML =
      '<div class="tide-wrap">'
      + '<canvas class="tide-canvas" id="tide-canvas" width="480" height="360"></canvas>'
      + '<div class="tide-row"><input id="tide-input" maxlength="40" aria-label="drop a feeling" placeholder="a feeling"/>'
      + '<button type="button" class="games-action" id="tide-drop">drop it</button></div>'
      + '<div class="tide-hint" id="tide-hint">drop a feeling. high tide floats it, low tide strands it.</div>'
      + '<div class="games-actions" style="justify-content:center">'
      + '<button type="button" class="games-action" id="tide-release">release</button>'
      + '<button type="button" class="games-action" id="tide-keep">keep it</button>'
      + '</div>'
      + '<div class="games-result" id="tide-result"></div>'
      + '</div>';

    var cv = document.getElementById('tide-canvas');
    var ctx = cv.getContext('2d');
    var t0 = Date.now();
    var PERIOD = 75000;
    var items = [];
    var dropped = 0, released = 0;
    var lastTurn = 1;
    var raf = 0;

    function tide() { return Math.sin(((Date.now() - t0) / PERIOD) * Math.PI * 2); }
    function waterline() { return 150 + 95 * tide(); }
    function tideWord() {
      var s = tide();
      if (s > 0.5) return 'high';
      if (s < -0.5) return 'low';
      return Math.cos(((Date.now() - t0) / PERIOD) * Math.PI * 2) > 0 ? 'flowing' : 'ebbing';
    }

    function drop() {
      var inp = document.getElementById('tide-input');
      var text = inp ? inp.value.trim().slice(0, 40) : '';
      if (!text) return;
      if (inp) inp.value = '';
      var high = tide() > -0.1;
      items.push({ text: text, floating: high, x: 60 + ((dropped * 97) % 360), born: Date.now() });
      dropped++;
      thunk();
    }

    function paint() {
      var now = Date.now();
      var wl = waterline();
      ctx.fillStyle = '#0a0805';
      ctx.fillRect(0, 0, 480, 360);
      // sand bed
      ctx.fillStyle = '#2a1c0e';
      ctx.fillRect(0, 320, 480, 40);
      // water
      var grd = ctx.createLinearGradient(0, wl - 40, 0, 360);
      grd.addColorStop(0, 'rgba(74,138,200,0.12)');
      grd.addColorStop(1, 'rgba(74,138,200,0.55)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, wl, 480, 360 - wl);
      ctx.strokeStyle = 'rgba(140,190,230,0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (var x = 0; x <= 480; x += 16) {
        var y = wl + 4 * Math.sin(x / 40 + now / 900);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // night tides glow faintly teal
      var hour = new Date().getHours();
      var night = hour < 5 || hour >= 21;
      // feelings
      ctx.font = 'italic 14px Georgia';
      ctx.textAlign = 'center';
      for (var i = items.length - 1; i >= 0; i--) {
        var it = items[i];
        var alpha = it.alpha == null ? 1 : it.alpha;
        if (it.floating) {
          var by = wl - 16 + 5 * Math.sin(now / 600 + i * 1.7);
          ctx.fillStyle = night
            ? 'rgba(120,220,210,' + alpha + ')'
            : 'rgba(232,220,192,' + alpha + ')';
          ctx.fillText(it.text, it.x, by);
          if (it.leaving) {
            it.alpha = alpha - 0.03;
            it.x += 1.2;
            if (it.alpha <= 0) { items.splice(i, 1); released++; }
          }
        } else {
          var pulse = 0.65 + 0.25 * Math.sin(now / 500 + i);
          ctx.fillStyle = 'rgba(200,170,130,' + (alpha * pulse) + ')';
          ctx.fillText(it.text, it.x, 300);
        }
      }
      // tide-turn bell
      var turn = tide() >= 0 ? 1 : -1;
      if (turn !== lastTurn) {
        lastTurn = turn;
        if (window.Liber && window.Liber.sound) { try { window.Liber.sound.play('tick'); } catch (e) {} }
      }
    }

    function loop() {
      if (!document.body.contains(cv)) return;
      paint();
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    if (stage) {
      stage._teardown = function () {
        try { cancelAnimationFrame(raf); } catch (e) {}
      };
    }

    var dropBtn = document.getElementById('tide-drop');
    var inp = document.getElementById('tide-input');
    if (dropBtn) dropBtn.addEventListener('click', drop);
    if (inp) inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); drop(); }
    });
    var rel = document.getElementById('tide-release');
    if (rel) rel.addEventListener('click', function () {
      var any = false;
      items.forEach(function (it) { if (it.floating && !it.leaving) { it.leaving = true; any = true; } });
      var result = document.getElementById('tide-result');
      if (!any && result) result.textContent = 'nothing floats right now. wait for the tide, or drop at low water and sit with it.';
      else thunk();
    });
    var keepBtn = document.getElementById('tide-keep');
    var result2 = document.getElementById('tide-result');
    if (keepBtn) keepBtn.addEventListener('click', function () {
      if (!dropped) {
        if (result2) result2.textContent = 'drop a feeling first — the pool is still empty.';
        return;
      }
      var shot = thumb(cv);
      var tw = tideWord();
      promptSave(b, 'result: a pool at ' + tw + ' tide, ' + released + ' released.', function () {
        saveToDesktopAndSatchel(b, { dropped: dropped, released: released, tide: tw }, shot);
        if (result2) result2.textContent = 'kept. the tent remembers.';
      }, null);
    });
  }

  // ── ink storm: Entity404's game ─────────────────────────────────────
  // A terminal rains glyphs; type the shown word to "execute" it. Missed
  // words dissolve — zero fail state. The storm slows when you struggle
  // and tells you so, kindly.

  var STORM_WORDS = ['tide', 'wax', 'ember', 'moth', 'loam', 'bell', 'reed', 'ash', 'owl', 'fern', 'dune', 'wren', 'moss', 'tallow', 'silt', 'hush'];

  function playStorm(b, body) {
    body.innerHTML =
      '<div class="storm-wrap">'
      + '<canvas class="storm-canvas" id="storm-canvas" width="480" height="360"></canvas>'
      + '<div class="storm-buffer" id="storm-buffer" aria-hidden="true">_</div>'
      + '<div class="storm-hint" id="storm-hint">type the falling word to execute it.</div>'
      + '<div class="games-actions" style="justify-content:center">'
      + '<button type="button" class="games-action" id="storm-keep">keep it</button>'
      + '</div>'
      + '<div class="games-result" id="storm-result"></div>'
      + '</div>';

    var cv = document.getElementById('storm-canvas');
    var ctx = cv.getContext('2d');
    var bufEl = document.getElementById('storm-buffer');
    var hintEl = document.getElementById('storm-hint');
    var words = [];
    var buffer = '';
    var spawned = 0;
    var executed = 0, missed = 0, missStreak = 0;
    var speed = 0.9;
    var lastSpawn = 0;
    var spawnMs = 2600;
    var slowedNote = false;
    var raf = 0;
    var flashes = [];

    function spawn(now) {
      var cols = 6;
      words.push({
        text: STORM_WORDS[spawned % STORM_WORDS.length],
        x: 40 + ((spawned * 89) % 400),
        y: -12,
        hit: false
      });
      spawned++;
      lastSpawn = now;
    }

    function paint(now) {
      ctx.fillStyle = '#020204';
      ctx.fillRect(0, 0, 480, 360);
      ctx.textAlign = 'left';
      for (var i = words.length - 1; i >= 0; i--) {
        var w = words[i];
        w.y += speed;
        if (w.y > 348) {
          words.splice(i, 1);
          missed++;
          missStreak++;
          if (missStreak >= 3 && speed > 0.35) {
            speed = Math.max(0.35, speed - 0.12);
            spawnMs = Math.min(6000, spawnMs * 1.1);
            if (!slowedNote && hintEl) {
              slowedNote = true;
              hintEl.textContent = 'the storm slows for you. no hurry at all.';
            }
          }
          continue;
        }
        var glow = w.hit ? 1 : 0.75;
        ctx.font = '15px "Courier New", monospace';
        ctx.fillStyle = w.hit ? 'rgba(255,255,255,' + glow + ')' : 'rgba(120,200,150,' + glow + ')';
        ctx.fillText(w.text, w.x, w.y);
        // phosphor trail
        ctx.fillStyle = 'rgba(120,200,150,0.25)';
        ctx.fillText(w.text, w.x, w.y - 16);
      }
      for (var f = flashes.length - 1; f >= 0; f--) {
        flashes[f].a -= 0.06;
        if (flashes[f].a <= 0) { flashes.splice(f, 1); continue; }
        ctx.fillStyle = 'rgba(255,255,255,' + flashes[f].a + ')';
        ctx.font = '15px "Courier New", monospace';
        ctx.fillText(flashes[f].text, flashes[f].x, flashes[f].y);
      }
      if (bufEl) bufEl.textContent = '>' + (buffer || '') + '_';
    }

    function loop(now) {
      if (!document.body.contains(cv)) return;
      if (!lastSpawn) lastSpawn = now;
      if (now - lastSpawn > spawnMs) spawn(now);
      paint(now);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    function onKey(e) {
      if (!document.body.contains(cv)) return;
      if (e.key === 'Backspace') { buffer = buffer.slice(0, -1); return; }
      if (e.key.length !== 1 || !/[a-z]/i.test(e.key)) return;
      buffer = (buffer + e.key.toLowerCase()).slice(-12);
      for (var i = 0; i < words.length; i++) {
        if (words[i].text === buffer) {
          flashes.push({ text: words[i].text, x: words[i].x, y: words[i].y, a: 1 });
          words.splice(i, 1);
          buffer = '';
          executed++;
          missStreak = 0;
          if (window.Liber && window.Liber.sound) { try { window.Liber.sound.play('tink'); } catch (err) {} }
          break;
        }
      }
    }
    document.addEventListener('keydown', onKey);
    if (stage) {
      stage._teardown = function () {
        try { cancelAnimationFrame(raf); } catch (e) {}
        try { document.removeEventListener('keydown', onKey); } catch (e2) {}
      };
    }

    var keepBtn = document.getElementById('storm-keep');
    var result = document.getElementById('storm-result');
    if (keepBtn) keepBtn.addEventListener('click', function () {
      var total = executed + missed;
      if (!total) {
        if (result) result.textContent = 'let it rain a little first — the static is still gathering.';
        return;
      }
      var shot = thumb(cv);
      var ratio = executed / total;
      var weather = ratio > 0.8
        ? 'a clear night, ' + executed + ' lightning words'
        : ratio > 0.4
          ? 'steady drizzle, ' + executed + ' lightning words'
          : 'a heavy storm, ' + executed + ' lightning words. nothing lost.';
      promptSave(b, 'result: ' + weather + '.', function () {
        saveToDesktopAndSatchel(b, { executed: executed, missed: missed, weather: weather }, shot);
        if (result) result.textContent = 'kept. the tent remembers.';
      }, null);
    });
  }

  // ── thimble garden: Ruby's idle game ────────────────────────────────
  // A thimble pot grows while you are elsewhere: one leaf per three rooms
  // visited, capped at five. Harvest presses a flower and grants a petal
  // to every paint box. Zero interaction required — pure ambient reward.

  var THIMBLE_PETALS = ['#e08ab0', '#9ac8e8', '#c8e89a', '#e8d89a', '#d8a8e8'];

  function thimbleState() {
    var s = (window.Liber && window.Liber.state && window.Liber.state.get()) || {};
    return s.thimble || { visits: 0, base: 0, harvested: 0 };
  }
  function thimbleStage(t) {
    return Math.max(0, Math.min(5, Math.floor(((t.visits || 0) - (t.base || 0)) / 3)));
  }

  function playThimble(b, body) {
    body.innerHTML =
      '<div class="thimble-wrap">'
      + '<canvas class="thimble-canvas" id="thimble-canvas" width="480" height="360"></canvas>'
      + '<div class="thimble-hint" id="thimble-hint">it grows while you are elsewhere. visit rooms, come back.</div>'
      + '<div class="games-actions" style="justify-content:center">'
      + '<button type="button" class="games-action" id="thimble-harvest">harvest</button>'
      + '</div>'
      + '<div class="games-result" id="thimble-result"></div>'
      + '</div>';

    var cv = document.getElementById('thimble-canvas');
    var ctx = cv.getContext('2d');
    var result = document.getElementById('thimble-result');
    var hint = document.getElementById('thimble-hint');

    function draw() {
      var t = thimbleState();
      var stage = thimbleStage(t);
      ctx.fillStyle = '#0d0805';
      ctx.fillRect(0, 0, 480, 360);
      // thimble pot
      ctx.fillStyle = '#8a8a92';
      ctx.beginPath();
      ctx.moveTo(200, 220); ctx.lineTo(280, 220); ctx.lineTo(268, 300); ctx.lineTo(212, 300);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#3a2412';
      ctx.fillRect(196, 210, 88, 14);
      // leaves by stage
      ctx.strokeStyle = '#3a8a3a';
      ctx.fillStyle = '#3a8a3a';
      ctx.lineWidth = 3;
      for (var i = 0; i < stage; i++) {
        var side = i % 2 === 0 ? -1 : 1;
        var y = 200 - Math.floor(i / 2) * 34;
        ctx.beginPath();
        ctx.ellipse(240 + side * (20 + (i % 2) * 8), y, 22, 9, side * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      if (stage >= 5) {
        // bloom + dew sparkle
        ctx.fillStyle = '#e08ab0';
        ctx.beginPath(); ctx.arc(240, 96, 12, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(236, 92, 3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#a89070';
      ctx.font = 'italic 14px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText(stage === 0 ? 'an empty thimble. go elsewhere.' : stage + (stage === 1 ? ' leaf.' : ' leaves.'), 240, 336);
      if (hint) {
        hint.textContent = stage === 0
          ? 'it grows while you are elsewhere. visit rooms, come back.'
          : 'dew sparkles. harvest when ready — or let it keep growing.';
      }
    }
    draw();

    var harvest = document.getElementById('thimble-harvest');
    if (harvest) harvest.addEventListener('click', function () {
      var st = (window.Liber && window.Liber.state) || null;
      if (!st) return;
      var t = thimbleState();
      var stage = thimbleStage(t);
      if (!stage) {
        if (result) result.textContent = 'nothing to harvest yet — go live a little, then return.';
        return;
      }
      var shot = thumb(cv);
      var petal = THIMBLE_PETALS[(t.harvested || 0) % THIMBLE_PETALS.length];
      promptSave(b, 'result: ' + stage + ' leaves pressed, one ' + petal + ' petal for the paint boxes.', function () {
        saveToDesktopAndSatchel(b, { leaves: stage, harvested: (t.harvested || 0) + 1, petal: petal }, shot);
        try {
          var g = st.get() || {};
          var pal = Array.isArray(g.palette) ? g.palette.slice() : [];
          if (pal.indexOf(petal) < 0) pal.push(petal);
          st.set({ palette: pal, thimble: { visits: t.visits || 0, base: t.visits || 0, harvested: (t.harvested || 0) + 1 } });
        } catch (e) {}
        if (result) result.textContent = 'kept. a petal drifts to every paint box.';
        draw();
      }, null);
    });
  }

  // ── first-visit demo: the tutorial passes through games on its way to
  // the bind. Open the wheel, throw one dart through the Cursor's hands,
  // keep it, and move on. Every step falls through to advance().

  document.addEventListener('DOMContentLoaded', function () {
    buildPicker();
    if (panLeft) panLeft.addEventListener('click', function () { moveCamera(-1); });
    if (panRight) panRight.addEventListener('click', function () { moveCamera(1); });
    if (descBox && !descBox.querySelector('.games-desc-name')) {
      descBox.innerHTML = '<div class="games-desc-name">pick a game, friend.</div><div>follow the dirt path, pan the midway, and pull a poster when you are ready.</div>';
    }

    (function tutorialBooth() {
      var tst = (window.Liber && window.Liber.state) || null;
      if (!tst || !window.Cursor) return;
      if ((tst.get().tutorialStage || null) !== 'games') return;
      function advance() {
        var s2 = (window.Liber && window.Liber.state) || null;
        if (!s2) return;
        if ((s2.get().tutorialStage || null) !== 'games') return;
        s2.set({ tutorialStage: 'bind' });
        window.location.href = 'desktop.html';
      }
      setTimeout(function () {
        var booth = document.querySelector('.games-booth[data-game="wheel"]');
        if (!booth) { advance(); return; }
        window.Cursor.clickEl(booth, 700).then(function () {
          setTimeout(function () {
            var wheel = document.getElementById('wheel-svg');
            if (!wheel) { advance(); return; }
            window.Cursor.clickEl(wheel, 400).then(function () {
              setTimeout(function () {
                var swatch = document.querySelector('#wheel-colors .wheel-color');
                if (!swatch) { advance(); return; }
                window.Cursor.clickEl(swatch, 400).then(function () {
                  setTimeout(function () {
                    var keep = document.getElementById('games-save-prompt-keep');
                    var kb = document.getElementById('wheel-keep');
                    if (kb) kb.click();
                    setTimeout(function () {
                      if (!keep) { advance(); return; }
                      window.Cursor.clickEl(keep, 400).then(function () {
                        setTimeout(advance, 1000);
                      });
                    }, 700);
                  }, 700);
                });
              }, 900);
            });
          }, 700);
        });
      }, 1000);
    })();

    var exit = document.getElementById('games-exit');
    if (exit) exit.addEventListener('click', function () {
      if (history.length > 1) history.back(); else location.href = 'desktop.html';
    });

    var helpBtn = document.getElementById('games-help');
    var raison = document.getElementById('games-raison');
    var raisonClose = document.getElementById('games-raison-close');
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
      { id: 'games-raison', close: closeRaison }
    ] });

    var prompt = document.getElementById('games-save-prompt');
    var keepBtn = document.getElementById('games-save-prompt-keep');
    var discardBtn = document.getElementById('games-save-prompt-discard');
    var closeBtn = document.getElementById('games-save-prompt-close');
    if (keepBtn) keepBtn.addEventListener('click', function () {
      var p = pendingPayload;
      closePrompt();
      if (p && p.doSave) p.doSave();
    });
    if (discardBtn) discardBtn.addEventListener('click', function () {
      var p = pendingPayload;
      closePrompt();
      if (p && p.doDiscard) p.doDiscard();
    });
    if (closeBtn) closeBtn.addEventListener('click', closePrompt);
    if (prompt) prompt.addEventListener('click', function (e) { if (e.target === prompt) closePrompt(); });
    if (window.LiberRoomShell) window.LiberRoomShell.bindRoomOverlays({ overlays: [
      { id: 'games-save-prompt', close: closePrompt }
    ] });
  });

  window.Liber = window.Liber || {};
  window.Liber.games = { recordBest: recordBest, bestOf: BEST_OF };
})();
