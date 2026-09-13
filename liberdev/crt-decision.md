# CRT-Intensity Control — decision spec (no code)

Status: Batch 1 foundation. Spec only — nothing here ships behavior.
No stylesheet, no JS lands with this file.

## Setting key

- Key lives in the persisted store: `liber_vacui_v1` (and its slotted
  variants `liber_vacui_v1__<slot>`), read/written only through
  `window.Liber.state` (`get` / `set`), same owner pattern as
  `crtRoomOn`, `sounds`, `scape` in `src/state.js` / `settings.js`.
- Proposed shape: `s.crt = { intensity: 0.4, off: false }`.
  - `intensity`: 0.0–1.0 scanline/bloom strength. Default `0.4`
    (40% scanline opacity at full bloom).
  - `off`: hard kill-switch (intensity ignored, overlays hidden).
- Absent key = defaults (0.4, shown). Migration: `Object.assign({},
  DEFAULT, parsed)` absorbs it with no legacy rewrite needed.
- Not session state: intensity is a kept preference, not a visit gaze
  (contrast: `crt-room.js` keeps open/closed in `sessionStorage`).

## Default: 40% scanline opacity

- At default, scanline/bloom overlays render at 40% of their authored
  per-room maximum opacity. `intensity` scales that ceiling linearly
  (0 = transparent, 1 = authored max). Per-room maxima stay authored
  per-room — this control only scales.
- Range control (if slider): 0–100, step 5, labeled with the room's own
  plain words, never "CRT intensity" prose in-room (settings panel may
  name it plainly; rooms use diegetic labels).

## Per-room `data-crt` scoping

- Each room opts in with its own scoping attribute (e.g.
  `data-crt="sigil"` on the room root or `body`). The room's own CSS
  reads the intensity custom property inside that scope only.
- No global CRT stylesheet. No shared overlay partial. Stone renders
  scanlines as chisel-dust in light; felt renders them as weave; the
  midway as bulb-bleed. Same 0–1 input, different material output.
- Rooms without the attribute are unaffected. Removing the attribute
  is a valid per-room veto.

## Reduced-motion + photosensitivity

- `prefers-reduced-motion: reduce` forces effective intensity to 0 for
  animated layers (flicker, shimmer, drift stop entirely — instant
  state, per covenant). Static scanline texture may remain only if it
  is non-animating and below default; when in doubt it goes to 0 too.
- Photosensitivity: no strobing at any intensity; no flicker above
  ~3Hz anywhere; `off: true` must also kill candle-flicker-class
  animations in rooms that tie bloom to flame. The kill-switch is
  honored before any room flourish.
- Both behaviors are tested, not noted: reduced-motion emulation +
  toggle-off must leave zero animating CRT layers.

## Reversible toggle location

- **Settings:** the maintenance panel (`settings.html`,
  `src/features/settings/settings.js`) owns the canonical control —
  same shelf as sound fx, music, shadow, room-behind. Reversible in
  one gesture; state mirrors via `renderState`-style read.
- **In-room lamp-pull pattern:** each room may offer its own diegetic
  twin — a lamp cord, a bench lamp switch, a midway bulb the visitor
  pulls/clicks to dim or kill the bloom. Plain label, keyboard-focusable,
  `aria-pressed` reflecting `off`. Precedent: the `crt-room-toggle`
  "look behind / back to the screen" button (own material, own words,
  Esc to leave). In-room control writes the same `s.crt` key — one
  owner, mirrored everywhere.
- Reversibility: off→on restores the prior intensity (don't reset to
  default on re-enable); the wipe path (`settings-wipe`) restores
  defaults along with everything else.

## Non-goals / open questions

- Non-goal: unifying room bloom into one look (covenant forbids it).
- Non-goal: per-visit auto-dimming, ambient-light sensing, or new
  network/admin surfaces (file://-safe holds: no fetches).
- Open: slider vs. stepped (dim / low / full) control in settings —
  decide at implementation with the settings room's authoring voice.
- Open: whether `off` also hides the look-behind toggle's glow dot —
  default yes (it's bloom), room veto allowed.
