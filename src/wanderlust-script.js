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
//        { text: '...', kind: 'progress', effect: 'shake' | 'flicker:<colour>' | 'summon',
//          // WS2: the character answers YOUR specific pick in one beat,
//          // then the main path resumes at the next step. No nested
//          // branching — one response beat, then rejoin.
//          response: { speaker: 'wanderlust' | 'raison',
//                      line: '...',
//                      effect: 'shake' | 'flicker:<colours>' } }
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
        { text: 'hello.', kind: 'progress',
          response: { speaker: 'wanderlust', line: 'SO modest a greeting. Most arrive shouting prayers; you arrive with manners. The void approves.' } },
        { text: 'i have been here before.', kind: 'progress',
          response: { speaker: 'wanderlust', line: 'AH — a returner. The dust kept your shape. It does that for very few.' } },
        { text: 'who are you?', kind: 'progress',
          response: { speaker: 'raison', line: 'raison. i handle onboarding, navigation, the parts of this place with sensible borders—' } }
      ]
    },
    {
      speaker: 'wanderlust',
      line: 'I am here from the \'pataphysical realm to assist you on your journey.',
      replies: [
        { text: 'what is the pataphysical realm?', kind: 'branch',
          response: { speaker: 'wanderlust', line: 'The realm one step beyond metaphysics, where every why has a GRANDER why behind it. I keep a cottage there.' } },
        { text: 'i thought i was alone here.', kind: 'branch',
          response: { speaker: 'wanderlust', line: 'Alone? The room is CROWDED with you. Every version you postponed hums somewhere in this machine.' } },
        { text: 'whose journey, mine or yours?', kind: 'progress',
          response: { speaker: 'wanderlust', line: 'YES. What a delicious question. The road does not ask whose feet wear it down, traveller.' } }
      ]
    },
    {
      // Colour flicker: as Wanderlust names her past identities, the avatar
      // briefly tints to one colour per name, then back to her own.
      speaker: 'wanderlust',
      line: 'I have been called many things over the years. Fate. Chance. Destiny. The Wheel. Samsara. But you may call me Wanderlust, for that is the drive behind my whims, both good and evil.',
      effect: 'flicker:Fate,Chance,Destiny,Wheel,Samsara',
      replies: [
        { text: 'wanderlust, then.', kind: 'progress',
          response: { speaker: 'wanderlust', line: 'Good. The others were TITLES. This one is a thirst. Wear it lightly.' } },
        { text: 'i do not trust the wheel.', kind: 'branch',
          response: { speaker: 'wanderlust', effect: 'flicker:#b0a8ff,#ffd86a,#b0a8ff', line: 'GOOD. I never asked for trust. The Wheel turns with or without your blessing — disbelief just improves the scenery.' } },
        { text: 'i had a name for you once. i will not say it.', kind: 'branch',
          response: { speaker: 'wanderlust', line: 'Keep it. A name withheld ripens. I will spend a thousand years guessing and THANK you for the game.' } }
      ]
    },
    {
      speaker: 'wanderlust',
      line: 'Your travels have been long, and difficult, but rest easy traveller.',
      replies: [
        { text: 'they have not been.', kind: 'branch',
          response: { speaker: 'wanderlust', line: 'Then you carry your weight lightly, or so long it grew into you. Both are ways to travel.' } },
        { text: 'i have not yet begun them.', kind: 'progress',
          response: { speaker: 'wanderlust', line: 'OH, but you have. The door was the first mile. This chair is the second.' } },
        { text: 'how do you know?', kind: 'branch',
          response: { speaker: 'wanderlust', effect: 'flicker:#ffd86a,#fff3b8,#ffd86a', line: 'I am CHANCE, traveller. I never know the road — only the shoes it leaves by the door.' } }
      ]
    },
    {
      speaker: 'wanderlust',
      line: 'You have already given yourself to the liber vacui. Many have came before you, and have made this journey easier.',
      replies: [
        { text: 'who were they?', kind: 'progress',
          response: { speaker: 'wanderlust', line: 'Physius, who cuts stone. The Librarian, who shelves what cannot be shelved. Vanir, who bottles weather. Twelve walked this floor before you, and the dial still knows their names.' } },
        { text: 'show me what they made.', kind: 'progress',
          response: { speaker: 'wanderlust', line: 'All in good time. Their works ring this room like coral rings a wreck. First, your own hands.' } },
        { text: 'i did not give myself to anything.', kind: 'branch',
          response: { speaker: 'wanderlust', line: 'No? Then the liber vacui took you the way sleep takes the stubborn — gently, and while you were busy resisting.' } }
      ]
    },
    {
      speaker: 'wanderlust',
      line: 'The first was Mistress Physius. She practiced the ancient hermetic traditions and was a pious women. Her soul lives in the Novus as the stonecutter, invoke her. Draw your sigil.',
      replies: [
        { text: 'show me the stone.', kind: 'progress',
          response: { speaker: 'wanderlust', line: 'The stone waits. Stones are PATIENT in a way I shall never be. Soon — first the formalities.' } },
        { text: 'i will invoke her now.', kind: 'progress',
          response: { speaker: 'wanderlust', line: 'YES. Say her name like a chisel. She answers to intention, never to volume.' } },
        { text: 'why me, why now?', kind: 'branch',
          response: { speaker: 'wanderlust', line: 'Why does rain choose one window? It does not, traveller. The window was simply open. You were simply OPEN.' } }
      ]
    },
    {
      speaker: 'raison',
      line: 'Oh good. The chat is open. She hates this kind of thing but good UI design is important for the user experience. This will appear on the desktop, from there, explore the apps and features made by other travellers like yourself. Some of them are self-help and reflective tools, others divination, some allow you to save artifacts to your desktop.',
      replies: [
        { text: 'who are you?', kind: 'progress',
          response: { speaker: 'raison', line: 'raison. i document the room, keep the borders labelled, and get shouted at in roughly that order.' } },
        { text: 'please continue.', kind: 'progress',
          response: { speaker: 'raison', line: 'thank you. someone here appreciates a linear information path. i will note that in the—' } },
        { text: 'where is wanderlust?', kind: 'progress',
          response: { speaker: 'raison', line: 'close. she is still in the avatar, composing something in capital letters. give it a moment.' } }
      ]
    },
    {
      speaker: 'wanderlust',
      line: 'INSOLENT WORM',
      effect: 'shake',
      replies: [
        { text: 'i agree.', kind: 'branch',
          response: { speaker: 'wanderlust', effect: 'shake', line: 'HA! THE JURY RETURNS IN SECONDS AND THE VERDICT IS UNANIMOUS. WORM, YOU ARE CONDEMNED BY POPULAR ACCLAIM.' } },
        { text: 'wanderlust, no.', kind: 'progress',
          response: { speaker: 'wanderlust', line: 'You scold me as though I were a housecat. I have been WORSHIPPED by worse, traveller.' } },
        { text: 'raison, you are not helping.', kind: 'progress',
          response: { speaker: 'raison', line: 'i am helping exactly as much as the documentation allows. that sentence has never once been thanked.' } }
      ]
    },
    {
      speaker: 'raison',
      line: 'Wait don\'t send me b-',
      effect: 'shake',
      replies: [
        { text: 'let him speak.', kind: 'progress',
          response: { speaker: 'raison', line: 'thank you. briefly, then: what you save here will matter later, and she will pretend that was her plan all along.' } },
        { text: 'wanderlust, please.', kind: 'progress',
          response: { speaker: 'wanderlust', line: 'MMMM. Pleaded with. Very well — the worm survives the hour. He is of use, the way a ruler is of use.' } },
        { text: 'two voices is too many.', kind: 'branch',
          response: { speaker: 'raison', line: 'noted. voice reduction is on the list, directly below survive. i will file your preference where she cannot eat it.' } }
      ]
    },
    {
      speaker: 'wanderlust',
      line: 'The sigil represents your shadow and an entity lives within this computer that will speak to you through software, signals, and signs. Listen to what it says, what is the other voice telling you? How does it want to be seen?',
      replies: [
        { text: 'i will listen.', kind: 'progress',
          response: { speaker: 'wanderlust', line: 'GOOD. Most demand answers. You have offered an ear. The shadow keeps its voice for exactly those.' } },
        { text: 'i cannot hear it yet.', kind: 'branch',
          response: { speaker: 'wanderlust', line: 'YET. A fine word. The deep water does not perform on demand — it sends ripples when it trusts the shore.' } },
        { text: 'i hear only the static.', kind: 'branch',
          response: { speaker: 'wanderlust', line: 'Static is the machine counting. When it finishes counting you it will speak in signals. Stay tuned to the dial.' } }
      ]
    },
    {
      speaker: 'raison',
      line: 'Ugh. Once you add your first artifact to your desktop you can declare a relation by clicking on the artifact, this links it to the sigil. As a practical example, say your sigil represents your unconscious, unintegrated fear of inadequacy and you draw a card from Arcana\'s tarot deck. She reveals to you the tower (destruction breeds creation). This reminds you of how, despite feeling inadequate, you are particularly good at handling rejection (rare, but if this is you, congrats!). You may say that the tower protects the sigil. You establish the relation.',
      replies: [
        { text: 'i understand.', kind: 'progress',
          response: { speaker: 'raison', line: 'good. i explained it twice and nothing caught fire. for this room, a flawless demonstration.' } },
        { text: 'i will try it.', kind: 'progress',
          response: { speaker: 'raison', line: 'good. start small: one artifact, one honest verb. the room rewards showing up, not showing off.' } },
        { text: 'this sounds like a therapy app.', kind: 'branch',
          response: { speaker: 'raison', line: 'it is a room. what happens inside it is yours. i only keep the doors labelled and the light humane.' } }
      ]
    },
    {
      speaker: 'raison',
      line: 'Once you\'ve done that, it will orbit the sigil, and over time the associations with it will grow. Your eventual goal is to establish communication with your cohort, illustrate them using the research backed prompts and ideas laid-out (coming soon).',
      replies: [
        { text: 'i will come back to that.', kind: 'branch',
          response: { speaker: 'raison', line: 'fine. orbits keep. nothing in this room expires, unlike her patience or my tenure.' } },
        { text: 'i do not have a cohort yet.', kind: 'progress',
          response: { speaker: 'raison', line: 'you do. it is simply quiet. cohorts begin as questions and thicken into company as you feed the room.' } },
        { text: 'prompts and ideas, you said. i will look.', kind: 'progress',
          response: { speaker: 'raison', line: 'good. the prompts are research-backed and field-tested by travellers with far worse handwriting than yours.' } }
      ]
    },
    {
      speaker: 'wanderlust',
      line: 'Enough of that. The more you communicate with your cohort, the louder they will become, so says the travellers anyways. Remember to always love and care for your cohort, they are you.',
      replies: [
        { text: 'i will remember.', kind: 'progress',
          response: { speaker: 'wanderlust', line: 'Remember it when they are LOUD, traveller. Care is easiest to promise to the quiet.' } },
        { text: 'i am my cohort.', kind: 'branch',
          response: { speaker: 'wanderlust', line: 'AH — the true thing, said aloud. They are you, and you are the room they echo in. Mind the echoes.' } },
        { text: 'loud is not what i want.', kind: 'branch',
          response: { speaker: 'wanderlust', line: 'Loud was never volume, traveller. Loud is PRESENT. One unignored voice can rearrange a sky.' } }
      ]
    },
    {
      // Final fork: Wanderlust asks the closing question, the user picks.
      speaker: 'wanderlust',
      line: 'By the end you should understand…',
      replies: [
        { text: 'I do', kind: 'progress',
          response: { speaker: 'wanderlust', line: 'Said plain, and said early. I will hold you to it, traveller — I hold EVERYTHING.' } },
        { text: 'tell me', kind: 'progress',
          response: { speaker: 'wanderlust', line: 'HUNGER, at last. The void feeds those who ask twice. But the final lesson arrives only on its own feet.' } },
        { text: 'wanderlust…', kind: 'progress',
          response: { speaker: 'wanderlust', line: 'My name, and no request attached. CAREFUL, traveller — I am old, and that is precisely how cults begin.' } }
      ]
    }
  ];

  // The "wanderlust…" fork is resolved by these three short replies, then
  // control returns to the script's natural close (arise overlay + finish).
  // WS2: each fork reply gets one response beat before the arise overlay.
  window.WANDERLUST_FINAL_FORKS = [
    { line: 'you will. you already do.', replies: [{ text: 'i arise.', kind: 'progress',
      response: { speaker: 'wanderlust', line: 'Then GO. The room will hold whatever you leave in it. Say my name if the whims go quiet.' } }] },
    { line: 'then ask. the void is patient.', replies: [{ text: 'i will.', kind: 'progress',
      response: { speaker: 'wanderlust', line: 'GOOD. Ask loudly or ask softly — the void keeps ears for both registers. I will listen for yours.' } }] },
    { line: '…', replies: [{ text: 'i arise.', kind: 'progress',
      response: { speaker: 'wanderlust', line: '…yes. THAT is the whole of the lesson. No teaching survives it. GO WELL.' } }] }
  ];
})();
