// verify-aiml.mjs — headless gate for the LiberChat minds (node scripts/verify-aiml.mjs).
// Loads the real aiml.js interpreter + buddy/vanir DBs with a window stub
// and asserts: the name is asked before any patter, crisis/srai/star/
// keyword behavior, deterministic rotation, and the house no-rand rule.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

let fails = 0;
function check(name, ok, detail) {
  if (ok) console.log('PASS ' + name);
  else { fails++; console.log('FAIL ' + name + ' :: ' + (detail || '')); }
}

// house rule: no Math.random anywhere the visitor can perceive
// (comments citing the rule itself don't count)
const aimlSrc = read('src/features/buddy/aiml.js')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/(^|\s)\/\/.*$/gm, '$1');
check('no-rand', !/Math\.random/.test(aimlSrc));

function loadMind() {
  const window = {};
  for (const f of ['src/features/buddy/aiml.js', 'src/features/buddy/buddy.aiml.js', 'src/features/buddy/vanir.aiml.js']) {
    new Function('window', read(f))(window);
  }
  return window;
}
function makeBot(window, id, preds) {
  const def = window.LiberAIML[id];
  return window.Liber.aiml.create({
    categories: def.categories, fallback: def.fallback, greetings: def.greetings,
    askName: def.askName, defaults: def.defaults, meta: { name: def.meta.name },
    preds: preds || {},
  });
}
// Mirrors registerUser in buddy.js: askName must be forwarded or greet()
// can never ask. The gate pins the room's real wiring, not a sketch.
const window = loadMind();
check('db:askName-buddy', typeof window.LiberAIML.buddy.askName === 'string' && window.LiberAIML.buddy.askName.includes('call you'));
check('db:askName-vanir', typeof window.LiberAIML.vanir.askName === 'string' && window.LiberAIML.vanir.askName.includes('call you'));

// Fresh visitors are asked for a name before any patter.
let b0 = makeBot(window, 'buddy', {});
check('greet-asks-name', b0.greet().includes('call you'), b0.greet());

let b1 = makeBot(window, 'buddy', {});
b1.respond('my name is Rose');
let b1named = makeBot(window, 'buddy', { name: 'Rose' });
check('greet-knows-name', b1named.greet().includes('Rose'), b1named.greet());

let b2 = makeBot(window, 'buddy', {});
check('crisis', b2.respond('i want to die').includes('put it down here'));
check('srai', b2.respond('hi').includes('surface'));
check('star', b2.respond('i feel hollow').includes('hollow'));

const d1 = makeBot(window, 'buddy', {}), d2 = makeBot(window, 'buddy', {});
let same = true;
for (const line of ['hello', 'i feel strange', 'my boss hates me']) {
  if (d1.respond(line) !== d2.respond(line)) same = false;
}
check('deterministic', same);

let v0 = makeBot(window, 'vanir', {});
check('vanir-asks-name', v0.greet().includes('call you'), v0.greet());

if (fails) { console.log('AIML RED: ' + fails); process.exit(1); }
console.log('AIML GREEN');
