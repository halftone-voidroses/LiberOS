// sea.js — Vanir's deep. No shared imports (covenant Q.1).

(function () {
  var deep = document.querySelector('.sea-deep');
  var breath = document.getElementById('sea-breath');
  var farLayer = document.getElementById('sea-far');
  var nearLayer = document.getElementById('sea-near');
  var depth = 0;
  var target = 0;
  var lastMove = Date.now();

  var FADE_MS = 2000;
  var UNINTERRUPTIBLE_MS = 800;
  var DISSOLVE_MS = 2600;

  // Motion with consent (covenant + affordance contract 8). The draught is
  // flourish, so under reduced motion the layers hold their resting depth
  // and the frame loop does not schedule itself again.
  var REDUCE = false;
  try { REDUCE = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { REDUCE = false; }

  // The deep lets you in once the room knows you. Shared by the ritual's
  // high-weight dots and the tide clock's deep tone — one rule, one owner.
  function deepOpen() {
    if (!window.Liber || !window.Liber.state) return true;
    var s = window.Liber.state.get() || {};
    return ((s.relations || []).length >= 5) && (Object.keys(s.visited || {}).length >= 3);
  }

  function loop() {
    if (REDUCE) {
      if (farLayer) farLayer.style.transform = '';
      if (nearLayer) { nearLayer.style.transform = ''; nearLayer.style.opacity = '0.45'; }
      return;
    }
    var sinceMove = Date.now() - lastMove;
    if (sinceMove < 4000) {
      target = Math.min(target + 0.0008, 1.0);
    } else {
      target = Math.max(target - 0.0005, 0.2);
    }
    depth += (target - depth) * 0.04;
    if (farLayer) farLayer.style.transform = 'translateY(' + (-depth * 36).toFixed(1) + 'px)';
    if (nearLayer) {
      nearLayer.style.transform = 'translateY(' + (-depth * 72).toFixed(1) + 'px)';
      nearLayer.style.opacity = (0.25 + depth * 0.4).toFixed(2);
    }
    requestAnimationFrame(loop);
  }

  function onMove() { lastMove = Date.now(); }

  if (deep) deep.addEventListener('mousemove', onMove);
  if (breath) breath.addEventListener('mouseenter', onMove);

  document.addEventListener('DOMContentLoaded', function () {
    requestAnimationFrame(loop);

    var exit = document.getElementById('sea-exit');
    if (exit) exit.addEventListener('click', function () {
      if (history.length > 1) history.back(); else location.href = 'desktop.html';
    });

    var helpBtn = document.getElementById('sea-help');
    var riason = document.getElementById('sea-raison');
    var riasonClose = document.getElementById('sea-raison-close');
    function openRiason() {
      if (riason) { riason.classList.add('open'); riason.removeAttribute('inert'); }
    }
    function closeRiason() {
      if (riason) { riason.classList.remove('open'); riason.setAttribute('inert', ''); }
    }
    if (helpBtn) helpBtn.addEventListener('click', openRiason);
    if (riasonClose) riasonClose.addEventListener('click', closeRiason);
    if (riason) riason.addEventListener('click', function (e) { if (e.target === riason) closeRiason(); });
    if (window.LiberRoomShell) window.LiberRoomShell.bindRoomOverlays({ overlays: [
      { id: 'sea-raison', close: closeRiason }
    ] });
    if (riason) riason.setAttribute('inert', '');

    bindExtcListener();
    bindRitual();
    bindTide();
    bindNarrowPrompt();
    if (window.Liber && window.Liber.state && window.Liber.state.on) {
      // the waterline and the clock's tone are read from state, so they
      // follow every write — including ones made from another room.
      window.Liber.state.on('change', function () { paintTide(readTide(), false); });
    }
  });

  function bindRitual() {
    var app = document.querySelector('.sea-app');
    var ritual = document.getElementById('sea-ritual');
    var input = document.getElementById('sea-input');
    var releaseBtn = document.getElementById('sea-release');
    var intensityWrap = document.getElementById('sea-intensity');
    var carried = document.getElementById('sea-carried');
    var carriedText = document.getElementById('sea-carried-text');
    if (!app || !ritual || !input || !releaseBtn || !intensityWrap || !carried || !carriedText) return;

    var intensity = 3;
    var releasing = false;

    function intensityFromEvent(e) {
      var dot = e.target.closest ? e.target.closest('.sea-intensity-dot') : null;
      return dot ? parseInt(dot.getAttribute('data-value'), 10) : NaN;
    }

    function gateNote() {
      var ritual = document.getElementById('sea-ritual');
      if (!ritual || ritual.querySelector('.sea-gate-note')) return;
      var s = (window.Liber && window.Liber.state) ? window.Liber.state.get() : {};
      var need = Math.max(0, 5 - ((s.relations || []).length));
      var n = document.createElement('div');
      n.className = 'sea-gate-note';
      n.textContent = need > 0 ? ('the deep end stays shut until the room knows you. ' + need + ' more knot' + (need === 1 ? '' : 's') + '.') : 'the deep end stays shut until the room knows you. return once more.';
      ritual.appendChild(n);
      setTimeout(function () { if (n.parentNode) n.parentNode.removeChild(n); }, 2600);
    }
    function paintIntensity() {
      var dots = intensityWrap.querySelectorAll('.sea-intensity-dot');
      for (var i = 0; i < dots.length; i++) {
        var v = parseInt(dots[i].getAttribute('data-value'), 10);
        var selected = (v === intensity);
        if (selected) dots[i].classList.add('on');
        else dots[i].classList.remove('on');
        dots[i].setAttribute('aria-checked', selected ? 'true' : 'false');
        dots[i].tabIndex = selected ? 0 : -1;
        if (v >= 4) dots[i].classList.toggle('locked', !deepOpen());
        else dots[i].classList.remove('locked');
      }
      paintTicks(intensity);
    }

    function paintTicks(litCount) {
      var ticks = document.querySelectorAll('#sea-gauge-ticks .sea-fathom');
      for (var i = 0; i < ticks.length; i++) {
        var v = parseInt(ticks[i].getAttribute('data-tick'), 10);
        if (v <= litCount) ticks[i].classList.add('lit');
        else ticks[i].classList.remove('lit');
      }
    }

    function focusDot(value) {
      var el = intensityWrap.querySelector('.sea-intensity-dot[data-value="' + value + '"]');
      if (el) el.focus();
    }

    function chooseDot(value) {
      if (releasing) return;
      if (value >= 4 && !deepOpen()) { gateNote(); return; }
      intensity = value;
      paintIntensity();
    }

    intensityWrap.addEventListener('click', function (e) {
      var v = intensityFromEvent(e);
      if (isNaN(v)) return;
      chooseDot(v);
    });

    intensityWrap.addEventListener('keydown', function (e) {
      var k = e.key;
      var move = 0;
      if (k === 'ArrowRight' || k === 'ArrowDown') move = 1;
      else if (k === 'ArrowLeft' || k === 'ArrowUp') move = -1;
      else if (k === 'Home') { e.preventDefault(); chooseDot(1); focusDot(1); return; }
      else if (k === 'End') { e.preventDefault(); chooseDot(5); focusDot(5); return; }
      else return;
      e.preventDefault();
      var next = intensity + move;
      if (next < 1) next = 5;
      if (next > 5) next = 1;
      chooseDot(next);
      focusDot(next);
    });

    var breathToggle = document.getElementById('sea-breath-toggle');
    var breathPhase = document.getElementById('sea-breath-phase');
    var guided = false, guidedTimer = null, guidedT = 0;
    var CYCLE_S = 10, IN_S = 4;
    function paintPhase() {
      if (!breathPhase) return;
      if (!guided) { breathPhase.textContent = ''; return; }
      breathPhase.textContent = (guidedT % CYCLE_S) < IN_S ? 'in' : 'out';
    }
    function setGuided(on) {
      guided = on;
      if (app) app.classList.toggle('guided', on);
      if (breathToggle) breathToggle.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (guidedTimer) { clearInterval(guidedTimer); guidedTimer = null; }
      if (on) {
        guidedT = 0;
        paintPhase();
        guidedTimer = setInterval(function () { guidedT++; paintPhase(); }, 1000);
      } else if (breathPhase) {
        breathPhase.textContent = '';
      }
    }
    if (breathToggle) breathToggle.addEventListener('click', function () { setGuided(!guided); });

    input.addEventListener('input', function () {
      releaseBtn.disabled = releasing || input.value.trim().length === 0;
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !releaseBtn.disabled) releaseBtn.click();
    });

    releaseBtn.addEventListener('click', function () {
      var text = input.value.trim();
      if (releasing || !text) return;
      releasing = true;
      releaseBtn.disabled = true;
      app.classList.add('releasing');
      carriedText.textContent = text;
      carried.classList.add('visible');
      paintTicks(1);

      if (window.Liber && window.Liber.state && window.Liber.state.addArtifact) {
        window.Liber.state.addArtifact('sea', { text: text, intensity: intensity });
      }
      // the clock keeps the release: one engraved mark, one hair of waterline.
      // Recorded on the click, not on a timer — walking away mid-dissolve must
      // not lose the memory — and the hand travels the dissolve window.
      advanceTide();
      if (window.Liber && window.Liber.sound) window.Liber.sound.play('thunk');
      if (window.Liber && window.Liber.soundscape) {
        try { window.Liber.soundscape.motif('vanir'); } catch (e) {}
      }

      setTimeout(function () {
        carried.classList.add('dissolving');
        paintTicks(3);
      }, FADE_MS + DISSOLVE_MS * 0.4);

      setTimeout(function () {
        paintTicks(5);
      }, FADE_MS + DISSOLVE_MS * 0.7);

      setTimeout(function () {
        carried.classList.remove('visible', 'dissolving');
        carriedText.textContent = '';
        app.classList.remove('releasing');
        input.value = '';
        intensity = 3;
        paintIntensity();
        releaseBtn.disabled = true;
        releasing = false;
      }, FADE_MS + DISSOLVE_MS);
    });
    paintIntensity();
  }

  // 439px has no room for the floating question line (the glass is 260×149),
  // so the instruction rides in the field's own placeholder — the same words,
  // already 16px, upright, and 8.7:1 against the water.
  function bindNarrowPrompt() {
    var input = document.getElementById('sea-input');
    if (!input) return;
    var base = input.getAttribute('placeholder') || 'name it, plain';
    var question = document.getElementById('sea-question');
    var q = question ? String(question.textContent || '').replace(/\s+/g, ' ').trim() : base;
    var mq = null;
    try { mq = window.matchMedia ? window.matchMedia('(max-width: 439px)') : null; } catch (e) { mq = null; }
    function paint() {
      var narrow = !!(mq && mq.matches);
      input.setAttribute('placeholder', narrow && q ? q : base);
    }
    paint();
    try {
      if (mq && mq.addEventListener) mq.addEventListener('change', paint);
      else if (mq && mq.addListener) mq.addListener(paint);
    } catch (e) {}
    window.addEventListener('resize', paint);
  }

  // ── ROOM 06 · the brass tide clock ────────────────────────────────────
  // One owner: state.seaTide {releases, level}. The hand advances one of
  // sixteen engraved marks per release; the waterline rises a hair. Both
  // persist, so the room remembers the level across visits. Completion is
  // the slow hand itself — this file never throws confetti.

  var TIDE_MARKS = 16;
  var TIDE_RISE = 0.06;

  function clamp01(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }

  function rawTide() {
    var s = (window.Liber && window.Liber.state && window.Liber.state.get()) || {};
    var t = s.seaTide;
    if (t && typeof t.level === 'number') return t;
    return null;
  }

  function readTide() {
    var stored = rawTide();
    if (stored) {
      return {
        releases: Math.max(0, parseInt(stored.releases, 10) || 0),
        level: clamp01(Number(stored.level) || 0)
      };
    }
    // first read on a save older than the clock: seed from the water table
    // the machine already keeps (sea + graveyard over 12 — the same sum the
    // room behind the CRT draws), so nobody's tide starts at zero.
    var s = (window.Liber && window.Liber.state && window.Liber.state.get()) || {};
    var known = (Array.isArray(s.sea) ? s.sea.length : 0) + (Array.isArray(s.graveyard) ? s.graveyard.length : 0);
    return { releases: known, level: clamp01(known / 12) };
  }

  function writeTide(t) {
    if (window.Liber && window.Liber.state) {
      window.Liber.state.set({ seaTide: { releases: t.releases, level: t.level } });
    }
  }

  function tideRead(t) {
    var marks = t.releases % TIDE_MARKS;
    if (t.releases > 0 && marks === 0) return 'high water · ' + t.releases + ' released';
    return 'mark ' + marks + ' / ' + TIDE_MARKS + ' · ' + t.releases + ' released';
  }

  function paintTide(t, instant) {
    var hand = document.getElementById('sea-clock-hand');
    var read = document.getElementById('sea-clock-read');
    var clock = document.getElementById('sea-clock');
    var deep = document.querySelector('.sea-deep');
    if (hand) {
      var angle = -90 + (t.releases % TIDE_MARKS) * (360 / TIDE_MARKS);
      if (instant) {
        // arriving on the page is not a turn of the hand
        hand.style.transition = 'none';
        hand.style.setProperty('--tide-angle', angle + 'deg');
        void hand.offsetWidth;
        hand.style.transition = '';
      } else {
        hand.style.setProperty('--tide-angle', angle + 'deg');
      }
    }
    if (deep) deep.style.setProperty('--sea-level', t.level.toFixed(3));
    if (read) read.textContent = tideRead(t);
    if (clock) clock.classList.toggle('deep', deepOpen());
  }

  function advanceTide() {
    var t = readTide();
    t.releases += 1;
    t.level = clamp01(t.level + TIDE_RISE);
    // the write emits `change`, which repaints the clock with its travel on
    // — one path for the beat, whether it was this page or another that wrote.
    writeTide(t);
    paintTide(t, false);
  }

  function bindTide() {
    var t = readTide();
    paintTide(t, true);
    if (!rawTide()) writeTide(t);      // establish the memory, no visible turn
  }

  // Phase 8: secret "extc" listener is scoped to sea.html only.
  // The page-level listener was removed from shadow.js.
  var extcKeys = [];
  var EXTC = 'extc';
  function bindExtcListener() {
    document.addEventListener('keydown', function (e) {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return;
      if (e.key.length !== 1) return;
      extcKeys.push(e.key.toLowerCase());
      if (extcKeys.length > EXTC.length) extcKeys.shift();
      if (extcKeys.join('') === EXTC) {
        toggleShadow();
        extcKeys = [];
      }
    });
  }

  function toggleShadow() {
    var machine = document.querySelector('.machine');
    if (!machine) return;
    machine.classList.toggle('shadow-on');
    if (window.Liber && window.Liber.state) {
      window.Liber.state.set({ shadowUnlocked: true, shadowOn: machine.classList.contains('shadow-on') });
    }
    var p = document.createElement('div');
    p.className = 'shadow-prompt show';
    p.textContent = machine.classList.contains('shadow-on') ? '— shadow engaged —' : '— shadow recedes —';
    document.body.appendChild(p);
    setTimeout(function () {
      p.classList.remove('show');
      setTimeout(function () { p.remove(); }, 600);
    }, 1500);
  }
})();
