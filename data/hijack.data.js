// hijack.data.js — first-visit walkthroughs, one entry per room.
// file://-safe, no fetch. Read by src/hijack.js (shell engine); rooms
// carry no tour code themselves. Shape per room: flag (persisted once
// seen) + steps [{voice, line, target, glow?}]. target may be an id or
// any selector; a missing target hides the ring, never breaks.
// House pattern: each tour speaks as the room's own traveller —
// mechanics, meaning, close. Brief, skippable, never twice.
window.LIBER_DATA = window.LIBER_DATA || {};
window.LIBER_DATA.hijack = {
  buddy: { flag: 'walkBuddy', steps: [
    { voice: 'e-lizabeth', line: 'write the ugly thing first. plain words. the wax takes them.', target: 'buddy-input' },
    { voice: 'e-lizabeth', line: 'two exchanges, then seal. sealed lines orbit the desktop.', target: 'buddy-seal' },
    { voice: 'e-lizabeth', line: 'speak, and it is kept. the wax is soft, and so is she.', target: null },
    { voice: 'e-lizabeth', line: 'that is the forge. speak.', target: 'buddy-send', glow: true }
  ] },
  satchel: { flag: 'walkSatchel', steps: [
    { voice: 'riason', line: 'everything kept lands here. list on the left, page on the right.', target: 'satchel-list' },
    { voice: 'riason', line: 'margin notes save with ⌘↵. the book keeps what the hands bring.', target: 'satchel-annotation' },
    { voice: 'riason', line: 'kept once, kept well. index it — future you is counting on present you.', target: null },
    { voice: 'riason', line: 'that is the ledger. index it well.', target: 'satchel-list', glow: true }
  ] },
  sea: { flag: 'walkSea', steps: [
    { voice: 'vanir', line: 'name it in the box. weigh it on the dots — four and five open later.', target: 'sea-input' },
    { voice: 'vanir', line: 'release sinks it. the water takes; it does not keep.', target: 'sea-release' },
    { voice: 'vanir', line: 'the breath of the deep is slow. come down anyway.', target: 'sea-breath' },
    { voice: 'vanir', line: 'that is the tide. it does not keep.', target: 'sea-breath-toggle', glow: true }
  ] },
  abstract: { flag: 'walkAbstract', steps: [
    { voice: 'entity404', line: 'the rail holds your pairs. pick one apart.', target: 'abstract-rail-list' },
    { voice: 'entity404', line: 'left what was, right what becomes. reform it.', target: 'abstract-void' },
    { voice: 'entity404', line: 'no warmth here. only process. bring a pair.', target: null },
    { voice: 'entity404', line: 'that is the void. do not explain it.', target: 'abstract-void', glow: true }
  ] },
  divination: { flag: 'walkDivination', steps: [
    { voice: 'arcana', line: 'type the question. one worth being answered.', target: 'divination-input' },
    { voice: 'arcana', line: 'draw one card. the deck does the rest.', target: 'divination-draw' },
    { voice: 'arcana', line: 'the deck is still. ask, and the chalk will answer.', target: 'divination-tarot' },
    { voice: 'arcana', line: 'that is the tent. ask.', target: 'divination-tarot', glow: true }
  ] },
  dreams: { flag: 'walkDreams', steps: [
    { voice: 'insightful inquiry', line: 'write the dream down before it thins. strangeness mandatory.', target: 'dreams-record' },
    { voice: 'insightful inquiry', line: 'the reading hedges, then asks. keep it to the book — or plant it as a seed.', target: 'dreams-ledger' },
    { voice: 'insightful inquiry', line: 'i am not certain. the dream is. bring it here and we will read slowly.', target: null },
    { voice: 'insightful inquiry', line: 'that is the reading room. record.', target: 'dreams-title-input', glow: true }
  ] },
  garden: { flag: 'walkGarden', steps: [
    { voice: 'ruby', line: 'click a well, fill the slots, pour onto the stone. seventeen facets.', target: 'garden-gem-svg' },
    { voice: 'ruby', line: 'finish it and the draft asks: satchel, or plant it in the bed.', target: 'garden-tab-bed' },
    { voice: 'ruby', line: 'grow slow. what is tended in patience flowers in its own colour.', target: null },
    { voice: 'ruby', line: 'that is the garden. grow slow.', target: 'garden-gem-new', glow: true }
  ] },
  games: { flag: 'walkGames', steps: [
    { voice: 'whimsy wow', line: 'eight booths, two tents. the tools keep to your book — the games keep nothing but the minute.', target: 'games-grid' },
    { voice: 'whimsy wow', line: 'tipp sits pinned at the floor. start there if it is loud.', target: 'games-tipp-open' },
    { voice: 'whimsy wow', line: 'the tools pay out in satchel-weight. the games pay in calm.', target: null },
    { voice: 'whimsy wow', line: 'that is the tent. play.', target: 'games-grid', glow: true }
  ] },
  methodology: { flag: 'walkMethod', steps: [
    { voice: 'riason', line: 'name the question. name what is known. name what is unknown.', target: 'method-rubric-left' },
    { voice: 'riason', line: 'choose one wall. return — the question will have changed.', target: 'method-rubric-right' },
    { voice: 'riason', line: 'a method is a promise made to the margin. read slowly.', target: null },
    { voice: 'riason', line: 'that is the folio. return.', target: 'method-rubric-left', glow: true }
  ] },
  themes: { flag: 'walkThemes', steps: [
    { voice: 'riason', line: 'every pigment is a past room. click to repaint — nothing breaks.', target: 'themes-grid' },
    { voice: 'riason', line: 'this strip shows the room wearing it. do not blame the mirror.', target: 'themes-current-value' },
    { voice: 'riason', line: 'she took this room, so i keep its notes. paint responsibly.', target: null },
    { voice: 'riason', line: 'that is the atlas. repaint.', target: 'themes-grid', glow: true }
  ] },
  relation: { flag: 'walkRelation', steps: [
    { voice: 'e-lizabeth', line: 'every kept thing waits here unbound. touch one.', target: 'relation-unbound' },
    { voice: 'e-lizabeth', line: 'give it a verb. protects, carries — the word is the work.', target: 'relation-ledger' },
    { voice: 'e-lizabeth', line: 'nothing here stands alone. count the links.', target: null },
    { voice: 'e-lizabeth', line: 'that is the knot. tie it.', target: 'relation-ledger', glow: true }
  ] },
  trash: { flag: 'walkTrash', steps: [
    { voice: 'ravaging pete', line: 'what you bury lands here. nothing is gone, only buried, friend.', target: 'trash-dig-list' },
    { voice: 'ravaging pete', line: 'bury to release, dig to restore. mind the labels.', target: 'trash-bury-buddy' },
    { voice: 'ravaging pete', line: 'what you bury, i keep. the soil forgets nothing, friend.', target: null },
    { voice: 'ravaging pete', line: 'that is the graveyard. bury kindly.', target: 'trash-dig-list', glow: true }
  ] }
};
