// LiberVacui1.0 — local dev server
// Picks the first free port starting at 8030 and serves the current directory.

const http = require('http');
const fs = require('fs');
const path = require('path');
const net = require('net');

const ROOT = __dirname;
const START_PORT = 8030;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.mjs':  'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.otf':  'font/otf',
  '.mp3':  'audio/mpeg',
  '.wav':  'audio/wav',
  '.ogg':  'audio/ogg',
};

function freePort(start) {
  return new Promise((resolve, reject) => {
    const tryNext = (p) => {
      const s = net.createServer();
      s.listen(p, '127.0.0.1', () => {
        s.close(() => resolve(p));
      });
      s.on('error', () => tryNext(p + 1));
    };
    tryNext(start);
  });
}

function send(res, status, body, headers) {
  res.writeHead(status, Object.assign({
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  }, headers || {}));
  res.end(body);
}

function notFound(res) {
  send(res, 404, 'not found', { 'Content-Type': 'text/plain' });
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  // `/` is the boot — the machine itself is the front door.
  if (urlPath === '/') {
    res.writeHead(302, { Location: '/index.html' });
    return res.end();
  }

  const tryFile = (rel) => {
    const filePath = path.normalize(path.join(ROOT, rel));
    if (!filePath.startsWith(ROOT)) return null;
    try {
      const s = fs.statSync(filePath);
      if (s.isFile()) return { filePath, stat: s };
    } catch (e) {}
    return null;
  };

  let hit = tryFile(urlPath);
  if (!hit && !path.extname(urlPath)) {
    hit = tryFile(urlPath.replace(/\/$/, '') + '/index.html');
  }
  if (!hit) return notFound(res);

  const ext = path.extname(hit.filePath).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': type,
    'Content-Length': hit.stat.size,
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  });
  fs.createReadStream(hit.filePath).pipe(res);
});

(async () => {
  const port = await freePort(START_PORT);
  server.listen(port, '127.0.0.1', () => {
    console.log(`LiberVacui1.0 serving on http://127.0.0.1:${port}`);
  });
})();
