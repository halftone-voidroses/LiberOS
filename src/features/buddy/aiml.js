// aiml.js — a deterministic AIML interpreter for LiberChat.
// Categories, `*`/`_` wildcards, <srai> recursion (depth-guarded),
// <random>, <set>/<get> predicates, <that> context, topics, <person>
// reflection and <bot name="..."/> substitution. Rotation is driven by
// counters (same house rule as eliza.js: no Math.random anywhere the
// visitor can perceive). Predicates persist through injected get/set
// callbacks (state.chat.pred). No dependencies, file://-safe.
// Category order IS priority: first match wins.

(function (global) {
  'use strict';

  var MAX_SRAI = 6;

  function norm(s) {
    return String(s || '').toUpperCase()
      .replace(/['\u2018\u2019]/g, '')
      .replace(/[^A-Z0-9*_|\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // same tokenization as norm, but case-preserved: star captures keep the
  // visitor's own casing ("my name is Rose" keeps Rose, not ROSE).
  function rawWords(s) {
    return String(s || '')
      .replace(/['\u2018\u2019]/g, '')
      .replace(/[^A-Za-z0-9*_\s|]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(Boolean);
  }

  function tokenize(pattern) {
    return norm(pattern).split(' ').filter(Boolean);
  }

  // match pattern tokens against input words. Returns { score, stars }
  // or null. Scoring (standard AIML order): exact 3, _ 2, * 1. Stars are
  // captured from the case-preserved words so replies echo the visitor.
  // A token may offer alternatives with | — DRAW|DRAWING|DRAWN matches
  // any one word in that position (each alternative scores as exact).
  function matchTokens(pt, words, raws) {
    var stars = [];
    function grab(from, to) {
      var slice = (raws || []).slice(from, to);
      return slice.length ? slice.join(' ') : words.slice(from, to).join(' ');
    }
    function rec(pi, wi) {
      if (pi === pt.length) return wi === words.length ? { score: 0, stars: stars.slice() } : null;
      var tok = pt[pi];
      if (tok === '*') {
        for (var end = words.length; end >= wi; end--) {
          stars.push(grab(wi, end));
          var r = rec(pi + 1, wi + (end - wi));
          if (r) { r.score += 1; return r; }
          stars.pop();
        }
        return null;
      }
      if (tok === '_') {
        if (wi >= words.length) return null;
        stars.push(grab(wi, wi + 1));
        var r2 = rec(pi + 1, wi + 1);
        if (r2) { r2.score += 2; return r2; }
        stars.pop();
        return null;
      }
      if (wi < words.length && words[wi] === tok) {
        var r3 = rec(pi + 1, wi + 1);
        if (r3) { r3.score += 3; return r3; }
        return null;
      }
      if (tok.indexOf('|') !== -1 && wi < words.length) {
        var alts = tok.split('|');
        for (var ai = 0; ai < alts.length; ai++) {
          if (words[wi] === alts[ai]) {
            var ra = rec(pi + 1, wi + 1);
            if (ra) { ra.score += 3; return ra; }
            return null;
          }
        }
        return null;
      }
      return null;
    }
    return rec(0, 0);
  }

  var PERSON = {
    I: 'YOU', ME: 'YOU', MY: 'YOUR', MINE: 'YOURS', MYSELF: 'YOURSELF',
    YOU: 'I', YOUR: 'MY', YOURS: 'MINE', YOURSELF: 'MYSELF',
    WE: 'YOU', US: 'YOU', OUR: 'YOUR', OURS: 'YOURS',
    AM: 'ARE', ARE: 'AM', WAS: 'WERE', WERE: 'WAS'
  };

  function reflect(s) {
    var toks = String(s || '').split(/(\s+)/);
    for (var i = 0; i < toks.length; i++) {
      var core = toks[i].toUpperCase().replace(/[^A-Z']/g, '');
      if (core && PERSON.hasOwnProperty(core)) {
        toks[i] = toks[i].replace(new RegExp(core, 'i'), function () {
          return toks[i] === toks[i].toUpperCase() ? PERSON[core] : PERSON[core].toLowerCase();
        });
      }
    }
    return toks.join('');
  }

  function escRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function createBot(def) {
    var cats = def.categories || [];
    var hits = {};       // category index -> times answered
    var turn = 0;        // the room's clock — all rotation derives from it
    var lastReply = '';
    var topic = '';
    var preds = (def.preds && typeof def.preds === 'object') ? def.preds : {};
    function savePreds() { if (typeof def.savePreds === 'function') { try { def.savePreds(preds); } catch (e) {} } }

    function pick(arr, salt) {
      if (!arr || !arr.length) return '';
      return arr[(turn + (salt || 0)) % arr.length];
    }

    // process one template string into output text
    function render(tpl, stars, depth) {
      var out = String(tpl == null ? '' : tpl);
      // <person>…</person> first (innermost intent), then star/srai/random/set/get/bot
      out = out.replace(/<person>([\s\S]*?)<\/person>/gi, function (m, inner) {
        return reflect(render(inner, stars, depth));
      });
      out = out.replace(/<star\s+index="(\d+)"\s*\/>/gi, function (m, n) {
        var v = stars[parseInt(n, 10) - 1];
        return v == null ? '' : reflect(v);
      });
      out = out.replace(/<star\s*\/>/gi, function () {
        return stars.length ? reflect(stars[0]) : '';
      });
      out = out.replace(/<srai>([\s\S]*?)<\/srai>/gi, function (m, inner) {
        if (depth >= MAX_SRAI) return '';
        var target = inner.replace(/<star\s+index="(\d+)"\s*\/>/gi, function (mm, n) {
          var v = stars[parseInt(n, 10) - 1];
          return v == null ? '' : v;
        }).replace(/<star\s*\/>/gi, function () {
          return stars.length ? stars[0] : '';
        });
        return respond(target, depth + 1);
      });
      out = out.replace(/<random>([\s\S]*?)<\/random>/gi, function (m, inner) {
        var lis = [];
        inner.replace(/<li>([\s\S]*?)<\/li>/gi, function (mm, li) { lis.push(li); return ''; });
        turn++;
        return render(pick(lis, 0), stars, depth);
      });
      out = out.replace(/<set\s+name="([a-zA-Z0-9_]+)"\s*>([\s\S]*?)<\/set>/gi, function (m, name, inner) {
        var val = render(inner, stars, depth).trim();
        preds[name.toLowerCase()] = val;
        savePreds();
        if (name.toLowerCase() === 'topic') topic = val;
        return val;
      });
      out = out.replace(/<get\s+name="([a-zA-Z0-9_]+)"\s*\/>/gi, function (m, name) {
        var v = preds[name.toLowerCase()];
        if (v == null || v === '') {
          var d = (def.defaults && def.defaults[name.toLowerCase()]);
          return d == null ? '' : d;
        }
        return v;
      });
      out = out.replace(/<bot\s+name="([a-zA-Z0-9_]+)"\s*\/>/gi, function (m, name) {
        var meta = (def.meta && def.meta[name.toLowerCase()]) || '';
        return meta;
      });
      return out;
    }

    function find(input, thatLine) {
      var words = norm(input).split(' ').filter(Boolean);
      var raws = rawWords(input);
      if (!words.length) return null;
      var best = null;
      function eligible(c) {
        if (c.topic && norm(c.topic) !== norm(topic)) return false;
        if (c.that && norm(c.that) !== norm(thatLine || '')) return false;
        return true;
      }
      var i, c, m;
      for (i = 0; i < cats.length; i++) {
        c = cats[i];
        if (!eligible(c)) continue;
        m = matchTokens(tokenize(c.p || ''), words, raws);
        if (!m) continue;
        // order is priority, but a strictly better score wins ties across
        // patterns of equal shape — first best-shape match answers.
        if (!best || m.score > best.m.score) {
          best = { cat: c, idx: i, m: m };
          if (m.score >= words.length * 3) break; // exact: cannot beat
        }
      }
      if (best) return best;
      // second pass: keyword scan. Single-position patterns (one token,
      // alternatives included, no wildcards) also answer when their word
      // appears anywhere in the input — "my boss hates me" hears BOSS.
      // Score 0: never outranks a full-pattern match. Earliest category
      // wins ties. Single-token templates never need <star/>.
      for (i = 0; i < cats.length; i++) {
        c = cats[i];
        if (!eligible(c)) continue;
        var toks = tokenize(c.p || '');
        if (toks.length !== 1 || toks[0] === '*' || toks[0] === '_') continue;
        var alts = toks[0].split('|');
        for (var a = 0; a < alts.length; a++) {
          if (words.indexOf(alts[a]) !== -1) {
            return { cat: c, idx: i, m: { score: 0, stars: [] } };
          }
        }
      }
      return null;
    }

    function respond(input, depth) {
      depth = depth || 0;
      var found = find(input, lastReply);
      var reply;
      if (found) {
        var c = found.cat;
        if (c.srai) {
          reply = depth >= MAX_SRAI ? '' : respond(c.srai, depth + 1);
        } else {
          var ts = c.t || [];
          var n = hits[found.idx] || 0;
          hits[found.idx] = n + 1;
          reply = render(pick(ts, n), found.m.stars, depth);
        }
      } else {
        reply = render(pick(def.fallback || ['Tell me more about that.'], turn), [], depth);
      }
      turn++;
      if (depth === 0) lastReply = reply;
      return reply;
    }

    function greet() {
      var g = render(pick(def.greetings || ['Hello.'], turn), [], 0);
      turn++;
      lastReply = g;
      return g;
    }

    function reset() {
      hits = {};
      turn = 0;
      lastReply = '';
      topic = '';
    }

    return { respond: respond, greet: greet, reset: reset, def: def };
  }

  global.Liber = global.Liber || {};
  global.Liber.aiml = { create: createBot, norm: norm };
})(window);
