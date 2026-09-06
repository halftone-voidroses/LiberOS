// gamification.js — WS5 session layer (docs/gamification.md mechanics 1, 5).
// Owns the session arc (one gentle Sea suggestion per long visit) and the
// ambient variable prompts (sparse, seeded, capped, never nagging).
// Presence tiers for the room's classes live in src/shadow.js (runs on every
// page); this module loads on desktop.html only, after src/prompt-engine.js.
// PRNG: xmur3 + mulberry32, the same approach as src/prompt-engine.js —
// no Math.random in anything the user can perceive.

(function () {
  'use strict';

  var VISIT_GAP_MS = 4 * 60 * 60 * 1000;  // away longer than this = a new sitting
  var LONG_VISIT_MS = 45 * 60 * 1000;     // the sea arc may speak after this
  var AMBIENT_MAX = 2;                    // hard cap per visit (spec: 1-2)
  var AMBIENT_TICK_MS = 30 * 1000;        // due-check cadence — a timer, not animation

  var SEA_LINE = 'the visit has been long. the sea holds a quiet ending.';

  function state() {
    return (window.Liber && window.Liber.state) ? window.Liber.state : null;
  }

  // xmur3 string hash + mulberry32 PRNG (mirrors src/prompt-engine.js).
  function hashSeed(str) {
    var h = 1779033703 ^ str.length;
    for (var i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return (h ^= h >>> 16) >>> 0;
  }

  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ── presence ──────────────────────────────────────────────────────────

  // Buddy artifact kinds (prompt-engine's list minus satchel, which mirrors
  // game saves). Thresholds mirror src/shadow.js / src/prompt-engine.js.
  var ARTIFACT_KINDS = ['divination', 'iching', 'games', 'sea', 'buddy', 'abstract', 'methodology', 'learn', 'council', 'garden', 'dreams'];
  var PATINA_TIERS = [2, 6, 12];   // visits + artifacts
  var BUDDY_TIERS = [2, 6, 12];   // artifacts + relations

  function countArtifacts(s) {
    var n = 0;
    for (var i = 0; i < ARTIFACT_KINDS.length; i++) {
      if (Array.isArray(s[ARTIFACT_KINDS[i]])) n += s[ARTIFACT_KINDS[i]].length;
    }
    return n;
  }

  function tierLevel(n, tiers) {
    var level = 0;
    for (var i = 0; i < tiers.length; i++) {
      if (n >= tiers[i]) level = i + 1;
    }
    return level;
  }

  function presence(s) {
    s = s || (state() ? state().get() : {}) || {};
    var visits = Object.keys(s.visited || {}).length;
    var artifacts = countArtifacts(s);
    var relations = (s.relations || []).length;
    return {
      visits: visits,
      artifacts: artifacts,
      relations: relations,
      patina: tierLevel(visits + artifacts, PATINA_TIERS),
      buddy: tierLevel(artifacts + relations, BUDDY_TIERS),
    };
  }

  // ── session arc (mechanic 1) ──────────────────────────────────────────
  // One suggestion per visit, status-line voiced, never blocks exit.
  // Dismissal persists: arcShownFor pins the sessionStart it was shown for.

  function seaArc() {
    return {
      line: SEA_LINE,
      shouldSuggest: function () {
        var st = state();
        if (!st) return false;
        var s = st.get();
        return !!s.tutorialDone && !!s.sessionStart &&
          Date.now() - s.sessionStart >= LONG_VISIT_MS &&
          s.arcShownFor !== s.sessionStart;
      },
      markShown: function () {
        var st = state();
        if (!st) return;
        var s = st.get();
        if (s.arcShownFor !== s.sessionStart) st.set({ arcShownFor: s.sessionStart });
      },
    };
  }

  // ── ambient variable prompts (mechanic 5) ─────────────────────────────
  // The machine occasionally speaks first: 1-2 prompts per visit, only after
  // a relation exists, at an unpredictable (but seeded) interval. Deterministic
  // per visit: the schedule is derived from sessionStart, so reloads of the
  // same visit land on the same schedule and the cap survives reloads.

  function ambientPlan(s) {
    s = s || (state() ? state().get() : {}) || {};
    var rng = mulberry32(hashSeed('ambient|' + (s.sessionStart || 0)));
    var first = 40 + Math.floor(rng() * 110);        // seconds: 40-150
    var count = rng() < 0.5 ? 1 : 2;
    var delays = [first];
    if (count === 2) delays.push(first + 90 + Math.floor(rng() * 120));
    return { seed: s.sessionStart || 0, count: count, delays: delays };
  }

  function ambientFire(force) {
    var st = state();
    if (!st) return null;
    var s = st.get();
    var relations = s.relations || [];
    var amb = s.ambient;
    if (!relations.length) return null;
    if (!amb || amb.seed !== (s.sessionStart || 0)) return null;
    var fired = amb.fired || [];
    if (fired.length >= AMBIENT_MAX) return null;
    var idx = fired.length;
    if (!force) {
      var plan = ambientPlan(s);
      if (Date.now() - s.sessionStart < plan.delays[idx] * 1000) return null;
    }
    var rng = mulberry32(hashSeed('ambient-pick|' + (s.sessionStart || 0) + '|' + idx));
    var rel = relations[Math.floor(rng() * relations.length) % relations.length];
    var salt = 'ambient-' + idx + '-' + rel.from;
    // no repetition within the visit: never re-speak a line already shown
    // (relation-bound prompts in state.prompts, or an earlier ambient slot)
    var spoken = {};
    var existing = s.prompts || [];
    for (var i = 0; i < existing.length; i++) spoken[existing[i].text] = true;
    for (var j = 0; j < fired.length; j++) {
      if (fired[j] && fired[j].text) spoken[fired[j].text] = true;
    }
    var prompt = (window.Liber.prompts && window.Liber.prompts.compose)
      ? window.Liber.prompts.compose(rel, salt)
      : null;
    var tries = 0;
    while (prompt && spoken[prompt.text] && tries < 3) {
      tries++;
      prompt = window.Liber.prompts.compose(rel, salt + '-' + tries);
    }
    // the attempt is spent either way — the cap holds even if compose balks
    st.set({ ambient: { seed: amb.seed, fired: fired.concat([{ salt: salt, text: prompt ? prompt.text : '' }]) } });
    if (!prompt) return null;
    try {
      document.dispatchEvent(new CustomEvent('liber:prompt', { detail: prompt }));
    } catch (e) { /* the room never breaks for a prompt */ }
    return prompt;
  }

  // ── init ──────────────────────────────────────────────────────────────

  function init() {
    var st = state();
    if (!st) return;
    var s = st.get();
    var now = Date.now();
    var patch = null;
    if (!s.sessionStart || now - s.sessionStart > VISIT_GAP_MS) {
      patch = { sessionStart: now, ambient: { seed: now, fired: [] } };
    } else if (!s.ambient || s.ambient.seed !== s.sessionStart) {
      patch = { ambient: { seed: s.sessionStart, fired: [] } };
    }
    if (patch) st.set(patch);

    // late-load catch-up: if a slot fell due while the user was in an app,
    // let the machine speak a beat after return, not instantly on paint
    setTimeout(function () {
      try { ambientFire(false); } catch (e) { /* quiet */ }
    }, 25 * 1000);
    setInterval(function () {
      try { ambientFire(false); } catch (e) { /* quiet */ }
    }, AMBIENT_TICK_MS);
  }

  window.Liber = window.Liber || {};
  window.Liber.gamification = {
    presence: presence,
    seaArc: seaArc,
    ambient: {
      plan: function () { return ambientPlan(state() ? state().get() : {}); },
      fire: function () { return ambientFire(true); },
    },
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
