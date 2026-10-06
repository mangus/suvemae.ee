'use strict';
// Suvemäe labor server: per-project storage, high scores and realtime rooms for
// the children's projects, plus an optional static file server for local runs.
//
// Configuration comes from the JSON file named by LABOR_CONFIG (see README.md);
// PORT, HOST, DB_PATH and STATIC override it for quick local runs.

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');
const { WebSocketServer } = require('ws');

const LIMITS = {
  body: 32 * 1024,
  value: 16 * 1024,
  keysPerProject: 500,
  scoresPerBoard: 2000,
  nameLength: 20,
  message: 8 * 1024,
  roomSize: 30,
  connections: 2000,
};
const SLUG = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/;
const KEY = /^[A-Za-z0-9_.-]{1,64}$/;
const ROOM = /^[A-Za-z0-9_-]{1,32}$/;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm',
};

const config = loadConfig();
const mounts = Object.entries(config.mounts)
  .map(([prefix, value]) => {
    const { dir, label } = typeof value === 'string' || value === null ? { dir: value } : value;
    return {
      prefix: prefix.endsWith('/') ? prefix : prefix + '/',
      dir: dir ? fs.realpathSync(path.resolve(__dirname, dir)) : null,
      label: label || prefix,
    };
  })
  .sort((a, b) => b.prefix.length - a.prefix.length);

const db = openDb(config.db);
const sql = {
  kvGet: db.prepare('SELECT value FROM kv WHERE project = ? AND key = ?'),
  kvKeys: db.prepare('SELECT key FROM kv WHERE project = ? ORDER BY key'),
  kvCount: db.prepare('SELECT count(*) AS n FROM kv WHERE project = ?'),
  kvPut: db.prepare(
    'INSERT INTO kv (project, key, value, updated) VALUES (?, ?, ?, ?) ' +
      'ON CONFLICT (project, key) DO UPDATE SET value = excluded.value, updated = excluded.updated',
  ),
  kvDelete: db.prepare('DELETE FROM kv WHERE project = ? AND key = ?'),
  scoreAdd: db.prepare('INSERT INTO scores (project, board, name, score, created) VALUES (?, ?, ?, ?, ?)'),
  scoresDesc: db.prepare(
    'SELECT id, name, score, created FROM scores WHERE project = ? AND board = ? ORDER BY score DESC, created ASC LIMIT ?',
  ),
  scoresAsc: db.prepare(
    'SELECT id, name, score, created FROM scores WHERE project = ? AND board = ? ORDER BY score ASC, created ASC LIMIT ?',
  ),
  scoreCount: db.prepare('SELECT count(*) AS n FROM scores WHERE project = ? AND board = ?'),
  // Keeps the 500 best scores in both directions, so the board works for points and for times.
  scoreTrim: db.prepare(
    'DELETE FROM scores WHERE project = ?1 AND board = ?2 ' +
      'AND id NOT IN (SELECT id FROM scores WHERE project = ?1 AND board = ?2 ORDER BY score DESC LIMIT 500) ' +
      'AND id NOT IN (SELECT id FROM scores WHERE project = ?1 AND board = ?2 ORDER BY score ASC LIMIT 500)',
  ),
};

function loadConfig() {
  const file = process.env.LABOR_CONFIG;
  const c = file ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  if (process.env.STATIC) c.mounts = { '/': process.env.STATIC };
  return {
    host: process.env.HOST || c.host || '127.0.0.1',
    port: Number(process.env.PORT || c.port || 8700),
    db: process.env.DB_PATH || c.db || path.join(__dirname, 'data', 'labor.db'),
    // Mount prefix -> static directory, or null for API only. The API lives at <prefix>api/.
    mounts: c.mounts || { '/': null },
    // Allowed Origin headers for writes and WebSockets; empty allows any.
    origins: c.origins || [],
    // JSON array of existing project slugs; without it, mount directories are checked.
    projectsFile: c.projectsFile ? path.resolve(__dirname, c.projectsFile) : null,
  };
}

function openDb(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const d = new DatabaseSync(file);
  d.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 3000;
    CREATE TABLE IF NOT EXISTS kv (
      project TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      updated INTEGER NOT NULL,
      PRIMARY KEY (project, key)
    );
    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY,
      project TEXT NOT NULL,
      board TEXT NOT NULL,
      name TEXT NOT NULL,
      score REAL NOT NULL,
      created INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS scores_board ON scores (project, board, score);
  `);
  return d;
}

// Token bucket per key: `rate` tokens per second, at most `burst` saved up.
function limiter(rate, burst) {
  const buckets = new Map();
  setInterval(() => {
    const old = Date.now() - 10 * 60 * 1000;
    for (const [key, b] of buckets) if (b.t < old) buckets.delete(key);
  }, 60 * 1000).unref();
  return (key) => {
    const now = Date.now();
    const b = buckets.get(key) || { tokens: burst, t: now };
    b.tokens = Math.min(burst, b.tokens + ((now - b.t) / 1000) * rate);
    b.t = now;
    buckets.set(key, b);
    if (b.tokens < 1) return false;
    b.tokens -= 1;
    return true;
  };
}
const allowWrite = limiter(2, 60);
const allowConnect = limiter(1, 20);

// The proxy in front appends the real address last; earlier entries come from the visitor.
function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  return (forwarded ? forwarded.split(',').at(-1) : req.socket.remoteAddress || '').trim();
}

function originAllowed(req) {
  const origin = req.headers.origin;
  return !origin || config.origins.length === 0 || config.origins.includes(origin);
}

let projectList = null;
let projectListMtime = 0;
function projectExists(slug) {
  if (config.projectsFile) {
    try {
      const mtime = fs.statSync(config.projectsFile).mtimeMs;
      if (mtime !== projectListMtime) {
        projectList = new Set(JSON.parse(fs.readFileSync(config.projectsFile, 'utf8')));
        projectListMtime = mtime;
      }
    } catch {
      return false;
    }
    return projectList.has(slug);
  }
  const dirs = mounts.filter((m) => m.dir).map((m) => m.dir);
  if (dirs.length === 0) return true;
  return dirs.some((dir) => {
    try {
      return fs.statSync(path.join(dir, slug)).isDirectory();
    } catch {
      return false;
    }
  });
}

function route(pathname) {
  for (const mount of mounts) {
    if (pathname.startsWith(mount.prefix)) return { mount, rest: pathname.slice(mount.prefix.length) };
    if (pathname + '/' === mount.prefix) return { mount, rest: null };
  }
  return null;
}

function send(res, status, body) {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(text),
  });
  res.end(text);
}

function sendHtml(res, status, html) {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Length': Buffer.byteLength(html) });
  res.end(html);
}

function redirect(res, location) {
  res.writeHead(301, { Location: location });
  res.end();
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

const notFound = '<!doctype html><meta charset="utf-8"><title>Ei leitud</title><p>Seda lehte ei leitud.</p>';

function readJson(req, res) {
  return new Promise((resolve) => {
    if (!/^application\/json\b/.test(req.headers['content-type'] || '')) {
      send(res, 415, { error: 'Saada andmed JSON-ina' });
      return resolve(undefined);
    }
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size <= LIMITS.body) chunks.push(chunk);
    });
    req.on('end', () => {
      if (size > LIMITS.body) {
        send(res, 413, { error: 'Päring on liiga suur' });
        return resolve(undefined);
      }
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (body === null || typeof body !== 'object' || Array.isArray(body)) throw new Error('not an object');
        resolve(body);
      } catch {
        send(res, 400, { error: 'Vigane JSON' });
        resolve(undefined);
      }
    });
    req.on('error', () => resolve(undefined));
  });
}

function writeAllowed(req, res) {
  if (!originAllowed(req)) {
    send(res, 403, { error: 'Sellelt lehelt ei saa siia kirjutada' });
    return false;
  }
  if (!allowWrite(clientIp(req))) {
    send(res, 429, { error: 'Liiga palju päringuid, oota natuke' });
    return false;
  }
  return true;
}

function cleanName(value) {
  const name = String(value ?? '')
    .normalize('NFC')
    .replace(/\p{C}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
  return Array.from(name).slice(0, LIMITS.nameLength).join('');
}

function clampInt(value, min, max, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

async function handle(req, res) {
  const url = new URL(req.url, 'http://localhost');
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return send(res, 400, { error: 'Vigane aadress' });
  }
  const hit = route(pathname);
  if (!hit) return sendHtml(res, 404, notFound);
  if (hit.rest === null) return redirect(res, url.pathname + '/' + url.search);
  if (hit.rest === 'api' || hit.rest.startsWith('api/')) return api(req, res, hit.rest.slice(4), url);
  if (hit.mount.dir) return serveStatic(req, res, hit.mount.dir, hit.rest, url);
  return sendHtml(res, 404, notFound);
}

function serveStatic(req, res, root, rest, url) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'Lubatud on ainult GET' });
  if (rest.split('/').some((part) => part.startsWith('.'))) return sendHtml(res, 404, notFound);
  let file;
  let stat;
  try {
    file = fs.realpathSync(path.join(root, rest));
    if (file !== root && !file.startsWith(root + path.sep)) return sendHtml(res, 404, notFound);
    stat = fs.statSync(file);
    if (stat.isDirectory()) {
      if (rest !== '' && !rest.endsWith('/')) return redirect(res, url.pathname + '/' + url.search);
      file = path.join(file, 'index.html');
      stat = fs.statSync(file);
    }
  } catch {
    return sendHtml(res, 404, notFound);
  }
  res.writeHead(200, {
    'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
    'Content-Length': stat.size,
    'Cache-Control': 'no-cache',
  });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(file).pipe(res);
}

async function api(req, res, rest, url) {
  res.setHeader('Cache-Control', 'no-store');
  if (rest === 'health') return send(res, 200, { ok: true });
  const match = /^p\/([^/]+)\/(kv|scores|ws)(?:\/([^/]+))?$/.exec(rest);
  if (!match) return send(res, 404, { error: 'Sellist API aadressi pole' });
  const [, project, kind, item] = match;
  if (!SLUG.test(project) || !projectExists(project)) {
    return send(res, 404, { error: `Projekti kausta labor/${project}/ ei leitud` });
  }
  if (kind === 'kv') return kv(req, res, project, item);
  if (kind === 'scores' && item === undefined) return scores(req, res, project, url);
  if (kind === 'ws') return send(res, 426, { error: 'Siia ühendutakse WebSocketiga' });
  return send(res, 404, { error: 'Sellist API aadressi pole' });
}

async function kv(req, res, project, key) {
  if (key === undefined) {
    if (req.method !== 'GET') return send(res, 405, { error: 'Lubatud on ainult GET' });
    return send(res, 200, { keys: sql.kvKeys.all(project).map((row) => row.key) });
  }
  if (!KEY.test(key)) return send(res, 400, { error: 'Vigane võti: kasuta tähti, numbreid, _ . -' });
  if (req.method === 'GET') {
    const row = sql.kvGet.get(project, key);
    return send(res, 200, row ? { found: true, value: JSON.parse(row.value) } : { found: false });
  }
  if (req.method === 'PUT') {
    if (!writeAllowed(req, res)) return;
    const body = await readJson(req, res);
    if (body === undefined) return;
    const text = JSON.stringify(body.value);
    if (text === undefined) return send(res, 400, { error: 'Väärtus puudub' });
    if (Buffer.byteLength(text) > LIMITS.value) return send(res, 413, { error: 'Väärtus on liiga suur (kuni 16 kB)' });
    if (!sql.kvGet.get(project, key) && sql.kvCount.get(project).n >= LIMITS.keysPerProject) {
      return send(res, 413, { error: `Projektil on juba ${LIMITS.keysPerProject} võtit` });
    }
    sql.kvPut.run(project, key, text, Date.now());
    return send(res, 200, { ok: true });
  }
  if (req.method === 'DELETE') {
    if (!writeAllowed(req, res)) return;
    sql.kvDelete.run(project, key);
    return send(res, 200, { ok: true });
  }
  return send(res, 405, { error: 'Lubatud on GET, PUT ja DELETE' });
}

async function scores(req, res, project, url) {
  const board = url.searchParams.get('board') || 'main';
  if (!ROOM.test(board)) return send(res, 400, { error: 'Vigane edetabeli nimi' });
  if (req.method === 'GET') {
    const limit = clampInt(url.searchParams.get('limit'), 1, 100, 10);
    const stmt = url.searchParams.get('order') === 'asc' ? sql.scoresAsc : sql.scoresDesc;
    return send(res, 200, { scores: stmt.all(project, board, limit) });
  }
  if (req.method === 'POST') {
    if (!writeAllowed(req, res)) return;
    const body = await readJson(req, res);
    if (body === undefined) return;
    const name = cleanName(body.name);
    const score = Number(body.score);
    if (!name) return send(res, 400, { error: 'Nimi puudub' });
    if (typeof body.score !== 'number' || !Number.isFinite(score) || Math.abs(score) > 1e12) {
      return send(res, 400, { error: 'Tulemus peab olema number' });
    }
    sql.scoreAdd.run(project, board, name, score, Date.now());
    if (sql.scoreCount.get(project, board).n > LIMITS.scoresPerBoard) sql.scoreTrim.run(project, board);
    return send(res, 201, { ok: true });
  }
  return send(res, 405, { error: 'Lubatud on GET ja POST' });
}

// Realtime rooms: every message a member sends is relayed to the others
// (or to one member with `to`), with join and leave notices.
const rooms = new Map();
const wss = new WebSocketServer({ noServer: true, maxPayload: LIMITS.message });

function broadcast(members, message, except) {
  const text = typeof message === 'string' ? message : JSON.stringify(message);
  for (const [id, peer] of members) if (id !== except && peer.readyState === peer.OPEN) peer.send(text);
}

function joinRoom(ws, key) {
  let members = rooms.get(key);
  if (!members) rooms.set(key, (members = new Map()));
  if (members.size >= LIMITS.roomSize) return ws.close(4001, 'room full');
  const id = crypto.randomBytes(4).toString('hex');
  members.set(id, ws);
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });
  ws.send(JSON.stringify({ type: 'welcome', id, peers: [...members.keys()].filter((peer) => peer !== id) }));
  broadcast(members, { type: 'join', id }, id);

  // At most 30 messages a second on average; extra messages are dropped.
  let tokens = 60;
  let last = Date.now();
  ws.on('message', (data, isBinary) => {
    const now = Date.now();
    tokens = Math.min(60, tokens + (now - last) * 0.03);
    last = now;
    if (tokens < 1 || isBinary) return;
    tokens -= 1;
    let message;
    try {
      message = JSON.parse(data.toString('utf8'));
    } catch {
      return;
    }
    if (message === null || typeof message !== 'object') return;
    const out = JSON.stringify({ type: 'message', from: id, data: message.data ?? null });
    if (typeof message.to === 'string') {
      const peer = members.get(message.to);
      if (peer && peer.readyState === peer.OPEN) peer.send(out);
    } else {
      broadcast(members, out, id);
    }
  });
  ws.on('close', () => {
    members.delete(id);
    if (members.size === 0) {
      if (rooms.get(key) === members) rooms.delete(key);
    } else {
      broadcast(members, { type: 'leave', id });
    }
  });
  ws.on('error', () => {});
}

function onUpgrade(req, socket, head) {
  const reject = (status, text) => {
    socket.end(`HTTP/1.1 ${status} ${text}\r\nConnection: close\r\n\r\n`);
  };
  let url;
  let hit;
  try {
    url = new URL(req.url, 'http://localhost');
    hit = route(decodeURIComponent(url.pathname));
  } catch {
    return reject(400, 'Bad Request');
  }
  const match = hit && hit.rest !== null && /^api\/p\/([^/]+)\/ws$/.exec(hit.rest);
  if (!match || !SLUG.test(match[1]) || !projectExists(match[1])) return reject(404, 'Not Found');
  const room = url.searchParams.get('room') || 'main';
  if (!ROOM.test(room)) return reject(400, 'Bad Request');
  if (!originAllowed(req)) return reject(403, 'Forbidden');
  if (!allowConnect(clientIp(req)) || wss.clients.size >= LIMITS.connections) return reject(429, 'Too Many Requests');
  wss.handleUpgrade(req, socket, head, (ws) => joinRoom(ws, `${match[1]}/${room}`));
}

setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) {
      ws.terminate();
      continue;
    }
    ws.isAlive = false;
    ws.ping();
  }
}, 30 * 1000).unref();

const server = http.createServer((req, res) => {
  handle(req, res).catch((err) => {
    console.error(err);
    if (!res.headersSent) send(res, 500, { error: 'Serveri viga' });
    else res.end();
  });
});
server.on('upgrade', onUpgrade);
server.listen(config.port, config.host, () => {
  console.log(`Suvemäe labor server on http://${config.host}:${config.port}`);
  for (const m of mounts) console.log(`  ${m.prefix} -> ${m.dir || '(API only)'}, API at ${m.prefix}api/`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    for (const ws of wss.clients) ws.close(1001, 'server restart');
    server.close(() => {
      db.close();
      process.exit(0);
    });
    setTimeout(() => process.exit(0), 3000).unref();
  });
}
