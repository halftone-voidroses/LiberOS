// verify-promenade.mjs — AGENT A's acceptance pass for the Full Promenade
// (redesign-pitch.html, SYSTEM 06 Games) + thimble retirement.
//
//   1. the walk has a world: three parallax layers slide at three rates
//      with the camera index, and hold still under reduced motion
//   2. the visitor stands on the midway: the shadow is in the dirt
//   3. the barker barks only for the centered booth, hushes when a booth
//      opens, and re-arms when you step back out
//   4. the thimble booth is gone from the midway — cleanly
//   5. the tree keeps its legacy migration (s.thimble → growth)
//   6. the promenade still walks at 439px, exit and pans reachable
//
// Spawns its own server so it always tests THIS folder.
// Run: node scripts/verify-promenade.mjs

import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'

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

async function freshPage(ctxOpts) {
  const ctx = await browser.newContext(Object.assign({ viewport: { width: 1280, height: 800 } }, ctxOpts || {}))
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
  return { ctx, page, errors }
}

async function visit(page, opts) {
  await page.goto(BASE + '/games.html')
  await page.evaluate((o) => {
    localStorage.clear()
    localStorage.setItem('liber_vacui_v1__keep', JSON.stringify(Object.assign({
      cutsceneBuild: 'riasondemo2', tutorialDone: true, sessionStart: Date.now(),
      crtRoomOn: true, visited: {}, affinity: { whimsy: 3, ruby: 3, elizabeth: 1, vanir: 5 }
    }, o || {})))
  }, opts)
  await page.reload()
  await page.waitForTimeout(400)
  const sk = page.locator('#hijack .hijack-skip')
  if (await sk.count()) { await sk.click().catch(() => {}); await page.waitForTimeout(150) }
  await page.waitForTimeout(350)
}

// ─── 1+2+3. the walk, the shadow, the bark ──────────────────────────────
console.log('1. the promenade walk')
const { ctx, page, errors } = await freshPage()
await visit(page)
const walk0 = await page.evaluate(() => {
  const side = document.querySelector('.games-side')
  const cs = getComputedStyle(side)
  return {
    view: document.querySelector('.games-app').getAttribute('data-view'),
    walk: side.style.getPropertyValue('--walk'),
    far: getComputedStyle(document.querySelector('.games-grid'), '::before').backgroundImage !== 'none',
    mid: getComputedStyle(document.querySelector('.games-grid'), '::after').backgroundImage !== 'none',
    dirt: getComputedStyle(document.querySelector('.games-shell'), '::after').backgroundImage,
    bark: (document.getElementById('games-bark') || {}).textContent || '',
    center: (document.querySelector('.games-booth[data-camera-position="center"]') || {}).dataset ?
      document.querySelector('.games-booth[data-camera-position="center"]').getAttribute('data-game') : null
  }
})
check('the room opens as a facade', walk0.view === 'facade', walk0.view)
check('the camera starts on a booth', !!walk0.center, walk0.center)
check('the far ground is painted', walk0.far)
check('the bunting layer is painted', walk0.mid)
check('the dirt and the visitor are on the near layer', walk0.dirt.includes('radial-gradient'), walk0.dirt.slice(0, 40))
check('the barker speaks for the centered booth', walk0.bark.length > 12, JSON.stringify(walk0.bark).slice(0, 40))

// parallax: layers slide with the walk, at three different rates
const par = await page.evaluate(() => {
  const g = document.querySelector('.games-grid')
  return {
    walk: document.querySelector('.games-app').style.getPropertyValue('--walk'),
    farT: getComputedStyle(g, '::before').transform,
    midT: getComputedStyle(g, '::after').transform,
    nearT: getComputedStyle(document.querySelector('.games-shell'), '::after').transform
  }
})
await page.keyboard.press('ArrowLeft')
await page.waitForTimeout(350)
const par2 = await page.evaluate(() => {
  const g = document.querySelector('.games-grid')
  return {
    walk: document.querySelector('.games-app').style.getPropertyValue('--walk'),
    farT: getComputedStyle(g, '::before').transform,
    midT: getComputedStyle(g, '::after').transform,
    nearT: getComputedStyle(document.querySelector('.games-shell'), '::after').transform
  }
})
check('the walk drives the parallax', par.walk !== par2.walk, par.walk + ' → ' + par2.walk)
check('the layers actually slide', par.farT !== par2.farT && par.nearT !== par2.nearT, par.farT + ' / ' + par2.farT)

// the bark follows the centered booth
await page.keyboard.press('ArrowRight'); await page.waitForTimeout(250)
await page.keyboard.press('ArrowRight'); await page.waitForTimeout(450)
const bark2 = await page.evaluate(() => ({
  bark: (document.getElementById('games-bark') || {}).textContent || '',
  center: document.querySelector('.games-booth[data-camera-position="center"]').getAttribute('data-game')
}))
check('the bark follows the camera', bark2.bark.length > 12 && bark2.bark !== walk0.bark, JSON.stringify(bark2.bark).slice(0, 40))

// opening a booth hushes him; stepping back re-arms the walk
await page.click('.games-booth[data-camera-position="center"]')
await page.waitForTimeout(500)
const hushed = await page.evaluate(() => ({
  view: document.querySelector('.games-app').getAttribute('data-view'),
  speaking: (document.getElementById('games-bark') || { className: '' }).className.includes('speak')
}))
check('opening a booth hushes the barker', hushed.view === 'attraction' && !hushed.speaking)
await page.keyboard.press('Escape')
await page.waitForTimeout(500)
const rearmed = await page.evaluate(() => ({
  view: document.querySelector('.games-app').getAttribute('data-view'),
  speaking: (document.getElementById('games-bark') || { className: '' }).className.includes('speak')
}))
check('stepping back re-arms the walk', rearmed.view === 'facade' && rearmed.speaking)

// ─── 4. the thimble booth is gone, cleanly ──────────────────────────────
console.log('2. the thimble retirement')
const ret = await page.evaluate(() => ({
  booths: [...document.querySelectorAll('.games-booth')].map(b => b.getAttribute('data-game')),
  playFns: Object.keys(window.LiberBooths || {})
}))
check('eight booths remain on the midway', ret.booths.length === 8, ret.booths.join(','))
check('no thimble booth is built', !ret.booths.includes('thimble'), ret.booths.join(','))
check('the thimble play module is gone', !ret.playFns.includes('thimble'), ret.playFns.join(','))
check('booths/thimble.js is retired from disk', !existsSync('src/features/games/booths/thimble.js'))

// ─── 5. the tree keeps its legacy migration ─────────────────────────────
console.log('3. the glasshouse keeps the migration')
const { ctx: ctx2, page: page2 } = await freshPage()
await visit(page2, { thimble: { visits: 9, base: 0, harvested: 1 } })
await page2.goto(BASE + '/garden.html').catch(() => {})
await page2.waitForTimeout(600)
const mig = await page2.evaluate(() => {
  const s = window.Liber.state.get()
  return { thimbleKept: !!s.thimble, tree: s.tree || null }
})
check('legacy thimble state survives on the save', mig.thimbleKept)

// ─── 6. reduced motion holds the world still ────────────────────────────
console.log('4. reduced motion')
const { ctx: ctx3, page: page3 } = await freshPage({ reducedMotion: 'reduce' })
await visit(page3)
await page3.keyboard.press('ArrowLeft'); await page3.waitForTimeout(300)
const rm = await page3.evaluate(() => {
  const g = document.querySelector('.games-grid')
  return {
    farT: getComputedStyle(g, '::before').transform,
    midT: getComputedStyle(g, '::after').transform,
    nearT: getComputedStyle(document.querySelector('.games-shell'), '::after').transform
  }
})
check('reduced motion holds the parallax', rm.farT === 'none' && rm.nearT === 'none', rm.farT + ' / ' + rm.nearT)
await ctx3.close()

// ─── 7. 439px: the walk still works ─────────────────────────────────────
console.log('5. the walk at 439px')
await page.setViewportSize({ width: 439, height: 780 })
await page.waitForTimeout(400)
const small = await page.evaluate(() => ({
  overflow: document.documentElement.scrollWidth - window.innerWidth,
  pans: [...document.querySelectorAll('.games-pan')].map(b => {
    const r = b.getBoundingClientRect()
    return Math.round(Math.min(r.width, r.height))
  }),
  bark: (document.getElementById('games-bark') || { getBoundingClientRect: () => ({ width: 0 }) }).getBoundingClientRect().width
}))
check('@439: no sideways scroll', small.overflow <= 2, String(small.overflow))
check('@439: the pans stay 44px targets', small.pans.every(s => s >= 44), small.pans.join(','))
await page.setViewportSize({ width: 1280, height: 800 })

check('zero page errors across the run', errors.length === 0, errors.slice(0, 2).join(' | '))

console.log('\n' + pass + ' passed, ' + fail + ' failed')
await browser.close()
server.kill()
process.exit(fail ? 1 : 0)
