# LiberOS changelog

## v2.15.0 — the case sits in front of the tube
- **The keybank moves onto the bezel.** It no longer lives inside the glass:
  it straddles the lower chin as a detached block, left-aligned under the
  tube, brass ring passing behind it — the mockup's placement. Shrinks and
  lifts clear of the bottom-center carvings on the small glass.
- **The keys stay quiet until Wanderlust names them.** New opening beat:
  "Below the glass, the keys on the case." Pre-naming the grid sits dark
  (`keysNamed`, inert, no walk, no write); the naming sets the flag and the
  case wakes. Skip roads all land on done, so no road leaves dead keys.
- **Verified:** 439 / fixes (new inert assertions) / smoke green, screenshots
  at both sizes, stone uncovered at 439.

## v2.14.0 — the keyboard sits beneath the sky
- **The radial dial is replaced by the 3 × 4 keybank.** The desktop's
  three-position carousel, popup index and long-press are gone (REV D §04
  pass one). Eleven doors in a stable physical order plus one struck
  blanking plug: HOME in dark brass, buddy through trash with room-phosphor
  lamps, socket 12 reserved. Pressed sits low, visited keeps a spent ember,
  the crossed stone stays viewable. Keyboard arrows + Enter, focus visible,
  reduced-motion instant.
- **The glass gets the room back.** The constellation expands across the
  freed band with stable anchors; the scratch pad is a dismissible margin
  sheet (open, edit, attach, dismiss, save to Journal); the Liberchat
  sidecar keeps its right-hand gutter at both breakpoints.
- **Tutorial + copy follow the case.** Cutscene stages untouched; empty-state
  invitations, Learn 24, the about page and Wanderlust's lines name the
  keybank, not the dial. `smoke.mjs`, `verify-439`, `verify-crt-room` and
  `verify-fixes` check the twelve-socket contract; smoke's stale `satchel`
  reads follow the store rename to `journal`.
- **Verified:** 439 / room-hooks / constellation / sidecar / fixes /
  crt-room / data / desks / dreams / gamification / house / powder /
  promenade / prompt-engine / rainy / trash / tree / affinity / aiml green,
  full smoke green. covenant-css, scaling and themes failures pre-date this
  build and live in untouched files.

## v2.13.0 — the fire goes out, the card comes home
### The opening loses what it could not afford
- **The eclipse flame ring is removed.** The summoning's inferno was an SVG
  `feTurbulence` + `feDisplacementMap` filter stretched over the whole
  viewport, re-anchored and re-rendered whenever the machine moved and as
  each line fell — the heaviest thing the opening did, and the reason it
  stuttered. The ritual keeps its lines, its shakes, its glow and its
  black-flame close. Nothing replaces the fire; `styles/cutscene.css` lost
  the `.crt-flames` / `.inferno-*` rules with the element.
- **No music, for now.** The one looped song (`assets/music/main-theme.ogg`)
  no longer plays, and it is not replaced with anything. `src/soundscape.js`
  keeps its public surface and becomes silent — the motif/duck calls the
  rooms make still work and still do nothing — so reinstating the OST is a
  rewrite of that one file rather than a hunt through the house. Settings'
  music slider and "now playing" line came out with it; the sound-fx switch
  stays.
- **The pink chat tile is off the dial.** The `chat` app pointed at
  `buddy.html`, which retired to an archive note two releases ago — a door
  onto a dead page. The visit list is ten rooms now, and the tile's phosphor
  and motes went with it.

### The tutorial's last act is the relation
- **The ruby-room beat is replaced by Arcana's table.** Riason used to send
  the traveller off to the midway ("navigate to games, and save one as an
  artifact… maybe ruby's gem garden…") and then have them click a floating
  glyph. The tent has already drawn a card, so the desktop beat now takes
  that up: the card is **kept**, then its **relation** is set — it *verb*
  your buddy — and the moment the relation lands, Wanderlust re-intervenes
  and the finale plays. The gesture Riason teaches is the one the machine
  turns on, and the tutorial now performs it instead of describing it. Both
  gestures stay the demo's: the tutorial still writes nothing.
- **The hand-off is a curtain, not a jump cut.** The stone's demo closes
  over the room, the page changes behind the black, and the tent opens from
  the same black (and closes that way for the desktop). One movement through
  the house across three pages; reduced motion still cuts instantly.
- `smoke.mjs` drives the new act (keep → verb → bind) and asserts the same
  clean slate: `tutorialDone`, zero artifacts, zero relations.

### The stacks: the learn room gets its room
- `learn.html` was the one page in the house standing in the spare room —
  no register entry, no backdrop, no hooks. It is now `learn` in
  `data/rooms.data.js` (the stacks, the mad scribe) with its own
  `src/features/learn/house.css`: oak rod, sepia card, brass drawer-pull,
  red stamp ink, and the room's tells — the drawer left open on the row in
  use, a card standing proud of the rest, the stamp pad dry at the edges.
  It carries the same two-sided hooks as every other room (lamp, shelf,
  board) and satisfies `verify-house.mjs` at both window shapes.

## v2.12.0 — the house stands furnished
### Three lanes, one tree (the pitch's remaining systems, built side by side)
- Room hooks close the contract: a kept dream hangs its developed sheet on
  the corkboard (reads the satchel, the true keep), the midway leaves its
  paper tickets on the board's corner pin (one per game artifact, newest
  booth's glyph inked on top), and Pip's sand spill grounds into the
  floorboards beside the desk (fed by toybox keeps). The `floor` material
  is claimed — `liberdev/room-hooks.md` and its verifier hold the rows.
- The Full Promenade: the camera walk gains a world — three-layer parallax
  (far sky, mid booths, near ground), sagging string lights, a visitor
  shadow, and per-booth barkers that speak only when a booth is centered,
  in Whimsy's own voice, motion-gated. The thimble booth retires to the
  Glasshouse (legacy migration and affinity unlock intact).
- Dreams presentation (SYSTEM 05): fog-to-dusk keyed to attention, the
  develop-on-arrival beat, association threads drawn from the real
  quoted associations (and taken down when released — the thread is the
  association), and marginalia in Inquiry's second hand on the polaroid's
  back, banded by the real keep state.
- SYSTEM 04, the evolving constellation: procedural icon renders cut from
  real state — keep-marks, relation orbits, patina tiers, live morphs and
  ghost lines — plus the Learn workbook desk and the Satchel ledger chrome.
- Rainy Day's room material: plaster damp, floor tone, furniture cold,
  all inside the CRT room behind the glass, never a desk-side copy.
- The 439px contract passes end to end (94 checks): the midway's gate
  boards compact to the tent's top rope so the pans keep the floor, the
  titlebar name clears the pills, every room's exit is a full 44px
  target, the learn tour holds the floor while it speaks, and the boot
  warning's corner button steps out of its own letter's way.
- The covenant gains THE DRAWN PROP: weight tiers, two radius families,
  named methods, true baselines, contact shadows, two named lights, use
  not damage, detail budgets, and the maker's hand on every label.

### The room behind the CRT (SYSTEM 02 contract, built)
- The physical room the CRT sits in, reachable from a `look behind`
  affordance on the desktop. The screen shows the OS; the room behind it
  keeps what you did. Every hook is fed by real state, nothing
  decorative (`src/features/crt-room/`):
  - the bookshelf takes one ledger volume per satchel keep, six to a
    board, bottom board first, spine color per keep kind;
  - the shadow pool rises with every sea release and graveyard burial —
    the same water table the yard leaches into;
  - the session candle melts across the sitting and is relit on return
    (reads `s.sessionStart`, written only by its owner);
  - the corkboard pins one card and a run of red string per relation;
  - tin trophies stand on the CRT's top, one per patina tier (shadow.js
    math), and the dust, floor wear, and furniture age across three
    different-looking tiers;
  - the window box mirrors the Glasshouse tree stage for stage — the
    tree module owns `s.tree`, the window reads it and folds offline
    growth the same way, never writing;
  - Rainy Day (`s.shadowOn`) falls in the window, cools the room, and
    steadies the candle.
- The gaze persists across a reload within the visit (sessionStorage,
  view scope — kept data stays in `Liber.state`).
- Settings' maintenance panel gains the ROOM BEHIND switch, wired to the
  same single owner (`s.crtRoomOn`) the desktop scene reads.
- `scripts/verify-crt-room.mjs` — the contract's acceptance pass:
  26 checks across scene/affordance, keep→shelf, release→pool,
  relation→pins, patina 0 vs 3, Rainy Day composition, the candle arc,
  the window-box mirror, the one-owner toggle, the unbothered machine,
  and 439px survival. Screenshot pairs at `crt-room-patina0/3.png`.
- `serve.cjs` honors a `PORT` env override (parallel worktrees).

### Divination: the felt table (ROOM 04 contract, built)
- The felt table is the screen: tent canvas behind, deep red felt edge to
  edge, one lantern cone, wooden rim at the foot. The old card-gallery
  panel is gone.
- The deck is a stack with weight — paper band ("22 · counted 3× · ix.66,
  do not bend"), reversible back, misaligned settle on the draw; the deck
  counts down and runs out honestly.
- The question is chalked on a slate in the rim and turns to face the
  house on blur — reversibility made literal.
- I Ching casts from a coin dish: three brass coins toss per line, six
  lines chalk bottom-first, changing lines carry a chalk ring; the dish
  locks when the hexagram stands and resets on Escape/discard.
- Unified keep language: tarot and I Ching go through the same parchment
  prompt and land on the same shelf in the same artifact shape
  (name/question/reading/ts). Legacy `state.iching` keeps now surface on
  the satchel's artifacts shelf instead of vanishing.
- Arcana's tells: cold tea with the ring stain, a card that is not hers
  under it ("the drowned — see the blue ledger"), a chalk stub, her note
  in her own hand under the ?.
- Compact tables (≤700px or short CRTs) restack in flow with
  scroll-into-view on cast/keep; 439px clean, reduced-motion kills the
  settle/toss flourishes, keep survives.
- Acceptance: shots/div-accept.mjs 20/20 · verify-fixes M3 rewritten for
  the cast progression · smoke + room audit + whole-site audit clean.
### Garden: the glasshouse tree
### Added
- ROOM 09's scope contract, built: the thimble pot graduates from the midway
  to Ruby's glasshouse as a tree in its own pot. It grows in real time while
  you are elsewhere in the OS — five stages (`s.tree`, 40 min each at full
  rate), offline growth computed on return. Absence is fine; nothing decays.
- One can per stage-window (6h): watering banks an extra hour of growth. The
  can is refuseable and honours refusal — the tree grows regardless.
- Mature trees hang five fruit. Taking the fruit presses a pressing into the
  satchel (`tree-pressing`) and drifts a petal to every paint box — the same
  rewards the thimble granted, from the room where they always belonged.
- The glasshouse itself: five glass panes with condensation the cursor wipes,
  a brick sill, a bench, one warm lamp, and a root panel under glass that
  draws the same plant's roots by stage.
- Legacy `s.thimble` visits migrate forward as starting growth (3 visits ≈
  one stage); no kept data lost. The thimble booth keeps working.
- All motion gated behind `prefers-reduced-motion`; growth stages are static
  and distinct without it.
- Acceptance: `scripts/verify-tree.mjs` (growth fold, offline accrual,
  watering bonus + refusal, harvest rewards, persistence, 439px, reduced
  motion, thimble migration).

### Satchel: the reader's book
- The binding keeps its own ledger: the spine thickens with the keep count
  (tally on the spine), brass corner caps brighten as relations are tied
  (bucketed, three tiers).
- Red ribbons mark unopened keeps (`s.read` registry, written on open);
  annotated rows confess their first note in the margin on hover/focus
  (flyout, stacked inline under 700px), keyboard-operable rows.
- Find-in-drawer (`/` focuses, `Escape` clears, `nothing answers to that`
  on empty) filters label + meta + body.
- The slip: `slip out to …` carries the open keep back to the room that
  made it (per-kind home map; satchel-native keeps stay put, slip hidden).

### Liberchat: the second tube everywhere, and the tube's paper
- The dot-matrix sidecar CRT stands on every room page — same object, same
  engine — and the lamp retires everywhere the tube arrives. Off the desk
  the shut tube folds to a door tab at 439px; Esc shuts it.
- Seal-in-wax files the conversation to the book stamped with persona and
  exchange count, and the room behind the CRT lays one torn strip per
  unkept persona on the boards beside the desk (four at most). The seal
  is the broom: sealing sweeps the strip as the volume arrives on the
  shelf (`liberdev/room-hooks.md` § the tube's paper).

### The house stands furnished (every room behind its machine)
- Six traveller rooms stand behind their machines instead of the void —
  the sleeping nook (dreams), the bathroom (toybox/Pip), the study
  (satchel/Riason), the basement (sea/Vanir), the observatory
  (divination/Arcana), the play room (games/Whimsy). Same building,
  different rooms: shared architecture (`styles/house.css`), per-room
  finish, memory hooks (lamp/shelf/pool/board) re-made in each room's
  own material (`src/house.js`, `data/rooms.data.js`).
- The machine holds a stepped width on every page (`src/stage.js`,
  `s.resolution`), pinned from the settings RESOLUTION group; the
  shell's reduced-motion gesture is structural (`styles/room.css`).
- Gates: `verify-house` 194/194, `verify-scaling`, `verify-covenant-css`,
  `verify-themes` join the suite.

### The glass gets its picture
- Every traveller repainted the tube: `styles/wallpaper.css` hangs the
  picture in the glass behind the desktop, and the locker shows the
  tin's chip and pins the whole plate at the room's edge — preview
  pins without writing state.

### Showcase, rainy hardening, intro eclipse
- 26-frame verdict deck (five lenses each), harsher rainy layer, intro
  eclipse behind the glass with artifact birth in Arcana's tent.

## 2.11.0 — Toybox: the covenant pass
### Added
- COVENANT.md — the room-design law, verbatim; referenced from README and
  CONTRIBUTING so every future room author reads it first.
- Twelve traveller-gift powders in the sink: wood (ruby), stone (physius),
  magma (vanir), ice (inquiry), metal (riason), gunpowder (pete),
  superball (whimsy), fireworks (e-lizabeth), thunder (arcana), gas (the
  mad scribe), clone (wanderlust), soapy water (the house). Full reaction
  web: ice↔water/snow, magma↔water/stone, lightning grounds into stone
  and metal, fireworks carry payloads, clones remember what first touched
  them, superballs bounce and can set nitro off.
- Per-traveller shelf boards, faux-3D, brass plaques, objects as pixel
  art — the materials themselves are the labels.
### Changed
- The brass plug is seated on the drain hollow, ripples concentric to it,
  chain visible while it lifts. The pull slumps settled fluid into the
  hole (nearest cells first) and runs even while the tap is off.
- The two basin pendant toys are retired: their verbs (erase, stamp
  terrain) were already covered by the residents and the eraser.
- Gift labels removed from objects; only the shelf plaques carry names.

## 2.10.1 — Toybox: the sink-world
### Changed
- Pip's room is no longer an app inside the CRT — it is the world. Pip was
  trapped in this kitchen sink by accident; the other travellers leave toys
  in the basin. The basin **is** the tray (aspect-true at any size via
  `fitBasin()`), the tap valve pauses the world, the brass plug drains it,
  the element jars are left-behind containers on a drip rack, the crew
  live in a soap dish, and Pip's two tools are a worn broom and a
  polaroid camera. Wanderlust's grasp never touched this room: enamel,
  cracked tiles, limescale, rust, one warm bulb on a cord, a rain window,
  a supply pipe, a hanging towel.
- The toy crew became fully designed residents with real sim interactions
  (`src/features/toybox/crew.js`): the crab digs piles flat, sidles around
  water, flees fire; the snail trails slime, shelters from fire, rides oil
  rafts; the duck bobs, paddles to seed, eats it. Dispensers and the two
  draggable toys render the creatures' own pixel-sprite art.
### Proven
- Sink acceptance 10/10 on the served app (reactions, crab-flees-fire,
  pause/drain, crew-in-picture keep, keyboard operable, ~100fps, zero
  console errors). Smoke 21/21, room-behavior audit clean, release
  verifier green, dist byte-identical (151 files).

## 2.10.0 — Liberchat: the talking machine
### Added
- The lamp sits on every page (18/18). Opening it is a real chatbox with
  the room's traveller: deterministic, seeded replies from full scripts in
  `data/personas.data.js` — all 13 personas carry 42–52 written lines across
  greeting, room-context, hesitation, banter, topic replies, depth recalls,
  farewells, seal lines, and unlock barks. A header switcher reaches any
  persona (e-lizabeth included) from any room; the house itself speaks on
  machine pages.
- Conversation drives affinity: exchanges persist to `state.chat` and vouch
  toward thresholds alongside kept-work metrics. The toybox booth is
  unlockable by conversation alone (6 exchanges with whimsy), per contract.
- Seal-to-artifact: any conversation presses into a `buddy` wax seal
  (two-step confirm, `lamp: true`), feeding the inkstorm threshold.
- The reply core is a single `respond()` — a model-backed responder can
  replace it later without moving data or UI.
### Changed
- `buddy.html` and `cohort.html` retire to archive notes pointing at the
  lamp; daily-floor and constellation chat entries open the lamp directly.
- Lamp behaviour honours the room-shell contract (Escape close) and
  `prefers-reduced-motion`; Enter sends; persona register loads on demand.
### Proven
- Acceptance pass on the served app: 17/17 (lamp presence ×14 pages,
  3-persona conversation, Enter-send, topic match, state persistence, seal
  artifact, Escape, persona switch, chat-alone unlock + bark, archive
  notes, house persona). Smoke 21/21, release verifier, whole-site audit
  0 errors / 0 overflow, dist byte-identical (150 files).

## 2.9.1 — the midway floor rises: monolith split
### Changed
- The games room monolith (1,472 lines) is now a 426-line room coordinator
  plus per-booth modules under `src/features/games/booths/`. The coordinator
  owns the midway shell — camera, picker, stage lifecycle, save prompt,
  personal bests — while each attraction self-registers onto `LiberBooths`
  and receives a shared booth context. Adding a booth is one module plus one
  registry line. Attraction code moved verbatim; behavior byte-for-byte
  equivalent (smoke 21/21, games audit, room-behavior audit, whole-site
  audit, dist byte-identical).
- Games audit camera-walk expectations updated for the nine-booth midway
  (the TIPP booth had landed after the audit was written).
### Fixed (from 2.9.0 line, now versioned)
- TIPP "quiet floor" booth added to the games room, closing the promise the
  Learn hard-nights page made; Enter now confirms any open save prompt via
  the shared room-shell contract; tutorial summon pacing slowed and the
  last in-voice misspelling corrected.

## 2.9.0 — cross-room interaction contract (tagged without a version bump)
### Added
- `src/room-shell.js`: shared room overlay contract — Escape/backdrop close,
  Enter-to-confirm on topmost save prompt, adopted by sigil, games,
  divination, sea, and the theme picker.
- `website-report.html`: site-wide pitch report with per-room decks.

## 2.8.2 — macOS release
### Added
- Native macOS release workflow builds and attaches the Tauri `.dmg` and
  `.app.tar.gz` bundles to tagged GitHub releases.

## 2.8.1 — patch: release-gate audit and trash restore fix
### Fixed
- Burying everything no longer restores a cast buddy when an empty sealed
  group is processed after the cast group.
- Release verifiers now follow the current buddy presence contract, current
  desktop shell, current state shapes, and Sea deep-end unlock.
### Proven
- Data, prompt-engine, gamification, and fix regression gates pass.
- Tauri frontend dist is byte-identical to source and `cargo check` passes.

## 2.8.0 — final: gorgeous rooms, honest tours, readable chrome
### New
- Games tent rebuilt as a lit marquee: eight gilt booth plaques with
  per-game accents, cream ticket-stub pitch, curtained stage, chasing
  bulbs (not blinking), pressed-bevel buttons. Every game byte-identical.
- Toybox rebuilt as Pip's workshop: pine shelf with glowing element
  jars, framed sand-tray with glass glare, weighty crab/shell toys,
  bevelled sweep/keep. Mechanics byte-identical.
- CI smoke gate: pushes and PRs run the data/prompt/gamification
  verifiers plus verify-fixes (blocking); full 21-step smoke reports
  with screenshots without blocking on its known timing flake.
- Verification harness refreshed for the current `buddy-*` presence
  contract and current buddy-stone state shape; room-tour overlays are
  dismissed explicitly before control-level regression checks.
### Fixed
- Riason machine skin never painted: apply-theme emits `theme-riason`
  but machine.css only defined `theme-raison` — selector renamed.
- Dial cycling wiped visit history (`cycle()` replaced the visited map;
  `visit()` merged) — cycle now merges; last-entered-app memory kept.
- Desktop null-guard: `drawSig` read `.length` off unguarded state
  arrays — a corrupt save crashed render before paint; guarded.
- Tour copy now factual: buddy tour dropped phantom multiplayer users
  (on-device LiberChat: buddy + vanir bot), games tour says eight
  booths (was five — stale since the 2.6.0 booth additions).
### Changed
- Chrome hit floors: every help/exit/close target is ≥32×32px in its
  room's own palette, focus rings kept or added.
- Readability floors: settings, boot/consent, and status-line
  functional text is ≥16px; panels given room, nothing clips.
### Proven
- verify-data, verify-prompt-engine, verify-gamification, and verify-fixes
  are release gates. Full smoke remains report-only in CI because its
  long tutorial path is timing-sensitive; the blocking regression suite
  now handles room-tour overlays explicitly.

## 2.7.2 — final: starter quests, two-knob sound, whole-system themes
### New
- Starting quests: before the tutorial is done the desktop checklist
  assigns draw a buddy, set a relation, chat to your buddy; afterwards
  the seeded dailies resume.
- Whole-system themes: the theme class now paints every room (was
  desktop-only), a blend veil grades all app content to the theme's cast,
  and a wash tints the void around the machine. Bezel, plate, scars and
  screen glass as before; corrupted stays untouched.
### Changed
- Settings SOUND is two knobs: sound-fx mute plus the music volume
  slider. Room-tone/bed/motif buttons are gone; muting fx no longer
  silences the music.

## 2.7.1 — one song throughout
### Changed
- The room plays a single looped song everywhere: the main theme. No
  per-room or per-moment switching — the other studio movements stay in
  `assets/music/` unused.

## 2.7.0 — OST soundscape, working sound controls, learn fix, readable ruby, warning screen
### New
- File-based OST: the five studio movements in `assets/music/` loop per
  room — wanderlust ritual for the tutorial summoning, riason part for
  hijack tours, buddy creation for the buddy room, vanir for the sea, main
  theme everywhere else. Crossfaded, silence until first gesture, offline.
- Music volume slider in Settings SOUND (0–100, persisted, with a
  now-playing line). Bed/motif steps scale the OST audibly now.
- Boot warning is its own screen above the computer, ?-style: opens on
  first visit, reopens from the boot ? button or "read the warning", Esc
  and backdrop close it, consent inside enables enter.
### Fixed
- Learn page blank: unescaped apostrophe in card 24 (`pip's`) killed the
  whole script — escaped, all 25 drawers render, citations open.
- Dead sound toggles: settings never loaded `soundscape.js`, so room
  tone/bed/motif changed state with no audible effect — the script is
  included and every control answers (sound toggle chimes on re-enable).
- Ruby's gem outline unreadable (dark ink on dark canvas): empty facets
  now draw cream with a soft ruby glow; settled facets take ink lines on
  their fills. Draft-on-paper rendering untouched.
### Proven
- Targeted headless checks green (learn 25 drawers + cite slip, slider
  persists + toggles flip, overlay flow, 17 gem facets with cream stroke,
  per-room track picks). Full smoke blocked by a pre-existing environment
  stall (pristine 2.6.1 trips it too; machine under memory pressure).

## 2.6.1 — desktop legibility: orbit labels, all-rooms hint, threshold marks
### Fixed
- Constellation orbit labels read at last: numbers at 9px bold, kept names
  at 9px upright on a dark pill below the dot (was 7px italic above it);
  full names survive truncation in hover titles; verb edges rise from 6.5px
  italic to 9px upright with a dark outline. Kept names are also escaped
  into the SVG now (user-written `<` can't eat the web).
- Dial shows a persistent `··· all rooms` hint under the active tile
  (VT323 14px, faint) that opens the full index on click — the 600ms-hold
  door finally has a signpost. Carousel untouched.
- Empty states keep their words but gain threshold marks: cast-first shows
  a faint unlit ★ outline, buddy-made adds the lit ★ with an empty dashed
  orbit, first-bind draws one ghost edge. Same void, plus the room
  acknowledging each crossing.
### Changed
- Desktop functional text goes upright: constellation invitations and the
  mini-menu (preview, verb input, bind picker) drop italics for 16px roman;
  italics stay for flavour (header counts, buddy caption) only.
### Proven
- Full smoke green, zero page/console errors; orbit pills, ghost marks, and
  the all-rooms index verified in seeded desktop states at 1280×800.

## 2.6.0 — consent gate, affinity unlocks, finished chat, glyph works, three booths, weaver, soundscape
### New
- Boot consent gate: RAT's letter with a checkbox; enter stays disabled
  until checked, once per device, wipe re-arms it.
- Affinity unlocks: kept work opens rooms through relationships — tide pool
  (vanir, releases), ink storm (sealed chats), thimble garden (plantings),
  constellation weaver (binds). Invites arrive once, in-voice, never as grind.
- LiberChat finished: typing shimmer, transcript export, name asked before
  any patter.
- Twelve works live in the bezel carvings now: tier glow, prompt tips, same
  grounded prompts. The top bar is gone.
- Three booths under the tent: tide pool, ink storm, thimble garden (petals
  for every paint box). Weaver: the desktop constellation plays — pluck an
  orbit, drag to re-tie.
- Soundscape: generative beds per room, four traveller leitmotifs, gains in
  settings. Silence until the first gesture, always.
### New
- Pip's toybox room, built natively: the full powder engine (sand, water,
  fire, oil, salt, seed, steam, sprouts, wall) with element jars, a
  draggable crab that walks piles flat and a shell that plows (terrain
  restored on lift). Keeps save to games + satchel with polaroids.
- No walkthrough by design — the sign says everything.
### Changed
- Wrapper product name is back to LiberOS; the shell is bare again
  (a sidecar experiment came and went — the tent lives in the page now).

## 2.4.0 — letters, LiberChat, new games, garden rework
### New
- Summoning ritual: each line now rains letter by letter with landing sounds, in a brighter palette (white-pink, gold, violet, near-white).
- Satchel rebuilt as a filing cabinet: buddy / artifacts / relations drawers on the left third, a large persistent note page on the right, pen dock (highlighter + coloured pencils), click-a-highlight comment popovers, polaroid pictures for visual artifacts.
- LiberChat: the chat room is now a terminal/IRC window with a user list. AIML engine (wildcards, srai, random, predicates, that/topic) replaces ELIZA. Buddy ships with a 100+ category mind; Vanir (blue, challenging, shadow-pointing) unlocks at 3+ artifacts with ??? teasers for future users. Unread badge on the chat tile, periodic Buddy check-ins, per-user seal flow unchanged.
- Games rebuilt: emotion wheel (dart throws), communication mask, boundaries shield, relationship circles, powder tent (falling-sand sim). Uniform Whimsy-pitched shell; every game keeps with a polaroid.
- Garden reworked: the gem starts empty and fills by pouring; saving auto-plants; the bed is soil rows with sprouts; drag the watering can onto a sprout to colour it.
- Trash loop reworked: released artifacts queue in trash; digging is gone — re-adding asks why, and the reason returns as a satellite relation orbiting the artifact.
### Removed
- Relations room deleted (binding engine, constellation web, and old saves untouched). Nine old booths retired with the games rebuild.
### Changed
- Riason walkthroughs rewritten for satchel, sea, chat, and garden; sea/chats copy kept otherwise. Vague fate lines and room help copy rewritten in clear language; the main tutorial is untouched.

## 2.3.0 — questions beside the monitor, rooms removed
### New
- Desktop: a pixel-art "?" in the black space right of the monitor opens a question list; each question expands its answer below it, with the apps as a nested submenu. Hover speaks abstract's phosphor language (green bloom + blink).
- Summoning ritual: the four lines now fall from above one at a time, centered and pink, each landing with a faint tick; flames, glow, and shakes unchanged.
### Removed
- Methodology room deleted (page, feature, dial tile, walkthrough, prompts). Abstract room deleted, its phosphor idiom kept for the "?" hover. Themes room no longer plays a first-visit walkthrough.
- Dial tile "wax" renamed to "chat" (buddy page was already titled Chat). Old abstract/methodology artifacts in existing saves still display in the satchel, constellation, and slot summaries; they no longer generate prompts or tiers.

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
