# Covenant CSS — the theme register, and the two rulings

The covenant is prose. `scripts/verify-covenant-css.mjs` is the part of it a
build can fail, and this file is the part a person has to agree with.

Every rule below is one this tree has actually broken at least once. That is
the only reason a gate is here: a rule nobody has ever broken is a preference,
and preferences do not get to fail anybody's build.

## 1. Motion with consent is structural

`styles/room.css` carries one authoritative gate:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-delay: 0s !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    transition-delay: 0s !important;
    scroll-behavior: auto !important;
  }
}
```

**Every page loads it**, so consent does not depend on anybody remembering.
That is the whole point. The house used to hand-maintain a selector list per
room, which works exactly until the next animation is added in a room nobody
revisits — and then it silently stops covering. A list cannot fall behind a
wildcard.

**`0.01ms`, not `animation: none`, and deliberately.** An animation that ends
in a state the room needs — a fade held by `forwards`, a wipe that sets the
transform which gets it out of the way — still lands on that state. The
journey is gone; the arrival is not. This is the difference between the
covenant's *"instant state change"* and the failure it was written against:
a shortened *journey* is still a journey. One instance survived as
`animation-duration: 0.01s` (ten times longer, and a real wipe to watch);
it is `animation: none` now.

### Motion in JavaScript

`requestAnimationFrame` is motion too, and CSS cannot reach it. A decorative
loop reads the same consent. Three loops do **not** read it and are named here
because they are not animation at all — each is one-shot scheduling, and the
gate fails if a fourth appears:

| file | what it is |
| --- | --- |
| `src/twelve-works.js` | a bounded retry, for carvings bound before they exist |
| `src/features/dreams/dreams.js` | moves a scroll position once, into view |
| `src/house.js` | coalesces a burst of resize events into one measurement frame |

The genuinely decorative loops — `dust.js`, `static.js`, `clock.js`,
`toybox.js`, `sea.js`, `constellation.js`, the three games booths — all read
the setting. Functional sims step instead of sweeping; decoration stops.

## 2. Nothing floats

Every resting object casts a contact shadow: a blurred ellipse, offset opposite
the key light. In the house that is `.house-prop::after`, and it is measured in
machine units so a small prop does not wear a shadow three times its size. A
prop on a wall casts nothing on the boards and says so with
`[data-place="band"]::after { display: none }`. A shadow with no blur is a hard
oval and a hard oval is a sticker.

## 3. Out of register

Checked, and clean:

- **No `backdrop-filter` anywhere.** The build's one piece of glass was a
  toybox overlay; it is a solid pane now. Glassmorphism is out of register.
- **No floating cards with blurred drop-shadows.** The one instance was a
  card at `0 10px 26px` — a card hovering over the room. It is a contact
  shadow now.
- **No neon.** Neon here means exactly what it says: full chroma at full value.
  Every warm highlight in the house (cream, candle, gold, phosphor) clears it
  by a wide margin.

## 4. The two rulings

Two things were read literally, argued about, and decided. Written down so they
are not re-litigated by the next pass.

### 4.1 The chassis is the machine's material, not an inset panel

`styles/machine.css` draws the bezel as a rounded rect inset 6px with a ring
shadow, and every room renders inside that aperture. The covenant bans *"an
inset panel with a rounded border pretending to be a room."* Read literally,
this is that panel. Read by material, it is the LiberVacui chassis — the thing
the traveller built, which the house is standing around. **The chassis stays.**
The ban is about a *room* built out of a rounded card; this is a machine, and
the rooms are now literally outside it.

### 4.2 Entity404's phosphor is a material, with a ceiling

`#00ff66` was in three places: the themes swatch, the machine's
`theme-entity404` skin, and the desktop FAQ's hover. Entity404 is a real
persona (`data/personas.data.js`, *"it is drawn to seals. mind the hiss"*), so
the green is hers and stays — the covenant permits a persona's own material.
What does not stay is the value: a bare `#00ff66` is neon, and neon is out of
register. It is `#3f9e5c` now, in all three places, so her colour reads as a
spent CRT phosphor and not a highlighter. **Saturating it back up is the bug.**

Its `machine.theme-entity404 .corruption-scars .scar` keeps its
`hue-rotate(90deg) saturate(1.4)`: that is a *filter over the machine's own
scars*, which is glitch behaving like glitch, and the ceiling is about paint.

## 5. The per-room theme

A room may deviate from the base palette — that is the whole design — so the
thing worth recording is not "is this colour allowed" but **what a room is made
of, and who is in it**. Each room's material is declared in its own
`src/features/<room>/house.css` (substrate, light, tells) and mirrored in
`data/rooms.data.js`, which `scripts/verify-house.mjs` checks against the paint
so the prose cannot drift.

| room | place | agent | substrate | light |
| --- | --- | --- | --- | --- |
| `dreams` | the sleeping nook | insightful inquiry | damp plaster, wool, alkaline paper | lamp on a cord, warm; the moon, cold |
| `toybox` | the bathroom | pip | glazed tile, chipped enamel, wet grout, brass | bare bulb on a cord; a frosted fanlight |
| `journal` | the study | riason | indexed vellum, brass clasps, oak, ink | a green-glass banker's lamp; the window dark behind its curtain |
| `sea` | the basement | vanir | wet slate, mortar, iron pipe, salt bloom | a caged bulb, cold yellow; no daylight, only the sump |
| `divination` | the observatory | arcana | plaster, chalk, felt, brass, night air | a red darkroom lamp, low; the dome slit on the cold |
| `games` | the play room | whimsy wow | painted floorboards, cream wallpaper, tin, festoon bulbs | a festoon run; daylight through the pane |

Each of those six rooms also carries the two hooks `liberdev/room-hooks.md`
names — the session light (`lamp`) and the ledger shelf (`shelf`) — plus `pool`
where the room keeps water and `board` where it keeps relations. **The same two
objects, re-made in six materials**, which is covenant rule 4 read across the
whole house rather than only in the room behind the CRT.

**Hue families are not free-form.** A room's saturated colours must trace to
its own material or its persona's declared wash. The drift this caught was an
electric blue-violet in the play room — a fairground tent and booth painted
`#5e4af0` / `#5840ed`, blue-violet in a room whose declared materials are
crimson, tin and cream and whose persona's wash is `#aa1018`. It is a deep dyed
indigo now, and the gate fails on any undeclared electric blue-violet anywhere
in the tree.

## 6. The house grammar

The architecture is `styles/house.css`; the finish is the room's own file. The
grammar exists because furniture used to be composed as a percentage of the
window, and the machine covers most of the window, so furniture was built and
then stood behind the monitor at most window shapes.

- **The seen band** is everything the machine does not cover. `src/house.js`
  measures `.machine` and the desk tube and writes `--house-band-x`,
  `--house-band-w`, `--house-above` and `--house-unit`.
- **`--house-unit` is the machine's own width.** Furniture is *sized* against
  the machine, not against the leftover band. The band grows and shrinks
  wildly with the window; the machine does not. A room keeps its proportion to
  the desk.
- **Two slots survive every window shape:** `band` (the wall above the desk
  tube) and `floor` (the boards below the machine, seen through the one level
  sightline the room has). A prop declares a slot and two fractions; it does
  not decide for itself whether it will be visible.
- **The glass is the building's.** The window opening is in the same place in
  every room and is measured in machine units from the band's right edge, so
  the wall it leaves for furniture is a known width. The weather behind it is
  the room's.
- **The lamp hangs in the band.** A light the room never shows is a light that
  is not lit.
- **Capacity tiers.** `data-band` is `roomy`, `tight` or `none`, measured in
  *pixels* rather than units — what decides whether a room can be furnished is
  whether there is room to see a thing. At `none` the room is substrate and
  light, and nothing is piled onto a postcard.
- **A prop that declares no slot is not built.** A prop a slot cannot hold is
  furniture the traveller cannot see, and the covenant asks a room to be a
  room, not to be full.

### Retired: the door to the hall

There was a shut door on the left wall, and it was honest — you do not leave a
room by its door, you leave by its own exit. It is retired because the room's
only visible wall is the band, and a door whose top half hangs in the band
while its bottom half is behind the monitor is not a door, it is a piece of
one. `scripts/verify-house.mjs` fails if it comes back.

## What this pass did not do

Named so the absence is a decision and not an oversight:

- **No per-room cursor tools.** The shared `.stagehand-cursor` stays. Trowel,
  pruners, stamp, chalk, valve wrench, carving knife and brush are a real idea
  and a different job.
- **No chrome retirement.** The 13 titlebars and 25 help/exit buttons are
  unchanged. `mistress physius keeps the ritual` is still the sub-line in both
  `buddy.html` and `sigil.html`, and the `X keeps/holds Y` mould is still
  stamped from a template in all thirteen. It needs one shell-wide decision,
  not a per-room edit.
- **No shell motion-budget trim.** The ambient loops in the desktop, boot,
  cutscene and constellation surfaces stay. Consent now covers them; the
  count is a separate conversation.
- **`learn`, `garden`, `trash` and `buddy` are untouched** — another lane owns
  their redesign, and this pass did not go near them.
