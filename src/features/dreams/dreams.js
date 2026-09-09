// dreams.js — Insightful Inquiry's reading room. A dream journal with a
// deterministic Jungian reading engine: symbols spotted in the text with
// word-boundary matches, ordered by first appearance, composed into a hedged
// reading (the hedge is covenant — every reading opens with a voice.hedges
// line, verbatim), closed with one seeded question and a citation dagger.
// The dream text itself seeds the PRNG: the same dream always receives the
// same reading. Associations amend the saved artifact in place.
// No dependencies, no fetch, file://-safe (covenant Q.1).
//
// Registered as window.Liber.dreams = { interpret }.

(function (global) {
  'use strict';

  var DATA = (global.LIBER_DATA && global.LIBER_DATA.dreams) || null;
  var VOICE = (DATA && DATA.voice) || null;
  var SYMBOLS = (DATA && DATA.symbols) || [];
  var TEACHING = (DATA && DATA.teaching) || [];
  var SEAM = (VOICE && VOICE.seam) || ' ';

  // ── citations — facts come only from data/citations.data.js (learn.js precedent).
  // The scope lines are voice, not findings: how far each category may carry.
  var CITES = (global.LIBER_DATA && global.LIBER_DATA.citations && global.LIBER_DATA.citations.citations) || [];
  var CITE_BY_ID = {};
  for (var ci = 0; ci < CITES.length; ci++) CITE_BY_ID[CITES[ci].id] = CITES[ci];
  var CITE_SCOPES = {
    'accessible-practical': 'kept for practice, not for proof — counsel carried from the clinic and the shelf; i do not offer it as a tested result for every use made of it here.',
    'research-empirical': 'published research — it carries exactly as far as its own studies ran; past that edge this is the author\'s reading, not the authors\' finding.',
    'perennial-eastern': 'a contemplative frame — orientation, not evidence; nothing in it was measured, and it does not claim to be.',
    'hermetic-esoteric': 'a lineage source — it lends the vocabulary and the ritual form; i do not mistake it for clinical evidence.',
    'philosophical-pataphysical': 'philosophy, kept as ancestry — argument and licence for the method\'s play, not a tested claim.'
  };

  // ── xmur3 string hash + mulberry32 PRNG (pattern from src/prompt-engine.js):
  // same dream text → same seed → same picks, forever. No Math.random in
  // anything the visitor can perceive.
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

  function pick(rng, arr) {
    return arr[Math.floor(rng() * arr.length) % arr.length];
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── the symbol scan ───────────────────────────────────────────────────
  // Every keyword is matched with \b on both ends, so 'dead' does not fire
  // inside 'deadline' and 'car' does not fire inside 'care'. Multi-word
  // keywords ('following me') only match verbatim. Residual collisions are
  // same-symbol only — 'fall' and 'falling' both belong to falling, so a
  // miss there costs nothing; no cross-symbol keyword is a prefix of
  // another symbol's match surface.
  function escRe(kw) { return String(kw).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function scanSymbols(norm) {
    var hits = [];
    for (var i = 0; i < SYMBOLS.length; i++) {
      var sym = SYMBOLS[i];
      var first = -1;
      for (var k = 0; k < sym.match.length; k++) {
        var m = new RegExp('\\b' + escRe(sym.match[k]) + '\\b').exec(norm);
        if (m && (first < 0 || m.index < first)) first = m.index;
      }
      if (first >= 0) hits.push({ sym: sym, at: first });
    }
    hits.sort(function (a, b) { return a.at - b.at; });
    return hits.slice(0, 3);
  }

  // ── the reading ───────────────────────────────────────────────────────
  // A full reading, in the method's own order: hedge → the dream's floor
  // (houseLead + primary part) → the primary symbol circumambulated
  // (essence + amplification) → the compensation frame (the dream as the
  // day's counterweight) → second and third symbols joined by the voice
  // bank, each with its amplification → the numinous note when the primary
  // carries it (big dream vs little dream) → one seeded question → the
  // citation dagger. Draw order from the PRNG is fixed: hedge, houseLead,
  // compensation, one joiner per joined symbol, bigDream (if applicable),
  // questionLead, question. Deterministic — identical text in, identical
  // reading out.
  function interpret(raw) {
    if (!VOICE || !VOICE.fallback) return '';
    var norm = String(raw == null ? '' : raw).toLowerCase().replace(/\s+/g, ' ').trim();
    if (!norm) return VOICE.fallback;
    var top = scanSymbols(norm);
    if (!top.length) return VOICE.fallback;

    var rng = mulberry32(hashSeed(norm));
    var hedge = VOICE.hedges.length ? pick(rng, VOICE.hedges) : '';
    var lead = VOICE.houseLead.length ? pick(rng, VOICE.houseLead) : '';
    var primary = top[0].sym;

    var out = hedge + SEAM + lead + primary.part + '. ' + primary.essence + ' ' + primary.amplify;

    if (VOICE.compensation && VOICE.compensation.length) {
      out += SEAM + pick(rng, VOICE.compensation);
    }

    for (var j = 1; j < top.length; j++) {
      var joiner = VOICE.joiners.length ? pick(rng, VOICE.joiners) : '';
      out += SEAM + joiner + top[j].sym.name + '. ' + top[j].sym.essence;
      if (top[j].sym.amplify) out += ' ' + top[j].sym.amplify;
    }

    if (primary.numinous && VOICE.bigDream && VOICE.bigDream.length) {
      out += SEAM + pick(rng, VOICE.bigDream);
    }

    var q = primary.questions && primary.questions.length
      ? primary.questions[Math.floor(rng() * primary.questions.length) % primary.questions.length]
      : '';
    if (q) out += SEAM + (VOICE.questionLead.length ? pick(rng, VOICE.questionLead) : '') + q;
    out += ' <button type="button" class="dreams-fn" data-cite="' + esc(primary.cite) + '" aria-label="citation">†</button>';
    return out;
  }

  // ── dom ───────────────────────────────────────────────────────────────

  var ledgerEl = null, deskEl = null, readingEl = null;
  var readTitleEl = null, readDateEl = null, readTextEl = null, readBodyEl = null;
  var assocListEl = null, assocInputEl = null;
  var drawersEl = null, folioEl = null, citeEl = null;
  var currentId = null;

  function el(id) { return document.getElementById(id); }

  function state() { return (global.Liber && global.Liber.state) || null; }

  function findDream(id) {
    if (!state()) return null;
    var arr = state().get().dreams || [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] && arr[i].id === id) return arr[i];
    }
    return null;
  }

  function fmtDate(ts) {
    var d = new Date(ts || 0);
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  // the one-line preview / satchel excerpt — first 120 characters, collapsed
  function excerpt(text) {
    return String(text || '').replace(/\s+/g, ' ').trim().slice(0, 120);
  }

  function renderLedger() {
    if (!ledgerEl) return;
    var arr = (state() ? (state().get().dreams || []) : []).slice().reverse(); // newest first
    if (!arr.length) {
      ledgerEl.innerHTML = '<div class="dreams-ledger-empty">no dreams recorded yet.</div>';
      return;
    }
    var html = '';
    for (var i = 0; i < arr.length; i++) {
      var d = arr[i];
      var kept = isKept(d.id);
      var state2 = kept ? 'kept in the book' : (d.analyzed ? 'read' : 'unread');
      html += '<div class="dreams-entry-row' + (kept ? ' kept' : '') + '">'
           + '<button type="button" class="dreams-entry" data-id="' + esc(d.id) + '">'
           + '<span class="dreams-entry-title">' + (esc(d.title) || 'an unnamed dream') + '</span>'
           + '<span class="dreams-entry-date">' + fmtDate(d.ts) + ' · ' + state2 + '</span>'
           + '<span class="dreams-entry-preview">' + esc(excerpt(d.text)) + '</span>'
           + '</button>';
      if (d.analyzed && !kept) {
        html += '<button type="button" class="dreams-entry-keep" data-keep="' + esc(d.id) + '">keep to the book</button>';
      }
      html += '</div>';
    }
    ledgerEl.innerHTML = html;
  }

  function openReading(id) {
    var d = findDream(id);
    if (!d || !readBodyEl || !deskEl || !readingEl) return;
    currentId = id;
    // the reading has now had its say — the ledger may offer the book
    if (!d.analyzed && state()) state().updateArtifact('dreams', id, { analyzed: true });
    readTitleEl.textContent = d.title || 'an unnamed dream';
    readDateEl.textContent = fmtDate(d.ts);
    readTextEl.textContent = d.text || '';
    readBodyEl.innerHTML = interpret(d.text);
    renderAssoc();
    syncKeepLabel(d.id);
    syncPlantLabel(d.id);
    deskEl.hidden = true;
    readingEl.hidden = false;
    readingEl.scrollTop = 0;
    // the reading is the point — land the interpretation in view, the
    // dream text recap stays one scroll up
    var paper = readBodyEl.closest('.dreams-paper');
    if (paper) {
      requestAnimationFrame(function () {
        var top = readBodyEl.offsetTop - 8;
        if (top > 0) paper.scrollTop = Math.min(top, paper.scrollHeight);
      });
    }
  }

  function closeReading() {
    currentId = null;
    if (readingEl) readingEl.hidden = true;
    if (deskEl) deskEl.hidden = false;
    renderLedger();
  }

  // ── associations — the artifact is amended in place, never re-added ───

  function renderAssoc() {
    if (!assocListEl) return;
    var d = currentId ? findDream(currentId) : null;
    var list = (d && d.associations) || [];
    if (!list.length) {
      assocListEl.innerHTML = '<div class="dreams-assoc-empty">no associations yet.</div>';
      return;
    }
    var html = '';
    for (var i = 0; i < list.length; i++) {
      html += '<div class="dreams-assoc-item">'
           + (list[i].quote ? '<span class="dreams-assoc-quote">“' + esc(list[i].quote) + '”</span>' : '')
           + '<span class="dreams-assoc-text">' + esc(list[i].text) + '</span>'
           + '<span class="dreams-assoc-date">' + fmtDate(list[i].ts) + '</span>'
           + '<button type="button" class="dreams-assoc-remove" data-idx="' + i + '" aria-label="remove this association">release</button>'
           + '</div>';
    }
    assocListEl.innerHTML = html;
  }

  function readingSelection() {
    try {
      var sel = window.getSelection ? window.getSelection().toString() : '';
      sel = (sel || '').trim().replace(/\s+/g, ' ');
      if (sel.length > 140) sel = sel.substring(0, 137) + '...';
      var body = readBodyEl ? (readBodyEl.textContent || '') : '';
      if (sel && body.indexOf(sel.replace(/\.\.\.$/, '')) < 0) return '';
      return sel;
    } catch (e) { return ''; }
  }

  function addAssoc() {
    if (!currentId || !state() || !assocInputEl) return;
    var text = (assocInputEl.value || '').trim();
    if (!text) return;
    var d = findDream(currentId);
    if (!d) return;
    var list = d.associations ? d.associations.slice() : [];
    list.push({ text: text, ts: Date.now(), quote: readingSelection() });
    state().updateArtifact('dreams', currentId, { associations: list });
    assocInputEl.value = '';
    if (global.Liber && global.Liber.sound) global.Liber.sound.play('chime');
  }

  function removeAssoc(idx) {
    if (!currentId || !state()) return;
    var d = findDream(currentId);
    var list = d && d.associations ? d.associations.slice() : [];
    if (idx < 0 || idx >= list.length) return;
    list.splice(idx, 1);
    state().updateArtifact('dreams', currentId, { associations: list });
  }

  // ── recording — the ledger holds the dream; the book gets it later ────
  // The satchel mirror is a deliberate act: record here, read it, and keep
  // it in the book once the reading has had its say.

  function record() {
    if (!state()) return;
    var title = (el('dreams-title-input').value || '').trim();
    var text = (el('dreams-text-input').value || '').trim();
    if (!text) return;
    if (!title) title = 'an unnamed dream';
    var entry = state().addArtifact('dreams', { title: title, text: text });
    el('dreams-title-input').value = '';
    el('dreams-text-input').value = '';
    openReading(entry.id);
    if (global.Liber && global.Liber.sound) global.Liber.sound.play('chime');
  }

  function isKept(id) {
    if (!state()) return false;
    var satchel = state().get().satchel || [];
    for (var i = 0; i < satchel.length; i++) {
      if (satchel[i] && satchel[i].kind === 'dream' && satchel[i].ref === id) return true;
    }
    return false;
  }

  function keepToBook(id) {
    if (!state() || !id || isKept(id)) return;
    var d = findDream(id);
    if (!d) return;
    state().addArtifact('satchel', { kind: 'dream', ref: id, name: d.title || 'an unnamed dream', excerpt: excerpt(d.text) });
    if (global.Liber && global.Liber.sound) global.Liber.sound.play('chime');
  }

  function syncKeepLabel(id) {
    var b = el('dreams-read-keep');
    if (!b) return;
    var kept = isKept(id);
    b.textContent = kept ? 'kept in the book' : 'keep to the book';
    b.disabled = kept;
    var row = el('dreams-keep-row');
    if (row) row.hidden = !kept;
    if (kept) paintKeepAttach();
  }

  function satchelIdForDream(id) {
    if (!state()) return null;
    var satchel = state().get().satchel || [];
    for (var i = 0; i < satchel.length; i++) {
      if (satchel[i] && satchel[i].kind === 'dream' && satchel[i].ref === id) return satchel[i].id;
    }
    return null;
  }

  function removeKeep(id) {
    if (!state() || !id) return;
    var sid = satchelIdForDream(id);
    if (sid) {
      state().releaseArtifact('satchel', sid);
      state().unbindRelation(sid);
    }
    if (global.Liber && global.Liber.sound) global.Liber.sound.play('thunk');
    syncKeepLabel(id);
  }

  function paintKeepAttach() {
    var sel = el('dreams-keep-attach');
    if (!sel || !state()) return;
    if (sel.options.length > 1) return;
    var s = state().get() || {};
    var kinds = ['divination', 'games', 'learn', 'sea', 'garden', 'buddy', 'dreams'];
    for (var k = 0; k < kinds.length; k++) {
      var arr = s[kinds[k]] || [];
      for (var i = 0; i < arr.length; i++) {
        if (!arr[i] || !arr[i].id) continue;
        if (kinds[k] === 'dreams' && arr[i].id === currentId) continue;
        var label = arr[i].name || arr[i].title || arr[i].topic || arr[i].label || (arr[i].text || '').slice(0, 28) || arr[i].intention || kinds[k];
        var o = document.createElement('option');
        o.value = arr[i].id;
        o.textContent = String(label).slice(0, 30) + ' (' + kinds[k] + ')';
        sel.appendChild(o);
      }
    }
  }

  function isPlanted(id) {
    if (!state() || !id) return false;
    var bed = state().get().garden || [];
    for (var i = 0; i < bed.length; i++) {
      if (bed[i] && bed[i].dreamRef === id) return true;
    }
    return false;
  }

  function plantToGarden(id) {
    if (!state() || !id || isPlanted(id)) return;
    var d = findDream(id);
    if (!d) return;
    state().addArtifact('garden', { kind: 'seed', name: d.title || 'a seed grown from a dream', pattern: { points: [], digest: 'dream' }, bloom: null, dreamRef: id });
    if (global.Liber && global.Liber.sound) global.Liber.sound.play('chime');
    syncPlantLabel(id);
  }

  function syncPlantLabel(id) {
    var b = el('dreams-read-plant');
    if (!b) return;
    var planted = isPlanted(id);
    b.textContent = planted ? 'planted in the bed' : 'plant as a seed';
    b.disabled = planted;
  }

  // ── the folios — same grammar as the learn workbook, own classes ──────

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function buildFolios() {
    if (!drawersEl) return;
    drawersEl.innerHTML = '';
    for (var i = 0; i < TEACHING.length; i++) {
      (function (t, idx) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'dreams-drawer';
        b.dataset.idx = idx;
        b.innerHTML = '<span class="dreams-drawer-num">' + pad2(idx + 1) + '</span>'
                    + '<span class="dreams-drawer-title">' + t.title + '</span>';
        b.addEventListener('click', function () { showFolio(idx); });
        drawersEl.appendChild(b);
      })(TEACHING[i], i);
    }
  }

  function showFolio(idx) {
    if (!folioEl) return;
    var t = TEACHING[idx];
    if (!t) return;
    folioEl.innerHTML = '<div class="dreams-folio-inner">'
      + '<div class="dreams-folio-num">folio ' + pad2(idx + 1) + ' / ' + pad2(TEACHING.length) + '</div>'
      + '<div class="dreams-folio-title">' + t.title + '</div>'
      + '<div class="dreams-folio-body">' + t.body + '</div>'
      + '<div class="dreams-folio-key">' + t.key + '</div>'
      + '</div>';
    folioEl.scrollTop = 0;
    var ds = drawersEl.querySelectorAll('.dreams-drawer');
    for (var i = 0; i < ds.length; i++) {
      if (parseInt(ds[i].dataset.idx, 10) === idx) ds[i].classList.add('active');
      else ds[i].classList.remove('active');
    }
  }

  // ── the two doors ─────────────────────────────────────────────────────

  function openDoor(name) {
    var doors = document.querySelectorAll('.dreams-door');
    for (var i = 0; i < doors.length; i++) {
      if (doors[i].dataset.door === name) doors[i].classList.add('is-open');
      else doors[i].classList.remove('is-open');
    }
    var journal = el('dreams-pane-journal');
    var folios = el('dreams-pane-folios');
    if (journal) journal.hidden = (name !== 'journal');
    if (folios) folios.hidden = (name !== 'folios');
  }

  // ── the citation slip (learn.js openCite pattern, the sage's register) ─

  function openCite(id) {
    var c = CITE_BY_ID[id];
    if (!c || !citeEl) return;
    var claims = (c.claimedFor || []).join('; ');
    var scope = CITE_SCOPES[c.category] || 'how far it proves the claim is not settled here.';
    var note = c.note ? c.note.replace(/^the author's note:\s*/i, '') : '';
    el('dreams-cite-topic').textContent = 'filed — ' + c.topic;
    el('dreams-cite-body').innerHTML = ''
      + '<div class="dreams-cite-source">' + esc(c.source) + '</div>'
      + '<div class="dreams-cite-what">the reading rests this on it for: ' + esc(claims) + '.</div>'
      + '<div class="dreams-cite-scope">' + scope + '</div>'
      + (note ? '<div class="dreams-cite-note">margin note: ' + esc(note) + '</div>' : '');
    citeEl.classList.add('open');
    citeEl.removeAttribute('inert');
  }

  function closeCite() {
    if (!citeEl) return;
    citeEl.classList.remove('open');
    citeEl.setAttribute('inert', '');
  }

  // ── init ──────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', function () {
    ledgerEl = el('dreams-ledger');
    deskEl = el('dreams-desk');
    readingEl = el('dreams-reading');
    readTitleEl = el('dreams-read-title');
    readDateEl = el('dreams-read-date');
    readTextEl = el('dreams-read-text');
    readBodyEl = el('dreams-read-body');
    assocListEl = el('dreams-assoc-list');
    assocInputEl = el('dreams-assoc-input');
    drawersEl = el('dreams-drawers');
    folioEl = el('dreams-folio');
    citeEl = el('dreams-cite');

    function openRiason() {
      var r = el('dreams-raison');
      if (r) { r.classList.add('open'); r.removeAttribute('inert'); }
    }
    function closeRiason() {
      var r = el('dreams-raison');
      if (r) { r.classList.remove('open'); r.setAttribute('inert', ''); }
    }

    renderLedger();
    buildFolios();

    var form = el('dreams-record');
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); record(); });
    var dreamText = el('dreams-text-input');
    if (dreamText) dreamText.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); record(); }
    });

    if (ledgerEl) ledgerEl.addEventListener('click', function (e) {
      var keep = e.target.closest ? e.target.closest('.dreams-entry-keep') : null;
      if (keep && keep.dataset.keep) { keepToBook(keep.dataset.keep); return; }
      var b = e.target.closest ? e.target.closest('.dreams-entry') : null;
      if (b && b.dataset.id) openReading(b.dataset.id);
    });

    // the reading's own keep action — same mirror, one deliberate click
    var readKeep = el('dreams-read-keep');
    if (readKeep) readKeep.addEventListener('click', function () { keepToBook(currentId); });
    var keepDel = el('dreams-keep-delete');
    if (keepDel) keepDel.addEventListener('click', function () { removeKeep(currentId); });
    var keepAttach = el('dreams-keep-attach');
    if (keepAttach) keepAttach.addEventListener('change', function () {
      var target = keepAttach.value;
      if (!target || !currentId || !state()) return;
      var sid = satchelIdForDream(currentId) || currentId;
      try { state().unbindRelation(sid, target); } catch (e) {}
      state().bindRelation(sid, 'attached', target);
      if (global.Liber && global.Liber.sound) global.Liber.sound.play('chime');
      keepAttach.value = '';
    });
    var readPlant = el('dreams-read-plant');
    if (readPlant) readPlant.addEventListener('click', function () { plantToGarden(currentId); });

    var back = el('dreams-back');
    if (back) back.addEventListener('click', closeReading);

    var assocForm = el('dreams-assoc-form');
    if (assocForm) assocForm.addEventListener('submit', function (e) { e.preventDefault(); addAssoc(); });
    var assocBox = el('dreams-assoc-input');
    if (assocBox) assocBox.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); addAssoc(); }
    });
    if (assocListEl) assocListEl.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.dreams-assoc-remove') : null;
      if (b) removeAssoc(parseInt(b.dataset.idx, 10));
    });

    var doors = document.querySelectorAll('.dreams-door');
    for (var i = 0; i < doors.length; i++) {
      (function (d) { d.addEventListener('click', function () { openDoor(d.dataset.door); }); })(doors[i]);
    }

    // footnote daggers — in the reading and in the folios, one delegation
    var app = document.querySelector('.dreams-app');
    if (app) app.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('.dreams-fn') : null;
      if (t && t.dataset.cite) openCite(t.dataset.cite);
    });

    var citeClose = el('dreams-cite-close');
    if (citeClose) citeClose.addEventListener('click', closeCite);
    if (citeEl) citeEl.addEventListener('click', function (e) { if (e.target === citeEl) closeCite(); });

    var exit = el('dreams-exit');
    if (exit) exit.addEventListener('click', function () {
      if (history.length > 1) history.back(); else location.href = 'desktop.html';
    });

    var helpBtn = el('dreams-help');
    var riasonClose = el('dreams-raison-close');
    var riasonEl = el('dreams-raison');
    if (helpBtn) helpBtn.addEventListener('click', openRiason);
    if (riasonClose) riasonClose.addEventListener('click', closeRiason);
    if (riasonEl) riasonEl.addEventListener('click', function (e) { if (e.target === riasonEl) closeRiason(); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeCite(); closeRiason(); }
    });

    // the ledger and the open association list follow the state —
    // records, amended associations, and the bfcache re-sync all land here
    if (state()) state().on('change', function () {
      renderLedger();
      if (currentId) {
        if (!findDream(currentId)) closeReading();
        else { renderAssoc(); syncKeepLabel(currentId); syncPlantLabel(currentId); }
      }
    });
  });

  global.Liber = global.Liber || {};
  global.Liber.dreams = { interpret: interpret };
})(window);
