// _verify-lift.mjs — temporary probe (delete after use).
// Checks the aesthetic-sweep fixes landed: boot/loading ink, the sidecar's
// printed plate, and the narrow titlebar rule.
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'

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

// the same painters'-order probe the pitch pages use
const PROBE = (sel) => {
  function rgba(c) {
    const m = String(c).match(/rgba?\(([^)]+)\)/); if (!m) return null
    const p = m[1].split(',').map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }
  }
  function hex(c) {
    let h = String(c).replace('#', '')
    if (!/^[0-9a-f]{3}$|^[0-9a-f]{6}$/i.test(h)) return null
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: 1 }
  }
  function tokens(s) {
    const out = []
    const own = rgba(s.backgroundColor); if (own && own.a > 0.02) out.push(own)
    if (s.backgroundImage && s.backgroundImage !== 'none') {
      (s.backgroundImage.match(/#[0-9a-f]{3,6}|rgba?\([^)]+\)/gi) || []).forEach(t => {
        const c = t[0] === '#' ? hex(t) : rgba(t); if (c) out.push(c)
      })
    }
    return out
  }
  const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }
  const lum = c => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b)
  const over = (f, b) => { const a = f.a; return { r: f.r * a + b.r * (1 - a), g: f.g * a + b.g * (1 - a), b: f.b * a + b.b * (1 - a), a: 1 } }
  function grounds(el) {
    const chain = []; let n = el
    while (n && n !== document.documentElement) { const o = tokens(getComputedStyle(n)); chain.push(o.length ? o : null); n = n.parentElement }
    let acc = [{ r: 7, g: 4, b: 3, a: 1 }]
    for (let i = chain.length - 1; i >= 0; i--) {
      if (!chain[i]) continue
      const nx = []
      for (const t of chain[i]) for (const a of acc) if (nx.length < 32) nx.push(over(t, a))
      acc = nx
    }
    return acc
  }
  const el = document.querySelector(sel)
  if (!el) return { sel, missing: true }
  const cs = getComputedStyle(el)
  const ink = rgba(cs.color)
  const op = parseFloat(cs.opacity)
  const box = el.getBoundingClientRect()
  let worst = null, best = null
  if (ink) {
    for (const bg of grounds(el)) {
      // opacity dims the ink toward its ground, exactly as the platform does
      const eff = op < 1 ? over({ r: ink.r, g: ink.g, b: ink.b, a: ink.a * op }, bg) : over(ink, bg)
      const L1 = lum(eff), L2 = lum(bg)
      const r = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
      if (worst === null || r < worst) worst = r
      if (best === null || r > best) best = r
    }
  }
  return { sel, font: cs.fontSize, w: Math.round(box.width), h: Math.round(box.height), display: cs.display, text: (el.textContent || '').trim().slice(0, 26), ratio: worst === null ? null : Math.round(worst * 100) / 100, best: best === null ? null : Math.round(best * 100) / 100 }
}

const browser = await chromium.launch()

async function grab(page, url, sel, seed) {
  await page.goto(BASE + url, { waitUntil: 'networkidle' })
  if (seed) await page.addInitScript(([k, s]) => localStorage.setItem(k, JSON.stringify(s)), [KEY, SEED])
  await page.waitForTimeout(900)
  await page.evaluate(() => { const h = document.querySelector('.hijack'); if (h) h.remove() })
  return Promise.all(sel.map(s => page.evaluate(PROBE, s)))
}

// ── 1. boot + loading ───────────────────────────────────────────────────
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.goto(BASE + '/index.html', { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  await page.evaluate(() => { const b = document.getElementById('boot-start'); if (b) b.disabled = false })
  const boot = await Promise.all(['.boot-title', '.boot-start', '.boot-warning-close'].map(s => page.evaluate(PROBE, s)))
  await page.evaluate(() => { const b = document.getElementById('boot-start'); if (b) b.disabled = true })
  const bootDisabled = await page.evaluate(PROBE, '.boot-start')
  console.log('BOOT (enabled)', JSON.stringify(boot))
  console.log('BOOT (disabled CTA)', JSON.stringify(bootDisabled))

  await page.goto(BASE + '/loading.html', { waitUntil: 'networkidle' })
  await page.waitForTimeout(900)
  const load = await Promise.all(['.loading-title', '.loading-now', '.loading-patrons'].map(s => page.evaluate(PROBE, s)))
  console.log('LOADING', JSON.stringify(load))
  await page.close()
}

// ── 2. the sidecar at 1280 (fit) and 439 (room corner) ──────────────────
for (const [w, h, label] of [[1280, 800, 'fit'], [439, 800, 'narrow']]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } })
  await page.goto(BASE + '/journal.html', { waitUntil: 'networkidle' })
  await page.evaluate(([k, s]) => localStorage.setItem(k, JSON.stringify(s)), [KEY, SEED])
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(2200)
  await page.evaluate(() => { const h = document.querySelector('.hijack'); if (h) h.remove() })
  const got = await Promise.all([
    '.lc-sidecar-letterhead', '.lc-sidecar-plate', '.lc-sidecar-note',
    '.journal-titlebar-name', '.journal-titlebar-sub', '.journal-help', '.journal-exit',
  ].map(s => page.evaluate(PROBE, s)))
  const mounted = await page.evaluate(() => !!document.getElementById('liberchat-sidecar'))
  console.log(`SIDECAR+JOURNAL ${w}x${h} (${label}) mounted=${mounted}`, JSON.stringify(got))
  await page.close()
}

// ── 3. the narrow titlebar across the rooms the sweep named ─────────────
for (const room of ['learn', 'trash', 'cohort', 'dreams', 'games', 'sea', 'garden', 'buddy', 'themes']) {
  const page = await browser.newPage({ viewport: { width: 439, height: 800 } })
  await page.goto(BASE + `/${room}.html`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  await page.evaluate(() => { const h = document.querySelector('.hijack'); if (h) h.remove() })
  const got = await Promise.all([`[class$="-titlebar-sub"]`, `[class$="-titlebar-name"]`].map(s => page.evaluate(PROBE, s)))
  console.log(`439 ${room}`, JSON.stringify(got))
  await page.close()
}

await browser.close()
server.kill()
