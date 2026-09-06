# Contributing a room to Liber Vacui

One room = one HTML + one CSS + one JS. No exceptions.

## The contract

1. **Files.** `yourroom.html` + `src/features/yourroom/yourroom.css` + `src/features/yourroom/yourroom.js`. Copy `garden.html` as the shell template (bezel, screen, titlebar with `?` then `×`).
2. **No shared imports.** Your CSS is standalone — never import another room's sheet. Your JS uses no bundler, no framework, no `fetch()` for local data. It must work over `file://`.
3. **State only through `window.Liber.state`.** Read with `get()`, write with `addArtifact(kind, data)` / `updateArtifact(kind, id, patch)` / `bindRelation(fromId, verb)` / `set(patch)`. Never touch `localStorage` directly. Never write streaks, scores, XP, or timestamps-outside-artifacts.
4. **Register in two places.** One entry in `data/personas.data.js` (id, name, opinion ≤ 80 chars in-voice, accent hex, material, cursor data-URI) and one tile in the dial's `VISITORS` in `src/dial.js`. Add your fate-circle lines to `data/fate.data.js` (voice + two lines, suggest never nag).
5. **Titlebar standard.** `?` (aria-label "how this room works") then `×` (aria-label "leave"), 40px targets, visible focus ring. `?` opens a how-sheet in both voices: Wanderlust's meaning, Riason's mechanics. Every overlay closes on `×`, Esc, and backdrop. Exits always visible.
6. **Copy bar.** Terse, lowercase-leaning, haunted machine. No placeholder attributes (labels live above inputs). No dev verbs (view/allow/follow/reduce). No encouragement, no flattery, no diagnosis. Enter submits, Esc backs out.
7. **Proof bar.** `node --check` clean on your JS. A 1280×800 screenshot in `screenshots/`. Zero pageerrors. If the build disagrees with the reference shot, fix the build.

## What belongs here

Draw → interpret → save artifact → relate artifacts. If your room doesn't serve that cycle, it doesn't belong. Practice rooms say on the door what they keep.
