# AGENT C — Weather system + shell polish + homescreen (Rainy Day, 439px, cutscenes, theme)

One sentence: you own the machine shell — the Rainy Day weather system you inherit mid-flight,
the 439px survival sweep, the homescreen/cutscene layer, and the whole-site diagetic polish pass.

## Why you own this
Rainy Day is half-built and hot: the weather was moved into the CRT room's window in the last
session, the desk-side copy was retired, and the covenant gained "one object, never two".
That thread needs finishing, and the shell around it (bezel, cutscenes, homescreen copy,
small-screen survival) has drift no other lane covers.

## Your features

1. **Finish Rainy Day** (you inherit it):
   - The desk side is palette + wet tube + ticker only; the rain lives in the CRT room's
     window (`src/features/crt-room/crt-room.js` `buildRain`, `.crt-drop` in
     `src/features/crt-room/crt-room.css`). Verify the two-sided rule holds everywhere and
     `scripts/verify-room-hooks.mjs`'s "one object, never two" section stays green.
   - The pitch asks the room's material to answer the weather beyond palette: plaster damp,
     floor tone, furniture cold — INSIDE the CRT room, keyed off `crt-room-rainy`, never a
     desk-side layer. Do this as the room's own CSS.
   - `screenshots/crt-room-rainy.png` and the other screenshots are stale from test runs —
     regenerate the set with `node smoke.mjs` and `node scripts/verify-crt-room.mjs` so the
     repo's evidence matches the build.

2. **439px survival sweep** (the shell-level constraint flagged in earlier sessions): at
   439px the bezel hands rooms ~316×265 of glass and fixed furniture piles up. Sweep every
   room at 439×780 with `scripts/sweep-rooms.mjs`, fix the shell math (bezel/screen-stage
   sizing in `styles/machine.css` + `styles/room.css`) so each room's glass is honest, and
   repair any REAL room-internal collisions the sweep still flags (the pre-existing
   toybox compact pile-up, titlebar overlap, etc.). The rule: the shell gives rooms a
   workable stage; the room then survives on it. Both ends get fixed in this lane.

3. **Homescreen + cutscene polish**: the boot/cutscene layer (`src/cutscene.js`, the
   `#hijack` tutorial overlay) and the homescreen's diagetic copy (status line, whispers,
   `liber.os is listening.`). Sweep for: text clipping, overlapping copy, stale strings
   (e.g. anything referencing retired surfaces like cohort or the old chat inbox), and
   diagetic consistency with the covenant's "each room is a traveller's place". The
   `undefined` labels visible in the dial's aria-labels (two buttons announce
   "undefined — nothing witnessed yet") are a real bug in this layer — fix the source of
   the undefined name, not the symptom.

4. **Themes follow-through**: the themes locker got hover-preview + commit wash in the last
   pass. Verify them, and give the Rainy Day tile its place in the locker's own grammar.

## Files you own (edit only these)
- `styles/shadow.css`, `src/shadow.js`, `src/rainy.js` (the weather system)
- `styles/machine.css`, `styles/room.css`, `styles/bezel.css`, `styles/scars.css` (the shell)
- `src/cutscene.js`, `src/status-line.js`, `src/whispers.js`, `src/faq.js` (homescreen layer)
- `src/features/themes/**` (already partly built; finish + verify)
- `index.html`, `desktop.html` markup ONLY where the shell/homescreen layer needs it
- CRT-room RAINY MATERIAL ONLY: `src/features/crt-room/crt-room.css` — append a clearly
  marked `/* ── rainy material (lane C) ── */` block; do NOT touch `crt-room.js` or any
  other CRT-room CSS (lane A owns that file's logic)

## Shared files — APPEND-ONLY, coordinate by exact anchor string
- `src/features/crt-room/crt-room.css`: append-only, marked block, bottom of file.
- Nothing else outside your owned list without a comment `/* lane C: <reason> */`.

## Verify before you stop
```
node smoke.mjs
node scripts/verify-rainy.mjs
node scripts/verify-room-hooks.mjs
node scripts/verify-crt-room.mjs
node scripts/verify-fixes.mjs
node scripts/sweep-rooms.mjs
```
All green. Then write `scripts/verify-439.mjs`: every room at 439×780 — no clipped controls,
no overlapping furniture, exit reachable, and the sweep's flagged-collision count for each
room at or below its recorded baseline. It must pass.

## Hard rules
- Covenant rules 1–4. The covenant's "one object, never two" clause is YOURS to enforce on
  the weather; if you add rainy material to the CRT room it must be that room's own material,
  never a desk-side copy of it.
- Motion with consent: every animation gets a `prefers-reduced-motion` kill.
- Do not touch: `src/features/games/**`, `src/features/dreams/**`, `src/constellation.js`,
  `src/features/learn/**`, `src/features/satchel/**`, `liberdev/room-hooks.md`,
  `src/state.js`, `data/personas.data.js`.
