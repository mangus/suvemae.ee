// Ahvihotell: a first-person maze game in a dark hotel.
// Collect all gems while three monkeys hunt you. A blue ball shows them on the map for 30 s.
'use strict';

const $ = (id) => document.getElementById(id);
const canvas = $('game');
const ctx = canvas.getContext('2d');
const mini = $('minimap');
const mctx = mini.getContext('2d');

// Maze size in cells; the tile map has a wall tile between cells.
const CW = 11;
const CH = 11;
const MW = CW * 2 + 1;
const MH = CH * 2 + 1;
const GEM_COUNT = 100;
const BALL_COUNT = 5;
const MONKEY_COUNT = 3;
const LIVES = 3;
const PLAYER_SPEED = 2.6;
const TURN_SPEED = 2.4;
const MONKEY_SPEED = PLAYER_SPEED * 0.8;
const POWER_TIME = 30;
const SCARE_TIME = 1.7;
const TEX = 64;
const LEVELS = 10;
const MINI = 6;
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const GEM_COLORS = ['#ff3b6b', '#3bd1ff', '#5dff6e', '#ffd23b', '#c77bff'];

let W = 320;
let H = 240;
let K = 200;   // projection scale: pixels per unit at distance 1
let FOV = 0.7; // half-width of the camera plane
let zbuf = new Float32Array(W);

const rand = (n) => Math.floor(Math.random() * n);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function blob(g, x, y, rx, ry, color) {
  g.fillStyle = color;
  g.beginPath();
  g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2);
  g.fill();
}
function poly(g, pts, color) {
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
  g.closePath();
  g.fill();
}

function resize() {
  const aspect = window.innerWidth / Math.max(1, window.innerHeight);
  H = 240;
  W = clamp(Math.round(H * aspect), 120, 600);
  FOV = clamp(W / (2 * H * 0.9), 0.45, 1.05);
  K = W / (2 * FOV);
  canvas.width = W;
  canvas.height = H;
  zbuf = new Float32Array(W);
  ctx.imageSmoothingEnabled = false;
}

// ---------- Textures and sprites (all drawn in code) ----------

function wallpaper(g) {
  g.fillStyle = '#4e1a26'; g.fillRect(0, 0, TEX, 44);
  g.fillStyle = '#5f2230';
  for (let x = 0; x < TEX; x += 16) g.fillRect(x, 0, 8, 44);
  g.fillStyle = '#a8843a';
  for (let y = 5; y < 42; y += 12) for (let x = 3; x < TEX; x += 16) { g.fillRect(x, y, 2, 2); g.fillRect(x + 8, y + 6, 2, 2); }
  g.fillStyle = '#c9a24a'; g.fillRect(0, 42, TEX, 2);
  g.fillStyle = '#3a2414'; g.fillRect(0, 44, TEX, 20);
  g.fillStyle = '#26170c';
  g.fillRect(0, 44, TEX, 2);
  for (let x = 0; x < TEX; x += 16) g.fillRect(x, 48, 1, 14);
  g.fillRect(0, 62, TEX, 2);
}

function makeWallTex(kind, num) {
  const c = makeCanvas(TEX, TEX);
  const g = c.getContext('2d');
  wallpaper(g);
  if (kind === 'door') {
    g.fillStyle = '#2a170c'; g.fillRect(14, 6, 36, 58);
    g.fillStyle = '#5b351b'; g.fillRect(16, 8, 32, 56);
    g.fillStyle = '#4a2a14'; g.fillRect(20, 26, 24, 12); g.fillRect(20, 42, 24, 18);
    g.fillStyle = '#d8b04a'; g.fillRect(41, 38, 3, 3); g.fillRect(25, 12, 14, 9);
    g.fillStyle = '#2a170c';
    g.font = 'bold 7px monospace';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(String(num), 32, 16.5);
  } else if (kind === 'lamp') {
    const lg = g.createRadialGradient(32, 18, 1, 32, 18, 24);
    lg.addColorStop(0, 'rgba(255,200,120,0.75)');
    lg.addColorStop(1, 'rgba(255,200,120,0)');
    g.fillStyle = lg; g.fillRect(0, 0, TEX, 42);
    g.fillStyle = '#c9a24a'; g.fillRect(30, 22, 4, 10);
    poly(g, [25, 22, 39, 22, 35, 11, 29, 11], '#ffe2a8');
  } else if (kind === 'scratch') {
    g.strokeStyle = '#140705';
    g.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(18 + i * 6, 12); g.lineTo(23 + i * 6, 40); g.stroke(); }
  }
  return c;
}

const wallTex = { plain: makeWallTex('plain'), lamp: makeWallTex('lamp'), scratch: makeWallTex('scratch'), doors: [] };
for (const n of [101, 104, 113, 207, 212, 216, 304, 313]) wallTex.doors.push(makeWallTex('door', n));

function texFor(x, y) {
  const h = (Math.imul(x, 73856093) ^ Math.imul(y, 19349663)) >>> 0;
  const r = h % 13;
  if (r < 2) return wallTex.doors[(h >>> 4) % wallTex.doors.length];
  if (r === 2) return wallTex.lamp;
  if (r === 3) return wallTex.scratch;
  return wallTex.plain;
}

function drawGem(g, s, color) {
  const glow = g.createRadialGradient(s / 2, s / 2, 2, s / 2, s / 2, s / 2);
  glow.addColorStop(0, color + '88');
  glow.addColorStop(1, color + '00');
  g.fillStyle = glow; g.fillRect(0, 0, s, s);
  poly(g, [16, 24, 24, 14, 40, 14, 48, 24, 32, 52], color);
  poly(g, [24, 14, 32, 24, 40, 14], 'rgba(255,255,255,0.55)');
  poly(g, [16, 24, 48, 24, 32, 52], 'rgba(0,0,0,0.2)');
  poly(g, [24, 24, 32, 52, 40, 24], 'rgba(255,255,255,0.25)');
  g.fillStyle = '#fff'; g.fillRect(26, 17, 3, 2);
}

function drawBall(g, s) {
  const glow = g.createRadialGradient(32, 32, 4, 32, 32, 32);
  glow.addColorStop(0, 'rgba(80,200,255,0.9)');
  glow.addColorStop(1, 'rgba(80,200,255,0)');
  g.fillStyle = glow; g.fillRect(0, 0, s, s);
  const b = g.createRadialGradient(27, 26, 2, 32, 32, 16);
  b.addColorStop(0, '#ffffff');
  b.addColorStop(0.4, '#6fe0ff');
  b.addColorStop(1, '#1060c0');
  g.fillStyle = b;
  g.beginPath(); g.arc(32, 32, 16, 0, Math.PI * 2); g.fill();
  blob(g, 32, 33, 8, 4.5, '#ffffff');
  blob(g, 32, 33, 3, 3, '#103070');
}

function drawMonkey(g) {
  const fur = '#3a2215';
  const dark = '#24140b';
  g.lineCap = 'round';
  g.strokeStyle = fur;
  g.lineWidth = 11;
  g.beginPath(); g.moveTo(42, 70); g.quadraticCurveTo(14, 92, 20, 122); g.stroke();
  g.beginPath(); g.moveTo(86, 70); g.quadraticCurveTo(114, 92, 108, 122); g.stroke();
  g.strokeStyle = '#d9cfb8';
  g.lineWidth = 2;
  for (const hx of [20, 108]) {
    for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(hx + i * 4, 124); g.lineTo(hx + i * 5, 128); g.stroke(); }
  }
  blob(g, 64, 90, 28, 30, fur);
  blob(g, 64, 96, 16, 18, '#5a3a28');
  blob(g, 50, 120, 10, 8, dark);
  blob(g, 78, 120, 10, 8, dark);
  blob(g, 36, 40, 10, 11, fur); blob(g, 92, 40, 10, 11, fur);
  blob(g, 36, 40, 5, 6, '#7a4535'); blob(g, 92, 40, 5, 6, '#7a4535');
  blob(g, 64, 44, 27, 25, fur);
  poly(g, [44, 28, 50, 12, 56, 24, 62, 6, 68, 24, 76, 12, 84, 28], fur);
  blob(g, 64, 50, 19, 17, '#8a5a44');
  blob(g, 56, 44, 7, 6, '#120606'); blob(g, 72, 44, 7, 6, '#120606');
  poly(g, [46, 34, 62, 41, 61, 37, 48, 31], dark);
  poly(g, [82, 34, 66, 41, 67, 37, 80, 31], dark);
  blob(g, 61, 52, 1.5, 2, '#120606'); blob(g, 67, 52, 1.5, 2, '#120606');
  blob(g, 64, 60, 12, 6, '#2a0000');
  for (let i = 0; i < 6; i++) {
    const x = 54 + i * 4 - 2;
    poly(g, [x, 55, x + 4, 55, x + 2, 59.5], '#f0e8d0');
    poly(g, [x, 65, x + 4, 65, x + 2, 60.5], '#f0e8d0');
  }
}

function drawMonkeyEyes(g) {
  for (const x of [56, 72]) {
    const e = g.createRadialGradient(x, 44, 0, x, 44, 7);
    e.addColorStop(0, '#ffffff');
    e.addColorStop(0.25, '#ff2a00');
    e.addColorStop(1, 'rgba(255,0,0,0)');
    g.fillStyle = e; g.fillRect(x - 7, 37, 14, 14);
  }
}

// Pre-render each sprite at several brightness levels for the darkness fog.
function shaded(size, draw, glow, after) {
  const out = [];
  for (let i = 0; i < LEVELS; i++) {
    const c = makeCanvas(size, size);
    const g = c.getContext('2d');
    draw(g, size);
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = `rgba(0,0,0,${((1 - i / (LEVELS - 1)) * (1 - glow)).toFixed(3)})`;
    g.fillRect(0, 0, size, size);
    g.globalCompositeOperation = 'source-over';
    if (after) after(g, size);
    out.push(c);
  }
  return out;
}
const gemSprites = GEM_COLORS.map((c) => shaded(64, (g, s) => drawGem(g, s, c), 0.45));
const ballSprite = shaded(64, drawBall, 0.6);
const monkeySprite = shaded(128, drawMonkey, 0, drawMonkeyEyes);

// ---------- Sound (Web Audio, starts after the first tap) ----------

let ac = null;
let master = null;
function initAudio() {
  if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ac = new AC();
  master = ac.createGain();
  master.gain.value = 0.7;
  master.connect(ac.destination);
  const hum = ac.createOscillator();
  const hf = ac.createBiquadFilter();
  const hg = ac.createGain();
  hum.type = 'sawtooth'; hum.frequency.value = 50;
  hf.type = 'lowpass'; hf.frequency.value = 140;
  hg.gain.value = 0.05;
  hum.connect(hf).connect(hg).connect(master);
  hum.start();
}
function tone(freq, dur, type, vol, slideTo, at = 0) {
  if (!ac) return;
  const t = ac.currentTime + at;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.05);
}
function noise(dur, vol, freq) {
  if (!ac) return;
  const len = Math.floor(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  const f = ac.createBiquadFilter();
  const g = ac.createGain();
  src.buffer = buf;
  f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 0.7;
  const t = ac.currentTime;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t);
}
const sfx = {
  gem() { tone(1046, 0.12, 'triangle', 0.12, 1568); },
  ball() { tone(300, 0.6, 'sine', 0.25, 1200); tone(450, 0.6, 'triangle', 0.1, 1800); },
  beat(v) { tone(70, 0.12, 'sine', 0.3 + 0.5 * v, 40); tone(60, 0.1, 'sine', 0.2 + 0.4 * v, 35, 0.16); },
  monkey() { tone(500, 0.12, 'triangle', 0.08, 900); tone(520, 0.15, 'triangle', 0.08, 950, 0.18); },
  scare() {
    if (!ac) return;
    const t = ac.currentTime;
    for (const f of [430, 610, 780, 1170, 1480]) {
      const o = ac.createOscillator();
      const lfo = ac.createOscillator();
      const lg = ac.createGain();
      const g = ac.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(f, t);
      o.frequency.linearRampToValueAtTime(f * 1.4, t + 1.4);
      lfo.frequency.value = 23 + Math.random() * 15;
      lg.gain.value = f * 0.12;
      lfo.connect(lg).connect(o.frequency);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
      g.gain.setValueAtTime(0.16, t + 1.1);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.6);
      o.connect(g).connect(master);
      o.start(t); lfo.start(t);
      o.stop(t + 1.7); lfo.stop(t + 1.7);
    }
    noise(1.5, 0.6, 2200);
    tone(90, 1.2, 'square', 0.25, 30);
  },
  over() { tone(220, 2.2, 'sawtooth', 0.2, 30); tone(233, 2.2, 'sawtooth', 0.15, 32); },
  win() { [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.3, 'triangle', 0.18, null, i * 0.12)); },
};

// ---------- Maze ----------

let map = new Uint8Array(MW * MH);
function wall(x, y) { return x < 0 || y < 0 || x >= MW || y >= MH ? 1 : map[y * MW + x]; }
const inCells = (cx, cy) => cx >= 0 && cy >= 0 && cx < CW && cy < CH;
const wallIndex = (cx, cy, dx, dy) => (cy * 2 + 1 + dy) * MW + (cx * 2 + 1 + dx);
const passage = (cx, cy, dx, dy) => map[wallIndex(cx, cy, dx, dy)] === 0;
const openCount = (cx, cy) => DIRS.filter(([dx, dy]) => passage(cx, cy, dx, dy)).length;

function makeMaze() {
  map = new Uint8Array(MW * MH).fill(1);
  const seen = new Uint8Array(CW * CH);
  const stack = [[0, 0]];
  seen[0] = 1;
  map[MW + 1] = 0;
  while (stack.length) {
    const [cx, cy] = stack[stack.length - 1];
    const opts = DIRS.filter(([dx, dy]) => inCells(cx + dx, cy + dy) && !seen[(cy + dy) * CW + cx + dx]);
    if (!opts.length) { stack.pop(); continue; }
    const [dx, dy] = opts[rand(opts.length)];
    const nx = cx + dx;
    const ny = cy + dy;
    seen[ny * CW + nx] = 1;
    map[wallIndex(cx, cy, dx, dy)] = 0;
    map[wallIndex(nx, ny, 0, 0)] = 0;
    stack.push([nx, ny]);
  }
  // Remove every dead end, so the maze is only looping corridors.
  for (let cy = 0; cy < CH; cy++) {
    for (let cx = 0; cx < CW; cx++) {
      if (openCount(cx, cy) > 1) continue;
      const closed = DIRS.filter(([dx, dy]) => inCells(cx + dx, cy + dy) && !passage(cx, cy, dx, dy));
      const dead = closed.filter(([dx, dy]) => openCount(cx + dx, cy + dy) === 1);
      const pool = dead.length ? dead : closed;
      const [dx, dy] = pool[rand(pool.length)];
      map[wallIndex(cx, cy, dx, dy)] = 0;
    }
  }
  // A few extra loops make more escape routes.
  for (let i = 0; i < 12; i++) {
    const cx = rand(CW);
    const cy = rand(CH);
    const [dx, dy] = DIRS[rand(4)];
    if (inCells(cx + dx, cy + dy)) map[wallIndex(cx, cy, dx, dy)] = 0;
  }
}

function bfs(sx, sy) {
  const dist = new Int16Array(MW * MH).fill(-1);
  const q = new Int32Array(MW * MH);
  let head = 0;
  let tail = 0;
  dist[sy * MW + sx] = 0;
  q[tail++] = sy * MW + sx;
  while (head < tail) {
    const i = q[head++];
    const x = i % MW;
    const y = (i / MW) | 0;
    for (const [dx, dy] of DIRS) {
      if (wall(x + dx, y + dy)) continue;
      const ni = (y + dy) * MW + x + dx;
      if (dist[ni] >= 0) continue;
      dist[ni] = dist[i] + 1;
      q[tail++] = ni;
    }
  }
  return dist;
}

// ---------- Game state ----------

let state = 'menu';
let player = { x: 1.5, y: 1.5, a: 0 };
let items = [];
let monkeys = [];
let lives = LIVES;
let gemsLeft = GEM_COUNT;
let power = 0;
let invuln = 0;
let time = 0;
let walk = 0;
let flick = 1;
let flickT = 0;
let beatT = 0;
let chatterT = 3;
let danger = 0;
let scareT = 0;
let overT = 0;
let drips = [];
let distField = new Int16Array(MW * MH);
let miniBase = null;
const keys = { up: false, down: false, left: false, right: false, sleft: false, sright: false };

function newGame() {
  makeMaze();
  const sx = (CW >> 1) * 2 + 1;
  const sy = (CH >> 1) * 2 + 1;
  player = { x: sx + 0.5, y: sy + 0.5, a: 0 };
  for (const [dx, dy] of DIRS) if (!wall(sx + dx, sy + dy)) { player.a = Math.atan2(dy, dx); break; }
  const free = [];
  for (let y = 0; y < MH; y++) {
    for (let x = 0; x < MW; x++) if (!map[y * MW + x] && Math.abs(x - sx) + Math.abs(y - sy) > 1) free.push([x, y]);
  }
  shuffle(free);
  items = [];
  for (let i = 0; i < GEM_COUNT + BALL_COUNT && i < free.length; i++) {
    const [x, y] = free[i];
    items.push({ x: x + 0.5, y: y + 0.5, ball: i >= GEM_COUNT, color: rand(GEM_COLORS.length), alive: true, phase: Math.random() * 6 });
  }
  gemsLeft = GEM_COUNT;
  monkeys = [];
  for (let i = 0; i < MONKEY_COUNT; i++) monkeys.push({ x: 0, y: 0, tx: 0, ty: 0, px: 0, py: 0, wander: [0, 0.3, 0.5][i] || 0.3, step: Math.random() * 6 });
  placeMonkeysFar();
  lives = LIVES;
  power = 0;
  invuln = 2;
  time = 0;
  walk = 0;
  danger = 0;
  buildMini();
  mini.hidden = true;
  updateHud();
  state = 'play';
}

function placeMonkeysFar() {
  const d = bfs(Math.floor(player.x), Math.floor(player.y));
  let max = 0;
  for (let i = 0; i < d.length; i++) max = Math.max(max, d[i]);
  const cand = [];
  for (let i = 0; i < d.length; i++) if (d[i] >= max * 0.55) cand.push(i);
  shuffle(cand);
  const picked = [];
  for (const i of cand) {
    if (picked.length === monkeys.length) break;
    const x = i % MW;
    const y = (i / MW) | 0;
    if (picked.every(([px, py]) => Math.abs(px - x) + Math.abs(py - y) >= 6)) picked.push([x, y]);
  }
  while (picked.length < monkeys.length) { const i = cand[rand(cand.length)]; picked.push([i % MW, (i / MW) | 0]); }
  monkeys.forEach((m, k) => {
    const [x, y] = picked[k];
    m.x = x + 0.5; m.y = y + 0.5; m.tx = x; m.ty = y; m.px = x; m.py = y;
  });
}

function blocked(x, y) {
  const r = 0.22;
  return wall(Math.floor(x - r), Math.floor(y - r)) || wall(Math.floor(x + r), Math.floor(y - r)) ||
    wall(Math.floor(x - r), Math.floor(y + r)) || wall(Math.floor(x + r), Math.floor(y + r));
}

function chooseNext(m) {
  const here = distField[m.ty * MW + m.tx];
  const opts = [];
  for (const [dx, dy] of DIRS) if (!wall(m.tx + dx, m.ty + dy)) opts.push([m.tx + dx, m.ty + dy]);
  if (!opts.length) return;
  let next;
  if (here > 6 && Math.random() < m.wander) {
    const fwd = opts.filter(([x, y]) => x !== m.px || y !== m.py);
    const pool = fwd.length ? fwd : opts;
    next = pool[rand(pool.length)];
  } else {
    let best = Infinity;
    let bests = [];
    for (const o of opts) {
      const v = distField[o[1] * MW + o[0]];
      if (v < 0) continue;
      if (v < best) { best = v; bests = [o]; } else if (v === best) bests.push(o);
    }
    if (!bests.length) bests = opts;
    next = bests[rand(bests.length)];
  }
  m.px = m.tx; m.py = m.ty;
  m.tx = next[0]; m.ty = next[1];
}

// Monkeys walk from tile centre to tile centre along the shortest way to the player.
function stepMonkey(m, dt, ptx, pty) {
  let move = MONKEY_SPEED * dt;
  if (Math.floor(m.x) === ptx && Math.floor(m.y) === pty) {
    const dx = player.x - m.x;
    const dy = player.y - m.y;
    const d = Math.hypot(dx, dy);
    if (d > 0.01) { const k = Math.min(move, d) / d; m.x += dx * k; m.y += dy * k; }
    m.tx = ptx; m.ty = pty;
    return;
  }
  for (let guard = 0; move > 0 && guard < 4; guard++) {
    const dx = m.tx + 0.5 - m.x;
    const dy = m.ty + 0.5 - m.y;
    const d = Math.hypot(dx, dy);
    if (d > move) { m.x += (dx / d) * move; m.y += (dy / d) * move; return; }
    m.x = m.tx + 0.5; m.y = m.ty + 0.5;
    move -= d;
    chooseNext(m);
  }
}

function update(dt) {
  time += dt;
  // With mouse look, A and D step sideways; without it they turn.
  const locked = document.pointerLockElement === canvas;
  const side = (keys.sright ? 1 : 0) - (keys.sleft ? 1 : 0);
  const turn = (keys.right ? 1 : 0) - (keys.left ? 1 : 0) + (locked ? 0 : side);
  const strafe = locked ? side : 0;
  player.a += turn * TURN_SPEED * dt;
  const fwd = (keys.up ? 1 : 0) - (keys.down ? 1 : 0);
  if (fwd || strafe) {
    const f = fwd > 0 ? 1 : fwd < 0 ? -0.7 : 0;
    const s = strafe * 0.8;
    const sp = (PLAYER_SPEED * dt) / Math.max(1, Math.hypot(f, s));
    const nx = player.x + (Math.cos(player.a) * f - Math.sin(player.a) * s) * sp;
    const ny = player.y + (Math.sin(player.a) * f + Math.cos(player.a) * s) * sp;
    if (!blocked(nx, player.y)) player.x = nx;
    if (!blocked(player.x, ny)) player.y = ny;
    walk += dt * 10;
  }
  const ptx = Math.floor(player.x);
  const pty = Math.floor(player.y);
  distField = bfs(ptx, pty);

  for (const it of items) {
    if (!it.alive || Math.hypot(it.x - player.x, it.y - player.y) > 0.45) continue;
    it.alive = false;
    if (it.ball) { power = POWER_TIME; sfx.ball(); } else { gemsLeft--; sfx.gem(); }
    updateHud();
  }
  if (gemsLeft <= 0) { win(); return; }

  if (power > 0) {
    const before = Math.ceil(power);
    power = Math.max(0, power - dt);
    if (Math.ceil(power) !== before) updateHud();
  }
  if (invuln > 0) invuln -= dt;

  let nearest = Infinity;
  for (const m of monkeys) {
    stepMonkey(m, dt, ptx, pty);
    m.step += dt * 8;
    const pd = distField[Math.floor(m.y) * MW + Math.floor(m.x)];
    if (pd >= 0) nearest = Math.min(nearest, pd);
    if (invuln <= 0 && Math.hypot(m.x - player.x, m.y - player.y) < 0.5) { caught(); return; }
  }
  danger = clamp(1 - nearest / 8, 0, 1);

  flickT -= dt;
  if (flickT > 0) flick = 0.35 + Math.random() * 0.65;
  else { flick = 1; if (Math.random() < dt * 0.15) flickT = 0.15 + Math.random() * 0.4; }

  beatT -= dt;
  if (nearest < 12 && beatT <= 0) { sfx.beat(1 - nearest / 12); beatT = 0.32 + nearest * 0.07; }
  chatterT -= dt;
  if (chatterT <= 0) { if (nearest < 9) sfx.monkey(); chatterT = 2 + Math.random() * 4; }
}

function caught() {
  lives--;
  updateHud();
  state = 'scare';
  scareT = 0;
  sfx.scare();
  if (navigator.vibrate) navigator.vibrate([200, 50, 300]);
}

function afterScare() {
  if (lives <= 0) { gameOver(); return; }
  placeMonkeysFar();
  invuln = 2.5;
  state = 'play';
}

function showPlayUi(on) {
  $('hud').hidden = !on;
  $('controls').hidden = !on;
  if (!on) {
    mini.hidden = true;
    if (document.pointerLockElement && document.exitPointerLock) document.exitPointerLock();
  }
  updateHint();
}

function gameOver() {
  state = 'over';
  overT = 0;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  drips = [];
  for (let x = 0; x < W; x += 2 + rand(4)) drips.push({ x, w: 2 + rand(5), y: -rand(40), v: 30 + Math.random() * 110 });
  sfx.over();
  showPlayUi(false);
  $('overGems').textContent = GEM_COUNT - gemsLeft;
}

function win() {
  state = 'win';
  sfx.win();
  const secs = Math.round(time);
  let best = 0;
  try { best = Number(localStorage.getItem('ahvihotell-parim')) || 0; } catch (e) { best = 0; }
  if (!best || secs < best) {
    best = secs;
    try { localStorage.setItem('ahvihotell-parim', String(best)); } catch (e) { /* private mode */ }
  }
  $('winTime').textContent = fmt(secs);
  $('winBest').textContent = fmt(best);
  showPlayUi(false);
  $('win').hidden = false;
}

function updateHud() {
  const l = Math.max(0, lives);
  $('lives').textContent = '❤️'.repeat(l) + '🖤'.repeat(LIVES - l);
  $('gems').textContent = `💎 ${GEM_COUNT - gemsLeft}/${GEM_COUNT}`;
  const p = $('power');
  p.hidden = power <= 0;
  p.textContent = `👁️ ${Math.ceil(power)}`;
}

// ---------- Drawing ----------

function buildMini() {
  mini.width = MW * MINI;
  mini.height = MH * MINI;
  miniBase = makeCanvas(MW * MINI, MH * MINI);
  const g = miniBase.getContext('2d');
  g.fillStyle = '#12060a';
  g.fillRect(0, 0, MW * MINI, MH * MINI);
  g.fillStyle = '#6a2a38';
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) if (map[y * MW + x]) g.fillRect(x * MINI, y * MINI, MINI, MINI);
}

function drawMini() {
  mctx.drawImage(miniBase, 0, 0);
  for (const it of items) if (it.alive && it.ball) blob(mctx, it.x * MINI, it.y * MINI, 2.6, 2.6, '#4fd2ff');
  for (const m of monkeys) blob(mctx, m.x * MINI, m.y * MINI, 3.3, 3.3, '#ff2a2a');
  blob(mctx, player.x * MINI, player.y * MINI, 2.6, 2.6, '#ffffff');
  mctx.strokeStyle = '#ffffff';
  mctx.lineWidth = 1.5;
  mctx.beginPath();
  mctx.moveTo(player.x * MINI, player.y * MINI);
  mctx.lineTo(player.x * MINI + Math.cos(player.a) * 7, player.y * MINI + Math.sin(player.a) * 7);
  mctx.stroke();
}

function drawSprite(lv, size, wx, wy, scale, lift, view) {
  const sx = wx - player.x;
  const sy = wy - player.y;
  const depth = sx * view.dx + sy * view.dy;
  if (depth < 0.15) return;
  const lat = (view.dx * sy - view.dy * sx) / FOV;
  const screenX = (W / 2) * (1 + lat / depth);
  const unit = K / depth;
  const sz = unit * scale;
  const bottom = view.horizon + unit / 2 - lift * unit;
  const left = screenX - sz / 2;
  const img = lv[Math.round(view.light(depth) * (LEVELS - 1))];
  const x0 = Math.max(0, Math.floor(left));
  const x1 = Math.min(W - 1, Math.floor(left + sz));
  for (let x = x0; x <= x1; x++) {
    if (depth >= zbuf[x]) continue;
    const tx = clamp(Math.floor(((x - left) / sz) * size), 0, size - 1);
    ctx.drawImage(img, tx, 0, 1, size, x, bottom - sz, 1, sz);
  }
}

function render() {
  const dirX = Math.cos(player.a);
  const dirY = Math.sin(player.a);
  const planeX = -dirY * FOV;
  const planeY = dirX * FOV;
  const horizon = H / 2 + Math.sin(walk) * 2.5;
  const light = (d) => clamp(1.2 - d / 5.5, 0, 1) * flick;

  let g = ctx.createLinearGradient(0, 0, 0, horizon);
  g.addColorStop(0, '#120c0a');
  g.addColorStop(1, '#000');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, horizon);
  g = ctx.createLinearGradient(0, horizon, 0, H);
  g.addColorStop(0, '#000');
  g.addColorStop(1, `rgb(${Math.round(70 * flick)},12,20)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, horizon, W, H - horizon);

  for (let x = 0; x < W; x++) {
    const cam = (2 * x) / W - 1;
    const rdx = dirX + planeX * cam;
    const rdy = dirY + planeY * cam;
    let mx = Math.floor(player.x);
    let my = Math.floor(player.y);
    const ddx = rdx === 0 ? 1e30 : Math.abs(1 / rdx);
    const ddy = rdy === 0 ? 1e30 : Math.abs(1 / rdy);
    let stepX = 1;
    let stepY = 1;
    let sdx;
    let sdy;
    if (rdx < 0) { stepX = -1; sdx = (player.x - mx) * ddx; } else sdx = (mx + 1 - player.x) * ddx;
    if (rdy < 0) { stepY = -1; sdy = (player.y - my) * ddy; } else sdy = (my + 1 - player.y) * ddy;
    let side = 0;
    for (let i = 0; i < 80; i++) {
      if (sdx < sdy) { sdx += ddx; mx += stepX; side = 0; } else { sdy += ddy; my += stepY; side = 1; }
      if (wall(mx, my)) break;
    }
    const perp = Math.max(0.05, side === 0 ? sdx - ddx : sdy - ddy);
    let wx = side === 0 ? player.y + perp * rdy : player.x + perp * rdx;
    wx -= Math.floor(wx);
    let tx = clamp(Math.floor(wx * TEX), 0, TEX - 1);
    if ((side === 0 && rdx > 0) || (side === 1 && rdy < 0)) tx = TEX - tx - 1;
    const lineH = K / perp;
    const top = horizon - lineH / 2;
    ctx.drawImage(texFor(mx, my), tx, 0, 1, TEX, x, top, 1, lineH);
    const shade = 1 - light(perp) * (side ? 0.72 : 1);
    if (shade > 0.02) { ctx.fillStyle = `rgba(0,0,0,${shade.toFixed(2)})`; ctx.fillRect(x, top, 1, lineH); }
    zbuf[x] = perp;
  }

  const view = { dx: dirX, dy: dirY, horizon, light };
  const list = [];
  for (const it of items) if (it.alive) list.push({ e: it, kind: it.ball ? 'ball' : 'gem' });
  for (const m of monkeys) list.push({ e: m, kind: 'monkey' });
  for (const s of list) s.d = (s.e.x - player.x) * dirX + (s.e.y - player.y) * dirY;
  list.sort((a, b) => b.d - a.d);
  for (const s of list) {
    if (s.d < 0.15) continue;
    const e = s.e;
    if (s.kind === 'monkey') drawSprite(monkeySprite, 128, e.x, e.y, 0.95, Math.abs(Math.sin(e.step)) * 0.04, view);
    else if (s.kind === 'ball') drawSprite(ballSprite, 64, e.x, e.y, 0.34, 0.22 + Math.sin(time * 3 + e.phase) * 0.05, view);
    else drawSprite(gemSprites[e.color], 64, e.x, e.y, 0.3, 0.2 + Math.sin(time * 3 + e.phase) * 0.05, view);
  }

  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, Math.max(W, H) * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, `rgba(${Math.round(140 * danger)},0,0,0.9)`);
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  const showMini = power > 0;
  if (mini.hidden === showMini) mini.hidden = !showMini;
  if (showMini) drawMini();
}

function drawScareFace(g, cx, cy, s, t) {
  const fur = '#1c0f08';
  g.beginPath();
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const r = s * (i % 2 ? 0.98 : 1.16);
    const x = cx + Math.cos(a) * r * 1.08;
    const y = cy + Math.sin(a) * r;
    if (i) g.lineTo(x, y); else g.moveTo(x, y);
  }
  g.fillStyle = fur;
  g.fill();
  for (const side of [-1, 1]) {
    blob(g, cx + side * s * 1.05, cy - s * 0.1, s * 0.3, s * 0.36, fur);
    blob(g, cx + side * s * 1.05, cy - s * 0.1, s * 0.17, s * 0.22, '#5a2a20');
  }
  blob(g, cx, cy + s * 0.12, s * 0.74, s * 0.8, '#6a3f2e');
  g.strokeStyle = '#3a1f14';
  g.lineWidth = Math.max(1, s * 0.015);
  for (let i = 0; i < 3; i++) {
    const y = cy - s * (0.46 + i * 0.06);
    g.beginPath(); g.moveTo(cx - s * 0.3, y); g.quadraticCurveTo(cx, y + s * 0.07, cx + s * 0.3, y); g.stroke();
  }
  const ey = cy - s * 0.18;
  const ex = s * 0.3;
  for (const side of [-1, 1]) {
    const x = cx + side * ex;
    blob(g, x, ey, s * 0.21, s * 0.18, '#050000');
    blob(g, x, ey, s * 0.15, s * 0.12, '#efe2c0');
    g.strokeStyle = '#c00000';
    g.lineWidth = Math.max(1, s * 0.01);
    for (let v = 0; v < 8; v++) {
      const a = v * 0.785 + side * 0.3;
      g.beginPath();
      g.moveTo(x + Math.cos(a) * s * 0.15, ey + Math.sin(a) * s * 0.12);
      g.lineTo(x + Math.cos(a + 0.2) * s * 0.1, ey + Math.sin(a + 0.2) * s * 0.08);
      g.lineTo(x + Math.cos(a) * s * 0.06, ey + Math.sin(a) * s * 0.05);
      g.stroke();
    }
    const jx = (Math.random() - 0.5) * s * 0.02;
    const glow = g.createRadialGradient(x + jx, ey, 0, x + jx, ey, s * 0.08);
    glow.addColorStop(0, '#ffff80');
    glow.addColorStop(0.35, '#ff1a00');
    glow.addColorStop(1, 'rgba(120,0,0,0.7)');
    g.fillStyle = glow;
    g.beginPath(); g.arc(x + jx, ey, s * 0.07, 0, Math.PI * 2); g.fill();
    blob(g, x + jx, ey, s * 0.015, s * 0.03, '#000');
    const inner = x - side * s * 0.2;
    const outer = x + side * s * 0.24;
    poly(g, [inner, ey - s * 0.06, outer, ey - s * 0.3, outer, ey - s * 0.21, inner, ey + s * 0.01], fur);
  }
  blob(g, cx - s * 0.07, cy + s * 0.12, s * 0.04, s * 0.06, '#1a0603');
  blob(g, cx + s * 0.07, cy + s * 0.12, s * 0.04, s * 0.06, '#1a0603');
  const open = 0.8 + 0.2 * Math.sin(t * 40);
  const mw = s * 0.52;
  const mh = s * 0.3 * open;
  const my = cy + s * 0.5;
  blob(g, cx, my, mw * 1.06, mh * 1.12, '#3a0000');
  blob(g, cx, my, mw, mh, '#120000');
  blob(g, cx, my + mh * 0.3, mw * 0.5, mh * 0.4, '#5a0008');
  const n = 10;
  const tw = (mw * 1.8) / n;
  for (let i = 0; i < n; i++) {
    const x0 = cx - mw * 0.9 + i * tw;
    const xm = x0 + tw / 2;
    const edge = mh * Math.sqrt(Math.max(0, 1 - ((xm - cx) / mw) ** 2));
    const fang = i === 1 || i === n - 2 ? 1.9 : 1;
    const len = mh * 0.42 * fang;
    poly(g, [x0, my - edge, x0 + tw, my - edge, xm, my - edge + len], '#efe6cf');
    poly(g, [x0, my + edge, x0 + tw, my + edge, xm, my + edge - len * 0.8], '#e2d6b8');
  }
  g.fillStyle = '#8a0000';
  for (let i = 0; i < 4; i++) {
    const x = cx - mw * 0.6 + i * mw * 0.4;
    g.fillRect(x, my + mh * 0.6, Math.max(1, s * 0.015), s * (0.1 + 0.05 * i) * Math.min(1, t * 2));
  }
}

function drawScare(t) {
  const flash = t < 0.06 || (t > 0.32 && t < 0.36) || (t > 0.9 && t < 0.93);
  ctx.fillStyle = flash ? '#ffffff' : '#000000';
  ctx.fillRect(0, 0, W, H);
  if (t < 0.06) return;
  const k = 1 - clamp(t / SCARE_TIME, 0, 1);
  const shake = 3 + 12 * k;
  const ox = (Math.random() - 0.5) * shake;
  const oy = (Math.random() - 0.5) * shake;
  const zoom = 0.33 + Math.min(t * 5, 1) * 0.2 + t * 0.03;
  const s = H * zoom;
  const cx = W / 2 + ox;
  const cy = H * 0.47 + oy;
  if (!flash) {
    const rg = ctx.createRadialGradient(cx, cy, s * 0.3, cx, cy, Math.max(W, H));
    rg.addColorStop(0, 'rgba(170,0,0,0.95)');
    rg.addColorStop(1, 'rgba(10,0,0,1)');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);
  }
  drawScareFace(ctx, cx, cy, s, t);
  if (Math.random() < 0.25) { ctx.fillStyle = 'rgba(255,0,0,0.25)'; ctx.fillRect(0, 0, W, H); }
}

function drawOver(dt) {
  overT += dt;
  ctx.fillStyle = 'rgba(60,0,0,0.02)';
  ctx.fillRect(0, 0, W, H);
  for (const d of drips) {
    d.y += d.v * dt;
    if (d.y <= 0) continue;
    ctx.fillStyle = '#7a0000';
    ctx.fillRect(d.x, 0, d.w, d.y);
    blob(ctx, d.x + d.w / 2, d.y, d.w * 0.75, d.w * 0.9, '#a00000');
  }
  if (overT > 1.3 && $('over').hidden) $('over').hidden = false;
}

// ---------- Input and main loop ----------

const KEYMAP = { KeyW: 'up', ArrowUp: 'up', KeyS: 'down', ArrowDown: 'down', KeyA: 'sleft', ArrowLeft: 'left', KeyD: 'sright', ArrowRight: 'right' };
window.addEventListener('keydown', (e) => {
  const k = KEYMAP[e.code];
  if (!k) return;
  keys[k] = true;
  e.preventDefault();
});
window.addEventListener('keyup', (e) => {
  const k = KEYMAP[e.code];
  if (k) keys[k] = false;
});
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
for (const b of document.querySelectorAll('[data-key]')) {
  const k = b.dataset.key;
  const off = () => { keys[k] = false; };
  b.addEventListener('pointerdown', (e) => { e.preventDefault(); keys[k] = true; initAudio(); });
  b.addEventListener('pointerup', off);
  b.addEventListener('pointercancel', off);
  b.addEventListener('pointerleave', off);
  b.addEventListener('contextmenu', (e) => e.preventDefault());
}

// Mouse look: click the picture to lock the mouse, Esc lets it go.
const finePointer = window.matchMedia('(pointer: fine)').matches;
function lockMouse() {
  if (finePointer && state === 'play' && canvas.requestPointerLock) canvas.requestPointerLock();
}
function updateHint() {
  $('hint').hidden = !(finePointer && state === 'play' && document.pointerLockElement !== canvas);
}
canvas.addEventListener('click', lockMouse);
document.addEventListener('pointerlockchange', updateHint);
document.addEventListener('mousemove', (e) => {
  if (document.pointerLockElement === canvas && state === 'play') player.a += e.movementX * 0.0025;
});

// Touch: drag a finger across the picture to look around.
let touchId = null;
let touchX = 0;
canvas.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'touch' || touchId !== null) return;
  touchId = e.pointerId;
  touchX = e.clientX;
  initAudio();
});
canvas.addEventListener('pointermove', (e) => {
  if (e.pointerId !== touchId) return;
  if (state === 'play') player.a += (e.clientX - touchX) * 0.008;
  touchX = e.clientX;
});
for (const ev of ['pointerup', 'pointercancel']) {
  canvas.addEventListener(ev, (e) => { if (e.pointerId === touchId) touchId = null; });
}

function start() {
  initAudio();
  for (const id of ['start', 'win', 'over']) $(id).hidden = true;
  showPlayUi(true);
  newGame();
  updateHint();
  lockMouse();
}
for (const id of ['startBtn', 'winBtn', 'overBtn']) $(id).addEventListener('click', start);

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (state === 'play') {
    update(dt);
    if (state === 'play') render();
  } else if (state === 'scare') {
    scareT += dt;
    drawScare(scareT);
    if (scareT >= SCARE_TIME) afterScare();
  } else if (state === 'over') {
    drawOver(dt);
  }
  requestAnimationFrame(frame);
}

resize();
window.addEventListener('resize', resize);
requestAnimationFrame(frame);
