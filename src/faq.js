// faq.js — the "?" beside the monitor (desktop.html only).
// A pixel-art toggle in the room's black space opens a question list;
// each question expands its answer below it. No shared imports
// (covenant Q.1): standalone IIFE, builds its own DOM. Copy lives here
// so the panel works file:// with no fetch. Button clicks get the
// delegated press sound from src/sound.js for free.

(function () {
  'use strict';

  // Pixel "?" glyph on a 12x14 cell grid (crispEdges, dial-glyph idiom).
  var Q_GLYPH = '<svg viewBox="0 0 12 14" aria-hidden="true" fill="currentColor">' +
    '<path d="M3 1h6v1H3zM2 2h1v3H2zM9 2h1v3H9zM3 5h4v1H3zM7 5h1v2H7zM6 7h1v1H6zM6 9h1v1H6zM6 11h1v2H6z"/>' +
    '</svg>';

  var FAQ = [
    {
      q: 'What is LiberOS?',
      a: '<p>At its core, liberOS is an art therapy tool, disguised as a game, disguised as a spooky computer. You draw a buddy, play games, and think about how they relate. You can take notes about it, relate things. Ultimately, it is designed to help you learn about yourself.</p>'
    },
    {
      q: 'What do I do?',
      a: '<p>First draw a buddy! Think about what you want the buddy to represent, that is your <em>intention</em>.</p>' +
        '<p>Then, select associations from the drop down menu. Just pick whatever feels right, it helps shape the prompts you get in the future.</p>' +
        '<p>Then, using the colors and tools draw something in the box. Anything, but try and invoke the <em>feeling</em> that most closely matches the <em>intention</em>.</p>' +
        '<p>Once you are finished, save it, select the X and return to the desktop.</p>' +
        '<p>You\u2019ll now see your buddy in the middle, that\u2019s the yellow circle with the star in it. Orbiting it is an \u201cartifact\u201d — this one was created by your intention. Click the artifact to link it to your buddy.</p>' +
        '<p>That\u2019s it! Play the games, save artifacts, and let your buddy grow.</p>'
    },
    {
      q: 'Give me an example of how to use this.',
      a: '<p>Sure thing.</p>' +
        '<p>Let\u2019s say people tell you that you \u201cjust like to hear the sound of your own voice\u201d and you think NO WAY! — but maybe, deep down, you suspect it makes you feel that way because it\u2019s at least a little true. That\u2019s the sort of thing that makes a good \u201cintention\u201d.</p>' +
        '<p>When I\u2019m drawing my buddy, I might set my intention as \u201cwhy I talk so much\u201d. I should select a color that represents it, clicking through to find the right one. Then, I can use the tools underneath to select colors, shapes, dye things.</p>' +
        '<p>In this case I\u2019ll make a microphone, with some flames around it… and maybe a crack through the top. That seems <em>symbolically</em> related to my <em>intention</em>.</p>' +
        '<p>After I save my buddy, I might click around to the games, I find the divination one really speaks to me, and when I ask it a question like \u201cwhat does my buddy want to tell me\u201d it shows me the tarot card — inverted judgement.</p>'
    },
    {
      q: 'What does it mean for something to be related?',
      a: '<p>Think of you and your buddy on either side of a wall, and each of you have a tin-can. You can hold your ear to the wall, but without a string you won\u2019t hear anything, because there is no connection.</p>' +
        '<p>The connections are ways for you to establish a communication. So, if your buddy\u2019s intention is you talking too much, and you draw the tarot card judgement you may realize \u201cI talk too much because if I am quiet I am afraid of people judging me\u201d.</p>'
    },
    {
      q: 'Who are the travellers?',
      a: '<p>The travellers are fictional people that have used this in the past, they have each designed an app and affected the computer, just like you\u2019re going to do! The idea is this will help you feel related to the process, since others have done it before. What were their buddies? Their relations? Something to consider.</p>'
    },
    {
      q: 'What are the apps?',
      a: '<p>The apps are different types of tools based on elements of art therapy, DBT, analytical psychology, free association, and perennial psychology.</p>',
      sub: [
        {
          q: 'What is the Buddy?',
          a: '<p>The buddy is an app based on \u201cSymbol Amplification\u201d — a concept in analytical psychology where a symbol (and its variants) develop a larger sense of life, purpose, and knowledge. So while the \u201cI talk too much\u201d thought might be small and repressed in your mind, by \u201cAmplifying\u201d it using the LiberOS it inherits more and more significance and meaning, and, ideally, provides insight.</p>'
        },
        {
          q: 'What is the Sea?',
          a: '<p>The sea is two things. One, it allows you to release thoughts you might have been holding on to — negative thoughts, thoughts of trauma and harm. Lets say you are really upset, you told your friends you were working on talking less and they all made fun of you. Aww. Open the Sea app and type your bad thoughts, and let them drift away into the ocean. The second part is a breathing tool — breathe along with it and it will help relax you!</p>'
        },
        {
          q: 'What is Chat?',
          a: '<p>That is LiberChat — a system that uses <em>offline</em> <em>Classic Chatbot (ELIZA) style responses</em> to mirror the things you say back to it. It has a large context menu and responds to certain phrases, you can say what you want and hope it provides insight.</p>'
        },
        {
          q: 'What is Learn?',
          a: '<p>Learn is a place that allows you to learn about some of the theories and ideas that are baked into the LiberOS.</p>'
        },
        {
          q: 'What is Dreams?',
          a: '<p>Dreams is a dream journal, it has a similar ELIZA style bot that identifies common Jungian symbols in dream analysis, check out the portfolios too.</p>'
        }
      ]
    },
    {
      q: 'Why does it look so spooky?',
      a: '<p>Because the dark is where the work happens. A bright clean machine would make this feel like homework; the haunted CRT makes it feel like a s\u00e9ance, and a s\u00e9ance gives you permission to take your own symbols seriously. Nothing here can hurt you — the spook is set-dressing, and the set is on your side.</p>'
    },
    {
      q: 'What ideas is this based on?',
      a: '<p>Analytical psychology most of all — Jung\u2019s active imagination and symbol amplification, the shadow, the household of complexes — mixed with art therapy, a little DBT, and the perennial psychology of symbols that mean the same thing in every century. The Learn room holds the reading list, with citations.</p>'
    }
  ];

  function buildItem(entry) {
    var item = document.createElement('div');
    item.className = 'faq-item';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'faq-q';
    btn.textContent = entry.q;
    btn.setAttribute('aria-expanded', 'false');

    var ans = document.createElement('div');
    ans.className = 'faq-a';
    ans.hidden = true;
    var inner = document.createElement('div');
    inner.className = 'faq-a-inner';
    inner.innerHTML = entry.a;
    ans.appendChild(inner);

    if (entry.sub) {
      var sub = document.createElement('div');
      sub.className = 'faq-sub';
      entry.sub.forEach(function (s) {
        sub.appendChild(buildItem(s));
      });
      inner.appendChild(sub);
    }

    btn.addEventListener('click', function () {
      var open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      ans.hidden = !open;
    });

    item.appendChild(btn);
    item.appendChild(ans);
    return item;
  }

  function init() {
    if (!document.querySelector('.state-desktop')) return; // desktop only
    if (document.querySelector('.faq-toggle')) return; // never twice

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'faq-toggle';
    toggle.setAttribute('aria-label', 'questions about liberOS');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = Q_GLYPH;

    var panel = document.createElement('div');
    panel.className = 'faq-panel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'questions about liberOS');

    var head = document.createElement('div');
    head.className = 'faq-head';
    head.textContent = 'questions';
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'faq-close';
    close.setAttribute('aria-label', 'close');
    close.textContent = '\u00d7';
    head.appendChild(close);
    panel.appendChild(head);

    FAQ.forEach(function (entry) {
      panel.appendChild(buildItem(entry));
    });

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.hidden = !open;
      if (!open) toggle.focus();
    }

    toggle.addEventListener('click', function () {
      setOpen(panel.hidden);
    });
    close.addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) setOpen(false);
    });

    document.body.appendChild(toggle);
    document.body.appendChild(panel);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
