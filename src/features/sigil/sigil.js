// sigil.js — Mistress Physius's stone tablet. No shared imports (covenant Q.1).
// First time: draw a sigil and save it. After: loading sigil.html
// re-opens the stone with the existing sigil loaded; you can redraw
// and re-save, which replaces the previous sigil in state.

(function () {
  var activeElement = 'earth';
  var canvas = document.querySelector('.sigil-canvas');
  var cursor = document.getElementById('sigil-cursor');
  var wrap = document.querySelector('.sigil-canvas-wrap');
  var ctx = null;
  var drawing = false;
  var last = null;
  var cursorVisible = false;
  var currentId = null;
  var replaceMode = false;
  var ghostLoaded = false;

  var GLYPHS = {
    air:    '<svg viewBox="0 0 24 24"><path d="M2 8h12a3 3 0 1 0-3-3M2 14h16a3 3 0 1 1-3 3M2 11h9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    water:  '<svg viewBox="0 0 24 24"><path d="M12 2c-4 6-7 10-7 14a7 7 0 0 0 14 0c0-4-3-8-7-14z" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
    fire:   '<svg viewBox="0 0 24 24"><path d="M12 2c2 4 0 6 2 8s4 2 4 6a6 6 0 0 1-12 0c0-3 2-4 3-7s1-4 3-7z" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
    earth:  '<svg viewBox="0 0 24 24"><path d="M3 18l5-9 4 6 3-4 6 7H3z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    spirit: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="0.8" stroke-dasharray="2 2"/><path d="M12 4v3M12 17v3M4 12h3M17 12h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
  };

  var STROKES = {
    air:    { color: 'rgba(168, 200, 216, 0.85)', width: 1.4, jitter: 0.4 },
    water:  { color: 'rgba(104, 144, 176, 0.85)', width: 2.0, jitter: 0.8 },
    fire:   { color: 'rgba(216, 144, 96, 0.95)',  width: 1.6, jitter: 0.6 },
    earth:  { color: 'rgba(138, 112, 80, 0.9)',   width: 2.4, jitter: 0.3 },
    spirit: { color: 'rgba(232, 200, 160, 1.0)',   width: 1.0, jitter: 1.2 }
  };

  function setActive(el) {
    activeElement = el;
    var btns = document.querySelectorAll('.sigil-element');
    for (var i = 0; i < btns.length; i++) {
      if (btns[i].getAttribute('data-element') === el) {
        btns[i].classList.add('active');
      } else {
        btns[i].classList.remove('active');
      }
    }
    cursor.setAttribute('data-element', el);
    cursor.innerHTML = GLYPHS[el];
  }

  function initCanvas() {
    if (!canvas) return;
    var rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * 2);
    canvas.height = Math.floor(rect.height * 2);
    ctx = canvas.getContext('2d');
    ctx.scale(2, 2);
  }

  function pos(e) {
    var rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e) {
    drawing = true;
    last = pos(e);
  }

  function move(e) {
    if (!cursorVisible) {
      cursor.classList.add('visible');
      cursorVisible = true;
    }
    var p = pos(e);
    cursor.style.left = p.x + 'px';
    cursor.style.top = p.y + 'px';

    if (!drawing || !ctx) return;
    var s = STROKES[activeElement];
    var j = s.jitter;
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(last.x + (Math.random() - 0.5) * j, last.y + (Math.random() - 0.5) * j);
    ctx.lineTo(p.x + (Math.random() - 0.5) * j, p.y + (Math.random() - 0.5) * j);
    ctx.stroke();

    if (activeElement === 'spirit' && Math.random() < 0.3) {
      ctx.fillStyle = 'rgba(232, 200, 160, 0.4)';
      ctx.beginPath();
      ctx.arc(p.x + (Math.random() - 0.5) * 8, p.y + (Math.random() - 0.5) * 8, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    last = p;
  }

  function end() {
    drawing = false;
    last = null;
  }

  function leave() {
    cursor.classList.remove('visible');
    cursorVisible = false;
    drawing = false;
  }

  var savePromptEl = null;
  var savePromptBodyEl = null;
  var pendingAction = null;

  function openSavePrompt(bodyText, onKeep, onDiscard) {
    if (!savePromptEl) savePromptEl = document.getElementById('sigil-save-prompt');
    if (!savePromptBodyEl) savePromptBodyEl = document.getElementById('sigil-save-prompt-body');
    if (!savePromptEl) return;
    if (savePromptBodyEl) savePromptBodyEl.textContent = bodyText;
    pendingAction = { keep: onKeep, discard: onDiscard };
    savePromptEl.classList.add('open');
    savePromptEl.removeAttribute('inert');
  }

  function closeSavePrompt() {
    if (!savePromptEl) return;
    savePromptEl.classList.remove('open');
    savePromptEl.setAttribute('inert', '');
    pendingAction = null;
  }

function loadGhost(bitmapDataUrl) {
    if (!bitmapDataUrl || !ctx) return;
    var img = new Image();
    img.onload = function () {
      // Phase 7: bitmap is drawn at its original 1:1 size, anchored top-left.
      // The canvas itself crops the ghost to its own bounds.
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.drawImage(img, 0, 0);
      ctx.restore();
      ghostLoaded = true;
      // Persist the original bitmap dimensions for the desktop overlay.
      try {
        var cur = (window.Liber && window.Liber.state) ? window.Liber.state.get() : {};
        cur._sigilGhostDims = { w: img.width, h: img.height };
        if (window.Liber && window.Liber.state && window.Liber.state.set) {
          window.Liber.state.set(cur);
        }
      } catch (e) {}
    };
    img.src = bitmapDataUrl;
  }

  function snapshotBitmap() {
    if (!canvas) return null;
    try {
      return canvas.toDataURL('image/png');
    } catch (e) {
      return null;
    }
  }

  function save() {
    var app = document.querySelector('.sigil-app');
    if (!app) return;
    app.classList.add('saved');
    if (window.Liber && window.Liber.state) {
      var s = window.Liber.state.get() || {};
      var arr = s.sigils || [];
      var intention = document.querySelector('.sigil-input').innerText;
      var bitmap = snapshotBitmap();
      if (replaceMode && currentId) {
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].id === currentId) {
            arr[i] = Object.assign({}, arr[i], {
              intention: intention,
              element: activeElement,
              ts: Date.now(),
              bitmap: bitmap || arr[i].bitmap || null
            });
            window.Liber.state.set({ sigils: arr });
            return;
          }
        }
      }
      var id = 'sigil-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
      arr.push({
        id: id,
        intention: intention,
        element: activeElement,
        ts: Date.now(),
        annotation: '',
        bitmap: bitmap
      });
      window.Liber.state.set({ sigils: arr, tutorialDone: true });
    }
  }

  function discard() {
    if (!ctx) return;
    var rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    ghostLoaded = false;
    var input = document.querySelector('.sigil-input');
    if (input) input.innerText = '';
  }

  function loadExisting(sigil) {
    if (!sigil) return;
    replaceMode = true;
    currentId = sigil.id;
    setActive(sigil.element || 'earth');
    var input = document.querySelector('.sigil-input');
    if (input) input.innerText = sigil.intention || '';
    var title = document.querySelector('.sigil-title');
    if (title) title.textContent = 'SIGIL · re-open the stone';
    var sub = document.querySelector('.sigil-subtitle');
    if (sub) sub.textContent = 'redraw and re-save. the old work lingers faintly as a ghost.';
    var hint = document.querySelector('.sigil-ghost-hint');
    if (hint) hint.classList.add('visible');
    if (sigil.bitmap) loadGhost(sigil.bitmap);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var existing = [];
    try {
      var s = (window.Liber && window.Liber.state && window.Liber.state.get()) || {};
      existing = s.sigils || [];
    } catch (e) {}

    if (existing.length > 0) {
      initCanvas();
      loadExisting(existing[0]);
    } else {
      setActive('earth');
      initCanvas();
    }

    var btns = document.querySelectorAll('.sigil-element');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', (function (el) {
        return function () { setActive(el); };
      })(btns[i].getAttribute('data-element')));
    }

    if (canvas) {
      canvas.addEventListener('mousedown', start);
      canvas.addEventListener('mousemove', move);
      canvas.addEventListener('mouseup', end);
      canvas.addEventListener('mouseleave', leave);
    }
    if (wrap) {
      wrap.addEventListener('mouseleave', leave);
    }

    var saveBtn = document.getElementById('sigil-save');
    if (saveBtn) saveBtn.addEventListener('click', promptSave);
    var discardBtn = document.getElementById('sigil-discard');
    if (discardBtn) discardBtn.addEventListener('click', promptDiscard);

    var backBtn = document.getElementById('sigil-back');
    if (backBtn) backBtn.addEventListener('click', function () {
      if (history.length > 1) history.back(); else location.href = 'desktop.html';
    });

    var helpBtn = document.getElementById('sigil-help');
    var raison = document.getElementById('sigil-raison');
    var raisonClose = document.getElementById('sigil-raison-close');
    function openRaison() {
      if (raison) {
        raison.classList.add('open');
        raison.removeAttribute('inert');
      }
    }
    function closeRaison() {
      if (raison) {
        raison.classList.remove('open');
        raison.setAttribute('inert', '');
      }
    }
    if (helpBtn) helpBtn.addEventListener('click', openRaison);
    if (raisonClose) raisonClose.addEventListener('click', closeRaison);
    if (raison) raison.addEventListener('click', function (e) {
      if (e.target === raison) closeRaison();
    });

    var prompt = document.getElementById('sigil-save-prompt');
    var promptBody = document.getElementById('sigil-save-prompt-body');
    var keepBtn = document.getElementById('sigil-save-prompt-keep');
    var discardPromptBtn = document.getElementById('sigil-save-prompt-discard');
    var promptClose = document.getElementById('sigil-save-prompt-close');
    savePromptEl = prompt;
    savePromptBodyEl = promptBody;
    if (keepBtn) keepBtn.addEventListener('click', function () {
      var a = pendingAction;
      closeSavePrompt();
      if (a && a.keep) a.keep();
    });
    if (discardPromptBtn) discardPromptBtn.addEventListener('click', function () {
      var a = pendingAction;
      closeSavePrompt();
      if (a && a.discard) a.discard();
    });
    if (promptClose) promptClose.addEventListener('click', closeSavePrompt);
    if (prompt) prompt.addEventListener('click', function (e) {
      if (e.target === prompt) closeSavePrompt();
    });
  });

  function describeWork() {
    var intention = (document.querySelector('.sigil-input') || {}).innerText || '';
    var hasStrokes = false;
    if (ctx) {
      try {
        var data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        for (var i = 3; i < data.length; i += 4) {
          if (data[i] !== 0) { hasStrokes = true; break; }
        }
      } catch (e) {}
    }
    var intentionText = intention.trim() ? '"' + intention.trim() + '"' : '(none)';
    var drawingText = hasStrokes ? 'with strokes' : '(empty)';
    var ghostText = (replaceMode && ghostLoaded) ? ' ghost: 30%. new: 100%.' : '';
    return 'intention: ' + intentionText + '. element: ' + activeElement + '. drawing: ' + drawingText + '.' + ghostText;
  }

  function promptSave() {
    openSavePrompt(describeWork(), save, discard);
  }
  function promptDiscard() {
    openSavePrompt(describeWork(), function () {
      // discard chose to keep — no-op (the user changed their mind after seeing the description)
    }, discard);
  }
})();
