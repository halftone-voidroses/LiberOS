// fate.js — the fate-circle companion (shell, like dial.js).
// A small ringed avatar + one persona-voiced line, present on every
// screen, keyed to the room. Tap for the room's second line. It
// suggests like the floor does: never nags, never blocks, never
// manages. Deterministic start line per date (xmur3 + mulberry32).

(function () {
  'use strict';

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

  function init() {
    var stage = document.querySelector('.screen-stage');
    if (!stage || document.getElementById('fate')) return;
    var all = (window.LIBER_DATA && window.LIBER_DATA.fate) || {};
    var room = roomId();
    var entry = all[room] || all.desktop;
    if (!entry) return;
    var lines = entry.lines || [];
    if (!lines.length) return;

    var d = new Date();
    var dateKey = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    var rng = mulberry32(hashSeed('fate|' + room + '|' + dateKey));
    var idx = Math.floor(rng() * lines.length) % lines.length;

    var box = document.createElement('div');
    box.className = 'fate' + (document.getElementById('desktop') ? ' on-desktop' : '');
    box.id = 'fate';
    box.setAttribute('role', 'note');
    box.setAttribute('aria-label', 'fate keeps one line per room. tap for another.');
    box.style.setProperty('--fate-acc', accentFor(room));
    function paintTier() {
      var m = null;
      try { m = document.querySelector('.machine'); } catch (e) {}
      var tier = 0;
      if (m) {
        for (var t = 3; t >= 1; t--) {
          if (m.classList.contains('buddy-' + t)) { tier = t; break; }
        }
      }
      if (tier >= 2) box.style.setProperty('--fate-mote', tier >= 3 ? '#e08a4a' : '#d8b06a');
    }
    paintTier();
    window.addEventListener('load', paintTier);
    var tierState = (window.Liber && window.Liber.state) || null;
    if (tierState && tierState.on) tierState.on('change', paintTier);
    box.innerHTML =
      '<span class="fate-avatar" aria-hidden="true"><i></i></span>' +
      '<span class="fate-text"><span class="fate-voice">' + entry.voice + '</span>' +
      '<span class="fate-line" aria-live="polite">' + lines[idx] + '</span></span>';
    var lineEl = box.querySelector('.fate-line');
    box.addEventListener('click', function () {
      idx = (idx + 1) % lines.length;
      if (lineEl) lineEl.textContent = lines[idx];
    });
    stage.appendChild(box);
    var riteState = (window.Liber && window.Liber.state) || null;
    if (riteState && riteState.on) riteState.on('change', checkRites);
    syncFateVisibility();
    document.addEventListener('click', function () {
      setTimeout(syncFateVisibility, 60);
    }, true);
    document.addEventListener('keydown', function () {
      setTimeout(syncFateVisibility, 60);
    }, true);
    if (riteState && riteState.on) riteState.on('change', syncFateVisibility);
  }

  var FATE_BLOCKERS = '.games-stage.open, .hijack, .learn-hijack.open, #cutscene, ' +
    '.games-save-prompt.open, .dreams-cite.open, .learn-cite.open, #cohort-how.open';

  function syncFateVisibility() {
    var box = document.getElementById('fate');
    if (!box) return;
    var blocked = null;
    try {
      blocked = document.querySelector(FATE_BLOCKERS) ||
        document.querySelector('[id$="-raison"].open');
    } catch (e) {}
    box.style.display = blocked ? 'none' : '';
  }

  var CRISIS_RE = /(kill myself|hurt myself|end (it|my life|everything)|want to die|suicide|self[\s-]?harm|cutting myself)/i;
  var crisisShown = false;
  document.addEventListener('input', function (e) {
    if (crisisShown) return;
    var t = e.target;
    var v = null;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) v = t.value;
    else if (t && t.isContentEditable) v = t.textContent;
    if (typeof v === 'string' && CRISIS_RE.test(v)) {
      crisisShown = true;
      var lineEl = document.querySelector('#fate .fate-line');
      if (lineEl) lineEl.textContent = 'the room is still here. learn keeps a page for hard nights.';
    }
  });

  var RITE_LINES = {
    cast: 'the stone is signed. the town has its first window.',
    keep: 'kept. the book remembers what the hands bring.',
    bind: 'bound. nothing here stands alone anymore.',
    release: 'released. the water took it. the room stays.'
  };

  function riteCounts() {
    var st = (window.Liber && window.Liber.state) || null;
    var s = st ? st.get() : {};
    var kept = 0;
    var kinds = ['satchel', 'garden', 'dreams', 'divination', 'learn', 'abstract', 'methodology', 'buddy'];
    for (var i = 0; i < kinds.length; i++) {
      if (Array.isArray(s[kinds[i]])) kept += s[kinds[i]].length;
    }
    return {
      cast: (s.buddy || []).some(function (e) { return e && e.kind === 'stone'; }),
      keep: kept > 0,
      bind: (s.relations || []).length > 0,
      release: (s.sea || []).length > 0
    };
  }

  function checkRites() {
    var st = (window.Liber && window.Liber.state) || null;
    if (!st || !st.on) return;
    var s = st.get() || {};
    var done = Object.assign({}, s.rites || {});
    var now = riteCounts();
    var fired = null;
    for (var k in RITE_LINES) {
      if (now[k] && !done[k]) {
        done[k] = true;
        if (!fired) fired = RITE_LINES[k];
      }
    }
    if (fired) {
      st.set({ rites: done });
      var lineEl = document.querySelector('#fate .fate-line');
      if (lineEl) {
        var prev = lineEl.textContent;
        lineEl.textContent = fired;
        setTimeout(function () {
          if (lineEl && lineEl.textContent === fired) lineEl.textContent = prev;
        }, 9000);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
