// learn.js — The Librarian. Subject cards with comprehensive definitions.
// Each subject is a clickable box; click opens the full card body.
// No state machine — this is reference material, not a graded curriculum.

(function () {
  var CARDS = [
    {
      num: '01', title: 'Pataphysics',
      body: 'pataphysics is the science of imaginary solutions. coined by alfred jarry (1873–1907), it treats the imaginary as if it were real. it is a science of exceptions, of the particular, of supplementary universes — the place where the rule breaks, and the breaking is the lesson. in this vacui it is the ground beneath everything else.',
      key: 'science · imaginary solutions · exceptions'
    },
    {
      num: '02', title: 'Jungian Shadow',
      body: 'the shadow is the part of the personality that has been pushed out of conscious light. it is not the dark self; it is the unlit self. jung described it as everything the conscious person refuses to acknowledge about themselves. it carries our unclaimed strengths as well as our rejected weaknesses — what he called the "noble shadow." meeting the shadow is the first act of becoming whole.',
      key: 'depth psychology · integration'
    },
    {
      num: '03', title: 'DBT',
      body: 'dialectical behaviour therapy was developed by marsha linehan in the 1980s. its core skill is "wise mind" — what we intuitively know to be true under the blanket of emotions. dbt holds two truths at once: i am doing my best, and i can do better. its skills include mindfulness, distress tolerance (TIPP), emotion regulation, and interpersonal effectiveness (DEAR MAN).',
      key: 'skills group · wise mind · linehan'
    },
    {
      num: '04', title: 'Shadow Work',
      body: 'shadow work is the practice of sitting with what you would rather not. done with care, with a witness, with a cohort, never alone in the dark. it is the deliberate engagement with parts of self that have been projected onto others or exiled entirely. the work is not to destroy the shadow but to give it a seat at the table.',
      key: 'practice · containment · cohort'
    },
    {
      num: '05', title: 'Divination',
      body: 'divination is the practice of letting a structured randomness speak. whether the random generator is tarot cards, the i ching, a deck of bones, or the stops of breath — the shape that emerges is read as if it were a letter from the unconscious. it does not predict. it makes a shape, and the shape is yours to read.',
      key: 'randomness · reading · archana'
    },
    {
      num: '06', title: 'Sigil Amplification',
      body: 'a sigil is a container for a part of you that does not yet have language. draw the contour of a feeling, not the likeness of a face. the looser the line, the more it will hold. once made and kept, the sigil accumulates charge. draw it again. look at it until you forget what it is. then look once more.',
      key: 'drawing · embodiment · pataphor'
    },
    {
      num: '07', title: 'Cohort Work',
      body: 'the figures who circle the sigil are not invented — they are remembered. you name them, draw them, and they begin to speak back. over time the associations with each cohort member grow, and they form a supplementary universe in which the work happens. they are you, displaced sideways into figures that can talk back.',
      key: 'figures · memory · personification'
    },
    {
      num: '08', title: 'Liber Vacui Method',
      body: 'name the question. name what is known. name what is unknown. choose one wall. return — the question will have changed. that change is the work. the method is not a checklist; it is a short cycle repeated as many times as the question requires.',
      key: 'method · named questions · return'
    },
    {
      num: '09', title: 'I Ching',
      body: 'the i ching, or book of changes, is a 3,000-year-old chinese system of divination. it consists of 64 hexagrams built from six lines each, where each line is either yin (broken) or yang (solid). casting lines (traditionally by yarrow stalks or coins) produces a hexagram whose reading offers counsel rather than prediction.',
      key: 'eastern · hexagram · counsel'
    },
    {
      num: '10', title: 'Clinamen',
      body: 'the clinamen is the unpredictable swerve of atoms — the smallest deviation that creates significant change. in pataphysics it is a principle applied not just to matter but to language and life itself: the small detours that make the work yours.',
      key: 'pataphysics · deviation · small change'
    },
    {
      num: '11', title: 'Synchronicity',
      body: 'synchronicity is jung\'s term for an acausal connecting principle — a meaningful coincidence that bridges inner and outer. it is the experience of two events lining up in a way that is statistically improbable but personally significant. not magic, not mere chance — meaningful pattern.',
      key: 'jung · meaning · coincidence'
    },
    {
      num: '12', title: 'Wise Mind',
      body: 'wise mind is the integration of logic and emotion — the state of intuitive knowing dbt teaches. it is not the absence of emotion (that is "cold mind") and not the absence of reason (that is "emotion mind"). it is the third thing that holds both. linehan: "what we intuitively know to be the truth under the blanket of emotions."',
      key: 'dbt · integration · intuition'
    }
  ];

  var drawersEl = null;
  var cardEl = null;

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
    buildDrawers();
    if (drawersEl && drawersEl.firstChild) showCard(0);

    var exit = el('learn-exit');
    if (exit) exit.addEventListener('click', function () {
      if (history.length > 1) history.back(); else location.href = 'desktop.html';
    });

    var helpBtn = el('learn-help');
    var raison = el('learn-raison');
    var raisonClose = el('learn-raison-close');
    function openR() { if (raison) { raison.classList.add('open'); raison.setAttribute('aria-hidden', 'false'); } }
    function closeR() { if (raison) { raison.classList.remove('open'); raison.setAttribute('aria-hidden', 'true'); } }
    if (helpBtn) helpBtn.addEventListener('click', openR);
    if (raisonClose) raisonClose.addEventListener('click', closeR);
    if (raison) raison.addEventListener('click', function (e) { if (e.target === raison) closeR(); });
  });
})();