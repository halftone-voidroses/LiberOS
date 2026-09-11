// daily-floor.js — Todays Tasks (desktop.html only).
// A quiet checklist in the screen's right margin: three suggestions per day,
// picked deterministically from the date (seeded PRNG — the same shape as
// src/gamification.js / src/prompt-engine.js; no Math.random in anything the
// user can perceive). One suggestion points at the book (the satchel) or the
// constellation; the rest point at travellers' rooms. Ticking is a private
// ritual — no rewards, no streaks, no guilt; the room keeps no score
// (docs/gamification.md anti-goals). Nothing fires proactively: the panel
// sits, the day changes, the list changes. Persisted under state.daily as
// { date: 'YYYY-MM-DD', done: [ids] }; a new date replaces the list whole.

(function () {
  'use strict';

  var POOL = [
    { id: 'divination',  room: 'divination.html', text: 'draw one card. keep it.' },
    { id: 'dreams',      room: 'dreams.html',     text: 'write one dream down.' },
    { id: 'garden',      room: 'garden.html',     text: 'tend one seed.' },
    { id: 'sea',         room: 'sea.html',        text: 'release one line. let it go.' },
    { id: 'chat',        room: 'buddy.html',     text: 'speak. seal the exchange.' },
    { id: 'games',       room: 'games.html',      text: 'play one booth. keep the result.' },
    { id: 'toybox',      room: 'toybox.html',     text: 'touch everything. keep one picture.' },
    { id: 'learn',       room: 'learn.html',      text: 'read one page. answer it.' },
    { id: 'themes',      room: 'themes.html',     text: 'repaint one room.' },
    { id: 'satchel',     room: 'satchel.html',     text: 'annotate one kept item.' },
    { id: 'desktop',     room: 'desktop.html',     text: 'bind one artifact. name the verb.' }
  ];

  // Anything in the book set drags the checklist toward the kept things.
  var BOOK_IDS = ['satchel'];

  var container = null;

  function state() {
    return (window.Liber && window.Liber.state) ? window.Liber.state : null;
  }

  function hashSeed(str) {
    var h = 1779033703 ^ str.length;
    for (var i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return (h ^= h >>> 16) >>> 0;
  }

  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function todayKey() {
    var d = new Date();
    var m = (d.getMonth() + 1) < 10 ? '0' + (d.getMonth() + 1) : String(d.getMonth() + 1);
    var day = d.getDate() < 10 ? '0' + d.getDate() : String(d.getDate());
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function dailyRecord(s) {
    var rec = s.daily;
    if (rec && rec.date === todayKey() && Array.isArray(rec.done)) return rec;
    return { date: todayKey(), done: [] };
  }

  var STARTER = [
    { id: 'draw-buddy',    room: 'sigil.html',   text: 'draw a buddy.' },
    { id: 'set-relation',  room: 'desktop.html', text: 'set a relation.' },
    { id: 'chat-buddy',    room: 'buddy.html',   text: 'chat to your buddy.' }
  ];

  function starterNeeded() {
    try {
      var st = state();
      var s = st ? st.get() : null;
      return !s || !s.tutorialDone;
    } catch (e) { return false; }
  }

  // Three works per day: at least one from the book set, the rest from the
  // whole pool. Seeded by the date, so the same day draws the same three.
  // Before the tutorial is done the room assigns the starting three instead.
  function pickWorks(dateKey) {
    if (starterNeeded()) return STARTER.slice();
    var rng = mulberry32(hashSeed('daily-floor|' + dateKey));
    var book = POOL.filter(function (p) { return BOOK_IDS.indexOf(p.id) !== -1; });
    var rest = POOL.filter(function (p) { return BOOK_IDS.indexOf(p.id) === -1; });
    var picked = [];

    var bi = Math.floor(rng() * book.length);
    picked.push(book[bi]);
    while (picked.length < 3) {
      var cand = rest[Math.floor(rng() * rest.length)];
      var clash = false;
      for (var i = 0; i < picked.length; i++) {
        if (picked[i].id === cand.id) { clash = true; break; }
      }
      if (!clash) picked.push(cand);
    }
    return picked;
  }

  function toggleDone(rec, id) {
    var done = rec.done.slice();
    var i = done.indexOf(id);
    if (i >= 0) done.splice(i, 1);
    else done.push(id);
    return done;
  }

  function build() {
    container = document.createElement('div');
    container.className = 'daily-floor';
    container.id = 'daily-floor';
    container.setAttribute('role', 'group');
    container.setAttribute('aria-label', "Today: do one");
    var stage = document.getElementById('desktop');
    stage.appendChild(container);
  }

  function render() {
    var st = state();
    if (!st || !container) return;
    var s = st.get();
    var rec = dailyRecord(s);
    var works = pickWorks(rec.date);

    container.innerHTML = '';
    var head = document.createElement('div');
    head.className = 'daily-floor-head';
      head.textContent = "today: do one";
    container.appendChild(head);

    works.forEach(function (w) {
      var done = rec.done.indexOf(w.id) !== -1;
      var row = document.createElement('div');
      row.className = 'daily-floor-row' + (done ? ' done' : '');

      var tick = document.createElement('button');
      tick.type = 'button';
      tick.className = 'daily-floor-tick';
      tick.textContent = done ? '×' : '·';
      tick.setAttribute('aria-pressed', done ? 'true' : 'false');
      tick.setAttribute('aria-label', (done ? 'untick: ' : 'tick: ') + w.text);
      tick.addEventListener('click', function () {
        var st2 = state();
        if (!st2) return;
        var rec2 = dailyRecord(st2.get());
        st2.set({ daily: { date: rec2.date, done: toggleDone(rec2, w.id) } });
      });
      row.appendChild(tick);

      var label = document.createElement('a');
      label.className = 'daily-floor-label';
      label.href = w.room;
      label.textContent = w.text;
      row.appendChild(label);

      container.appendChild(row);
    });

    var foot = document.createElement('div');
    foot.className = 'daily-floor-foot';
    foot.textContent = 'optional. ticks stay here.';
    container.appendChild(foot);
  }

  function init() {
    if (!document.getElementById('desktop')) return; // desktop-only surface
    build();
    var st = state();
    if (st && st.on) {
      st.on('change', render);
      st.on('artifact', render);
    }
    window.addEventListener('pageshow', render); // bfcache restore: resync
    // The day can roll over while the room sits open — a cheap date check,
    // a timer, not animation.
    setInterval(function () {
      var st2 = state();
      if (!st2) return;
      var rec = (st2.get().daily) || { date: null, done: [] };
      if (rec.date !== todayKey()) render();
    }, 60000);
    render();
  }

  window.Liber = window.Liber || {};
  window.Liber.dailyFloor = {
    picks: function () { return pickWorks(todayKey()).map(function (w) { return w.id; }); }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
