// liberchat-sidecar.js — the second tube (redesign-plan-2, job III).
// Stands a dot-matrix sidecar CRT and re-parents the existing liberchat
// engine surface into its glass. The engine (src/liberchat.js) is untouched:
// same transport, same state, same seal. Only the surface changes — the lamp
// retires, and the sidecar itself is the door.
//
//   - every page: the tube stands where the lamp stood, in the room's corner
//   - the desk: where a machine is on the page the tube is wired into it
//   - the lid is the door: real button, aria-named, keyboard-reachable
//   - the feed mirrors the engine's hidden state (MutationObserver)
//   - a bench line with the tube shut prints on the feed paper (no line lost)
//   - the sidecar recedes with the machine (Room Behind the CRT)
//   - reduced motion: the tube is an instant state change
(function () {
  'use strict';

  var doc = document;
  var page = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
  // Loaded from src/liberchat-mount.js on every page, so it may arrive twice
  // (a page that also names it directly). One tube per room, always.
  if (doc.getElementById('liberchat-sidecar')) return;
  // Off the desk the tube is a guest: mark away pages so narrow screens
  // may fold the shut tube to its door tab instead of sitting on controls.
  if (page && page !== 'desktop') doc.body.classList.add('lc-sidecar-away');

  var reduced = false;
  try { reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  var sidecar = null;   // { root, lid, glass, open() }
  var fit = false;

  function engine() { return window.LiberLiberchat || null; }

  function build() {
    var root = doc.createElement('aside');
    root.className = 'lc-sidecar';
    root.id = 'liberchat-sidecar';

    var lid = doc.createElement('button');
    lid.type = 'button';
    lid.className = 'lc-sidecar-lid';
    lid.setAttribute('aria-label', 'liberchat sidecar');
    lid.setAttribute('aria-expanded', 'false');
    lid.setAttribute('aria-controls', 'liberchat-panel');
    lid.title = 'liberchat';

    var plate = doc.createElement('span');
    plate.className = 'lc-sidecar-plate';
    var model = doc.createElement('span');
    model.className = 'lc-sidecar-model';
    model.textContent = 'TX-80 \u00b7 REV. C';
    var dot = doc.createElement('span');
    dot.className = 'lc-sidecar-dot';

    plate.appendChild(model);
    plate.appendChild(dot);

    var glass = doc.createElement('div');
    glass.className = 'lc-sidecar-glass';
    var inner = doc.createElement('div');
    inner.className = 'lc-sidecar-glass-inner';
    var feed = doc.createElement('div');
    feed.className = 'lc-sidecar-feed';

    // The sheet carries the machine's letterhead: the stamp it was cut for,
    // a form number, and the line the printer's office prints on every run.
    // Under the raster, under the writing — visible on the blank sheet.
    var letterhead = mk('div', 'lc-sidecar-letterhead');
    letterhead.innerHTML =
      '<svg class="lc-sidecar-stamp" width="116" height="116" viewBox="0 0 44 44" fill="none">' +
      '<circle cx="22" cy="22" r="19" stroke="#8a5a24" stroke-width="2.4"/>' +
      '<path d="M3 22h38" stroke="#8a5a24" stroke-width="1.6"/>' +
      '<path d="M22 3v38" stroke="#8a5a24" stroke-width="1.6"/>' +
      '<circle cx="22" cy="12" r="1.9" fill="#8a5a24"/>' +
      '<circle cx="22" cy="32" r="1.9" fill="#8a5a24"/>' +
      '<path d="M14 35.5 22 40.5l8-5" stroke="#8a5a24" stroke-width="1.2"/></svg>' +
      '<span class="lc-sidecar-form">TX-80/3 · second tube</span>' +
      '<span class="lc-sidecar-circulate">for internal circulation only</span>';
    feed.appendChild(letterhead);

    // The raster: the tube's scan runs over the sheet and under the writing,
    // so the feed stays legible while the glass still reads as a screen.
    var raster = mk('div', 'lc-sidecar-raster');
    feed.appendChild(raster);

    inner.appendChild(feed);
    glass.appendChild(inner);

    var stand = doc.createElement('div');
    stand.className = 'lc-sidecar-stand';
    stand.appendChild(mk('div', 'lc-sidecar-neck'));
    stand.appendChild(mk('div', 'lc-sidecar-foot'));

    var cable = doc.createElement('div');
    cable.className = 'lc-sidecar-cable';
    cable.setAttribute('aria-hidden', 'true');
    cable.innerHTML =
      '<svg width="70" height="46" viewBox="0 0 70 46" fill="none">' +
      '<path d="M2 6 C 26 10, 34 40, 68 44" stroke="#14100c" stroke-width="3.2" stroke-linecap="round"/>' +
      '<path d="M2 6 C 26 10, 34 40, 68 44" stroke="#3a3126" stroke-width="1.6" stroke-linecap="round"/></svg>';

    // The loom: whoever wired the second tube into the machine did it in a
    // hurry and left it that way. Two leads run into the screen's frame, one
    // is spliced with tape, and one never found a socket and lies on the
    // desk with its spade end bare. Wire, not text: nothing here is spoken.
    var loom = mk('div', 'lc-sidecar-loom');
    loom.innerHTML =
      '<svg width="90" height="380" viewBox="0 0 90 380" fill="none">' +
      // the lead that never found a socket rests on the desk: it casts, like
      // everything else here, a blurred ellipse — never a hard oval
      '<defs><filter id="lc-loom-shadow" x="-60%" y="-60%" width="220%" height="220%">' +
      '<feGaussianBlur stdDeviation="2.6"/></filter></defs>' +
      '<ellipse cx="31" cy="367" rx="14" ry="3.6" fill="#070403" opacity="0.85" filter="url(#lc-loom-shadow)"/>' +
      '<path d="M90 34 C 76 22, 60 52, 44 50 C 30 48, 20 32, 10 26" stroke="#14100c" stroke-width="3.2" stroke-linecap="round"/>' +
      '<path d="M90 34 C 76 22, 60 52, 44 50 C 30 48, 20 32, 10 26" stroke="#3a3126" stroke-width="1.6" stroke-linecap="round"/>' +
      '<path d="M90 58 C 68 56, 46 50, 12 46" stroke="#14100c" stroke-width="3.2" stroke-linecap="round"/>' +
      '<path d="M90 58 C 68 56, 46 50, 12 46" stroke="#3a3126" stroke-width="1.6" stroke-linecap="round"/>' +
      '<path d="M90 78 C 68 92, 52 150, 44 230 C 40 284, 38 330, 34 362" stroke="#14100c" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M90 78 C 68 92, 52 150, 44 230 C 40 284, 38 330, 34 362" stroke="#3a3126" stroke-width="1.2" stroke-linecap="round"/>' +
      '<path d="M90 78 C 76 86, 66 106, 58 132" stroke="#b06a28" stroke-width="1" opacity="0.45"/>' +
      '<path d="M34 362l-8 6m8-6 8 6" stroke="#8a6a2a" stroke-width="1.2" stroke-linecap="round"/>' +
      '<rect x="4" y="20" width="13" height="14" fill="#241d15" stroke="#3a3126" stroke-width="1"/>' +
      '<path d="M4 27h-3" stroke="#8a6a2a" stroke-width="1.2" stroke-linecap="round"/>' +
      '<rect x="36" y="41" width="24" height="11" transform="rotate(-7 48 46)" fill="#cfc298" opacity="0.85"/>' +
      '<path d="M37 47l22-3" stroke="#8a7a4a" stroke-width="0.8" opacity="0.5"/></svg>';

    var shadow = doc.createElement('div');
    shadow.className = 'lc-sidecar-shadow';
    shadow.setAttribute('aria-hidden', 'true');

    var spill = doc.createElement('div');
    spill.className = 'lc-sidecar-spill';
    spill.setAttribute('aria-hidden', 'true');

    // Evidence of the ceremony the case has sat through: wax that ran down
    // the top edge and the scorch ring left under the stub.
    var wax = mk('span', 'lc-sidecar-wax');
    wax.innerHTML =
      '<svg width="30" height="26" viewBox="0 0 30 26" fill="none">' +
      '<ellipse cx="14" cy="7" rx="9" ry="3.4" stroke="#2a1a12" stroke-width="1.6"/>' +
      '<path d="M10.5 5.5c-.6 3.2-.9 6.4-.7 9.6.1 1.6.9 2.4 2.2 2.4 1.5 0 2.4-.9 2.6-2.7.3-2.4.1-4.9-.3-7.2" fill="#6b2a1e"/>' +
      '<path d="M18.5 6.4c.7 1.7 1 3.4 1 5.2" stroke="#6b2a1e" stroke-width="2.2" stroke-linecap="round"/></svg>';

    // Scratched tallies on the model plate: the maker counted something on the
    // case and never wrote down what. Thirteen, in strokes of four and five.
    var tallies = mk('span', 'lc-sidecar-tallies');
    plate.insertBefore(tallies, dot);
    tallies.innerHTML =
      '<svg width="48" height="12" viewBox="0 0 48 12" fill="none">' +
      '<path d="M2 2.4v7.4M6 2v8M10 2.6v7.2M14 2.2v7.6M1 10.5 16.5 1.6" stroke="#6b5c46" stroke-width="1"/>' +
      '<path d="M22 2v8M26 2.6v7.2M30 2.2v7.6M34 2.6v7.2M21 10.4 35.5 1.7" stroke="#6b5c46" stroke-width="1"/>' +
      '<path d="M41 2.4v7.4M45 2v8M46 2.6v7" stroke="#6b5c46" stroke-width="1"/></svg>';

    var note = doc.createElement('span');
    note.className = 'lc-sidecar-note';
    note.setAttribute('aria-hidden', 'true');
    note.textContent = 'communicate to travellers';

    var body = doc.createElement('div');
    body.className = 'lc-sidecar-body';
    body.appendChild(glass);
    body.appendChild(plate);
    body.appendChild(lid);
    body.appendChild(note);
    body.appendChild(wax);
    root.appendChild(loom);
    root.appendChild(cable);
    root.appendChild(body);
    root.appendChild(stand);
    root.appendChild(shadow);
    root.appendChild(spill);
    doc.body.appendChild(root);

    lid.addEventListener('click', function () {
      var e = engine();
      if (!e) return;
      e.toggle();
    });

    sidecar = { root: root, lid: lid, glass: glass, inner: inner, feed: feed, body: body };
    return sidecar;
  }

  function mk(tag, cls) {
    var n = doc.createElement(tag);
    n.className = cls;
    n.setAttribute('aria-hidden', 'true');
    return n;
  }

  // Re-parent the engine's panel into the glass. The engine keeps its
  // listeners, its room-shell Escape binding, its state — only the DOM
  // home moves.
  function adoptPanel() {
    var panel = doc.getElementById('liberchat-panel');
    if (!panel || !sidecar) return false;
    if (panel.parentNode !== sidecar.feed) sidecar.feed.appendChild(panel);
    doc.body.classList.add('lc-has-sidecar');
    return true;
  }

  // Mirror the engine's panel state onto the object: door, glow, focus.
  function sync() {
    if (!sidecar) return;
    var panel = doc.getElementById('liberchat-panel');
    var open = !!panel && !panel.hidden;
    sidecar.root.classList.toggle('open', open);
    sidecar.lid.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function watchPanel() {
    var panel = doc.getElementById('liberchat-panel');
    if (!panel) return false;
    sync();
    new MutationObserver(sync).observe(panel, { attributes: true, attributeFilter: ['hidden'] });
    return true;
  }

  // A bench line arrives while the tube is shut: the engine prints a whisper
  // on the body. It keeps its node and its role=status, but lives on the
  // sidecar here, where a printed slip lands — the machine's line stays
  // legible, and the glass takes the light the lamp used to give it.
  function adoptWhisper() {
    if (!sidecar) return false;
    var w = doc.getElementById('liberchat-whisper');
    if (!w) return false;
    if (w.parentNode !== sidecar.root) sidecar.root.appendChild(w);
    if (w.getAttribute('data-sidecar-watched') !== '1') {
      w.setAttribute('data-sidecar-watched', '1');
      new MutationObserver(function () {
        if (w.classList.contains('show')) flicker();
      }).observe(w, { attributes: true, attributeFilter: ['class'] });
      // the first line is already written by the time this node is adopted,
      // so its .show is read once here rather than waited for
      if (w.classList.contains('show')) flicker();
    }
    return true;
  }

  // Desk fit: with room beside the machine, the sidecar stands on the desk
  // next to it and the ensemble (machine + sidecar) centers as one unit;
  // below the threshold the sidecar stays pinned to the screen edge. The
  // ensemble's left padding is measured from the real widths, not guessed.
  function measure() {
    if (!sidecar) return;
    var vw = doc.documentElement.clientWidth;
    var vh = doc.documentElement.clientHeight;
    // One machine, many rooms: every room page is the same machine shell with
    // that room's content on its screen, so the tube stands beside it there
    // too — the same object in the same place on all of them. Only a document
    // with no machine at all (the pitch and plan pages) falls back to the
    // corner stance.
    var machine = doc.querySelector('.machine');
    var wantFit = !!machine && vw >= 900 && vh >= 560;
    doc.body.classList.toggle('lc-sidecar-room', !machine);
    if (wantFit !== fit) {
      fit = wantFit;
      doc.body.classList.toggle('lc-sidecar-fit', fit);
      if (fit && machine && sidecar.root.parentNode !== machine) {
        machine.appendChild(sidecar.root);
      } else if (!fit && sidecar.root.parentNode !== doc.body) {
        doc.body.appendChild(sidecar.root);
      }
    }
    var desk = 0;
    if (fit) {
      var mw = machine ? machine.getBoundingClientRect().width : 0;
      var sw = sidecar.root.getBoundingClientRect().width || 238;
      desk = Math.max((vw - mw - sw - 34) / 2, 12);
    }
    doc.documentElement.style.setProperty('--sidecar-desk', Math.round(desk) + 'px');
  }

  // A bench line arriving with the tube shut lights the glass for a beat —
  // the machine speaking in its sleep. No lamp whisper on the desktop.
  function flicker() {
    if (!sidecar || reduced || sidecar.root.classList.contains('open')) return;
    sidecar.glass.classList.add('lc-sidecar-wake');
    setTimeout(function () {
      if (sidecar) sidecar.glass.classList.remove('lc-sidecar-wake');
    }, 1400);
  }

  function mount() {
    if (sidecar) return;
    build();
    var link = doc.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'styles/sidecar.css';
    link.setAttribute('data-liberchat', '1');
    doc.head.appendChild(link);

    measure();
    addEventListener('resize', measure);
    addEventListener('load', measure); // the machine's width settles late
    if (doc.fonts && doc.fonts.ready && doc.fonts.ready.then) doc.fonts.ready.then(measure);
    if (typeof ResizeObserver === 'function') {
      var machineEl = doc.querySelector('.machine');
      if (machineEl) new ResizeObserver(measure).observe(machineEl);
    }

    var t = 0;
    (function attempt() {
      t++;
      var ok = engine() && adoptPanel() && watchPanel();
      if (ok) {
        adoptWhisper();
        new MutationObserver(adoptWhisper).observe(doc.body, { childList: true });
        // The engine may have opened for #liberchat before adoption.
        sync();
        if ((location.hash || '').indexOf('liberchat') >= 0) engine().open();
        doc.dispatchEvent(new CustomEvent('liber:sidecar', { detail: { ready: true } }));
        return;
      }
      if (t < 220) setTimeout(attempt, 50); // ~11s; the mount injects lazily
    })();

    doc.addEventListener('liber:prompt', flicker);

    // The keyboard path (desktop has no room-shell registry): Escape
    // closes the open tube first, and the event dies here — the window
    // capture runs before any document-level listener (the room behind
    // the CRT closes on Escape too; two closings on one key is a tangle).
    // With the tube shut, the event passes through untouched.
    addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var panel = doc.getElementById('liberchat-panel');
      if (!panel || panel.hidden) return;
      var eng = engine();
      if (eng) { eng.close(); e.stopImmediatePropagation(); }
    }, true);
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
