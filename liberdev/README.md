# LiberDev Workspace Map

This folder is the local developer workspace for LiberOS.

## Purpose

- Keep all local source, screenshots, documentation, and release staging outside the tracked project surface.
- Provide a clear, human-readable path for editing and preparing release artifacts.

## Folder map

- `source/` — copy or mirror the LiberOS source surface you are actively editing.
- `docs/` — design notes, release notes, project docs, and contributor notes.
- `screenshots/` — screenshots and reference captures.
- `release/` — staging area for package-ready artifacts before pushing to GitHub.

## Release path

1. Run project verification locally.
2. Build the Tauri app or static bundle.
3. Copy the release files into `liberdev/release/`.
4. Push the Git repository.
5. Attach release artifacts from the same staging folder.
