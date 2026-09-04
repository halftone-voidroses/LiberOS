// verify-data.mjs — validate the extracted data banks (zero dependencies)
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
let failures = 0;

function check(name, ok, detail) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures++;
}

function load(file) {
  const p = join(dir, file);
  if (!existsSync(p)) { check(`data/${file} exists`, false, 'missing'); return null; }
  try { return JSON.parse(readFileSync(p, 'utf8')); }
  catch (e) { check(`data/${file} parses`, false, e.message); return null; }
}

const tarot = load('tarot.json');
if (tarot) {
  check('tarot: 22 cards', tarot.cards.length === 22, String(tarot.cards.length));
  check('tarot: required fields', tarot.cards.every(c => c.id && c.name && Array.isArray(c.upright)));
  check('tarot: every card has an authored fragment', tarot.cards.every(c => c.upright.length >= 1));
}

const hexagrams = load('hexagrams.json');
if (hexagrams) {
  check('hexagrams: 64 entries', hexagrams.hexagrams.length === 64, String(hexagrams.hexagrams.length));
  const patterns = new Set(hexagrams.hexagrams.map(h => h.pattern));
  check('hexagrams: patterns unique', patterns.size === 64);
  check('hexagrams: 6-char binary', hexagrams.hexagrams.every(h => /^[01]{6}$/.test(h.pattern)));
  check('hexagrams: names + interpretations present', hexagrams.hexagrams.every(h => h.name && h.interpretation));
}

const exercises = load('exercises.json');
if (exercises) {
  check('exercises: >= 15', exercises.exercises.length >= 15, String(exercises.exercises.length));
  check('exercises: required fields', exercises.exercises.every(e => e.id && e.title && e.domain && typeof e.summary === 'string' && Array.isArray(e.steps) && typeof e.research === 'string'));
}

const glossary = load('glossary.json');
if (glossary) {
  check('glossary: >= 10 terms', glossary.terms.length >= 10, String(glossary.terms.length));
  check('glossary: required fields', glossary.terms.every(t => t.term && t.category && t.definition));
}

const citations = load('citations.json');
if (citations) {
  check('citations: >= 3', citations.citations.length >= 3, String(citations.citations.length));
  check('citations: required fields', citations.citations.every(c => c.id && c.topic && c.source && Array.isArray(c.claimedFor)));
}

const expected = ['tarot.json', 'hexagrams.json', 'exercises.json', 'glossary.json', 'citations.json'];
const actual = existsSync(dir) ? readdirSync(dir).filter(f => f.endsWith('.json')) : [];
check('data dir contents match expectation', expected.every(f => actual.includes(f)), actual.join(', '));

console.log(failures ? `\n${failures} check(s) failed` : '\nall data checks passed');
process.exit(failures ? 1 : 0);
