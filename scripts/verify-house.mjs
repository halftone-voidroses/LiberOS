// verify-house.mjs — the house the machine stands in, enforced.
//
// Liber is a house. The main menu keeps the house's own room (the room behind
// the CRT, src/features/crt-room/); every traveller's page stands in that
// traveller's own room: the same building, a different room. The register is
// data/rooms.data.js, the architecture is styles/house.css, the finish is each
// room's src/features/<id>/house.css, and the hooks are wired by src/house.js.
//
// Every failure this gate exists for is silent — the room still loads, the
// page still works, and the house quietly stops being a house:
//
//   1. a page is registered and nobody paints its room, so the traveller
//      stands in the spare room and nothing says so
//   2. furniture is composed into the band the machine covers: built, paid
//      for, invisible. This is the failure the band exists to prevent, so it
//      is checked rather than eyeballed — and at two window shapes, because
//      "it looked right on my screen" is how it got in
//   3. the house paints over the room behind the CRT: the machine's backdrop
//      is opaque, so a feature that changes it must yield while the gaze is
//      open (COVENANT, rule 4)
//   4. a room declares memory it never renders, or renders memory it never
//      declared — the two-sided rule verify-room-hooks.mjs applies to the
//      machine's own room, applied here to every other room in the house
//   5. a room's prose names a tell the room does not build, or a retired
//      piece of furniture comes back
//
// Run: node scripts/verify-house.mjs

import { readFileSync } from 'node:fs'
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'

let pass = 0, fail = 0
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ✓ ' + name) }
  else { fail++; console.log('  ✗ ' + name + (detail !== undefined ? '  → ' + detail : '')) }
}

// two window shapes: the app's own reference size, and the short/small end
// where the band collapses toward nothing. The room must be a room at both.
const SHAPES = [
  { w: 1280, h: 800, label: '1280×800' },
  { w: 900, h: 640, label: '900×640' },
]

// ─── 1. the register ────────────────────────────────────────────────────
console.log('1. the register parses and every room declares a material')
const data = readFileSync('data/rooms.data.js', 'utf8')
const sandbox = { window: {} }
// the register is a plain object literal on window; evaluate it, never import
new Function('window', data)(sandbox.window)
const ROOMS = sandbox.window.LiberRooms
const ids = Object.keys(ROOMS || {})
check('the register lists rooms', ids.length > 0, ids.length + ' rooms')

const NEED = ['place', 'traveller', 'substrate', 'light', 'tells', 'props', 'memory']
const HOOKS = ['lamp', 'shelf', 'pool', 'board']
for (const id of ids) {
  const r = ROOMS[id]
  const missing = NEED.filter(k => r[k] === undefined)
  check(`rooms.data.js:${id} declares its material`, missing.length === 0,
    missing.length ? 'missing ' + missing.join(', ') : '')
  const badHook = (r.memory || []).filter(m => !HOOKS.includes(m))
  check(`rooms.data.js:${id} memory is in the vocabulary`, badHook.length === 0,
    badHook.join(', '))
  check(`rooms.data.js:${id} tells the truth about its own name`, r.id === id, r.id)
  const badFloor = (r.floor || []).filter(f => !r.props.includes(f))
  check(`rooms.data.js:${id} floor props are props`, badFloor.length === 0,
    badFloor.join(', '))
  check(`rooms.data.js:${id} has tells to be traceable to`, (r.tells || []).length >= 2,
    (r.tells || []).length + ' tells')
}

// ─── 2. each room paints in its own file, scoped to itself ──────────────
console.log('2. every room paints in its own file, scoped to itself')
for (const id of ids) {
  const path = `src/features/${id}/house.css`
  let css = ''
  try { css = readFileSync(path, 'utf8') } catch { /* reported below */ }
  check(`src/features/${id}/house.css exists`, css.length > 0, path)
  if (!css) continue
  const scopes = (css.match(/^\.house-scene\[data-house="[a-z0-9]+"\]/gm) || [])
    .map(s => s.match(/"([a-z0-9]+)"/)[1])
  const foreign = [...new Set(scopes)].filter(s => s !== id)
  check(`src/features/${id}/house.css names no other room`, foreign.length === 0,
    foreign.join(', '))
  check(`src/features/${id}/house.css records where it is`,
    css.includes(ROOMS[id].place), ROOMS[id].place)
  // the prose must be traceable: a tell names furniture, and furniture that
  // the room does not build is a tell the room is lying about
  const built = ROOMS[id].props
  check(`src/features/${id}/house.css places every prop it declares`,
    built.every(p => css.includes(`[data-prop="${p}"]`)),
    built.filter(p => !css.includes(`[data-prop="${p}"]`)).join(', '))
}

// ─── 3. live, at two window shapes ──────────────────────────────────────
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

for (const shape of SHAPES) {
  console.log(`3. the room mounts and is visible at ${shape.label}`)
  const ctx = await browser.newContext({ viewport: { width: shape.w, height: shape.h } })
  const page = await ctx.newPage()
  page.on('pageerror', e => errs.push(e.message))

  for (const id of ids) {
    await page.goto(`http://127.0.0.1:${PORT}/${id}.html`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(400)
    const r = await page.evaluate(() => {
      const scene = document.getElementById('house-scene')
      if (!scene) return { mounted: false }
      const m = document.querySelector('.machine')
      const mr = m ? m.getBoundingClientRect() : null
      const vis = (el) => {
        if (!el) return false
        const s = getComputedStyle(el)
        if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0) return false
        const b = el.getBoundingClientRect()
        return b.width > 0.5 && b.height > 0.5
      }
      const covered = (el) => {
        if (!mr) return false
        const b = el.getBoundingClientRect()
        return b.left >= mr.left && b.right <= mr.right &&
               b.top >= mr.top && b.bottom <= mr.bottom
      }
      const props = [...scene.querySelectorAll('.house-prop')]
      return {
        mounted: true,
        declared: scene.getAttribute('data-house'),
        band: scene.getAttribute('data-band'),
        props: props.length,
        built: props.filter(vis).length,
        offstage: props.filter(vis).filter(covered).map(p => p.getAttribute('data-prop')),
        hiddenShapes: props.filter(p => !vis(p)).map(p => p.getAttribute('data-prop')),
        hooks: {
          lamp: vis(scene.querySelector('.house-lamp-body')),
          shelf: vis(scene.querySelector('.house-shelf')),
          pool: vis(scene.querySelector('.house-pool')),
          board: vis(scene.querySelector('.house-pins')),
        },
        hookShape: (() => {
          const o = {}
          for (const [k, sel] of [['lamp', '.house-lamp-body'], ['shelf', '.house-shelf'],
            ['pool', '.house-pool'], ['board', '.house-pins']]) {
            const e = scene.querySelector(sel)
            if (!e) { o[k] = 'absent'; continue }
            const s = getComputedStyle(e), b = e.getBoundingClientRect()
            o[k] = `${s.display} ${Math.round(b.width)}×${Math.round(b.height)}`
          }
          return o
        })(),
        wallVisible: vis(scene.querySelector('.house-wall')) &&
          scene.querySelector('.house-wall').getBoundingClientRect().height > 8,
        retired: scene.querySelector('.house-door') ? 'door' : null,
        tube: vis(document.getElementById('liberchat-sidecar')),
        memory: (window.LiberRooms && window.LiberRooms[
          scene.getAttribute('data-house')] || {}).memory || [],
      }
    })

    const tag = `${id} @${shape.label}`
    check(`${tag}: the house mounts`, r.mounted)
    if (!r.mounted) continue
    check(`${tag}: the house is this traveller's room`, r.declared === id, r.declared)
    check(`${tag}: the wall is visible`, r.wallVisible)
    check(`${tag}: no retired furniture is built`, r.retired === null, String(r.retired))
    // the composition invariant: nothing that is rendered is behind the glass
    check(`${tag}: no furniture is composed behind the machine`,
      r.offstage.length === 0, r.offstage.join(', '))
    check(`${tag}: the room is not an empty wall`,
      r.built >= 2 || r.band === 'none', `${r.built} of ${r.props} props visible (band ${r.band})`)
    check(`${tag}: the tube stands in the room`, r.tube)
    // two-sided: memory declared ⇒ rendered, rendered ⇒ declared
    for (const h of HOOKS) {
      const declared = r.memory.includes(h)
      const rendered = r.hooks[h]
      check(`${tag}: ${h} ${declared ? 'is rendered' : 'is not rendered'}`,
        declared === rendered,
        `declared=${declared} rendered=${rendered} (${r.hookShape[h]})`)
    }
  }
  await ctx.close()
}

// ─── 4. the house yields while the gaze is open ─────────────────────────
console.log('4. the house yields to the room behind the CRT')
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
await page.goto(`http://127.0.0.1:${PORT}/dreams.html`, { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
const before = await page.evaluate(() =>
  Number(getComputedStyle(document.getElementById('house-scene')).opacity))
check('dreams: the house is painting when the gaze is shut', before === 1, String(before))
await page.evaluate(() => document.body.classList.add('crt-room-open'))
await page.waitForTimeout(700)
const after = await page.evaluate(() =>
  Number(getComputedStyle(document.getElementById('house-scene')).opacity))
check('dreams: with the gaze open the house is not painting', after === 0, String(after))
await page.evaluate(() => document.body.classList.remove('crt-room-open'))
await page.waitForTimeout(700)
const restored = await page.evaluate(() =>
  Number(getComputedStyle(document.getElementById('house-scene')).opacity))
check('dreams: and it comes back when the gaze shuts', restored === 1, String(restored))

// desktop keeps the house's own room: crt-room owns it, not this module
await page.goto(`http://127.0.0.1:${PORT}/desktop.html`, { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
const desk = await page.evaluate(() => !!document.getElementById('house-scene'))
check('desktop: the house has its own room (crt-room owns it)', desk === false,
  'desktop.html also mounts #house-scene — two owners for one room')

// ─── 5. the band follows the window ─────────────────────────────────────
console.log('5. the band is measured, not guessed')
await page.goto(`http://127.0.0.1:${PORT}/dreams.html`, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
const bandSmall = await page.evaluate(() => window.Liber.house.facts().band)
await page.setViewportSize({ width: 1920, height: 1080 })
await page.waitForTimeout(600)
const bandBig = await page.evaluate(() => window.Liber.house.facts().band)
check('the band is published to the room',
  !!bandSmall && bandSmall.unit > 0 && bandSmall.w > 0, JSON.stringify(bandSmall))
check('the band tracks the window rather than a fixed percentage',
  !!bandBig && bandBig.unit > bandSmall.unit && bandBig.w > bandSmall.w,
  `${JSON.stringify(bandSmall)} → ${JSON.stringify(bandBig)}`)

// ─── 6. motion with consent, in the house itself ────────────────────────
console.log('6. the house respects reduced motion')
const rm = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' })
const rp = await rm.newPage()
await rp.goto(`http://127.0.0.1:${PORT}/dreams.html`, { waitUntil: 'networkidle' })
await rp.waitForTimeout(400)
const motion = await rp.evaluate(() => {
  const scene = document.getElementById('house-scene')
  if (!scene) return null
  let worst = 0, who = ''
  for (const el of [scene, ...scene.querySelectorAll('*')]) {
    const s = getComputedStyle(el)
    for (const v of [s.animationDuration, s.transitionDuration]) {
      for (const part of String(v).split(',')) {
        const t = part.trim()
        const ms = t.endsWith('ms') ? parseFloat(t) : t.endsWith('s') ? parseFloat(t) * 1000 : 0
        if (ms > worst) { worst = ms; who = el.className || el.tagName }
      }
    }
  }
  return { worst, who }
})
check('dreams: house motion is an instant state change under reduced motion',
  motion !== null && motion.worst <= 1, motion ? `${motion.worst}ms on ${motion.who}` : 'no scene')
await rm.close()

console.log(errs.length ? '  ✗ page errors: ' + errs.join(' | ') : '  ✓ no page errors')
if (errs.length) fail++

await browser.close()
server.kill()

console.log('')
console.log(`${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
