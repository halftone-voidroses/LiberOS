# 0002 — scanlines are removed

Date: 2026-09-04 · Plan: docs/plans/2026-09-04-full-pass.md §2

All horizontal CRT scanline overlays are removed from the shell:

- `styles/machine.css` — the two-layer screen scanline block.
- `styles/room.css` — the `body::after` scanline overlay and its
  `--scan-alpha` / `--scan-line-px` custom properties.
- `src/features/abstract/abstract.css` — `.abstract-void-scanlines`
  (element and rule).
- `styles/shadow.css` — the `.shadow-on .screen::after` scanline layer.

The CRT feel is carried by what stays: phosphor glow/bloom, vignette,
static + dust canvases, curvature shading, and time-dependent flicker.
The corrupted-default covenant rule is unaffected.
