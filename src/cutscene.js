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

  function skipAll() {
    var s = st();
    if (s) s.set({ tutorialDone: true, tutorialStage: 'done' });
    clearBox();
    var wipe = document.querySelector('.cutscene-wipe');
    if (wipe) wipe.remove();
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
    var box = document.createElement('div');
    box.className = 'cutscene ritual';
    box.id = 'cutscene';
    box.dataset.act = 'ritual';
    var flames = '';
    for (var f = 0; f < 5; f++) flames += '<span class="ritual-flame" aria-hidden="true"></span>';
    box.innerHTML =
      '<div class="ritual-flames">' + flames + '</div>' +
      '<div class="cutscene-box ritual-box">' +
        '<div class="cutscene-line ritual-line"></div>' +
        '<div class="cutscene-nav"><button type="button" class="cutscene-skip">skip the cutscene</button></div>' +
      '</div>';
    stage.appendChild(box);
    var skip = box.querySelector('.cutscene-skip');
    if (skip) skip.addEventListener('click', skipAll);
    var lineEl = box.querySelector('.ritual-line');
    var flameEls = box.querySelectorAll('.ritual-flame');
    var dead = false;
    function alive() { return !dead && document.body.contains(box); }
    box.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('button')) return;
      if (e.target === box || e.target.closest('.ritual-box')) {
        dead = true;
        done();
      }
    });
    var i = 0;
    function step() {
      if (!alive()) return;
      if (i >= SUMMON.length) {
        box.classList.add('blackflame');
        setTimeout(function () { if (alive()) done(); }, 1600);
        return;
      }
      var s = SUMMON[i];
      if (flameEls[i]) flameEls[i].classList.add('lit');
      if (lineEl) {
        lineEl.textContent = s.line;
        lineEl.classList.remove('is-glow', 'is-flames', 'is-shake', 'is-shake-more');
        lineEl.classList.add('is-' + s.fx);
      }
      if (s.fx === 'shake' || s.fx === 'shake-more') {
        box.classList.remove('do-shake', 'do-shake-more');
        void box.offsetWidth;
        box.classList.add(s.fx === 'shake' ? 'do-shake' : 'do-shake-more');
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
          var skip = document.createElement('button');
          skip.type = 'button';
          skip.className = 'cutscene-skip';
          skip.textContent = 'skip the cutscene';
          skip.addEventListener('click', skipAll);
          row.appendChild(next);
          row.appendChild(skip);
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
      var skip = document.createElement('button');
      skip.type = 'button';
      skip.className = 'cutscene-skip';
      skip.textContent = 'skip the cutscene';
      skip.addEventListener('click', skipAll);
      row.appendChild(next);
      row.appendChild(skip);
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
        { voice: 'wanderlust', line: 'You RAT!', burst: true, options: [] },
        { voice: 'riason', line: 'My god what a pristine UI box!', options: ['Hello?'] },
        { voice: 'riason', line: 'Ah! You must be the new traveller, I have forced my way into the tutorial sequence in order to teach you how to use this software.', options: ["Where's Wanderlust?"] },
        { voice: 'riason', line: "Don't worry, she will be back, and I will be yelled at. In that order.", options: ['>>'] },
        { voice: 'riason', line: 'For now, let me load up the buddy app and I can show you how this works.', options: ['Sure..'] }
      ], function () {
        setStage('stone');
        window.location.href = 'sigil.html';
      });
    });
  }

  // ── act 3: the bind (waits for the user's own click) ──

  function playBind() {
    var box = mountBox('chatbeat', 'riason',
      'You click the artifact to set its relation to the buddy. This one is yours to do — I will watch.');
    if (!box) return;
    box.classList.add('docked');
    var inner = box.querySelector('.cutscene-box');
    var row = document.createElement('div');
    row.className = 'cutscene-nav';
    var skip = document.createElement('button');
    skip.type = 'button';
    skip.className = 'cutscene-skip';
    skip.textContent = 'skip the binding';
    skip.addEventListener('click', function () { playFinale(); });
    row.appendChild(skip);
    inner.appendChild(row);
    var s = st();
    var seen = s ? (s.get().relations || []).length : 0;
    var timer = setInterval(function () {
      var boxNow = el('cutscene');
      if (!boxNow) { clearInterval(timer); return; }
      var s2 = st();
      var n = s2 ? (s2.get().relations || []).length : 0;
      if (n > seen) {
        clearInterval(timer);
        playFinale();
      }
    }, 500);
  }

  // ── act 4: finale — explosions, return, wipe, arise ──

  function flash(color, ms) {
    var f = document.createElement('div');
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
      if (g.tutorialStage === 'bind') playBind();
      return;
    }
    if (g.tutorialStage) return;
    playOpening();
  });
})();
