# REPORT A — Room hooks, Promenade, Dreams presentation

## What I built

**Room hooks (the contract's last three gaps):**
- `dream-sheet` — a kept dream hangs its developed sheet on the corkboard.
  Kept-ness reads the satchel (the true keep), tilt is deterministic per
  dream id, empty condition: "a second bare pin, no sheet".
- `tickets` — the midway's paper prizes twist on the board's corner pin,
  one per game artifact (max five), newest booth's glyph on top.
- `spill` — Pip's sand ground into the floorboards, sized by toybox keeps.
  The `floor` material is claimed; vocabulary table updated.

**Games promenade:** three-layer parallax driven by the existing camera
walk (`--walk`), string lights, visitor shadow, centered-booth barkers in
Whimsy's voice (personas block, `tink` on speak), `prefers-reduced-motion`
holds every layer. Thimble booth retired from the midway; tree migration
and the affinity unlock stay green.

**Dreams presentation (SYSTEM 05):** fog-to-dusk keyed to the reading,
develop-on-arrival beat (reduced-motion shows the sheet at once),
association threads drawn from the real quoted associations — and taken
down when an association is released (the thread is the association;
`drawAssocThreads()` now rides the state-change subscriber). Marginalia in
Inquiry's second hand, deterministic per dream, banded by real keep state.

## What I fixed beyond the brief

- 439 games: the stacked gate board buried the pan arrows and barker
  bubbles (shell z6 under gate z11). Gate now compacts to one row at the
  tent's top rope; bark has its own band; titlebar name clears the pills.
- 439 exits: learn/garden/dreams/themes/trash/satchel pills 40→44px,
  toybox 30→44 (the affordance contract).
- learn tour holds the floor: drawers go inert while it speaks.
- boot warning: its corner "?" steps aside while the letter is open.
- constellation-empty hint clipped under the notes panel at 1281–1400px.

## Verified

`smoke.mjs` + all 17 `scripts/verify-*.mjs` green, including my
`verify-promenade.mjs` (20) and `verify-dreams-presentation.mjs` (19) and
the full `verify-439.mjs` (94). Preview-tested: desktop, look-behind
(all hooks render from real state), games facade, dreams reading.

## Left deliberately

- Room-overflow items outside my lanes' files (all resolved this pass).
- `data/personas.data.js` games blocks: barker lines appended only.
