# AGENT A — The Room Remembers (CRT-room hooks + Games promenade + Dreams presentation)

One sentence: you close the three open gaps in `liberdev/room-hooks.md` and build the two
presentation features that hang off them — the Games walkable promenade and the Dreams
develop-on-arrival shelf.

## Why you own this
The register (`liberdev/room-hooks.md`) is the machine's memory contract and it has exactly
three open gaps, each flagged "**gap, not a verdict**": `dreams`, `toybox`, `games`. They are
the last features with no material in the room behind the CRT. You finish the contract.

## Your features (from redesign-pitch.html — read each section before building)

1. **Three room hooks (do these FIRST — they are contract debt)**
   - Dreams → second sheet on the corkboard: a developed dream pinned beside the keeps.
     Reads `s.dreams`. Empty condition: "a bare second pin, no sheet".
   - Toybox → the `floor` material (the only unclaimed one): Pip's sand spill that never
     quite gets clean. Reads the powder sim state. Empty condition of your design.
   - Games → the midway's prize: a paper ticket on the board or chalk on the floorboards.
     Reads `s.games` / `s.bests`. Empty condition of your design.
   For each: render in `src/features/crt-room/crt-room.js` + `.css`, add the row to
   `liberdev/room-hooks.md`, extend the `HOOKS` array, and make `scripts/verify-room-hooks.mjs`
   pass with the new rows. `material: floor` stops being unclaimed — update the vocabulary
   table's "in the room" cell when you claim it.

2. **Games promenade camera** (pitch: "The Full Promenade", flagship): parallax ground,
   sagging string lights, visitor shadow, per-booth barker lines voiced ONLY when a booth is
   camera-centered (the camera/picker state already exists in `games.js` — `data-camera-position`
   is set; you are adding the barkers + parallax dressing, not a new navigation system).

3. **Dreams presentation** (pitch: SYSTEM 05 Dreams): fog-to-dusk idle-keyed atmosphere,
   develop-on-arrival animation per kept dream on the reading desk, association threads drawn
   between associated words, reading marginalia in a second hand on the polaroid's back.
   The associations DATA model already exists (dreams.js lines 231–285) — you render the threads.

## Files you own (edit only these + the shared files below)
- `src/features/crt-room/**`
- `src/features/games/**` (booth logic untouched except thimble retirement, below)
- `src/features/dreams/**`
- `liberdev/room-hooks.md` (add rows; do not restructure)

## Shared files — APPEND-ONLY, coordinate by exact anchor string
- `src/state.js` — only if a hook needs a new READ-ONLY mirror key; append at the END of
  DEFAULT, never reorder, never rename.
- `scripts/verify-room-hooks.mjs` — only to extend HOOKS-driven assertions.
- `data/personas.data.js` — barker lines go here (whimsy's voice), appended inside the
  existing games persona blocks.

## Thimble retirement (part of your lane, from the pitch)
The thimble booth graduates to the Glasshouse tree (already built — `src/features/garden/tree.js`
has the migration). Remove the thimble BOOTH from the midway cleanly: booth card, booth logic
registration, CSS posters — while keeping `s.thimble` readable for the tree's legacy migration
and keeping `verify-affinity.mjs`'s `thimble` unlock green (the unlock's metric is garden
plantings, not the booth). If a verify script asserts the booth exists, update the assertion,
not the data.

## Verify before you stop
```
node smoke.mjs
node scripts/verify-crt-room.mjs
node scripts/verify-room-hooks.mjs
node scripts/verify-affinity.mjs
node scripts/verify-gamification.mjs
node scripts/verify-fixes.mjs
node scripts/sweep-rooms.mjs games dreams
```
All green, zero new page errors. Then write your own `scripts/verify-promenade.mjs` (camera
centers barkers, parallax layers present, thimble gone, tree migration intact) and a
`scripts/verify-dreams-presentation.mjs` (develop beat fires on arrival, threads render from
real associations, marginalia present, reduced-motion kills all of it). Both must pass.

## Hard rules
- Covenant: `COVENANT.md` rules 1–4. Room hooks follow "one object, never two" — render in
  the CRT room, never a desk-side copy.
- Every hook states its empty condition in the register row.
- Motion with consent: every animation you add gets a `prefers-reduced-motion` kill.
- Do not touch: `styles/shadow.css`, `src/shadow.js`, `src/rainy.js`, `styles/machine.css`,
  any `*/learn/*`, `*/satchel/*`, `*/sea/*`, `*/sigil/*`, `*/trash/*`, `*.html` shells other
  than games.html/dreams.html if strictly needed.
