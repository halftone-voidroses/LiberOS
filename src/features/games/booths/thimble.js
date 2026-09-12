// Thimble garden — Ruby's idle game — extracted verbatim from the games monolith.
var THIMBLE_PETALS = ['#e08ab0', '#9ac8e8', '#c8e89a', '#e8d89a', '#d8a8e8'];

function thimbleState() {
  var s = (window.Liber && window.Liber.state && window.Liber.state.get()) || {};
  return s.thimble || { visits: 0, base: 0, harvested: 0 };
}
function thimbleStage(t) {
  return Math.max(0, Math.min(5, Math.floor(((t.visits || 0) - (t.base || 0)) / 3)));
}

function playThimble(ctx, b, body) {
  body.innerHTML =
    '<div class="thimble-wrap">'
    + '<canvas class="thimble-canvas" id="thimble-canvas" width="480" height="360"></canvas>'
    + '<div class="thimble-hint" id="thimble-hint">it grows while you are elsewhere. visit rooms, come back.</div>'
    + '<div class="games-actions" style="justify-content:center">'
    + '<button type="button" class="games-action" id="thimble-harvest">harvest</button>'
    + '</div>'
    + '<div class="games-result" id="thimble-result"></div>'
    + '</div>';

  var cv = document.getElementById('thimble-canvas');
  var ctx = cv.getContext('2d');
  var result = document.getElementById('thimble-result');
  var hint = document.getElementById('thimble-hint');

  function draw() {
    var t = thimbleState();
    var stage = thimbleStage(t);
    ctx.fillStyle = '#0d0805';
    ctx.fillRect(0, 0, 480, 360);
    // thimble pot
    ctx.fillStyle = '#8a8a92';
    ctx.beginPath();
    ctx.moveTo(200, 220); ctx.lineTo(280, 220); ctx.lineTo(268, 300); ctx.lineTo(212, 300);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3a2412';
    ctx.fillRect(196, 210, 88, 14);
    // leaves by stage
    ctx.strokeStyle = '#3a8a3a';
    ctx.fillStyle = '#3a8a3a';
    ctx.lineWidth = 3;
    for (var i = 0; i < stage; i++) {
      var side = i % 2 === 0 ? -1 : 1;
      var y = 200 - Math.floor(i / 2) * 34;
      ctx.beginPath();
      ctx.ellipse(240 + side * (20 + (i % 2) * 8), y, 22, 9, side * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    if (stage >= 5) {
      // bloom + dew sparkle
      ctx.fillStyle = '#e08ab0';
      ctx.beginPath(); ctx.arc(240, 96, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(236, 92, 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#a89070';
    ctx.font = 'italic 14px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText(stage === 0 ? 'an empty thimble. go elsewhere.' : stage + (stage === 1 ? ' leaf.' : ' leaves.'), 240, 336);
    if (hint) {
      hint.textContent = stage === 0
        ? 'it grows while you are elsewhere. visit rooms, come back.'
        : 'dew sparkles. harvest when ready — or let it keep growing.';
    }
  }
  draw();

  var harvest = document.getElementById('thimble-harvest');
  if (harvest) harvest.addEventListener('click', function () {
    var st = (window.Liber && window.Liber.state) || null;
    if (!st) return;
    var t = thimbleState();
    var stage = thimbleStage(t);
    if (!stage) {
      if (result) result.textContent = 'nothing to harvest yet — go live a little, then return.';
      return;
    }
    var shot = ctx.thumb(cv);
    var petal = THIMBLE_PETALS[(t.harvested || 0) % THIMBLE_PETALS.length];
    ctx.promptSave(b, 'result: ' + stage + ' leaves pressed, one ' + petal + ' petal for the paint boxes.', function () {
      ctx.saveToDesktopAndSatchel(b, { leaves: stage, harvested: (t.harvested || 0) + 1, petal: petal }, shot);
      try {
        var g = st.get() || {};
        var pal = Array.isArray(g.palette) ? g.palette.slice() : [];
        if (pal.indexOf(petal) < 0) pal.push(petal);
        st.set({ palette: pal, thimble: { visits: t.visits || 0, base: t.visits || 0, harvested: (t.harvested || 0) + 1 } });
      } catch (e) {}
      if (result) result.textContent = 'kept. a petal drifts to every paint box.';
      draw();
    }, null);
  });
}

window.LiberBooths = window.LiberBooths || {};
window.LiberBooths.thimble = playThimble;
