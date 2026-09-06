// satchel.js — The Mad Scribe's archive. No shared imports (covenant Q.1).

(function () {
  var entry = document.getElementById('satchel-entry');
  var list = document.getElementById('satchel-list');
  var app = document.querySelector('.satchel-app');
  var back = document.getElementById('satchel-back-contents');
  var exit = document.getElementById('satchel-exit');

  function getSigs() {
    var s = (window.Liber && window.Liber.state && window.Liber.state.get()) || {};
    return s.sigils || [];
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

  var currentIdx = -1;
  var elementFilter = 'all';

  function saveAnn() {
    var st = (window.Liber && window.Liber.state) || null;
    var annEl = document.getElementById('satchel-annotation');
    if (!st || !annEl || currentIdx < 0) return;
    var sigs = (st.get().sigils || []).slice();
    if (!sigs[currentIdx]) return;
    sigs[currentIdx] = Object.assign({}, sigs[currentIdx], { annotation: annEl.textContent });
    st.set({ sigils: sigs });
    if (window.Liber && window.Liber.sound) window.Liber.sound.play('chime');
  }

  function renderList() {
    var sigs = getSigs();
    if (sigs.length === 0) {
      list.innerHTML = '<div class="satchel-empty">the satchel is empty.<br/>a buddy must first be cast.</div>';
      return;
    }
    var elements = [];
    for (var e = 0; e < sigs.length; e++) {
      var elName = sigs[e].element || 'earth';
      if (elements.indexOf(elName) < 0) elements.push(elName);
    }
    var html = '<div class="satchel-filters" role="group" aria-label="filter by element">';
    html += '<button type="button" class="satchel-filter' + (elementFilter === 'all' ? ' on' : '') + '" data-el="all">all</button>';
    for (var f = 0; f < elements.length; f++) {
      html += '<button type="button" class="satchel-filter' + (elementFilter === elements[f] ? ' on' : '') + '" data-el="' + elements[f] + '">' + elements[f] + '</button>';
    }
    html += '</div>';
    for (var i = 0; i < sigs.length; i++) {
      var sig = sigs[i];
      if (elementFilter !== 'all' && (sig.element || 'earth') !== elementFilter) continue;
      var date = sig.ts ? fmtDate(sig.ts) : '—';
      var intention = (sig.intention || '(no intention)').substring(0, 60);
      var mark = sig.annotation ? '<span class="satchel-ann-dot" aria-hidden="true">✎</span>' : '';
      html += '<div class="satchel-list-item" data-i="' + i + '">'
            +   mark + intention
            +   '<div class="meta">' + (sig.element || 'earth') + ' · ' + date + '</div>'
            + '</div>';
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
    for (var j = 0; j < items.length; j++) {
      items[j].addEventListener('click', (function (idx) {
        return function () { showEntry(idx); };
      })(j));
    }
  }

  function showEntry(i) {
    var sigs = getSigs();
    var sig = sigs[i];
    if (!sig) return;
    currentIdx = i;
    app.classList.add('on-entry');
    var title = entry.querySelector('.satchel-entry-title');
    var date  = entry.querySelector('.satchel-entry-date');
    var body  = entry.querySelector('.satchel-intention');
    var tag   = entry.querySelector('.satchel-element-tag');
    var see   = document.getElementById('satchel-see-list');
    var pn    = document.getElementById('satchel-pageno');
    var ann   = document.getElementById('satchel-annotation');

    title.textContent = 'mark ' + (i + 1);
    date.textContent  = sig.ts ? fmtDate(sig.ts) : '—';
    body.textContent  = sig.intention || '(no intention recorded)';
    tag.textContent   = sig.element || 'earth';
    pn.textContent    = '— ' + romanize(i + 2) + ' —';
    ann.textContent   = sig.annotation || '';

    var related = [];
    for (var k = 0; k < sigs.length; k++) {
      if (k !== i && sigs[k].element === sig.element) {
        related.push('mark ' + (k + 1));
      }
    }
    see.textContent = related.length ? related.join(', ') : '— none yet —';
  }

  function hideEntry() {
    currentIdx = -1;
    app.classList.remove('on-entry');
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderList();
    if (back) back.addEventListener('click', hideEntry);
    var annBox = document.getElementById('satchel-annotation');
    if (annBox) annBox.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); saveAnn(); }
    });
    if (exit) exit.addEventListener('click', function () {
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
  });
})();
