// methodology.js — raison. Click a step to highlight it. No shared imports (covenant Q.1).

(function () {
  function buildRubric() {
    var sides = ['method-rubric-left', 'method-rubric-right'];
    for (var i = 0; i < sides.length; i++) {
      var el = document.getElementById(sides[i]);
      if (!el) continue;
      var html = '';
      for (var n = 1; n <= 14; n++) {
        html += '<div style="position:absolute;top:' + (n * 6 + 4) + 'px;left:50%;transform:translateX(-50%);width:5px;height:1px;background:rgba(170,48,48,0.4)"></div>';
      }
      el.innerHTML = html;
    }
  }

  // WS6 — citation facts come only from citations.data.js; standing lines are voice, not findings.
  var CITES = (window.LIBER_DATA && window.LIBER_DATA.citations && window.LIBER_DATA.citations.citations) || [];
  var CITE_BY_ID = {};
  for (var ci = 0; ci < CITES.length; ci++) CITE_BY_ID[CITES[ci].id] = CITES[ci];
  var CITE_STANDING = {
    'accessible-practical': 'a source of practice, not of trials — it warrants the use as taught method, no further.',
    'research-empirical': 'it warrants the use precisely where its own studies ran; beyond them the folio argues, it does not report.',
    'perennial-eastern': 'a contemplative frame — it orients the step; it demonstrates nothing, and does not try.',
    'hermetic-esoteric': 'a lineage source — it furnishes the form of the step, not its proof.',
    'philosophical-pataphysical': 'an ancestral source — it licenses the step as the method\'s play, not as findings.'
  };

  function openCite(id, num) {
    var c = CITE_BY_ID[id];
    var panel = document.getElementById('method-cite');
    if (!c || !panel) return;
    var claims = (c.claimedFor || []).join('; ');
    var standing = CITE_STANDING[c.category] || 'how far it proves the claim is not settled here.';
    var note = c.note ? c.note.replace(/^the author's note:\s*/i, '') : '';
    document.getElementById('method-cite-topic').textContent = 'footnote ' + num + ' — ' + c.topic;
    document.getElementById('method-cite-body').innerHTML = ''
      + '<div class="method-cite-source">' + c.source + '</div>'
      + '<div class="method-cite-what">the step calls on it for: ' + claims + '.</div>'
      + '<div class="method-cite-standing">' + standing + '</div>'
      + (note ? '<div class="method-cite-note">sealed margin: ' + note + '</div>' : '');
    panel.classList.add('open');
    panel.removeAttribute('inert');
  }

  function closeCite() {
    var panel = document.getElementById('method-cite');
    if (!panel) return;
    panel.classList.remove('open');
    panel.setAttribute('inert', '');
  }

  document.addEventListener('DOMContentLoaded', function () {
    buildRubric();

    var fns = document.querySelectorAll('.method-fn');
    for (var f = 0; f < fns.length; f++) {
      fns[f].textContent = String(f + 1);
      fns[f].dataset.n = String(f + 1);
    }
    document.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('.method-fn') : null;
      if (t && t.dataset.cite) openCite(t.dataset.cite, t.dataset.n);
    });
    var citeClose = document.getElementById('method-cite-close');
    if (citeClose) citeClose.addEventListener('click', closeCite);
    var citeEl = document.getElementById('method-cite');
    if (citeEl) citeEl.addEventListener('click', function (e) { if (e.target === citeEl) closeCite(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCite(); });

    var steps = document.querySelectorAll('.method-step');
    for (var i = 0; i < steps.length; i++) {
      steps[i].addEventListener('click', (function (s) {
        return function () {
          for (var k = 0; k < steps.length; k++) steps[k].classList.remove('active');
          s.classList.add('active');
        };
      })(steps[i]));
    }

    var helpBtn = document.getElementById('methodology-help');
    var exit = document.getElementById('methodology-exit');
    if (exit) exit.addEventListener('click', function () {
      if (history.length > 1) history.back(); else location.href = 'desktop.html';
    });
    var raison = document.getElementById('methodology-raison');
    var raisonClose = document.getElementById('methodology-raison-close');
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
