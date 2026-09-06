// hijack.js — Riason's first-visit walkthrough engine (shell, like fate.js).
// Reads window.LIBER_DATA.hijack[room]; room comes from the URL filename.
// Builds its own overlay, so rooms only include this script + hijack.css.
// Steps: {voice, line, target, sweep?, glow?}. target may be an id or any
// selector ('.sigil-canvas'); a missing target hides the ring but never
// breaks the tour. Done/skip persists flag via state.set. Reduced-motion
// gated. Nothing nags twice.

(function () {
  'use strict';

  function roomId() {
    var page = '';
    try { page = (location.pathname.split('/').pop() || '').replace(/\.html?$/i, ''); } catch (e) {}
    return page || 'desktop';
  }

  function accentFor(room) {
    var reg = (window.LIBER_DATA && window.LIBER_DATA.personas) || {};
    if (reg[room] && reg[room].accent) return reg[room].accent;
    return '#c8a878';
  }

  function el(id) { return document.getElementById(id); }

  function resolveTarget(sel) {
    if (!sel) return null;
    var t = document.getElementById(sel);
    if (t) return t;
    try { return document.querySelector(sel); } catch (e) { return null; }
  }

  function run(cfg) {
    if (!cfg || !cfg.steps || !cfg.steps.length) return;
    var st0 = (window.Liber && window.Liber.state) || null;
    if (st0 && st0.get()[cfg.flag]) return;
    var stage = document.querySelector('.screen-stage');
    if (!stage || document.querySelector('.hijack')) return;

    var idx = 0;
    var box = document.createElement('div');
    box.className = 'hijack';
    box.setAttribute('id', 'hijack');
    box.style.setProperty('--hj-acc', cfg.accent || accentFor(cfg.room || roomId()));
    box.innerHTML =
      '<div class="hijack-ring" aria-hidden="true"></div>' +
      '<div class="hijack-head" aria-hidden="true"><span>r</span><i></i></div>' +
      '<div class="hijack-box">' +
        '<div class="hijack-voice">riason</div>' +
        '<div class="hijack-line"></div>' +
        '<div class="hijack-nav">' +
          '<button type="button" class="hijack-back" aria-label="back">◀</button>' +
          '<span class="hijack-dots"></span>' +
          '<button type="button" class="hijack-next" aria-label="forth">▶</button>' +
          '<button type="button" class="hijack-skip">skip the tour</button>' +
        '</div>' +
      '</div>';
    stage.appendChild(box);

    var ring = box.querySelector('.hijack-ring');
    var head = box.querySelector('.hijack-head');
    var voice = box.querySelector('.hijack-voice');
    var line = box.querySelector('.hijack-line');
    var dots = box.querySelector('.hijack-dots');

    function place(sel) {
      if (!ring) return;
      var t = resolveTarget(sel);
      if (!t) { ring.style.display = 'none'; return; }
      var s = box.getBoundingClientRect(), r = t.getBoundingClientRect();
      ring.style.display = 'block';
      ring.style.left = (r.left - s.left - 8) + 'px';
      ring.style.top = (r.top - s.top - 8) + 'px';
      ring.style.width = (r.width + 16) + 'px';
      ring.style.height = (r.height + 16) + 'px';
    }

    function show(i) {
      idx = Math.max(0, Math.min(i, cfg.steps.length - 1));
      var s = cfg.steps[idx];
      if (voice) voice.textContent = s.voice;
      if (line) line.textContent = s.line;
      var h = head ? head.querySelector('span') : null;
      if (h) {
        var vm = (s.voice || '').match(/[a-z0-9]/i);
        h.textContent = vm ? vm[0].toLowerCase() : 'r';
      }
      box.classList.toggle('sweep', !!s.sweep);
      if (s.sweep && window.Liber && window.Liber.sound) window.Liber.sound.play('thunk');
      place(s.target);
      if (dots) dots.textContent = (idx + 1) + ' / ' + cfg.steps.length;
      if (typeof cfg.onStep === 'function') {
        try { cfg.onStep(idx, box); } catch (e) {}
      }
    }

    function close() {
      box.remove();
      var st = (window.Liber && window.Liber.state) || null;
      if (st) {
        var patch = {};
        patch[cfg.flag] = true;
        st.set(patch);
      }
      if (window.Liber && window.Liber.sound) window.Liber.sound.play('chime');
      var last = cfg.steps[cfg.steps.length - 1];
      var g = last && last.glow ? resolveTarget(last.glow === true ? last.target : last.glow) : null;
      if (g) {
        g.classList.add('hijack-glow');
        setTimeout(function () { g.classList.remove('hijack-glow'); }, 2600);
      }
    }

    box.querySelector('.hijack-back').addEventListener('click', function () { show(idx - 1); });
    box.querySelector('.hijack-next').addEventListener('click', function () {
      if (idx >= cfg.steps.length - 1) close(); else show(idx + 1);
    });
    box.querySelector('.hijack-skip').addEventListener('click', close);
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function callee(e) {
      if (e.key === 'Escape' && document.body.contains(box)) { close(); }
    });
    window.addEventListener('resize', function () {
      if (!document.body.contains(box)) return;
      var s = cfg.steps[idx];
      if (s) place(s.target);
    });

    show(0);
  }

  function auto() {
    var all = (window.LIBER_DATA && window.LIBER_DATA.hijack) || {};
    var room = roomId();
    var entry = all[room];
    if (!entry) return;
    try {
      var _st = (window.Liber && window.Liber.state) || null;
      var _g = _st ? _st.get() : {};
      if (_g.tutorialStage && _g.tutorialStage !== 'done') return;
    } catch (e) {}
    var cfg = { flag: entry.flag, room: room, steps: entry.steps };
    if (document.readyState === 'complete') {
      run(cfg);
    } else {
      window.addEventListener('load', function () { run(cfg); });
    }
  }

  window.Hijack = window.Hijack || { run: run };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', auto);
  } else {
    auto();
  }
})();
