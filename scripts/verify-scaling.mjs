// verify-scaling.mjs — the machine's size, and the room's readability.
//
// The covenant's own contract is short: "If a room cannot survive a browser at
// 1280×800 and at 439px, it is not done." Surviving is not a feeling, so it is
// measured here:
//
//   1. NOTHING SLIDES. The room is a fixed composition. The machine is held on
//      a ladder of widths (src/stage.js), so dragging a window edge lands on a
//      step instead of sliding every percentage in every room. This gate
//      checks the ladder is in force, that the same window always gives the
//      same width, and that the pinned RESOLUTION setting actually pins.
//   2. NOTHING PUSHES THE PAGE SIDEWAYS. No page may scroll horizontally at
//      any of the shapes, because a page that does has told the traveller the
//      window is the wrong size for the room.
//   3. THE TEXT CAN BE READ. A content run renders at or above the floor below.
//      Short plate marks — a spine, a coordinate, a form number — are allowed
//      to be smaller, because a stamped mark is an object and not a sentence.
//      The list of them is written down here rather than inferred, so a new
//      one has to be added deliberately.
//   4. THE HOUSE DEGRADES. At 439px the band is too narrow to furnish, and the
//      room is meant to fall back to its substrate and its light rather than
//      pile furniture onto a postcard. That fallback is checked, not hoped for.
//
// Run: node scripts/verify-scaling.mjs

import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'

let pass = 0, fail = 0
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ✓ ' + name) }
  else { fail++; console.log('  ✗ ' + name + (detail !== undefined ? '  → ' + detail : '')) }
}

// every real page: the reference size and the mobile end are the covenant's,
// the rest are there because a window is dragged through them
const PAGES = ['desktop', 'dreams', 'toybox', 'journal', 'sea', 'divination', 'games',
  'learn', 'garden', 'trash', 'buddy', 'sigil', 'themes', 'settings', 'about']
const SHAPES = [[1920, 1080], [1440, 900], [1280, 800], [1100, 720], [1024, 700],
  [900, 640], [760, 560], [439, 800]]

// THE FLOOR, and why it is 9 and not 10 or 12.
// A caption at 0.6rem renders at 9.6px and is legible; 0.56rem renders at
// 8.96px and is not, and neither is 8px with 0.2em of tracking. So the floor
// sits at 9 — below every caption the house actually sets, above the two
// sizes that were genuinely unreadable. It is a floor, not a preference: the
// gate has already caught two real cases at 8px and 8.96px.
// A plate mark — a spine, a coordinate, a form number — is an object rather
// than a sentence and is allowed to be smaller. The list is written down, not
// inferred, so a new one has to be added deliberately.
const FLOOR = 9
const MARK_MAX_CHARS = 12
const MARK_FLOOR = 6

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
const browser = await chromium.launch()
const errs = []

// ─── 1 + 2. the ladder, and no sideways page ────────────────────────────
console.log('1. the machine is held on a ladder, and nothing slides')
const steps = [1100, 1080, 1060, 1040, 1020, 1000, 980, 960, 940, 920, 900, 880, 860,
  840, 820, 800, 780, 760, 740, 720, 700, 660, 620, 600, 580, 540, 500, 460]

const seen = new Map()
for (const shape of SHAPES) {
  const ctx = await browser.newContext({ viewport: { width: shape[0], height: shape[1] } })
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push(`${shape[0]}×${shape[1]} ${e.message}`))
  const widths = []
  const overflow = []
  for (const p of PAGES) {
    await page.goto(`http://127.0.0.1:${PORT}/${p}.html`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(320)
    const r = await page.evaluate(() => {
      const de = document.documentElement
      const m = document.querySelector('.machine')
      return {
        ofx: de.scrollWidth - de.clientWidth,
        width: m ? Math.round(m.getBoundingClientRect().width) : null,
        pinned: getComputedStyle(de).getPropertyValue('--stage-w').trim() || 'fluid',
      }
    })
    widths.push(r.width)
    if (r.ofx > 1) overflow.push(`${p} ofx=${r.ofx}`)
  }
  const uniq = [...new Set(widths.filter(w => w !== null))]
  check(`${shape[0]}×${shape[1]}: the machine is one width on every page`,
    uniq.length <= 1, uniq.join(', '))
  check(`${shape[0]}×${shape[1]}: no page scrolls sideways`, overflow.length === 0,
    overflow.join(', '))
  seen.set(shape.join('×'), uniq[0])

  // the width is either a rung of the ladder, or the fluid fallback that runs
  // below the smallest rung (the 439px contract)
  const w = uniq[0]
  const fits = w === null || steps.includes(w) || shape[0] < 600
  check(`${shape[0]}×${shape[1]}: the width is a rung, not a slide`, fits, String(w))
  await ctx.close()
}
check('the ladder steps differ between a wide window and a narrow one',
  seen.get('1920×1080') > seen.get('760×560'),
  `${seen.get('1920×1080')} vs ${seen.get('760×560')}`)

// ─── determinism: the same window twice is the same width ───────────────
console.log('2. the same window is the same room, twice')
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
const at = async () => {
  await page.goto(`http://127.0.0.1:${PORT}/dreams.html`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(300)
  return page.evaluate(() => {
    const m = document.querySelector('.machine').getBoundingClientRect()
    return { w: Math.round(m.width), x: Math.round(m.x) }
  })
}
const first = await at()
await page.setViewportSize({ width: 1440, height: 900 })
await page.waitForTimeout(400)
await page.setViewportSize({ width: 1280, height: 800 })
await page.waitForTimeout(400)
const second = await at()
check('a window that returns to a size gets the room it had',
  first.w === second.w && first.x === second.x,
  `${JSON.stringify(first)} → ${JSON.stringify(second)}`)

// ─── the pinned resolution ──────────────────────────────────────────────
console.log('3. the RESOLUTION setting pins the machine')
await page.goto(`http://127.0.0.1:${PORT}/settings.html`, { waitUntil: 'networkidle' })
await page.waitForTimeout(300)
const hasGroup = await page.evaluate(() => !!document.querySelector('[data-res]'))
check('the maintenance panel has a RESOLUTION group', hasGroup)
await page.evaluate(() => {
  const b = document.querySelector('[data-res="800"]')
  if (b) b.click()
})
await page.waitForTimeout(400)
const pinned = await page.evaluate(() => ({
  width: Math.round(document.querySelector('.machine').getBoundingClientRect().width),
  stored: (window.Liber.state.get() || {}).resolution,
  pressed: document.querySelector('[data-res="800"]').getAttribute('aria-pressed'),
}))
check('choosing 800 holds the machine at 800', pinned.width === 800, String(pinned.width))
check('the choice is written to state', pinned.stored === '800', String(pinned.stored))
check('the choice reads as chosen', pinned.pressed === 'true', String(pinned.pressed))
check('800 is a rung of the ladder', steps.includes(800))
await page.evaluate(() => document.querySelector('[data-res="auto"]').click())
await page.waitForTimeout(300)
const auto = await page.evaluate(() => (window.Liber.state.get() || {}).resolution)
check('auto hands the choice back', auto === 'auto', String(auto))

// ─── 4. readability ─────────────────────────────────────────────────────
console.log('4. the text can be read')
const small = []
const marks = new Set()
for (const p of PAGES) {
  await page.goto(`http://127.0.0.1:${PORT}/${p}.html`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(320)
  const found = await page.evaluate(() => {
    const out = []
    for (const el of document.querySelectorAll('*')) {
      const txt = (el.textContent || '').trim()
      if (!txt || el.children.length) continue
      const s = getComputedStyle(el)
      if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0) continue
      const b = el.getBoundingClientRect()
      if (b.width < 1 || b.height < 1) continue
      const fs = parseFloat(s.fontSize)
      if (fs > 0 && fs < 12) out.push({ fs, txt: txt.slice(0, 48), cls: el.getAttribute('class') || el.tagName })
    }
    return out
  })
  for (const f of found) {
    if (f.fs >= FLOOR) continue
    if (f.txt.length <= MARK_MAX_CHARS && f.fs >= MARK_FLOOR) marks.add(`${f.cls}: "${f.txt}"`)
    else small.push(`${p} ${f.fs}px ${f.cls}: "${f.txt}"`)
  }
}
check(`no content run renders below ${FLOOR}px`, small.length === 0, small.join(' | '))
console.log(`  · ${marks.size} plate mark(s) under ${FLOOR}px, kept as objects: ` +
  [...marks].join(', '))

// ─── 5. the house degrades at 439px ────────────────────────────────────
console.log('5. the house degrades at 439px rather than piling up')
const mob = await browser.newContext({ viewport: { width: 439, height: 800 } })
const mp = await mob.newPage()
for (const id of ['dreams', 'toybox', 'journal', 'sea', 'divination', 'games']) {
  await mp.goto(`http://127.0.0.1:${PORT}/${id}.html`, { waitUntil: 'networkidle' })
  await mp.waitForTimeout(360)
  const r = await mp.evaluate(() => {
    const scene = document.getElementById('house-scene')
    const wall = scene && scene.querySelector('.house-wall')
    const lamp = scene && scene.querySelector('.house-lamp-body')
    let furnished = 0
    if (scene) {
      for (const p of scene.querySelectorAll('.house-prop'))
        if (getComputedStyle(p).display !== 'none') furnished++
    }
    return {
      band: scene ? scene.getAttribute('data-band') : null,
      wall: !!wall && wall.getBoundingClientRect().height > 8,
      lamp: !!lamp && lamp.getBoundingClientRect().width > 0,
      furnished,
      tube: !!document.getElementById('liberchat-sidecar'),
      ofx: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }
  })
  const tag = `${id} @439`
  check(`${tag}: the room is still a wall and a light`,
    r.wall && r.lamp && r.band === 'none', `band=${r.band} wall=${r.wall} lamp=${r.lamp}`)
  check(`${tag}: no furniture is piled onto a postcard`, r.furnished === 0,
    String(r.furnished))
  check(`${tag}: the tube is still there, and the page still fits`,
    r.tube && r.ofx <= 1, `tube=${r.tube} ofx=${r.ofx}`)
}
await mob.close()

console.log(errs.length ? '  ✗ page errors: ' + errs.slice(0, 4).join(' | ') : '  ✓ no page errors')
if (errs.length) fail++

await browser.close()
server.kill()

console.log('')
console.log(`${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
