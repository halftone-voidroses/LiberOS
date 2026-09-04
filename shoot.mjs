// shoot.mjs — screenshot all four states of LiberVacui1.0
// Usage: node shoot.mjs

import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const BASE = 'http://127.0.0.1:8030'
const OUT = '/Users/rosetudor/Desktop/LiberVacui1.0/screenshots'
if (!existsSync(OUT)) await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push('pageerror: ' + e.message))
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()) })

async function shot(name, url, setup) {
  await page.goto(BASE + url, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(1500)
  if (setup) await setup(page)
  const path = `${OUT}/${name}.png`
  await page.screenshot({ path, fullPage: false })
  console.log(`✓ ${name} → ${path}`)
}

// 01 — boot
await shot('01-boot', '/')

// 02 — loading
await shot('02-loading', '/loading.html')

// 03 — pre-tutorial
await shot('03-pre-tutorial', '/desktop.html')

// 04 — post-tutorial: seed localStorage, then navigate fresh
await page.goto(BASE + '/desktop.html', { waitUntil: 'domcontentloaded' })
await page.evaluate(() => {
  const KEY = 'liber_vacui_v1'
  const cur = JSON.parse(localStorage.getItem(KEY) || '{}')
  cur.tutorialDone = true
  localStorage.setItem(KEY, JSON.stringify(cur))
})
await page.goto(BASE + '/desktop.html', { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
await page.screenshot({ path: `${OUT}/04-post-tutorial.png`, fullPage: false })
console.log(`✓ 04-post-tutorial → ${OUT}/04-post-tutorial.png`)

if (errors.length) {
  console.log('\nErrors:')
  for (const e of errors) console.log('  -', e)
}

await browser.close()
