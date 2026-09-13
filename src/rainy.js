// rainy.js — Rainy Day's desktop furniture (desktop.html only).
//
// One icon that weathers the whole machine for the heavy visits. Turning it
// on dims the screen, cools the light, and lets rain fall behind the glass
// (that part is styles/shadow.css; every room carries its own skin in its
// own stylesheet). Turning it off is the same icon, now shining — no
// explanation asked or given.
//
// ONE OWNER: s.shadowOn. This module never owns the rain; it writes the key
// and mirrors whatever the key already says, so settings.js and the sea
// room's secret key stay in step for free.
//
// Standalone IIFE, builds its own DOM (covenant Q.1 — no shared imports).

(function () {
  'use strict';

  var TICKER = 'the machine dims itself for you. everything still works. nothing expires.';
  var HELP_HREF = 'learn.html#hard-nights';

  function st() { return (window.Liber && window.Liber.state) || null; }
  function on() { var s = st() ? st().get() : null; return !!(s && s.shadowOn); }

  // ─── the icon ────────────────────────────────────────────────────────
  function buildToggle() {
    var b = document.createElement('button');
    b.type = 'button';
    b.id = 'rainy-toggle';
    b.className = 'rainy-toggle';
    b.setAttribute('aria-pressed', 'false');
    b.setAttribute('aria-label', 'rainy day — weather the machine for a heavy visit');
    b.innerHTML =
      '<svg class="rainy-toggle-glyph" viewBox="0 0 24 24" aria-hidden="true">' +
        '<path d="M12 3.2c-4.6 0-8.4 3.3-9.4 7.6-.1.4.2.7.6.7h17.6c.4 0 .7-.3.6-.7C20.4 6.5 16.6 3.2 12 3.2z" fill="#5d8cae" stroke="#a8c8e0" stroke-width="0.8"/>' +
        '<path d="M12 3.2V2.2" stroke="#a8c8e0" stroke-width="1.2" stroke-linecap="round"/>' +
        '<path d="M12 11.5v7.2c0 1.3 1 2.3 2.3 2.3s2.3-1 2.3-2.3" fill="none" stroke="#a8c8e0" stroke-width="1.4" stroke-linecap="round"/>' +
      '</svg>' +
      '<span class="rainy-toggle-label">rainy day</span>';
    b.addEventListener('click', function () { toggle(); });
    return b;
  }

  // ─── the ticker ──────────────────────────────────────────────────────
  function buildTicker() {
    var t = document.createElement('div');
    t.id = 'rainy-ticker';
    t.className = 'rainy-ticker';
    t.setAttribute('role', 'status');
    var line = document.createElement('span');
    line.className = 'rainy-ticker-line';
    line.textContent = TICKER;
    var ans = document.createElement('span');
    ans.className = 'rainy-ticker-answer';
    ans.id = 'rainy-ticker-answer';
    var help = document.createElement('button');
    help.type = 'button';
    help.className = 'rainy-help';
    help.textContent = 'hard nights →';
    help.setAttribute('aria-label', 'hard nights — helplines and what to do at 3am');
    help.addEventListener('click', function () { window.location.href = HELP_HREF; });
    t.appendChild(line);
    t.appendChild(ans);
    t.appendChild(help);
    return t;
  }

  // ─── the one asked question ──────────────────────────────────────────
  // Asked once a night, never twice, and it gates nothing: it only decides
  // which voice the ticker keeps. Answering is optional and silencable.
  function buildAsk() {
    var w = document.createElement('div');
    w.id = 'rainy-ask';
    w.className = 'rainy-ask';
    w.setAttribute('role', 'dialog');
    w.setAttribute('aria-label', 'one question');
    w.innerHTML =
      '<div class="rainy-ask-q">is tonight a keeping night, or a releasing one?</div>' +
      '<div class="rainy-ask-row">' +
        '<button type="button" class="rainy-ask-btn" data-night="keeping">a keeping night</button>' +
        '<button type="button" class="rainy-ask-btn" data-night="releasing">a releasing one</button>' +
      '</div>' +
      '<button type="button" class="rainy-ask-else" data-night="null">i would rather not say</button>';
    var btns = w.querySelectorAll('[data-night]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function (e) {
        var raw = e.currentTarget.getAttribute('data-night');
        answer(raw === 'null' ? null : raw);
      });
    }
    return w;
  }

  function answer(night) {
    if (!st()) return;
    st().set({ rainyNight: night, rainyAsked: st().get().sessionStart || 0 });
    closeAsk();
    renderTicker();
  }

  function openAsk() {
    var w = document.getElementById('rainy-ask');
    if (w) w.classList.add('open');
  }
  function closeAsk() {
    var w = document.getElementById('rainy-ask');
    if (w) w.classList.remove('open');
  }

  // ─── render (mirrors the key; owns nothing) ──────────────────────────
  var NIGHT_COPY = {
    keeping: ' — tonight you are keeping.',
    releasing: ' — tonight you are releasing.'
  };

  function renderTicker() {
    var ans = document.getElementById('rainy-ticker-answer');
    if (!ans) return;
    var s = (st() && st().get()) || {};
    // a stale answer from an earlier sitting is not shown: the question is
    // asked once a night, so it is also forgotten once a night.
    var fresh = s.rainyAsked && s.sessionStart && s.rainyAsked === s.sessionStart;
    ans.textContent = (fresh && NIGHT_COPY[s.rainyNight]) || '';
  }

  function render() {
    var isOn = on();
    var body = document.body;
    if (body) body.classList.toggle('rainy-on', isOn);
    var b = document.getElementById('rainy-toggle');
    if (b) {
      b.setAttribute('aria-pressed', isOn ? 'true' : 'false');
      b.title = isOn ? 'rainy day — end the weather' : 'rainy day — dim the machine for a heavy visit';
    }
    renderTicker();
    // Ask once a night — on the night you turn it on, and on the night you
    // come back to find it still on. Answered or declined, that is the
    // last of it until the next sitting.
    var s = (st() && st().get()) || {};
    if (isOn && s.rainyAsked !== s.sessionStart) openAsk();
    else closeAsk();
  }

  function toggle() {
    if (!st()) return;
    var next = !on();
    st().set({ shadowOn: next });
    render();
  }

  function init() {
    if (!st()) return;
    if (!document.getElementById('rainy-toggle')) document.body.appendChild(buildToggle());
    if (!document.getElementById('rainy-ticker')) document.body.appendChild(buildTicker());
    if (!document.getElementById('rainy-ask')) document.body.appendChild(buildAsk());
    render();
    if (st().on) st().on('change', render);
  }

  // ─── the shared pacing helper ────────────────────────────────────────
  // "Confirmations slow" is real, not decorative: while it rains, a room
  // that asks you to confirm something waits longer before it takes your
  // silence as an answer. Rooms call this instead of hard-coding a delay.
  window.Liber = window.Liber || {};
  window.Liber.rainy = {
    isOn: on,
    slowConfirmMs: function (base) {
      var b = typeof base === 'number' ? base : 0;
      return on() ? Math.round(b * 1.5) : b;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
