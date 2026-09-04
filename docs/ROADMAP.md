# Roadmap

Living document. Status as of 2026-09-04.

## Phase 0 — Permanence (done this session)

- [x] Fresh repo `Desktop/LiberOS`, git history starts at baseline import.
- [x] Pruned: one-off scripts, generated screenshots, superseded docs.
- [x] `SPEC.md` is the single source of truth; `AGENTS.md` for agents;
      `docs/audits/` holds the 2026-09-03 audit.
- [x] Baseline committed.

## Phase 1 — The core loop (in progress)

- [x] Decision 0001: cohort ontology (sigil → cohort rename strategy).
- [ ] Audit fixes C1–C5, M1–M4 + favicon + theme-class bug (builder running).
- [ ] Data banks extracted from LiberReference: tarot, hexagrams, exercises,
      glossary, citations (builder running).
- [ ] Prompt engine: deterministic, offline, verb-gated (builder running).
- [ ] Prompt surface: render `liber:prompt` events on the desktop shell
      (one-line emergent prompt element, styled per shell, not per persona).
- [ ] Retire "sigil" from user-facing copy (D0001), keep runtime keys.

## Phase 2 — Pull (gamification)

- [ ] Implement `docs/gamification.md` in order: session arc → return
      rewards (patina) → competence visibility → "cohort becomes louder"
      diegetic levels → ambient variable prompts.
- [ ] Sea ritual positioned as the session-ender (needs C1 fix landed).

## Phase 3 — Offline app wrapper

- [ ] Tauri scaffold (`src-tauri/`) wrapping the existing static files —
      no visual rebuild, system webview, ~5MB binary.
- [ ] App icon + window chrome matching the bezel aesthetic.
- [ ] Verify `file://`-equivalent behavior under `tauri://` (state.js
      localStorage semantics, `.data.js` loaders).
- [ ] Do NOT revive the Swift/EsotericSuite path (abandoned skeleton; a
      native port means rebuilding the visual language).

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
