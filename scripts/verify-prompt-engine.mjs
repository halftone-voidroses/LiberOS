// verify-prompt-engine.mjs — stubbed-browser verifier for src/prompt-engine.js
// (zero dependencies; node:vm provides the browser globals)
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let failures = 0;
function check(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures++;
}

const events = [];
const storage = new Map();
const sandbox = {
  console,
  setTimeout,
  CustomEvent: class CustomEvent { constructor(type, opts) { this.type = type; this.detail = opts && opts.detail; } },
  addEventListener() {},
  removeEventListener() {},
  document: {
    dispatchEvent(e) { events.push(e); return true; },
    addEventListener() {},
    getElementById() { return null; },
  },
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.localStorage = {
  getItem: k => (storage.has(k) ? storage.get(k) : null),
  setItem: (k, v) => storage.set(k, String(v)),
};

const ctx = vm.createContext(sandbox);
for (const f of ['src/state.js', 'data/tarot.data.js', 'data/prompt-templates.data.js', 'src/prompt-engine.js']) {
  vm.runInContext(readFileSync(join(root, f), 'utf8'), ctx, { filename: f });
}

const L = sandbox.window.Liber;
check('engine registers window.Liber.prompts', !!L.prompts && typeof L.prompts.compose === 'function');

const sigil = { id: 'sigil-1', kind: 'stone', intention: 'my fear of inadequacy', ts: Date.now() };
L.state.set({ buddy: [sigil] });
const card = L.state.addArtifact('divination', { name: 'the emperor', key: 'a line drawn and held', n: 4, g: '♂' });
L.state.addArtifact('divination', { name: 'the tower', key: 'the structure, broken', n: 16, g: '⚡' });

// (a) determinism
const rel = { from: card.id, verb: 'protects' };
const a = L.prompts.compose(rel);
const b = L.prompts.compose(rel);
check('deterministic: same relation → same text', a && b && a.text === b.text, a && a.text);
check('compose resolves slots', a && typeof a.text === 'string' && a.text.length > 0 && !/\{|\}/.test(a.text) && a.text.includes('fear of inadequacy'), a && a.text);

// (b) verb gating: protects never picks a template gated to another family
const gatedIds = new Set(['threatens-aim', 'threatens-warning', 'mirror-look', 'mirror-away', 'carries-weight', 'carries-putdown', 'refuses-door', 'refuses-speak']);
let gateOk = true;
const otherCards = L.state.get().divination.slice(1);
for (const c of otherCards) {
  const p = L.prompts.compose({ from: c.id, verb: 'protects' });
  if (p && gatedIds.has(p.templateId)) gateOk = false;
}
check('verb gating: protects → only protect/any templates', gateOk);
const generic = L.prompts.compose({ from: card.id, verb: 'reminds me of tuesdays' });
check('unknown verb falls back to generic templates', generic && (generic.templateId.startsWith('any-') || generic.templateId.startsWith('tag-')), generic && generic.templateId);

// (c) no unresolved slot tokens across every relation × every template family
const verbs = ['protects', 'threatens me', 'mirrors', 'carries', 'refuses', 'relates to'];
const arts = L.state.get().divination;
let tokensOk = true;
let badText = '';
for (const art of arts) {
  for (const v of verbs) {
    const p = L.prompts.compose({ from: art.id, verb: v });
    if (p && /\{[a-z]+\}|\{\}/.test(p.text)) { tokensOk = false; badText = p.text; }
  }
}
check('no unresolved {slot} tokens', tokensOk, badText);

// (d) generate() dedupes via state (bind real relations first)
const towers = L.state.get().divination[1];
L.state.set({ relations: [{ from: card.id, verb: 'protects', ts: Date.now() }, { from: towers.id, verb: 'threatens me', ts: Date.now() }] });
const afterFirst = (L.state.get().prompts || []).length;
L.prompts.generate();
const afterSecond = (L.state.get().prompts || []).length;
check('generate() dedupes prompts', afterFirst > 0 && afterSecond === afterFirst, `${afterFirst} → ${afterSecond}`);

// (e) liber:prompt CustomEvent fires per new prompt (auto-subscribe fires on change)
const eventsBefore = events.filter(e => e.type === 'liber:prompt').length;
L.state.set({ relations: L.state.get().relations.concat([{ from: otherCards[0].id, verb: 'mirrors', ts: Date.now() }]) });
L.prompts.generate();
const eventsAfter = events.filter(e => e.type === 'liber:prompt').length;
check('liber:prompt CustomEvent fires for new prompts', eventsAfter > eventsBefore, `${eventsBefore} → ${eventsAfter}`);

// (f) empty-data resilience: engine with no tarot/templates must not throw
const sandbox2 = { console, setTimeout, CustomEvent: sandbox.CustomEvent, document: sandbox.document, addEventListener() {}, removeEventListener() {} };
sandbox2.window = sandbox2;
sandbox2.globalThis = sandbox2;
sandbox2.localStorage = sandbox.localStorage;
const ctx2 = vm.createContext(sandbox2);
vm.runInContext(readFileSync(join(root, 'src/state.js'), 'utf8'), ctx2, { filename: 'state.js' });
vm.runInContext(readFileSync(join(root, 'src/prompt-engine.js'), 'utf8'), ctx2, { filename: 'prompt-engine.js' });
const L2 = sandbox2.window.Liber;
L2.state.set({ sigils: [{ id: 's', intention: 'x' }] });
L2.state.set({ divination: [{ id: 'd1', name: 'the fool' }] });
let resilient = true;
try {
  L2.state.set({ relations: [{ from: 'd1', verb: 'protects', ts: 1 }] });
  L2.prompts.generate();
} catch (e) { resilient = false; }
check('never throws with missing data wrappers', resilient);

console.log(failures ? `\n${failures} check(s) failed` : '\nall prompt-engine checks passed');
process.exit(failures ? 1 : 0);
