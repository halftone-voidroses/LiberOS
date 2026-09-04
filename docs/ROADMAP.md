# Roadmap

Living document. Status as of 2026-09-04.

## Phase 0 — Permanence (done this session)

- [x] Fresh repo `Desktop/LiberOS`, git history starts at baseline import.
- [x] Pruned: one-off scripts, generated screenshots, superseded docs.
- [x] `SPEC.md` is the single source of truth; `AGENTS.md` for agents;
      `docs/audits/` holds the 2026-09-03 audit.
- [x] Baseline committed.

## Phase 1 — The core loop (done this session)

- [x] Decision 0001: cohort ontology (sigil → cohort rename strategy).
- [x] Audit fixes C1–C5, M1–M4 + favicon + theme-class bug
      (`node scripts/verify-fixes.mjs` green; root cause found for M3:
      `castEl.textContent` set on the function — missing call parens).
- [x] Data banks extracted: tarot (22), hexagrams (64), exercises (19),
      glossary (16), citations (21) — `node scripts/verify-data.mjs` green.
- [x] Prompt engine: deterministic, offline, verb-family gated
      (`node scripts/verify-prompt-engine.mjs` green, 9 checks).
- [x] Prompt surface: `.prompt-line` on the desktop shell renders
      `liber:prompt` events + the latest persisted prompt on boot.
- [ ] Retire "sigil" from user-facing copy (D0001), keep runtime keys.

## Phase 1.5 — Presentation site (done this session)

- [x] `presentation/` — single-page site: thesis, three pillars, the loop
      (with real prompt-engine outputs), the cast, twelve carvings (real
      glyphs), the twelve apps, citations, safety + privacy notes.
- [x] `serve.cjs`: `/` → presentation; demo remains at `/index.html`.
- [x] `smoke.mjs` now spawns its own server (was hardcoding 8030 — a stale
      server from the old folder was masking real regressions; caught one:
      the inline-script half of the inert migration).
- [x] Visual QA at 1280/768/375 via screenshots; nav chrome + nowrap fixes.

## Phase 2 — Pull (gamification)

- [ ] Implement `docs/gamification.md` in order: session arc → return
      rewards (patina) → competence visibility → "cohort becomes louder"
      diegetic levels → ambient variable prompts.
- [x] Sea ritual implemented (C1) — positioned as the session-ender.

## Phase 3 — Offline app wrapper (done 2026-09-04, WS8)

- [x] Tauri scaffold (`src-tauri/`) wrapping the existing static files —
      no visual rebuild, system webview, ~5MB binary (`npm run app:build`
      → 5.0M `LiberOS.app` + 2.4M dmg; surface embedded from `dist/`,
      sha256-verified byte-identical copy).
- [x] App icon + window chrome matching the bezel aesthetic (bezel/boot-
      rectangle SVG → icns + png set; window "Liber.OS" 1280×860,
      min 1100×700, centered).
- [x] Verify `file://`-equivalent behavior under `tauri://` (zero `fetch(`
      in `src/` + `data/`; localStorage persisted across app restart —
      tutorial completion read back after relaunch, no tutorial replay;
      smoke suite 25 steps green on the web path).
- [ ] Do NOT revive the Swift/EsotericSuite path (abandoned skeleton; a
      native port means rebuilding the visual language). Stands — no
      native port.

## Phase 4 — The citations traveller

- [ ] Surface `data/citations.json` in Learn/Method with footnoted claims
      (Raison or a new Archivist persona; folio visual language).
- [ ] Distinguish machine-mythology voice (Wanderlust) from research voice.
- [ ] Mark the author's own theories as thesis, not established finding.

## Phase 5 — Polish backlog (audit minors, deferred)

- [ ] Boot screen spec drift (black void + deep-red rectangle, ENTER).
- [ ] Status-line collision at 1280×800.
- [ ] Sigil action-bar bronze → slate (full monochrome stone).
- [ ] Marquee bulbs chase (J.1) + house edge line (J.2).
- [ ] Persona name spelling drift (raison/Riason/Rason).
- [ ] Self-host VT323 woff2 in `fonts/` for full offline fidelity.
- [ ] Full state-key migration per D0001 (versioned storage key).
- [ ] Intensity gating + crisis surface per `docs/safety.md`.
