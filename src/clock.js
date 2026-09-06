// clock.js — radial clock in the top-right of the screen
// 12 ticks, hour/minute/second hands, date string below. Smooth motion.

(function () {
  'use strict';

  const SIZE = 96;
  let canvas, ctx, raf, dateEl;

  function init() {
    canvas = document.querySelector('.radial-clock canvas');
    if (!canvas) return;
    canvas.width = SIZE * 2;   // for retina
    canvas.height = SIZE * 2;
    ctx = canvas.getContext('2d');
    ctx.scale(2, 2);
    dateEl = document.querySelector('.radial-clock .date');

    raf = requestAnimationFrame(loop);
  }

  function loop() {
    draw();
    raf = requestAnimationFrame(loop);
  }

  function draw() {
    const cx = SIZE / 2, cy = SIZE / 2, r = SIZE / 2 - 4;
    ctx.clearRect(0, 0, SIZE, SIZE);

    const now = new Date();
    const s = now.getSeconds() + now.getMilliseconds() / 1000;
    const m = now.getMinutes() + s / 60;
    const h = (now.getHours() % 12) + m / 60;

    // Faint face
    ctx.fillStyle = 'rgba(40, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // 12 ticks
    ctx.strokeStyle = 'rgba(200, 120, 120, 0.8)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const inner = i % 3 === 0 ? r - 6 : r - 3;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      ctx.stroke();
    }

    // Hour hand
    drawHand(cx, cy, h / 12, r * 0.5, 2.2, 'rgba(200, 120, 120, 0.95)');
    // Minute hand
    drawHand(cx, cy, m / 60, r * 0.75, 1.6, 'rgba(200, 120, 120, 0.95)');
    // Second hand — thin red
    drawHand(cx, cy, s / 60, r * 0.85, 0.6, 'rgba(255, 60, 60, 0.9)');

    // Center pin
    ctx.fillStyle = 'rgba(255, 60, 60, 0.9)';
    ctx.beginPath();
    ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Date
    if (dateEl) {
      const opts = { month: 'short', day: 'numeric' };
      dateEl.textContent = now.toLocaleDateString('en-US', opts).toLowerCase();
    }
  }

  function drawHand(cx, cy, frac, length, width, color) {
    const a = frac * Math.PI * 2 - Math.PI / 2;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * length, cy + Math.sin(a) * length);
    ctx.stroke();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
