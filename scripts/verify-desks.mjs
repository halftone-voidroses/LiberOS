// verify-desks.mjs — lane B desk-chrome acceptance (redesign-pitch.html,
// sections "ROOM 10 · Journal — the book" and "ROOM 11 · Learn"):
//   journal: spine state from artifact counts · ribbons from unreads ·
//     hover marginalia · corner caps from relations · slip out intact ·
//     notes and highlights unchanged
//   learn: dated marginalia hand · index-card shelf · citation stamps
//     resolve · typed-vs-handwritten distinction · TIPP cross-link ·
//     no layout break at 439px.
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
}

// ── journal: the reading desk ──────────────────────────────────────
console.log('journal — spine, ribbons, marginalia, caps');
await goto('/journal.html');
await page.evaluate(() => {
  window.Liber.state.set({
    divination: [
      { id: 'card-1', name: 'the hermit', ts: Date.now() },
      { id: 'card-2', name: 'the star', ts: Date.now(), annotation: 'a confession kept in the margin — read on hover only.' },
    ],
    relations: [{ from: 'card-1', verb: 'holds', to: 'buddy', ts: Date.now() }],
    read: { 'card-1': Date.now() },
  });
});
await page.waitForTimeout(400);
// the first-visit walkthrough overlays the room until skipped
try { await page.click('.hijack-skip', { timeout: 2000 }); } catch (e) {}
await page.waitForTimeout(200);
await page.click('.journal-tab[data-tab="artifacts"]');
await page.waitForTimeout(200);
const desk = await page.evaluate(() => {
  const spine = document.getElementById('journal-spine');
  const binding = document.querySelector('.journal-binding');
  return {
    caps: document.querySelectorAll('.journal-cap').length,
    relBucket: binding ? binding.getAttribute('data-relations') : null,
    spineW: spine ? parseFloat(spine.style.width) : null,
    unreadAttr: spine ? spine.getAttribute('data-unread') : null,
    ribbons: document.querySelectorAll('.journal-ribbon').length,
    rows: document.querySelectorAll('.journal-list-item').length,
    marginalText: (document.querySelector('.journal-list-item[data-marginal]') || { getAttribute: () => null }).getAttribute('data-marginal'),
  };
});
check('four brass caps crown the binding', desk.caps === 4, String(desk.caps));
check('corner caps bucket from relation count (1 knot → tier 1)', desk.relBucket === '1', String(desk.relBucket));
check('spine thickens with keeps (22px base → wider)', desk.spineW !== null && desk.spineW > 22, 'w=' + desk.spineW);
check('spine carries the unread tally (1 unopened)', desk.unreadAttr === '1', String(desk.unreadAttr));
check('ribbons mark exactly the unvisited rows', desk.ribbons === 1 && desk.rows === 2, 'ribbons ' + desk.ribbons + '/' + desk.rows);
check('the annotated row confesses its note in data-marginal', !!desk.marginalText && /confession kept in the margin/.test(desk.marginalText), String(desk.marginalText).slice(0, 40));

const hoverRule = await page.evaluate(() => {
  for (const sheet of document.styleSheets) {
    let rules; try { rules = sheet.cssRules; } catch (e) { continue; }
    for (const r of rules) {
      if (r.selectorText && r.selectorText.indexOf('.journal-list-item[data-marginal]:hover::after') >= 0) return true;
    }
  }
  return false;
});
check('hover marginalia rule ships in the journal sheet', hoverRule, '');

// the slip out of the book — open-in-originating-room preserved
await page.click('.journal-list-item');
await page.waitForTimeout(200);
const slip = await page.evaluate(() => {
  const s = document.getElementById('journal-slip');
  return { visible: !!s && !s.hidden, text: s ? s.textContent : '' };
});
check('the slip out of the book is offered', slip.visible && /slip out to/.test(slip.text), slip.text);

// notes and highlights unchanged: write, blur, persists
await page.evaluate(() => {
  const ed = document.getElementById('journal-editor');
  ed.textContent = 'a fresh margin note';
  ed.dispatchEvent(new Event('input', { bubbles: true }));
  ed.dispatchEvent(new Event('blur'));
});
await page.waitForTimeout(300);
const noted = await page.evaluate(() => {
  const c = (window.Liber.state.get().divination || []).find(a => a.id === 'card-1');
  return c && c.annotation === 'a fresh margin note';
});
check('margin notes still save through the editor', !!noted, '');

// ── learn: the workbook desk ───────────────────────────────────────
console.log('learn — marginalia hand, card shelf, stamps');
await goto('/learn.html');
await page.waitForTimeout(300);
const learn0 = await page.evaluate(() => {
  const m = document.querySelector('.learn-marginal');
  const d = document.querySelector('.learn-marginal-date');
  return { marginal: !!m, date: d ? d.textContent : '', body: m ? m.textContent : '' };
});
check('dated marginalia renders on the sampled card', learn0.marginal && learn0.date.length > 0, learn0.date + ' / ' + learn0.body.slice(0, 30));

const cardRule = await page.evaluate(() => {
  for (const sheet of document.styleSheets) {
    let rules; try { rules = sheet.cssRules; } catch (e) { continue; }
    for (const r of rules) {
      if (r.selectorText === '.learn-drawer::before') return true;
    }
  }
  return false;
});
check('drawers are ruled as index cards (red top rule)', cardRule, '');

// citations resolve to stamped slips
const cite = await page.evaluate(async () => {
  const fn = document.querySelector('.learn-fn');
  if (!fn) return null;
  fn.click();
  await new Promise(r => setTimeout(r, 200));
  const slipEl = document.getElementById('learn-cite');
  return {
    open: slipEl && slipEl.classList.contains('open'),
    source: (document.getElementById('learn-cite-body') || {}).textContent || '',
  };
});
check('a † mark opens its stamped citation slip', !!cite && cite.open && /source:/.test(cite.source), '');

// typed vs handwritten: thesis cards carry the scribe's stamp
const voices = await page.evaluate(async () => {
  const out = {};
  const drawers = document.querySelectorAll('.learn-drawer');
  drawers[8].click(); // card 09 — Buddy Work, a traveller's thesis
  await new Promise(r => setTimeout(r, 150));
  out.thesis = !!document.querySelector('.learn-thesis');
  drawers[0].click(); // card 01 — research voice
  await new Promise(r => setTimeout(r, 150));
  out.research = !document.querySelector('.learn-thesis');
  return out;
});
check('house voice is stamped apart from the research shelf', voices.thesis && voices.research, JSON.stringify(voices));

// TIPP card cross-links to the Quiet Floor
await goto('/learn.html#tipp');
await page.waitForTimeout(300);
const tipp = await page.evaluate(() => {
  const x = document.querySelector('.learn-cross');
  return { present: !!x, room: x ? x.dataset.room : '' };
});
check('TIPP card cross-links to the Quiet Floor', tipp.present && tipp.room === 'games.html#tipp', tipp.room);

// ── 439px: no layout break on either desk ──────────────────────────
console.log('439px — both desks keep their composure');
const ctxN = await browser.newContext({ viewport: { width: 439, height: 800 } });
const pageN = await ctxN.newPage();
pageN.on('pageerror', e => errors.push('narrow pageerror: ' + e.message));
await pageN.goto(BASE + '/journal.html', { waitUntil: 'networkidle' });
await pageN.evaluate(() => { try { localStorage.clear() } catch (e) {} });
await pageN.reload({ waitUntil: 'networkidle' });
await pageN.waitForTimeout(400);
try { await pageN.click('.hijack-skip', { timeout: 2000 }); } catch (e) {}
await pageN.evaluate(() => {
  window.Liber.state.set({
    divination: [
      { id: 'card-1', name: 'the hermit', ts: Date.now() },
      { id: 'card-2', name: 'the star', ts: Date.now() },
    ],
    read: { 'card-1': Date.now() },
  });
});
await pageN.waitForTimeout(200);
await pageN.click('.journal-tab[data-tab="artifacts"]');
await pageN.waitForTimeout(200);
const satNarrow = await pageN.evaluate(() => ({
  ofx: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  rows: document.querySelectorAll('.journal-list-item').length,
}));
await pageN.goto(BASE + '/learn.html', { waitUntil: 'networkidle' });
await pageN.evaluate(() => { try { localStorage.clear() } catch (e) {} });
await pageN.reload({ waitUntil: 'networkidle' });
await pageN.waitForTimeout(400);
const learnNarrow = await pageN.evaluate(() => ({
  ofx: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  drawers: document.querySelectorAll('.learn-drawer').length,
}));
check('439px journal: no horizontal overflow, rows render', satNarrow.ofx <= 0 && satNarrow.rows >= 1, JSON.stringify(satNarrow));
check('439px learn: no horizontal overflow, drawers render', learnNarrow.ofx <= 0 && learnNarrow.drawers >= 20, JSON.stringify(learnNarrow));

// ── done ───────────────────────────────────────────────────────────
await browser.close().catch(() => {});
server.kill();
if (errors.length) {
  console.log('\npage/server errors:');
  for (const e of errors) console.log('  ' + e.slice(0, 200));
}
console.log(`\n${failures === 0 ? 'ALL GREEN' : failures + ' FAILED'} — verify-desks`);
process.exitCode = failures === 0 ? 0 : 1;
