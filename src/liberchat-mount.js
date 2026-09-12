// liberchat-mount.js — injects the lamp + stylesheet + engine on every page.
// Loaded last so the lamp sits above room overlays. Retired chat surfaces
// (buddy/cohort) mount the lamp in archive mode pointing at the machine.
(function () {
  'use strict';
  var head = document.head;
  if (!head) return;

  if (!head.querySelector('link[data-liberchat]')) {
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'styles/liberchat.css';
    css.setAttribute('data-liberchat', '1');
    head.appendChild(css);
  }

  var page = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '');
  if (page === 'buddy' || page === 'cohort') {
    // The old chat pages retired to archive notes pointing at the lamp.
    var note = document.createElement('aside');
    note.className = 'lc-archive-note';
    note.innerHTML =
      '<h1>' + (page === 'buddy' ? 'the wax room is now the lamp' : 'the cohort is now the lamp') + '</h1>' +
      '<p>e-lizabeth and the whole cohort moved into liberchat — the small lamp in the corner of every page. ' +
      'Open it, choose a persona, and talk. Conversations still seal in wax.</p>';
    document.body.appendChild(note);
  }

  function mount() {
    if (window.LiberLiberchat) return;
    // Only desktop.html ships the persona register; every other page needs
    // it before the engine can resolve travellers.
    function engine() {
      if (window.LiberLiberchat) return;
      var s = document.createElement('script');
      s.src = 'src/liberchat.js';
      s.setAttribute('data-liberchat', '1');
      document.body.appendChild(s);
    }
    if (window.LIBER_DATA && window.LIBER_DATA.personas) { engine(); return; }
    var d = document.createElement('script');
    d.src = 'data/personas.data.js';
    d.setAttribute('data-liberchat', '1');
    d.onload = engine;
    document.body.appendChild(d);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
