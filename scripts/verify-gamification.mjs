// verify-gamification.mjs — WS5 mechanics 1–6 (docs/gamification.md).
// Boots its own serve.cjs and asserts state-threshold → class/voice at the
// project's 1280×800 size. Anti-goal guards included: absence must never
// change the room, suggestions must dismiss forever, ambient prompts must
// stay capped, seeded and non-repeating.
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

async function goto(path, wait = 500) {
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.clear() } catch (e) {} });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(wait);
  // in-page test helpers (page context cannot see node scope)
  await page.evaluate(() => {
    window.__art = (n) => Array.from({ length: n }, (_, i) => ({ id: 'div-' + i, name: 'card ' + i, key: 'a fragment' }));
    window.__rel = (arts, n) => arts.slice(0, n).map(a => ({ from: a.id, verb: 'protects', to: 'sigil', ts: Date.now() }));
  });
}

const SIGIL_BITMAP = `(() => { const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 32, 32); return c.toDataURL(); })()`;

const machineClasses = () => page.evaluate(() => document.querySelector('.machine').className);

// ─── mechanic 2: patina — return rewards, not streaks ──────────────────
console.log('patina — presence accumulates, absence changes nothing')
await goto('/desktop.html', 700);
// threshold 1: visits+artifacts >= 2 — the timestamps are 100 days old on purpose
await page.evaluate(() => {
  const vs = {};
  for (let i = 0; i < 1; i++) vs['v' + i] = Date.now() - 100 * 24 * 3600 * 1000;
  const c = document.createElement('canvas'); c.width = c.height = 32;
  const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 32, 32);
  window.Liber.state.set({
    visited: vs,
    sigils: [{ id: 'sigil-1', intention: 'a held breath', bitmap: c.toDataURL() }],
    divination: [{ id: 'div-0', name: 'card 0', key: 'a fragment' }],
  });
});
await page.waitForTimeout(300);
let cls = await machineClasses();
check('visits+artifacts >= 2 → patina-1 (100-day-old timestamps still count)', cls.includes('patina-1') && !cls.includes('patina-2'), String(cls.match(/patina-\d+/g)));
await page.evaluate(() => {
  const vs = {};
  for (let i = 0; i < 3; i++) vs['v' + i] = Date.now() - 100 * 24 * 3600 * 1000;
  window.Liber.state.set({ visited: vs, divination: window.__art(3) });
});
await page.waitForTimeout(300);
cls = await machineClasses();
check('visits+artifacts >= 6 → patina-2 (3 visits + 3 artifacts)', cls.includes('patina-2') && !cls.includes('patina-3'), String(cls.match(/patina-\d+/g)));
await page.evaluate(() => {
  const vs = {};
  for (let i = 0; i < 6; i++) vs['v' + i] = Date.now();
  window.Liber.state.set({ visited: vs, divination: window.__art(6) });
});
await page.waitForTimeout(300);
cls = await machineClasses();
check('visits+artifacts >= 12 → patina-3 (6 visits + 6 artifacts)', cls.includes('patina-3'), String(cls.match(/patina-\d+/g)));
const carveFilter = await page.evaluate(() => getComputedStyle(document.querySelector('.carving[data-id="stone"]')).filter);
check('patina-3 etches the carvings (static filter, not animated)', /sepia/.test(carveFilter), carveFilter);

// ─── mechanic 4: the cohort becomes louder — overlay resolution steps ───
console.log('cohort louder — overlay resolution + status voice + prompt intimacy')
await goto('/desktop.html', 700);
await page.evaluate(() => {
  const c = document.createElement('canvas'); c.width = c.height = 32;
  const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 32, 32);
  window.Liber.state.set({
    sigils: [{ id: 'sigil-1', intention: 'a held breath', bitmap: c.toDataURL() }],
    divination: window.__art(1),
  });
});
await page.waitForTimeout(300);
const baseOp = await page.evaluate(() => parseFloat(getComputedStyle(document.getElementById('sigil-overlay-img')).opacity));
cls = await machineClasses();
check('artifacts+relations < 2 → no cohort class, overlay at base 0.08', !/cohort-\d/.test(cls) && Math.abs(baseOp - 0.08) < 0.001, `op=${baseOp} ${String(cls.match(/cohort-\d+/g))}`);
await page.evaluate(() => {
  window.Liber.state.set({
    divination: window.__art(2),
    relations: window.__rel(window.__art(2), 2),
  });
});
await page.waitForTimeout(300);
const midOp = await page.evaluate(() => parseFloat(getComputedStyle(document.getElementById('sigil-overlay-img')).opacity));
cls = await machineClasses();
check('artifacts+relations >= 2 → cohort-1, overlay resolution steps up', cls.includes('cohort-1') && midOp > baseOp, `op=${midOp} ${String(cls.match(/cohort-\d+/g))}`);
await page.evaluate(() => {
  window.Liber.state.set({
    divination: window.__art(10),
    relations: window.__rel(window.__art(10), 2),
  });
});
await page.waitForTimeout(300);
const highOp = await page.evaluate(() => parseFloat(getComputedStyle(document.getElementById('sigil-overlay-img')).opacity));
cls = await machineClasses();
check('artifacts+relations >= 12 → cohort-3, overlay brightest', cls.includes('cohort-3') && highOp > midOp, `op=${highOp} ${String(cls.match(/cohort-\d+/g))}`);

// status line: cohort phrase joins the rotation only past tier 1
const poolLow = await page.evaluate(() => {
  window.Liber.state.set({ relations: [], divination: window.__art(1) });
  return window.Liber.statusLine.pool();
});
check('low cohort tier: no cohort-voiced phrase in rotation', poolLow.length === 4 && poolLow.every(p => !/cohort/i.test(p)), poolLow.join(' | '));
const poolUp = await page.evaluate(() => {
  window.Liber.state.set({
    divination: window.__art(2),
    relations: window.__rel(window.__art(2), 2),
  });
  return window.Liber.statusLine.pool();
});
check('cohort tier >= 1: one cohort-voiced phrase joins the rotation', poolUp.length === 5 && /cohort/i.test(poolUp[4]), poolUp.join(' | '));
const voice = await page.evaluate(async () => {
  for (let i = 0; i < 12; i++) {
    window.Liber.statusLine.cycle();
    await new Promise(r => setTimeout(r, 500));
    const el = document.querySelector('.status-phrase');
    if (el.classList.contains('cohort-voice')) return { found: true, text: el.textContent, cls: el.className };
  }
  return { found: false, text: document.querySelector('.status-phrase').textContent };
});
check('cohort phrase displays with cohort-voice styling', voice.found && /cohort/i.test(voice.text), JSON.stringify(voice));

// prompt engine: intimate templates gated by the same tier
const intimacy = await page.evaluate(() => {
  const L = window.Liber;
  const pick = () => {
    const ids = [];
    for (const art of L.state.get().divination) {
      const p = L.prompts.compose({ from: art.id, verb: 'reminds of tuesdays' });
      if (p) ids.push(p.templateId);
    }
    return ids;
  };
  const atLow = pick();
  L.state.set({ divination: window.__art(4), relations: window.__rel(window.__art(4), 2) });
  const atHigh = pick();
  return { atLow, atHigh };
});
check('low tier: no intimate template ever picked', intimacy.atLow.every(id => !id.startsWith('any-intimate')), intimacy.atLow.join(','));
check('tier >= 2: intimate templates enter the pool', intimacy.atHigh.some(id => id.startsWith('any-intimate')), intimacy.atHigh.join(','));

// ─── mechanic 3: competence visible — relation edges thicken ───────────
console.log('competence — constellation edges thicken with relation count')
const edges = await page.evaluate(() => {
  window.Liber.state.set({ divination: window.__art(10) });
  const probe = (n) => {
    window.Liber.state.set({ relations: window.__rel(window.__art(10), n) });
    window.ConstellationRefresh();
    const line = document.querySelector('#constellation-svg line');
    return line ? parseFloat(line.getAttribute('stroke-width')) : null;
  };
  return { few: probe(1), many: probe(8) };
});
check('edges thicken as relations grow (1 → 8)', edges.few !== null && edges.many !== null && edges.many > edges.few, JSON.stringify(edges));

// ─── mechanic 1: session arc — one sea suggestion per long visit ───────
console.log('session arc — the sea suggestion, once per visit')
await goto('/desktop.html', 700);
const arcCold = await page.evaluate(async () => {
  window.Liber.state.set({ tutorialDone: true, sessionStart: Date.now() });
  for (let i = 0; i < 5; i++) {
    window.Liber.statusLine.cycle();
    await new Promise(r => setTimeout(r, 550));
  }
  return { arc: window.Liber.state.get().arcShownFor, sea: document.querySelector('.status-phrase').textContent.includes('sea') };
});
check('short visit: the sea is never suggested', arcCold.arc === 0 && !arcCold.sea, JSON.stringify(arcCold));
await page.evaluate(() => {
  window.Liber.state.set({ sessionStart: Date.now() - 90 * 60 * 1000, arcShownFor: 0 });
});
const arcWarm = await page.evaluate(async () => {
  window.Liber.statusLine.cycle();
  await new Promise(r => setTimeout(r, 600));
  const s = window.Liber.state.get();
  return { shown: s.arcShownFor, start: s.sessionStart, text: document.querySelector('.status-phrase').textContent };
});
check('long visit: the sea suggestion arrives once, dismissed on show', arcWarm.shown === arcWarm.start && /sea/.test(arcWarm.text), JSON.stringify(arcWarm));
const arcGone = await page.evaluate(async () => {
  let again = false;
  for (let i = 0; i < 6; i++) {
    window.Liber.statusLine.cycle();
    await new Promise(r => setTimeout(r, 550));
    if (/sea/.test(document.querySelector('.status-phrase').textContent)) again = true;
  }
  return { again, persists: window.Liber.state.get().arcShownFor !== 0 };
});
check('dismissed forever for that visit — never repeats', !arcGone.again && arcGone.persists, JSON.stringify(arcGone));
const arcPreTutorial = await page.evaluate(async () => {
  window.Liber.state.set({ sessionStart: Date.now() - 90 * 60 * 1000, arcShownFor: 0, tutorialDone: false });
  window.Liber.statusLine.cycle();
  await new Promise(r => setTimeout(r, 600));
  return { shown: window.Liber.state.get().arcShownFor, sea: document.querySelector('.status-phrase').textContent.includes('sea') };
});
check('pre-tutorial: never suggested', arcPreTutorial.shown === 0 && !arcPreTutorial.sea, JSON.stringify(arcPreTutorial));

// ─── mechanic 5: ambient variable prompts — seeded, capped, gated ──────
console.log('ambient prompts — speak first, rarely')
await goto('/desktop.html', 700);
const ambientGated = await page.evaluate(() => {
  window.Liber.state.set({ tutorialDone: true });
  window.Liber.gamification.ambient.fire();
  return (window.Liber.state.get().ambient || {}).fired || [];
});
check('no relations → the machine never speaks first', ambientGated.length === 0, JSON.stringify(ambientGated));
await page.evaluate(() => {
  window.Liber.state.set({
    sigils: [{ id: 'sigil-1', intention: 'a held breath' }],
    divination: window.__art(2),
    relations: window.__rel(window.__art(2), 2),
  });
});
const ambientPlan = await page.evaluate(() => {
  const a = window.Liber.gamification.ambient.plan();
  const b = window.Liber.gamification.ambient.plan();
  return { a, b, same: JSON.stringify(a) === JSON.stringify(b) };
});
check('plan is seeded + deterministic per visit', ambientPlan.same, JSON.stringify(ambientPlan.a));
check('plan caps at 1–2 prompts, intervals unpredictable but ordered', ambientPlan.a.count >= 1 && ambientPlan.a.count <= 2 && ambientPlan.a.delays.length === ambientPlan.a.count && ambientPlan.a.delays[0] >= 40 && ambientPlan.a.delays.every((d, i) => i === 0 || d > ambientPlan.a.delays[i - 1]), JSON.stringify(ambientPlan.a.delays));
const ambientFired = await page.evaluate(() => {
  let seen = 0;
  const listener = () => seen++;
  document.addEventListener('liber:prompt', listener);
  const p1 = window.Liber.gamification.ambient.fire();
  const p2 = window.Liber.gamification.ambient.fire();
  const p3 = window.Liber.gamification.ambient.fire();
  document.removeEventListener('liber:prompt', listener);
  return { p1: p1 && p1.text, p2: p2 && p2.text, p3: !!p3, seen, fired: window.Liber.state.get().ambient.fired.length, noRepeat: p1 && p2 ? p1.text !== p2.text : true };
});
check('fires via liber:prompt, hard cap 2 per visit', ambientFired.p1 && ambientFired.p2 && !ambientFired.p3 && ambientFired.seen === 2 && ambientFired.fired === 2, JSON.stringify({ seen: ambientFired.seen, fired: ambientFired.fired }));
check('no repetition within the visit', ambientFired.noRepeat, `${ambientFired.p1} / ${ambientFired.p2}`);
const ambientShown = await page.evaluate(() => {
  const el = document.querySelector('.prompt-line');
  return { visible: !!(el && el.classList.contains('show')), text: el ? el.textContent : null };
});
check('ambient prompt renders on the shell surface', ambientShown.visible && !!ambientShown.text, ambientShown.text);
const composeDeterminism = await page.evaluate(() => {
  const rel = { from: 'div-0', verb: 'protects' };
  const a = window.Liber.prompts.compose(rel, 'ambient-0-div-0');
  const b = window.Liber.prompts.compose(rel, 'ambient-0-div-0');
  return a.text === b.text;
});
check('seeded compose: same relation + salt → same text', composeDeterminism);

// ─── mechanic 6: booth personal bests ───────────────────────────────────
console.log('booth bests — private records, whimsy announces')
await goto('/games.html', 500);
const bestsLogic = await page.evaluate(() => {
  const L = window.Liber.games;
  const out = [];
  out.push(L.recordBest('tip', 12));
  out.push(L.recordBest('tip', 8));
  out.push(L.recordBest('tip', 30));
  out.push(L.recordBest('tip', 0));
  out.push(L.recordBest('stop', 5));
  return { results: out, bests: window.Liber.state.get().bests };
});
check('recordBest: high-water mark per booth, junk rejected', bestsLogic.results[0].newBest && !bestsLogic.results[1].newBest && bestsLogic.results[2].newBest && bestsLogic.results[3] === null && bestsLogic.results[4] === null, JSON.stringify(bestsLogic.bests));
check('state.bests = { boothId: value }', bestsLogic.bests.tip === 30, JSON.stringify(bestsLogic.bests));
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(400);
const bestsPersist = await page.evaluate(() => window.Liber.state.get().bests);
check('bests persist across reloads (localStorage)', bestsPersist && bestsPersist.tip === 30, JSON.stringify(bestsPersist));
// UI path retired with the tip booth (P5: five honest games, no scores).
// The recordBest API above stays pinned.

await browser.close();
server.kill();

if (errors.length) {
  console.log('\npage errors collected:');
  errors.forEach(e => console.log('  ' + e.slice(0, 200)));
  failures += errors.length;
}
console.log(failures ? `\n${failures} check(s) failed` : '\nall gamification checks passed');
process.exit(failures ? 1 : 0);
