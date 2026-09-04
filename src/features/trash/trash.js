// trash.js — Ravaging Pete. Soil layers, worms, rusted hook. No shared imports (covenant Q.1).

(function () {
  function buildWorms() {
    var el = document.getElementById('trash-worms');
    if (!el) return;
    for (var i = 0; i < 5; i++) {
      var w = document.createElement('div');
      w.className = 'trash-worm';
      w.style.top = (30 + i * 11) + '%';
      w.style.left = (Math.random() * 60) + '%';
      w.style.animationDelay = (Math.random() * 6) + 's';
      w.style.opacity = 0.4 + Math.random() * 0.4;
      el.appendChild(w);
    }
  }

  function hook() {
    var h = document.getElementById('trash-hook');
    if (!h) return;
    h.addEventListener('mousedown', function () { h.classList.add('dragging'); });
    h.addEventListener('mouseup', function () { h.classList.remove('dragging'); });
  }

  function burySigils() {
    var prompt = document.getElementById('trash-save-prompt');
    var body = document.getElementById('trash-save-prompt-body');
    if (prompt) {
      pendingBury = { kind: 'sigils' };
      if (body) body.innerHTML = 'action: bury <em>all sigils</em>. irreversible.';
      prompt.classList.add('open');
      prompt.setAttribute('aria-hidden', 'false');
    } else {
      commitBurySigils();
    }
  }

  function commitBurySigils() {
    if (window.Liber && window.Liber.state) {
      window.Liber.state.set({ sigils: [] });
    }
    flash('the sigils are loam.');
  }

  function buryCohort() {
    var prompt = document.getElementById('trash-save-prompt');
    var body = document.getElementById('trash-save-prompt-body');
    if (prompt) {
      pendingBury = { kind: 'cohort' };
      if (body) body.innerHTML = 'action: bury <em>all cohort</em>. irreversible.';
      prompt.classList.add('open');
      prompt.setAttribute('aria-hidden', 'false');
    } else {
      commitBuryCohort();
    }
  }

  function commitBuryCohort() {
    if (window.Liber && window.Liber.state) {
      window.Liber.state.set({ cohort: [] });
    }
    flash('the cohort is loam.');
  }

  function buryTour() {
    var prompt = document.getElementById('trash-save-prompt');
    var body = document.getElementById('trash-save-prompt-body');
    if (prompt) {
      pendingBury = { kind: 'tour' };
      if (body) body.innerHTML = 'action: bury <em>the tour</em>. irreversible.';
      prompt.classList.add('open');
      prompt.setAttribute('aria-hidden', 'false');
    } else {
      commitBuryTour();
    }
  }

  function commitBuryTour() {
    if (window.Liber && window.Liber.state) {
      window.Liber.state.set({ visited: {} });
    }
    flash('the tour is forgotten.');
  }

  function buryAll() {
    var prompt = document.getElementById('trash-save-prompt');
    var body = document.getElementById('trash-save-prompt-body');
    if (prompt) {
      pendingBury = { kind: 'all' };
      if (body) body.innerHTML = 'action: bury <em>everything</em>. irreversible.';
      prompt.classList.add('open');
      prompt.setAttribute('aria-hidden', 'false');
    } else {
      commitBuryAll();
    }
  }

  function commitBuryAll() {
    if (window.Liber && window.Liber.state) {
      window.Liber.state.reset();
    }
    flash('the room is clean. the room is empty.');
  }

  var pendingBury = null;

  function closePrompt() {
    var prompt = document.getElementById('trash-save-prompt');
    if (!prompt) return;
    prompt.classList.remove('open');
    prompt.setAttribute('aria-hidden', 'true');
    pendingBury = null;
  }

  function flash(msg) {
    var w = document.querySelector('.trash-warning');
    if (!w) return;
    var old = w.textContent;
    w.textContent = msg;
    w.style.color = '#f0c890';
    setTimeout(function () {
      w.textContent = old;
      w.style.color = '';
    }, 2500);
  }

  document.addEventListener('DOMContentLoaded', function () {
    buildWorms();
    hook();

    var exit = document.getElementById('trash-exit');
    if (exit) exit.addEventListener('click', function () {
      if (history.length > 1) history.back(); else location.href = 'desktop.html';
    });

    var b1 = document.getElementById('trash-bury-sigils');
    var b2 = document.getElementById('trash-bury-cohort');
    var b3 = document.getElementById('trash-bury-tour');
    var b4 = document.getElementById('trash-bury-all');
    if (b1) b1.addEventListener('click', burySigils);
    if (b2) b2.addEventListener('click', buryCohort);
    if (b3) b3.addEventListener('click', buryTour);
    if (b4) b4.addEventListener('click', buryAll);

    var prompt = document.getElementById('trash-save-prompt');
    var keepBtn = document.getElementById('trash-save-prompt-keep');
    var discardBtn = document.getElementById('trash-save-prompt-discard');
    var closeBtn = document.getElementById('trash-save-prompt-close');
    if (keepBtn) keepBtn.addEventListener('click', function () {
      var p = pendingBury;
      closePrompt();
      if (!p) return;
      if (p.kind === 'sigils') commitBurySigils();
      else if (p.kind === 'cohort') commitBuryCohort();
      else if (p.kind === 'tour') commitBuryTour();
      else if (p.kind === 'all') commitBuryAll();
    });
    if (discardBtn) discardBtn.addEventListener('click', closePrompt);
    if (closeBtn) closeBtn.addEventListener('click', closePrompt);
    if (prompt) prompt.addEventListener('click', function (e) { if (e.target === prompt) closePrompt(); });
  });
})();
