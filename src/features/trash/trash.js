// trash.js — Ravaging Pete. Soil layers, worms, rusted hook. No shared imports (covenant Q.1).

(function () {
  function buildWorms() {
    var el = document.getElementById('trash-worms');
    if (!el) return;
    for (var i = 0; i < 5; i++) {
      var w = document.createElement('div');
      w.className = 'trash-worm';
      w.style.top = (30 + i * 11) + '%';
      w.style.left = (Math.random() * 60) + '%';
      w.style.animationDelay = (Math.random() * 6) + 's';
      w.style.opacity = 0.4 + Math.random() * 0.4;
      el.appendChild(w);
    }
  }

  function hook() {
    var h = document.getElementById('trash-hook');
    if (!h) return;
    h.addEventListener('mousedown', function () { h.classList.add('dragging'); });
    h.addEventListener('mouseup', function () { h.classList.remove('dragging'); });
  }

  function st() { return window.Liber ? window.Liber.state : null; }

  function snapshotAll() {
    var s = st() ? st().get() : {};
    var stone = ((s.buddy || []).filter(function (e) { return e && e.kind === 'stone'; }));
    var sealed = ((s.buddy || []).filter(function (e) { return !e || e.kind !== 'stone'; }));
    return [
      { kind: 'sigils', entries: stone.slice() },
      { kind: 'buddy', entries: sealed.slice() },
      { kind: 'tour', entry: { visited: Object.assign({}, s.visited || {}) } },
    ];
  }

  function commitBury(groups) {
    if (!st()) return;
    var s = st().get();
    var graveyard = (s.graveyard || []).slice();
    var patch = {};
    var now = Date.now();
    for (var i = 0; i < groups.length; i++) {
      var g = groups[i];
      if (g.entries && g.entries.length === 0) continue;
      if (g.kind === 'sigils') {
        for (var j = 0; j < g.entries.length; j++) {
          graveyard.push({ kind: 'sigils', entry: g.entries[j], buriedAt: now });
        }
        patch.buddy = ((s.buddy || []).filter(function (e) { return !e || e.kind !== 'stone'; }));
      } else if (g.kind === 'buddy') {
        for (var k = 0; k < g.entries.length; k++) {
          graveyard.push({ kind: 'buddy', entry: g.entries[k], buriedAt: now });
        }
        patch.buddy = ((s.buddy || []).filter(function (e) { return e && e.kind === 'stone'; }));
      } else if (g.kind === 'tour') {
        graveyard.push({ kind: 'tour', entry: g.entry, buriedAt: now });
        patch.visited = {};
      }
    }
    patch.graveyard = graveyard;
    st().set(patch);
  }

  function labelFor(gy) {
    var e = gy.entry || {};
    if (gy.kind === 'sigils') return 'the cast buddy' + (e.name ? ' — ' + e.name : '');
    if (gy.kind === 'buddy') return 'one you carried' + (e.name ? ' — ' + e.name : '');
    if (gy.kind === 'tour') return 'the tour, remembered';
    if (gy.kind === 'relations') return 'a bound knot — ' + (e.verb || 'bound');
    var nm = e.name || e.title || e.topic || (typeof e.text === 'string' ? e.text : '');
    if (nm && nm.length > 42) nm = nm.substring(0, 39) + '...';
    return gy.kind + (nm ? ' — ' + nm : '');
  }

  // ── the plots — graves that weather and sprout (Stage 2e) ────────────
  // Weathering and sprouting are keyed to the patina tier shadow.js owns
  // (visits + artifacts), read straight off .machine so the yard can never
  // disagree with the rest of the machine by recomputing the math here.
  function patinaTier() {
    var m = document.querySelector('.machine');
    if (!m) return 0;
    for (var i = 3; i >= 1; i--) if (m.classList.contains('patina-' + i)) return i;
    return 0;
  }

  function ageBucket(ts) {
    if (!ts) return 0;
    var d = Date.now() - ts;
    if (d > 7 * 864e5) return 2;
    if (d > 864e5) return 1;
    return 0;
  }

  function agoLabel(ts) {
    if (!ts) return 'recently';
    var d = Date.now() - ts, day = 864e5;
    if (d < 36e5) return 'just now';
    if (d < day) return Math.max(1, Math.round(d / 36e5)) + 'h ago';
    if (d < 30 * day) return Math.max(1, Math.round(d / day)) + 'd ago';
    return Math.max(1, Math.round(d / (30 * day))) + 'mo ago';
  }

  function kindWord(kind) {
    if (kind === 'sigils') return 'a cast buddy';
    if (kind === 'buddy') return 'one you carried';
    if (kind === 'tour') return 'a whole tour';
    if (kind === 'relations') return 'a bound knot';
    return kind || 'something';
  }

  function cardDefault() {
    var card = document.getElementById('trash-grave-card');
    if (card) card.textContent = 'hover a plot — every grave reads.';
  }

  function readGrave(idx) {
    var card = document.getElementById('trash-grave-card');
    if (!card || !st()) return;
    var gy = (st().get().graveyard || [])[idx];
    if (!gy) { cardDefault(); return; }
    var name = document.createElement('b');
    name.className = 'trash-grave-name';
    name.textContent = labelFor(gy);
    var meta = document.createElement('span');
    meta.className = 'trash-grave-meta';
    meta.textContent = kindWord(gy.kind) + ' · buried ' + agoLabel(gy.buriedAt);
    card.innerHTML = '';
    card.appendChild(name);
    card.appendChild(meta);
  }

  function renderPlots() {
    var bed = document.getElementById('trash-plots');
    if (!bed || !st()) return;
    var graveyard = st().get().graveyard || [];
    bed.innerHTML = '';
    bed.setAttribute('data-patina', String(patinaTier()));
    if (!graveyard.length) {
      var empty = document.createElement('div');
      empty.className = 'trash-plots-empty';
      empty.textContent = 'no plots turned yet — bury something and it takes root.';
      bed.appendChild(empty);
      cardDefault();
      return;
    }
    for (var i = 0; i < graveyard.length; i++) {
      (function (idx) {
        var gy = graveyard[idx];
        var plot = document.createElement('button');
        plot.type = 'button';
        plot.className = 'trash-plot';
        plot.setAttribute('data-index', String(idx));
        plot.setAttribute('data-kind', gy.kind || 'other');
        plot.setAttribute('data-age', String(ageBucket(gy.buriedAt)));
        plot.setAttribute('aria-label', labelFor(gy) + ' — ' + kindWord(gy.kind) + ', buried ' + agoLabel(gy.buriedAt));
        var mark = document.createElement('i'); mark.className = 'trash-plot-mark'; mark.setAttribute('aria-hidden', 'true');
        var sprout = document.createElement('i'); sprout.className = 'trash-plot-sprout'; sprout.setAttribute('aria-hidden', 'true');
        var mound = document.createElement('i'); mound.className = 'trash-plot-mound'; mound.setAttribute('aria-hidden', 'true');
        plot.appendChild(mark);
        plot.appendChild(sprout);
        plot.appendChild(mound);
        plot.addEventListener('mouseenter', function () { readGrave(idx); });
        plot.addEventListener('focus', function () { readGrave(idx); });
        plot.addEventListener('mouseleave', cardDefault);
        plot.addEventListener('blur', cardDefault);
        // a grave is where its dig starts: the click goes to that row's reason.
        plot.addEventListener('click', function () { focusRow(idx); });
        bed.appendChild(plot);
      })(i);
    }
  }

  function focusRow(idx) {
    var row = document.querySelector('.trash-dig-row[data-index="' + idx + '"]');
    if (!row) return;
    var why = row.querySelector('.trash-why');
    if (why) { why.focus(); if (why.scrollIntoView) why.scrollIntoView({ block: 'nearest' }); }
    row.classList.add('trash-dig-row-active');
    setTimeout(function () { row.classList.remove('trash-dig-row-active'); }, 1200);
  }

  // The reason-marker: re-adding lifts the why out of the grave and lets it
  // settle as the satellite that becomes the relation edge. Purely visual —
  // the relation itself is bound synchronously, so nothing waits on motion.
  function markReasonFlight(idx, why) {
    var app = document.querySelector('.trash-app');
    var plot = document.querySelector('.trash-plot[data-index="' + idx + '"]');
    if (!app || !plot) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var pr = plot.getBoundingClientRect(), ar = app.getBoundingClientRect();
    var fly = document.createElement('i');
    fly.className = 'trash-reason-flight';
    fly.setAttribute('aria-hidden', 'true');
    fly.textContent = why.length > 30 ? why.slice(0, 29) + '…' : why;
    fly.style.left = Math.round(pr.left - ar.left + pr.width / 2) + 'px';
    fly.style.top = Math.round(pr.top - ar.top + pr.height / 2) + 'px';
    app.appendChild(fly);
    setTimeout(function () { if (fly.parentNode) fly.parentNode.removeChild(fly); }, 1500);
  }

  function readdToState(gy) {
    var s = st().get();
    if (gy.kind === 'sigils') {
      st().set({ buddy: (s.buddy || []).concat([Object.assign({}, gy.entry, { kind: 'stone' })]) });
    } else if (gy.kind === 'buddy') {
      st().set({ buddy: (s.buddy || []).concat([Object.assign({}, gy.entry, gy.entry && gy.entry.kind ? {} : { kind: 'sealed' })]) });
    } else if (gy.kind === 'tour') {
      var restored = gy.entry && gy.entry.visited ? gy.entry.visited : {};
      st().set({ visited: Object.assign({}, s.visited || {}, restored) });
    } else {
      var arr = Array.isArray(s[gy.kind]) ? s[gy.kind].slice() : [];
      arr.push(gy.entry);
      var patch = {};
      patch[gy.kind] = arr;
      st().set(patch);
    }
  }

  function renderDigList() {
    var list = document.getElementById('trash-dig-list');
    if (!list || !st()) return;
    var graveyard = st().get().graveyard || [];
    list.innerHTML = '';
    if (!graveyard.length) {
      var empty = document.createElement('div');
      empty.className = 'trash-dig-empty';
      empty.textContent = 'nothing buried. released things land here; say why to bring one back.';
      list.appendChild(empty);
      return;
    }
    for (var i = 0; i < graveyard.length; i++) {
      (function (idx) {
        var gy = graveyard[idx];
        var row = document.createElement('div');
        row.className = 'trash-dig-row';
        row.setAttribute('data-index', String(idx));
        var label = document.createElement('span');
        label.className = 'trash-dig-label';
        label.textContent = labelFor(gy);
        var why = document.createElement('input');
        why.type = 'text';
        why.className = 'trash-why';
        why.maxLength = 140;
        why.setAttribute('aria-label', 'why bring it back');
        why.placeholder = 'why bring it back?';
        why.spellcheck = false;
        why.autocomplete = 'off';
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'trash-action trash-readd-btn';
        btn.textContent = 're-add it';
        btn.addEventListener('click', function () {
          if (!st()) return;
          var reason = (why.value || '').trim();
          if (!reason) {
            why.focus();
            flash('say why first — the reason rides back with it.');
            return;
          }
          readdWithReason(idx, reason);
        });
        row.appendChild(label);
        row.appendChild(why);
        row.appendChild(btn);
        list.appendChild(row);
      })(i);
    }
  }

  // re-adding restores the artifact to orbit and binds its reason as a
  // satellite: a kept note orbiting the artifact as a new relation.
  function readdWithReason(idx, why) {
    if (!st()) return;
    var cur = st().get().graveyard || [];
    if (idx >= cur.length) return;
    var gy = cur[idx];
    markReasonFlight(idx, why);
    readdToState(gy);
    st().set({ graveyard: cur.filter(function (_, n) { return n !== idx; }) });
    if (gy.kind !== 'tour' && gy.entry && gy.entry.id) {
      var sid = 'sat-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
      var short = why.length > 60 ? why.substring(0, 60) + '...' : why;
      if (st().addArtifact) {
        st().addArtifact('journal', { id: sid, kind: 'kept-reason', name: short, text: why, ts: Date.now() });
      }
      if (st().bindRelation) {
        try { st().bindRelation(sid, short, gy.entry.id); } catch (e) {}
      }
    }
    flash('it returns — with its reason riding alongside.');
    renderDigList();
    if (window.Liber && window.Liber.sound) { try { window.Liber.sound.play('chime'); } catch (e) {} }
  }

  // bury-everything rides a visible interlock: lift once to arm, lift
  // again to open the soil. it times out back to safe. per-item whys
  // are never bypassed — each buried thing still needs its own reason
  // to return (renderDigList enforces one why per row).
  // Confirmations slow: while it rains, the interlock waits longer before
  // it takes your silence as an answer. src/rainy.js owns the multiplier;
  // the room just asks. The helper is absent on non-desktop pages.
  function paceMs(base) {
    if (window.Liber && window.Liber.rainy && window.Liber.rainy.slowConfirmMs) {
      return window.Liber.rainy.slowConfirmMs(base);
    }
    return base;
  }

  var buryArmed = false, buryTimer = null;
  function disarmBury() {
    buryArmed = false;
    if (buryTimer) { clearTimeout(buryTimer); buryTimer = null; }
    var b = document.getElementById('trash-bury-all');
    if (b) { b.classList.remove('armed'); b.textContent = 'bury everything'; b.setAttribute('aria-pressed', 'false'); }
  }
  function armBury() {
    buryArmed = true;
    var b = document.getElementById('trash-bury-all');
    if (b) { b.classList.add('armed'); b.textContent = 'bury everything — again to bury'; b.setAttribute('aria-pressed', 'true'); }
    if (buryTimer) clearTimeout(buryTimer);
    buryTimer = setTimeout(disarmBury, paceMs(6000));
  }
  function openBuryPrompt() {
    var prompt = document.getElementById('trash-save-prompt');
    var body = document.getElementById('trash-save-prompt-body');
    if (prompt && body) {
      pendingBury = { kind: 'all' };
        var n = 0;
        try {
          var s = st() ? st().get() : {};
          n = ((s.buddy || []).length) + Object.keys(s.visited || {}).length;
        } catch (e) { n = 0; }
        body.innerHTML = 'bury <em>everything</em> — ' + n + ' kept to the soil. each returns only with its own reason.';
      prompt.classList.add('open');
      prompt.removeAttribute('inert');
    } else {
      commitFor('all');
    }
  }

  function commitFor(kind) {
    if (!st()) return;
    if (kind === 'all') {
      disarmBury();
      commitBury(snapshotAll());
      flash('the room is clean. the soil is full.');
    }
    renderDigList();
  }

  var pendingBury = null;

  function closePrompt() {
    var prompt = document.getElementById('trash-save-prompt');
    if (!prompt) return;
    prompt.classList.remove('open');
    prompt.setAttribute('inert', '');
    pendingBury = null;
  }

  function flash(msg) {
    var w = document.querySelector('.trash-warning');
    if (!w) return;
    var old = w.textContent;
    w.textContent = msg;
    w.style.color = '#f0c890';
    setTimeout(function () {
      w.textContent = old;
      w.style.color = '';
    }, 2500);
  }

  document.addEventListener('DOMContentLoaded', function () {
    buildWorms();
    hook();

    var exit = document.getElementById('trash-exit');
    if (exit) exit.addEventListener('click', function () {
      if (history.length > 1) history.back(); else location.href = 'desktop.html';
    });

    var b4 = document.getElementById('trash-bury-all');
    if (b4) {
      b4.setAttribute('aria-pressed', 'false');
      b4.addEventListener('click', function () {
        if (!buryArmed) { armBury(); return; }
        disarmBury();
        openBuryPrompt();
      });
    }

    var prompt = document.getElementById('trash-save-prompt');
    var buryBtn = document.getElementById('trash-save-prompt-keep');
    var cancelBtn = document.getElementById('trash-save-prompt-discard');
    var closeBtn = document.getElementById('trash-save-prompt-close');
    if (buryBtn) buryBtn.addEventListener('click', function () {
      var p = pendingBury;
      closePrompt();
      if (!p) return;
      commitFor(p.kind);
      if (window.Liber && window.Liber.sound) window.Liber.sound.play('thunk');
    });
    if (cancelBtn) cancelBtn.addEventListener('click', closePrompt);
    if (closeBtn) closeBtn.addEventListener('click', closePrompt);
    if (prompt) {
      prompt.addEventListener('click', function (e) { if (e.target === prompt) closePrompt(); });
      prompt.setAttribute('inert', '');
    }

    cardDefault();
    renderDigList();
    renderPlots();
    if (st()) st().on('change', renderDigList);
    if (st()) st().on('change', renderPlots);

    var helpBtn = document.getElementById('trash-help');
    var raison = document.getElementById('trash-raison');
    var raisonClose = document.getElementById('trash-raison-close');
    function openRaison() {
      if (raison) { raison.classList.add('open'); raison.removeAttribute('inert'); }
    }
    function closeRaison() {
      if (raison) { raison.classList.remove('open'); raison.setAttribute('inert', ''); }
    }
    if (helpBtn) helpBtn.addEventListener('click', openRaison);
    if (raisonClose) raisonClose.addEventListener('click', closeRaison);
    if (raison) raison.addEventListener('click', function (e) { if (e.target === raison) closeRaison(); });
    if (window.LiberRoomShell) window.LiberRoomShell.bindRoomOverlays({ overlays: [
      { id: 'trash-raison', close: closeRaison },
      { id: 'trash-save-prompt', close: closePrompt }
    ] });
  });
})();
