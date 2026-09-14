// verify-rainy.mjs — SYSTEM 03's scope contract, as an acceptance pass.
//
//   1. the desktop icon carries on/off and persists; settings mirrors it
//   2. turning it off restores the machine EXACTLY (no residue)
//   3. all ten primary rooms carry their own rainy skin in their own
//      stylesheet — a real palette shift, never an opacity wash
//   4. the one question is asked once a night, never twice, and gates nothing
//   5. the helplines are one click closer (the Hard Nights card)
//   6. zero layout breaks at 439px
//
// Spawns its own server so it always tests THIS folder (same pattern as
// smoke.mjs / verify-crt-room.mjs) — never a stale server on a fixed port.
// Run: node scripts/verify-rainy.mjs

import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'

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
const OUT = '.sweep/rainy'
await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
const page = await ctx.newPage()
const errors = []
let pass = 0, fail = 0
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ✓ ' + name) }
  else { fail++; console.log('  ✗ ' + name + (detail !== undefined ? '  → ' + detail : '')) }
}
page.on('pageerror', e => errors.push('pageerror: ' + e.message))
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()) })

const KEY = 'liber_vacui_v1__keep'
const BASE_STATE = { cutsceneBuild: 'riasondemo2', tutorialDone: true, sessionStart: Date.now(), visited: {} }

async function seed(partial, path = '/desktop.html') {
  await page.goto(BASE + path)
  await page.evaluate(([k, p]) => {
    localStorage.clear()
    localStorage.setItem(k, JSON.stringify(p))
  }, [KEY, Object.assign({}, BASE_STATE, partial)])
  await page.reload()
  await page.waitForTimeout(350)
  await dismissTour()
}
async function dismissTour() {
  const t = page.locator('#hijack')
  if (await t.count()) {
    const sk = t.locator('.hijack-skip')
    if (await sk.count()) await sk.click().catch(() => {})
    await page.waitForTimeout(120)
  }
}

// ─── 1. the icon carries on/off and persists ─────────────────────────────
console.log('1. the desktop icon')
await seed({ shadowOn: false })
check('the icon is on the desktop', await page.locator('#rainy-toggle').count() === 1)
check('it starts off', await page.getAttribute('#rainy-toggle', 'aria-pressed') === 'false')
check('the desktop is not weather-on', !(await page.evaluate(() => document.body.classList.contains('rainy-on'))))
await page.click('#rainy-toggle')
await page.waitForTimeout(300)
const onState = await page.evaluate(k => {
  const s = JSON.parse(localStorage.getItem(k))
  return {
    key: !!s.shadowOn,
    machine: document.querySelector('.machine').classList.contains('shadow-on'),
    body: document.body.classList.contains('rainy-on'),
    pressed: document.getElementById('rainy-toggle').getAttribute('aria-pressed'),
    tickerOpacity: getComputedStyle(document.getElementById('rainy-ticker')).opacity,
  }
}, KEY)
check('the icon writes the one state key', onState.key)
check('the machine takes the weather class', onState.machine)
check('the desk takes the weather class too', onState.body)
check('the icon reports itself pressed', onState.pressed === 'true', onState.pressed)
check('the machine layer dims the glass', await page.evaluate(() => {
  const st = getComputedStyle(document.querySelector('.screen-stage'), '::after')
  return !!st.backgroundImage && st.backgroundImage !== 'none'
}), 'screen-stage::after')

// rain survives a reload (persistence, not a session flag)
await page.reload()
await page.waitForTimeout(350)
await dismissTour()
check('the weather survives a reload', await page.evaluate(() => document.body.classList.contains('rainy-on')))

// ─── 2. turning it off restores the machine exactly ──────────────────────
console.log('2. off restores exactly')
await seed({ shadowOn: false })
const before = await page.evaluate(() => {
  const cs = getComputedStyle(document.querySelector('.machine'))
  const app = document.querySelector('.state-desktop')
  return {
    anim: cs.animationName, filt: cs.filter,
    machineCls: document.querySelector('.machine').className,
    appBg: getComputedStyle(app).backgroundImage,
  }
})
await page.click('#rainy-toggle')
await page.waitForTimeout(200)
await page.click('#rainy-toggle')
await page.waitForTimeout(300)
const after = await page.evaluate(() => {
  const cs = getComputedStyle(document.querySelector('.machine'))
  const app = document.querySelector('.state-desktop')
  return {
    anim: cs.animationName, filt: cs.filter,
    machineCls: document.querySelector('.machine').className,
    appBg: getComputedStyle(app).backgroundImage,
    key: !!JSON.parse(localStorage.getItem('liber_vacui_v1__keep')).shadowOn,
    body: document.body.classList.contains('rainy-on'),
  }
})
check('the state key is false again', after.key === false)
check('the machine class is dropped (not just hidden)', after.machineCls === before.machineCls, after.machineCls)
check('the body class is dropped', after.body === false)
check('the machine breath is gone', after.anim === before.anim, before.anim + ' → ' + after.anim)
check('the filter is gone', after.filt === before.filt, before.filt + ' → ' + after.filt)
check('the desk surface is byte-identical', after.appBg === before.appBg)

// ─── 3. the one question, asked once a night ─────────────────────────────
console.log('3. the one question')
await seed({ shadowOn: false })
await page.click('#rainy-toggle')
await page.waitForTimeout(300)
check('turning it on asks once', await page.evaluate(() => document.getElementById('rainy-ask').classList.contains('open')))
// the night's question rotates by sitting (harsh layer): accept any of them
const ECHOES = {
  'keeping': 'tonight you are keeping', 'releasing': 'tonight you are releasing',
  'naming': 'tonight you name it', 'carrying': 'tonight you carry it',
  'mine': 'tonight the loud voice is yours', 'theirs': 'tonight the loud voice is theirs',
  'setting-down': 'tonight you set it down', 'holding': 'tonight you hold it'
}
const askQ = await page.textContent('.rainy-ask-q')
check('the question is one of the night rotation', Object.values({
  a: 'is tonight a keeping night, or a releasing one?',
  b: 'what are you not feeling tonight?',
  c: 'whose voice was loudest in you today?',
  d: 'what are you still carrying that was never yours?'
}).includes(askQ.trim()), askQ)
const firstKey = await page.getAttribute('.rainy-ask-btn', 'data-night')
await page.click('.rainy-ask-btn')
await page.waitForTimeout(200)
const answered = await page.evaluate(k => JSON.parse(localStorage.getItem(k)), KEY)
check('the answer is recorded', answered.rainyNight === firstKey, String(answered.rainyNight))
check('it is pinned to this sitting', answered.rainyAsked === answered.sessionStart, answered.rainyAsked + ' vs ' + answered.sessionStart)
check('the panel closes on answer', !(await page.evaluate(() => document.getElementById('rainy-ask').classList.contains('open'))))
check('the ticker keeps the answer', new RegExp(ECHOES[firstKey]).test(await page.textContent('#rainy-ticker-answer')), await page.textContent('#rainy-ticker-answer'))
// same sitting: off then on again must NOT re-ask
await page.click('#rainy-toggle')
await page.waitForTimeout(200)
await page.click('#rainy-toggle')
await page.waitForTimeout(300)
check('it never asks twice in a sitting', !(await page.evaluate(() => document.getElementById('rainy-ask').classList.contains('open'))))
// a new sitting asks again
await seed({ shadowOn: true, rainyNight: 'keeping', rainyAsked: 1, sessionStart: Date.now() })
check('a new sitting asks again', await page.evaluate(() => document.getElementById('rainy-ask').classList.contains('open')))
check('yesterday\'s answer is not carried into the ticker',
  (await page.textContent('#rainy-ticker-answer')).trim() === '', await page.textContent('#rainy-ticker-answer'))
await page.click('.rainy-ask-else')
await page.waitForTimeout(200)
const declined = await page.evaluate(k => JSON.parse(localStorage.getItem(k)), KEY)
check('declining is a real answer, not a nag', declined.rainyNight === null && declined.rainyAsked === declined.sessionStart)
check('declining closes the panel', !(await page.evaluate(() => document.getElementById('rainy-ask').classList.contains('open'))))

// ─── 4. settings mirrors the same owner ─────────────────────────────────
console.log('4. settings mirrors it')
await seed({ shadowOn: false }, '/settings.html')
check('settings reads the weather off', (await page.textContent('#settings-shadow')).includes('let it rain'), await page.textContent('#settings-shadow'))
await page.click('#settings-shadow')
await page.waitForTimeout(250)
const afterSettings = await page.evaluate(k => ({
  key: !!JSON.parse(localStorage.getItem(k)).shadowOn,
  machine: document.querySelector('.machine').classList.contains('shadow-on'),
}), KEY)
check('settings writes the same key', afterSettings.key)
check('settings lights the same machine', afterSettings.machine)
check('settings reads the weather on', (await page.textContent('#settings-shadow')).includes('clear the weather'))
// the desktop icon reflects a state change made elsewhere
await seed({ shadowOn: false })
await page.evaluate(() => window.Liber.state.set({ shadowOn: true }))
await page.waitForTimeout(200)
check('the icon follows a change made by another surface',
  await page.getAttribute('#rainy-toggle', 'aria-pressed') === 'true')
await page.evaluate(() => window.Liber.state.set({ shadowOn: false }))
await page.waitForTimeout(200)
check('and follows it back off', await page.getAttribute('#rainy-toggle', 'aria-pressed') === 'false')

// ─── 5. helplines one click closer ──────────────────────────────────────
console.log('5. helplines one click closer')
await seed({ shadowOn: true })
check('the ticker offers hard nights', await page.locator('#rainy-ticker .rainy-help').count() === 1)
await page.click('#rainy-ticker .rainy-help')
await page.waitForTimeout(600)
check('it lands on the learn shelf', /learn\.html/.test(page.url()), page.url())
check('the Hard Nights card is the one that opens',
  /Hard Nights/.test(await page.textContent('.learn-card-title').catch(() => '')), await page.textContent('.learn-card-title').catch(() => 'none'))
check('the card carries the numbers', /988/.test(await page.textContent('.learn-card-body').catch(() => '')))

// ─── 6. ten primary rooms, each its own skin ────────────────────────────
console.log('6. the ten per-room skins')
const ROOMS = [
  ['sigil', '.sigil-app'], ['divination', '.divination-app'], ['sea', '.sea-app'],
  ['games', '.games-app'], ['garden', '.garden-app'], ['dreams', '.dreams-app'],
  ['learn', '.learn-app'], ['satchel', '.satchel-app'], ['toybox', '.toybox-app'],
  ['trash', '.trash-app'],
]
const GRAB = sel => {
  const el = document.querySelector(sel)
  if (!el) return null
  const cs = getComputedStyle(el)
  return {
    bg: cs.backgroundImage + '|' + cs.backgroundColor,
    color: cs.color,
    opacity: cs.opacity,
    filter: cs.filter,
    tokens: ['--felt', '--velvet', '--garden-bg', '--dreams-paper', '--porc-hi']
      .map(t => cs.getPropertyValue(t)).join(','),
  }
}

for (const [room, sel] of ROOMS) {
  await seed({ shadowOn: false }, `/${room}.html`)
  const dry = await page.evaluate(GRAB, sel)
  await page.screenshot({ path: `${OUT}/${room}-dry.png` })
  await seed({ shadowOn: true }, `/${room}.html`)
  const wet = await page.evaluate(GRAB, sel)
  await page.screenshot({ path: `${OUT}/${room}-rainy.png` })
  if (!dry || !wet) { check(`${room}: root found`, false, sel); continue }
  const changed = dry.bg !== wet.bg || dry.tokens !== wet.tokens
  check(`${room}: the palette actually shifts`, changed)
  check(`${room}: not an opacity wash`, wet.opacity === '1' && dry.opacity === '1' && !/opacity\(/.test(wet.filter),
    `opacity ${dry.opacity}→${wet.opacity}, filter ${wet.filter}`)
  check(`${room}: the machine itself goes cool`,
    await page.evaluate(() => document.querySelector('.machine').classList.contains('shadow-on')))
}

// ─── 7. 439px: zero layout breaks ───────────────────────────────────────
console.log('7. 439px survival')
const narrow = await browser.newContext({ viewport: { width: 439, height: 900 } })
const np = await narrow.newPage()
const nerr = []
np.on('pageerror', e => nerr.push('pageerror: ' + e.message))
const GEO = s => {
  const el = document.querySelector(s)
  const body = document.body
  let maxRight = 0
  if (el) {
    const er = el.getBoundingClientRect()
    for (const c of el.querySelectorAll('*')) {
      const r = c.getBoundingClientRect()
      if (r.width < 1 || r.height < 1) continue
      maxRight = Math.max(maxRight, r.right - er.right)
    }
  }
  return {
    rootOverflow: el ? el.scrollWidth - el.clientWidth : 0,
    docOverflow: body.scrollWidth - body.clientWidth,
    maxRight: Math.round(maxRight),
  }
}
async function loadNarrowDesktop() {
  await np.goto(BASE + '/desktop.html')
  await np.evaluate(([k, p]) => { localStorage.clear(); localStorage.setItem(k, JSON.stringify(p)) }, [KEY, Object.assign({}, BASE_STATE, { shadowOn: true })])
  await np.reload()
  await np.waitForTimeout(450)
  const tour = np.locator('#hijack')
  if (await tour.count()) {
    const sk = tour.locator('.hijack-skip')
    if (await sk.count()) await sk.click().catch(() => {})
    await np.waitForTimeout(150)
  }
}
async function loadNarrow(room, rainy) {
  await np.goto(BASE + `/${room}.html`)
  await np.evaluate(([k, p]) => { localStorage.clear(); localStorage.setItem(k, JSON.stringify(p)) }, [KEY, Object.assign({}, BASE_STATE, { shadowOn: rainy })])
  await np.reload()
  await np.waitForTimeout(400)
  const tour = np.locator('#hijack')
  if (await tour.count()) {
    const sk = tour.locator('.hijack-skip')
    if (await sk.count()) await sk.click().catch(() => {})
    await np.waitForTimeout(120)
  }
}
// The contract is "zero layout breaks at 439px" — the rain must not MOVE
// anything. Rooms already overflow their own glass at 439px (the shell hands
// every room ~316x265 there); what matters is that the weather adds nothing.
for (const [room, sel] of ROOMS) {
  await loadNarrow(room, false)
  const dry = await np.evaluate(GEO, sel)
  await loadNarrow(room, true)
  const wet = await np.evaluate(GEO, sel)
  check(`${room} @439: the rain moves nothing`,
    wet.rootOverflow === dry.rootOverflow && wet.docOverflow === dry.docOverflow && wet.maxRight === dry.maxRight,
    `root ${dry.rootOverflow}→${wet.rootOverflow}, doc ${dry.docOverflow}→${wet.docOverflow}, right ${dry.maxRight}→${wet.maxRight}`)
  check(`${room} @439: the page never scrolls sideways`,
    wet.docOverflow <= 2, `doc=${wet.docOverflow}`)
  await np.screenshot({ path: `${OUT}/${room}-439.png` })
}
check('@439: no page errors from any room', nerr.length === 0, nerr.join(' | '))

// the desktop's own furniture has to survive the narrow screen too:
// the icon must be hittable and the helplines must not be squeezed out
await loadNarrowDesktop()
const hit = await np.evaluate(() => {
  const c = s => { const el = document.querySelector(s); return el ? el.getBoundingClientRect() : null }
  const cent = r => ({ x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) })
  const t = c('#rainy-toggle'), h = c('#rainy-ticker .rainy-help')
  const at = r => { const p = cent(r); const el = document.elementFromPoint(p.x, p.y); return el ? el.className || el.id : 'none' }
  return {
    toggle: t && t.width >= 44 && t.height >= 44,
    tickerIn: h && h.width > 0 && h.right <= window.innerWidth + 1,
    helpHittable: h ? /rainy-help/.test(String(at(h))) : false,
    toggleHittable: t ? /rainy-toggle/.test(String(at(t))) : false,
    docOverflow: document.body.scrollWidth - document.body.clientWidth,
  }
})
check('@439: the rainy icon is a full hit target', hit.toggle)
check('@439: the rainy icon is hittable', hit.toggleHittable)
check('@439: the helplines stay on screen', hit.tickerIn, JSON.stringify(hit))
check('@439: the helplines are hittable', hit.helpHittable, JSON.stringify(hit))
check('@439: the desktop does not scroll sideways', hit.docOverflow <= 2, String(hit.docOverflow))

// ─── 8. the weather is IN THE HOUSE ─────────────────────────────────────
// It does not fall across the room, and it does not fall at the desk. It
// falls in the room behind the CRT, in THAT room's own window — one window,
// one place. The desk side is what the machine does about it: the palette
// goes cold, the tube takes the water that got in, and the monitor's face
// stays CLEAR (weather changes how the machine is lit, never how much of the
// room you can see through it). The drops are scattered, never a grid.
console.log('8. the weather is in the house')
await seed({ shadowOn: true })
const desk = await page.evaluate(() => ({
  rainyOn: document.body.classList.contains('rainy-on'),
  machine: document.querySelector('.machine').classList.contains('shadow-on'),
  // no window, no sky, no sill and no rain at the desk any more
  deskWeather: document.querySelectorAll('.rainy-window, .rainy-sky, .rainy-sill, .rainy-drop').length,
  // the monitor must not be filmed over
  faceFilm: getComputedStyle(document.querySelector('.machine'), '::before').content,
  // the water the machine let in
  beads: getComputedStyle(document.querySelector('.screen-stage'), '::before').backgroundImage.includes('radial'),
  runnel: getComputedStyle(document.querySelector('.screen-stage'), '::after').backgroundImage !== 'none',
}))
check('the desk knows it is raining', desk.rainyOn && desk.machine)
check('the desk carries NO second window', desk.deskWeather === 0, String(desk.deskWeather))
check('the monitor face is not filmed over', desk.faceFilm === 'none', String(desk.faceFilm))
check('the tub carries the water that got in', desk.beads && desk.runnel)

// and the weather only exists where it is looked at: in the room's window
await seed({ shadowOn: true, crtRoomOn: true })
await page.click('#crt-room-toggle').catch(() => {})
await page.waitForTimeout(500)
const rain = await page.evaluate(() => {
  const drops = [...document.querySelectorAll('.crt-drop')]
  const win = document.querySelector('.crt-window')
  const sky = document.querySelector('.crt-window .crt-wb-sky')
  const uniq = k => new Set(drops.map(d => d.style.getPropertyValue(k))).size
  const wr = win.getBoundingClientRect()
  return {
    count: drops.length,
    inWindow: drops.filter(d => d.closest('.crt-window')).length,
    // no full-room weather layer may exist at all
    wholeRoomLayers: document.querySelectorAll('.rainy-rain, .rainy-ripples, .rainy-ripple').length,
    // the old grid: a repeating gradient in the pane would read as texture
    grid: getComputedStyle(win, '::after').backgroundImage,
    winClips: getComputedStyle(win).overflow === 'hidden',
    skyInWin: !!sky && sky.closest('.crt-window') === win,
    dropsHitThrough: drops.every(d => getComputedStyle(d).pointerEvents === 'none'),
    inViewport: wr.left >= -1 && wr.right <= window.innerWidth + 1 &&
                wr.top >= -1 && wr.bottom <= window.innerHeight + 1,
    uniqLeft: uniq('left'),
    uniqLen: uniq('--len'),
    uniqDur: uniq('--dur'),
    uniqPhase: uniq('--delay'),
    maxOp: Math.max(...drops.map(d => parseFloat(d.style.getPropertyValue('--op')) || 0)),
  }
})
check('it rains, in the room', rain.count > 10, 'drops=' + rain.count)
check('all of it falls inside the room\u2019s window', rain.inWindow === rain.count, rain.inWindow + '/' + rain.count)
check('the room\u2019s window is the pane', rain.skyInWin)
check('the panes clip the rain to the frame', rain.winClips)
check('there is NO rain over the whole room', rain.wholeRoomLayers === 0, String(rain.wholeRoomLayers))
check('the old grid rain is gone', rain.grid === 'none', String(rain.grid).slice(0, 40))
check('the window is inside the viewport', rain.inViewport)
check('every drop has its own column', rain.uniqLeft === rain.count, rain.uniqLeft + '/' + rain.count)
check('every drop has its own length', rain.uniqLen > rain.count * 0.5, rain.uniqLen + '/' + rain.count)
check('every drop has its own speed', rain.uniqDur > rain.count * 0.5, rain.uniqDur + '/' + rain.count)
check('every drop has its own phase', rain.uniqPhase > rain.count * 0.5, rain.uniqPhase + '/' + rain.count)
check('the pane is not saturated', rain.count <= 40, String(rain.count))
check('no drop is loud on its own', rain.maxOp <= 0.5, String(rain.maxOp))
check('the weather never eats a click', rain.dropsHitThrough)

// ─── 8b. ONE OBJECT, NEVER TWO (covenant rule 4) ────────────────────────
// Clearing the weather must clear it everywhere at once, and the room the
// gaze opens onto must be the room the weather is in — never a copy of it at
// the desk, and never a layer over the tube.
console.log('8b. one object, never two')
const behindOpen = await page.evaluate(() => ({
  open: document.body.classList.contains('crt-room-open'),
  // the desk backdrop must yield to the room, or the room is painted under it
  deskBackdrop: getComputedStyle(document.querySelector('.room')).backgroundColor,
  faceFilm: getComputedStyle(document.querySelector('.machine'), '::before').content,
}))
check('the gaze opens the room', behindOpen.open)
check('the desk backdrop yields to the room', behindOpen.deskBackdrop === 'rgba(0, 0, 0, 0)', behindOpen.deskBackdrop)
check('the monitor face is still clear while you look behind', behindOpen.faceFilm === 'none', String(behindOpen.faceFilm))

await page.click('#rainy-toggle').catch(() => {})
await page.waitForTimeout(350)
const clearedInside = await page.evaluate(() => ({
  drops: document.querySelectorAll('.crt-drop').length,
  rainyRoom: !!document.querySelector('.crt-room-rainy'),
  rainyOn: document.body.classList.contains('rainy-on'),
}))
check('clearing it clears the room\u2019s rain too', clearedInside.drops === 0, String(clearedInside.drops))
check('and the room stops being in weather', !clearedInside.rainyRoom && !clearedInside.rainyOn)
check('clearing the weather leaves no window behind', await page.evaluate(() =>
  document.querySelectorAll('.crt-drop, .rainy-window, .rainy-sky, .rainy-sill, .rainy-drop').length === 0))

// the room's window is the only pane, so it has to survive the small screen
// too: 34vw x 15vh at 439px is a small sash, and the rain must still be inside it
await page.setViewportSize({ width: 439, height: 780 })
await seed({ shadowOn: true, crtRoomOn: true })
await page.click('#crt-room-toggle').catch(() => {})
await page.waitForTimeout(500)
const small = await page.evaluate(() => {
  const win = document.querySelector('.crt-window')
  const drops = [...document.querySelectorAll('.crt-drop')]
  const wr = win.getBoundingClientRect()
  return {
    count: drops.length,
    inWindow: drops.filter(d => d.closest('.crt-window')).length,
    inViewport: wr.left >= -1 && wr.right <= window.innerWidth + 1 &&
                wr.top >= -1 && wr.bottom <= window.innerHeight + 1,
    docOverflow: document.documentElement.scrollWidth - window.innerWidth,
  }
})
check('@439: it still rains in the room', small.count > 5, 'drops=' + small.count)
check('@439: all of it is inside the pane', small.inWindow === small.count, small.inWindow + '/' + small.count)
check('@439: the window is inside the viewport', small.inViewport)
check('@439: the room does not scroll sideways', small.docOverflow <= 2, String(small.docOverflow))
await page.setViewportSize({ width: 1280, height: 800 })

// ─── 9. no errors on the desktop ────────────────────────────────────────
console.log('9. no errors')
check('zero page errors across the run', errors.length === 0, errors.slice(0, 3).join(' | '))

console.log('\n' + pass + ' passed, ' + fail + ' failed')
await browser.close()
server.kill()
process.exit(fail ? 1 : 0)
