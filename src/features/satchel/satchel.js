// satchel.js — Riason's filing cabinet. Three drawers (buddies, artifacts,
// knots) on the left third; the note page on the right two thirds with a
// large persistent editor and a dock of pens. Marks (ink colours,
// highlighter + attached notes) persist per item. No shared imports.

(function () {
  var list = document.getElementById('satchel-list');
  var drawers = document.getElementById('satchel-drawers');
  var titleEl = document.getElementById('satchel-note-title');
  var dateEl = document.getElementById('satchel-note-date');
  var intentEl = document.getElementById('satchel-intention');
  var editor = document.getElementById('satchel-editor');
  var toolsEl = document.getElementById('satchel-tools');
  var polaroid = document.getElementById('satchel-polaroid');
  var pop = document.getElementById('satchel-pop');
  var popText = document.getElementById('satchel-pop-text');
  var popNote = document.getElementById('satchel-pop-note');
  var exit = document.getElementById('satchel-exit');

  function st() { return (window.Liber && window.Liber.state) || null; }
  function getS() { return (st() && st().get()) || {}; }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function fmtDate(ts) {
    if (!ts) return '— —';
    var d = new Date(ts);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  }

  // artifact kinds gathered under the artifacts drawer (old shapes and
  // methods included so earlier saves still open).
  var KINDS = [
    { kind: 'divination', label: 'cards', get: function (s) { return s.divination || []; }, name: function (a) { return a.name || 'a card'; } },
    { kind: 'games', label: 'games', get: function (s) { return s.games || []; }, name: function (a) { return a.name || 'a game'; } },
    { kind: 'learn', label: 'lessons', get: function (s) { return s.learn || []; }, name: function (a) { return a.topic || 'a lesson'; } },
    { kind: 'abstract', label: 'shapes', get: function (s) { return s.abstract || []; }, name: function (a) { return a.label || 'a shape'; } },
    { kind: 'sea', label: 'releases', get: function (s) { return s.sea || []; }, name: function (a) { return (a.text || 'a release').slice(0, 60); } },
    { kind: 'garden', label: 'seeds', get: function (s) { return s.garden || []; }, name: function (a) { return a.name || 'a seed'; } },
    { kind: 'dreams', label: 'dreams', get: function (s) { return s.dreams || []; }, name: function (a) { return a.title || 'a dream'; } },
    { kind: 'methodology', label: 'methods', get: function (s) { return s.methodology || []; }, name: function (a) { return a.topic || a.name || 'a method'; } },
    { kind: 'satchel', label: 'kept in satchel', get: function (s) { return s.satchel || []; }, name: function (a) { return a.name || a.text || a.excerpt || a.kind || 'kept'; } }
  ];

  function getSigs() {
    var s = getS();
    return ((s.buddy || []).filter(function (e) { return e && e.kind === 'stone'; }));
  }
  function getSealed() {
    var s = getS();
    return ((s.buddy || []).filter(function (e) { return !e || e.kind !== 'stone'; }));
  }

  function artifactById(id) {
    var s = getS();
    for (var i = 0; i < KINDS.length; i++) {
      var arr = KINDS[i].get(s);
      for (var j = 0; j < arr.length; j++) {
        if (arr[j] && arr[j].id === id) return { kind: KINDS[i].kind, data: arr[j] };
      }
    }
    var stones = getSigs();
    for (var k = 0; k < stones.length; k++) {
      if (stones[k] && stones[k].id === id) return { kind: 'stone', data: stones[k] };
    }
    return null;
  }

  function bodyOf(type, d) {
    d = d || {};
    if (type === 'stone') return d.intention || '(no intention recorded)';
    if (type === 'sea') return d.text || '';
    if (type === 'buddy') return d.confession || d.intention || d.name || '';
    if (type === 'dreams') return ((d.title ? d.title + ' — ' : '') + (d.text || '')).trim();
    if (type === 'divination') return [d.question, d.reading, d.name].filter(Boolean).join(' — ');
    if (type === 'games') return (d.result && d.result.lines) || d.result || d.name || '';
    if (type === 'garden') return d.name || '';
    if (type === 'learn') return d.topic || '';
    if (type === 'abstract') return d.label || '';
    if (type === 'methodology') return d.topic || d.name || '';
    if (type === 'satchel') return d.text || d.excerpt || d.name || d.kind || '';
    if (type === 'relation') return '';
    return d.name || d.title || d.text || '';
  }

  var tab = 'buddy';
  var current = null; // { tab, type, id, idx }
  var saveTimer = null;

  // ── pens ──────────────────────────────────────────────────────────────

  var PENS = [
    { id: 'hl', name: 'highlighter', hl: true, color: '#f0dc5a' },
    { id: 'red', name: 'red', color: '#b03030' },
    { id: 'blue', name: 'blue', color: '#2a5aaa' },
    { id: 'green', name: 'green', color: '#2a7a3a' },
    { id: 'violet', name: 'violet', color: '#7a3aaa' }
  ];
  var activePen = null;

  function penSvg(p) {
    if (p.hl) {
      return '<svg width="26" height="44" viewBox="0 0 26 44" aria-hidden="true">'
        + '<path d="M8 2h10v22H8z" fill="' + p.color + '" stroke="#5a4a10"/>'
        + '<path d="M8 24h10l-5 8z" fill="#e8e0c8" stroke="#5a4a10"/>'
        + '<path d="M11 32h4v10h-4z" fill="#3a2a10"/></svg>';
    }
    return '<svg width="22" height="46" viewBox="0 0 22 46" aria-hidden="true">'
      + '<path d="M7 2h8v26H7z" fill="' + p.color + '" stroke="#2a1a08"/>'
      + '<path d="M7 28h8l-4 9z" fill="#e0c9a0" stroke="#2a1a08"/>'
      + '<path d="M10 37h2l-1 4z" fill="#2a2a2a"/></svg>';
  }

  function buildTools() {
    if (!toolsEl) return;
    toolsEl.innerHTML = '';
    PENS.forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'satchel-pen';
      b.setAttribute('aria-label', p.name);
      b.setAttribute('aria-pressed', 'false');
      b.innerHTML = penSvg(p) + '<span class="satchel-pen-name">' + p.name + '</span>';
      b.addEventListener('click', function () {
        if (activePen === p.id) { setPen(null); return; }
        setPen(p.id);
        applyPenToSelection();
      });
      toolsEl.appendChild(b);
    });
  }

  function setPen(id) {
    activePen = id;
    var btns = toolsEl ? toolsEl.querySelectorAll('.satchel-pen') : [];
    for (var i = 0; i < btns.length; i++) {
      var on = PENS[i] && PENS[i].id === id;
      btns[i].classList.toggle('active', !!on);
      btns[i].setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }

  function penById(id) {
    for (var i = 0; i < PENS.length; i++) if (PENS[i].id === id) return PENS[i];
    return null;
  }

  function currentRange() {
    try {
      var sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return null;
      var r = sel.getRangeAt(0);
      if (!editor.contains(r.commonAncestorContainer)) return null;
      return r;
    } catch (e) { return null; }
  }

  // wrap the range in a mark span; extractContents fallback covers ranges
  // that split text nodes (surroundContents would throw).
  function wrapRange(range, pen) {
    if (!range || range.collapsed) return null;
    var span = document.createElement('span');
    span.className = 'smark' + (pen.hl ? ' smark-hl' : '');
    if (pen.hl) span.setAttribute('data-hl', '1');
    else span.setAttribute('data-c', pen.color);
    span.style.color = pen.hl ? '' : pen.color;
    try {
      range.surroundContents(span);
    } catch (e) {
      try {
        span.appendChild(range.extractContents());
        range.insertNode(span);
      } catch (e2) { return null; }
    }
    return span;
  }

  function applyPenToSelection() {
    var pen = penById(activePen);
    if (!pen || !current) { if (!current) setPen(null); return; }
    var sp = wrapRange(currentRange(), pen);
    if (sp) scheduleSave(false);
    else setPen(null);
  }

  // ── lists ─────────────────────────────────────────────────────────────

  function itemLabel(type, d) {
    if (type === 'stone') return (d.intention || '(no intention)').substring(0, 60);
    if (type === 'relation') return 'a knot';
    return String(d.name || d.title || d.topic || d.label || (d.text || '').slice(0, 60) || type).substring(0, 60);
  }

  function metaOf(type, d) {
    if (type === 'stone') return (d.element || 'earth') + (d.ts ? ' · ' + fmtDate(d.ts) : '');
    if (type === 'relation') return (d.verb || 'relates to') + ' → ' + ((d.to || 'buddy') === 'buddy' ? 'the buddy' : 'an artifact');
    return type + (d.ts ? ' · ' + fmtDate(d.ts) : '');
  }

  function collect(tabName) {
    var s = getS();
    if (tabName === 'buddy') {
      var out = [];
      var stones = getSigs();
      for (var i = 0; i < stones.length; i++) out.push({ type: 'stone', id: stones[i].id, idx: i, data: stones[i] });
      var sealed = getSealed();
      for (var j = 0; j < sealed.length; j++) out.push({ type: 'buddy', id: sealed[j].id, data: sealed[j] });
      return out;
    }
    if (tabName === 'relations') {
      var rels = s.relations || [];
      var list = [];
      for (var r = 0; r < rels.length; r++) list.push({ type: 'relation', id: rels[r].from, data: rels[r] });
      return list;
    }
    var arts = [];
    for (var k = 0; k < KINDS.length; k++) {
      var arr = KINDS[k].get(s);
      for (var m = 0; m < arr.length; m++) arts.push({ type: KINDS[k].kind, id: arr[m].id, data: arr[m] });
    }
    return arts;
  }

  function hasMarks(d) {
    return !!(d && ((d.marks && d.marks.length) || d.annotation || d.satchelNote || d.note));
  }

  function renderTabs() {
    if (!drawers) return;
    var btns = drawers.querySelectorAll('.satchel-tab');
    for (var i = 0; i < btns.length; i++) {
      var on = btns[i].getAttribute('data-tab') === tab;
      btns[i].setAttribute('aria-selected', on ? 'true' : 'false');
    }
  }

  function renderList() {
    if (!list) return;
    renderTabs();
    var items = collect(tab);
    var html = '';
    if (!items.length) {
      var hint = tab === 'buddy' ? 'make a buddy first.' : (tab === 'relations' ? 'bind an artifact on the desktop first.' : 'save something first.');
      list.innerHTML = '<div class="satchel-empty">the drawer is empty.<br/>' + hint + '</div>';
      return;
    }
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var dot = hasMarks(it.data) ? '<span class="satchel-ann-dot" aria-hidden="true">✎</span>' : '';
      var cur = (current && current.type === it.type && current.id === it.id) ? ' current' : '';
      html += '<div class="satchel-list-item' + cur + '" data-type="' + esc(it.type) + '" data-id="' + esc(it.id || '') + '" data-i="' + (it.idx == null ? '' : it.idx) + '">'
            + dot + esc(itemLabel(it.type, it.data))
            + '<div class="meta">' + esc(metaOf(it.type, it.data)) + '</div></div>';
    }
    list.innerHTML = html;
    var rows = list.querySelectorAll('.satchel-list-item');
    for (var m = 0; m < rows.length; m++) {
      rows[m].addEventListener('click', function () {
        openNote(tab, this.getAttribute('data-type'), this.getAttribute('data-id'), this.getAttribute('data-i'));
      });
    }
  }

  // ── the note page ─────────────────────────────────────────────────────

  function resolveItem(type, id, idx) {
    if (type === 'stone') {
      var stones = getSigs();
      var si = -1;
      for (var a = 0; a < stones.length; a++) { if (stones[a].id === id) { si = a; break; } }
      if (si < 0 && idx !== '' && idx != null) si = parseInt(idx, 10);
      if (si < 0 || !stones[si]) return null;
      return { type: 'stone', id: stones[si].id, idx: si, data: stones[si] };
    }
    if (type === 'relation') {
      var rels = getS().relations || [];
      for (var r = 0; r < rels.length; r++) {
        if (rels[r].from === id) return { type: 'relation', id: id, data: rels[r] };
      }
      return null;
    }
    var hit = artifactById(id);
    if (!hit) return null;
    return { type: hit.kind, id: id, data: hit.data };
  }

  function baseTextOf(item) {
    var d = item.data;
    return (d && (d.annotation || d.satchelNote || d.note)) || '';
  }

  // rebuild the editor from stored {text, marks}; marks outside the text
  // are dropped (offsets invalidated by edits never resurrect).
  function paintEditor(text, marks) {
    if (!editor) return;
    editor.innerHTML = '';
    text = String(text || '');
    marks = (marks || []).slice().sort(function (a, b) { return a.s - b.s; });
    var pos = 0;
    function addText(t) { if (t) editor.appendChild(document.createTextNode(t)); }
    for (var i = 0; i < marks.length; i++) {
      var m = marks[i];
      if (m == null || m.s < pos || m.e > text.length || m.e <= m.s) continue;
      addText(text.slice(pos, m.s));
      var span = document.createElement('span');
      span.className = 'smark' + (m.h ? ' smark-hl' : '');
      if (m.h) span.setAttribute('data-hl', '1');
      else span.setAttribute('data-c', m.c || '');
      if (!m.h && m.c) span.style.color = m.c;
      if (m.note) span.setAttribute('data-note', m.note);
      span.textContent = text.slice(m.s, m.e);
      editor.appendChild(span);
      pos = m.e;
    }
    addText(text.slice(pos));
  }

  // derive {text, marks} from the live DOM; spans carry their own data.
  function readEditor() {
    if (!editor) return { text: '', marks: [] };
    var text = '';
    var marks = [];
    function walk(node) {
      if (node.nodeType === 3) {
        text += node.nodeValue;
        return;
      }
      if (node.nodeType !== 1) return;
      if (node.classList && node.classList.contains('smark')) {
        var start = text.length;
        var note = node.getAttribute('data-note') || '';
        var hl = node.getAttribute('data-hl') === '1';
        var c = node.getAttribute('data-c') || '';
        for (var i = 0; i < node.childNodes.length; i++) walk(node.childNodes[i]);
        if (text.length > start) marks.push({ s: start, e: text.length, c: c, h: hl ? 1 : 0, note: note });
        return;
      }
      if (node.tagName === 'BR') { text += '\n'; return; }
      for (var j = 0; j < node.childNodes.length; j++) walk(node.childNodes[j]);
      if (node.tagName === 'DIV' || node.tagName === 'P') text += '\n';
    }
    for (var k = 0; k < editor.childNodes.length; k++) walk(editor.childNodes[k]);
    return { text: text.replace(/\n+$/, ''), marks: marks };
  }

  function titleOf(item) {
    var d = item.data;
    if (item.type === 'stone') return 'a buddy · ' + (d.element || 'earth');
    if (item.type === 'relation') return 'a knot · ' + (d.verb || 'relates to');
    if (item.type === 'buddy') return 'a sealed chat';
    return String(d.name || d.title || d.topic || d.label || item.type || 'kept').substring(0, 40);
  }

  function openNote(tabName, type, id, idx) {
    var item = resolveItem(type, id, idx);
    if (!item) return;
    tab = tabName;
    current = { tab: tab, type: item.type, id: item.id, idx: item.idx };
    hidePop();
    if (titleEl) titleEl.textContent = titleOf(item);
    if (dateEl) dateEl.textContent = item.data.ts ? fmtDate(item.data.ts) : '— —';
    if (intentEl) intentEl.textContent = bodyOf(item.type, item.data);
    if (polaroid) {
      if (item.data.shot) { polaroid.src = item.data.shot; polaroid.hidden = false; }
      else { polaroid.removeAttribute('src'); polaroid.hidden = true; }
    }
    paintEditor(baseTextOf(item), item.data.marks);
    renderList();
  }

  function persist(chime) {
    if (!st() || !current) return;
    var got = readEditor();
    var item = resolveItem(current.type, current.id, current.idx);
    if (!item) return;
    if (current.type === 'stone') {
      var s = getS();
      var stones = getSigs();
      var sealed = getSealed();
      if (item.idx >= 0 && stones[item.idx]) {
        stones[item.idx] = Object.assign({}, stones[item.idx], { annotation: got.text, marks: got.marks });
        st().set({ buddy: stones.concat(sealed) });
      }
    } else if (current.type === 'relation') {
      var rels = (getS().relations || []).slice();
      for (var r = 0; r < rels.length; r++) {
        if (rels[r].from === current.id) rels[r] = Object.assign({}, rels[r], { note: got.text, marks: got.marks });
      }
      st().set({ relations: rels });
    } else {
      if (st().updateArtifact) st().updateArtifact(current.type, current.id, { annotation: got.text, satchelNote: got.text, marks: got.marks });
    }
    if (chime && window.Liber && window.Liber.sound) { try { window.Liber.sound.play('chime'); } catch (e) {} }
  }

  function scheduleSave(chime) {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { saveTimer = null; persist(!!chime); renderList(); }, chime ? 0 : 800);
  }

  // ── highlight popover ─────────────────────────────────────────────────

  var popMark = null;

  function hidePop() {
    if (pop) pop.hidden = true;
    popMark = null;
  }

  function showPop(span, x, y) {
    if (!pop || !span) return;
    popMark = span;
    if (popText) popText.textContent = span.textContent;
    if (popNote) popNote.value = span.getAttribute('data-note') || '';
    pop.hidden = false;
    var cab = document.getElementById('satchel-cabinet');
    var cr = cab ? cab.getBoundingClientRect() : { left: 0, top: 0 };
    pop.style.left = Math.max(8, Math.min(x - cr.left - 110, (cr.width || 300) - 230)) + 'px';
    pop.style.top = Math.max(8, (y - cr.top) + 14) + 'px';
    if (popNote) popNote.focus();
  }

  function wirePop() {
    var save = document.getElementById('satchel-pop-save');
    var clear = document.getElementById('satchel-pop-clear');
    var close = document.getElementById('satchel-pop-close');
    if (save) save.addEventListener('click', function () {
      if (popMark && popNote) {
        if (popNote.value.trim()) popMark.setAttribute('data-note', popNote.value.trim());
        else popMark.removeAttribute('data-note');
        scheduleSave(false);
      }
      hidePop();
    });
    if (clear) clear.addEventListener('click', function () {
      if (popMark) {
        var parent = popMark.parentNode;
        while (popMark.firstChild) parent.insertBefore(popMark.firstChild, popMark);
        parent.removeChild(popMark);
        scheduleSave(false);
      }
      hidePop();
    });
    if (close) close.addEventListener('click', hidePop);
  }

  // ── boot ──────────────────────────────────────────────────────────────

  function openHash() {
    try {
      var h = (location.hash || '').replace(/^#/, '');
      if (!h) return;
      var hit = artifactById(h);
      if (hit) {
        var stones = getSigs();
        var isStone = hit.kind === 'stone';
        openNote(isStone ? 'buddy' : 'artifacts', hit.kind, h, null);
        return;
      }
      var rels = getS().relations || [];
      for (var i = 0; i < rels.length; i++) {
        if (rels[i].from === h) { openNote('relations', 'relation', h, null); break; }
      }
    } catch (e) {}
  }

  document.addEventListener('DOMContentLoaded', function () {
    buildTools();
    renderList();

    var tabs = drawers ? drawers.querySelectorAll('.satchel-tab') : [];
    for (var t = 0; t < tabs.length; t++) {
      tabs[t].addEventListener('click', function () {
        if (current) persist(true);
        hidePop();
        tab = this.getAttribute('data-tab');
        current = null;
        if (titleEl) titleEl.textContent = '— — —';
        if (dateEl) dateEl.textContent = '— —';
        if (intentEl) intentEl.textContent = '';
        if (polaroid) { polaroid.removeAttribute('src'); polaroid.hidden = true; }
        if (editor) editor.innerHTML = '';
        renderList();
      });
    }

    if (editor) {
      editor.addEventListener('input', function () { scheduleSave(false); });
      editor.addEventListener('blur', function () { if (current) persist(true); });
      editor.addEventListener('click', function (e) {
        var hl = e.target && e.target.closest ? e.target.closest('.smark-hl') : null;
        if (hl && editor.contains(hl)) showPop(hl, e.clientX, e.clientY);
        else hidePop();
      });
      editor.addEventListener('keydown', function (e) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); persist(true); }
      });
    }
    wirePop();

    if (exit) exit.addEventListener('click', function () {
      try { if (current) persist(true); } catch (e) {}
      if (history.length > 1) history.back(); else location.href = 'desktop.html';
    });

    var helpBtn = document.getElementById('satchel-help');
    var raison = document.getElementById('satchel-raison');
    var raisonClose = document.getElementById('satchel-raison-close');
    function openRaison() {
      if (raison) { raison.classList.add('open'); raison.removeAttribute('inert'); }
    }
    function closeRaison() {
      if (raison) { raison.classList.remove('open'); raison.setAttribute('inert', ''); }
    }
    if (helpBtn) helpBtn.addEventListener('click', openRaison);
    if (raisonClose) raisonClose.addEventListener('click', closeRaison);
    if (raison) raison.addEventListener('click', function (e) { if (e.target === raison) closeRaison(); });
    if (window.LiberRoomShell) window.LiberRoomShell.bindRoomOverlays({ overlays: [
      { id: 'satchel-raison', close: closeRaison }
    ] });
    if (st()) st().on('change', function () { renderList(); });
    window.addEventListener('hashchange', openHash);
    openHash();
  });
})();
