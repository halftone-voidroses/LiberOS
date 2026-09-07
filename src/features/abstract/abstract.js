// abstract.js — Entity404. DOS-green void; drag artifacts from left rail
// into the void; confirm to abstract them and spawn a hatched egg.

(function () {
  function el(id) { return document.getElementById(id); }

  var railList = null;
  var voidEl = null;
  var voidBody = null;
  var eggsEl = null;
  var confirmEl = null;
  var confirmBody = null;
  var pendingArtifact = null;

  function getArtifacts() {
    if (!(window.Liber && window.Liber.state)) return [];
    var s = window.Liber.state.get();
    var sigils = (s.buddy || []).filter(function (e) { return e && e.kind === 'stone'; });
    var div = s.divination || [];
    var abs = s.abstract || [];
    var all = [].concat(sigils, div, abs);
    return all;
  }

  function sourceOf(entry) {
    if (entry && entry.id && entry.id.indexOf('sigil-') === 0) return 'buddy';
    if (entry && entry.id && entry.id.indexOf('divination-') === 0) return 'divination';
    return 'abstract';
  }

  function renderRail() {
    if (!railList) return;
    railList.innerHTML = '';
    var items = getArtifacts();
    if (!items.length) {
      var empty = document.createElement('div');
      empty.className = 'abstract-rail-empty';
      empty.textContent = 'no artifacts yet.';
      railList.appendChild(empty);
      return;
    }
    items.forEach(function (entry) {
      var item = document.createElement('div');
      item.className = 'abstract-rail-item';
      item.setAttribute('draggable', 'true');
      item.setAttribute('data-id', entry.id);

      var label = document.createElement('span');
      label.className = 'abstract-rail-item-label';
      label.textContent = entry.label || entry.id;

      var src = document.createElement('span');
      src.className = 'abstract-rail-item-source';
      src.textContent = sourceOf(entry);

      item.appendChild(label);
      item.appendChild(src);

      // Native HTML5 drag-and-drop into the void.
      item.addEventListener('dragstart', function (e) {
        item.classList.add('dragging');
        try { e.dataTransfer.setData('text/plain', entry.id); } catch (err) {}
        e.dataTransfer.effectAllowed = 'move';
      });
      item.addEventListener('dragend', function () { item.classList.remove('dragging'); });

      railList.appendChild(item);
    });
  }

  function appendVoidLine(text, cls) {
    if (!voidBody) return;
    var line = document.createElement('div');
    line.className = 'abstract-void-line' + (cls ? ' ' + cls : '');
    line.textContent = text;
    voidBody.insertBefore(line, voidBody.querySelector('.abstract-void-prompt'));
  }

  function refreshPromptLine() {
    var prompt = voidBody && voidBody.querySelector('.abstract-void-prompt');
    if (prompt) {
      prompt.innerHTML = 'C:\\entity404&gt; <span class="abstract-void-cursor">_</span>';
    }
  }

  function spawnEgg(entry) {
    if (!eggsEl) return;
    eggsEl.removeAttribute('inert');
    var egg = document.createElement('div');
    egg.className = 'abstract-egg';
    var shape = document.createElement('div');
    shape.className = 'abstract-egg-shape';
    var label = document.createElement('div');
    label.className = 'abstract-egg-label';
    label.textContent = entry.label || entry.id;
    egg.appendChild(shape);
    egg.appendChild(label);
    eggsEl.appendChild(egg);
  }

  function openConfirm(entry) {
    pendingArtifact = entry;
    if (!confirmEl || !confirmBody) return;
    confirmBody.textContent = 'absorb "' + (entry.label || entry.id) + '" into the void?';
    confirmEl.classList.add('open');
    confirmEl.removeAttribute('inert');
  }

  function closeConfirm() {
    if (!confirmEl) return;
    confirmEl.classList.remove('open');
    confirmEl.setAttribute('inert', '');
    pendingArtifact = null;
  }

  function yesConfirm() {
    if (!pendingArtifact) return;
    var entry = pendingArtifact;
    var src = sourceOf(entry);
    appendVoidLine('> abstracting "' + (entry.label || entry.id) + '" (' + src + ')…');
    appendVoidLine('  → egg spawned in the void.');
    refreshPromptLine();

    // Remove from the source array; if it's an `abstract` entry (already
    // an egg), we just leave the new egg. If it's from sigil/divination,
    // we release it from its source so it no longer appears in the rail.
    if (src === 'buddy' || src === 'divination') {
      try {
        if (window.Liber.state.releaseArtifact) {
          window.Liber.state.releaseArtifact(src, entry.id);
        }
      } catch (e) {}
    }

    // Add a new hatched-egg artifact to state.abstract.
    if (window.Liber.state.addArtifact) {
      window.Liber.state.addArtifact('abstract', { label: entry.label || entry.id });
    }
    if (window.Liber && window.Liber.sound) window.Liber.sound.play('thunk');
    spawnEgg(entry);
    closeConfirm();
    renderRail();
  }

  function bindDnD() {
    if (!voidEl) return;
    voidEl.addEventListener('dragover', function (e) {
      e.preventDefault();
      voidEl.classList.add('drag-over');
      try { e.dataTransfer.dropEffect = 'move'; } catch (err) {}
    });
    voidEl.addEventListener('dragleave', function () { voidEl.classList.remove('drag-over'); });
    voidEl.addEventListener('drop', function (e) {
      e.preventDefault();
      voidEl.classList.remove('drag-over');
      var id = '';
      try { id = e.dataTransfer.getData('text/plain') || ''; } catch (err) {}
      if (!id) return;
      var entry = getArtifacts().find(function (a) { return a.id === id; });
      if (!entry) return;
      openConfirm(entry);
    });
  }

  function bindConfirm() {
    var yes = el('abstract-confirm-yes');
    var no  = el('abstract-confirm-no');
    if (yes) yes.addEventListener('click', yesConfirm);
    if (no)  no.addEventListener('click', closeConfirm);
    if (confirmEl) confirmEl.addEventListener('click', function (e) {
      if (e.target === confirmEl) closeConfirm();
    });
  }

  function bindChrome() {
    var exit = el('abstract-exit');
    if (exit) exit.addEventListener('click', function () {
      if (history.length > 1) history.back(); else location.href = 'desktop.html';
    });
    var helpBtn = el('abstract-help');
    var riason = el('abstract-raison');
    var riasonClose = el('abstract-raison-close');
    function openR() { if (riason) { riason.classList.add('open'); riason.removeAttribute('inert'); } }
    function closeR() { if (riason) { riason.classList.remove('open'); riason.setAttribute('inert', ''); } }
    if (helpBtn) helpBtn.addEventListener('click', openR);
    if (riasonClose) riasonClose.addEventListener('click', closeR);
    if (riason) riason.addEventListener('click', function (e) { if (e.target === riason) closeR(); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    railList = el('abstract-rail-list');
    voidEl = el('abstract-void');
    voidBody = el('abstract-void-body');
    eggsEl = el('abstract-eggs');
    confirmEl = el('abstract-confirm');
    confirmBody = el('abstract-confirm-body');
    renderRail();
    bindDnD();
    bindConfirm();
    bindChrome();
    if (window.Liber && window.Liber.state && window.Liber.state.on) {
      window.Liber.state.on('change', function () { renderRail(); });
    }
  });
})();