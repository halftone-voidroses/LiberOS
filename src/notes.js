// notes.js — scratch notes pad on the desktop (left margin mirror of
// the tasks window). Notes save as satchel artifacts (kind note) and
// list back, newest first. Cmd/Ctrl+Enter saves from the pad.

(function () {
  'use strict';

  var box = null, pad = null, statusEl = null, listEl = null;

  function st() {
    return (window.Liber && window.Liber.state) || null;
  }

  function notes() {
    var s = st() ? st().get() : {};
    return ((s.satchel || []).filter(function (e) { return e && e.kind === 'note'; }));
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function renderList() {
    if (!listEl) return;
    var items = notes().slice(-5).reverse();
    var html = '';
    for (var i = 0; i < items.length; i++) {
      var t = String(items[i].text || '');
      if (t.length > 90) t = t.substring(0, 87) + '...';
      html += '<div class="notes-item">' + esc(t) + '</div>';
    }
    listEl.innerHTML = html;
  }

  function save() {
    var s = st();
    if (!s || !pad) return;
    var text = pad.value.trim();
    if (!text) return;
    pad.value = '';
    if (s.addArtifact) s.addArtifact('satchel', { kind: 'note', text: text });
    if (window.Liber && window.Liber.sound) { try { window.Liber.sound.play('chime'); } catch (e) {} }
    if (statusEl) statusEl.textContent = 'kept in the satchel.';
    renderList();
  }

  function init() {
    var stage = document.getElementById('desktop');
    if (!stage || document.getElementById('notes')) return;
    box = document.createElement('div');
    box.className = 'notes';
    box.id = 'notes';
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', 'scratch notes');
    box.innerHTML = '<div class="notes-head">scratch notes</div>'
      + '<textarea class="notes-pad" id="notes-pad" aria-label="scratch note" rows="4"></textarea>'
      + '<button type="button" class="notes-save" id="notes-save">keep the note</button>'
      + '<div class="notes-status" id="notes-status" aria-live="polite"></div>'
      + '<div class="notes-list" id="notes-list"></div>';
    stage.appendChild(box);
    pad = document.getElementById('notes-pad');
    statusEl = document.getElementById('notes-status');
    listEl = document.getElementById('notes-list');
    var saveBtn = document.getElementById('notes-save');
    if (saveBtn) saveBtn.addEventListener('click', save);
    if (pad) pad.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); save(); }
    });
    var s = st();
    if (s && s.on) s.on('change', renderList);
    renderList();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
