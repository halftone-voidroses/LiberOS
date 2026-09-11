// soundscape.js — the room's music player (2.7.1).
// One looped song (assets/music/main-theme.ogg), everywhere, always.
// Silence until the first gesture (autoplay law, same as sound.js).
// Master + music volume live in settings; state.scape = { on, bed, motif, music }.
// bed/motif are kept for compat (older saves) and scale the music gently.
// No imports. Every path guarded — audio can never break the room.

(function (global) {
  'use strict';

  var TRACKS = {
    'main': 'assets/music/main-theme.ogg'
  };

  // Compat: old bed/motif step buttons scale the OST gently (audible steps).
  var BED_SCALE = [0, 0.6, 0.85, 1];
  var MOTIF_SCALE = [0.85, 0.92, 1, 1];

  var audio = null;
  var current = null;
  var started = false;
  var ducked = false;
  var room = null;
  var fadeTimer = null;

  function st() { return (global.Liber && global.Liber.state) || null; }

  function scape() {
    var s = st();
    var g = s ? s.get() || {} : {};
    var c = g.scape || {};
    var music = (c.music == null ? 80 : +c.music);
    if (isNaN(music)) music = 80;
    music = Math.max(0, Math.min(100, music));
    return {
      on: c.on !== false,
      bed: c.bed == null ? 2 : Math.max(0, Math.min(3, c.bed | 0)),
      motif: c.motif == null ? 2 : Math.max(0, Math.min(3, c.motif | 0)),
      music: music
    };
  }

  function enabled() { return scape().on; }

  function roomId() {
    try {
      var page = (location.pathname.split('/').pop() || '').replace(/\.html?$/i, '');
      if (page === 'index' || page === 'loading' || !page) return null;
      return page;
    } catch (e) { return null; }
  }

  function pickTrack() {
    return 'main';
  }

  function targetVolume() {
    if (!enabled()) return 0;
    var c = scape();
    var v = (c.music / 100) * 0.9;
    v *= (BED_SCALE[c.bed] == null ? 1 : BED_SCALE[c.bed]);
    v *= (MOTIF_SCALE[c.motif] == null ? 1 : MOTIF_SCALE[c.motif]);
    if (ducked) v *= 0.5;
    return Math.max(0, Math.min(1, v));
  }

  function ensureAudio() {
    if (audio) return audio;
    try {
      audio = new Audio();
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = 0;
      audio.addEventListener('error', function () { /* stay silent, never break */ });
    } catch (e) { audio = null; }
    return audio;
  }

  function applyVolume(fast) {
    if (!audio) return;
    var v = targetVolume();
    try {
      if (fast) { audio.volume = v; return; }
      var from = audio.volume;
      var steps = 12, i = 0;
      if (fadeTimer) { clearInterval(fadeTimer); fadeTimer = null; }
      fadeTimer = setInterval(function () {
        i++;
        var k = i / steps;
        try { audio.volume = from + (v - from) * k; } catch (e) {}
        if (i >= steps) { clearInterval(fadeTimer); fadeTimer = null; }
      }, 100);
    } catch (e) {}
  }

  function switchTrack(name) {
    var a = ensureAudio();
    if (!a) return;
    if (current === name && a.getAttribute('src')) { applyVolume(); return; }
    current = name;
    var wasAudible = enabled() && a.volume > 0.01 && !a.paused;
    var doSwap = function () {
      try {
        a.src = TRACKS[name] || TRACKS.main;
        a.load();
        var p = a.play();
        if (p && p.catch) p.catch(function () { /* gesture not yet seen */ });
        applyVolume();
      } catch (e) {}
    };
    if (wasAudible) {
      // 1.2s crossfade: dip out, swap, swell back.
      var from = a.volume, i = 0;
      if (fadeTimer) { clearInterval(fadeTimer); fadeTimer = null; }
      fadeTimer = setInterval(function () {
        i++;
        try { a.volume = from * (1 - i / 6); } catch (e) {}
        if (i >= 6) {
          clearInterval(fadeTimer); fadeTimer = null;
          doSwap();
        }
      }, 100);
    } else {
      doSwap();
    }
  }

  function reselect() {
    if (!started) return;
    switchTrack(pickTrack());
  }

  function start() {
    if (started) { reselect(); return; }
    started = true;
    room = roomId();
    if (!room) return;
    var a = ensureAudio();
    if (!a) return;
    reselect();
  }

  function motif() {
    reselect();
    if (!audio) return;
    try {
      var v = targetVolume();
      audio.volume = Math.max(audio.volume, Math.min(1, v));
    } catch (e) {}
  }

  function duck(on) {
    ducked = !!on;
    applyVolume();
  }

  function refresh() {
    if (!started) return;
    if (!enabled()) { applyVolume(); return; }
    reselect();
  }

  function setMusic(v) {
    var s = st();
    if (!s) return;
    var g = s.get() || {};
    var n = Math.max(0, Math.min(100, Math.round(+v)));
    if (isNaN(n)) return;
    s.set({ scape: Object.assign({}, g.scape, { music: n }) });
    applyVolume();
  }

  global.Liber = global.Liber || {};
  global.Liber.soundscape = {
    motif: motif, duck: duck, refresh: refresh,
    room: function () { return room; },
    isEnabled: enabled,
    levels: scape,
    setMusic: setMusic,
    music: function () { return scape().music; },
    track: function () { return current; },
    reselect: reselect
  };

  document.addEventListener('pointerdown', start, { once: false });
  document.addEventListener('keydown', start, { once: false });
})(window);
