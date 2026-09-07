# LiberOS changelog

## 2.0.1 — stabilize the batch

Bugfix release over the post-2.0.0 batch. No new features.

### Fixed
- Satchel: margin-note list opens the tapped entry (filtered-index bug),
  and notes also save on blur — not only on Cmd/Ctrl+Enter.
- Stone room: brush `mousemove` restored; `mouseup` now also caught at
  document level so strokes commit when released outside the canvas;
  shape-preview snapshot restored on pointer leave.
- Relation ledger + desktop mini-menu show each artifact's original
  content (sea text, buddy confession/intention, dream title+text) and
  the mini-menu gains an "open in room" jump.
- Learn: prose pass (shadow, divination, clinamen, defences, anima,
  active imagination), The Self split into Self + Individuation, new
  Inner Household drawer, FAQ drawers (Questions; Keeping, Orbits,
  Slots), citation panel labels.
- Themes: new deep-purple Royalty skin; themes paint the desktop too.
- Dreams: associations pin the selected reading words as a quote.
- Settings: three save slots (mess about / serious work / show someone)
  with per-slot summaries; state namespaced per slot with legacy
  migration.
- Cutscene NAMES beat: names land faster with per-name color flicker.
- Smoke hardened to enforcing assertions and covers slots, migration,
  shelving, and notes.

### Proven
- 21-step smoke green on fresh profiles, zero page/console errors.

## 2.0.0 — flow becomes main

The former `LiberOS-flow` fork is now the mainline build. The previous
mainline is kept untouched as `LiberOS-legacy`; the graduated-depth
variant is frozen as `LiberOS-p0` (thesis branch).

### New
- Buddy: the cohort is now buddy everywhere — copy, code, files, state —
  with an automatic migration for existing saves.
- Casting stone rebuilt as a hermetic instrument: 25 named Leadbeater
  inks, brush, triangle/circle/spiral/square outlines, flood-fill bucket,
  eye/moon/hand/star/frame stamps, undo, 2:1 drawing window with rail.
- First-run cutscene (arise → wanderlust → intruder → riason → stone)
  with stepper, skip, and optional offline voice (`speechSynthesis`,
  per-speaker profiles, explicit consent, default off).
- Fate-circle companion on every screen; first-visit hijack tours in
  every room, each in its traveller's voice; one-time rites.
- Learn gains Hard Nights (real helplines only) and The Room drawers.
- Dream→seed bridge; satchel margin notes that actually save;
  Enter-to-save everywhere; 40px titlebar controls with how-sheets.
- Sea: guided 4-4-6 breathing, parallax depth, graduated deep end.
- Games: thirteen DBT booths in three wings with scope lines, heat
  marks, pinned TIPP strip, seamless marquee.
- Garden: mile-markers, first gem arrives 11/17 solved.
- Desktop teaches in two beats; dial holds for a full index.

### Cut to become main
- Dormant chat window, summon/arise overlays, reset confirm, and their
  scripts; desktop settings modal (the settings page has everything);
  bottles/rings dead branches; about page (folded into Learn 22);
  themes off the dial (settings paint link); trash's four bury buttons
  into one; every placeholder attribute (real labels instead).

### Proven
- 25-step smoke green on fresh profiles; 17/17-page chrome crawl
  clean; 13-room tour matrix green; paint engine pixel-verified.
