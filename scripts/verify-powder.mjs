// verify-powder.mjs — headless proof for powder.js (node scripts/verify-powder.mjs).
// Pins the powder-tent contract: fall, sink, hiss→steam, fade, float,
// rise, ignite, dissolve, sprout, stasis, determinism, census.
//
// Every row is derived from the sim's own H/W. Hard-coded row numbers rot
// silently whenever the tray is resized: the old 139–150 rows fell off a
// 125-row grid, which failed five checks and left "oil-ignites" and
// "wall-static" green over an empty tray.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const P = require('../src/features/toybox/powder.js');

const W = P.W, H = P.H;
const MID = Math.floor(W / 2);
const LOW = H - 5;          // a row in the bottom of the tray
const BAND = H - 15;        // top of the "settled at the bottom" band

let fails = 0;
function check(name, ok, detail) {
  if (ok) console.log('PASS ' + name);
  else { fails++; console.log('FAIL ' + name + ' :: ' + detail); }
}
function pourRows(sim, from, to, v) {
  for (let y = from; y <= to; y++) for (let x = MID - 15; x < MID + 15; x++) sim.pour(x, y, v, 0);
}
function setRows(sim, from, to, v) {
  for (let y = from; y <= to; y++) for (let x = MID - 25; x < MID + 25; x++) sim.setAt(x, y, v);
}

// sand settles to the floor
let s = P.create();
pourRows(s, 2, 7, P.SAND);
for (let i = 0; i < 250; i++) s.step();
check('sand-settles', s.countInRows(P.SAND, BAND, H - 1) > 150, s.countInRows(P.SAND, BAND, H - 1));
check('sand-leaves-top', s.countInRows(P.SAND, 0, 20) === 0, s.countInRows(P.SAND, 0, 20));

// water + fire hiss into steam, then steam fades
let h = P.create();
pourRows(h, LOW, LOW, P.WATER);
pourRows(h, LOW - 1, LOW - 1, P.FIRE);
for (let i = 0; i < 6; i++) h.step();
check('hiss-makes-steam', h.countElement(P.STEAM) > 0, h.countElement(P.STEAM));
for (let i = 0; i < 80; i++) h.step();
check('steam-fades', h.countElement(P.STEAM) === 0, h.countElement(P.STEAM));

// oil floats on the sunken water table
let o = P.create();
setRows(o, H - 25, H - 6, P.WATER);
pourRows(o, H - 37, H - 31, P.OIL);
for (let i = 0; i < 60; i++) o.step();
check('oil-floats', o.countInRows(P.OIL, BAND, H - 1) > 30, o.countInRows(P.OIL, BAND, H - 1));

// oil rises through water it touches
let r = P.create();
setRows(r, H - 45, H - 35, P.WATER);
for (let x = MID - 5; x < MID + 5; x++) r.setAt(x, H - 35, P.OIL);
for (let i = 0; i < 8; i++) r.step();
check('oil-rises', r.topRow(P.OIL) >= 0 && r.topRow(P.OIL) < H - 37, r.topRow(P.OIL));

// fire ignites adjacent oil
let f = P.create();
pourRows(f, LOW, LOW, P.OIL);
pourRows(f, LOW - 1, LOW - 1, P.FIRE);
for (let i = 0; i < 12; i++) f.step();
check('oil-ignites', f.countElement(P.OIL) === 0, f.countElement(P.OIL));

// salt dissolves beside water
let sa = P.create();
setRows(sa, H - 25, H - 11, P.WATER);
pourRows(sa, H - 39, H - 35, P.SALT);
for (let i = 0; i < 200; i++) sa.step();
check('salt-dissolves', sa.countElement(P.SALT) < 20, sa.countElement(P.SALT));

// seed + water = sprout
let sd = P.create();
setRows(sd, H - 25, H - 11, P.WATER);
pourRows(sd, H - 35, H - 35, P.SEED);
for (let i = 0; i < 60; i++) sd.step();
check('seed-sprouts', sd.countElement(P.SPROUT) > 0, sd.countElement(P.SPROUT));

// walls never move
let w = P.create();
for (let x = 10; x < W - 46; x++) w.setAt(x, H - 10, P.WALL);
const before = JSON.stringify(w.snapshot());
for (let i = 0; i < 50; i++) w.step();
check('wall-static', JSON.stringify(w.snapshot()) === before);

// determinism across element sets
const a = P.create(), b = P.create();
for (const sim of [a, b]) {
  sim.pour(MID, 10, P.OIL, 1);
  sim.pour(MID, 20, P.SALT, 1);
  sim.pour(MID, 30, P.SEED, 1);
  for (let i = 0; i < 60; i++) sim.step();
}
check('deterministic', JSON.stringify(a.snapshot()) === JSON.stringify(b.snapshot()));
check('census', a.census().join(',') === 'oil,salt,seed', a.census().join(','));

if (fails) { console.log('POWDER RED: ' + fails); process.exit(1); }
console.log('POWDER GREEN');
