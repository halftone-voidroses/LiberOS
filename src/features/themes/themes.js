// themes.js — pick the skin of the machine. Each theme is a class
// swapped onto .machine. The covenant keeps these classes off the
// body of any traveler app.

(function () {
  var THEMES = [
    { id: 'corrupted',    name: 'corrupted',        blurb: 'the default · red, faded, drifting.',                 opinion: 'this is the room i was born in. i love it. i cannot leave it.' },
    { id: 'wanderlust',    name: 'wanderlust',       blurb: 'pink & yellow · the summoning.',                    opinion: 'me. i painted it. i do not know why it smells of candy.' },
    { id: 'raison',        name: 'raison',           blurb: 'blue & violet · the observer.',                      opinion: 'the observer observes himself observing. i tire of him.' },
    { id: 'physius',       name: 'mistress physius', blurb: 'copper & obsidian · the stone.',                     opinion: 'a patient skin. she does not interrupt the work.' },
    { id: 'whimsy',        name: 'whimsy wow',       blurb: 'red & cream · the barker.',                          opinion: 'too loud for the void, too bright for me. i stay anyway.' },
    { id: 'vanir',         name: 'vanir',            blurb: 'deep blue & sea green · the deep.',                  opinion: 'i have drowned in this colour. i will drown in it again.' },
    { id: 'entity404',     name: 'entity404',        blurb: 'green & black · the void.',                          opinion: 'the void is patient. the void does not gossip about me.' },
    { id: 'arcana',        name: 'arcana',           blurb: 'chalk white & black · the deck.',                    opinion: 'the deck tells me what i already knew. i thank it.' },
    { id: 'librarian',     name: 'the librarian',    blurb: 'sepia & brass · the drawers.',                       opinion: 'the drawers keep what i forget. i am grateful.' },
    { id: 'elizabeth',     name: 'e-lizabeth',       blurb: 'gothic gold · the linked.',                          opinion: 'gold is what was married and mourned. she carries both.' },
    { id: 'iris',          name: 'iris mappa',       blurb: 'parchment & ink · the cartographer.',                opinion: 'the map is never of the place. the place is the map.' },
    { id: 'ravaging',      name: 'ravaging pete',    blurb: 'loam & rust · the rubble.',                         opinion: 'everything i buried here i find again. this is its charm.' }
  ];

  function current() {
    var s = (window.Liber && window.Liber.state && window.Liber.state.get()) || {};
    return s.theme || 'corrupted';
  }

  function apply(theme) {
    var machine = document.querySelector('.machine');
    if (!machine) return;
    for (var i = 0; i < THEMES.length; i++) machine.classList.remove('theme-' + THEMES[i].id);
    machine.classList.add('theme-' + theme);
    if (window.Liber && window.Liber.state) {
      window.Liber.state.set({ theme: theme });
    }
    var label = document.getElementById('themes-current-value');
    if (label) label.textContent = theme;
    var btns = document.querySelectorAll('.themes-tile');
    for (var j = 0; j < btns.length; j++) {
      if (btns[j].getAttribute('data-theme') === theme) btns[j].classList.add('active');
      else btns[j].classList.remove('active');
    }
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
        btn.addEventListener('click', function () { apply(t.id); });
        grid.appendChild(btn);
      })(THEMES[i]);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    build();
    apply(current());

    var exit = document.getElementById('themes-exit');
    if (exit) exit.addEventListener('click', function () {
      if (history.length > 1) history.back(); else location.href = 'desktop.html';
    });

    var helpBtn = document.getElementById('themes-help');
    var raison = document.getElementById('themes-raison');
    var raisonClose = document.getElementById('themes-raison-close');
    function openRaison() {
      if (raison) { raison.classList.add('open'); raison.removeAttribute('inert'); }
    }
    function closeRaison() {
      if (raison) { raison.classList.remove('open'); raison.setAttribute('inert', ''); }
    }
    if (helpBtn) helpBtn.addEventListener('click', openRaison);
    if (raisonClose) raisonClose.addEventListener('click', closeRaison);
    if (raison) raison.addEventListener('click', function (e) { if (e.target === raison) closeRaison(); });
  });
})();
