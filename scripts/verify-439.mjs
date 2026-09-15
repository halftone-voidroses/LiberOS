// verify-439.mjs — lane C's gate: every room survives the 439×780 stage.
//
// The shell hands rooms a workable glass (styles/machine.css, lane C: 96vw
// on narrow screens); the room then survives on it. This pass walks every
// page at 439×780 and checks the contract end to end:
//
//   1. the shell keeps its half — the machine's glass is honest (≥90vw)
//   2. no horizontal document overflow
//   3. no clipped control (fixed-height box whose content is taller)
//   4. no dead control — nothing visible whose centre hit-test lands on
//      another element, at or below the room's recorded baseline
//   5. every room with an exit can take it: the exit is visible, its
//      EFFECTIVE hit area (box + hit-area extenders, affordance contract 1:
//      "small visible marks may be smaller; the hit area is not") is ≥44px,
//      hittable, and clicking it lands on desktop.html
//
// buddy.html is not in the room list: it retired to a permanent archive
// note pointing at the lamp (CHANGELOG: the wax room is now the lamp) — a
// designed overlay, not a furniture collision.
//
// Baselines are RECORDED ARTIFACTS, not allowances to grow. Each one names
// what it is:
//
//   desktop  clip=0  keybank has no hit-area extender pseudo-elements;
//                    the retired dial arrows' ::after extenders are gone
//                    with the radial strip.
//   toybox   dead=3  shelf objects scrolled out of a horizontal strip's
//                    visible 70px (the strip scrolls them into reach —
//                    lane C's compact layout). The probe counts the
//                    out-of-view objects' centres; they are reachable.
//   journal  dead=1  the find input's centre hit-test resolves to the
//                    binding's decorative SVG — lane B's room, reported,
//                    not fixed here (SHARED-RULES §4).
//
// Run: node scripts/verify-439.mjs

import { chromium } from 'playwright'
import { spawn } from 'node:child_process'

let pass = 0, fail = 0
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ✓ ' + name) }
  else { fail++; console.log('  ✗ ' + name + (detail !== undefined ? '  → ' + detail : '')) }
}

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

const KEY = 'liber_vacui_v1__keep'
const SEED = { cutsceneBuild: 'riasondemo2', tutorialDone: true, tutorialStage: 'done', sessionStart: Date.now(), visited: {} }

// room → its exit control (the × that walks out to the desktop). Rooms
// without an entry are home or machine pages; their exit contract is the
// keybank, checked on the desktop row below.
const EXIT = {
  divination: 'divination-exit', learn: 'learn-exit', games: 'games-exit',
  journal: 'journal-exit', themes: 'themes-exit', garden: 'garden-exit',
  toybox: 'toybox-exit', trash: 'trash-exit', sea: 'sea-exit',
  dreams: 'dreams-exit', buddy: 'buddy-exit',
}

const BASELINE = {
  desktop: { dead: 0, clip: 0 },
  toybox: { dead: 3, clip: 0 },
  journal: { dead: 1, clip: 0 },
}
const baselineFor = r => BASELINE[r] || { dead: 0, clip: 0 }

const ROOMS = ['desktop', 'sigil', 'divination', 'learn', 'games', 'journal',
  'sea', 'garden', 'dreams', 'themes', 'settings', 'trash', 'toybox',
  'about', 'index', 'loading']

const PROBE = () => {
  const out = { ofx: 0, dead: [], clip: [] }
  const de = document.documentElement
  out.ofx = de.scrollWidth - de.clientWidth
  const vw = window.innerWidth, vh = window.innerHeight
  const name = el => String(el.id || el.getAttribute('aria-label') || el.className || el.tagName).slice(0, 40)
  const vis = el => el.checkVisibility && el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) &&
    !el.closest('[aria-hidden="true"], [inert]')
  const R = el => el.getBoundingClientRect()
  const controls = []
  for (const el of document.querySelectorAll('button, [role="button"], input, select, textarea, a[href]')) {
    if (!vis(el) || el.disabled) continue
    const r = R(el)
    if (r.width < 1 || r.height < 1) continue
    controls.push({ el, r })
  }
  for (const c of controls) {
    const r = c.r
    const cx = Math.round(r.left + r.width / 2), cy = Math.round(r.top + r.height / 2)
    if (cx < 0 || cy < 0 || cx > vw || cy > vh) continue
    const top = document.elementFromPoint(cx, cy)
    if (!top) continue
    if (top === c.el || c.el.contains(top) || top.contains(c.el)) continue
    out.dead.push(name(c.el) + ' blocked by ' + name(top))
  }
  for (const el of document.querySelectorAll('*')) {
    if (!vis(el) || el.children.length || !el.textContent.trim()) continue
    const cs = getComputedStyle(el)
    if (cs.position === 'absolute' && (cs.height !== 'auto' || cs.maxHeight !== 'none')) {
      if (el.scrollHeight > el.clientHeight + 2 && el.clientHeight > 0) out.clip.push(name(el) + ' ' + el.scrollHeight + '>' + el.clientHeight)
    }
  }
  return out
}

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 439, height: 780 } })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push('pageerror: ' + e.message))
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()) })

async function loadClean(room) {
  // enter from the desktop so the room's history-back exit has a home to
  // land on — the way a visitor actually arrives
  await page.goto(`${BASE}/desktop.html`, { waitUntil: 'networkidle', timeout: 20000 })
  await page.evaluate(([k, p]) => {
    localStorage.clear()
    localStorage.setItem(k, JSON.stringify(p))
  }, [KEY, SEED])
  await page.goto(`${BASE}/${room}.html`, { waitUntil: 'networkidle', timeout: 20000 })
  await page.waitForTimeout(700)
  const skip = await page.$('.hijack-skip')
  if (skip) { await skip.click().catch(() => {}); await page.waitForTimeout(400) }
}

// ─── 1. the shell keeps its half ─────────────────────────────────────────
console.log('1. the shell hands rooms an honest glass')
await loadClean('desktop')
const glass = await page.evaluate(() => {
  const m = document.querySelector('.machine')
  return m ? m.getBoundingClientRect().width : 0
})
check('the machine fills the narrow room (≥90vw)', glass >= 0.9 * 439, Math.round(glass) + 'px of 439px')

// ─── 2–4. every room, one pass ───────────────────────────────────────────
console.log('2. the rooms survive the stage')
for (const room of ROOMS) {
  await loadClean(room)
  const p = await page.evaluate(PROBE)
  const base = baselineFor(room)
  check(`${room}: no sideways scroll`, p.ofx <= 1, 'ofx=' + p.ofx)
  check(`${room}: no clipped control`, p.clip.length <= base.clip, p.clip.slice(0, 3).join(' ; ') || 'none')
  check(`${room}: no dead control (baseline ${base.dead})`, p.dead.length <= base.dead,
    p.dead.slice(0, 4).join(' ; ') || 'none')

  // ─── 5. the exit is real and reachable ────────────────────────────────
  const exitId = EXIT[room]
  if (exitId) {
    const exit = await page.evaluate(id => {
      const el = document.getElementById(id)
      if (!el) return null
      const r = el.getBoundingClientRect()
      // the effective hit area: pseudo-element extenders (affordance
      // contract 1) and padding that overflow the visible mark both count
      const w = Math.max(r.width, el.scrollWidth)
      const h = Math.max(r.height, el.scrollHeight)
      const vis = el.checkVisibility && el.checkVisibility({ opacityProperty: true, visibilityProperty: true })
      const cx = Math.round(r.left + r.width / 2), cy = Math.round(r.top + r.height / 2)
      const top = cx > 0 && cy > 0 && cx < window.innerWidth && cy < window.innerHeight
        ? document.elementFromPoint(cx, cy) : null
      const hittable = !!top && (top === el || el.contains(top) || top.contains(el))
      return { vis, w: Math.round(w), h: Math.round(h), hittable }
    }, exitId)
    check(`${room}: the exit exists and shows`, !!exit && exit.vis, exitId)
    if (exit && exit.vis) {
      check(`${room}: the exit is a full target`, exit.w >= 44 && exit.h >= 44, exit.w + 'x' + exit.h)
      check(`${room}: the exit is hittable`, exit.hittable)
      await page.click('#' + exitId, { timeout: 3000 }).catch(() => {})
      await page.waitForTimeout(700)
      check(`${room}: the exit lands home`, /\/desktop\.html$/.test(new URL(page.url()).pathname), page.url())
    }
  }
}

// the desktop's own way out is the keybank: twelve sockets answer
await loadClean('desktop')
const dial = await page.evaluate(() => {
  const grid = document.getElementById('keybank')
  const hit = el => {
    if (!el) return false
    const b = el.getBoundingClientRect()
    const t = document.elementFromPoint(Math.round(b.left + b.width / 2), Math.round(b.top + b.height / 2))
    return !!t && (t === el || el.contains(t) || t.contains(el))
  }
  const keys = grid ? Array.from(grid.children) : []
  return { options: keys.length, first: hit(keys[0]), last: hit(keys[keys.length - 1]) }
})
check('the keybank answers at 439px', dial.options === 12, dial.options + ' keys')
check('the keybank ends answer', dial.first && dial.last)

// and the room behind the CRT still opens on the small glass
await loadClean('desktop')
await page.evaluate(([k, v]) => {
  const s = JSON.parse(localStorage.getItem(k) || '{}')
  s.crtRoomOn = v
  localStorage.setItem(k, JSON.stringify(s))
}, [KEY, true])
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(500)
await page.click('#crt-room-toggle').catch(() => {})
await page.waitForTimeout(600)
const gaze = await page.evaluate(() => ({
  open: document.getElementById('crt-room') && document.getElementById('crt-room').classList.contains('open'),
  ofx: document.documentElement.scrollWidth - document.documentElement.clientWidth,
}))
check('the gaze still opens the room behind', gaze.open)
check('the opened room does not scroll sideways', gaze.ofx <= 1, 'ofx=' + gaze.ofx)

check('zero page errors across the run', errors.length === 0, errors.slice(0, 3).join(' | '))

console.log('\n' + pass + ' passed, ' + fail + ' failed')
await browser.close()
server.kill()
process.exit(fail ? 1 : 0)
