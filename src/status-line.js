// status-line.js — cycles through 4 phrasings every 12 seconds
// Lowercase, no box, just text. The user can read it but it's not in
// their face.
// WS5: once the cohort tier reaches 1 (src/shadow.js classes), one
// cohort-voiced phrase joins the rotation — the cohort occasionally
// speaks in its own name. Once per long visit the machine may suggest
// the sea (session arc, src/gamification.js): shown a single cycle,
// never repeated, never blocking exit.

(function () {
  'use strict';

  const PHRASES = [
    'liber.os is listening.',
    'the house is surfacing.',
    '12 guests registered.',
    'the stone is signed.',
  ];

  const COHORT_PHRASES = [
    null,                                  // tier 0 — the cohort keeps quiet
    'the cohort is listening with you.',
    'the cohort leans closer to the glass.',
    'the cohort breathes in the room with you.',
  ];

  const INTERVAL = 12000;
  let el, idx = 0, timer, pool = PHRASES.slice();

  function gamification() {
    return window.Liber && window.Liber.gamification;
  }

  function rebuild() {
    pool = PHRASES.slice();
    const g = gamification();
    const level = g ? g.presence().cohort : 0;
    if (level > 0 && COHORT_PHRASES[level]) pool.push(COHORT_PHRASES[level]);
    if (idx >= pool.length) idx = 0;
  }

  function swap(text, cohortVoice) {
    el.classList.add('fading');
    setTimeout(() => {
      el.textContent = text;
      el.classList.toggle('cohort-voice', !!cohortVoice);
      el.classList.remove('fading');
    }, 400);
    // the phrase leaks into the room — a whisper behind the machine
    document.dispatchEvent(new CustomEvent('liber:whisper', { detail: { text: text } }));
  }

  function showNext() {
    const line = pool[idx % pool.length];
    const isCohort = pool.length > PHRASES.length && (idx % pool.length) === pool.length - 1;
    idx++;
    swap(line, isCohort);
  }

  function cycle() {
    if (!el) return;
    const g = gamification();
    if (g) {
      const arc = g.seaArc();
      if (arc.shouldSuggest()) {
        arc.markShown();
        swap(arc.line, false);
        return;
      }
    }
    showNext();
  }

  function init() {
    el = document.querySelector('.status-phrase');
    if (!el) return;
    rebuild();
    el.textContent = PHRASES[0];
    document.dispatchEvent(new CustomEvent('liber:whisper', { detail: { text: PHRASES[0] } }));
    timer = setInterval(cycle, INTERVAL);
    if (window.Liber && window.Liber.state && window.Liber.state.on) {
      window.Liber.state.on('change', rebuild);
    }
  }

  window.Liber = window.Liber || {};
  // small test/inspection surface for scripts/verify-gamification.mjs
  window.Liber.statusLine = {
    pool: function () { return pool.slice(); },
    cycle: cycle,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
