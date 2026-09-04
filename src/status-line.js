// status-line.js — cycles through 4 phrasings every 12 seconds
// Lowercase, no box, just text. The user can read it but it's not in
// their face.

(function () {
  'use strict';

  const PHRASES = [
    'liber.os is listening.',
    'the house is surfacing.',
    '12 guests registered.',
    'the stone is signed.',
  ];

  const INTERVAL = 12000;
  let el, idx = 0, timer;

  function init() {
    el = document.querySelector('.status-phrase');
    if (!el) return;
    el.textContent = PHRASES[0];
    timer = setInterval(cycle, INTERVAL);
  }

  function cycle() {
    if (!el) return;
    el.classList.add('fading');
    setTimeout(() => {
      idx = (idx + 1) % PHRASES.length;
      el.textContent = PHRASES[idx];
      el.classList.remove('fading');
    }, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
