// games.js — Whimsy Wow. Six DBT game booths (bottles/rings removed). No shared imports (covenant Q.1).
// Each booth is a square that opens a small play window in place.
// Each play session auto-saves its result to satchel via
// state.addArtifact('satchel', ...) and the booth itself shows up on
// the desktop.

(function () {
  var grid = document.getElementById('games-grid');
  var stage = document.getElementById('games-stage');

  var BOOTHS = [
    { id: 'tip',         name: 'TIPP',         glyph: '✦', desc: 'temperature, intense exercise, paced breath, progressive relaxation.' },
    { id: 'stop',        name: 'STOP',         glyph: '⊘', desc: 'stop, take a step back, observe, proceed mindfully.' },
    { id: 'wheel',       name: 'wheel',        glyph: '◐', desc: 'wise mind spin · observe the click.' },
    { id: 'opposite',    name: 'opposite',     glyph: '↔', desc: 'name the urge, then do the opposite.' },
    { id: 'check',       name: 'check facts',  glyph: '?', desc: 'ask: is this thought a fact?' },
    { id: 'accept',      name: 'accept',       glyph: '◇', desc: 'name the thing, do not fight it.' },
    { id: 'iching',      name: 'six-line',     glyph: '☰', desc: 'cast six lines to build an i ching hexagram.' },
    { id: 'emotion',     name: 'emotion wheel',glyph: '◉', desc: 'map the feeling. name it. save it.' },
    { id: 'thermometer', name: 'thermometer',  glyph: '°', desc: 'rate the intensity. name the trigger.' },
    { id: 'mandala',     name: 'mandala',      glyph: '◯', desc: 'trace the lines. ground the attention.' },
    { id: 'cutup',       name: 'cut-up desk',  glyph: '✂', desc: 'cut the page. rearrange the words.' },
    { id: 'coloring',    name: 'mindful color',glyph: '✎', desc: 'colour in the silence.' },
    { id: 'bodymap',     name: 'body map',     glyph: '☖', desc: 'where does it live in you the body.' }
  ];

  function buildBooths() {
    if (!grid) return;
    grid.innerHTML = '';
    for (var i = 0; i < BOOTHS.length; i++) {
      (function (b) {
        var div = document.createElement('div');
        div.className = 'games-booth';
        div.setAttribute('data-game', b.id);
        div.innerHTML =
          '<div class="games-booth-glyph">' + b.glyph + '</div>' +
          '<div class="games-booth-name">' + b.name + '</div>' +
          '<div class="games-booth-desc">' + b.desc + '</div>';
        div.addEventListener('click', function () { openPlay(b); });
        grid.appendChild(div);
      })(BOOTHS[i]);
    }
  }

  function closeStage() {
    if (!stage) return;
    stage.innerHTML = '';
    stage.classList.remove('open');
    stage.setAttribute('aria-hidden', 'true');
  }

  function saveToDesktopAndSatchel(b, result) {
    if (!window.Liber || !window.Liber.state) return;
    if (window.Liber.state.addArtifact) {
      window.Liber.state.addArtifact('games', { kind: b.id, name: b.name, glyph: b.glyph, result: result, ts: Date.now() });
    }
    if (window.Liber.state.addArtifact) {
      window.Liber.state.addArtifact('satchel', { kind: 'game', ref: b.id, name: b.name, result: result, ts: Date.now() });
    }
  }

  function promptSave(b, summary, doSave, doDiscard) {
    var prompt = document.getElementById('games-save-prompt');
    var body = document.getElementById('games-save-prompt-body');
    if (!prompt) { doSave(); return; }
    pendingPayload = { summary: summary, doSave: doSave, doDiscard: doDiscard };
    if (body) body.innerHTML = 'booth: <em>' + b.name + '</em>. ' + summary;
    prompt.classList.add('open');
    prompt.setAttribute('aria-hidden', 'false');
  }

  var pendingPayload = null;

  function closePrompt() {
    var prompt = document.getElementById('games-save-prompt');
    if (!prompt) return;
    prompt.classList.remove('open');
    prompt.setAttribute('aria-hidden', 'true');
    pendingPayload = null;
  }

  function openPlay(b) {
    if (!stage) return;
    stage.classList.add('open');
    stage.setAttribute('aria-hidden', 'false');
    var html = '<div class="games-stage-inner">';
    html += '<div class="games-stage-head">';
    html += '<span class="games-stage-glyph">' + b.glyph + '</span>';
    html += '<span class="games-stage-name">' + b.name + '</span>';
    html += '<button type="button" class="games-stage-close" id="games-stage-close" aria-label="close">×</button>';
    html += '</div>';
    html += '<div class="games-stage-body" id="games-stage-body"></div>';
    html += '</div>';
    stage.innerHTML = html;
    var closeBtn = document.getElementById('games-stage-close');
    if (closeBtn) closeBtn.addEventListener('click', closeStage);
    var body = document.getElementById('games-stage-body');
    if (!body) return;
    renderPlay(b, body);
  }

  function renderPlay(b, body) {
    body.innerHTML = '';
    if (b.id === 'tip') {
      body.innerHTML =
        '<div class="games-prompt">TIPP — temperature, intense exercise, paced breath, progressive relaxation. hold the ice: 30 seconds.</div>' +
        '<div class="games-tip-thermo"><div class="games-tip-thermo-fill" id="tip-fill"></div></div>' +
        '<div class="games-tip-row">' +
          '<button type="button" class="games-action" id="tip-ice">face in ice</button>' +
          '<button type="button" class="games-action" id="tip-breath">paced breath 4-4-6</button>' +
          '<button type="button" class="games-action" id="tip-relax">tense / release</button>' +
        '</div>' +
        '<div class="games-tip-meter">heart rate · <span id="tip-hr">72</span> bpm · distress <span id="tip-distress">6</span>/10</div>' +
        '<div class="games-tip-log" id="tip-log">begin.</div>' +
        '<div class="games-actions"><button type="button" class="games-action" id="tip-save">save what happened</button></div>';
      var hr = 72, distress = 6;
      var log = document.getElementById('tip-log');
      function tipLog(s) { if (log) log.textContent = s; }
      var fill = document.getElementById('tip-fill');
      function setFill(pct) { if (fill) fill.style.width = pct + '%'; }
      function sync() {
        var h = document.getElementById('tip-hr'); if (h) h.textContent = hr;
        var d = document.getElementById('tip-distress'); if (d) d.textContent = distress;
      }
      var ice = document.getElementById('tip-ice');
      var breath = document.getElementById('tip-breath');
      var relax = document.getElementById('tip-relax');
      var iceTimer = null, iceT = 0;
      if (ice) ice.addEventListener('click', function () {
        if (iceTimer) { clearInterval(iceTimer); iceTimer = null; tipLog('ice: aborted.'); return; }
        iceT = 0; setFill(0); tipLog('ice: 0/30s — hold.');
        iceTimer = setInterval(function () {
          iceT++;
          setFill((iceT / 30) * 100);
          if (iceT >= 30) { clearInterval(iceTimer); iceTimer = null; hr = Math.max(60, hr - 8); distress = Math.max(0, distress - 2); sync(); tipLog('ice: 30s held. hr ' + hr + ', distress ' + distress + '.'); }
        }, 1000);
      });
      var breathPhases = ['in 4', 'hold 4', 'out 6', 'hold 4'];
      var breathT = 0, breathI = null;
      if (breath) breath.addEventListener('click', function () {
        if (breathI) { clearInterval(breathI); breathI = null; tipLog('breath: stopped.'); return; }
        breathT = 0;
        breathI = setInterval(function () {
          tipLog('breath: ' + breathPhases[breathT % 4]);
          breathT++;
          if (breathT % 8 === 0) { hr = Math.max(58, hr - 1); distress = Math.max(0, distress - 1); sync(); }
        }, 2000);
      });
      var relaxI = null, relaxT = 0;
      if (relax) relax.addEventListener('click', function () {
        if (relaxI) { clearInterval(relaxI); relaxI = null; tipLog('relax: stopped.'); return; }
        relaxT = 0;
        relaxI = setInterval(function () {
          tipLog('relax: ' + (relaxT % 2 === 0 ? 'tense 5s' : 'release 5s'));
          relaxT++;
          if (relaxT % 4 === 0) { distress = Math.max(0, distress - 1); sync(); }
        }, 2500);
      });
      var s = document.getElementById('tip-save');
      if (s) s.addEventListener('click', function () {
        promptSave(b, 'TIPP done. hr: ' + hr + '. distress: ' + distress + '/10.', function () {
          saveToDesktopAndSatchel(b, { type: 'tip', hr: hr, distress: distress, ice: iceT });
          body.innerHTML = '<div class="games-result">— saved · hr ' + hr + ' · distress ' + distress + '/10 —</div>';
        }, function () {
          body.innerHTML = '<div class="games-result">— discarded —</div>';
        });
      });
    } else if (b.id === 'stop') {
      body.innerHTML =
        '<div class="games-prompt">STOP — stop, take a step back, observe, proceed mindfully. tap each frame.</div>' +
        '<div class="games-stop-deck" id="stop-deck"></div>' +
        '<div class="games-actions"><button type="button" class="games-action" id="stop-next">next frame</button><button type="button" class="games-action" id="stop-save">save the moment</button></div>';
      var stopFrames = [
        { letter: 'S', word: 'STOP', prompt: 'freeze. do not move. what is happening right now?' },
        { letter: 'T', word: 'TAKE A STEP BACK', prompt: 'a step back. what is the wider picture?' },
        { letter: 'O', word: 'OBSERVE', prompt: 'observe. name the urge without acting on it.' },
        { letter: 'P', word: 'PROCEED MINDFULLY', prompt: 'proceed. what is the next small kind move?' }
      ];
      var stopIdx = 0;
      var sd = document.getElementById('stop-deck');
      function paintStop() {
        if (!sd) return;
        sd.innerHTML = '<div class="games-stop-card games-stop-active"><div class="games-stop-letter">' + stopFrames[stopIdx].letter + '</div><div class="games-stop-word">' + stopFrames[stopIdx].word + '</div><div class="games-stop-prompt">' + stopFrames[stopIdx].prompt + '</div></div>';
        for (var k = 0; k < stopFrames.length; k++) {
          if (k !== stopIdx) sd.innerHTML += '<div class="games-stop-card games-stop-future"><div class="games-stop-letter">' + stopFrames[k].letter + '</div></div>';
        }
      }
      paintStop();
      var stopNotes = [];
      var nextBtn = document.getElementById('stop-next');
      if (nextBtn) nextBtn.addEventListener('click', function () {
        stopIdx = (stopIdx + 1) % stopFrames.length;
        paintStop();
      });
      var s2 = document.getElementById('stop-save');
      if (s2) s2.addEventListener('click', function () {
        promptSave(b, 'STOP walked. last frame: <em>' + stopFrames[stopIdx].word + '</em>.', function () {
          saveToDesktopAndSatchel(b, { type: 'stop', lastFrame: stopFrames[stopIdx].word });
          body.innerHTML = '<div class="games-result">— saved · walked STOP to ' + stopFrames[stopIdx].word + ' —</div>';
        }, function () {
          body.innerHTML = '<div class="games-result">— discarded —</div>';
        });
      });
    } else if (b.id === 'wheel') {
      var spin = 720 + Math.floor(Math.random() * 720);
      body.innerHTML =
        '<div class="games-prompt">spin the wheel of wise mind. land on what is true.</div>' +
        '<div class="games-wheel-wrap"><div class="games-wheel-pointer">▼</div><div class="games-wheel-disc" id="games-wheel-disc" style="transform: rotate(' + spin + 'deg);"></div></div>' +
        '<div class="games-actions"><button type="button" class="games-action" id="wheel-save">land</button></div>';
      var s3 = document.getElementById('wheel-save');
      if (s3) s3.addEventListener('click', function () {
        var r = Math.floor((spin % 360) / 60);
        var labels = ['emotion mind', 'wise mind', 'reasonable mind', 'emotion mind', 'wise mind', 'reasonable mind'];
        var landed = labels[r] || 'wise mind';
        promptSave(b, 'landed: <em>' + landed + '</em>.', function () {
          saveToDesktopAndSatchel(b, { type: 'wheel', landed: landed, deg: spin });
          body.innerHTML = '<div class="games-result">— landed on ' + landed + ' —</div>';
        }, function () {
          body.innerHTML = '<div class="games-result">— discarded —</div>';
        });
      });
    } else if (b.id === 'bottles') {
      body.innerHTML =
        '<div class="games-prompt">knock them down. then save.</div>' +
        '<div class="games-bottles" id="games-bottles"></div>' +
        '<div class="games-actions"><button type="button" class="games-action" id="bottles-save">save</button></div>';
      var bt = document.getElementById('games-bottles');
      if (bt) {
        for (var i = 0; i < 5; i++) {
          var x = document.createElement('div');
          x.className = 'games-bottle';
          x.addEventListener('click', function () { this.classList.toggle('down'); });
          bt.appendChild(x);
        }
      }
      var s4 = document.getElementById('bottles-save');
      if (s4) s4.addEventListener('click', function () {
        var downs = bt ? bt.querySelectorAll('.games-bottle.down').length : 0;
        promptSave(b, 'toppled: ' + downs + '.', function () {
          saveToDesktopAndSatchel(b, { type: 'bottles', down: downs });
          body.innerHTML = '<div class="games-result">— ' + downs + ' toppled —</div>';
        }, function () {
          body.innerHTML = '<div class="games-result">— discarded —</div>';
        });
      });
    } else if (b.id === 'rings') {
      body.innerHTML =
        '<div class="games-prompt">strike the rings.</div>' +
        '<div class="games-rings" id="games-rings"></div>' +
        '<div class="games-actions"><button type="button" class="games-action" id="rings-save">save</button></div>';
      var rs = document.getElementById('games-rings');
      var ringStrikes = 0;
      if (rs) {
        for (var j = 0; j < 5; j++) {
          var r = document.createElement('div');
          r.className = 'games-ring';
          r.addEventListener('click', (function (ring) {
            return function () {
              ring.classList.add('struck');
              ringStrikes++;
            };
          })(r));
          rs.appendChild(r);
        }
      }
      var s5 = document.getElementById('rings-save');
      if (s5) s5.addEventListener('click', function () {
        promptSave(b, 'strikes: ' + ringStrikes + '.', function () {
          saveToDesktopAndSatchel(b, { type: 'rings', strikes: ringStrikes });
          body.innerHTML = '<div class="games-result">— ' + ringStrikes + ' strikes —</div>';
        }, function () {
          body.innerHTML = '<div class="games-result">— discarded —</div>';
        });
      });
    } else if (b.id === 'opposite') {
      body.innerHTML =
        '<div class="games-prompt">name the urge. name the opposite.</div>' +
        '<input type="text" class="games-input" id="opp-urge" maxlength="40" placeholder="the urge" />' +
        '<input type="text" class="games-input" id="opp-action" maxlength="40" placeholder="the opposite action" />' +
        '<div class="games-actions"><button type="button" class="games-action" id="opp-save">save</button></div>';
      var s6 = document.getElementById('opp-save');
      if (s6) s6.addEventListener('click', function () {
        var u = document.getElementById('opp-urge').value.trim() || '—';
        var o = document.getElementById('opp-action').value.trim() || '—';
        promptSave(b, 'urge: "' + u + '". opposite: "' + o + '".', function () {
          saveToDesktopAndSatchel(b, { type: 'opposite', urge: u, action: o });
          body.innerHTML = '<div class="games-result">— ' + u + ' / ' + o + ' —</div>';
        }, function () {
          body.innerHTML = '<div class="games-result">— discarded —</div>';
        });
      });
    } else if (b.id === 'check') {
      body.innerHTML =
        '<div class="games-prompt">is this thought a fact?</div>' +
        '<textarea class="games-input" id="check-input" rows="3" maxlength="200" placeholder="the thought"></textarea>' +
        '<div class="games-actions"><button type="button" class="games-action" id="check-yes">fact</button><button type="button" class="games-action" id="check-no">opinion</button></div>';
      var s7 = document.getElementById('check-yes');
      if (s7) s7.addEventListener('click', function () {
        var t = document.getElementById('check-input').value.trim() || '—';
        promptSave(b, 'thought: "' + t + '". fact: <em>yes</em>.', function () {
          saveToDesktopAndSatchel(b, { type: 'check', thought: t, fact: true });
          body.innerHTML = '<div class="games-result">— logged as fact · ' + t + ' —</div>';
        }, function () {
          body.innerHTML = '<div class="games-result">— discarded —</div>';
        });
      });
      var s8 = document.getElementById('check-no');
      if (s8) s8.addEventListener('click', function () {
        var t = document.getElementById('check-input').value.trim() || '—';
        promptSave(b, 'thought: "' + t + '". fact: <em>no</em>.', function () {
          saveToDesktopAndSatchel(b, { type: 'check', thought: t, fact: false });
          body.innerHTML = '<div class="games-result">— logged as opinion · ' + t + ' —</div>';
        }, function () {
          body.innerHTML = '<div class="games-result">— discarded —</div>';
        });
      });
    } else if (b.id === 'accept') {
      body.innerHTML =
        '<div class="games-prompt">name the thing you cannot change.</div>' +
        '<textarea class="games-input" id="accept-input" rows="3" maxlength="200" placeholder="the thing"></textarea>' +
        '<div class="games-actions"><button type="button" class="games-action" id="accept-save">accept</button></div>';
      var s9 = document.getElementById('accept-save');
      if (s9) s9.addEventListener('click', function () {
        var v = document.getElementById('accept-input').value.trim() || '—';
        promptSave(b, 'thing: "' + v + '".', function () {
          saveToDesktopAndSatchel(b, { type: 'accept', thing: v });
          body.innerHTML = '<div class="games-result">— accepted · ' + v + ' —</div>';
        }, function () {
          body.innerHTML = '<div class="games-result">— discarded —</div>';
        });
      });
    } else if (b.id === 'iching') {
      var ichingLines = [];
      function renderHex() {
        var h = body.querySelector('#games-iching-hex');
        if (!h) return;
        h.innerHTML = '';
        if (!ichingLines.length) {
          var empty = document.createElement('div');
          empty.className = 'games-prompt games-iching-empty';
          empty.textContent = 'cast six lines.';
          h.appendChild(empty);
          return;
        }
        ichingLines.forEach(function (ln) {
          var row = document.createElement('div');
          row.className = 'games-iching-row';
          row.innerHTML = ln.primary === 0
            ? '<span class="games-iching-seg left"></span><span class="games-iching-seg right"></span>'
            : '<span class="games-iching-seg full"></span><span class="games-iching-seg full"></span>';
          h.appendChild(row);
        });
      }
      body.innerHTML =
        '<div class="games-prompt">cast six lines. each click is one line. the hexagram reads itself.</div>' +
        '<div class="games-iching-hex" id="games-iching-hex"></div>' +
        '<div class="games-actions">' +
          '<button type="button" class="games-action" id="iching-cast">cast line 1</button>' +
          '<button type="button" class="games-action" id="iching-reset">reset</button>' +
        '</div>' +
        '<div class="games-iching-result" id="games-iching-result" hidden></div>';
      renderHex();
      var ichingCast = document.getElementById('iching-cast');
      var ichingReset = document.getElementById('iching-reset');
      var ichingRes = document.getElementById('games-iching-result');
      if (ichingCast) ichingCast.addEventListener('click', function () {
        if (ichingLines.length >= 6) return;
        var r = Math.floor(Math.random() * 4);
        var primary = (r < 2) ? r : 1 - (r % 2);
        ichingLines.push({ primary: primary });
        renderHex();
        ichingCast.textContent = ichingLines.length < 6 ? ('cast line ' + (ichingLines.length + 1)) : 'cast done';
        if (ichingLines.length === 6) {
          var bits = ichingLines.map(function (l) { return l.primary; }).join('');
          ichingRes.textContent = 'hexagram: ' + bits + '. pattern yielded. name it what you will.';
          ichingRes.hidden = false;
        }
      });
      if (ichingReset) ichingReset.addEventListener('click', function () {
        ichingLines = [];
        renderHex();
        if (ichingRes) ichingRes.hidden = true;
        ichingCast.textContent = 'cast line 1';
      });
    } else if (b.id === 'emotion') {
      body.innerHTML =
        '<div class="games-prompt">name the feeling. say where it lives. say what colour it is.</div>' +
        '<input type="text" class="games-input" id="emo-name" maxlength="40" placeholder="feeling" />' +
        '<input type="text" class="games-input" id="emo-place" maxlength="40" placeholder="where in the body" />' +
        '<input type="text" class="games-input" id="emo-colour" maxlength="40" placeholder="colour" />' +
        '<div class="games-actions"><button type="button" class="games-action" id="emo-save">save</button></div>';
      var emoSave = document.getElementById('emo-save');
      if (emoSave) emoSave.addEventListener('click', function () {
        var n = document.getElementById('emo-name').value.trim() || '—';
        var p = document.getElementById('emo-place').value.trim() || '—';
        var c = document.getElementById('emo-colour').value.trim() || '—';
        promptSave(b, n + ' lives in ' + p + ', colour ' + c + '.', function () {
          saveToDesktopAndSatchel(b, { type: 'emotion', name: n, place: p, colour: c });
          body.innerHTML = '<div class="games-result">— ' + n + ' / ' + p + ' / ' + c + ' —</div>';
        }, function () { body.innerHTML = '<div class="games-result">— discarded —</div>'; });
      });
    } else if (b.id === 'thermometer') {
      body.innerHTML =
        '<div class="games-prompt">rate the intensity. name the trigger.</div>' +
        '<div class="games-thermo">' +
          '<input type="range" class="games-thermo-range" id="thermo-level" min="0" max="10" value="5" />' +
          '<div class="games-thermo-readout">intensity · <span id="thermo-num">5</span>/10</div>' +
        '</div>' +
        '<input type="text" class="games-input" id="thermo-trigger" maxlength="80" placeholder="the trigger" />' +
        '<div class="games-actions"><button type="button" class="games-action" id="thermo-save">save</button></div>';
      var range = document.getElementById('thermo-level');
      var num = document.getElementById('thermo-num');
      if (range && num) range.addEventListener('input', function () { num.textContent = range.value; });
      var tSave = document.getElementById('thermo-save');
      if (tSave) tSave.addEventListener('click', function () {
        var lvl = range ? range.value : '5';
        var tr = document.getElementById('thermo-trigger').value.trim() || '—';
        promptSave(b, 'intensity ' + lvl + '/10. trigger: ' + tr + '.', function () {
          saveToDesktopAndSatchel(b, { type: 'thermometer', level: lvl, trigger: tr });
          body.innerHTML = '<div class="games-result">— ' + lvl + '/10 · ' + tr + ' —</div>';
        }, function () { body.innerHTML = '<div class="games-result">— discarded —</div>'; });
      });
    } else if (b.id === 'mandala') {
      body.innerHTML =
        '<div class="games-prompt">trace the mandala. follow the line. one breath in, one breath out.</div>' +
        '<canvas class="games-mandala" id="mandala-canvas" width="320" height="320"></canvas>' +
        '<div class="games-actions">' +
          '<button type="button" class="games-action" id="mandala-traced">i traced it</button>' +
          '<button type="button" class="games-action" id="mandala-reset">start over</button>' +
        '</div>';
      var mCan = document.getElementById('mandala-canvas');
      if (mCan) {
        var mctx = mCan.getContext('2d');
        var cx = 160, cy = 160;
        for (var r2 = 16; r2 < 160; r2 += 24) {
          mctx.beginPath(); mctx.arc(cx, cy, r2, 0, Math.PI * 2);
          mctx.strokeStyle = 'rgba(255, 215, 100, 0.4)';
          mctx.lineWidth = 1.4; mctx.stroke();
        }
        for (var a2 = 0; a2 < 12; a2++) {
          var ang = (a2 / 12) * Math.PI * 2;
          mctx.beginPath();
          mctx.moveTo(cx, cy);
          mctx.lineTo(cx + Math.cos(ang) * 150, cy + Math.sin(ang) * 150);
          mctx.strokeStyle = 'rgba(255, 215, 100, 0.25)';
          mctx.lineWidth = 1; mctx.stroke();
        }
        mctx.fillStyle = 'rgba(255, 215, 100, 0.6)';
        mctx.beginPath(); mctx.arc(cx, cy, 4, 0, Math.PI * 2); mctx.fill();
      }
      var mTraced = document.getElementById('mandala-traced');
      if (mTraced) mTraced.addEventListener('click', function () {
        promptSave(b, 'traced. one breath.', function () {
          saveToDesktopAndSatchel(b, { type: 'mandala', traced: true });
          body.innerHTML = '<div class="games-result">— mandala traced —</div>';
        }, function () { body.innerHTML = '<div class="games-result">— discarded —</div>'; });
      });
    } else if (b.id === 'cutup') {
      var seeds = ['the / window', 'silence / arrives', 'forget / the / name', 'sit / with / what', 'the / void / listens'];
      var seed = seeds[Math.floor(Math.random() * seeds.length)];
      body.innerHTML =
        '<div class="games-prompt">cut these words apart. rearrange them.</div>' +
        '<div class="games-cutup-source">' + seed + '</div>' +
        '<input type="text" class="games-input" id="cutup-result" maxlength="120" placeholder="your rearrangement" />' +
        '<div class="games-actions"><button type="button" class="games-action" id="cutup-save">save</button></div>';
      var cutupSave = document.getElementById('cutup-save');
      if (cutupSave) cutupSave.addEventListener('click', function () {
        var v = document.getElementById('cutup-result').value.trim() || '—';
        promptSave(b, 'cut from "' + seed + '" to "' + v + '".', function () {
          saveToDesktopAndSatchel(b, { type: 'cutup', source: seed, result: v });
          body.innerHTML = '<div class="games-result">— ' + v + ' —</div>';
        }, function () { body.innerHTML = '<div class="games-result">— discarded —</div>'; });
      });
    } else if (b.id === 'coloring') {
      body.innerHTML =
        '<div class="games-prompt">name a colour. breathe.</div>' +
        '<input type="text" class="games-input" id="color-name" maxlength="40" placeholder="the colour" />' +
        '<div class="games-actions"><button type="button" class="games-action" id="color-save">save</button></div>';
      var colSave = document.getElementById('color-save');
      if (colSave) colSave.addEventListener('click', function () {
        var v = document.getElementById('color-name').value.trim() || '—';
        promptSave(b, 'colour: ' + v + '.', function () {
          saveToDesktopAndSatchel(b, { type: 'coloring', colour: v });
          body.innerHTML = '<div class="games-result">— ' + v + ' —</div>';
        }, function () { body.innerHTML = '<div class="games-result">— discarded —</div>'; });
      });
    } else if (b.id === 'bodymap') {
      body.innerHTML =
        '<div class="games-prompt">where does the feeling live in the body.</div>' +
        '<textarea class="games-input" id="body-place" rows="3" maxlength="200" placeholder="where in the body"></textarea>' +
        '<input type="text" class="games-input" id="body-feel" maxlength="40" placeholder="what it feels like" />' +
        '<div class="games-actions"><button type="button" class="games-action" id="body-save">save</button></div>';
      var bodySave = document.getElementById('body-save');
      if (bodySave) bodySave.addEventListener('click', function () {
        var p = document.getElementById('body-place').value.trim() || '—';
        var f = document.getElementById('body-feel').value.trim() || '—';
        promptSave(b, p + ' feels like ' + f + '.', function () {
          saveToDesktopAndSatchel(b, { type: 'bodymap', place: p, feel: f });
          body.innerHTML = '<div class="games-result">— ' + p + ' · ' + f + ' —</div>';
        }, function () { body.innerHTML = '<div class="games-result">— discarded —</div>'; });
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    buildBooths();

    var exit = document.getElementById('games-exit');
    if (exit) exit.addEventListener('click', function () {
      if (history.length > 1) history.back(); else location.href = 'desktop.html';
    });

    var helpBtn = document.getElementById('games-help');
    var raison = document.getElementById('games-raison');
    var raisonClose = document.getElementById('games-raison-close');
    function openRaison() {
      if (raison) { raison.classList.add('open'); raison.setAttribute('aria-hidden', 'false'); }
    }
    function closeRaison() {
      if (raison) { raison.classList.remove('open'); raison.setAttribute('aria-hidden', 'true'); }
    }
    if (helpBtn) helpBtn.addEventListener('click', openRaison);
    if (raisonClose) raisonClose.addEventListener('click', closeRaison);
    if (raison) raison.addEventListener('click', function (e) { if (e.target === raison) closeRaison(); });

    var prompt = document.getElementById('games-save-prompt');
    var keepBtn = document.getElementById('games-save-prompt-keep');
    var discardBtn = document.getElementById('games-save-prompt-discard');
    var closeBtn = document.getElementById('games-save-prompt-close');
    if (keepBtn) keepBtn.addEventListener('click', function () {
      var p = pendingPayload;
      closePrompt();
      if (p && p.doSave) p.doSave();
    });
    if (discardBtn) discardBtn.addEventListener('click', function () {
      var p = pendingPayload;
      closePrompt();
      if (p && p.doDiscard) p.doDiscard();
    });
    if (closeBtn) closeBtn.addEventListener('click', closePrompt);
    if (prompt) prompt.addEventListener('click', function (e) { if (e.target === prompt) closePrompt(); });
  });
})();
