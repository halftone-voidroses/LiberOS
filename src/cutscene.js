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

  function tick() {
    if (REDUCED) return;
    if (window.Liber && window.Liber.sound) {
      try { window.Liber.sound.play('tick'); } catch (e) {}
    }
  }

  var REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function el(id) { return document.getElementById(id); }

  function clearBox() {
    var old = el('cutscene');
    if (old) old.remove();
  }

  function optionRow(box, options, onPick, delay) {
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
    if (delay && delay > 0) {
      row.style.visibility = 'hidden';
      setTimeout(function () { row.style.visibility = ''; }, delay);
    }
    box.querySelector('.cutscene-box').appendChild(row);
  }

  function shatterOut(box, done) {
    var inner = box.querySelector('.cutscene-box');
    if (!inner) { done(); return; }
    inner.style.visibility = 'hidden';
    var r = inner.getBoundingClientRect();
    var i, piece;
    var quads = [
      'polygon(0 0, 50% 0, 50% 50%, 0 50%)', 'polygon(50% 0, 100% 0, 100% 50%, 50% 50%)',
      'polygon(0 50%, 50% 50%, 50% 100%, 0 100%)', 'polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)'
    ];
    var outs = ['translate(-70px,-50px)', 'translate(70px,-50px)', 'translate(-70px,50px)', 'translate(70px,50px)'];
    for (i = 0; i < 4; i++) {
      piece = document.createElement('div');
      piece.className = 'shatter-piece';
      piece.innerHTML = inner.innerHTML;
      piece.style.cssText = 'left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;clip-path:' + quads[i] + ';--out:' + outs[i];
      document.body.appendChild(piece);
      void piece.offsetWidth;
      piece.classList.add('go');
      (function (p) { setTimeout(function () { if (p.parentNode) p.parentNode.removeChild(p); }, 900); })(piece);
    }
    thunk();
    setTimeout(done, 800);
  }

  function stripOut(box, done) {
    var inner = box.querySelector('.cutscene-box');
    if (!inner) { done(); return; }
    inner.style.visibility = 'hidden';
    var r = inner.getBoundingClientRect();
    var speeds = ['0.45s', '0.6s', '0.52s'];
    for (var i = 0; i < 3; i++) {
      (function (n) {
        var piece = document.createElement('div');
        piece.className = 'strip-piece';
        piece.innerHTML = inner.innerHTML;
        piece.style.cssText = 'left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;'
          + 'clip-path:polygon(' + (n * 33.4) + '% 0,' + ((n + 1) * 33.4) + '% 0,' + ((n + 1) * 33.4) + '% 100%,' + (n * 33.4) + '% 100%);'
          + 'animation-duration:' + speeds[n] + ';';
        document.body.appendChild(piece);
        void piece.offsetWidth;
        piece.classList.add('go');
        setTimeout(function () { if (piece.parentNode) piece.parentNode.removeChild(piece); }, 800);
      })(i);
    }
    thunk();
    setTimeout(done, 620);
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
    var flameEls = [];
    document.body.appendChild(ring);
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
        '<div class="ritual-stack"></div>' +
      '</div>';
    stage.appendChild(box);
    var stackEl = box.querySelector('.ritual-stack');
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
      var g = flameEls[i];
      if (g) g.classList.add('lit');
      if (stackEl) {
        var fallen = document.createElement('div');
        fallen.className = 'cutscene-line ritual-line ritual-fall is-' + s.fx;
        fallen.textContent = s.line;
        stackEl.appendChild(fallen);
        tick();
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
    function go() {
      var cur = beats[idx];
      function next() { idx++; show(); }
      var boxNow = el('cutscene');
      if (!boxNow) return;
      if (cur.shatterNext) shatterOut(boxNow, next);
      else if (cur.bustNext) stripOut(boxNow, next);
      else next();
    }
    function show() {
      if (idx >= beats.length) { done(); return; }
      var b = beats[idx];
      var box = mountBox('chatbeat', b.voice, '');
      if (!box) { done(); return; }
      var riasonInner = box.querySelector('.cutscene-box');
      if (riasonInner && b.voice === 'riason') riasonInner.classList.add('riason');
      if (b.myth) box.classList.add('myth-speech');
      if (b.flare) showFlare();
      if (b.glitchIn && box) box.classList.add('riason-glitch');
      var lineEl = box.querySelector('.cutscene-line');
      if (b.names) {
        lineEl.innerHTML = '';
        if (b.line) {
          var lead = document.createElement('div');
          lead.className = 'chat-lead';
          lead.textContent = b.line;
          lineEl.appendChild(lead);
        }
        var NAME_TINTS = ['#ffd86a', '#fff3b8', '#b0a8ff', '#7a86e0', '#f0506e'];
        b.names.forEach(function (n, k) {
          setTimeout(function () {
            if (!document.body.contains(box)) return;
            var d = document.createElement('div');
            d.className = 'chat-name';
            d.textContent = n;
            var tint = NAME_TINTS[k % NAME_TINTS.length];
            d.style.color = tint;
            d.style.textShadow = '0 0 12px ' + tint;
            lineEl.appendChild(d);
            var inner = box.querySelector('.cutscene-box');
            if (inner) {
              inner.style.setProperty('--flick', tint);
              inner.classList.add('flick');
            }
          }, 300 * (k + 1));
        });
        setTimeout(function () {
          if (!document.body.contains(box)) return;
          var inner = box.querySelector('.cutscene-box');
          if (inner) inner.classList.remove('flick');
          optionRow(box, b.options, go, b.settle || 0);
        }, 300 * (b.names.length + 1) + 200);
        return;
      }
      lineEl.textContent = b.line;
      if (b.burst) {
        box.classList.add('burst-in');
        thunk();
      }
      if (b.options && b.options.length) {
        optionRow(box, b.options, go, b.settle || 0);
      } else {
        setTimeout(function () { if (document.body.contains(box)) go(); }, b.hold || 1800);
      }
    }
    show();
  }

  function playOpening() {
    playRitual(function () {
      playBeats([
        { voice: 'wanderlust', line: 'Greetings traveller, I am Wanderlust. I was sent here from the imaginary realm to assist you on your journey.', options: ['okay..'] },
        { voice: 'wanderlust', line: 'I have been called many things over the years', names: NAMES, options: ['I think I get it..'] },
        { voice: 'wanderlust', line: 'You, though, may call me Wanderlust, for what fate truly does is push you to see the world.', options: ['>>'] },
        { voice: 'wanderlust', line: 'Through destruction breeds creation.', options: ['(What is this place?)'], settle: 600 },
        { voice: 'wanderlust', line: 'This is the liber vacui, many have been here before you, they have left their mark and will continue to whisper aid.', options: ['Like who?'], settle: 600 },
        { voice: 'wanderlust', line: 'You RAT!', burst: true, flare: true, shatterNext: true, hold: 4000, options: [] },
        { voice: 'riason', line: 'My god what a pristine UI box!', glitchIn: true, options: ['Hello?'] },
        { voice: 'riason', line: 'Ah! You must be the new traveller, I have forced my way into the tutorial sequence in order to teach you how to use this software.', options: ["Where's Wanderlust?"] },
        { voice: 'riason', line: "Don't worry, she will be back, and I will be yelled at. In that order.", options: ['>>'] },
        { voice: 'riason', line: 'For now, let me load up the buddy app and I can show you how this works.', options: ['Sure..'] }
      ], function () {
        setStage('stonedemo');
        window.location.href = 'sigil.html';
      });
    });
  }

  // ── act 3: Riason's demo — performed live in sigil.html on the real
  // stone room (own code there). Fake throughout: writes nothing.

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
      box.innerHTML = '<div class="demo-artifact" id="demo-artifact" role="button" tabindex="0" aria-label="artifact"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="34" fill="none" stroke="#e8c890" stroke-width="2.5"/><circle cx="50" cy="50" r="26" fill="none" stroke="#4a8aaa" stroke-width="1.2" stroke-dasharray="4 3"/><path d="M50 24l7.5 16.5 17.5 2-12.8 12 3.3 17.5-15.5-8.7-15.5 8.7 3.3-17.5-12.8-12 17.5-2z" fill="none" stroke="#e8c890" stroke-width="2" stroke-linejoin="round"/></svg></div>' +
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

  function playFakeChain() {    var stage = document.querySelector('.screen-stage');
    clearBox();
    if (!stage) { playFinale(); return; }
    var fx = document.createElement('div');
    fx.className = 'cutscene fakedock';
    fx.id = 'cutscene';
    var bits = '', i;
    for (i = 0; i < 20; i++) {
      var a = (i * 137.5) * Math.PI / 180;
      bits += '<span class="fake-bit" style="--dx:' + Math.cos(a).toFixed(2) + ';--dy:' + Math.sin(a).toFixed(2) + '"></span>';
    }
    for (i = 0; i < 10; i++) {
      var c = (i * 137.5 + 18) * Math.PI / 180;
      bits += '<span class="fake-bit blue" style="--dx:' + (Math.cos(c) * 0.7).toFixed(2) + ';--dy:' + (Math.sin(c) * 0.7).toFixed(2) + '"></span>';
    }
    var waves = '';
    for (i = 1; i <= 5; i++) waves += '<span class="fake-wave" style="animation-delay:' + (i * 0.28).toFixed(2) + 's"></span>';
    fx.innerHTML = '<div class="fake-waves">' + waves + '</div><div class="fake-burst">' + bits + '</div>' +
      '<div class="cutscene-box riason fakebox"><div class="cutscene-voice">riason</div>' +
      '<div class="cutscene-line">Oh Sh—</div></div>';
    stage.appendChild(fx);
    void fx.offsetWidth;
    fx.classList.add('go');
    flash('rgba(255,240,220,0.85)', 450);
    shakeMachine(1400);
    thunk();
    setTimeout(function () {
      var bx = document.getElementById('cutscene');
      if (bx && document.body.contains(bx)) stripOut(bx, playFinale);
      else playFinale();
    }, 1500);
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
    }, 4200);
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
      var fl = ring.querySelectorAll('.inferno-arc');
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
        { voice: 'wanderlust', line: 'INSOLENT WORM! HOW DARE YOU INVOKE YOUR WICKED LAWS IN MY MAGICAL DOMAIN!!!', burst: true, myth: true, options: ['Wanderlust, no..'], settle: 600 },
        { voice: 'wanderlust', line: 'Hah, you talk to me as if I am a housecat. This process is yours, not his, I will clear the process and you can figure it out.', options: ['>>'], settle: 600 },
        { voice: 'wanderlust', line: 'Allow me to leave you with parting words of wisdom', options: ["I'm ready"], settle: 600 }
      ], playWipe);
    }, 1300);
  }

  function playWipe() {
    clearBox();
    var stage = document.querySelector('.screen-stage');
    if (!stage) { endClean(); return; }
    var black = document.createElement('div');
    black.className = 'cutscene-black';
    black.innerHTML = '<div class="cutscene-arise">I arise the same but different</div>';
    stage.appendChild(black);
    setTimeout(function () {
      var arise = black.querySelector('.cutscene-arise');
      if (arise) arise.classList.add('fade');
      setTimeout(function () {
        setTimeout(function () {
          if (black.parentNode) black.parentNode.removeChild(black);
          var veil = document.createElement('div');
          veil.className = 'cutscene-reveal';
          stage.appendChild(veil);
          setTimeout(function () {
            if (veil.parentNode) veil.parentNode.removeChild(veil);
            endClean();
          }, 2600);
        }, 2000);
      }, 2000);
    }, 3000);
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
      else if (g.tutorialStage === 'stonedemo') window.location.href = 'sigil.html';
      return;
    }
    if (g.tutorialStage) return;
    playOpening();
  });
})();
