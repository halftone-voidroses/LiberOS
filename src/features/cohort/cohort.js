// cohort.js — E-Lizabeth's room. A back-and-forth conversation in wax:
// the visitor speaks, the engine (eliza.js) answers in the same transcript.
// When an exchange deserves keeping, it can be sealed into the constellation
// as a cohort artifact (state.cohort, same shape as before: name + confession).
// No shared imports (covenant Q.1).

(function () {
  var transcript = document.getElementById('cohort-transcript');
  var input = document.getElementById('cohort-input');
  var sendBtn = document.getElementById('cohort-send');
  var sealBtn = document.getElementById('cohort-seal');

  var OPENING = 'the room is lit. the wax is soft. speak, and i will keep it.';
  var turns = [];            // { who: 'you' | 'eliza', text }
  var exchanges = 0;         // spoken turns since the last seal
  var sealFrom = 0;          // transcript index where the unsealed span begins

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function appendTurn(who, text) {
    turns.push({ who: who, text: text });
    if (!transcript) return;
    var el = document.createElement('div');
    el.className = 'cohort-turn cohort-turn-' + who;
    el.innerHTML = '<div class="cohort-turn-name">' + (who === 'you' ? 'you' : 'e-lizabeth') + '</div>'
                 + '<div class="cohort-turn-text">' + esc(text) + '</div>';
    transcript.appendChild(el);
    transcript.scrollTop = transcript.scrollHeight;
  }

  function appendNote(text) {
    if (!transcript) return;
    var el = document.createElement('div');
    el.className = 'cohort-note';
    el.textContent = text;
    transcript.appendChild(el);
    transcript.scrollTop = transcript.scrollHeight;
  }

  function send() {
    if (!input || !window.Liber || !window.Liber.eliza) return;
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    appendTurn('you', text);
    exchanges++;
    appendTurn('eliza', window.Liber.eliza.respond(text));
    if (sealBtn) sealBtn.disabled = exchanges < 2;
  }

  // the sealed artifact keeps the old cohort shape — name + confession —
  // so the constellation, the relations room and the twelve works read it
  // exactly as they read the older entries.
  function seal() {
    if (exchanges < 2) return;
    var span = turns.slice(sealFrom);
    var spoken = span.filter(function (t) { return t.who === 'you'; });
    if (spoken.length === 0) return;

    var name = spoken[0].text;
    if (name.length > 30) name = name.substring(0, 30) + '...';

    var lines = [];
    for (var i = 0; i < span.length; i++) {
      lines.push((span[i].who === 'you' ? 'you' : 'e-lizabeth') + ': ' + span[i].text);
    }
    var confession = lines.join(' / ');
    if (confession.length > 600) confession = confession.substring(0, 600) + '...';

    if (window.Liber && window.Liber.state && window.Liber.state.addArtifact) {
      window.Liber.state.addArtifact('cohort', { name: name, confession: confession });
    }
    if (window.Liber && window.Liber.sound) window.Liber.sound.play('chime');

    appendNote('— sealed in wax —');
    exchanges = 0;
    sealFrom = turns.length;
    if (sealBtn) sealBtn.disabled = true;
  }

  document.addEventListener('DOMContentLoaded', function () {
    appendTurn('eliza', OPENING);
    if (sealBtn) sealBtn.disabled = true;

    if (sendBtn) sendBtn.addEventListener('click', send);
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          send();
        }
      });
    }
    if (sealBtn) sealBtn.addEventListener('click', seal);

    var exit = document.getElementById('cohort-exit');
    if (exit) exit.addEventListener('click', function () {
      if (history.length > 1) history.back(); else location.href = 'desktop.html';
    });

    var helpBtn = document.getElementById('cohort-help');
    var raison = document.getElementById('cohort-raison');
    var raisonClose = document.getElementById('cohort-raison-close');
    function openRaison() {
      if (raison) { raison.classList.add('open'); raison.removeAttribute('inert'); }
    }
    function closeRaison() {
      if (raison) { raison.classList.remove('open'); raison.setAttribute('inert', ''); }
    }
    if (helpBtn) helpBtn.addEventListener('click', openRaison);
    if (raisonClose) raisonClose.addEventListener('click', closeRaison);
    if (raison) raison.addEventListener('click', function (e) { if (e.target === raison) closeRaison(); });
    if (window.LiberRoomShell) window.LiberRoomShell.bindRoomOverlays({ overlays: [
      { id: 'cohort-raison', close: closeRaison }
    ] });
  });
})();
