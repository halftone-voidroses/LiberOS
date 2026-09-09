// hijack.data.js — first-visit walkthroughs, one entry per room.
// file://-safe, no fetch. Read by src/hijack.js (shell engine); rooms
// carry no tour code themselves. Shape per room: flag (persisted once
// seen) + steps [{voice, line, target, glow?}]. target may be an id or
// any selector; a missing target hides the ring, never breaks.
// House pattern: each tour speaks as the room's own traveller —
// mechanics, meaning, close. Brief, skippable, never twice.
window.LIBER_DATA = window.LIBER_DATA || {};
window.LIBER_DATA.hijack = {
  satchel: { flag: 'walkSatchel', steps: [
    { voice: 'riason', line: 'everything kept lands here. list on the left, page on the right.', target: 'satchel-list' },
    { voice: 'riason', line: 'margin notes save with ⌘↵. the book keeps what the hands bring.', target: 'satchel-annotation' },
    { voice: 'riason', line: 'write a margin note so you can find things later.', target: null },
    { voice: 'riason', line: 'this is the satchel. everything you keep lands here.', target: 'satchel-list', glow: true }
  ] },
  sea: { flag: 'walkSea', steps: [
    { voice: 'riason', line: 'name it in the box. weigh it on the dots — four and five open later.', target: 'sea-input' },
    { voice: 'riason', line: 'release sinks it. the water takes; it does not keep.', target: 'sea-release' },
    { voice: 'riason', line: 'turn on guided breathing with the breath button.', target: 'sea-breath' },
    { voice: 'riason', line: 'this is the sea. release here to end a session.', target: 'sea-breath-toggle', glow: true }
  ] },
  divination: { flag: 'walkDivination', steps: [
    { voice: 'riason', line: 'type the question. one worth being answered.', target: 'divination-input' },
    { voice: 'riason', line: 'draw one card. the deck does the rest.', target: 'divination-draw' },
    { voice: 'riason', line: 'one card per draw. keep it or discard it.', target: 'divination-tarot' },
    { voice: 'riason', line: 'this is the tent. ask one question at a time.', target: 'divination-tarot', glow: true }
  ] },
  dreams: { flag: 'walkDreams', steps: [
    { voice: 'riason', line: 'write the dream down before it thins. strangeness mandatory.', target: 'dreams-record' },
    { voice: 'riason', line: 'the reading hedges, then asks. keep it to the book — or plant it as a seed.', target: 'dreams-ledger' },
    { voice: 'riason', line: 'write down what happened, strange parts included.', target: null },
    { voice: 'riason', line: 'this is the dreams room. record first.', target: 'dreams-title-input', glow: true }
  ] },
  garden: { flag: 'walkGarden', steps: [
    { voice: 'riason', line: 'click a well, fill the slots, pour onto the stone. seventeen facets.', target: 'garden-gem-svg' },
    { voice: 'riason', line: 'finish it and the draft asks: satchel, or plant it in the bed.', target: 'garden-tab-bed' },
    { voice: 'riason', line: 'finish one gem before starting another.', target: null },
    { voice: 'riason', line: 'this is the garden. finish the gem in front of you.', target: 'garden-gem-new', glow: true }
  ] },
  games: { flag: 'walkGames', steps: [
    { voice: 'riason', line: 'nine booths, two tents. the tools keep to your book — the games keep nothing but the minute.', target: 'games-grid' },
    { voice: 'riason', line: 'tipp sits pinned at the floor. start there if it is loud.', target: 'games-tipp-open' },
    { voice: 'riason', line: 'booth results save to your satchel.', target: null },
    { voice: 'riason', line: 'these are the booths. play one.', target: 'games-grid', glow: true }
  ] },
  relation: { flag: 'walkRelation', steps: [
    { voice: 'riason', line: 'every kept thing waits here unbound. touch one.', target: 'relation-unbound' },
    { voice: 'riason', line: 'give it a verb. protects, carries — the word is the work.', target: 'relation-ledger' },
    { voice: 'riason', line: 'bound artifacts show their verbs here.', target: null },
    { voice: 'riason', line: 'this is where bindings happen. pick an item, give it a verb.', target: 'relation-ledger', glow: true }
  ] },
  trash: { flag: 'walkTrash', steps: [
    { voice: 'riason', line: 'what you bury lands here. nothing is gone, only buried.', target: 'trash-dig-list' },
    { voice: 'riason', line: 'bury to release, dig to restore. mind the labels.', target: 'trash-bury-buddy' },
    { voice: 'riason', line: 'what you bury, i keep. dig it back any time.', target: null },
    { voice: 'riason', line: 'this is the trash room. buried things can be dug back up.', target: 'trash-dig-list', glow: true }
  ] }
};
