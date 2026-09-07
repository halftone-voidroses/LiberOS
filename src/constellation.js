// constellation.js — the desktop as a relational graph
// The buddy stone is the hub. Every artifact ever created orbits it
// (regardless of whether a relation exists). Clicking an artifact
// opens a tiny mini-menu with a free-form verb input to bind it to
// the buddy. Clicking the stone itself opens the sigil app.

(function () {
  var svg = document.getElementById('constellation-svg');
  var empty = document.getElementById('constellation-empty');
  var mini = document.getElementById('constellation-mini');
  var miniVerb = document.getElementById('constellation-mini-verb');
  var miniSave = document.getElementById('constellation-mini-save');
  var miniLabel = document.getElementById('constellation-mini-label');
  var miniClose = document.getElementById('constellation-mini-close');
  var miniRelease = document.getElementById('constellation-mini-release');
  if (!svg) return;

  var ARTIFACT_PALETTE = [
    { color: '#ff69b4', glow: 'rgba(255,105,180,0.5)' },
    { color: '#d4af6a', glow: 'rgba(212,175,106,0.5)' },
    { color: '#5a8aaa', glow: 'rgba(90,138,170,0.5)' },
    { color: '#7a9a4a', glow: 'rgba(122,154,74,0.5)' },
    { color: '#cc6020', glow: 'rgba(204,96,32,0.5)' },
    { color: '#a07ac0', glow: 'rgba(160,122,192,0.5)' },
    { color: '#aa3030', glow: 'rgba(170,48,48,0.5)' },
    { color: '#4a6068', glow: 'rgba(74,96,104,0.5)' },
    { color: '#d8c040', glow: 'rgba(216,192,64,0.5)' },
    { color: '#8a4a8a', glow: 'rgba(138,74,138,0.5)' },
    { color: '#5a7a4a', glow: 'rgba(90,122,74,0.5)' },
    { color: '#c89060', glow: 'rgba(200,144,96,0.5)' }
  ];

  function getState() {
    return (window.Liber && window.Liber.state && window.Liber.state.get()) || {};
  }
  function stoneOf(list) { return (list || []).filter(function (e) { return e && e.kind === 'stone'; }); }
  function sealedOf(list) { return (list || []).filter(function (e) { return !e || e.kind !== 'stone'; }); }

  function allArtifacts() {
    var s = getState();
    var all = [];
    var c = s.buddy || [];
    for (var q = 0; q < c.length; q++) all.push({ kind: 'buddy', label: c[q].name || 'sealed words', data: c[q] });
    var d = s.divination || [];
    for (var i = 0; i < d.length; i++) all.push({ kind: 'divination', label: d[i].name, data: d[i] });
    var g = s.games || [];
    for (var j = 0; j < g.length; j++) all.push({ kind: 'games', label: g[j].name, data: g[j] });
    var l = s.learn || [];
    for (var k = 0; k < l.length; k++) all.push({ kind: 'learn', label: l[k].topic, data: l[k] });
    var ab = s.abstract || [];
    for (var m = 0; m < ab.length; m++) all.push({ kind: 'abstract', label: ab[m].label || 'abstract', data: ab[m] });
    var se = s.sea || [];
    for (var n = 0; n < se.length; n++) all.push({ kind: 'sea', label: se[n].label || 'sea', data: se[n] });
    var gd = s.garden || [];
    for (var p = 0; p < gd.length; p++) all.push({ kind: 'garden', label: gd[p].name || 'a planted seed', data: gd[p] });
    var dr = s.dreams || [];
    for (var dr2 = 0; dr2 < dr.length; dr2++) all.push({ kind: 'dreams', label: dr[dr2].title || 'a recorded dream', data: dr[dr2] });
    return all;
  }

  function relationsFor(fromId) {
    var s = getState();
    return (s.relations || []).filter(function (r) { return r.from === fromId; });
  }

  function positionFor(i, total, cx, cy, rx, ry) {
    var a = (i / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry };
  }

  var selectedArtifact = null;
  var lastSig = null;

  // The orbit is a CSS animation on the rendered <g> — rebuilding the SVG
  // restarts it from zero. Cycling the dial writes `visited` on every press,
  // which reset the orbit each time (user report). Skip the rebuild unless
  // something the drawing actually depends on changed.
  function drawSig(s) {
    return [stoneOf(s.buddy).length, sealedOf(s.buddy).length, s.divination.length, s.games.length,
      s.learn.length, s.abstract.length, s.sea.length, s.garden.length, s.dreams.length,
      s.relations.length, s.tutorialDone ? 1 : 0].join('|')
      + ':' + (s.relations || []).map(function (r) { return r.from + '>' + r.verb; }).join(',');
  }

  function render() {
    var s = getState();
    var sig = drawSig(s);
    if (sig === lastSig) return;
    lastSig = sig;
    var sigils = stoneOf(s.buddy);
    var artifacts = allArtifacts();
    var relations = s.relations || [];

    if (!s.tutorialDone) {
      if (empty) {
        empty.style.display = '';
        empty.innerHTML = '— make a buddy first —<div class="constellation-empty-sub">open buddy on the dial.</div>';
      }
      svg.innerHTML = '';
      return;
    }
    if (sigils.length === 0) {
      if (empty) {
        empty.style.display = '';
        var sealedWait = sealedOf(s.buddy).length;
        empty.innerHTML = '— cast the buddy first —<div class="constellation-empty-sub">open the buddy from the dial.</div>'
          + (sealedWait > 0 ? '<div class="constellation-empty-sub">' + sealedWait + ' sealed chat' + (sealedWait === 1 ? '' : 's') + ' saved.</div>' : '');
      }
      svg.innerHTML = '';
      return;
    }
    if (empty) {
      if (artifacts.length === 0) {
        empty.style.display = '';
        empty.innerHTML = '— buddy made —<div class="constellation-empty-sub">save one thing: a card, a line, a seed.</div>';
      } else if (relations.length === 0) {
        empty.style.display = '';
        empty.innerHTML = '— something saved —<div class="constellation-empty-sub">give it a verb to bind it to your buddy.</div>';
      } else {
        empty.style.display = 'none';
      }
    }

    var W = 600, H = 400;
    var cx = W / 2, cy = H / 2;
    var sigilR = 22;
    var orbitR = Math.min(W, H) * 0.32;

    var sigilPos = { x: cx, y: cy };
    var html = '';

    var boundIndices = [];
    for (var i = 0; i < artifacts.length; i++) {
      var artId = artifacts[i].data && artifacts[i].data.id ? artifacts[i].data.id : null;
      if (artId && relationsFor(artId).length > 0) boundIndices.push(i);
    }

    // WS5 competence made visible: as the relation web grows, every edge
    // draws itself thicker and surer (capped).
    var edgeWidth = (1.6 + Math.min(relations.length, 8) * 0.45).toFixed(2);
    var edgeOpacity = Math.min(0.5 + relations.length * 0.06, 0.9).toFixed(2);

    html += '<g class="constellation-orbit">';

    for (var rr = 0; rr < relations.length; rr++) {
      var rel = relations[rr];
      var aIdx = artifacts.findIndex(function (a) { return a.data && a.data.id === rel.from; });
      if (aIdx < 0) continue;
      var ap = positionFor(aIdx, artifacts.length, cx, cy, orbitR, orbitR * 0.7);
      var verb = (rel.verb || '').toString();
      var mx = (ap.x + sigilPos.x) / 2;
      var my = (ap.y + sigilPos.y) / 2;
      html += '<line x1="' + ap.x + '" y1="' + ap.y + '" x2="' + sigilPos.x + '" y2="' + sigilPos.y + '" stroke="rgba(255,105,180,' + edgeOpacity + ')" stroke-width="' + edgeWidth + '" stroke-dasharray="4 5"/>';
      if (verb && verb !== 'relates to') {
        html += '<text x="' + mx + '" y="' + (my - 4) + '" text-anchor="middle" fill="rgba(255,200,220,0.7)" font-size="6.5" font-style="italic" font-family="Georgia, serif" style="pointer-events: none;">' + verb + '</text>';
      }
    }

    for (var bi = 0; bi < artifacts.length; bi++) {
      var art = artifacts[bi];
      var p = positionFor(bi, artifacts.length, cx, cy, orbitR, orbitR * 0.7);
      var pal = ARTIFACT_PALETTE[bi % ARTIFACT_PALETTE.length];
      var id = art.data && art.data.id ? art.data.id : 'a' + bi;
      var isBound = boundIndices.indexOf(bi) !== -1;
      html += '<circle class="constellation-artifact" data-artifact-id="' + id + '" cx="' + p.x + '" cy="' + p.y + '" r="9" fill="' + pal.color + '" fill-opacity="' + (isBound ? '1.0' : '0.55') + '" stroke="#fff" stroke-width="0.6" style="cursor: pointer; filter: drop-shadow(0 0 5px ' + pal.glow + ');"/>';
      html += '<text x="' + p.x + '" y="' + (p.y + 3) + '" text-anchor="middle" fill="#1a0a05" font-size="8" font-weight="700" style="pointer-events: none;">' + (bi + 1) + '</text>';
      var lbl = (art.label || '').toString();
      if (lbl.length > 18) lbl = lbl.substring(0, 16) + '..';
      html += '<text x="' + p.x + '" y="' + (p.y - 14) + '" text-anchor="middle" fill="#c8b890" font-size="7" font-family="serif" font-style="italic" style="pointer-events: none;">' + lbl + '</text>';
    }

    html += '</g>';

    html += '<circle class="constellation-sigil-halo" cx="' + sigilPos.x + '" cy="' + sigilPos.y + '" r="' + (sigilR + 14) + '" fill="none" stroke="rgba(255,200,100,0.3)" stroke-width="1.5" stroke-dasharray="2 6"/>';
    html += '<circle class="constellation-sigil" id="constellation-sigil" cx="' + sigilPos.x + '" cy="' + sigilPos.y + '" r="' + sigilR + '" fill="rgba(255,200,100,0.95)" stroke="#fff" stroke-width="0.8" style="cursor: pointer; filter: drop-shadow(0 0 10px rgba(255,200,100,0.8));"/>';
    html += '<text x="' + sigilPos.x + '" y="' + (sigilPos.y + 6) + '" text-anchor="middle" fill="#2a1408" font-size="22" font-weight="700" style="pointer-events: none;">★</text>';
    html += '<text x="' + sigilPos.x + '" y="' + (sigilPos.y + sigilR + 18) + '" text-anchor="middle" fill="#c8b890" font-size="8" font-family="serif" font-style="italic" style="pointer-events: none;">buddy</text>';

    if (artifacts.length > 0) {
      var boundCount = boundIndices.length;
      html += '<text x="' + cx + '" y="14" text-anchor="middle" fill="rgba(200,184,144,0.4)" font-size="7" font-family="serif" font-style="italic">— ' + artifacts.length + ' artifact' + (artifacts.length === 1 ? '' : 's') + ', ' + boundCount + ' bound —</text>';
    } else {
      html += '<text x="' + cx + '" y="14" text-anchor="middle" fill="rgba(200,184,144,0.4)" font-size="7" font-family="serif" font-style="italic">— draw a card, play a game, graduate a lesson. they will appear here. —</text>';
    }

    svg.innerHTML = html;

    var sigilEl = document.getElementById('constellation-sigil');
    if (sigilEl) sigilEl.addEventListener('click', openSigilApp);
    var artEls = svg.querySelectorAll('.constellation-artifact');
    for (var ai = 0; ai < artEls.length; ai++) {
      (function (el) {
        el.addEventListener('click', function () {
          var id = el.getAttribute('data-artifact-id');
          var found = null;
          for (var q = 0; q < artifacts.length; q++) {
            if (artifacts[q].data && artifacts[q].data.id === id) { found = artifacts[q]; break; }
          }
          if (found) openMini(found);
        });
      })(artEls[ai]);
    }
  }

  function openSigilApp() {
    window.location.href = 'sigil.html';
  }

  function openMini(artifact) {
    selectedArtifact = artifact;
    if (!mini) return;
    if (miniLabel) miniLabel.textContent = artifact.label || artifact.data && artifact.data.name || 'artifact';
    var existing = relationsFor(artifact.data.id);
    if (miniVerb) {
      miniVerb.value = existing.length ? (existing[0].verb || '') : '';
      miniVerb.setAttribute('aria-label', 'how does this relate?');
    }
    mini.removeAttribute('inert');
    mini.classList.add('open');
    setTimeout(function () { if (miniVerb) miniVerb.focus(); }, 100);
  }

  function closeMini() {
    if (!mini) return;
    mini.classList.remove('open');
    mini.setAttribute('inert', '');
    selectedArtifact = null;
  }

  function saveMini() {
    if (!selectedArtifact) return;
    var verb = (miniVerb && miniVerb.value || '').trim() || 'relates to';
    if (window.Liber && window.Liber.state) {
      window.Liber.state.unbindRelation(selectedArtifact.data.id);
      window.Liber.state.bindRelation(selectedArtifact.data.id, verb);
    }
    if (window.Liber && window.Liber.sound) window.Liber.sound.play('chime');
    closeMini();
    render();
  }

  if (miniClose) miniClose.addEventListener('click', closeMini);
  if (miniSave)  miniSave.addEventListener('click', saveMini);
  if (miniVerb)  miniVerb.addEventListener('keydown', function (e) { if (e.key === 'Enter') saveMini(); if (e.key === 'Escape') closeMini(); });

  function releaseMini() {
    if (!selectedArtifact) return;
    var id = selectedArtifact.data.id;
    var kind = selectedArtifact.kind;
    if (window.Liber && window.Liber.state) {
      if (window.Liber.state.releaseArtifact) window.Liber.state.releaseArtifact(kind, id);
      if (window.Liber.state.unbindRelation) window.Liber.state.unbindRelation(id);
    }
    if (window.Liber && window.Liber.sound) window.Liber.sound.play('thunk');
    closeMini();
    render();
  }

  if (miniRelease) miniRelease.addEventListener('click', releaseMini);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }

  // Bfcache restore: the DOM is the old snapshot; state.js resyncs first
  // (it loads earlier), then redraw from the fresh state so the cast made
  // on the casting stone appears without a full reload.
  window.addEventListener('pageshow', function () { render(); });

  // Redraw on any state change — reset ("start over") clears the stone in
  // place, and without this the desktop kept showing the old star.
  if (window.Liber && window.Liber.state && window.Liber.state.on) {
    window.Liber.state.on('change', render);
  }

  window.ConstellationRefresh = function () { render(); };
})();
