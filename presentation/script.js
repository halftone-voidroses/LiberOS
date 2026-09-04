// script.js — presentation site. Dust, reveals, the prompt cycler, the
// carvings row, the apps grid. All decorative canvas work is aria-hidden
// and non-blocking; content is fully readable without JS.

(function () {
  'use strict';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─── dust ───────────────────────────────────────────────────────────
  var canvas = document.querySelector('.dust');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var dust = [];

    function sizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function spawn() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 0.4 + Math.random() * 1.1,
        vy: 0.06 + Math.random() * 0.22,
        vx: (Math.random() - 0.5) * 0.08,
        o: 0.05 + Math.random() * 0.22,
      };
    }

    function paint() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < dust.length; i++) {
        var p = dust[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(226, 217, 198, ' + p.o + ')';
        ctx.fill();
      }
    }

    function tick() {
      for (var i = 0; i < dust.length; i++) {
        var p = dust[i];
        p.y -= p.vy;
        p.x += p.vx;
        if (p.y < -4) { dust[i] = spawn(); dust[i].y = canvas.height + 4; }
        if (p.x < -4) p.x = canvas.width + 4;
        if (p.x > canvas.width + 4) p.x = -4;
      }
      paint();
      requestAnimationFrame(tick);
    }

    sizeCanvas();
    var COUNT = Math.min(60, Math.floor(window.innerWidth / 24));
    for (var i = 0; i < COUNT; i++) dust.push(spawn());
    paint();
    if (!reduced) requestAnimationFrame(tick);
    window.addEventListener('resize', function () {
      sizeCanvas();
      paint();
    });
  }

  // ─── reveals ────────────────────────────────────────────────────────
  var revealEls = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  // ─── prompt cycler (real engine outputs) ────────────────────────────
  var PROMPTS = [
    'if a line drawn and held were challenged, what would my fear of inadequacy do?',
    'what was exiled along with the star that my fear of inadequacy still wants back?',
    'the tower sits beside my fear of inadequacy now. ask them both why.',
    'if the structure, broken were allowed to speak, what would it say to my fear of inadequacy?',
    'write my fear of inadequacy a letter. let small light, far read it first.',
  ];
  var promptEl = document.getElementById('prompt-demo-text');
  var againBtn = document.getElementById('prompt-again');
  if (promptEl && againBtn) {
    var idx = 0;
    againBtn.addEventListener('click', function () {
      idx = (idx + 1) % PROMPTS.length;
      if (reduced) {
        promptEl.textContent = PROMPTS[idx];
        return;
      }
      promptEl.classList.add('swapping');
      setTimeout(function () {
        promptEl.textContent = PROMPTS[idx];
        promptEl.classList.remove('swapping');
      }, 500);
    });
  }

  // ─── the twelve carvings (glyphs from src/carvings.js) ──────────────
  var GLYPHS = {
    stone: 'M3 14 L10 3 L17 14 L10 17 Z M6 12 L10 8 L14 12 Z',
    thread: 'M3 7 C7 4, 13 4, 17 7 M3 11 C7 8, 13 8, 17 11 M3 15 C7 12, 13 12, 17 15',
    candle: 'M10 3 L10 6 M8 6 L12 6 L11.5 17 L8.5 17 Z',
    bell: 'M5 14 L15 14 L13.5 5 L6.5 5 Z M10 17 L10 14',
    glyph: 'M10 3 L10 17 M3 10 L17 10 M5 5 L15 15 M15 5 L5 15',
    bulb: 'M10 3 a5 5 0 0 1 5 5 c0 3 -2 4 -2 7 l-6 0 c0 -3 -2 -4 -2 -7 a5 5 0 0 1 5 -5 Z M8 15 L12 15 M9 17 L11 17',
    'tower-rev': 'M5 17 L15 17 L13 14 L11 14 L11 8 L13 8 L11 5 L9 8 L11 8 L11 14 L9 14 Z M3 17 L17 17',
    'hole-punch': 'M10 3 L17 10 L10 17 L3 10 Z M7 10 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0',
    nib: 'M10 3 L14 10 L10 17 L6 10 Z M10 10 L10 17',
    compass: 'M10 3 a7 7 0 1 0 0.01 0 Z M10 3 L12 10 L10 17 L8 10 Z',
    grate: 'M3 5 L17 5 M3 9 L17 9 M3 13 L17 13 M3 17 L17 17',
    hook: 'M14 4 a4 4 0 0 1 -4 4 L6 12 L3 15 M6 12 L9 12',
  };
  var ORDER = ['stone', 'thread', 'candle', 'bell', 'glyph', 'bulb', 'tower-rev', 'hole-punch', 'nib', 'compass', 'grate', 'hook'];
  var row = document.getElementById('carvings-row');
  if (row) {
    ORDER.forEach(function (id, i) {
      var d = document.createElement('div');
      d.className = 'carving';
      d.title = id;
      d.setAttribute('aria-label', 'carving: ' + id);
      d.innerHTML = '<svg viewBox="0 0 20 20"><path d="' + GLYPHS[id] + '" stroke-width="1.4"/></svg>';
      row.appendChild(d);
      if (!reduced) {
        setTimeout(function () {
          d.classList.add('glow');
          setTimeout(function () { d.classList.remove('glow'); }, 1400);
        }, 2500 + i * 900);
      }
    });
  }

  // ─── the twelve apps (from SPEC.md persona table) ────────────────────
  var APPS = [
    { name: 'the casting', voice: 'pious, ancient, hermetic', visual: 'stone tablet · charcoal · copper inlay' },
    { name: 'the satchel', voice: 'archival, keeping', visual: 'brass clasps · sepia paper · index cards' },
    { name: 'the deep', voice: 'oceanic, slow', visual: 'waterline · blue-green · foaming edge' },
    { name: 'those you carry', voice: 'gothic, ancestral, linked', visual: 'wax · flames · the constellation' },
    { name: 'the void', voice: 'lowercase, terse, BBS', visual: 'green-on-black · blinking cursor' },
    { name: 'the booths', voice: 'theatrical, barker', visual: 'marquee bulbs · reds + creams · ticket stubs' },
    { name: 'divination', voice: 'chalk on felt', visual: 'white chalk on deep red velvet' },
    { name: 'learn', voice: 'workbook, dossier', visual: 'index cards · ink stamps · marginalia' },
    { name: 'method', voice: 'philosophical, methodical', visual: 'folio · broadsheet · wax seal' },
    { name: 'themes', voice: 'cartographic, painter', visual: 'pigment tiles · swatch grid' },
    { name: 'relations', voice: 'the linked dead', visual: 'iron rings · chain · monogram' },
    { name: 'the graveyard', voice: 'gravel, loam', visual: 'die-cut rubble · scattered fragments' },
  ];
  var grid = document.getElementById('apps-grid');
  if (grid) {
    APPS.forEach(function (a) {
      var t = document.createElement('div');
      t.className = 'app-tile reveal';
      t.innerHTML = '<h3>' + a.name + '</h3><p class="app-voice">' + a.voice + '</p><p class="app-visual">' + a.visual + '</p>';
      grid.appendChild(t);
    });
    if (!reduced && 'IntersectionObserver' in window) {
      var io2 = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); io2.unobserve(e.target); }
        });
      }, { threshold: 0.15 });
      grid.querySelectorAll('.reveal').forEach(function (el) { io2.observe(el); });
    } else {
      grid.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
    }
  }
})();
