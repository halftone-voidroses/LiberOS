// divination.js — Arcana. Tarot (22-card deck) + I Ching (six-line hexagram).
// One felt table, one keep language: both games go through the same prompt
// and land on the same shelf, in the same shape.

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
  var drawn = [];        // indices currently out of the stack (kept cards)
  var pendingCard = null;
  var pendingHex = null; // { pattern, lines } awaiting keep/discard
  var ichingLines = [];  // 6 entries: { primary: 0|1, changing: bool }
  var tossing = false;

  function el(id) { return document.getElementById(id); }
  function deckBtn() { return el('divination-draw'); }
  function areaEl() { return el('divination-card-area'); }
  function hintEl() { return el('divination-card-hint'); }
  function inputEl() { return el('divination-input'); }
  function slateEl() { return el('divination-slate'); }
  function tallyEl() { return el('divination-tally'); }
  function castBtn() { return el('divination-cast'); }
  function castNote() { return el('divination-cast-note'); }
  function hexEl() { return el('divination-hexagram'); }
  function resultEl() { return el('divination-iching-result'); }
  function subEl() { return el('divination-sub'); }

  function play(kind) {
    if (window.Liber && window.Liber.sound) { try { window.Liber.sound.play(kind); } catch (e) {} }
  }

  // on the small table the chalked column grows below the fold — bring the
  // new line into view (reduced-motion visitors get the jump, not the glide)
  function compactTable() {
    try { return window.matchMedia('(max-width: 700px), (max-height: 560px)').matches; } catch (e) { return false; }
  }
  function revealInView(node) {
    if (!node || !compactTable()) return;
    var smooth = true;
    try { smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    node.scrollIntoView({ block: 'nearest', behavior: smooth ? 'smooth' : 'auto' });
  }

  // ─── the slate: one question serves both games; it turns to face the house ──
  function question() {
    var q = inputEl() ? inputEl().value : '';
    return q.trim();
  }
  function wireSlate() {
    var input = inputEl();
    var slate = slateEl();
    if (!input || !slate) return;
    // the chalk turns when you stop writing — it faces the house, not you
    input.addEventListener('blur', function () { if (input.value.trim()) slate.classList.add('turned'); });
    input.addEventListener('focus', function () { slate.classList.remove('turned'); });
  }

  // ─── tarot: a stack with weight ─────────────────────────────────────
  function updateTally() {
    if (!tallyEl()) return;
    var left = DECK.length - drawn.length;
    tallyEl().textContent = left === DECK.length ? '' : (left + ' remain');
  }

  function pickCard() {
    var i;
    do { i = Math.floor(Math.random() * DECK.length); }
    while (drawn.indexOf(i) !== -1);
    drawn.push(i);
    return DECK[i];
  }

  // the draw: the top card slides from the stack, then the prompt offers it
  function drawFromStack() {
    if (pendingCard || pendingHex) return;
    if (drawn.length >= DECK.length) {
      if (subEl()) subEl().textContent = 'the deck is out. it was counted three times.';
      return;
    }
    var card = pickCard();
    play('thunk');
    var deck = deckBtn();
    if (deck) {
      deck.classList.add('drawing');
      setTimeout(function () { deck.classList.remove('drawing'); }, 380);
    }
    pendingCard = card;
    updateTally();
    openPrompt(renderCardPrompt(card));
  }

  function questionLine() {
    var q = question();
    return q ? '"' + q + '"' : '(no question — the card came anyway)';
  }

  // ─── the unified keep prompt ────────────────────────────────────────
  function openPrompt(bodyHTML) {
    var prompt = el('divination-save-prompt');
    var body = el('divination-save-prompt-body');
    if (!prompt) return;
    if (body) body.innerHTML = bodyHTML;
    prompt.classList.add('open');
    prompt.removeAttribute('inert');
  }
  function closePrompt() {
    var prompt = el('divination-save-prompt');
    if (!prompt) return;
    prompt.classList.remove('open');
    prompt.setAttribute('inert', '');
  }

  function renderCardPrompt(card) {
    return '<div class="divination-prompt-card">'
      + '<div class="divination-prompt-card-face">'
      + '<div class="divination-prompt-card-num">' + String(card.n).padStart(2, '0') + ' / 22</div>'
      + '<div class="divination-prompt-card-glyph">' + card.g + '</div>'
      + '<div class="divination-prompt-card-name">' + card.name + '</div>'
      + '</div>'
      + '<div class="divination-prompt-card-read">'
      + '<div class="divination-prompt-card-key">' + card.key + '</div>'
      + '<div class="divination-prompt-card-q">question: ' + questionLine() + '</div>'
      + '</div>'
      + '</div>';
  }

  function renderHexPrompt(hex, pattern) {
    var rows = '';
    for (var r = 5; r >= 0; r--) {
      var yin = pattern[r] === '0';
      rows += '<div class="divination-hexagram-row' + (yin ? '' : '') + '" style="width:92px;height:8px">'
        + (yin
          ? '<i class="divination-hexagram-seg left"></i><i class="divination-hexagram-seg right"></i>'
          : '<i class="divination-hexagram-seg full"></i><i class="divination-hexagram-seg full"></i>')
        + '</div>';
    }
    return '<div class="divination-prompt-card">'
      + '<div class="divination-prompt-card-face" style="flex-direction:column-reverse;display:flex;gap:5px;justify-content:center">'
      + rows
      + '</div>'
      + '<div class="divination-prompt-card-read">'
      + '<div class="divination-prompt-card-key">' + hex.name + '</div>'
      + '<div class="divination-prompt-card-q">' + hex.desc + '</div>'
      + '<div class="divination-prompt-card-q">question: ' + questionLine() + '</div>'
      + '</div>'
      + '</div>';
  }

  // keep: the same shelf, the same shape of record, for both games
  function keepDraw() {
    if (pendingCard) {
      var card = pendingCard;
      window.Liber.state.addArtifact('divination', {
        name: card.name, key: card.key, n: card.n, g: card.g,
        reading: card.key, question: question(), ts: Date.now()
      });
      revealCard(card);
      play('chime');
    } else if (pendingHex) {
      var hex = hexagramForPattern(pendingHex.pattern);
      window.Liber.state.addArtifact('divination', {
        name: hex.name, desc: hex.desc, reading: hex.desc,
        pattern: pendingHex.pattern, question: question(), ts: Date.now()
      });
      showHexResult(hex);
      revealInView(resultEl());
      play('chime');
    }
    pendingCard = null;
    pendingHex = null;
    closePrompt();
  }

  function discardDraw() {
    if (pendingCard) {
      // the card goes back in the stack
      drawn.pop();
      updateTally();
      pendingCard = null;
      clearReadingPlace();
    } else if (pendingHex) {
      pendingHex = null;
      resetIChing();
    }
    closePrompt();
  }

  // ─── the reading place ──────────────────────────────────────────────
  function clearReadingPlace() {
    var area = areaEl();
    if (!area) return;
    var card = area.querySelector('.divination-card');
    if (card) card.remove();
    if (hintEl()) hintEl().style.display = '';
    var eye = area.querySelector('.divination-chalk-eye');
    if (eye) eye.style.opacity = '';
  }

  function revealCard(card) {
    var area = areaEl();
    if (!area) return;
    clearReadingPlace();
    if (hintEl()) hintEl().style.display = 'none';
    var eye = area.querySelector('.divination-chalk-eye');
    if (eye) eye.style.opacity = '0.16';
    var d = document.createElement('div');
    d.className = 'divination-card';
    d.setAttribute('data-card-id', 'card-' + Date.now());
    d.innerHTML = '<div class="divination-card-num">' + String(card.n).padStart(2, '0') + ' / 22</div>'
      + '<div class="divination-card-glyph">' + card.g + '</div>'
      + '<div class="divination-card-name">' + card.name + '</div>'
      + '<div class="divination-card-key">' + card.key + '</div>'
      + '<div class="divination-card-stamped">— card drawn, on the desktop —</div>';
    area.appendChild(d);
  }

  // ─── i ching: three coins, six lines, bottom first ──────────────────
  function castLine() {
    if (tossing || pendingCard || pendingHex) return;
    if (ichingLines.length >= 6) return;
    tossing = true;
    var dish = castBtn();
    if (dish) dish.classList.add('tossing');
    play('click');
    setTimeout(function () {
      // the three coins: odd = yang, even = yin; a 6 or an 8 in the old
      // counting is a changing line. approximated honestly.
      var pips = 0;
      for (var c = 0; c < 3; c++) pips += Math.random() < 0.5 ? 2 : 3;
      var yang = pips >= 7;          // 7, 9 yang — 6, 8 yin
      var changing = pips === 9 || pips === 6;
      ichingLines.push({ primary: yang ? 1 : 0, changing: changing });
      tossing = false;
      if (dish) dish.classList.remove('tossing');
      renderHexagram();
      play('tick');
      if (castNote()) castNote().textContent = 'line ' + ichingLines.length + ' of 6 — ' + pips;
      revealInView(hexEl());
      if (ichingLines.length === 6) offerHexagram();
    }, 420);
  }

  function renderHexagram() {
    var h = hexEl();
    if (!h) return;
    h.innerHTML = '';
    ichingLines.slice().reverse().forEach(function (ln) {
      var row = document.createElement('div');
      row.className = 'divination-hexagram-row' + (ln.changing ? ' changing' : '');
      var s1 = document.createElement('i');
      var s2 = document.createElement('i');
      s1.className = 'divination-hexagram-seg';
      s2.className = 'divination-hexagram-seg';
      if (ln.primary === 0) { s1.classList.add('left'); s2.classList.add('right'); }
      else { s1.classList.add('full'); s2.classList.add('full'); }
      row.appendChild(s1); row.appendChild(s2);
      h.appendChild(row);
    });
  }

  function offerHexagram() {
    var pattern = ichingLines.map(function (l) { return l.primary; }).join('');
    var hex = hexagramForPattern(pattern);
    if (!hex) return;
    pendingHex = { pattern: pattern, lines: ichingLines.slice() };
    if (castBtn()) castBtn().disabled = true;   // the hexagram stands
    if (castNote()) castNote().textContent = '';
    openPrompt(renderHexPrompt(hex, pattern));
  }

  function showHexResult(hex) {
    if (el('divination-iching-name')) el('divination-iching-name').textContent = hex.name;
    if (el('divination-iching-desc')) el('divination-iching-desc').textContent = hex.desc;
    if (resultEl()) resultEl().hidden = false;
    if (castBtn()) castBtn().disabled = true;
  }

  function resetIChing() {
    ichingLines = [];
    pendingHex = null;
    renderHexagram();
    var h = hexEl();
    if (h) h.innerHTML = '<div class="divination-hexagram-empty">six lines, chalked bottom first.</div>';
    if (resultEl()) resultEl().hidden = true;
    if (castBtn()) castBtn().disabled = false;
    if (castNote()) castNote().textContent = '';
  }

  // ─── mode switching ─────────────────────────────────────────────────
  function setMode(next) {
    mode = next;
    var tarot = el('divination-tarot');
    var iching = el('divination-iching');
    if (tarot) tarot.hidden = (next !== 'tarot');
    if (iching) iching.hidden = (next !== 'iching');
    if (subEl()) subEl().textContent = next === 'iching'
      ? 'three coins · six lines · bottom first'
      : 'the deck · 22, counted three times';
    var btns = document.querySelectorAll('.divination-mode');
    for (var i = 0; i < btns.length; i++) {
      var on = btns[i].dataset.mode === next;
      btns[i].classList.toggle('active', on);
      btns[i].setAttribute('aria-selected', on ? 'true' : 'false');
    }
  }

  // ─── boot ───────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    var drawBtn = deckBtn();
    if (drawBtn) drawBtn.addEventListener('click', drawFromStack);
    if (inputEl()) inputEl().addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (mode === 'tarot') drawFromStack(); else castLine();
      }
    });
    wireSlate();
    updateTally();

    var modeBtns = document.querySelectorAll('.divination-mode');
    for (var i = 0; i < modeBtns.length; i++) {
      modeBtns[i].addEventListener('click', function () { setMode(this.dataset.mode); });
    }

    var cast = castBtn();
    if (cast) cast.addEventListener('click', castLine);

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
    if (window.LiberRoomShell) window.LiberRoomShell.bindRoomOverlays({ overlays: [
      { id: 'divination-raison', close: closeR }
    ] });

    var keepBtn = el('divination-save-prompt-keep');
    var discardBtn = el('divination-save-prompt-discard');
    var closeBtn = el('divination-save-prompt-close');
    function cancelPrompt() {
      if (pendingCard) { drawn.pop(); updateTally(); pendingCard = null; clearReadingPlace(); }
      if (pendingHex) { resetIChing(); }   // escape must not strand the cast
      pendingHex = null;
      closePrompt();
    }
    if (window.LiberRoomShell) window.LiberRoomShell.bindRoomOverlays({ overlays: [
      { id: 'divination-save-prompt', close: cancelPrompt }
    ] });
    if (window.LiberRoomShell.bindConfirmKey) window.LiberRoomShell.bindConfirmKey(['divination-save-prompt']);
    if (keepBtn) keepBtn.addEventListener('click', keepDraw);
    if (discardBtn) discardBtn.addEventListener('click', discardDraw);
    if (closeBtn) closeBtn.addEventListener('click', cancelPrompt);
    var promptEl = el('divination-save-prompt');
    if (promptEl) promptEl.addEventListener('click', function (e) { if (e.target === promptEl) cancelPrompt(); });
  });
})();
