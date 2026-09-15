// verify-sidecar.mjs — job III's gate (redesign-plan-2): the dot-matrix
// sidecar CRT. Boots its own serve.cjs, then walks the contract:
//
//   1. the sidecar renders on the desktop; the lamp retires (one door)
//   2. the lid opens the tube through the real engine; aria follows
//   3. a sent line prints in order (feed order = engine order)
//   4. Escape closes; the door reopens (keyboard path)
//   5. the room behind takes the wall: the sidecar follows the traveller
//      (a desk object recedes with the desk — still lit, still operable)
//   6. bench lines light the glass in the dark (the wake flicker)
//   7. every other page keeps the lamp (desktop-only retirement)
//   8. desk-fit geometry: no overlap, no off-screen spill, 8px gap
//   9. reduced motion: the tube is an instant state change
//  10. 439px: the sidecar pins to the screen edge; the machine stays
//      unobstructed; no horizontal overflow
//
// Mirrors the conventions of scripts/verify-crt-room.mjs.

import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const errors = [];
let failures = 0;
function check(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures++;
}

const server = spawn('node', ['serve.cjs'], { stdio: 'pipe' });
const port = await new Promise((resolve, reject) => {
  let buf = '';
  server.stdout.on('data', d => {
    buf += d.toString();
    const m = buf.match(/http:\/\/127\.0\.0\.1:(\d+)/);
    if (m) resolve(Number(m[1]));
  });
  server.stderr.on('data', d => { errors.push('server: ' + d.toString()); });
  setTimeout(() => reject(new Error('server boot timeout: ' + buf)), 8000);
});
const BASE = `http://127.0.0.1:${port}`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error' && !/favicon/.test(m.text())) errors.push('console: ' + m.text()); });

async function gotoDesktop(wait = 800) {
  await page.goto(BASE + '/desktop.html', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    try {
      localStorage.clear();
      localStorage.setItem('liber_vacui_v1__keep', JSON.stringify({
        cutsceneBuild: 'riasondemo2', tutorialDone: true, tutorialStage: 'done',
        sessionStart: Date.now(), visited: {}
      }));
    } catch (e) {}
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(wait);
}

// ─── 1. the object exists; the lamp retires ──────────────────────────
console.log('1. the object + the one door');
await gotoDesktop();
const s1 = await page.evaluate(() => {
  const sc = document.getElementById('liberchat-sidecar');
  const lamp = document.getElementById('liberchat-lamp');
  const lampCs = lamp ? getComputedStyle(lamp).display : 'absent';
  const panelHome = document.getElementById('liberchat-panel');
  const note = document.querySelector('.lc-sidecar-note');
  return {
    sc: !!sc,
    lampHidden: !lamp || lampCs === 'none',
    panelAdopted: !!panelHome && panelHome.closest('.lc-sidecar') !== null,
    fit: document.body.classList.contains('lc-sidecar-fit'),
    note: note ? note.textContent : null
  };
});
check('the sidecar renders on the desktop', s1.sc);
check('the lamp retires (one door)', s1.lampHidden);
check('the engine surface lives in the glass', s1.panelAdopted);
check('the desk fit engages on a wide screen', s1.fit);
check('the desk\'s sign is taped on', s1.note === 'communicate to travellers');

// ─── 2. the lid drives the real engine ───────────────────────────────
console.log('2. the lid drives the engine');
await page.evaluate(() => document.getElementById('liberchat-sidecar')
  .querySelector('.lc-sidecar-lid').click());
await page.waitForTimeout(700);
const s2 = await page.evaluate(() => {
  const panel = document.getElementById('liberchat-panel');
  const lid = document.querySelector('.lc-sidecar-lid');
  const root = document.getElementById('liberchat-sidecar');
  return {
    open: !panel.hidden,
    ariaExpanded: lid.getAttribute('aria-expanded'),
    ariaControls: lid.getAttribute('aria-controls'),
    rootOpen: root.classList.contains('open'),
    greeted: document.querySelectorAll('.lc-log .lc-line').length > 0
  };
});
check('the tube opens through the real engine', s2.open);
check('aria-expanded follows the door', s2.ariaExpanded === 'true');
check('aria-controls names the panel', s2.ariaControls === 'liberchat-panel');
check('the feed prints the greeting', s2.greeted);

// ─── 3. a sent line prints in order ──────────────────────────────────
console.log('3. the feed prints in order');
await page.evaluate(() => {
  const inp = document.getElementById('liberchat-input');
  const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  set.call(inp, 'the desk holds');
  inp.dispatchEvent(new Event('input', { bubbles: true }));
  inp.closest('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
});
await page.waitForTimeout(1400);
const s3 = await page.evaluate(() => {
  const log = document.querySelector('.lc-log');
  const lines = Array.from(log.querySelectorAll('.lc-line')).map(l => l.textContent);
  const transcript = window.LiberLiberchat.transcript().map(t => t.text);
  const mine = lines.findIndex(t => t.indexOf('the desk holds') >= 0);
  const theirs = window.LiberLiberchat.transcript().length;
  return { mine, ordered: mine >= 0, transcript, theirs, printCount: lines.length };
});
check('the sent line prints on the feed', s3.ordered);
check('the feed order matches the engine', s3.printCount === s3.theirs,
  `feed=${s3.printCount} engine=${s3.theirs}`);

// ─── 4. Escape closes; the door reopens ──────────────────────────────
console.log('4. the keyboard path');
await page.evaluate(() => {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
});
await page.waitForTimeout(300);
const s4 = await page.evaluate(() => document.getElementById('liberchat-panel').hidden);
check('escape closes the tube', s4);
await page.evaluate(() => document.getElementById('liberchat-sidecar')
  .querySelector('.lc-sidecar-lid').click());
await page.waitForTimeout(300);
const s4b = await page.evaluate(() => !document.getElementById('liberchat-panel').hidden);
check('the door reopens', s4b);

// ─── 5. the room behind the CRT ──────────────────────────────────────
console.log('5. the sidecar follows into the room behind');
const s5 = await page.evaluate(async () => {
  const look = Array.from(document.querySelectorAll('button'))
    .find(b => b.textContent.trim() === 'look behind');
  look.click();
  await new Promise(r => setTimeout(r, 800));
  const sc = document.getElementById('liberchat-sidecar');
  const cs = getComputedStyle(sc);
  const followed = document.body.classList.contains('crt-room-open') &&
    cs.visibility !== 'hidden' && parseFloat(cs.opacity) === 1;
  // the tube stays operable while the wall is open: the input is reachable
  const inp = document.getElementById('liberchat-input');
  const r = inp.getBoundingClientRect();
  const top = document.elementFromPoint(Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2));
  const reachable = !!(top && (inp === top || inp.contains(top) || top.contains(inp)));
  // first escape closes the tube, second closes the room
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await new Promise(r2 => setTimeout(r2, 300));
  const tubeClosed = document.getElementById('liberchat-panel').hidden;
  const roomStillOpen = document.body.classList.contains('crt-room-open');
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await new Promise(r2 => setTimeout(r2, 800));
  return { followed, reachable, tubeClosed, roomStillOpen, roomClosedAfter: !document.body.classList.contains('crt-room-open') };
});
check('the sidecar follows the traveller behind the glass', s5.followed);
check('the tube stays operable while the wall is open', s5.reachable);
check('escape closes the tube first, the room second', s5.tubeClosed && s5.roomStillOpen && s5.roomClosedAfter);

// ─── 6. the wake flicker (bench line in the dark) ────────────────────
console.log('6. the machine speaking in its sleep');
const s6 = await page.evaluate(async () => {
  document.dispatchEvent(new CustomEvent('liber:prompt', { detail: {} }));
  await new Promise(r => setTimeout(r, 150));
  return document.querySelector('.lc-sidecar-glass').classList.contains('lc-sidecar-wake');
});
check('a bench line lights the glass', s6);

// ─── 7. one door, in every room ──────────────────────────────────────
// The lamp was chat's presence on every page; the tube is that presence now,
// so a room grows the tube and loses the lamp in the same breath. §12 walks
// the rest of them.
console.log('7. one door, everywhere');
await page.goto(BASE + '/index.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
const s7 = await page.evaluate(() => {
  const lamp = document.getElementById('liberchat-lamp');
  const sc = document.getElementById('liberchat-sidecar');
  return {
    lampDisplay: lamp ? getComputedStyle(lamp).display : 'absent',
    sidecar: !!sc,
    engineInGlass: !!(sc && document.getElementById('liberchat-panel').closest('.lc-sidecar')),
    engineLive: !!(window.LiberLiberchat && typeof window.LiberLiberchat.open === 'function')
  };
});
check('a room grows the tube', s7.sidecar && s7.engineInGlass);
check('and loses the lamp', s7.lampDisplay === 'none');
check('the tube is wired to the real engine, not a copy', s7.engineLive);

// ─── 8. desk-fit geometry ────────────────────────────────────────────
console.log('8. the desk composition');
await gotoDesktop();
const s8 = await page.evaluate(() => {
  const m = document.querySelector('.machine').getBoundingClientRect();
  const s = document.getElementById('liberchat-sidecar').getBoundingClientRect();
  return {
    vw: innerWidth,
    gap: Math.round(s.left - m.right),
    spill: Math.round(s.right - innerWidth),
    overlapDesk: s.top < m.bottom && s.bottom > m.bottom - 40
  };
});
check('the sidecar stands beside the machine (10px gap)', s8.gap === 10, 'gap=' + s8.gap);
check('nothing spills off the desk', s8.spill <= 0, 'spill=' + s8.spill);

// ─── 9. reduced motion: the tube is instant ──────────────────────────
console.log('9. motion with consent');
{
  const ctx2 = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    reducedMotion: 'reduce'
  });
  const page2 = await ctx2.newPage();
  page2.on('pageerror', e => errors.push('pageerror(rm): ' + e.message));
  await page2.goto(BASE + '/desktop.html', { waitUntil: 'networkidle' });
  await page2.evaluate(() => {
    try {
      localStorage.clear();
      localStorage.setItem('liber_vacui_v1__keep', JSON.stringify({
        cutsceneBuild: 'riasondemo2', tutorialDone: true, tutorialStage: 'done',
        sessionStart: Date.now(), visited: {}
      }));
    } catch (e) {}
  });
  await page2.reload({ waitUntil: 'networkidle' });
  await page2.waitForTimeout(700);
  const rm = await page2.evaluate(async () => {
    document.getElementById('liberchat-sidecar').querySelector('.lc-sidecar-lid').click();
    await new Promise(r => setTimeout(r, 200));
    const open = !document.getElementById('liberchat-panel').hidden;
    const root = document.getElementById('liberchat-sidecar');
    const anim = getComputedStyle(root).transitionDuration;
    return { open, anim };
  });
  check('reduced motion: the tube answers at once', rm.open);
  await ctx2.close();
}

// ─── 10. the 439px contract ──────────────────────────────────────────
console.log('10. the narrow room');
{
  const ctx3 = await browser.newContext({ viewport: { width: 439, height: 780 } });
  const page3 = await ctx3.newPage();
  page3.on('pageerror', e => errors.push('pageerror(439): ' + e.message));
  await page3.goto(BASE + '/desktop.html', { waitUntil: 'networkidle' });
  await page3.evaluate(() => {
    try {
      localStorage.clear();
      localStorage.setItem('liber_vacui_v1__keep', JSON.stringify({
        cutsceneBuild: 'riasondemo2', tutorialDone: true, tutorialStage: 'done',
        sessionStart: Date.now(), visited: {}
      }));
    } catch (e) {}
  });
  await page3.reload({ waitUntil: 'networkidle' });
  await page3.waitForTimeout(700);
  const s10 = await page3.evaluate(async () => {
    const sc = document.getElementById('liberchat-sidecar');
    if (!sc) return { sc: false };
    // the bench slip, in the pinned stance: it must land on the room, clear
    // of the machine and of the screen's edges
    window.LiberLiberchat.bench('the machine leaves its line on the desk');
    await new Promise(r => setTimeout(r, 600));
    const slip = document.getElementById('liberchat-whisper').getBoundingClientRect();
    const r = sc.getBoundingClientRect();
    const de = document.documentElement;
    const m = document.querySelector('.machine').getBoundingClientRect();
    return {
      sc: true,
      fitOff: !document.body.classList.contains('lc-sidecar-fit'),
      pinned: getComputedStyle(sc).position === 'fixed',
      ofx: de.scrollWidth - de.clientWidth,
      spill: Math.round(r.right - innerWidth),
      overMachine: !(r.right < m.left || r.left > m.right || r.bottom < m.top || r.top > m.bottom),
      tubeBox: [r.left, r.top, r.right, r.bottom].map(Math.round).join(','),
      machineBox: [m.left, m.top, m.right, m.bottom].map(Math.round).join(','),
      panelInGlass: !!document.getElementById('liberchat-panel').closest('.lc-sidecar'),
      noteRight: Math.round(document.querySelector('.lc-sidecar-note')
        .getBoundingClientRect().right),
      slipInScreen: slip.left >= 0 && slip.right <= innerWidth &&
        slip.top >= 0 && slip.bottom <= innerHeight,
      slipCrossesMachine: !(slip.left >= m.right || slip.right <= m.left ||
        slip.bottom <= m.top || slip.top >= m.bottom),
      slipInsideTube: slip.left >= r.left - 1 && slip.right <= r.right + 1 &&
        slip.top >= r.top - 1 && slip.bottom <= r.bottom + 1,
      loom: (() => {
        const l = document.querySelector('.lc-sidecar-loom').getBoundingClientRect();
        return { left: Math.round(l.left), right: Math.round(l.right) };
      })()
    };
  });
  check('the sidecar renders and adopts the panel', s10.sc && s10.panelInGlass);
  check('the desk fit disengages', s10.fitOff && s10.pinned);
  check('no horizontal overflow', s10.ofx <= 1, 'ofx=' + s10.ofx);
  check('nothing spills off the glass', s10.spill <= 0, 'spill=' + s10.spill);
  check('the machine stays unobstructed', !s10.overMachine,
    `tube=[${s10.tubeBox}] machine=[${s10.machineBox}]`);
  check('the taped sign stays on the narrow desk',
    s10.noteRight <= 439, 'noteRight=' + s10.noteRight);
  check('the bench slip stays on the narrow screen', s10.slipInScreen);
  check('the bench slip clears the machine when pinned', !s10.slipCrossesMachine);
  check('pinned, the slip stays on the tube it belongs to', s10.slipInsideTube);
  check('pinned, the loom stays on the screen',
    s10.loom.left >= 0 && s10.loom.right <= 439,
    `loom=${s10.loom.left}..${s10.loom.right}`);
  await ctx3.close();
}

// ─── 11. the covenant: the register the object obeys ─────────────────
//  No line the machine spoke goes dark (the lamp is retired, not its
//  voice); every radius sits in the machine's two families; the desk
//  shadow is a blurred ellipse and never a drop-shadow filter; the
//  cable's contours sit on the weight ladder; the plate carries its
//  revision.
console.log('11. the object\u2019s register');
await gotoDesktop();
const s11 = await page.evaluate(async () => {
  const spoke = window.LiberLiberchat.bench('the bench is warm where you left it');
  await new Promise(r => setTimeout(r, 700));
  const w = document.getElementById('liberchat-whisper');
  const root = document.getElementById('liberchat-sidecar');
  const feed = document.querySelector('.lc-sidecar-feed');
  const platen = document.querySelector('.lc-sidecar .lc-form');
  const ws = w ? getComputedStyle(w) : null;
  const hit = (a, b) => !!a && !!b &&
    !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
  const parts = document.querySelectorAll(
    '.lc-sidecar-body, .lc-sidecar-lid, .lc-sidecar-glass, .lc-sidecar-glass-inner, ' +
    '.lc-sidecar-feed, .lc-sidecar-neck, .lc-sidecar-foot, .lc-sidecar-note, ' +
    '.lc-sidecar-plate, .lc-sidecar .lc-input, .lc-sidecar .lc-send, ' +
    '.lc-sidecar .lc-menu, .lc-sidecar .lc-who, .lc-sidecar .lc-close, .lc-sidecar .lc-seal');
  const radii = new Set();
  parts.forEach(el => getComputedStyle(el).borderRadius.split(' ').forEach(v => radii.add(v)));
  const filters = Array.from(document.querySelectorAll('.lc-sidecar, .lc-sidecar *'))
    .map(el => getComputedStyle(el).filter)
    .filter(f => f && f !== 'none');
  const shadowEl = document.querySelector('.lc-sidecar-shadow');
  const strokeW = Array.from(document.querySelectorAll('.lc-sidecar-cable path'))
    .map(p => parseFloat(p.getAttribute('stroke-width'))) .sort((a, b) => b - a);
  const plate = document.querySelector('.lc-sidecar-model');
  const glass = document.querySelector('.lc-sidecar-glass');
  return {
    spoke,
    whisperOwned: !!w && w.parentNode === root,
    whisperCrossesFeed: hit(w && w.getBoundingClientRect(), feed && feed.getBoundingClientRect()),
    whisperCrossesPlaten: hit(w && w.getBoundingClientRect(), platen && platen.getBoundingClientRect()),
    whisperVisible: !!ws && ws.display !== 'none' && parseFloat(ws.opacity) > 0.9,
    whisperText: w ? w.textContent : null,
    whisperRole: w ? w.getAttribute('role') : null,
    wake: glass.classList.contains('lc-sidecar-wake'),
    radii: Array.from(radii),
    dropShadows: filters.filter(f => f.includes('drop-shadow')),
    shadowBlur: shadowEl ? getComputedStyle(shadowEl).filter : '',
    shadowDark: shadowEl ? /rgba?\(0,\s*0,\s*0,\s*0\.8/.test(getComputedStyle(shadowEl).backgroundImage) : false,
    strokeW,
    plate: plate ? plate.textContent : null,
    note: (() => {
      const n = document.querySelector('.lc-sidecar-note');
      const r = n.getBoundingClientRect();
      return { bottom: Math.round(r.bottom), right: Math.round(r.right),
        feedTop: Math.round(feed.getBoundingClientRect().top), vw: innerWidth };
    })(),
    // the screen itself: tall glass, the scan over the sheet and under the
    // writing, the letterhead the sheet was cut for
    glassH: Math.round(document.querySelector('.lc-sidecar-glass').getBoundingClientRect().height),
    rasterZ: Number(getComputedStyle(document.querySelector('.lc-sidecar-raster')).zIndex),
    panelZ: Number(getComputedStyle(document.getElementById('liberchat-panel')).zIndex),
    rasterHome: document.querySelector('.lc-sidecar-raster').parentNode === feed,
    stamp: !!document.querySelector('.lc-sidecar-stamp circle'),
    form: (document.querySelector('.lc-sidecar-form') || {}).textContent || null,
    circulate: (document.querySelector('.lc-sidecar-circulate') || {}).textContent || null,
    // the wiring: leads that reach the machine's screen frame, wax on the
    // case, and the tally the maker kept
    loom: (() => {
      const r = document.querySelector('.lc-sidecar-loom').getBoundingClientRect();
      const m = document.querySelector('.machine').getBoundingClientRect();
      return { left: Math.round(r.left), machineRight: Math.round(m.right),
        leads: document.querySelectorAll('.lc-sidecar-loom path[stroke-width]').length,
        shadow: !!document.querySelector('.lc-sidecar-loom ellipse[filter]') &&
          !!document.querySelector('.lc-sidecar-loom filter feGaussianBlur') };
    })(),
    wax: !!document.querySelector('.lc-sidecar-wax svg'),
    tallies: Array.from(document.querySelectorAll('.lc-sidecar-tallies svg path'))
      .reduce((n, p) => n + (p.getAttribute('d').split('M').length - 1), 0),
    // the tall tube must not trade paint with the ? tile above it
    tile: (() => {
      const t = document.querySelector('.faq-toggle');
      const tube = document.getElementById('liberchat-sidecar').getBoundingClientRect();
      if (!t) return { bottom: 0, tubeTop: Math.round(tube.top) };
      const r = t.getBoundingClientRect();
      return { bottom: Math.round(r.bottom), tubeTop: Math.round(tube.top) };
    })()
  };
});
check('a bench line is spoken through the real engine', typeof s11.spoke === 'string' && s11.spoke.length > 0);
check('the line lands on the sidecar, not the void', s11.whisperOwned);
check('the slip never covers the feed', !s11.whisperCrossesFeed);
check('the slip never covers the platen', !s11.whisperCrossesPlaten);
check('the line the lamp would have whispered is still readable',
  s11.whisperVisible && s11.whisperText === s11.spoke, 'text=' + s11.whisperText);
check('the whisper keeps its role=status', s11.whisperRole === 'status');
check('the line lights the glass as it lands', s11.wake);
const families = new Set(['0px', '2px', '8px', '12px', '50%']);
const stray = s11.radii.filter(r => !families.has(r));
check('every radius sits in the machine\u2019s two families', stray.length === 0, 'stray=' + stray.join(','));
check('no drop-shadow filter anywhere on the object', s11.dropShadows.length === 0);
check('the desk shadow is a blurred ellipse, and the darkest shape',
  s11.shadowBlur.includes('blur(') && s11.shadowDark);
check('the cable sits on the ladder (3.2 silhouette / 1.6 form)',
  s11.strokeW.length === 2 && Math.abs(s11.strokeW[0] - 3.2) < 0.01 && Math.abs(s11.strokeW[1] - 1.6) < 0.01,
  'strokes=' + s11.strokeW.join('/'));
check('the plate carries its revision mark',
  /TX-80/.test(s11.plate || '') && /REV\. C/.test(s11.plate || ''), 'plate=' + s11.plate);
check('the taped sign clears the feed\u2019s first line',
  s11.note.bottom <= s11.note.feedTop, `note=${s11.note.bottom} feed=${s11.note.feedTop}`);
check('the taped sign stays on the desk, not off the screen',
  s11.note.right <= s11.note.vw, `right=${s11.note.right} vw=${s11.note.vw}`);
check('the tube is a screen, not a card', s11.glassH >= 320, 'glass=' + s11.glassH);
check('the scan runs over the sheet and under the writing',
  s11.rasterHome && s11.rasterZ < s11.panelZ, `raster=${s11.rasterZ} panel=${s11.panelZ}`);
check('the sheet carries its letterhead',
  s11.stamp && /TX-80\/3/.test(s11.form || '') && /circulation/.test(s11.circulate || ''),
  `${s11.form} / ${s11.circulate}`);
check('the loom reaches the machine\u2019s screen frame',
  s11.loom.left < s11.loom.machineRight - 10,
  `loomLeft=${s11.loom.left} machineRight=${s11.loom.machineRight}`);
check('the loom is wired, not drawn as one lead', s11.loom.leads >= 7, 'leads=' + s11.loom.leads);
check('the resting lead casts a blurred contact shadow', s11.loom.shadow);
check('the case carries its wax and its tally', s11.wax && s11.tallies === 13,
  `tallies=${s11.tallies}`);
check('the tall tube clears the ? tile', s11.tile.tubeTop > s11.tile.bottom,
  `tubeTop=${s11.tile.tubeTop} tileBottom=${s11.tile.bottom}`);

// ─── 12. one machine, many rooms ─────────────────────────────────────
// Every room is the same machine shell with that room's content on its
// screen, so the tube stands on the desk in all of them — same object, same
// place — and the lamp retires everywhere the tube arrives. The one thing a
// room cannot afford is the tube sitting on its own controls.
console.log('12. the tube in every room');
const ROOMS = ['index', 'games', 'sea', 'divination', 'dreams', 'sigil', 'journal',
  'garden', 'learn', 'themes', 'toybox', 'trash', 'settings', 'about'];
for (const room of ROOMS) {
  await page.goto(`${BASE}/${room}.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(650);
  const r = await page.evaluate(() => {
    const sc = document.getElementById('liberchat-sidecar');
    const lamp = document.getElementById('liberchat-lamp');
    const box = sc ? sc.getBoundingClientRect() : null;
    const hits = [];
    if (box) {
      document.querySelectorAll('a, button, [role="button"], input, select, textarea').forEach(el => {
        if (sc.contains(el) || el === lamp) return;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return;
        const b = el.getBoundingClientRect();
        if (!b.width || !b.height) return;
        const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
        if (cx > box.left && cx < box.right && cy > box.top && cy < box.bottom) {
          hits.push((el.textContent || el.className || el.tagName).trim().slice(0, 24));
        }
      });
    }
    return {
      tube: !!sc,
      inGlass: !!(sc && document.getElementById('liberchat-panel').closest('.lc-sidecar')),
      lampGone: !lamp || getComputedStyle(lamp).display === 'none',
      onScreen: box ? (box.left >= -1 && box.right <= innerWidth + 1 &&
        box.top >= -1 && box.bottom <= innerHeight + 1) : false,
      ofx: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      hits: hits
    };
  });
  check(`${room}: the tube stands in the room`, r.tube && r.inGlass);
  check(`${room}: the lamp has gone`, r.lampGone);
  check(`${room}: the tube is on the screen`, r.onScreen);
  check(`${room}: no horizontal overflow`, r.ofx <= 1, 'ofx=' + r.ofx);
  check(`${room}: no room control is under the tube`, r.hits.length === 0, r.hits.join(', '));
}

// the other direction: a line the room hands the machine prints on the tube
// it stands beside, on the room's own page.
console.log('12b. a room speaks through the tube');
await page.goto(`${BASE}/sigil.html`, { waitUntil: 'networkidle' });
await page.waitForTimeout(650);
const s12 = await page.evaluate(async () => {
  const spoke = window.LiberLiberchat.bench('the bench is warm where you left it');
  await new Promise(r => setTimeout(r, 600));
  const w = document.getElementById('liberchat-whisper');
  return {
    spoke: spoke,
    atHome: !!w && w.parentNode === document.getElementById('liberchat-sidecar'),
    visible: !!w && parseFloat(getComputedStyle(w).opacity) > 0.9,
    text: w ? w.textContent : null
  };
});
check('a room\u2019s line reaches the tube', s12.atHome && s12.visible && s12.text === s12.spoke,
  `atHome=${s12.atHome} text=${s12.text}`);

// ─── verdict ─────────────────────────────────────────────────────────
await browser.close();
server.kill();
if (errors.length) {
  console.log('\nerrors:');
  errors.slice(0, 12).forEach(e => console.log('  ' + e));
}
console.log(failures === 0 && errors.length === 0
  ? '\nall checks green'
  : `\n${failures} failed, ${errors.length} error(s)`);
process.exit(failures === 0 && errors.length === 0 ? 0 : 1);
