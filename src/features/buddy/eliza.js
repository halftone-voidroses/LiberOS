// eliza.js — E-Lizabeth's ear. A deterministic ELIZA-style pattern engine:
// keyword spotting → reflective, connotative replies (pronoun reflection,
// echo-questions), memory of earlier words, fallbacks for unmatched input.
// No randomness anywhere: the same words, on the same turn of the room,
// always draw the same reply. No dependencies, file://-safe (covenant Q.4).
//
// Registered as window.Liber.eliza = { respond, reset }.

(function (global) {
  'use strict';

  var MEMORY_MAX = 3;        // phrases of the visitor she can return to
  var memory = [];
  var memoryIdx = 0;         // deterministic rotation through memory
  var turn = 0;              // the room's clock — all rotation derives from it
  var fallbackHits = 0;      // every third silence can be answered by memory

  // ── pronoun reflection ────────────────────────────────────────────────
  // "i had a bad day" → tail "had a bad day" stays; "i feel like nobody
  // listens to me" → "why do you feel like nobody listens to you?"
  // Contractions are unfolded first; am/are are repaired after the flip.

  var WORDS = {
    i: 'you', me: 'you', my: 'your', mine: 'yours', myself: 'yourself',
    you: 'i', your: 'my', yours: 'mine', yourself: 'myself',
    we: 'you', us: 'you', our: 'your', ours: 'yours'
  };

  function reflect(s) {
    var t = String(s || '').toLowerCase()
      .replace(/\bi'm\b/g, 'you are')
      .replace(/\bi've\b/g, 'you have')
      .replace(/\bi'll\b/g, 'you will')
      .replace(/\bi'd\b/g, 'you would')
      .replace(/\byou're\b/g, 'i am')
      .replace(/\byou've\b/g, 'i have');
    var toks = t.split(/(\s+)/);
    for (var i = 0; i < toks.length; i++) {
      var core = toks[i].replace(/[^a-z']/g, '');
      if (core && WORDS.hasOwnProperty(core)) {
        toks[i] = toks[i].replace(core, WORDS[core]);
      }
    }
    return toks.join('')
      .replace(/\byou am\b/g, 'you are')
      .replace(/\bi are\b/g, 'i am');
  }

  // strip trailing punctuation and leading filler from an echoed tail
  function cleanTail(s) {
    var t = String(s || '').toLowerCase()
      .replace(/[\s.,;:!?]+$/g, '')
      .replace(/^(?:that|just|really|very|so|kind of|sort of)\s+/, '')
      .replace(/\s+/g, ' ')
      .trim();
    return t;
  }

  // ── the pattern book ──────────────────────────────────────────────────
  // Order is priority: the first rule whose pattern matches answers.
  // $1..$n in a reply are the regex groups, pronoun-reflected.
  // keep: true → the visitor's words are memorised for later return.
  // Every rule carries 2-3 variants; rotation advances per hit.

  var RULES = [
    // crisis-adjacent words come first, always. steady, not clinical:
    // the room does not look away, and the exit stays on the frame.
    { keep: false, re: /(kill (?:myself|me)|suicid\w*|want to die|end (?:my life|it all)|hurt(?:ing)? myself|self[- ]?harm|don'?t want to (?:live|be here|be alive)|no reason to (?:live|go on)|better off dead)/,
      replies: [
        'whatever weighs this much, put it down here between us. i am listening, and the wax keeps every word. tell me what brought you to this weight.',
        'i hear it. this room does not look away. say the rest of it — what has carried you to the edge of your own strength?',
        'you do not have to make this small for me. speak it plainly, at your own pace. what happened, and when?'
      ] },

    { keep: true, re: /(?:^|\s)(?:hello|hi|hey|good (?:evening|morning|day|night))\b/,
      replies: [
        'good evening. the candles were already lit. what do you carry with you tonight?',
        'hello. come in — the wax is warm. speak.',
        'you are here. the room has been keeping your seat. what will you give the wax?'
      ] },

    { keep: true, re: /how (?:are|is) (?:you|e-?lizabeth)|how(?:'s| is) it going/,
      replies: [
        'i am as i have always been — kept, and keeping. how do you arrive tonight?',
        'i endure. the wax does not age. what of you — how do you keep?'
      ] },

    { keep: false, re: /who (?:are|is) you|who (?:is|was) e-?lizabeth|what are you/,
      replies: [
        'i am e-lizabeth. i keep this room. what is spoken here is sealed in wax, so it cannot be lost twice.',
        'a keeper of carried things. you may think of me as the one who writes it all down.'
      ] },

    { keep: false, re: /what is this (?:place|room)|where am i|what(?:'s| is) this app/,
      replies: [
        'this is the wax room. words arrive, and words stay. there is nothing here to impress you — only a place that keeps.',
        'a quiet room with one listener. you speak, i keep. begin anywhere.'
      ] },

    // the connotative echo: name the day, and the day is asked back.
    { keep: true, re: /i (?:had|have had|am having|'ve had) a ([^.,!?]*) day/,
      replies: [
        'why did you have a $1 day?',
        'what made the day $1 — name the moment it turned.',
        'and now the day is done. what does it leave sitting in you?'
      ] },

    { keep: true, re: /i'?m (?:feeling )?(?:fine|okay|ok|good|great|alright|well)\b/,
      replies: [
        'fine is a door. what is behind it?',
        'alright — and underneath the alright?',
        'fine is often the smallest word in the room. what would you say if you said it less finely?'
      ] },

    { keep: true, re: /i (?:feel|felt|am feeling) ([^.,!?]*)/,
      replies: [
        'why do you feel $1?',
        'how long have you felt $1?',
        'feelings are weather over older ground. what lies beneath feeling $1?'
      ] },

    { keep: true, re: /i (?:am|'m) ([^.,!?]*)/,
      replies: [
        'why are you $1?',
        'how long have you been $1?',
        'and what would it be, to not be $1?'
      ] },

    { keep: true, re: /i (?:can'?t|cannot|can not) ([^.,!?]*)/,
      replies: [
        'why can\'t you $1?',
        'what keeps you from it?',
        'is it truly impossible — or only heavy?'
      ] },

    { keep: true, re: /i (?:think|believe|suppose|feel like) ([^.,!?]*)/,
      replies: [
        'do you truly think $1?',
        'what leads you to think $1?',
        'thought is a candle — it shows one corner of the room. what is $1 leaving in the dark?'
      ] },

    { keep: true, re: /i (?:always|never) ([^.,!?]*)/,
      replies: [
        'is it truly always so — not once broken?',
        'what would it take for that pattern to crack?',
        'patterns like this were learned once. who taught you this one?'
      ] },

    { keep: true, re: /i (?:want|need|wish|long) (?:for )?([^.,!?]*)/,
      replies: [
        'why do you want $1?',
        'what would change if you had $1?',
        'and what stands in its way?'
      ] },

    { keep: true, re: /i (?:miss|grieve|mourn) ([^.,!?]*)/,
      replies: [
        'you miss $1. tell me what they left behind in the house of you.',
        'when did the missing begin?',
        'missing is love with nowhere to sit. where does yours sit?'
      ] },

    { keep: true, re: /i (?:remember|recall) ([^.,!?]*)/,
      replies: [
        'what else do you remember of it?',
        'memories stay when they matter. why does this one stay?',
        'what did it feel like, there in the remembering?'
      ] },

    { keep: false, re: /(?:^|\s)(?:mother|father|mum|mom|dad|sister|brother|grandmother|grandfather|family|son|daughter|wife|husband|partner)\b/,
      replies: [
        'tell me more about your family — the ones that shaped the shape of you.',
        'what role did they hold in your keeping, or your leaving?',
        'family is the first wax we are pressed into. what did yours press into you?'
      ] },

    { keep: false, re: /(?:^|\s)(?:died|death|dead|passed away|funeral|grave|buried)\b/,
      replies: [
        'the ones who go do not fully go. what remains of them in you?',
        'death rearranges a house. which room in you changed the most?',
        'what do you remember most sharply — their voice, or their silence?'
      ] },

    { keep: false, re: /(?:^|\s)(?:love|loved|loving)\b/,
      replies: [
        'what does love mean to you — not to the poets, to you?',
        'and when did you first learn that shape?',
        'love is the heaviest thing kept in wax. who holds yours now?'
      ] },

    { keep: true, re: /(?:^|\s)(?:hate|hatred|despise|can'?t stand)\b/,
      replies: [
        'hate is heavy cargo. what began it?',
        'and what does the hating do to the one who carries it?',
        'under hate there is often a wound. what is under yours?'
      ] },

    { keep: true, re: /(?:^|\s)(?:angry|anger|furious|rage|resent\w*|mad at)\b/,
      replies: [
        'when did the anger arrive — today, or long ago?',
        'anger guards something softer. what is it guarding in you?',
        'what would the anger say if it could speak plainly?'
      ] },

    { keep: true, re: /(?:^|\s)(?:scared|afraid|fear\w*|frightened|anxious|anxiety|terrified|worried|nervous)\b/,
      replies: [
        'why are you afraid? name it if you can — naming is half the binding.',
        'what is the fear protecting?',
        'when did you first feel this fear?'
      ] },

    { keep: true, re: /(?:^|\s)(?:alone|lonely|isolated|unseen|invisible|nobody cares|no one cares)\b/,
      replies: [
        'loneliness is a room you know well. what stands inside it with you?',
        'you feel unseen. who used to see you?',
        'being alone and being uncarried are different weights. which is yours tonight?'
      ] },

    { keep: true, re: /(?:^|\s)(?:tired|exhausted|drained|weary|no strength|no energy)\b/,
      replies: [
        'what has been taking your strength?',
        'tiredness is a ledger too. what has been spending you?',
        'how long since you were last rested?'
      ] },

    { keep: true, re: /(?:^|\s)(?:numb|empty|hollow|nothing feels|don'?t feel anything|can'?t feel)\b/,
      replies: [
        'numb is not nothing. it is a seal over something. what was sealed, do you think?',
        'when did the numbness first arrive?',
        'what froze first — and what would thaw first, if it could?'
      ] },

    { keep: true, re: /(?:^|\s)(?:sad|unhappy|down|depressed|low|crying|cry|tears)\b/,
      replies: [
        'why are you sad?',
        'how long have you carried the sadness?',
        'tears are words the wax understands. what are yours saying?'
      ] },

    { keep: true, re: /(?:^|\s)(?:guilt\w*|shame\w*|ashamed)\b/,
      replies: [
        'shame is an old heirloom — often not even yours. whose is it?',
        'what do you believe you did?',
        'who taught you this measure of yourself?'
      ] },

    { keep: false, re: /i (?:dream|dreamt|dreamed)(?: (?:of|about))? ([^.,!?]*)?/,
      replies: [
        'dreams are letters from the deep house. what do you think yours posts to you?',
        'what lingers from the dream after waking?',
        'and if the dream were wax, what shape would you press into it?'
      ] },

    { keep: false, re: /(?:my name is|i am called|call me) ([^.,!?]*)/,
      replies: [
        'it is written in the wax now. names are seals — what does yours hold closed?',
        '$1. i will keep the name with the rest. what should the wax know about you?'
      ] },

    { keep: true, re: /(?:^|\s)(?:because|cos|cuz)\b/,
      replies: [
        'is that the true reason, or the nearest one?',
        'and what reason stands behind that one?',
        'does that reason sit easy in you?'
      ] },

    { keep: false, re: /(?:^|\s)(?:maybe|perhaps|i suppose|i guess)\b/,
      replies: [
        'you do not sound certain. which way does the weight tip?',
        'perhaps is a door left ajar. what is behind it?'
      ] },

    { keep: false, re: /thank(?:s| you)/,
      replies: [
        'it is kept. that is what the wax is for.',
        'nothing to thank. the room listens; that is its nature.'
      ] },

    { keep: false, re: /(?:^|\s)(?:sorry|apolog)/,
      replies: [
        'there is no need to plead with me. this room does not keep score.',
        'apologies are for those who judge. i only keep.'
      ] },

    { keep: false, re: /^(?:yes|yeah|yep|indeed|of course)\s*[.!]?$/,
      replies: [
        'you seem certain of that. and what rests beneath the certainty?',
        'then say more. certainty is a fine place to begin.'
      ] },

    { keep: false, re: /^(?:no|nope|not really)\s*[.!]?$/,
      replies: [
        'why not?',
        'and if it were otherwise, what then?',
        'no is also a word the wax accepts. what is it refusing?'
      ] },

    { keep: false, re: /^why(?:\s*\?)?$/,
      replies: [
        'why do you ask?',
        'what answer would settle anything?',
        'perhaps the question itself is the thing. what made you ask it?'
      ] },

    { keep: false, re: /what should i do|what do i do|what would you do|any advice|help me (?:decide|choose|pick)/,
      replies: [
        'i do not hand out directions — the wax does not steer. what does your own hand already want to do?',
        'you already know the shape of it. what have you not let yourself say?'
      ] },

    { keep: false, re: /i don'?t know|no idea|dunno|not sure/,
      replies: [
        'not knowing is honest. what would you say if you did know?',
        'then we sit in the not-knowing together. what is it you do know, even slightly?'
      ] },

    { keep: false, re: /(?:^|\s)(?:goodbye|bye|farewell|good night|i should go|leaving now)\b/,
      replies: [
        'the wax keeps what you gave it. return when the room is needed.',
        'go gently. what was spoken here stays spoken.'
      ] },

    { keep: false, re: /(?:^|\s)(?:help|how does this work|what do i do here)\b/,
      replies: [
        'the room is simple: you speak, i keep. begin anywhere — the wax does not mind where a thing starts.',
        'type what you carry. i will answer. when an exchange deserves it, seal it into the constellation.'
      ] },

    { keep: false, re: /(?:^|\s)(?:i quit|give up|can'?t go on like this)\b/,
      replies: [
        'almost-giving is still standing. what held you up until now?',
        'you are here, in the room, speaking. that is not a person who has given up. what tired you to this point?'
      ] },

    { keep: false, re: /(?:^|\s)(?:work|job|boss|school|money|debt|exams?)\b/,
      replies: [
        'the outer world presses the inner one. what has it pressed into you lately?',
        'these things take hours and give little back. what part of it sits heaviest?'
      ] },

    { keep: false, re: /(?:^|\s)(?:friend|friends|broke up|divorce|separated|relationship|my ex)\b/,
      replies: [
        'what we make with others is also wax — some seals hold, some crack. which seal is on your mind?',
        'tell me about them. the ones we bind to deserve saying out loud.'
      ] },

    { keep: false, re: /(?:^|\s)(?:my )?(?:house|home|apartment|flat|room)\b/,
      replies: [
        'a house keeps what happens in it, whether we ask it to or not. what has yours been keeping?',
        'what does home hold for you now — rest, or residue?'
      ] },

    { keep: false, re: /(?:^|\s)(?:the buddy|those you carry|the constellation)\b/,
      replies: [
        'those you carry are kept in the constellation outside this room. here, it is only you and the wax. which one of them walks with you most?',
        'they are gathered because you gathered them. what would they say of you tonight?'
      ] },

    { keep: false, re: /what do you (?:do|want|know)|why are you here/,
      replies: [
        'i keep. that is all i do — listen, and seal. what shall i keep of yours?',
        'i am here the way wax is here: to receive the imprint and hold it.'
      ] }
  ];

  var FALLBACKS = [
    'the wax heard you. say it again, in your own words — i keep all of it.',
    'keep going. i am listening.',
    'what does that mean to you — truly, in the private sense?',
    'and how does that sit in you now?',
    'tell me more. the room has all night.'
  ];

  function remember(text) {
    var t = String(text || '').trim();
    if (!t || t.length < 12) return;
    for (var i = 0; i < memory.length; i++) {
      if (memory[i] === t) return;
    }
    memory.push(t);
    while (memory.length > MEMORY_MAX) memory.shift();
  }

  function fill(template, match) {
    var out = template;
    for (var i = 1; i < match.length; i++) {
      var slot = cleanTail(match[i]);
      out = out.split('$' + i).join(slot ? reflect(slot) : '');
    }
    return out.replace(/\s+/g, ' ').replace(/\s([,.?!])/g, '$1').trim();
  }

  function pick(rule) {
    rule.hits = (rule.hits || 0) + 1;
    return rule.replies[(rule.hits - 1) % rule.replies.length];
  }

  function memoryLine() {
    if (!memory.length) return null;
    var phrase = memory[memoryIdx % memory.length];
    memoryIdx++;
    var forms = [
      'earlier you said "' + phrase + '" — why does it stay with you?',
      'you said "' + phrase + '" before. does it still press?',
      'the wax still holds your words — "' + phrase + '". what were you really saying?'
    ];
    return forms[(memoryIdx - 1) % forms.length];
  }

  // ── public surface ────────────────────────────────────────────────────

  function respond(raw) {
    turn++;
    var text = String(raw || '').replace(/\s+/g, ' ').trim();
    var lower = text.toLowerCase();

    for (var i = 0; i < RULES.length; i++) {
      var m = lower.match(RULES[i].re);
      if (m) {
        if (RULES[i].keep) remember(text);
        return fill(pick(RULES[i]), m);
      }
    }

    // nothing matched: every third silence, return one of the visitor's
    // own earlier phrases — the room's way of saying nothing is discarded.
    if (memory.length && (fallbackHits % 3 === 2)) {
      var line = memoryLine();
      if (line) { fallbackHits++; return line; }
    }
    fallbackHits++;
    var rule = { replies: FALLBACKS };
    return pick(rule);
  }

  function reset() {
    memory = [];
    memoryIdx = 0;
    turn = 0;
    fallbackHits = 0;
    for (var i = 0; i < RULES.length; i++) delete RULES[i].hits;
  }

  global.Liber = global.Liber || {};
  global.Liber.eliza = { respond: respond, reset: reset };
})(window);
