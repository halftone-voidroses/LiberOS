// cutscene.js — flow fork first-run cinematic (desktop only).
// Ritual (flames light one by one, black-flame glow, shakes) → chat
// window (Wanderlust, options) → names → intruder flash → Riason box
// (options) → stage 'stone', route sigil.html. Later, stage 'bind'
// shows the bind overlay here; on bind, the finale plays: explosions,
// Wanderlust returns, pink wipe, arise text, clean desktop.
// Skip any time (marks done, stays). Never twice. No voice: removed.

(function () {
  'use strict';

  var SUMMON = [
    { line: 'I summon you from somewhere else', fx: 'glow' },
    { line: 'To find the pieces of ourselves', fx: 'flames' },
    { line: 'With violet eyes and sun like skin', fx: 'shake' },
    { line: 'Come to the void and sing again', fx: 'shake-more' }
  ];

  var NAMES = ['Fate', 'Chance', 'Destiny', 'The Wheel', 'Samsara'];

  var RETURN_BEATS = [
    { line: 'INSOLENT WORM! HOW DARE YOU INVOKE YOUR WICKED LAWS IN MY MAGICAL DOMAIN!!!', options: ['Wanderlust, no..'] },
    { line: 'Hah, you talk to me as if I am a housecat. This process is yours, not his, I will clear the process and you can figure it out.', options: ['>>'] },
    { line: 'Allow me to leave you with parting words of wisdom', options: ["I'm ready"] }
  ];

  function st() {
    return (window.Liber && window.Liber.state) || null;
  }

  function getStage() {
    var s = st();
    return s ? (s.get().tutorialStage || null) : null;
  }

  function setStage(v) {
    var s = st();
    if (s) s.set({ tutorialStage: v });
  }

  function thunk() {
    if (window.Liber && window.Liber.sound) {
      try { window.Liber.sound.play('thunk'); } catch (e) {}
    }
  }

  function chime() {
    if (window.Liber && window.Liber.sound) {
      try { window.Liber.sound.play('chime'); } catch (e) {}
    }
  }

  function el(id) { return document.getElementById(id); }

  function clearBox() {
    var old = el('cutscene');
    if (old) old.remove();
  }

  function optionRow(box, options, onPick) {
    if (!options || !options.length) return;
    var row = document.createElement('div');
    row.className = 'cutscene-options';
    options.forEach(function (label) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'cutscene-option';
      b.textContent = label;
      b.addEventListener('click', function () { onPick(label); });
      row.appendChild(b);
    });
    box.querySelector('.cutscene-box').appendChild(row);
  }

  function mountBox(extraClass, voice, lineHtml) {
    clearBox();
    var stage = document.querySelector('.screen-stage');
    if (!stage) return null;
    var box = document.createElement('div');
    box.className = 'cutscene ' + (extraClass || '');
    box.id = 'cutscene';
    box.innerHTML =
      '<div class="cutscene-box">' +
        (voice ? '<div class="cutscene-voice">' + voice + '</div>' : '') +
        '<div class="cutscene-line">' + lineHtml + '</div>' +
      '</div>';
    stage.appendChild(box);
    return box;
  }

  // ── act 1: the summoning ritual ──

  function playRitual(done) {
    var stage = document.querySelector('.screen-stage');
    if (!stage) { done(); return; }
    clearBox();
    var oldRing = document.getElementById('crt-flames');
    if (oldRing && oldRing.parentNode) oldRing.parentNode.removeChild(oldRing);
    var machine = document.querySelector('.machine');
    var ring = document.createElement('div');
    ring.className = 'crt-flames';
    ring.id = 'crt-flames';
    ring.setAttribute('aria-hidden', 'true');
    var sr = stage.getBoundingClientRect();
    var scrEl = stage.querySelector('.screen') || machine;
    var mr = scrEl ? scrEl.getBoundingClientRect() : null;
    var spots = [];
    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
    if (mr && mr.width > 0) {
      var x0 = mr.left - sr.left, y0 = mr.top - sr.top, w = mr.width, h = mr.height, si;
      var PX = function (x, y) { return { x: clamp(x, 8, sr.width - 8), y: clamp(y, 8, sr.height - 8) }; };
      for (si = 0; si < 3; si++) spots.push(PX(x0 + w * (0.2 + si * 0.3), y0 + h + 14));
      for (si = 0; si < 2; si++) spots.push(PX(x0 - 26, y0 + h * (0.3 + si * 0.4)));
      for (si = 0; si < 2; si++) spots.push(PX(x0 + w + 14, y0 + h * (0.3 + si * 0.4)));
      var tops = [0.06, 0.27, 0.5, 0.73, 0.94];
      for (si = 0; si < tops.length; si++) spots.push(PX(x0 + w * tops[si], y0 - 18));
    }
    var flameEls = [];
    spots.forEach(function (p, n) {
      var f = document.createElement('span');
      f.className = 'ritual-flame';
      f.style.left = p.x + 'px';
      f.style.top = p.y + 'px';
      f.style.animationDelay = ((n % 4) * 0.13) + 's';
      ring.appendChild(f);
      flameEls.push(f);
    });
    stage.appendChild(ring);
    if (machine) machine.classList.add('flame-live');
    function setGlow(on) { if (machine) machine.classList.toggle('flame-glow', !!on); }
    function breakHard(ms) {
      if (!machine) return;
      machine.classList.remove('machine-break', 'machine-break-hard');
      void machine.offsetWidth;
      machine.classList.add('machine-break-hard');
      setTimeout(function () { if (machine) machine.classList.remove('machine-break', 'machine-break-hard'); }, ms || 1200);
    }
    function breakOnce() {
      if (!machine) return;
      machine.classList.remove('machine-break');
      void machine.offsetWidth;
      machine.classList.add('machine-break');
      setTimeout(function () { if (machine) machine.classList.remove('machine-break'); }, 1100);
    }
    var box = document.createElement('div');
    box.className = 'cutscene ritual';
    box.id = 'cutscene';
    box.dataset.act = 'ritual';
    box.innerHTML =
      '<div class="cutscene-box ritual-box">' +
        '<div class="cutscene-line ritual-line"></div>' +
      '</div>';
    stage.appendChild(box);
    var lineEl = box.querySelector('.ritual-line');
    var dead = false;
    function alive() { return !dead && document.body.contains(box); }
    function finish() {
      if (!alive()) return;
      dead = true;
      box.classList.add('blackflame');
      setGlow(false);
      flameEls.forEach(function (f) { f.classList.remove('lit'); f.classList.add('ember'); });
      setTimeout(function () { done(); }, 1600);
    }
    box.addEventListener('click', function () { finish(); });
    var i = 0;
    function step() {
      if (!alive()) return;
      if (i >= SUMMON.length) { finish(); return; }
      var s = SUMMON[i];
      for (var k = 0; k < 3; k++) {
        var f = flameEls[i * 3 + k];
        if (f) f.classList.add('lit');
      }
      if (lineEl) {
        lineEl.textContent = s.line;
        lineEl.classList.remove('is-glow', 'is-flames', 'is-shake', 'is-shake-more');
        lineEl.classList.add('is-' + s.fx);
      }
      setGlow(true);
      if (s.fx === 'shake' || s.fx === 'shake-more') {
        box.classList.remove('do-shake', 'do-shake-more');
        void box.offsetWidth;
        box.classList.add(s.fx === 'shake' ? 'do-shake' : 'do-shake-more');
        ring.classList.remove('lean', 'flare-up');
        void ring.offsetWidth;
        ring.classList.add('lean');
        if (s.fx === 'shake-more') { ring.classList.add('flare-up'); breakHard(1400); } else breakOnce();
        setTimeout(function () { ring.classList.remove('lean', 'flare-up'); }, s.fx === 'shake-more' ? 2100 : 1100);
        thunk();
      }
      i++;
      setTimeout(step, s.fx === 'shake-more' ? 2200 : 1500);
    }
    step();
  }

  // ── act 2: chat beats ──

  function playBeats(beats, done) {
    var idx = 0;
    function show() {
      if (idx >= beats.length) { done(); return; }
      var b = beats[idx];
      var box = mountBox('chatbeat', b.voice, '');
      if (!box) { done(); return; }
      var riasonInner = box.querySelector('.cutscene-box');
      if (riasonInner && b.voice === 'riason') riasonInner.classList.add('riason');
      if (b.flare) showFlare();
      if (b.glitchIn && box) box.classList.add('riason-glitch');
      var lineEl = box.querySelector('.cutscene-line');
      if (b.names) {
        lineEl.innerHTML = '';
        b.names.forEach(function (n, k) {
          setTimeout(function () {
            if (!document.body.contains(box)) return;
            var d = document.createElement('div');
            d.className = 'chat-name';
            d.textContent = n;
            lineEl.appendChild(d);
          }, 450 * (k + 1));
        });
        setTimeout(function () {
          if (!document.body.contains(box)) return;
          var inner = box.querySelector('.cutscene-box');
          var row = document.createElement('div');
          row.className = 'cutscene-nav';
          var next = document.createElement('button');
          next.type = 'button';
          next.className = 'cutscene-next';
          next.textContent = '▶';
          next.addEventListener('click', function () { idx++; show(); });
          row.appendChild(next);
          inner.appendChild(row);
          optionRow(box, b.options, function () { idx++; show(); });
        }, 450 * (b.names.length + 1) + 200);
        return;
      }
      lineEl.textContent = b.line;
      if (b.burst) {
        box.classList.add('burst-in');
        thunk();
      }
      var inner = box.querySelector('.cutscene-box');
      var row = document.createElement('div');
      row.className = 'cutscene-nav';
      var next = document.createElement('button');
      next.type = 'button';
      next.className = 'cutscene-next';
      next.textContent = b.nextLabel || '▶';
      next.addEventListener('click', function () { idx++; show(); });
      row.appendChild(next);
      inner.appendChild(row);
      optionRow(box, b.options, function () { idx++; show(); });
    }
    show();
  }

  function playOpening() {
    playRitual(function () {
      playBeats([
        { voice: 'wanderlust', line: 'Greetings traveller, I am Wanderlust. I was sent here from the imaginary realm to assist you on your journey.', options: ['okay..'] },
        { voice: 'wanderlust', names: NAMES, options: ['I think I get it..'] },
        { voice: 'wanderlust', line: 'You, though, may call me Wanderlust, for what fate truly does is push you to see the world.', options: ['>>'] },
        { voice: 'wanderlust', line: 'Through destruction breeds creation.', options: ['(What is this place?)'] },
        { voice: 'wanderlust', line: 'This is the liber vacui, many have been here before you, they have left their mark and will continue to whisper aid.', options: ['Like who?'] },
        { voice: 'wanderlust', line: 'You RAT!', burst: true, flare: true, options: [] },
        { voice: 'riason', line: 'My god what a pristine UI box!', glitchIn: true, options: ['Hello?'] },
        { voice: 'riason', line: 'Ah! You must be the new traveller, I have forced my way into the tutorial sequence in order to teach you how to use this software.', options: ["Where's Wanderlust?"] },
        { voice: 'riason', line: "Don't worry, she will be back, and I will be yelled at. In that order.", options: ['>>'] },
        { voice: 'riason', line: 'For now, let me load up the buddy app and I can show you how this works.', options: ['Sure..'] }
      ], function () {
        setStage('stone');
        playDemo();
      });
    });
  }

  // ── act 3: Riason's demo — HE makes the buddy, the user watches ──
  // Fake chain throughout: resembles the real buddy flow, writes nothing.
  // If the user grabs for control mid-demo, Riason objects, then resumes.

  var DEMO_TEXT = 'putting logic over emotions';

  function riasonSay(box, text) {
    var line = box ? box.querySelector('.demo-riasay') : null;
    if (line) line.textContent = text;
  }

  function playDemo() {
    clearBox();
    var stage = document.querySelector('.screen-stage');
    if (!stage) { endClean(); return; }
    var box = document.createElement('div');
    box.className = 'cutscene demodock';
    box.id = 'cutscene';
    box.innerHTML =
      '<div class="demo-cursor" id="demo-cursor" aria-hidden="true"></div>' +
      '<div class="demo-app" id="demo-app">' +
        '<div class="demo-applabel">buddy <span>demo — riason at the controls</span></div>' +
        '<div class="demo-field"><label>buddy</label><div class="demo-input" id="demo-input"></div></div>' +
        '<div class="demo-swatches">' +
          '<button type="button" class="demo-sw" data-c="gold" aria-label="gold"></button>' +
          '<button type="button" class="demo-sw" data-c="blue" aria-label="blue"></button>' +
          '<button type="button" class="demo-sw" data-c="red" aria-label="red"></button>' +
        '</div>' +
        '<svg class="demo-canvas" id="demo-canvas" viewBox="0 0 120 90" aria-hidden="true"><circle id="demo-circle" cx="60" cy="45" r="26"/></svg>' +
        '<button type="button" class="demo-save" id="demo-save">save</button>' +
        '<div class="demo-preview" id="demo-preview" aria-hidden="true"></div>' +
      '</div>' +
      '<div class="cutscene-box riason demobox"><div class="cutscene-voice">riason</div>' +
        '<div class="cutscene-line demo-riasay">This is the buddy app. First you decide what your buddy is going to represent!</div></div>';
    stage.appendChild(box);
    var cursor = document.getElementById('demo-cursor');
    var app = document.getElementById('demo-app');
    var input = document.getElementById('demo-input');
    function alive() { return document.body.contains(box); }
    box.addEventListener('pointerdown', function () {
      if (!alive()) return;
      riasonSay(box, 'Not yet. Let me finish this.');
      box.classList.remove('do-deny');
      void box.offsetWidth;
      box.classList.add('do-deny');
      thunk();
    });
    function moveCursor(x, y, ms, done) {
      if (!cursor) { if (done) done(); return; }
      cursor.style.transition = 'left ' + ms + 'ms ease-in-out, top ' + ms + 'ms ease-in-out';
      cursor.style.left = x;
      cursor.style.top = y;
      setTimeout(function () { if (done && alive()) done(); }, ms + 60);
    }
    function typeText(done) {
      var i = 0;
      (function tick() {
        if (!alive()) return;
        if (i > DEMO_TEXT.length) { if (done) done(); return; }
        if (input) input.textContent = DEMO_TEXT.slice(0, i);
        i++;
        setTimeout(tick, 45);
      })();
    }
    moveCursor('50%', '88%', 10, function () {
      if (app) app.classList.add('open');
      moveCursor('50%', '58%', 900, function () {
        riasonSay(box, 'This is just a random example, no correlation at all.');
        moveCursor('38%', '46%', 800, function () {
          typeText(function () {
            if (input) input.classList.add('held');
            riasonSay(box, 'Next, you can choose what colours you want to use. Wanderlust will be back any minute so I had better just do one.');
            moveCursor('62%', '56%', 800, function () {
              var sw = box.querySelector('.demo-sw[data-c="blue"]');
              if (sw) sw.classList.add('picked');
              moveCursor('50%', '70%', 900, function () {
                var c = document.getElementById('demo-circle');
                if (c) c.classList.add('drawn');
                setTimeout(function () {
                  if (!alive()) return;
                  riasonSay(box, 'When you are finished, you click save and the buddy shows up on your desktop.');
                  moveCursor('50%', '82%', 800, function () {
                    var sv = document.getElementById('demo-save');
                    if (sv) sv.classList.add('hit');
                    chime();
                    setTimeout(function () {
                      if (!alive()) return;
                      if (app) app.classList.add('collapsed');
                      var pv = document.getElementById('demo-preview');
                      if (pv) pv.classList.add('shown');
                      setStage('bind');
                      setTimeout(function () { if (alive()) playBindPrompt(); }, 1400);
                    }, 700);
                  });
                }, 1400);
              });
            });
          });
        });
      });
    });
  }

  // ── act 4: the artifact — the user clicks, the chain is fake ──

  function playBindPrompt() {
    playBeats([
      { voice: 'riason', line: 'From here you can use the arrow keys or buttons to navigate to games, and save one as an artifact.', options: ['>>'] },
      { voice: 'riason', line: 'To use my example, maybe ruby\u2019s gem garden makes me feel a strong emotion that challenges my buddy.', options: ['>>'] }
    ], function () {
      var stage = document.querySelector('.screen-stage');
      if (!stage) { playFinale(); return; }
      clearBox();
      var box = document.createElement('div');
      box.className = 'cutscene artifactdock';
      box.id = 'cutscene';
      box.innerHTML = '<div class="demo-artifact" id="demo-artifact" role="button" tabindex="0" aria-label="artifact"></div>' +
        '<div class="cutscene-box riason"><div class="cutscene-voice">riason</div>' +
        '<div class="cutscene-line">You click the artifact to set its relation to the buddy.</div></div>';
      stage.appendChild(box);
      var art = document.getElementById('demo-artifact');
      function go() { playFakeChain(); }
      if (art) {
        art.addEventListener('click', go);
        art.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
        });
      }
    });
  }

  function playFakeChain() {
    var stage = document.querySelector('.screen-stage');
    clearBox();
    if (!stage) { playFinale(); return; }
    var fx = document.createElement('div');
    fx.className = 'cutscene fakedock';
    fx.id = 'cutscene';
    var bits = '', i;
    for (i = 0; i < 14; i++) {
      var a = (i * 137.5) * Math.PI / 180;
      bits += '<span class="fake-bit" style="--dx:' + Math.cos(a).toFixed(2) + ';--dy:' + Math.sin(a).toFixed(2) + '"></span>';
    }
    fx.innerHTML = '<div class="fake-burst">' + bits + '</div>' +
      '<div class="cutscene-box riason fakebox"><div class="cutscene-voice">riason</div>' +
      '<div class="cutscene-line">Oh Sh—</div></div>';
    stage.appendChild(fx);
    void fx.offsetWidth;
    fx.classList.add('go');
    flash('rgba(255,240,220,0.85)', 450);
    shakeMachine(1400);
    thunk();
    setTimeout(function () { playFinale(); }, 1500);
  }

  // ── act 4: finale — explosions, return, wipe, arise ──

  function showFlare() {
    var stage = document.querySelector('.screen-stage');
    if (!stage || stage.querySelector('.flare-overlay')) return;
    var o = document.createElement('div');
    o.className = 'flare-overlay';
    o.innerHTML = '<div class="flare-alert">intruder detected</div><div class="flare-sub">…documenting.</div>';
    stage.appendChild(o);
    var ring = document.getElementById('crt-flames');
    if (ring) ring.classList.add('flare');
    var machine = document.querySelector('.machine');
    if (machine) {
      machine.classList.add('flame-glow', 'machine-break-hard');
      setTimeout(function () { if (machine) machine.classList.remove('machine-break-hard'); }, 1500);
    }
    setTimeout(function () {
      if (o.parentNode) o.parentNode.removeChild(o);
      var r2 = document.getElementById('crt-flames');
      if (r2) r2.classList.remove('flare');
    }, 1700);
  }

  function flash(color, ms) {    var f = document.createElement('div');
    f.className = 'cutscene-flash';
    if (color) f.style.background = color;
    document.body.appendChild(f);
    setTimeout(function () { if (f.parentNode) f.parentNode.removeChild(f); }, ms || 500);
  }

  function shakeMachine(ms) {
    var m = document.querySelector('.machine');
    if (!m) return;
    m.classList.remove('do-shake-hard');
    void m.offsetWidth;
    m.classList.add('do-shake-hard');
    setTimeout(function () { m.classList.remove('do-shake-hard'); }, ms || 1200);
  }

  function playFinale() {
    clearBox();
    if (window.Cursor) { try { window.Cursor.burst(); } catch (e) {} }
    var hub = document.getElementById('constellation-sigil');
    if (hub) hub.classList.add('hub-burst');
    var ring = document.getElementById('crt-flames');
    if (ring) {
      ring.classList.remove('flare');
      var fl = ring.querySelectorAll('.ritual-flame');
      for (var fi = 0; fi < fl.length; fi++) { fl[fi].classList.remove('ember'); fl[fi].classList.add('lit'); }
    }
    var machine = document.querySelector('.machine');
    if (machine) {
      machine.classList.add('flame-glow', 'machine-break-hard');
      setTimeout(function () { if (machine) machine.classList.remove('machine-break-hard'); }, 1500);
    }
    flash('rgba(255,240,220,0.85)', 450);
    shakeMachine(1400);
    thunk();
    setTimeout(function () {
      playBeats([
        { voice: 'wanderlust', line: 'INSOLENT WORM! HOW DARE YOU INVOKE YOUR WICKED LAWS IN MY MAGICAL DOMAIN!!!', burst: true, options: ['Wanderlust, no..'] },
        { voice: 'wanderlust', line: 'Hah, you talk to me as if I am a housecat. This process is yours, not his, I will clear the process and you can figure it out.', options: ['>>'] },
        { voice: 'wanderlust', line: 'Allow me to leave you with parting words of wisdom', options: ["I'm ready"] }
      ], playWipe);
    }, 1300);
  }

  function playWipe() {
    clearBox();
    var stage = document.querySelector('.screen-stage');
    if (!stage) { endClean(); return; }
    var wipe = document.createElement('div');
    wipe.className = 'cutscene-wipe';
    stage.appendChild(wipe);
    setTimeout(function () {
      var black = document.createElement('div');
      black.className = 'cutscene-black';
      black.innerHTML = '<div class="cutscene-arise">I arise the same but different</div>';
      stage.appendChild(black);
      setTimeout(function () {
        if (wipe.parentNode) wipe.parentNode.removeChild(wipe);
        if (black.parentNode) black.parentNode.removeChild(black);
        endClean();
      }, 2600);
    }, 1400);
  }

  function endClean() {
    clearBox();
    var ring = document.getElementById('crt-flames');
    if (ring && ring.parentNode) ring.parentNode.removeChild(ring);
    var machine = document.querySelector('.machine');
    if (machine) machine.classList.remove('flame-live', 'flame-glow', 'machine-break', 'machine-break-hard');
    var s = st();
    if (s) s.set({ tutorialDone: true, tutorialStage: 'done' });
    chime();
  }

  function setStage(v) {
    var s = st();
    if (s) s.set({ tutorialStage: v });
  }

  window.Cutscene = window.Cutscene || { open: playOpening };

  document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById('desktop')) return;
    var s = st();
    var g = s ? s.get() : {};
    if (g.tutorialDone) return;
    if (g.tutorialStage && g.tutorialStage !== 'done') {
      if (g.tutorialStage === 'bind') playBindPrompt();
      else if (g.tutorialStage === 'stone') playDemo();
      return;
    }
    if (g.tutorialStage) return;
    playOpening();
  });
})();
