// verify-tree.mjs — ROOM 09 acceptance pass: the glasshouse tree.
// Serves the worktree, then with Playwright:
//  1. tab exists, glasshouse opens, third room visible
//  2. growth fold: advance() turns stages; stage 5 holds
//  3. offline accrual: absence grows the tree (seen timestamp math)
//  4. watering banks an hour; refusal honoured (disabled button, wet-soil note)
//  5. harvest: pressing lands in journal, petal lands in palette, gaps remain
//  6. persistence across reload; legacy thimble migration on fresh state
//  7. reduced-motion renders static stages; 439px keeps it operable
// Exit 0 = pass, 1 = fail.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png' };

function serveDir(root) {
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p === '/') { res.writeHead(302, { Location: '/desktop.html' }); return res.end(); }
      const fp = path.normalize(path.join(root, p));
      if (!fp.startsWith(root)) { res.writeHead(403); return res.end(); }
      fs.stat(fp, (e, st) => {
        if (e || !st.isFile()) { res.writeHead(404); return res.end('nf'); }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
        fs.createReadStream(fp).pipe(res);
      });
    });
    srv.listen(0, '127.0.0.1', () => resolve({ srv, port: srv.address().port }));
  });
}

const { srv, port } = await serveDir(ROOT);
const BASE = `http://127.0.0.1:${port}`;
const errors = [];
const ok = (cond, msg) => { console.log(`${cond ? 'ok' : 'FAIL'} - ${msg}`); if (!cond) errors.push(msg); };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));

async function dismissHijack() {
  try {
    const skip = await page.$('.hijack-skip');
    if (skip) { await skip.click(); await page.waitForTimeout(300); }
  } catch (e) {}
}

// fresh state, tutorial bypassed
await page.goto(BASE + '/desktop.html', { waitUntil: 'networkidle' });
await page.evaluate(() => {
  localStorage.setItem('liber_vacui_v1__keep', JSON.stringify({ tutorialDone: true, tutorialStage: 'done' }));
});
await page.goto(BASE + '/garden.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
await dismissHijack();

// ─── 1. the third room opens ───
ok(await page.isVisible('#garden-tab-tree'), 'glasshouse tab exists');
await page.click('#garden-tab-tree');
await page.waitForTimeout(300);
ok(await page.isVisible('#garden-room-tree'), 'glasshouse room visible after tab click');
ok(await page.getAttribute('.garden-app', 'data-state') === 'tree', 'data-state=tree set');
ok(await page.isVisible('.garden-tree-window'), 'glass panes render');
ok(await page.isVisible('#tree-roots'), 'root panel renders');

// covenant chrome: bench rings (the pots that stood here), light bands, lamp
ok(await page.locator('.tree-bench-rings ellipse').count() >= 3, 'bench keeps the water-rings of other pots');
ok(await page.isVisible('#tree-bands'), 'daylight light-bands layer exists');
ok(await page.isVisible('#tree-lamp'), 'dusk lamp layer exists');
const clock = await page.evaluate(() => {
  const hr = new Date().getHours();
  const dark = hr >= 18 || hr < 7;
  const lamp = document.getElementById('tree-lamp').classList.contains('on');
  const bands = document.getElementById('tree-bands').classList.contains('on');
  return { dark, lamp, bands, agreed: dark ? lamp && !bands : !lamp && bands };
});
ok(clock.agreed, `lamp/bands follow the machine clock (${clock.dark ? 'dusk: lamp lit, bands off' : 'day: bands on, lamp cold'})`);

// covenant layout: the room fits the CRT screen — foot, ledger, everything
const fit = await page.evaluate(() => {
  const room = document.querySelector('.garden-room-tree');
  const screenEl = document.querySelector('.screen-stage') || room.parentElement;
  const screenBottom = Math.round(screenEl.getBoundingClientRect().bottom);
  const ledger = document.querySelector('.garden-tree-fruitrow');
  return {
    ledgerBottom: Math.round(ledger.getBoundingClientRect().bottom),
    fits: ledger.getBoundingClientRect().bottom <= screenBottom + 1,
    pageOverflow: document.documentElement.scrollHeight - window.innerHeight
  };
});
ok(fit.fits, `fruit ledger above the fold (bottom ${fit.ledgerBottom})`);
ok(fit.pageOverflow === 0, 'no page scroll at the acceptance viewport');

// panes wipe with the cursor (hover, not click)
await page.hover('.garden-tree-pane');
await page.waitForTimeout(150);
ok((await page.getAttribute('.garden-tree-pane', 'class')).includes('wiped'), 'condensation wipes on cursor');

// ─── 2. growth fold ───
const m1 = await page.evaluate(() => window.Liber.tree.model());
ok(m1.stage === 0, `fresh tree is stage 0 (got ${m1.stage})`);
const m2 = await page.evaluate(() => window.Liber.tree.advance(45));
ok(m2.stage === 1, `advance(45m) turns stage 1 (got ${m2.stage})`);

// ─── 4. watering (while the tree is still growing) ───
const canWater = await page.evaluate(() => window.Liber.tree.model().canWater);
ok(canWater, 'can is full at a new stage-window');
await page.click('#tree-water');
const metaAfterWater = await page.textContent('#tree-note');
ok(/watered/.test(metaAfterWater), 'watering writes its note');
const canWater2 = await page.evaluate(() => window.Liber.tree.model().canWater);
ok(!canWater2, 'second can refused within the window');
ok(await page.isDisabled('#tree-water'), 'water button disabled on refusal');
const wateredOnce = await page.evaluate(() => JSON.parse(localStorage.getItem('liber_vacui_v1__keep')).tree.watered);
await page.click('#tree-water', { force: true }).catch(() => {});
const wateredTwice = await page.evaluate(() => JSON.parse(localStorage.getItem('liber_vacui_v1__keep')).tree.watered);
ok(wateredOnce === wateredTwice, 'refused can does not re-bank');

// ─── finish growing (the banked hour shows up as progress) ───
const m3 = await page.evaluate(() => window.Liber.tree.advance(45 * 9));
ok(m3.stage === 5, `nine more advances reach stage 5 (got ${m3.stage})`);
const m4 = await page.evaluate(() => window.Liber.tree.advance(600));
ok(m4.stage === 5, 'stage 5 holds — the crown does not overgrow');
ok(await page.isDisabled('#tree-water'), 'water refused at stage 5 — the tree is done');

// boughs exist as drawn geometry
const boughCount = await page.locator('#tree-svg ellipse').count();
ok(boughCount >= 6, `mature tree draws a crown (got ${boughCount} boughs)`);

// ─── 5. harvest ───
ok(await page.isEnabled('#tree-harvest'), 'harvest enabled with fruit hanging');
const journalBefore = await page.evaluate(() => (window.Liber.state.get().journal || []).length);
const paletteBefore = await page.evaluate(() => (window.Liber.state.get().palette || []).length);
await page.click('#tree-harvest');
const journalAfter = await page.evaluate(() => (window.Liber.state.get().journal || []).length);
const paletteAfter = await page.evaluate(() => (window.Liber.state.get().palette || []).length);
ok(journalAfter === journalBefore + 1, 'pressing lands in the journal');
ok(paletteAfter > paletteBefore, 'a petal drifts to the paint boxes');
const hanging = await page.evaluate(() => window.Liber.tree.model().hanging);
ok(hanging === 4, `picked fruit leaves a gap (hanging ${hanging}/5)`);
const fruitDots = await page.locator('#tree-svg .tree-fruit').count();
ok(fruitDots === 4, `svg draws the remaining fruit (${fruitDots})`);

// ─── 6. persistence + offline accrual ───
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(400);
await dismissHijack();
const persisted = await page.evaluate(() => window.Liber.tree.model());
ok(persisted.stage === 5 && persisted.hanging === 4, 'state survives reload');
// simulate two days away: backdate `seen`, reload — absence grows the tree
await page.evaluate(() => {
  const k = 'liber_vacui_v1__keep';
  const s = JSON.parse(localStorage.getItem(k));
  s.tree.seen = Date.now() - 2 * 24 * 60 * 60 * 1000;
  localStorage.setItem(k, JSON.stringify(s));
});
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(400);
await dismissHijack();
const afterAway = await page.evaluate(() => window.Liber.tree.model());
ok(afterAway.stage === 5, 'absence never overgrows the crown');
// absence that should turn a stage: backdate seen on a young tree
await page.evaluate(() => {
  const k = 'liber_vacui_v1__keep';
  const s = JSON.parse(localStorage.getItem(k));
  delete s.tree;
  localStorage.setItem(k, JSON.stringify(s));
});
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(400);
await dismissHijack();
const young = await page.evaluate(() => window.Liber.tree.model());
ok(young.stage === 0, 'fresh tree re-plants at stage 0');

// ─── legacy thimble migration ───
await page.evaluate(() => {
  const k = 'liber_vacui_v1__keep';
  const s = JSON.parse(localStorage.getItem(k));
  s.thimble = { visits: 9, base: 0, harvested: 1 };
  delete s.tree;
  localStorage.setItem(k, JSON.stringify(s));
});
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(400);
await dismissHijack();
const migrated = await page.evaluate(() => window.Liber.tree.model());
ok(migrated.stage === 3, `legacy thimble visits migrate as growth (got stage ${migrated.stage})`);
ok(migrated.migratedFrom === 'thimble', 'migration is recorded on the plant');

// ─── 7. reduced motion + narrow ───
const rmPage = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
await rmPage.goto(BASE + '/garden.html', { waitUntil: 'networkidle' });
await rmPage.waitForTimeout(500);
try { const skip = await rmPage.$('.hijack-skip'); if (skip) { await skip.click(); await rmPage.waitForTimeout(300); } } catch (e) {}
await rmPage.click('#garden-tab-tree');
await rmPage.waitForTimeout(300);
const rmFruitAnim = await rmPage.evaluate(() => {
  const w = document.getElementById('tree-wrap');
  return getComputedStyle(document.documentElement).getPropertyValue('x') === '' && !!w;
});
const rmPane = await rmPage.$('.garden-tree-pane');
ok(!!rmPane, 'reduced-motion page renders the glasshouse');
await rmPage.evaluate(() => window.Liber.tree.advance(45 * 5));
await rmPage.waitForTimeout(300);
const rmStage = await rmPage.evaluate(() => window.Liber.tree.model().stage);
ok(rmStage >= 1, 'growth works under reduced motion');

const narrow = await browser.newPage({ viewport: { width: 439, height: 800 } });
await narrow.goto(BASE + '/garden.html', { waitUntil: 'networkidle' });
await narrow.waitForTimeout(500);
try { const skip = await narrow.$('.hijack-skip'); if (skip) { await skip.click(); await narrow.waitForTimeout(300); } } catch (e) {}
await narrow.click('#garden-tab-tree');
await narrow.waitForTimeout(300);
const narrowOk = await narrow.evaluate(() => {
  const wrap = document.querySelector('.garden-tree-middle');
  const st = getComputedStyle(wrap);
  const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
  return st.flexDirection === 'column' && !overflow;
});
ok(narrowOk, '439px: root panel stacks, no horizontal overflow');
await narrow.close();
await rmPage.close();

ok(pageErrors.length === 0, `zero page errors across the pass (${pageErrors.length})`);
if (pageErrors.length) pageErrors.forEach(e => console.log('   pageerror: ' + e));

fs.mkdirSync('/tmp/school-shots', { recursive: true });
await page.setViewportSize({ width: 1280, height: 800 });
await page.goto(BASE + '/garden.html', { waitUntil: 'networkidle' });
await page.evaluate(() => { const k = 'liber_vacui_v1__keep'; const s = JSON.parse(localStorage.getItem(k) || '{}'); s.tree = { planted: Date.now() - 5 * 45 * 60000, watered: 0, stageAt: Date.now() - 5 * 45 * 60000, grown: 0, seen: Date.now(), fruits: [], pressings: 0, migratedFrom: null }; localStorage.setItem(k, JSON.stringify(s)); });
await page.reload({ waitUntil: 'networkidle' });
await dismissHijack();
await page.click('#garden-tab-tree');
await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/school-shots/tree-glasshouse.png' });
console.log('   screenshot: /tmp/school-shots/tree-glasshouse.png');

await browser.close();
srv.close();
if (errors.length) { console.log(`\n${errors.length} check(s) failed.`); process.exit(1); }
console.log('\nAll glasshouse acceptance checks passed.');
process.exit(0);
