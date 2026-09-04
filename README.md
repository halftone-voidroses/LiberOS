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

## The double-clickable app (Tauri wrapper)

LiberOS also ships as a native macOS app built with Tauri: the system
WebKit webview wrapping the exact same static surface — no visual rebuild,
no bundler for the app itself. The bundle embeds the assets, so once built
it runs fully offline: no server, no browser, double-click and the room
boots.

Build it:

```bash
# once — the Rust toolchain (~1 min) + macOS build tools
curl https://sh.rustup.rs -sSf | sh -s -- -y --profile minimal
xcode-select --install          # if the Command Line Tools aren't there yet

cd LiberOS
npm run app:build
```

The finished app lands at:

- `src-tauri/target/release/bundle/macos/LiberOS.app` — double-click to run
- `src-tauri/target/release/bundle/dmg/LiberOS_1.0.0_aarch64.dmg` — for
  dragging into Applications

How it works:

- `npm run app:build` first assembles `dist/` (`scripts/app-dist.cjs`): a
  byte-identical, sha256-verified copy of the frozen surface (every root
  page + `src/`, `styles/`, `data/`, `fonts/`) — then `tauri build` embeds
  it verbatim. `presentation/` stays web-only. A direct reference to the
  repo root is not used because Tauri embeds *everything* under its assets
  directory (`node_modules`, `.git`, build output included).
- The window is titled **Liber.OS**, 1280×860 (min 1100×700), centered,
  normal window chrome — the room is the chrome. The icon is the bezel
  with the deep-red boot rectangle (`src-tauri/icons/icon.svg`).
- State is unchanged: `src/state.js` writes `localStorage` under
  `tauri://localhost`, held in the WebKit persistent store for the app
  (`os.liber.desktop`). Artifacts, relations, and tutorial completion
  survive quit/relaunch — verified on this build.
- The wrapper adds nothing to the surface: no IPC commands, no plugins,
  no capability grants. `npm start` and `file://` behave exactly as
  before; the wrapper is additive.
- Live-reload development inside the wrapper: `npm run app:dev` (same
  dist copy, debug build with devtools).

The first build compiles the Rust side (~2 min on Apple silicon); later
builds are incremental.


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
