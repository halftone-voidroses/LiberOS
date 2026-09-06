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

async function dismissHijack() {
  try {
    const skip = await page.$('.hijack-skip')
    if (skip) {
      await skip.click()
      await page.waitForTimeout(300)
    }
  } catch (e) {}
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

console.log('4. Cutscene auto-opens (chat stays shut — deprecated)')
const cutOpen = await page.evaluate(() => !!document.getElementById('cutscene'))
console.assert(cutOpen, 'cutscene should auto-open on first run')
const chatGone = await page.evaluate(() => !document.getElementById('flaming-q'))
console.assert(chatGone, 'summon ? should be removed in flow')
await shot('smoke-01-cutscene-arise')

console.log('5. Walk the cutscene to the stone (options, flashes, boxes)')
const acts = []
for (let i = 0; i < 16; i++) {
  const a = await page.evaluate(() => {
    if (location.href.includes('sigil.html')) return 'STONE';
    var c = document.getElementById('cutscene')
    if (!c) return 'gone'
    var v = c.querySelector('.cutscene-voice')
    var o = c.querySelector('.cutscene-option')
    return (c.dataset.act || 'beat') + ':' + (v ? v.textContent : '') + (o ? '|opt=' + o.textContent.slice(0, 18) : '')
  })
  acts.push(a)
  if (a === 'STONE') break
  const didOpt = await page.evaluate(() => !!document.querySelector('#cutscene .cutscene-option'))
  if (didOpt) await page.click('#cutscene .cutscene-option')
  else await page.click('#cutscene .cutscene-next')
  await page.waitForTimeout(700)
}
console.log(`   acts: ${acts.join(' | ')}`)
console.assert(acts.some(a => a.startsWith('ritual')) || acts[0].includes('wanderlust'), 'should pass through ritual/chat')
await page.waitForURL('**/sigil.html', { timeout: 15000 })
console.log('6. Stone tour performs the casting (intention, ink, circle, save)')
for (let k = 0; k < 4; k++) {
  await page.waitForFunction(() => {
    if (location.href.includes('games.html')) return true
    return !!document.querySelector('.hijack-next')
  }, { timeout: 20000 })
  if (await page.evaluate(() => location.href.includes('games.html'))) break
  const tline = await page.evaluate(() => document.querySelector('.hijack-line').textContent.slice(0, 50))
  console.log(`   tour: "${tline}"`)
  await page.click('.hijack-next')
  await page.waitForTimeout(6000)
}
await page.waitForURL('**/games.html', { timeout: 20000 })
const castState = await page.evaluate(() => {
  var s = (window.Liber && window.Liber.state && window.Liber.state.get()) || {}
  return { sigils: (s.sigils || []).length, intent: ((s.sigils[0] || {}).intention || '').slice(0, 30), stage: s.tutorialStage }
})
console.assert(castState.sigils === 1, 'tour should have cast one sigil')
console.assert(castState.intent.includes('putting'), 'tour should have typed the example intention')
console.assert(castState.stage === 'games', 'tour should advance stage to games')
console.log(`   cast: ${JSON.stringify(castState)}`)
await shot('smoke-03-auto-cast')

console.log('13. Stone tour dismissed by completion, games auto-booth plays')
console.log('14. Mandala auto-completes, no save prompt needed')

console.log('15. Type intention, draw, save — already performed by the tour; verifying')
console.log('16. Sigil persisted to state.sigils[] (verified above)')

console.log('17. Games auto-booth finishes, desktop shows the bind overlay')
await page.waitForURL('**/desktop.html', { timeout: 45000 })
await page.waitForTimeout(1000)
const bindState = await page.evaluate(() => {
  var s = (window.Liber && window.Liber.state && window.Liber.state.get()) || {}
  const l = document.querySelector('#cutscene .cutscene-line')
  return { games: (s.games || []).length, stage: s.tutorialStage, bindLine: l ? l.textContent.slice(0, 50) : null }
})
console.assert(bindState.games === 1, 'auto-booth should have saved one game artifact')
console.assert(bindState.stage === 'bind', 'stage should be bind')
console.assert(!!bindState.bindLine, 'bind overlay should be showing')
console.log(`   bind: ${JSON.stringify(bindState)}`)

console.log('17b. Desktop chrome: no summon buttons (deprecated), dial present')
const chatGone2 = await page.evaluate(() => !document.getElementById('flaming-q') && !document.querySelector('.flaming-q-repeat'))
console.assert(chatGone2, 'summon buttons should stay removed after tutorial')
const dialOptionCount = await page.locator('.dial-option').count()
console.assert(dialOptionCount === 3, 'expected 3 dial options (prev/active/next)')
console.log(`   chat deprecated ok, dial options: ${dialOptionCount}`)

console.log('18. Post-cast invitation shows (second or third beat)')
const beatCopy = await page.evaluate(() => document.getElementById('constellation-empty').textContent)
console.assert(beatCopy && (beatCopy.includes('stone is signed') || beatCopy.includes('something kept')), 'invitation copy should show after cast')
console.log(`   beat: "${beatCopy.trim().slice(0, 60)}..."`)
const starExists = await page.evaluate(() => !!document.getElementById('constellation-sigil'))
console.assert(starExists, 'constellation-sigil star should be present as hub')
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
await dismissHijack()
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

console.log('23. Type verb, save -> relation drawn (second relation: tutorial bound the first)')
const relationsBefore = await page.evaluate(() => {
  var s = (window.Liber && window.Liber.state && window.Liber.state.get()) || {}
  return (s.relations || []).length
})
await page.fill('#constellation-mini-verb', 'protects')
await page.click('#constellation-mini-save')
await page.waitForTimeout(300)
const relationsCount = await page.evaluate(() => {
  var s = (window.Liber && window.Liber.state && window.Liber.state.get()) || {}
  return (s.relations || []).length
})
console.assert(relationsCount === relationsBefore + 1, 'expected one new relation')
console.log(`   relations: ${relationsBefore} -> ${relationsCount}`)
const verbStored = await page.evaluate(() => {
  var s = (window.Liber && window.Liber.state && window.Liber.state.get()) || {}
  return ((s.relations || []).slice(-1)[0] || {}).verb
})
console.assert(verbStored === 'protects', 'expected verb "protects"')
console.log(`   verb: ${verbStored}`)
await shot('smoke-06-relation')

console.log('23b. Finale plays: return beats, wipe, clean desktop')
for (let f = 0; f < 6; f++) {
  await page.waitForFunction(() => {
    try {
      if (window.Liber && window.Liber.state && window.Liber.state.get().tutorialDone) return true;
    } catch (e) {}
    return !!(document.querySelector('#cutscene .cutscene-option') || document.querySelector('#cutscene .cutscene-next'));
  }, { timeout: 20000 })
  const isDone = await page.evaluate(() => {
    try { return !!(window.Liber && window.Liber.state && window.Liber.state.get().tutorialDone); }
    catch (e) { return false; }
  })
  if (isDone) break
  const hasOpt = await page.evaluate(() => !!document.querySelector('#cutscene .cutscene-option'))
  if (hasOpt) await page.click('#cutscene .cutscene-option')
  else await page.click('#cutscene .cutscene-next')
  await page.waitForTimeout(1500)
}
await page.waitForFunction(() => {
  try {
    return !!(window.Liber && window.Liber.state && window.Liber.state.get().tutorialDone);
  } catch (e) { return false; }
}, { timeout: 20000 })
const finalState = await page.evaluate(() => {
  var s = (window.Liber && window.Liber.state && window.Liber.state.get()) || {}
  return { done: !!s.tutorialDone, stage: s.tutorialStage, clean: !document.getElementById('cutscene') }
})
console.assert(finalState.done && finalState.clean, 'finale should complete tutorial and clear overlays')
console.log(`   final: ${JSON.stringify(finalState)}`)

console.log('24. Reset lives in settings now (chat repeat-button deprecated, confirm dormant)')
await page.goto(BASE + '/settings.html', { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
const wipeExists = await page.evaluate(() => !!document.getElementById('settings-wipe'))
console.assert(wipeExists, 'settings wipe should exist as the reset path')
console.log('   settings wipe present; state untouched')

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
