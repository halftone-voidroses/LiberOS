// affinity.js — relationship-kept unlocks (futures §17). Travellers unlock
// through conversation and kept work, never counters you can see: affinity
// per traveller derives from exchanges, topics, seals, keeps, releases,
// binds and notes. When a threshold is crossed the traveller invites you
// in-character, once, and the unlocked thing appears with its invite line.
// Thresholds: toybox (whimsy, 1 game kept OR 6 lamp conversations —
// demonstrably unlockable by conversation alone), tidepool (vanir, 5
// releases), weaver (riason, 5 binds), thimble (ruby, 3 plantings), inkstorm
// (e-lizabeth, 1 sealed chat — Entity404 gatecrashes the seal).
// No imports. Pure core (createAffinity) + room singleton wiring.
(function (global) {
  'use strict';

  // kind (artifact list) -> traveller. seal/stone split handled by reader.
  var KIND_WHO = {
    games: 'whimsy', garden: 'ruby', sea: 'vanir', divination: 'arcana',
    dreams: 'inquiry', buddy: 'elizabeth', iching: 'arcana'
  };

  var UNLOCKS = [
    { id: 'toybox', who: 'whimsy', need: 1, metric: 'games', chatNeed: 6,
      invite: 'my little brother wants to meet you. he is small. be nice.' },
    { id: 'tidepool', who: 'vanir', need: 5, metric: 'releases',
      invite: 'The deep has something for you. Come see.' },
    { id: 'weaver', who: 'riason', need: 5, metric: 'binds',
      invite: 'the web is tight enough to play.' },
    { id: 'thimble', who: 'ruby', need: 3, metric: 'plantings',
      invite: 'something wants crossing. bring two flowers.' },
    { id: 'inkstorm', who: 'elizabeth', need: 1, metric: 'seals',
      invite: '— static clears for one word — type it before it dissolves.' }
  ];

  // liberchat persona id -> traveller key (chat exchanges vouch for their
  // traveller alongside kept-work metrics).
  var PERSONA_WHO = {
    sigil: 'physius', satchel: 'riason', sea: 'vanir', buddy: 'elizabeth',
    games: 'whimsy', divination: 'arcana', garden: 'ruby', dreams: 'inquiry',
    learn: 'scribe', trash: 'pete', themes: 'wanderlust', toybox: 'pip'
  };

  function metricsOf(s) {
    s = s || {};
    function len(k) { return Array.isArray(s[k]) ? s[k].length : 0; }
    var notes = 0;
    (s.satchel || []).forEach(function (e) {
      if (e && (e.note || e.annotation)) notes++;
    });
    var chats = {};
    var chat = s.chat || {};
    Object.keys(chat).forEach(function (p) {
      var who = PERSONA_WHO[p];
      if (who) chats[who] = (chats[who] || 0) + (chat[p] || 0);
    });
    return {
      games: len('games'),
      releases: len('sea'),
      binds: (s.relations || []).length,
      plantings: len('garden'),
      seals: (s.buddy || []).filter(function (e) { return e && e.kind === 'sealed'; }).length,
      notes: notes,
      draws: len('divination') + (s.iching || []).length,
      chats: chats
    };
  }

  function affinityOf(s) {
    s = s || {};
    var aff = Object.assign({}, s.affinity);
    var m = metricsOf(s);
    aff.whimsy = Math.max(aff.whimsy || 0, m.games, m.chats.whimsy || 0);
    aff.vanir = Math.max(aff.vanir || 0, m.releases, m.chats.vanir || 0);
    aff.riason = Math.max(aff.riason || 0, m.binds, Math.floor(m.notes / 4), m.chats.riason || 0);
    aff.ruby = Math.max(aff.ruby || 0, m.plantings, m.chats.ruby || 0);
    aff.elizabeth = Math.max(aff.elizabeth || 0, m.seals, m.chats.elizabeth || 0);
    aff.arcana = Math.max(aff.arcana || 0, m.draws, m.chats.arcana || 0);
    aff.inquiry = Math.max(aff.inquiry || 0, Array.isArray(s.dreams) ? s.dreams.length : 0, m.chats.inquiry || 0);
    aff.physius = Math.max(aff.physius || 0,
      (s.buddy || []).filter(function (e) { return e && e.kind === 'stone'; }).length, m.chats.physius || 0);
    return aff;
  }

  function createAffinity(readState, writeState) {
    function check() {
      var s = readState() || {};
      var m = metricsOf(s);
      var unlocked = Object.assign({}, s.unlocks);
      var newly = [];
      UNLOCKS.forEach(function (u) {
        if (unlocked[u.id]) return;
        var met = (m[u.metric] || 0) >= u.need;
        if (!met && u.chatNeed) {
          // conversation-alone path: enough lamp exchanges vouch for you
          var personaId = Object.keys(PERSONA_WHO).filter(function (p) { return PERSONA_WHO[p] === u.who; })[0];
          met = ((s.chat || {})[personaId] || 0) >= u.chatNeed;
        }
        if (met) {
          unlocked[u.id] = true;
          newly.push(u);
        }
      });
      if (newly.length) writeState({ affinity: affinityOf(s), unlocks: unlocked });
      else if (JSON.stringify(s.affinity || {}) !== JSON.stringify(affinityOf(s))) {
        writeState({ affinity: affinityOf(s) });
      }
      return newly;
    }
    function unlocked(id) {
      var s = readState() || {};
      return !!((s.unlocks || {})[id]);
    }
    return { check: check, unlocked: unlocked, metrics: metricsOf, affinity: affinityOf, UNLOCKS: UNLOCKS, KIND_WHO: KIND_WHO, PERSONA_WHO: PERSONA_WHO };
  }

  // room singleton: listens to keeps, checks thresholds, announces invites
  // through the games room banner queue (picked up by games.js) and a
  // desktop note for the weaver (picked up by the desktop).
  var core = null;
  function st() { return (global.Liber && global.Liber.state) || null; }
  function ensure() {
    if (core) return core;
    var s = st();
    if (!s) return null;
    core = createAffinity(
      function () { return s.get() || {}; },
      function (patch) { s.set(patch); }
    );
    return core;
  }

  function pendingInvites() {
    var s = st();
    if (!s) return [];
    var g = s.get() || {};
    var seen = g.unlocksSeen || [];
    return UNLOCKS.filter(function (u) {
      return ((g.unlocks || {})[u.id]) && seen.indexOf(u.id) < 0;
    });
  }
  function markSeen(id) {
    var s = st();
    if (!s) return;
    var g = s.get() || {};
    var seen = (g.unlocksSeen || []).slice();
    if (seen.indexOf(id) < 0) seen.push(id);
    s.set({ unlocksSeen: seen });
  }

  global.Liber = global.Liber || {};
  global.Liber.affinity = {
    create: createAffinity,
    check: function () { var c = ensure(); return c ? c.check() : []; },
    unlocked: function (id) { var c = ensure(); return c ? c.unlocked(id) : false; },
    invites: pendingInvites,
    seen: markSeen,
    KIND_WHO: KIND_WHO,
    UNLOCKS: UNLOCKS
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = global.Liber.affinity;

  if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('DOMContentLoaded', function () {
      try {
        var c = ensure();
        if (c) c.check();
      } catch (e) {}
    });
  }
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('pageshow', function () {
      try {
        var c2 = ensure();
        if (c2) c2.check();
      } catch (e) {}
    });
  }
  if (global.Liber && global.Liber.state && global.Liber.state.on) {
    global.Liber.state.on('artifact', function () {
      try {
        var c3 = ensure();
        if (c3) c3.check();
      } catch (e) {}
    });
  }
})(typeof window !== 'undefined' ? window : globalThis);
