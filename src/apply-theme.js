// apply-theme.js — the desktop (and any room that includes this file)
// wears the persisted machine skin. Themes live in
// src/features/themes/themes.js; the classes live in styles/machine.css.

(function () {
  'use strict';

  var IDS = ['corrupted', 'wanderlust', 'riason', 'physius', 'whimsy',
    'vanir', 'entity404', 'arcana', 'librarian', 'elizabeth', 'iris',
    'ravaging', 'royalty', 'clean', 'shadow', 'mono', 'gold'];

  function paint() {
    var machine = document.querySelector('.machine');
    if (!machine) return;
    var s = (window.Liber && window.Liber.state && window.Liber.state.get()) || {};
    var theme = s.theme || 'corrupted';
    for (var i = 0; i < IDS.length; i++) machine.classList.remove('theme-' + IDS[i]);
    machine.classList.add('theme-' + theme);
  }

  function init() {
    paint();
    var st = window.Liber && window.Liber.state;
    if (st && st.on) st.on('change', paint);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
