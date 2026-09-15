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
    { voice: 'riason', line: 'The wax room retired. e-lizabeth lives in the lamp now — the small light in the corner of every page. Talk to her there; the wax still seals.', target: null },
    { voice: 'riason', line: 'This page stays as an archive note. The conversation has not been lost, only moved.', target: null }
  ] },  journal: { flag: 'walkJournal', steps: [
    { voice: 'riason', line: 'Welcome to the journal, my handiwork. Hem hem.', target: 'journal-drawers' },
    { voice: 'riason', line: 'Anyway, when you save relations, buddies, or set relations they get logged in the journal, and you are able to write notes about them.', target: 'journal-list' },
    { voice: 'riason', line: 'Clicking on a category brings up the list you created, you can take notes on the right.', target: 'journal-note' },
    { voice: 'riason', line: 'On the bottom right there are highlighters and pens, give them a shot!', target: 'journal-tools' },
    { voice: 'riason', line: 'That is the whole of it. Three drawers, one page, pens in the corner. The rest you will figure out by using it.', target: null, glow: true }
  ] },
  sea: { flag: 'walkSea', steps: [
    { voice: 'riason', line: 'this is the water. what you set on the scale, it takes — and does not keep.', target: 'sea-input' },
    { voice: 'riason', line: 'name it plain, set its weight, and give it over. it hangs a moment, then the water takes it down at its own pace. the AIR valve keeps the rhythm if you want company while you wait.', target: 'sea-release' },
    { voice: 'riason', line: 'the clock cuts a mark for each one, and the book keeps the record. the water does not give things back, but it remembers. that is stranger.', target: null },
    { voice: 'riason', line: 'the valve. slow in, slow out.', target: 'sea-breath-toggle', glow: true },
    { voice: 'riason', line: 'that is the whole of it. one name, one weight, one release. the water is patient; come back when you carry something.', target: null }
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
    { voice: 'riason', line: 'Welcome to Ruby\u2019s Garden! Here you can engage in relaxing paint-by-numbers, water your creations, watch them grow!', target: 'garden-room-gem' },
    { voice: 'riason', line: 'I like Ruby\u2019s app, its really easy. You don\u2019t need me here, I am going to go color in the void..', target: 'garden-plots', glow: true }
  ] },
  games: { flag: 'walkGames', steps: [
    { voice: 'riason', line: 'Eight booths, every one keeps. Pick one on the left.', target: 'games-grid' },
    { voice: 'riason', line: 'The pitch tells you what it does. Read it first.', target: 'games-desc' },
    { voice: 'riason', line: 'Play it on the right. Keep what you made.', target: 'games-stage' },
    { voice: 'riason', line: 'This is Whimsy\u2019s tent. Everything kept lands in the journal.', target: 'games-grid', glow: true }
  ] },
  trash: { flag: 'walkTrash', steps: [
    { voice: 'riason', line: 'What you bury lands here. Nothing is gone, only underground.', target: 'trash-dig-list' },
    { voice: 'riason', line: 'To bring one back, say why. The reason matters more than the thing.', target: 'trash-dig-list' },
    { voice: 'riason', line: 'Say it plainly and it returns to orbit — with your reason riding alongside as a new relation.', target: null, glow: true }
  ] }
};
