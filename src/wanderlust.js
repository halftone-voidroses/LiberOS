// wanderlust.js — the one-time bespoke tutorial
// 1. The user clicks the flaming ?. We play the summoning poem line by
//    line ("wanderlust is being summoned, please wait…" through
//    "…Come to the void and sing again.."). On the line
//    "…To find the pieces of ourselves.." we shake the monitor.
// 2. Then the dialogue window opens. Wanderlust speaks, Raison interrupts,
//    the user picks. Reply buttons have two kinds: 'progress' (bright
//    outlined) and 'branch' (italic muted "ok." style). Some lines carry
//    effects (shake, flicker:<colours>) that fire when the line is shown.
//    WS2: a reply may carry a response beat — the character answers YOUR
//    specific pick (own speaker/effect), then a single continue button
//    resumes the main path. One beat only; no nested branching.
//    Speaker changes into or out of Raison fire a brief cyan static-glitch
//    on the window plus a short pacing hold before the new line reads.
// 3. At the last script step the user picks one of the three closers
//    ('I do' / 'tell me' / 'wanderlust…') and the tutorial goes straight
//    to the "I arise the same but different" overlay + finish.
//
// Restart: clicking the small post-tutorial ? asks "erase all progress?"
// before running the whole sequence again.

(function () {
  var win = null, line = null, replies = null, name = null, avatar = null, progress = null;
  var script = window.WANDERLUST_SCRIPT || [];
  var summonLines = window.WANDERLUST_SUMMON || [];
  var step = 0;
  var isOpen = false;
  var isSummoning = false;
  var currentSpeaker = null;
  var raisonSeen = false; // per-run: the intrusion transition fires once

  function el(id) { return document.getElementById(id); }

  function bind() {
    win = el('wanderlust-window');
    line = el('wanderlust-line');
    replies = el('wanderlust-replies');
    name = el('wanderlust-name');
    avatar = el('wanderlust-avatar');
    progress = el('wanderlust-progress');
  }

  function machineEl() {
    return document.querySelector('.machine') || document.getElementById('machine');
  }

  function triggerShake(ms) {
    var m = machineEl();
    if (!m) return;
    m.classList.remove('machine-shake');
    // force reflow so the animation can replay
    void m.offsetWidth;
    m.classList.add('machine-shake');
    setTimeout(function () { m.classList.remove('machine-shake'); }, ms || 380);
  }

  function triggerFlicker(colours) {
    if (!avatar || !colours || !colours.length) return;
    var orig = {
      bg: avatar.style.background,
      shadow: avatar.style.boxShadow,
      nameColor: name && name.style.color
    };
    var i = 0;
    function tick() {
      if (i >= colours.length) {
        avatar.style.background = orig.bg;
        avatar.style.boxShadow = orig.shadow;
        if (name) name.style.color = orig.nameColor;
        return;
      }
      var c = colours[i++];
      avatar.style.background = 'radial-gradient(circle, ' + c + ' 0% 30%, ' + c + ' 30% 60%, #1a0a14 100%)';
      avatar.style.boxShadow = '0 0 22px ' + c;
      setTimeout(tick, 220);
    }
    tick();
  }

  function runEffect(effect) {
    if (!effect) return;
    if (effect === 'shake') { triggerShake(380); return; }
    if (effect.indexOf('flicker:') === 0) {
      triggerFlicker(effect.slice(8).split(','));
      return;
    }
  }

  // Cyan static-glitch in Raison's register — fires on the window when the
  // speaker changes into or out of him. CSS carries the look and the
  // prefers-reduced-motion gate; this only arms it.
  function triggerRaisonGlitch() {
    if (!win) return;
    win.classList.remove('raison-glitch');
    void win.offsetWidth;
    win.classList.add('raison-glitch');
    setTimeout(function () { win.classList.remove('raison-glitch'); }, 1700);
  }

  // The intrusion: the first time he arrives in a run, the machine flares
  // intruder-alarm red and holds the door 2-3s before his line reads. When
  // he leaves, the same overlay blinks once — he disappears in a flash.
  function raisonOverlay() { return el('raison-overlay'); }

  function showRaisonIntro() {
    var overlay = raisonOverlay();
    if (!overlay) return 0;
    overlay.classList.remove('flash');
    overlay.removeAttribute('inert');
    overlay.classList.add('show');
    return 2400;
  }

  function hideRaisonIntro() {
    var overlay = raisonOverlay();
    if (!overlay) return;
    overlay.classList.remove('show');
    overlay.setAttribute('inert', '');
  }

  function raisonFlashOut() {
    var overlay = raisonOverlay();
    if (!overlay) return;
    overlay.classList.remove('show');
    overlay.setAttribute('inert', '');
    overlay.classList.add('flash');
    setTimeout(function () { overlay.classList.remove('flash'); }, 500);
  }

  // Returns true when the speaker change crossed Raison (into or out of).
  function setSpeaker(speaker) {
    var leftRaison = currentSpeaker === 'raison' && speaker !== 'raison';
    var crossedRaison = currentSpeaker !== null && speaker !== currentSpeaker &&
      (speaker === 'raison' || currentSpeaker === 'raison');
    currentSpeaker = speaker;
    if (leftRaison) raisonFlashOut();
    if (crossedRaison) triggerRaisonGlitch();
    if (!avatar) return crossedRaison;
    if (speaker === 'wanderlust') {
      avatar.style.background = 'radial-gradient(circle, #ffd86a 0% 30%, #ff69b4 30% 60%, #aa3a6a 100%)';
      avatar.style.boxShadow = '0 0 18px rgba(255, 105, 180, 0.6)';
      if (name) { name.textContent = 'wanderlust'; name.style.color = '#ff8a8a'; }
    } else {
      avatar.style.background = 'radial-gradient(circle, #cce0ff 0% 30%, #5a8aaa 30% 60%, #2a4a6a 100%)';
      avatar.style.boxShadow = '0 0 18px rgba(90, 138, 170, 0.6)';
      if (name) { name.textContent = 'riason'; name.style.color = '#8acaff'; }
    }
    return crossedRaison;
  }

  function normaliseReply(r) {
    if (typeof r === 'string') {
      var kind = 'progress';
      if (r.slice(-2) === '/x') { kind = 'branch'; r = r.slice(0, -2).trim(); }
      return { text: r, kind: kind };
    }
    return {
      text: String(r.text || ''),
      kind: r.kind === 'branch' ? 'branch' : 'progress',
      response: r.response || null
    };
  }

  // The three closers ('I do' / 'tell me' / 'wanderlust…') end the
  // tutorial directly — no fork line, no response beat.
  function isClosingPick(reply) {
    if (reply.kind === 'branch') return false;
    var t = (reply.text || '').toLowerCase().replace(/[.!?…]+$/, '').trim();
    return t === 'i do' || t === 'tell me' || t === 'wanderlust';
  }

  // Routes a reply click to the next script step.
  function advance(reply) {
    step++;
    render();
  }

  function makeReplyButton(reply, onClick) {
    var btn = document.createElement('button');
    btn.className = 'wanderlust-reply kind-' + reply.kind;
    btn.type = 'button';
    if (reply.kind === 'continue') btn.textContent = '· … ·';
    else btn.textContent = '> ' + reply.text;
    btn.addEventListener('click', function () { onClick(reply); });
    return btn;
  }

  function clearReplies() { if (replies) replies.innerHTML = ''; }

  function showLine(text) {
    if (!line) return;
    line.style.opacity = 0;
    setTimeout(function () {
      if (line) { line.textContent = text; line.style.opacity = 1; }
    }, 150);
  }

  function showEcho(text) {
    if (!line) return;
    line.style.opacity = 0;
    setTimeout(function () {
      if (line) { line.textContent = '> ' + text; line.style.opacity = 0.5; }
    }, 150);
  }

  // WS2: the picked reply gets ONE beat where the character answers it in
  // their own voice, then `done` resumes the main path (or the fork/finish).
  // Progress dots stay put for the beat; the continue button keeps pacing
  // click-driven. A beat may carry `lines` (array) — the answer reads in
  // installments, '· … ·' between, the last continue resumes the path.
  function renderResponseBeat(response, done) {
    var lines = response.lines || (response.line ? [response.line] : []);
    if (!lines.length) { done(); return; }
    var crossed = setSpeaker(response.speaker);
    runEffect(response.effect);
    var i = 0;
    var paint = function () {
      showLine(lines[i]);
      clearReplies();
      i++;
      if (!replies) return;
      if (i < lines.length) {
        replies.appendChild(makeReplyButton({ text: '', kind: 'continue' }, paint));
      } else {
        replies.appendChild(makeReplyButton({ text: '', kind: 'continue' }, done));
      }
    };
    if (crossed) setTimeout(paint, 950);
    else paint();
  }

  function setProgress(activeIdx) {
    if (!progress) return;
    var totalDots = script.length;
    var dots = '';
    for (var d = 0; d < totalDots; d++) dots += (d === activeIdx ? '◆' : '◇') + ' ';
    progress.textContent = dots;
  }

  function renderScriptStep() {
    var entry = script[step];
    var firstRaison = entry.speaker === 'raison' && !raisonSeen;
    if (firstRaison) raisonSeen = true;
    var crossedRaison = setSpeaker(entry.speaker);
    runEffect(entry.effect);
    setProgress(step);

    // The intrusion hold: the flare owns the screen before he speaks.
    var hold = crossedRaison ? 950 : 0;
    if (firstRaison) hold = Math.max(hold, showRaisonIntro());

    // A step may carry `lines` (array) — long speeches read in installments
    // with a '· … ·' transition between, replies held until the last lands.
    var lines = entry.lines || [entry.line];
    var lineIdx = 0;

    clearReplies();
    var showReplies = function () {
      if (!replies) return;
      var entryReplies = entry.replies.map(normaliseReply);
      entryReplies.forEach(function (reply) {
        replies.appendChild(makeReplyButton(reply, function (r) {
          showEcho(r.text);
          setTimeout(function () {
            if (isClosingPick(r)) { finishScript(); return; }
            renderResponseBeat(r.response, function () { advance(r); });
          }, 600);
        }));
      });
    };
    var paint = function () {
      hideRaisonIntro();
      showLine(lines[lineIdx]);
      clearReplies();
      lineIdx++;
      if (!replies) return;
      if (lineIdx < lines.length) {
        replies.appendChild(makeReplyButton({ text: '', kind: 'continue' }, paint));
      } else {
        showReplies();
      }
    };
    // Pacing hold: the drawn-out glitch breathes before the new line reads.
    if (hold) setTimeout(paint, hold);
    else paint();
  }

  function render() {
    if (step >= script.length) { finishScript(); return; }
    renderScriptStep();
  }

  // ─── summoning poem ───────────────────────────────────────────────────
  function showSummonLine(text, cb) {
    var overlay = el('summon-overlay');
    var textEl = el('summon-text');
    if (!overlay || !textEl) { cb && cb(); return; }
    textEl.textContent = text;
    overlay.removeAttribute('inert');
    overlay.classList.add('show');
    // The "pieces of ourselves" line shakes the monitor as it shows.
    if (text.indexOf('pieces of ourselves') !== -1) triggerShake(420);
    setTimeout(function () {
      overlay.classList.remove('show');
      setTimeout(function () {
        overlay.setAttribute('inert', '');
        cb && cb();
      }, 500);
    }, 2500); // plan 2026-09-06 §2.1: summoning lines read, not flash
  }

  function runSummon(cb) {
    if (!summonLines.length) { cb && cb(); return; }
    isSummoning = true;
    var i = 0;
    function next() {
      if (i >= summonLines.length) {
        isSummoning = false;
        cb && cb();
        return;
      }
      // Audit minor 9: each line chains the next through its own completion
      // (show + fade) instead of a fixed 1300ms coupling.
      showSummonLine(summonLines[i++], next);
    }
    next();
  }

  // ─── lifecycle ───────────────────────────────────────────────────────
  function open() {
    if (!win) bind();
    if (!win) return;
    step = 0;
    currentSpeaker = null;
    raisonSeen = false;
    isOpen = true;
    runSummon(function () {
      win.removeAttribute('inert');
      win.classList.add('open');
      render();
    });
  }

  function close() {
    if (!win) return;
    win.classList.remove('open');
    win.setAttribute('inert', '');
    isOpen = false;
  }

  function finishScript() {
    clearReplies();
    if (window.Liber && window.Liber.state) {
      window.Liber.state.set({ tutorialDone: true });
    }
    close();
    showArise();
  }

  function showArise() {
    var overlay = document.getElementById('arise-overlay');
    if (!overlay) return;
    overlay.removeAttribute('inert');
    overlay.classList.add('show');
    setTimeout(function () {
      overlay.classList.remove('show');
      setTimeout(function () { overlay.setAttribute('inert', ''); }, 1200);
    }, 3000);
  }

  window.Wanderlust = {
    open: open,
    close: close,
    restart: open,
    triggerShake: triggerShake,
    triggerFlicker: triggerFlicker
  };
})();