// themes.js — pick the skin of the machine. Each theme is a class
// swapped onto .machine. The covenant keeps these classes off the
// body of any traveler app.
//
// Three behaviours live here:
//   preview  hovering / focusing a tile wears that skin for real — same
//            class swap, same grade, same carving light — without writing
//            state, so what you see is exactly what you commit.
//   commit   click writes state.theme, then washes the screen through the
//            pigment (instant under prefers-reduced-motion).
//   rainy    a weather, not a skin: the tile toggles state.shadowOn, the
//            single owner the settings panel and the CRT room also read.

(function () {
  var THEMES = [
    { id: 'corrupted',    name: 'corrupted',        wash: '#aa3018', blurb: 'the default · red, faded, drifting.',                 opinion: 'this is the room i was born in. i love it. i cannot leave it.' },
    { id: 'wanderlust',    name: 'wanderlust',       wash: '#ff69b4', blurb: 'pink & yellow · the summoning.',                    opinion: 'me. i painted it. i do not know why it smells of candy.' },
    { id: 'riason',        name: 'riason',           wash: '#6a4aff', blurb: 'blue & violet · the observer.',                      opinion: 'the observer observes himself observing. i tire of him.' },
    { id: 'physius',       name: 'mistress physius', wash: '#aa5a18', blurb: 'copper & obsidian · the stone.',                     opinion: 'a patient skin. she does not interrupt the work.' },
    { id: 'whimsy',        name: 'whimsy wow',       wash: '#aa1018', blurb: 'red & cream · the barker.',                          opinion: 'too loud for the void, too bright for me. i stay anyway.' },
    { id: 'vanir',         name: 'vanir',            wash: '#2a8a8a', blurb: 'deep blue & sea green · the deep.',                  opinion: 'i have drowned in this colour. i will drown in it again.' },
    { id: 'entity404',     name: 'entity404',        wash: '#00ff66', blurb: 'green & black · the void.',                          opinion: 'the void is patient. the void does not gossip about me.' },
    { id: 'arcana',        name: 'arcana',           wash: '#e8dcc0', blurb: 'chalk white & black · the deck.',                    opinion: 'the deck tells me what i already knew. i thank it.' },
    { id: 'librarian',     name: 'riason · the ledger', wash: '#d4af6a', blurb: 'sepia & brass · the drawers.',                    opinion: 'the drawers keep what i forget. i am grateful. i filed the thanks.' },
    { id: 'elizabeth',     name: 'e-lizabeth',       wash: '#aa8a3a', blurb: 'gothic gold · the linked.',                          opinion: 'gold is what was married and mourned. she carries both.' },
    { id: 'iris',          name: 'wanderlust · the pigment', wash: '#4a2810', blurb: 'parchment & ink · the cartographer.',         opinion: 'the map is never of the place. i repainted it anyway.' },
    { id: 'ravaging',      name: 'ravaging pete',    wash: '#8a4818', blurb: 'loam & rust · the rubble.',                         opinion: 'everything i buried here i find again. this is its charm.' },
    { id: 'royalty',       name: 'royalty',          wash: '#7a3aaa', blurb: 'deep purple & gold · the throne. high contrast, no red-green distinction needed.', opinion: 'a throne room at last. sit up straight, traveller.' }
  ];

  var committed = 'corrupted';
  var previewing = null;

  function themeById(id) {
    for (var i = 0; i < THEMES.length; i++) if (THEMES[i].id === id) return THEMES[i];
    return null;
  }

  function current() {
    var s = (window.Liber && window.Liber.state && window.Liber.state.get()) || {};
    return themeById(s.theme) ? s.theme : 'corrupted';
  }

  function reduced() {
    try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
  }

  // Wearing a skin = machine class + the page's grade attribute + the
  // carving lit above the bezel. Deliberately the same three writes
  // apply-theme.js makes, so preview and commit cannot drift apart.
  function setSkin(theme) {
    var machine = document.querySelector('.machine');
    if (machine) {
      var cls = String(machine.className || '').split(/\s+/);
      for (var i = 0; i < cls.length; i++) {
        if (cls[i].indexOf('theme-') === 0) machine.classList.remove(cls[i]);
      }
      machine.classList.add('theme-' + theme);
    }
    try { document.body.setAttribute('data-theme', theme); } catch (e) {}
    if (window.Liber && window.Liber.carvings) window.Liber.carvings.setActive(theme);
  }

  function paintCommitted() {
    var label = document.getElementById('themes-current-value');
    if (label) label.textContent = committed;
    var btns = document.querySelectorAll('.themes-tile');
    for (var j = 0; j < btns.length; j++) {
      var id = btns[j].getAttribute('data-theme');
      if (id === committed) btns[j].classList.add('active');
      else if (id) btns[j].classList.remove('active');
    }
  }

  function preview(id) {
    if (!id || id === committed) { endPreview(); return; }
    previewing = id;
    setSkin(id);
    var label = document.getElementById('themes-current-value');
    if (label) label.textContent = id + ' · not yet worn';
  }

  function endPreview() {
    if (!previewing) return;
    previewing = null;
    setSkin(committed);
    paintCommitted();
  }

  // The commit wash — the machine drinks the pigment and the tint fades
  // back. Reduced motion takes the instant path: no element, no animation.
  function wash(theme) {
    if (reduced()) return;
    var screen = document.querySelector('.screen');
    if (!screen) return;
    var old = screen.querySelector('.themes-wash');
    if (old && old.parentNode) old.parentNode.removeChild(old);
    var t = themeById(theme);
    var w = document.createElement('div');
    w.className = 'themes-wash';
    w.setAttribute('aria-hidden', 'true');
    w.style.setProperty('--wash', (t && t.wash) || '#d4af37');
    screen.appendChild(w);
    var cleared = false;
    function clear() {
      if (cleared) return;
      cleared = true;
      if (w.parentNode) w.parentNode.removeChild(w);
    }
    w.addEventListener('animationend', clear);
    setTimeout(clear, 1000);
  }

  function apply(theme) {
    if (!themeById(theme)) theme = 'corrupted';
    previewing = null;
    committed = theme;
    setSkin(theme);
    if (window.Liber && window.Liber.state) window.Liber.state.set({ theme: theme });
    paintCommitted();
    wash(theme);
  }

  // ── rainy day: a weather, not a skin ─────────────────────────────────
  // One owner (state.shadowOn) shared with the settings panel and the CRT
  // room, so the tile, the switch, and the room-behind always agree.
  function rainyOn() {
    var m = document.querySelector('.machine');
    return !!(m && m.classList.contains('shadow-on'));
  }

  function paintRainy() {
    var t = document.getElementById('themes-rainy-tile');
    if (!t) return;
    var on = rainyOn();
    t.classList.toggle('active', on);
    t.setAttribute('aria-pressed', on ? 'true' : 'false');
  }

  function toggleRainy() {
    var machine = document.querySelector('.machine');
    if (!machine) return;
    machine.classList.toggle('shadow-on');
    var on = machine.classList.contains('shadow-on');
    if (window.Liber && window.Liber.state) window.Liber.state.set({ shadowOn: on });
    paintRainy();
  }

  function build() {
    var grid = document.getElementById('themes-grid');
    if (!grid) return;
    grid.innerHTML = '';
    for (var i = 0; i < THEMES.length; i++) {
      (function (t) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'themes-tile';
        btn.setAttribute('data-theme', t.id);
        btn.innerHTML =
          '<div class="themes-swatch themes-swatch-' + t.id + '"></div>' +
          '<div class="themes-tile-name">' + t.name + '</div>' +
          '<div class="themes-tile-blurb">' + t.blurb + '</div>' +
          '<div class="themes-tile-opinion">— ' + t.opinion + '</div>';
        btn.addEventListener('mouseenter', function () { preview(t.id); });
        btn.addEventListener('focus', function () { preview(t.id); });
        btn.addEventListener('blur', endPreview);
        btn.addEventListener('click', function () { apply(t.id); });
        grid.appendChild(btn);
      })(THEMES[i]);
    }

    // Rainy Day — rain-banded tile, sitting last in the locker.
    var rain = document.createElement('button');
    rain.type = 'button';
    rain.className = 'themes-tile themes-tile-rainy';
    rain.id = 'themes-rainy-tile';
    rain.setAttribute('aria-pressed', 'false');
    rain.innerHTML =
      '<div class="themes-swatch themes-swatch-rainy"></div>' +
      '<div class="themes-tile-name">rainy day</div>' +
      '<div class="themes-tile-blurb">rain-banded · the machine dims for the heavy visits.</div>' +
      '<div class="themes-tile-opinion">— light the storm, or let it lift. nothing expires.</div>';
    rain.addEventListener('mouseenter', endPreview);
    rain.addEventListener('focus', endPreview);
    rain.addEventListener('click', toggleRainy);
    grid.appendChild(rain);

    // leaving the locker lets any preview go.
    grid.addEventListener('mouseleave', endPreview);
  }

  document.addEventListener('DOMContentLoaded', function () {
    committed = current();
    build();
    setSkin(committed);
    paintCommitted();
    paintRainy();

    // lane C: the tile mirrors the one owner, wherever it is written —
    // the desktop icon and the settings switch both move the same key.
    if (window.Liber && window.Liber.state && window.Liber.state.on) {
      window.Liber.state.on('change', paintRainy);
    }

    // the locker overflows the glass: the ▼ drops away at the last tile.
    var skin = document.querySelector('.themes-skin');
    var mark = document.getElementById('themes-scroll');
    function paintMark() {
      if (!skin || !mark) return;
      var done = skin.scrollHeight - skin.scrollTop - skin.clientHeight < 8;
      mark.classList.toggle('spent', done);
    }
    if (skin) {
      skin.addEventListener('scroll', paintMark);
      window.addEventListener('resize', paintMark);
      setTimeout(paintMark, 100);
    }

    // the cursor's own scroller: keep the ▾ honest while the grid scrolls.
    var grid = document.getElementById('themes-grid');
    if (grid) grid.addEventListener('scroll', paintMark);

    var exit = document.getElementById('themes-exit');
    if (exit) exit.addEventListener('click', function () {
      if (history.length > 1) history.back(); else location.href = 'desktop.html';
    });

    var helpBtn = document.getElementById('themes-help');
    var riason = document.getElementById('themes-raison');
    var riasonClose = document.getElementById('themes-raison-close');
    function openRiason() {
      if (riason) { riason.classList.add('open'); riason.removeAttribute('inert'); }
    }
    function closeRiason() {
      if (riason) { riason.classList.remove('open'); riason.setAttribute('inert', ''); }
    }
    if (helpBtn) helpBtn.addEventListener('click', openRiason);
    if (riasonClose) riasonClose.addEventListener('click', closeRiason);
    if (riason) riason.addEventListener('click', function (e) { if (e.target === riason) closeRiason(); });
    if (window.LiberRoomShell) window.LiberRoomShell.bindRoomOverlays({ overlays: [
      { id: 'themes-raison', close: closeRiason }
    ] });

    // leaving the room mid-preview should not strand a half-worn skin.
    window.addEventListener('pagehide', function () {
      if (previewing) setSkin(committed);
    });
  });
})();
