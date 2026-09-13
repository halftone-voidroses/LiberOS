# AGENT B — SYSTEM 04 + Learn desk + Satchel desk (procedural desktop, workbook, ledger)

One sentence: you build SYSTEM 04 — the procedural constellation icon renderer — and the two
desk-chrome features from the pitch (Learn workbook desk, Satchel ledger chrome) that live on
other pages entirely.

## Why you own this
SYSTEM 04 is fully specced in `redesign-pitch.html` (section "SYSTEM 04 · The Evolving
Constellation") with acceptance criteria, and nothing of it is built — `src/constellation.js`
still renders a fixed `★` fallback and static glyphs. It is the largest unbuilt spec in the
repo, and it lives on the desktop, which no other lane touches.

## Your features (from redesign-pitch.html — read the full SYSTEM 04 section first)

1. **Procedural icon renderer** (the spec's acceptance list is your checklist):
   - Every desktop icon is a layered procedural render of real state: base form → material →
     earned complexity. Zero fixed image assets.
   - Buddy stone: born smooth; each kept artifact type carves its mark (dart-wheel for games,
     wave for sea, star-spread for tarot, leaf for garden, thread for dreams — at least five);
     relations cut facets; patina tiers (`patina-N` classes from shadow.js) deepen carving and
     warm tint.
   - Artifact glyphs accrue orbits: one ring per relation, satellites for two-way/annotated,
     inner facets for notes. Setting a relation morphs BOTH endpoints in place — one
     motion-gated beat, the edge drawing itself. Unbinding retracts the ring and leaves a
     ghost line (release is not erasure, even optically).
   - Edge textures mature: rope → brace → filament. Whole constellation precesses slowly per
     patina tier. Reduced motion gets static tiers.
   - Deterministic: same state → same pixels. Legible and non-broken at 439px.
   - Playwright acceptance: keep an artifact → stone gains its mark; bind → both icons morph
     live; unbind → ghost line; screenshots of patina stages 0–3 differ.

2. **Learn workbook desk** (pitch section "Learn"): dated marginalia hand, index-card shelf,
   register trim. The TIPP card and cross-links already exist from the earlier pass — you are
   adding the desk chrome, not new cards.

3. **Satchel ledger chrome** (pitch section "Satchel"): spine state already thickens
   (satchel.js line ~136); add ribbon markers for unvisited rows if missing, hover marginalia
   (a CSS-only confession is started at satchel.css line ~687 — finish it), brass corner caps
   brightening with relation count.

## Files you own (edit only these)
- `src/constellation.js` (the renderer — rewrite/extend as needed)
- `src/features/learn/**`
- `src/features/satchel/**`
- `src/dial.js` ONLY where icons are stamped (it owns the thimble patch — leave that block
  byte-identical)
- `desktop.html` ONLY to add a `<canvas>`/svg layer element if the renderer needs a host —
  no other edits

## Shared files — APPEND-ONLY
- `src/state.js`: nothing. You are a reader. If you think you need a new key, you are wrong —
  derive from existing keys (`relations`, `buddy`, `visited`, artifact arrays).
- `data/personas.data.js`: no copy changes. SYSTEM 04 is visual-only.

## Verify before you stop
```
node smoke.mjs
node scripts/verify-fixes.mjs
node scripts/sweep-rooms.mjs
```
All green. Then write `scripts/verify-constellation.mjs` implementing the pitch's acceptance
list (deterministic renders, mark-on-keep, live morph on bind, ghost line on unbind, three
edge textures, 439px legibility, reduced-motion static tiers) and a
`scripts/verify-desks.mjs` for the Learn/Satchel chrome. Both must pass.

## Hard rules
- Covenant rules 1–4, especially motion-with-consent: every beat you add dies under
  `prefers-reduced-motion` into an instant state change.
- Determinism is the feature: no `Math.random()` anywhere in the renderer — seed from state.
- Do not touch: `src/features/crt-room/**`, `src/features/games/**`, `src/features/dreams/**`,
  `liberdev/room-hooks.md`, `styles/shadow.css`, `src/shadow.js`, `src/rainy.js`,
  `data/personas.data.js`, `src/state.js`.
