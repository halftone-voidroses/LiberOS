// liberchat.js — Liberchat, the talking machine (SYSTEM 01 of the redesign
// pitch). One lamp on every page; every conversation in the machine runs
// through it. Personas live in data/personas.data.js (chat scripts of 40+
// lines each); this file owns the surface and the contract:
//   - deterministic, seeded replies (no network; a model-backed responder
//     can replace `respond()` later without UI change)
//   - exchanges persist to state.chat[persona] and feed the affinity
//     thresholds alongside kept-work metrics (affinity.js reads them)
//   - any conversation seals to a buddy artifact (the wax flow)
//   - Escape closes (room-shell registry), Enter sends, reduced-motion kept.
(function (global) {
  'use strict';

  var doc = global.document;
  if (!doc) return;

  // ── persona resolution ────────────────────────────────────────────────
  // Page key -> persona id in LIBER_DATA.personas. The lamp answers as the
  // room's traveller; machine rooms (index/desktop/about) have their own.
  function pageKey() {
    var p = (global.location && global.location.pathname || '').split('/').pop() || 'index.html';
    return p.replace(/\.html$/, '') || 'index';
  }

  function personas() {
    return (global.LIBER_DATA && global.LIBER_DATA.personas) || {};
  }

  function personaFor(key) {
    var reg = personas();
    return reg[key] || reg.index || null;
  }

  // Chosen persona (via the header switcher) wins over the room's traveller.
  var chosenId = null;
  function activePersona() {
    if (chosenId && personas()[chosenId]) return personas()[chosenId];
    return personaFor(pageKey());
  }
  function personaList() {
    var reg = personas();
    var order = ['index', 'buddy', 'sigil', 'satchel', 'sea', 'games', 'divination', 'garden', 'dreams', 'learn', 'themes', 'trash', 'toybox'];
    var list = [];
    order.forEach(function (id) { if (reg[id]) list.push(reg[id]); });
    Object.keys(reg).forEach(function (id) { if (order.indexOf(id) < 0) list.push(reg[id]); });
    return list;
  }
  function switchPersona(id) {
    if (!personas()[id]) return;
    chosenId = id;
    persona = personas()[id];
    opened = false; // re-greet as the new voice
    ui.log.innerHTML = '';
    turns = [];
    openPanel();
  }
  function personaMenu() {
    var existing = ui.head.querySelector('.lc-menu');
    if (existing) { existing.parentNode.removeChild(existing); return; }
    var menu = el('div', 'lc-menu', ui.head);
    personaList().forEach(function (p) {
      var b = el('button', 'lc-who-item' + (p.id === persona.id ? ' on' : ''), menu);
      b.type = 'button';
      b.textContent = p.name;
      b.addEventListener('click', function () {
        var m = ui.head.querySelector('.lc-menu');
        if (m) m.parentNode.removeChild(m);
        switchPersona(p.id);
      });
    });
  }

  // ── seeded determinism: same persona + exchange count -> same line ───
  function hash(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function pick(arr, seed) {
    if (!arr || !arr.length) return '';
    return arr[seed % arr.length];
  }

  // ── state plumbing ───────────────────────────────────────────────────
  function st() { return (global.Liber && global.Liber.state) || null; }
  function readState() { var s = st(); return s ? (s.get() || {}) : {}; }
  function exchangesFor(id) {
    var chat = readState().chat || {};
    return chat[id] || 0;
  }
  function countExchange(id) {
    var s = st();
    if (!s) return;
    var chat = Object.assign({}, readState().chat || {});
    chat[id] = (chat[id] || 0) + 1;
    s.set({ chat: chat });
  }

  // affinity key per persona (affinity.js thresholds are keyed by traveller)
  var WHO = {
    sigil: 'physius', satchel: 'riason', sea: 'vanir', buddy: 'elizabeth',
    games: 'whimsy', divination: 'arcana', garden: 'ruby', dreams: 'inquiry'
  };

  // ── the responder: deterministic, scripted, context-aware ────────────
  // Registers:
  //   greet    first open of the visit
  //   context  one line per room key — the traveller knows what you did
  //   topics   keyword-grouped replies (the conversation proper)
  //   hesitate when you send nothing or just dots
  //   small    idle banter fallback
  //   recall   occasional callback once the exchange has depth
  //   onSeal   when the wax takes the transcript
  //   unlock   bark when their threshold is crossed by conversation
  //   bye      farewell
  function respond(p, input, exchangeNo) {
    var chat = p.chat || {};
    var seed = hash(p.id + '::' + exchangeNo + '::' + (input || ''));
    var text = String(input || '').trim();
    var lower = text.toLowerCase();

    if (!text || /^\.+$/.test(text)) return pick(chat.hesitate, seed);
    if (/\b(bye|goodbye|good night|goodnight|leave|farewell)\b/.test(lower)) return pick(chat.bye, seed);

    if (chat.topics) {
      for (var i = 0; i < chat.topics.length; i++) {
        var t = chat.topics[i];
        for (var k = 0; k < t.k.length; k++) {
          if (lower.indexOf(t.k[k]) >= 0) return pick(t.say, seed + i);
        }
      }
    }
    // depth callback: after three real exchanges, occasionally recall
    if (exchangeNo > 3 && chat.recall && (seed & 3) === 0) return pick(chat.recall, seed);
    if (text.length >= 3) return pick(chat.small, seed);
    return pick(chat.hesitate, seed);
  }

  function contextLine(p, key) {
    var chat = p.chat || {};
    if (!chat.context) return null;
    var s = readState();
    var KEPT = ['buddy', 'divination', 'games', 'sea', 'satchel', 'garden', 'dreams', 'iching', 'methodology', 'council'];
    var n = 0;
    KEPT.forEach(function (k) { if (Array.isArray(s[k])) n += s[k].length; });
    var line = chat.context[key];
    if (!line) return null;
    return line.split('{n}').join(String(n));
  }

  // ── the lamp surface ─────────────────────────────────────────────────
  var ui = null;          // { lamp, panel, log, input, send, seal, head }
  var persona = null;
  var turns = [];         // session transcript [{ who:'me'|'them', text }]
  var opened = false;
  var sealArmed = false;
  var reduced = false;
  try { reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function el(tag, cls, parent) {
    var n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (parent) parent.appendChild(n);
    return n;
  }

  function build() {
    if (ui) return ui;
    var lamp = el('button', 'liberchat-lamp');
    lamp.id = 'liberchat-lamp';
    lamp.type = 'button';
    lamp.setAttribute('aria-label', 'open liberchat');
    lamp.setAttribute('aria-expanded', 'false');
    lamp.title = 'liberchat';

    var panel = el('section', 'liberchat-panel');
    panel.id = 'liberchat-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'liberchat');
    panel.hidden = true;

    var head = el('header', 'lc-head', panel);
    var dot = el('i', 'lc-dot', head);
    var name = el('span', 'lc-name', head);
    var whoBtn = el('button', 'lc-who', head);
    whoBtn.type = 'button';
    whoBtn.setAttribute('aria-label', 'switch persona');
    whoBtn.title = 'switch persona';
    whoBtn.textContent = '⇄';
    var closeBtn = el('button', 'lc-close', head);
    closeBtn.type = 'button';
    closeBtn.textContent = '×';
    closeBtn.setAttribute('aria-label', 'close liberchat');

    var log = el('div', 'lc-log', panel);
    log.id = 'liberchat-log';
    log.setAttribute('role', 'log');
    log.setAttribute('aria-live', 'polite');

    var form = el('form', 'lc-form', panel);
    var input = el('input', 'lc-input', form);
    input.type = 'text';
    input.id = 'liberchat-input';
    input.placeholder = 'say something…';
    input.autocomplete = 'off';
    input.maxLength = 400;
    var send = el('button', 'lc-send', form);
    send.type = 'submit';
    send.textContent = 'send';

    var seal = el('button', 'lc-seal', panel);
    seal.type = 'button';
    seal.textContent = 'seal in wax';

    doc.body.appendChild(lamp);
    doc.body.appendChild(panel);

    ui = { lamp: lamp, panel: panel, log: log, input: input, send: send, seal: seal, name: name, whoBtn: whoBtn, head: head };
    wire();
    return ui;
  }

  function line(who, text, cls) {
    var row = el('div', 'lc-line ' + (cls || (who === 'me' ? 'me' : '')), ui.log);
    row.textContent = text;
    ui.log.scrollTop = ui.log.scrollHeight;
    turns.push({ who: who, text: text });
  }

  function reply(text, extraCls) {
    if (reduced) { line('them', text, extraCls); return; }
    var wait = doc.createElement('div');
    wait.className = 'lc-line them lc-typing';
    wait.textContent = '…';
    ui.log.appendChild(wait);
    ui.log.scrollTop = ui.log.scrollHeight;
    var beat = 350 + (hash(text) % 450);
    global.setTimeout(function () {
      if (wait.parentNode) wait.parentNode.removeChild(wait);
      line('them', text, extraCls);
    }, beat);
  }

  function openPanel() {
    build();
    persona = activePersona();
    ui.panel.hidden = false;
    ui.lamp.setAttribute('aria-expanded', 'true');
    ui.lamp.classList.add('lit');
    if (!opened) {
      opened = true;
      ui.name.textContent = chosenId ? persona.name : (persona.name + ' · ' + pageKey());
      var seed = hash(persona.id + '::greet::' + (exchangesFor(persona.id) || 0));
      reply(pick(persona.chat && persona.chat.greet, seed));
      var ctx = contextLine(persona, pageKey());
      if (ctx) global.setTimeout(function () { reply(ctx); }, reduced ? 0 : 900);
      if (persona.id === 'games' && persona.chat.guest && global.Liber && global.Liber.affinity &&
          global.Liber.affinity.unlocked('inkstorm')) {
        global.setTimeout(function () {
          reply('— static clears for one word —', 'lc-guest');
        }, reduced ? 0 : 1500);
      }
    }
    ui.input.focus();
  }

  function closePanel() {
    if (!ui) return;
    ui.panel.hidden = true;
    ui.lamp.setAttribute('aria-expanded', 'false');
    ui.lamp.classList.remove('lit');
    sealArmed = false;
    ui.seal.classList.remove('armed');
    ui.seal.textContent = 'seal in wax';
  }

  function toggle() { (ui && !ui.panel.hidden) ? closePanel() : openPanel(); }

  function submit() {
    if (!ui || ui.panel.hidden) return;
    var text = ui.input.value;
    ui.input.value = '';
    if (!persona || !persona.chat) return;
    if (!text.trim()) { reply(pick(persona.chat.hesitate, hash(persona.id + ':' + turns.length))); return; }
    line('me', text);
    var n = exchangesFor(persona.id) + 1;
    countExchange(persona.id);
    var out = respond(persona, text, n);
    reply(out);
    // exchanges feed the affinity thresholds (affinity.js reads state.chat)
    var newly = [];
    try { newly = (global.Liber && global.Liber.affinity && global.Liber.affinity.check()) || []; } catch (e) {}
    if (newly.length && persona.chat && persona.chat.unlock) {
      global.setTimeout(function () { reply('✶ ' + persona.chat.unlock, 'lc-unlock'); }, reduced ? 0 : 1200);
    }
  }

  function sealChat() {
    if (!ui || ui.panel.hidden) return;
    if (!sealArmed) {
      sealArmed = true;
      ui.seal.classList.add('armed');
      ui.seal.textContent = 'seal this conversation?';
      global.setTimeout(function () {
        if (!sealArmed) return;
        sealArmed = false;
        ui.seal.classList.remove('armed');
        ui.seal.textContent = 'seal in wax';
      }, 4000);
      return;
    }
    sealArmed = false;
    ui.seal.classList.remove('armed');
    ui.seal.textContent = 'seal in wax';
    var tail = turns.filter(function (t) { return t.text.indexOf('✶') !== 0; }).slice(-8)
      .map(function (t) { return (t.who === 'me' ? 'you: ' : persona.name + ': ') + t.text; }).join('\n');
    var confession = tail.length > 600 ? tail.substring(tail.length - 600) : tail;
    var s = st();
    if (s && s.addArtifact) {
      var name = 'lamp chat · ' + persona.name;
      if (name.length > 30) name = name.substring(0, 30) + '…';
      s.addArtifact('buddy', { kind: 'sealed', name: name, confession: confession, lamp: true });
      if (global.Liber && global.Liber.sound) { try { global.Liber.sound.play('chime'); } catch (e) {} }
      ui.panel.classList.add('lc-sealing');
      global.setTimeout(function () { ui.panel.classList.remove('lc-sealing'); }, reduced ? 0 : 900);
      reply(pick(persona.chat && persona.chat.onSeal, hash(persona.id + '::seal::' + turns.length)));
      try { if (global.Liber && global.Liber.affinity) global.Liber.affinity.check(); } catch (e) {}
    } else {
      reply('the wax is missing. nothing to seal against.');
    }
  }

  function wire() {
    ui.lamp.addEventListener('click', toggle);
    ui.head.querySelector('.lc-close').addEventListener('click', closePanel);
    ui.whoBtn.addEventListener('click', personaMenu);
    ui.panel.addEventListener('submit', function (e) {
      e.preventDefault();
      submit();
    });
    ui.seal.addEventListener('click', sealChat);
    if (global.LiberRoomShell && global.LiberRoomShell.bindOverlay) {
      global.LiberRoomShell.bindOverlay('liberchat-panel', closePanel);
    }
  }

  // ── public surface (acceptance tests drive this) ─────────────────────
  global.LiberLiberchat = {
    open: openPanel,
    close: closePanel,
    toggle: toggle,
    say: function (text) {
      openPanel();
      ui.input.value = text;
      submit();
    },
    transcript: function () { return turns.slice(); },
    persona: function () { return persona ? persona.id : pageKey(); },
    exchanges: exchangesFor
  };

  // Mount the lamp once the DOM (and data/state) exist.
  function mount() {
    if (doc.getElementById('liberchat-lamp')) return;
    build();
    // Daily-floor / archive links point here as desktop.html#liberchat.
    if ((global.location.hash || '').indexOf('liberchat') >= 0) openPanel();
  }
  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
  if (global.addEventListener) {
    global.addEventListener('hashchange', function () {
      if ((global.location.hash || '').indexOf('liberchat') >= 0) openPanel();
    });
  }
})(window);
