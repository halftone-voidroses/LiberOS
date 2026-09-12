// room-shell.js — shared interaction contract for room overlays.
// Features own what an overlay means and how it clears pending state. This
// module owns the interaction that should never drift between rooms: backdrop
// dismissal and Escape-to-close for the topmost open overlay.
(function (global) {
  'use strict';

  var registry = [];

  function find(id) {
    for (var i = 0; i < registry.length; i++) {
      if (registry[i].id === id) return registry[i];
    }
    return null;
  }

  function bindOverlay(id, close) {
    var overlay = document.getElementById(id);
    if (!overlay || typeof close !== 'function') return;

    var existing = find(id);
    if (existing) {
      existing.close = close;
      return;
    }

    var item = { id: id, overlay: overlay, close: close };
    registry.push(item);
    overlay.dataset.shellBound = '1';
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) {
        close();
        event.stopPropagation();
      }
    });
    overlay.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        close();
        event.stopPropagation();
      }
    });
  }

  function bindRoomOverlays(config) {
    config = config || {};
    var overlays = config.overlays || [];
    for (var i = 0; i < overlays.length; i++) {
      var item = overlays[i];
      if (item) bindOverlay(item.id, item.close);
    }
  }

  // One listener serves every overlay registered by the current room. Reverse
  // order makes nested prompts win over the room help panel beneath them.
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    for (var i = registry.length - 1; i >= 0; i--) {
      var item = registry[i];
      if (item.overlay.classList.contains('open') && typeof item.close === 'function') {
        item.close();
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
    }
  });

  global.LiberRoomShell = global.LiberRoomShell || {
    bindOverlay: bindOverlay,
    bindRoomOverlays: bindRoomOverlays
  };
})(window);
