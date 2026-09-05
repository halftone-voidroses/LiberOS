// personas.data.js — the persona register (plan 2026-09-04 §3, single source
// for WS3/WS4 styling). Per traveller: id, name, opinion (one line, in-voice,
// ≤ 80 chars), accent (dominant hue of their app CSS), cursor (inline SVG
// data-URI — a small material token, no network), material (descriptor).
// Voices sourced from src/features/<app>/PERSONA.md. file://-safe, no fetch.
// Cast note: ruby keeps the garden (she took the librarian's carving);
// insightful inquiry keeps the dreams room (iris mappa's carving); riason
// keeps both the satchel ledger and the methodology folio; wanderlust took
// the themes room when iris mappa left.
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
    name: 'riason',
    opinion: 'Journal about your cohort',
    accent: '#aa7838',
    material: 'indexed vellum over brass clasps',
    cursor: "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M3 10 L11 4 L21 9 L17 20 L7 20 Z' fill='%23e8dcc0' stroke='%236a5a30' stroke-width='1.2'/><circle cx='8' cy='9' r='1.4' fill='none' stroke='%23aa7838'/><path d='M11 13 h6 M11 16 h4' stroke='%23aa7838' stroke-width='1.2'/></svg>\") 3 10, auto"
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
    name: 'sister physius',
    opinion: 'Sister Physius: Allow me to guide you through the first step.',
    accent: '#8a2a20',
    material: 'black wax, sealed; faint flame flicker',
    cursor: "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='14' r='7' fill='none' stroke='%234a4050' stroke-width='3'/><circle cx='12' cy='14' r='7' fill='none' stroke='%232a2030'/><path d='M12 2c1.5 2 1.5 3.5 0 5c-1.5-1.5-1.5-3 0-5z' fill='%23aa3030'/></svg>\") 12 14, auto"
  },
  abstract: {
    id: 'abstract',
    name: 'entity404',
    opinion: 'Entity404: Reduce an artifact to its components and reform it in a new way',
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
    opinion: 'scribe: LEARN!!!!! KEEP LEARNING!! FOREVER!!!!',
    accent: '#aa3030',
    material: 'index card, ink-stamped corner',
    cursor: "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M3 21L9 9l12-6-6 12z' fill='%233a2818' stroke='%231a0e08'/><path d='M3 21l8-8' stroke='%23e8d8a8' stroke-width='1.2'/><circle cx='12' cy='12' r='1.2' fill='%23e8d8a8'/></svg>\") 3 21, auto"
  },
  methodology: {
    id: 'methodology',
    name: 'riason',
    opinion: 'riason: Follow the steps inside for best results.',
    accent: '#aa3030',
    material: 'folio broadsheet, wax seal',
    cursor: "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><rect x='10.75' y='2' width='2.5' height='9' fill='%236a4a20'/><circle cx='12' cy='16' r='6' fill='%23aa3030' stroke='%236a1a10'/><circle cx='12' cy='16' r='3' fill='none' stroke='%23d8b890'/></svg>\") 12 16, auto"
  },
  garden: {
    id: 'garden',
    name: 'ruby',
    opinion: 'grow slow. what is tended in patience flowers in its own colour.',
    accent: '#b5763c',
    material: 'worn canvas, embroidered thread, pressed petals',
    cursor: "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M12 6 C9 2 3 3 4 8 C4.5 11 8 12 11 12 C8 12 4.5 13 4 16 C3 21 9 22 12 18 C15 22 21 21 20 16 C19.5 13 16 12 13 12 C16 12 19.5 11 20 8 C21 3 15 2 12 6 Z' fill='%23b5763c' stroke='%235a3418' stroke-width='1'/><path d='M12 6 L12 18' stroke='%235a3418' stroke-width='1.2'/></svg>\") 12 12, auto"
  },
  dreams: {
    id: 'dreams',
    name: 'insightful inquiry',
    opinion: 'i am not certain. the dream is. bring it here and we will read slowly.',
    accent: '#a48ad4',
    material: 'white cotton gloves, alkaline paper, foil question mark',
    cursor: "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M9 2 c1.2 0 2 0.9 2 2 v6 l1.2 -0.4 c3 -1 5.3 0.6 5.3 3.4 c0 3.4 -1.6 8.6 -6.5 8.6 c-3.6 0 -5.4 -2.4 -6.4 -5.4 l-1.3 -4 c-0.5 -1.6 1.4 -2.7 2.6 -1.5 l1.1 1.1 v-7.8 c0 -1.1 0.9 -2 2 -2 z' fill='%23f4f2ec' stroke='%23555570' stroke-width='1.2'/></svg>\") 9 2, auto"
  },
  themes: {
    id: 'themes',
    name: 'wanderlust',
    opinion: 'this room wears my paint now. do not blame the mirror, traveller.',
    accent: '#ff69b4',
    material: 'pigment tile mosaic',
    cursor: "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M12 2 c3 5 7 8 7 13 a7 7 0 1 1 -14 0 c0 -5 4 -8 7 -13 z' fill='%23ff69b4' stroke='%23aa3a6a' stroke-width='1.2'/><circle cx='12' cy='14' r='2' fill='%23ffd86a'/></svg>\") 12 12, auto"
  },
  relation: {
    id: 'relation',
    name: 'e-lizabeth',
    opinion: 'E-lizabeth: View relations between your artifacts.',
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
