// dial.js — three-position radial menu
// Active option is in the middle and pops up large and bright. The
// previous option is to the left (scaled down, dim, lower) and the
// next option is to the right (mirrored). The user can also use the
// dark wooden < > arrows on the far sides. Clicking the active
// option navigates. After the first sigil is etched, the Sigil
// option is crossed out (locked) but still clickable for view-only
// access.

(function () {
  'use strict';

  const VISITORS = [
    { id: 'sigil',       name: 'cohort'      },
    { id: 'satchel',     name: 'satchel'     },
    { id: 'sea',         name: 'sea'         },
    { id: 'cohort',      name: 'chat'           },
    { id: 'abstract',    name: 'abstract'    },
    { id: 'games',       name: 'games'       },
    { id: 'divination',  name: 'divination'  },
    { id: 'learn',       name: 'learn'       },
    { id: 'methodology', name: 'methodology' },
    { id: 'themes',      name: 'themes'      },
    { id: 'relation',    name: 'relations'   },
    { id: 'trash',       name: 'trash'       },
  ];

  let selectedIdx = 0;
  let dialEl, leftArrow, rightArrow, opinionEl;

  // Persona register (plan 2026-09-04 §3): materials, opinions, cursors.
  const PERSONAS = (window.LIBER_DATA && window.LIBER_DATA.personas) || {};

  function showOpinion(id) {
    if (!opinionEl) return;
    var p = PERSONAS[id];
    if (!p || !p.opinion) { opinionEl.hidden = true; return; }
    opinionEl.innerHTML = '<span class="dial-opinion-name">' + p.name + '</span>' + p.opinion;
    opinionEl.style.setProperty('--persona-accent', p.accent || '#c8a878');
    opinionEl.hidden = false;
  }

  function hideOpinion() {
    if (opinionEl) opinionEl.hidden = true;
  }

  function isSigilLocked() {
    var s = (window.Liber && window.Liber.state && window.Liber.state.get()) || {};
    return (s.sigils || []).length > 0;
  }

  function init() {
    dialEl = document.querySelector('.dial-row');
    if (!dialEl) return;
    leftArrow = document.querySelector('.dial-arrow.left');
    rightArrow = document.querySelector('.dial-arrow.right');
    opinionEl = document.createElement('div');
    opinionEl.className = 'dial-opinion';
    opinionEl.hidden = true;
    opinionEl.setAttribute('aria-live', 'polite');
    dialEl.parentNode.appendChild(opinionEl);
    render();
    if (leftArrow)  leftArrow.addEventListener('click', function () { cycle(-1); });
    if (rightArrow) rightArrow.addEventListener('click', function () { cycle(+1); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  cycle(-1);
      if (e.key === 'ArrowRight') cycle(+1);
    });
  }

  function cycle(delta) {
    selectedIdx = (selectedIdx + delta + VISITORS.length) % VISITORS.length;
    render();
    if (window.Liber && window.Liber.state) {
      window.Liber.state.set({ visited: { [VISITORS[selectedIdx].id]: Date.now() } });
    }
  }

  function visit(v) {
    if (window.Liber && window.Liber.state) {
      var s = window.Liber.state.get() || {};
      var visited = s.visited || {};
      visited[v.id] = Date.now();
      window.Liber.state.set({ visited: visited });
    }
    window.location.href = v.id + '.html';
  }

  function render() {
    if (!dialEl) return;
    dialEl.innerHTML = '';
    var sigilLocked = isSigilLocked();
    var prev = VISITORS[(selectedIdx - 1 + VISITORS.length) % VISITORS.length];
    var cur  = VISITORS[selectedIdx];
    var next = VISITORS[(selectedIdx + 1) % VISITORS.length];
    renderOption(prev, 'prev', sigilLocked);
    renderOption(cur,  'active', sigilLocked);
    renderOption(next, 'next', sigilLocked);
  }

  // Phosphor bitmap glyphs (suite S2, docs/icon-suites.html) — entity404
  // rasterized the twelve onto a 12×12 cell grid. Each tile burns in its
  // traveller's phosphor (acc) with a glass bloom (glow).

  const BITMAPS = {
    sigil:       { acc: '#aa5a18', glow: 'rgba(170,90,24,0.42)',  svg: '<path d="M4 1h4v1H4zM5 2h3v1H5zM6 3h2v1H6zM7 4h1v1H7zM2 7h8v1H2zM3 8h6v1H3z"/>' },
    satchel:     { acc: '#aa7838', glow: 'rgba(170,120,56,0.42)', svg: '<path d="M2 2h8v1H2zM2 9h8v1H2zM2 3h1v6H2zM9 3h1v6H9zM4 3h1v6H4zM10 5h1v3h-1z"/>' },
    sea:         { acc: '#2a8a8a', glow: 'rgba(42,138,138,0.42)', svg: '<path d="M5 1h2v1H5zM4 2h4v2H4zM5 4h2v1H5zM1 8h2v1H1zM5 8h2v1H5zM9 8h2v1H9zM3 9h2v1H3zM7 9h2v1H7zM11 9h1v1h-1z"/>' },
    cohort:      { acc: '#c04a58', glow: 'rgba(192,74,88,0.42)',  svg: '<path d="M1 2h5v1H1zM1 6h5v1H1zM1 3h1v3H1zM5 3h1v3H5zM6 5h5v1H6zM6 9h5v1H6zM6 6h1v3H6zM10 6h1v3h-1z"/>' },
    abstract:    { acc: '#00ff66', glow: 'rgba(0,255,102,0.32)',  svg: '<path d="M3 2h4v7H3z"/><path class="phos-blink" d="M2 10h8v1H2z"/>' },
    games:       { acc: '#d4af37', glow: 'rgba(212,175,55,0.42)', svg: '<path d="M5 0h1v1H5zM5 1h2v1H5zM4 2h4v1H4zM3 3h6v2H3zM4 5h4v1H4zM5 6h2v1H5zM1 3h1v1H1zM10 3h1v1h-1zM5 7h2v1H5zM4 8h4v1H4z"/>' },
    divination:  { acc: '#f4e8d2', glow: 'rgba(244,232,210,0.4)', svg: '<path d="M2 0h8v1H2zM2 2h3v1H2zM7 2h3v1H7zM2 4h8v1H2zM2 6h3v1H2zM7 6h3v1H7zM2 8h8v1H2zM2 10h3v1H2zM7 10h3v1H7z"/>' },
    learn:       { acc: '#e05a5a', glow: 'rgba(224,90,90,0.42)',  svg: '<path d="M4 1h4v1H4zM3 2h1v1H3zM5 2h2v1H5zM8 2h1v1H8zM5 3h2v1H5zM5 4h1v1H5zM9 8h3v1H9zM9 10h3v1H9zM9 9h1v1H9zM11 9h1v1h-1z"/>' },
    methodology: { acc: '#e05a5a', glow: 'rgba(224,90,90,0.42)',  svg: '<path d="M2 2h3v8H2zM7 2h3v1H7zM7 9h3v1H7zM7 3h1v6H7zM9 3h1v6H9z"/>' },
    themes:      { acc: '#d4af37', glow: 'rgba(212,175,55,0.42)', svg: '<path d="M1 1h4v4H1zM7 1h4v4H7zM1 7h4v1H1zM1 10h4v1H1zM1 8h1v2H1zM4 8h1v2H4zM7 7h3v1H7zM7 8h4v2H7zM7 10h4v1H7z"/>' },
    relation:    { acc: '#c8a04a', glow: 'rgba(200,160,74,0.42)', svg: '<path d="M1 3h5v1H1zM1 7h5v1H1zM1 4h1v3H1zM5 4h1v3H5zM6 3h5v1H6zM6 7h5v1H6zM6 4h1v3H6zM10 4h1v3h-1z"/>' },
    trash:       { acc: '#a88858', glow: 'rgba(168,136,88,0.42)', svg: '<path d="M3 7h6v1H3zM2 8h8v1H2zM1 9h10v1H1zM4 5h1v1H4zM7 4h1v1H7zM9 6h1v1H9z"/>' }
  };

  // Motes — little thematic bits that float around a tile while it is the
  // selected one.
  const MOTES = {
    sigil:       { color: '#c87838', round: '0%' },
    satchel:     { color: '#d8c8a0', round: '0%' },
    sea:         { color: '#7ac0c8', round: '50%' },
    cohort:      { color: '#d85a48', round: '50%' },
    abstract:    { color: '#00ff66', round: '0%' },
    games:       { color: '#ffd86a', round: '0%' },
    divination:  { color: '#f4e8d2', round: '50%' },
    learn:       { color: '#e05a5a', round: '50%' },
    methodology: { color: '#c04838', round: '50%' },
    themes:      { color: '#d4af37', round: '0%' },
    relation:    { color: '#c8a04a', round: '50%' },
    trash:       { color: '#8a6840', round: '0%' }
  };

function renderOption(v, pos, sigilLocked) {
    var btn = document.createElement('button');
    btn.className = 'dial-option ' + pos;
    if (v.id === 'sigil' && sigilLocked) btn.classList.add('crossed');
    btn.dataset.id = v.id;
    btn.dataset.pos = pos;
    btn.id = 'dial-option-' + v.id;
    var b = BITMAPS[v.id] || { acc: '#c8a878', glow: 'rgba(200,168,120,0.42)', svg: '' };
    btn.style.setProperty('--acc', b.acc);
    btn.style.setProperty('--glow', b.glow);
    var mote = MOTES[v.id] || { color: '#c8a878', round: '50%' };
    btn.style.setProperty('--mote-color', mote.color);
    btn.style.setProperty('--mote-round', mote.round);
    var motesHtml = '<span class="dial-motes" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';
    btn.innerHTML = '<span class="phos-label">' + v.name + '</span>'
      + '<span class="dial-glyph"><svg viewBox="0 0 12 12" shape-rendering="crispEdges" fill="currentColor" aria-hidden="true">' + b.svg + '</svg></span>'
      + motesHtml;
    var p = PERSONAS[v.id];
    if (p && p.cursor && !(v.id === 'sigil' && sigilLocked)) {
      btn.style.cursor = p.cursor;
    }
    btn.addEventListener('mouseenter', function () { showOpinion(v.id); });
    btn.addEventListener('mouseleave', hideOpinion);
    btn.addEventListener('focus', function () { showOpinion(v.id); });
    btn.addEventListener('blur', hideOpinion);
    btn.addEventListener('click', function () {
      if (pos === 'active') {
        visit(v);
      } else {
        cycle(pos === 'prev' ? -1 : 1);
      }
    });
    dialEl.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // The crossed/unlocked state of the casting option is state-derived —
  // redraw on change so "start over" un-crosses it without a reload.
  if (window.Liber && window.Liber.state && window.Liber.state.on) {
    window.Liber.state.on('change', render);
  }

  window.DialRefresh = function () { render(); };
})();
