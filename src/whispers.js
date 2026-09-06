// whispers.js — the machine's phrases leak into the room.
// Every status-line phrase also drifts behind the machine as barely
// visible words — ghosts murmuring in the dark, never in front of the
// computer. Listens for 'liber:whisper' (dispatched by src/status-line.js).
// Reduced motion: the room stays silent.

(function () {
  'use strict';

  var LAYER = null;
  var MAX_ALIVE = 9;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function spawn(text) {
    if (!LAYER) return;
    if (document.querySelectorAll('.whisper').length >= MAX_ALIVE) return;

    var words = text.replace(/[.]/g, '').split(' ').filter(Boolean);
    if (!words.length) return;

    // 2-3 fragments per phrase, each a short run of words
    var fragments = Math.min(2 + Math.floor(Math.random() * 2), words.length);
    var start = Math.floor(Math.random() * words.length);

    for (var f = 0; f < fragments; f++) {
      var len = 1 + Math.floor(Math.random() * 3);
      var piece = words.slice(start % words.length, (start % words.length) + len).join(' ');
      start += len;
      if (!piece) continue;

      var w = document.createElement('span');
      w.className = 'whisper';
      w.textContent = piece;
      w.style.left = rand(8, 78) + '%';
      w.style.top = rand(58, 88) + '%';
      w.style.setProperty('--drift-x', rand(-34, 34) + 'px');
      w.style.setProperty('--drift-dur', rand(9, 13) + 's');
      w.style.animationDelay = (f * rand(0.8, 1.6)) + 's';
      w.addEventListener('animationend', function () {
        if (this.parentNode) this.parentNode.removeChild(this);
      });
      LAYER.appendChild(w);
    }
  }

  function init() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    LAYER = document.createElement('div');
    LAYER.className = 'whispers';
    LAYER.setAttribute('aria-hidden', 'true');
    document.body.appendChild(LAYER);
    document.addEventListener('liber:whisper', function (e) {
      if (e && e.detail && e.detail.text) spawn(e.detail.text);
    });
  }

  window.Liber = window.Liber || {};
  window.Liber.whispers = { spawn: spawn };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
