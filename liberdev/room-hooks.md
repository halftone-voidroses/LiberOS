# Room hooks — the machine's memory register

Covenant rule 4 (THE ROOM REMEMBERS): every feature leaves something in the
room behind the CRT. This file is where that is written down.

**Enforced.** `node scripts/verify-room-hooks.mjs` fails if a folder in
`src/features/` has no row below, if a row names a state key that does not
exist in `src/state.js`, if a declared material is not in the vocabulary, or
if the live room renders a hook this file does not list — and vice versa.
Prose cannot drift from code without the gate going red.

Rows whose folder is `(machine)` are not a feature: they are the room's own
furniture, fed by shared `src/` modules rather than by any one room.

## The material vocabulary (closed)

A hook takes a material from this list, or adds a named one here with a
paragraph saying what it is made of. There are no unnamed materials.

| material | what it is | in the room |
| --- | --- | --- |
| `shelf` | one ledger volume per keep | the bookshelf on the left wall |
| `pool` | the water table shared with the yard | the sunken basin at the foot |
| `candle` | the session arc, relit on return | the stub on the desk |
| `board` | one pinned card and its red string per relation | the corkboard |
| `trophies` | one tin trophy per patina tier | standing on the CRT's top |
| `window` | the glasshouse tree, mirrored read-only | the window box |
| `weather` | Rainy Day, the room's own weather | the window in the back wall |
| `patina` | visits + keeps; the room ages | dust, floor wear, furniture |
| `floor` | the boards the room stands on, and what is spilled on them | the sand worked into the boards beside the desk (toybox), and the torn slips nobody kept (liberchat) |
| `none` | deliberately no hook | nothing — the reason is in the row |

## The hooks

| feature folder | hook id | material | reads (state key) | owned by | empty condition |
| --- | --- | --- | --- | --- | --- |
| `journal` | `shelf` | `shelf` | `journal` | journal.js | one bare board, bottom shelf, no volumes standing |
| `sea` | `pool` | `pool` | `sea`, `seaTide` | sea.js | damp stone, the waterline below the rim |
| `trash` | `pool` | `pool` | `graveyard` | trash.js | the same basin drawn down; the yard and the pool share one water table |
| `divination` | `board` | `board` | `relations` | sigil.js | a bare cork, four empty pin holes |
| `sigil` | `board` | `board` | `relations`, `buddy` | sigil.js | the stone is the anchor every string runs from; with no stone, no strings |
| `buddy` | `board` | `board` | `buddy` | buddy.js | a bare cork; a sealed chat is what puts a card on it |
| `themes` | `trophies` | `trophies` | `visited` | shadow.js | no tin on the CRT's top |
| `garden` | `window` | `window` | `tree` | garden/tree.js | an empty pot on wet newspaper |
| `crt-room` | `—` | `none` | — | — | it *is* the room; it declares no hook into itself |
| `settings` | `—` | `none` | — | — | the panel toggles the machine's own hooks (weather, tube bloom, whether the room shows at all). It keeps nothing of its own, so it leaves nothing. |
| `learn` | `—` | `none` | — | — | the card shelf already stands on the desk in the room's own register; a second copy on the bookshelf would be a duplicate prop, not evidence |
| `about` | `—` | `none` | — | — | a colophon. It keeps nothing, so it leaves nothing. |
| `cohort` | `—` | `none` | — | — | a retired surface; nothing it ever held is still reachable |
| `dreams` | `dream-sheet` | `board` | `dreams`, `journal` | crt-room.js (dreamSheet) | a second bare pin, no sheet — a dream kept to the book is what hangs one |
| `toybox` | `spill` | `floor` | `games` | crt-room.js (spillOf) | swept boards — the tray has not been turned out here yet |
| `games` | `tickets` | `board` | `games` | crt-room.js (ticketsOf) | no twisted tickets on the corner pin — the midway keeps what the barker keeps |
| `(machine)` | `candle` | `candle` | `sessionStart` | gamification.js | a full fresh stick, unlit until the visit starts |
| `(machine)` | `patina` | `patina` | `visited` | shadow.js | new dust, unworn floor, furniture as bought |
| `(machine)` | `weather` | `weather` | `shadowOn` | rainy.js | clear weather, the tube at its default bloom |
| `(machine)` | `slips` | `floor` | `chat`, `buddy` | liberchat.js | swept boards beside the desk — nothing printed and left unkept |

## The three gaps, closed

`dreams`, `toybox` and `games` were the last three features with no hook —
real state, real rooms, nothing in the machine's memory. All three are built
now, each in the room's own material:

- **Dreams** — a second sheet on the board: the most recent dream kept to the
  book, developed on arrival as a small dusk polaroid. Kept-ness is owned by
  the journal (`kind: 'dream'`, `ref` = dream id); the room reads both arrays
  and derives — it never writes either.
- **Toybox** — the spill the floor never quite gets clean: sand worked into
  the boards beside the desk, its depth fed by toybox keeps (each keep is a
  sitting at the tray). `floor` was reserved for exactly this; it is claimed.
- **Games** — the midway's own prize: paper tickets twisted on the board's
  corner pin, one per game artifact, five at most, the newest booth's glyph
  inked on the top ticket.

The reversibility rule holds for all three: release the keep, bury the dream
back into fog, turn out the tray — and the material leaves the room, because
every one of them derives from the same arrays their features own.

## The tube's paper

The last gap was not a room at all. Liberchat is a `src/` module rather than
a feature folder, so no gate looked at it — but it keeps `chat`, one exchange
count per persona, and the room behind the CRT was blind to it. It is not
blind now: **the paper the tube printed and nobody kept**.

An exchange is written by `liberchat.js` into `chat[persona]` and never
cleared, deliberately: `affinity.js` reads those counts as cumulative
vouching, so clearing one would quietly take an unlock back. Sealing a
conversation is the machine's own ceremony — `seal in wax` files it to the
book as a `buddy` keep stamped `lamp: true`, and that keep records the count
it was sealed at. So the room reads two numbers and takes the difference: an
exchange past a persona's last seal is paper still lying about. One torn
strip per persona, on the boards beside the desk, four at most.

The reversal is the seal itself, and it runs both ways: keep talking and the
strip appears while the conversation is unkept; seal it and the strip leaves
the floor as the volume arrives on the shelf. Nothing accumulates here that
cannot leave. The desk side keeps the tube — the one thing the machine does
about it — and must never carry a second copy of the floor.

## One object, never two

A room may be entered (`look behind`, `src/features/crt-room/`), and the desk
therefore shows two places at once: the machine's own backdrop, and the room
behind it. Anything that exists in that room must exist there **once**. The
tempting mistake is the second instance — a desk-side copy of a room's window
or pool "so you can see it without looking behind" — and it fails in a
specific way: the copy is opaque and sits at `z-index: 1`, so it paints over
the very room it duplicates, and the weather ends up falling in two windows
while hiding the house.

So: a hook that a room renders is rendered by that room, and by nothing else.
The desk side keeps only what the machine itself does about it — palette,
light, the ticker — never a second copy of the room's furniture.

| hook | renders in | owner | the desk side must carry none of |
| --- | --- | --- | --- |
| `weather` | the CRT room's own window (`.crt-window .crt-wb-sky`) | `src/features/crt-room/crt-room.css` | `.rainy-window`, `.rainy-sky`, `.rainy-sill`, `.rainy-drop` |
| `slips` | the boards beside the desk (`.crt-slips`) | `src/features/crt-room/crt-room.css` | `.lc-slip`, `.lc-slips` |

`scripts/verify-room-hooks.mjs` checks every row: the owning stylesheet
exists, the pane it names is really in it, the hook is one the room renders,
and every retired selector is absent from **all** CSS in the project. A second
instance cannot be added back without the gate going red.

The interior is the room's, and the room owns the state of the glass: when
you look behind, the desk backdrop yields (`background: transparent`) so the
room is the thing being seen. `src/features/crt-room/crt-room.css` states it;
`styles/shadow.css` restates it for the rainy state, because it loads later
at equal specificity and would otherwise paint an opaque sheet over the room.
