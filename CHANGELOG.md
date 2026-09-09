# LiberOS changelog

## 2.2.0 — buddy room, designed scrolls, resolution hardening

### New
- Buddy window: tag picker is a compact dropdown with chips (no more scrolling rail); the whole stone room fits without scrolling at 1280×800.
- Canvas: stone bitmap refits on window resize/load with the work preserved and contained (no more stretch or drift).
- Desktop app opens maximized (windowed fullscreen) instead of small.
- Designed scrollbars in every scrolling room, each in its persona palette (settings, satchel, dreams, relation, learn, buddy, cohort, games, garden, methodology, abstract, trash, themes, sea, divination, sigil, tutorial, desktop shell, constellation mini-menu).
- Riason stone tour now fires during the tutorial only — no leftover tour in the buddy app afterwards.
- Tutorial demo artifact carries Riason's drawn mark (circled star) instead of a blank card.
- Resolution hardening: machine width clamps against viewport height, so short windows no longer clip top/bottom — verified 900×650 through 1600×1000 with zero errors.

### Fixed
- Stone-room tour gating no longer depends on post-tutorial stone absence.

### Proven
- 21-step smoke green, prompt-engine + data verifiers green, sigil/tour/resolution checks green, zero page/console errors.

## 2.1.0 — satchel web, orbits, dreams, elizabeth, tags

### New
- Satchel: grouped lists for sigils, all artifact kinds, knots, and satchel keeps — every entry opens with a margin note that saves (stones keep annotation, others keep satchel notes, knots keep relation notes). Deep-linkable via satchel.html#id.
- Desktop: mini-menu gains Open in Satchel + bind-to picker (the buddy or any artifact). Artifact-to-artifact binds draw a smaller secondary orbit of satellites around the parent.
- Kept notes: desktop scratch notes and dream keeps are clickable — delete, satchel status, and attach-to-artifact (attaching draws the secondary orbit).
- Buddy tags: casting stone offers Jungian individuation tags (shadow, anima, animus, persona, self, trickster, wise old, great mother, puer, senex, hero, and more). Names sanitize internally (My animus → your animus) and prompts use grammatical display names plus tag-aware templates.
- Prompt engine: sanitized buddy grammar (capitalized, punctuated), tag slots ({tags}, {tagphrase}), five new tag-aware templates, per-target dedupe for artifact binds.
- Dreams: symbol bank grows from 27 to 67 — stairs, tunnel, wall, crossroads, border, mandala, king, star, tree, garden, monster, darkness, wound, filth, corpse, seducer, wise woman, warrior, androgyne, mother, father, cave, river, return, cocoon, phoenix, trickster, angel, air, earth, sky, wolf, horse, cat, dog, book, ouroboros, phone, coin. Original matches unchanged (additive only).
- ELIZABETH (buddy + cohort): 30+ new rules for individuation, shadow, anima/animus, persona, Self, ego, trickster, senex, great mother, puer, hero, mandala, myth, complexes, projection, active imagination, synchronicity, dreams, symbols, and the full element/animal register.
- Layout: settings cog + status line move to the right edge; scratch notes widen on the left.
- Slots: legacy fallback now keep-slot only, so empty play/show slots start clean instead of inheriting the old room.

### Fixed
- Relation ledger shows true targets (buddy or artifact name) and re-words/releases per knot without touching sibling binds.
- Releasing an artifact also clears incoming satellite binds pointing at it.

### Proven
- Target: smoke green + verify scripts green before 2.1.0 tag.

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
