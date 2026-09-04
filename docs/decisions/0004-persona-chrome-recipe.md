# D0004 — Per-persona chrome recipe (bevel buttons, material tokens, title bars)

> Plan 2026-09-04 §2 amendment record + implementation recipe. WS3 landed the
> dial + title bars; WS4 (cursors app-wide, pressed-bevel in every app,
> sound) implements the SAME recipes per app with that app's palette. This
> document is the pattern source so WS4 stays consistent.

## 1. The covenant holds: no shared CSS

Each `src/features/<app>/<app>.css` remains standalone — no imports, no
variables, no shared utility classes (SPEC.md covenant 4). The recipes below
are *documented once and implemented per app*: the same geometry values,
hand-copied into each app's own palette. Dial buttons are the one exception
location: `styles/dial.css` is **shell** CSS (it styles the OS launcher, not
an app), so all 12 persona materials live there as per-button rules.

## 2. Material tokens live in `data/personas.data.js`

`window.LIBER_DATA.personas[id]` per traveller:

| field | purpose |
|---|---|
| `id` | app/dial key, matches `data-id` on the dial button |
| `name` | traveller's name (lowercase) |
| `opinion` | one line, in-voice, ≤ 80 chars — surfaced on hover/focus above the dial |
| `accent` | dominant hue of that app's CSS (focus outlines, opinion name) |
| `cursor` | full CSS `cursor` value: inline SVG data-URI + hotspot + fallback |
| `material` | human-readable descriptor (plan §3 register wording) |

Rules: no `fetch()`, no network; the data-URI SVGs use `%23`-encoded hex,
single quotes inside, and always carry a hotspot + `, auto` fallback. Voices
are sourced from each app's `PERSONA.md`. Note: `cohort/PERSONA.md` carries a
stale header ("Ravaging Pete") — the plan §3 register (binding) and SPEC.md
both assign **e-lizabeth** to cohort; the register wins.

## 3. Bevel-button recipe (the pressed-3D-keycap feel)

Base geometry (from `styles/dial.css`, reused per app in WS4):

```css
border: 2px solid <dark-edge>;
border-radius: 2px;
box-shadow:
  inset 0 1px 0 <top-light>,        /* 1px lip of light, ~0.2–0.8 alpha */
  inset 0 -2px 0 <bottom-dark>,     /* 2px shadow lip */
  0 2px 0 <material-edge-color>,    /* the "side" of the keycap */
  0 3px 4px rgba(0, 0, 0, 0.5);     /* drop onto the surface */
transition: transform 0.12s, filter 0.12s;
```

Pressed state — the button sinks into its own side edge:

```css
:active {
  transform: translateY(1px or 2px);   /* compose with existing transforms */
  filter: brightness(0.92);
}
```

Large/active variants keep the recipe but scale the lips (top light 2px,
side 4px) and add a persona-coloured bloom: `0 0 18px <accent at 0.3–0.5>`.
Focus is never default: `:focus-visible { outline: 2px solid <accent>;
outline-offset: 2px; }`. Cohort's active button alone animates (faint flame
flicker via `box-shadow` keyframes) — gated by `@media
(prefers-reduced-motion: reduce)`.

## 4. Material painting (how a button becomes "their stuff")

Per-button block in `styles/dial.css` — `.dial-option[data-id='<id>']`:

1. **Background** = 2–6 layers, top to bottom: highlight/sheen gradients →
   texture (repeating hairlines for stone grain, cross-hatch for felt, plank
   stripes for marquee wood, ruled lines for index card, grout grid + 18px
   conic checker for pigment tiles, speckle dots for rubble) → base
   material gradient. Gradients only — no images, no network.
2. **Shape accent** via `::before` (one per button): copper inlay notch
   (sigil), brass clasp stud (satchel), foam waterline (sea), wax seal drop
   (cohort), phosphor pixels (abstract), bulb studs (games), chalk-dusted
   rim (divination), ink-stamped box (learn), rubric edge + wax seal
   (methodology), folded pigment corner (themes), iron ring + gold link
   (relation), die-cut bite (trash, via `clip-path` on the pseudo).
3. **Label in the app's own type voice**: the button inherits that app's
   `font-family` and tracking from its CSS (Times small-caps for
   physius, EB Garamond for librarian/raison/e-lizabeth, Courier for
   entity404, Times 900 italic for whimsy wow, VT323 for iris).
   Caveat: on the *active* option the per-persona `::before` is replaced by
   the ‹ › chevrons (pre-existing pseudo-element use) — accepted trade.
4. `cursor` is applied from the data file by `src/dial.js`
   (`btn.style.cursor`), skipped for the crossed (locked) sigil option.

## 5. Window title bar pattern (implemented 12×, never shared)

Per app page:

```html
<div class="screen-stage">
  <header class="<app>-titlebar">
    <span class="<app>-titlebar-name">…authored title…</span>
    <span class="<app>-titlebar-sub">…voice line naming the traveller…</span>
    <button class="<app>-help" …>?</button>   <!-- moved from the app root -->
    <button class="<app>-exit" …>×</button>
  </header>
  <div class="<app>-app" data-state="<app>"> … </div>
```

Per app stylesheet (this app's palette only):

- `.X-titlebar`: absolute, top 0, height 36px (trash 40px — Pete digs
  chunkier), z-index 8, bevelled material background, textured bottom border,
  `padding: 0 76px 0 14px` so the text clears the keycaps, sub ellipsises.
- Text floors (D0003): name 1.05rem, sub 1rem — both ≥ 16px informational.
- The existing `?` / `×` keycaps are re-parented INTO the header (IDs
  unchanged, behaviour untouched) and re-anchored:
  `.X-titlebar .X-help { top: 50%; right: 36px; transform: translateY(-50%); }`,
  exit at `right: 8px`; `:active` composes with the translateY.
- The app makes room with one line: `.X-app { top: 36px; }` — this
  intentionally overrides the shell's `[data-state] { inset: 0 }`
  (machine.css) from the app's own sheet. Nothing else in the app moves.

Title texts are authored in the traveller's hand (workbook header for learn,
marquee act for games, BBS prompt for abstract, ledger for satchel, etc.) —
see the `*-titlebar` markup in each page.

## 6. Status bar

`.status-line` (styles/status-line.css) is now a bevelled plate: bevel
recipe of §3, 14px text floor kept, bottom anchored at `calc(26% + 6px)` —
above the dial band (WS1 collision fix intact) and below the settings cog
(bottom 26% + 40px).

## 7. Verification evidence (WS3)

`npm run smoke` (25 steps), `scripts/verify-fixes.mjs`,
`scripts/verify-data.mjs`, `npm run shoot`, plus WS3 screenshots: dial in 3
positions + 12 title bars → `screenshots/ws3-*.png`.
