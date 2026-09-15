// verify-trash.mjs — ROOM 14's scope contract, as an acceptance pass.
// Contract: bury → grave appears; simulate visits → weathering; re-add with
// reason → relation exists; nothing erased without ritual; pool wired to
// the room behind the CRT.
//
// Spawns its own server so it always tests THIS folder (same pattern as
// smoke.mjs / verify-crt-room.mjs) — never a stale server on a fixed port.
// Run: node scripts/verify-trash.mjs
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'

const server = spawn('node', ['serve.cjs'], { stdio: 'pipe' })
const PORT = await new Promise((resolve, reject) => {
  let buf = ''
  server.stdout.on('data', d => {
    buf += d.toString()
    const m = buf.match(/http:\/\/127\.0\.0\.1:(\d+)/)
    if (m) resolve(Number(m[1]))
  })
  server.on('exit', () => reject(new Error('serve.cjs exited during boot')))
  setTimeout(() => reject(new Error('server boot timeout')), 8000)
})
const BASE = `http://127.0.0.1:${PORT}`
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
const errors = []
let pass = 0, fail = 0
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ✓ ' + name) }
  else { fail++; console.log('  ✗ ' + name + (detail !== undefined ? '  → ' + detail : '')) }
}
page.on('pageerror', e => errors.push('pageerror: ' + e.message))
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()) })

const KEY = 'liber_vacui_v1__keep'
// Seed past the cutscene build so state.js's one-time shelving migration
// (which sweeps buddy/sea/... into the graveyard) never runs under us.
async function seed(partial) {
  const full = Object.assign({ cutsceneBuild: 'riasondemo2', tutorialDone: true }, partial)
  await page.goto(BASE + '/trash.html')
  await page.evaluate(([k, p]) => {
    localStorage.clear()
    localStorage.setItem(k, JSON.stringify(p))
  }, [KEY, full])
  await page.reload()
  await page.waitForTimeout(300)
  await dismissTour()
}

async function dismissTour() {
  const tour = page.locator('#hijack')
  if (await tour.count()) {
    const skip = tour.locator('.hijack-skip')
    if (await skip.count()) { await skip.click().catch(() => {}) }
    await page.waitForTimeout(120)
  }
}

// ─── 1. bury → grave appears ─────────────────────────────────────────────
console.log('1. bury → grave appears')
await seed({
  buddy: [
    { id: 'st1', kind: 'stone', name: 'the cast buddy' },
    { id: 's1', kind: 'sealed', name: 'a sealed chat' },
  ],
  visited: { v1: Date.now() - 90000000, v2: Date.now() - 80000000 },
})
const before = await page.$$eval('.trash-plot', els => els.length)
check('no plots before any burial', before === 0, 'plots=' + before)
check('empty bed says so', await page.$eval('.trash-plots-empty', e => /takes root/.test(e.textContent)))

// bury everything: arm, then confirm through the prompt
await page.click('#trash-bury-all')
await page.click('#trash-bury-all')
await page.waitForTimeout(80)
check('the interlock opened the prompt', await page.$eval('#trash-save-prompt', e => e.classList.contains('open')))
await page.click('#trash-save-prompt-keep')
await page.waitForTimeout(150)
const gyLen = await page.evaluate(k => JSON.parse(localStorage.getItem(k)).graveyard.length, KEY)
const plotLen = await page.$$eval('.trash-plot', els => els.length)
check('buries reached the graveyard', gyLen === 3, 'graveyard=' + gyLen)
check('a plot per grave', plotLen === gyLen, 'plots=' + plotLen + ' graveyard=' + gyLen)

// ─── 2. nothing erased without ritual ────────────────────────────────────
console.log('2. nothing erased without ritual')
await seed({ buddy: [{ id: 'st1', kind: 'stone', name: 'bud' }], visited: { v1: 1 } })
await page.click('#trash-bury-all')
await page.waitForTimeout(60)
const afterOne = await page.evaluate(k => (JSON.parse(localStorage.getItem(k)).graveyard || []).length, KEY)
check('one press only arms, buries nothing', afterOne === 0, 'graveyard=' + afterOne)
const armed = await page.$eval('#trash-bury-all', e => e.classList.contains('armed'))
check('the arm is visible state', armed)

// ─── 3. weathering + sprouting keyed to patina tiers ─────────────────────
console.log('3. weathering + sprouting tied to patina tiers')
const seedGrave = {
  cutsceneBuild: 'riasondemo2',
  tutorialDone: true,
  graveyard: [
    { kind: 'sigils', entry: { id: 'g1', name: 'a stone' }, buriedAt: Date.now() - 20 * 864e5 },
    { kind: 'buddy', entry: { id: 'g2', name: 'one carried' }, buriedAt: Date.now() - 2 * 864e5 },
  ],
  visited: {}, buddy: [], sea: [],
}
await seed(seedGrave)
const tier0 = await page.evaluate(() => {
  const mound = document.querySelector('.trash-plot-mound')
  const sprout = document.querySelector('.trash-plot-sprout')
  return {
    patina: document.querySelector('.machine').className.match(/patina-\d/),
    mound: getComputedStyle(mound).filter,
    sproutH: getComputedStyle(sprout).height,
    sproutO: getComputedStyle(sprout).opacity,
  }
})
check('tier 0 machine has no patina class', tier0.patina === null, String(tier0.patina))
check('tier 0 sprout has not risen', tier0.sproutH === '0px' && parseFloat(tier0.sproutO) === 0, JSON.stringify(tier0))

// simulate visits + artifacts to reach patina 3 (needs >= 12)
const visits = {}
for (let i = 0; i < 10; i++) visits['v' + i] = Date.now()
await seed(Object.assign({}, seedGrave, {
  visited: visits,
  sea: [{ id: 'a1' }, { id: 'a2' }],
}))
const tier3 = await page.evaluate(() => {
  const mound = document.querySelector('.trash-plot-mound')
  const sprout = document.querySelector('.trash-plot-sprout')
  return {
    cls: document.querySelector('.machine').className.match(/patina-\d/),
    mound: getComputedStyle(mound).filter,
    sproutH: getComputedStyle(sprout).height,
    sproutO: getComputedStyle(sprout).opacity,
    bedPatina: document.getElementById('trash-plots').getAttribute('data-patina'),
    age: Array.from(document.querySelectorAll('.trash-plot')).map(p => p.getAttribute('data-age')),
  }
})
check('lived-in machine reaches patina 3', tier3.cls && tier3.cls[0] === 'patina-3', String(tier3.cls))
check('the plot bed reports its tier', tier3.bedPatina === '3', tier3.bedPatina)
check('the mound weathers at tier 3', tier3.mound !== tier0.mound, tier0.mound + ' vs ' + tier3.mound)
check('the sprout rises at tier 3', parseFloat(tier3.sproutH) > 0 && parseFloat(tier3.sproutO) > 0.5, JSON.stringify(tier3))
check('grave age buckets differ (20-day grave vs 2-day grave)', tier3.age[0] === '2' && tier3.age[1] === '1', JSON.stringify(tier3.age))

// ─── 4. hover-readable grave card ────────────────────────────────────────
console.log('4. hover-readable grave card')
const defaultCard = await page.$eval('#trash-grave-card', e => e.textContent.trim())
check('card rests on its instruction', /hover a plot/.test(defaultCard), defaultCard)
await page.hover('.trash-plot[data-index="0"]')
await page.waitForTimeout(80)
const hoverCard = await page.$eval('#trash-grave-card', e => e.textContent)
check('the grave reads on hover', /the cast buddy/.test(hoverCard), hoverCard)
check('the card names the grave and its age', /buried/.test(hoverCard), hoverCard)
const aria = await page.$eval('.trash-plot[data-index="0"]', e => e.getAttribute('aria-label'))
check('the plot is labelled for screen readers', /the cast buddy/.test(aria), aria)

// ─── 5. re-add with reason → relation exists + reason marker ─────────────
console.log('5. re-add with reason produces the relation edge')
await page.fill('.trash-dig-row[data-index="0"] .trash-why', 'because it still carries weight')
await page.click('.trash-dig-row[data-index="0"] .trash-readd-btn')
const flightStarted = await page.evaluate(() => !!document.querySelector('.trash-reason-flight'))
await page.waitForTimeout(200)
const afterReadd = await page.evaluate(k => {
  const s = JSON.parse(localStorage.getItem(k))
  return {
    graveyard: (s.graveyard || []).length,
    relations: (s.relations || []).length,
    satellites: (s.journal || []).filter(x => x.kind === 'kept-reason').length,
    plots: document.querySelectorAll('.trash-plot').length,
  }
}, KEY)
check('the grave is dug up', afterReadd.graveyard === 1, 'graveyard=' + afterReadd.graveyard)
check('a relation edge now exists', afterReadd.relations === 1, 'relations=' + afterReadd.relations)
check('the reason rides back as a satellite', afterReadd.satellites === 1, 'satellites=' + afterReadd.satellites)
check('the plot count follows the soil', afterReadd.plots === 1, 'plots=' + afterReadd.plots)
check('the reason-marker animates on a motion-allowed machine', flightStarted)

// a row with no reason refuses to dig
await page.click('.trash-dig-row[data-index="0"] .trash-readd-btn')
await page.waitForTimeout(80)
const refused = await page.evaluate(k => JSON.parse(localStorage.getItem(k)).graveyard.length, KEY)
check('no reason → nothing is dug up', refused === 1, 'graveyard=' + refused)

// ─── 6. pool contribution wired to the room behind the CRT ───────────────
console.log('6. the pool shares the yard\'s water table')
await page.goto(BASE + '/desktop.html')
await page.waitForTimeout(400)
check('the dark room is reachable', await page.evaluate(() => !!(window.Liber && window.Liber.crtRoom)))
const pool0 = await page.evaluate(() => window.Liber.crtRoom.facts().pool)
await page.goto(BASE + '/trash.html')
await page.waitForTimeout(200)
await page.evaluate(([k, n]) => {
  const s = JSON.parse(localStorage.getItem(k))
  s.cutsceneBuild = 'riasondemo2'
  s.graveyard = []
  for (let i = 0; i < n; i++) s.graveyard.push({ kind: 'buddy', entry: { id: 'b' + i, name: 'x' + i }, buriedAt: Date.now() })
  localStorage.setItem(k, JSON.stringify(s))
}, [KEY, 12])
await page.goto(BASE + '/desktop.html')
await page.waitForTimeout(400)
const poolFull = await page.evaluate(() => window.Liber.crtRoom.facts().pool)
check('burials raise the pool behind the CRT', poolFull > pool0, pool0 + ' → ' + poolFull)
check('the pool tops out at 1', poolFull === 1, String(poolFull))

// ─── 7. no console/page errors ───────────────────────────────────────────
console.log('7. no errors')
check('zero page errors', errors.length === 0, errors.join(' | '))

console.log('\n' + pass + ' passed, ' + fail + ' failed')
await browser.close()
server.kill()
process.exit(fail ? 1 : 0)
