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
  // Timbre law (user request): low, analog, satisfying — a dry mechanical
  // click, a soft settling, a warm wooden bell. Nothing above ~900 Hz
  // leads; every voice carries a filtered-noise body so it reads as
  // matter, not as a beep.

  // click — a dry analog keyclick: a bandpassed noise tap with a tiny
  // wooden knock underneath. Gone in 40 ms, ears stay easy.
  function click(c) {
    var t = c.currentTime;

    var len = Math.floor(c.sampleRate * 0.018);
    var buf = c.createBuffer(1, len, c.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    var noise = c.createBufferSource();
    noise.buffer = buf;
    var bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 850;
    bp.Q.value = 1.1;
    var ng = c.createGain();
    ng.gain.setValueAtTime(0.16, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    noise.connect(bp).connect(ng).connect(c.destination);
    noise.start(t);

    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(210, t);
    osc.frequency.exponentialRampToValueAtTime(130, t + 0.028);
    g.gain.setValueAtTime(0.11, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    osc.connect(g).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  // thunk — heavy matter settling: softened drop plus warm soil noise.
  function thunk(c) {
    var t = c.currentTime;
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.14);
    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    osc.connect(g).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.24);

    var len = Math.floor(c.sampleRate * 0.1);
    var buf = c.createBuffer(1, len, c.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var noise = c.createBufferSource();
    noise.buffer = buf;
    var lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 240;
    var ng = c.createGain();
    ng.gain.setValueAtTime(0.18, t);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    noise.connect(lp).connect(ng).connect(c.destination);
    noise.start(t);
  }

  // chime — the keeping bell, an octave down and wooden: two warm
  // partials, slightly detuned so it breathes, long soft decay.
  function chime(c) {
    var t = c.currentTime;
    var partials = [
      { f: 261.6, detune: -4, g: 0.12, d: 0.75, at: 0 },
      { f: 392.0, detune: 3,  g: 0.07, d: 0.95, at: 0.06 }
    ];
    for (var i = 0; i < partials.length; i++) {
      var p = partials[i];
      var osc = c.createOscillator();
      var g = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = p.f;
      osc.detune.value = p.detune;
      g.gain.setValueAtTime(0.0001, t + p.at);
      g.gain.exponentialRampToValueAtTime(p.g, t + p.at + 0.018);
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
