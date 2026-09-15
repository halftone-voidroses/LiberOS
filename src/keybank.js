// keybank.js — HOME CONSOLE · 3 × 4 · KEYBANK 03
// Replacement for the radial dial (src/dial.js) on the desktop homescreen,
// per homescreen-pitches.html REV D §01 + §04 pass one.
// Stable physical order, no popup index, no long-press: twelve sockets,
// eleven doors + one struck blanking plug. Pressed = sits low, visited =
// spent ember lamp, locked = struck plug / crossed sigil. Sound-off and
// reduced-motion carry state in cap + lamp alone.
// Reads state.visited + stone lock, writes visited + thimble (same as dial).

(function () {
  'use strict';

  // HOME first, then the ten rooms in dial order, then the reserved socket.
  // id: state key + destination page. label: enamel legend on the cap.
  var KEYS = [
    { id: 'home',       label: 'home',       page: null,             acc: '#d6ae5d', home: true },
    { id: 'sigil',      label: 'buddy',      page: 'sigil.html',     acc: '#aa5a18' },
    { id: 'journal',    label: 'journal',    page: 'journal.html',   acc: '#aa7838' },
    { id: 'sea',        label: 'sea',        page: 'sea.html',        acc: '#2a8a8a' },
    { id: 'games',      label: 'games',      page: 'games.html',      acc: '#d4af37' },
    { id: 'toybox',     label: 'toybox',     page: 'toybox.html',     acc: '#d88a3c' },
    { id: 'divination', label: 'divination', page: 'divination.html', acc: '#f4e8d2' },
    { id: 'learn',      label: 'learn',      page: 'learn.html',      acc: '#e05a5a' },
    { id: 'garden',     label: 'garden',     page: 'garden.html',     acc: '#d88a4a' },
    { id: 'dreams',     label: 'dreams',     page: 'dreams.html',     acc: '#a48ad4' },
    { id: 'trash',      label: 'trash',      page: 'trash.html',      acc: '#a88858' },
    { id: 'blank',      label: '—',          page: null,             acc: '#6f6657', blank: true }
  ];

  var grid = null, statusEl = null, selectedIdx = 0;

  function getState() {
    return (window.Liber && window.Liber.state && window.Liber.state.get()) || {};
  }

  function alive() {
    var s = getState();
    return !!(s.tutorialDone || s.keysNamed);
  }

  function isSigilLocked() {
    var s = getState();
    return ((s.buddy || []).some(function (e) { return e && e.kind === 'stone'; }));
  }

  function hexGlow(hex) {
    // #rrggbb -> rgba(...,0.42) lamp bloom
    var m = /^#([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return 'rgba(200,168,120,0.42)';
    var n = parseInt(m[1], 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',0.42)';
  }

  function visit(key) {
    var s = getState();
    if (window.Liber && window.Liber.state) {
      var visited = Object.assign({}, s.visited);
      if (key.id !== 'home' && key.id !== 'blank') visited[key.id] = Date.now();
      var patch = { visited: visited };
      var th = s.thimble || { visits: 0, base: 0, harvested: 0 };
      patch.thimble = { visits: (th.visits || 0) + 1, base: th.base || 0, harvested: th.harvested || 0 };
      window.Liber.state.set(patch);
    }
    if (key.page) window.location.href = key.page;
    else render();
  }

  function press(idx, focus) {
    var key = KEYS[idx];
    if (!key) return;
    if (!alive()) {
      say('keys quiet · not yet named');
      render();
      return;
    }
    selectedIdx = idx;
    if (key.blank) {
      say('socket 12 / reserved · no destination');
      render();
      return;
    }
    if (key.home) {
      say('home / ready');
      render();
      return;
    }
    if (focus) say(key.label + ' / ready');
    visit(key);
  }

  function say(t) {
    if (statusEl) statusEl.textContent = t;
  }

  function render() {
    if (!grid) return;
    grid.innerHTML = '';
    var isAlive = alive();
    grid.classList.toggle('inert', !isAlive);
    if (!isAlive) say('keys quiet · not yet named');
    var locked = isSigilLocked();
    var visitedMap = getState().visited || {};
    KEYS.forEach(function (key, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'keybank-key' + (key.home ? ' home-key' : '') + (key.blank ? ' blank-key' : '');
      if (i === selectedIdx && !key.blank) b.classList.add('active');
      if (visitedMap[key.id]) b.classList.add('visited');
      if (key.id === 'sigil' && locked) b.classList.add('crossed');
      b.dataset.id = key.id;
      b.id = 'keybank-' + key.id;
      b.style.setProperty('--accent', key.acc);
      b.style.setProperty('--glow', hexGlow(key.acc));
      b.setAttribute('aria-label', key.home ? 'return home' : key.blank ? 'reserved room socket' : 'switch to ' + key.label);
      if (!isAlive) b.setAttribute('aria-disabled', 'true');
      else if (key.blank) b.setAttribute('aria-disabled', 'true');
      var lamp = document.createElement('span');
      lamp.className = 'keybank-lamp';
      lamp.setAttribute('aria-hidden', 'true');
      var lab = document.createElement('span');
      lab.className = 'keybank-label';
      lab.textContent = key.label;
      b.appendChild(lamp);
      b.appendChild(lab);
      if (!key.blank) {
        b.addEventListener('click', function () { press(i, false); });
      } else {
        b.addEventListener('click', function () { press(i, false); });
      }
      grid.appendChild(b);
    });
  }

  function move(dRow, dCol) {
    var cols = 4;
    var r = Math.floor(selectedIdx / cols), c = selectedIdx % cols;
    r = (r + dRow + 3) % 3;
    c = (c + dCol + cols) % cols;
    selectedIdx = r * cols + c;
    render();
    var el = grid && grid.children[selectedIdx];
    if (el) el.focus();
  }

  function init() {
    grid = document.getElementById('keybank');
    if (!grid) return;
    statusEl = document.getElementById('keybank-status');
    // Open on the room entered last — its lamp is the one lit on return.
    var s = getState();
    var latestId = null, latestTs = 0;
    var visitedMap = s.visited || {};
    for (var vid in visitedMap) {
      if (visitedMap[vid] > latestTs) { latestTs = visitedMap[vid]; latestId = vid; }
    }
    if (latestId) {
      for (var i = 0; i < KEYS.length; i++) {
        if (KEYS[i].id === latestId) { selectedIdx = i; break; }
      }
    }
    render();
    document.addEventListener('keydown', function (e) {
      if (!grid.contains(document.activeElement)) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); move(0, -1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); move(0, 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1, 0); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); move(1, 0); }
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        press(selectedIdx, true);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  if (window.Liber && window.Liber.state && window.Liber.state.on) {
    window.Liber.state.on('change', render);
  }

  window.KeybankRefresh = function () { render(); };
  // Back-compat: verifiers + any room code calling the old dial hook.
  window.DialRefresh = function () { render(); };
})();
