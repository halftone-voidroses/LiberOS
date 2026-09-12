# LiberOS repository instructions

## Project shape

LiberOS is an offline-first static HTML/CSS/JavaScript application with a Tauri
desktop wrapper. Do not introduce a framework or network dependency unless the
user explicitly requests it.

## Working conventions

- Keep feature code in the existing `src/` and `src/features/` layout.
- Keep generated output, screenshots, notes, and release staging in `liberdev/`.
- Do not commit `.env.local`, provider keys, certificates, or signing material.
- Preserve the haunted CRT visual language and existing accessibility behavior.
- Prefer existing scripts and helpers over new dependencies.

## Validation

Use the smallest relevant existing command:

```sh
node scripts/verify-data.mjs
node scripts/verify-prompt-engine.mjs
node scripts/verify-fixes.mjs
npm run smoke
npm run app:build
```

For frontend changes, run the focused verifier and smoke test when practical.
For routing changes, run `npm run route:model -- "describe the task"` and verify
that no secret values appear in output.

## Routing

Use `config/model-routing.json`:

- `frontend-dev-design` for HTML/CSS/JavaScript and visual work.
- `debug-and-verification` for tests, diagnostics, and regressions.
- `docs-and-garden` for documentation and prose.

Use `.github/agents/` and `.github/skills/` for the matching specialist workflow.
