(function () {
  var entry = document.getElementById('satchel-entry');
  var list = document.getElementById('satchel-list');
  var app = document.querySelector('.satchel-app');
  var back = document.getElementById('satchel-back-contents');
  var exit = document.getElementById('satchel-exit');

  function st() { return (window.Liber && window.Liber.state) || null; }
  function getS() { return (st() && st().get()) || {}; }

  function getSigs() {
    var s = getS();
    return ((s.buddy || []).filter(function (e) { return e && e.kind === 'stone'; }));
  }

  function fmtDate(ts) {
    var d = new Date(ts);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  }

  function romanize(n) {
    var map = [['M',1000],['CM',900],['D',500],['CD',400],['C',100],['XC',90],['L',50],['XL',40],['X',10],['IX',9],['V',5],['IV',4],['I',1]];
    var s = '';
    for (var i = 0; i < map.length; i++) {
      while (n >= map[i][1]) { s += map[i][0]; n -= map[i][1]; }
    }
    return s || 'I';
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  var KINDS = [
    { kind: 'buddy', label: 'sealed exchanges', get: function (s) { return (s.buddy || []).filter(function (e) { return !e || e.kind !== 'stone'; }); }, name: function (a) { return a.name || a.intention || 'sealed words'; } },
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

  function noteOf(a) { return (a && (a.annotation || a.satchelNote || a.note)) || ''; }
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

  var current = null;
  var elementFilter = 'all';

  function saveCurrentNote() {
    if (!st() || !current) return;
    var annEl = document.getElementById('satchel-annotation');
    var text = annEl ? annEl.textContent : '';
    if (current.type === 'stone') {
      var s = getS();
      var all = s.buddy || [];
      var stones = all.filter(function (e) { return e && e.kind === 'stone'; });
      var sealed = all.filter(function (e) { return !e || e.kind !== 'stone'; });
      var idx = -1;
      for (var i = 0; i < stones.length; i++) {
        if (stones[i].id === current.id) { idx = i; break; }
      }
      if (idx < 0 && typeof current.idx === 'number') idx = current.idx;
      if (idx >= 0 && stones[idx]) {
        stones[idx] = Object.assign({}, stones[idx], { annotation: text });
        st().set({ buddy: stones.concat(sealed) });
      }
    } else if (current.type === 'relation') {
      if (st().setRelationNote) st().setRelationNote(current.id, text);
      else {
        var rels = (getS().relations || []).slice();
        for (var r = 0; r < rels.length; r++) {
          if (rels[r].from === current.id) rels[r] = Object.assign({}, rels[r], { note: text });
        }
        st().set({ relations: rels });
      }
    } else {
      if (st().updateArtifact) st().updateArtifact(current.type, current.id, { annotation: text, satchelNote: text });
    }
    if (window.Liber && window.Liber.sound) { try { window.Liber.sound.play('chime'); } catch (e) {} }
  }

  function renderList() {
    var s = getS();
    var sigs = getSigs();
    var relations = s.relations || [];
    var html = '';
    var totalArtifacts = 0;
    for (var ci = 0; ci < KINDS.length; ci++) totalArtifacts += KINDS[ci].get(s).length;
    html += '<div class="satchel-netline">' + sigs.length + ' sigil' + (sigs.length === 1 ? '' : 's') + ' · ' + totalArtifacts + ' artifacts · ' + relations.length + ' knots</div>';

    if (sigs.length === 0 && totalArtifacts === 0) {
      list.innerHTML = html + '<div class="satchel-empty">the satchel is empty.<br/>make a buddy first.</div>';
      return;
    }

    if (sigs.length) {
      var elements = [];
      for (var e = 0; e < sigs.length; e++) {
        var elName = sigs[e].element || 'earth';
        if (elements.indexOf(elName) < 0) elements.push(elName);
      }
      html += '<div class="satchel-sect">sigils</div>';
      html += '<div class="satchel-filters" role="group" aria-label="filter by element">';
      html += '<button type="button" class="satchel-filter' + (elementFilter === 'all' ? ' on' : '') + '" data-el="all">all</button>';
      for (var f = 0; f < elements.length; f++) {
        html += '<button type="button" class="satchel-filter' + (elementFilter === elements[f] ? ' on' : '') + '" data-el="' + esc(elements[f]) + '">' + esc(elements[f]) + '</button>';
      }
      html += '</div>';
      for (var i = 0; i < sigs.length; i++) {
        var sig = sigs[i];
        if (elementFilter !== 'all' && (sig.element || 'earth') !== elementFilter) continue;
        var date = sig.ts ? fmtDate(sig.ts) : '—';
        var intention = (sig.intention || '(no intention)').substring(0, 60);
        var tags = Array.isArray(sig.tags) && sig.tags.length ? ' · ' + sig.tags.join(', ') : '';
        var mark = noteOf(sig) ? '<span class="satchel-ann-dot" aria-hidden="true">✎</span>' : '';
        html += '<div class="satchel-list-item" data-type="stone" data-id="' + esc(sig.id || '') + '" data-i="' + i + '">'
              +   mark + esc(intention)
              +   '<div class="meta">' + esc(sig.element || 'earth') + ' · ' + esc(date) + esc(tags) + '</div>'
              + '</div>';
      }
    }

    for (var k = 0; k < KINDS.length; k++) {
      var arr = KINDS[k].get(s);
      if (!arr.length) continue;
      html += '<div class="satchel-sect">' + esc(KINDS[k].label) + '</div>';
      for (var j = 0; j < arr.length; j++) {
        var a = arr[j];
        var nm = '';
        try { nm = KINDS[k].name(a) || ''; } catch (e2) { nm = ''; }
        nm = String(nm).substring(0, 70);
        var dt = a.ts ? fmtDate(a.ts) : '';
        var nn = noteOf(a) ? '<span class="satchel-ann-dot" aria-hidden="true">✎</span>' : '';
        html += '<div class="satchel-list-item" data-type="' + esc(KINDS[k].kind) + '" data-id="' + esc(a.id || '') + '">'
              + nn + esc(nm)
              + '<div class="meta">' + esc(KINDS[k].kind) + (dt ? ' · ' + esc(dt) : '') + '</div>'
              + '</div>';
      }
    }

    if (relations.length) {
      html += '<div class="satchel-sect">knots</div>';
      for (var r = 0; r < relations.length; r++) {
        var rel = relations[r];
        var found = artifactById(rel.from);
        var aname = found ? String(found.data.name || found.data.title || found.data.topic || found.data.intention || found.data.label || found.data.text || 'an artifact').substring(0, 60) : 'an artifact released';
        var toName = (rel.to || 'buddy') === 'buddy' ? 'the buddy' : 'an artifact';
        if ((rel.to || 'buddy') !== 'buddy') {
          var tof = artifactById(rel.to);
          if (tof) toName = String(tof.data.name || tof.data.title || tof.data.topic || tof.data.label || 'an artifact').substring(0, 40);
        }
        var rmark = rel.note ? '<span class="satchel-ann-dot" aria-hidden="true">✎</span>' : '';
        html += '<div class="satchel-list-item" data-type="relation" data-id="' + esc(rel.from) + '">'
              + rmark + esc(aname)
              + '<div class="meta">' + esc(rel.verb || 'relates to') + ' → ' + esc(toName) + '</div>'
              + '</div>';
      }
    }

    list.innerHTML = html;

    var filters = list.querySelectorAll('.satchel-filter');
    for (var q = 0; q < filters.length; q++) {
      filters[q].addEventListener('click', function () {
        elementFilter = this.getAttribute('data-el');
        renderList();
      });
    }
    var items = list.querySelectorAll('.satchel-list-item');
    for (var m = 0; m < items.length; m++) {
      items[m].addEventListener('click', function () {
        openEntry(this.getAttribute('data-type'), this.getAttribute('data-id'), this.getAttribute('data-i'));
      });
    }
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

  function openEntry(type, id, idx) {
    var title = entry.querySelector('.satchel-entry-title');
    var date = entry.querySelector('.satchel-entry-date');
    var body = entry.querySelector('.satchel-intention');
    var tag = entry.querySelector('.satchel-element-tag');
    var see = document.getElementById('satchel-see-list');
    var pn = document.getElementById('satchel-pageno');
    var ann = document.getElementById('satchel-annotation');
    var found = null, relFound = null;

    if (type === 'stone') {
      var sigs = getSigs();
      var si = -1;
      if (id) {
        for (var a = 0; a < sigs.length; a++) { if (sigs[a].id === id) { si = a; break; } }
      }
      if (si < 0 && idx !== null && idx !== '') si = parseInt(idx, 10);
      if (si < 0 || !sigs[si]) return;
      found = sigs[si];
      current = { type: 'stone', id: found.id, idx: si };
      title.textContent = 'mark ' + (si + 1);
      date.textContent = found.ts ? fmtDate(found.ts) : '—';
      body.textContent = found.intention || '(no intention recorded)';
      tag.textContent = (found.element || 'earth') + (Array.isArray(found.tags) && found.tags.length ? ' · ' + found.tags.join(', ') : '');
      pn.textContent = '— ' + romanize(si + 2) + ' —';
      ann.textContent = noteOf(found) || '';
      var related = [];
      for (var k = 0; k < sigs.length; k++) {
        if (k !== si && sigs[k].element === found.element) related.push('mark ' + (k + 1));
      }
      see.textContent = related.length ? related.join(', ') : '— none yet —';
    } else if (type === 'relation') {
      var rels = getS().relations || [];
      for (var ri = 0; ri < rels.length; ri++) {
        if (rels[ri].from === id) { relFound = rels[ri]; break; }
      }
      if (!relFound) return;
      var art = artifactById(relFound.from);
      var anm = art ? (art.data.name || art.data.title || art.data.topic || art.data.intention || art.data.label || art.data.text || 'an artifact') : 'an artifact released';
      current = { type: 'relation', id: relFound.from };
      title.textContent = 'a knot';
      date.textContent = relFound.ts ? fmtDate(relFound.ts) : '—';
      body.textContent = String(anm).substring(0, 300) + ' — ' + (relFound.verb || 'relates to') + ' → ' + ((relFound.to || 'buddy') === 'buddy' ? 'the buddy' : 'an artifact');
      tag.textContent = 'knot';
      pn.textContent = '— † —';
      ann.textContent = relFound.note || '';
      see.textContent = '— the web holds it —';
    } else {
      var hit = artifactById(id);
      if (!hit) return;
      found = hit.data;
      current = { type: hit.kind, id: found.id };
      title.textContent = String((hit.data.name || hit.data.title || hit.data.topic || hit.kind) || '').substring(0, 40) || 'kept';
      date.textContent = found.ts ? fmtDate(found.ts) : '—';
      body.textContent = bodyOf(hit.kind, found) || '(no words kept)';
      var t2 = found.element || hit.kind;
      if (found.kind === 'note') t2 = 'note';
      tag.textContent = t2;
      pn.textContent = '— ✎ —';
      ann.textContent = noteOf(found) || '';
      see.textContent = '— kept in the book —';
    }
    app.classList.add('on-entry');
    if (ann) ann.focus();
  }

  function hideEntry() {
    if (current && document.getElementById('satchel-annotation')) {
      try { saveCurrentNote(); } catch (e) {}
    }
    current = null;
    app.classList.remove('on-entry');
  }

  function openHash() {
    try {
      var h = (location.hash || '').replace(/^#/, '');
      if (!h) return;
      var hit = artifactById(h);
      if (hit) openEntry(hit.kind === 'stone' ? 'stone' : hit.kind, h, null);
      else {
        var rels = getS().relations || [];
        for (var i = 0; i < rels.length; i++) {
          if (rels[i].from === h) { openEntry('relation', h, null); break; }
        }
      }
    } catch (e) {}
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderList();
    openHash();
    if (back) back.addEventListener('click', hideEntry);
    var annBox = document.getElementById('satchel-annotation');
    if (annBox) annBox.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); saveCurrentNote(); }
    });
    if (annBox) annBox.addEventListener('blur', function () {
      if (current) saveCurrentNote();
    });
    if (exit) exit.addEventListener('click', function () {
      try { if (current) saveCurrentNote(); } catch (e) {}
      if (history.length > 1) history.back(); else location.href = 'desktop.html';
    });

    var helpBtn = document.getElementById('satchel-help');
    var riason = document.getElementById('satchel-raison');
    var riasonClose = document.getElementById('satchel-raison-close');
    function openRiason() {
      if (riason) { riason.classList.add('open'); riason.removeAttribute('inert'); }
    }
    function closeRiason() {
      if (riason) { riason.classList.remove('open'); riason.setAttribute('inert', ''); }
    }
    if (helpBtn) helpBtn.addEventListener('click', openRiason);
    if (riasonClose) riasonClose.addEventListener('click', closeRiason);
    if (riason) riason.addEventListener('click', function (e) { if (e.target === riason) closeRiason(); });
    if (st()) st().on('change', function () { renderList(); });
    window.addEventListener('hashchange', openHash);
  });
})();
