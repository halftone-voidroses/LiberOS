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

  function renderList() {
    var sigs = getSigs();
    if (sigs.length === 0) {
      list.innerHTML = '<div class="satchel-empty">the satchel is empty.<br/>a sigil must first be etched.</div>';
      return;
    }
    var html = '';
    for (var i = 0; i < sigs.length; i++) {
      var sig = sigs[i];
      var date = sig.ts ? fmtDate(sig.ts) : '—';
      var intention = (sig.intention || '(no intention)').substring(0, 60);
      html += '<div class="satchel-list-item" data-i="' + i + '">'
            +   intention
            +   '<div class="meta">' + (sig.element || 'earth') + ' · ' + date + '</div>'
            + '</div>';
    }
    list.innerHTML = html;

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
    app.classList.remove('on-entry');
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderList();
    if (back) back.addEventListener('click', hideEntry);
    if (exit) exit.addEventListener('click', function () {
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
  });
})();
