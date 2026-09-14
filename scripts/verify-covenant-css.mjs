// verify-covenant-css.mjs — the CSS half of the covenant, enforced.
//
// The covenant is prose, and prose does not fail a build. Every rule checked
// here is one this tree has actually broken at least once, which is the only
// honest reason for a gate to exist:
//
//   1. MOTION WITH CONSENT (§3) — every page loads styles/room.css, which
//      carries one authoritative `*` gate, so consent is structural rather
//      than a per-room selector list that silently stops covering the next
//      animation somebody adds. This gate checks the gate is still there and
//      still `!important`, and that no stylesheet reintroduces a shortened
//      duration in place of an instant state change.
//   2. MOTION IN JAVASCRIPT — a requestAnimationFrame loop is motion too, and
//      CSS cannot reach it. Decorative loops must read the same consent. Two
//      unguarded rAFs are legitimate and named in this file: both are one-shot
//      scheduling (a retry, a scroll-into-view), not animation.
//   3. NOTHING FLOATS (§ drawn props) — every resting object casts a blurred
//      contact shadow. A shadow with no blur is a hard oval.
//   4. OUT OF REGISTER (§ Material) — glassmorphism, floating cards with
//      blurred shadows, neon. The machine is crepuscular: warm void, cream
//      light, gold accent.
//   5. DECLARED HUE FAMILIES — a room may deviate from the base palette, and
//      each room's material is declared in its own stylesheet. What may not
//      happen is a saturated hue nobody declared. Neon is the tell: a colour
//      at full saturation and half lightness is a value no material produces.
//
// Run: node scripts/verify-covenant-css.mjs

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

let pass = 0, fail = 0
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ✓ ' + name) }
  else { fail++; console.log('  ✗ ' + name + (detail !== undefined ? '  → ' + detail : '')) }
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.(css|js)$/.test(name)) out.push(p)
  }
  return out
}

const CSS = walk('styles').concat(walk('src')).filter(f => f.endsWith('.css'))
const JS = walk('src').filter(f => f.endsWith('.js'))
const read = f => readFileSync(f, 'utf8')

// A comment paints nothing. Scans run on comment-stripped text and report on
// it, so a rule may *name* a bad value in order to explain why it is bad —
// which is how the register is written — without tripping its own gate.
const strip = txt => txt.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
const readCSS = f => strip(read(f))

// the two colour tests, in HSV. HSL saturation is the wrong ruler: it climbs
// toward 1 as a colour approaches white, so a cream reads as "pure" and every
// warm highlight in the house is flagged. HSV chroma is what neon is.
function hsv(hex) {
  const h = hex.replace('#', '')
  if (h.length !== 6) return null
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const d = max - min
  let hue = 0
  if (d) {
    if (max === r) hue = 60 * (((g - b) / d) % 6)
    else if (max === g) hue = 60 * ((b - r) / d + 2)
    else hue = 60 * ((r - g) / d + 4)
    if (hue < 0) hue += 360
  }
  return { hue, sat: max ? d / max : 0, val: max }
}
const isNeon = hex => {
  const c = hsv(hex)
  return !!c && c.sat >= 0.97 && c.val >= 0.97
}
// The drift this catches is an electric blue-violet: strong chroma at high
// value in the one hue band no material in this house produces. The band is
// narrow on purpose — it is not "is this colour exciting", it is "is this the
// fairground indigo that turned up in a room made of crimson and tin".
const isElectric = hex => {
  const c = hsv(hex)
  return !!c && c.sat >= 0.62 && c.val >= 0.80 && c.hue >= 235 && c.hue <= 275
}

// The persona register is where a blue-violet is allowed to come from: a
// traveller's own declared colour is a material, not a drift. The test is an
// exact value and not a hue closeness — proximity sounds cleverer and is
// worse, because a declared lavender sits two degrees from an undeclared
// indigo and the gate stops meaning anything.
const PERSONA_FILES = [
  'src/features/themes/themes.js',
  'src/features/themes/themes.css',
  'data/personas.data.js',
]
const declaredColors = new Set()
for (const f of PERSONA_FILES) {
  let txt = ''
  try { txt = read(f) } catch { continue }
  for (const hex of txt.match(/#[0-9a-fA-F]{6}\b/g) || []) declaredColors.add(hex.toLowerCase())
}

// ─── 1. motion with consent, structurally ───────────────────────────────
console.log('1. motion with consent is structural, not a per-room list')
const room = read('styles/room.css')
const gate = room.match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/)
check('styles/room.css carries a top-level consent gate', !!gate)
const gateBody = gate ? gate[1] : ''
check('the gate covers every element, not a selector list',
  /\*\s*,?\s*\n?\s*\*::before\s*,\s*\n?\s*\*::after\s*\{/.test(gateBody) || /^\s*\*,/m.test(gateBody),
  'the gate does not start from `*`')
check('the gate is !important, so a room cannot outrank it by accident',
  /!important/.test(gateBody))
check('the gate kills the journey, not the arrival state',
  /animation-duration:\s*0\.01ms/.test(gateBody) && /transition-duration:\s*0\.01ms/.test(gateBody),
  'animation-duration / transition-duration 0.01ms missing')
check('the gate stops an infinite ambient loop after one pass',
  /animation-iteration-count:\s*1/.test(gateBody))

// every real page loads it: a page that does not is a page with no consent
const pages = readdirSync('.').filter(f => f.endsWith('.html') && !/^redesign-|^website-/.test(f))
const noConsent = pages.filter(f => !read(f).includes('styles/room.css'))
check('every page loads the stylesheet that carries the gate', noConsent.length === 0,
  noConsent.join(', '))

// a shortened duration is a journey, not an instant state change
const shortened = []
for (const f of CSS) {
  const txt = read(f)
  const lines = txt.split('\n')
  lines.forEach((line, i) => {
    if (!/animation-duration|transition-duration/.test(line)) return
    // inside a reduced-motion block, and longer than the 0.01ms instant
    const before = lines.slice(Math.max(0, i - 40), i).join('\n')
    const at = before.lastIndexOf('@media')
    if (at < 0 || !/prefers-reduced-motion/.test(before.slice(at))) return
    const m = line.match(/(\d*\.?\d+)\s*(ms|s)\b/)
    if (!m) return
    const ms = m[2] === 's' ? parseFloat(m[1]) * 1000 : parseFloat(m[1])
    if (ms > 1) shortened.push(`${f}:${i + 1} ${line.trim()}`)
  })
}
check('no reduced-motion block shortens a duration instead of ending it',
  shortened.length === 0, shortened.join(' | '))

// ─── 2. motion in JavaScript ────────────────────────────────────────────
console.log('2. a requestAnimationFrame loop reads the same consent')
// both are one-shot scheduling, not animation: a bounded retry, and moving a
// scroll position once. Neither draws a frame sequence.
const RAF_OK = {
  'src/twelve-works.js': 'bounded retry for late-bound carvings',
  'src/features/dreams/dreams.js': 'scrolls the reading into view once',
  'src/house.js': 'coalesces a resize into one measurement frame',
}
const unguarded = []
for (const f of JS) {
  const txt = read(f)
  if (!/requestAnimationFrame/.test(txt)) continue
  if (/prefers-reduced-motion|REDUCE|reducedMotion|matchMedia/.test(txt)) continue
  if (RAF_OK[f]) continue
  unguarded.push(f)
}
check('every rAF loop either reads consent or is named as one-shot',
  unguarded.length === 0, unguarded.join(', '))

// ─── 3. nothing floats ──────────────────────────────────────────────────
console.log('3. nothing floats: contact shadows are blurred, never hard')
const hardShadow = []
for (const f of CSS) {
  const txt = readCSS(f)
  txt.split('\n').forEach((line, i) => {
    if (!/contact|::after/.test(line)) return
    if (/box-shadow:\s*0\s+[\d.]+px\s+0\s/.test(line)) hardShadow.push(`${f}:${i + 1}`)
  })
}
check('no contact shadow is a hard oval', hardShadow.length === 0, hardShadow.join(', '))
const houseShadow = readCSS('styles/house.css').match(/\.house-prop::after \{[\s\S]*?\n\}/)
check('the house gives every floor-standing prop a blurred contact shadow',
  !!houseShadow && /filter:\s*blur\(/.test(houseShadow[0]))

// ─── 4. out of register ─────────────────────────────────────────────────
console.log('4. glassmorphism, floating cards and neon stay out of register')
const glass = []
for (const f of CSS) {
  readCSS(f).split('\n').forEach((line, i) => {
    if (/backdrop-filter/.test(line) && !/none/.test(line)) glass.push(`${f}:${i + 1}`)
  })
}
check('no stylesheet fogs the room with backdrop-filter', glass.length === 0, glass.join(', '))

const neon = []
for (const f of CSS) {
  readCSS(f).split('\n').forEach((line, i) => {
    for (const hex of line.match(/#[0-9a-fA-F]{6}\b/g) || []) {
      if (isNeon(hex)) neon.push(`${f}:${i + 1} ${hex}`)
    }
  })
}
check('no stylesheet paints a pure neon', neon.length === 0, neon.join(' | '))

// ─── 5. declared hue families ───────────────────────────────────────────
// the same test over every stylesheet, not only the rooms': the indigo this
// gate exists for was in a room's own app stylesheet, not in its house paint
const electricAnywhere = []
for (const f of CSS) {
  // the register itself is where the colours are written down
  if (PERSONA_FILES.includes(f)) continue
  readCSS(f).split('\n').forEach((line, i) => {
    for (const hex of line.match(/#[0-9a-fA-F]{6}\b/g) || []) {
      if (!isElectric(hex)) continue
      if (declaredColors.has(hex.toLowerCase())) continue
      electricAnywhere.push(`${f}:${i + 1} ${hex}`)
    }
  })
}
check('no stylesheet anywhere declares an electric blue-violet',
  electricAnywhere.length === 0, electricAnywhere.join(' | '))

console.log('5. every room declares the material it is painted with')
const ROOMS = ['dreams', 'toybox', 'satchel', 'sea', 'divination', 'games']
for (const id of ROOMS) {
  const css = read(`src/features/${id}/house.css`)
  const declared = /SUBSTRATE/.test(css) && /LIGHT/.test(css) && /TELLS/.test(css)
  check(`${id}: its stylesheet declares substrate, light and tells`, declared)
  // an electric blue-violet with no material behind it is the drift this
  // catches: it is the difference between a painted wall and a screen
  const electric = []
  strip(css).split('\n').forEach((line, i) => {
    for (const hex of line.match(/#[0-9a-fA-F]{6}\b/g) || []) {
      if (isElectric(hex)) electric.push(`${hex}@${i + 1}`)
    }
  })
  check(`${id}: no undeclared electric hue in its own paint`,
    electric.length === 0, [...new Set(electric)].join(', '))
}

// the machine's persona accents are declared materials too, and one of them
// used to be #00ff66 — a value no material produces. It is capped now.
console.log('5b. persona accents are capped, not neon')
const entity = []
for (const f of ['styles/faq.css', 'src/features/themes/themes.js', 'src/features/themes/themes.css']) {
  const txt = f.endsWith('.css') ? readCSS(f) : read(f)
  for (const hex of txt.match(/#[0-9a-fA-F]{6}\b/g) || []) {
    if (isNeon(hex)) entity.push(`${f} ${hex}`)
  }
}
check('entity404\u2019s phosphor is a spent green and not a highlighter',
  entity.length === 0, entity.join(', '))

console.log('')
console.log(`${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
