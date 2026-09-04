# SPEC — Liber.OS single source of truth

> This file supersedes every earlier covenant/plan document
> (`CRITIQUES.md`, `PLAN.md`, `PLAN-CHANGES.md`, `currentliberplans.md` — all
> left behind in the pre-repo folders). If a doc disagrees with this file,
> this file wins. Narrative feeling lives in `docs/inspiration.md`. Decisions
> live in `docs/decisions/`. Audit history lives in `docs/audits/`.

## What Liber.OS is

An offline art-therapy tool shaped as a haunted beige CRT computer in a dark
room. The screen is a medium, not an interface. The user casts a **Cohort**
(their shadow-entity, drawn once) and develops a relationship with it by
making artifacts (tarot draws, I Ching casts, DBT games, confessions,
releases) and declaring how each artifact relates to the Cohort. Relations
feed an offline, deterministic prompt engine that returns evocative
reflective prompts. The design bridges perennial/eastern psychology, Jungian
archetypes, the Noble Shadow, and DBT skills through esoterica and fairy
tale — with research-backed content cited by the machine itself.

## Covenant (the hard rules)

1. **The viewport is the room.** `#000000` html/body. The monitor is an
   object in the room; it never fills the screen.
2. **The bezel is FAT and beige** `#e8dcc0` — chunky plastic, vent slits,
   brass ring, recessed CRT.
3. **Twelve carvings** in arrival order; the active traveller's carving glows.
4. **No shared CSS across personas.** Each app is its own design universe.
   Each `src/features/<app>/<app>.css` is standalone — no variables, imports,
   or utility classes shared between personas.
5. **The corrupted version is the default** (red tint, faded titles, static,
   dust).
6. **No build step, no bundler, no framework.** Plain HTML/CSS/JS, loaded via
   `<script src="">` so `file://` works. No `fetch()` for local data.
7. **No placeholder text.** `[copy pending]` only when nothing is written.
   Leaked developer vocabulary (`input:`, `output:`, `state.*`) in user-facing
   copy is a defect.
8. **Agency over protection.** Nothing nags, traps, or hides the exit.

## The cast

| Entity | Role |
|---|---|
| **Wanderlust** | Summoned guide. 'Pataphysical, dramatic, colour-flickers through her old names (Fate/Chance/Destiny/Wheel/Samsara) |
| **Raison** | Tutorial traveller, trapped for dissecting the Vacui in bad faith. Dry, UX-obsessed. Explains mechanics in-character |
| **Mistress Physius** | First traveller. Hermetic stonecutter. Established the casting tradition |
| **The twelve travellers** | Each built one app; each left a carving on the bezel |

Full narrative source: `docs/inspiration.md` (locked beats and mechanical
truths are defined there).

## The twelve apps

| App | Persona | Voice | Visual |
|---|---|---|---|
| sigil (→ Cohort, D0001) | mistress physius | pious, hermetic | stone tablet, charcoal, copper |
| satchel | the librarian | archival | brass, sepia, index cards |
| sea | vanir | oceanic, slow | waterline, blue-green |
| cohort | e-lizabeth | gothic, ancestral | wax, flames, constellation of those you carry |
| abstract | entity404 | terse BBS | green-on-black void, hatched eggs |
| games | whimsy wow | theatrical barker | marquee bulbs, reds + creams |
| divination | arcana | chalk on felt | white chalk on deep red velvet |
| learn | the mad scribe | workbook | index cards, ink stamps |
| methodology | raison | methodical | folio, wax seal |
| themes | iris mappa | cartographic | pigment tiles, swatch grid |
| relation | e-lizabeth | linked | iron rings, chain, monogram |
| trash | ravaging pete | gravel | die-cut rubble, Artifact Graveyard |

## Architecture

```
window.Liber
  state        get(), set(), on(), reset(), addArtifact(), bindRelation(),
               unbindRelation(), releaseArtifact(), replaceSigil()
  prompts      compose(), generate(), onPrompt()   [src/prompt-engine.js]
  Wanderlust   open(), close(), restart(), triggerShake(), triggerFlicker()
```

- `src/state.js` — localStorage pub/sub, key `liber_vacui_v1`.
- `src/prompt-engine.js` — deterministic template engine. Offline, seeded
  PRNG, verb-gated templates from `data/prompt-templates.data.js`.
- `src/features/<app>/` — self-contained: `<app>.html` fragment, `.css`,
  `.js`, `PERSONA.md`.
- `data/*.json` — extracted prose banks (tarot, hexagrams, exercises,
  glossary, citations). JSON is the archive format; `.data.js` wrappers are
  the runtime source (file://-safe).
- Root pages: `index` (boot) → `loading` → `desktop` (the OS shell), plus
  one page per app.

## Naming

- Folder/repo: `LiberOS`. In-app brand: "Liber.OS" or "Liber Vacui".
- The drawn entity is the **Cohort** in all user-facing copy (see
  `docs/decisions/0001-cohort-ontology.md`).

## Verification protocol

```
npm run smoke          # 25-step happy path, must stay green
node scripts/verify-fixes.mjs   # audit-fix regression checks
node scripts/verify-data.mjs    # data bank integrity
node scripts/verify-prompt-engine.mjs
npm run shoot          # 4 reference screenshots into screenshots/
```

Playwright at 1280×800 is the project's verification size. If a build
disagrees with `references/*.png`, **fix the build, not the reference**.

## Status snapshot (2026-09-04)

- Baseline imported from LiberVacui1.0; git history starts here.
- Audit `docs/audits/CRITIQUE-2026-09-03.md` criticals C1–C5 and majors
  M1–M4 being fixed (branch of record: main, fix commits cite audit ids).
- Data banks + prompt engine landing under `data/` and `src/prompt-engine.js`.
- Known deferred (audit minors): boot screen spec drift, status-line
  collision at 1280×800, sigil action-bar bronze→slate, marquee chase bulbs,
  persona name spelling drift, VT323 self-hosting for full offline font.
