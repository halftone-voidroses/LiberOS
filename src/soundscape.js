// soundscape.js — the room's OST player (2.7.0).
// File-based melodic soundscape: five looped .ogg movements in assets/music/.
//   wanderlust-ritual.ogg — the tutorial summoning (cutscene ritual)
//   riason-part.ogg       — hijack tours + Riason's rooms (satchel/learn)
//   main-theme.ogg         — every app/room by default (incl. buddy-creation override below)
//   buddy-creation.ogg     — the buddy room (stone + sealed chats)
//   vanir.ogg              — the sea room
// Mapping (per release notes): wanderlust + riason during the tutorial
// (wanderlust during summoning), riason during hijack; otherwise maintheme
// for apps/etc and vanir for the sea. Buddy room gets buddy-creation.
// One <audio> element, looped, with a 1.2s crossfade between movements.
// Silence until the first gesture (autoplay law, same as sound.js).
// Master + music volume live in settings; state.scape = { on, bed, motif, music }.
// bed/motif are kept for compat (older saves) and scale the music gently.
// No imports. Every path guarded — audio can never break the room.

(function (global) {
  'use strict';

  var TRACKS = {
    'wanderlust': 'assets/music/wanderlust-ritual.ogg',
    'riason': 'assets/music/riason-part.ogg',
    'main': 'assets/music/main-theme.ogg',
    'buddy': 'assets/music/buddy-creation.ogg',
    'vanir': 'assets/music/vanir.ogg'
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

  function soundsOn() {
    var s = st();
    return !s || s.get().sounds !== false;
  }

  function enabled() { return soundsOn() && scape().on; }

  function roomId() {
    try {
      var page = (location.pathname.split('/').pop() || '').replace(/\.html?$/i, '');
      if (page === 'index' || page === 'loading' || !page) return null;
      return page;
    } catch (e) { return null; }
  }

  function tutorialState() {
    try {
      var s = st();
      var g = s ? s.get() || {} : {};
      return { done: !!g.tutorialDone, stage: g.tutorialStage || null };
    } catch (e) { return { done: true, stage: null }; }
  }

  function summoningOpen() {
    try {
      var c = document.getElementById('cutscene');
      if (c && c.classList.contains('ritual')) return true;
      if (c && /summon/i.test(c.textContent || '')) return true;
      return false;
    } catch (e) { return false; }
  }

  function hijackOpen() {
    try {
      if (document.querySelector('.hijack.open')) return true;
      var h = document.getElementById('hijack');
      if (h && h.classList.contains('open')) return true;
      var lh = document.getElementById('learn-hijack');
      if (lh && lh.classList.contains('open')) return true;
      return false;
    } catch (e) { return false; }
  }

  // The OST pick. Moments first, then rooms: wanderlust while the
  // summoning ritual is open, riason while any hijack tour is open;
  // otherwise vanir for the sea, buddy-creation for the buddy room,
  // and the main theme everywhere else (tutorial included).
  function pickTrack() {
    if (summoningOpen()) return 'wanderlust';
    if (hijackOpen()) return 'riason';
    if (room === 'sea') return 'vanir';
    if (room === 'buddy') return 'buddy';
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
    if (!room) return; // boot + loading keep their ritual ticks, no bed
    var a = ensureAudio();
    if (!a) return;
    // Prime each movement quietly so room changes never stall.
    try {
      Object.keys(TRACKS).forEach(function (k) {
        var l = document.createElement('link');
        l.rel = 'preload'; l.as = 'audio'; l.href = TRACKS[k];
        document.head.appendChild(l);
      });
    } catch (e) {}
    reselect();
    // Tutorial beats change the movement: watch the DOM + state.
    try {
      var obs = new MutationObserver(function () { reselect(); });
      obs.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    } catch (e) {}
    setInterval(reselect, 3000);
  }

  // ── compat surface ────────────────────────────────────────────────
  // motif(name): traveller leitmotif calls (garden ruby, buddy, sea vanir).
  // With file movements the room track already carries the voice — make
  // sure we are on the right movement and swell gently instead of synth.
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
