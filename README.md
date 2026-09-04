# Liber.OS

A haunted CRT computer in a dark room. An offline art-therapy tool that
bridges perennial psychology, Jungian archetypes, the Noble Shadow, and DBT
skills through esoterica, fairy tale, and archetype.

You cast a **Cohort** — a drawn shadow-entity that anchors the centre of the
desktop — and develop a relationship with it: draw cards, cast hexagrams,
play the booths, confess to the wax, release to the deep. Every artifact can
declare a relation to your Cohort (`tower → protects → cohort`), and
relations feed an offline prompt engine that answers with evocative
reflective prompts. Artifacts accumulate; the Cohort becomes louder.

## Run

```bash
cd LiberOS
npm start          # serves on a local port; open the printed URL
```

The printed URL opens the **presentation site** (`/presentation/`) — the
thesis, the cast, the loop. The demo machine boots at `/index.html`
(linked as "enter the machine" throughout), or open `index.html` directly —
`file://` works (no build step, no framework, no network).

## Presentation site

`presentation/` is the outward-facing cover: DESIGN.md carries its token
contract (derived from the app covenant). `serve.cjs` redirects `/` there;
the demo stays at `/index.html`.

## Development

```bash
npm run smoke      # 25-step functional happy path
npm run shoot      # reference screenshots (1280×800)
node scripts/verify-fixes.mjs
node scripts/verify-data.mjs
node scripts/verify-prompt-engine.mjs
```

## Project map

```
SPEC.md                single source of truth (covenant, cast, architecture)
AGENTS.md              brief for coding agents
index/loading/desktop  boot ritual → the OS shell
*.html                 one page per app (12 persona apps + settings/about)
src/                   shell (state, dust, static, dial, wanderlust…)
  features/<app>/      each app: css + js + PERSONA.md (no shared CSS)
src/prompt-engine.js   deterministic offline prompt engine
data/                  extracted prose banks (tarot, hexagrams, exercises…)
docs/                  inspiration, decisions, audits, roadmap, specs
references/            visual ground-truth screenshots
scripts/               verification tooling
```

## Documentation discipline

`SPEC.md` wins over every other document. Narrative feeling:
`docs/inspiration.md`. Accepted decisions: `docs/decisions/`. Audit history:
`docs/audits/`. When SPEC and code disagree, it's a defect — file it.

## Provenance

Continued from the Liber Vacui 1.0 build (Desktop/LiberVacui1.0) and the
hand-written reference workbook (`archive/yep/LiberReference`), which remains
the prose source of record for exercises, education, and the case study.
