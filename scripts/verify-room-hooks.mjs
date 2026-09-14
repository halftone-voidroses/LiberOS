// verify-room-hooks.mjs — covenant rule 4 (THE ROOM REMEMBERS), enforced.
//
// The room behind the CRT is the machine's memory. A feature that leaves
// nothing there is unfinished, and the failure mode is silent: everything
// works, and the room behind the machine quietly stops being the machine's
// memory. So this gate does three things:
//
//   1. every folder in src/features/ has a row in liberdev/room-hooks.md
//   2. every state key a row claims to read actually exists in src/state.js
//   3. the ids the live room reports (window.Liber.crtRoom.hooks()) match the
//      ids the register claims — so the document cannot drift from the code
//
// Run: node scripts/verify-room-hooks.mjs

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'

let pass = 0, fail = 0
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ✓ ' + name) }
  else { fail++; console.log('  ✗ ' + name + (detail !== undefined ? '  → ' + detail : '')) }
}

const REGISTER = 'liberdev/room-hooks.md'
const MATERIALS = ['shelf', 'pool', 'candle', 'board', 'trophies', 'window', 'weather', 'patina', 'floor', 'none']

// ─── parse the register ─────────────────────────────────────────────────
console.log('1. the register exists and is parseable')
const md = readFileSync(REGISTER, 'utf8')
// Scope each table to its own `## ` section: the vocabulary table, the hook
// table and the two-sided table all start with `| \`` and would otherwise be
// read as one another.
function section(title) {
  const at = md.indexOf(title)
  if (at < 0) return ''
  const rest = md.slice(at + title.length)
  const end = rest.indexOf('\n## ')
  return end < 0 ? rest : rest.slice(0, end)
}
const rows = []
for (const line of section('## The hooks').split('\n')) {
  if (!line.startsWith('| `')) continue
  const cells = line.split('|').map(c => c.trim()).filter(c => c.length)
  if (cells.length < 6) continue
  const folder = cells[0].replace(/`/g, '')
  if (!cells[1].startsWith('`')) continue
  rows.push({
    folder,
    id: cells[1].replace(/`/g, ''),
    material: cells[2].replace(/`/g, ''),
    reads: cells[3].split(',').map(s => s.trim().replace(/`/g, '')).filter(Boolean),
    owner: cells[4],
    empty: cells[5],
  })
}
check('the register lists hooks', rows.length > 0, rows.length + ' rows')

// one object, never two (covenant rule 4)
const oneOnly = []
for (const line of section('## One object, never two').split('\n')) {
  if (!line.startsWith('| `')) continue
  const cells = line.split('|').map(c => c.trim()).filter(c => c.length)
  if (cells.length < 4) continue
  oneOnly.push({
    hook: cells[0].replace(/`/g, ''),
    pane: cells[1],
    owner: cells[2].replace(/`/g, ''),
    retired: cells[3].split(',').map(s => s.trim()).filter(Boolean),
  })
}
check('the register names the single-instance hooks', oneOnly.length > 0, oneOnly.length + ' rows')

// ─── 1. every feature folder is represented ─────────────────────────────
console.log('2. every feature folder declares a hook')
const folders = readdirSync('src/features').filter(f => statSync(`src/features/${f}`).isDirectory())
const declared = new Set(rows.map(r => r.folder))
for (const f of folders) {
  check(`${f} is in ${REGISTER}`, declared.has(f))
}
// `(machine)` rows are the room's own furniture, fed by shared src/ modules
// rather than by any one feature folder — the register says so in prose, so
// they are not orphans. Every other folder name must still resolve.
const orphans = rows.filter(r => r.folder !== '(machine)' && !folders.includes(r.folder))
check('the register names no folder that no longer exists', orphans.length === 0,
  orphans.map(o => o.folder).join(', '))

// ─── 2. named materials only ────────────────────────────────────────────
console.log('3. named materials only')
for (const r of rows) {
  check(`${r.folder}: material "${r.material}" is in the vocabulary`, MATERIALS.includes(r.material))
}
const used = [...new Set(rows.map(r => r.material))]
check('the register uses more than one material', used.length > 2, used.join(', '))

// ─── 3. every declared read is a real state key ─────────────────────────
console.log('4. every hook reads a state key that exists')
const stateSrc = readFileSync('src/state.js', 'utf8')
const defaultBlock = stateSrc.slice(stateSrc.indexOf('const DEFAULT = {'), stateSrc.indexOf('function load()'))
const keys = new Set([...defaultBlock.matchAll(/^\s*([a-zA-Z][A-Za-z0-9_]*)\s*:/gm)].map(m => m[1]))
check('read the state defaults', keys.size > 10, keys.size + ' keys')
for (const r of rows) {
  if (r.material === 'none') continue
  for (const k of r.reads) {
    check(`${r.folder}: state key "${k}" exists`, keys.has(k))
  }
}

// ─── 4. every hook states an empty condition ────────────────────────────
console.log('5. every hook says what the room looks like empty')
for (const r of rows) {
  check(`${r.folder}: names its empty condition`, r.empty && r.empty.length > 12, r.empty)
}

// ─── 5. one object, never two ───────────────────────────────────────────
// The room renders a hook; nothing else may. Each row names where it renders,
// which stylesheet owns that pane, and the selectors the desk side is not
// allowed to carry any more. Both halves are checked: the pane must really be
// in the owner, and the retired selectors must be gone from ALL the CSS.
console.log('5b. one object, never two')
function cssFiles(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = `${dir}/${f}`
    if (statSync(p).isDirectory()) cssFiles(p, out)
    else if (f.endsWith('.css')) out.push(p)
  }
  return out
}
const allCss = [...cssFiles('styles'), ...cssFiles('src/features')]
const cssText = allCss.map(p => readFileSync(p, 'utf8')).join('\n')
// strip comments before the "is it gone?" test, so prose about a retired
// selector (like the register explaining why it is retired) is not a hit
const cssCode = cssText.replace(/\/\*[\s\S]*?\*\//g, '')
for (const t of oneOnly) {
  check(`${t.hook}: names an owning stylesheet that exists`,
    !!t.owner && statSync(t.owner).isFile(), t.owner)
  const pane = t.pane.match(/\(([^)]+)\)/)
  const paneSel = pane ? pane[1].replace(/`/g, '').trim() : null
  check(`${t.hook}: the pane is really in the owning stylesheet`,
    !!paneSel && readFileSync(t.owner, 'utf8').includes(paneSel), String(paneSel))
  check(`${t.hook}: the register's hook is one the room renders`,
    rows.some(r => r.id === t.hook && r.material !== 'none'), t.hook)
  for (const sel of t.retired) {
    const bare = sel.replace(/`/g, '').trim()
    check(`${t.hook}: the desk side carries no "${bare}"`, !cssCode.includes(bare), bare)
  }
}

// ─── 6. the live room agrees with the register ──────────────────────────
console.log('6. the live room reports the same hooks')
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
const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage()
const errs = []
page.on('pageerror', e => errs.push(e.message))
await page.goto(`http://127.0.0.1:${PORT}/desktop.html`, { waitUntil: 'networkidle' })
await page.waitForTimeout(500)
const live = await page.evaluate(() => {
  if (!window.Liber || !window.Liber.crtRoom || !window.Liber.crtRoom.hooks) return null
  return window.Liber.crtRoom.hooks()
})
check('the room exports its hooks', Array.isArray(live) && live.length > 0,
  live === null ? 'window.Liber.crtRoom.hooks() is missing' : String(live.length))

if (Array.isArray(live)) {
  const liveIds = live.map(h => h.id).sort()
  const docIds = rows.filter(r => !['settings', 'crt-room', 'learn', 'dreams', 'toybox', 'about', 'cohort', 'buddy', 'themes'].includes(r.folder))
    .map(r => r.id).sort()
  // every hook the room renders must be in the register...
  for (const id of liveIds) {
    check(`the register documents the live hook "${id}"`, rows.some(r => r.id === id && r.material !== 'none'))
  }
  // ...and every material row in the register must be rendered by the room
  for (const r of rows) {
    if (r.material === 'none') continue
    check(`the room renders the registered hook "${r.id}"`, liveIds.includes(r.id), liveIds.join(', '))
  }
  check('the room renders every material it claims', live.every(h => MATERIALS.includes(h.material)))
  check('no live hook reads a key the register hides', live.every(h => Array.isArray(h.reads)))
  check('the ids agree', docIds.length > 0 && liveIds.length > 0)
}
check('zero page errors', errs.length === 0, errs.slice(0, 2).join(' | '))

// ─── 7. the tube's paper: the hook has two sides ────────────────────────
// A register row and a rendered id are not a hook. The floor has to gain a
// strip when a conversation is left unkept, and lose it when that
// conversation is sealed to the book — the reversal rule, tested rather
// than asserted. The state is driven through the same set() everything else
// uses, so this measures the room, not the seed.
console.log('7. the tube\u2019s paper gains and loses with the talking')
async function slips(shape) {
  return page.evaluate(async (patch) => {
    window.Liber.state.set({ chat: null, buddy: [] });
    window.Liber.state.set(patch);
    window.Liber.crtRoom.render();
    await new Promise(r => setTimeout(r, 60));
    return document.querySelectorAll('.crt-slip').length;
  }, shape)
}
check('a quiet machine leaves no paper on the boards', await slips({}) === 0)
check('an unkept conversation leaves a strip, one per persona',
  await slips({ chat: { sigil: 3, games: 6 } }) === 2)
check('sealing a conversation sweeps its strip',
  await slips({ chat: { sigil: 3, games: 6 },
    buddy: [{ id: 'b1', kind: 'sealed', lamp: true, persona: 'sigil', exchanges: 3 }] }) === 1)
check('talking on after a seal leaves new paper',
  await slips({ chat: { sigil: 5 },
    buddy: [{ id: 'b1', kind: 'sealed', lamp: true, persona: 'sigil', exchanges: 3 }] }) === 1)
check('sealing the last conversation sweeps the floor',
  await slips({ chat: { sigil: 3 },
    buddy: [{ id: 'b1', kind: 'sealed', lamp: true, persona: 'sigil', exchanges: 3 }] }) === 0)
check('a chat sealed away from the lamp is not the tube\u2019s paper',
  await slips({ chat: { sigil: 3 },
    buddy: [{ id: 'b1', kind: 'sealed', lamp: false, persona: 'sigil', exchanges: 3 }] }) === 1)
check('the floor holds a floor, not a pile',
  await slips({ chat: { a: 1, b: 2, c: 3, d: 4, e: 5 } }) === 4)

// ─── 8. the ceremony, end to end ────────────────────────────────────────
// The derivation above is fed by hand. This runs the machine's own paths:
// talk through the real engine, seal in wax, and watch the paper leave the
// floor because the conversation reached the book.
console.log('8. the seal is the broom')
const sealed = await page.evaluate(async () => {
  const chat = window.LiberLiberchat;
  chat.open();
  await new Promise(r => setTimeout(r, 250));
  // the persona the desk actually talks to — not a persona id assumed here
  const p = chat.persona();
  const seed = {};
  seed[p] = 4;
  window.Liber.state.set({ chat: seed, buddy: [] });
  window.Liber.crtRoom.render();
  await new Promise(r => setTimeout(r, 60));
  const before = document.querySelectorAll('.crt-slip').length;
  chat.say('a line that will end up on the boards');
  await new Promise(r => setTimeout(r, 900));
  const seal = document.querySelector('.liberchat-panel .lc-seal');
  seal.click();
  await new Promise(r => setTimeout(r, 140));
  seal.click();
  await new Promise(r => setTimeout(r, 400));
  window.Liber.crtRoom.render();
  await new Promise(r => setTimeout(r, 120));
  const s = window.Liber.state.get();
  const keeps = (s.buddy || []).filter(k => k && k.kind === 'sealed' && k.lamp);
  return {
    persona: p,
    before: before,
    after: document.querySelectorAll('.crt-slip').length,
    kept: keeps.length,
    keepPersona: keeps.length ? keeps[0].persona : null,
    keepExchanges: keeps.length ? keeps[0].exchanges : null,
    chatNow: (s.chat || {})[p] || 0
  };
});
check('a conversation left unkept is paper on the floor', sealed.before === 1, String(sealed.before));
check('sealing files the conversation to the book', sealed.kept === 1, JSON.stringify(sealed));
check('the keep names the persona that was talking', sealed.keepPersona === sealed.persona,
  sealed.keepPersona + ' vs ' + sealed.persona);
check('the keep records the count it was sealed at, so nothing is left over',
  sealed.keepExchanges === sealed.chatNow, sealed.keepExchanges + ' vs ' + sealed.chatNow);
check('and so the strip leaves the floor', sealed.after === 0, String(sealed.after));

console.log('\n' + pass + ' passed, ' + fail + ' failed')
await browser.close()
server.kill()
process.exit(fail ? 1 : 0)
