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

  function st() { return window.Liber ? window.Liber.state : null; }

  function snapshotAll() {
    var s = st() ? st().get() : {};
    return [
      { kind: 'sigils', entries: (s.sigils || []).slice() },
      { kind: 'buddy', entries: (s.buddy || []).slice() },
      { kind: 'tour', entry: { visited: Object.assign({}, s.visited || {}) } },
    ];
  }

  function commitBury(groups) {
    if (!st()) return;
    var s = st().get();
    var graveyard = (s.graveyard || []).slice();
    var patch = {};
    var now = Date.now();
    for (var i = 0; i < groups.length; i++) {
      var g = groups[i];
      if (g.kind === 'sigils') {
        for (var j = 0; j < g.entries.length; j++) {
          graveyard.push({ kind: 'sigils', entry: g.entries[j], buriedAt: now });
        }
        patch.sigils = [];
      } else if (g.kind === 'buddy') {
        for (var k = 0; k < g.entries.length; k++) {
          graveyard.push({ kind: 'buddy', entry: g.entries[k], buriedAt: now });
        }
        patch.buddy = [];
      } else if (g.kind === 'tour') {
        graveyard.push({ kind: 'tour', entry: g.entry, buriedAt: now });
        patch.visited = {};
      }
    }
    patch.graveyard = graveyard;
    st().set(patch);
  }

  function labelFor(gy) {
    var e = gy.entry || {};
    if (gy.kind === 'sigils') return 'the cast buddy' + (e.name ? ' — ' + e.name : '');
    if (gy.kind === 'buddy') return 'one you carried' + (e.name ? ' — ' + e.name : '');
    if (gy.kind === 'tour') return 'the tour, remembered';
    return gy.kind;
  }

  function readdToState(gy) {
    var s = st().get();
    if (gy.kind === 'sigils') {
      st().set({ sigils: (s.sigils || []).concat([gy.entry]) });
    } else if (gy.kind === 'buddy') {
      st().set({ buddy: (s.buddy || []).concat([gy.entry]) });
    } else if (gy.kind === 'tour') {
      var restored = gy.entry && gy.entry.visited ? gy.entry.visited : {};
      st().set({ visited: Object.assign({}, s.visited || {}, restored) });
    }
  }

  function renderDigList() {
    var list = document.getElementById('trash-dig-list');
    if (!list || !st()) return;
    var graveyard = st().get().graveyard || [];
    list.innerHTML = '';
    if (!graveyard.length) {
      var empty = document.createElement('div');
      empty.className = 'trash-dig-empty';
      empty.textContent = 'the soil keeps nothing. yet.';
      list.appendChild(empty);
      return;
    }
    for (var i = 0; i < graveyard.length; i++) {
      (function (idx) {
        var gy = graveyard[idx];
        var row = document.createElement('div');
        row.className = 'trash-dig-row';
        var label = document.createElement('span');
        label.className = 'trash-dig-label';
        label.textContent = labelFor(gy);
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'trash-action trash-dig-btn';
        btn.textContent = 'dig it up';
        btn.addEventListener('click', function () {
          if (!st()) return;
          var cur = st().get().graveyard || [];
          if (idx >= cur.length) return;
          readdToState(cur[idx]);
          st().set({ graveyard: cur.filter(function (_, n) { return n !== idx; }) });
          flash('it returns.');
          renderDigList();
          if (window.Liber && window.Liber.sound) window.Liber.sound.play('chime');
        });
        row.appendChild(label);
        row.appendChild(btn);
        list.appendChild(row);
      })(i);
    }
  }

  function openBuryPrompt() {
    var prompt = document.getElementById('trash-save-prompt');
    var body = document.getElementById('trash-save-prompt-body');
    if (prompt && body) {
      pendingBury = { kind: 'all' };
      body.innerHTML = 'bury <em>everything</em>? the soil keeps it all. dig it up later.';
      prompt.classList.add('open');
      prompt.removeAttribute('inert');
    } else {
      commitFor('all');
    }
  }

  function commitFor(kind) {
    if (!st()) return;
    if (kind === 'all') {
      commitBury(snapshotAll());
      flash('the room is clean. the soil is full.');
    }
    renderDigList();
  }

  var pendingBury = null;

  function closePrompt() {
    var prompt = document.getElementById('trash-save-prompt');
    if (!prompt) return;
    prompt.classList.remove('open');
    prompt.setAttribute('inert', '');
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

    var b4 = document.getElementById('trash-bury-all');
    if (b4) b4.addEventListener('click', function () { openBuryPrompt(); });

    var prompt = document.getElementById('trash-save-prompt');
    var buryBtn = document.getElementById('trash-save-prompt-keep');
    var cancelBtn = document.getElementById('trash-save-prompt-discard');
    var closeBtn = document.getElementById('trash-save-prompt-close');
    if (buryBtn) buryBtn.addEventListener('click', function () {
      var p = pendingBury;
      closePrompt();
      if (!p) return;
      commitFor(p.kind);
      if (window.Liber && window.Liber.sound) window.Liber.sound.play('thunk');
    });
    if (cancelBtn) cancelBtn.addEventListener('click', closePrompt);
    if (closeBtn) closeBtn.addEventListener('click', closePrompt);
    if (prompt) {
      prompt.addEventListener('click', function (e) { if (e.target === prompt) closePrompt(); });
      prompt.setAttribute('inert', '');
    }

    renderDigList();
    if (st()) st().on('change', renderDigList);

    var helpBtn = document.getElementById('trash-help');
    var raison = document.getElementById('trash-raison');
    var raisonClose = document.getElementById('trash-raison-close');
    function openRaison() {
      if (raison) { raison.classList.add('open'); raison.removeAttribute('inert'); }
    }
    function closeRaison() {
      if (raison) { raison.classList.remove('open'); raison.setAttribute('inert', ''); }
    }
    if (helpBtn) helpBtn.addEventListener('click', openRaison);
    if (raisonClose) raisonClose.addEventListener('click', closeRaison);
    if (raison) raison.addEventListener('click', function (e) { if (e.target === raison) closeRaison(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && raison && raison.classList.contains('open')) closeRaison();
    });
  });
})();
