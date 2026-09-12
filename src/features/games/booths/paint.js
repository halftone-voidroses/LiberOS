// Paint booths: mask / shield / circles — extracted verbatim from the games monolith.
var PAINT_COLORS = ['#c02424', '#e09320', '#e8c832', '#3a8a3a', '#2a5aaa', '#6a3aaa', '#c86aa8', '#f0e8d8'];
var PAINT_SIZES = [3, 7, 13];

function playPaint(ctx, b, body, kind) {
  var names = kind === 'circles' ? { a: '', b: '', c: '' } : null;
  body.innerHTML =
    '<div class="paint-stack">'
    + '<canvas class="paint-tpl" id="paint-tpl" width="480" height="360"></canvas>'
    + '<canvas class="paint-top" id="paint-top" width="480" height="360"></canvas>'
    + '</div>'
    + (kind === 'circles'
      ? '<div class="paint-names">'
        + '<input id="paint-name-a" maxlength="24" aria-label="closest" placeholder="closest"/>'
        + '<input id="paint-name-b" maxlength="24" aria-label="friends" placeholder="friends"/>'
        + '<input id="paint-name-c" maxlength="24" aria-label="distant" placeholder="distant"/>'
        + '</div>' : '')
    + '<div class="paint-bar" id="paint-bar"></div>'
    + '<div class="games-actions">'
    + '<button type="button" class="games-action" id="paint-clear">wipe it</button>'
    + '<button type="button" class="games-action" id="paint-keep">keep it</button>'
    + '</div>'
    + '<div class="games-result" id="paint-result"></div>';

  var tpl = document.getElementById('paint-tpl');
  var top = document.getElementById('paint-top');
  var tctx = tpl.getContext('2d');
  var pctx = top.getContext('2d');
  var color = PAINT_COLORS[0];
  var size = PAINT_SIZES[1];
  var strokes = 0;

  function drawTemplate() {
    tctx.clearRect(0, 0, 480, 360);
    tctx.strokeStyle = '#4a3828';
    tctx.fillStyle = '#4a3828';
    tctx.lineWidth = 3;
    tctx.font = 'italic 17px Georgia';
    tctx.textAlign = 'center';
    if (kind === 'mask') {
      tctx.beginPath();
      tctx.ellipse(240, 185, 130, 155, 0, 0, Math.PI * 2);
      tctx.stroke();
      tctx.beginPath();
      tctx.moveTo(240, 30); tctx.lineTo(240, 340);
      tctx.stroke();
      tctx.fillText('FEELINGS', 165, 60);
      tctx.fillText('PRESENTATION', 315, 60);
    } else if (kind === 'shield') {
      tctx.beginPath();
      tctx.moveTo(240, 30);
      tctx.lineTo(370, 80); tctx.lineTo(370, 210);
      tctx.quadraticCurveTo(370, 300, 240, 340);
      tctx.quadraticCurveTo(110, 300, 110, 210);
      tctx.lineTo(110, 80);
      tctx.closePath();
      tctx.stroke();
      tctx.beginPath();
      tctx.moveTo(240, 30); tctx.lineTo(240, 340);
      tctx.moveTo(110, 185); tctx.lineTo(370, 185);
      tctx.stroke();
      tctx.fillText('physical', 175, 120);
      tctx.fillText('emotional', 305, 120);
      tctx.fillText('time-related', 175, 250);
      tctx.fillText('mental', 305, 250);
    } else {
      tctx.beginPath(); tctx.arc(240, 185, 55, 0, Math.PI * 2); tctx.stroke();
      tctx.beginPath(); tctx.arc(240, 185, 105, 0, Math.PI * 2); tctx.stroke();
      tctx.beginPath(); tctx.arc(240, 185, 150, 0, Math.PI * 2); tctx.stroke();
      tctx.fillText('closest', 240, 100);
      tctx.fillText('friends', 240, 60);
      tctx.fillText('distant', 240, 28);
      if (names.a) { tctx.fillText(names.a.slice(0, 20), 240, 190); }
      if (names.b) { tctx.fillText(names.b.slice(0, 20), 330, 150); }
      if (names.c) { tctx.fillText(names.c.slice(0, 20), 150, 300); }
    }
  }
  drawTemplate();

  if (names) {
    ['a', 'b', 'c'].forEach(function (k) {
      var inp = document.getElementById('paint-name-' + k);
      if (inp) inp.addEventListener('input', function () { names[k] = inp.value; drawTemplate(); });
    });
  }

  var bar = document.getElementById('paint-bar');
  var petalColors = PAINT_COLORS.slice();
  try {
    var gs = (window.Liber && window.Liber.state && window.Liber.state.get()) || {};
    (gs.palette || []).forEach(function (p) {
      if (petalColors.indexOf(p) < 0) petalColors.push(p);
    });
  } catch (e) {}
  petalColors.forEach(function (c, i) {
    var sw = document.createElement('button');
    sw.type = 'button';
    sw.className = 'paint-swatch' + (i === 0 ? ' on' : '');
    sw.style.background = c;
    sw.setAttribute('aria-label', 'paint ' + c);
    sw.addEventListener('click', function () {
      color = c;
      var sibs = bar.querySelectorAll('.paint-swatch');
      for (var k = 0; k < sibs.length; k++) sibs[k].classList.remove('on');
      sw.classList.add('on');
    });
    bar.appendChild(sw);
  });
  PAINT_SIZES.forEach(function (sz, i) {
    var zb = document.createElement('button');
    zb.type = 'button';
    zb.className = 'paint-size' + (i === 1 ? ' on' : '');
    zb.textContent = ['fine', 'hand', 'mop'][i];
    zb.addEventListener('click', function () {
      size = sz;
      var sibs = bar.querySelectorAll('.paint-size');
      for (var k = 0; k < sibs.length; k++) sibs[k].classList.remove('on');
      zb.classList.add('on');
    });
    bar.appendChild(zb);
  });

  function pos(e) {
    var r = top.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (480 / r.width), y: (e.clientY - r.top) * (360 / r.height) };
  }
  var painting = false;
  function strokeTo(p) {
    pctx.strokeStyle = color;
    pctx.lineWidth = size;
    pctx.lineCap = 'round';
    pctx.lineJoin = 'round';
    pctx.lineTo(p.x, p.y);
    pctx.stroke();
    strokes++;
  }
  top.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    painting = true;
    try { top.setPointerCapture(e.pointerId); } catch (err) {}
    var p = pos(e);
    pctx.beginPath();
    pctx.moveTo(p.x, p.y);
    strokeTo(p);
  });
  top.addEventListener('pointermove', function (e) {
    if (!painting) return;
    strokeTo(pos(e));
  });
  function stopPaint() {
    if (!painting) return;
    painting = false;
    try { pctx.beginPath(); } catch (e) {}
  }
  top.addEventListener('pointerup', stopPaint);
  top.addEventListener('pointercancel', stopPaint);
  top.addEventListener('pointerleave', stopPaint);

  var clear = document.getElementById('paint-clear');
  if (clear) clear.addEventListener('click', function () {
    pctx.clearRect(0, 0, 480, 360);
    strokes = 0;
  });

  var keepBtn = document.getElementById('paint-keep');
  var result = document.getElementById('paint-result');
  if (keepBtn) keepBtn.addEventListener('click', function () {
    if (!strokes) {
      if (result) result.textContent = 'paint something first — the canvas is still clean.';
      return;
    }
    var merged = document.createElement('canvas');
    merged.width = 480; merged.height = 360;
    var mctx = merged.getContext('2d');
    mctx.fillStyle = '#e8dcc0';
    mctx.fillRect(0, 0, 480, 360);
    mctx.drawImage(tpl, 0, 0);
    mctx.drawImage(top, 0, 0);
    var shot = ctx.thumb(merged);
    var summary = kind === 'circles' && (names.a || names.b || names.c)
      ? 'result: ' + strokes + ' strokes; closest: ' + (names.a || '—') + ', friends: ' + (names.b || '—') + ', distant: ' + (names.c || '—') + '.'
      : 'result: ' + strokes + ' strokes of paint.';
    ctx.promptSave(b, summary, function () {
      ctx.saveToDesktopAndSatchel(b, { strokes: strokes, names: names }, shot);
      if (result) result.textContent = 'kept. the tent remembers.';
    }, null);
  });
}

window.LiberBooths = window.LiberBooths || {};
window.LiberBooths.paint = playPaint;
