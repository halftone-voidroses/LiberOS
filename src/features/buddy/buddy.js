// buddy.js — the LiberChat client. An IRC-style room: the user list on
// the left, the conversation on the right. Chat users are data: register
// more through window.LiberChat.registerUser (Vanir arrives this way).
// Sealing still writes the classic sealed buddy artifact, so the
// constellation, satchel and twelve works read it exactly as before.
// No shared imports (covenant Q.1).

(function () {
  'use strict';

  var usersEl = document.getElementById('chat-users');
  var logEl = document.getElementById('chat-log');
  var input = document.getElementById('chat-input');
  var sendBtn = document.getElementById('chat-send');
  var sealBtn = document.getElementById('chat-seal');
  var topicEl = document.getElementById('chat-topic');

  var users = {};      // id -> { def, bot, log: [{who, text}], greeted, turns, sealFrom, exchanges }
  var order = [];      // registration order = list order
  var currentId = null;

  function st() { return (window.Liber && window.Liber.state) || null; }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function stamp() {
    var d = new Date();
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function chatState() {
    var s = st();
    if (!s) return {};
    var g = s.get() || {};
    return g.chat || {};
  }

  function predsFor(id) {
    var c = chatState();
    return ((c.pred || {})[id]) || {};
  }

  function savePredsFor(id, preds) {
    var s = st();
    if (!s) return;
    var g = s.get() || {};
    var chat = Object.assign({}, g.chat);
    chat.pred = Object.assign({}, chat.pred);
    chat.pred[id] = preds;
    s.set({ chat: chat });
  }

  function registerUser(def) {
    if (!def || !def.id || users[def.id]) return users[def.id] || null;
    if (!window.Liber || !window.Liber.aiml || !def.aiml) return null;
    var id = def.id;
    var bot = window.Liber.aiml.create({
      categories: def.aiml.categories,
      fallback: def.aiml.fallback,
      greetings: def.aiml.greetings,
      askName: def.aiml.askName,
      defaults: def.aiml.defaults,
      meta: { name: def.name },
      preds: predsFor(id),
      savePreds: function (p) { savePredsFor(id, p); }
    });
    users[id] = {
      def: def, bot: bot, log: [], greeted: false,
      turns: [], exchanges: 0, sealFrom: 0
    };
    order.push(id);
    renderUsers();
    return users[id];
  }

  function active() { return (currentId && users[currentId]) || null; }

  function appendLine(who, text, sys) {
    var u = active();
    if (!u) return;
    u.log.push({ who: who, text: text, sys: !!sys, at: stamp() });
    if (!logEl) return;
    var line = document.createElement('div');
    line.className = 'chat-line' + (sys ? ' sys' : '');
    if (!sys) {
      var name = who === 'you' ? 'you' : u.def.name;
      var color = who === 'you' ? '#e8c890' : (u.def.color || '#c8bcb0');
      line.innerHTML = '<span class="who" style="--who:' + esc(color) + ';--who-glow:' + esc(color) + '55">' + esc(name) + '</span>'
        + '<span class="when">' + stamp() + '</span>'
        + '<div class="what">' + esc(text) + '</div>';
    } else {
      line.innerHTML = '<div class="what">' + esc(text) + '</div>';
    }
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function appendNote(text) {
    var u = active();
    if (!u || !logEl) return;
    u.log.push({ who: 'sys', text: text, sys: true, at: stamp() });
    var line = document.createElement('div');
    line.className = 'chat-note';
    line.textContent = text;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function paintLog() {
    if (!logEl) return;
    var u = active();
    logEl.innerHTML = '';
    if (!u) return;
    if (topicEl) topicEl.textContent = u.def.topic || ('LiberChat — ' + u.def.name + ' is listening.');
    for (var i = 0; i < u.log.length; i++) {
      (function (entry) {
        var line = document.createElement('div');
        if (entry.sys) {
          line.className = 'chat-note';
          line.textContent = entry.text;
        } else {
          line.className = 'chat-line';
          var name = entry.who === 'you' ? 'you' : u.def.name;
          var color = entry.who === 'you' ? '#e8c890' : (u.def.color || '#c8bcb0');
          line.innerHTML = '<span class="who" style="--who:' + esc(color) + ';--who-glow:' + esc(color) + '55">' + esc(name) + '</span>'
            + '<span class="when">' + esc(entry.at || '') + '</span>'
            + '<div class="what">' + esc(entry.text) + '</div>';
        }
        logEl.appendChild(line);
      })(u.log[i]);
    }
    logEl.scrollTop = logEl.scrollHeight;
  }

  function unreadOf(id) {
    var c = chatState();
    return ((c.unread || {})[id]) || 0;
  }

  function clearUnread(id) {
    var s = st();
    if (!s) return;
    var g = s.get() || {};
    var chat = Object.assign({}, g.chat);
    if (!chat.unread || !chat.unread[id]) return;
    chat.unread = Object.assign({}, chat.unread);
    chat.unread[id] = 0;
    s.set({ chat: chat });
    renderUsers();
  }

  function renderUsers() {
    if (!usersEl) return;
    usersEl.innerHTML = '<div class="chat-users-head">who is here</div>';
    order.forEach(function (id) {
      var u = users[id];
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chat-user' + (id === currentId ? ' current' : '');
      var n = unreadOf(id);
      b.innerHTML = '<span class="dot" style="--who:' + esc(u.def.color || '#888') + '"></span>'
        + '<span>' + esc(u.def.name) + '</span>'
        + (n > 0 ? '<span class="unread">' + Math.min(n, 9) + '</span>' : '');
      b.addEventListener('click', function () { switchTo(id); });
      usersEl.appendChild(b);
    });
    if (typeof renderLocked === 'function') renderLocked();
  }

  // filled in by later phases (locked ??? teasers)
  var renderLocked = null;

  function switchTo(id) {
    if (!users[id] || id === currentId) { paintLog(); return; }
    currentId = id;
    var u = users[id];
    if (!u.greeted) {
      u.greeted = true;
      appendLine(id, u.bot.greet());
    }
    clearUnread(id);
    renderUsers();
    paintLog();
    if (sealBtn) sealBtn.disabled = u.exchanges < 2;
  }

  function send() {
    var u = active();
    if (!u || !input) return;
    var uid = currentId;
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    appendLine('you', text);
    var reply = '';
    try { reply = u.bot.respond(text); } catch (e) { reply = '…'; }
    // typing shimmer: they're composing. The pause derives from the turn
    // count, never a dice roll — no Math.random in perceived behavior.
    var shimmer = showShimmer(uid);
    var wait = 700 + ((u.turns.length * 137 + text.length * 31) % 500);
    setTimeout(function () {
      hideShimmer(shimmer);
      // delivered late: still the same exchange, appended where it belongs
      u.turns.push({ who: 'you', text: text });
      u.turns.push({ who: uid, text: reply });
      u.exchanges++;
      if (currentId === uid) {
        appendLine(uid, reply);
        if (sealBtn) sealBtn.disabled = u.exchanges < 2;
      }
      if (window.Liber && window.Liber.soundscape) {
        try { window.Liber.soundscape.motif(uid === 'vanir' ? 'vanir' : 'elizabeth'); } catch (e) {}
      }
      try { if (input) input.focus(); } catch (e) {}
    }, wait);
  }

  // export: the whole transcript, sealed as one artifact — what was said
  // here, verbatim, for the satchel to keep.
  function exportTranscript() {
    var u = active();
    if (!u || !u.turns.length) return;
    var lines = [];
    for (var i = 0; i < u.turns.length; i++) {
      var t = u.turns[i];
      lines.push((t.who === 'you' ? 'you' : u.def.name) + ': ' + t.text);
    }
    var confession = lines.join(' / ');
    if (confession.length > 1200) confession = confession.substring(0, 1200) + '...';
    var first = '';
    for (var k = 0; k < u.turns.length; k++) {
      if (u.turns[k].who === 'you') { first = u.turns[k].text; break; }
    }
    var name = first || ('with ' + u.def.name);
    if (name.length > 30) name = name.substring(0, 30) + '...';
    if (window.Liber && window.Liber.state && window.Liber.state.addArtifact) {
      window.Liber.state.addArtifact('buddy', { kind: 'sealed', name: name, confession: confession, exported: true });
    }
    if (window.Liber && window.Liber.sound) { try { window.Liber.sound.play('chime'); } catch (e) {} }
    appendNote('— transcript exported —');
  }

  function showShimmer(uid) {
    if (!logEl) return null;
    var u = users[uid];
    var line = document.createElement('div');
    line.className = 'chat-shimmer';
    line.textContent = (u ? u.def.name : 'them') + ' is composing…';
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
    return line;
  }

  function hideShimmer(line) {
    if (line && line.parentNode) line.parentNode.removeChild(line);
  }

  // the sealed artifact keeps the old buddy shape — name + confession —
  // so the constellation, the satchel and the twelve works read it
  // exactly as they read the older entries.
  function seal() {
    var u = active();
    if (!u || u.exchanges < 2) return;
    var span = u.turns.slice(u.sealFrom);
    var spoken = span.filter(function (t) { return t.who === 'you'; });
    if (spoken.length === 0) return;

    var name = spoken[0].text;
    if (name.length > 30) name = name.substring(0, 30) + '...';

    var lines = [];
    for (var i = 0; i < span.length; i++) {
      lines.push((span[i].who === 'you' ? 'you' : u.def.name) + ': ' + span[i].text);
    }
    var confession = lines.join(' / ');
    if (confession.length > 600) confession = confession.substring(0, 600) + '...';

    if (window.Liber && window.Liber.state && window.Liber.state.addArtifact) {
      window.Liber.state.addArtifact('buddy', { kind: 'sealed', name: name, confession: confession });
    }
    if (window.Liber && window.Liber.sound) { try { window.Liber.sound.play('chime'); } catch (e) {} }

    appendNote('— sealed in wax —');
    u.exchanges = 0;
    u.sealFrom = u.turns.length;
    if (sealBtn) sealBtn.disabled = true;
  }

  // ── unlocks, teasers, inbox ───────────────────────────────────────
  // Vanir joins once the room holds enough kept work; further ??? slots
  // tease future users (data-only additions later via registerUser).

  var UNLOCK_AT = 3;
  var TEASERS = 2;

  function artifactCount() {
    var s = (st() && st().get()) || {};
    var kinds = ['buddy', 'divination', 'games', 'sea', 'learn', 'garden', 'dreams', 'satchel'];
    var n = 0;
    for (var i = 0; i < kinds.length; i++) {
      if (Array.isArray(s[kinds[i]])) n += s[kinds[i]].length;
    }
    return n + ((s.relations || []).length);
  }

  function unlocked() {
    var s = (st() && st().get()) || {};
    var list = (((s.chat || {}).unlocked) || []).slice();
    if (artifactCount() >= UNLOCK_AT && list.indexOf('vanir') === -1) {
      list.push('vanir');
      var chat = Object.assign({}, s.chat);
      chat.unlocked = list;
      st().set({ chat: chat });
    }
    return list;
  }

  function paintTeasers() {
    if (!usersEl) return;
    var olds = usersEl.querySelectorAll('.chat-user.locked');
    for (var i = olds.length - 1; i >= 0; i--) olds[i].remove();
    for (var k = 0; k < TEASERS; k++) {
      var b = document.createElement('div');
      b.className = 'chat-user locked';
      b.innerHTML = '<span class="dot"></span><span>??? — keep saving artifacts</span>';
      usersEl.appendChild(b);
    }
  }

  function flushInbox() {
    var s = (st() && st().get()) || {};
    var chat = s.chat || {};
    var box = chat.inbox || [];
    if (!box.length || !users.buddy) return;
    var def = (window.LiberAIML && window.LiberAIML.buddy) || {};
    var notes = def.checkins || [];
    var was = currentId;
    currentId = 'buddy';
    for (var i = 0; i < box.length; i++) {
      var line = notes.length ? notes[(i + users.buddy.log.length) % notes.length] : 'Still here. What surfaced?';
      users.buddy.log.push({ who: 'buddy', text: line, at: stamp() });
    }
    var fresh = Object.assign({}, chat, { inbox: [] });
    st().set({ chat: fresh });
    currentId = was;
  }

  // public surface for later phases (Vanir, unlocks, check-ins)
  window.LiberChat = {
    register: registerUser,
    users: users,
    order: order,
    current: function () { return currentId; },
    switchTo: switchTo,
    setLockedRenderer: function (fn) { renderLocked = fn; },
    sayAs: function (id, text) {
      if (!users[id]) return false;
      var was = currentId;
      currentId = id;
      appendLine(id, text);
      if (was !== id) { paintLogRestore(was); }
      return true;
    }
  };

  function paintLogRestore(was) {
    currentId = was;
    paintLog();
    renderUsers();
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (window.LiberAIML && window.LiberAIML.buddy) {
      registerUser({
        id: 'buddy',
        name: 'Buddy',
        color: '#e06070',
        topic: 'LiberChat — Buddy is listening.',
        aiml: window.LiberAIML.buddy
      });
    }
    var open = unlocked();
    if (open.indexOf('vanir') !== -1 && window.LiberAIML && window.LiberAIML.vanir) {
      registerUser({
        id: 'vanir',
        name: 'Vanir',
        color: '#4aa8c8',
        topic: 'LiberChat — Vanir holds the deep. No evasion.',
        aiml: window.LiberAIML.vanir
      });
    }
    renderLocked = paintTeasers;
    flushInbox();
    if (order.length) switchTo(order[0]);

    if (sendBtn) sendBtn.addEventListener('click', send);
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); send(); }
      });
      // the bed ducks while you type — the reply lands in the clear
      input.addEventListener('focus', function () {
        if (window.Liber && window.Liber.soundscape) {
          try { window.Liber.soundscape.duck(true); } catch (e) {}
        }
      });
      input.addEventListener('blur', function () {
        if (window.Liber && window.Liber.soundscape) {
          try { window.Liber.soundscape.duck(false); } catch (e) {}
        }
      });
    }
    if (sealBtn) sealBtn.addEventListener('click', seal);
    var exportBtn = document.getElementById('chat-export');
    if (exportBtn) exportBtn.addEventListener('click', exportTranscript);

    var exit = document.getElementById('buddy-exit');
    if (exit) exit.addEventListener('click', function () {
      if (history.length > 1) history.back(); else location.href = 'desktop.html';
    });

    var helpBtn = document.getElementById('buddy-help');
    var raison = document.getElementById('buddy-raison');
    var raisonClose = document.getElementById('buddy-raison-close');
    var how = document.getElementById('buddy-how');
    var howClose = document.getElementById('buddy-how-close');
    var howNote = document.getElementById('buddy-how-note');
    function openRaison() {
      if (raison) { raison.classList.add('open'); raison.removeAttribute('inert'); }
    }
    function closeRaison() {
      if (raison) { raison.classList.remove('open'); raison.setAttribute('inert', ''); }
    }
    function openHow() {
      if (how) { how.classList.add('open'); how.removeAttribute('inert'); }
    }
    function closeHow() {
      if (how) { how.classList.remove('open'); how.setAttribute('inert', ''); }
    }
    if (helpBtn) helpBtn.addEventListener('click', openHow);
    if (howClose) howClose.addEventListener('click', closeHow);
    if (how) how.addEventListener('click', function (e) { if (e.target === how) closeHow(); });
    if (howNote) howNote.addEventListener('click', function () { closeHow(); openRaison(); });
    if (raisonClose) raisonClose.addEventListener('click', closeRaison);
    if (raison) raison.addEventListener('click', function (e) { if (e.target === raison) closeRaison(); });
    if (window.LiberRoomShell) window.LiberRoomShell.bindRoomOverlays({ overlays: [
      { id: 'buddy-raison', close: closeRaison },
      { id: 'buddy-how', close: closeHow }
    ] });
  });
})();
