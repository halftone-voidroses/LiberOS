// smoke.mjs — smoke test for the Riason-demo tutorial + desktop flow
// Flow: boot -> loading -> desktop, cutscene auto-opens (ritual flames,
// Wanderlust beats, intruder flare, Riason beats) -> Riason demos the
// buddy himself (user watches; the chain is fake, nothing is written) ->
// bind prompt (two beats) -> user clicks the artifact -> fake explosion
// chain -> Wanderlust returns -> pink wipe -> "I arise the same but
// different" -> clean desktop, tutorialDone, zero artifacts (clean slate)
// -> manual sigil cast in the stone room -> divination draw -> orbit,
// mini-menu, verb, relation -> settings wipe exists.

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

async function stateCounts() {
  return await page.evaluate(() => {
    var s = (window.Liber && window.Liber.state && window.Liber.state.get()) || {}
    var out = { tutorialDone: !!s.tutorialDone, stage: s.tutorialStage || null }
    ;['buddy', 'relations', 'games', 'satchel', 'divination', 'garden', 'dreams', 'sea'].forEach(k => { out[k] = ((s[k] || []).length) })
    out.stone = ((s.buddy || []).filter(e => e && e.kind === 'stone')).length
    out.sealed = ((s.buddy || []).filter(e => !e || e.kind !== 'stone')).length
    return out
  })
}

async function clickBeat() {
  const hasOpt = await page.evaluate(() => !!document.querySelector('#cutscene .cutscene-option'))
  if (hasOpt) await page.click('#cutscene .cutscene-option')
  else {
    const hasNext = await page.evaluate(() => !!document.querySelector('#cutscene .cutscene-next'))
    if (hasNext) await page.click('#cutscene .cutscene-next')
    else await page.waitForTimeout(1500)
  }
  await page.waitForTimeout(700)
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

console.log('5. Walk opening beats until Riason takes the stone room')
for (let i = 0; i < 16; i++) {
  if (await page.evaluate(() => location.href.includes('sigil.html'))) break
  await clickBeat()
}
await page.waitForURL('**/sigil.html', { timeout: 15000 })
console.log('   stone room, Riason demo running')
await shot('smoke-02-demo')

console.log('6. Demo plays slowly on the real stone, one >> per step; chain is fake so NOTHING is written')
for (let d = 0; d < 18; d++) {
  if (await page.evaluate(() => location.href.includes('desktop.html'))) break
  const hasNext = await page.evaluate(() => {
    const b = document.querySelector('.sigil-demo-next')
    return !!(b && !b.hidden)
  })
  if (hasNext) await page.click('.sigil-demo-next')
  else await page.waitForTimeout(2500)
  await page.waitForTimeout(800)
}
await page.waitForURL('**/desktop.html', { timeout: 30000 })
await page.waitForFunction(() => {
  var l = document.querySelector('#cutscene .cutscene-line')
  return !!(l && /arrow keys/.test(l.textContent))
}, { timeout: 30000 })
const afterDemo = await stateCounts()
console.assert(afterDemo.stone === 0 && afterDemo.sealed === 0 && afterDemo.relations === 0 && afterDemo.games === 0,
  'fake chain must write nothing: ' + JSON.stringify(afterDemo))
console.assert(afterDemo.stage === 'bind', 'stage should be bind after demo, got ' + afterDemo.stage)
console.log(`   after demo: ${JSON.stringify(afterDemo)}`)

console.log('7. Two prompt beats, then click the artifact -> fake chain')
await clickBeat()
await clickBeat()
await page.waitForSelector('#demo-artifact', { timeout: 15000 })
await shot('smoke-03-artifact')
await page.click('#demo-artifact')
await page.waitForTimeout(600)

console.log('8. Finale: return beats, wipe, clean desktop — still zero writes')
for (let f = 0; f < 8; f++) {
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
  await clickBeat()
  await page.waitForTimeout(1200)
}
await page.waitForFunction(() => {
  try {
    return !!(window.Liber && window.Liber.state && window.Liber.state.get().tutorialDone);
  } catch (e) { return false; }
}, { timeout: 20000 })
const finalState = await stateCounts()
console.assert(finalState.tutorialDone, 'tutorial should be done')
console.assert(finalState.stone === 0 && finalState.sealed === 0 && finalState.relations === 0,
  'clean slate: no artifacts after fake chain: ' + JSON.stringify(finalState))
const cleanOverlay = await page.evaluate(() => !document.getElementById('cutscene'))
console.assert(cleanOverlay, 'overlays should clear after wipe')
console.log(`   final: ${JSON.stringify(finalState)}`)
await shot('smoke-04-clean-slate')

console.log('9. Desktop chrome: no summon buttons (deprecated), dial present')
const chatGone2 = await page.evaluate(() => !document.getElementById('flaming-q') && !document.querySelector('.flaming-q-repeat'))
console.assert(chatGone2, 'summon buttons should stay removed after tutorial')
const dialOptionCount = await page.locator('.dial-option').count()
console.assert(dialOptionCount === 3, 'expected 3 dial options (prev/active/next)')
console.log(`   chat deprecated ok, dial options: ${dialOptionCount}`)

console.log('10. Pre-cast invitation shows (user has cast nothing yet)')
const beatCopy = await page.evaluate(() => document.getElementById('constellation-empty').textContent)
console.assert(beatCopy && beatCopy.includes('cast the buddy first'), 'first-beat invitation expected, got: ' + (beatCopy || '').trim().slice(0, 60))
console.log(`   beat: "${beatCopy.trim().slice(0, 60)}..."`)

console.log('11. Sigil dial option is NOT crossed (nothing cast — no premature attachment)')
const sigilCrossed = await page.evaluate(() => {
  return document.querySelector('[data-id="sigil"]').classList.contains('crossed')
})
console.assert(!sigilCrossed, 'sigil should not be crossed before any cast')
console.log(`   sigil crossed: ${sigilCrossed}`)

console.log('12. Open divination, draw a card (auto-pins)')
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

console.log('13. Manual cast in the stone room (intention, ink, circle, save)')
await page.goto(BASE + '/sigil.html', { waitUntil: 'networkidle' })
await page.waitForTimeout(600)
await dismissHijack()
await page.evaluate(() => { const i = document.querySelector('.sigil-input'); if (i) i.innerText = '' })
await page.click('.sigil-input')
await page.keyboard.type('putting logic over emotions', { delay: 20 })
await page.click('#sigil-palette-tray button')
const canvasBox = await page.locator('.sigil-canvas').boundingBox()
const ccx = canvasBox.x + canvasBox.width / 2, ccy = canvasBox.y + canvasBox.height / 2
const rad = Math.min(canvasBox.width, canvasBox.height) * 0.3
await page.mouse.move(ccx + rad, ccy)
await page.mouse.down()
for (let s = 1; s <= 24; s++) {
  const a = (s / 24) * Math.PI * 2
  await page.mouse.move(ccx + Math.cos(a) * rad, ccy + Math.sin(a) * rad, { steps: 2 })
}
await page.mouse.up()
await page.click('#sigil-save')
await page.waitForTimeout(500)
await page.click('#sigil-save-prompt-keep')
await page.waitForTimeout(500)
const castState = await page.evaluate(() => {
  var s = (window.Liber && window.Liber.state && window.Liber.state.get()) || {}
  var stone = (s.buddy || []).filter(e => e && e.kind === 'stone')
  return { stone: stone.length, intent: ((stone[0] || {}).intention || '').slice(0, 30) }
})
console.assert(castState.stone === 1, 'manual cast should save one stone buddy')
console.assert(castState.intent.includes('putting'), 'intention should persist')
console.log(`   cast: ${JSON.stringify(castState)}`)
await shot('smoke-05-manual-cast')

console.log('13b. Sandplay booth: deal, drag, line, keep')
await page.goto(BASE + '/games.html', { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
await dismissHijack()
await page.click('.games-booth[data-game="sandplay"]')
await page.waitForTimeout(500)
const shelfCount = await page.evaluate(() => document.querySelectorAll('#sand-shelf .sand-toy').length)
console.assert(shelfCount === 3, 'three toys dealt, got ' + shelfCount)
const toyBox = await page.evaluate(() => {
  const r = document.querySelector('#sand-shelf .sand-toy').getBoundingClientRect()
  return { x: r.x, y: r.y, width: r.width, height: r.height }
})
const trayBox = await page.evaluate(() => {
  const r = document.getElementById('sand-tray').getBoundingClientRect()
  return { x: r.x, y: r.y, width: r.width, height: r.height }
})
await page.mouse.move(toyBox.x + toyBox.width / 2, toyBox.y + toyBox.height / 2)
await page.mouse.down()
await page.mouse.move(trayBox.x + trayBox.width / 2, trayBox.y + trayBox.height / 2, { steps: 12 })
await page.mouse.up()
await page.waitForTimeout(400)
const placedCount = await page.evaluate(() => document.querySelectorAll('#sand-tray .sand-toy').length)
console.assert(placedCount === 1, 'one toy placed, got ' + placedCount)
await page.fill('#sand-lines input', 'the tower stands where the day fell')
await page.click('#sand-keep')
await page.waitForTimeout(400)
await page.click('#games-save-prompt-keep')
await page.waitForTimeout(400)
const sandSaved = await page.evaluate(() => {
  var s = (window.Liber && window.Liber.state && window.Liber.state.get()) || {}
  const g = (s.games || []).filter(a => a.kind === 'sandplay')
  const st = (s.satchel || []).filter(a => a.ref === 'sandplay')
  return { games: g.length, satchel: st.length, lines: ((g[0] || {}).result || {}).toys }
})
console.assert(sandSaved.games === 1 && sandSaved.satchel === 1, 'sandplay kept to games + satchel: ' + JSON.stringify(sandSaved))
console.log(`   sandplay: ${JSON.stringify({ games: sandSaved.games, satchel: sandSaved.satchel })}`)
await shot('smoke-05b-sandplay')

console.log('14. Return to desktop -> artifact orbits the sigil')
await page.goto(BASE + '/desktop.html', { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
const artifactExists = await page.evaluate(() => !!document.querySelector('.constellation-artifact'))
console.assert(artifactExists, 'constellation-artifact should be present')
const starExists = await page.evaluate(() => !!document.getElementById('constellation-sigil'))
console.assert(starExists, 'constellation-sigil star should be present as hub after cast')
await shot('smoke-06-constellation')

console.log('15. Click artifact -> mini-menu opens')
// force: the orrery rotates continuously; the artifact is a moving target
// (humans get hover-to-pause; playwright skips its stability check here).
await page.click('.constellation-artifact', { force: true })
await page.waitForTimeout(300)
const miniOpen = await page.evaluate(() => document.getElementById('constellation-mini').classList.contains('open'))
console.assert(miniOpen, 'mini-menu should open')

console.log('16. Type verb, save -> first real relation (tutorial bound nothing)')
await page.fill('#constellation-mini-verb', 'protects')
await page.click('#constellation-mini-save')
await page.waitForTimeout(300)
const relationsCount = await page.evaluate(() => {
  var s = (window.Liber && window.Liber.state && window.Liber.state.get()) || {}
  return (s.relations || []).length
})
console.assert(relationsCount === 1, 'expected the first real relation, got ' + relationsCount)
const verbStored = await page.evaluate(() => {
  var s = (window.Liber && window.Liber.state && window.Liber.state.get()) || {}
  return ((s.relations || []).slice(-1)[0] || {}).verb
})
console.assert(verbStored === 'protects', 'expected verb "protects"')
console.log(`   verb: ${verbStored}`)
await shot('smoke-07-relation')

console.log('17. Reset lives in settings now (chat repeat-button deprecated, confirm dormant)')
await page.goto(BASE + '/settings.html', { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
const wipeExists = await page.evaluate(() => !!document.getElementById('settings-wipe'))
console.assert(wipeExists, 'settings wipe should exist as the reset path')
console.log('   settings wipe present; state untouched')

console.log('18. Legacy save migrates: sigils[] -> buddy stone, to:sigil -> to:buddy')
await page.evaluate(() => {
  try {
    localStorage.setItem('liber_vacui_v1', JSON.stringify({
      tutorialDone: true, tutorialStage: 'done', cutsceneBuild: 'riasondemo1',
      sigils: [{ id: 'sigil-1', intention: 'old stone', element: 'earth', ts: 1 }],
      buddy: [{ name: 'old chat', confession: 'old words' }],
      relations: [{ from: 'x', to: 'sigil', verb: 'holds', ts: 2 }]
    }))
  } catch (e) {}
})
await page.goto(BASE + '/desktop.html', { waitUntil: 'networkidle' })
await page.waitForTimeout(600)
const migrated = await page.evaluate(() => {
  var raw = {}
  try { raw = JSON.parse(localStorage.getItem('liber_vacui_v1')) || {} } catch (e) {}
  var s = (window.Liber && window.Liber.state && window.Liber.state.get()) || {}
  const stone = (s.buddy || []).filter(e => e && e.kind === 'stone')
  const sealed = (s.buddy || []).filter(e => !e || e.kind !== 'stone')
  return {
    hasSigilsKey: ('sigils' in s), stone: stone.length, sealed: sealed.length,
    intent: ((stone[0] || {}).intention || ''), relTo: (((s.relations || [])[0] || {}).to || null)
  }
})
console.assert(!migrated.hasSigilsKey, 'sigils key retired, got: ' + JSON.stringify(migrated))
console.assert(migrated.stone === 1 && migrated.intent === 'old stone', 'stone preserved: ' + JSON.stringify(migrated))
console.assert(migrated.sealed === 1, 'sealed chat preserved: ' + JSON.stringify(migrated))
console.assert(migrated.relTo === 'buddy', 'relation retargeted: ' + JSON.stringify(migrated))
console.log(`   migrated: ${JSON.stringify(migrated)}`)

console.log('19. New-build replay shelves legacy artifacts into the trash, homescreen clean')
await page.evaluate(() => {
  localStorage.setItem('liber_vacui_v1', JSON.stringify({
    tutorialDone: true, tutorialStage: 'done',
    buddy: [{ kind: 'stone', id: 'sigil-9', intention: 'old' }, { kind: 'sealed', name: 'old chat', confession: 'x' }],
    relations: [{ from: 'a', to: 'buddy', verb: 'holds' }],
    divination: [{ id: 'divination-1', name: 'the tower' }]
  }))
})
await page.goto(BASE + '/desktop.html', { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)
const shelved = await page.evaluate(() => {
  const s = window.Liber.state.get()
  return {
    buddy: (s.buddy || []).length, relations: (s.relations || []).length, divination: (s.divination || []).length,
    grave: (s.graveyard || []).length, done: !!s.tutorialDone,
    orbits: document.querySelectorAll('.constellation-artifact').length
  }
})
console.assert(shelved.buddy === 0 && shelved.relations === 0 && shelved.divination === 0, 'active sets cleared: ' + JSON.stringify(shelved))
console.assert(shelved.grave >= 4, 'shelved into trash: ' + JSON.stringify(shelved))
console.assert(!shelved.done && shelved.orbits === 0, 'tutorial replays on clean homescreen: ' + JSON.stringify(shelved))
console.log(`   shelved: ${JSON.stringify(shelved)}`)

console.log('20. Scratch notes keep to the satchel')
await page.evaluate(() => { window.Liber.state.set({ tutorialDone: true, tutorialStage: 'done' }) })
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(800)
await page.fill('#notes-pad', 'a scratch line for the book')
await page.click('#notes-save')
await page.waitForTimeout(400)
const noteKept = await page.evaluate(() => {
  const s = window.Liber.state.get()
  const notes = (s.satchel || []).filter(e => e && e.kind === 'note')
  return { n: notes.length, text: ((notes[0] || {}).text || '').slice(0, 30) }
})
console.assert(noteKept.n === 1 && noteKept.text.includes('scratch line'), 'note kept: ' + JSON.stringify(noteKept))
console.log(`   note: ${JSON.stringify(noteKept)}`)

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
