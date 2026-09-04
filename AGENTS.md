# LiberOS — AGENTS

> Brief for any agent (builder, artisan, critic) working in this folder.

## Read first (in order)

1. `SPEC.md` — the covenant, the cast, the architecture. **Single source of
   truth.** Older covenant/plan documents in the pre-repo folders are
   superseded and must not be followed.
2. `docs/inspiration.md` — the feeling. Read before writing any copy or
   styling.
3. `docs/decisions/` — accepted decisions (e.g. 0001: the drawn entity is
   the **Cohort**; the word "sigil" is retired from user-facing copy).
4. `docs/audits/` — past audit findings; do not re-introduce fixed defects.

## What this is

A haunted, ritualistic virtual computer that lives inside a dark room. A
beige CRT monitor is a physical object; the screen is the medium. Twelve
archetype-travellers each built one app, each a distinct design universe.
The corrupted (red, faded, static) state is the default, not the off-state.

## Hard rules (enforced; violations are defects)

1. The viewport is the room. `<html>`/`<body>` are `#000000`. The monitor
   never fills the screen.
2. The bezel is FAT and beige `#e8dcc0`. Twelve carvings; active traveller's
   carving glows.
3. **No shared CSS across personas.** Each `src/features/<app>/<app>.css` is
   standalone — no variables, no imports, no shared utility classes.
4. **No build step, no bundler, no framework, no npm dependencies.** Plain
   HTML/CSS/JS. Every script via `<script src="">`; `file://` must work. No
   `fetch()` for local data — use `.data.js` wrappers assigning
   `window.LIBER_DATA` (see `src/prompt-engine.js`).
5. **No placeholder text.** `[copy pending]` only if nothing exists. No
   developer vocabulary (`input:`, `output:`, `state.*`) in user-facing copy.
6. **Agency over protection.** Nothing nags, traps, or hides the exit.
7. Match the code style of the file you edit (the codebase mixes `var`/
   `const` deliberately per file). IIFEs, auto-init on DOMContentLoaded,
   register on `window.Liber.<x>`.
8. The drawn entity is the **Cohort** in all copy (runtime keys stay
   `sigils` until D0001's migration — do not rename keys ad hoc).

## Verification (run before reporting done)

```
npm run smoke                        # must stay green (25 steps)
node scripts/verify-fixes.mjs        # audit regression checks
node scripts/verify-data.mjs         # data integrity
node scripts/verify-prompt-engine.mjs
```

Playwright screenshots at 1280×800 (`npm run shoot`) for visual changes;
compare against `references/*.png`. If the build disagrees with a reference,
fix the build, not the reference.

## Conventions

- Dev server: `npm start` (port picked by `serve.cjs`; avoid 8000–8002).
- No git commands from agents unless the task explicitly says so; the lead
  commits.
- Data prose lives in `data/*.json` (archive) and mirrors into `.data.js`
  runtime wrappers. Keep the author's prose voice intact when extracting.
- New copy: terse, lowercase-leaning, haunted machine voice. No exclamation
  marks outside Wanderlust's theatrics.

## When in doubt

Re-read `SPEC.md`. If SPEC and reality disagree, report it — do not silently
pick a side.
