// static.js — canvas CRT static noise, rendered over the screen
// Subtle by default (corruption is the baseline, not the on-state).
// Shadow layer can crank the opacity.

(function () {
  'use strict';

  const W = 256, H = 256;
  let canvas, ctx, imageData, raf, lastRefresh = 0;
  let baseOpacity = 0.06;
  let currentOpacity = baseOpacity;

  function init() {
    canvas = document.querySelector('.static-canvas');
    if (!canvas) return;
    canvas.width = W;
    canvas.height = H;
    ctx = canvas.getContext('2d');
    imageData = ctx.createImageData(W, H);

    function place() {
      const screen = document.querySelector('.screen');
      if (screen) {
        const r = screen.getBoundingClientRect();
        canvas.style.left = r.left + 'px';
        canvas.style.top = r.top + 'px';
        canvas.style.width = r.width + 'px';
        canvas.style.height = r.height + 'px';
      }
      raf = requestAnimationFrame(place);
    }

    lastRefresh = performance.now();
    raf = requestAnimationFrame(function loop(now) {
      const dt = now - lastRefresh;
      if (dt > 60) {
        render();
        lastRefresh = now;
      }
      // Animate opacity slightly to feel "alive"
      const t = now * 0.001;
      const wobble = (Math.sin(t * 0.7) + Math.sin(t * 2.1)) * 0.015;
      currentOpacity = Math.max(0, Math.min(0.3, baseOpacity + wobble));
      canvas.style.opacity = currentOpacity.toFixed(3);
      raf = requestAnimationFrame(loop);
    });

    // Initial position
    place();
  }

  function render() {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() * 255;
      data[i] = v;
      data[i + 1] = v * 0.4;  // red-tinted
      data[i + 2] = v * 0.4;
      data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
