// games.js — Whimsy Wow. Two tents: DBT tools (faithful, kept) and
// pure play (distracting, kept nowhere). No shared imports (covenant Q.1).
// The Leadbeater ink library below mirrors the casting stone's palette
// on purpose — same design language, her material. (Duplicated, not
// imported: the covenant forbids shared imports between personas.)
// Each booth is a square that opens a small play window in place.
// Each play session auto-saves its result to satchel via
// state.addArtifact('satchel', ...) and the booth itself shows up on
// the desktop.

(function () {
  var grid = document.getElementById('games-grid');
  var stage = document.getElementById('games-stage');

  var BOOTHS = [
    { id: 'tip',         wing: 'dbt tools', heat: 5, name: 'TIPP',                glyph: '✦', desc: 'temperature, intense exercise, paced breath, progressive relaxation.' },
    { id: 'emotion',     wing: 'dbt tools', heat: 3, name: 'emotion wheel',       glyph: '◉', desc: 'pick a wedge. name the weight. colour it. keep it.' },
    { id: 'boundary',    wing: 'dbt tools', heat: 2, name: 'boundary shield',     glyph: '◈', desc: 'draw the line. name what stays out.' },
    { id: 'relcircle',   wing: 'dbt tools', heat: 2, name: 'relationship circle', glyph: '◎', desc: 'who stands close? place them honestly.' },
    { id: 'thermometer', wing: 'dbt tools', heat: 3, name: 'thermometer',       glyph: '°', desc: 'name it. colour it. watch the level.' },
    { id: 'sandplay',    wing: 'dbt tools', heat: 2, name: 'sandplay',          glyph: '▦', desc: 'deal three toys. place them. say one line. (Punnett 2020 · Freedle 2025)' },
    { id: 'mandala',     wing: 'pure play', heat: 1, name: 'mandala',             glyph: '◯', desc: 'trace the lines. ground the attention.' },
    { id: 'static',      wing: 'pure play', heat: 1, name: 'static stare',        glyph: '▓', desc: 'stare into the noise. press when something surfaces.' },
    { id: 'candle',      wing: 'pure play', heat: 1, name: 'candle watch',        glyph: '◍', desc: 'shelter the flame. keep it lit.' }
  ];

  var WING_SCOPE = {
    'dbt tools': 'faithful tools — what you finish here is kept to your satchel. small local acts: one booth, one breath, one kept line. (Kast 2024)',
    'pure play': 'distractions, no ledger — nothing is kept here.'
  };

  function buildBooths() {
    if (!grid) return;
    grid.innerHTML = '';
    var lastWing = null;
    for (var i = 0; i < BOOTHS.length; i++) {
      (function (b) {
        if (b.wing !== lastWing) {
          lastWing = b.wing;
          var h = document.createElement('div');
          h.className = 'games-wing';
          var wt = document.createElement('div');
          wt.className = 'games-wing-title';
          wt.textContent = lastWing;
          h.appendChild(wt);
          if (WING_SCOPE[lastWing]) {
            var ws = document.createElement('div');
            ws.className = 'games-wing-scope';
            ws.textContent = WING_SCOPE[lastWing];
            h.appendChild(ws);
          }
          grid.appendChild(h);
        }
        var div = document.createElement('div');
        div.className = 'games-booth';
        div.setAttribute('data-game', b.id);
        var heat = '';
        for (var hd = 0; hd < 5; hd++) {
          heat += '<i class="' + (hd < (b.heat || 1) ? 'on' : '') + '"></i>';
        }
        div.innerHTML =
          '<div class="games-booth-glyph">' + b.glyph + '</div>' +
          '<div class="games-booth-name">' + b.name + '</div>' +
          '<div class="games-booth-desc">' + b.desc + '</div>' +
          '<div class="games-heat" aria-hidden="true">' + heat + '</div>';
        div.addEventListener('click', function () { openPlay(b); });
        grid.appendChild(div);
      })(BOOTHS[i]);
    }
  }

  // WS5 personal bests — per booth, local, private (no leaderboards, no
  // comparisons). A booth earns a best only where a score exists. dir:
  // 'high' = bigger is the record, 'low' = smaller is.
  var BEST_OF = {
    tip: { key: 'ice', label: 'ice held', dir: 'high' },
  };

  var INKS = [
    { name: 'High Spirituality', hex: '#B4B4D2' },
    { name: 'Religious Feeling, tinged with Fear', hex: '#2E2E6E' },
    { name: 'Sympathy', hex: '#79B879' },
    { name: 'Adaptability', hex: '#7A7A3C' },
    { name: 'Selfishness', hex: '#6B5B4B' },
    { name: 'Devotion mixed with Affection', hex: '#9FA8C2' },
    { name: 'Highest Intellect', hex: '#F2F200' },
    { name: 'Love for Humanity', hex: '#BE8FBE' },
    { name: 'Jealousy', hex: '#6B4A2E' },
    { name: 'Avarice', hex: '#8C8C8C' },
    { name: 'Devotion to a Noble Ideal', hex: '#6E92D6' },
    { name: 'Strong Intellect', hex: '#E09320' },
    { name: 'Unselfish Affection', hex: '#E28292' },
    { name: 'Deceit', hex: '#8A9077' },
    { name: 'Anger', hex: '#C02424' },
    { name: 'Pure Religious Feeling', hex: '#2440C4' },
    { name: 'Low type of Intellect', hex: '#A06224' },
    { name: 'Selfish Affection', hex: '#4E2424' },
    { name: 'Fear', hex: '#B2B2C2' },
    { name: 'Sensuality', hex: '#92605C' },
    { name: 'Selfish Religious Feeling', hex: '#121A24' },
    { name: 'Pride', hex: '#E04414' },
    { name: 'Pure Affection', hex: '#E22424' },
    { name: 'Depression', hex: '#3B3448' },
    { name: 'Malice', hex: '#0B0B0B' }
  ];

  function inkTray(hostId, onPick) {
    var host = document.getElementById(hostId);
    if (!host) return -1;
    host.innerHTML = '';
    for (var i = 0; i < INKS.length; i++) {
      (function (n) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'games-ink' + (n === 0 ? ' on' : '');
        b.style.background = INKS[n].hex;
        b.title = INKS[n].name;
        b.setAttribute('aria-label', 'ink: ' + INKS[n].name);
        b.addEventListener('click', function () {
          var sibs = host.querySelectorAll('.games-ink');
          for (var k = 0; k < sibs.length; k++) sibs[k].classList.remove('on');
          b.classList.add('on');
          onPick(n);
        });
        host.appendChild(b);
      })(i);
    }
    return 0;
  }

  function recordBest(boothId, value) {
    if (!window.Liber || !window.Liber.state) return null;
    var metric = BEST_OF[boothId];
    if (!metric || typeof value !== 'number' || isNaN(value) || value <= 0) return null;
    var bests = Object.assign({}, window.Liber.state.get().bests || {});
    var prev = typeof bests[boothId] === 'number' ? bests[boothId] : null;
    var better = prev === null || (metric.dir === 'high' ? value > prev : value < prev);
    if (!better) return { newBest: false, value: value, best: prev, label: metric.label };
    bests[boothId] = value;
    window.Liber.state.set({ bests: bests });
    return { newBest: true, value: value, best: value, label: metric.label };
  }

  function whimsyLine(best) {
    return '<div class="games-best">★ a new house record — ' + best.value + 's ' + best.label +
      '! the bulbs flare for you. ★</div>';
  }

  function closeStage() {
    if (!stage) return;
    stage.innerHTML = '';
    stage.classList.remove('open');
    stage.setAttribute('inert', '');
  }

  function saveToDesktopAndSatchel(b, result) {
    if (!window.Liber || !window.Liber.state) return { best: null };
    if (window.Liber.state.addArtifact) {
      window.Liber.state.addArtifact('games', { kind: b.id, name: b.name, glyph: b.glyph, result: result, ts: Date.now() });
    }
    if (window.Liber.state.addArtifact) {
      window.Liber.state.addArtifact('satchel', { kind: 'game', ref: b.id, name: b.name, result: result, ts: Date.now() });
    }
    if (window.Liber.sound) window.Liber.sound.play('chime');
    var metric = BEST_OF[b.id];
    var best = metric ? recordBest(b.id, result[metric.key]) : null;
    return { best: best };
  }

  function promptSave(b, summary, doSave, doDiscard) {
    var prompt = document.getElementById('games-save-prompt');
    var body = document.getElementById('games-save-prompt-body');
    if (!prompt) { doSave(); return; }
    pendingPayload = { summary: summary, doSave: doSave, doDiscard: doDiscard };
    if (body) body.innerHTML = 'booth: <em>' + b.name + '</em>. ' + summary;
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

  function openPlay(b) {
    if (!stage) return;
    stage.classList.add('open');
    stage.removeAttribute('inert');
    var html = '<div class="games-stage-inner">';
    html += '<div class="games-stage-head">';
    html += '<span class="games-stage-glyph">' + b.glyph + '</span>';
    html += '<span class="games-stage-name">' + b.name + '</span>';
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
    if (b.id === 'tip') {
      body.innerHTML =
        '<div class="games-prompt">TIPP — temperature, intense exercise, paced breath, progressive relaxation. hold the ice: 30 seconds.</div>' +
        '<div class="games-tip-thermo"><div class="games-tip-thermo-fill" id="tip-fill"></div></div>' +
        '<div class="games-tip-row">' +
          '<button type="button" class="games-action" id="tip-ice">face in ice</button>' +
          '<button type="button" class="games-action" id="tip-breath">paced breath 4-4-6</button>' +
          '<button type="button" class="games-action" id="tip-relax">tense / release</button>' +
        '</div>' +
        '<div class="games-tip-meter">distress <span id="tip-distress">6</span>/10</div>' +
        '<div class="games-tip-log" id="tip-log">begin.</div>' +
        '<div class="games-actions"><button type="button" class="games-action" id="tip-save">save what happened</button></div>';
      var distress = 6;
      var log = document.getElementById('tip-log');
      function tipLog(s) { if (log) log.textContent = s; }
      var fill = document.getElementById('tip-fill');
      function setFill(pct) { if (fill) fill.style.width = pct + '%'; }
      function sync() {
        var d = document.getElementById('tip-distress'); if (d) d.textContent = distress;
      }
      var ice = document.getElementById('tip-ice');
      var breath = document.getElementById('tip-breath');
      var relax = document.getElementById('tip-relax');
      var iceTimer = null, iceT = 0;
      if (ice) ice.addEventListener('click', function () {
        if (iceTimer) { clearInterval(iceTimer); iceTimer = null; tipLog('ice: aborted.'); return; }
        iceT = 0; setFill(0); tipLog('ice: 0/30s — hold.');
        iceTimer = setInterval(function () {
          iceT++;
          setFill((iceT / 30) * 100);
          if (iceT >= 30) { clearInterval(iceTimer); iceTimer = null; distress = Math.max(0, distress - 2); sync(); tipLog('ice: 30s held. distress ' + distress + '.'); }
        }, 1000);
      });
      var breathPhases = ['in 4', 'hold 4', 'out 6', 'hold 4'];
      var breathT = 0, breathI = null;
      if (breath) breath.addEventListener('click', function () {
        if (breathI) { clearInterval(breathI); breathI = null; tipLog('breath: stopped.'); return; }
        breathT = 0;
        breathI = setInterval(function () {
          tipLog('breath: ' + breathPhases[breathT % 4]);
          breathT++;
          if (breathT % 8 === 0) { distress = Math.max(0, distress - 1); sync(); }
        }, 2000);
      });
      var relaxI = null, relaxT = 0;
      if (relax) relax.addEventListener('click', function () {
        if (relaxI) { clearInterval(relaxI); relaxI = null; tipLog('relax: stopped.'); return; }
        relaxT = 0;
        relaxI = setInterval(function () {
          tipLog('relax: ' + (relaxT % 2 === 0 ? 'tense 5s' : 'release 5s'));
          relaxT++;
          if (relaxT % 4 === 0) { distress = Math.max(0, distress - 1); sync(); }
        }, 2500);
      });
      var s = document.getElementById('tip-save');
      if (s) s.addEventListener('click', function () {
        promptSave(b, 'TIPP done. distress: ' + distress + '/10.', function () {
          var saved = saveToDesktopAndSatchel(b, { type: 'tip', distress: distress, ice: iceT });
          var bestHtml = (saved.best && saved.best.newBest) ? whimsyLine(saved.best) : '';
          body.innerHTML = '<div class="games-result">— saved · distress ' + distress + '/10 —</div>' + bestHtml;
        }, function () {
          body.innerHTML = '<div class="games-result">— discarded —</div>';
        });
      });
    } else if (b.id === 'emotion') {
      var EMW = ['joy', 'trust', 'fear', 'surprise', 'sadness', 'disgust', 'anger', 'anticipation'];
      var emState = { wedge: -1, intensity: 3, ink: 0, colored: {} };
      body.innerHTML =
        '<div class="games-prompt">pick a wedge. name the weight. colour it. keep the wheel.</div>' +
        '<svg class="games-emwheel" id="emwheel" viewBox="0 0 200 200" role="img" aria-label="emotion wheel"></svg>' +
        '<div class="games-emrow"><button type="button" class="games-action" id="em-minus" aria-label="lower intensity">−</button>' +
        '<span class="games-em-intensity">intensity · <span id="em-num">3</span>/5</span>' +
        '<button type="button" class="games-action" id="em-plus" aria-label="raise intensity">+</button></div>' +
        '<div class="games-inks" id="em-inks" role="group" aria-label="inks"></div>' +
        '<div class="games-actions"><button type="button" class="games-action" id="em-keep">keep the wheel</button></div>';
      var emSvg = document.getElementById('emwheel');
      var emNS = 'http://www.w3.org/2000/svg';
      function emArc(i) {
        var a0 = (i / 8) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 1) / 8) * Math.PI * 2 - Math.PI / 2;
        var cx = 100, cy = 100, r0 = 34, r1 = 94;
        function pt(r, a) { return (cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1); }
        return 'M' + pt(r0, a0) + 'L' + pt(r1, a0) + 'A' + r1 + ',' + r1 + ' 0 0 1 ' + pt(r1, a1) +
          'L' + pt(r0, a1) + 'A' + r0 + ',' + r0 + ' 0 0 0 ' + pt(r0, a0) + 'Z';
      }
      var emPaths = [];
      for (var ei = 0; ei < 8; ei++) {
        (function (n) {
          var p = document.createElementNS(emNS, 'path');
          p.setAttribute('d', emArc(n));
          p.setAttribute('class', 'games-emwedge');
          var title = document.createElementNS(emNS, 'title');
          title.textContent = EMW[n];
          p.appendChild(title);
          p.addEventListener('click', function () { emState.wedge = n; paintEmWheel(); });
          emSvg.appendChild(p);
          emPaths.push(p);
          var mid = ((n + 0.5) / 8) * Math.PI * 2 - Math.PI / 2;
          var t = document.createElementNS(emNS, 'text');
          t.setAttribute('x', (100 + 64 * Math.cos(mid)).toFixed(1));
          t.setAttribute('y', (100 + 64 * Math.sin(mid)).toFixed(1));
          t.setAttribute('class', 'games-emlabel');
          t.setAttribute('text-anchor', 'middle');
          t.textContent = EMW[n];
          emSvg.appendChild(t);
        })(ei);
      }
      function paintEmWheel() {
        for (var k = 0; k < emPaths.length; k++) {
          var cc = emState.colored[k];
          emPaths[k].setAttribute('fill', cc ? cc.color : 'none');
          emPaths[k].setAttribute('fill-opacity', cc ? (0.35 + cc.intensity * 0.13) : 1);
          emPaths[k].classList.toggle('picked', k === emState.wedge);
        }
        var nn = document.getElementById('em-num');
        if (nn) nn.textContent = emState.intensity;
      }
      paintEmWheel();
      var emMinus = document.getElementById('em-minus');
      var emPlus = document.getElementById('em-plus');
      if (emMinus) emMinus.addEventListener('click', function () {
        emState.intensity = Math.max(1, emState.intensity - 1); paintEmWheel();
      });
      if (emPlus) emPlus.addEventListener('click', function () {
        emState.intensity = Math.min(5, emState.intensity + 1); paintEmWheel();
      });
      inkTray('em-inks', function (n) {
        emState.ink = n;
        if (emState.wedge >= 0) {
          emState.colored[emState.wedge] = { emotion: EMW[emState.wedge], intensity: emState.intensity, color: INKS[n].hex, ink: INKS[n].name };
          paintEmWheel();
        }
      });
      var emKeep = document.getElementById('em-keep');
      if (emKeep) emKeep.addEventListener('click', function () {
        var feels = Object.keys(emState.colored).map(function (k) { return emState.colored[k]; });
        if (!feels.length) {
          body.innerHTML = '<div class="games-result">— colour at least one wedge first —</div>';
          return;
        }
        promptSave(b, feels.length + ' feeling' + (feels.length === 1 ? '' : 's') + ' weighed.', function () {
          saveToDesktopAndSatchel(b, { type: 'emwheel', feelings: feels });
          body.innerHTML = '<div class="games-result">— wheel kept · ' + feels.length + ' weighed —</div>';
        }, function () { body.innerHTML = '<div class="games-result">— discarded —</div>'; });
      });
    } else if (b.id === 'boundary') {
      var bdState = { ink: 7 };
      body.innerHTML =
        '<div class="games-prompt">three rings. what holds at each one.</div>' +
        '<svg class="games-shield" viewBox="0 0 200 200" role="img" aria-label="boundary shield"></svg>' +
        '<label class="games-field"><span>at my center…</span><input type="text" class="games-input" id="bd-core" maxlength="80" /></label>' +
        '<label class="games-field"><span>at my edge…</span><input type="text" class="games-input" id="bd-edge" maxlength="80" /></label>' +
        '<label class="games-field"><span>outside stays…</span><input type="text" class="games-input" id="bd-out" maxlength="80" /></label>' +
        '<div class="games-inks" id="bd-inks" role="group" aria-label="inks"></div>' +
        '<div class="games-actions"><button type="button" class="games-action" id="bd-keep">seal the shield</button></div>';
      var bdSvgNS = 'http://www.w3.org/2000/svg';
      var bdSvg = body.querySelector('.games-shield');
      function bdCircle(r, cls) {
        var c = document.createElementNS(bdSvgNS, 'circle');
        c.setAttribute('cx', '100'); c.setAttribute('cy', '100'); c.setAttribute('r', String(r));
        c.setAttribute('class', cls);
        bdSvg.appendChild(c);
        return c;
      }
      bdCircle(88, 'games-shield-outer');
      var bdRing = bdCircle(60, 'games-shield-ring');
      bdCircle(30, 'games-shield-core');
      var bdMe = document.createElementNS(bdSvgNS, 'text');
      bdMe.setAttribute('x', '100'); bdMe.setAttribute('y', '104');
      bdMe.setAttribute('text-anchor', 'middle');
      bdMe.setAttribute('class', 'games-shield-me');
      bdMe.textContent = 'me';
      bdSvg.appendChild(bdMe);
      function paintShield() {
        if (bdRing) bdRing.setAttribute('stroke', INKS[bdState.ink].hex);
      }
      inkTray('bd-inks', function (n) { bdState.ink = n; paintShield(); });
      paintShield();
      var bdKeep = document.getElementById('bd-keep');
      if (bdKeep) bdKeep.addEventListener('click', function () {
        function val(id) {
          var el = document.getElementById(id);
          return el ? el.value.trim() : '';
        }
        var lines = [val('bd-core'), val('bd-edge'), val('bd-out')];
        if (!lines[0] && !lines[1] && !lines[2]) {
          body.innerHTML = '<div class="games-result">— write at least one line first —</div>';
          return;
        }
        var ink = INKS[bdState.ink];
        promptSave(b, 'a shield, sealed in ' + ink.name.toLowerCase() + '.', function () {
          saveToDesktopAndSatchel(b, { type: 'boundary', lines: lines, color: ink.hex, ink: ink.name });
          body.innerHTML = '<div class="games-result">— shield sealed —</div>';
        }, function () { body.innerHTML = '<div class="games-result">— discarded —</div>'; });
      });
    } else if (b.id === 'relcircle') {
      var rcFigures = [];
      body.innerHTML =
        '<div class="games-prompt">who stands close? place them honestly. tap a figure to move it outward.</div>' +
        '<svg class="games-relcircle" viewBox="0 0 200 200" role="img" aria-label="relationship circle">' +
          '<circle cx="100" cy="100" r="88" class="games-rc-ring"/>' +
          '<circle cx="100" cy="100" r="60" class="games-rc-ring"/>' +
          '<circle cx="100" cy="100" r="32" class="games-rc-ring"/>' +
          '<text x="100" y="104" text-anchor="middle" class="games-rc-me">you</text>' +
          '<g id="relcircle-dots"></g>' +
        '</svg>' +
        '<div class="games-rc-legend" id="rc-legend">— no one placed yet —</div>' +
        '<div class="games-actions"><input type="text" class="games-input" id="rc-name" maxlength="24" aria-label="their name" />' +
        '<button type="button" class="games-action" id="rc-add">place them</button></div>' +
        '<div class="games-actions"><button type="button" class="games-action" id="rc-keep">keep the circle</button></div>';
      var rcNS = 'http://www.w3.org/2000/svg';
      var rcNames = ['inner', 'middle', 'outer'];
      function paintDots() {
        var g = document.getElementById('relcircle-dots');
        var legend = document.getElementById('rc-legend');
        if (legend) {
          legend.textContent = rcFigures.length
            ? rcFigures.map(function (f) { return f.name + ' — ' + rcNames[f.ring]; }).join(' · ')
            : '— no one placed yet —';
        }
        if (!g) return;
        g.innerHTML = '';
        var radii = [32, 60, 88];
        for (var i = 0; i < rcFigures.length; i++) {
          (function (f, k) {
            var a = (k / Math.max(rcFigures.length, 1)) * Math.PI * 2 - Math.PI / 2;
            var r = radii[f.ring] || 88;
            var c = document.createElementNS(rcNS, 'circle');
            c.setAttribute('cx', (100 + r * Math.cos(a)).toFixed(1));
            c.setAttribute('cy', (100 + r * Math.sin(a)).toFixed(1));
            c.setAttribute('r', '9');
            c.setAttribute('class', 'games-rc-dot');
            var t = document.createElementNS(rcNS, 'title');
            t.textContent = f.name;
            c.appendChild(t);
            c.addEventListener('click', function () { f.ring = (f.ring + 1) % 3; paintDots(); });
            g.appendChild(c);
          })(rcFigures[i], i);
        }
      }
      paintDots();
      var rcAdd = document.getElementById('rc-add');
      if (rcAdd) rcAdd.addEventListener('click', function () {
        var inp = document.getElementById('rc-name');
        var name = inp ? inp.value.trim() : '';
        if (!name) return;
        rcFigures.push({ name: name, ring: 1 });
        if (inp) inp.value = '';
        paintDots();
      });
      var rcKeep = document.getElementById('rc-keep');
      if (rcKeep) rcKeep.addEventListener('click', function () {
        if (!rcFigures.length) {
          body.innerHTML = '<div class="games-result">— place at least one figure first —</div>';
          return;
        }
        promptSave(b, rcFigures.length + ' placed close.', function () {
          saveToDesktopAndSatchel(b, { type: 'relcircle', figures: rcFigures.slice() });
          body.innerHTML = '<div class="games-result">— circle kept · ' + rcFigures.length + ' placed —</div>';
        }, function () { body.innerHTML = '<div class="games-result">— discarded —</div>'; });
      });
    } else if (b.id === 'thermometer') {
      var DEALT = ['grief', 'anger', 'tenderness', 'dread', 'relief', 'shame', 'wonder', 'loneliness'];
      var thState = { ink: 0, level: 5, dealt: false };
      body.innerHTML =
        '<div class="games-prompt">name it. colour it. watch the level.</div>' +
        '<div class="games-thermo-art">' +
          '<svg class="games-thermo-svg" viewBox="0 0 80 220" aria-hidden="true">' +
            '<rect x="30" y="10" width="20" height="150" rx="10" class="games-thermo-tube"/>' +
            '<rect x="33" y="157" width="14" height="3" rx="1.5" class="games-thermo-fill" id="thermo-fill-art"/>' +
            '<circle cx="40" cy="182" r="26" class="games-thermo-bulb"/>' +
            '<circle cx="40" cy="182" r="26" class="games-thermo-bulbfill" id="thermo-bulb-art"/>' +
          '</svg>' +
          '<div class="games-thermo-side">' +
            '<input type="text" class="games-input" id="thermo-emo" maxlength="40" aria-label="the emotion" />' +
            '<button type="button" class="games-action" id="thermo-deal">deal me one</button>' +
            '<input type="range" class="games-thermo-range" id="thermo-level" min="1" max="10" value="5" aria-label="intensity" />' +
            '<div class="games-thermo-readout">level · <span id="thermo-num">5</span>/10</div>' +
          '</div>' +
        '</div>' +
        '<div class="games-inks" id="thermo-inks" role="group" aria-label="inks"></div>' +
        '<div class="games-actions"><button type="button" class="games-action" id="thermo-keep">keep the reading</button></div>';
      function paintThermo() {
        var lvl = thState.level;
        var h = Math.max(3, 150 * lvl / 10);
        var fill = document.getElementById('thermo-fill-art');
        var bulb = document.getElementById('thermo-bulb-art');
        var col = INKS[thState.ink].hex;
        if (fill) { fill.setAttribute('y', (160 - h).toFixed(1)); fill.setAttribute('height', h.toFixed(1)); fill.setAttribute('fill', col); }
        if (bulb) bulb.setAttribute('fill', col);
        var nn = document.getElementById('thermo-num');
        if (nn) nn.textContent = lvl;
      }
      var thRange = document.getElementById('thermo-level');
      if (thRange) thRange.addEventListener('input', function () {
        thState.level = parseInt(thRange.value, 10) || 5;
        paintThermo();
      });
      inkTray('thermo-inks', function (n) { thState.ink = n; paintThermo(); });
      paintThermo();
      var thDeal = document.getElementById('thermo-deal');
      if (thDeal) thDeal.addEventListener('click', function () {
        var emo = document.getElementById('thermo-emo');
        var pick = DEALT[Math.floor(Math.random() * DEALT.length)];
        if (emo) emo.value = pick;
        thState.dealt = true;
      });
      var thKeep = document.getElementById('thermo-keep');
      if (thKeep) thKeep.addEventListener('click', function () {
        var emoEl = document.getElementById('thermo-emo');
        var emo = emoEl ? emoEl.value.trim() : '';
        if (!emo) {
          body.innerHTML = '<div class="games-result">— name it first —</div>';
          return;
        }
        var ink = INKS[thState.ink];
        promptSave(b, emo + ' at ' + thState.level + '/10, coloured ' + ink.name.toLowerCase() + '.', function () {
          saveToDesktopAndSatchel(b, { type: 'thermometer', emotion: emo, intensity: thState.level, color: ink.hex, ink: ink.name, dealt: thState.dealt });
          body.innerHTML = '<div class="games-result">— kept · ' + emo + ' at ' + thState.level + ' —</div>';
        }, function () { body.innerHTML = '<div class="games-result">— discarded —</div>'; });
      });
    } else if (b.id === 'mandala') {
      body.innerHTML =
        '<div class="games-prompt">trace the mandala. follow the line. one breath in, one breath out.</div>' +
        '<canvas class="games-mandala" id="mandala-canvas" width="320" height="320"></canvas>' +
        '<div class="games-actions">' +
          '<button type="button" class="games-action" id="mandala-traced">i traced it</button>' +
          '<button type="button" class="games-action" id="mandala-reset">start over</button>' +
        '</div>';
      var mCan = document.getElementById('mandala-canvas');
      if (mCan) {
        var mctx = mCan.getContext('2d');
        var cx = 160, cy = 160;
        for (var r2 = 16; r2 < 160; r2 += 24) {
          mctx.beginPath(); mctx.arc(cx, cy, r2, 0, Math.PI * 2);
          mctx.strokeStyle = 'rgba(255, 215, 100, 0.4)';
          mctx.lineWidth = 1.4; mctx.stroke();
        }
        for (var a2 = 0; a2 < 12; a2++) {
          var ang = (a2 / 12) * Math.PI * 2;
          mctx.beginPath();
          mctx.moveTo(cx, cy);
          mctx.lineTo(cx + Math.cos(ang) * 150, cy + Math.sin(ang) * 150);
          mctx.strokeStyle = 'rgba(255, 215, 100, 0.25)';
          mctx.lineWidth = 1; mctx.stroke();
        }
        mctx.fillStyle = 'rgba(255, 215, 100, 0.6)';
        mctx.beginPath(); mctx.arc(cx, cy, 4, 0, Math.PI * 2); mctx.fill();
      }
      var mTraced = document.getElementById('mandala-traced');
      if (mTraced) mTraced.addEventListener('click', function () {
        body.innerHTML = '<div class="games-result">— mandala traced —</div>';
        if (window.Liber && window.Liber.sound) window.Liber.sound.play('chime');
      });
    } else if (b.id === 'static') {
      body.innerHTML =
        '<div class="games-prompt">stare into the noise. press when something surfaces.</div>' +
        '<canvas class="games-static" id="static-canvas" width="300" height="180"></canvas>' +
        '<div class="games-actions"><button type="button" class="games-action" id="static-see">i see something</button>' +
        '<button type="button" class="games-action" id="static-again">still looking</button></div>' +
        '<div class="games-static-line" id="static-line">the noise keeps what you bring it.</div>';
      var scv = document.getElementById('static-canvas');
      var sctx = scv ? scv.getContext('2d') : null;
      var sSeed = Math.floor(Math.random() * 100000) + 1;
      var sShape = null;
      var sLines = ['the noise keeps what you bring it.', 'something looked back. politely.', 'a shape, almost.', 'the void, buffering.'];
      function sRand() {
        sSeed = (sSeed * 1103515245 + 12345) & 0x7fffffff;
        return sSeed / 0x7fffffff;
      }
      function drawStaticShape() {
        if (!sctx || !sShape) return;
        sctx.strokeStyle = 'rgba(212, 175, 55, 0.85)';
        sctx.lineWidth = 2;
        sctx.beginPath();
        if (sShape.kind === 0) {
          sctx.arc(sShape.x, sShape.y, 22, 0, Math.PI * 2);
        } else if (sShape.kind === 1) {
          sctx.moveTo(sShape.x, sShape.y - 24);
          sctx.lineTo(sShape.x + 22, sShape.y + 18);
          sctx.lineTo(sShape.x - 22, sShape.y + 18);
          sctx.closePath();
        } else {
          sctx.moveTo(sShape.x - 20, sShape.y);
          sctx.lineTo(sShape.x + 20, sShape.y);
          sctx.moveTo(sShape.x, sShape.y - 20);
          sctx.lineTo(sShape.x, sShape.y + 20);
        }
        sctx.stroke();
      }
      function noiseFrame() {
        if (!scv || !document.body.contains(scv)) return;
        var img = sctx.createImageData(scv.width, scv.height);
        var d = img.data;
        for (var i = 0; i < d.length; i += 4) {
          var v = Math.floor(sRand() * 70) + 8;
          d[i] = v + 20; d[i + 1] = v + 8; d[i + 2] = v; d[i + 3] = 255;
        }
        sctx.putImageData(img, 0, 0);
        drawStaticShape();
        requestAnimationFrame(noiseFrame);
      }
      if (sctx) noiseFrame();
      var sSee = document.getElementById('static-see');
      var sAgain = document.getElementById('static-again');
      var sLine = document.getElementById('static-line');
      if (sSee) sSee.addEventListener('click', function () {
        sShape = { kind: Math.floor(sRand() * 3), x: 60 + sRand() * 180, y: 40 + sRand() * 100 };
        if (sLine) sLine.textContent = sLines[Math.floor(sRand() * sLines.length)];
      });
      if (sAgain) sAgain.addEventListener('click', function () {
        sShape = null;
        if (sLine) sLine.textContent = 'the noise keeps what you bring it.';
      });
    } else if (b.id === 'candle') {
      body.innerHTML =
        '<div class="games-prompt">shelter the flame. keep it lit.</div>' +
        '<div class="games-candle-wrap"><div class="games-flame" id="candle-flame"></div>' +
        '<div class="games-gust" id="candle-gust">the wind is calm.</div></div>' +
        '<div class="games-candle-life"><div class="games-candle-fill" id="candle-fill"></div></div>' +
        '<div class="games-actions"><button type="button" class="games-action" id="candle-hold">hold to shelter</button></div>' +
        '<div class="games-result" id="candle-line" hidden></div>';
      var cFlame = document.getElementById('candle-flame');
      var cGust = document.getElementById('candle-gust');
      var cFill = document.getElementById('candle-fill');
      var cHold = document.getElementById('candle-hold');
      var cLine = document.getElementById('candle-line');
      var cLife = 100, cSheltered = false, cOver = false, gusting = false, cElapsed = 0;
      var cSeed = Math.floor(Math.random() * 100000) + 1;
      function cRand() {
        cSeed = (cSeed * 1103515245 + 12345) & 0x7fffffff;
        return cSeed / 0x7fffffff;
      }
      function paintCandle() {
        if (cFill) cFill.style.width = Math.max(0, cLife) + '%';
        if (cFlame) cFlame.classList.toggle('blown', gusting && !cSheltered);
        if (cGust) cGust.textContent = gusting ? 'gust! hold steady.' : 'the wind is calm.';
      }
      if (cHold) {
        cHold.addEventListener('pointerdown', function () { cSheltered = true; });
        cHold.addEventListener('pointerup', function () { cSheltered = false; });
        cHold.addEventListener('pointerleave', function () { cSheltered = false; });
        cHold.addEventListener('click', function () {
          if (cOver) {
            cLife = 100; cOver = false; cElapsed = 0; gusting = false;
            cHold.textContent = 'hold to shelter';
            if (cLine) cLine.hidden = true;
            paintCandle();
          }
        });
      }
      var cTimer = setInterval(function () {
        if (!cHold || !document.body.contains(cHold)) { clearInterval(cTimer); return; }
        if (cOver) return;
        cElapsed += 0.5;
        if (!gusting && cRand() < 0.16) gusting = true;
        if (gusting && cRand() < 0.3) gusting = false;
        if (gusting && !cSheltered) cLife -= 8;
        else cLife = Math.min(100, cLife + 2);
        paintCandle();
        if (cLife <= 0) {
          cOver = true;
          cLife = 0;
          paintCandle();
          if (cLine) { cLine.textContent = '— out. the dark is patient. —'; cLine.hidden = false; }
          if (cHold) cHold.textContent = 'relight';
        } else if (cElapsed >= 30) {
          cOver = true;
          if (cLine) { cLine.textContent = '— the flame holds. so do you. —'; cLine.hidden = false; }
          if (cHold) cHold.textContent = 'relight';
          if (window.Liber && window.Liber.sound) window.Liber.sound.play('chime');
        }
      }, 500);
      paintCandle();
    } else if (b.id === 'sandplay') {
      var PHASES = [
        { name: 'deal', hint: 'three toys dealt. the tray never arrives empty.' },
        { name: 'place', hint: 'drag each toy where it wants to stand.' },
        { name: 'line', hint: 'one line per toy. speech follows the hands.' },
        { name: 'tend', hint: 'rake, mound, or mist. the sand keeps what the hands do.' },
        { name: 'witness', hint: 'look once more. the scene is the sentence.' },
        { name: 'keep', hint: 'keep it to the book, or smooth the sand and begin again.' },
        { name: 'release', hint: 'the tray empties. nothing is owed.' }
      ];
      function sandHash(str) {
        var h = 1779033703 ^ str.length, i;
        for (i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
        return (h ^= h >>> 16) >>> 0;
      }
      function sandRnd(seed) {
        var a = seed >>> 0;
        return function () {
          a = (a + 0x6D2B79F5) | 0;
          var t = Math.imul(a ^ (a >>> 15), 1 | a);
          t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
      }
      function sandDeal() {
        var st = (window.Liber && window.Liber.state) ? window.Liber.state.get() : {};
        function lastOf(arr) { return (Array.isArray(arr) && arr.length) ? arr[arr.length - 1] : null; }
        var pool = [];
        var dv = lastOf(st.divination);
        if (dv) pool.push({ toy: 'tower', label: String(dv.name || dv.title || 'card').slice(0, 18), glyph: '\u265C' });
        if (lastOf(st.buddy)) pool.push({ toy: 'buddy', label: 'buddy', glyph: '\u25CF' });
        if (lastOf(st.garden)) pool.push({ toy: 'flower', label: 'garden', glyph: '\u273F' });
        if (lastOf(st.dreams)) pool.push({ toy: 'moon', label: 'dream', glyph: '\u263D' });
        if (lastOf(st.sea)) pool.push({ toy: 'wave', label: 'sea', glyph: '\u301C' });
        var fb = [
          { toy: 'stone', label: 'stone', glyph: '\u2B22' }, { toy: 'shell', label: 'shell', glyph: '\u25CD' },
          { toy: 'key', label: 'key', glyph: '\u26B7' }, { toy: 'star', label: 'star', glyph: '\u2605' },
          { toy: 'boat', label: 'boat', glyph: '\u26F5' }
        ];
        var d = new Date();
        var rng = sandRnd(sandHash('sand|' + d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()));
        var i, k;
        for (i = pool.length - 1; i > 0; i--) { k = Math.floor(rng() * (i + 1)); var tmp = pool[i]; pool[i] = pool[k]; pool[k] = tmp; }
        var out = pool.slice(0, 3);
        for (i = 0; out.length < 3 && i < fb.length; i++) {
          var dup = false, j;
          for (j = 0; j < out.length; j++) { if (out[j].toy === fb[i].toy) dup = true; }
          if (!dup) out.push(fb[i]);
        }
        var n = 0;
        return out.map(function (t) { t.x = null; t.y = null; t.line = ''; t.n = (n++); return t; });
      }
      var sandToys = sandDeal();
      var sandMounds = [];
      var sandPhase = 0;
      var sandTool = 'place';
      function esc(s) {
        return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      }
      body.innerHTML =
        '<div class="games-prompt">sandplay — deal three toys. place them. say one line. (Punnett 2020 · Freedle 2025)</div>' +
        '<div class="sand-phase" id="sand-phase"></div>' +
        '<div class="sand-hint" id="sand-hint"></div>' +
        '<div class="sand-shelf" id="sand-shelf" aria-label="toy shelf"></div>' +
        '<div class="sand-tray" id="sand-tray" aria-label="sand tray"></div>' +
        '<div class="sand-tools">' +
          '<button type="button" class="games-action" id="sand-rake">rake</button>' +
          '<button type="button" class="games-action" id="sand-mound">mound</button>' +
          '<button type="button" class="games-action" id="sand-mist">mist</button>' +
          '<button type="button" class="games-action" id="sand-next">next</button>' +
        '</div>' +
        '<div class="sand-lines" id="sand-lines"></div>' +
        '<div class="games-actions"><button type="button" class="games-action" id="sand-keep">keep the scene</button></div>';
      var sandTray = document.getElementById('sand-tray');
      var sandShelf = document.getElementById('sand-shelf');
      function paintPhase() {
        var ph = document.getElementById('sand-phase');
        var hint = document.getElementById('sand-hint');
        if (ph) {
          var html = '', i;
          for (i = 0; i < PHASES.length; i++) html += '<i class="' + (i <= sandPhase ? 'on' : '') + '"></i>';
          html += '<span>' + PHASES[sandPhase].name + ' · ' + (sandPhase + 1) + '/7</span>';
          ph.innerHTML = html;
        }
        if (hint) hint.textContent = PHASES[sandPhase].hint;
      }
      function paintShelf() {
        if (!sandShelf) return;
        sandShelf.innerHTML = '';
        sandToys.forEach(function (t) {
          if (t.x !== null) return;
          var el = document.createElement('div');
          el.className = 'sand-toy shelf';
          el.setAttribute('data-n', t.n);
          el.innerHTML = '<span class="g">' + t.glyph + '</span><span class="l">' + esc(t.label) + '</span>';
          bindToyDrag(el, t);
          sandShelf.appendChild(el);
        });
      }
      function paintTray() {
        if (!sandTray) return;
        var keeps = sandTray.querySelectorAll('.sand-toy');
        var i;
        for (i = keeps.length - 1; i >= 0; i--) keeps[i].parentNode.removeChild(keeps[i]);
        var mounds = sandTray.querySelectorAll('.sand-mound');
        for (i = mounds.length - 1; i >= 0; i--) mounds[i].parentNode.removeChild(mounds[i]);
        sandMounds.forEach(function (m) {
          var md = document.createElement('div');
          md.className = 'sand-mound';
          md.style.left = m.x + '%';
          md.style.top = m.y + '%';
          sandTray.appendChild(md);
        });
        sandToys.forEach(function (t) {
          if (t.x === null) return;
          var el = document.createElement('div');
          el.className = 'sand-toy placed';
          el.setAttribute('data-n', t.n);
          el.style.left = t.x + '%';
          el.style.top = t.y + '%';
          el.innerHTML = '<span class="g">' + t.glyph + '</span><span class="l">' + esc(t.label) + '</span>';
          bindToyDrag(el, t);
          sandTray.appendChild(el);
        });
      }
      function paintLines() {
        var host = document.getElementById('sand-lines');
        if (!host) return;
        host.innerHTML = '';
        sandToys.forEach(function (t) {
          if (t.x === null) return;
          var row = document.createElement('div');
          row.className = 'sand-line';
          row.innerHTML = '<label>' + esc(t.label) + ' says</label>';
          var inp = document.createElement('input');
          inp.type = 'text';
          inp.value = t.line;
          inp.setAttribute('aria-label', 'one line for ' + t.label);
          inp.setAttribute('maxlength', '140');
          inp.addEventListener('input', function () { t.line = inp.value; });
          row.appendChild(inp);
          host.appendChild(row);
        });
      }
      function paintSand() { paintPhase(); paintShelf(); paintTray(); paintLines(); }
      function trayPos(e) {
        var r = sandTray.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width) * 100;
        var y = ((e.clientY - r.top) / r.height) * 100;
        return { x: Math.max(4, Math.min(96, x)), y: Math.max(8, Math.min(92, y)) };
      }
      function bindToyDrag(el, t) {
        el.addEventListener('pointerdown', function (e) {
          e.preventDefault();
          try { el.setPointerCapture(e.pointerId); } catch (err) {}
          function move(ev) {
            if (!sandTray) return;
            var r = sandTray.getBoundingClientRect();
            var x = (((ev.clientX - r.left) / r.width) * 100).toFixed(1);
            var y = (((ev.clientY - r.top) / r.height) * 100).toFixed(1);
            el.style.left = x + '%';
            el.style.top = y + '%';
          }
          function up(ev) {
            el.removeEventListener('pointermove', move);
            el.removeEventListener('pointerup', up);
            el.removeEventListener('pointercancel', up);
            if (!sandTray) return;
            var r = sandTray.getBoundingClientRect();
            var inside = ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
            if (inside) {
              var p = trayPos(ev);
              t.x = p.x; t.y = p.y;
              if (window.Liber && window.Liber.sound) window.Liber.sound.play('click');
            }
            paintSand();
          }
          el.addEventListener('pointermove', move);
          el.addEventListener('pointerup', up);
          el.addEventListener('pointercancel', up);
        });
      }
      function markTool(btn, name) {
        var ids = ['sand-rake', 'sand-mound', 'sand-mist'];
        ids.forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.classList.toggle('on', id === btn && sandTool === name);
        });
      }
      var rakeBtn = document.getElementById('sand-rake');
      var moundBtn = document.getElementById('sand-mound');
      var mistBtn = document.getElementById('sand-mist');
      var nextBtn = document.getElementById('sand-next');
      if (rakeBtn) rakeBtn.addEventListener('click', function () {
        sandTool = (sandTool === 'rake') ? 'place' : 'rake';
        if (sandTool === 'rake') {
          sandToys.forEach(function (t) { t.x = null; t.y = null; });
          sandMounds = [];
          paintSand();
        }
        markTool('sand-rake', 'rake');
      });
      if (moundBtn) moundBtn.addEventListener('click', function () {
        sandTool = (sandTool === 'mound') ? 'place' : 'mound';
        markTool('sand-mound', 'mound');
      });
      if (mistBtn) mistBtn.addEventListener('click', function () {
        sandMounds = [];
        sandTool = 'place';
        markTool('', '');
        paintSand();
      });
      if (sandTray) sandTray.addEventListener('pointerdown', function (e) {
        if (sandTool !== 'mound') return;
        if (e.target !== sandTray) return;
        var p = trayPos(e);
        sandMounds.push(p);
        if (window.Liber && window.Liber.sound) window.Liber.sound.play('click');
        paintTray();
      });
      if (nextBtn) nextBtn.addEventListener('click', function () {
        if (sandPhase < PHASES.length - 1) { sandPhase++; paintPhase(); }
      });
      var keepBtn = document.getElementById('sand-keep');
      if (keepBtn) keepBtn.addEventListener('click', function () {
        var placed = sandToys.filter(function (t) { return t.x !== null; });
        var lined = placed.filter(function (t) { return t.line.trim() !== ''; }).length;
        promptSave(b, placed.length + ' toys placed, ' + lined + ' lines said.', function () {
          var saved = saveToDesktopAndSatchel(b, { type: 'sandplay', toys: placed.map(function (t) { return { toy: t.toy, label: t.label, x: t.x, y: t.y, line: t.line }; }), mounds: sandMounds.length, phase: PHASES[sandPhase].name });
          var bestHtml = (saved.best && saved.best.newBest) ? whimsyLine(saved.best) : '';
          body.innerHTML = '<div class="games-result">— kept · ' + placed.length + ' toys, ' + lined + ' lines —</div>' + bestHtml;
        }, function () {
          body.innerHTML = '<div class="games-result">— smoothed over —</div>';
        });
      });
      paintSand();
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    buildBooths();

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
        var booth = document.querySelector('.games-booth[data-game="thermometer"]');
        if (!booth) { advance(); return; }
        window.Cursor.clickEl(booth, 700).then(function () {
          setTimeout(function () {
            var trig = document.getElementById('thermo-emo');
            if (!trig) { advance(); return; }
            window.Cursor.typeText(trig, 'the long day', 45).then(function () {
              var save = document.getElementById('thermo-keep');
              if (!save) { advance(); return; }
              window.Cursor.clickEl(save, 500).then(function () {
                setTimeout(function () {
                  var keep = document.getElementById('games-save-prompt-keep');
                  if (!keep) { advance(); return; }
                  window.Cursor.clickEl(keep, 400).then(function () {
                    setTimeout(advance, 1000);
                  });
                }, 700);
              });
            });
          }, 700);
        });
      }, 1000);
    })();

    var exit = document.getElementById('games-exit');
    if (exit) exit.addEventListener('click', function () {
      if (history.length > 1) history.back(); else location.href = 'desktop.html';
    });

    var tippOpen = document.getElementById('games-tipp-open');
    if (tippOpen) tippOpen.addEventListener('click', function () {
      for (var i = 0; i < BOOTHS.length; i++) {
        if (BOOTHS[i].id === 'tip') { openPlay(BOOTHS[i]); break; }
      }
    });

    var helpBtn = document.getElementById('games-help');
    var riason = document.getElementById('games-raison');
    var riasonClose = document.getElementById('games-raison-close');
    function openRiason() {
      if (riason) { riason.classList.add('open'); riason.removeAttribute('inert'); }
    }
    function closeRiason() {
      if (riason) { riason.classList.remove('open'); riason.setAttribute('inert', ''); }
    }
    if (helpBtn) helpBtn.addEventListener('click', openRiason);
    if (riasonClose) riasonClose.addEventListener('click', closeRiason);
    if (riason) riason.addEventListener('click', function (e) { if (e.target === riason) closeRiason(); });

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
  });

  window.Liber = window.Liber || {};
  window.Liber.games = { recordBest: recordBest, bestOf: BEST_OF };
})();
