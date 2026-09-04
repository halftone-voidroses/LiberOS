// wanderlust-script.js — the verbatim first-run dialogue
// Wanderlust speaks, Raison interrupts, the player picks a reply.
// At the end of the script the tutorial window closes and the user
// has an empty desktop with a single dim '?'. Sigil is unlocked.
//
// Script shape:
//   { speaker: 'wanderlust' | 'raison',
//     line:    '...',
//     replies: [
//        { text: '...', kind: 'progress' },   // main-line advance, bright button
//        { text: '...', kind: 'branch'   },   // mood branch, "ok." italic style
//        { text: '...', kind: 'progress', effect: 'shake' | 'flicker:<colour>' | 'summon' }
//     ]
//   }
//
// The kind is inferred from the trailing X (legacy), but the explicit field
// wins. `effect` triggers a one-shot CSS animation on the .machine element.

(function () {
  // The summoning poem is shown BEFORE any chat window opens, line by line.
  window.WANDERLUST_SUMMON = [
    'wanderlust is being summoned, please wait…',
    'I summon you from somewhere else..',
    '…',
    '…To find the pieces of ourselves..',     // SCREEN SHAKE
    '…With violet eyes and sun like skin…',   // chat window opens
    '…Come to the void and sing again..',
    '…'
  ];

  window.WANDERLUST_SCRIPT = [
    {
      speaker: 'wanderlust',
      line: 'Oh! Hello!',
      replies: [
        { text: 'hello.', kind: 'progress' },
        { text: 'i have been here before.', kind: 'progress' },
        { text: 'who are you?', kind: 'progress' }
      ]
    },
    {
      speaker: 'wanderlust',
      line: 'I am here from the \'pataphysical realm to assist you on your journey.',
      replies: [
        { text: 'what is the pataphysical realm?', kind: 'branch' },
        { text: 'i thought i was alone here.', kind: 'branch' },
        { text: 'whose journey, mine or yours?', kind: 'progress' }
      ]
    },
    {
      // Colour flicker: as Wanderlust names her past identities, the avatar
      // briefly tints to one colour per name, then back to her own.
      speaker: 'wanderlust',
      line: 'I have been called many things over the years. Fate. Chance. Destiny. The Wheel. Samsara. But you may call me Wanderlust, for that is the drive behind my whims, both good and evil.',
      effect: 'flicker:Fate,Chance,Destiny,Wheel,Samsara',
      replies: [
        { text: 'wanderlust, then.', kind: 'progress' },
        { text: 'i do not trust the wheel.', kind: 'branch' },
        { text: 'i had a name for you once. i will not say it.', kind: 'branch' }
      ]
    },
    {
      speaker: 'wanderlust',
      line: 'Your travels have been long, and difficult, but rest easy traveller.',
      replies: [
        { text: 'they have not been.', kind: 'branch' },
        { text: 'i have not yet begun them.', kind: 'progress' },
        { text: 'how do you know?', kind: 'branch' }
      ]
    },
    {
      speaker: 'wanderlust',
      line: 'You have already given yourself to the liber vacui. Many have came before you, and have made this journey easier.',
      replies: [
        { text: 'who were they?', kind: 'progress' },
        { text: 'show me what they made.', kind: 'progress' },
        { text: 'i did not give myself to anything.', kind: 'branch' }
      ]
    },
    {
      speaker: 'wanderlust',
      line: 'The first was Mistress Physius. She practiced the ancient hermetic traditions and was a pious women. Her soul lives in the Novus as the stonecutter, invoke her. Draw your sigil.',
      replies: [
        { text: 'show me the stone.', kind: 'progress' },
        { text: 'i will invoke her now.', kind: 'progress' },
        { text: 'why me, why now?', kind: 'branch' }
      ]
    },
    {
      speaker: 'raison',
      line: 'Oh good. The chat is open. She hates this kind of thing but good UI design is important for the user experience. This will appear on the desktop, from there, explore the apps and features made by other travellers like yourself. Some of them are self-help and reflective tools, others divination, some allow you to save artifacts to your desktop.',
      replies: [
        { text: 'who are you?', kind: 'progress' },
        { text: 'please continue.', kind: 'progress' },
        { text: 'where is wanderlust?', kind: 'progress' }
      ]
    },
    {
      speaker: 'wanderlust',
      line: 'INSOLENT WORM',
      effect: 'shake',
      replies: [
        { text: 'i agree.', kind: 'branch' },
        { text: 'wanderlust, no.', kind: 'progress' },
        { text: 'raison, you are not helping.', kind: 'progress' }
      ]
    },
    {
      speaker: 'raison',
      line: 'Wait don\'t send me b-',
      effect: 'shake',
      replies: [
        { text: 'let him speak.', kind: 'progress' },
        { text: 'wanderlust, please.', kind: 'progress' },
        { text: 'two voices is too many.', kind: 'branch' }
      ]
    },
    {
      speaker: 'wanderlust',
      line: 'The sigil represents your shadow and an entity lives within this computer that will speak to you through software, signals, and signs. Listen to what it says, what is the other voice telling you? How does it want to be seen?',
      replies: [
        { text: 'i will listen.', kind: 'progress' },
        { text: 'i cannot hear it yet.', kind: 'branch' },
        { text: 'i hear only the static.', kind: 'branch' }
      ]
    },
    {
      speaker: 'raison',
      line: 'Ugh. Once you add your first artifact to your desktop you can declare a relation by clicking on the artifact, this links it to the sigil. As a practical example, say your sigil represents your unconscious, unintegrated fear of inadequacy and you draw a card from Arcana\'s tarot deck. She reveals to you the tower (destruction breeds creation). This reminds you of how, despite feeling inadequate, you are particularly good at handling rejection (rare, but if this is you, congrats!). You may say that the tower protects the sigil. You establish the relation.',
      replies: [
        { text: 'i understand.', kind: 'progress' },
        { text: 'i will try it.', kind: 'progress' },
        { text: 'this sounds like a therapy app.', kind: 'branch' }
      ]
    },
    {
      speaker: 'raison',
      line: 'Once you\'ve done that, it will orbit the sigil, and over time the associations with it will grow. Your eventual goal is to establish communication with your cohort, illustrate them using the research backed prompts and ideas laid-out (coming soon).',
      replies: [
        { text: 'i will come back to that.', kind: 'branch' },
        { text: 'i do not have a cohort yet.', kind: 'progress' },
        { text: 'prompts and ideas, you said. i will look.', kind: 'progress' }
      ]
    },
    {
      speaker: 'wanderlust',
      line: 'Enough of that. The more you communicate with your cohort, the louder they will become, so says the travellers anyways. Remember to always love and care for your cohort, they are you.',
      replies: [
        { text: 'i will remember.', kind: 'progress' },
        { text: 'i am my cohort.', kind: 'branch' },
        { text: 'loud is not what i want.', kind: 'branch' }
      ]
    },
    {
      // Final fork: Wanderlust asks the closing question, the user picks.
      speaker: 'wanderlust',
      line: 'By the end you should understand…',
      replies: [
        { text: 'I do', kind: 'progress' },
        { text: 'tell me', kind: 'progress' },
        { text: 'wanderlust…', kind: 'progress' }
      ]
    }
  ];

  // The "wanderlust…" fork is resolved by these three short replies, then
  // control returns to the script's natural close (arise overlay + finish).
  window.WANDERLUST_FINAL_FORKS = [
    { line: 'you will. you already do.', replies: [{ text: 'i arise.', kind: 'progress' }] },
    { line: 'then ask. the void is patient.', replies: [{ text: 'i will.', kind: 'progress' }] },
    { line: '…', replies: [{ text: 'i arise.', kind: 'progress' }] }
  ];
})();