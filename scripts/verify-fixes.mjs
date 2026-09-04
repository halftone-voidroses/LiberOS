// verify-fixes.mjs — live regression checks for the 2026-09-03 audit fixes.
// Boots its own serve.cjs, runs DOM checks at the project's 1280×800 size.
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
  await page.evaluate(() => { try { localStorage.clear() } catch (e) {} });
}
async function goto(path, wait = 400) {
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  await clearState();
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(wait);
}

// ─── C5 + X1: carving glow + no stale theme classes ───────────────────
console.log('C5/X1 — carving glow + theme classes')
await goto('/desktop.html', 900)
await page.evaluate(() => window.Liber.state.set({ theme: 'whimsy' }))
await page.waitForTimeout(300)
const c5 = await page.evaluate(() => {
  const m = document.querySelector('.machine');
  const stale = [...m.classList].filter(c => c.startsWith('theme-') && c !== 'theme-whimsy');
  const active = document.querySelector('.carving.active');
  return { stale, active: active ? active.dataset.id : null, themes: m.className.match(/theme-[a-z0-9-]+/g) };
});
check('no stale theme-* classes after theme switch', c5.stale.length === 0, JSON.stringify(c5.themes));
check('active carving matches whimsy → bulb', c5.active === 'bulb', 'active=' + c5.active);
await page.evaluate(() => window.Liber.state.set({ theme: 'corrupted' }))
await page.waitForTimeout(200)
const c5b = await page.evaluate(() => ({ active: !!document.querySelector('.carving.active'), cls: document.querySelector('.machine').className.match(/theme-[a-z0-9-]+/g) }));
check('corrupted theme → no carving glows', !c5b.active && c5b.cls.length === 1);

// ─── C3: extc copy is sea-scoped ──────────────────────────────────────
console.log('C3 — extc copy')
const c3 = await page.evaluate(() => document.body.innerHTML.includes('anywhere to toggle the overdrive'));
check('no "extc anywhere" copy on desktop', !c3);
await goto('/settings.html')
const c3b = await page.evaluate(() => document.body.innerHTML.includes('anywhere to toggle the overdrive'));
check('no "extc anywhere" copy on settings', !c3b);

// ─── C2: trash graveyard round-trip + confirm labels ──────────────────
console.log('C2 — trash graveyard')
await goto('/trash.html')
await page.evaluate(() => {
  window.Liber.state.set({ sigils: [{ id: 'sigil-1', intention: 'fear of the dark', ts: Date.now() }] });
});
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(400);
const labels = await page.evaluate(() => ({
  keep: document.getElementById('trash-save-prompt-keep').textContent.trim(),
  discard: document.getElementById('trash-save-prompt-discard').textContent.trim(),
}));
check('confirm labels are bury it / not yet', labels.keep === 'bury it' && labels.discard === 'not yet', JSON.stringify(labels));
await page.click('#trash-bury-sigils');
await page.click('#trash-save-prompt-keep');
await page.waitForTimeout(200);
const buried = await page.evaluate(() => ({
  sigils: window.Liber.state.get().sigils.length,
  gy: window.Liber.state.get().graveyard.length,
  rows: document.querySelectorAll('.trash-dig-row').length,
}));
check('bury moves sigils to graveyard', buried.sigils === 0 && buried.gy === 1 && buried.rows === 1, JSON.stringify(buried));
await page.click('.trash-dig-btn');
await page.waitForTimeout(200);
const dug = await page.evaluate(() => ({
  sigils: window.Liber.state.get().sigils.length,
  gy: window.Liber.state.get().graveyard.length,
  intent: (window.Liber.state.get().sigils[0] || {}).intention,
}));
check('dig it up restores the artifact', dug.sigils === 1 && dug.gy === 0 && dug.intent === 'fear of the dark', JSON.stringify(dug));

// ─── C1: sea release ritual ───────────────────────────────────────────
console.log('C1 — sea release ritual')
await goto('/sea.html')
const seaHas = await page.evaluate(() => ({
  input: !!document.getElementById('sea-input'),
  dots: document.querySelectorAll('.sea-intensity-dot').length,
  release: !!document.getElementById('sea-release'),
}));
check('sea has input, 5 intensity dots, release button', seaHas.input && seaHas.dots === 5 && seaHas.release, JSON.stringify(seaHas));
await page.fill('#sea-input', 'the thing I keep carrying');
await page.click('.sea-intensity-dot[data-value="5"]');
await page.click('#sea-release');
await page.waitForTimeout(6200);
const seaState = await page.evaluate(() => window.Liber.state.get().sea);
check('release writes a state.sea artifact at intensity 5', seaState.length === 1 && seaState[0].intensity === 5 && seaState[0].text === 'the thing I keep carrying', JSON.stringify(seaState));

// ─── C4: wanderlust final fork leaves no dead buttons ─────────────────
console.log('C4 — wanderlust final fork')
await goto('/desktop.html', 900)
await page.click('#flaming-q');
await page.waitForTimeout(10500);
let clicks = 0;
while (clicks < 40) {
  const has = await page.evaluate(() => {
    const r = document.querySelector('.wanderlust-reply');
    const w = document.getElementById('wanderlust-window');
    return { reply: !!r, open: w && w.classList.contains('open') };
  });
  if (!has.reply || !has.open) break;
  await page.click('.wanderlust-reply');
  await page.waitForTimeout(900);
  clicks++;
}
const c4 = await page.evaluate(() => ({
  done: window.Liber.state.get().tutorialDone,
  replies: document.querySelectorAll('.wanderlust-reply').length,
}));
check('tutorial completes and clears reply buttons', c4.done === true && c4.replies === 0, JSON.stringify(c4));

// ─── M3: iching cast label + completed state ──────────────────────────
console.log('M3 — iching cast label')
await goto('/divination.html')
await page.click('.divination-mode[data-mode="iching"]');
await page.waitForTimeout(200);
const m3sub = await page.textContent('#divination-sub');
check('iching mode shows iching instruction', /cast six lines/i.test(m3sub), m3sub);
for (let i = 0; i < 6; i++) {
  const label = await page.textContent('#divination-cast');
  if (i < 5 && !label.includes('cast line ' + (i + 1))) {
    check('cast label advances', false, `at cast ${i + 1} label was "${label}"`);
    break;
  }
  await page.click('#divination-cast');
  await page.waitForTimeout(120);
}
const m3 = await page.evaluate(() => ({
  label: document.getElementById('divination-cast').textContent,
  disabled: document.getElementById('divination-cast').disabled,
}));
check('after 6 casts: "the hexagram stands", disabled', m3.label === 'the hexagram stands' && m3.disabled, JSON.stringify(m3));

// ─── M2: games booths reachable ───────────────────────────────────────
console.log('M2 — games booths')
await goto('/games.html')
const m2 = await page.evaluate(() => {
  const booths = document.getElementById('games-grid');
  if (!booths) return { missing: true };
  const scrollable = booths.scrollHeight >= booths.clientHeight;
  booths.scrollTop = booths.scrollHeight;
  const last = booths.lastElementChild;
  const r = last.getBoundingClientRect();
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return { scrollable, hitInBooth: last.contains(hit), hitClass: hit ? String(hit.className) : null };
});
check('booth stage is scrollable and bottom booth is clickable', m2.scrollable && m2.hitInBooth, JSON.stringify(m2));

// ─── M1: no dev-spec text in raison panels ────────────────────────────
console.log('M1 — raison panels')
const pages = ['about', 'abstract', 'cohort', 'divination', 'games', 'learn', 'methodology', 'relation', 'satchel', 'sea', 'settings', 'sigil', 'themes', 'trash'];
let devText = [];
for (const p of pages) {
  await page.goto(BASE + '/' + p + '.html', { waitUntil: 'domcontentloaded' });
  const found = await page.evaluate(() => {
    const bodies = document.querySelectorAll('[class*="raison-body"], [class*="raison"] .raison-body');
    const hits = [];
    bodies.forEach(b => { if (/input:|output:|state\./i.test(b.textContent)) hits.push(b.textContent.trim().slice(0, 60)); });
    return hits;
  });
  if (found.length) devText.push(p + ': ' + found.join(' | '));
}
check('no dev-spec text in any raison panel', devText.length === 0, devText.join(' ;; ') || 'clean');

// ─── M4: inert instead of aria-hidden for interactive containers ──────
console.log('M4 — inert migration')
await goto('/desktop.html', 600)
const m4 = await page.evaluate(() => {
  const w = document.getElementById('wanderlust-window');
  const s = document.getElementById('settings-modal');
  return {
    winInert: w ? w.hasAttribute('inert') : null,
    winAriaHidden: w ? w.getAttribute('aria-hidden') : null,
    setInert: s ? s.hasAttribute('inert') : null,
  };
});
check('wanderlust window + settings modal use inert when closed', m4.winInert === true && m4.setInert === true && m4.winAriaHidden !== 'true', JSON.stringify(m4));

// ─── prompt engine end-to-end on the desktop ──────────────────────────
console.log('prompt — end-to-end surface')
await page.evaluate(() => {
  window.Liber.state.set({
    sigils: [{ id: 'sigil-1', intention: 'my fear of inadequacy', ts: Date.now() }],
    divination: [{ id: 'div-1', name: 'the emperor', key: 'a line drawn and held', n: 4, g: '♂' }],
    relations: [{ from: 'div-1', verb: 'protects', to: 'sigil', ts: Date.now() }],
  });
});
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(600);
const promptText = await page.evaluate(() => {
  const el = document.querySelector('.prompt-line');
  return el ? el.textContent : null;
});
check('emergent prompt renders on desktop', !!promptText && promptText.length > 0, promptText);

// ─── favicon ──────────────────────────────────────────────────────────
console.log('favicon')
const favicon = await page.evaluate(() => !!document.querySelector('link[rel="icon"]'));
check('pages declare an inline favicon', favicon);

await browser.close();
server.kill();

if (errors.length) {
  console.log('\npage errors collected:');
  errors.forEach(e => console.log('  ' + e.slice(0, 200)));
  failures += errors.length;
}
console.log(failures ? `\n${failures} check(s) failed` : '\nall fix verifications passed');
process.exit(failures ? 1 : 0);
