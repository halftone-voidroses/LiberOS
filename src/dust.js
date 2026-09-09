// dust.js — canvas dust particles drifting like stars in the void
// Used on every state. Particles are slow, dim, with subtle twinkling.
// Pointer events are disabled so the canvas doesn't block clicks.

(function () {
  'use strict';

  const BASE_COUNT = 80;
  // WS5 patina: density steps up with presence tiers (visits+artifacts,
  // thresholds mirror src/shadow.js). Static per load — the loop itself is
  // unchanged; absence never thins the room.
  const PATINA_TIERS = [2, 6, 12];
  const ARTIFACT_KINDS = ['divination', 'iching', 'games', 'sea', 'buddy', 'learn', 'council'];
  const particles = [];
  let canvas, ctx, raf, count = BASE_COUNT, last = 0;

  function patinaDensity() {
    try {
      const s = (window.Liber && window.Liber.state) ? window.Liber.state.get() : {};
      let n = Object.keys(s.visited || {}).length;
      for (let i = 0; i < ARTIFACT_KINDS.length; i++) {
        if (Array.isArray(s[ARTIFACT_KINDS[i]])) n += s[ARTIFACT_KINDS[i]].length;
      }
      let level = 0;
      for (let j = 0; j < PATINA_TIERS.length; j++) {
        if (n >= PATINA_TIERS[j]) level = j + 1;
      }
      return level;
    } catch (e) {
      return 0;
    }
  }

  function init() {
    canvas = document.querySelector('.dust-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    count = BASE_COUNT + patinaDensity() * 24;
    resize();
    spawn();
    window.addEventListener('resize', () => {
      resize();
      spawn();
    });
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn() {
    particles.length = 0;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.4 + 0.3,
        vx: (Math.random() - 0.5) * 0.06,
        vy: (Math.random() - 0.5) * 0.04,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.005 + Math.random() * 0.015,
        baseAlpha: 0.15 + Math.random() * 0.5,
      });
    }
  }

  function loop(now) {
    const dt = Math.min(50, now - last);
    last = now;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (const p of particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.twinkle += p.twinkleSpeed * dt;

      // Wrap around viewport edges
      if (p.x < 0) p.x = window.innerWidth;
      if (p.x > window.innerWidth) p.x = 0;
      if (p.y < 0) p.y = window.innerHeight;
      if (p.y > window.innerHeight) p.y = 0;

      const a = p.baseAlpha * (0.5 + 0.5 * Math.sin(p.twinkle));
      ctx.fillStyle = `rgba(220, 200, 180, ${a})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    raf = requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
