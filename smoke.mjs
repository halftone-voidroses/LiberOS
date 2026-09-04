// smoke.mjs — smoke test for the wanderlust + desktop flow
// Flow: boot -> click enter -> desktop with BIG ? visible -> click BIG ?
// -> wanderlust chat opens -> advance dialogue -> "I arise the same
// but different" -> empty desktop -> small ? in top-left -> open Sigil
// -> draw and save -> sigil appears on desktop as star -> draw a card
// in divination (auto-pins) -> back to desktop, artifact orbits -> click
// artifact -> mini-menu opens -> type verb, save -> relation drawn ->
// click small ? in top-left -> reset confirmation appears -> confirm
// -> state wiped, BIG ? restored, chat auto-opens again.

import { chromium } from 'playwright'
import { spawn } from 'node:child_process'

// Spawn our own server so smoke always tests THIS folder's code — never a
// stale server left running from another folder on a fixed port.
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
const BASE = `http://127.0.0.1:${PORT}`
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push('pageerror: ' + e.message))
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()) })

async function clearState() {
  await page.evaluate(() => { try { localStorage.clear() } catch (e) {} })
}

async function shot(name) {
  try { await page.screenshot({ path: 'screenshots/' + name + '.png' }) } catch (e) {}
}

console.log('1. Boot screen renders')
await page.goto(BASE + '/index.html', { waitUntil: 'networkidle' })
await clearState()
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(800)
const bootTitle = await page.textContent('.boot-title')
console.assert(bootTitle.toLowerCase().includes('liber'), 'boot title missing')
console.log(`   boot title: "${bootTitle}"`)

console.log('2. Click [ start ]')
await page.click('#boot-start')
await page.waitForURL('**/loading.html', { timeout: 5000 })

console.log('3. Loading -> desktop')
await page.waitForURL('**/desktop.html', { timeout: 10000 })
await page.waitForTimeout(800)

console.log('4. BIG ? visible (chat is NOT auto-opened)')
const chatOpen = await page.evaluate(() => {
  var w = document.getElementById('wanderlust-window')
  return w && (w.classList.contains('open') || w.getAttribute('aria-hidden') === 'false')
})
console.assert(!chatOpen, 'wanderlust chat must NOT auto-open on first run')
const bigQ = await page.evaluate(() => {
  var q = document.getElementById('flaming-q')
  if (!q) return null
  var r = q.getBoundingClientRect()
  return { w: r.width, h: r.height, top: r.top, left: r.left }
})
console.assert(bigQ && bigQ.w > 100, 'BIG ? should be large (width > 100)')
console.log(`   BIG ? at (${Math.round(bigQ.left)},${Math.round(bigQ.top)}) ${Math.round(bigQ.w)}x${Math.round(bigQ.h)}`)
await shot('smoke-01-big-q')

console.log('5. Click BIG ? -> summoning ritual -> wanderlust chat opens')
await page.click('#flaming-q')
// The summoning poem plays line-by-line (~2s per line × 7 lines ≈ 14s)
// before the chat window opens.
await page.waitForTimeout(16000)
const chatOpenNow = await page.evaluate(() => {
  var w = document.getElementById('wanderlust-window')
  return w && w.classList.contains('open')
})
console.assert(chatOpenNow, 'wanderlust chat should open after summoning ritual')
const firstLine = await page.textContent('#wanderlust-line')
console.assert(firstLine && firstLine.length > 0, 'wanderlust line is empty')
console.log(`   first line: "${firstLine}"`)
await shot('smoke-02-wanderlust-first')

console.log('6. Reply chips render (3 per turn)')
const replyCount = await page.locator('.wanderlust-reply').count()
console.assert(replyCount === 3, 'expected 3 reply chips')
console.log(`   reply chips: ${replyCount}`)

console.log('7. Walk through entire wanderlust script')
let turns = 0
while (turns < 30) {
  const winOpen = await page.evaluate(() => {
    var w = document.getElementById('wanderlust-window')
    return w && w.classList.contains('open')
  })
  if (!winOpen) break
  const replies = await page.locator('.wanderlust-reply').count()
  if (replies === 0) break
  await page.click('.wanderlust-reply')
  await page.waitForTimeout(700)
  turns++
}
console.log(`   walked ${turns} turns`)

console.log('8. Chat closed; tutorialDone set in state')
const tutorialDone = await page.evaluate(() => {
  return !!(window.Liber && window.Liber.state && window.Liber.state.get().tutorialDone)
})
console.assert(tutorialDone, 'tutorialDone not set after dialogue')
console.log(`   tutorialDone: ${tutorialDone}`)
await page.waitForTimeout(1200)

console.log('9. Desktop is empty (no sigil yet)')
const empty = await page.evaluate(() => {
  var e = document.getElementById('constellation-empty')
  return e && getComputedStyle(e).display !== 'none'
})
console.assert(empty, 'constellation should show empty state before sigil')
await shot('smoke-03-empty-desktop')

console.log('10. ? is now SMALL in top-right (repeat-tutorial button)')
const smallQ = await page.evaluate(() => {
  var q = document.querySelector('.flaming-q-repeat');
  if (!q) return null;
  var cs = getComputedStyle(q);
  return { w: q.getBoundingClientRect().width, h: q.getBoundingClientRect().height, top: cs.top, right: cs.right };
})
console.assert(smallQ && smallQ.w < 50, 'repeat-? should be small after tutorial (< 50px)')
console.assert(smallQ && smallQ.top === '14px', 'repeat-? should be 14px from top of screen')
console.assert(smallQ && smallQ.right !== 'auto', 'repeat-? should be at top-right (right: 40px) after tutorial')
console.log(`   small ? ${smallQ.w}x${smallQ.h} at top:${smallQ.top} right:${smallQ.right}`)

console.log('11. Dial shows 3 options (prev/active/next)')
const dialOptionCount = await page.locator('.dial-option').count()
console.assert(dialOptionCount === 3, 'expected 3 dial options (prev/active/next)')
console.log(`   dial options: ${dialOptionCount}`)

console.log('12. Active dial option is "Cohort" (default selectedIdx=0)')
const activeName = await page.textContent('.dial-option.active')
console.assert(activeName && activeName.toLowerCase().includes('cohort'), 'default active should be cohort (D0001: sigil app renamed)')
console.log(`   active: "${activeName}"`)

console.log('13. Click active "Sigil" -> sigil page')
await page.click('.dial-option.active')
await page.waitForURL('**/sigil.html', { timeout: 5000 })
console.log('   on sigil page')

console.log('14. Sigil page is editable (no readonly yet)')
const isReadonly = await page.evaluate(() => {
  return document.querySelector('.sigil-app') && document.querySelector('.sigil-app').classList.contains('readonly')
})
console.assert(!isReadonly, 'sigil should be editable on first run')
const saveDisabled = await page.evaluate(() => document.getElementById('sigil-save').hasAttribute('disabled'))
console.assert(!saveDisabled, 'save button should not be disabled on first run')

console.log('15. Type intention, draw, save')
await page.click('.sigil-input')
await page.keyboard.type('my shadow')
await page.evaluate(() => {
  var canvas = document.querySelector('.sigil-canvas')
  var rect = canvas.getBoundingClientRect()
  var cx = rect.left + rect.width / 2
  var cy = rect.top + rect.height / 2
  var r = 40
  for (var t = 0; t < Math.PI * 2; t += 0.2) {
    var ev1 = new MouseEvent('mousedown', { clientX: cx, clientY: cy, bubbles: true })
    var ev2 = new MouseEvent('mousemove', { clientX: cx + Math.cos(t) * r, clientY: cy + Math.sin(t) * r, bubbles: true })
    var ev3 = new MouseEvent('mouseup', { clientX: cx + Math.cos(t) * r, clientY: cy + Math.sin(t) * r, bubbles: true })
    canvas.dispatchEvent(ev1)
    canvas.dispatchEvent(ev2)
    canvas.dispatchEvent(ev3)
  }
})
await page.click('#sigil-save')
await page.waitForTimeout(300)
await page.click('#sigil-save-prompt-keep')
await page.waitForTimeout(300)

console.log('16. Sigil persisted to state.sigils[]')
const sigilCount = await page.evaluate(() => {
  var s = (window.Liber && window.Liber.state && window.Liber.state.get()) || {}
  return (s.sigils || []).length
})
console.assert(sigilCount === 1, 'expected 1 sigil in state')
console.log(`   sigils: ${sigilCount}`)

console.log('17. Return to desktop')
await page.goto(BASE + '/desktop.html', { waitUntil: 'networkidle' })
await page.waitForTimeout(800)

console.log('18. Sigil star appears as desktop hub')
const starExists = await page.evaluate(() => !!document.getElementById('constellation-sigil'))
console.assert(starExists, 'constellation-sigil star should be present as hub')
const emptyHidden = await page.evaluate(() => {
  var e = document.getElementById('constellation-empty');
  return e && getComputedStyle(e).display === 'none';
})
console.assert(emptyHidden, 'empty state should be hidden when sigil exists')
await shot('smoke-04-sigil-star')

console.log('19. Sigil option in dial is now crossed')
const sigilCrossed = await page.evaluate(() => {
  return document.querySelector('[data-id="sigil"]').classList.contains('crossed')
})
console.assert(sigilCrossed, 'sigil dial option should be crossed after first sigil')
console.log(`   sigil crossed: ${sigilCrossed}`)

console.log('20. Open divination, draw a card (auto-pins)')
await page.goto(BASE + '/divination.html', { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
await page.click('#divination-draw')
await page.waitForTimeout(300)
await page.click('#divination-save-prompt-keep')
await page.waitForTimeout(300)
const cardName = await page.textContent('.divination-card-name')
console.log(`   drew: "${cardName}"`)
const divinationCount = await page.evaluate(() => {
  var s = (window.Liber && window.Liber.state && window.Liber.state.get()) || {}
  return (s.divination || []).length
})
console.assert(divinationCount === 1, 'expected 1 divination card auto-saved')
console.log(`   divination: ${divinationCount}`)

console.log('21. Return to desktop -> artifact orbits the sigil')
await page.goto(BASE + '/desktop.html', { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
const artifactExists = await page.evaluate(() => !!document.querySelector('.constellation-artifact'))
console.assert(artifactExists, 'constellation-artifact should be present')
await shot('smoke-05-constellation')

console.log('22. Click artifact -> mini-menu opens')
// force: the orrery rotates continuously; the artifact is a moving target
// (humans get hover-to-pause; playwright skips its stability check here).
await page.click('.constellation-artifact', { force: true })
await page.waitForTimeout(300)
const miniOpen = await page.evaluate(() => document.getElementById('constellation-mini').classList.contains('open'))
console.assert(miniOpen, 'mini-menu should open')

console.log('23. Type verb, save -> relation drawn')
await page.fill('#constellation-mini-verb', 'protects')
await page.click('#constellation-mini-save')
await page.waitForTimeout(300)
const relationsCount = await page.evaluate(() => {
  var s = (window.Liber && window.Liber.state && window.Liber.state.get()) || {}
  return (s.relations || []).length
})
console.assert(relationsCount === 1, 'expected 1 relation')
console.log(`   relations: ${relationsCount}`)
const verbStored = await page.evaluate(() => {
  var s = (window.Liber && window.Liber.state && window.Liber.state.get()) || {}
  return (s.relations[0] || {}).verb
})
console.assert(verbStored === 'protects', 'expected verb "protects"')
console.log(`   verb: ${verbStored}`)
await shot('smoke-06-relation')

console.log('24. Click small ? (repeat button) -> reset confirmation appears')
await page.click('.flaming-q-repeat')
await page.waitForTimeout(300)
const confirmOpen = await page.evaluate(() => document.getElementById('wanderlust-confirm').classList.contains('open'))
console.assert(confirmOpen, 'reset confirmation should open on small ? click')
await shot('smoke-07-confirm')

console.log('25. Cancel reset')
await page.click('#wanderlust-confirm-no')
await page.waitForTimeout(200)
const confirmClosed = await page.evaluate(() => !document.getElementById('wanderlust-confirm').classList.contains('open'))
console.assert(confirmClosed, 'confirm should close on cancel')

if (errors.length) {
  console.log('\nErrors:')
  for (const e of errors) console.log('  -', e)
  await browser.close()
  server.kill()
  process.exit(1)
}

console.log('\nAll smoke tests passed.')
await browser.close()
server.kill()
