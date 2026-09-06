// sea.js — Vanir's deep. No shared imports (covenant Q.1).

(function () {
  var fill = document.getElementById('sea-gauge-fill');
  var deep = document.querySelector('.sea-deep');
  var breath = document.getElementById('sea-breath');
  var farLayer = document.getElementById('sea-far');
  var nearLayer = document.getElementById('sea-near');
  var depth = 0;
  var target = 0;
  var lastMove = Date.now();

  var FADE_MS = 2000;
  var UNINTERRUPTIBLE_MS = 800;
  var DISSOLVE_MS = 2600;

  function loop() {
    var sinceMove = Date.now() - lastMove;
    if (sinceMove < 4000) {
      target = Math.min(target + 0.0008, 1.0);
    } else {
      target = Math.max(target - 0.0005, 0.2);
    }
    depth += (target - depth) * 0.04;
    if (fill) fill.style.height = (depth * 100) + '%';
    if (farLayer) farLayer.style.transform = 'translateY(' + (-depth * 36).toFixed(1) + 'px)';
    if (nearLayer) {
      nearLayer.style.transform = 'translateY(' + (-depth * 72).toFixed(1) + 'px)';
      nearLayer.style.opacity = (0.25 + depth * 0.4).toFixed(2);
    }
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
    var riason = document.getElementById('sea-raison');
    var riasonClose = document.getElementById('sea-raison-close');
    function openRiason() {
      if (riason) { riason.classList.add('open'); riason.removeAttribute('inert'); }
    }
    function closeRiason() {
      if (riason) { riason.classList.remove('open'); riason.setAttribute('inert', ''); }
    }
    if (helpBtn) helpBtn.addEventListener('click', openRiason);
    if (riasonClose) riasonClose.addEventListener('click', closeRiason);
    if (riason) riason.addEventListener('click', function (e) { if (e.target === riason) closeRiason(); });
    if (riason) riason.setAttribute('inert', '');

    bindExtcListener();
    bindRitual();
  });

  function bindRitual() {
    var app = document.querySelector('.sea-app');
    var ritual = document.getElementById('sea-ritual');
    var input = document.getElementById('sea-input');
    var releaseBtn = document.getElementById('sea-release');
    var intensityWrap = document.getElementById('sea-intensity');
    var carried = document.getElementById('sea-carried');
    var carriedText = document.getElementById('sea-carried-text');
    if (!app || !ritual || !input || !releaseBtn || !intensityWrap || !carried || !carriedText) return;

    var intensity = 3;
    var releasing = false;

    function intensityFromEvent(e) {
      var dot = e.target.closest ? e.target.closest('.sea-intensity-dot') : null;
      return dot ? parseInt(dot.getAttribute('data-value'), 10) : NaN;
    }

    function paintIntensity() {
      var dots = intensityWrap.querySelectorAll('.sea-intensity-dot');
      for (var i = 0; i < dots.length; i++) {
        var v = parseInt(dots[i].getAttribute('data-value'), 10);
        if (v === intensity) dots[i].classList.add('on');
        else dots[i].classList.remove('on');
      }
    }

    intensityWrap.addEventListener('click', function (e) {
      var v = intensityFromEvent(e);
      if (isNaN(v) || releasing) return;
      intensity = v;
      paintIntensity();
    });

    var breathToggle = document.getElementById('sea-breath-toggle');
    var breathPhase = document.getElementById('sea-breath-phase');
    var guided = false, guidedTimer = null, guidedT = 0;
    var PHASES = ['in…', 'in…', 'in…', 'in…', 'hold…', 'hold…', 'hold…', 'hold…',
      'out…', 'out…', 'out…', 'out…', 'out…', 'out…'];
    function paintPhase() {
      if (breathPhase) breathPhase.textContent = guided ? PHASES[guidedT % PHASES.length] : '';
    }
    function setGuided(on) {
      guided = on;
      if (app) app.classList.toggle('guided', on);
      if (breathToggle) breathToggle.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (guidedTimer) { clearInterval(guidedTimer); guidedTimer = null; }
      if (on) {
        guidedT = 0;
        paintPhase();
        guidedTimer = setInterval(function () { guidedT++; paintPhase(); }, 1000);
      } else if (breathPhase) {
        breathPhase.textContent = '';
      }
    }
    if (breathToggle) breathToggle.addEventListener('click', function () { setGuided(!guided); });

    input.addEventListener('input', function () {
      releaseBtn.disabled = releasing || input.value.trim().length === 0;
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !releaseBtn.disabled) releaseBtn.click();
    });

    releaseBtn.addEventListener('click', function () {
      var text = input.value.trim();
      if (releasing || !text) return;
      releasing = true;
      releaseBtn.disabled = true;
      app.classList.add('releasing');
      if (breath) breath.style.setProperty('--sea-amp', ((intensity - 1) / 4).toFixed(2));
      carriedText.textContent = text;
      carried.classList.add('visible');

      if (window.Liber && window.Liber.state && window.Liber.state.addArtifact) {
        window.Liber.state.addArtifact('sea', { text: text, intensity: intensity });
      }
      if (window.Liber && window.Liber.sound) window.Liber.sound.play('thunk');

      setTimeout(function () {
        carried.classList.add('dissolving');
      }, FADE_MS + DISSOLVE_MS * 0.4);

      setTimeout(function () {
        carried.classList.remove('visible', 'dissolving');
        carriedText.textContent = '';
        app.classList.remove('releasing');
        input.value = '';
        intensity = 3;
        paintIntensity();
        releaseBtn.disabled = true;
        releasing = false;
      }, FADE_MS + DISSOLVE_MS);
    });
  }

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
