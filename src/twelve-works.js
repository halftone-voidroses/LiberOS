// twelve-works.js — the twelve works (desktop.html only). No bar: each
// work lives in its bezel carving. A carving lights in its traveller's
// accent when you first make something in their app; the travellers
// witnessed it. Unlit carvings suggest a research-backed art-therapy
// prompt on hover/focus (docs/gamification.md mechanic 3, reskinned as
// lore); lit carvings show the work line + count, and clicking one
// GENERATES a research-backed prompt from your own room — the traveller's
// prompt bank grounded in your latest artifact here, its declared verb,
// and your buddy's intention (src/prompt-engine.js compose, seeded per
// click). Everything is hover-gated or click-called — no popups, no XP,
// no guilt (docs/gamification.md anti-goals).
// Derived only: reads state, writes nothing. Newly-lit carvings fire their
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

  // Bezel carving → witnessed work. Each pairing is documented where it
  // comes from: ruby's thread and inquiry's compass are named in the
  // personas cast note; learn/hole-punch and relation/grate in the
  // carvings' own theme comments; the rest are material rhymes
  // (stone↔stone room, candle↔sea, bell↔buddy, bulb↔games marquee,
  // tower↔cards, nib↔ledger binds, glyph↔ghost room, hook↔burials).
  var CARVING_WORK = {
    stone: 'sigil', thread: 'garden', candle: 'sea', bell: 'buddy',
    glyph: 'abstract', bulb: 'games', 'tower-rev': 'divination',
    'hole-punch': 'learn', nib: 'relation', compass: 'dreams',
    grate: 'methodology', hook: 'trash'
  };

  function state() {
    return (window.Liber && window.Liber.state) ? window.Liber.state : null;
  }
  function stoneOf(list) { return (list || []).filter(function (e) { return e && e.kind === 'stone'; }); }
  function sealedOf(list) { return (list || []).filter(function (e) { return !e || e.kind !== 'stone'; }); }

  // ── lit states (derived only — no state writes anywhere here) ─────────

  function litMap(s) {
    return {
      sigil: stoneOf(s.buddy).length > 0,
      garden: (s.garden || []).length > 0,
      sea: (s.sea || []).length > 0,
      buddy: sealedOf(s.buddy).length > 0,
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
    if (id === 'sigil') return stoneOf(s.buddy).length;
    if (id === 'buddy') return sealedOf(s.buddy).length;
    var key = id === 'relation' ? 'relations' : id === 'trash' ? 'graveyard' : id;
    return (s[key] || []).length;
  }

  // Same slots the prompt engine fills ({buddy}, {intention}) — mirrored
  // from src/prompt-engine.js buddyName()/intention().
  function fill(text, s) {
    var sig = stoneOf(s && s.buddy)[0];
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

    // the traveller says it at the carving, in their own accent, citation ready
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

  // ── the carvings + the beside-each-tier line ────────────────────────

  var tip = null;
  var segments = {};
  var activeId = null;
  var hideTimer = null;
  var tipSig = null;
  var prevLit = null; // null until the first render — the baseline never fires
  var bound = false;

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

  // The works live in the bezel carvings now (user request — the top bar
  // is gone). Same twelve, same tiers, same prompts; only the scholar's
  // shelf moved onto the machine's skin. carvings.js renders first
  // (earlier script tag); retry a few frames in case it hasn't.
  function bindCarvings(tries) {
    tries = tries == null ? 30 : tries;
    var found = false;
    for (var carving in CARVING_WORK) {
      if (!Object.prototype.hasOwnProperty.call(CARVING_WORK, carving)) continue;
      var id = CARVING_WORK[carving];
      var el = document.querySelector('.carving[data-id="' + carving + '"]');
      if (!el) continue;
      found = true;
      (function (workId, node) {
        node.classList.add('has-work');
        node.tabIndex = 0;
        node.setAttribute('role', 'button');
        accentVars(node, workId);
        node.addEventListener('mouseenter', function () { openTip(workId); });
        node.addEventListener('mouseleave', scheduleHide);
        node.addEventListener('focus', function () { openTip(workId); });
        node.addEventListener('focusout', function (e) {
          if (!tip || !tip.contains(e.relatedTarget)) hideTip();
        });
        node.addEventListener('click', function () { generateFor(workId); });
        node.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); generateFor(workId); }
          if (e.key === 'Escape') { hideTip(); node.blur(); }
        });
        segments[workId] = node;
      })(id, el);
    }
    if (!found && tries > 0) {
      requestAnimationFrame(function () { bindCarvings(tries - 1); });
      return;
    }
    tip = document.createElement('div');
    tip.className = 'twelve-works-tip';
    tip.hidden = true;
    tip.addEventListener('click', onTipClick);
    document.body.appendChild(tip);
    bound = true;
    render();
  }

  function cancelHide() {
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
  }

  function scheduleHide() {
    cancelHide();
    hideTimer = setTimeout(hideTip, 150);
  }

  function openTip(id) {
    if (!tip) return;
    cancelHide();
    activeId = id;
    accentVars(tip, id);
    tip.hidden = false;      // visible before measuring (hidden → width 0)
    tip.classList.remove('above');
    fillTip(id);
    // anchor beside the carving: below it when it sits high, above it when
    // it sits low; clamped to the viewport with room to spare.
    var node = segments[id];
    if (node) {
      var r = node.getBoundingClientRect();
      var tw = tip.offsetWidth, th = tip.offsetHeight;
      var cx = r.left + r.width / 2;
      var left = Math.max(12, Math.min(cx - tw / 2, window.innerWidth - tw - 12));
      var top = r.bottom + 10;
      if (top + th > window.innerHeight - 12) {
        top = Math.max(12, r.top - th - 10);
        tip.classList.add('above');
      }
      tip.style.left = left + 'px';
      tip.style.top = top + 'px';
      var anchor = Math.max(14, Math.min(cx - left, tw - 14));
      tip.style.setProperty('--tw-anchor', anchor + 'px');
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
    if (!st || !bound) return;
    var s = st.get();
    var lit = litMap(s);

    for (var i = 0; i < ORDER.length; i++) {
      var id = ORDER[i];
      var seg = segments[id];
      if (!seg) continue;
      seg.classList.toggle('tw-lit', !!lit[id]);
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
    bindCarvings();

    var st = state();
    if (st && st.on) st.on('change', render);
    window.addEventListener('pageshow', render); // bfcache restore: resync like constellation.js
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
