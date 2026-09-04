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
    { id: 'sigil',       name: 'sigil'       },
    { id: 'satchel',     name: 'satchel'     },
    { id: 'sea',         name: 'sea'         },
    { id: 'cohort',      name: 'cohort'      },
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

  // Inline SVG glyphs per persona, drawn before the label inside .dial-option.
// Style matches each app's dominant CSS hue.

const ICONS = {
  sigil:       '<svg viewBox="0 0 24 24" width="16" height="16"><rect x="4" y="6" width="16" height="12" rx="1" fill="none" stroke="#aa5a18" stroke-width="1.5"/><circle cx="12" cy="12" r="3" fill="none" stroke="#aa5a18" stroke-width="1.2"/></svg>',
  satchel:     '<svg viewBox="0 0 24 24" width="16" height="16"><rect x="4" y="8" width="16" height="11" rx="1" fill="none" stroke="#aa7838" stroke-width="1.4"/><path d="M8 8 V6 a4 4 0 0 1 8 0 V8" fill="none" stroke="#aa7838" stroke-width="1.4"/></svg>',
  sea:         '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M2 14 Q6 10 10 14 T18 14 T22 14" fill="none" stroke="#2a8a8a" stroke-width="1.6"/><path d="M2 18 Q6 14 10 18 T18 18 T22 18" fill="none" stroke="#2a8a8a" stroke-width="1.6"/></svg>',
  cohort:      '<svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="3" fill="none" stroke="#aa3030" stroke-width="1.4"/><circle cx="12" cy="12" r="7" fill="none" stroke="#aa3030" stroke-width="1.2" stroke-dasharray="2 2"/></svg>',
  abstract:    '<svg viewBox="0 0 24 24" width="16" height="16"><rect x="4" y="4" width="16" height="16" fill="#000" stroke="#00ff66" stroke-width="1.4"/><path d="M7 12 H17 M12 7 V17" stroke="#00ff66" stroke-width="1.2"/></svg>',
  games:       '<svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="9" fill="none" stroke="#d4af37" stroke-width="1.6"/><circle cx="12" cy="12" r="4" fill="#aa1018" stroke="#d4af37" stroke-width="1.2"/></svg>',
  divination:  '<svg viewBox="0 0 24 24" width="16" height="16"><rect x="5" y="3" width="14" height="18" rx="2" fill="#f4e8d2" stroke="#6a0a14" stroke-width="1.4"/><path d="M12 8 V14 M9 11 H15" stroke="#6a0a14" stroke-width="1.2"/></svg>',
  learn:       '<svg viewBox="0 0 24 24" width="16" height="16"><rect x="4" y="5" width="16" height="14" fill="none" stroke="#aa3030" stroke-width="1.4"/><path d="M4 9 H20 M4 13 H20 M4 17 H16" stroke="#aa3030" stroke-width="1"/></svg>',
  methodology: '<svg viewBox="0 0 24 24" width="16" height="16"><rect x="3" y="4" width="18" height="16" fill="none" stroke="#6a4a20" stroke-width="1.4"/><path d="M6 8 H18 M6 12 H18 M6 16 H14" stroke="#6a4a20" stroke-width="1"/></svg>',
  themes:      '<svg viewBox="0 0 24 24" width="16" height="16"><rect x="3" y="3" width="9" height="9" fill="#aa5a18"/><rect x="12" y="3" width="9" height="9" fill="#d4af37"/><rect x="3" y="12" width="9" height="9" fill="#2a8a8a"/><rect x="12" y="12" width="9" height="9" fill="#aa1018"/></svg>',
  relation:    '<svg viewBox="0 0 24 24" width="16" height="16"><circle cx="8" cy="8" r="3" fill="none" stroke="#aa8a3a" stroke-width="1.4"/><circle cx="16" cy="16" r="3" fill="none" stroke="#aa8a3a" stroke-width="1.4"/><path d="M11 8 H16 M8 11 V16" stroke="#aa8a3a" stroke-width="1.2"/></svg>',
  trash:       '<svg viewBox="0 0 24 24" width="16" height="16"><rect x="6" y="6" width="12" height="14" rx="1" fill="none" stroke="#8a6840" stroke-width="1.4"/><path d="M4 6 H20 M9 6 V4 H15 V6" stroke="#8a6840" stroke-width="1.4"/></svg>'
};

function renderOption(v, pos, sigilLocked) {
    var btn = document.createElement('button');
    btn.className = 'dial-option ' + pos;
    if (v.id === 'sigil' && sigilLocked) btn.classList.add('crossed');
    btn.dataset.id = v.id;
    btn.dataset.pos = pos;
    btn.id = 'dial-option-' + v.id;
    var icon = ICONS[v.id] || '';
    btn.innerHTML = '<span class="dial-icon">' + icon + '</span><span class="dial-label">' + v.name + '</span>';
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

  window.DialRefresh = function () { render(); };
})();
