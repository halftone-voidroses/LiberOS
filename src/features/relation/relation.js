// relation.js — the ledger of the knots. Every declared relation is kept
// here: artifact → verb → the buddy, ordered by binding. Verbs can be
// re-worded inline (unbind + re-bind through state.js, original binding
// date preserved); a relation can be released; unbound artifacts are
// named so the web can grow. No shared imports (covenant Q.1).

(function () {
  var ledgerEl = document.getElementById('relation-ledger');
  var summaryEl = document.getElementById('relation-summary');
  var unboundEl = document.getElementById('relation-unbound');

  // same artifact kinds the desktop constellation gathers — the ledger
  // must agree with the web it describes.
  var KINDS = [
    { kind: 'buddy',     chip: 'a sealed exchange', label: function (a) { return a.name || a.intention || 'a sealed exchange'; } },
    { kind: 'divination', chip: 'a card',    label: function (a) { return a.name; } },
    { kind: 'games',      chip: 'a game',    label: function (a) { return a.name; } },
    { kind: 'learn',      chip: 'a lesson',  label: function (a) { return a.topic; } },
    { kind: 'abstract',   chip: 'a shape',   label: function (a) { return a.label || 'a shape'; } },
    { kind: 'sea',        chip: 'a release', label: function (a) { return a.text || 'a release'; } },
    { kind: 'garden',     chip: 'a seed',    label: function (a) { return a.name || 'a planted seed'; } },
    { kind: 'dreams',     chip: 'a dream',   label: function (a) { return a.title || 'a recorded dream'; } }
  ];

  function fullText(kind, a) {
    a = a || {};
    if (kind === 'sea') return a.text || '';
    if (kind === 'buddy') return a.confession || a.intention || a.name || '';
    if (kind === 'dreams') return ((a.title ? a.title + ' — ' : '') + (a.text || a.dream || '')).trim();
    if (kind === 'divination') return [a.question, a.reading, a.name].filter(Boolean).join(' — ');
    if (kind === 'games') return a.result || a.name || '';
    if (kind === 'garden') return a.name || '';
    if (kind === 'learn') return a.topic || '';
    if (kind === 'abstract') return a.label || '';
    return '';
  }

  var MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  function getState() {
    return (window.Liber && window.Liber.state && window.Liber.state.get()) || {};
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function allArtifacts() {
    var s = getState();
    var all = [];
    for (var i = 0; i < KINDS.length; i++) {
      var arr = s[KINDS[i].kind] || [];
      for (var j = 0; j < arr.length; j++) {
        if (!arr[j].id) continue;
        all.push({ kind: KINDS[i].kind, chip: KINDS[i].chip, label: KINDS[i].label(arr[j]) || KINDS[i].chip, data: arr[j] });
      }
    }
    return all;
  }

  function fmtDate(ts) {
    if (!ts) return 'long ago';
    var d = new Date(ts);
    return d.getDate() + ' ' + MONTHS[d.getMonth()];
  }

  function verbOf(rel) {
    var v = String(rel.verb || '').trim();
    return v || 'relates to';
  }

  function artifactName(fromId, artifacts) {
    for (var i = 0; i < artifacts.length; i++) {
      if (artifacts[i].data.id === fromId) return { name: artifacts[i].label, chip: artifacts[i].chip, kind: artifacts[i].kind, data: artifacts[i].data };
    }
    return null;
  }

  function render() {
    if (!ledgerEl || !summaryEl || !unboundEl) return;
    var s = getState();
    var artifacts = allArtifacts();
    var relations = (s.relations || []).slice().sort(function (a, b) { return (a.ts || 0) - (b.ts || 0); });

    var boundIds = {};
    for (var i = 0; i < relations.length; i++) boundIds[relations[i].from] = true;

    var boundCount = 0;
    for (var j = 0; j < artifacts.length; j++) {
      if (boundIds[artifacts[j].data.id]) boundCount++;
    }

    var verbs = [];
    for (var v = 0; v < relations.length; v++) {
      var verb = verbOf(relations[v]);
      if (verbs.indexOf(verb) < 0) verbs.push(verb);
    }

    // ── summary: the web counted, in the room's own voice ──
    var html = '<div class="relation-summary-line">' + boundCount + ' of ' + artifacts.length
             + ' artifact' + (artifacts.length === 1 ? '' : 's') + ' carry a declared relation.</div>';
    html += '<div class="relation-summary-line">'
          + (verbs.length
              ? 'the vocabulary of the web: ' + verbs.map(esc).join(' · ') + '.'
              : 'the web has no verbs yet.')
          + '</div>';
    if (relations.length) {
      html += '<div class="relation-summary-line">oldest knot: ' + esc(verbOf(relations[0])) + ' — ' + fmtDate(relations[0].ts)
            + '. newest: ' + esc(verbOf(relations[relations.length - 1])) + ' — ' + fmtDate(relations[relations.length - 1].ts) + '.</div>';
    } else {
      html += '<div class="relation-summary-line">the first knot is yours to tie.</div>';
    }
    summaryEl.innerHTML = html;

    // ── the ledger itself ──
    if (artifacts.length === 0) {
      ledgerEl.innerHTML = '<div class="relation-empty">nothing saved yet.<br/><em>make a buddy, save something, then bind it here.</em></div>';
      unboundEl.innerHTML = '';
      return;
    }
    if (relations.length === 0) {
      ledgerEl.innerHTML = '<div class="relation-empty">— no knots yet —<br/><em>every artifact waits outside the ring. touch one on the desktop and say how it holds the buddy.</em></div>';
    } else {
      var rows = '';
      for (var r = 0; r < relations.length; r++) {
        var rel = relations[r];
        var art = artifactName(rel.from, artifacts);
        var name = art ? art.name : 'an artifact released';
        var chip = art ? art.chip : 'gone';
        var toId = rel.to || 'buddy';
        var toArt = toId === 'buddy' ? null : artifactName(toId, artifacts);
        var toName = toId === 'buddy' ? 'the buddy' : (toArt ? toArt.name : 'an artifact');
        rows += '<div class="relation-row" data-from="' + esc(rel.from) + '" data-to="' + esc(toId) + '">'
              +   '<div class="relation-row-main">'
              +     '<span class="relation-row-artifact">' + esc(name) + '</span>'
              +     '<span class="relation-row-chip">' + esc(chip) + '</span>'
              +   '</div>'
              +   '<div class="relation-row-text">' + esc(fullText(art ? art.kind : '', art ? art.data : null)) + '</div>'
              +   '<div class="relation-row-knot">'
              +     '<span class="relation-row-ring" aria-hidden="true">—o—</span>'
              +     '<input class="relation-verb-input" list="verb-families" value="' + esc(verbOf(rel)) + '" aria-label="re-word the verb" spellcheck="false"/>'
              +     '<span class="relation-row-ring" aria-hidden="true">o—</span>'
              +     '<span class="relation-row-to">' + esc(toName) + '</span>'
              +   '</div>'
              +   '<div class="relation-row-foot">'
              +     '<span class="relation-row-date">bound ' + fmtDate(rel.ts) + '</span>'
              +     '<button class="relation-release" type="button" data-from="' + esc(rel.from) + '" data-to="' + esc(toId) + '">release the ring</button>'
              +   '</div>'
              + '</div>';
      }
      ledgerEl.innerHTML = rows;
      wireRows();
    }

    // ── the pointer: what the web could still hold ──
    var unbound = [];
    for (var u = 0; u < artifacts.length; u++) {
      if (!boundIds[artifacts[u].data.id]) unbound.push(artifacts[u]);
    }
    if (unbound.length === 0) {
      unboundEl.innerHTML = '<div class="relation-unbound-head">— the web is complete —</div>'
                          + '<div class="relation-unbound-list">every artifact carries its knot. make more, and the rings will wait.</div>';
    } else {
      var names = [];
      for (var n = 0; n < unbound.length; n++) {
        names.push('<span class="relation-unbound-item">' + esc(unbound[n].label) + ' <em>' + esc(unbound[n].chip) + '</em></span>');
      }
      unboundEl.innerHTML = '<div class="relation-unbound-head">— still unbound —</div>'
                          + '<div class="relation-unbound-list">' + names.join(' ') + '</div>'
                          + '<div class="relation-unbound-hint">touch one on the desktop and say how it holds the buddy.</div>';
    }
  }

  function wireRows() {
    var inputs = ledgerEl.querySelectorAll('.relation-verb-input');
    for (var i = 0; i < inputs.length; i++) {
      (function (inp) {
        inp.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') { e.preventDefault(); inp.blur(); }
        });
        inp.addEventListener('blur', function () { commitVerb(inp); });
      })(inputs[i]);
    }
    var releases = ledgerEl.querySelectorAll('.relation-release');
    for (var r = 0; r < releases.length; r++) {
      releases[r].addEventListener('click', function () {
        if (!window.Liber || !window.Liber.state) return;
        var btn = this;
        var row = btn.closest ? btn.closest('.relation-row') : null;
        if (row) row.classList.add('cracking');
        if (window.Liber.sound) window.Liber.sound.play('thunk');
        setTimeout(function () {
          var to = btn.getAttribute('data-to') || undefined;
          if (to && to !== 'buddy') window.Liber.state.unbindRelation(btn.getAttribute('data-from'), to);
          else if (to === 'buddy') window.Liber.state.unbindRelation(btn.getAttribute('data-from'), 'buddy');
          else window.Liber.state.unbindRelation(btn.getAttribute('data-from'));
          render();
        }, 320);
      });
    }
  }

  // re-wording: unbind, re-bind with the new verb, then hand the knot its
  // original binding date back — the knot's age is part of the record.
  function commitVerb(inp) {
    if (!window.Liber || !window.Liber.state) return;
    var row = inp.closest('.relation-row');
    if (!row) return;
    var from = row.getAttribute('data-from');
    var to = row.getAttribute('data-to') || 'buddy';
    var fresh = String(inp.value || '').trim();
    var relations = getState().relations || [];
    var rel = null;
    for (var i = 0; i < relations.length; i++) {
      if (relations[i].from === from && (relations[i].to || 'buddy') === to) { rel = relations[i]; break; }
    }
    if (!rel) { render(); return; }
    var current = verbOf(rel);
    if (!fresh || fresh === current) { inp.value = current; render(); return; }

    var boundTs = rel.ts;
    window.Liber.state.unbindRelation(from, to);
    var made = window.Liber.state.bindRelation(from, fresh, to);
    if (made && boundTs && made.ts !== boundTs) {
      var all = getState().relations || [];
      var patched = [];
      for (var p = 0; p < all.length; p++) {
        if (all[p].from === from && (all[p].to || 'buddy') === to && all[p].ts === made.ts) {
          patched.push(Object.assign({}, all[p], { ts: boundTs }));
        } else {
          patched.push(all[p]);
        }
      }
      window.Liber.state.set({ relations: patched });
    }
    if (window.Liber.sound) window.Liber.sound.play('chime');
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    render();
    if (window.Liber && window.Liber.state) {
      window.Liber.state.on('change', render);
    }

    var helpBtn = document.getElementById('relation-help');
    var exit = document.getElementById('relation-exit');
    if (exit) exit.addEventListener('click', function () {
      if (history.length > 1) history.back(); else location.href = 'desktop.html';
    });
    var riason = document.getElementById('relation-raison');
    var riasonClose = document.getElementById('relation-raison-close');
    function openRiason() {
      if (riason) { riason.classList.add('open'); riason.removeAttribute('inert'); }
    }
    function closeRiason() {
      if (riason) { riason.classList.remove('open'); riason.setAttribute('inert', ''); }
    }
    if (helpBtn) helpBtn.addEventListener('click', openRiason);
    if (riasonClose) riasonClose.addEventListener('click', closeRiason);
    if (riason) riason.addEventListener('click', function (e) { if (e.target === riason) closeRiason(); });
  });

  window.addEventListener('pageshow', function () { render(); });
})();
