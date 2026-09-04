// personas.data.js — the persona register (plan 2026-09-04 §3, single source
// for WS3/WS4 styling). Per traveller: id, name, opinion (one line, in-voice,
// ≤ 80 chars), accent (dominant hue of their app CSS), cursor (inline SVG
// data-URI — a small material token, no network), material (descriptor).
// Voices sourced from src/features/<app>/PERSONA.md. file://-safe, no fetch.
window.LIBER_DATA = window.LIBER_DATA || {};
window.LIBER_DATA.personas = {
  sigil: {
    id: 'sigil',
    name: 'mistress physius',
    opinion: 'the stone remembers what the hand confesses.',
    accent: '#aa5a18',
    material: 'grey chiseled stone, copper inlay',
    cursor: "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M2 2l9 2-7 7z' fill='%23c8c8d0' stroke='%232a2a30'/><path d='M11 10l3 3 7-7-3-3z' fill='%23aa5a18' stroke='%235a2a08'/></svg>\") 2 2, auto"
  },
  satchel: {
    id: 'satchel',
    name: 'the librarian',
    opinion: 'everything kept is kept once. index it well.',
    accent: '#aa7838',
    material: 'sepia vellum over brass clasps',
    cursor: "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M2 22l3-7 12-12 4 4-12 12z' fill='%23d8b890' stroke='%236a3a18'/><path d='M2 22l3-7 4 4z' fill='%23e8dcc0' stroke='%236a3a18'/><path d='M17 3l4 4 2-2-4-4z' fill='%23aa7838' stroke='%236a3a18'/></svg>\") 2 22, auto"
  },
  sea: {
    id: 'sea',
    name: 'vanir',
    opinion: 'the breath of the deep is slow. come down anyway.',
    accent: '#2a8a8a',
    material: 'wet slate, waterline foam edge',
    cursor: "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M12 2c5 7 8 10 8 14a8 8 0 1 1-16 0c0-4 3-7 8-14z' fill='%232a8a8a' stroke='%23050a18' stroke-width='1.5'/><path d='M8 16c0 2.2 1.8 4 4 4' fill='none' stroke='%23a0c8d8' stroke-width='1.5' stroke-linecap='round'/></svg>\") 12 12, auto"
  },
  cohort: {
    id: 'cohort',
    name: 'e-lizabeth',
    opinion: 'some are carried, not kept. i carry them still.',
    accent: '#8a2a20',
    material: 'black wax, sealed; faint flame flicker',
    cursor: "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='14' r='7' fill='none' stroke='%234a4050' stroke-width='3'/><circle cx='12' cy='14' r='7' fill='none' stroke='%232a2030'/><path d='M12 2c1.5 2 1.5 3.5 0 5c-1.5-1.5-1.5-3 0-5z' fill='%23aa3030'/></svg>\") 12 14, auto"
  },
  abstract: {
    id: 'abstract',
    name: 'entity404',
    opinion: 'no warmth here. only process. state your query.',
    accent: '#00ff66',
    material: 'phosphor glass, green bloom',
    cursor: "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M2 2h4v4h4v4h4v4h4v4h4v4h-6v-2h-2v-2h-2v-2h-2v-2h-2v-2H4V8H2z' fill='%2300ff66' stroke='%23002010'/></svg>\") 2 2, auto"
  },
  games: {
    id: 'games',
    name: 'whimsy wow',
    opinion: 'step right up! every booth pays out in satchel-weight.',
    accent: '#d4af37',
    material: 'painted marquee wood, bulb studs',
    cursor: "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='10' r='7' fill='%23ffe080' stroke='%23d4af37' stroke-width='1.5'/><path d='M10 8c0-2 1-3 2-4' stroke='%23fff6d0' fill='none' stroke-width='1.5' stroke-linecap='round'/><path d='M9 17h6v3h-6z' fill='%23d4af37' stroke='%23aa6000'/></svg>\") 12 10, auto"
  },
  divination: {
    id: 'divination',
    name: 'arcana',
    opinion: 'the deck is still. ask, and the chalk will answer.',
    accent: '#f4e8d2',
    material: 'deep red felt, chalk-dusted rim',
    cursor: "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><g transform='rotate(45 12 12)'><rect x='9' y='3' width='6' height='16' rx='1.5' fill='%23f4e8d2' stroke='%236a0a14'/><rect x='9' y='16' width='6' height='3' rx='1.5' fill='%23d8c8a8' stroke='%236a0a14'/></g></svg>\") 12 12, auto"
  },
  learn: {
    id: 'learn',
    name: 'the mad scribe',
    opinion: 'dated, stamped, filed. bring your own pencil.',
    accent: '#aa3030',
    material: 'index card, ink-stamped corner',
    cursor: "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M3 21L9 9l12-6-6 12z' fill='%233a2818' stroke='%231a0e08'/><path d='M3 21l8-8' stroke='%23e8d8a8' stroke-width='1.2'/><circle cx='12' cy='12' r='1.2' fill='%23e8d8a8'/></svg>\") 3 21, auto"
  },
  methodology: {
    id: 'methodology',
    name: 'raison',
    opinion: 'a method is a promise made to the margin. read slowly.',
    accent: '#aa3030',
    material: 'folio broadsheet, wax seal',
    cursor: "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><rect x='10.75' y='2' width='2.5' height='9' fill='%236a4a20'/><circle cx='12' cy='16' r='6' fill='%23aa3030' stroke='%236a1a10'/><circle cx='12' cy='16' r='3' fill='none' stroke='%23d8b890'/></svg>\") 12 16, auto"
  },
  themes: {
    id: 'themes',
    name: 'iris mappa',
    opinion: 'every room is a country. i keep the maps.',
    accent: '#d4af37',
    material: 'pigment tile mosaic',
    cursor: "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M14 3l7 7-9 9-4-4z' fill='%238a5a28' stroke='%234a2810'/><path d='M8 15l-5 6 6-5z' fill='%23d4af37' stroke='%234a2810'/></svg>\") 3 21, auto"
  },
  relation: {
    id: 'relation',
    name: 'e-lizabeth',
    opinion: 'nothing here stands alone. count the links.',
    accent: '#aa8a3a',
    material: 'iron ring + chain links',
    cursor: "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='9' cy='9' r='5.5' fill='none' stroke='%234a4050' stroke-width='3'/><circle cx='9' cy='9' r='5.5' fill='none' stroke='%232a2030'/><path d='M13 13l4 4a3 3 0 1 0 4-4l-4-4' fill='none' stroke='%23aa8a3a' stroke-width='2'/></svg>\") 9 9, auto"
  },
  trash: {
    id: 'trash',
    name: 'ravaging pete',
    opinion: 'what you bury, i keep. the soil forgets nothing, friend.',
    accent: '#8a6840',
    material: 'die-cut rubble, gravel edge',
    cursor: "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M4 14l3-6 5-3 6 3 2 6-4 5-8 1z' fill='%235a4028' stroke='%232a1f15' stroke-width='1.5'/><path d='M7 8l5-3 2 3-4 4z' fill='%236a4c30'/><circle cx='9' cy='15' r='1' fill='%232a1f15'/><circle cx='14' cy='16' r='1.2' fill='%232a1f15'/></svg>\") 12 12, auto"
  }
};
