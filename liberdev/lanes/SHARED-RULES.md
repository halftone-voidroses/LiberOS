# SHARED RULES — all three lanes, read before your first edit

Three agents work the same tree in separate windows, no communication. These rules make that
safe. Your lane brief (AGENT-A / AGENT-B / AGENT-C, same folder) lists the files you own.
Anything not owned by you is read-only for you.

## 1. Baseline first
Before your first edit, run the full gate and confirm it is green (it was at handoff):
```
cd LiberOS
for s in "smoke.mjs" "scripts/verify-fixes.mjs" "scripts/verify-crt-room.mjs" \
         "scripts/verify-tree.mjs" "scripts/verify-powder.mjs" "scripts/verify-data.mjs" \
         "scripts/verify-affinity.mjs" "scripts/verify-gamification.mjs" \
         "scripts/verify-trash.mjs" "scripts/verify-rainy.mjs" "scripts/verify-room-hooks.mjs"; do
  printf '%-30s ' "$(basename $s)"; node "$s" 2>&1 | tail -1
done
```
If the baseline is already broken by someone else, do not fix their lane — note it in your
final report and keep your own work green against the last-known-good state.

## 2. Ownership matrix (the collision surface)

| Area | A | B | C |
| --- | --- | --- | --- |
| `src/features/crt-room/crt-room.js` | **owns** | read | read |
| `src/features/crt-room/crt-room.css` | owns (non-rainy) | read | **appends** a marked rainy-material block only |
| `src/features/games/**` | **owns** | read | read |
| `src/features/dreams/**` | **owns** | read | read |
| `src/features/learn/**` | read | **owns** | read |
| `src/features/satchel/**` | read | ** owns** | read |
| `src/features/themes/**` | read | read | **owns** |
| `src/constellation.js` | read | **owns** | read |
| `src/dial.js` | read | owns (icon stamping; thimble block byte-frozen) | read |
| `styles/shadow.css`, `src/shadow.js`, `src/rainy.js` | read | read | **owns** |
| `styles/machine.css`, `styles/room.css`, `styles/bezel.css` | read | read | **owns** |
| `src/cutscene.js`, `src/status-line.js`, `src/whispers.js`, `src/faq.js` | read | read | **owns** |
| `src/state.js` | appends new keys at END of DEFAULT only | read-only | read-only |
| `data/personas.data.js` | appends barker lines in games blocks only | read-only | read-only |
| `liberdev/room-hooks.md` | **owns** (adds rows) | read | read |
| `scripts/verify-room-hooks.mjs` | **owns** | read | read |
| `desktop.html` / `index.html` / other shells | only if strictly needed, minimal | only the constellation host element | owns the shell/homescreen markup |
| new verify scripts | `verify-promenade.mjs`, `verify-dreams-presentation.mjs` | `verify-constellation.mjs`, `verify-desks.mjs` | `verify-439.mjs` |

## 3. State keys (the one true shared surface)
`s.shadowOn`, `s.crt`, `s.tree`, `s.dreams`, `s.games`, `s.bests`, `s.relations`, `s.buddy`,
`s.satchel`, `s.visited`, `s.sessionStart`, `s.theme`, `s.graveyard`, `s.sea`, `s.seaTide` all
exist. Read whatever you need. Write ONLY your own feature's keys:
- A writes: nothing new to state (hooks read); thimble retirement must NOT remove `s.thimble`
  reads elsewhere (garden/tree.js migrates from it).
- B writes: nothing.
- C writes: nothing new (shadowOn already wired).
If you genuinely need a new persistent key, it goes in lane A's append-only block at the end
of DEFAULT with a `// lane <X>: <purpose>` comment — one line of justification minimum.

## 4. Conflict protocol
- Never reformat, re-sort, or "clean up" a file you do not own — even whitespace. Merge
  conflicts are caused by tidiness, not malice.
- Appends to shared files go at the END, under a marker comment naming your lane.
- If two lanes must touch the same line (should not happen — if it does, re-read the matrix),
  the lane that owns the file wins; the other wraps its need behind the owner's structure.
- Do not edit another lane's verify scripts. Do not weaken an assertion to pass your change —
  fix the change, or (if the assertion describes another lane's feature) leave it red and
  report it.

## 5. Done means
- Your lane's brief's verify list is green, including the new scripts you wrote.
- `git status` shows only files from your owned list (plus your new verify scripts).
- You leave a short report at `liberdev/lanes/REPORT-<letter>.md`: what you built, what you
  verified, what you deliberately left.
- Do NOT commit unless your operator tells you to; leave the tree dirty for review.
