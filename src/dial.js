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
    { id: 'sigil',       name: 'buddy'       },
    { id: 'satchel',     name: 'satchel'     },
    { id: 'sea',         name: 'sea'         },
    { id: 'buddy',      name: 'chat'        },
    { id: 'games',       name: 'games'       },
    { id: 'toybox',      name: 'toybox'      },
    { id: 'divination',  name: 'divination'  },
    { id: 'learn',       name: 'learn'       },
    { id: 'garden',      name: 'garden'      },
    { id: 'dreams',      name: 'dreams'      },
    { id: 'trash',       name: 'trash'       },
  ];

  let selectedIdx = 0;
  let dialEl, leftArrow, rightArrow, opinionEl;
  let indexEl = null, holdTimer = null, suppressClick = false;

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

  function buildIndex() {
    if (!indexEl) return;
    indexEl.innerHTML = '';
    for (var i = 0; i < VISITORS.length; i++) {
      (function (v, n) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'dial-index-item' + (n === selectedIdx ? ' current' : '');
        b.textContent = v.name;
        b.addEventListener('click', function () { closeIndex(); visit(v); });
        indexEl.appendChild(b);
      })(VISITORS[i], i);
    }
  }

  function openIndex() {
    if (!indexEl) return;
    buildIndex();
    indexEl.hidden = false;
    var first = indexEl.querySelector('.dial-index-item');
    if (first) first.focus();
  }

  function closeIndex() {
    if (indexEl) indexEl.hidden = true;
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
  }

  function isSigilLocked() {
    var s = (window.Liber && window.Liber.state && window.Liber.state.get()) || {};
    return ((s.buddy || []).some(function (e) { return e && e.kind === 'stone'; }));
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
    indexEl = document.createElement('div');
    indexEl.className = 'dial-index';
    indexEl.hidden = true;
    indexEl.setAttribute('role', 'menu');
    indexEl.setAttribute('aria-label', 'all rooms');
    dialEl.parentNode.appendChild(indexEl);
    // The dial opens on the app the traveller entered last — its glyph is
    // the one lit on the menu when they come back.
    var s = (window.Liber && window.Liber.state && window.Liber.state.get()) || {};
    var latestId = null, latestTs = 0;
    var visitedMap = s.visited || {};
    for (var vid in visitedMap) {
      if (visitedMap[vid] > latestTs) { latestTs = visitedMap[vid]; latestId = vid; }
    }
    if (latestId) {
      for (var vi = 0; vi < VISITORS.length; vi++) {
        if (VISITORS[vi].id === latestId) { selectedIdx = vi; break; }
      }
    }
    render();
    if (leftArrow)  leftArrow.addEventListener('click', function () { cycle(-1); });
    if (rightArrow) rightArrow.addEventListener('click', function () { cycle(+1); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  cycle(-1);
      if (e.key === 'ArrowRight') cycle(+1);
      if (e.key === 'ArrowDown' && dialEl.contains(document.activeElement)) openIndex();
      if (e.key === 'Escape') closeIndex();
    });
  }

  function cycle(delta) {
    closeIndex();
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
      var patch = { visited: visited };
      // Ruby's thimble pot grows while you are elsewhere: every room
      // visit waters it. Derived idleness, never a grind.
      var th = s.thimble || { visits: 0, base: 0, harvested: 0 };
      patch.thimble = { visits: (th.visits || 0) + 1, base: th.base || 0, harvested: th.harvested || 0 };
      window.Liber.state.set(patch);
    }
    window.location.href = v.id + '.html';
  }

  function render() {
    if (!dialEl) return;
    dialEl.innerHTML = '';
    var sigilLocked = isSigilLocked();
    var visitedMap = ((window.Liber && window.Liber.state && window.Liber.state.get()) || {}).visited || {};
    var prev = VISITORS[(selectedIdx - 1 + VISITORS.length) % VISITORS.length];
    var cur  = VISITORS[selectedIdx];
    var next = VISITORS[(selectedIdx + 1) % VISITORS.length];
    renderOption(prev, 'prev', sigilLocked, visitedMap);
    renderOption(cur,  'active', sigilLocked, visitedMap);
    renderOption(next, 'next', sigilLocked, visitedMap);
  }

  // Phosphor bitmap glyphs (suite S2, docs/icon-suites.html) — entity404
  // rasterized the twelve onto a 12×12 cell grid. Each tile burns in its
  // traveller's phosphor (acc) with a glass bloom (glow).
  //
  // The fusion (user request): the traveller's hand lives INSIDE the
  // phosphor now — each tile carries a `mark`, a fine-line gesture drawn
  // in the glyph's empty grid space (geometricPrecision against the crisp
  // bitmap), inheriting the same phosphor via currentColor. No new
  // background, no material skins: scanning stays, presence arrives.

  const BITMAPS = {
    sigil:       { acc: '#aa5a18', glow: 'rgba(170,90,24,0.42)',  svg: '<path d="M4 1h4v1H4zM5 2h3v1H5zM6 3h2v1H6zM7 4h1v1H7zM2 7h8v1H2zM3 8h6v1H3z"/>',
                   mark: '<path d="M2 9.6 q4 0.9 8 0.1" shape-rendering="geometricPrecision" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.4"/>' },
    satchel:     { acc: '#aa7838', glow: 'rgba(170,120,56,0.42)', svg: '<path d="M2 2h8v1H2zM2 9h8v1H2zM2 3h1v6H2zM9 3h1v6H9zM4 3h1v6H4zM10 5h1v3h-1z"/>',
                   mark: '<path d="M1.2 1.6 h1.2 M1.2 1.6 v1.2 M10.8 10.4 h-1.2 M10.8 10.4 v-1.2" shape-rendering="geometricPrecision" fill="none" stroke="currentColor" stroke-width="0.45" opacity="0.4"/>' },
    sea:         { acc: '#2a8a8a', glow: 'rgba(42,138,138,0.42)', svg: '<path d="M5 1h2v1H5zM4 2h4v2H4zM5 4h2v1H5zM1 8h2v1H1zM5 8h2v1H5zM9 8h2v1H9zM3 9h2v1H3zM7 9h2v1H7zM11 9h1v1h-1z"/>',
                   mark: '<path d="M1.4 11 q2.6 -1.2 5 0 q2.4 1.2 4.6 0" shape-rendering="geometricPrecision" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.4"/>' },
    buddy:      { acc: '#c04a58', glow: 'rgba(192,74,88,0.42)',  svg: '<path d="M1 2h5v1H1zM1 6h5v1H1zM1 3h1v3H1zM5 3h1v3H5zM6 5h5v1H6zM6 9h5v1H6zM6 6h1v3H6zM10 6h1v3h-1z"/>',
                   mark: '<circle cx="6" cy="6" r="5.5" shape-rendering="geometricPrecision" fill="none" stroke="currentColor" stroke-width="0.35" opacity="0.35"/>' },
    games:       { acc: '#d4af37', glow: 'rgba(212,175,55,0.42)', svg: '<path d="M5 0h1v1H5zM5 1h2v1H5zM4 2h4v1H4zM3 3h6v2H3zM4 5h4v1H4zM5 6h2v1H5zM1 3h1v1H1zM10 3h1v1h-1zM5 7h2v1H5zM4 8h4v1H4z"/>',
                   mark: '<path d="M2 1.6 l0 0.01 M10.2 2 l0 0.01 M10.8 8.6 l0 0.01" shape-rendering="geometricPrecision" fill="none" stroke="currentColor" stroke-width="0.7" stroke-linecap="round" opacity="0.5"/>' },
    toybox:      { acc: '#d88a3c', glow: 'rgba(216,138,60,0.42)', svg: '<path d="M1 3h10v1H1zM1 3h1v6H1zM10 3h1v6H10zM1 9h10v1H1zM4 1h4v1H4zM5 2h2v1H5z"/>',
                   mark: '<path d="M3 6.4 q2.4 0.8 6 -0.2" shape-rendering="geometricPrecision" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.4"/>' },
    divination:  { acc: '#f4e8d2', glow: 'rgba(244,232,210,0.4)', svg: '<path d="M2 0h8v1H2zM2 2h3v1H2zM7 2h3v1H7zM2 4h8v1H2zM2 6h3v1H2zM7 6h3v1H7zM2 8h8v1H2zM2 10h3v1H2zM7 10h3v1H7z"/>',
                   mark: '<path d="M0.6 4.8 h0.01 M11.4 4.8 h0.01 M0.6 7.2 h0.01 M11.4 7.2 h0.01" shape-rendering="geometricPrecision" fill="none" stroke="currentColor" stroke-width="0.6" stroke-linecap="round" opacity="0.45"/>' },
    learn:       { acc: '#e05a5a', glow: 'rgba(224,90,90,0.42)',  svg: '<path d="M4 1h4v1H4zM3 2h1v1H3zM5 2h2v1H5zM8 2h1v1H8zM5 3h2v1H5zM5 4h1v1H5zM9 8h3v1H9zM9 10h3v1H9zM9 9h1v1H9zM11 9h1v1h-1z"/>',
                   mark: '<path d="M3.4 11.2 q2.8 0.6 5.2 -0.2" shape-rendering="geometricPrecision" fill="none" stroke="currentColor" stroke-width="0.45" opacity="0.4"/>' },
    garden:      { acc: '#d88a4a', glow: 'rgba(216,138,74,0.42)',  svg: '<path d="M5 1h2v1H5zM3 2h2v1H3zM7 2h2v1H7zM2 4h2v1H2zM8 4h2v1H8zM3 6h2v1H3zM7 6h2v1H7zM5 4h2v2H5zM5 7h2v1H5zM5 8h1v3H5zM3 9h1v1H3zM8 9h1v1H8z"/>',
                   mark: '<path d="M3.4 2.6 q2 -1.8 3.2 0.4 M8.6 3.2 q1.8 1.6 -0.4 3" shape-rendering="geometricPrecision" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.4"/>' },
    dreams:      { acc: '#a48ad4', glow: 'rgba(164,138,212,0.42)', svg: '<path d="M7 1a5.5 5.5 0 1 0 4.6 8.4A5.5 5.5 0 0 1 7 1z M10 1h1v1h-1z M11 3h1v1h-1z"/>',
                   mark: '<path d="M2.2 5.2 l0 0.01 M2.2 7.8 l0 0.01 M9.8 2.2 l0 0.01" shape-rendering="geometricPrecision" fill="none" stroke="currentColor" stroke-width="0.6" stroke-linecap="round" opacity="0.45"/>' },
    themes:      { acc: '#d4af37', glow: 'rgba(212,175,55,0.42)', svg: '<path d="M1 1h4v4H1zM7 1h4v4H7zM1 7h4v1H1zM1 10h4v1H1zM1 8h1v2H1zM4 8h1v2H4zM7 7h3v1H7zM7 8h4v2H7zM7 10h4v1H7z"/>',
                   mark: '<path d="M2.6 5.6 l0 0.01 M5.4 5.2 l0 0.01 M8.6 5.8 l0 0.01" shape-rendering="geometricPrecision" fill="none" stroke="currentColor" stroke-width="0.55" stroke-linecap="round" opacity="0.45"/>' },
    trash:       { acc: '#a88858', glow: 'rgba(168,136,88,0.42)', svg: '<path d="M3 7h6v1H3zM2 8h8v1H2zM1 9h10v1H1zM4 5h1v1H4zM7 4h1v1H7zM9 6h1v1H9z"/>',
                   mark: '<path d="M3.2 2.4 l0 0.01 M6.4 1.6 l0 0.01 M9 3 l0 0.01" shape-rendering="geometricPrecision" fill="none" stroke="currentColor" stroke-width="0.5" stroke-linecap="round" opacity="0.4"/>' }
  };

  // Motes — little thematic bits that float around a tile while it is the
  // selected one.
  const MOTES = {
    sigil:       { color: '#c87838', round: '0%' },
    satchel:     { color: '#d8c8a0', round: '0%' },
    sea:         { color: '#7ac0c8', round: '50%' },
    buddy:      { color: '#d85a48', round: '50%' },
    games:       { color: '#ffd86a', round: '0%' },
    toybox:      { color: '#e8a05a', round: '0%' },
    divination:  { color: '#f4e8d2', round: '50%' },
    learn:       { color: '#e05a5a', round: '50%' },
    garden:      { color: '#e8a05a', round: '50%' },
    dreams:      { color: '#b39ddb', round: '50%' },
    themes:      { color: '#d4af37', round: '0%' },
    trash:       { color: '#8a6840', round: '0%' }
  };

function renderOption(v, pos, sigilLocked, visitedMap) {
    var btn = document.createElement('button');
    btn.className = 'dial-option ' + pos;
    if (v.id === 'sigil' && sigilLocked) btn.classList.add('crossed');
    if (visitedMap && visitedMap[v.id]) btn.classList.add('visited');
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
    var badgeHtml = '';
    if (v.id === 'buddy') {
      try {
        var gs = (window.Liber && window.Liber.state && window.Liber.state.get()) || {};
        var n = ((gs.chat || {}).unread || {}).buddy || 0;
        if (n > 0) badgeHtml = '<span class="dial-badge" aria-hidden="true">' + Math.min(n, 9) + '</span>';
      } catch (e) {}
    }
    btn.innerHTML = '<span class="phos-label">' + v.name + '</span>'
      + '<span class="dial-glyph"><svg viewBox="0 0 12 12" shape-rendering="crispEdges" fill="currentColor" aria-hidden="true">' + b.svg + (b.mark || '') + '</svg></span>'
      + badgeHtml
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
      if (suppressClick) { suppressClick = false; return; }
      if (pos === 'active') {
        visit(v);
      } else {
        cycle(pos === 'prev' ? -1 : 1);
      }
    });
    if (pos === 'active') {
      btn.addEventListener('pointerdown', function () {
        if (holdTimer) clearTimeout(holdTimer);
        holdTimer = setTimeout(function () {
          holdTimer = null;
          suppressClick = true;
          openIndex();
        }, 600);
      });
      btn.addEventListener('pointerup', function () {
        if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
      });
      btn.addEventListener('pointerleave', function () {
        if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
      });
    }
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
