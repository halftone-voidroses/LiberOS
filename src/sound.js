// sound.js — WebAudio-synthesized UI sounds (plan 2026-09-04 WS4).
// No audio files, no network: the OS is offline, forever. One well-tuned
// set of timbres for the machine's hand — a per-material timbre map was
// considered and deliberately not done.
//
// API: window.Liber.sound = { init, play(kind), setEnabled(bool), isEnabled() }
// Kinds: 'click' (button press) · 'thunk' (heavy / destructive) ·
//        'chime' (artifact saved / kept).
// The context is created lazily and resumes on the first user gesture
// (autoplay-safe). Every path is guarded: a missing or blocked
// AudioContext can never break the room. The press sound is delegated —
// one listener here, so no app JS needs to know about it.

(function (global) {
  'use strict';

  var ctx = null;

  function state() {
    return (global.Liber && global.Liber.state) ? global.Liber.state : null;
  }

  function isEnabled() {
    var s = state();
    return !s || s.get().sounds !== false; // default: on
  }

  function ensureCtx() {
    if (ctx) return ctx;
    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC(); } catch (e) { ctx = null; }
    return ctx;
  }

  function resume() {
    var c = ensureCtx();
    if (c && c.state === 'suspended') {
      try { c.resume(); } catch (e) { /* stays silent this visit */ }
    }
  }

  function init() {
    // Autoplay policy: the context may only leave 'suspended' after a
    // user gesture. Listen wide, resume cheaply — one long visit.
    document.addEventListener('pointerdown', resume, true);
    document.addEventListener('keydown', resume, true);
  }

  // ── voices ──────────────────────────────────────────────────────────

  // click — a small dry keyclick: square blip pitched down, gone fast.
  function click(c) {
    var t = c.currentTime;
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1500, t);
    osc.frequency.exponentialRampToValueAtTime(650, t + 0.03);
    g.gain.setValueAtTime(0.08, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    osc.connect(g).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  // thunk — heavy matter settling: low drop plus a filtered soil noise.
  function thunk(c) {
    var t = c.currentTime;
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(52, t + 0.12);
    g.gain.setValueAtTime(0.4, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    osc.connect(g).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.22);

    var len = Math.floor(c.sampleRate * 0.09);
    var buf = c.createBuffer(1, len, c.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var noise = c.createBufferSource();
    noise.buffer = buf;
    var lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 320;
    var ng = c.createGain();
    ng.gain.setValueAtTime(0.22, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    noise.connect(lp).connect(ng).connect(c.destination);
    noise.start(t);
  }

  // chime — the keeping bell: two sweet partials, long decay.
  function chime(c) {
    var t = c.currentTime;
    var partials = [
      { f: 1046.5, g: 0.14, d: 0.55, at: 0 },
      { f: 1568.0, g: 0.08, d: 0.7,  at: 0.07 }
    ];
    for (var i = 0; i < partials.length; i++) {
      var p = partials[i];
      var osc = c.createOscillator();
      var g = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = p.f;
      g.gain.setValueAtTime(0.0001, t + p.at);
      g.gain.exponentialRampToValueAtTime(p.g, t + p.at + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + p.at + p.d);
      osc.connect(g).connect(c.destination);
      osc.start(t + p.at);
      osc.stop(t + p.at + p.d + 0.02);
    }
  }

  // ── public surface ──────────────────────────────────────────────────

  function play(kind) {
    if (!isEnabled()) return;
    var c = ensureCtx();
    if (!c) return;
    if (c.state === 'suspended') {
      resume();
      if (c.state === 'suspended') return; // no gesture yet — stay silent
    }
    try {
      if (kind === 'thunk') thunk(c);
      else if (kind === 'chime') chime(c);
      else click(c);
    } catch (e) { /* never break the room for a sound */ }
  }

  function setEnabled(on) {
    var s = state();
    if (s) s.set({ sounds: !!on });
  }

  global.Liber = global.Liber || {};
  global.Liber.sound = { init: init, play: play, setEnabled: setEnabled, isEnabled: isEnabled };

  // Delegated press sound — every button in the OS clicks when pressed.
  document.addEventListener('click', function (e) {
    try {
      var t = e.target;
      var btn = (t && t.closest) ? t.closest('button') : null;
      if (!btn || btn.disabled) return;
      play('click');
    } catch (err) { /* never break the room for a sound */ }
  });

  init();
})(window);
