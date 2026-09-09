// shadow.js — global page setup. Applies tutorialDone, theme, visited-N
// classes to the machine on DOMContentLoaded and on state change.
// WS5 presence: patina-N (visits+artifacts — the room accumulates, absence
// changes nothing) and buddy-N (artifacts+relations — the buddy becomes
// louder) classes. Tier math is inline because shadow.js loads on every page
// while src/gamification.js is desktop-only; thresholds mirror it and
// src/prompt-engine.js buddyLevel().
// Phase 8: the secret "extc" key listener moved to sea.js (sea-only).

(function () {
  var PATINA_TIERS = [2, 6, 12];   // visits + artifacts
  var BUDDY_TIERS = [2, 6, 12];   // artifacts + relations
  var ARTIFACT_KINDS = ['divination', 'iching', 'games', 'sea', 'buddy', 'learn', 'council'];

  function tierLevel(n, tiers) {
    var level = 0;
    for (var i = 0; i < tiers.length; i++) {
      if (n >= tiers[i]) level = i + 1;
    }
    return level;
  }

  function setTierClass(m, prefix, level) {
    var stale = [];
    for (var i = 0; i < m.classList.length; i++) {
      if (m.classList[i].indexOf(prefix) === 0) stale.push(m.classList[i]);
    }
    for (var j = 0; j < stale.length; j++) m.classList.remove(stale[j]);
    if (level > 0) m.classList.add(prefix + level);
  }

  function applyPresence(s) {
    var m = document.querySelector('.machine');
    if (!m || !s) return;
    var visits = Object.keys(s.visited || {}).length;
    var artifacts = 0;
    for (var i = 0; i < ARTIFACT_KINDS.length; i++) {
      if (Array.isArray(s[ARTIFACT_KINDS[i]])) artifacts += s[ARTIFACT_KINDS[i]].length;
    }
    var relations = (s.relations || []).length;
    setTierClass(m, 'patina-', tierLevel(visits + artifacts, PATINA_TIERS));
    setTierClass(m, 'buddy-', tierLevel(artifacts + relations, BUDDY_TIERS));
  }

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
      applyPresence(s);
      applyTutorialDone(s);
      if (window.Liber.state.on) {
        window.Liber.state.on('change', applyTutorialDone);
        window.Liber.state.on('change', applyTheme);
        window.Liber.state.on('change', applyPresence);
      }
    }
  });
})();
