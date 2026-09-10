// fate.data.js — the fate-circle's lines, one voice per room.
// file://-safe, no fetch. Each room: voice (who speaks) + two lines
// (shown first, then on tap). House rules: suggest, never nag; no
// encouragement; lowercase-leaning; Wanderlust's theatrics excepted.
window.LIBER_DATA = window.LIBER_DATA || {};
window.LIBER_DATA.fate = {
  desktop:     { voice: 'wanderlust', lines: ['the town fills window by window. begin with the stone.', 'the floor suggests. nothing is owed.'] },
  sigil:       { voice: 'mistress physius', lines: ['the stone remembers what the hand confesses.', 'say it like a chisel. intention, never volume.'] },
  buddy:      { voice: 'e-lizabeth', lines: ['speak, and it is kept.', 'two exchanges, then the wax can hold them.'] },
  satchel:     { voice: 'riason', lines: ['kept once, kept well. the margins take notes.', 'everything kept is kept once. index it well.'] },
  sea:         { voice: 'vanir', lines: ['the water takes. it does not keep.', 'come down anyway. the breath is slow.'] },
  garden:      { voice: 'ruby', lines: ['grow slow. fill the stone, plant it below.', 'what is tended in patience flowers in its own colour.'] },
  dreams:      { voice: 'insightful inquiry', lines: ['i am not certain. bring the dream anyway.', 'a symbol, a weight, a question. never a verdict.'] },
  games:       { voice: 'whimsy wow', lines: ['step right up! five games, and every one keeps.', 'pick one on the left. the pitch tells the rest.'] },
  toybox:      { voice: 'pip', lines: ['touch it. it does something.', 'the box is open. put your hands in.'] },
  divination:  { voice: 'arcana', lines: ['the deck is still. ask.', 'the chalk answers. you read.'] },
  learn:       { voice: 'the mad scribe', lines: ['one drawer a visit. the † marks what is cited.', 'dated, stamped, filed. bring your own pencil.'] },
  themes:      { voice: 'wanderlust', lines: ['repaint the room. do not blame the mirror.', 'this room wears my paint now.'] },
  trash:       { voice: 'ravaging pete', lines: ['what you bury, i keep.', 'the soil forgets nothing, friend.'] },
  settings:    { voice: 'riason', lines: ['the doors stay labelled. the light stays humane.', 'wipe returns everything to loam. nothing else does.'] }
};
