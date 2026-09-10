// powder.js — LiberOS powder-tent automata, dependency-free.
// Grid 120x150: empty/wall/sand/water/fire/oil/salt/seed/steam/sprout.
// Deterministic: shade picks and lifetimes derive from (x, y, frame) —
// no Math.random anywhere the visitor can perceive (house rule).
// Pure logic, no DOM: the toybox room paints it, node verifies it.
// No imports (covenant Q.1); loads as a plain script or via require().
(function (global) {
  'use strict';

  var W = 120, H = 150;
  var EMPTY = 0, WALL = 1, SAND = 2, WATER = 3, FIRE = 4;
  var OIL = 5, SALT = 6, SEED = 7, STEAM = 8, SPROUT = 9;
  var ERASE = -1;

  var PALETTES = {
    1: [[122, 110, 96]],
    2: [[216, 170, 80], [226, 180, 92], [206, 158, 70]],
    3: [[64, 130, 200], [74, 142, 210], [56, 118, 188]],
    4: [[255, 120, 40], [255, 160, 60], [240, 90, 30]],
    5: [[122, 102, 40], [132, 112, 50], [110, 92, 36]],
    6: [[235, 230, 220], [240, 236, 228], [228, 222, 212]],
    7: [[90, 120, 50], [100, 130, 60]],
    8: [[180, 190, 200], [190, 200, 210]],
    9: [[80, 180, 80], [100, 200, 90], [60, 160, 70]]
  };

  function abs(n) { return n < 0 ? -n : n; }

  function createSim() {
    var grid = new Uint8Array(W * H);
    var col = new Uint8Array(W * H);
    var life = new Int16Array(W * H);
    var seen = new Int32Array(W * H);
    var frame = 0, strokes = 0;
    var used = {};

    function idx(x, y) { return y * W + x; }
    function inBounds(x, y) { return x >= 0 && y >= 0 && x < W && y < H; }
    function at(x, y) {
      if (!inBounds(x, y)) return -1;
      return grid[idx(x, y)];
    }
    function setAt(x, y, v, c, lf) {
      if (!inBounds(x, y)) return;
      grid[idx(x, y)] = v;
      col[idx(x, y)] = c || 0;
      life[idx(x, y)] = lf || 0;
    }
    function swap(x1, y1, x2, y2) {
      var i1 = idx(x1, y1), i2 = idx(x2, y2), t;
      t = grid[i1]; grid[i1] = grid[i2]; grid[i2] = t;
      t = col[i1]; col[i1] = col[i2]; col[i2] = t;
      t = life[i1]; life[i1] = life[i2]; life[i2] = t;
      // A cell that moved is done for this step: rising elements climb
      // one row per step instead of teleporting.
      seen[i1] = frame; seen[i2] = frame;
    }
    function neighborIs(x, y, v) {
      return at(x, y - 1) === v || at(x, y + 1) === v || at(x - 1, y) === v || at(x + 1, y) === v;
    }
    function steamLife(x, y) { return 26 + abs((x + y + frame) % 16); }

    function pour(cx, cy, el, brush) {
      brush = brush == null ? 2 : brush;
      for (var dy = -brush; dy <= brush; dy++) {
        for (var dx = -brush; dx <= brush; dx++) {
          if (dx * dx + dy * dy > brush * brush + 1) continue;
          var x = cx + dx, y = cy + dy;
          if (!inBounds(x, y)) continue;
          if (el === ERASE) { setAt(x, y, EMPTY, 0, 0); continue; }
          if (grid[idx(x, y)] !== EMPTY) continue;
          var pal = PALETTES[el];
          if (!pal) continue;
          var pick = abs((x * 31 + y * 17 + frame) % pal.length);
          var lf = 0;
          if (el === FIRE) lf = 4 + abs((x + y + frame) % 4);
          else if (el === STEAM) lf = steamLife(x, y);
          setAt(x, y, el, pick, lf);
        }
      }
      strokes++;
      if (el > 0) used[el] = true;
    }

    function step() {
      frame++;
      var dir = (frame % 2 === 0) ? 1 : -1;
      for (var y = H - 1; y >= 0; y--) {
        for (var xi = 0; xi < W; xi++) {
          var x = dir === 1 ? xi : (W - 1 - xi);
          if (seen[idx(x, y)] === frame) continue;
          var v = grid[idx(x, y)];
          if (v === EMPTY || v === WALL || v === SPROUT) continue;
          if (v === SAND) {
            if (at(x, y + 1) === EMPTY || at(x, y + 1) === WATER) swap(x, y, x, y + 1);
            else if (at(x - dir, y + 1) === EMPTY || at(x - dir, y + 1) === WATER) swap(x, y, x - dir, y + 1);
            else if (at(x + dir, y + 1) === EMPTY || at(x + dir, y + 1) === WATER) swap(x, y, x + dir, y + 1);
          } else if (v === WATER) {
            if (at(x, y + 1) === EMPTY) swap(x, y, x, y + 1);
            else if (at(x - dir, y + 1) === EMPTY) swap(x, y, x - dir, y + 1);
            else if (at(x + dir, y + 1) === EMPTY) swap(x, y, x + dir, y + 1);
            else if (at(x - dir, y) === EMPTY) swap(x, y, x - dir, y);
            else if (at(x + dir, y) === EMPTY) swap(x, y, x + dir, y);
            // fire + water: the water hisses into steam, the fire dies
            var nb = [at(x, y - 1), at(x, y + 1), at(x - 1, y), at(x + 1, y)];
            for (var f = 0; f < nb.length; f++) {
              if (nb[f] === FIRE) {
                var pal = PALETTES[STEAM];
                setAt(x, y, STEAM, abs((x * 31 + y * 17 + frame) % pal.length), steamLife(x, y));
                break;
              }
            }
          } else if (v === FIRE) {
            var i = idx(x, y);
            life[i]--;
            if (life[i] <= 0) { setAt(x, y, EMPTY, 0, 0); continue; }
            if (at(x, y - 1) === WATER || at(x - 1, y) === WATER || at(x + 1, y) === WATER) {
              setAt(x, y, EMPTY, 0, 0);
              continue;
            }
            // fire ignites the first neighboring oil it touches
            var pts = [[x, y - 1], [x - 1, y], [x + 1, y], [x, y + 1]];
            var lit = false;
            for (var o = 0; o < pts.length; o++) {
              if (at(pts[o][0], pts[o][1]) === OIL) {
                setAt(pts[o][0], pts[o][1], FIRE, col[i] % 3, 4 + abs((pts[o][0] + pts[o][1] + frame) % 4));
                lit = true;
                break;
              }
            }
            if (lit) continue;
            if (at(x, y - 1) === EMPTY) swap(x, y, x, y - 1);
            else if (at(x - dir, y - 1) === EMPTY) swap(x, y, x - dir, y - 1);
            else if (at(x + dir, y - 1) === EMPTY) swap(x, y, x + dir, y - 1);
          } else if (v === OIL) {
            if (neighborIs(x, y, FIRE)) {
              setAt(x, y, FIRE, col[idx(x, y)] % 3, 4 + abs((x + y + frame) % 4));
              continue;
            }
            // oil floats: rises through water, falls through air
            if (at(x, y - 1) === WATER) swap(x, y, x, y - 1);
            else if (at(x, y + 1) === EMPTY) swap(x, y, x, y + 1);
            else if (at(x - dir, y + 1) === EMPTY) swap(x, y, x - dir, y + 1);
            else if (at(x + dir, y + 1) === EMPTY) swap(x, y, x + dir, y + 1);
          } else if (v === SALT) {
            if (neighborIs(x, y, WATER) && (x + y + frame) % 2 === 0) {
              setAt(x, y, EMPTY, 0, 0);
              continue;
            }
            if (at(x, y + 1) === EMPTY || at(x, y + 1) === WATER) swap(x, y, x, y + 1);
            else if (at(x - dir, y + 1) === EMPTY || at(x - dir, y + 1) === WATER) swap(x, y, x - dir, y + 1);
            else if (at(x + dir, y + 1) === EMPTY || at(x + dir, y + 1) === WATER) swap(x, y, x + dir, y + 1);
          } else if (v === SEED) {
            // seed + water = sprout
            if (neighborIs(x, y, WATER)) {
              setAt(x, y, SPROUT, col[idx(x, y)] % 3, 0);
              continue;
            }
            if (at(x, y + 1) === EMPTY) swap(x, y, x, y + 1);
            else if (at(x - dir, y + 1) === EMPTY) swap(x, y, x - dir, y + 1);
            else if (at(x + dir, y + 1) === EMPTY) swap(x, y, x + dir, y + 1);
          } else if (v === STEAM) {
            var si = idx(x, y);
            life[si]--;
            if (life[si] <= 0) { setAt(x, y, EMPTY, 0, 0); continue; }
            if (at(x, y - 1) === EMPTY) swap(x, y, x, y - 1);
            else if (at(x - dir, y - 1) === EMPTY) swap(x, y, x - dir, y - 1);
            else if (at(x + dir, y - 1) === EMPTY) swap(x, y, x + dir, y - 1);
            else if (at(x - dir, y) === EMPTY) swap(x, y, x - dir, y);
            else if (at(x + dir, y) === EMPTY) swap(x, y, x + dir, y);
          }
        }
      }
    }

    function countElement(v) {
      var n = 0;
      for (var i = 0; i < grid.length; i++) if (grid[i] === v) n++;
      return n;
    }
    function countInRows(v, y0, y1) {
      var n = 0;
      for (var y = y0; y < Math.min(y1, H); y++)
        for (var x = 0; x < W; x++)
          if (grid[idx(x, y)] === v) n++;
      return n;
    }
    function topRow(v) {
      for (var y = 0; y < H; y++)
        for (var x = 0; x < W; x++)
          if (grid[idx(x, y)] === v) return y;
      return -1;
    }
    function shadeAt(x, y) {
      if (!inBounds(x, y)) return 0;
      return col[idx(x, y)];
    }
    function census() {
      var names = [];
      if (used[SAND]) names.push('sand');
      if (used[WATER]) names.push('water');
      if (used[FIRE]) names.push('fire');
      if (used[OIL]) names.push('oil');
      if (used[SALT]) names.push('salt');
      if (used[SEED] || used[SPROUT]) names.push('seed');
      if (countElement(STEAM) > 0 && names.indexOf('steam') < 0) names.push('steam');
      if (used[WALL]) names.push('wall');
      return names;
    }
    function snapshot() { return Array.prototype.slice.call(grid); }
    function reset() {
      grid = new Uint8Array(W * H);
      col = new Uint8Array(W * H);
      life = new Int16Array(W * H);
      seen = new Int32Array(W * H);
      frame = 0; strokes = 0; used = {};
    }

    return {
      W: W, H: H, EMPTY: EMPTY, WALL: WALL, SAND: SAND, WATER: WATER,
      FIRE: FIRE, OIL: OIL, SALT: SALT, SEED: SEED, STEAM: STEAM,
      SPROUT: SPROUT, ERASE: ERASE, PALETTES: PALETTES,
      at: at, setAt: setAt, shadeAt: shadeAt, pour: pour, step: step, reset: reset,
      countElement: countElement, countInRows: countInRows, topRow: topRow,
      census: census, snapshot: snapshot,
      state: function () { return { frame: frame, strokes: strokes }; }
    };
  }

  var api = { create: createSim, W: W, H: H, EMPTY: EMPTY, WALL: WALL, SAND: SAND, WATER: WATER, FIRE: FIRE, OIL: OIL, SALT: SALT, SEED: SEED, STEAM: STEAM, SPROUT: SPROUT, ERASE: ERASE, PALETTES: PALETTES };
  global.LiberPowder = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
