# LiberOS Improvements — Work Plan

**Generated:** 2026-09-06  
**Scope:** Visual language polish, accessibility, tutorial overhaul, persistent companion (Liberchat), terminology fixes

---

## 1. Terminology Fixes (High Priority)

### 1.1 Novus → Vacui
**Files to update:**
- `src/wanderlust-script.js` line 110: "Her soul lives in the **Novus** as the stonecutter" → "Her soul lives in the **Vacui** as the stonecutter"
- `data/citations.data.js` — search for "Novus" references
- `data/citations.json` — search for "Novus" references
- `src/features/sigil/PERSONA.md` — check for Novus references

### 1.2 Raison → Riason (Consistent Spelling)
**Files to update (15 files found):**
- `src/wanderlust-script.js` — all speaker values, dialogue references
- `src/wanderlust.js` — speaker logic, avatar colors, glitch triggers
- `src/features/themes/themes.js`
- `src/features/games/games.js`
- `src/features/sea/sea.js`
- `src/features/dreams/dreams.js`
- `src/features/cohort/cohort.js`
- `src/features/satchel/satchel.js`
- `src/features/sigil/sigil.js`
- `scripts/verify-fixes.mjs`
- `src/features/garden/garden.js`
- `src/features/methodology/methodology.js`
- `src/features/relation/relation.js`
- `styles/wanderlust.css` — class names like `.raison-glitch`
- `smoke.mjs`

**Specific changes:**
- Speaker value: `'raison'` → `'riason'`
- Display name: `'riason'` (lowercase) — already correct in some places
- CSS class: `.raison-glitch` → `.riason-glitch`
- Overlay ID: `#raison-overlay` → `#riason-overlay`
- All variable/function names referencing "raison"

---

## 2. Wanderlust Tutorial Overhaul (High Priority)

### 2.1 Slow Down Text Speed
**Current:** Summoning lines show for 1500ms each, dialogue has 150ms fade transitions
**Target:** ~2500ms per summoning line, ~300ms fade transitions, add configurable typing effect

**Files:**
- `src/wanderlust.js` — `showSummonLine()` timeout (1500 → 2500), `showLine()` timeout (150 → 300)
- Add optional typewriter effect for dialogue lines (configurable via `prefers-reduced-motion`)

### 2.2 Replace Raison Intrusion Segments with Method/Learn Tutorials
**Current Wanderlust script has TWO Raison intrusion segments (steps 7 and 8 in script):**
1. Step index 7 (0-based): Raison enters with "Oh good. The chat is open..."
2. Step index 8: Raison explains artifacts/relations

**New Design:** Replace both with interactive tutorial segments where Riason walks user through:
- **Segment 1 (replaces step 7):** "Learn" section walkthrough — Riason highlights the Learn drawer in dial, explains the reference shelf concept
- **Segment 2 (replaces step 8):** "Methodology" section walkthrough — Riason highlights Method in dial, explains the cycle

**Implementation:**
- Modify `src/wanderlust-script.js`: Replace the two Raison script entries with new interactive steps
- Modify `src/wanderlust.js`: Add support for "highlight" effect that draws circles/arrows over UI elements (dial options, etc.)
- Add CSS for tutorial highlights (pulsing rings, floating head animation)
- Riason's head "floats around screen" — animated avatar that moves to highlight targets

### 2.3 Interactive Tutorial Mechanics
- Riason avatar detaches from dialogue window, floats to target element
- Draws SVG circles/arrows over dial options, buttons
- User clicks "continue" after each highlight
- Respects `prefers-reduced-motion`

---

## 3. Liberchat — Persistent Context-Aware Companion (High Priority)

### 3.1 Concept
Replace the status-line ticker tape (cycling phrases every 12s) with:
- A small persistent icon (the "round circle of fate") in a fixed corner
- Clicking opens a compact dialogue window
- Persona switches based on current app/context:
  - Desktop → Wanderlust
  - Learn → The Mad Scribe
  - Methodology → Riason
  - Games → Whimsy Wow
  - Divination → Arcana
  - Sea → The Tide
  - Sigil → Mistress Physius
  - Garden → Ruby
  - Dreams → The Dreamer
  - Settings → Riason
- Provides relevant, persona-based tips, encouragement, context hints
- Persists across all screens (desktop + all feature pages)

### 3.2 Technical Implementation

**New Files:**
- `src/liberchat.js` — core logic (singleton, persists via module pattern)
- `src/features/liberchat/liberchat.css` — styling
- `data/personas-liberchat.data.js` — persona definitions for each context

**Modified Files:**
- `desktop.html` — remove status-line, add liberchat icon + window markup
- All feature HTML files — add liberchat markup (or inject via JS)
- `src/status-line.js` — DEPRECATE (keep for reference, disable interval)
- `styles/status-line.css` — DEPRECATE

**Liberchat API:**
```js
window.LiberChat = {
  open: () => void,
  close: () => void,
  setContext: (appId: string) => void,  // 'desktop' | 'learn' | 'methodology' | etc.
  speak: (text: string, options?: { persona?, duration? }) => void,
  suggest: (action: string, target: HTMLElement) => void  // highlights UI element
}
```

**Persona Data Structure:**
```js
{
  id: 'wanderlust',
  name: 'Wanderlust',
  avatar: 'radial-gradient(circle, #ffd86a..., #ff69b4..., #aa3a6a...)',
  accent: '#ff8a8a',
  lines: {
    idle: [...],
    hint: [...],
    encourage: [...],
    warn: [...]
  }
}
```

### 3.3 Visual Design
- **Icon:** 32px circle, phosphor glow, subtle pulse animation
- **Window:** 280x180px, positioned bottom-right (desktop) or adaptive
- **Window header:** Persona name + avatar + close button
- **Window body:** Single message line, auto-dismisses after 8s or on interaction
- **Accessibility:** `aria-live="polite"`, keyboard accessible, `prefers-reduced-motion`

---

## 4. Enter-to-Save (Medium Priority)

Add `keydown` handler for `Enter` key on all save prompts:
- `sigil.html` — save prompt (`#sigil-save-prompt`)
- `games.html` — save prompt (`#games-save-prompt`)
- `cohort.html` — seal button (already has Enter on input, but seal needs it)
- `methodology.html` — any save actions
- `abstract.html`, `divination.html`, `sea.html`, `garden.html`, `dreams.html` — check for save prompts

**Pattern:**
```js
prompt.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    keepBtn.click();
  }
});
```

---

## 5. Visual Language & Accessibility Improvements (Medium Priority)

### 5.1 Navigation Arrows
- **Dial arrows** (`#dial-left`, `#dial-right`): Increase size, add hover/focus glow, add `aria-label` improvements
- **Wanderlust reply buttons:** Add subtle arrow indicators for "progress" vs "branch" kinds
- **All modals:** Ensure close (×) and help (?) buttons have clear visual hierarchy

### 5.2 X and ? Buttons More Pronounced
**Current:** Small, low contrast in some contexts
**Target:**
- Minimum 32×32px touch target
- High contrast: `background: var(--btn-bg)`, `color: var(--btn-fg)`, `border: 2px solid var(--btn-border)`
- Focus ring: `outline: 2px solid var(--focus-ring)`, `outline-offset: 2px`
- Hover state: subtle scale + glow
- Consistent across all feature pages

### 5.3 Focus States & Keyboard Navigation
- All interactive elements: visible focus ring (WCAG 2.4.7)
- Tab order logical
- `prefers-reduced-motion` respected everywhere
- Color contrast ≥ 4.5:1 for text

### 5.4 Visual Polish
- Consistent spacing scale (CSS custom properties)
- Unified border radius scale
- Consistent phosphor glow system across personas
- Reduce visual noise: remove redundant decorative elements

---

## 6. TIPP Game Promotion (Medium Priority)

**Current:** TIPP is first booth in grid (index 0)
**Target:** Most prominent position

**Options:**
1. Move to bottom of grid (last row, centered)
2. Add "featured" badge/styling
3. Larger booth tile for TIPP
4. Auto-open TIPP on first Games visit

**Recommendation:** Option 1 + 2 — move to bottom center with "★ RECOMMENDED" badge

**Files:**
- `src/features/games/games.js` — reorder BOOTHS array, add `featured: true` flag
- `src/features/games/games.css` — featured booth styling

---

## 7. Cohort App Help Tooltips (Medium Priority)

**Current:** Help button (?) opens Riason modal with static text
**Target:** Contextual tooltips on specific UI elements

**Implementation:**
- Add `data-tooltip` attributes to key elements in `cohort.html`
- Create lightweight tooltip system in `cohort.js` or shared utility
- Tooltips appear on hover/focus, disappear on blur/click
- Content:
  - Seal button: "Requires 2+ exchanges. Seals conversation into your cohort constellation."
  - Input field: "Write an aspect of your unconscious — something others see that you don't."
  - Send button: "Speak your intention into the stone. E-Lizabeth will respond."
  - Transcript area: "Your sealed exchanges appear here as cohort artifacts."

---

## 8. Remove Cohort (E-Lizabeth) from Dial (Medium Priority)

**Current:** `VISITORS` array in `src/dial.js` includes:
```js
{ id: 'cohort', name: 'chat' },  // position 3 (0-indexed)
```

**Target:** Remove from VISITORS, leave blank placeholder at position #11 (index 10)

**New VISITORS order (13 items):**
1. sigil (cohort)
2. satchel
3. sea
4. abstract
5. games
6. divination
7. learn
8. methodology
9. garden
10. dreams
11. **(blank placeholder — "coming soon")**
12. themes
13. relation
14. trash

**Implementation:**
- Update `VISITORS` array in `src/dial.js`
- Add placeholder entry: `{ id: 'placeholder-11', name: '—', disabled: true }`
- Update `BITMAPS` and `MOTES` with empty/disabled styling
- Keep `cohort.html` and `src/features/cohort/` files intact (for future use)

---

## 9. Sigil/Cohort Terminology Consistency (Low Priority)

**Current state:**
- Dial shows "cohort" for `sigil` id
- Page is `sigil.html` with title "Mistress Physius's stone tablet"
- Feature folder: `src/features/sigil/`

**Action:** Update UI text only (no file renames):
- `sigil.html` titlebar: "The Casting Stone" → "The Cohort Stone" (or keep, just ensure "cohort" used in subtitle)
- `sigil.js`: Update any "sigil" references in user-facing text to "cohort" where appropriate
- `learn.js` card 07: Already "Cohort Work" — good
- `wanderlust-script.js`: Update "sigil" → "cohort" in dialogue where user-facing

---

## 10. Verification & Quality Gates

### 10.1 Automated Checks
- `npm run smoke` — Playwright smoke test (must pass)
- `npm run lint` or equivalent — no new lint errors
- LSP diagnostics clean on all modified files

### 10.2 Manual Verification
- [ ] Wanderlust tutorial runs with slower text, new Method/Learn segments
- [ ] Liberchat appears on desktop, switches persona per app
- [ ] Enter key saves in all prompts
- [ ] Dial navigation works, Cohort removed, placeholder at #11
- [ ] All "Novus" → "Vacui", "Raison" → "Riason"
- [ ] X/? buttons prominent, focus states visible
- [ ] TIPP game promoted in Games
- [ ] Cohort app tooltips work
- [ ] `prefers-reduced-motion` respected everywhere
- [ ] No console errors

### 10.3 Visual QA
- Screenshot each state: desktop, each feature page, liberchat open/closed
- Compare against design references (critique screenshots in repo root)
- Verify dark room CRT aesthetic maintained

---

## Implementation Order (Parallelizable Groups)

### Group A: Terminology (can run in parallel)
- [ ] 1.1 Novus → Vacui
- [ ] 1.2 Raison → Riason

### Group B: Wanderlust Tutorial (sequential)
- [ ] 2.1 Slow text speed
- [ ] 2.2 Replace Raison segments with Method/Learn tutorials
- [ ] 2.3 Interactive highlight system

### Group C: Liberchat (core new feature)
- [ ] 3.1 Create liberchat.js + CSS + persona data
- [ ] 3.2 Integrate into desktop.html + all feature pages
- [ ] 3.3 Deprecate status-line.js

### Group D: UI Polish (can run in parallel)
- [ ] 4 Enter-to-save
- [ ] 5 Visual/accessibility improvements
- [ ] 6 TIPP promotion
- [ ] 7 Cohort tooltips
- [ ] 8 Remove Cohort from dial
- [ ] 9 Terminology consistency

### Group E: Verification
- [ ] 10 Smoke test, lint, visual QA

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Liberchat breaks existing pages | Inject via single script include; feature-detect container |
| Wanderlust tutorial too complex | Build highlight system incrementally; test each segment |
| Persona switching logic errors | Unit-test `setContext()` with all 12 app IDs |
| Dial placeholder breaks navigation | Ensure `disabled` flag prevents click/cycle into placeholder |
| CSS regressions | Visual diff against critique screenshots |

---

## Files to Create
```
src/liberchat.js
src/features/liberchat/liberchat.css
data/personas-liberchat.data.js
```

## Files to Modify (Major)
```
src/wanderlust.js
src/wanderlust-script.js
src/dial.js
src/status-line.js (deprecate)
desktop.html
learn.html
methodology.html
games.html
sigil.html
cohort.html
abstract.html
divination.html
sea.html
garden.html
dreams.html
themes.html
settings.html
satchel.html
trash.html
```

## Files to Modify (Minor — terminology only)
```
data/citations.data.js
data/citations.json
src/features/sigil/PERSONA.md
src/features/themes/themes.js
src/features/games/games.js
src/features/sea/sea.js
src/features/dreams/dreams.js
src/features/satchel/satchel.js
src/features/garden/garden.js
src/features/methodology/methodology.js
src/features/relation/relation.js
styles/wanderlust.css
smoke.mjs
scripts/verify-fixes.mjs
```

---

## Success Criteria

1. **Zero "Novus" or "Raison" (misspelled) in codebase**
2. **Wanderlust tutorial completes with new Method/Learn segments, slower text**
3. **Liberchat visible on all pages, context-aware, accessible**
4. **Enter key saves in all prompts**
5. **Dial has 14 items with blank at #11, no Cohort chat**
6. **All X/? buttons ≥32px, visible focus rings, 4.5:1 contrast**
7. **TIPP game visually promoted in Games**
8. **Cohort app has contextual tooltips**
9. **`npm run smoke` passes, zero LSP errors, zero console errors**