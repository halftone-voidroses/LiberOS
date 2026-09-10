// verify-powder.mjs — headless proof for powder.js (node scripts/verify-powder.mjs).
// Pins the powder-tent contract: fall, sink, hiss→steam, fade, float,
// rise, ignite, dissolve, sprout, stasis, determinism, census.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const P = require('../src/features/toybox/powder.js');

let fails = 0;
function check(name, ok, detail) {
  if (ok) console.log('PASS ' + name);
  else { fails++; console.log('FAIL ' + name + ' :: ' + (detail || '')); }
}

// sand settles
let s = P.create();
for (let y = 2; y < 7; y++) for (let x = 40; x < 80; x++) s.pour(x, y, P.SAND, 0);
for (let i = 0; i < 250; i++) s.step();
check('sand-settles', s.countInRows(P.SAND, 140, 150) > 150, s.countInRows(P.SAND, 140, 150));
check('sand-leaves-top', s.countInRows(P.SAND, 0, 20) === 0);

// water + fire hiss into steam, then steam fades
let h = P.create();
for (let x = 55; x < 65; x++) h.pour(x, 140, P.WATER, 0);
for (let x = 55; x < 65; x++) h.pour(x, 139, P.FIRE, 0);
for (let i = 0; i < 6; i++) h.step();
check('hiss-makes-steam', h.countElement(P.STEAM) > 0, h.countElement(P.STEAM));
for (let i = 0; i < 80; i++) h.step();
check('steam-fades', h.countElement(P.STEAM) === 0, h.countElement(P.STEAM));

// oil floats on the sunken water table
let o = P.create();
for (let x = 50; x < 70; x++) for (let y = 120; y < 140; y++) o.setAt(x, y, P.WATER);
for (let y = 104; y < 110; y++) for (let x = 55; x < 65; x++) o.pour(x, y, P.OIL, 0);
for (let i = 0; i < 60; i++) o.step();
check('oil-floats', o.countInRows(P.OIL, 130, 150) > 30, o.countInRows(P.OIL, 130, 150));

// oil rises through water it touches
let r = P.create();
for (let x = 50; x < 70; x++) for (let y = 100; y < 110; y++) r.setAt(x, y, P.WATER);
for (let x = 55; x < 65; x++) r.setAt(x, 110, P.OIL);
for (let i = 0; i < 8; i++) r.step();
check('oil-rises', r.topRow(P.OIL) >= 0 && r.topRow(P.OIL) < 108, r.topRow(P.OIL));

// fire ignites adjacent oil
let f = P.create();
for (let x = 55; x < 65; x++) f.pour(x, 140, P.OIL, 0);
for (let x = 55; x < 65; x++) f.pour(x, 139, P.FIRE, 0);
for (let i = 0; i < 12; i++) f.step();
check('oil-ignites', f.countElement(P.OIL) === 0, f.countElement(P.OIL));

// salt dissolves beside water
let sa = P.create();
for (let x = 55; x < 65; x++) for (let y = 130; y < 145; y++) sa.setAt(x, y, P.WATER);
for (let y = 116; y < 120; y++) for (let x = 55; x < 65; x++) sa.pour(x, y, P.SALT, 0);
for (let i = 0; i < 100; i++) sa.step();
check('salt-dissolves', sa.countElement(P.SALT) < 20, sa.countElement(P.SALT));

// seed + water = sprout
let sd = P.create();
for (let x = 55; x < 65; x++) for (let y = 130; y < 145; y++) sd.setAt(x, y, P.WATER);
for (let x = 55; x < 65; x++) sd.pour(x, 125, P.SEED, 0);
for (let i = 0; i < 40; i++) sd.step();
check('seed-sprouts', sd.countElement(P.SPROUT) > 0, sd.countElement(P.SPROUT));

// walls never move
let w = P.create();
for (let x = 10; x < 110; x++) w.setAt(x, 140, P.WALL);
const before = JSON.stringify(w.snapshot());
for (let i = 0; i < 50; i++) w.step();
check('wall-static', JSON.stringify(w.snapshot()) === before);

// determinism across element sets
const a = P.create(), b = P.create();
for (const sim of [a, b]) {
  sim.pour(60, 10, P.OIL, 1);
  sim.pour(60, 20, P.SALT, 1);
  sim.pour(60, 30, P.SEED, 1);
  for (let i = 0; i < 60; i++) sim.step();
}
check('deterministic', JSON.stringify(a.snapshot()) === JSON.stringify(b.snapshot()));
check('census', a.census().join(',') === 'oil,salt,seed', a.census().join(','));

if (fails) { console.log('POWDER RED: ' + fails); process.exit(1); }
console.log('POWDER GREEN');
