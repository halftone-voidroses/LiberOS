// relation.js — The constellation. Force-laid out nodes, pink lines.
// No shared imports (covenant Q.1).

(function () {
  var svg = document.getElementById('relation-svg');
  var empty = document.getElementById('relation-empty');
  var counts = document.getElementById('relation-counts');

  function getState() {
    return (window.Liber && window.Liber.state && window.Liber.state.get()) || {};
  }

  function positionNodes(items, cx, cy, rx, ry) {
    var pos = [];
    for (var i = 0; i < items.length; i++) {
      var a = (i / items.length) * Math.PI * 2 - Math.PI / 2;
      pos.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry });
    }
    return pos;
  }

  function render() {
    if (!svg) return;
    var s = getState();
    var sigils = s.sigils || [];
    var cohort = s.cohort || [];

    if (counts) counts.textContent = sigils.length + ' sigils · ' + cohort.length + ' cohort';

    if (sigils.length === 0 && cohort.length === 0) {
      if (empty) empty.style.display = '';
      svg.innerHTML = '';
      return;
    }
    if (empty) empty.style.display = 'none';

    var W = 600, H = 380;
    var cx = W / 2, cy = H / 2;
    var sigilR = Math.min(W, H) * 0.32;
    var cohortR = sigilR * 0.55;
    var sigilPos = positionNodes(sigils, cx, cy, sigilR, sigilR * 0.65);
    var cohortPos = positionNodes(cohort, cx, cy, cohortR, cohortR * 0.6);

    var html = '';

    for (var i = 0; i < sigils.length; i++) {
      for (var k = 0; k < cohort.length; k++) {
        var sameElement = (cohort[k].name || '').indexOf(sigils[i].element) !== -1;
        if (sameElement) {
          html += '<line x1="' + sigilPos[i].x + '" y1="' + sigilPos[i].y + '" x2="' + cohortPos[k].x + '" y2="' + cohortPos[k].y + '" stroke="rgba(255,105,180,0.4)" stroke-width="0.8" stroke-dasharray="3 4"/>';
        }
      }
    }

    for (var j = 0; j < sigils.length; j++) {
      var p = sigilPos[j];
      html += '<circle cx="' + p.x + '" cy="' + p.y + '" r="8" fill="rgba(255,105,180,0.7)" stroke="#fff" stroke-width="0.5"/>';
      html += '<text x="' + p.x + '" y="' + (p.y + 18) + '" text-anchor="middle" fill="#d8a0c0" font-size="9" font-family="serif" font-style="italic">sigil ' + (j + 1) + '</text>';
    }

    for (var m = 0; m < cohort.length; m++) {
      var q = cohortPos[m];
      html += '<circle cx="' + q.x + '" cy="' + q.y + '" r="5" fill="rgba(212,175,106,0.7)" stroke="#fff" stroke-width="0.3"/>';
      var name = (cohort[m].name || '').substring(0, 14);
      html += '<text x="' + q.x + '" y="' + (q.y - 10) + '" text-anchor="middle" fill="#c8b890" font-size="7" font-family="serif" font-style="italic">' + name + '</text>';
    }

    html += '<text x="' + cx + '" y="20" text-anchor="middle" fill="rgba(168,160,192,0.3)" font-size="6" font-family="serif" font-style="italic">— ' + (sigils.length + cohort.length) + ' nodes, ' + (sigils.length * cohort.length) + ' possible edges —</text>';

    svg.innerHTML = html;
  }

  document.addEventListener('DOMContentLoaded', function () {
    render();

    var helpBtn = document.getElementById('relation-help');
    var exit = document.getElementById('relation-exit');
    if (exit) exit.addEventListener('click', function () {
      if (history.length > 1) history.back(); else location.href = 'desktop.html';
    });
    var raison = document.getElementById('relation-raison');
    var raisonClose = document.getElementById('relation-raison-close');
    function openRaison() {
      if (raison) { raison.classList.add('open'); raison.setAttribute('aria-hidden', 'false'); }
    }
    function closeRaison() {
      if (raison) { raison.classList.remove('open'); raison.setAttribute('aria-hidden', 'true'); }
    }
    if (helpBtn) helpBtn.addEventListener('click', openRaison);
    if (raisonClose) raisonClose.addEventListener('click', closeRaison);
    if (raison) raison.addEventListener('click', function (e) { if (e.target === raison) closeRaison(); });
  });
})();
