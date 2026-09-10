// verify-affinity.mjs — headless gate for unlock thresholds (node scripts/verify-affinity.mjs).
// Each unlock fires exactly at its futures §17 count, once, and never
// without the work behind it.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const A = require('../src/affinity.js');

let fails = 0;
function check(name, ok, detail) {
  if (ok) console.log('PASS ' + name);
  else { fails++; console.log('FAIL ' + name + ' :: ' + (detail || '')); }
}
function storeOf(s) {
  let state = s;
  return {
    read: () => state,
    write: (patch) => { state = Object.assign({}, state, patch); },
  };
}
function unlockedIds(s) {
  const st = storeOf(s);
  const a = A.create(st.read, st.write);
  a.check();
  return Object.keys(st.read().unlocks || {});
}

check('toybox-1-game', unlockedIds({ games: [1] }).join() === 'toybox');
check('toybox-needs-work', unlockedIds({ games: [] }).length === 0);
check('tidepool-5-releases', unlockedIds({ sea: [1, 2, 3, 4, 5] }).includes('tidepool'));
check('tidepool-4-is-shut', !unlockedIds({ sea: [1, 2, 3, 4] }).includes('tidepool'));
check('weaver-5-binds', unlockedIds({ relations: [1, 2, 3, 4, 5] }).includes('weaver'));
check('thimble-3-plantings', unlockedIds({ garden: [1, 2, 3] }).includes('thimble'));
check('inkstorm-1-seal', unlockedIds({ buddy: [{ kind: 'sealed' }] }).includes('inkstorm'));
check('inkstorm-needs-seal', !unlockedIds({ buddy: [{ kind: 'stone' }] }).includes('inkstorm'));

// fires once: second check with unlocks persisted adds nothing new
const st = storeOf({ games: [1] });
const a = A.create(st.read, st.write);
check('first-fire', a.check().map((u) => u.id).join() === 'toybox');
check('second-silence', a.check().length === 0);

// affinity scores track the work
const aff = A.create(storeOf({ games: [1, 2], sea: [1], garden: [1, 2, 3], relations: [1] }).read, () => {});
const scores = aff.affinity({ games: [1, 2], sea: [1], garden: [1, 2, 3], relations: [1] });
check('scores', scores.whimsy === 2 && scores.ruby === 3, JSON.stringify(scores));

if (fails) { console.log('AFFINITY RED: ' + fails); process.exit(1); }
console.log('AFFINITY GREEN');
