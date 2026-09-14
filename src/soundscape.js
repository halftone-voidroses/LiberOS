// soundscape.js — the room's music player, currently standing empty.
//
// 2.13.0: the OST is REMOVED for now. v2.7.1–2.12.0 played one looped song
// (assets/music/main-theme.ogg) on every page; it is not replaced with
// anything. This file keeps the module's shape and its public surface, so
// every caller that was written against it (garden's ruby motif, sea's
// vanir motif, buddy's duck-under-the-answer, settings' levels) stays
// valid and silent instead of breaking — the music is off, not the door.
//
// Reinstating it is a rewrite of this file, not a hunt through the rooms.
// No audio element is ever constructed here: nothing can play, and nothing
// is preloaded, so the silence costs no bytes and no decode.
//
// API: window.Liber.soundscape = { motif, duck, refresh, room, isEnabled,
//      levels, setMusic, music, track, reselect }
// Every path is guarded — audio can never break the room.

(function (global) {
  'use strict';

  function st() { return (global.Liber && global.Liber.state) || null; }

  // The levels still read from state, so the shape the settings panel wrote
  // is not orphaned; nothing is applied to anything.
  function scape() {
    var s = st();
    var g = s ? s.get() || {} : {};
    var c = g.scape || {};
    var music = (c.music == null ? 0 : +c.music);
    if (isNaN(music)) music = 0;
    return {
      on: false,
      bed: c.bed == null ? 2 : Math.max(0, Math.min(3, c.bed | 0)),
      motif: c.motif == null ? 2 : Math.max(0, Math.min(3, c.motif | 0)),
      music: Math.max(0, Math.min(100, music))
    };
  }

  // there is no music, so there is nothing to be enabled
  function enabled() { return false; }

  function roomId() {
    try {
      var page = (location.pathname.split('/').pop() || '').replace(/\.html?$/i, '');
      if (page === 'index' || page === 'loading' || !page) return null;
      return page;
    } catch (e) { return null; }
  }

  global.Liber = global.Liber || {};
  global.Liber.soundscape = {
    motif: function () {},
    duck: function () {},
    refresh: function () {},
    room: function () { return roomId(); },
    isEnabled: enabled,
    levels: scape,
    setMusic: function (v) {
      // the number is still remembered (a save from a louder build keeps its
      // intent) but it is not played back
      var s = st();
      if (!s) return;
      var g = s.get() || {};
      var n = Math.max(0, Math.min(100, Math.round(+v)));
      if (isNaN(n)) return;
      s.set({ scape: Object.assign({}, g.scape, { music: n }) });
    },
    music: function () { return scape().music; },
    track: function () { return null; },
    reselect: function () {}
  };
})(window);
