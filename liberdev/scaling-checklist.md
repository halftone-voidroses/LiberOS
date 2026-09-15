# Scaling and readability checklist

The covenant's contract is one line: *"If a room cannot survive a browser at
1280×800 and at 439px, it is not done."* This is how that is measured, what was
wrong, and what is left.

**Enforced.** `node scripts/verify-scaling.mjs` — 51 checks over 15 pages and
8 window shapes. It fails on a page that scrolls sideways, a machine width that
is not a rung of the ladder, a window that does not come back to the room it
had, a resolution setting that does not pin, text below the floor, or a house
that fails to degrade at 439px.

## The complaint, and what was actually happening

*"The elements slide around the screen a lot when the window changes."* Two
separate causes, and the second one was the room's own fault.

### 1. The machine followed the viewport continuously

`machine.css` sized the monitor as `min(72vw, 1100px, …)`. Every fraction of
the screen — the bezel's padding, the screen's inset, every room's furniture —
is expressed relative to that width, so dragging a window edge slid all of them
at once. A composition that is right at 1280 was half-right at every size
between.

**The fix is a ladder, not a fluid rule.** `src/stage.js` holds the machine at
one of 28 widths, 20px apart near the top where a desktop lands and coarser
below, and takes the largest rung that fits the window. The room stops moving
while the edge is dragged and settles only when the window has actually
changed enough to want a different rung.

| window | machine | why that rung |
| --- | --- | --- |
| 2560×1440 | 1100 | the cap: the machine I know, and never bigger |
| 1920×1080 | 1100 | |
| 1440×900 | 1020 | |
| 1280×800 | 920 | the covenant's reference size |
| 1024×700 | 720 | |
| 900×640 | 620 | |
| 760×560 | 540 | |
| 439×800 | *fluid* | below the smallest rung the fluid rule takes over |

The last row is deliberate and is the shell's half of the 439px contract: below
460px the ladder is removed and `machine.css`'s own `min(96vw, …)` runs, which
gives a narrow window a workable stage instead of a postcard. `verify-scaling`
checks the fallback is in force rather than asserting a rung that cannot fit.

**And it is pinned when asked.** `src/features/settings/` has a RESOLUTION
group (auto · 1100 · 1000 · 900 · 800 · 700 · 600) writing `s.resolution`.
`auto` takes the largest rung that fits; a number holds regardless of the
window. This is the answer to *"or add a resolutions menu, whichever is most
stable"* — the ladder is the stable part, and the menu exists because a
traveller may want the room a particular size on purpose.

### 2. Room furniture was composed as a percentage of the window

Worse than the sliding, because it did not *look* broken — the room was simply
empty. Furniture at `left: 2%` sat behind the monitor at most shapes, and the
band of room actually visible is only about 26% of the width.

**The fix is to compose against the room that is visible.** `src/house.js`
measures the machine and the desk tube and publishes the seen band; furniture
is placed in one of the two slots that survive every shape and *sized against
the machine* rather than against the leftover space. See
`liberdev/covenant-css.md` §6 for the grammar.

Measured, at the reference size (1280×800, machine 920 wide at x 27):

| | px | |
| --- | --- | --- |
| band (machine's right edge) | 947 → 1280 | 333px, 36 machine-units |
| free wall, left of the glass | 947 → 1151 | 204px — what furniture shares |
| clear height above the tube | 0 → 278 | where the wall furniture stands |
| floor slot, below the machine | y 763 → 800 | the level sightline |

**A prop that could not fit was not built.** Dreams went from eleven props to
six, journal from ten to five, games from six to five. A bed, a bath, a
telescope and a desk are all floor's worth of object, and this room's floor is
a strip 37px tall. Two or three telling things on a wall beat eleven standing
behind a monitor.

## Readability

Checked by rendering, not by reading stylesheets: every text node on all 15
pages at eight window shapes, with its computed size.

### The floor is 9px, and it is 9 for a reason

A content run renders at or above 9px. Three things were genuinely below it and
are fixed:

| what | was | now | why it changed |
| --- | --- | --- | --- |
| `.lc-sidecar-letterhead` (`TX-80/3 · second tube`) | 8px, 0.2em tracking | 10px, 0.14em | twenty-five characters rendered as a texture |
| `.tell.pin-note` (`the drowned was not one of mine…`) | 0.56rem / 8.96px | 0.6rem / 9.6px | a sentence, below every other caption in the house |
| `.cutscene-wipe.slow` under reduced motion | a faster journey | an instant end | not type, but the same class of bug |

Everything else below 12px is a **caption at 9.6px** — `SCALE Nº 2 · LEAD TO
5 STONE`, `three rings · honest seating`, `— a cartographer of the liminal —`.
Those are legible and are left alone. The floor is a floor, not a preference.

### Plate marks: objects, not sentences

Nine rendered strings sit below the floor deliberately, and are named in the
verifier so a tenth has to be added on purpose: the journal spine plates
(`RIASON`, `BOUND MMXXVI`), the games shingles (`OVERWHELMED`, `CURIOUS`), the
`about` chart's coordinates (`42°N`, `71°W`) and its legend (`scale: 1:1`,
`datum: local`, `epoch: now`). A stamped mark is an object in the room; a
sentence is not allowed to be one.

## The checklist, for the next element

1. **Size it against the machine, not the window.** `--house-unit` is the
   machine's width. A percentage of the viewport is a promise the window has
   not agreed to.
2. **Place it in a slot that survives.** `band` or `floor` for house furniture.
   Anything else is composed for one window shape and invisible at the rest.
3. **Check it at 1280×800 *and* 900×640 *and* 439px.** Both ends are the
   covenant's; the middle one is where the band is thinnest.
4. **Nothing wider than the window.** A fixed-size decoration must be inside
   something that clips it.
5. **Type above 9px, or be a mark under 12 characters.**
6. **Motion reads `prefers-reduced-motion`** — in CSS that is free (`room.css`
   covers every page); in JavaScript it is your job.

## Known residuals

Reported rather than silently fixed, because they belong to other surfaces:

- **`verify-439.mjs` is red on `main`, and this branch did not make it green.**
  Below the fit threshold the liberchat tube is pinned in the corner, over the
  room — 272×193px at bottom-left in a 439px window — and the room's own
  controls sit under it. Seven rooms fail `no dead control`: dreams (title and
  text inputs), settings (two buttons), themes (a tile), trash (the bury-all
  action), sigil (four inks), learn (a citation) and the desktop (the boot
  consent check). Identical on `main` at `bd6b232`, so it arrived with the
  second-tube job.

  The obvious fix — collapse the shut tube to a hand-sized plate below the fit
  threshold — was implemented, measured and **reverted**: it clears the
  controls but breaks the tube's own deliberate behaviour, because a shut tube
  shows the last bench line on its sheet and `verify-sidecar.mjs` asserts that
  slip stays on the tube. Hiding the sheet to clear the controls hides the
  slip. Both gates belong to the second-tube job; which of the two yields at
  439px is that job's design call. Left red and named rather than traded for a
  different red. The CSS carries the same note where the rule would go.

- **`.divination-lamp` renders 476px wide in a 439px window.** It does not
  cause horizontal scroll (an ancestor clips it, and `ofx` is 0 everywhere),
  but it is a fixed-size decoration that overflows its window. Not touched:
  the divination room's own dressing, and the clip is doing its job.
- **Below 460px the machine is fluid again**, so a window dragged between 439
  and 460 does slide — by exactly the amount the fallback needs to keep the
  page usable. This is the deliberate end of the ladder, not a gap in it.
- **The 9 plate marks** are a floor decision, recorded above, not a defect.
