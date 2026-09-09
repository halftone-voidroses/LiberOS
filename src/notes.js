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

  function allParents() {
    var s = st() ? st().get() : {};
    var out = [];
    var kinds = ['divination', 'games', 'learn', 'abstract', 'sea', 'garden', 'dreams', 'methodology', 'buddy'];
    for (var k = 0; k < kinds.length; k++) {
      var arr = s[kinds[k]] || [];
      for (var i = 0; i < arr.length; i++) {
        if (!arr[i] || !arr[i].id) continue;
        var label = arr[i].name || arr[i].title || arr[i].topic || arr[i].label || (arr[i].text || '').slice(0, 28) || arr[i].intention || kinds[k];
        out.push({ id: arr[i].id, label: String(label).slice(0, 30) + ' (' + kinds[k] + ')' });
      }
    }
    return out;
  }

  function renderList() {
    if (!listEl) return;
    var items = notes().slice(-5).reverse();
    var html = '';
    for (var i = 0; i < items.length; i++) {
      var t = String(items[i].text || '');
      var full = t;
      if (t.length > 90) t = t.substring(0, 87) + '...';
      var nid = items[i].id || '';
      html += '<div class="notes-item" data-id="' + esc(nid) + '" role="button" tabindex="0" title="open note actions">' + esc(t)
            + '<div class="notes-actions" hidden>'
            + '<button type="button" data-act="delete">delete</button>'
            + '<button type="button" data-act="satchel" disabled title="already in the satchel">in satchel ✓</button>'
            + '<label>attach to <select data-act="attach"><option value="">— pick —</option></select></label>'
            + '</div>'
            + '<div class="notes-full" hidden>' + esc(full) + '</div>'
            + '</div>';
    }
    listEl.innerHTML = html;
    var els = listEl.querySelectorAll('.notes-item');
    for (var j = 0; j < els.length; j++) {
      (function (el) {
        function toggle(open) {
          var box = el.querySelector('.notes-actions');
          if (!box) return;
          var show = typeof open === 'boolean' ? open : box.hidden;
          if (show) {
            var sel = box.querySelector('select[data-act="attach"]');
            if (sel && sel.options.length <= 1) {
              var parents = allParents();
              for (var p = 0; p < parents.length; p++) {
                var o = document.createElement('option');
                o.value = parents[p].id;
                o.textContent = parents[p].label;
                sel.appendChild(o);
              }
            }
          }
          box.hidden = !show;
        }
        el.addEventListener('click', function (e) {
          if (e.target && (e.target.tagName === 'BUTTON' || e.target.tagName === 'SELECT' || e.target.tagName === 'OPTION')) return;
          toggle();
        });
        el.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
          if (e.key === 'Escape') toggle(false);
        });
        var box2 = el.querySelector('.notes-actions');
        if (box2) box2.addEventListener('click', function (e) {
          var s = st();
          var nid2 = el.getAttribute('data-id');
          var btn = e.target.closest ? e.target.closest('[data-act]') : null;
          if (!btn || !s || !nid2) return;
          var act = btn.getAttribute('data-act');
          if (act === 'delete') {
            if (s.releaseArtifact) s.releaseArtifact('satchel', nid2);
            if (s.unbindRelation) s.unbindRelation(nid2);
            if (window.Liber && window.Liber.sound) { try { window.Liber.sound.play('thunk'); } catch (e2) {} }
          }
          e.stopPropagation();
        });
        var sel2 = el.querySelector('select[data-act="attach"]');
        if (sel2) sel2.addEventListener('change', function (e) {
          var s = st();
          var nid3 = el.getAttribute('data-id');
          var target = sel2.value;
          if (!s || !nid3 || !target) return;
          if (s.unbindRelation) { try { s.unbindRelation(nid3, target); } catch (e3) {} }
          if (s.bindRelation) s.bindRelation(nid3, 'attached', target);
          if (window.Liber && window.Liber.sound) { try { window.Liber.sound.play('chime'); } catch (e4) {} }
          if (statusEl) statusEl.textContent = 'attached — it orbits now.';
          sel2.value = '';
          e.stopPropagation();
        });
      })(els[j]);
    }
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
