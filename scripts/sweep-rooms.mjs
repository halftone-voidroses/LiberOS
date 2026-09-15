// sweep-rooms.mjs — local, ad-hoc visual sweep. NOT committed; not a CI gate.
//   node scripts/sweep-rooms.mjs [room ...]        (env: SWEEP_OUT, SWEEP_BASE)
//
// Spawns its own serve.cjs so it always tests THIS tree — a server already
// squatting on 8030 from another worktree will otherwise serve stale files
// and every measurement silently describes the wrong build.
//
// For each room × viewport it reports:
//   err    console/page errors and HTTP >= 400
//   ofx    horizontal document overflow
//   hit    visible interactive controls smaller than 44x44
//   far    visible interactive controls outside the viewport, unreachable
//   dead   a visible control whose centre hit-test resolves to something else
//   clip   fixed-height non-scrolling element whose content is taller than it
//
// `dead` is the important one: it catches a control that grew on top of its
// neighbour (or under something that grew), which is the failure mode the
// legibility pass shipped and no gate caught.

import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'

const OUT = process.env.SWEEP_OUT || '.sweep'
const ROOMS = process.argv.slice(2).length
  ? process.argv.slice(2).map(r => (r.endsWith('.html') ? r : r + '.html'))
  : ['desktop.html', 'sigil.html', 'divination.html', 'dreams.html', 'games.html',
     'garden.html', 'sea.html', 'journal.html', 'learn.html', 'themes.html',
     'settings.html', 'trash.html', 'toybox.html', 'about.html', 'index.html',
     'loading.html']

const VIEWPORTS = [
  { name: 'std', width: 1280, height: 800 },
  { name: 'narrow', width: 439, height: 800 },
]

let BASE = process.env.SWEEP_BASE
let srv = null
if (!BASE) {
  srv = spawn('node', ['serve.cjs'], { cwd: process.cwd(), stdio: 'pipe' })
  BASE = await new Promise((resolve, reject) => {
    let buf = ''
    srv.stdout.on('data', d => {
      buf += d.toString()
      const m = buf.match(/http:\/\/127\.0\.0\.1:(\d+)/)
      if (m) resolve(`http://127.0.0.1:${m[1]}`)
    })
    srv.on('exit', () => reject(new Error('serve.cjs exited during boot')))
    setTimeout(() => reject(new Error('server boot timeout')), 8000)
  })
}

const PROBE = () => {
  const out = { ofx: 0, err: [], hit: [], far: [], dead: [], clip: [] }
  const de = document.documentElement
  out.ofx = de.scrollWidth - de.clientWidth
  const vw = window.innerWidth, vh = window.innerHeight
  const name = el => String(el.id || el.getAttribute('aria-label') || el.className || el.tagName).slice(0, 40)
  const vis = el => el.checkVisibility && el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) &&
    !el.closest('[aria-hidden="true"], [inert]')
  const R = el => el.getBoundingClientRect()

  const controls = []
  for (const el of document.querySelectorAll('button, [role="button"], input, select, textarea, a[href]')) {
    if (!vis(el)) continue
    if (el.disabled) continue        // consent-gated / state-gated controls are inert by design
    const r = R(el)
    if (r.width < 1 || r.height < 1) continue
    controls.push({ el, r })
    if (r.width < 44 || r.height < 44) out.hit.push(name(el) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height))
    if (!inScrollable(el) && (r.right < -2 || r.left > vw + 2 || r.bottom < -2 || r.top > vh + 2)) out.far.push(name(el))
  }
  function inScrollable(el) {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const o = getComputedStyle(p)
      if (/(auto|scroll)/.test(o.overflowY + o.overflowX)) return true
    }
    return false
  }
  // reachability: can this control actually receive a click at its centre?
  // geometric overlap is noisy (designed overlays, scaled bezels); the only
  // thing that matters is whether a seated user can hit it.
  for (const c of controls) {
    const r = c.r
    const cx = Math.round(r.left + r.width / 2), cy = Math.round(r.top + r.height / 2)
    if (cx < 0 || cy < 0 || cx > vw || cy > vh) continue
    const top = document.elementFromPoint(cx, cy)
    if (!top) continue
    if (top === c.el || c.el.contains(top) || top.contains(c.el)) continue
    out.dead.push(name(c.el) + ' blocked by ' + name(top))
  }
  // fixed-height boxes whose content is taller than they are
  for (const el of document.querySelectorAll('*')) {
    if (!vis(el) || el.children.length || !el.textContent.trim()) continue
    const cs = getComputedStyle(el)
    if (cs.position === 'absolute' && (cs.height !== 'auto' || cs.maxHeight !== 'none')) {
      if (el.scrollHeight > el.clientHeight + 2 && el.clientHeight > 0) out.clip.push(name(el) + ' ' + el.scrollHeight + '>' + el.clientHeight)
    }
  }
  return out
}

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()
const rows = []

for (const room of ROOMS) {
  const slug = room.replace(/\.html$/, '')
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
    const page = await ctx.newPage()
    const err = []
    page.on('pageerror', e => err.push('pageerror: ' + e.message))
    page.on('console', m => { if (m.type() === 'error') err.push('console: ' + m.text()) })
    page.on('response', r => { if (r.status() >= 400) err.push('http ' + r.status() + ' ' + r.url()) })
    let probe = null
    try {
      await page.goto(`${BASE}/${room}`, { waitUntil: 'networkidle', timeout: 20000 })
      await page.waitForTimeout(1000)
      const skip = await page.$('.hijack-skip')
      if (skip) { await skip.click(); await page.waitForTimeout(250) }
      probe = await page.evaluate(PROBE)
      await page.screenshot({ path: `${OUT}/${slug}-${vp.name}.png` })
    } catch (e) {
      err.push('navigation: ' + e.message)
    }
    rows.push({ room, vp: vp.name, err, probe })
    await ctx.close()
  }
}

await browser.close()
if (srv) srv.kill()

const uniq = a => [...new Set(a)]
let flagged = 0
for (const r of rows) {
  const p = r.probe
  const bits = []
  if (r.err.length) bits.push('err=' + uniq(r.err).slice(0, 2).join(' | '))
  if (!p) { bits.push('no probe'); }
  else {
    if (p.ofx > 1) bits.push('ofx=' + p.ofx)
    if (p.dead.length) bits.push('DEAD=' + uniq(p.dead).slice(0, 5).join(' ; '))
    if (p.clip.length) bits.push('clip=' + uniq(p.clip).slice(0, 4).join(' ; '))
  }
  if (bits.length) { flagged++; console.log(`${r.room} [${r.vp}]  ${bits.join('\n      ')}`) }
  else if (p && (p.hit.length || p.far.length)) {
    console.log(`${r.room} [${r.vp}]  (soft) hit=${uniq(p.hit).length} far=${uniq(p.far).slice(0,3).join(',')}`)
  } else {
    console.log(`${r.room} [${r.vp}]  ok`)
  }
}
console.log(`\n${rows.length} checks, ${flagged} flagged. Shots in ${OUT}/`)
