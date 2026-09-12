// learn.js — The Librarian. Subject cards with comprehensive definitions.
// Each subject is a clickable box; click opens the full card body.
// No state machine — this is reference material, not a graded curriculum.

(function () {
  var CARDS = [
    {
      num: '01', title: 'Pataphysics',
      body: 'pataphysics is the science of imaginary solutions. coined by alfred jarry (1873–1907)<button type="button" class="learn-fn" data-cite="jarry-1911" aria-label="citation">†</button>, it treats the imaginary as if it were real. it is a science of exceptions, of the particular, of supplementary universes — the place where the rule breaks, and the breaking is the lesson. in this vacui it is the ground beneath everything else.',
      key: 'science · imaginary solutions · exceptions'
    },

    {
      num: '02', title: 'Jungian Shadow',
      body: 'the shadow is the part of the personality that has been pushed out of conscious light. it is not the dark self; it is the unlit self. jung described it as everything the conscious person refuses to acknowledge about themselves<button type="button" class="learn-fn" data-cite="jung-alchemy-1968" aria-label="citation">†</button>, and in aion he sharpened it further: the shadow is the moral problem that challenges the whole ego-personality<button type="button" class="learn-fn" data-cite="jung-cw9ii" aria-label="citation">†</button>. it carries rejected weaknesses — and, buried with them, unclaimed strengths: tenderness, appetite, ambition, exiled for being inconvenient rather than evil. readers call those buried strengths the "noble shadow." not criminality — the good stuff that got locked up with the bad. von franz traced the meeting order: the shadow is encountered first in others and in the world, worn by the people who irritate us most, because the trait we cannot own is the one we keep finding in the crowd<button type="button" class="learn-fn" data-cite="von-franz-1974" aria-label="citation">†</button>. anna freud mapped the smuggling routes it travels by: repression, projection, denial, reaction formation, intellectualisation, sublimation, each a way the ego moves unwanted material across the border without a receipt<button type="button" class="learn-fn" data-cite="anna-freud-1936" aria-label="citation">†</button>. because the defences work in the dark, self-reading comes out distorted; what you insist you are not is often filed under your own name. meeting the shadow is the first step towards becoming whole.',
      key: 'depth psychology · projection · integration'
    },

    {
      num: '03', title: 'DBT',
      body: 'dialectical behaviour therapy was developed by marsha linehan in the 1980s for people whose emotions arrive like weather<button type="button" class="learn-fn" data-cite="linehan-1993" aria-label="citation">†</button>. its core skill is "wise mind" — what we intuitively know to be true under the blanket of emotion. the dialectic is the holding, not the choosing: i am doing my best, and i can do better, both at once. its skills run in four modules: mindfulness, distress tolerance (TIPP), emotion regulation, and interpersonal effectiveness (DEAR MAN). each is a way of surviving the wave without adding to the wreckage. the buddy dialogue is part of the treatment as linehan built it, not an ornament on it.',
      key: 'skills group · wise mind · linehan'
    },

    {
      num: '04', title: 'The Inner Household',
      body: 'two analysts mapped the household inside. klein drew the inner world as peopled: the people of your life, taken in whole, live on inside as objects with moods and agendas, and the buddy here is read as inner object rather than as metaphor<button type="button" class="learn-fn" data-cite="klein-1932" aria-label="citation">†</button>. winnicott found the door between the worlds: the transitional object — the blanket, the teddy, the first not-me possession — the thing that is neither me nor quite the world, and by being both opens an intermediate zone where playing, keeping, and the first culture happen<button type="button" class="learn-fn" data-cite="winnicott-1953" aria-label="citation">†</button>. the satchel lives in that zone. its kept artifacts — the first castings, the gem drafts, the seeds from the garden — are transitional objects in the strict sense: held between inner and outer, worthless to anyone else, load-bearing for the keeper. the workbook is a household because the things in it are kept, and keeping is the oldest intermediate act there is.',
      key: 'klein · winnicott · transitional object · satchel'
    },

    {
      num: '05', title: 'Shadow Work',
      body: 'shadow work is the practice of sitting with what you would rather not. it is done with care, with a witness, with a buddy, never alone in the dark — the workbook keeps lukoff\'s caution that depth waits until the ground holds<button type="button" class="learn-fn" data-cite="lukoff-1985" aria-label="citation">†</button>. the material is specific: parts of self that have been projected onto others or exiled entirely. von franz supplies the mechanics — the shadow is met out there first, in the witch and the pursuer and the difficult acquaintance, until it is called back in<button type="button" class="learn-fn" data-cite="von-franz-1974" aria-label="citation">†</button>. the work is the withdrawal of projection: name each projection, then meet what it was covering — one at a time, in turn. anna freud\'s catalogue explains why the call goes unanswered at first: repression and denial stand at the door as the ego\'s keepers, and they were appointed for good reason<button type="button" class="learn-fn" data-cite="anna-freud-1936" aria-label="citation">†</button>. schwartz\'s parts model supplies the manners: you do not destroy the exiled part, you give it a seat at the table and ask what it has been protecting<button type="button" class="learn-fn" data-cite="schwartz-1995" aria-label="citation">††</button>. kalsched opens the same door from the clinical side: trauma shuts the heart, and only affect-focused presence — feeling words, never arguments — opens it again<button type="button" class="learn-fn" data-cite="kalsched-2020-closed-heart" aria-label="citation">†</button>.',
      key: 'practice · withdrawal of projection · buddy'
    },

    {
      num: '06', title: 'Divination',
      body: 'divination is the practice of letting a structured randomness speak. whether the generator is tarot cards, the i ching, a deck of bones, or the pauses between breaths — the shape that emerges is read as if it were a letter from the unconscious. it does not predict. it makes a shape, and the shape is yours to read. the i ching is the oldest machine in the set, a six-line engine whose counsel arrives without cause<button type="button" class="learn-fn" data-cite="i-ching" aria-label="citation">†</button>. the casting itself is an exercise in deep attention, the same absorption the flow literature describes for drawing and ritual making<button type="button" class="learn-fn" data-cite="csikszentmihalyi-1990" aria-label="citation">†</button>. read the hexagram the way you read a buddy: slowly, and against your first guess — assume the first reading flatters the daytime attitude, then look for what it avoids. the counsel may answer the situation surrounding your question rather than the sentence you asked — the situation asked, through you.',
      key: 'randomness · reading · archana'
    },

    {
      num: '07', title: 'Buddy Amplification',
      body: 'a buddy begins as a container for a part of you that does not yet have language. draw the contour of a feeling, not the likeness of a face. the looser the line, the more it will hold. once made and kept, the buddy accumulates charge. draw it again. look at it until you forget what it is<button type="button" class="learn-fn" data-cite="csikszentmihalyi-1990" aria-label="citation">†</button>. then look once more. this tending has a clinical ancestor: jung called it deliberate fantasy activity, the method of the transcendent function — invite the image, give it ink, let it answer on the page<button type="button" class="learn-fn" data-cite="jung-transcendent-1957" aria-label="citation">†</button>. the red book is what the method looks like when it is followed for years without flinching<button type="button" class="learn-fn" data-cite="jung-red-book" aria-label="citation">†</button>. von franz read the whole business in alchemical terms: a feeling as first matter, worked and reworked through the stages the alchemists named, until the opus yields what it was carrying<button type="button" class="learn-fn" data-cite="von-franz-1980" aria-label="citation">†</button>. keep the buddy where you can see it. charge is attention, banked. lemos names what the charge is: mana, the power a made and kept thing carries, whose completion belongs to telesphoros — the one who finishes, and releases<button type="button" class="learn-fn" data-cite="lemos-2020-mana" aria-label="citation">†</button>.',
      key: 'drawing · amplification · alchemical opus'
    },

    {
      num: '08', title: 'Buddy Work', thesis: true,
      body: 'the figures who circle the buddy are not invented — they are remembered. you name them, draw them, and they begin to speak back; elsewhere people report the heard other the same way, and culture shapes the tone if not the fact<button type="button" class="learn-fn" data-cite="luhrmann-2015" aria-label="citation">†</button>. klein called the residents of the inner world objects: the mother, the rival, the judge, carried inside as figures with weight, not as metaphors<button type="button" class="learn-fn" data-cite="klein-1932" aria-label="citation">†</button>. this workbook\'s buddy is read the same way, as inner object rather than figure of speech. over time the associations with each buddy member grow, and they form a supplementary universe in which the work happens. schwartz\'s parts model is the grammar of it: speak to the part, not about it, and it answers<button type="button" class="learn-fn" data-cite="schwartz-1995" aria-label="citation">††</button>. they are you, displaced sideways into figures that can talk back. jones reads this dialogue as the individuation process itself: the snake turning inside the mandala, the self made in exchange<button type="button" class="learn-fn" data-cite="jones-2020-dialogical" aria-label="citation">†</button>.',
      key: 'figures · inner objects · personification'
    },

    {
      num: '09', title: 'Liber Vacui Method', thesis: true,
      body: 'name the question. name what is known. name what is unknown. choose one wall. return — the question will have changed. that change is the work. the method is not a checklist; it is a short cycle repeated as many times as the question requires. the walls are peopled, which is the part the instructions leave out: klein\'s finding stands, that the inner world is inhabited by objects with moods and agendas whether or not you believe in tenants<button type="button" class="learn-fn" data-cite="klein-1932" aria-label="citation">†</button>. so speak to what you find at the wall as a part, not about it; schwartz\'s rule keeps the dialogue honest and keeps you from arguing with yourself in two voices<button type="button" class="learn-fn" data-cite="schwartz-1995" aria-label="citation">††</button>. the return is the whole secret. the question changes because the asker does.',
      key: 'method · named questions · return'
    },

    {
      num: '10', title: 'I Ching',
      body: 'the i ching, or book of changes, is a 3,000-year-old chinese system of divination<button type="button" class="learn-fn" data-cite="i-ching" aria-label="citation">†</button>. it consists of 64 hexagrams built from six lines each, where each line is either yin (broken) or yang (solid). casting lines — traditionally by yarrow stalks or coins — produces a hexagram whose reading offers counsel rather than prediction. jung wrote a foreword to the wilhelm translation and took the oracle seriously enough to test it; the castings are the oldest documented case of what he later called an acausal bridge. ask a question worth being answered. the machine is old and does not waste its counsel on idle hands. sometimes the reading answers the situation you asked from, not the sentence you asked with. zeng keeps the frame honest: the changes work as jungian projection — a mirror for the present state, never a fortune<button type="button" class="learn-fn" data-cite="zeng-2023-yijing" aria-label="citation">†</button>.',
      key: 'eastern · hexagram · counsel'
    },

    {
      num: '11', title: 'Clinamen',
      body: 'the clinamen is the unpredictable swerve of atoms — the smallest deviation that creates significant change<button type="button" class="learn-fn" data-cite="hugill-2012" aria-label="citation">†</button>. in pataphysics it is a principle applied not just to matter but to language and life itself: the small detours that make the work yours. lucretius named it first: atoms falling straight through the void sometimes swerve, without cause, and that swerve makes all contact possible. jarry stole it for pataphysics: the exception that generates. here it is a standing instruction — when a ritual goes stale, change one small thing on purpose, a different ink, a different hour, and watch what the deviation reveals.',
      key: 'pataphysics · deviation · small change'
    },

    {
      num: '12', title: 'Synchronicity',
      body: 'synchronicity is jung\'s term for an acausal connecting principle — a meaningful coincidence that bridges inner and outer; the essay is carried in volume 8, written alongside his work on the i ching, whose castings he read as exactly such a bridge<button type="button" class="learn-fn" data-cite="jung-cw8" aria-label="citation">†</button>. it is the experience of two events lining up in a way that is statistically improbable but personally significant. not magic, not mere chance — meaningful pattern. the stalker\'s discipline goes further and treats the pattern as trainable: everything is a metaphor, everything is connected, always look for the lesson<button type="button" class="learn-fn" data-cite="insinq-2021-tips" aria-label="citation">†</button>. its feedback is the touch of meaning, the frisson that runs when a coincidence lands, read as the world confirming receipt<button type="button" class="learn-fn" data-cite="insinq-2021-stalking" aria-label="citation">†</button>. kept as lineage, not as evidence: the ten rules are exercises of attention, not findings. the dreams room holds the full folio for those who want the whole ritual.',
      key: 'jung · meaning · stalking · coincidence'
    },

    {
      num: '13', title: 'Wise Mind',
      body: 'wise mind is the integration of logic and emotion — the state of intuitive knowing dbt teaches. it is not the absence of emotion (that is "cold mind") and not the absence of reason (that is "emotion mind"). it is the third thing that holds both. linehan\'s own line: "what we intuitively know to be the truth under the blanket of emotions."<button type="button" class="learn-fn" data-cite="linehan-1993" aria-label="citation">†</button> it is found less by argument than by slowing down until both voices can be heard at once; the workbook\'s deliberation rooms are built for exactly that slowing.',
      key: 'dbt · integration · intuition'
    },

    {
      num: '14', title: 'Defence Mechanisms',
      body: 'anna freud took the defences her father had described piecemeal and made a catalogue of them: the operations by which the ego protects itself, and pays for the protection in distortion<button type="button" class="learn-fn" data-cite="anna-freud-1936" aria-label="citation">†</button>. the named operations run like this. repression: the material is locked below and the key misfiled. projection: what is mine is posted to you. watch for the irritant — the trait that enrages you in a stranger, the colleague you cannot stop narrating. that heat marks your own unowned material. withdrawal runs in three moves: catch it (name whose face carries it), own a grain of it (where do you do a smaller version of exactly this?), take it back (act the owned version on purpose, once, small). denial: the fact is in the room and is not seen. reaction formation: the wish is reversed into its opposite and performed loudly. intellectualisation: the feeling is discussed in a language it cannot survive. sublimation: the charge is put to work, and the work is respectable. the wider shelf adds the rest. displacement: the anger misses its address and lands somewhere safer. regression: under strain, the mind retreats to an earlier room. undoing: the act is cancelled by a counter-act, washing after wishing. isolation: the idea is kept and its feeling turned out. introjection: the other is swallowed whole and lives inside as a voice. altruistic surrender: the self\'s ambitions are served from another\'s plate. every defence pays rent. the workbook\'s shadow pages follow these same routes, because the shadow travels smuggled, and self-reading distorts exactly where the toll was steepest.',
      key: 'anna freud · defence · ego · cost'
    },

    {
      num: '15', title: 'The Persona',
      body: 'the persona is the mask worn for the world\'s sake, the compromise struck between the individual and society; the definition and its consequences are collected in the volume on archetypes<button type="button" class="learn-fn" data-cite="jung-cw9i" aria-label="citation">†</button>. a mask is not a lie. it is adaptation — the face that lets the work get done and the neighbours stay calm. the trouble begins with identification, when the wearer forgets the mask comes off. then the persona eats the face: the professional manner becomes the whole person, and everything that did not fit the role goes down into the shadow by the basement stairs. dreams keep the books on this. they dress you in the wrong uniform, put you on stage without your clothes, hand you a mirror that shows someone else\'s mouth. clothes, uniforms, and mirrors in a dream are the wardrobe department of the persona, checking whether it still fits, and reporting when it does not.',
      key: 'persona · mask · adaptation · dreams'
    },

    {
      num: '16', title: 'Anima and Animus',
      body: 'the anima and animus are the contra-sexual other inside: in a man the anima, the inner woman; in a woman the animus, the inner man. the definitions used here come from the archetype volume<button type="button" class="learn-fn" data-cite="jung-cw9i" aria-label="citation">†</button>. the first meeting is never inside. it is projection: a stranger carries the figure for a season, and the falling is really a landing on someone who stood in the way. jung paired the poles with eros and logos, relation and meaning, each side carrying what the conscious attitude has left untrained. the animus in particular can appear as the crowd of opinions — the chorus of borrowed judgements that speaks in the first person plural and sounds like your own voice. von franz reads the drama in dreams, since dreams tell the inner truth about the dreamer and will cast the figure honestly when asked<button type="button" class="learn-fn" data-cite="von-franz-1964" aria-label="citation">†</button>. the work is the same as shadow work: withdraw the projection — meet each projected figure in turn — until the figure comes home and the real person across from you can be seen plain — which is how the personality thickens toward its own totality<button type="button" class="learn-fn" data-cite="jung-cw9ii" aria-label="citation">†</button>.',
      key: 'anima · animus · projection · eros logos'
    },

    {
      num: '17', title: 'Active Imagination',
      body: 'jung wrote the method down in 1916 and called it the transcendent function: the capacity, once the opposites are held long enough, for a third thing to appear<button type="button" class="learn-fn" data-cite="jung-transcendent-1957" aria-label="citation">†</button>. the method is plain to describe and hard to do. invite the image. let it speak. give it ink — on the page, in drawing, in the voice the buddy uses. and keep the ethical ego awake: you are the host of the dialogue, not the audience, and certainly not the prisoner. von franz read the alchemists\' stages, the blackening and the whitening, as the record of this same work, run slow and in glassware, behind the transformation symbols<button type="button" class="learn-fn" data-cite="von-franz-1980" aria-label="citation">†</button>. the buddy dialogue in this workbook is modelled on it exactly: the figures are invited, addressed, answered, then thanked and closed. the danger is named with the method: letting the fantasy take the helm. the images lead the content of the session — what appears, what speaks, where it goes. you keep the container: you open and close the session, you decide what gets written down, and what gets kept. the fantasy steers the journey; the scribe keeps the wheel of the procedure. punnett measured what this room assumes: in sandplay the words change as the scene develops — speech follows the hands<button type="button" class="learn-fn" data-cite="punnett-2020-sandplay" aria-label="citation">†</button>.',
      key: 'active imagination · transcendent function · dialogue'
    },

    {
      num: '18', title: 'The Collective Unconscious',
      body: 'beneath the personal unconscious, with its feeling-toned complexes and drowned memories, jung placed a deeper floor: the collective unconscious, forms inherited by all humans, independent of any single biography<button type="button" class="learn-fn" data-cite="jung-cw9i" aria-label="citation">†</button>. volume 8 maps the floor above it, the personal layer where the complexes sit like atoms of the unremembered life<button type="button" class="learn-fn" data-cite="jung-cw8" aria-label="citation">†</button>. the distinction between archetype and symbol matters more the longer you look. an archetype is the form; a symbol is what the form wears in a given life and age. a symbol points beyond itself — it is not an allegory with a fixed answer but a live wire with charge on both ends. this is why dreams borrow myth: the dream casts a witch instead of a coworker, a flood instead of a deadline, because the archetype takes the costume the dreamer\'s tradition keeps in stock. the dreams room\'s map of floors and cellars stands on these definitions, and so does every amplification made here.',
      key: 'collective unconscious · archetype · symbol · myth'
    },

    {
      num: '19', title: 'The Self',
      body: 'the Self, in jung\'s sense, is not the ego grown grand. it is the totality of the psyche, conscious and unconscious together, the whole circled by the part that mistakes itself for the whole; aion is the volume where jung works out what that meeting costs the ego<button type="button" class="learn-fn" data-cite="jung-cw9ii" aria-label="citation">†</button>. the archetype volume supplies the working definitions<button type="button" class="learn-fn" data-cite="jung-cw9i" aria-label="citation">†</button>. individuation is the labour of coming to that wholeness, and jung held it to be chiefly the work of the second half of life — after the persona has been built, the world has been met, and the roles have begun to feel like costumes. its symbols arrive unbidden: the mandala, the circle with a centre, the fourfold pattern, the quarternio of sides. the ego\'s job is satellite, not sun. it orbits, it reports, it keeps the ethical watch, and it slowly learns it was never the point.',
      key: 'Self · totality · Aion'
    },
    {
      num: '20', title: 'Individuation',
      body: 'the mandalas drawn in this workbook\'s grounding pages belong to exactly this family of images. anderson states the ethic plain: the Self is a koan — practiced, never scored<button type="button" class="learn-fn" data-cite="anderson-2025-koan" aria-label="citation">†</button>.',
      key: 'individuation · mandala · second half'
    },
    {
      num: '21', title: 'Fairy Tales and the Shadow',
      body: 'von franz read fairy tales as the collective unconscious told plain: no author, no psychology, just the pattern moving in costume<button type="button" class="learn-fn" data-cite="von-franz-1974" aria-label="citation">†</button>. the tales are where the shadow keeps its stage wardrobe. the witch in the gingerbread house, the ogress counting bones in the dark, the dark wood that swallows the path: each is unowned material met first in the other, which is how projection works — out there before it is in here. the youngest child, the plain sister, the fool are the ones sent toward the dark, because the tale knows the ego must arrive small and unarmoured to get through. the shadow stays monstrous as long as it stays projected. the tale ends when the figure is reclaimed: the frog is kissed, the beast is seen, and the other becomes kin. read the tale you resist; that one is filed under your own name.',
      key: 'fairy tales · shadow · projection · von franz'
    },

    {
      num: '22', title: 'Hard Nights',
      body: 'for the nights the room cannot hold alone. this page never interrupts and never asks twice: if it hurts to stay, call — us 988, uk and ireland samaritans 116 123, canada 988. anywhere else, search helpline and your town. the tools here keep breathing with you: tipp sits at the floor of the games room, the sea takes one line at a time, and nothing in this machine expires or judges. come back when the night thins.',
      key: 'crisis · helplines · tipp · the sea'
    },

    {
      num: '23', title: 'The Room',
      body: 'liber vacui is a haunted operating system. it lives in a dark room. the room contains one beige CRT monitor. the monitor contains eleven visitors, each with their own material, their own obsession. you have found one of them. the dial at the bottom of the desktop selects which visitor you are sitting with. hold a tile for the full index. your artifacts, your buddy, and the state of the room are kept on this device. there is no account. there is no cloud. there is only this device, in this room. iris mappa was a cartographer. she did not own the map. she drew it because it was the only way she had found to look at where she was. she has moved on. the maps remain.',
      key: 'the room · iris mappa · local-first'
    },
    {
      num: '24', title: 'Questions',
      body: 'what each room is for, and how to work it. buddy: talk to e-lizabeth; two exchanges, then seal — sealing writes the chat to the desktop as an artifact. the stone: draw a buddy, pick an ink, save it; the stone is the hub everything orbits. garden: fill the empty stone; saving plants it in the bed, where the watering can opens it for colouring. sea: name what you carry, weigh it on the dots, release — the water takes it and does not keep it. dreams: record, read the hedged reading, add associations (select words in the reading to pin one to them), keep to the book or plant as a garden seed. games: eight booths — wheel, mask, shield, circles, powder, and three that open as you play (tide pool, ink storm, thimble garden) — every one keeps to the satchel with a picture. toybox: pip\'s sand game — pour from the jars, drag the crab through the piles, keep a picture. divination: ask one question, draw or cast; the reading answers the situation around the question as often as the sentence. learn: the workbook; the † marks open the cited source. bind: touch an artifact on the desktop, give it a verb, and it binds to the buddy; open any bound row in the satchel to read the full text, or open it in its room. satchel: the book of kept things; margin notes save with ⌘↵ or when you leave the note. trash: released things land here; say why to bring one back, and the reason orbits it as a new relation — including anything a new build shelves. themes: repaint the machine, desktop included. cohort: the earlier chat room, kept for continuity.',
      key: 'faq · rooms · how to'
    },
    {
      num: '25', title: 'Keeping, Orbits, Slots',
      body: 'keep to the book means the artifact is copied to the satchel, where it stays until buried. orbiting dots on the desktop are a live index of everything kept across rooms — they are not a second copy, and binding one does not move it. the sea text you released stays readable: open its row in the satchel, or the artifact on the desktop, for the full words. nothing uploads, ever; everything lives in this browser profile on this device, and closing the program keeps it all for next time. three save slots live in settings: mess about, serious work, show someone — switching reloads the machine into a separate room with its own tutorial state. the buddy answers deterministically from fixed rules, not from a mind: speak, it reflects, seal after two exchanges.',
      key: 'faq · keeping · slots · privacy'
    }
  ];

  var drawersEl = null;
  var cardEl = null;
  var citeEl = null;

  // WS6 — citation facts come only from citations.data.js; scope lines are voice, not findings.
  var CITES = (window.LIBER_DATA && window.LIBER_DATA.citations && window.LIBER_DATA.citations.citations) || [];
  var CITE_BY_ID = {};
  for (var ci = 0; ci < CITES.length; ci++) CITE_BY_ID[CITES[ci].id] = CITES[ci];
  var CITE_SCOPES = {
    'accessible-practical': 'kept for practice, not for proof — guidance from the clinic and the shelf, not a tested result for each use made of it here.',
    'research-empirical': 'published research — it carries only as far as its own studies ran; beyond that, this is the author\'s reading, not the authors\' finding.',
    'perennial-eastern': 'a contemplative frame — orientation, not a finding; nothing in it was tested, and it does not claim to be.',
    'hermetic-esoteric': 'a lineage source — it lends the vocabulary and the ritual form; it is not clinical evidence.',
    'philosophical-pataphysical': 'philosophy, filed as ancestry — argument and licence for the method\'s play, not a tested claim.'
  };

  function openCite(id) {
    var c = CITE_BY_ID[id];
    if (!c || !citeEl) return;
    var claims = (c.claimedFor || []).join('; ');
    var scope = CITE_SCOPES[c.category] || 'how far it proves the claim is not settled here.';
    var note = c.note ? c.note.replace(/^the author's note:\s*/i, '') : '';
    el('learn-cite-topic').textContent = 'filed under: ' + c.topic;
    el('learn-cite-body').innerHTML = ''
      + '<div class="learn-cite-source">source: ' + c.source + '</div>'
      + '<div class="learn-cite-what">what the workbook uses this for: ' + claims + '.</div>'
      + '<div class="learn-cite-scope">how far this goes: ' + scope + '</div>'
      + (note ? '<div class="learn-cite-note">margin note: ' + note + '</div>' : '');
    citeEl.classList.add('open');
    citeEl.removeAttribute('inert');
  }

  function closeCite() {
    if (!citeEl) return;
    citeEl.classList.remove('open');
    citeEl.setAttribute('inert', '');
  }

  function el(id) { return document.getElementById(id); }

  function buildDrawers() {
    if (!drawersEl) return;
    drawersEl.innerHTML = '';
    for (var i = 0; i < CARDS.length; i++) {
      (function (c, idx) {
        var d = document.createElement('button');
        d.type = 'button';
        d.className = 'learn-drawer';
        d.dataset.idx = idx;
        d.innerHTML = '<span class="learn-drawer-num">' + c.num + '</span>'
                    + '<span class="learn-drawer-title">' + c.title + '</span>';
        d.addEventListener('click', function () { showCard(idx); });
        drawersEl.appendChild(d);
      })(CARDS[i], i);
    }
  }

  function showCard(idx) {
    if (!cardEl) return;
    var c = CARDS[idx];
    if (!c) return;
    cardEl.innerHTML = ''
      + '<div class="learn-card-inner">'
      + '  <div class="learn-card-num">' + c.num + ' / ' + String(CARDS.length).padStart(2, '0') + '</div>'
      + '  <div class="learn-card-title">' + c.title + '</div>'
      + (c.thesis
          ? '  <div class="learn-thesis-row"><span class="learn-thesis">a traveller\'s thesis</span>'
            + '<span class="learn-thesis-note">the scribe\'s own conjecture — filed apart from the research shelf.</span></div>'
          : '')
      + '  <div class="learn-card-body">' + c.body + '</div>'
      + '  <div class="learn-card-key">' + c.key + '</div>'
      + '</div>';
    cardEl.scrollTop = 0;
    // Mark the active drawer.
    var drawers = drawersEl.querySelectorAll('.learn-drawer');
    for (var i = 0; i < drawers.length; i++) {
      if (parseInt(drawers[i].dataset.idx, 10) === idx) drawers[i].classList.add('active');
      else drawers[i].classList.remove('active');
    }
  }

  var HSTEPS = [
    { voice: 'the mad scribe', line: 'another reader. good. the drawers keep numbered lessons — pull one.', target: 'learn-drawers' },
    { voice: 'the mad scribe', line: 'the † marks what is cited. tap it. the scribe collects; you consult.', target: 'learn-card' },
    { voice: 'the mad scribe', line: 'dated, stamped, filed. read in the order you need it, when you need it.', target: null },
    { voice: 'the mad scribe', line: 'that is the workbook. consult.', target: 'learn-drawers' }
  ];
  var hIdx = 0;

  function hijackSeen() {
    var st = (window.Liber && window.Liber.state) || null;
    return !!(st && st.get().walkLearn);
  }
  function hijackRemember() {
    var st = (window.Liber && window.Liber.state) || null;
    if (st) st.set({ walkLearn: true });
  }
  function hijackPlace(id) {
    var ring = el('learn-hijack-ring');
    var hj = el('learn-hijack');
    if (!ring || !hj) return;
    var t = id && document.getElementById(id);
    if (!t) { ring.style.display = 'none'; return; }
    var s = hj.getBoundingClientRect(), r = t.getBoundingClientRect();
    ring.style.display = 'block';
    ring.style.left = (r.left - s.left - 8) + 'px';
    ring.style.top = (r.top - s.top - 8) + 'px';
    ring.style.width = (r.width + 16) + 'px';
    ring.style.height = (r.height + 16) + 'px';
  }
  function hijackShow(i) {
    var hj = el('learn-hijack');
    if (!hj) return;
    hIdx = Math.max(0, Math.min(i, HSTEPS.length - 1));
    var st = HSTEPS[hIdx];
    var voice = el('learn-hijack-voice'), line = el('learn-hijack-line');
    var head = el('learn-hijack-head');
    if (voice) voice.textContent = st.voice;
    if (line) line.textContent = st.line;
    if (head) {
      var hvm = (st.voice || '').match(/[a-z0-9]/i);
      head.querySelector('span').textContent = hvm ? hvm[0].toLowerCase() : 'r';
    }
    hj.classList.toggle('sweep', !!st.sweep);
    if (st.sweep && window.Liber && window.Liber.sound) window.Liber.sound.play('thunk');
    hijackPlace(st.target);
    var dots = el('learn-hijack-dots');
    if (dots) dots.textContent = (hIdx + 1) + ' / ' + HSTEPS.length;
  }
  function hijackOpen() {
    var hj = el('learn-hijack');
    if (!hj) return;
    hj.classList.add('open');
    hj.removeAttribute('inert');
    hijackShow(0);
  }
  function hijackClose() {
    var hj = el('learn-hijack');
    if (!hj) return;
    hj.classList.remove('open');
    hj.setAttribute('inert', '');
    hijackRemember();
    if (window.Liber && window.Liber.sound) window.Liber.sound.play('chime');
    var first = drawersEl && drawersEl.querySelector('.learn-drawer');
    if (first) {
      first.classList.add('hijack-glow');
      setTimeout(function () { first.classList.remove('hijack-glow'); }, 2600);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    drawersEl = el('learn-drawers');
    cardEl = el('learn-card');
    citeEl = el('learn-cite');
    buildDrawers();
    if (drawersEl && drawersEl.firstChild) showCard(0);

    // WS6 — footnote glyphs open the citation slip; ×, backdrop and Esc close it.
    if (cardEl) cardEl.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('.learn-fn') : null;
      if (t && t.dataset.cite) openCite(t.dataset.cite);
    });
    var citeClose = el('learn-cite-close');
    if (citeClose) citeClose.addEventListener('click', closeCite);
    if (citeEl) citeEl.addEventListener('click', function (e) { if (e.target === citeEl) closeCite(); });
    if (window.LiberRoomShell) window.LiberRoomShell.bindRoomOverlays({ overlays: [
      { id: 'learn-cite', close: closeCite },
      { id: 'learn-hijack', close: hijackClose },
      { id: 'learn-raison', close: closeR }
    ] });

    var exit = el('learn-exit');
    if (exit) exit.addEventListener('click', function () {
      if (history.length > 1) history.back(); else location.href = 'desktop.html';
    });

    var helpBtn = el('learn-help');
    var raison = el('learn-raison');
    var raisonClose = el('learn-raison-close');
    function openR() { if (raison) { raison.classList.add('open'); raison.removeAttribute('inert'); } }
    function closeR() { if (raison) { raison.classList.remove('open'); raison.setAttribute('inert', ''); } }
    if (helpBtn) helpBtn.addEventListener('click', openR);
    if (raisonClose) raisonClose.addEventListener('click', closeR);
    if (raison) raison.addEventListener('click', function (e) { if (e.target === raison) closeR(); });

    var hBack = el('learn-hijack-back'), hNext = el('learn-hijack-next'), hSkip = el('learn-hijack-skip');
    var hj = el('learn-hijack');
    if (hBack) hBack.addEventListener('click', function () { hijackShow(hIdx - 1); });
    if (hNext) hNext.addEventListener('click', function () {
      if (hIdx >= HSTEPS.length - 1) hijackClose(); else hijackShow(hIdx + 1);
    });
    if (hSkip) hSkip.addEventListener('click', hijackClose);
    if (hj) hj.addEventListener('click', function (e) { if (e.target === hj) hijackClose(); });
    window.addEventListener('load', function () {
      var hj2 = el('learn-hijack');
      if (hj2 && hj2.classList.contains('open')) hijackShow(hIdx);
    });
    if (!hijackSeen()) hijackOpen();
  });
})();
