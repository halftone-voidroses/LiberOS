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
      body: 'the shadow is the part of the personality that has been pushed out of conscious light. it is not the dark self; it is the unlit self. jung described it as everything the conscious person refuses to acknowledge about themselves<button type="button" class="learn-fn" data-cite="jung-alchemy-1968" aria-label="citation">†</button>. it carries our unclaimed strengths as well as our rejected weaknesses — what he called the "noble shadow." meeting the shadow is the first act of becoming whole.',
      key: 'depth psychology · integration'
    },
    {
      num: '03', title: 'DBT',
      body: 'dialectical behaviour therapy was developed by marsha linehan in the 1980s<button type="button" class="learn-fn" data-cite="linehan-1993" aria-label="citation">†</button>. its core skill is "wise mind" — what we intuitively know to be true under the blanket of emotions. dbt holds two truths at once: i am doing my best, and i can do better. its skills include mindfulness, distress tolerance (TIPP), emotion regulation, and interpersonal effectiveness (DEAR MAN).',
      key: 'skills group · wise mind · linehan'
    },
    {
      num: '04', title: 'Shadow Work',
      body: 'shadow work is the practice of sitting with what you would rather not. done with care, with a witness, with a cohort, never alone in the dark<button type="button" class="learn-fn" data-cite="lukoff-1985" aria-label="citation">†</button>. it is the deliberate engagement with parts of self that have been projected onto others or exiled entirely<button type="button" class="learn-fn" data-cite="schwartz-1995" aria-label="citation">††</button>. the work is not to destroy the shadow but to give it a seat at the table.',
      key: 'practice · containment · cohort'
    },
    {
      num: '05', title: 'Divination',
      body: 'divination is the practice of letting a structured randomness speak. whether the random generator is tarot cards, the i ching, a deck of bones, or the stops of breath — the shape that emerges is read as if it were a letter from the unconscious. it does not predict. it makes a shape, and the shape is yours to read.',
      key: 'randomness · reading · archana'
    },
    {
      num: '06', title: 'Sigil Amplification',
      body: 'a sigil is a container for a part of you that does not yet have language. draw the contour of a feeling, not the likeness of a face. the looser the line, the more it will hold. once made and kept, the sigil accumulates charge. draw it again. look at it until you forget what it is<button type="button" class="learn-fn" data-cite="csikszentmihalyi-1990" aria-label="citation">†</button>. then look once more.',
      key: 'drawing · embodiment · pataphor'
    },
    {
      num: '07', title: 'Cohort Work', thesis: true,
      body: 'the figures who circle the sigil are not invented — they are remembered. you name them, draw them, and they begin to speak back<button type="button" class="learn-fn" data-cite="luhrmann-2015" aria-label="citation">†</button>. over time the associations with each cohort member grow, and they form a supplementary universe in which the work happens. they are you, displaced sideways into figures that can talk back<button type="button" class="learn-fn" data-cite="schwartz-1995" aria-label="citation">††</button>.',
      key: 'figures · memory · personification'
    },
    {
      num: '08', title: 'Liber Vacui Method', thesis: true,
      body: 'name the question. name what is known. name what is unknown. choose one wall. return — the question will have changed. that change is the work. the method is not a checklist; it is a short cycle repeated as many times as the question requires.',
      key: 'method · named questions · return'
    },
    {
      num: '09', title: 'I Ching',
      body: 'the i ching, or book of changes, is a 3,000-year-old chinese system of divination<button type="button" class="learn-fn" data-cite="i-ching" aria-label="citation">†</button>. it consists of 64 hexagrams built from six lines each, where each line is either yin (broken) or yang (solid). casting lines (traditionally by yarrow stalks or coins) produces a hexagram whose reading offers counsel rather than prediction.',
      key: 'eastern · hexagram · counsel'
    },
    {
      num: '10', title: 'Clinamen',
      body: 'the clinamen is the unpredictable swerve of atoms — the smallest deviation that creates significant change<button type="button" class="learn-fn" data-cite="hugill-2012" aria-label="citation">†</button>. in pataphysics it is a principle applied not just to matter but to language and life itself: the small detours that make the work yours.',
      key: 'pataphysics · deviation · small change'
    },
    {
      num: '11', title: 'Synchronicity',
      body: 'synchronicity is jung\'s term for an acausal connecting principle — a meaningful coincidence that bridges inner and outer<button type="button" class="learn-fn" data-cite="i-ching" aria-label="citation">†</button>. it is the experience of two events lining up in a way that is statistically improbable but personally significant. not magic, not mere chance — meaningful pattern.',
      key: 'jung · meaning · coincidence'
    },
    {
      num: '12', title: 'Wise Mind',
      body: 'wise mind is the integration of logic and emotion — the state of intuitive knowing dbt teaches. it is not the absence of emotion (that is "cold mind") and not the absence of reason (that is "emotion mind"). it is the third thing that holds both. linehan: "what we intuitively know to be the truth under the blanket of emotions."<button type="button" class="learn-fn" data-cite="linehan-1993" aria-label="citation">†</button>',
      key: 'dbt · integration · intuition'
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
    el('learn-cite-topic').textContent = 'filed — ' + c.topic;
    el('learn-cite-body').innerHTML = ''
      + '<div class="learn-cite-source">' + c.source + '</div>'
      + '<div class="learn-cite-what">the workbook rests this on it for: ' + claims + '.</div>'
      + '<div class="learn-cite-scope">' + scope + '</div>'
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
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCite(); });

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
  });
})();