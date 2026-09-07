// state.js — localStorage-backed state + simple pub/sub
// Persists across the four states. Each page reads/writes here.

(function (global) {
  'use strict';

  const KEY = 'liber_vacui_v1';
  const CUTSCENE_BUILD = 'riasondemo1';

  const DEFAULT = {
    cutsceneBuild: CUTSCENE_BUILD,
    state: 'boot',           // boot | loading | desktop
    tutorialDone: false,
    buddy: [],              // buddy artifacts: stone casts (kind stone) + sealed chats (kind sealed)
    relations: [],           // sigil <- artifact edges
    divination: [],          // cards drawn from arcana
    games: [],               // saved game artifacts
    learn: [],               // promoted lessons
    abstract: [],            // abstract creations
    sea: [],                 // sea artifacts
    graveyard: [],          // buried artifacts, awaiting the dig
    satchel: [],            // satchel items
    methodology: [],        // methodology artifacts
    council: [],            // council artifacts
    garden: [],             // ruby's garden — planted seeds / flowers in bloom
    dreams: [],             // recorded dreams, kept for interpretation
    daily: null,            // the day's small works { date: 'YYYY-MM-DD', done: [ids] }
    theme: 'corrupted',      // current skin of the machine
    shadowUnlocked: false,   // has the user entered the extc password
    shadowOn: false,         // is shadow overdrive active
    sounds: true,            // synthesized UI sounds (WS4, src/sound.js)
    visited: {},             // visitor id -> last visited
    sessionStart: 0,         // ts of the current visit's start (WS5 session arc)
    arcShownFor: 0,          // sessionStart the sea-arc line was shown for (once per visit)
    bests: {},               // per-booth personal bests { boothId: value } (WS5)
    ambient: null,           // per-visit ambient prompt bookkeeping { seed, fired: [] }
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return Object.assign({}, DEFAULT);
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.cohort) && (!Array.isArray(parsed.buddy) || parsed.buddy.length === 0)) {
        parsed.buddy = parsed.cohort;
        delete parsed.cohort;
      }
      if (Array.isArray(parsed.sigils) && parsed.sigils.length) {
        var stone = parsed.sigils.map(function (e) { return Object.assign({}, e, { kind: 'stone' }); });
        parsed.buddy = stone.concat(Array.isArray(parsed.buddy) ? parsed.buddy : []);
        delete parsed.sigils;
      } else {
        delete parsed.sigils;
      }
      if (Array.isArray(parsed.buddy)) {
        parsed.buddy = parsed.buddy.map(function (e) { return (e && !e.kind) ? Object.assign({}, e, { kind: 'sealed' }) : e; });
      }
      if (Array.isArray(parsed.relations)) {
        parsed.relations = parsed.relations.map(function (r) { return (r && r.to === 'sigil') ? Object.assign({}, r, { to: 'buddy' }) : r; });
      }
      if (parsed.cutsceneBuild !== CUTSCENE_BUILD) {
        parsed.cutsceneBuild = CUTSCENE_BUILD;
        var shelve = ['buddy', 'relations', 'divination', 'games', 'learn', 'abstract', 'sea', 'garden', 'dreams'];
        var grave = Array.isArray(parsed.graveyard) ? parsed.graveyard.slice() : [];
        var now = Date.now(), k, i;
        for (k = 0; k < shelve.length; k++) {
          var arr = parsed[shelve[k]];
          if (Array.isArray(arr) && arr.length) {
            for (i = 0; i < arr.length; i++) grave.push({ kind: shelve[k], entry: arr[i], buriedAt: now });
            parsed[shelve[k]] = [];
          }
        }
        parsed.graveyard = grave;
        parsed.tutorialDone = false;
        parsed.tutorialStage = null;
      }
      return Object.assign({}, DEFAULT, parsed);
    } catch (e) {
      return Object.assign({}, DEFAULT);
    }
  }

  function save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      diag('save', { ok: 1 });
    } catch (e) {
      // Session still works for the visit; the failure is recorded below.
      diag('save-fail', { err: String(e).slice(0, 120) });
    }
  }

  // Diagnostic ring for wrapper debugging — keep, it caught the bfcache clobber.
  function diag(event, extra) {
    try {
      const raw = localStorage.getItem('liber_diag');
      const arr = raw ? JSON.parse(raw) : [];
      arr.push(Object.assign({ t: Date.now(), e: event, sig: (state.buddy || []).filter(function (e) { return e && e.kind === 'stone'; }).length }, extra || {}));
      while (arr.length > 60) arr.shift();
      localStorage.setItem('liber_diag', JSON.stringify(arr));
    } catch (e) { /* never break the room */ }
  }

  const subscribers = {};
  let state = load();

  function get() { return state; }

  function set(patch) {
    diag('set', { k: Object.keys(patch).join(',') });
    state = Object.assign({}, state, patch);
    save(state);
    emit('change', state);
  }

  function on(event, fn) {
    if (!subscribers[event]) subscribers[event] = [];
    subscribers[event].push(fn);
    return () => {
      const arr = subscribers[event];
      if (arr) {
        const i = arr.indexOf(fn);
        if (i >= 0) arr.splice(i, 1);
      }
    };
  }

  function emit(event, payload) {
    const arr = subscribers[event];
    if (!arr) return;
    for (const fn of arr) {
      try { fn(payload); } catch (e) { /* don't let one subscriber break the others */ }
    }
  }

  function reset() {
    state = Object.assign({}, DEFAULT);
    save(state);
    emit('change', state);
  }

  function addArtifact(kind, data) {
    var entry = Object.assign({ id: kind + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6), ts: Date.now() }, data);
    var arr = state[kind] ? state[kind].slice() : [];
    arr.push(entry);
    state = Object.assign({}, state);
    state[kind] = arr;
    save(state);
    emit('change', state);
    emit('artifact', { kind: kind, entry: entry });
    return entry;
  }

  // Amend an existing artifact in place (associations added to a dream,
  // a flower painted further). ts (the making date) is kept; updated moves.
  function updateArtifact(kind, id, patch) {
    if (!state[kind]) return null;
    var arr = state[kind].slice();
    var idx = -1;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] && arr[i].id === id) { idx = i; break; }
    }
    if (idx < 0) return null;
    var entry = Object.assign({}, arr[idx], patch, { updated: Date.now() });
    arr[idx] = entry;
    state = Object.assign({}, state);
    state[kind] = arr;
    save(state);
    emit('change', state);
    emit('artifact', { kind: kind, entry: entry });
    return entry;
  }

  function bindRelation(fromId, verb) {
    var relations = (state.relations || []).slice();
    if (relations.some(function (r) { return r.from === fromId && r.verb === verb; })) return null;
    var rel = { from: fromId, to: 'buddy', verb: verb || 'relates to', ts: Date.now() };
    relations.push(rel);
    state = Object.assign({}, state, { relations: relations });
    save(state);
    emit('change', state);
    return rel;
  }

  function unbindRelation(fromId) {
    state.relations = (state.relations || []).filter(function (r) { return r.from !== fromId; });
    state = Object.assign({}, state);
    save(state);
    emit('change', state);
  }

  function releaseArtifact(kind, id) {
    if (!state[kind]) return false;
    var found = state[kind].some(function (a) { return a.id === id; });
    if (!found) return false;
    state[kind] = state[kind].filter(function (a) { return a.id !== id; });
    state = Object.assign({}, state);
    save(state);
    emit('change', state);
    return true;
  }

  function replaceSigil(sigil) {
    var sealed = (state.buddy || []).filter(function (e) { return !e || e.kind !== 'stone'; });
    state.buddy = [Object.assign({}, sigil, { kind: 'stone' })].concat(sealed);
    state = Object.assign({}, state);
    save(state);
    emit('change', state);
  }

  // WebKit's page cache (bfcache) restores a page with the JS snapshot it
  // had when hidden — including this module's in-memory state. If another
  // page wrote since, memory is stale and the next set() clobbers the
  // newer disk state (reported: cast -> back -> the cast is gone).
  // Resync on EVERY pageshow: WKWebView reports persisted=false on restores
  // of tauri:// pages, so gating on it skips the one path that needs this.
  window.addEventListener('pageshow', function (e) {
    diag('pageshow', { p: e.persisted ? 1 : 0 });
    state = load();
    emit('change', state);
  });

  global.Liber = global.Liber || {};
  global.Liber.state = { get, set, on, reset, addArtifact, updateArtifact, bindRelation, unbindRelation, releaseArtifact, replaceSigil };
})(window);
