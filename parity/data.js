// parity/data.js — the 39-critique coverage matrix
// Source: CRITIQUES.md in the project root. This file is a structured
// copy used to drive the parity snapshot UI.

export const SECTIONS = [
  {
    id: 'A', title: 'A. The Machine', items: [
      { id: 'A.1', text: 'CRT with fat beige bezel, ventilation slits, brass ring, recessed screen', status: 'done',    note: 'machine.css' },
      { id: 'A.2', text: 'Twelve carvings etched around the bezel in arrival order',                 status: 'done',    note: 'bezel.css + carvings.js' },
      { id: 'A.3', text: 'Power LED (red, pulses)',                                                  status: 'done',    note: 'machine.css' },
      { id: 'A.4', text: 'LIBER plate (metallic lower-bezel label)',                                 status: 'done',    note: 'machine.css' },
      { id: 'A.5', text: 'Base/stand under the monitor',                                             status: 'done',    note: 'machine.css' },
    ],
  },
  {
    id: 'B', title: 'B. The Dial & Status', items: [
      { id: 'B.1', text: 'Chunky white dial with the active label large in the center',              status: 'done',    note: 'dial.css + dial.js' },
      { id: 'B.2', text: 'Arrows on each side of the active label to cycle',                        status: 'done',    note: 'dial.css + dial.js' },
      { id: 'B.3', text: 'Radial clock in the top-right of the screen',                             status: 'done',    note: 'clock.css + clock.js' },
      { id: 'B.4', text: 'Status line at the bottom, no box, just text',                            status: 'done',    note: 'status-line.css + status-line.js' },
      { id: 'B.5', text: 'Brass-knob aesthetic for the dial',                                       status: 'done',    note: 'dial.css: gold gradient + inset highlight' },
    ],
  },
  {
    id: 'C', title: 'C. Boot Sequence', items: [
      { id: 'C.1', text: 'Boot screen: deep red, "Thank you for choosing / Liber.OS / [ start ]"',  status: 'done',    note: 'boot.css + index.html' },
      { id: 'C.2', text: 'Click [ start ] advances to Loading',                                     status: 'done',    note: 'index.html inline JS' },
      { id: 'C.3', text: 'Loading ritual: "Liber Vacui / Now Loading / ==fate appreciates your patronage=="', status: 'done', note: 'loading.css + loading.html' },
    ],
  },
  {
    id: 'D', title: 'D. Tutorial (Wanderlust)', items: [
      { id: 'D.1', text: 'Large flaming question mark centered in pre-tutorial desktop',            status: 'done',    note: 'desktop.css .flaming-q' },
      { id: 'D.2', text: 'Click ? opens tutorial window with chat',                                 status: 'partial', note: 'Click currently just recedes ?; chat TBD Phase 3' },
      { id: 'D.3', text: 'Wanderlust pink circle + yellow inner + blinking white eye',              status: 'todo',    note: 'Phase 3' },
      { id: 'D.4', text: '"tell me more" disclosure on each chat message',                          status: 'todo',    note: 'Phase 3' },
    ],
  },
  {
    id: 'E', title: 'E. Sigil', items: [
      { id: 'E.1', text: 'Sigil app: stone tablet, cracks, intention input, draw canvas',           status: 'todo',    note: 'Phase 2' },
      { id: 'E.2', text: '5 element chisel cursor (air, water, fire, earth, spirit)',                status: 'todo',    note: 'Phase 2' },
      { id: 'E.3', text: 'Spirit cursor glows',                                                     status: 'todo',    note: 'Phase 2' },
      { id: 'E.4', text: 'SAVE etches into stone; app becomes scratched out after',                status: 'todo',    note: 'Phase 2' },
    ],
  },
  {
    id: 'F', title: 'F. Satchel', items: [
      { id: 'F.1', text: 'Satchel app: archive of saved artifacts',                                 status: 'todo',    note: 'Phase 2' },
      { id: 'F.2', text: 'Scholarly/archival aesthetic (cordelia)',                                 status: 'todo',    note: 'Phase 2' },
      { id: 'F.3', text: 'No shared CSS with other features',                                       status: 'todo',    note: 'Phase 2' },
    ],
  },
  {
    id: 'G', title: 'G. Cohort', items: [
      { id: 'G.1', text: 'Cohort app: gothic illustrated entities',                                 status: 'todo',    note: 'Phase 2' },
      { id: 'G.2', text: 'Relations list view',                                                     status: 'todo',    note: 'Phase 2' },
      { id: 'G.3', text: 'No shared CSS with other features',                                       status: 'todo',    note: 'Phase 2' },
    ],
  },
  {
    id: 'H', title: 'H. Sea', items: [
      { id: 'H.1', text: 'Sea app: minimal, negative space',                                        status: 'todo',    note: 'Phase 2' },
      { id: 'H.2', text: 'A single canvas with sparse elements',                                    status: 'todo',    note: 'Phase 2' },
      { id: 'H.3', text: 'No shared CSS with other features',                                       status: 'todo',    note: 'Phase 2' },
    ],
  },
  {
    id: 'I', title: 'I. Abstract', items: [
      { id: 'I.1', text: 'Abstract app: industrial melancholic aesthetic',                          status: 'todo',    note: 'Phase 2' },
      { id: 'I.2', text: 'Wireframe / line-art dominant',                                           status: 'todo',    note: 'Phase 2' },
      { id: 'I.3', text: 'A user-customizable space',                                               status: 'todo',    note: 'Phase 2' },
      { id: 'I.4', text: 'No shared CSS with other features',                                       status: 'todo',    note: 'Phase 2' },
    ],
  },
  {
    id: 'J', title: 'J. Games', items: [
      { id: 'J.1', text: 'Games app: carnival aesthetic',                                           status: 'todo',    note: 'Phase 2' },
      { id: 'J.2', text: 'At least one playable game (likely tarot or rune draw)',                  status: 'todo',    note: 'Phase 2' },
      { id: 'J.3', text: 'No shared CSS with other features',                                       status: 'todo',    note: 'Phase 2' },
    ],
  },
  {
    id: 'K', title: 'K. Divination', items: [
      { id: 'K.1', text: 'Divination app: tarot / rune / bone',                                     status: 'todo',    note: 'Phase 2' },
      { id: 'K.2', text: 'Each card has a portrait + reversed reading',                             status: 'todo',    note: 'Phase 2' },
      { id: 'K.3', text: 'Reading is in-character for the visitor',                                 status: 'todo',    note: 'Phase 2' },
      { id: 'K.4', text: 'No shared CSS with other features',                                       status: 'todo',    note: 'Phase 2' },
    ],
  },
  {
    id: 'L', title: 'L. Learn', items: [
      { id: 'L.1', text: 'Learn app: archival aesthetic',                                           status: 'todo',    note: 'Phase 2' },
      { id: 'L.2', text: 'Curated corpus of reflections',                                           status: 'todo',    note: 'Phase 2' },
      { id: 'L.3', text: 'No shared CSS with other features',                                       status: 'todo',    note: 'Phase 2' },
    ],
  },
  {
    id: 'M', title: 'M. Methodology', items: [
      { id: 'M.1', text: 'Methodology app: formal / academic aesthetic',                             status: 'todo',    note: 'Phase 2' },
      { id: 'M.2', text: 'Research-backed prompts for the cohort illustration',                     status: 'todo',    note: 'Phase 2' },
      { id: 'M.3', text: 'Cross-references to other apps',                                          status: 'todo',    note: 'Phase 2' },
      { id: 'M.4', text: 'A downloadable / exportable spec',                                        status: 'todo',    note: 'Phase 2' },
      { id: 'M.5', text: 'No shared CSS with other features',                                       status: 'todo',    note: 'Phase 2' },
    ],
  },
  {
    id: 'N', title: 'N. Council (Themes)', items: [
      { id: 'N.1', text: 'Council app: prison-cam aesthetic (riasons)',                             status: 'todo',    note: 'Phase 2' },
      { id: 'N.2', text: 'The 12 visitors listed, each with a dossier',                             status: 'todo',    note: 'Phase 2' },
      { id: 'N.3', text: 'Visiting a theme changes the bezel carve of that visitor',                status: 'todo',    note: 'Phase 3 cross-cutting' },
      { id: 'N.4', text: 'No shared CSS with other features',                                       status: 'todo',    note: 'Phase 2' },
    ],
  },
  {
    id: 'O', title: 'O. Trash', items: [
      { id: 'O.1', text: 'Trash app: gravedigger aesthetic (pete)',                                 status: 'todo',    note: 'Phase 2' },
      { id: 'O.2', text: 'Drag-to-trash from any app',                                              status: 'todo',    note: 'Phase 2' },
      { id: 'O.3', text: '7-day fade then permanent delete',                                         status: 'todo',    note: 'Phase 3' },
      { id: 'O.4', text: 'No shared CSS with other features',                                       status: 'todo',    note: 'Phase 2' },
    ],
  },
  {
    id: 'P', title: 'P. Shadow (Overdrive)', items: [
      { id: 'P.1', text: 'extc password unlocks shadow layer',                                      status: 'todo',    note: 'Phase 3' },
      { id: 'P.2', text: 'Shadow layer: full static, red dust, garbled titles, LED solid red, flicker, chromatic aberration', status: 'todo', note: 'Phase 3' },
      { id: 'P.3', text: 'Tarot readings reverse',                                                  status: 'todo',    note: 'Phase 3' },
      { id: 'P.4', text: 'Cohort chats become cruel; only Whimsy Wow stays wholesome',             status: 'todo',    note: 'Phase 3' },
    ],
  },
  {
    id: 'Q', title: 'Q. Atmosphere', items: [
      { id: 'Q.1', text: 'Each app is a different design universe (no shared CSS)',                 status: 'partial', note: 'Architecture rule enforced; verification at end of Phase 2' },
      { id: 'Q.2', text: 'Materials are textured (not flat plastic)',                               status: 'partial', note: 'Bezel + base have grain; per-app materials TBD' },
      { id: 'Q.3', text: 'Default corruption (red tint, faded titles, subtle static)',              status: 'done',    note: 'room.css .room + status-line.css' },
      { id: 'Q.4', text: 'Question mark recedes to top-left after tutorial',                        status: 'done',    note: 'desktop.css .tutorial-done' },
      { id: 'Q.5', text: 'Dust particles drift like stars in the void',                             status: 'done',    note: 'dust.js canvas' },
    ],
  },
  {
    id: 'R', title: 'R. Text & Content', items: [
      { id: 'R.1', text: 'No Lorem ipsum; mark [copy pending] if not written',                      status: 'done',    note: 'AGENTS.md hard rule' },
      { id: 'R.2', text: 'Names are character-consistent across all apps',                          status: 'partial', note: 'Cast locked in inspiration.md; persona TBD' },
      { id: 'R.3', text: 'Status line cycles through 4 phrasings every 12s',                        status: 'done',    note: 'status-line.js' },
    ],
  },
  {
    id: 'S', title: 'S. Missing Features (from covenant)', items: [
      { id: 'S.1', text: 'Relation window with orbit animation',                                    status: 'todo',    note: 'Phase 3' },
      { id: 'S.2', text: 'Tutorial replay from settings',                                            status: 'todo',    note: 'Phase 3' },
      { id: 'S.3', text: 'Question mark recedes vs large (tutorial vs not)',                        status: 'done',    note: 'desktop.css' },
      { id: 'S.4', text: 'Operator path (operator\'s cohort ledger)',                               status: 'todo',    note: 'Phase 2 (methodology)' },
      { id: 'S.5', text: '12 carvings visible in screenshots',                                      status: 'done',    note: 'bezel.css + carvings.js' },
      { id: 'S.6', text: 'Corruption scars on shell (texture, not just filter)',                    status: 'done',    note: 'machine.css .corruption-scars + 6 .scar divs' },
    ],
  },
];

export function countByStatus(status) {
  let n = 0;
  for (const s of SECTIONS) for (const it of s.items) if (it.status === status) n++;
  return n;
}

export const TOTAL = SECTIONS.reduce((acc, s) => acc + s.items.length, 0);
