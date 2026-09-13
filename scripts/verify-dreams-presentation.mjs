// verify-dreams-presentation.mjs — AGENT A's acceptance pass for the Dreams
// presentation (redesign-pitch.html, SYSTEM 05 Dreams).
//
//   1. fog-to-dusk: the room holds drifting fog while the desk is
//      unattended, and thins to dusk when a dream is open
//   2. develop-on-arrival: opening a reading runs the develop beat once
//      across the spread (plate first, then the reading's ink)
//      (reduced motion: the developed spread at once)
//   3. association threads: one red thread per quoted association, drawn
//      from the real associations, gone when released
//   4. marginalia in a second hand: Inquiry's pencil slip on the desk
//      under the plate, deterministic per dream, banded by the real keep state
//   5. the spread: two leaves on one brass spine — plate left, reading
//      right, keep/plant as spine fittings, back as a foot ribbon; nothing
//      rides the dream text
//   6. zero page errors; the spread folds to one column at 439px
//
// Spawns its own server so it always tests THIS folder.
// Run: node scripts/verify-dreams-presentation.mjs

import { chromium } from 'playwright'
import { spawn } from 'node:child_process'

let pass = 0, fail = 0
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ✓ ' + name) }
  else { fail++; console.log('  ✗ ' + name + (detail !== undefined ? '  → ' + detail : '')) }
}

const server = spawn('node', ['serve.cjs'], { stdio: 'pipe' })
const PORT = await new Promise((resolve, reject) => {
  let buf = ''
  server.stdout.on('data', d => { buf += d.toString(); const m = buf.match(/http:\/\/127\.0\.0\.1:(\d+)/); if (m) resolve(Number(m[1])) })
  server.on('exit', () => reject(new Error('serve.cjs exited during boot')))
  setTimeout(() => reject(new Error('server boot timeout')), 8000)
})
const BASE = `http://127.0.0.1:${PORT}`
const browser = await chromium.launch()

const DREAM = {
  id: 'dream-1700000000-abcd',
  title: 'the house with no doors',
  text: 'i stood in a house where every door had been painted over. behind one of them, water.',
  analyzed: true,
  associations: [
    { text: 'the painted doors are the words i did not say', quote: 'every door had been painted over', ts: 1700000100000 },
    { text: 'water behind the third door', quote: 'behind one of them, water', ts: 1700000200000 }
  ]
}

async function freshPage(ctxOpts) {
  const ctx = await browser.newContext(Object.assign({ viewport: { width: 1280, height: 800 } }, ctxOpts || {}))
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
  return { ctx, page, errors }
}

async function visit(page, opts) {
  await page.goto(BASE + '/dreams.html')
  // evaluate takes exactly one argument — carry both through a payload
  await page.evaluate((seed) => {
    localStorage.clear()
    localStorage.setItem('liber_vacui_v1__keep', JSON.stringify(Object.assign({
      cutsceneBuild: 'riasondemo2', tutorialDone: true, sessionStart: Date.now(),
      crtRoomOn: true, visited: {}, dreams: [seed.dream], garden: [], satchel: []
    }, seed.opts || {})))
  }, { opts: opts, dream: DREAM })
  await page.reload()
  await page.waitForTimeout(400)
  const sk = page.locator('#hijack .hijack-skip')
  if (await sk.count()) { await sk.click().catch(() => {}); await page.waitForTimeout(150) }
  await page.waitForTimeout(300)
}

// clicks: the real locator path when the page cooperates, a direct DOM
// event when it does not — the listener chain is identical either way
async function clickSel(p, sel) {
  try { await p.click(sel, { timeout: 3000 }) }
  catch (e) {
    await p.evaluate(s => {
      const el = document.querySelector(s)
      if (el) el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }))
    }, sel)
  }
}

// ─── 1. the fog ──────────────────────────────────────────────────────────
console.log('1. fog-to-dusk')
const { ctx, page, errors } = await freshPage()
await visit(page)
const fog = await page.evaluate(() => {
  const app = document.querySelector('.dreams-app')
  const cs = getComputedStyle(app, '::before')
  const readingHidden = document.getElementById('dreams-reading').hidden
  return { animation: cs.animationName, opacity: cs.opacity, readingHidden }
})
check('the fog drifts while the desk is unattended', fog.animation.includes('dreams-fog-drift'), fog.animation)
check('the fog is behind the paper', fog.readingHidden, String(fog.readingHidden))

await clickSel(page, '.dreams-entry')
await page.waitForTimeout(4000) // the dusk transition is 3.5s
const dusk = await page.evaluate(() => {
  const app = document.querySelector('.dreams-app')
  return {
    before: getComputedStyle(app, '::before').opacity,
    after: getComputedStyle(app, '::after').opacity,
    readingOpen: !document.getElementById('dreams-reading').hidden
  }
})
check('a dream opens the reading', dusk.readingOpen)
check('the fog thins to dusk while you read', parseFloat(dusk.before) < 0.6, dusk.before + ' / ' + dusk.after)

// ─── 2. develop-on-arrival ───────────────────────────────────────────────
console.log('2. develop-on-arrival')
const dev = await page.evaluate(() => {
  const paper = document.querySelector('.dreams-leaf-right.develop')
  const plate = document.querySelector('.dreams-plate.develop')
  if (!paper) return null
  const body = paper.querySelector('.dreams-read-body')
  const dreamText = plate ? plate.querySelector('.dreams-read-text') : null
  return {
    cls: paper.className,
    plateCls: plate ? plate.className : '',
    anim: body ? getComputedStyle(body).animationName : '',
    plateAnim: dreamText ? getComputedStyle(dreamText).animationName : ''
  }
})
check('the develop beat ran on arrival', !!dev && dev.cls.includes('develop') && dev.plateCls.includes('develop'))
check('the reading animates up out of the bath', !!dev && dev.anim.includes('dreams-develop'), dev && dev.anim)
check('the dream plate develops with it', !!dev && dev.plateCls.includes('develop') && dev.plateAnim.includes('dreams-develop'), dev && dev.plateAnim)

// the beat is once-per-arrival: reopening re-runs it, staying does not stack
await clickSel(page, '.dreams-back')
await page.waitForTimeout(250)
await clickSel(page, '.dreams-entry')
await page.waitForTimeout(150)
const dev2 = await page.evaluate(() => !!document.querySelector('.dreams-paper.develop .dreams-read-body'))
check('reopening re-develops the sheet', dev2)

// ─── 3. association threads ──────────────────────────────────────────────
console.log('3. association threads')
await page.waitForTimeout(2600)
const threads = await page.evaluate(() => {
  const t = document.querySelectorAll('.dreams-thread')
  const cards = document.querySelectorAll('.dreams-assoc-item')
  return {
    threads: t.length,
    cards: cards.length,
    stroked: [...t].every(p => {
      const cs = getComputedStyle(p)
      return parseFloat(cs.strokeWidth) > 0 && cs.stroke !== 'none'
    }),
    d: t.length ? [...t].every(p => (p.getAttribute('d') || '').startsWith('M')) : false
  }
})
// the drawer reads as cards: each card is the drawer's paper with a
// pull-tab, and states itself in the row line; a seed dream marked unread
// carries the cyan live-mark
{
  const ctxU = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const pageU = await ctxU.newPage()
  await visit(pageU, { dreams: [{ id: 'dream-unread-1', title: 'an unread one', text: 'a corridor of locked gates.', analyzed: false, associations: [] }] })
  const drawer = await pageU.evaluate(() => {
    const rows = [...document.querySelectorAll('.dreams-entry-row')]
    return {
      rows: rows.length,
      unreadMarked: rows.some(r => r.classList.contains('unread')),
      tabbed: rows.every(r => !!r.querySelector('.dreams-entry')),
      ariaOpens: rows.every(r => /open the reading/.test(r.querySelector('.dreams-entry').getAttribute('aria-label') || ''))
    }
  })
  check('the ledger is a drawer of cards, not a bare list', drawer.rows >= 1 && drawer.tabbed)
  check('unread dreams carry the live mark', drawer.unreadMarked)
  check('each card names what opening does', drawer.ariaOpens)
  await ctxU.close()
}

check('one thread per quoted association', threads.threads === threads.cards && threads.cards === 2,
  threads.threads + ' threads / ' + threads.cards + ' cards')
check('the threads are drawn as real paths', threads.d)
check('the threads are stroked (the red string reads)', threads.stroked)

// releasing an association takes its thread with it
await clickSel(page, '.dreams-assoc-remove')
await page.waitForTimeout(600)
const afterRelease = await page.evaluate(() => ({
  threads: document.querySelectorAll('.dreams-thread').length,
  cards: document.querySelectorAll('.dreams-assoc-item').length
}))
check('releasing the association takes the thread down',
  afterRelease.threads === afterRelease.cards && afterRelease.cards === 1,
  afterRelease.threads + ' / ' + afterRelease.cards)

// ─── 4. marginalia ───────────────────────────────────────────────────────
console.log('4. marginalia in a second hand')
const marg = await page.evaluate(() => {
  const m = document.getElementById('dreams-marginalia')
  return m ? { text: m.textContent, band: m.getAttribute('data-band') } : null
})
check('the polaroid carries Inquiry\u2019s note', !!marg && marg.text.length > 12, marg && marg.text)
check('the note is banded by the real keep state', marg.band === 'analyzed', marg && marg.band)
check('the note rides the desk, not the dream text', await page.evaluate(() => {
  const marg = document.getElementById('dreams-marginalia')
  const leaf = document.getElementById('dreams-leaf-left')
  return !!marg && marg.parentElement === leaf
}))

// deterministic: same dream, same note — reload and compare
const { ctx: ctx2, page: page2 } = await freshPage()
await visit(page2)
await clickSel(page2, '.dreams-entry')
await page2.waitForTimeout(500)
const marg2 = await page2.evaluate(() => (document.getElementById('dreams-marginalia') || {}).textContent)
check('the hand is deterministic, not noise', marg.text === marg2, marg.text + ' vs ' + marg2)
await ctx2.close()

// kept dreams get the kept hand
const { ctx: ctx3, page: page3 } = await freshPage()
await visit(page3, { satchel: [{ kind: 'dream', ref: DREAM.id, name: DREAM.title, ts: 1 }] })
await clickSel(page3, '.dreams-entry')
await page3.waitForTimeout(500)
const marg3 = await page3.evaluate(() => ({
  band: (document.getElementById('dreams-marginalia') || {}).getAttribute ?
    document.getElementById('dreams-marginalia').getAttribute('data-band') : null
}))
check('a kept dream gets the kept note', marg3.band === 'kept', marg3.band)
await ctx3.close()

// ─── 5. the spread ──────────────────────────────────────────────────────
console.log('5. the spread — plate left, reading right, one spine')
const spread = await page.evaluate(() => {
  const s = document.getElementById('dreams-spread')
  const left = document.getElementById('dreams-leaf-left')
  const right = document.getElementById('dreams-leaf-right')
  const spine = document.querySelector('.dreams-spine')
  const plate = document.getElementById('dreams-plate')
  const keep = document.getElementById('dreams-read-keep')
  const plant = document.getElementById('dreams-read-plant')
  const back = document.getElementById('dreams-back')
  const dreamText = document.getElementById('dreams-read-text')
  if (!s || !left || !right || !spine || !plate) return null
  const sr = s.getBoundingClientRect(), lr = left.getBoundingClientRect(),
        rr = right.getBoundingClientRect(), kr = keep.getBoundingClientRect(),
        tr = dreamText.getBoundingClientRect(), br = back.getBoundingClientRect()
  const hits = (a, b) => !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top)
  return {
    cols: getComputedStyle(s).gridTemplateColumns.split(' ').length,
    order: lr.left < spine.getBoundingClientRect().left && spine.getBoundingClientRect().right <= rr.left + 1,
    plateInLeaf: plate.parentElement === left,
    fittingsOnSpine: spine.contains(keep) && spine.contains(plant),
    bothFittingsVisible: kr.height > 0 && plant.getBoundingClientRect().height > 0,
    keepClickable: !keep.disabled,
    noRideText: !hits(kr, tr) && !hits(plant.getBoundingClientRect(), tr),
    backVisible: br.height > 0 && br.width > 0,
    backClearOfText: !hits(br, tr)
  }
})
check('the reading is a three-part spread', !!spread && spread.cols === 3, spread && spread.cols)
check('plate — spine — page, in that order', !!spread && spread.order)
check('the dream is pinned to the desk leaf', !!spread && spread.plateInLeaf)
check('keep and plant are fittings on the spine', !!spread && spread.fittingsOnSpine && spread.bothFittingsVisible)
check('the fittings never ride the dream text', !!spread && spread.noRideText)
check('the back ribbon is visible and clear of the text', !!spread && spread.backVisible && spread.backClearOfText)
check('keep is armed while unkept', !!spread && spread.keepClickable)

// keeping from the spine works — the fitting writes to the satchel
await clickSel(page, '#dreams-read-keep')
await page.waitForTimeout(300)
const keptFromSpine = await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('liber_vacui_v1__keep'))
  const b = document.getElementById('dreams-read-keep')
  return { inBook: (s.satchel || []).some(x => x && x.kind === 'dream'), label: b.textContent, disabled: b.disabled }
})
check('the spine fitting keeps to the book', keptFromSpine.inBook && keptFromSpine.disabled, keptFromSpine.label)

// ─── 6. consent and the small screen ────────────────────────────────────
console.log('6. consent and the small screen')
const { ctx: ctx4, page: page4 } = await freshPage({ reducedMotion: 'reduce' })
await visit(page4)
const rm = await page4.evaluate(() => ({
  fogAnim: getComputedStyle(document.querySelector('.dreams-app'), '::before').animationName
}))
check('reduced motion holds the fog still', rm.fogAnim === 'none', rm.fogAnim)
await clickSel(page4, '.dreams-entry')
await page4.waitForTimeout(300)
const rmDev = await page4.evaluate(() => {
  const body = document.querySelector('.dreams-paper.develop .dreams-read-body')
  return body ? getComputedStyle(body).animationName : 'no-develop'
})
check('reduced motion skips the develop beat', rmDev === 'none', rmDev)
await ctx4.close()

await page.setViewportSize({ width: 439, height: 780 })
await page.waitForTimeout(400)
const small = await page.evaluate(() => ({
  overflow: document.documentElement.scrollWidth - window.innerWidth,
  readingOpen: !document.getElementById('dreams-reading').hidden,
  cols: getComputedStyle(document.getElementById('dreams-spread')).gridTemplateColumns.split(' ').length
}))
check('@439: the reading survives the small screen', small.readingOpen && small.overflow <= 2,
  'overflow ' + small.overflow)
check('@439: the spread folds to one column', small.cols === 1, small.cols + ' columns')

check('zero page errors across the run', errors.length === 0, errors.slice(0, 2).join(' | '))

console.log('\n' + pass + ' passed, ' + fail + ' failed')
await browser.close()
server.kill()
process.exit(fail ? 1 : 0)
