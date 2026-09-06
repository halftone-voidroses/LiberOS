// sigil-overlay.js — desktop faint sigil bitmap overlay
// Reads the latest sigil's bitmap (if any) and renders it as a full-screen
// <img> at ~8% opacity behind the dial + constellation. Pointer-events
// disabled. z-index 1 (above dust, below machine).

(function () {
  function apply() {
    var overlay = document.getElementById('sigil-overlay');
    var img = document.getElementById('sigil-overlay-img');
    if (!overlay || !img) return;
    var s = (window.Liber && window.Liber.state) ? window.Liber.state.get() : {};
    var sigils = s.sigils || [];
    if (!sigils.length || !sigils[0].bitmap) {
      overlay.style.display = 'none';
      overlay.setAttribute('aria-hidden', 'true');
      img.removeAttribute('src');
      return;
    }
    img.src = sigils[0].bitmap;
    overlay.style.display = 'block';
    overlay.setAttribute('aria-hidden', 'false');
  }

  document.addEventListener('DOMContentLoaded', function () {
    apply();
    if (window.Liber && window.Liber.state && window.Liber.state.on) {
      window.Liber.state.on('change', apply);
    }
  });
})();