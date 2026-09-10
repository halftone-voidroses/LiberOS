// app-dist.cjs — assemble dist/ for the Tauri wrapper.
// Copies the frozen static surface (root pages + src/ + styles/ + data/ +
// fonts/) into dist/ byte-identically, then verifies the copy with sha256.
// The wrapper embeds dist/ (tauri.conf.json frontendDist); a direct
// reference to the repo root is not possible because tauri embeds every
// file in frontendDist — node_modules/.git/src-tauri/target would land in
// the binary. This copy is faithful by construction and verified below.
//
// presentation/ is intentionally excluded: it is the web-only cover site,
// not part of the OS surface.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const DIRS = ['src', 'styles', 'data', 'fonts', 'assets'];

function rmrf(p) {
  if (!fs.existsSync(p)) return;
  fs.rmSync(p, { recursive: true, force: true });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function sha256(p) {
  return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

rmrf(DIST);
fs.mkdirSync(DIST, { recursive: true });

// Root pages: every top-level .html is part of the OS surface.
let pages = 0;
for (const f of fs.readdirSync(ROOT)) {
  if (f.endsWith('.html') && fs.statSync(path.join(ROOT, f)).isFile()) {
    fs.copyFileSync(path.join(ROOT, f), path.join(DIST, f));
    pages++;
  }
}

// Surface directories, verbatim.
for (const d of DIRS) copyDir(path.join(ROOT, d), path.join(DIST, d));

// Verify: every file in dist/ must hash-identical to its source.
let files = 0;
let bytes = 0;
const bad = [];
for (const rel of walk(DIST, []).map((p) => path.relative(DIST, p))) {
  const src = path.join(ROOT, rel);
  const dst = path.join(DIST, rel);
  const a = sha256(src);
  const b = sha256(dst);
  files++;
  bytes += fs.statSync(dst).size;
  if (a !== b) bad.push(rel);
}

if (bad.length) {
  console.error('dist copy DIVERGED from source:');
  for (const f of bad) console.error('  ' + f);
  process.exit(1);
}

console.log(`dist assembled: ${pages} root pages + ${DIRS.join(', ')}`);
console.log(`dist verified: ${files} files, byte-identical (sha256), ${(bytes / 1024).toFixed(0)} KiB`);
