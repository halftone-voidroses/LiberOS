// wanderlust.js — the one-time bespoke tutorial
// 1. The user clicks the flaming ?. We play the summoning poem line by
//    line ("wanderlust is being summoned, please wait…" through
//    "…Come to the void and sing again.."). On the line
//    "…To find the pieces of ourselves.." we shake the monitor.
// 2. Then the dialogue window opens. Wanderlust speaks, Raison interrupts,
//    the user picks. Reply buttons have two kinds: 'progress' (bright
//    outlined) and 'branch' (italic muted "ok." style). Some lines carry
//    effects (shake, flicker:<colours>) that fire when the line is shown.
// 3. At the last script step the user gets the three-option final fork.
//    Each fork resolves into one extra line that returns control to the
//    "I arise the same but different" overlay + finish.
//
// Restart: clicking the small post-tutorial ? asks "erase all progress?"
// before running the whole sequence again.

(function () {
  var win = null, line = null, replies = null, name = null, avatar = null, progress = null;
  var script = window.WANDERLUST_SCRIPT || [];
  var finalForks = window.WANDERLUST_FINAL_FORKS || [];
  var summonLines = window.WANDERLUST_SUMMON || [];
  var step = 0;
  var isOpen = false;
  var isSummoning = false;
  // When >= 0, the next render after step >= script.length resolves the
  // final-fork overlay for that index, then advances to close.
  var pendingForkIdx = -1;

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

  function setSpeaker(speaker) {
    if (!avatar) return;
    if (speaker === 'wanderlust') {
      avatar.style.background = 'radial-gradient(circle, #ffd86a 0% 30%, #ff69b4 30% 60%, #aa3a6a 100%)';
      avatar.style.boxShadow = '0 0 18px rgba(255, 105, 180, 0.6)';
      if (name) { name.textContent = 'wanderlust'; name.style.color = '#ff8a8a'; }
    } else {
      avatar.style.background = 'radial-gradient(circle, #cce0ff 0% 30%, #5a8aaa 30% 60%, #2a4a6a 100%)';
      avatar.style.boxShadow = '0 0 18px rgba(90, 138, 170, 0.6)';
      if (name) { name.textContent = 'raison'; name.style.color = '#8acaff'; }
    }
  }

  function normaliseReply(r) {
    if (typeof r === 'string') {
      var kind = 'progress';
      if (r.slice(-2) === '/x') { kind = 'branch'; r = r.slice(0, -2).trim(); }
      return { text: r, kind: kind };
    }
    return { text: String(r.text || ''), kind: r.kind === 'branch' ? 'branch' : 'progress' };
  }

  // Routes a reply click to: next script step, final-fork overlay, or close.
  function advance(reply) {
    if (reply.kind !== 'branch') {
      var t = (reply.text || '').toLowerCase().replace(/[.!?…]+$/, '').trim();
      if (t === 'i do')         { pendingForkIdx = 0; step = script.length; render(); return; }
      if (t === 'tell me')      { pendingForkIdx = 1; step = script.length; render(); return; }
      if (t === 'wanderlust')   { pendingForkIdx = 2; step = script.length; render(); return; }
    }
    step++;
    render();
  }

  function makeReplyButton(reply, onClick) {
    var btn = document.createElement('button');
    btn.className = 'wanderlust-reply kind-' + reply.kind;
    btn.type = 'button';
    btn.textContent = reply.kind === 'branch' ? '· ' + reply.text + ' ·' : '> ' + reply.text;
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

  function setProgress(activeIdx) {
    if (!progress) return;
    var totalDots = script.length + 1; // include fork dot
    var dots = '';
    for (var d = 0; d < totalDots; d++) dots += (d === activeIdx ? '◆' : '◇') + ' ';
    progress.textContent = dots;
  }

  function renderScriptStep() {
    if (step >= script.length) { renderForkOrFinish(); return; }
    var entry = script[step];
    setSpeaker(entry.speaker);
    runEffect(entry.effect);
    showLine(entry.line);
    setProgress(step);

    clearReplies();
    if (!replies) return;
    var entryReplies = entry.replies.map(normaliseReply);
    entryReplies.forEach(function (reply) {
      replies.appendChild(makeReplyButton(reply, function (r) {
        showEcho(r.text);
        setTimeout(function () { advance(r); }, 600);
      }));
    });
  }

  function renderForkOrFinish() {
    if (pendingForkIdx < 0 || pendingForkIdx >= finalForks.length) {
      finishScript();
      return;
    }
    var fork = finalForks[pendingForkIdx];
    setSpeaker('wanderlust');
    showLine(fork.line);
    setProgress(script.length);

    clearReplies();
    if (!replies) return;
    fork.replies.map(normaliseReply).forEach(function (reply) {
      replies.appendChild(makeReplyButton(reply, function () {
        showEcho(reply.text);
        setTimeout(function () { finishScript(); }, 600);
      }));
    });
  }

  function render() {
    if (step >= script.length) { renderForkOrFinish(); return; }
    renderScriptStep();
  }

  // ─── summoning poem ───────────────────────────────────────────────────
  function showSummonLine(text, cb) {
    var overlay = el('summon-overlay');
    var textEl = el('summon-text');
    if (!overlay || !textEl) { cb && cb(); return; }
    textEl.textContent = text;
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('show');
    // The "pieces of ourselves" line shakes the monitor as it shows.
    if (text.indexOf('pieces of ourselves') !== -1) triggerShake(420);
    setTimeout(function () {
      overlay.classList.remove('show');
      setTimeout(function () {
        overlay.setAttribute('aria-hidden', 'true');
        cb && cb();
      }, 350);
    }, 900);
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
      showSummonLine(summonLines[i++], null);
      setTimeout(next, 1300);
    }
    next();
  }

  // ─── lifecycle ───────────────────────────────────────────────────────
  function open() {
    if (!win) bind();
    if (!win) return;
    step = 0;
    pendingForkIdx = -1;
    isOpen = true;
    runSummon(function () {
      win.setAttribute('aria-hidden', 'false');
      win.classList.add('open');
      render();
    });
  }

  function close() {
    if (!win) return;
    win.classList.remove('open');
    win.setAttribute('aria-hidden', 'true');
    isOpen = false;
  }

  function finishScript() {
    if (window.Liber && window.Liber.state) {
      window.Liber.state.set({ tutorialDone: true });
    }
    close();
    showArise();
  }

  function showArise() {
    var overlay = document.getElementById('arise-overlay');
    if (!overlay) return;
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('show');
    setTimeout(function () {
      overlay.classList.remove('show');
      setTimeout(function () { overlay.setAttribute('aria-hidden', 'true'); }, 1200);
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