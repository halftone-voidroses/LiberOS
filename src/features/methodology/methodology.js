// methodology.js — Riason. Click a step to highlight it. No shared imports (covenant Q.1).

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

  document.addEventListener('DOMContentLoaded', function () {
    buildRubric();
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
