// state.js — localStorage-backed state + simple pub/sub
// Persists across the four states. Each page reads/writes here.

(function (global) {
  'use strict';

  const KEY = 'liber_vacui_v1';

  const DEFAULT = {
    state: 'boot',           // boot | loading | desktop
    tutorialDone: false,
    sigils: [],              // user's etched sigils
    cohort: [],              // the user's artifact set
    relations: [],           // sigil <- artifact edges
    divination: [],          // cards drawn from arcana
    games: [],               // saved game artifacts
    learn: [],               // promoted lessons
    abstract: [],            // abstract creations
    sea: [],                 // sea artifacts
    satchel: [],             // satchel items
    methodology: [],         // methodology artifacts
    council: [],             // council artifacts
    theme: 'corrupted',      // current skin of the machine
    shadowUnlocked: false,   // has the user entered the extc password
    shadowOn: false,         // is shadow overdrive active
    visited: {},             // visitor id -> last visited
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return Object.assign({}, DEFAULT);
      const parsed = JSON.parse(raw);
      return Object.assign({}, DEFAULT, parsed);
    } catch (e) {
      return Object.assign({}, DEFAULT);
    }
  }

  function save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      // localStorage may be unavailable in file:// in some browsers.
      // Silently fall through — session still works for the visit.
    }
  }

  const subscribers = {};
  let state = load();

  function get() { return state; }

  function set(patch) {
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

  function bindRelation(fromId, verb) {
    var relations = (state.relations || []).slice();
    if (relations.some(function (r) { return r.from === fromId && r.verb === verb; })) return null;
    var rel = { from: fromId, to: 'sigil', verb: verb || 'relates to', ts: Date.now() };
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
    state.sigils = [sigil];
    state = Object.assign({}, state);
    save(state);
    emit('change', state);
  }

  global.Liber = global.Liber || {};
  global.Liber.state = { get, set, on, reset, addArtifact, bindRelation, unbindRelation, releaseArtifact, replaceSigil };
})(window);
