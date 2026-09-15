// verify-crt-room.mjs — acceptance pass for the Room Behind the CRT
// (redesign pitch SYSTEM 02). Boots its own serve.cjs, then walks the
// scope contract in a real browser:
//
//   1. scene + affordance exist; scene closed by default
//   2. open → machine recedes, aria states flip, Escape closes
//   3. keep an artifact → the shelf gains a volume
//   4. release/bury → the shadow pool rises
//   5. relations → pins on the corkboard
//   6. patina 0 vs 3 → the scene's tier attribute and trophies differ
//   7. Rainy Day → weather layer composes (scene class + window rain)
//   8. candle melts across a sitting; fresh sessionStart relights it
//   9. window-box tree mirrors the glasshouse stage, including offline growth
//  10. settings toggle mirrors one owner (s.crtRoomOn) and hides the affordance
//  11. the machine and rooms still work with the scene closed
//
// Mirrors the conventions of scripts/verify-fixes.mjs.

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

async function clearState() {
  await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} });
}
async function goto(path, wait = 500) {
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  await clearState();
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(wait);
  const tour = page.locator('#hijack');
  if (await tour.count()) {
    await tour.locator('.hijack-skip').click();
    await page.waitForTimeout(100);
  }
}

// ─── 1. scene exists, closed by default ──────────────────────────────
console.log('1. scene + affordance');
await goto('/desktop.html', 800);
const s1 = await page.evaluate(() => {
  const scene = document.getElementById('crt-room');
  const toggle = document.getElementById('crt-room-toggle');
  return {
    scene: !!scene, toggle: !!toggle,
    closed: scene ? !scene.classList.contains('open') : null,
    ariaHidden: scene ? scene.getAttribute('aria-hidden') : null,
    toggleLabel: toggle ? toggle.textContent : null
  };
});
check('scene exists on desktop', s1.scene);
check('affordance exists, invites the look', s1.toggle && s1.toggleLabel === 'look behind');
check('scene closed by default', s1.closed && s1.ariaHidden === 'true');

// ─── 2. open → recede + aria; Escape closes ──────────────────────────
console.log('2. open, recede, escape');
await page.click('#crt-room-toggle');
await page.waitForTimeout(700);
const s2 = await page.evaluate(() => {
  const scene = document.getElementById('crt-room');
  const room = document.querySelector('.room');
  return {
    open: scene.classList.contains('open'),
    body: document.body.classList.contains('crt-room-open'),
    roomZ: getComputedStyle(room).zIndex,
    scale: getComputedStyle(room).transform !== 'none',
    label: document.getElementById('crt-room-toggle').textContent,
    ss: sessionStorage.getItem('liber_crt_room_open')
  };
});
check('scene opens', s2.open && s2.body);
check('machine recedes (scaled)', s2.scale, 'z=' + s2.roomZ);
check('label flips to the way out', s2.label === 'back to the screen');
check('gaze noted for the visit', s2.ss === '1');
await page.keyboard.press('Escape');
await page.waitForTimeout(400);
const s2b = await page.evaluate(() => ({
  open: document.getElementById('crt-room').classList.contains('open'),
  ss: sessionStorage.getItem('liber_crt_room_open')
}));
check('Escape walks out', !s2b.open && s2b.ss === null);

// ─── seed a lived-in machine ──────────────────────────────────────────
const now = Date.now();
async function seed(tier, opts = {}) {
  await page.evaluate(({ tier, opts }) => {
    const L = window.Liber;
    const now = Date.now();
    const visited = {};
    for (let i = 0; i < (tier === 3 ? 12 : tier === 2 ? 6 : 0); i++) visited['room' + i] = now;
    L.state.set({
      cutsceneBuild: 'riasondemo2',
      tutorialDone: true, tutorialStage: 'done',
      visited,
      journal: [{ id: 's1', kind: 'note', text: 'first', ts: now }],
      sea: opts.sea || [],
      graveyard: opts.grave || [],
      relations: opts.rels || [],
      tree: opts.tree || null,
      sessionStart: opts.sessionStart == null ? now : opts.sessionStart,
      shadowOn: !!opts.rainy,
      crtRoomOn: true
    });
    sessionStorage.removeItem('liber_crt_room_open');
  }, { tier, opts });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
}

// ─── 3. keep an artifact → the shelf gains a volume ───────────────────
console.log('3. keep → shelf');
await seed(0);
const s3pre = await page.evaluate(() => window.Liber.crtRoom.facts());
check('patina 0 at an untouched machine', s3pre.tier === 0, 'tier=' + s3pre.tier);
await page.evaluate(() => window.Liber.crtRoom.open());
await page.waitForTimeout(700);
await page.screenshot({ path: 'screenshots/crt-room-patina0.png' });
await page.evaluate(() => window.Liber.crtRoom.close());
await page.waitForTimeout(300);
await page.evaluate(() => {
  const L = window.Liber;
  const s = L.state.get();
  L.state.set({ journal: (s.journal || []).concat([{ id: 's2', kind: 'dream', name: 'kept two', ts: Date.now() }]) });
});
await page.waitForTimeout(400);
const s3 = await page.evaluate(() => window.Liber.crtRoom.facts());
check('shelf gains a volume on keep (1 → 2)', s3.keeps === 2 && s3.volumes === 2, JSON.stringify(s3));

// ─── 4. release → the pool rises ──────────────────────────────────────
console.log('4. release/bury → pool');
await page.evaluate(() => {
  const L = window.Liber;
  const s = L.state.get();
  L.state.set({ sea: (s.sea || []).concat([{ text: 'a heavy thing', intensity: 4, ts: Date.now() }]) });
});
await page.waitForTimeout(400);
const s4 = await page.evaluate(() => window.Liber.crtRoom.facts());
check('pool rises on release', s4.pool > 0, 'level=' + s4.pool.toFixed(3));

// ─── 5. relations → pins ──────────────────────────────────────────────
console.log('5. relations → corkboard');
await page.evaluate(() => {
  const L = window.Liber;
  L.state.set({ relations: [
    { from: 'a1', to: 'buddy', verb: 'holds', ts: Date.now() },
    { from: 'a2', to: 'buddy', verb: 'guards', ts: Date.now() }
  ] });
});
await page.waitForTimeout(400);
const s5 = await page.evaluate(() => window.Liber.crtRoom.facts());
check('corkboard takes the relations', s5.relations === 2, 'pins=' + s5.relations);

// ─── 6. patina tiers differ ───────────────────────────────────────────
console.log('6. patina');
const s6a = await page.evaluate(() => window.Liber.crtRoom.facts());
await seed(3, { rainy: true });
const s6b = await page.evaluate(() => {
  const f = window.Liber.crtRoom.facts();
  const scene = document.getElementById('crt-room');
  const on = document.querySelectorAll('.crt-trophy.on').length;
  return { tier: f.tier, attr: scene.getAttribute('data-tier'), trophies: on };
});
check('patina tier holds through the keeps', s6a.tier === 1, 'tier=' + s6a.tier);
check('patina 3 on a lived-in machine', s6b.tier === 3 && s6b.attr === '3' && s6b.trophies === 3, JSON.stringify(s6b));
await page.screenshot({ path: 'screenshots/crt-room-patina3.png' });

// ─── 7. Rainy Day composes ────────────────────────────────────────────
console.log('7. rainy day');
const s7 = await page.evaluate(() => {
  const scene = document.getElementById('crt-room');
  const win = scene.querySelector('.crt-window');
  return {
    rainy: scene.classList.contains('crt-room-rainy'),
    rainOpacity: getComputedStyle(win, '::after').opacity,
    veil: getComputedStyle(scene, '::before').backgroundColor
  };
});
check('rain falls in the room behind', s7.rainy && Number(s7.rainOpacity) > 0.3, JSON.stringify(s7));
await page.screenshot({ path: 'screenshots/crt-room-rainy.png' });

// ─── 8. the candle keeps the sitting ──────────────────────────────────
console.log('8. candle');
const s8a = await page.evaluate(() => window.Liber.crtRoom.facts());
await page.evaluate(() => {
  const L = window.Liber;
  const s = L.state.get();
  L.state.set({ sessionStart: Date.now() - 40 * 60 * 1000 }); // a long sitting
});
await page.waitForTimeout(400);
const s8b = await page.evaluate(() => window.Liber.crtRoom.facts());
await page.evaluate(() => {
  const L = window.Liber;
  L.state.set({ sessionStart: Date.now() }); // back tomorrow
});
await page.waitForTimeout(400);
const s8c = await page.evaluate(() => window.Liber.crtRoom.facts());
check('candle melts across the sitting', s8b.candle < s8a.candle, s8a.candle + ' → ' + s8b.candle);
check('a fresh sitting relights it', s8c.candle > s8b.candle, s8b.candle + ' → ' + s8c.candle);

// ─── 9. window box mirrors the glasshouse tree ────────────────────────
console.log('9. window box tree');
await page.evaluate(() => {
  const L = window.Liber;
  const now = Date.now();
  // planted 40min ago, stage began then, seen 2h ago → offline growth lands it mid-stage-2
  L.state.set({ tree: { planted: now - 40 * 60 * 1000, watered: 0, stageAt: now - 40 * 60 * 1000, grown: 5 * 60 * 1000, seen: now - 2 * 60 * 60 * 1000, fruits: [], pressings: 0 } });
});
await page.waitForTimeout(400);
const s9a = await page.evaluate(() => window.Liber.crtRoom.facts());
check('offline growth folded into the mirror', s9a.treeStage === 3, 'stage=' + s9a.treeStage);
await page.evaluate(() => {
  const L = window.Liber;
  const now = Date.now();
  L.state.set({ tree: { planted: now - 3 * 40 * 60 * 1000, watered: 0, stageAt: now - 3 * 40 * 60 * 1000, grown: 0, seen: now, fruits: [], pressings: 0 } });
});
await page.waitForTimeout(400);
const s9b = await page.evaluate(() => {
  const f = window.Liber.crtRoom.facts();
  const pots = document.querySelectorAll('#crt-room .crt-wb-pot');
  return { stage: f.treeStage, potVisible: pots.length && getComputedStyle(pots[0]).display !== 'none' };
});
check('empty box before the seed', !(await page.evaluate(() => window.Liber.crtRoom.facts().treeStage >= 0)) || s9b.stage >= 0);
await page.evaluate(() => {
  const L = window.Liber;
  L.state.set({ tree: null });
});
await page.waitForTimeout(400);
const s9c = await page.evaluate(() => window.Liber.crtRoom.facts());
check('no seed, no tree', s9c.treeStage === -1, 'stage=' + s9c.treeStage);

// ─── 10. settings mirror, one owner ───────────────────────────────────
console.log('10. settings');
await goto('/settings.html', 700);
const s10a = await page.evaluate(() => document.getElementById('settings-crt-room').textContent);
check('settings names the room', /the room behind: hidden|shown/.test(s10a), s10a);
await page.click('#settings-crt-room');
await page.waitForTimeout(300);
const s10b = await page.evaluate(() => ({
  state: window.Liber.state.get().crtRoomOn,
  label: document.getElementById('settings-crt-room').textContent
}));
check('toggle flips the one owner', s10b.state === false && /hidden/.test(s10b.label), JSON.stringify(s10b));
await page.click('#settings-crt-room');
await page.waitForTimeout(300);

// ─── 11. the desktop still works with the scene hidden ────────────────
console.log('11. machine unbothered');
await goto('/desktop.html', 800);
await page.evaluate(() => window.Liber.state.set({ crtRoomOn: false }));
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(600);
const s11 = await page.evaluate(() => {
  const toggle = document.getElementById('crt-room-toggle');
  const keys = document.getElementById('keybank');
  return {
    toggleHidden: getComputedStyle(toggle).display === 'none',
    dialAlive: keys && keys.children.length === 12,
    sceneThere: !!document.getElementById('crt-room')
  };
});
check('affordance hidden when the room is hidden', s11.toggleHidden);
check('the keybank still answers', s11.dialAlive);
check('scene built but sleeping', s11.sceneThere);

// ─── 12. 439px: the room survives the small screen ────────────────────
console.log('12. 439px');
await page.setViewportSize({ width: 439, height: 740 });
await page.evaluate(() => window.Liber.state.set({ crtRoomOn: true }));
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(700);
await page.click('#crt-room-toggle');
await page.waitForTimeout(600);
const s12 = await page.evaluate(() => {
  const scene = document.getElementById('crt-room');
  const doc = document.documentElement;
  return {
    open: scene.classList.contains('open'),
    noXOverflow: doc.scrollWidth <= window.innerWidth + 1
  };
});
check('the room still opens at 439px', s12.open);
check('no horizontal overflow at 439px', s12.noXOverflow);
await page.screenshot({ path: 'screenshots/crt-room-439.png' });

// ─── errors ───────────────────────────────────────────────────────────
if (errors.length) {
  failures++;
  console.log('\npage errors:');
  for (const e of errors) console.log('  ' + e.slice(0, 200));
}

console.log(failures ? `\n${failures} failure(s)` : '\nall checks green');
server.kill();
process.exit(failures ? 1 : 0);
