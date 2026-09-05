// probe-file-protocol.mjs — verify the static surface boots from file://
// (the exact protocol the Windows portable version uses).
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const entry = 'file://' + path.join(root, 'dist', 'index.html');

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
const failed = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('requestfailed', (r) => failed.push(r.url()));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto(entry, { waitUntil: 'load' });
await page.waitForTimeout(4000);

const title = await page.title();
const bodyChars = (await page.textContent('body'))?.trim().length ?? 0;

console.log(`title: ${JSON.stringify(title)}`);
console.log(`body chars: ${bodyChars}`);
console.log(`pageerrors: ${errors.length}`);
for (const e of errors) console.log('  ERR ' + e.slice(0, 200));
console.log(`failed requests: ${failed.length}`);
for (const f of failed) console.log('  FAIL ' + f);

await page.screenshot({ path: path.join(root, 'screenshots', 'windows-file-protocol-probe.png') });
await browser.close();

if (errors.length || failed.length) {
  console.log('VERDICT: FAIL');
  process.exit(1);
}
console.log('VERDICT: PASS — boots clean from file://');
