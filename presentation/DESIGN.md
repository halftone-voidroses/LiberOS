# DESIGN.md — the Liber.OS presentation site

> The presentation site extends the machine's existing design universe. The
> visual contract is the app itself (SPEC.md covenant + shell CSS). This file
> distills that contract for the presentation surface and is the authority
> for `presentation/*`.

## 0. Research Log

- **In-repo reference (loaded in full):** `SPEC.md` covenant, `docs/inspiration.md`
  narrative, shell CSS (`styles/room.css` palette via machine element,
  `src/features/sea/sea.css`, `src/features/games/games.css`,
  `styles/desktop.css` prompt-line), and the twelve carving glyphs from
  `src/carvings.js`. Extracted: palette, type stacks, voice, motion rules.
- **Layer A taste:** `evocative-web` (user skill) governs — feeling-first,
  typographic architecture, restrained motion.
- **Skipped lanes (named):** lazyweb real-product screens and imagen drafts —
  the project is offline-first with an existing visual language; external
  mood research would flatten the covenant's specificity. No Layer B brand
  file: the app is its own brand system.

## Feeling

**"The held breath before the screen turns on."** Dark room, one glowing
rectangle, drifting dust, quiet type, a single invitation. Every token below
serves that phrase.

## Tokens

- Palette (color as weather):
  - `--room: #050403` page ground (the dark room)
  - `--paper: #e2d9c6` primary text (warm, aged)
  - `--paper-dim: #8d8272` secondary text
  - `--bezel: #e8dcc0` the machine's body (borders, highlights — used sparingly)
  - `--red: #a81020` corrupted glow (the CRT's default state)
  - `--red-dim: #3f0a0e` glow falloff / hairlines
  - `--pink: #ff8a8a` wanderlust accent (one moment only: prompt demo)
- Type architecture (no webfonts — offline-first; graceful fallbacks only):
  - Display: Georgia italic, large, generous letter-spacing
  - Prose: Georgia, 17–18px, line-height 1.75, measure 62ch max
  - Machine voice: `'Courier New', ui-monospace, monospace`, lowercase,
    letter-spacing 0.18em for labels; VT323 stack permitted for glyphs only
- Spacing: section padding 18vh top/bottom (breath); 1.5rem gutter rhythm.
- Radius: 2px (the machine is plastic and sharp; nothing is pill-shaped).

## Motion (restrained; all reduced-motion-safe)

1. Dust drift — full-viewport canvas, 60 particles, 8s+ lifetimes, opacity
   only. The room is never empty.
2. Screen flicker — the hero CRT's boot text breathes at ~7s period, 0.72→0.9
   opacity. Once per visitor's eyes, never strobing.
3. Reveal on scroll — IntersectionObserver, translateY(14px)→0 + opacity,
   700ms ease-out, once. Content arrives; it does not perform.
4. Prompt cycler — crossfade 500ms on click only (user agency), pink voice.

Reduced motion: dust static (single painted frame), flicker off, reveals
instant, cycler swaps text directly.

## Components

- `.crt` — CSS-only monitor: beige bezel, dark screen, red glow text, vent
  slits, LED. The hero object. No images.
- `.carvings-row` — the twelve inline-SVG glyphs (from `src/carvings.js`).
- `.prompt-demo` — mono, pink, `[ again ]` affordance; real engine outputs.
- `.cite` — citation lines, hanging indent, author bolded.
- Links: underlined, `--paper`; hover brightens to `#fff`; focus-visible
  outline 1px `--bezel` offset 3px.

## Accessibility constraints

- Contrast: `--paper` on `--room` ≥ 12:1; `--paper-dim` ≥ 5:1 at its sizes;
  `--pink`/`--red` text only at ≥ 16px mono over dark ground.
- Full keyboard reachability; skip link to content; semantic landmarks.
- `prefers-reduced-motion` honored for all four motions.
- The demo CTA is a real link (`/index.html`), obvious at every scroll depth
  in the nav — agency over protection.

## Accepted debt

- VT323 not self-hosted yet (deferred to Phase 5; presentation uses Courier
  stack so nothing depends on it).
- Dust canvas is non-interactive (decorative, aria-hidden); no canvas
  fallback below JS — content is fully readable without it.
