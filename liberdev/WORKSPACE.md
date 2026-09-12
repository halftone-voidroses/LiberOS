# LiberDev Workspace Guide

## Open here

Open the repository root in VS Code. The workspace plan is intentionally simple:

- Source project files stay in the main repository directories.
- Global local editing artifacts stay in `liberdev/`.
- Release staging stays in `liberdev/release/`.

## Local commands

```sh
npm run start
npm run smoke
node scripts/verify-fixes.mjs
npm run app:dist
npm run app:build
```

## Recommended release pattern

```sh
npm run app:dist
npm run app:build
git add .
git commit -m "LiberOS release"
git push origin main
git tag vX.Y.Z
git push origin --tags
```

## Notes

- Do not commit `.env.local` or secret keys.
- Keep screenshots, notes, and generated package files inside `liberdev/`.
- Keep release artifacts in `liberdev/release/`.
