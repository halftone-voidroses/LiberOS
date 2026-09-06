// twelve-works.js — the twelve works (desktop.html only). A 12-segment bar
// above the constellation: one segment per traveller. A segment lights when
// you first make something in that traveller's app; the travellers witnessed
// it. Unlit segments suggest a research-backed art-therapy prompt on
// hover/focus (docs/gamification.md mechanic 3, reskinned as lore); lit
// segments show the work line + count, and clicking one GENERATES a
// research-backed prompt from your own room — the traveller's prompt bank
// grounded in your latest artifact here, its declared verb, and your
// buddy's intention (src/prompt-engine.js compose, seeded per click).
// Everything is hover-gated or click-called — no popups, no XP, no guilt
// (docs/gamification.md anti-goals).
// Derived only: reads state, writes nothing. Newly-lit segments fire their
// tier's prompt once per visit via the existing liber:prompt CustomEvent
// (rendered by src/prompt-surface.js); the once-cap is in-memory, the same
// per-visit shape as src/gamification.js ambient. First render is the
// baseline — a room already full of work never re-speaks on load.

(function () {
  'use strict';

  var ORDER = [
    'sigil', 'garden', 'sea', 'buddy',
    'abstract', 'games', 'divination', 'learn',
    'methodology', 'dreams', 'relation', 'trash'
  ];

  var WORKS = (window.LIBER_DATA && window.LIBER_DATA.twelveWorks) || [];
  var PERSONAS = (window.LIBER_DATA && window.LIBER_DATA.personas) || {};
  var CITES = (window.LIBER_DATA && window.LIBER_DATA.citations && window.LIBER_DATA.citations.citations) || [];

  var WORK_BY_ID = {};
  for (var wi = 0; wi < WORKS.length; wi++) WORK_BY_ID[WORKS[wi].id] = WORKS[wi];
  var CITE_BY_ID = {};
  for (var ci = 0; ci < CITES.length; ci++) CITE_BY_ID[CITES[ci].id] = CITES[ci];

  // WS6 scope lines, shortened for the bar's small citation resolution —
  // how far each category's claim carries, in the machine's own voice.
  var SCOPES = {
    'accessible-practical': 'kept for practice, not for proof.',
    'research-empirical': 'published research — it carries as far as its own studies ran.',
    'perennial-eastern': 'a contemplative frame — orientation, not a finding.',
    'hermetic-esoteric': 'a lineage source — vocabulary and ritual form, not clinical evidence.',
    'philosophical-pataphysical': 'philosophy, filed as ancestry — argument, not a tested claim.'
  };

  // Carving-style marks, one per traveller (stroke follows the persona
  // accent via currentColor). Held here, the codebase's pattern: every
  // module keeps its own inline SVGs (see dial.js, carvings.js).
  var GLYPHS = {
    sigil:       '<rect x="4" y="4" width="12" height="12" rx="1" fill="none"/><circle cx="10" cy="10" r="2.6" fill="none"/>',
    garden:      '<circle cx="10" cy="7" r="2.4" fill="none"/><path d="M10 9.5 v6 M10 12 q-2.4 0.4 -3 -1.6 M10 13 q2.4 0.4 3 -1.6" fill="none"/>',
    satchel:     '<path d="M5 8 h10 v8 h-10 z" fill="none"/><path d="M8 8 v-2 a2 2 0 0 1 4 0 v2" fill="none"/>',
    sea:         '<path d="M3 9 q2.5 -2.5 5 0 t5 0 t4 0" fill="none"/><path d="M3 13 q2.5 -2.5 5 0 t5 0 t4 0" fill="none"/>',
    buddy:      '<circle cx="10" cy="12" r="5" fill="none"/><path d="M10 3 c1.6 2 1.6 3.2 0 4.6 c-1.6 -1.4 -1.6 -2.6 0 -4.6 z" fill="currentColor" fill-opacity="0.35" stroke="none"/>',
    abstract:    '<rect x="4" y="4" width="12" height="12" fill="none"/><path d="M7 10 h6 m-3 -3 v6" fill="none"/>',
    games:       '<circle cx="10" cy="8" r="4.5" fill="none"/><path d="M8 13.5 h4 v3 h-4 z" fill="none"/>',
    divination:  '<rect x="6" y="3" width="8" height="13" rx="1" fill="none"/><path d="M10 7 v5 m-2.5 -2.5 h5" fill="none"/>',
    learn:       '<rect x="4" y="4" width="12" height="12" fill="none"/><path d="M4 8 h12 m-12 4 h12 m-12 4 h8" fill="none"/>',
    methodology: '<rect x="4" y="3" width="12" height="14" fill="none"/><circle cx="10" cy="13" r="2.5" fill="none"/><path d="M7 6.5 h6" fill="none"/>',
    dreams:      '<path d="M12.5 4 a5.2 5.2 0 1 0 2.6 8.4 a5.6 5.6 0 0 1 -2.6 -8.4 z M15 4 h1 v1 h-1 z M16 6 h1 v1 h-1 z" fill="none"/>',
    relation:    '<circle cx="7" cy="10" r="3.5" fill="none"/><circle cx="13" cy="10" r="3.5" fill="none"/>',
    trash:       '<path d="M14 4 a4 4 0 0 1 -4 4 l-4 4 m4 -4 h3" fill="none"/>'
  };

  function state() {
    return (window.Liber && window.Liber.state) ? window.Liber.state : null;
  }

  // ── lit states (derived only — no state writes anywhere here) ─────────

  function litMap(s) {
    return {
      sigil: (s.sigils || []).length > 0,
      garden: (s.garden || []).length > 0,
      sea: (s.sea || []).length > 0,
      buddy: (s.buddy || []).length > 0,
      abstract: (s.abstract || []).length > 0,
      games: (s.games || []).length > 0,
      divination: (s.divination || []).length > 0,
      learn: (s.learn || []).length > 0,
      methodology: (s.methodology || []).length > 0,
      dreams: (s.dreams || []).length > 0,
      relation: (s.relations || []).length > 0,
      trash: (s.graveyard || []).length > 0
    };
  }

  function countFor(id, s) {
    var key = id === 'relation' ? 'relations' : id === 'trash' ? 'graveyard' : id;
    return (s[key] || []).length;
  }

  // Same slots the prompt engine fills ({buddy}, {intention}) — mirrored
  // from src/prompt-engine.js buddyName()/intention().
  function fill(text, s) {
    var sig = s && Array.isArray(s.sigils) && s.sigils[0];
    var intent = sig && typeof sig.intention === 'string' ? sig.intention.trim() : '';
    return text
      .split('{buddy}').join(intent || 'your buddy')
      .split('{intention}').join(intent || 'the intention you cast');
  }

  // ── the once-per-visit prompt (the only proactive output) ─────────────

  var firedOnce = {};

  function fire(id) {
    if (firedOnce[id]) return;
    firedOnce[id] = true;
    var w = WORK_BY_ID[id];
    var st = state();
    if (!w || !w.prompt || !st) return;
    try {
      document.dispatchEvent(new CustomEvent('liber:prompt', {
        detail: { id: 'twelve-works-' + id, text: fill(w.prompt.text, st.get()), ts: Date.now() }
      }));
    } catch (e) { /* the room never breaks for a prompt */ }
  }

  // ── the click-generated prompt (lit segments only) ────────────────────

  var clickSalt = {};

  function generateFor(id) {
    var st = state();
    var w = WORK_BY_ID[id];
    if (!st || !w) return;
    var s = st.get();
    if (!litMap(s)[id]) return; // nothing witnessed — nothing generated

    var text = null;
    var cite = w.prompt ? w.prompt.cite : null;
    clickSalt[id] = (clickSalt[id] || 0) + 1;

    // ground it in your room: the latest artifact in this traveller's app,
    // its declared verb if one exists, and the engine's research-backed
    // templates (seeded per click, so each activation draws a new reading)
    var key = id === 'relation' ? 'relations' : id === 'trash' ? 'graveyard' : id;
    var arts = (s[key] || []);
    var last = arts.length ? arts[arts.length - 1] : null;
    var artifactId = last ? (last.id || (last.data && last.data.id)) : null;
    if (artifactId && window.Liber && window.Liber.prompts) {
      var verbRel = null;
      var rels = s.relations || [];
      for (var i = rels.length - 1; i >= 0; i--) {
        if (rels[i].from === artifactId) { verbRel = rels[i]; break; }
      }
      var rel = verbRel || { from: artifactId, verb: 'relates to' };
      var composed = null;
      try { composed = window.Liber.prompts.compose(rel, 'glyph-bar-' + clickSalt[id]); } catch (e) { composed = null; }
      if (composed && composed.text) text = composed.text;
    }
    if (!text && w.prompt && w.prompt.text) text = fill(w.prompt.text, s);
    if (!text) return;

    try {
      document.dispatchEvent(new CustomEvent('liber:prompt', {
        detail: { id: 'glyph-bar-' + id + '-' + clickSalt[id], text: text, ts: Date.now() }
      }));
    } catch (e) { /* the room never breaks for a prompt */ }

    // the traveller says it at the bar, in their own accent, citation ready
    if (tip) {
      openTip(id);
      tip.innerHTML = '<p class="tw-line tw-prompt">'
        + '<span class="tw-name">' + persona(id).name + '</span> '
        + text
        + (cite
            ? '<button type="button" class="twelve-works-fn" aria-label="citation" data-cite="' + cite + '">†</button>'
            : '')
        + '</p>';
      citeOpen = false;
      tipSig = tipSignature(id, s) + '|gen';
    }
  }

  // ── the bar + the beside-each-tier line ───────────────────────────────

  var container = null;
  var bar = null;
  var tip = null;
  var segments = {};
  var activeId = null;
  var hideTimer = null;
  var tipSig = null;
  var prevLit = null; // null until the first render — the baseline never fires

  function persona(id) { return PERSONAS[id] || {}; }

  function ariaFor(id, lit) {
    var w = WORK_BY_ID[id];
    var p = persona(id);
    if (!w) return p.name || id;
    return lit
      ? p.name + ' — ' + w.work + '. witnessed. activate for a prompt.'
      : p.name + ' — nothing witnessed yet. a suggested work waits on focus.';
  }

  function accentVars(el, id) {
    var accent = persona(id).accent || '#c8a878';
    el.style.setProperty('--wa', accent);
    el.style.setProperty('--wa-dim', accent + '44');
    el.style.setProperty('--wa-glow', accent + '66');
  }

  function buildBar() {
    container = document.createElement('div');
    container.className = 'twelve-works';
    container.id = 'twelve-works';
    container.setAttribute('role', 'group');
    container.setAttribute('aria-label', 'the twelve works — one per traveller');

    tip = document.createElement('div');
    tip.className = 'twelve-works-tip';
    tip.hidden = true;
    container.appendChild(tip);

    bar = document.createElement('div');
    bar.className = 'twelve-works-bar';
    container.appendChild(bar);

    for (var i = 0; i < ORDER.length; i++) {
      (function (id) {
        var seg = document.createElement('div');
        seg.className = 'twelve-work';
        seg.dataset.id = id;
        seg.tabIndex = 0;
        seg.setAttribute('role', 'img');
        accentVars(seg, id);
        seg.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true">' + (GLYPHS[id] || '') + '</svg>';
        seg.addEventListener('mouseenter', function () { openTip(id); });
        seg.addEventListener('mouseleave', scheduleHide);
        seg.addEventListener('focus', function () { openTip(id); });
        seg.addEventListener('focusout', function (e) {
          if (!tip || !tip.contains(e.relatedTarget)) hideTip();
        });
        seg.addEventListener('click', function () { generateFor(id); });
        seg.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); generateFor(id); }
          if (e.key === 'Escape') { hideTip(); seg.blur(); }
        });
        bar.appendChild(seg);
        segments[id] = seg;
      })(ORDER[i]);
    }

    tip.addEventListener('mouseenter', cancelHide);
    tip.addEventListener('mouseleave', scheduleHide);

    var stage = document.getElementById('desktop');
    stage.appendChild(container);
  }

  function cancelHide() {
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
  }

  function scheduleHide() {
    cancelHide();
    hideTimer = setTimeout(hideTip, 150);
  }

  function openTip(id) {
    cancelHide();
    activeId = id;
    accentVars(tip, id);
    tip.hidden = false;      // visible before measuring (hidden → width 0)
    fillTip(id);    // clamp above the bar: keep the tip inside the container's span
    var seg = segments[id];
    if (seg) {
      var left = seg.offsetLeft + seg.offsetWidth / 2 - tip.offsetWidth / 2;
      var max = container.clientWidth - tip.offsetWidth;
      tip.style.left = Math.max(0, Math.min(left, max)) + 'px';
      var anchor = seg.offsetLeft + seg.offsetWidth / 2 - parseFloat(tip.style.left);
      tip.style.setProperty('--tw-anchor', Math.max(14, Math.min(anchor, tip.offsetWidth - 14)) + 'px');
    }
  }

  function hideTip() {
    cancelHide();
    activeId = null;
    if (tip) tip.hidden = true;
  }

  // signature guard: an opened citation must survive unrelated state churn
  function tipSignature(id, s) {
    var lit = litMap(s)[id];
    return id + '|' + (lit ? '1' : '0') + '|' + (lit ? countFor(id, s) : '');
  }

  function fillTip(id) {
    var st = state();
    if (!st || !tip) return;
    var s = st.get();
    citeOpen = false;
    tipSig = tipSignature(id, s);
    var w = WORK_BY_ID[id];
    if (!w) { tip.innerHTML = ''; return; }
    var p = persona(id);
    var lit = litMap(s)[id];
    if (lit) {
      var n = countFor(id, s);
      tip.innerHTML = '<p class="tw-line">'
        + '<span class="tw-name">' + p.name + '</span> '
        + '<span class="tw-work">' + w.work + ' — witnessed.</span> '
        + '<span class="tw-count">' + n + ' made.</span>'
        + '</p>';
    } else {
      tip.innerHTML = '<p class="tw-line tw-prompt">'
        + '<span class="tw-name">' + p.name + '</span> '
        + fill(w.prompt.text, s)
        + (w.prompt.cite
            ? '<button type="button" class="twelve-works-fn" aria-label="citation" data-cite="' + w.prompt.cite + '">†</button>'
            : '')
        + '</p>';
    }
  }

  // the beside-line swaps prompt ⇄ citation in place — headroom above is finite
  var citeOpen = false;

  function showCite(id) {
    var w = WORK_BY_ID[id];
    var c = w && w.prompt && w.prompt.cite ? CITE_BY_ID[w.prompt.cite] : null;
    if (!c) return;
    var p = persona(id);
    var scope = SCOPES[c.category] || 'how far it proves the claim is not settled here.';
    tip.innerHTML = '<p class="tw-line tw-cite">'
      + '<span class="tw-name">' + p.name + '</span> '
      + c.source + ' — ' + c.topic + '. ' + scope + ' '
      + '<span class="tw-count">† returns.</span>'
      + '</p>';
    citeOpen = true;
  }

  function onTipClick(e) {
    var fn = e.target && e.target.closest ? e.target.closest('.twelve-works-fn') : null;
    if (citeOpen || (fn && fn.dataset.cite && CITE_BY_ID[fn.dataset.cite])) {
      if (citeOpen) fillTip(activeId);
      else showCite(activeId);
    }
  }

  function render() {
    var st = state();
    if (!st || !bar) return;
    var s = st.get();
    var lit = litMap(s);

    for (var i = 0; i < ORDER.length; i++) {
      var id = ORDER[i];
      var seg = segments[id];
      if (!seg) continue;
      seg.classList.toggle('lit', !!lit[id]);
      seg.setAttribute('aria-label', ariaFor(id, !!lit[id]));
    }

    // newly-lit → the traveller speaks once. The baseline render (first
    // paint of the visit) never fires: a room already full of work is
    // greeted with silence, not a chorus.
    if (prevLit) {
      for (var j = 0; j < ORDER.length; j++) {
        var id2 = ORDER[j];
        if (lit[id2] && !prevLit[id2]) fire(id2);
      }
    }
    prevLit = lit;

    if (activeId) {
      var st2 = st.get();
      if (tipSig !== tipSignature(activeId, st2)) fillTip(activeId); // content actually changed
    }
  }

  function init() {
    if (!document.getElementById('desktop')) return; // desktop-only surface
    if (!WORK_BY_ID.sigil) return;                   // data missing — stay quiet
    buildBar();
    tip.addEventListener('click', onTipClick);

    var st = state();
    if (st && st.on) st.on('change', render);
    window.addEventListener('pageshow', render); // bfcache restore: resync like constellation.js
    render();
  }

  window.Liber = window.Liber || {};
  window.Liber.twelveWorks = {
    lit: function () {
      var st = state();
      return st ? litMap(st.get()) : {};
    },
    fired: function () { return Object.keys(firedOnce); },
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
