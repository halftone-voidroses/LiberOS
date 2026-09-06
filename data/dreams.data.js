// dreams.data.js — insightful inquiry's reading room (runtime data, file://-safe, no fetch).
// Three banks:
//   voice    — the sage's hedges and fallbacks (deterministic picks, never random-feeling)
//   symbols  — the Jungian symbol bank: keyword match → faithful essence, amplification,
//              questions, cite. Every cite exists in data/citations.json and matches its
//              claimedFor (GROUNDING IS LAW — data/twelve-works.data.js precedent).
//   teaching — the two folios: stalking synchronicity, and the geography of the
//              unconscious. Body is HTML with <button class="dreams-fn" data-cite="...">†</button>
//              footnote triggers, same grammar the learn workbook uses.
// Sources of record: Jung CW8/9i/9ii, von Franz 1964/1974/1980, A. Freud 1936,
// Freud 1900, and the two insinq.ink essays (credited inline). Read faithfully,
// paraphrased for the room's voice.
window.LIBER_DATA = window.LIBER_DATA || {};
window.LIBER_DATA.dreams = {

  voice: {
    // The opening hedge. The lecture series this room borrows its manners
    // from is literally titled "I'm not certain but" — the debt is kept.
    hedges: [
      'I\'m not certain, but…',
      'I\'m not certain — and I would be suspicious of anyone who is — but…',
      'I\'m not certain. certainty is a poor reading companion. still…',
      'I\'m not certain, and the dream would distrust me if I were. but…'
    ],
    houseLead: [
      'what you have given me is a dream of ',
      'this one belongs to ',
      'the weight of it falls on '
    ],
    joiners: [
      'and it does not come alone — ',
      'attending it: ',
      'beside it stands '
    ],
    questionLead: [
      'so a question, not an answer: ',
      'the reading stops here and the work begins: ',
      'take this back to the waking hours: '
    ],
    fallback: 'I\'m not certain, but… this dream has kept its symbols back from me. even the plainest dream compensates something the day insists on. tell me its strangest image — the one that embarrasses you — and we will read from there.',
    seam: ' ',

    // The compensation frame — Jung's core claim about what a dream is for.
    // Read after the primary symbol, before the secondaries: the dream as
    // the counterweight of the waking attitude, never its echo.
    compensation: [
      'and read it as a counterweight, not an echo: a dream rarely repeats what the day already knows — it leans against it. ask what one-sidedness in your waking hours this image is answering.',
      'the old rule holds here: the dream does not congratulate the day. it compensates it. somewhere your waking attitude has gone narrow, and this image arrives as the wide answer.',
      'hold this against the compensation principle: what the dream brings is what the day refused to carry. read it as the correction your waking mind would not write.',
      'the reading turns on compensation: the dream is the psyche answering the day — the half of the argument you did not let yourself hear.'
    ],

    // For symbols of the collective floor — the numinous register. Used
    // sparingly (only when the primary symbol carries it) to name the
    // difference between housekeeping dreams and the ones remembered
    // for decades.
    bigDream: [
      'one more thing, said carefully: this carries the weight Jung called a big dream — numinous, remembered for decades. such dreams ask to be lived with; a morning\'s reading only opens the door.',
      'and a caution: this has the ring of a big dream about it. little dreams tidy the psyche\'s house; dreams of this weight arrive from the collective floor. do not hurry them.',
      'note the weight of it: this is not housekeeping. a numinous dream of this kind asks to be written down and returned to across years — its reading deepens as you do.'
    ]
  },

  symbols: [
    {
      id: 'water',
      name: 'water',
      match: ['water','ocean','sea','flood','drowning','drown','river','rain','swim','swimming','wave','waves','lake','tide','underwater'],
      part: 'the unconscious itself',
      essence: 'water is the oldest picture of the unconscious — spirit taking fluid form. to enter water in a dream is to enter what carries you without your steering: mood, memory, instinct. clear water and muddy water are not the same report; a flood means the defences of the day have been overrun.',
      amplify: 'baptism, the flood epics, the deep as the mother of life — wherever the psyche speaks at large, it speaks of water.',
      questions: [
        'what in your waking life has been rising slowly, the way water rises before anyone calls it a flood?',
        'in the dream, were you swimming, standing, or being carried? the difference is the diagnosis.'
      ],
      cite: 'jung-cw9i'
    },
    {
      id: 'house',
      name: 'the house',
      match: ['house','home','room','rooms','attic','basement','cellar','upstairs','downstairs','hallway','stairs','floor','floors'],
      part: 'the structure of the psyche',
      essence: 'the house is a floor plan of the self. attics and upper rooms: consciousness and its interests. the ground floor: the day\'s traffic. the cellar: the personal unconscious, its instincts and its stored heat. an unexplored room is a part of the personality not yet lived in — the dream is offering the tour.',
      amplify: 'von Franz read the dreamer\'s house the way an architect reads a building: by what is occupied, what is locked, and what the stairways connect.',
      questions: [
        'which room of your own house would you rather not open? what is stored there?',
        'was the house larger than your waking life, or smaller? both are findings.'
      ],
      cite: 'von-franz-1964'
    },
    {
      id: 'snake',
      name: 'the serpent',
      match: ['snake','snakes','serpent','serpents','cobra','python','viper','ouroboros'],
      part: 'the chthonic Self',
      essence: 'the serpent is ambivalence itself: healing on the physician\'s staff, danger in the grass, renewal when it sheds its skin. Jung read it as cold-blooded psychic energy — instinctive life that does not need your permission to move. it is not read as evil by default. it is read as ancient, and as yours.',
      amplify: 'the ouroboros, the tail-eater: beginning and end in one circle. Asclepius healed with a serpent coiled on his staff.',
      questions: [
        'what instinct in you has been coiled and waiting while you decided whether to call it danger or medicine?',
        'the serpent sheds its skin. what are you overdue to shed?'
      ],
      cite: 'jung-cw9ii'
    },
    {
      id: 'pursuer',
      name: 'the pursuing figure',
      match: ['chasing','chased','chase','pursued','pursuer','following me','stalker','dark figure','shadowy figure','figure in the dark','intruder','someone behind','shadow figure'],
      part: 'the shadow',
      essence: 'the one who follows is almost always the one the dreamer refuses to be. von Franz: the shadow is first met outside — projected onto strangers, enemies, the thing in the dark — and the pursuit ends not by outrunning it but by turning and asking what it wants. the dream keeps the appointment until you keep it.',
      amplify: 'in the old tales the pursuer becomes a guide once faced. the shape in the doorway is a role, not a face.',
      questions: [
        'if you stopped running and asked it — what would it want from you?',
        'whose face did you hope it would not wear? start there.'
      ],
      cite: 'jung-cw9ii'
    },
    {
      id: 'falling',
      name: 'falling',
      match: ['falling','fell','fall','plummet','dropped'],
      part: 'the ego\'s hold',
      essence: 'a falling dream is the deflation of an attitude grown too high — the grip of the ego loosening on an idea of itself. Jung did not read it as a prophecy of ruin; he read it as a re-settling, gravity\'s correction of an inflation. the body already knows how to land.',
      amplify: 'the fall of Icarus is the same report told as myth: the wax was never the issue; the height was.',
      questions: [
        'what have you been holding onto that is now holding you?',
        'where in your life did you stop being the one who decides the height?'
      ],
      cite: 'jung-cw9i'
    },
    {
      id: 'flying',
      name: 'flying',
      match: ['flying','flew','float','floating','levitating','levitation','hover','hovering'],
      part: 'spirit, and the danger of inflation',
      essence: 'flying is release from the weight of things — spirit unfastened from the daily. but Jung kept a caution folded into every flight: flown too high it becomes the dream of inflation, the one Icarus had. the reading turns on one point — whether the flight carries meaning, or only escapes it.',
      amplify: 'the shaman\'s flight and the ascetic\'s levitation are the same archetype with different receipts.',
      questions: [
        'what would you be able to see from up there that you cannot see from the ground — and is it true?',
        'did the flying feel earned, or stolen? the psyche keeps ledgers.'
      ],
      cite: 'jung-cw9i'
    },
    {
      id: 'teeth',
      name: 'the teeth',
      match: ['teeth','tooth','dentist','molars'],
      part: 'power, and its loss',
      essence: 'teeth coming loose is among the oldest dream reports on record — Artemidorus wrote of it, and Freud collected it again. it marks a loss of force: the power of the word, the bite, the boundary. the body\'s structure loosening where the day has been too polite.',
      amplify: 'in the classical catalogues it attended words spoken too late or power surrendered without a fight.',
      questions: [
        'what did you not say, in the day the dream is answering?',
        'where does your force go when you are not looking at it?'
      ],
      cite: 'freud-1900'
    },
    {
      id: 'death',
      name: 'death and the corpse',
      match: ['death','died','dying','dead','corpse','funeral','grave','coffin','buried','bury'],
      part: 'transformation',
      essence: 'in the old reading, death dreams almost never predict death; they announce the end of an attitude, a season of the psyche closing. the alchemists called the first stage of the work the nigredo — the blackening — and insisted it came before the colour returned. the dream speaks in the language of the body and of myth, not of the newspaper.',
      amplify: 'funerals in dreams gather witnesses: who attends your ending says who expects to meet what comes next.',
      questions: [
        'what has already ended in your waking life, that you are still hosting?',
        'if this is a season closing rather than a life — what season?'
      ],
      cite: 'von-franz-1980',
      numinous: true
    },
    {
      id: 'child',
      name: 'the child',
      match: ['baby','babies','birth','born','child','children','infant','newborn','toddler'],
      part: 'the divine child',
      essence: 'the child in the dream is a new potential — fragile, whole, and older than its size. Jung\'s child archetype is the beginning that carries its own wholeness: something in you arriving that will need guardianship, and that does not need to be explained to be real.',
      amplify: 'the golden child of the alchemists, the winter-born king of the tales: small, and not weak.',
      questions: [
        'what have you begun that you are measuring by the wrong age?',
        'who is assigned to guard it — and is that person you?'
      ],
      cite: 'jung-cw9i',
      numinous: true
    },
    {
      id: 'anima',
      name: 'the unknown figure of the other',
      match: ['lover','bride','bridegroom','husband','wife','mysterious woman','mysterious man','stranger woman','stranger man','kiss','embrace'],
      part: 'the contra-sexual other',
      essence: 'the unknown woman or man who appears, guides, argues or seduces is what Jung called the anima or animus — the inner figure of the other in you. in men\'s dreams she carries relatedness and the life of feeling; in women\'s dreams he carries spirit, meaning, and often arrives as a crowd of opinions. they are first met in projection, dressed as someone else.',
      amplify: 'the bride won in the fairy tale and the stranger who gives the sword are the same figure with the mask on and off.',
      questions: [
        'what quality does this figure have that your days do not make room for?',
        'who did you first mistake them for? the projection is the address.'
      ],
      cite: 'jung-cw9ii'
    },
    {
      id: 'wise',
      name: 'the wise old figure',
      match: ['teacher','grandfather','grandmother','guide','doctor','guru','master','sage','professor','priest','monk','therapist'],
      part: 'the archetype of meaning',
      essence: 'the one who knows arrives when the dreamer\'s own knowledge is not enough: the teacher, the grandfather, the doctor in the white coat. Jung read this figure as spirit in the shape of meaning. his counsel in the dream is worth writing down exactly. his authority is worth questioning exactly as much.',
      amplify: 'Merlin, Chiron, the hermit of every deck of cards: the figure of meaning who cannot do the work for you.',
      questions: [
        'what did the figure say, word for word? write it without paraphrase.',
        'where in your waking life are you asking others to know what only you can know?'
      ],
      cite: 'jung-cw9i',
      numinous: true
    },
    {
      id: 'mirror',
      name: 'the mirror',
      match: ['mirror','mirrors','reflection','looking glass'],
      part: 'self-confrontation',
      essence: 'what the mirror shows is never the persona\'s face — the social face is exactly what mirrors refuse. Narcissus drowned mistaking a reflection for a world; the dream mirror asks less. it stages the meeting of the seen and the seeing: the one who looks, and the one who is looked at, in the same frame.',
      amplify: 'in the tales, the mirror that lies and the mirror that tells too much are usually the same mirror, carried by different hands.',
      questions: [
        'in the dream, did you look? not looking is also a finding.',
        'who were you before the reflection arranged itself?'
      ],
      cite: 'jung-cw9i'
    },
    {
      id: 'naked',
      name: 'nakedness',
      match: ['naked','nude','undressed','no clothes','clothesless','exposed'],
      part: 'the persona stripped',
      essence: 'the social mask left in another room. the shame in the dream is the persona defending itself, and it is not the point. Jung read the exposure as the truth the role was covering: the dream stages what remains when the uniform is off — and it is usually less frightening than the fear of it.',
      amplify: 'the emperor\'s new clothes is the persona dream told as a joke with casualties.',
      questions: [
        'which role were you wearing when it was taken?',
        'who was watching, and whose opinion were they carrying?'
      ],
      cite: 'jung-cw9i'
    },
    {
      id: 'fire',
      name: 'fire',
      match: ['fire','flame','flames','burning','burn','burned','smoke','ash','ashes','ember'],
      part: 'transformation',
      essence: 'the alchemists\' first operation — calcinatio — was burning, and they insisted the fire separates rather than destroys: what burns was never the material. fire in a dream is passion and purification in one report. what is ash was already finished; the heat itself is the reading.',
      amplify: 'the phoenix is the fire dream told with an exit; the salamander, told with residence.',
      questions: [
        'what was burned — and what, when you look again, was left untouched in the ashes?',
        'is this fire the kind you light, or the kind you are walked through?'
      ],
      cite: 'von-franz-1980'
    },
    {
      id: 'forest',
      name: 'the forest',
      match: ['forest','forests','woods','tree','trees','jungle','grove','thicket'],
      part: 'the unmapped unconscious',
      essence: 'wandering among trees is wandering off the ego\'s map. in the tales the forest is precisely where the transformation happens: children are abandoned there, knights are lost there, and what is sought is only ever found there. the density of the trees measures how far from the known you have agreed to go.',
      amplify: 'Dante opens in a dark wood because every real journey does, in the grammar of the psyche.',
      questions: [
        'did you enter the forest on purpose? that changes the genre of the story.',
        'what did you go in looking for, in the waking life the dream answers?'
      ],
      cite: 'von-franz-1974'
    },
    {
      id: 'mountain',
      name: 'the mountain',
      match: ['mountain','mountains','climbing','climb','climbed','summit','peak','hill','ascent'],
      part: 'ascent, and the goal',
      essence: 'the climb is toward consciousness and the long view; the summit, in Jung\'s reading, is the Self\'s goal — the height from which the whole shape of a life is momentarily visible. the effort of the ascent is part of the symbol: the view is priced in breath.',
      amplify: 'every tradition that holy places sit on mountains says the same thing in the same direction.',
      questions: [
        'were you climbing toward something, or away from something? the same slope, different dreams.',
        'how far up were you when the dream ended?'
      ],
      cite: 'jung-cw9i',
      numinous: true
    },
    {
      id: 'door',
      name: 'the door and the key',
      match: ['door','doors','threshold','key','keys','locked','lock','gate','doorway','doorbell'],
      part: 'the liminal',
      essence: 'a door is a decision with hinges. a locked door: what the ego is not yet ready to open — the dream is honest about readiness without being cruel. a key: the intentional act that unlocks, and the dream gives you the hand that holds it. thresholds in general are where the psyche does its negotiating.',
      amplify: 'Janus, the two-faced doorkeeper, looked outward and inward at once — that is the whole job description.',
      questions: [
        'which door in the dream did you not open? describe what you think is behind it.',
        'where did the key come from? whoever gave it to you matters.'
      ],
      cite: 'von-franz-1964'
    },
    {
      id: 'bridge',
      name: 'the bridge',
      match: ['bridge','bridges','crossing','crossed','crossroads'],
      part: 'the crossing',
      essence: 'the bridge joins two banks that the water insists on separating: conscious and unconscious, who you were and who is being made. the state of the bridge is the report — sturdy, swaying, unfinished, half-built. crossings in dreams are read as crossings in the life.',
      amplify: 'the rainbow bridge of the old mythologies: passage granted, but one way at a time.',
      questions: [
        'which two banks is this bridge joining — name each side in one word.',
        'were you crossing, standing on it, or watching it from the shore?'
      ],
      cite: 'von-franz-1964'
    },
    {
      id: 'vehicle',
      name: 'the vehicle out of control',
      match: ['car','cars','driving','drove','train','bus','brakes','steering','wheel','truck','motorcycle','crash','crashed'],
      part: 'energy, and who holds it',
      essence: 'von Franz\'s classic reading: the car is the ego\'s drive through a life. brakes failing, no one at the wheel, the road bending out of sight — the drive is being driven. the question the dream asks is not whether you are moving; you are. it is who, precisely, is steering.',
      amplify: 'the runaway horses of Plato\'s chariot are the same dream told as philosophy with a harness.',
      questions: [
        'in the dream, where were you sitting — driver\'s seat, passenger, or the back?',
        'what in your waking life has momentum that your hands have quietly left?'
      ],
      cite: 'von-franz-1964'
    },
    {
      id: 'exam',
      name: 'the unprepared exam',
      match: ['exam','exams','test','school','classroom','unprepared','homework','assignment','final'],
      part: 'the Self\'s evaluation',
      essence: 'the desk you arrive at without having studied is the psyche\'s own audit. it is not about the school. it asks: where in the waking life are you acting without your own knowledge, presenting what you have not learned. the exam is set by the part of you that knows the syllabus.',
      amplify: 'the orphan who cannot answer the three questions is a figure older than classrooms.',
      questions: [
        'which subject was the exam in? the psyche is rarely subtle.',
        'who else was in the room? fellow examinees are fellow claims on honesty.'
      ],
      cite: 'von-franz-1964'
    },
    {
      id: 'bird',
      name: 'the bird',
      match: ['bird','birds','raven','crow','dove','eagle','owl','sparrow','flock','wings','feathers'],
      part: 'spirit, and thought in flight',
      essence: 'the bird carries spirit and intuition — thought that has left the weight of the sentence. in the alchemical shelves the raven is the shadow\'s own messenger, arriving first at the dark work; the dove arrives at reconciliations. the species is the reading; the flock is the mood of the whole sky.',
      amplify: 'the dove of the flood and the ravens of Odin divide the same air between them.',
      questions: [
        'which bird was it, exactly? write the species before the feeling.',
        'did it come to you, or did you follow it?'
      ],
      cite: 'jung-alchemy-1968'
    },
    {
      id: 'fish',
      name: 'the fish',
      match: ['fish','fishing','aquarium','whale','dolphin','shark'],
      part: 'contents of the deep',
      essence: 'fish live where the dreamer cannot breathe, and surface anyway: contents of the unconscious arriving on their own schedule. to catch one is to make conscious what was swimming below; to watch one is to concede it knows these waters better than you do. the size of the fish is the size of what surfaced.',
      amplify: 'in the early centuries the fish was the secret name of the inner Christ — the deepest thing, swimming in everyone.',
      questions: [
        'did the fish come out of the water, or did you go in after it?',
        'what has been surfacing lately that you keep returning to the water?'
      ],
      cite: 'jung-cw9ii'
    },
    {
      id: 'gold',
      name: 'the treasure',
      match: ['gold','treasure','coins','jewels','diamond','jewelry','pearl','emerald'],
      part: 'the Self',
      essence: 'the treasure hard to attain is the Self hidden in the raw material of a life — the alchemists\' gold, which they insisted was not common gold, buried in the base earth of the ordinary. dreams of finding treasure report that something of real value has been located in what the waking life calls dirt.',
      amplify: 'the kingdom buried in the field, the pearl in the mud, the philosopher\'s stone in the dung heap: the same map at every scale.',
      questions: [
        'where exactly was the treasure found? the undignified location is the teaching.',
        'what did you do with it in the dream — keep it, share it, doubt it?'
      ],
      cite: 'von-franz-1980',
      numinous: true
    },
    {
      id: 'ring',
      name: 'the ring and the wedding',
      match: ['ring','rings','wedding','marriage','marry','engaged','engagement','vows'],
      part: 'the union of opposites',
      essence: 'the alchemists\' coniunctio — the wedding of opposites that could not previously hold each other: duty and desire, the mask and the face. a ring is a bond drawn without endpoints. the dream stages which opposites in you are being asked, finally, to hold together.',
      amplify: 'the alchemical wedding, the sacred marriage of every mythology: the opposites do not merge; they hold.',
      questions: [
        'which two things in you does this wedding join? name them plainly.',
        'in the dream, did you consent? reluctance is data.'
      ],
      cite: 'jung-alchemy-1968',
      numinous: true
    },
    {
      id: 'clock',
      name: 'the clock',
      match: ['clock','clocks','time','late','watch','hourglass','ticking','deadline','midnight'],
      part: 'kairos — the right time',
      essence: 'the ticking asks what season this is. the dream\'s time is not the train\'s time; it is kairos, the ripe moment, as the stalker\'s essays put it — the moment that cannot be summoned, only attended. a dream of being late is the psyche\'s schedule objecting to the waking one.',
      amplify: 'the Greek keeper of seasons had two words for time: the counted one, and the ripe one. dreams only use the second.',
      questions: [
        'late for what, exactly? the destination is the real appointment.',
        'what in your life is ripening while you count hours instead?'
      ],
      cite: 'insinq-2021-stalking'
    },
    {
      id: 'labyrinth',
      name: 'the labyrinth',
      match: ['labyrinth','labyrinths','maze','mazes','lost','corridor','endless','cant find','can\'t find'],
      part: 'circling the centre',
      essence: 'the labyrinth looks like punishment and functions as a method: the winding path that still has a middle. Jung read the journey to the centre — any centre, a room, a person, the Self — as the individuation way, and getting lost as part of the map rather than a failure of it. the maze dreams of being lost are tours.',
      amplify: 'Theseus brought a thread; the thread was not courage, it was method — the dream provides its own if you look.',
      questions: [
        'were you looking for the centre, or for the exit? they are different pilgrimages.',
        'what in the dream kept repeating? the repeat is the thread.'
      ],
      cite: 'jung-alchemy-1968',
      numinous: true
    },
    {
      id: 'moon',
      name: 'the moon',
      match: ['moon','moonlight','lunar','full moon','stars','night sky','eclipse'],
      part: 'the night-side',
      essence: 'the moon\'s light is the sun\'s, remembered — consciousness by reflection rather than by force. it governs the night-side of the psyche: the tide, the feminine, the slow gold of what can only be seen when you stop shining at it. a dream moon asks for vision by borrowed light, which is another name for reflection.',
      amplify: 'the virgin in the white city, the hare in the face: the moon collects projections the way water collects the sky.',
      questions: [
        'was the moon full, new, or in between? the phase is the reading.',
        'what can you only see now, by reflection, that daylight would have drowned out?'
      ],
      cite: 'jung-cw9i',
      numinous: true
    }
  ],

  teaching: [
    {
      id: 'stalking-synchronicity',
      title: 'stalking synchronicity',
      body: 'there is an octave of order in nature that sits above what you are able to perceive, and it can be trained for. that is the claim of the discipline this folio teaches — synchronicity hunted on purpose, which its practitioners call stalking psynchronicity<button type="button" class="dreams-fn" data-cite="insinq-2021-stalking" aria-label="citation">†</button>.'
        + '<p class="dreams-lesson-head">the touch of meaning</p>'
        + 'the stalker\'s instrument is the body. frisson — the goosebump — is read as tactile feedback from the world: a signal that something in what you just experienced is not yet understood, and should be followed, not explained away. the touch of meaning arrives on the skin before the mind consents. pay it like a debt.'
        + '<p class="dreams-lesson-head">make less noise</p>'
        + 'the first discipline is quiet. the psyche generates noise — expectations, reactions, the commentary of preference — and the music of reality is quieter than that. mindfulness and the old concentration trainings exist for exactly this: to lower the noise floor until the signal can be heard. and a warning from the same source: do not stare at the phenomenon directly, and do not test it with scorn. the kairotic moment is shy; skepticism aimed at it throws off the rhythm of the whole sequence, and you will get exactly the dead world you demanded — the fairies withdraw from those who come to disprove them<button type="button" class="dreams-fn" data-cite="insinq-2021-stalking" aria-label="citation">†</button>.'
        + '<p class="dreams-lesson-head">the ten rules</p>'
        + '<ol class="dreams-rules">'
        + '<li>everything is a metaphor. the unconscious models the world through inherited prototypes — archetypes — and what arrives through that machinery arrives as metaphor. dream language is metaphorical because metaphor is the language of pre-conscious thought. treat events as metaphors and you will catch the embedded information; treat them longer and it stops feeling like a trick<button type="button" class="dreams-fn" data-cite="insinq-2021-tips" aria-label="citation">†</button>.</li>'
        + '<li>everything is connected. all things share being — that commonality is a connection, whether or not the eye can trace it. look for resonant links between contexts that have no obvious relation, and stop being surprised when they answer.</li>'
        + '<li>always look for the lesson. the signs point to what has not yet been integrated. experiences that repeat are lessons repeating; their signs repeat with them, and the more significant the lesson, the harder the signs insist.</li>'
        + '<li>as above, so below. the order of reality is fractal: the same laws guide the stars and the person. the microcosm mirrors the macrocosm; your emotional weather and the sky\'s are analogues, not puns.</li>'
        + '<li>language is magic is transformation. to name a thing is to take hold of it; to redescribe it is to break the box the first description built. the limits of your language are the limits of your world — and language can be reforged.</li>'
        + '<li>if it doesn\'t ring like a bell for everyone, it\'s not quite right. resonance is the test of an articulation. when a formulation rings true for every soul in the exchange, a crystallisation has occurred; keep those.</li>'
        + '<li>if you want to hear the music, you need to make less noise. the signal-noise problem, stated as etiquette. your reactions are the noise; the practice is turning the psyche down until the octave of order is audible.</li>'
        + '<li>pay attention to the omens — the repeating themes in life. the common tongue of an archetype is the omen: a metaphorical hint at what is coming. you will dismiss some real ones; the psyche remembers which.</li>'
        + '<li>around any resonant dialogue on synchronicity, the signs will precipitate. attention amplifies what it attends. an elevating conversation constellates its own subject — the discussed symbol appears before and after, in supposedly unrelated places. it rains meaning where two people are actually talking.</li>'
        + '<li>all things are possible to one who is willing to believe. the Tinkerbell principle: disbelief dims the phenomenon, belief feeds it. at minimum, suspend judgement the way you do at the cinema — the drama of reality deserves the same courtesy, and it is the precondition of learning anything new.</li>'
        + '</ol>'
        + '<p class="dreams-lesson-head">what it has to do with dreams</p>'
        + 'the dream journal is the stalker\'s log. a dream is a metaphor delivered at night, unguarded by the day\'s defences; recorded, it becomes a sign that can be watched for recurrence. record. attend. look for the lesson. the same octave of order that precipitates around resonant dialogue precipitates around a kept dream — but only for those keeping it. this room\'s castings read the I Ching on the same acausal logic<button type="button" class="dreams-fn" data-cite="jung-cw8" aria-label="citation">†</button>.',
      key: 'synchronicity · frisson · metaphor · omens · kairos · the tinkerbell principle'
    },
    {
      id: 'geography-of-the-unconscious',
      title: 'the geography of the unconscious',
      body: 'a faithful map, as the depth psychologists drew it. the psyche is not one room; it is a house with floors below the daylight, and the dream is the tour that runs while the owner sleeps.'
        + '<p class="dreams-lesson-head">the floors</p>'
        + '<b>consciousness</b> is the ego\'s candlelit floor — what you can name, hold, and direct. the <b>ego</b> is its centre: the seat of identity, and by no means the centre of the whole house. below it lies the <b>personal unconscious</b>: everything forgotten, repressed, or perceived only subliminally — and its contents are not inert. feeling-toned <b>complexes</b> gather there like weather systems, splinters of the psyche with a charge of their own, capable of acting autonomously — dreams, slips, moods that arrive with someone else\'s signature<button type="button" class="dreams-fn" data-cite="jung-cw8" aria-label="citation">†</button>. and below the personal lies the <b>collective unconscious</b>: not a basement of this house but the ground it is dug into — inherited forms, common to all, that arrange experience from underneath<button type="button" class="dreams-fn" data-cite="jung-cw9i" aria-label="citation">†</button>.'
        + '<p class="dreams-lesson-head">the inhabitants</p>'
        + 'the <b>persona</b> is the mask worn for the world\'s sake — necessary, and dangerous when mistaken for the face. the <b>shadow</b> is the thing a person has no wish to be: the unlivable qualities, first met outside, in the faults of others, in the dark figure of the dream. Jung called it the moral problem that challenges the whole ego-personality — not an enemy but an unpaid debt<button type="button" class="dreams-fn" data-cite="jung-cw9ii" aria-label="citation">†</button>. von Franz\'s work on fairy tales shows the mechanics: projection — the shadow carried outward and met in strangers and ogres until it is reclaimed<button type="button" class="dreams-fn" data-cite="von-franz-1974" aria-label="citation">†</button>. the <b>anima and animus</b> are the contra-sexual other within: in one polarity the figure of relatedness and feeling, in the other of meaning and spirit — first met projected, dressed as a lover, a rival, a voice that argues in crowds. and at the far edge of the map, the <b>Self</b>: the totality that includes all the floors, the centre the ego circles rather than occupies — appearing in dreams as the mandala, the circle, the child, the treasure, the four-square city<button type="button" class="dreams-fn" data-cite="jung-cw9ii" aria-label="citation">†</button>.'
        + '<p class="dreams-lesson-head">symbols, and what tends to carry them</p>'
        + 'water — the unconscious itself. the house — the psyche\'s structure, attic to cellar. the serpent — chthonic energy, renewal, ambivalence. the pursuer — the shadow asking to be faced. the unknown lover — anima or animus. the wise old figure — the archetype of meaning. the child — new potential, whole from birth. fire — transformation\'s separating flame. the treasure — the Self, buried in the base earth. the wheel out of control — psychic energy with the ego\'s hands off it<button type="button" class="dreams-fn" data-cite="jung-cw9i" aria-label="citation">†</button>. the symbol bank in this room reads along these lines; it is a vocabulary, not a dictionary of verdicts.'
        + '<p class="dreams-lesson-head">how a dream is read — the method</p>'
        + '<ol class="dreams-rules">'
        + '<li>the compensation principle. the dream is not a disguise of desire (that is Freud\'s reading, stated in 1900, honoured here and argued with<button type="button" class="dreams-fn" data-cite="freud-1900" aria-label="citation">†</button>). it is a compensation: the psyche presenting what the daytime attitude has made one-sided. ask what the dream corrects, not only what it conceals<button type="button" class="dreams-fn" data-cite="jung-cw9i" aria-label="citation">†</button>.</li>'
        + '<li>context before interpretation. read the dreamer\'s situation first: a snake in the dream of a gardener is not the snake in the dream of a city. the same symbol pays different wages.</li>'
        + '<li>circumambulation, not free association. Freud\'s chain of association walks away from the image; Jung\'s method circles it — gathering mythological, cultural, and personal parallels until the image is seen from all sides. stay with the symbol until it is exhausted; the dream chose it<button type="button" class="dreams-fn" data-cite="von-franz-1964" aria-label="citation">†</button>.</li>'
        + '<li>big dreams and little dreams. little dreams are the psyche\'s housekeeping — the day, recycled. big dreams are numinous, remembered for decades, peopled by the collective floor. weight your readings accordingly<button type="button" class="dreams-fn" data-cite="von-franz-1964" aria-label="citation">†</button>.</li>'
        + '<li>continue the dialogue. the reading does not end at the waking edge. active imagination — Jung\'s method, the one this whole room is modelled on — deliberately lets the dream-figure answer: the image is given ink, and the unconscious speaks back<button type="button" class="dreams-fn" data-cite="jung-transcendent-1957" aria-label="citation">†</button>. the associations you write beneath a dream here are that, begun.</li>'
        + '</ol>'
        + '<p class="dreams-lesson-head">the defences, named</p>'
        + 'between the floors stand the mechanisms the ego posts as guards — systematised by Anna Freud in 1936 and worth knowing by name, because every one of them distorts a reading: <b>repression</b> (the memory sent below), <b>projection</b> (the quality installed in others), <b>denial</b> (the fact refused at the door), <b>intellectualisation</b> (the feeling filed as theory), <b>reaction formation</b> (the opposite claimed loudly), <b>displacement</b> (the anger re-addressed to a safer name), <b>regression</b> (retreat to an earlier room), <b>sublimation</b> (the impulse given employable work). a dream that gets past the guards is worth the ink it takes<button type="button" class="dreams-fn" data-cite="anna-freud-1936" aria-label="citation">†</button>.',
      key: 'ego · personal unconscious · collective unconscious · shadow · anima/animus · self · compensation · amplification · defences'
    }
  ]
};
