// verify-constellation.mjs — SYSTEM 04 acceptance (redesign-pitch.html,
// section "SYSTEM 04 · The Evolving Constellation"):
//   deterministic renders · mark-on-keep · live morph on bind ·
//   ghost line on unbind · three edge textures · 439px legibility ·
//   reduced-motion static tiers · patina stages 0–3 differ.
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

// one stone, named artifacts, zero everything else — the cleanest
// substrate for reading the renderer's decisions off the svg.
const art = (id, ts) => ({ id, name: id, ts: ts || Date.now() });
const BASE_STATE = {
  tutorialDone: true,
  buddy: [{ id: 'stone-1', kind: 'stone', intention: 'a held breath' }],
  divination: [art('d1')],
};

// ── 1. deterministic: same state → same pixels ─────────────────────
console.log('determinism — same state draws the same svg');
await goto('/desktop.html');
await page.evaluate(s => { window.__BASE = s; window.__art = (id, ts) => ({ id, name: id, ts: ts || Date.now() }); }, BASE_STATE);
await page.evaluate(s => window.Liber.state.set(s), { ...BASE_STATE, relations: [{ from: 'd1', verb: 'holds', to: 'buddy', ts: Date.now() }] });
await page.waitForTimeout(300);
const snap1 = await page.evaluate(() => document.getElementById('constellation-svg').innerHTML);
await page.evaluate(() => window.ConstellationRefresh());
await page.waitForTimeout(120);
const snap2 = await page.evaluate(() => document.getElementById('constellation-svg').innerHTML);
check('two renders of one state are byte-identical', snap1 === snap2 && snap1.length > 100, 'len ' + snap1.length);
const svgText = await page.evaluate(() => document.getElementById('constellation-svg').innerHTML);
check('renderer uses no Math.random (no varying draws between states)', !/Math\.random/.test(svgText), 'static markup');

// ── 2. mark-on-keep ────────────────────────────────────────────────
console.log('marks — the stone carves what you keep');
const noMark = await page.evaluate(() => {
  window.Liber.state.set({ ...window.__BASE, games: [], relations: [] });
  window.ConstellationRefresh();
  return document.querySelectorAll('.constellation-stone-mark[data-mark-kind="games"]').length;
});
check('no games kept → no dart-wheel carved', noMark === 0, String(noMark));
const marked = await page.evaluate(() => {
  window.Liber.state.set({ games: [window.__art('g1')] });
  window.ConstellationRefresh();
  return document.querySelectorAll('.constellation-stone-mark[data-mark-kind="games"]').length;
});
check('keep a game → the dart-wheel is carved', marked === 1, String(marked));
await page.evaluate(() => {
  window.Liber.state.set({
    divination: [window.__art('d1')], games: [window.__art('g1')], sea: [window.__art('s1')],
    garden: [window.__art('ga1')], dreams: [window.__art('dr1')],
  });
  window.ConstellationRefresh();
});
const fiveKinds = await page.evaluate(() => {
  const kinds = [];
  document.querySelectorAll('.constellation-stone-mark').forEach(m => { if (kinds.indexOf(m.getAttribute('data-mark-kind')) < 0) kinds.push(m.getAttribute('data-mark-kind')); });
  return kinds;
});
check('five kept artifact types carve five distinct marks', fiveKinds.length >= 5, fiveKinds.join(','));

// ── 3. facets from relations + rings on glyphs ─────────────────────
console.log('earned complexity — facets, rings, satellites');
await page.evaluate(() => {
  window.Liber.state.set({ relations: [{ from: 'd1', verb: 'holds', to: 'buddy', ts: Date.now() }] });
  window.ConstellationRefresh();
});
const facets = await page.evaluate(() => document.querySelectorAll('.constellation-stone-facets path').length);
check('relations cut facets into the stone', facets >= 1, String(facets));

// ── 4. live morph on bind — both endpoints, one beat ───────────────
console.log('morph — bind moves both endpoints in place');
const morph = await page.evaluate(async () => {
  window.Liber.state.set({ divination: [{ id: 'm1', name: 'm1', ts: Date.now() }], relations: [] });
  window.ConstellationRefresh();
  await new Promise(r => setTimeout(r, 120));
  const before = parseFloat(document.querySelector('.constellation-artifact[data-artifact-id="m1"]').getAttribute('r'));
  window.Liber.state.set({ relations: [{ from: 'm1', verb: 'protects', to: 'buddy', ts: Date.now() }] });
  window.ConstellationMorph('m1');
  await new Promise(r => setTimeout(r, 260));
  const during = parseFloat(document.querySelector('.constellation-artifact[data-artifact-id="m1"]').getAttribute('r'));
  await new Promise(r => setTimeout(r, 900));
  const after = parseFloat(document.querySelector('.constellation-artifact[data-artifact-id="m1"]').getAttribute('r'));
  return { before, during, after };
});
check('the bound glyph swells during the beat and settles back', morph.before === 9 && morph.during > 9 && morph.after === 9, JSON.stringify(morph));
const edgeDrawn = await page.evaluate(() => !!document.querySelector('.constellation-edge[data-edge-from="m1"]'));
check('the edge is present after the beat', edgeDrawn, '');

// ── 5. ghost line on unbind ────────────────────────────────────────
console.log('release — not erasure, even optically');
const ghost = await page.evaluate(async () => {
  window.Liber.state.set({
    graveyard: [{ kind: 'divination', entry: { id: 'gone-1', name: 'gone-1' }, buriedAt: Date.now() }],
  });
  window.ConstellationRefresh();
  return {
    ghosts: document.querySelectorAll('.constellation-ghost-line').length,
    of: document.querySelectorAll('.constellation-ghost-line[data-ghost-of="gone-1"]').length,
  };
});
check('a released artifact leaves a ghost line on the stone', ghost.ghosts >= 1 && ghost.of === 1, JSON.stringify(ghost));

// ── 6. three edge textures ─────────────────────────────────────────
console.log('edges — rope, brace, filament');
const textures = await page.evaluate(() => {
  const old = Date.now() - 90 * 24 * 3600 * 1000;
  window.Liber.state.set({
    divination: [window.__art('e1', old), window.__art('e2'), window.__art('e3')],
    relations: [
      { from: 'e1', verb: 'carries', to: 'buddy', ts: old },          // long-lived, few keeps after → filament
      { from: 'e2', verb: 'witnesses', to: 'buddy', ts: Date.now(), note: 'annotated in the book' }, // annotated → brace
      { from: 'e3', verb: 'follows', to: 'buddy', ts: Date.now() },   // fresh → rope
    ],
  });
  window.ConstellationRefresh();
  const has = c => document.querySelectorAll('.constellation-edge.' + c).length;
  return { rope: has('edge-rope'), brace: has('edge-brace'), filament: has('edge-filament') };
});
check('fresh relation draws as rope', textures.rope >= 1, JSON.stringify(textures));
check('annotated relation draws as brace', textures.brace >= 1, JSON.stringify(textures));
check('long-lived relation draws as filament', textures.filament >= 1, JSON.stringify(textures));

// ── 7. competence contract: edges thicken (verify-gamification) ────
const thick = await page.evaluate(() => {
  const probe = n => {
    window.Liber.state.set({
      relations: Array.from({ length: n }, (_, i) => ({ from: 'e1', verb: 'holds', to: 'buddy', ts: Date.now(), note: 'n' + i })).slice(0, 0).concat(
        Array.from({ length: n }, (_, i) => ({ from: 'e' + (1 + (i % 3)), verb: 'v' + i, to: 'buddy', ts: Date.now() }))
      ),
    });
    window.ConstellationRefresh();
    const line = document.querySelector('#constellation-svg line');
    return line ? parseFloat(line.getAttribute('stroke-width')) : null;
  };
  return { few: probe(1), many: probe(8) };
});
check('edges thicken as relations grow (1 → 8)', thick.few !== null && thick.many > thick.few, JSON.stringify(thick));

// ── 8. precession per patina tier ──────────────────────────────────
console.log('precession — the lived-in desktop turns, per tier');
// tier probes run on a minimal stone-only substrate: patina counts
// visits + artifacts (mirroring src/shadow.js), so the stone itself
// counts as one — visits 0/2/6/12 + 1 keep land exactly on tiers 0–3.
const TIER_STATE = { tutorialDone: true, buddy: [{ id: 'stone-1', kind: 'stone', intention: 'a held breath' }] };
await page.evaluate(s => { window.__TIER = s; }, TIER_STATE);
const durations = await page.evaluate(() => {
  const out = [];
  const visitsStages = [0, 2, 6, 12];
  for (const v of visitsStages) {
    const vs = {};
    for (let i = 0; i < v; i++) vs['v' + i] = Date.now() - 10 * 24 * 3600 * 1000;
    window.Liber.state.reset();
    window.Liber.state.set({ ...window.__TIER, visited: vs });
    window.ConstellationRefresh();
    const g = document.querySelector('.constellation-precess');
    out.push(g ? (g.getAttribute('data-tier') + ':' + g.style.animationDuration) : 'missing');
  }
  return out;
});
check('four tiers, four distinct precession periods', durations.length === 4 && new Set(durations.map(d => d.split(':')[1])).size === 4, durations.join(' '));

// ── 9. 439px legibility ────────────────────────────────────────────
console.log('439px — the constellation stays operable on the narrow tube');
const ctxN = await browser.newContext({ viewport: { width: 439, height: 800 } });
const pageN = await ctxN.newPage();
pageN.on('pageerror', e => errors.push('narrow pageerror: ' + e.message));
await pageN.goto(BASE + '/desktop.html', { waitUntil: 'networkidle' });
await pageN.evaluate(() => { try { localStorage.clear() } catch (e) {} });
await pageN.reload({ waitUntil: 'networkidle' });
await pageN.waitForTimeout(400);
const narrow = await pageN.evaluate(() => {
  window.Liber.state.set({
    tutorialDone: true,
    buddy: [{ id: 'stone-1', kind: 'stone', intention: 'a held breath' }],
    divination: [{ id: 'd1', name: 'd1', ts: Date.now() }],
    relations: [{ from: 'd1', verb: 'holds', to: 'buddy', ts: Date.now() }],
  });    return new Promise(r => setTimeout(() => r({
      svg: !!document.getElementById('constellation-svg'),
      glyphs: document.querySelectorAll('.constellation-artifact:not(.constellation-satellite)').length,
      marks: document.querySelectorAll('.constellation-stone-mark').length,
      ofx: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }), 300));
});
check('439px: svg renders glyph + mark, no horizontal overflow', narrow.svg && narrow.glyphs === 1 && narrow.marks >= 1 && narrow.ofx <= 0, JSON.stringify(narrow));

// ── 10. reduced motion: static tiers, instant state change ─────────
console.log('reduced motion — the flourish dies, the function survives');
const ctxR = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
const pageR = await ctxR.newPage();
pageR.on('pageerror', e => errors.push('reduced pageerror: ' + e.message));
await pageR.goto(BASE + '/desktop.html', { waitUntil: 'networkidle' });
await pageR.evaluate(() => { try { localStorage.clear() } catch (e) {} });
await pageR.reload({ waitUntil: 'networkidle' });
await pageR.waitForTimeout(400);
const reduced = await pageR.evaluate(async () => {
  window.Liber.state.set({
    tutorialDone: true,
    buddy: [{ id: 'stone-1', kind: 'stone', intention: 'a held breath' }],
    divination: [{ id: 'd1', name: 'd1', ts: Date.now() }],
    relations: [{ from: 'd1', verb: 'holds', to: 'buddy', ts: Date.now() }],
  });
  await new Promise(r => setTimeout(r, 200));
  const g = document.querySelector('.constellation-precess');
  const animNone = g && /animation:\s*none/.test(g.getAttribute('style') || '');
  const computed = g ? getComputedStyle(g).animationName : '';
  // the morph beat must not schedule under reduced motion
  const el = document.querySelector('.constellation-artifact[data-artifact-id="d1"]');
  window.ConstellationMorph('d1');
  await new Promise(r => setTimeout(r, 120));
  const rAfter = parseFloat(el.getAttribute('r'));
  return { animNone, computed, rAfter };
});
check('reduced motion: precession statically off', reduced.animNone && reduced.computed === 'none', JSON.stringify(reduced));
check('reduced motion: bind morph is an instant state change', reduced.rAfter === 9, 'r=' + reduced.rAfter);

// ── 11. patina stages 0–3 differ (markup + pixels) ─────────────────
console.log('patina — stages 0–3 are visibly different states');
const stages = [];
for (let v of [0, 2, 6, 12]) {
  const info = await page.evaluate(([vn, tier]) => {
    const vs = {};
    for (let i = 0; i < vn; i++) vs['v' + i] = Date.now() - 10 * 24 * 3600 * 1000;
    window.Liber.state.reset();
    window.Liber.state.set({ ...tier, visited: vs });
    window.ConstellationRefresh();
    const stone = document.querySelector('.constellation-stone circle');
    return {
      tier: document.querySelector('.constellation-stone').getAttribute('data-patina-tier'),
      fill: stone.getAttribute('fill'),
      grain: document.querySelectorAll('.constellation-stone-grain path').length,
    };
  }, [v, TIER_STATE]);
  stages.push(info);
}
check('patina tiers 0..3 stamped on the stone', stages.map(s => s.tier).join(',') === '0,1,2,3', JSON.stringify(stages));
check('the tint warms per tier', new Set(stages.map(s => s.fill)).size === 4, stages.map(s => s.fill).join(' '));
check('the carving deepens per tier (grain 0/3/6/9)', stages[0].grain === 0 && stages[1].grain === 3 && stages[2].grain === 6 && stages[3].grain === 9, stages.map(s => s.grain).join('/'));
// the pitch's acceptance: screenshots of stages 0–3 differ (motion-free context)
// One fresh page per tier: under reduced motion the compositor reuses the
// svg's layer texture across in-place refreshes, so same-page shots served
// stale pixels (historically 0==1 or 2==3 by one drifting pair — the
// assertion passed on render noise). Seeded before reload, each tier
// paints at first paint on its own compositor. (sidecar lane, 2026-09-13)
const shotBufs = [];
for (let v of [0, 2, 6, 12]) {
  const shotPage = await ctxR.newPage();
  await shotPage.goto(BASE + '/desktop.html', { waitUntil: 'networkidle' });
  await shotPage.evaluate(([vn, tier]) => {
    try { localStorage.clear() } catch (e) {}
    const vs = {};
    for (let i = 0; i < vn; i++) vs['v' + i] = Date.now() - 10 * 24 * 3600 * 1000;
    // cutscene keys included: a fresh page replays the boot cutscene over
    // the constellation and the shot captures the void (they do not count
    // toward patina — visits + artifacts do)
    localStorage.setItem('liber_vacui_v1__keep', JSON.stringify({
      ...tier,
      cutsceneBuild: 'riasondemo2',
      tutorialStage: 'done',
      visited: vs,
      sessionStart: Date.now() - Math.max(vn, 1) * 10 * 24 * 3600 * 1000
    }));
  }, [v, TIER_STATE]);
  await shotPage.reload({ waitUntil: 'networkidle' });
  await shotPage.waitForTimeout(500);
  const el = await shotPage.$('#constellation-svg');
  shotBufs.push(await el.screenshot({ path: 'screenshots/verify-constellation-patina' + shotBufs.length + '.png' }));
  await shotPage.close();
}
const differ = shotBufs[0].equals(shotBufs[1]) === false
  && shotBufs[1].equals(shotBufs[2]) === false
  && shotBufs[2].equals(shotBufs[3]) === false;
check('patina stage screenshots 0–3 all differ', differ, 'bytes ' + shotBufs.map(b => b.length).join('/'));

// ── done ───────────────────────────────────────────────────────────
await browser.close().catch(() => {});
server.kill();
if (errors.length) {
  console.log('\npage/server errors:');
  for (const e of errors) console.log('  ' + e.slice(0, 200));
}
console.log(`\n${failures === 0 ? 'ALL GREEN' : failures + ' FAILED'} — verify-constellation`);
process.exitCode = failures === 0 ? 0 : 1;
