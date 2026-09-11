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
    { voice: 'riason', line: 'Welcome to LiberChat, this allows you to talk to your buddy.', target: 'chat-users' },
    { voice: 'riason', line: 'The middle keeps the log of what is said.', target: 'chat-log' },
    { voice: 'riason', line: 'Your buddy is on the left — say hello. The conversation stays on this device \u2014 nothing you say leaves the room.', target: 'chat-input', glow: true }
  ] },  satchel: { flag: 'walkSatchel', steps: [
    { voice: 'riason', line: 'Welcome to the satchel, my handiwork. Hem hem.', target: 'satchel-drawers' },
    { voice: 'riason', line: 'Anyway, when you save relations, buddies, or set relations they get logged in the satchel, and you are able to write notes about them.', target: 'satchel-list' },
    { voice: 'riason', line: 'Clicking on a category brings up the list you created, you can take notes on the right.', target: 'satchel-note' },
    { voice: 'riason', line: 'On the bottom right there are highlighters and pens, give them a shot!', target: 'satchel-tools' },
    { voice: 'riason', line: 'That is the whole of it. Three drawers, one page, pens in the corner. The rest you will figure out by using it.', target: null, glow: true }
  ] },
  sea: { flag: 'walkSea', steps: [
    { voice: 'riason', line: 'This is the sea, if you are holding onto negative thoughts, you can release them here.', target: 'sea-input' },
    { voice: 'riason', line: 'Type in the thought, and click release. It will appear in the middle of the screen and float away. You can also breathe with it before releasing it, feel yourself get calmer.', target: 'sea-release' },
    { voice: 'riason', line: 'This will save the thought in your satchel and on the window. But you can release it from there too if you\u2019d like.', target: null },
    { voice: 'riason', line: 'The power is yours!', target: 'sea-breath-toggle', glow: true },
    { voice: 'riason', line: 'That is the whole of it. One thought, one breath, one release. Come back whenever you are carrying something.', target: null }
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
    { voice: 'riason', line: 'This is Whimsy\u2019s tent. Everything kept lands in the satchel.', target: 'games-grid', glow: true }
  ] },
  trash: { flag: 'walkTrash', steps: [
    { voice: 'riason', line: 'What you bury lands here. Nothing is gone, only underground.', target: 'trash-dig-list' },
    { voice: 'riason', line: 'To bring one back, say why. The reason matters more than the thing.', target: 'trash-dig-list' },
    { voice: 'riason', line: 'Say it plainly and it returns to orbit — with your reason riding alongside as a new relation.', target: null, glow: true }
  ] }
};
