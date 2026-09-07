// settings.js — The room's room. Tutorial replay, shadow toggle, wipe.
// No shared imports (covenant Q.1).

(function () {
  function renderState() {
    var s = (window.Liber && window.Liber.state && window.Liber.state.get()) || {};
    var out = [];
    out.push('tutorialDone: ' + !!s.tutorialDone);
    out.push('stone: ' + ((s.buddy || []).filter(function (e) { return e && e.kind === 'stone'; }).length));
    out.push('sealed: ' + ((s.buddy || []).filter(function (e) { return !e || e.kind !== 'stone'; }).length));
    out.push('visited: ' + Object.keys(s.visited || {}).length + ' visitor' + (Object.keys(s.visited || {}).length === 1 ? '' : 's'));
    out.push('shadowOn: ' + !!s.shadowOn);
    out.push('shadowUnlocked: ' + !!s.shadowUnlocked);
    var el = document.getElementById('settings-state');
    if (el) el.textContent = out.join('\n');

    var machine = document.querySelector('.machine');
    var sb = document.getElementById('settings-shadow');
    if (sb) {
      var on = machine && machine.classList.contains('shadow-on');
      sb.textContent = on ? '— step back from shadow —' : '— step into shadow —';
    }

    renderSound();
  }

  // WS4: mute toggle — the `sounds` flag lives in state.js DEFAULT.
  function renderSound() {
    var b = document.getElementById('settings-sound');
    if (!b) return;
    var on = (window.Liber && window.Liber.sound) ? window.Liber.sound.isEnabled() : true;
    b.textContent = 'sound: ' + (on ? 'on' : 'off');
  }

  function toggleSound() {
    if (window.Liber && window.Liber.sound) {
      window.Liber.sound.setEnabled(!window.Liber.sound.isEnabled());
    }
    renderSound();
  }

  function replay() {
    if (window.Liber && window.Liber.state) {
      window.Liber.state.set({ tutorialDone: false, tutorialStage: null });
    }
    window.location.href = 'desktop.html';
  }

  function toggleShadow() {
    var machine = document.querySelector('.machine');
    if (!machine) return;
    machine.classList.toggle('shadow-on');
    if (window.Liber && window.Liber.state) {
      window.Liber.state.set({ shadowOn: machine.classList.contains('shadow-on') });
    }
    renderState();
  }

  var wipeArmed = false, wipeTimer = null;
  function wipe() {
    var btn = document.getElementById('settings-wipe');
    if (!wipeArmed) {
      wipeArmed = true;
      if (btn) btn.textContent = 'click again — wipe the room. this cannot be undone.';
      wipeTimer = setTimeout(function () {
        wipeArmed = false;
        if (btn) btn.textContent = 'wipe the room';
      }, 5000);
      return;
    }
    if (wipeTimer) clearTimeout(wipeTimer);
    wipeArmed = false;
    if (btn) btn.textContent = 'wipe the room';
    if (window.Liber && window.Liber.state) window.Liber.state.reset();
    if (window.Liber && window.Liber.sound) window.Liber.sound.play('thunk');
    renderState();
  }

  function back() {
    if (window.history.length > 1) window.history.back();
    else window.location.href = 'desktop.html';
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderState();
    var r = document.getElementById('settings-replay');
    var s = document.getElementById('settings-shadow');
    var sd = document.getElementById('settings-sound');
    var w = document.getElementById('settings-wipe');
    var b = document.getElementById('settings-back');
    if (r) r.addEventListener('click', replay);
    if (s) s.addEventListener('click', toggleShadow);
    if (sd) sd.addEventListener('click', toggleSound);
    if (w) w.addEventListener('click', wipe);
    if (b) b.addEventListener('click', back);
  });
})();
