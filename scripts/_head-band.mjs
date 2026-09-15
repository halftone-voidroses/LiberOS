// _head-band.mjs — throwaway. Measures the machine's HEAD band (the strip
// above the glass) on the real desktop.html at two stages, and reports what
// occupies it today. Feeds the top-rail pitch. Delete after use.
//
// Run: node scripts/_head-band.mjs

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
const SEED = {
  cutsceneBuild: 'riasondemo2', tutorialDone: true, tutorialStage: 'done',
  sessionStart: Date.now(), visited: { buddy: 3, journal: 2, sea: 2, games: 1, toybox: 1 }
}

const browser = await chromium.launch()
try {
  for (const vp of [{ w: 1280, h: 800 }, { w: 1024, h: 700 }, { w: 439, h: 800 }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } })
    const page = await ctx.newPage()
    await page.addInitScript(([k, s]) => localStorage.setItem(k, JSON.stringify(s)), [KEY, SEED])
    await page.goto(`${BASE}/desktop.html`, { waitUntil: 'load' })
    await page.waitForTimeout(1400)

    const data = await page.evaluate(() => {
      const q = s => document.querySelector(s)
      const r = el => { const b = el.getBoundingClientRect(); return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) } }
      const mach = q('.machine'), bez = q('.bezel'), glass = q('.screen')
      const out = { vw: innerWidth, vh: innerHeight, stageW: getComputedStyle(mach).width }
      out.machine = r(mach); out.bezel = r(bez)
      if (glass) out.glass = r(glass)
      const bz = r(bez)
      out.headBand = { top: bz.y, bottom: out.glass ? out.glass.y - 4 : null }
      out.headHeight = out.glass ? (out.glass.y - 4) - bz.y : null
      out.headInner = out.glass ? { left: out.glass.x, right: out.glass.x + out.glass.w, width: out.glass.w } : null
      out.chinHeight = out.glass ? (bz.y + bz.h) - (out.glass.y + out.glass.h) : null
      // what lives in the head today
      out.carvings = [...document.querySelectorAll('.carving')].map(c => {
        const cb = r(c)
        return { id: c.dataset.id, x: cb.x - bz.x, y: cb.y - bz.y, w: cb.w, h: cb.h, inHead: cb.y - bz.y < (out.headHeight || 0) }
      }).filter(c => c.inHead)
      // other head furniture
      for (const sel of ['.led', '.liber-plate', '.power-button', '.vent-slits', '.screw']) {
        const el = q(sel); if (el) out[sel.slice(1)] = { ...r(el), xy: [r(el).x - bz.x, r(el).y - bz.y] }
      }
      // is the machine clipped by the viewport at all?
      out.machTop = r(mach).y
      out.docOverflowX = document.documentElement.scrollWidth - innerWidth
      return out
    })
    console.log('\n═══ ' + vp.w + '×' + vp.h + ' ═══')
    console.log(JSON.stringify(data, null, 1))
    await ctx.close()
  }
} finally {
  await browser.close()
  server.kill()
}
