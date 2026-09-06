// cursor.js — the stagehand cursor (shell; desktop, sigil, games).
// A visible Riason-blue ring cursor that performs real UI: it moves,
// clicks real buttons, types into real inputs, and drags real strokes.
// Every act it performs goes through the app's own handlers, so a
// performed save is a real save. pointer-events:none, reduced-motion
// aware (jumps instead of gliding). window.Cursor.

(function () {
  'use strict';

  var el = null;

  function ensure() {
    if (el) return el;
    if (!document.body) return null;
    el = document.createElement('div');
    el.className = 'stagehand-cursor';
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
    return el;
  }

  function reduced() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch (e) { return false; }
  }

  function center(elm) {
    var r = elm.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function wait(ms) {
    return new Promise(function (res) { setTimeout(res, ms); });
  }

  function moveTo(x, y, ms) {
    return new Promise(function (res) {
      var c = ensure();
      if (!c) return res();
      c.style.opacity = '1';
      var t = reduced() ? 0 : (ms == null ? 650 : ms);
      c.style.transition = 'left ' + t + 'ms ease-in-out, top ' + t + 'ms ease-in-out';
      c.style.left = x + 'px';
      c.style.top = y + 'px';
      setTimeout(res, t + 40);
    });
  }

  function moveToEl(elm, ms) {
    if (!elm) return Promise.resolve();
    var p = center(elm);
    return moveTo(p.x, p.y, ms);
  }

  function clickEl(elm, ms) {
    if (!elm) return Promise.resolve();
    return moveToEl(elm, ms).then(function () {
      elm.click();
      return wait(300);
    });
  }

  function typeText(elm, text, cps) {
    if (!elm) return Promise.resolve();
    return new Promise(function (res) {
      try { elm.focus(); } catch (e) {}
      var i = 0;
      var per = reduced() ? 0 : Math.max(12, Math.floor(1000 / (cps || 40)));
      function step() {
        if (i >= text.length) {
          try {
            elm.dispatchEvent(new Event('input', { bubbles: true }));
            elm.dispatchEvent(new Event('change', { bubbles: true }));
          } catch (e) {}
          return res();
        }
        var ch = text[i] === ' ' ? ' ' : text[i];
        try {
          if ('value' in elm && typeof elm.value === 'string') {
            elm.value += ch;
          } else {
            elm.innerText = (elm.innerText || '') + ch;
          }
        } catch (e) {}
        i++;
        setTimeout(step, per);
      }
      step();
    });
  }

  function canvasStroke(canvas, pts, stepMs) {
    if (!canvas || !pts || !pts.length) return Promise.resolve();
    return new Promise(function (res) {
      var r = canvas.getBoundingClientRect();
      function at(p) { return { x: r.left + p[0], y: r.top + p[1] }; }
      function fire(type, p) {
        var q = at(p);
        canvas.dispatchEvent(new MouseEvent(type, {
          clientX: q.x, clientY: q.y, bubbles: true, cancelable: true
        }));
      }
      var first = pts[0];
      moveTo(r.left + first[0], r.top + first[1], 400).then(function () {
        fire('mousedown', first);
        var i = 1;
        var gap = reduced() ? 0 : (stepMs || 60);
        (function next() {
          if (i >= pts.length) {
            var last = pts[pts.length - 1];
            fire('mouseup', last);
            var c = ensure();
            if (c) { c.style.left = (r.left + last[0]) + 'px'; c.style.top = (r.top + last[1]) + 'px'; }
            return res();
          }
          var p = pts[i];
          fire('mousemove', p);
          var c2 = ensure();
          if (c2) { c2.style.transition = 'none'; c2.style.left = (r.left + p[0]) + 'px'; c2.style.top = (r.top + p[1]) + 'px'; }
          i++;
          setTimeout(next, gap);
        })();
      });
    });
  }

  function circlePoints(cx, cy, rad, n) {
    var pts = [];
    var steps = n || 40;
    for (var i = 0; i <= steps; i++) {
      var a = (i / steps) * Math.PI * 2;
      pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
    }
    return pts;
  }

  function burst() {
    var c = ensure();
    if (!c) return;
    c.classList.remove('burst');
    void c.offsetWidth;
    c.classList.add('burst');
    setTimeout(function () { if (c) c.classList.add('gone'); }, 600);
  }

  function hide() {
    if (el) el.style.opacity = '0';
  }

  function show() {
    var c = ensure();
    if (c) { c.classList.remove('gone'); c.style.opacity = '1'; }
  }

  window.Cursor = window.Cursor || {
    show: show,
    hide: hide,
    moveTo: moveTo,
    moveToEl: moveToEl,
    clickEl: clickEl,
    typeText: typeText,
    canvasStroke: canvasStroke,
    circlePoints: circlePoints,
    burst: burst
  };
})();
