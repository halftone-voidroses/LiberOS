// shadow.js — global page setup. Applies tutorialDone, theme, visited-N
// classes to the machine on DOMContentLoaded and on state change.
// Phase 8: the secret "extc" key listener moved to sea.js (sea-only).

(function () {
  function applyTutorialDone(s) {
    var stage = document.getElementById('desktop');
    if (!stage) return;
    if (s && s.tutorialDone) stage.classList.add('tutorial-done');
    else stage.classList.remove('tutorial-done');
  }

  function applyTheme(s) {
    var m = document.querySelector('.machine');
    if (!m || !s) return;
    var theme = s.theme || 'corrupted';
    var stale = [];
    for (var i = 0; i < m.classList.length; i++) {
      if (m.classList[i].indexOf('theme-') === 0) stale.push(m.classList[i]);
    }
    for (var j = 0; j < stale.length; j++) m.classList.remove(stale[j]);
    m.classList.add('theme-' + theme);
    if (window.Liber && window.Liber.carvings) window.Liber.carvings.setActive(theme);
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (window.Liber && window.Liber.state) {
      var s = window.Liber.state.get() || {};
      var m = document.querySelector('.machine');
      if (m) {
        if (s.shadowOn) m.classList.add('shadow-on');
        var n = Object.keys(s.visited || {}).length;
        if (n >= 12) m.classList.add('visited-12');
        else if (n >= 9) m.classList.add('visited-9');
        else if (n >= 6) m.classList.add('visited-6');
        else if (n >= 3) m.classList.add('visited-3');
        var theme = s.theme || 'corrupted';
        m.classList.add('theme-' + theme);
      }
      applyTutorialDone(s);
      if (window.Liber.state.on) {
        window.Liber.state.on('change', applyTutorialDone);
        window.Liber.state.on('change', applyTheme);
      }
    }
  });
})();