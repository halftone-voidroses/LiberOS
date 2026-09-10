// soundscape.js — the generative room tone (futures §11, full horizon).
// Every room gets a slow offline bed (consonant partials + filtered noise,
// keyed to its palette); four traveller leitmotifs weave in when their
// content is on screen. No assets, no network, silence until the first
// gesture; master + per-layer gains live in settings. Under ~400 lines
// by counting, not by stuffing. No imports.
(function (global) {
  'use strict';

  // room beds: partials + noise bed. Quiet by design — felt, not heard.
  var BEDS = {
    desktop:    { f: [130.8, 174.6], n: 0.05 },
    buddy:      { f: [174.6, 261.6], n: 0.03 },
    games:      { f: [220.0, 277.2, 329.6], n: 0.04 },
    garden:     { f: [196.0, 294.0], n: 0.08 },
    sea:        { f: [55.0, 82.5], n: 0.50 },
    dreams:     { f: [146.8, 220.0], n: 0.06 },
    divination: { f: [130.8, 196.0], n: 0.04 },
    learn:      { f: [164.8], n: 0.03 },
    trash:      { f: [98.0, 65.4], n: 0.10 },
    themes:     { f: [246.9, 370.0], n: 0.02 },
    toybox:     { f: [220.0, 277.2], n: 0.05 },
    satchel:    { f: [146.8, 174.6], n: 0.04 },
    sigil:      { f: [110.0, 165.0], n: 0.06 }
  };

  // traveller cells, three notes each (rest-law voicings throughout).
  var MOTIFS = {
    wanderlust: [440.0, 554.4, 587.3],
    vanir:      [110.0, 116.5, 110.0],
    ruby:       [196.0, 246.9, 294.0],
    elizabeth:  [329.6, 392.0, 440.0]
  };

  var BED_GAINS = [0, 0.020, 0.045, 0.080];
  var MOTIF_GAINS = [0, 0.030, 0.060, 0.100];

  var ctx = null, bedGain = null, motifGain = null, noiseSrc = null;
  var started = false, room = null, ducked = false;
  var seed = 1;

  function rnd() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  }

  function st() { return (global.Liber && global.Liber.state) || null; }

  function scape() {
    var s = st();
    var g = s ? s.get() || {} : {};
    var c = g.scape || {};
    return {
      on: c.on !== false,
      bed: c.bed == null ? 2 : Math.max(0, Math.min(3, c.bed | 0)),
      motif: c.motif == null ? 2 : Math.max(0, Math.min(3, c.motif | 0))
    };
  }

  function enabled() {
    var s = st();
    var sounds = !s || s.get().sounds !== false;
    return sounds && scape().on;
  }

  function roomId() {
    try {
      var page = (location.pathname.split('/').pop() || '').replace(/\.html?$/i, '');
      if (page === 'index' || page === 'loading' || !page) return null;
      return page;
    } catch (e) { return null; }
  }

  function ensureCtx() {
    if (ctx) return ctx;
    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
      bedGain = ctx.createGain();
      bedGain.gain.value = 0;
      bedGain.connect(ctx.destination);
      motifGain = ctx.createGain();
      motifGain.gain.value = 1;
      motifGain.connect(ctx.destination);
    } catch (e) { ctx = null; }
    return ctx;
  }

  function applyGains() {
    if (!ctx) return;
    var c = scape();
    var t = ctx.currentTime;
    try {
      bedGain.gain.setTargetAtTime(enabled() ? BED_GAINS[c.bed] * (ducked ? 0.5 : 1) : 0, t, 0.4);
    } catch (e) {}
  }

  function buildBed() {
    var bed = BEDS[room] || BEDS.desktop;
    var t = ctx.currentTime;
    bed.f.forEach(function (f, i) {
      try {
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = f;
        g.gain.value = 1 / bed.f.length;
        // slow breathing per partial — the bed never sits still
        var lfo = ctx.createOscillator();
        var lg = ctx.createGain();
        lfo.frequency.value = 0.05 + 0.03 * i;
        lg.gain.value = 0.35;
        lfo.connect(lg).connect(g.gain);
        osc.connect(g).connect(bedGain);
        osc.start(t);
        lfo.start(t);
      } catch (e) {}
    });
    if (bed.n > 0) {
      try {
        var len = Math.floor(ctx.sampleRate * 2);
        var buf = ctx.createBuffer(1, len, ctx.sampleRate);
        var d = buf.getChannelData(0);
        for (var i = 0; i < len; i++) d[i] = (rnd() * 2 - 1) * 0.5;
        noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = buf;
        noiseSrc.loop = true;
        var lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = room === 'sea' ? 420 : 220;
        var ng = ctx.createGain();
        ng.gain.value = bed.n;
        noiseSrc.connect(lp).connect(ng).connect(bedGain);
        noiseSrc.start(t);
      } catch (e) {}
    }
    // shimmer scheduler: one soft partial every few seconds, seeded order
    setInterval(function () {
      if (!enabled() || document.hidden) return;
      try {
        var f = bed.f[Math.floor(rnd() * bed.f.length)];
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = f * 2;
        var t2 = ctx.currentTime;
        g.gain.setValueAtTime(0.0001, t2);
        g.gain.exponentialRampToValueAtTime(0.012, t2 + 0.4);
        g.gain.exponentialRampToValueAtTime(0.0001, t2 + 2.4);
        osc.connect(g).connect(bedGain);
        osc.start(t2);
        osc.stop(t2 + 2.6);
      } catch (e) {}
    }, 5200);
  }

  function start() {
    if (started) return;
    started = true;
    seed = (Date.now() % 2147483647) || 1;
    room = roomId();
    if (!room) return; // boot + loading keep their ritual ticks, no bed
    if (!BEDS[room]) room = 'desktop';
    var c = ensureCtx();
    if (!c) return;
    if (c.state === 'suspended') {
      try { c.resume(); } catch (e) {}
    }
    buildBed();
    applyGains();
  }

  function motif(name) {
    var seq = MOTIFS[name];
    if (!seq || !enabled()) return;
    var c = ensureCtx();
    if (!c) return;
    try {
      if (c.state === 'suspended') c.resume();
      var g = scape();
      var base = MOTIF_GAINS[g.motif];
      if (!base) return;
      var t = c.currentTime;
      seq.forEach(function (f, i) {
        var osc = c.createOscillator();
        var gn = c.createGain();
        osc.type = 'sine';
        osc.frequency.value = f;
        var at = t + i * 0.22;
        gn.gain.setValueAtTime(0.0001, at);
        gn.gain.exponentialRampToValueAtTime(base, at + 0.03);
        gn.gain.exponentialRampToValueAtTime(0.0001, at + 0.9);
        osc.connect(gn).connect(motifGain);
        osc.start(at);
        osc.stop(at + 1.0);
      });
    } catch (e) {}
  }

  function duck(on) {
    ducked = !!on;
    applyGains();
  }

  function refresh() { applyGains(); }

  global.Liber = global.Liber || {};
  global.Liber.soundscape = {
    motif: motif, duck: duck, refresh: refresh,
    room: function () { return room; },
    isEnabled: enabled,
    levels: scape
  };

  // silence until the first gesture (autoplay law, already honored
  // the same way in sound.js).
  document.addEventListener('pointerdown', start, { once: true });
  document.addEventListener('keydown', start, { once: true });
})(window);
