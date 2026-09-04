// sea.js — Vanir's deep. No shared imports (covenant Q.1).

(function () {
  var fill = document.getElementById('sea-gauge-fill');
  var deep = document.querySelector('.sea-deep');
  var breath = document.getElementById('sea-breath');
  var depth = 0;
  var target = 0;
  var lastMove = Date.now();

  function loop() {
    var sinceMove = Date.now() - lastMove;
    if (sinceMove < 4000) {
      target = Math.min(target + 0.0008, 1.0);
    } else {
      target = Math.max(target - 0.0005, 0.2);
    }
    depth += (target - depth) * 0.04;
    if (fill) fill.style.height = (depth * 100) + '%';
    requestAnimationFrame(loop);
  }

  function onMove() { lastMove = Date.now(); }

  if (deep) deep.addEventListener('mousemove', onMove);
  if (breath) breath.addEventListener('mouseenter', onMove);

  document.addEventListener('DOMContentLoaded', function () {
    requestAnimationFrame(loop);

    var exit = document.getElementById('sea-exit');
    if (exit) exit.addEventListener('click', function () {
      if (history.length > 1) history.back(); else location.href = 'desktop.html';
    });

    var helpBtn = document.getElementById('sea-help');
    var raison = document.getElementById('sea-raison');
    var raisonClose = document.getElementById('sea-raison-close');
    function openRaison() {
      if (raison) { raison.classList.add('open'); raison.setAttribute('aria-hidden', 'false'); }
    }
    function closeRaison() {
      if (raison) { raison.classList.remove('open'); raison.setAttribute('aria-hidden', 'true'); }
    }
    if (helpBtn) helpBtn.addEventListener('click', openRaison);
    if (raisonClose) raisonClose.addEventListener('click', closeRaison);
    if (raison) raison.addEventListener('click', function (e) { if (e.target === raison) closeRaison(); });

    bindExtcListener();
  });

  // Phase 8: secret "extc" listener is scoped to sea.html only.
  // The page-level listener was removed from shadow.js.
  var extcKeys = [];
  var EXTC = 'extc';
  function bindExtcListener() {
    document.addEventListener('keydown', function (e) {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return;
      if (e.key.length !== 1) return;
      extcKeys.push(e.key.toLowerCase());
      if (extcKeys.length > EXTC.length) extcKeys.shift();
      if (extcKeys.join('') === EXTC) {
        toggleShadow();
        extcKeys = [];
      }
    });
  }

  function toggleShadow() {
    var machine = document.querySelector('.machine');
    if (!machine) return;
    machine.classList.toggle('shadow-on');
    if (window.Liber && window.Liber.state) {
      window.Liber.state.set({ shadowUnlocked: true, shadowOn: machine.classList.contains('shadow-on') });
    }
    var p = document.createElement('div');
    p.className = 'shadow-prompt show';
    p.textContent = machine.classList.contains('shadow-on') ? '— shadow engaged —' : '— shadow recedes —';
    document.body.appendChild(p);
    setTimeout(function () {
      p.classList.remove('show');
      setTimeout(function () { p.remove(); }, 600);
    }, 1500);
  }
})();
