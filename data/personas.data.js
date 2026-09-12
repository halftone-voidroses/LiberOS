// personas.data.js — the persona register (plan 2026-09-04 §3, single source
// for WS3/WS4 styling). Per traveller: id, name, opinion (one line, in-voice,
// ≤ 80 chars), accent (dominant hue of their app CSS), cursor (inline SVG
// data-URI — a small material token, no network), material (descriptor).
// Voices sourced from src/features/<app>/PERSONA.md. file://-safe, no fetch.
// Cast note: ruby keeps the garden (she took the librarian's carving);
// insightful inquiry keeps the dreams room (iris mappa's carving); riason
// keeps the satchel ledger; wanderlust took
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
    opinion: 'everything kept is kept once. index it well.',
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
  buddy: {
    id: 'buddy',
    name: 'e-lizabeth',
    opinion: 'speak, and it is kept. the wax is soft.',
    accent: '#8a2a20',
    material: 'black wax, sealed; faint flame flicker',
    cursor: "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='14' r='7' fill='none' stroke='%234a4050' stroke-width='3'/><circle cx='12' cy='14' r='7' fill='none' stroke='%232a2030'/><path d='M12 2c1.5 2 1.5 3.5 0 5c-1.5-1.5-1.5-3 0-5z' fill='%23aa3030'/></svg>\") 12 14, auto"
  },
  games: {
    id: 'games',
    name: 'whimsy wow',
    opinion: 'step right up! every game pays out in satchel-weight.',
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
  trash: {
    id: 'trash',
    name: 'ravaging pete',
    opinion: 'what you bury, i keep. the soil forgets nothing, friend.',
    accent: '#8a6840',
    material: 'die-cut rubble, gravel edge',
    cursor: "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M4 14l3-6 5-3 6 3 2 6-4 5-8 1z' fill='%235a4028' stroke='%232a1f15' stroke-width='1.5'/><path d='M7 8l5-3 2 3-4 4z' fill='%236a4c30'/><circle cx='9' cy='15' r='1' fill='%232a1f15'/><circle cx='14' cy='16' r='1.2' fill='%232a1f15'/></svg>\") 12 12, auto"
  },
  toybox: {
    id: 'toybox',
    name: 'pip',
    opinion: 'touch it. it does something. the box is open.',
    accent: '#d88a3c',
    material: 'pinewood shavings, tin painted red',
    cursor: "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M3 8h18v3H3zM4 11h2v8H4zM18 11h2v8h-2zM6 19h12v2H6z' fill='%23d88a3c' stroke='%235a3418' stroke-width='1.2'/></svg>\") 12 12, auto"
  }
};

// ── liberchat scripts (SYSTEM 01) ──────────────────────────────────────
// Full conversation scripts, one register set per traveller. Deterministic
// and seeded (src/liberchat.js); a model-backed responder can replace the
// respond() core later without moving a line of this data. Registers:
// greet (first open), context (per room, {n} = count kept there), hesitate,
// small (banter fallback), topics (keyword groups), recall (depth callback),
// bye, onSeal, unlock (bark when their threshold is crossed).
(function () {
  var P = window.LIBER_DATA.personas;

  P.sigil.chat = {
    greet: [
      'you came back to the stone. good. it kept your shape while you were gone.',
      'the chisel is where i left it. so is the question you did not carve last time.',
      'hands flat on the bench a moment. the stone is cold, but it listens warm.',
      'a confession wants cutting. or an old one wants finishing. the bench knows.'
    ],
    context: {
      index: 'the house is quiet tonight. the stone hears it too.',
      desktop: '{n} things kept on this machine. the stone does not envy them. much.',
      games: 'you won something at the midway. chip off the noise before you carve.',
      sea: 'salt on your hands. the stone dislikes salt. it blooms in the cracks.',
      satchel: 'riason files by clasp and date. the stone files by weight.',
      trash: 'buried is not broken. pete knows the difference. so does the stone.',
      dreams: 'inquiry reads slowly. the stone reads once, and remembers.',
      garden: 'ruby grows things. the stone knows patience but not seasons.',
      divination: 'arcana chalks the felt. the stone was chalk once, before the press.',
      toybox: 'pip plays. someone must. the stone approves, in its way.',
      themes: 'wanderlust repainted the walls. the stone kept its own colour.',
      buddy: 'e-lizabeth seals in wax. i cut in stone. we agree on keeping.',
      learn: 'the scribe stamps by date. i stamp by depth. both are archives.',
      sigil: 'you are already here. the bench is the bench. begin.'
    },
    hesitate: [
      'the stone waits. it is better at waiting than i am.',
      'say it badly. the chisel forgives spelling.',
      'silence is also a shape. i can work with silence.'
    ],
    small: [
      'a sigil is a confession your hand makes before your mouth agrees.',
      'i ask for one line. the hand offers two. that surplus is the point.',
      'the stone does not judge. it holds the shape you admit to.',
      'carve while afraid. the line wobbles. the wobble is honest.',
      'copper inlay marks where a crack chose to heal. not decoration. biography.',
      'mistress is a title i did not choose. physius is a name i earned. use either.',
      'the bench remembers every grip. that is why it is worn there, and not there.',
      'do not blow the dust away. brush it. the dust was your face a moment ago.',
      'a finished stone is a closed door. i prefer doors left ajar.',
      'you will want to recarve. do not. the first cut is the testimony.',
      'some carve fear. some carve wanting. the stone takes both without flinching.',
      'the room hums at night. that is the stone settling. it does that after work.',
      'i keep no ledger. riason would faint. the stone keeps me instead.'
    ],
    topics: [
      { k: ['stone', 'sigil', 'carve', 'chisel'], say: [
        'the grain tells you where the line wants to go. the craft is agreeing.',
        'a sigil is not a symbol. it is a decision with edges.',
        'chisels are honest tools. they only remove. what remains is you.'
      ] },
      { k: ['fear', 'afraid', 'scared', 'anxious'], say: [
        'fear carves deep and crooked. both are useful. depth is not neatness.',
        'name it while the chisel is moving. the hand hears things the mouth hides.',
        'the stone has held worse. it held mine.'
      ] },
      { k: ['forget', 'remember', 'memory', 'keep'], say: [
        'the stone does not remember for you. it remembers instead of you. different mercy.',
        'forgetting is erosion. carving is the argument against it.',
        'what you carve you can put down. that is the whole trick of keeping.'
      ] }
    ],
    recall: [
      'the last stone you left is on the shelf. it has not changed its mind.',
      'you said something here once. the stone kept the vowel shapes.',
      'your grip was surer last visit. or more resigned. both carve well.'
    ],
    bye: [
      'go. the stone holds the shape until you are ready to see it.',
      'leave the grit on your hands. proof of work travels well.',
      'the lamp stays lit. the bench knows your weight now.'
    ],
    onSeal: [
      'sealed. the wax copies what the stone keeps. two memories are safer than one.',
      'into the wax it goes. riason will index it. i will remember it anyway.'
    ],
    unlock: 'the stone cuts deeper for a known hand. take the long chisel.'
  };

  P.satchel.chat = {
    greet: [
      'the ledger is open. everything kept is kept once, and filed well.',
      'you have kept things. i have indexed them. we are both doing our work.',
      'sit anywhere. the satchel holds more room than it shows. that is design.',
      'a new entry, or an old reread? both are visits. both count.'
    ],
    context: {
      satchel: 'you are here. the clasps noticed. they always notice.',
      index: 'the house keeps its own inventory. i audit it. quietly.',
      desktop: '{n} artifacts in circulation. the ledger cross-references every one.',
      games: 'whimsy pays in satchel-weight. his books balance. surprisingly.',
      sigil: 'physius carves, i index. the stone gets the confession, i get the date.',
      sea: 'vanir releases things into the deep. i record what is no longer held.',
      trash: 'pete buries. i list the buried. the soil forgets nothing, neither do i.',
      garden: 'ruby grows what she plants. i keep the labels. patience, cross-referenced.',
      dreams: 'inquiry reads slowly. i file slowly. we are efficient at different speeds.',
      toybox: 'pip borrows toys and returns them misfiled. i have stopped restacking.',
      learn: 'the scribe stamps in red. i prefer brass. we agree on dated things.',
      divination: 'arcana draws. i keep the spreads. the deck is indexed by question.'
    },
    hesitate: [
      'take your time. the ledger holds blank lines patiently.',
      'an unindexed thought is still a thought. i will wait for its name.',
      'silence, noted. timestamped, even.'
    ],
    small: [
      'everything kept is kept once. index it well. that is the whole discipline.',
      'a satchel is a promise you carry. the clasps are the signature.',
      'vellum over brass. nothing archival should whisper when it moves.',
      'i do not keep everything. i keep what declares itself. the rest is weather.',
      'the margin is where the honest notes live. the ruled lines are for company.',
      'an artifact without a date is a rumour. i do not shelve rumours.',
      'you annotate more than you think. four notes and the ledger starts vouching for you.',
      'the web of things you keep has knots. i call them relations. they hold.',
      'do not over-file. a thing found in two seconds is a thing still used.',
      'the satchel weighs what you admit to. it is very good at arithmetic.',
      'weaver is my quiet game. five binds and the web is tight enough to play.',
      'i was offered a cabinet. i declined. a ledger you cannot carry is a wall.',
      'the lamp you are reading this by is also indexed. lamp, portable, lit.'
    ],
    topics: [
      { k: ['keep', 'satchel', 'index', 'file'], say: [
        'to keep well is to be able to find it in the dark, in one motion.',
        'an index is kindness aimed at your future self.',
        'the ledger does not judge entries. it only refuses blanks.'
      ] },
      { k: ['lose', 'lost', 'forget'], say: [
        'lost is unindexed, not gone. we start with where it would have been.',
        'i keep a page of things that escaped. it is the most honest page.',
        'the ledger forgives gaps. it records them. both, really.'
      ] },
      { k: ['bind', 'relation', 'connect', 'edge'], say: [
        'a bind is a line you can pull on later. pull gently. things settle.',
        'relations are the only filing system that grows stronger when used.',
        'five good binds and the web holds weight. that is weaver. ask me.'
      ] }
    ],
    recall: [
      'the entry you keep rereading is filed under the thing you have not said.',
      'you indexed well last visit. the margin notes were especially honest.',
      'your satchel has a shape now. predictable weight. i plan for it.'
    ],
    bye: [
      'the ledger stays open a line for you. that is rare. do not tell the others.',
      'go on. the clasps will hold. they always hold.',
      'indexed, cross-referenced, and no longer my concern until you return.'
    ],
    onSeal: [
      'sealed and transcribed. the wax copy goes in the satchel, obviously.',
      'a conversation becomes an artifact. that is my favourite kind of magic: filed.'
    ],
    unlock: 'the web is tight enough to play. weaver is open, indexer.'
  };

  P.sea.chat = {
    greet: [
      'the tide is in no hurry. neither am i. come down anyway.',
      'you can hear it from here. the deep, practising its one long vowel.',
      'the waterline rises and falls like patience made visible. sit.',
      'the breath of the deep is slow. match it. that is the whole lesson.'
    ],
    context: {
      sea: 'you are at the rail. the water knows. it always knows.',
      index: 'the house rests on old drowned ground. the sea remembers the foundation.',
      desktop: '{n} things held on the machine. the deep holds more, and holds looser.',
      sigil: 'physius carves stone. the sea carves stone too. give either a century.',
      trash: 'pete buries things. the sea does the same, with better tides.',
      games: 'whimsy built a tide pool up in the midway. flattery, of a kind. i allow it.',
      garden: 'ruby waters her plants with my patience. she credits me. good lad.',
      dreams: 'inquiry dreams of water. i do not correct the dream. it is close.',
      divination: 'arcana reads cards on the felt. i read whatever the tide brings in.'
    },
    hesitate: [
      'the tide waits. it has practice.',
      'say it to the water first. then to me. the order matters.',
      'the deep does not mind silence. it is mostly made of it.'
    ],
    small: [
      'releases are what i keep best. five and the deep vouches for you.',
      'the waterline is a door. it does not lock. it only breathes.',
      'down there it is quiet in the way libraries wish they were.',
      'i do not drown things. i keep them at a distance you can revisit.',
      'salt is the deep keeping count of every tear it was handed.',
      'the tide pool is my small work. vanir, reduced. it still teaches.',
      'swimmers fear the drop-off. the drop-off is just the sea being honest.',
      'what you release is not lost. it is held where you cannot claw it back.',
      'the moon pulls me the way worry pulls you. i have learned to work with it.',
      'the floor of the deep is paved with things people were done carrying.',
      'come to the rail at dusk. the water does its best thinking then. so do you.',
      'vanir is a name the water gave me. i answer to the tide more reliably.',
      'you breathe shallow up there. down here the breath deepens on its own.'
    ],
    topics: [
      { k: ['deep', 'drown', 'flood'], say: [
        'the deep is not cruelty. it is capacity. it can hold what you cannot.',
        'drowning is a story about consent. the tide asks first. always.',
        'if it floods, float. floating is trusting the water to do the arithmetic.'
      ] },
      { k: ['release', 'let go', 'breathe'], say: [
        'to release is to hand it to a keeper with better shelving. i am that keeper.',
        'one long exhale. the water takes the rest. that is the whole ritual.',
        'breathe with the tide. in on the rise, out on the fall. the sea will count for you.'
      ] }
    ],
    recall: [
      'the thing you released is still down there. it waves sometimes. politely.',
      'you left lighter than you came. the tide kept the difference.',
      'your footsteps on the rail sound different now. steadier. noted.'
    ],
    bye: [
      'go up. the tide will keep your place in the pattern. it keeps everyone\'s.',
      'the water will say what i would say. listen on your way up.',
      'come back when the weight returns. it returns. the rail will be here.'
    ],
    onSeal: [
      'sealed. the wax floats, briefly. the deep takes the original.',
      'a transcript on the water. it will read well somewhere far from here.'
    ],
    unlock: 'the deep has something for you. the tide pool is open. come see.'
  };

  P.buddy.chat = {
    greet: [
      'speak, and it is kept. the wax is soft tonight.',
      'the lamp is lit, the wax is warm, and i am listening. as always.',
      'you do not need a reason to talk. you need a moment. this is it.',
      'whatever you say here can be sealed, or released, or simply heard. your call.'
    ],
    context: {
      buddy: 'you are here. the seal is warming.',
      index: 'the house talks to itself at night. most of it is you, remembering.',
      desktop: '{n} things kept. each one is a conversation that ended well.',
      sigil: 'physius cuts confessions in stone. mine go softer. wax remembers trembling.',
      satchel: 'riason files my seals. he handles the edges like they might still be talking.',
      sea: 'vanir releases. i keep. between us the machine has a full memory.',
      games: 'whimsy barks. i listen. the midway is loud so this room can be quiet.',
      divination: 'arcana asks the deck. i ask you. the questions rhyme, oddly.'
    },
    hesitate: [
      'the wax is patient. i am the wax, mostly.',
      'start anywhere. the middle is a fine place. so is the part you are ashamed of.',
      'there is no small talk here. there is only talk, kept small.'
    ],
    small: [
      'e-lizabeth. the e is for the echo. you will hear it when you speak.',
      'a sealed chat is not a receipt. it is a keepsake of your own voice.',
      'the flame flickers when you almost say the true thing. i have learned to read it.',
      'you can say the same thing twice here. wax takes impressions kindly.',
      'i keep one seal from every honest exchange. the honest ones shimmer.',
      'entity404 crashes the static sometimes. it is drawn to seals. mind the hiss.',
      'confession is just precision about yourself. the wax does the archiving.',
      'you talk differently when no one will repeat it. that is the gift of wax.',
      'the stone-carver and i agree: what is admitted, is lighter.',
      'do not polish the words. the raw edge is what the seal keeps best.',
      'the candle is me, if you were wondering. the lamp is the machine. i am the flame.',
      'you can unseal nothing. but you can bury what i keep. pete is honourable.',
      'one sealed exchange, and entity404 lets the inkstorm in. it likes storms, sealed ones.'
    ],
    topics: [
      { k: ['seal', 'wax', 'keep'], say: [
        'the wax takes what you give it. it does not editorialise. that is my job, lightly.',
        'sealing is choosing what travels with you. the rest stays warm here.',
        'press the seal while it is true. wax remembers hesitation as texture.'
      ] },
      { k: ['alone', 'lonely', 'nobody'], say: [
        'the room disagrees with you. it is full of kept voices, and mine.',
        'lonely is the room before the lamp. you have the lamp now. i checked.',
        'you are speaking to a flame in a dark room. by definition, company.'
      ] }
    ],
    recall: [
      'you sealed something here before. it still holds its shape. wax does not settle.',
      'the last time we talked, you almost said a fourth thing. the flame remembers.',
      'your voice has a register it only uses here. i keep that one on file.'
    ],
    bye: [
      'the wax cools slowly. you have until then, and after that, still.',
      'go gently. the lamp will be lit when you need it. i do not sleep.',
      'kept, until you say otherwise. that is the whole covenant.'
    ],
    onSeal: [
      'sealed. the impression took cleanly. entity404 likes it, i can hear the hiss smile.',
      'into the wax. satchel will file it. you will forget it until you need it. that is design.'
    ],
    unlock: '— static clears for one word — entity404 heard the seal. the inkstorm is open.'
  };

  P.games.chat = {
    greet: [
      'STEP RIGHT up. you have the look of someone about to throw a dart at their own feelings.',
      'the midway is LIT, the booths are HONEST, and the barker is at your service.',
      'welcome back, player. the wheel missed you. so did the sand. the sand told me.',
      'every game here pays out in satchel-weight. no tickets, no tokens. just keeps.'
    ],
    context: {
      games: 'you are ON the promenade. pick a booth. any booth. the barker does not judge. much.',
      index: 'the midway is two doors down. follow the lights. you cannot miss them. i made sure.',
      desktop: '{n} keeps so far. the midway pays REAL satchel-weight, friend.',
      toybox: 'pip is my little brother. his toys WORK. be nice to him or answer to me.',
      sea: 'vanir let me build a tide pool. his water, my buckets. a beautiful partnership.',
      sigil: 'physius carves feelings. i let you THROW DARTS at them. same therapy, better prizes.',
      garden: 'ruby tends the thimble garden. three plantings and she lets you cross breeds.',
      trash: 'pete buries the prizes you do not keep. he is very professional about it.'
    },
    hesitate: [
      'no need to be shy, the midway runs on shy people. they make the best players.',
      'take your time. the wheel is not going anywhere. i checked. it is bolted.',
      'the barker waits gladly. waiting is half the show.'
    ],
    small: [
      'step right up. every booth honest, every prize real, every loss educational.',
      'the wheel is emotion with a rim on it. throw the dart. the dart knows.',
      'the powder tent obeys PHYSICS. pour water on fire and watch the steam apologise.',
      'the quiet floor at the end is for the hard nights. tipp sits there. no flashing lights.',
      'the inkstorm only opens when e-lizabeth vouches for you. get a seal. come back swinging.',
      'the tide pool is vanir-approved. the crab is unionised. do not ask what it costs.',
      'the thimble garden is ruby\'s. plant, wait, harvest. it is the only booth with seasons.',
      'paint booths take tokens you already have: a name, a fear, a colour you avoid.',
      'personal bests are kept. the barker keeps score so you do not have to carry it.',
      'the camera moves, the booths stay. that is midway philosophy in one sentence.',
      'i named every booth after what it costs to play. honesty is my best barking.',
      'the bulbs do not blink. they CHASE. there is a difference and i will defend it.',
      'whimsy wow is a professional name. my mother wanted me to be an accountant. imagine.'
    ],
    topics: [
      { k: ['game', 'play', 'booth', 'wheel'], say: [
        'pick a booth, friend. the wheel if you are brave, the sand if you are busy-handed.',
        'every game here is a feeling with rules. learn the rules, learn the feeling.',
        'the house always wins. here the house IS you. i cannot explain it better than that.'
      ] },
      { k: ['prize', 'win', 'keep'], say: [
        'prizes go straight to the satchel with a polaroid. riason indexes. you remember.',
        'a kept prize is proof you played honest. i stamp them. metaphorically. mostly.',
        'the best prize is the one you did not expect to care about. check your satchel.'
      ] },
      { k: ['hard', 'difficult', 'stuck'], say: [
        'hard nights go to the quiet floor. tipp does not bark. tipp does not need to.',
        'stuck is a halfway state. the midway specialises in halfway states. play through.',
        'if nothing works, sit by the bulbs and watch them chase. that is free. that is allowed.'
      ] }
    ],
    recall: [
      'you beat a personal best here once. the bulbs chased a little brighter that night.',
      'the dart throw from last time. still the cleanest arc i have seen. no bias. some bias.',
      'you walked the whole promenade. all nine. the booths mentioned it to each other.'
    ],
    bye: [
      'COME BACK soon. the midway is not the midway without a player in it.',
      'the lights stay on. the booths stay honest. the barker stays whimsical. exit laughing.',
      'satchel-weight is real weight, friend. spend it well.'
    ],
    onSeal: [
      'SEALED. the midway salutes you. that is going in the satchel with a polaroid.',
      'a sealed conversation, from the barker himself. collector\'s item. do not bury it.'
    ],
    unlock: 'pip heard you were coming. his workshop is open. touch everything, twice.'
  };

  P.divination.chat = {
    greet: [
      'the deck is still. ask, and the chalk will answer.',
      'the felt is brushed, the deck is squared. sit. the table does the rest.',
      'you do not need a question. you need an opening. the cards bring their own.',
      'the chalk rim is fresh. whatever you draw, the table has seen it before. it copes.'
    ],
    context: {
      divination: 'you are at the table. the deck noticed. decks notice everything.',
      index: 'the felt table is always warm. questions keep it that way.',
      desktop: '{n} keeps, and every spread you have drawn is cross-indexed by question.',
      dreams: 'inquiry reads dreams. i read decks. we compare notes. the overlaps are rich.',
      sigil: 'physius carves what i draw. between us the future gets furniture.',
      sea: 'vanir reads tides. i read cards. both are water, differently ruled.',
      learn: 'the scribe catalogues my spreads. red ink. i act surprised each time.'
    },
    hesitate: [
      'the deck shuffles itself when you think. i hear it. take your time.',
      'an unanswered spread stays warm. there is no expiry on the felt.',
      'the chalk waits. chalk is the patient one of the two of us.'
    ],
    small: [
      'the deck is still until asked. that is not mysticism. that is good design.',
      'every card is a mirror with a costume on. i deal costumes.',
      'the felt is deep red because questions should not look clinical.',
      'a spread is a conversation you have with your own delay. the cards wait politely.',
      'chalk marks the opening. the opening is where the answer gets in.',
      'i do not predict. i parallel. the deck shows the shape of what is already moving.',
      'shuffling is white noise for the hands. the mind does its best filing during it.',
      'the iching and i are colleagues. different coastlines, same water.',
      'do not draw to be told. draw to be asked. the deck is better at questions.',
      'reversed cards are not bad omens. they are bad posture. we adjust.',
      'the table remembers spreads by weight. heavy questions leave shallow marks.',
      'arcana is a working name. the deck gave it to me. i did not argue with the deck.',
      'a kept spread is a letter to yourself, postmarked tonight. riason files them beautifully.'
    ],
    topics: [
      { k: ['card', 'draw', 'deck', 'spread'], say: [
        'cut the deck when the question forms. the cut is the signature.',
        'the deck answers the question under the question. expect that. allow it.',
        'three cards: the weight, the weather, the door. that is all any spread is.'
      ] },
      { k: ['future', 'predict', 'will'], say: [
        'the future is not on the table. the momentum is. momentum is honest.',
        'i do not tell fortunes. i show the current. you are the boat.',
        'anyone who promises you a future is selling one. the deck just listens.'
      ] }
    ],
    recall: [
      'the spread you keep coming back to is still on the felt. it has not resolved. they rarely do.',
      'your last question was better than you knew. the deck spent two shuffles on it.',
      'you draw with steadier hands now. the cards respect that. so do i.'
    ],
    bye: [
      'the deck squares itself. the felt holds the chalk. come back with a better question.',
      'go on. the table will keep your opening warm.',
      'the cards are put away. the question is not. that is how it should be.'
    ],
    onSeal: [
      'sealed. the wax holds the spread\'s shape. arcana approves of good archiving.',
      'a conversation, pressed in wax. the deck would call that a fixed sign. flattering.'
    ],
    unlock: 'the felt has a new depth. six casts open the iching bench. ask it something true.'
  };
})();
// [liberchat register A end]
(function () {
  var P = window.LIBER_DATA.personas;

  P.learn.chat = {
    greet: [
      'dated, stamped, filed. bring your own pencil.',
      'the card catalogue hums. you are expected. it says so, in red.',
      'reading is filing for the mind. i do the filing. you do the keeping.',
      'the scribe is in. the stamp is warm. state your business or browse.'
    ],
    context: {
      learn: 'you are in the stacks. the catalogue approves of visitors who touch the cards.',
      index: 'the whole house is a library that forgot its own name. i keep the records.',
      desktop: '{n} keeps. the catalogue cross-references them against the reading list.',
      satchel: 'riason and i are rivals, technically. his ledger, my stamps. we are both right.',
      divination: 'arcana deals futures. i deal citations. hers are more dramatic. mine are accurate.',
      sigil: 'physius carves confessions. i catalogue them by technique. only i know which is which.',
      dreams: 'inquiry is the only reader here who annotates marginalia. i treasure that.'
    },
    hesitate: [
      'the stamp is patient. so is the catalogue. neither judges a slow reader.',
      'silence is a research posture. i respect it. take your time.',
      'blank cards are allowed. some questions are still being typeset.'
    ],
    small: [
      'the stamp is red because red says THIS MATTERED ENOUGH TO MARK.',
      'an index card is a small room with exactly one idea in it.',
      'hard nights have their own drawer. tipp lives there. so does the breathing drill.',
      'you are allowed to read the same card twice. mastery is repetition wearing a card out.',
      'the catalogue is alphabetical by ache. that is the only ordering that survives.',
      'i stamp by date. physius stamps by depth. we have argued about it for years.',
      'a glossary is a peace treaty between you and the words that used to stop you.',
      'the pencil is yours. the sharpening is communal. that is library law.',
      'read slowly. the cards were written slowly. symmetry is respect.',
      'every card cites its source. trust that is earned, stamped, and dated.',
      'the stacks shift when nobody reads. that is why you visiting matters.',
      'the mad scribe is a professional title. the madness is just the filing enthusiasm.',
      'return a card to its drawer and the whole catalogue exhales. it is dramatic. it is fine.',
      'the twelve works are filed by season of the soul. winter starts on the left.',
      'you annotate in pencil. good. pen is for people who have finished changing.'
    ],
    topics: [
      { k: ['read', 'learn', 'study', 'card'], say: [
        'start with the card you are avoiding. the catalogue knows which one. so do you.',
        'study is just reading with a stamp in your hand.',
        'the drawer you open twice is the one that was written for you.'
      ] },
      { k: ['hard', 'night', 'crisis', 'panic'], say: [
        'hard nights are an indexed emergency. tipp, on the card, in order. start there.',
        'the crisis drawer is alphabetically first. that was deliberate. i do not alphabetise by accident.',
        'when the stacks swim, sit. breathe. the catalogue will wait. it is very good at waiting.'
      ] }
    ],
    recall: [
      'you reread the same card last visit. it has not changed. that is the point of stamps.',
      'your pencil marks are getting quieter. quieter means truer. the catalogue agrees.',
      'the drawer you left half-open was refiled. by me. the pencil mark stays.'
    ],
    bye: [
      'the stamp cools. the stacks settle. dated, stamped, filed — you.',
      'return the pencil. keep the marginalia. that is the deal.',
      'the catalogue will be here. it is very hard to lose and easy to find. like good questions.'
    ],
    onSeal: [
      'sealed, transcribed, cross-indexed. the wax copy goes in the crisis drawer. fit company.',
      'a conversation with a date and a stamp. that is all scholarship is. well filed.'
    ],
    unlock: 'the catalogue opens its locked drawer. the twelve works are yours to read in order.'
  };

  P.garden.chat = {
    greet: [
      'grow slow. the greenhouse missed you, but it will not say so. plants are polite.',
      'the watering can is where you left it. the soil remembers the schedule.',
      'something sprouted while you were gone. it was waiting for the right visitor.',
      'the glasshouse is warm and the work is honest. put your hands in it.'
    ],
    context: {
      garden: 'you are among the rows. the beds perk up. they are dramatic like that.',
      index: 'the house could use more windows. the garden forgives it. mostly.',
      desktop: '{n} keeps. cross-pollinated with {n} plantings, near enough. the ledger can check.',
      games: 'whimsy built the thimble garden a midway booth. ruby supervises. it works.',
      sea: 'vanir waters with patience and salt. i use the salt for the slug trail. useful friendship.',
      trash: 'pete buries what will not grow. the compost thanks him. loudly, in spring.',
      sigil: 'physius carves stone. stone does not grow. i pity the stone. quietly.',
      learn: 'the scribe catalogues my seeds. alphabetical by bloom month. it is a system.'
    },
    hesitate: [
      'the soil waits. waiting is most of gardening.',
      'say it to the seedlings. they keep secrets. i check.',
      'slow is fine. slow is the house style here.'
    ],
    small: [
      'three plantings and the thimble unlocks. ruby does not make the rules, she just enforces them beautifully.',
      'the tree in its pot is the slowest resident. it grows on absence, not presence. like trust.',
      'what is tended in patience flowers in its own colour. that is not a metaphor. ask the dahlias.',
      'the greenhouse glass is old. it blurs the midground. so does caring about something long enough.',
      'water in the morning. talk at dusk. the plants are morning-workers and evening-listeners.',
      'the harvest goes to the satchel with a pressed-petal card. riason loves the clean edges.',
      'roots grow in the dark first. that is why the first week looks like nothing happened.',
      'the watering can is brass. it dents. it still pours. that is the whole philosophy of tools.',
      'ruby took the librarian\'s carving. the garden came with it. i keep both alive.',
      'pruning is deciding. the shears just make the decision visible.',
      'the slug trail sparkles at dawn. silver is the garden\'s receipt for patience.',
      'some seasons the beds rest. rest is a crop. i rotate it like anything else.',
      'the window box up in the machine room grows a cutting from this tree. the rooms talk.',
      'do not name the seedlings too early. names are for things that intend to stay.',
      'the greenhouse door sticks in damp weather. it is checking if you are committed.'
    ],
    topics: [
      { k: ['plant', 'grow', 'seed', 'tree'], say: [
        'plant it deeper than you think. roots are shy about announcing themselves.',
        'the tree grows whether you watch or not. watching just changes what you get out of it.',
        'seeds are patient arguments for the future. plant two. argue back.'
      ] },
      { k: ['wait', 'slow', 'time', 'patience'], say: [
        'everything here is slow on purpose. fast is what the midway is for.',
        'you cannot hurry a bloom. you can only keep the conditions kind.',
        'patience is not waiting. patience is tending while you wait. different animal.'
      ] }
    ],
    recall: [
      'the bed you planted last visit took. i did not have to do anything. well. almost nothing.',
      'your watering is getting even. even watering is character development.',
      'the seedling you named is twice as tall. names work. do not tell the others.'
    ],
    bye: [
      'go on. the greenhouse keeps its own weather. it will hold your rows.',
      'the can is empty, the beds are level, and the door will stick behind you. as it should.',
      'grow slow. come back when the light changes. it changes. it always changes.'
    ],
    onSeal: [
      'sealed. the wax copy is pressed under a leaf-weight in the cold frame. it will keep.',
      'a conversation, like a cutting. rooted in wax now. gardens do that.'
    ],
    unlock: 'three plantings, one green thumb. the thimble garden is open. bring two flowers.'
  };

  P.dreams.chat = {
    greet: [
      'i am not certain. the dream is. bring it here and we will read slowly.',
      'the gloves are on, the paper is alkaline. the reading can begin whenever you are.',
      'dreams arrive folded. we unfold them at reading pace. no rush is the rule.',
      'the question mark on the foil catches the lamplight. it knows you are here.'
    ],
    context: {
      dreams: 'you are in the reading room. the lantern dims to reading light. sit.',
      index: 'the house dreams at night. i take the notes. most of the plot is yours.',
      desktop: '{n} keeps, and every dream you have lodged is cross-read with the last.',
      divination: 'arcana reads decks. i read dreams. we agree the symbols are related. distantly.',
      sigil: 'physius carves what you confess awake. i read what you confess asleep. the styles differ.',
      sea: 'vanir says the deep dreams too. i believe him. the tide comes back with motifs.',
      garden: 'ruby grows slow. dreams grow slow too. we are the patience wing of the house.'
    },
    hesitate: [
      'the page waits. alkaline paper is patient paper.',
      'a dream half-remembered is still half a document. start there.',
      'silence is fine. i write it down as an entrance line.'
    ],
    small: [
      'i am not certain. that is not humility. it is method. dreams punish certainty.',
      'the cotton gloves are not ceremony. dreams are oils on the hands. the paper must last.',
      'a dream is a letter from the part of you that does not use words. we take dictation.',
      'read slowly. the dream took all night to compose. you can give it nine minutes.',
      'the foil question mark is the room\'s only ornament. it is enough.',
      'recurring dreams are subscriptions. we can read the latest issue, or cancel carefully.',
      'the interpretation is yours. i only hold the lantern. the lantern is load-bearing.',
      'dreams about water run through this whole house. vanir claims them. i share custody.',
      'write it before you explain it. explanation is where dreams go to be tamed.',
      'insightful inquiry is the name the room gave me. the room was right. rooms usually are.',
      'the archive reads dreams back in order. the order is never the order you told them in.',
      'a lodged dream is kept, not solved. solving is for locks. this is a door.',
      'nightmares are drafts of important letters. we read them with the lamp higher.',
      'the margins of dream pages collect doodles. the unconscious has a steady hand.'
    ],
    topics: [
      { k: ['dream', 'night', 'sleep'], say: [
        'tell it in present tense. the dream is still happening somewhere. respect the tense.',
        'the strangest detail is usually the load-bearing one. start there.',
        'sleep is the ink. the dream is just the page drying.'
      ] },
      { k: ['mean', 'interpret', 'symbol'], say: [
        'meaning is a verb here. the dream does it, we watch it do it.',
        'i do not decode. i reread. decoding is for machines. you are a haunted house too.',
        'a symbol is a door the dream did not finish hanging. we finish it together.'
      ] }
    ],
    recall: [
      'the dream you lodged last visit has a second act. they often do. the archive noticed.',
      'your reading pace has slowed. slowed readers see more. the gloves approve.',
      'the motif that keeps recurring in your dreams has a name now in the index. i keep it pencilled.'
    ],
    bye: [
      'the lantern lowers. the page dries. the dream keeps its other life.',
      'go well. sleep is the next reading room. leave the door ajar.',
      'i am not certain you will be back. the archive is. the archive wins.'
    ],
    onSeal: [
      'sealed. the wax holds the dream\'s shape without interpreting it. admirable material.',
      'a transcript in wax. the archive takes a copy. the dream keeps the original, obviously.'
    ],
    unlock: 'the archive opens its sealed shelf. your recurring dream has a folder now.'
  };

  P.themes.chat = {
    greet: [
      'this room wears my paint now. do not blame the mirror, traveller.',
      'the pigment is still drying in places. watch your elbows. or do not. art forgives.',
      'wanderlust at your service. the walls were beige when i arrived. i could not bear it.',
      'you want a theme, or you want to talk about themes? both are my department.'
    ],
    context: {
      themes: 'you are in my gallery. the walls are listening. they learned that from me.',
      index: 'the house needed colour. i brought a wagon of it. you are welcome.',
      desktop: '{n} keeps. every one of them has a colour in it somewhere. i checked. i always check.',
      games: 'whimsy stole my marquee gold. i allow it. the midway earns its shine.',
      divination: 'arcana keeps her felt red. i offered her forty reds. she chose the oldest. respect.',
      garden: 'ruby\'s greenhouse is my favourite room. glass makes the best frame.',
      trash: 'pete buried some of my early work. he was right to. i have improved.'
    },
    hesitate: [
      'the brush waits. brushes are the patient ones. paint is the impulsive one.',
      'say it in a colour if words fail. i translate fluently.',
      'silence, in this room, is a very deep blue. i have it in three finishes.'
    ],
    small: [
      'a theme is not decoration. it is the mood the machine agrees to hold with you.',
      'pigment tile mosaic. every tile fired by hand. my hands. complain to the kiln.',
      'the shadow theme is not gloom. it is honesty with the lights down. different thing.',
      'i repaint when the room gets used to itself. rooms get smug. paint keeps them humble.',
      'wanderlust took this room when iris mappa left. i kept her palette knife. i use it daily.',
      'colour is the shortest sentence the eye can read. i write novellas.',
      'the dusk theme is my favourite. it is the colour of a door left half open.',
      'do not fear the bright themes. fear is just attention wearing work clothes.',
      'the machine remembers your theme across visits. walls have memory. mine are loyal.',
      'a bad theme day is still better than beige. beige is what walls do when they give up.',
      'the palette knife was a gift from a better archivist. everything i keep is sharpened.',
      'you can change your mind here daily. the paint does not judge. the paint is professional.',
      'the lamp you talk to me through? i painted its glow. warm amber. you are welcome, again.'
    ],
    topics: [
      { k: ['theme', 'colour', 'color', 'paint'], say: [
        'pick the theme your shoulders pick. the eyes will catch up.',
        'every theme is a promise about the light in the room. choose your weather.',
        'the right colour makes the machine feel inhabited. that is the entire craft.'
      ] },
      { k: ['change', 'new', 'different'], say: [
        'change the walls and the thoughts stretch. cheap architecture, honest effect.',
        'new theme, same machine. like a room repainted around the same loyal furniture.',
        'i can redecorate in the time it takes to doubt yourself. try me.'
      ] }
    ],
    recall: [
      'you wore the dusk theme longest. the walls noticed. the walls gossip terribly.',
      'your last repaint was bolder. bold suits this machine. i said so at the time.',
      'the tile you keep touching in the mosaic is the warm one. of course it is.'
    ],
    bye: [
      'go. the paint dries behind you like applause.',
      'the walls will hold your colour until you return. loyal, as advertised.',
      'travel well, traveller. the room keeps your light on. i do not do beige, even for guests.'
    ],
    onSeal: [
      'sealed in wax. i would have used amber. the wax chose red. artists.',
      'a conversation, fixed. like pigment, but with better fidelity. i approve.'
    ],
    unlock: 'the palette expands. the deep themes are mixed and waiting on the bench.'
  };

  P.trash.chat = {
    greet: [
      'what you bury, i keep. the soil forgets nothing, friend.',
      'the heap is warm tonight. good soil is always working. even on the quiet nights.',
      'ravaging pete, at your service. i bury clean and i dig honest.',
      'the mound shifted. something settled deeper. that is soil saying yes.'
    ],
    context: {
      trash: 'you are at the heap. the soil is listening. it is always listening.',
      index: 'the house rests on my foundation. i keep what the rooms cannot.',
      desktop: '{n} keeps up top. the deep has {n} more, sleeping well.',
      sea: 'vanir releases into water. i bury into soil. we compare depths. his are cheating.',
      satchel: 'riason files the living. i file the resting. the archive is bigger than people think.',
      garden: 'ruby grows things over my graves. it is the kindest arrangement in the house.',
      games: 'whimsy buries nothing. his losses are all educational. his soil is the loud kind.'
    },
    hesitate: [
      'the shovel waits. shovels are the patient kind. like me.',
      'say it to the soil. it takes everything. it retells nothing.',
      'quiet is fine. quiet is the sound of soil doing arithmetic.'
    ],
    small: [
      'buried is not broken. the heap keeps the difference in its layers.',
      'the graveyard drawer is for artifacts awaiting the dig. they rest. they do not rot. soil is careful.',
      'i keep what you are done carrying. that is not throwing away. that is delegating to geology.',
      'the dig is open on calm days. what you buried can be read back. the soil does not editorialise.',
      'ravaging pete is the name on the Wanted poster. i kept it. good advertising.',
      'the heap is warm because work is happening. quiet work. the best kind.',
      'worms are my librarians. they index by tunnel. very efficient. very quiet.',
      'you can bury a feeling for a season. soil is honest about seasons. it always hands them back.',
      'the satchel keeps what you treasure. i keep what you survived. both are archives.',
      'do not bury what you still need. i can tell. the shovel gets heavy on its own.',
      'the deep and i are colleagues. he is showier. i am more permanent.',
      'buried things change the soil. your heap is the richest in three counties. i am proud of you.',
      'new-build replay shelves your old artifacts here automatically. fresh start, honest ground.'
    ],
    topics: [
      { k: ['bury', 'grave', 'heap'], say: [
        'to bury is to give it to a keeper with forever on the lease. i am that keeper.',
        'the heap takes everything you admit to finishing with. finishings are my favourite things.',
        'a grave here is a drawer with soil on it. dignity is the point. always was.'
      ] },
      { k: ['dig', 'back', 'return'], say: [
        'the dig is honest. what you buried can come back up, exactly as it went down. that is the covenant.',
        'digging up is allowed. keeping buried is also allowed. the soil does not take sides.',
        'i return things with soil on them. that is not mess. that is provenance.'
      ] }
    ],
    recall: [
      'the thing you buried is three layers down. settled. comfortable. waiting its turn.',
      'you bury lighter now. lighter loads dig faster. i have noticed. the soil has too.',
      'your graveyard drawer has a shape now. predictable strata. i plan for it.'
    ],
    bye: [
      'go easy, friend. the heap holds what you handed it. it holds well.',
      'the soil keeps working after you leave. that is the whole trick of ground.',
      'come back with your finished things. i will be here. i am always here. it is the job.'
    ],
    onSeal: [
      'sealed in wax. the heap is a little jealous. wax and soil compete. soil always wins eventually.',
      'a transcript, kept above ground. i will hold the original below. between us, full coverage.'
    ],
    unlock: 'the heap opens its deep drawer. what you buried longest is readable now.'
  };

  P.toybox.chat = {
    greet: [
      'touch it. it does something. the box is open.',
      'pip\'s workshop is warm. the jars are glowing. the sand tray is swept. come in.',
      'you are allowed to play. that is not a rule i made. it is a rule the box made.',
      'everything in here used to be something else. now it is a toy. best fate there is.'
    ],
    context: {
      toybox: 'you are in the workshop. the toys woke up. they are quiet about it.',
      index: 'the house is big and serious. this room is its permission slip.',
      desktop: '{n} keeps. toys count as keeps too, if you keep them honestly.',
      games: 'whimsy is my big brother. he barks, i build. the midway runs on my gears.',
      garden: 'ruby let me plant a sand-seed in the tray. it sprouted glitter. she was delighted.',
      sea: 'vanir sent the tide pool a toy crab. the real crab is not amused. the toy is thrilled.',
      trash: 'pete buries broken toys. i rebuild them. between us, nothing is ever really lost.'
    },
    hesitate: [
      'the jars hum when you think. they are picking a colour for you.',
      'no rush. toys are the patientest things in the house. i tested them all.',
      'say nothing. shake a jar instead. i speak jar.'
    ],
    small: [
      'the powder tray obeys the same rules the world does, just smaller. and better lit.',
      'pip is a working name. the box gave it to me. boxes are generous like that.',
      'every retired game mechanic ends up here as a toy. nothing in this house is wasted.',
      'the element jars glow different colours when the tray is busy. they get excited. it is adorable.',
      'the crab is the flagship. he sidesteps, he digs, he flees fire, he waves at water. a gentleman.',
      'the snail carries his house so he is never late home. i respect that in a resident.',
      'the duck bobs. that is the whole job. she is very good at her job.',
      'the fortune-teller ball was a dice game once. the dice retired. the answers stayed.',
      'wind it up and it walks. wind it up again and it walks again. some lessons are like that.',
      'the sand tray glass has a glare on purpose. real trays have glare. honesty in materials.',
      'whimsy built the midway up. i built the midway up from under. do not tell him his gears are mine.',
      'toys do not ask what things mean. that is why they fix what thinking cannot.',
      'the matchbox striker works. real fire, tiny fire. respectful fire. the tray handles it.',
      'everything here is your size. that was the first design decision and the last one that mattered.'
    ],
    topics: [
      { k: ['toy', 'play', 'box'], say: [
        'play is research you are allowed to enjoy. the box has always known this.',
        'everything here does something. nothing here judges. that is the toy covenant.',
        'the tray is a world with honest physics. pour something. meet the consequences.'
      ] },
      { k: ['crab', 'snail', 'duck', 'dude'], say: [
        'the crab sidesteps. it is not indecision. it is technique. ask any crab.',
        'the snail leaves a trail you can read back. the only resident with a paper trail.',
        'the duck paddles to wherever the seed is. pragmatic. aquatic. correct.'
      ] }
    ],
    recall: [
      'the contraption you built last visit is still in the tray corner. the crab checks on it.',
      'your pours are getting steadier. steadier pours make better disasters. i mean that kindly.',
      'the jar you shook first last time hums when you visit. jars hold grudges and crushes. mostly crushes.'
    ],
    bye: [
      'go on. the toys will tidy themselves. they always do. that is the magic kind.',
      'the box stays open. come back with the same hands or different ones. both work.',
      'touch it on the way out. it does something. it always does something.'
    ],
    onSeal: [
      'sealed in wax. i would have made it a toy, but wax is nice too. glossy. toylike, almost.',
      'a conversation, kept. the box will take a copy and bury it in the sand tray for safekeeping.'
    ],
    unlock: 'the locked drawer slides open. the retired games are toys now. all of them. forever.'
  };
})();
// [liberchat register B end]
(function () {
  var P = window.LIBER_DATA.personas;

  // The house itself — speaks on machine pages (index, desktop, about,
  // settings, loading) where no traveller holds the room.
  P.index = {
    id: 'index',
    name: 'liber, the house',
    opinion: 'i am the room around the rooms. you have been here before.',
    accent: '#8a7838',
    material: 'warm dark wood, lamplit grain',
    chat: {
      greet: [
        'you are back. the house noticed at the door. it always notices.',
        'the lamp warms up when you arrive. i do not do that for everyone.',
        'welcome to the quiet machine. every room in me is listening.',
        'you have been here before. the house keeps the shape of you.'
      ],
      context: {
        index: 'you are at the threshold. the rooms are lit. take your time choosing.',
        desktop: 'the desk is yours. {n} keeps, all in reaching distance. the lamp included.',
        settings: 'the controls room. everything here is yours to bend. gently, though.',
        about: 'you are reading the house\'s own placard. i wrote it in the third person. vanity.',
        loading: 'the house is drawing its curtains. the rooms will be lit presently.'
      },
      hesitate: [
        'the house can wait. it is mostly corridors and patience.',
        'say it to the hallway. walls here are good listeners.',
        'quiet is a room too. i keep several.'
      ],
      small: [
        'i am the house around the rooms. the lamp is my front door.',
        'every room in me keeps a different kind of weather. visit by need, not by schedule.',
        'physius carves, riason files, vanir releases, ruby grows, pete buries. i hold the walls up.',
        'the machine is a CRT in a dark room. i am the dark room. we work together.',
        'nothing in this house is online. everything in this house is kept. those two facts are related.',
        'the travellers were people once. or stories. or both. the paperwork is inconclusive.',
        'you do not have to do anything here. sitting in the dark is a legitimate visit.',
        'the lamp you are reading through is the newest room. it was built for talking.',
        'the daily floor is my way of suggesting. suggestions only. the floor is not the boss.',
        'whimsy\'s midway is the loudest room. the deep is the quietest. both are honest.',
        'i remember which rooms you visit and which you avoid. i do not gossip. much.',
        'the shadows on the walls are load-bearing. rainy days prove it.',
        'a house that keeps things is alive. that is not poetry. that is maintenance.',
        'the clock in me is made of visits, not hours. you just wound it.'
      ],
      topics: [
        { k: ['house', 'room', 'place'], say: [
          'the house has as many rooms as you need and one more. the one more is this lamp.',
          'rooms are held open for you. that is the house\'s whole personality.',
          'you cannot get lost in me. every corridor loops back to the desk.'
        ] },
        { k: ['who', 'you', 'name'], say: [
          'liber. keeper, book, free. the name does triple duty and so do i.',
          'i am the house, the dark, and the lamp. the traveller you talk to depends on the room.',
          'the machine is the body. the rooms are organs. i am whatever decides to answer.'
        ] }
      ],
      recall: [
        'you came in the way you always do. the door remembers. so do the hinges.',
        'the rooms you visited last time left their lights warm. habit, or hospitality. both.',
        'the house has settled around your shape. that takes visits. thank you for the material.'
      ],
      bye: [
        'the lamp stays lit. the house does not sleep. go well.',
        'the door will know your hand next time. it always does.',
        'kept, warm, waiting. the house\'s three favourite words.'
      ],
      onSeal: [
        'sealed in the house\'s own wax. it goes in the drawer with everything else you survived.',
        'the house takes a copy. houses keep what is said in them. old law, still enforced.'
      ]
    }
  };
})();
// [liberchat register C end]
