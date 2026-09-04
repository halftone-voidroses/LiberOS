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
      { kind: 'cohort', entries: (s.cohort || []).slice() },
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
      } else if (g.kind === 'cohort') {
        for (var k = 0; k < g.entries.length; k++) {
          graveyard.push({ kind: 'cohort', entry: g.entries[k], buriedAt: now });
        }
        patch.cohort = [];
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
    if (gy.kind === 'sigils') return 'the cast cohort' + (e.name ? ' — ' + e.name : '');
    if (gy.kind === 'cohort') return 'one you carried' + (e.name ? ' — ' + e.name : '');
    if (gy.kind === 'tour') return 'the tour, remembered';
    return gy.kind;
  }

  function readdToState(gy) {
    var s = st().get();
    if (gy.kind === 'sigils') {
      st().set({ sigils: (s.sigils || []).concat([gy.entry]) });
    } else if (gy.kind === 'cohort') {
      st().set({ cohort: (s.cohort || []).concat([gy.entry]) });
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

  function openBuryPrompt(kind) {
    var prompt = document.getElementById('trash-save-prompt');
    var body = document.getElementById('trash-save-prompt-body');
    if (prompt && body) {
      pendingBury = { kind: kind };
      if (kind === 'sigils') body.innerHTML = 'bury <em>the cast cohort</em>? the soil keeps it. dig it up later.';
      else if (kind === 'cohort') body.innerHTML = 'bury <em>those you carry</em>? the soil keeps them. dig them up later.';
      else if (kind === 'tour') body.innerHTML = 'bury <em>the tour</em>? the soil keeps it. dig it up later.';
      else if (kind === 'all') body.innerHTML = 'bury <em>everything</em>? the soil keeps it all. dig it up later.';
      prompt.classList.add('open');
      prompt.removeAttribute('inert');
    } else {
      commitFor(kind);
    }
  }

  function commitFor(kind) {
    if (!st()) return;
    if (kind === 'sigils') {
      commitBury(snapshotAll().filter(function (g) { return g.kind === 'sigils'; }));
      flash('the cohort is loam.');
    } else if (kind === 'cohort') {
      commitBury(snapshotAll().filter(function (g) { return g.kind === 'cohort'; }));
      flash('those you carried are loam.');
    } else if (kind === 'tour') {
      commitBury(snapshotAll().filter(function (g) { return g.kind === 'tour'; }));
      flash('the tour is forgotten. not gone.');
    } else if (kind === 'all') {
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

    var b1 = document.getElementById('trash-bury-sigils');
    var b2 = document.getElementById('trash-bury-cohort');
    var b3 = document.getElementById('trash-bury-tour');
    var b4 = document.getElementById('trash-bury-all');
    if (b1) b1.addEventListener('click', function () { openBuryPrompt('sigils'); });
    if (b2) b2.addEventListener('click', function () { openBuryPrompt('cohort'); });
    if (b3) b3.addEventListener('click', function () { openBuryPrompt('tour'); });
    if (b4) b4.addEventListener('click', function () { openBuryPrompt('all'); });

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
  });
})();
