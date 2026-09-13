# Affordance Contract (shared behavior, not shared looks)

Status: Batch 1 foundation. Spec only — no global CSS ships with this file.

Covenant precedence: COVENANT.md rules 2–3 win over any shared-button ask.
Each room keeps its own stylesheet, materials, and grammar in
`src/features/*/*.css`. This contract standardizes **affordances**
(what a visitor can rely on everywhere), never geometry, palette,
typography-as-voice, or furniture. Per-room geometry stays in the
per-room CSS. No `styles/shared-*`, no component library, no common nav.

## The contract

1. **44px minimum targets.** Every tappable/clickable control (buttons,
   swatches, booth doors, dial options, board pins) exposes at least a
   44×44 CSS-px hit area. Small visible marks may be smaller; the hit
   area is not. Implemented per-room (padding / transparent border /
   pseudo-element), never via a shared class.
2. **Visible `:focus-visible` ring ≥2px, per-room color.** Every
   focusable element has a `:focus-visible` style with an outline or
   ring at least 2px wide, in the room's own accent (gold on stone,
   chalk on felt, bulb-warm on the midway…). `:focus { outline: none }`
   without a `:focus-visible` replacement is a defect. Ring color lives
   in the room's CSS.
3. **Instruction contrast ≥4.5:1.** Any text the visitor must read to
   use the room (labels like save / keep / release, counts, warnings,
   form lines) meets WCAG AA 4.5:1 against its immediate background.
   Atmosphere text may be fainter only if it is never load-bearing.
4. **Instructions ≥16px non-italic; flavor italic-faint.** Functional
   text is ≥16px (1rem), upright, plain register ("save", "keep").
   Maker-voice residue / flavor is the visual opposite: italic and/or
   faint, clearly not an instruction. If a faint line must be followed
   to proceed, it is an instruction — set it upright at size.
5. **Type scale 28 / 18 / 14 / 12.** Room voices differ, but sizes rhyme:
   28 display (room weather / bench plate), 18 working text (inputs,
   card names, ledger lines), 14 secondary (counts, cross-references,
   form numbers), 12 residue (revision marks, dosages, stamps). Rooms
   render these in their own faces and weights; the numbers are the
   shared part.
6. **Modals close three ways: ×, Esc, back.** Every overlay / prompt /
   save-sheet provides an explicit × (plain label, e.g. "close"), an
   Escape handler, and a back affordance (the room's own exit or
   history-back where diegetic). Precedent: `crt-room.js` `escOut`
   closes the look-behind on Escape; `settings.js` `back()` falls back
   to `desktop.html`.
7. **Keyboard operability.** Everything pointer-operable is
   keyboard-operable: real `<button>` / `<input>` / `<a>` elements (or
   `tabindex="0"` + Enter/Space handlers where the material demands a
   custom node), visible focus (rule 2), no pointer-only gestures, no
   hover-only reveals. Canvas actions (draw, pour, throw) keep a
   keyboard path to the same keep/save outcome.
8. **Reduced-motion instant-state.** Under
   `prefers-reduced-motion: reduce`, every transition/animation becomes
   an instant state change — function survives, flourish does not
   (COVENANT "Motion with consent"). Precedent:
   `crt-room.css` consent block kills transitions/animations. No
   `setInterval` animation; CSS motion only, reversible or not shipped.

## What this file does NOT authorize

- No shared stylesheet, no shared button/nav/card CSS, no site-wide
  theme tokens beyond the covenant base palette.
- No geometry unification: spacing, layout, hit-area technique, and
  ring rendering stay per-room in `src/features/*/*.css`.
- No prose in rooms: contract conformance is never a caption, kicker,
  or explainer inside the artifact (anti-prose rule holds).

## Room conformance checklist (per room, in its own CSS/JS)

- [ ] All controls hit ≥44px; `:focus-visible` ring ≥2px in room color.
- [ ] Instructions ≥4.5:1 contrast, ≥16px upright; flavor italic/faint.
- [ ] Type sizes land on 28 / 18 / 14 / 12 or the nearest diegetic step.
- [ ] Overlays close via ×, Esc, and back; exit always visible.
- [ ] Full keyboard path to every keep/save/release outcome.
- [ ] `prefers-reduced-motion` gate verified; 1280×800 and 439px hold.
