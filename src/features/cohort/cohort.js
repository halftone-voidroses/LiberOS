// cohort.js — E-Lizabeth. Confessions in wax. No shared imports (covenant Q.1).

(function () {
  var list = document.getElementById('cohort-list');
  var input = document.getElementById('cohort-confess-input');
  var btn = document.getElementById('cohort-confess-btn');

  function getState() {
    return (window.Liber && window.Liber.state && window.Liber.state.get()) || {};
  }

  function addPerson(name, confession) {
    var s = getState();
    var arr = s.cohort || [];
    arr.push({ name: name, confession: confession, ts: Date.now() });
    window.Liber.state.set({ cohort: arr });
  }

  function getConfessions() {
    return getState().cohort || [];
  }

  function render() {
    var arr = getConfessions();
    if (arr.length === 0) {
      list.innerHTML = '<div class="cohort-empty">no one is here yet.<br/><em>make a sigil, and a name will come.</em></div>';
      return;
    }
    var html = '';
    for (var i = 0; i < arr.length; i++) {
      html += '<div class="cohort-person">'
            +   '<div class="cohort-person-name">' + arr[i].name + '</div>'
            +   '<div class="cohort-person-confession">' + arr[i].confession + '</div>'
            + '</div>';
    }
    list.innerHTML = html;
  }

  function onConfess() {
    if (!input) return;
    var text = input.value.trim();
    if (!text) return;
    var prompt = document.getElementById('cohort-save-prompt');
    var body = document.getElementById('cohort-save-prompt-body');
    if (prompt) {
      var sigils = getState().sigils || [];
      var name = '— the unknown —';
      if (sigils.length) {
        var last = sigils[sigils.length - 1];
        name = 'one who ' + (last.element || 'walks') + ' with ' + (last.intention || 'silence').substring(0, 30);
      }
      pendingConfession = { text: text, name: name };
      if (body) body.innerHTML = 'name: <em>' + name + '</em>. confession: "' + text + '".';
      prompt.classList.add('open');
      prompt.removeAttribute('inert');
    } else {
      commitConfess(text);
    }
  }

  var pendingConfession = null;

  function commitConfess(text) {
    if (!input) return;
    var sigils = getState().sigils || [];
    var name = '— the unknown —';
    if (sigils.length) {
      var last = sigils[sigils.length - 1];
      name = 'one who ' + (last.element || 'walks') + ' with ' + (last.intention || 'silence').substring(0, 30);
    }
    addPerson(name, text);
    input.value = '';
    render();
  }

  function closePrompt() {
    var prompt = document.getElementById('cohort-save-prompt');
    if (!prompt) return;
    prompt.classList.remove('open');
    prompt.setAttribute('inert', '');
    pendingConfession = null;
  }

  document.addEventListener('DOMContentLoaded', function () {
    render();
    if (btn) btn.addEventListener('click', onConfess);
    if (input) input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onConfess(); });

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

    var prompt = document.getElementById('cohort-save-prompt');
    var keepBtn = document.getElementById('cohort-save-prompt-keep');
    var discardBtn = document.getElementById('cohort-save-prompt-discard');
    var closeBtn = document.getElementById('cohort-save-prompt-close');
    if (keepBtn) keepBtn.addEventListener('click', function () {
      var p = pendingConfession;
      closePrompt();
      if (p) commitConfess(p.text);
      if (window.Liber && window.Liber.sound) window.Liber.sound.play('chime');
    });
    if (discardBtn) discardBtn.addEventListener('click', function () {
      closePrompt();
      if (input) input.value = '';
    });
    if (closeBtn) closeBtn.addEventListener('click', closePrompt);
    if (prompt) prompt.addEventListener('click', function (e) { if (e.target === prompt) closePrompt(); });
  });
})();
