// verify-themes.mjs — the skin locker's register, enforced.
//
// The locker went partial once and nothing failed, which is why this gate
// exists. What "partial" looked like:
//
//   * four skins (clean, shadow, mono, gold) were written into machine.css in
//     full — chassis finish, whole-screen grade, and the wash the room takes —
//     and had no tin to rest on, so no traveller could ever wear them;
//   * the caption said "twelve tins" while the register held fourteen, so the
//     locker lied about its own contents;
//   * the carving map keyed `raison`, a typo for the id state actually holds
//     (`riason`), so the nib never lit for the one theme it was cut for.
//
// The rule this file enforces is therefore: **every id apply-theme.js can wear
// is complete in all four registers — chassis skin, screen grade, room wash,
// and a tin in the locker — and every tin in the locker is an id apply-theme.js
// can actually wear.** Either half missing is a half-implemented theme.
//
//   1. the register is one list (apply-theme.js IDS) and every id is whole
//   2. the locker shows exactly that register, plus the one weather
//   3. a tin commits the id it claims: state, body attribute, chassis class
//   4. the caption is derived from the register, not typed next to it
//   5. carving keys are ids, not near-misses
//
// Run: node scripts/verify-themes.mjs

import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'

let pass = 0, fail = 0
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ✓ ' + name) }
  else { fail++; console.log('  ✗ ' + name + (detail !== undefined ? '  → ' + detail : '')) }
}

const read = f => readFileSync(f, 'utf8')
// a comment paints nothing, and the register is written as prose next to code
const strip = txt => txt.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))

const applyTheme = read('src/apply-theme.js')
const IDS = (applyTheme.match(/var IDS = \[([\s\S]*?)\]/) || [, ''])[1]
  .match(/'([a-z0-9]+)'/g).map(s => s.replace(/'/g, ''))
check('apply-theme.js publishes one id register', IDS.length > 0, IDS.join(', '))

const machineCss = strip(read('styles/machine.css'))
const themesCss = strip(read('src/features/themes/themes.css'))
const themesJs = read('src/features/themes/themes.js')
const carvings = read('src/carvings.js')

// ─── 1. every id apply-theme.js can wear is whole ────────────────────────
console.log('1. every id the machine can wear is complete in all four registers')
// corrupted is the base look, and says so: no chassis override, no grade, no
// wash. Asserted rather than skipped, so a future "corrupted" skin has to be
// declared deliberately instead of sneaking in as an exception.
check('corrupted is the base look: no chassis override', !/\.machine\.theme-corrupted\b/.test(machineCss))
check('corrupted is the base look: no grade veil', !/body\[data-theme="corrupted"\] \.theme-grade/.test(machineCss))
check('corrupted is the base look: no room wash', !/body\[data-theme="corrupted"\] \.room::after/.test(machineCss))

const incomplete = []
for (const id of IDS) {
  if (id === 'corrupted') continue
  const parts = {
    chassis: new RegExp('\\.machine\\.theme-' + id + '\\b').test(machineCss),
    grade:   new RegExp('body\\[data-theme="' + id + '"\\] \\.theme-grade').test(machineCss),
    wash:    new RegExp('body\\[data-theme="' + id + '"\\] \\.room::after').test(machineCss),
    tin:     new RegExp('\\.themes-swatch-' + id + '\\b').test(themesCss)
             && new RegExp("id: '" + id + "'").test(themesJs),
  }
  const missing = Object.keys(parts).filter(k => !parts[k])
  if (missing.length) incomplete.push(`${id}: ${missing.join(', ')}`)
}
check('every non-base id has chassis skin, grade, room wash and a tin',
  incomplete.length === 0, incomplete.join(' | '))

// ─── 2. the locker shows exactly the register ───────────────────────────
console.log('2. the locker offers the register and nothing it cannot wear')
// themes.js declares its tiles as `id: '...'` in the THEMES and MACHINE lists.
// The two lists are read here by their own boundaries so a tile added to a
// third list without a swatch still fails below.
const tileIds = []
for (const listName of ['THEMES', 'MACHINE']) {
  const block = themesJs.match(new RegExp('var ' + listName + ' = \\[([\\s\\S]*?)\\n  \\];'))
  if (!block) { check(`themes.js declares a ${listName} list`, false); continue }
  for (const m of block[1].matchAll(/id: '([a-z0-9]+)'/g)) tileIds.push(m[1])
}
check('the two tile lists parse', tileIds.length > 0, tileIds.join(', '))
const orphanTiles = tileIds.filter(id => !IDS.includes(id))
check('no tin offers an id apply-theme.js cannot wear', orphanTiles.length === 0, orphanTiles.join(', '))
const unreachable = IDS.filter(id => id !== 'corrupted' && !tileIds.includes(id))
check('no wearable id is left without a tin', unreachable.length === 0, unreachable.join(', '))
const dupes = tileIds.filter((id, i) => tileIds.indexOf(id) !== i)
check('no id is tinned twice', dupes.length === 0, [...new Set(dupes)].join(', '))

// the group heading that separates the chassis' own tins from the traveller
// register has a rule to render with, or it prints as bare text in the grid
check('the locker has a group heading, and it is styled',
  /the machine(\\u2019|’)s own tins/.test(themesJs) && /\.themes-group\s*\{/.test(themesCss))

// ─── 3. the caption is derived ──────────────────────────────────────────
console.log('3. the count is derived from the register, not typed beside it')
const html = read('themes.html')
const NUM_WORDS = ['none', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
  'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen',
  'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']
const want = NUM_WORDS[tileIds.length] || String(tileIds.length)
check(`the caption words the register (${tileIds.length} tins)`,
  new RegExp('pigment locker — ' + want + ' tins').test(html), `expected "${want}"`)
check('the caption is rewritten from the register at runtime',
  /themes-sub/.test(themesJs) && /words\(ALL\.length\)/.test(themesJs))
check('the count function covers the register it counts',
  /NUM_WORDS/.test(themesJs))

// ─── 4. carving keys are ids, not near-misses ───────────────────────────
console.log('4. the carving map keys real theme ids')
const CARVE = carvings.match(/const THEME_TO_CARVING = \{([\s\S]*?)\n  \};/)
check('carvings.js declares the theme-to-carving map', !!CARVE)
const carveKeys = CARVE ? [...CARVE[1].matchAll(/^\s*([a-z0-9]+):/gm)].map(m => m[1]) : []
const carveTypos = carveKeys.filter(k => !IDS.includes(k))
check('no carving key is a typo for a real id', carveTypos.length === 0, carveTypos.join(', '))
check("the riason carving is keyed by its real id (the `raison` bug)",
  carveKeys.includes('riason') && !carveKeys.includes('raison'))

// ─── 5. a tin actually commits the id it claims ─────────────────────────
console.log('5. a tin commits the id it claims, live')
const server = spawn('node', ['serve.cjs'], { stdio: 'pipe' })
const BASE = await new Promise((resolve, reject) => {
  let buf = ''
  server.stdout.on('data', d => {
    buf += d.toString()
    const m = buf.match(/http:\/\/127\.0\.0\.1:(\d+)/)
    if (m) resolve(`http://127.0.0.1:${m[1]}`)
  })
  server.on('exit', () => reject(new Error('serve.cjs exited during boot')))
  setTimeout(() => reject(new Error('server boot timeout')), 8000)
})

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push('pageerror: ' + e.message))
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()) })

await page.goto(`${BASE}/themes.html`, { waitUntil: 'networkidle', timeout: 20000 })
await page.waitForTimeout(500)

const rendered = await page.evaluate(() => {
  const tiles = [...document.querySelectorAll('.themes-tile')]
    .map(t => t.dataset.theme).filter(Boolean)
  return {
    ids: tiles,
    rainy: !!document.getElementById('themes-rainy-tile'),
    groups: document.querySelectorAll('.themes-group').length,
    caption: (document.querySelector('.themes-sub') || {}).textContent || '',
  }
})
check('the locker renders one tin per register id',
  IDS.every(id => rendered.ids.includes(id)), rendered.ids.join(', '))
check('the locker renders no tin outside the register',
  rendered.ids.length === IDS.length, `rendered ${rendered.ids.length} of ${IDS.length}`)
check('the weather keeps its tile', rendered.rainy)
check('the chassis\u2019 own tins sit under their own heading', rendered.groups === 1, rendered.groups + ' headings')
check('the caption in the DOM words the real register',
  new RegExp('pigment locker — ' + want + ' tins').test(rendered.caption), rendered.caption)

// commit each tin and read back the three writes the machine makes
const mismatched = []
for (const id of IDS) {
  const got = await page.evaluate((theme) => {
    const btn = document.querySelector(`.themes-tile[data-theme="${theme}"]`)
    if (!btn) return { missing: true }
    btn.click()
    const m = document.querySelector('.machine')
    return {
      state: (window.Liber.state.get() || {}).theme,
      body: document.body.getAttribute('data-theme'),
      chassis: m ? m.classList.contains('theme-' + theme) : false,
    }
  }, id)
  if (got.missing || got.state !== id || got.body !== id || !got.chassis) mismatched.push(id + ' → ' + JSON.stringify(got))
}
check('every tin writes state, the body attribute and the chassis class',
  mismatched.length === 0, mismatched.slice(0, 4).join(' | '))

// the four chassis tins are the ones that used to be unreachable: prove the
// skin actually bites rather than merely being applied, by reading the bezel
check('a chassis tin repaints the bezel (clean ≠ corrupted)',
  await page.evaluate(() => {
    const bezel = document.querySelector('.bezel')
    const of = t => {
      document.querySelector(`.themes-tile[data-theme="${t}"]`).click()
      return getComputedStyle(bezel).backgroundImage
    }
    return of('corrupted') !== of('clean')
  }))

check('zero page errors across the run', errors.length === 0, errors.slice(0, 3).join(' | '))

console.log('')
console.log(`${pass} passed, ${fail} failed`)
await browser.close()
server.kill()
process.exit(fail ? 1 : 0)
