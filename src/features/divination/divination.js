// divination.js — Arcana. Tarot (22-card deck) + I Ching (six-line hexagram).

(function () {
  var DECK = [
    { n: 0,  g: 'O', name: 'the fool',         key: 'a step taken without map' },
    { n: 1,  g: '☽', name: 'the magician',     key: 'will bent into form' },
    { n: 2,  g: '⚮', name: 'the high priestess', key: 'what is hidden, kept' },
    { n: 3,  g: '♀', name: 'the empress',      key: 'a body that bears' },
    { n: 4,  g: '♂', name: 'the emperor',      key: 'a line drawn and held' },
    { n: 5,  g: '⌘', name: 'the hierophant',   key: 'the old teaching' },
    { n: 6,  g: '⚥', name: 'the lovers',       key: 'two become a question' },
    { n: 7,  g: '⚔', name: 'the chariot',      key: 'force, harnessed' },
    { n: 8,  g: 'Ω', name: 'strength',         key: 'softness against the throat' },
    { n: 9,  g: '⌬', name: 'the hermit',       key: 'the lamp, the corridor' },
    { n: 10, g: '☸', name: 'wheel of fortune', key: 'it turns, indifferent' },
    { n: 11, g: '⚖', name: 'justice',          key: 'the weight, returned' },
    { n: 12, g: '⚓', name: 'the hanged man',   key: 'let go, downward' },
    { n: 13, g: '✝', name: 'death',            key: 'an ending, named' },
    { n: 14, g: '⚗', name: 'temperance',       key: 'two waters, one cup' },
    { n: 15, g: '⌖', name: 'the devil',        key: 'the chain you did not see' },
    { n: 16, g: '⚡', name: 'the tower',        key: 'the structure, broken' },
    { n: 17, g: '★', name: 'the star',         key: 'small light, far' },
    { n: 18, g: '☾', name: 'the moon',         key: 'things, in water' },
    { n: 19, g: '☀', name: 'the sun',          key: 'open, burning' },
    { n: 20, g: '♪', name: 'judgement',        key: 'a sound, far off' },
    { n: 21, g: 'O', name: 'the world',        key: 'a circle, closed' }
  ];

  // I Ching — 64 hexagrams. Each line is yin (0) or yang (1); read bottom-up.
  // 6-bit binary: row 6 (top) is the first character.
  var HEXAGRAM_NAMES = [
    'The Creative','The Receptive','Difficulty at the Beginning','Youthful Folly',
    'Waiting','Conflict','The Army','Holding Together',
    'Small Taming','Treading','Peace','Standstill',
    'Fellowship','Great Possession','Modesty','Enthusiasm',
    'Following','Work on What Has Been Spoiled','Approach','Contemplation',
    'Biting Through','Grace','Splitting Apart','Return',
    'Innocence','Great Taming','Nourishment','Great Preponderance',
    'The Abysmal','The Clinging','Influence','Duration',
    'Retreat','Great Power','Progress','Darkening of the Light',
    'The Family','Opposition','Obstruction','Deliverance',
    'Decrease','Increase','Breakthrough','Coming to Meet',
    'Gathering Together','Pushing Upward','Oppression','The Well',
    'Revolution','The Cauldron','The Arousing','Keeping Still',
    'Development','The Marrying Maiden','Abundance','The Wanderer',
    'The Gentle','The Joyous','Dispersion','Limitation',
    'Inner Truth','Small Preponderance','After Completion','Before Completion'
  ];
  var HEXAGRAM_DESCRIPTIONS = [
    'pure yang — the primal force of heaven, the dragon at the threshold of being.',
    'pure yin — the nurturing power of the earth, the field that receives.',
    'chaos before creation. the first thread ties itself; do not rush the knot.',
    'the need for a teacher. the well is dark until the rope is thrown.',
    'patience and preparation. the storm passes if you do not walk in it.',
    'tension and opposition. do not meet force with force; meet it with clarity.',
    'organised collective action. one heart, many hands, one direction.',
    'union and mutual support. the seal binds only if the wax is warm.',
    'gentle restraint. the small leash tames; the great one breaks.',
    'careful behaviour. walk on the toes of the dance; one false step and the floor remembers.',
    'harmony and prosperity. the gate opens because the keeper is ready.',
    'stagnation and obstruction. wood rots when it cannot move.',
    'community and shared purpose. the circle is stronger than any spoke.',
    'abundance and responsibility. the cup overflows; who carries the spillage?',
    'humility and yielding. the mountain hides beneath the hill.',
    'joyful energy. the spring rises without being asked.',
    'adaptation and moving with the flow. the reed bends; the oak does not.',
    'decay and repair. mend the raft before the river rises.',
    'advancement and growth. the tide comes in; bring it something.',
    'observation and reflection. the watcher sees more than the actor.',
    'decisive action. the jaw closes; the matter is settled.',
    'beauty and adornment. form is the courtesy the soul pays to the world.',
    'disintegration and dissolution. the leaf returns to the loam that made it.',
    'the turning point. the wheel has come around; step off, or step on.',
    'spontaneity and the unforced path. the unpainted picture is already true.',
    'holding steady. the great river moves but does not rage.',
    'sustenance and care. what you feed, grows.',
    'excess and the bending. the bow that is too straight snaps.',
    'danger and water. listen for the current beneath the quiet.',
    'fire and clarity. what burns away is not lost.',
    'attraction. the moon draws the tide without touching it.',
    'endurance. the stone forgets the river; the river forgets the stone.',
    'withdrawal. the mountain does not chase the cloud.',
    'vigour. the great axle turns because the bearings are true.',
    'advancement. the small door opens onto a great room.',
    'injury and obscuration. the eclipse is brief; the sun remembers.',
    'the household. the hearth is the first altar.',
    'polarity. two stones strike; the spark is the third thing.',
    'difficulty. the river meets the rock and the rock is patient.',
    'release. the knot undone is not undone — it is remembered as undone.',
    'diminution. to empty is to fill; to fill is to spill.',
    'growth. the vine that climbs covers the wall.',
    'breakthrough. the spring breaks the ice because the ice forgot to move.',
    'encounter. the meeting at the crossroads.',
    'assembly. many small fires make a great warmth.',
    'ascent. the shoot does not hurry; the light is patient.',
    'exhaustion. even the mountain crumbles under its own weight.',
    'nourishment. the well does not move; the village comes to it.',
    'change. what was solid becomes air; what was air becomes song.',
    'transformation. the cauldron does not boil itself.',
    'shock. the thunder does not apologise.',
    'meditation. the mountain does not think; it knows.',
    'gradual growth. the bamboo bends first, then rises.',
    'the lesser path. the second marriage is the practical one.',
    'fullness. the cup brims but does not spill.',
    'the journey. the wanderer keeps no hearth but carries the fire.',
    'softness. the lake yields to the wind; the wind remembers the lake.',
    'joy. the lake reflects the sky without keeping it.',
    'dissolution. the salt returns to the sea that gave it.',
    'measure. the cup without a bottom cannot hold.',
    'sincerity. the inner and outer meet without negotiation.',
    'excess of the small. the grain of sand is heavier than the wave.',
    'order. the after-state, the slow exhale.',
    'transition. the before-state, the held breath.'
  ];
  // Pre-computed lookup from the standard 64-hexagram binary patterns.
  var HEXAGRAM_PATTERNS = [
    '111111','000000','100010','010001','111010','010111','010000','000010',
    '111011','110111','111000','000111','101111','111101','001000','000100',
    '011001','100110','110000','000011','100101','101001','000001','100000',
    '100111','111001','100001','011110','010010','101101','001110','011100',
    '001111','111100','000101','101000','101011','110101','001010','010100',
    '110001','100011','111110','011111','000110','011000','010110','011010',
    '101110','011101','100100','001001','110100','001011','101100','001101',
    '110110','011011','110010','010011','110011','001100','010101','101010'
  ];

  function hexagramForPattern(pat) {
    var idx = HEXAGRAM_PATTERNS.indexOf(pat);
    return idx >= 0 ? { name: HEXAGRAM_NAMES[idx], desc: HEXAGRAM_DESCRIPTIONS[idx] } : null;
  }

  // ─── state ──────────────────────────────────────────────────────────
  var mode = 'tarot';
  var drawn = [];
  var ichingLines = []; // 6 entries: 0 = yin, 1 = yang
  var ichingCastCount = 0;

  function el(id) { return document.getElementById(id); }
  function deckEl() { return el('divination-deck'); }
  function areaEl() { return el('divination-card-area'); }
  function inputEl() { return el('divination-input'); }
  function drawEl() { return el('divination-draw'); }
  function ichingInputEl() { return el('iching-input'); }
  function castEl() { return el('divination-cast'); }
  function hexEl() { return el('divination-hexagram'); }
  function ichingResultEl() { return el('divination-iching-result'); }
  function ichingNameEl() { return el('divination-iching-name'); }
  function ichingDescEl() { return el('divination-iching-desc'); }

  // ─── tarot ──────────────────────────────────────────────────────────
  function buildDeck() {
    var d = deckEl();
    if (!d) return;
    d.innerHTML = '';
    for (var i = 0; i < DECK.length; i++) {
      var c = document.createElement('div');
      c.className = 'divination-deck-card';
      c.dataset.n = DECK[i].n;
      d.appendChild(c);
    }
  }

  function pickCard() {
    var i;
    do { i = Math.floor(Math.random() * DECK.length); }
    while (drawn.indexOf(i) !== -1);
    drawn.push(i);
    var cards = deckEl().querySelectorAll('.divination-deck-card');
    if (cards[i]) cards[i].classList.add('drawn');
    return DECK[i];
  }

  function reveal(card) {
    var cardId = 'card-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
    areaEl().innerHTML = '<div class="divination-card" data-card-id="' + cardId + '">'
      + '<div class="divination-card-num">' + String(card.n).padStart(2, '0') + ' / 22</div>'
      + '<div class="divination-card-glyph">' + card.g + '</div>'
      + '<div class="divination-card-name">' + card.name + '</div>'
      + '<div class="divination-card-key">' + card.key + '</div>'
      + '<div class="divination-card-stamped">— card drawn, on the desktop —</div>'
      + '</div>';
  }

  function writeCard(card) {
    if (window.Liber && window.Liber.state && window.Liber.state.addArtifact) {
      window.Liber.state.addArtifact('divination', { name: card.name, key: card.key, n: card.n, g: card.g });
    }
  }

  function describeTarot(card) {
    var q = (inputEl() && inputEl().value) || '';
    var qText = q.trim() ? '"' + q.trim() + '"' : '(none)';
    var cardText = card ? card.name : '(none)';
    return 'card: <em>' + cardText + '</em>. question: ' + qText + '.';
  }

  // keep/discard window: the whole draw (face + reading) before choosing.
  function renderPromptCard(card) {
    return '<div class="divination-prompt-card">'
      + '<div class="divination-prompt-card-face">'
      + '<div class="divination-prompt-card-num">' + String(card.n).padStart(2, '0') + ' / 22</div>'
      + '<div class="divination-prompt-card-glyph">' + card.g + '</div>'
      + '<div class="divination-prompt-card-name">' + card.name + '</div>'
      + '</div>'
      + '<div class="divination-prompt-card-read">'
      + '<div class="divination-prompt-card-key">' + card.key + '</div>'
      + '<div class="divination-prompt-card-q">' + describeTarot(card) + '</div>'
      + '</div>'
      + '</div>';
  }

  var pendingCard = null;
  function promptTarotDraw() {
    if (drawn.length >= DECK.length) return;
    var prompt = el('divination-save-prompt');
    var body = el('divination-save-prompt-body');
    if (!prompt) { drawTarotNow(); return; }
    pendingCard = pickCard();
    if (body) body.innerHTML = renderPromptCard(pendingCard);
    prompt.classList.add('open');
    prompt.removeAttribute('inert');
  }

  function drawTarotNow() {
    var card = pickCard();
    reveal(card);
    writeCard(card);
  }

  // ─── iching ─────────────────────────────────────────────────────────
  function castLine() {
    if (ichingLines.length >= 6) return;
    // Each cast: roll 3 coins twice — but the rule of thumb is 6/7/8/9
    // mapping. We approximate: 25% yin (0), 25% yang (1), 25% old yin (2→yang),
    // 25% old yang (3→yin). The hexagram uses only yin/yang for the primary;
    // old lines are shown as changing in the secondary reading.
    var r = Math.floor(Math.random() * 4);
    var primary, isChanging;
    if (r === 0)      { primary = 0; isChanging = false; }
    else if (r === 1) { primary = 1; isChanging = false; }
    else if (r === 2) { primary = 0; isChanging = true; }
    else             { primary = 1; isChanging = true; }
    ichingLines.push({ primary: primary, changing: isChanging });
    ichingCastCount++;
    renderHexagram();
    if (castEl()) {
      castEl().textContent = ichingLines.length < 6 ? ('cast line ' + (ichingLines.length + 1)) : 'the hexagram stands';
      castEl().disabled = ichingLines.length >= 6;
    }
    if (ichingLines.length === 6) readHexagram();
  }

  function renderHexagram() {
    var h = el('divination-hexagram');
    if (!h) return;
    h.innerHTML = '';
    if (!ichingLines.length) {
      var empty = document.createElement('div');
      empty.className = 'divination-hexagram-empty';
      empty.textContent = 'cast six lines to build your hexagram.';
      h.appendChild(empty);
      return;
    }
    // Lines are displayed top-down; we drew them in reading order (line 1 = bottom).
    var rows = ichingLines.slice().reverse();
    rows.forEach(function (ln) {
      var row = document.createElement('div');
      row.className = 'divination-hexagram-row' + (ln.changing ? ' changing' : '');
      var seg1 = document.createElement('div');
      seg1.className = 'divination-hexagram-seg';
      var seg2 = document.createElement('div');
      seg2.className = 'divination-hexagram-seg';
      if (ln.primary === 0) {
        // yin: split line with a gap between seg1 and seg2
        seg1.classList.add('left');
        seg2.classList.add('right');
      } else {
        // yang: solid bar
        seg1.classList.add('full');
        seg2.classList.add('full');
      }
      row.appendChild(seg1);
      row.appendChild(seg2);
      h.appendChild(row);
    });
  }

  function readHexagram() {
    if (ichingLines.length < 6) return;
    var pattern = ichingLines.map(function (l) { return l.primary; }).join('');
    var hex = hexagramForPattern(pattern);
    if (!hex) return;
    if (ichingNameEl()) ichingNameEl().textContent = hex.name;
    if (ichingDescEl()) ichingDescEl().textContent = hex.desc;
    if (ichingResultEl()) ichingResultEl().hidden = false;
    // Save to satchel
    if (window.Liber && window.Liber.state && window.Liber.state.addArtifact) {
      var q = (ichingInputEl() && ichingInputEl().value) || '';
      window.Liber.state.addArtifact('iching', {
        name: hex.name,
        pattern: pattern,
        lines: ichingLines.slice(),
        question: q
      });
      if (window.Liber.sound) window.Liber.sound.play('chime');
    }
  }

  function resetIChing() {
    ichingLines = [];
    ichingCastCount = 0;
    renderHexagram();
    if (castEl()) {
      castEl().textContent = 'cast line 1';
      castEl().disabled = false;
    }
    if (ichingResultEl()) ichingResultEl().hidden = true;
  }

  // ─── mode switching ────────────────────────────────────────────────
  function setMode(next) {
    mode = next;
    var tarot = el('divination-tarot');
    var iching = el('divination-iching');
    if (tarot) tarot.hidden = (next !== 'tarot');
    if (iching) iching.hidden = (next !== 'iching');
    var sub = el('divination-sub');
    if (sub) sub.textContent = next === 'iching'
      ? 'write your question. cast six lines.'
      : 'Type a question & click a card for an interpretation.';
    var btns = document.querySelectorAll('.divination-mode');
    for (var i = 0; i < btns.length; i++) {
      if (btns[i].dataset.mode === next) btns[i].classList.add('active');
      else btns[i].classList.remove('active');
    }
  }

  // ─── boot ──────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    buildDeck();
    if (drawEl()) drawEl().addEventListener('click', promptTarotDraw);
    if (inputEl()) inputEl().addEventListener('keydown', function (e) { if (e.key === 'Enter') promptTarotDraw(); });

    var modeBtns = document.querySelectorAll('.divination-mode');
    for (var i = 0; i < modeBtns.length; i++) {
      modeBtns[i].addEventListener('click', function () { setMode(this.dataset.mode); });
    }

    if (castEl()) castEl().addEventListener('click', castLine);
    if (ichingInputEl()) ichingInputEl().addEventListener('keydown', function (e) { if (e.key === 'Enter') castLine(); });

    var exit = el('divination-exit');
    if (exit) exit.addEventListener('click', function () {
      if (history.length > 1) history.back(); else location.href = 'desktop.html';
    });

    var helpBtn = el('divination-help');
    var raison = el('divination-raison');
    var raisonClose = el('divination-raison-close');
    function openR() { if (raison) { raison.classList.add('open'); raison.removeAttribute('inert'); } }
    function closeR() { if (raison) { raison.classList.remove('open'); raison.setAttribute('inert', ''); } }
    if (helpBtn) helpBtn.addEventListener('click', openR);
    if (raisonClose) raisonClose.addEventListener('click', closeR);
    if (raison) raison.addEventListener('click', function (e) { if (e.target === raison) closeR(); });

    var prompt = el('divination-save-prompt');
    var keepBtn = el('divination-save-prompt-keep');
    var discardBtn = el('divination-save-prompt-discard');
    var closeBtn = el('divination-save-prompt-close');
    function closePrompt() {
      if (!prompt) return;
      prompt.classList.remove('open');
      prompt.setAttribute('inert', '');
      pendingCard = null;
    }
    if (keepBtn) keepBtn.addEventListener('click', function () {
      if (pendingCard) { reveal(pendingCard); writeCard(pendingCard); if (window.Liber && window.Liber.sound) window.Liber.sound.play('chime'); }
      closePrompt();
    });
    if (discardBtn) discardBtn.addEventListener('click', function () {
      if (pendingCard) {
        drawn.pop();
        var cards = deckEl().querySelectorAll('.divination-deck-card');
        for (var k = 0; k < DECK.length; k++) {
          if (DECK[k].name === pendingCard.name && cards[k]) {
            cards[k].classList.remove('drawn');
            break;
          }
        }
        areaEl().innerHTML = '<div class="divination-card-hint">the deck is silent. ask.</div>';
      }
      closePrompt();
    });
    if (closeBtn) closeBtn.addEventListener('click', closePrompt);
    if (prompt) prompt.addEventListener('click', function (e) { if (e.target === prompt) closePrompt(); });
  });
})();