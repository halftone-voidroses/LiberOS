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
    renderScape();
  }

  // WS4: mute toggle — the `sounds` flag lives in state.js DEFAULT.
  function renderSound() {
    var b = document.getElementById('settings-sound');
    if (!b) return;
    var on = (window.Liber && window.Liber.sound) ? window.Liber.sound.isEnabled() : true;
    b.textContent = 'sound: ' + (on ? 'on' : 'off');
  }

  function toggleSound() {
    var nowOn = true;
    if (window.Liber && window.Liber.sound) {
      nowOn = !window.Liber.sound.isEnabled();
      window.Liber.sound.setEnabled(nowOn);
    }
    renderSound();
    if (window.Liber && window.Liber.soundscape) {
      try { window.Liber.soundscape.refresh(); } catch (e) {}
    }
    // Audible confirmation: the toggle itself answers when sound is on.
    if (nowOn && window.Liber && window.Liber.sound) {
      try { window.Liber.sound.play('chime'); } catch (e) {}
    }
  }

  function scapeLevels() {
    var st = (window.Liber && window.Liber.state) || null;
    var g = st ? st.get() || {} : {};
    var c = g.scape || {};
    var music = (c.music == null ? 80 : +c.music);
    if (isNaN(music)) music = 80;
    return {
      on: c.on !== false,
      bed: c.bed == null ? 2 : Math.max(0, Math.min(3, c.bed | 0)),
      motif: c.motif == null ? 2 : Math.max(0, Math.min(3, c.motif | 0)),
      music: Math.max(0, Math.min(100, music))
    };
  }

  function setScape(patch) {
    var st = (window.Liber && window.Liber.state) || null;
    if (!st) return;
    var g = st.get() || {};
    st.set({ scape: Object.assign({}, g.scape, patch) });
    renderScape();
    if (window.Liber && window.Liber.soundscape) {
      try { window.Liber.soundscape.refresh(); } catch (e) {}
    }
  }

  var TRACK_LABELS = {
    wanderlust: 'wanderlust ritual (summoning)',
    riason: 'riason part (tour)',
    main: 'main theme',
    buddy: 'buddy creation',
    vanir: 'vanir (sea)'
  };

  function renderScape() {
    var c = scapeLevels();
    var t = document.getElementById('settings-scape');
    var b = document.getElementById('settings-bed');
    var m = document.getElementById('settings-motif');
    if (t) t.textContent = 'room tone: ' + (c.on ? 'on' : 'off');
    if (b) b.textContent = 'bed: ' + c.bed;
    if (m) m.textContent = 'motifs: ' + c.motif;
    var slider = document.getElementById('settings-music');
    var val = document.getElementById('settings-music-val');
    if (slider && document.activeElement !== slider) slider.value = String(c.music);
    if (val) val.textContent = String(c.music);
    var now = document.getElementById('settings-now');
    if (now) {
      var track = null;
      try { track = (window.Liber && window.Liber.soundscape && window.Liber.soundscape.track) ? window.Liber.soundscape.track() : null; } catch (e) { track = null; }
      now.textContent = 'now playing: ' + (track && TRACK_LABELS[track] ? TRACK_LABELS[track] : '—');
    }
  }

  function setMusic(v) {
    if (window.Liber && window.Liber.soundscape && window.Liber.soundscape.setMusic) {
      try { window.Liber.soundscape.setMusic(v); } catch (e) {}
    } else {
      setScape({ music: Math.max(0, Math.min(100, Math.round(+v))) });
      return;
    }
    renderScape();
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
    try { localStorage.removeItem('liber_vacui_consent'); } catch (e) {}
    if (window.Liber && window.Liber.sound) window.Liber.sound.play('thunk');
    renderState();
  }

  function slotSummary(id) {
    var raw = null;
    try {
      raw = localStorage.getItem('liber_vacui_v1__' + id);
      if (!raw && id === 'keep') raw = localStorage.getItem('liber_vacui_v1');
      if (!raw) return 'empty';
      var s = JSON.parse(raw);
      var kinds = ['buddy', 'divination', 'games', 'learn', 'abstract', 'sea', 'garden', 'dreams', 'satchel', 'methodology'];
      var n = 0, i;
      for (i = 0; i < kinds.length; i++) if (Array.isArray(s[kinds[i]])) n += s[kinds[i]].length;
      return (n ? n + ' kept' : 'empty') + (s.tutorialDone ? '' : ' · new');
    } catch (e) { return ''; }
  }

  function paintSlots() {
    var cur = null;
    try {
      var st0 = (window.Liber && window.Liber.state) || null;
      cur = st0 && st0.getSlot ? st0.getSlot() : 'keep';
    } catch (e) { cur = 'keep'; }
    var btns = document.querySelectorAll('[data-slot]');
    for (var i = 0; i < btns.length; i++) {
      (function (b) {
        var id = b.getAttribute('data-slot');
        var base = b.textContent.split(' — ')[0];
        b.textContent = base + ' — ' + slotSummary(id);
        if (id === cur) b.classList.add('on');
        else b.classList.remove('on');
      })(btns[i]);
    }
  }
  function back() {
    if (window.history.length > 1) window.history.back();
    else window.location.href = 'desktop.html';
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderState();
    paintSlots();
    var r = document.getElementById('settings-replay');
    var s = document.getElementById('settings-shadow');
    var sd = document.getElementById('settings-sound');
    var w = document.getElementById('settings-wipe');
    var b = document.getElementById('settings-back');
    if (r) r.addEventListener('click', replay);
    if (s) s.addEventListener('click', toggleShadow);
    if (sd) sd.addEventListener('click', toggleSound);
    var sc = document.getElementById('settings-scape');
    var bd = document.getElementById('settings-bed');
    var mo = document.getElementById('settings-motif');
    if (sc) sc.addEventListener('click', function () {
      var c = scapeLevels();
      setScape({ on: !c.on });
    });
    if (bd) bd.addEventListener('click', function () {
      var c2 = scapeLevels();
      setScape({ bed: (c2.bed + 1) % 4 });
    });
    if (mo) mo.addEventListener('click', function () {
      var c3 = scapeLevels();
      setScape({ motif: (c3.motif + 1) % 4 });
    });
    var slider = document.getElementById('settings-music');
    if (slider) {
      slider.addEventListener('input', function () { setMusic(slider.value); });
      slider.addEventListener('change', function () { setMusic(slider.value); });
    }
    if (w) w.addEventListener('click', wipe);
    if (b) b.addEventListener('click', back);
    // The OST starts on first gesture; refresh the "now playing" line then.
    document.addEventListener('pointerdown', function () { setTimeout(renderScape, 600); });
    document.addEventListener('keydown', function () { setTimeout(renderScape, 600); });
    setTimeout(renderScape, 1500);
    var slotBtns = document.querySelectorAll('[data-slot]');
    for (var si = 0; si < slotBtns.length; si++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var st = (window.Liber && window.Liber.state) || null;
          if (st && st.setSlot) st.setSlot(btn.getAttribute('data-slot'));
        });
      })(slotBtns[si]);
    }
  });
})();
