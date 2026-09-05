# the aesthetic sweep — a critical pass over the machine

> What could be depicted more intricately, where, and what it would cost.
> Part one audits the surfaces. Part two redraws the wheel.
> Companion catalogs: `style-options.html` (button materials), `icon-suites.html` (icon families).
> Covenant holds throughout: no nagging, agency over protection, chunky beats
> sleek, haunted not halloween, machinery must be real.

---

## part one — things that could be depicted more intricately

Twelve opportunities, grouped by cost. Each: what exists now, what the more
intricate depiction is, and the technique. Nothing here proposes fake
decoration or covenant violations — two ideas were cut for exactly that
(a "mood ring" bezel and an encouragement system; both would lie).

### free wins — pure CSS/SVG, an afternoon

**1. the LED is a pilot flame, not a dot.**
now: a static red circle that pulses on a fixed loop.
intricate: a two-phase candle-flicker (fast jitter inside a slow breathe), a
tiny wax mound building under it that very slowly grows with `visited-N`, and
a 1px warm halo that reflects on the bezel plastic below.
technique: one keyframe set + a `radial-gradient` pseudo-element driven by the
existing patina classes. reduced-motion: static flame, no pool.

**2. the boot title typesets itself.**
now: "LIBER.OS" fades in as a block.
intricate: letterpress — each glyph lands individually with a 1px press-sink
and a faint ink-spread (text-shadow blooming over 200ms), sequenced like a
hand-set print. The ENTER key follows with a physical thunk.
technique: per-letter spans + staggered animation-delay; the boot already has
the sound engine for the thunk.

**3. the status line is ticker-tape.**
now: a bevelled plate with text that swaps every 12s.
intricate: perforated tape edges (dotted punch-holes along the plate's top
and bottom), and each new phrase arrives in small horizontal steps like a
teletype advancing — 3-4px per frame, not a fade.
technique: dashed-border pseudo-elements + `steps()` on a translate. The
status line already owns its plate; nothing shared reaches the apps.

**4. the carvings collect verdigris.**
now: patina deepens the carvings in sepia/brightness tiers.
intricate: the two copper-bearing carvings (stone's inlay, relation's ring)
grow a green oxide bloom in the recesses as visits accumulate — verdigris is
what copper *does*, and it is the one color the bezel never uses.
technique: a `background-blend` green tint layered only on the inlay
pseudo-elements, keyed to `patina-2/3`.

**5. the glass has a glare that wanders.**
now: static curvature shading and vignette.
intricate: a slow diagonal glare band crossing the tube every ~40s — barely
visible, 8s crossing, warm-white at 3% — the tube is glass and glass
reflects the room. Time-dependent (the user's stated keep), reduced-motion
gated.
technique: one rotated linear-gradient pseudo-element on `.screen` with a
long translate loop.

### worth a session — an hour of craft each

**6. the casting stone gathers dust while you draw.**
now: the sigil revelation shows dust in the cracks on hover (WS4).
intricate: while the hand is actually down, canvas particles settle into the
stroke grooves and stay — the drawing physically accumulates the room.
technique: the dust canvas already exists; add a settle-mode keyed to
pointerdown on the sigil canvas. Particles are the room's, not new ones.

**7. the wax room's light follows the conversation.**
now: three fixed candle flames above the chat transcript.
intricate: the light pool on the tablet shifts toward whichever turn is
newest — her words lean the glow cool, yours lean it warm. The newest
message is always the best-lit.
technique: a gradient overlay whose origin interpolates to the last turn's
side; one CSS transition, no new loops.

**8. the sea is deep, not flat.**
now: a depth gauge, breath rings, one pale hover-shape below.
intricate: two parallax silhouette layers — far kelp and a nearer shelf —
that drift at different rates with the mouse depth, so descending feels like
passing *through* water, not sliding a slider.
technique: two absolutely-positioned silhouette layers translating at
ratios of the existing depth value. No new input.

**9. the ledger shows a seal crack before it unbinds.**
now: release removes the row instantly (with the thunk).
intricate: on release, the row's wax-seal glyph cracks (a clip-path split
over 300ms) and *then* the row lifts away — destruction you can see, honest
about what just happened.
technique: a two-half seal glyph + a keyframed transform on the row's exit.
The relation app's own CSS only.

**10. the loading ritual has drive chatter.**
now: "Now Loading" with the fate line and a wipe.
intricate: a low synthesized drive-chatter under the text (WebAudio, already
offline and gesture-safe) — seek/track/seek — so the machine sounds like it
is reading something real. Fades with the wipe.
technique: filtered noise bursts in `src/sound.js`'s existing voice
architecture; a 'chatter' kind wired to the loading page only.

### one day — needs new machinery

**11. the room keeps real hours.**
now: the radial clock shows the time; the room is the same darkness at 3pm
and 3am.
intricate: the ambient glow takes a very slow tint drift from the actual
local hour — deep red at night, a colder near-black at noon. Never announced,
never a "theme", just a room with windows it does not have. Uses the clock
that already ticks.
technique: an hour-derived class (`room-noon/room-dusk/room-night`) set in
`shadow.js`; three gradient overrides in `room.css`. Reduced-motion: still
applies — it is light, not motion.

**12. the cohort has a waveform in the static.**
now: "the cohort becomes louder" is tiers of overlay resolution and status
lines.
intricate: at the loudest tier, the static canvas occasionally carries a
faint coherent waveform — a heartbeat-shaped pulse in the noise that lasts
one second and is gone. The Cohort is not text; it is a shape in the signal.
technique: a canvas overlay draw keyed to tier-3 + a seeded trigger (the
ambient prompt scheduler already exists). One session of canvas work.

### cut on purpose

- a bezel "mood ring" that shifts with state — lies about the machine's
  nature; the corrupted default is a truth, not an indicator.
- encouragement or reassurance copy anywhere — flattery is contempt even
  from a CRT (the vision file's own law).

---

## part two — the wheel, redrawn

The dial as shipped: **phosphor bitmap plaques** — twelve dark-glass tiles,
each with the app's name as a phosphor label above a 12×12 crisp pixel glyph,
every tile burning in its traveller's phosphor, the active tier lifting,
flaring, and shedding motes. One grammar, twelve tints. It scans instantly
and it is already yours.

The alternative worth putting beside it: **each traveller designed their
own** — the tile is not a plaque in a shared system, it is the little object
*that traveller* made to label their door. Parity only in footprint
(identical 72×88px, phosphor label above) — everything inside the footprint
is their hand:

| traveller | their tile |
|---|---|
| mistress physius | grey chiseled stone; the glyph cut into the rock, copper inlay in the cut |
| the librarian | a vellum tag with a brass clasp corner; the glyph inked, small-caps |
| vanir | wet slate with a foam-lit top edge; the glyph dripping |
| e-lizabeth (chat) | black wax; the glyph pressed as a seal impression, ember behind |
| entity404 | raw phosphor glass — no chrome at all, just the glyph and the bloom |
| whimsy wow | painted marquee wood with bulb studs; the glyph in show-card lettering |
| arcana | deep red felt; the glyph drawn in chalk, dusted at the rim |
| the mad scribe | an index card; the glyph ink-stamped, red rule at the head |
| raison | a folio tag with a rubric line; the glyph set like a figure, captioned |
| iris mappa | a pigment tile mosaic; the glyph in four poured colors |
| e-lizabeth (relation) | an iron plaque; the glyph as a raised ring-and-link |
| ravaging pete | a die-cut rubble shard; the glyph scratched into the surface |

**what the unified grammar gains:** instant scanning — twelve tiles read as
one instrument; cheaper to keep coherent; the phosphor family already
matches entity404's room and the CRT premise.

**what the bespoke hand gains:** the dial becomes the graveyard's lesson
applied to navigation — every tile is a room you have stood in, made by
someone who was there. It is warmer and stranger, and it makes the dial the
only place in the machine where all twelve hands sit side by side.

**the hybrid is real:** bespoke tile backs (their material, their mark) with
the unified phosphor label kept above — scanning stays, presence arrives.
That hybrid is the recommendation if this catalog moves forward; the
material recipes already exist in the shipped app styles per traveller.

---

*cost classes: free wins are afternoons; worth-a-session is honest hour
blocks; one-day items need design before code. Everything here keeps the
frieze, the motes, the crossing ritual, and the motes' reduced-motion gates
exactly as shipped.*
