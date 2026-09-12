# LiberOS

LiberOS is a static HTML, CSS, JavaScript, and Tauri desktop project.

## Quick start

1. Install dependencies:
   `npm install`
2. Start the local static server:
   `npm run start`
3. Open the project in VS Code and browse the workspace.

## Common commands

- `npm run start` — static local server on a free port
- `npm run app:dist` — assemble `dist/` from the source tree
- `npm run smoke` — smoke test script
- `node scripts/verify-fixes.mjs` — regression verification
- `npm run app:build` — Tauri release build

## Project map

- `src/` — shared JavaScript and room wiring
- `styles/` — shared styling
- `data/` — JSON and JavaScript data objects
- `src-tauri/` — Tauri desktop wrapper
- `scripts/` — repository verification and build scripts
- `assets/`, `fonts/`, `screenshots/` — static resources

## Release workflow

1. Edit on the `main` branch.
2. Run `npm run smoke` and `node scripts/verify-fixes.mjs`.
3. Run `npm run app:dist` and `npm run app:build`.
4. Tag the release with `git tag vX.Y.Z` and push `git push origin main --tags`.
5. Attach Windows and macOS artifacts from CI or local Tauri bundles.

## Secrets

Never commit real API keys or OpenCode Zen account keys. Use a local ignored `.env.local` file or shell environment variables only.
