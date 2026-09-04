// twelve-works.data.js — the twelve works (docs/gamification.md mechanic 3,
// reskinned as lore: each traveller witnessed your first work in their room,
// and beside each tier suggests a research-backed art-therapy prompt).
// Shape per entry: { id, traveller, work, prompt: { text, cite, exercise } }.
// GROUNDING IS LAW: every cite exists in data/citations.json and matches its
// claimedFor; every exercise exists in data/exercises.json (trash carries no
// exercise — nothing in the shelf covers interment, and nothing is invented).
// Prompt shape follows the original brief: "if <interpretation> were
// challenged, what would <cohort> do?" — each instructs to write or draw.
// {cohort} and {intention} are filled at render time from state (same slots
// the prompt engine uses). file://-safe, no fetch.
window.LIBER_DATA = window.LIBER_DATA || {};
window.LIBER_DATA.twelveWorks = [
  {
    id: 'sigil',
    traveller: 'mistress physius',
    work: 'the first cutting',
    prompt: {
      text: 'if {intention} were challenged, what would {cohort} do? write the answer in the margin of the stone. or draw the stroke that answers.',
      cite: 'csikszentmihalyi-1990',
      exercise: 'emotion-drawing'
    }
  },
  {
    id: 'satchel',
    traveller: 'the librarian',
    work: 'the first keeping',
    prompt: {
      text: 'if what you kept were challenged, what would {cohort} defend first? write the index line. draw the tab if the line will not hold.',
      cite: 'linehan-1993',
      exercise: 'mood-journal-collage'
    }
  },
  {
    id: 'sea',
    traveller: 'vanir',
    work: 'the first release',
    prompt: {
      text: 'if what the water took were challenged, what would {cohort} reach for? draw the shape of the release. or write it, and let the tide edit.',
      cite: 'porges-2011',
      exercise: 'grounded-mandala'
    }
  },
  {
    id: 'cohort',
    traveller: 'e-lizabeth',
    work: 'the first gathering',
    prompt: {
      text: 'if one of the carried were challenged, what would the household do? write their name as you first knew it. draw the seal you would press for them.',
      cite: 'schwartz-1995',
      exercise: 'relationship-circle'
    }
  },
  {
    id: 'abstract',
    traveller: 'entity404',
    work: 'the first transmission',
    prompt: {
      text: 'the void kept your cut. if the pairs were challenged, what would {cohort} answer? cut once more. write what lands. or draw what the phosphor kept.',
      cite: 'bok-2002',
      exercise: 'cut-up-desk'
    }
  },
  {
    id: 'games',
    traveller: 'whimsy wow',
    work: 'the first play',
    prompt: {
      text: 'step right up — if the booth\'s little loss were challenged, what would {cohort} play next? draw the prize nobody won. or write the act you would stage!',
      cite: 'linehan-1993',
      exercise: 'emotion-wheel'
    }
  },
  {
    id: 'divination',
    traveller: 'arcana',
    work: 'the first spread',
    prompt: {
      text: 'the deck is still. if the card\'s interpretation were challenged, what would {cohort} do? write the challenge. draw the card that answers it.',
      cite: 'i-ching',
      exercise: 'card-table'
    }
  },
  {
    id: 'learn',
    traveller: 'the mad scribe',
    work: 'the first stamped page',
    prompt: {
      text: 'the lesson is stamped. if it were challenged by the week you have had, what would {cohort} underline? write one dated line. draw the diagram the margin is owed.',
      cite: 'hugill-2012',
      exercise: 'visual-journaling'
    }
  },
  {
    id: 'methodology',
    traveller: 'raison',
    work: 'the first method',
    prompt: {
      text: 'the phrase went through the mirror and returned altered. if the alteration were challenged, what would {cohort} argue? write the argument in full sentences. draw the two columns: what held, what turned.',
      cite: 'nagarjuna-mmk',
      exercise: 'redaction-mirror'
    }
  },
  {
    id: 'themes',
    traveller: 'iris mappa',
    work: 'the first repainting',
    prompt: {
      text: 'the machine wears your chosen country now. if the pigment were challenged by the light outside, what would {cohort} remap? draw the room in the colour you avoided. or write what the old skin was protecting.',
      cite: 'csikszentmihalyi-1990',
      exercise: 'mindful-coloring'
    }
  },
  {
    id: 'relation',
    traveller: 'e-lizabeth',
    work: 'the first link',
    prompt: {
      text: 'the link is closed. if the verb were challenged — is it true? — what would {cohort} swear? write the vow the verb is shorthand for. draw the two links it joins.',
      cite: 'jung-red-book',
      exercise: 'alternative-perception'
    }
  },
  {
    id: 'trash',
    traveller: 'ravaging pete',
    work: 'the first burial',
    prompt: {
      text: 'what you buried is kept, friend. if the burial were challenged, what would {cohort} plant over it? draw the ground as it looks now. or write what the soil was told.',
      cite: 'herman-1992',
      exercise: null
    }
  }
];
