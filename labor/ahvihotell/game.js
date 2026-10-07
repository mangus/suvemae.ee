// Ahvihotell: a first-person maze game in a dark hotel, alone or together with 2-4 players.
// Collect all gems while three monkeys hunt you. A blue eye ball shows them on everyone's map for 30 s.
// Every gem you pick up goes to your wallet; the shop sells accessories for your character.
import { lab } from '../lab.js';

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
// How long each jumpscare waits before the face appears: A jumps at once, B turns the lights off, C breathes behind you.
const SCARE_LEAD = [0, 1.4, 1.6];
const TEX = 64;
const LEVELS = 10;
const MINI = 6;
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const GEM_COLORS = ['#ff3b6b', '#3bd1ff', '#5dff6e', '#ffd23b', '#c77bff'];
const MAX_PLAYERS = 4;
const NET_STEP = 1 / 15; // send our position 15 times a second
const SHIRTS = [['#e53935', '🔴'], ['#fb8c00', '🟠'], ['#fdd835', '🟡'], ['#43a047', '🟢'], ['#1e88e5', '🔵'], ['#8e24aa', '🟣'],
  ['#ec407a', '🌸'], ['#26c6da', '🌊'], ['#c0ca33', '🍋'], ['#8d6e63', '🟤'], ['#fafafa', '⚪'], ['#37474f', '⚫']];
const SKINS = ['#f6d3b3', '#e2b08a', '#b47b52', '#70472c'];
const BODIES = [
  { id: 'inimene', name: 'Inimene', icon: '🧍', price: 0 },
  { id: 'robot', name: 'Robot', icon: '🤖', price: 60 },
  { id: 'kummitus', name: 'Kummitus', icon: '👻', price: 60 },
  { id: 'tulnukas', name: 'Tulnukas', icon: '👽', price: 80 },
];
const SHOP = [
  { id: 'lips', slot: 'head', name: 'Juukselips', icon: '🎀', price: 20 },
  { id: 'myts', slot: 'head', name: 'Nokamüts', icon: '🧢', price: 25 },
  { id: 'sall', slot: 'neck', name: 'Sall', icon: '🧣', price: 30 },
  { id: 'prillid', slot: 'eyes', name: 'Päikeseprillid', icon: '🕶️', price: 40 },
  { id: 'kubar', slot: 'head', name: 'Kübar', icon: '🎩', price: 60 },
  { id: 'keep', slot: 'back', name: 'Supermantel', icon: '🦸', price: 100 },
  { id: 'kroon', slot: 'head', name: 'Kroon', icon: '👑', price: 150 },
  { id: 'teksad', slot: 'legs', name: 'Teksapüksid', icon: '👖', price: 15, color: '#3f6fb5' },
  { id: 'lyhikesed', slot: 'legs', name: 'Lühikesed püksid', icon: '🩳', price: 20, color: '#43a047', short: true },
  { id: 'sinisedlyhikesed', slot: 'legs', name: 'Sinised lühikesed püksid', icon: '🩳', price: 20, color: '#1e88e5', short: true },
  { id: 'roosadlyhikesed', slot: 'legs', name: 'Roosad lühikesed püksid', icon: '🩳', price: 20, color: '#f06292', short: true },
  { id: 'punased', slot: 'legs', name: 'Punased püksid', icon: '👖', price: 25, color: '#d32f2f' },
  { id: 'mustad', slot: 'legs', name: 'Mustad püksid', icon: '👖', price: 25, color: '#263238' },
  { id: 'roosad', slot: 'legs', name: 'Roosad püksid', icon: '👖', price: 25, color: '#f06292' },
  { id: 'lillad', slot: 'legs', name: 'Lillad püksid', icon: '👖', price: 25, color: '#7e57c2' },
  { id: 'kollased', slot: 'legs', name: 'Kollased püksid', icon: '👖', price: 25, color: '#fbc02d' },
  { id: 'triibuline', slot: 'top', name: 'Triibuline särk', icon: '👕', price: 30 },
  { id: 'tahesark', slot: 'top', name: 'Tähega särk', icon: '⭐', price: 40 },
  { id: 'pusa', slot: 'top', name: 'Kapuutsiga pusa', icon: '🧥', price: 50 },
  { id: 'tossud', slot: 'feet', name: 'Valged tossud', icon: '👟', price: 20, color: '#ffffff', stripe: '#e53935' },
  { id: 'punasedtossud', slot: 'feet', name: 'Punased tossud', icon: '👟', price: 20, color: '#e53935', stripe: '#ffffff' },
  { id: 'sinisedtossud', slot: 'feet', name: 'Sinised tossud', icon: '👟', price: 20, color: '#1e88e5', stripe: '#ffffff' },
  { id: 'rohelisedtossud', slot: 'feet', name: 'Rohelised tossud', icon: '👟', price: 20, color: '#43a047', stripe: '#ffffff' },
  { id: 'roosadtossud', slot: 'feet', name: 'Roosad tossud', icon: '👟', price: 20, color: '#f06292', stripe: '#ffffff' },
  { id: 'kuldsedtossud', slot: 'feet', name: 'Kuldsed tossud', icon: '👟', price: 60, color: '#ffc107', stripe: '#fff59d' },
  { id: 'saapad', slot: 'feet', name: 'Saapad', icon: '🥾', price: 35 },
  { id: 'helkivad', slot: 'feet', name: 'Helkivad tossud', icon: '✨', price: 70 },
];

let W = 320;
let H = 240;
let K = 200;   // projection scale: pixels per unit at distance 1
let FOV = 0.7; // half-width of the camera plane
let zbuf = new Float32Array(W);

// Random numbers; while building a level they come from a seed, so everyone in a room gets the same maze.
let rng = Math.random;
const rand = (n) => Math.floor(rng() * n);
function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const r2 = (v) => Math.round(v * 100) / 100;
const num = (v, d) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}
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

// Dark blue striped night wallpaper above a dark wood panel.
function wallpaper(g) {
  g.fillStyle = '#2b2546'; g.fillRect(0, 0, TEX, 44);
  g.fillStyle = '#221d3a';
  for (let x = 0; x < TEX; x += 16) g.fillRect(x, 0, 8, 44);
  g.fillStyle = '#3d3560';
  for (let y = 7; y < 40; y += 12) for (let x = 3; x < TEX; x += 16) { g.fillRect(x, y, 2, 2); g.fillRect(x + 8, y + 6, 2, 2); }
  g.fillStyle = '#18162a'; g.fillRect(0, 0, TEX, 3);
  g.fillStyle = '#5a4a3a'; g.fillRect(0, 42, TEX, 2);
  g.fillStyle = '#2c1c1a'; g.fillRect(0, 44, TEX, 20);
  g.fillStyle = '#1b100f';
  g.fillRect(0, 44, TEX, 2);
  for (let x = 0; x < TEX; x += 16) g.fillRect(x, 48, 1, 14);
  g.fillRect(0, 60, TEX, 4);
}

function makeWallTex(kind, num) {
  const c = makeCanvas(TEX, TEX);
  const g = c.getContext('2d');
  wallpaper(g);
  if (kind === 'door' || kind === 'hole') {
    g.fillStyle = '#3b3328'; g.fillRect(13, 5, 38, 59);
  }
  if (kind === 'door') {
    // An old worn door: the paint peels off and the number plate has gone dull.
    g.fillStyle = '#5c4c38'; g.fillRect(16, 8, 32, 56);
    g.fillStyle = '#4b3d2c'; g.fillRect(20, 26, 24, 12); g.fillRect(20, 42, 24, 18);
    for (let i = 0; i < 7; i++) {
      blob(g, 18 + Math.random() * 28, 10 + Math.random() * 50, 1.5 + Math.random() * 3, 1 + Math.random() * 4, i % 2 ? '#7d6c52' : '#3a2e22');
    }
    g.strokeStyle = '#2b2219';
    g.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const x = 20 + Math.random() * 22;
      const y = 28 + Math.random() * 20;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + 3 - Math.random() * 6, y + 8 + Math.random() * 8); g.stroke();
    }
    g.fillStyle = '#8a7440'; g.fillRect(41, 38, 3, 3);
    g.fillStyle = '#9a8650'; g.fillRect(25, 12, 14, 9);
  } else if (kind === 'hole') {
    // The door is gone: only a dark doorway with a few broken boards.
    g.fillStyle = '#050407'; g.fillRect(16, 8, 32, 56);
    poly(g, [16, 30, 48, 22, 48, 26, 16, 35], '#4a3c2c');
    poly(g, [16, 50, 40, 57, 38, 60, 16, 54], '#3d3226');
    if (num === 313) { g.fillStyle = '#ff3b2a'; g.fillRect(27, 40, 2, 2); g.fillRect(33, 40, 2, 2); }
    g.fillStyle = '#8a7a4a'; g.fillRect(25, 12, 14, 9);
  }
  if (kind === 'door' || kind === 'hole') {
    g.fillStyle = '#2a2116';
    g.font = 'bold 7px monospace';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(String(num), 32, 16.5);
  } else if (kind === 'scratch') {
    g.strokeStyle = '#140705';
    g.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(18 + i * 6, 12); g.lineTo(23 + i * 6, 40); g.stroke(); }
  }
  return c;
}

const wallTex = { plain: makeWallTex('plain'), scratch: makeWallTex('scratch'), doors: [] };
for (const n of [101, 104, 113, 207, 212, 216]) wallTex.doors.push(makeWallTex('door', n));
for (const n of [304, 313]) wallTex.doors.push(makeWallTex('hole', n));

function texFor(x, y) {
  const h = (Math.imul(x, 73856093) ^ Math.imul(y, 19349663)) >>> 0;
  const r = h % 13;
  if (r < 2) return wallTex.doors[(h >>> 4) % wallTex.doors.length];
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

// A round monkey seen from the front (0), the side (1, facing right) or the back (2).
// swing goes from -1 to 1 and moves its arms, legs and tail while it runs.
function drawMonkey(g, view, swing) {
  const fur = '#3a2215';
  const dark = '#24140b';
  const s = swing;
  const up = (k) => Math.max(0, k) * 6;
  g.lineCap = 'round';
  if (view === 1) {
    // The far arm and foot are darker, behind the body.
    g.strokeStyle = dark;
    g.lineWidth = 9;
    g.beginPath(); g.moveTo(58, 72); g.quadraticCurveTo(74 - s * 10, 96, 80 - s * 16, 122 - up(-s)); g.stroke();
    blob(g, 58 - s * 12, 121 - up(-s), 13, 6, dark);
    g.strokeStyle = fur;
    g.lineWidth = 7;
    g.beginPath(); g.moveTo(42, 100); g.bezierCurveTo(10, 100 + s * 6, 10 + s * 8, 60, 28 + s * 6, 62); g.stroke();
    blob(g, 60, 88, 24, 30, fur);
    blob(g, 72, 94, 10, 16, '#5a3a28');
    blob(g, 58 + s * 12, 121 - up(s), 14, 7, fur);
    g.lineWidth = 10;
    g.beginPath(); g.moveTo(62, 72); g.quadraticCurveTo(80 + s * 10, 96, 82 + s * 16, 122 - up(s)); g.stroke();
    blob(g, 62, 44, 24, 24, fur);
    poly(g, [44, 30, 50, 12, 58, 26, 66, 10, 72, 28], fur);
    blob(g, 50, 42, 8, 10, fur);
    blob(g, 50, 42, 4, 6, '#7a4535');
    blob(g, 84, 54, 15, 12, '#8a5a44');
    poly(g, [76, 57, 98, 55, 96, 64, 78, 64], '#2a0000');
    poly(g, [82, 57, 86, 57, 84, 61], '#f0e8d0');
    poly(g, [89, 56, 93, 56, 91, 60], '#f0e8d0');
    poly(g, [66, 36, 84, 40, 84, 36, 68, 32], dark);
    blob(g, 74, 44, 5, 5, '#120606');
  } else {
    const back = view === 2;
    // Seen from behind, the monkey's left is on the left of the picture.
    const a = back ? -s : s;
    g.strokeStyle = fur;
    g.lineWidth = 11;
    const ly = 122 - up(a) * 1.3;
    const ry = 122 - up(-a) * 1.3;
    g.beginPath(); g.moveTo(42, 70); g.quadraticCurveTo(14, 92, 20, ly); g.stroke();
    g.beginPath(); g.moveTo(86, 70); g.quadraticCurveTo(114, 92, 108, ry); g.stroke();
    if (!back) {
      g.strokeStyle = '#d9cfb8';
      g.lineWidth = 2;
      for (const [hx, hy] of [[20, ly], [108, ry]]) {
        for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(hx + i * 4, hy + 2); g.lineTo(hx + i * 5, hy + 6); g.stroke(); }
      }
    }
    blob(g, 50, 120 - up(-a), 10, 8, dark);
    blob(g, 78, 120 - up(a), 10, 8, dark);
    blob(g, 64 + a * 1.5, 90, 28, 30, fur);
    if (back) {
      blob(g, 64, 88, 5, 22, dark);
      g.strokeStyle = dark;
      g.lineWidth = 7;
      g.beginPath(); g.moveTo(64, 108); g.bezierCurveTo(100 + a * 10, 112, 106 + a * 14, 64, 88 + a * 16, 60); g.stroke();
    } else blob(g, 64 + a * 1.5, 96, 16, 18, '#5a3a28');
    blob(g, 36, 40, 10, 11, fur); blob(g, 92, 40, 10, 11, fur);
    if (!back) { blob(g, 36, 40, 5, 6, '#7a4535'); blob(g, 92, 40, 5, 6, '#7a4535'); }
    blob(g, 64, 44, 27, 25, fur);
    poly(g, [44, 28, 50, 12, 56, 24, 62, 6, 68, 24, 76, 12, 84, 28], fur);
    if (!back) {
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
  }
  // Round 3D shading: light from the upper left, shadow on the far side.
  g.globalCompositeOperation = 'source-atop';
  const sh = g.createRadialGradient(42, 30, 0, 64, 64, 95);
  sh.addColorStop(0, 'rgba(255,225,180,0.45)');
  sh.addColorStop(0.4, 'rgba(0,0,0,0)');
  sh.addColorStop(1, 'rgba(0,0,0,0.8)');
  g.fillStyle = sh; g.fillRect(0, 0, 128, 128);
  blob(g, 52, 30, 9, 5, 'rgba(255,255,255,0.18)');
  blob(g, 56, 80, 8, 10, 'rgba(255,255,255,0.08)');
  g.globalCompositeOperation = 'source-over';
}

// The glowing red eyes, drawn after the darkness so they always shine.
function monkeyEyes(view) {
  const eyes = view === 0 ? [56, 72] : view === 1 ? [74] : [];
  return (g) => {
    for (const x of eyes) {
      const e = g.createRadialGradient(x, 44, 0, x, 44, 7);
      e.addColorStop(0, '#ffffff');
      e.addColorStop(0.25, '#ff2a00');
      e.addColorStop(1, 'rgba(255,0,0,0)');
      g.fillStyle = e; g.fillRect(x - 7, 37, 14, 14);
    }
  };
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
// A player is a person, a robot, a ghost or an alien, with the accessories they wear.
function drawHuman(g, look) {
  const shirt = SHIRTS[look.s][0];
  const body = BODIES[look.b].id;
  const has = (id) => look.w.includes(id);
  const worn = (slot) => SHOP.find((s) => s.slot === slot && look.w.includes(s.id));
  const hat = !!worn('head');
  if (has('keep')) poly(g, [46, 54, 82, 54, 98, 118, 30, 118], '#d32f2f');
  if (body === 'robot') drawRobot(g, shirt, hat);
  else if (body === 'kummitus') drawGhost(g, shirt);
  else drawPerson(g, shirt, body === 'tulnukas' ? '#7ee06e' : SKINS[look.k], body === 'tulnukas', hat, worn);
  if (has('sall')) {
    g.fillStyle = '#ffeb3b'; g.fillRect(52, 52, 24, 7); g.fillRect(67, 58, 7, 16);
    g.fillStyle = '#e53935';
    for (let x = 52; x < 76; x += 6) g.fillRect(x, 52, 3, 7);
  }
  if (has('prillid')) {
    g.fillStyle = '#111'; g.fillRect(52, 33, 10, 7); g.fillRect(66, 33, 10, 7); g.fillRect(61, 34, 6, 2);
    g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(54, 34, 3, 2); g.fillRect(68, 34, 3, 2);
  }
  if (has('kubar')) {
    g.fillStyle = '#111'; g.fillRect(44, 20, 40, 5); g.fillRect(52, 0, 24, 21);
    g.fillStyle = '#d32f2f'; g.fillRect(52, 14, 24, 4);
  } else if (has('myts')) {
    blob(g, 64, 24, 16, 9, '#29b6f6'); g.fillStyle = '#29b6f6'; g.fillRect(48, 24, 32, 4);
    blob(g, 78, 28, 12, 3, '#0277bd');
  } else if (has('kroon')) {
    poly(g, [48, 26, 48, 8, 56, 17, 64, 4, 72, 17, 80, 8, 80, 26], '#ffd23b');
    blob(g, 64, 20, 3, 3, '#e53935'); blob(g, 55, 21, 2, 2, '#1e88e5'); blob(g, 73, 21, 2, 2, '#43a047');
  } else if (has('lips')) {
    poly(g, [64, 20, 52, 13, 52, 27], '#ff4fa0'); poly(g, [64, 20, 76, 13, 76, 27], '#ff4fa0');
    blob(g, 64, 20, 3.5, 3.5, '#d81b78');
  }
}

// Trousers, a shirt style and shoes are worn by people and aliens.
function drawPerson(g, shirt, skin, alien, hat, worn) {
  const legs = worn('legs');
  const short = legs && legs.short;
  g.fillStyle = legs ? legs.color : '#2b3a67';
  g.fillRect(50, 94, 12, short ? 12 : 26);
  g.fillRect(66, 94, 12, short ? 12 : 26);
  if (short) {
    g.fillStyle = skin;
    g.fillRect(52, 106, 8, 14);
    g.fillRect(68, 106, 8, 14);
  }
  if (legs && legs.id === 'teksad') {
    g.fillStyle = 'rgba(255,255,255,0.35)';
    g.fillRect(55, 96, 1.5, 22);
    g.fillRect(71, 96, 1.5, 22);
  }
  drawShoes(g, worn('feet'));
  g.lineCap = 'round';
  g.strokeStyle = shirt;
  g.lineWidth = 9;
  g.beginPath(); g.moveTo(47, 62); g.lineTo(38, 92); g.stroke();
  g.beginPath(); g.moveTo(81, 62); g.lineTo(90, 92); g.stroke();
  blob(g, 38, 95, 5, 5, skin);
  blob(g, 90, 95, 5, 5, skin);
  poly(g, [46, 56, 82, 56, 85, 98, 43, 98], shirt);
  drawTop(g, worn('top'));
  g.fillStyle = skin;
  g.fillRect(59, 46, 10, 12);
  if (alien) {
    // Antennae poke out only when there is no hat on top.
    if (!hat) {
      g.strokeStyle = skin;
      g.lineWidth = 2.5;
      g.beginPath(); g.moveTo(57, 24); g.lineTo(50, 8); g.moveTo(71, 24); g.lineTo(78, 8); g.stroke();
      blob(g, 50, 8, 4, 4, '#ffd23b');
      blob(g, 78, 8, 4, 4, '#ffd23b');
    }
    blob(g, 64, 35, 18, 17, skin);
    blob(g, 57, 36, 5, 3.5, '#101010');
    blob(g, 71, 36, 5, 3.5, '#101010');
    blob(g, 56, 35, 1.5, 1, '#ffffff');
    blob(g, 70, 35, 1.5, 1, '#ffffff');
    g.strokeStyle = '#2e6b28';
  } else {
    const hair = '#3a2414';
    blob(g, 64, 36, 15, 16, skin);
    blob(g, 64, 25, 16, 8, hair);
    blob(g, 50, 31, 4, 8, hair);
    blob(g, 78, 31, 4, 8, hair);
    blob(g, 58, 37, 2, 2.5, '#1a1010');
    blob(g, 70, 37, 2, 2.5, '#1a1010');
    g.strokeStyle = '#8a3a2a';
  }
  g.lineWidth = 1.8;
  g.beginPath(); g.arc(64, 42, 5, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke();
}

function drawShoes(g, shoe) {
  const id = shoe ? shoe.id : '';
  for (const x of [55, 73]) {
    if (id === 'saapad') {
      g.fillStyle = '#6d4c41';
      g.fillRect(x - 6, 110, 12, 10);
      blob(g, x, 121, 9, 4, '#5d4037');
    } else if (shoe && shoe.stripe) {
      // Sneakers come in many colours with a stripe on the side.
      blob(g, x, 121, 9, 4, shoe.color);
      g.fillStyle = shoe.stripe;
      g.fillRect(x - 5, 120, 10, 2);
    } else if (id === 'helkivad') {
      blob(g, x, 121, 9, 4, '#ff4fa0');
      blob(g, x - 4, 122, 1.6, 1.6, '#4fd2ff');
      blob(g, x, 122.5, 1.6, 1.6, '#ffd23b');
      blob(g, x + 4, 122, 1.6, 1.6, '#5dff6e');
    } else {
      blob(g, x, 121, 9, 4, '#1b1b1b');
    }
  }
}

function drawTop(g, top) {
  const id = top ? top.id : '';
  if (id === 'triibuline') {
    g.fillStyle = 'rgba(255,255,255,0.6)';
    for (let y = 62; y < 96; y += 8) g.fillRect(47, y, 34, 3);
  } else if (id === 'tahesark') {
    const pts = [];
    for (let k = 0; k < 10; k++) {
      const r = k % 2 ? 4.5 : 11;
      const a = -Math.PI / 2 + k * Math.PI / 5;
      pts.push(64 + r * Math.cos(a), 77 + r * Math.sin(a));
    }
    poly(g, pts, '#ffd23b');
  } else if (id === 'pusa') {
    // Hood around the neck, a front pocket and two strings.
    poly(g, [46, 56, 82, 56, 76, 66, 52, 66], 'rgba(0,0,0,0.25)');
    g.fillStyle = 'rgba(0,0,0,0.18)';
    g.fillRect(52, 82, 24, 11);
    g.fillStyle = '#ffffff';
    g.fillRect(58, 64, 2, 10);
    g.fillRect(68, 64, 2, 10);
  } else {
    g.fillStyle = 'rgba(255,255,255,0.25)';
    g.fillRect(45, 74, 39, 5);
  }
}

function drawRobot(g, shirt, hat) {
  g.fillStyle = '#8f9aa6';
  g.fillRect(51, 94, 11, 24);
  g.fillRect(66, 94, 11, 24);
  g.fillStyle = '#4a525c';
  g.fillRect(48, 116, 16, 6);
  g.fillRect(64, 116, 16, 6);
  g.lineCap = 'round';
  g.strokeStyle = '#a7b1bc';
  g.lineWidth = 8;
  g.beginPath(); g.moveTo(46, 62); g.lineTo(37, 90); g.stroke();
  g.beginPath(); g.moveTo(82, 62); g.lineTo(91, 90); g.stroke();
  blob(g, 37, 94, 5, 5, '#6c7680');
  blob(g, 91, 94, 5, 5, '#6c7680');
  g.fillStyle = '#c3ccd6';
  g.fillRect(44, 56, 40, 40);
  g.fillStyle = shirt;
  g.fillRect(51, 63, 26, 18);
  blob(g, 57, 88, 2.5, 2.5, '#ff3b6b');
  blob(g, 64, 88, 2.5, 2.5, '#ffd23b');
  blob(g, 71, 88, 2.5, 2.5, '#5dff6e');
  g.fillStyle = '#7d8792';
  g.fillRect(59, 48, 10, 9);
  if (!hat) {
    g.strokeStyle = '#7d8792';
    g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(64, 22); g.lineTo(64, 10); g.stroke();
    blob(g, 64, 9, 4, 4, '#ff3b6b');
  }
  g.fillStyle = '#7d8792';
  g.fillRect(44, 30, 4, 10);
  g.fillRect(80, 30, 4, 10);
  g.fillStyle = '#d6dee7';
  g.fillRect(48, 20, 32, 30);
  g.fillStyle = '#1a1a2e';
  g.fillRect(51, 30, 26, 10);
  blob(g, 58, 35, 3, 3, '#4fd2ff');
  blob(g, 70, 35, 3, 3, '#4fd2ff');
  g.fillStyle = '#7d8792';
  for (let x = 56; x <= 70; x += 4) g.fillRect(x, 43, 2, 4);
}

// A sheet ghost with a wavy hem; it is a little see-through.
function drawGhost(g, shirt) {
  const sheet = 'rgba(236, 242, 255, 0.88)';
  g.fillStyle = sheet;
  g.beginPath();
  g.moveTo(44, 36);
  g.arc(64, 36, 20, Math.PI, 0);
  g.lineTo(90, 116);
  for (let k = 0; k < 4; k++) {
    const x = 90 - k * 13;
    g.quadraticCurveTo(x - 6.5, 104, x - 13, 116);
  }
  g.closePath();
  g.fill();
  blob(g, 40, 70, 8, 5, sheet);
  blob(g, 88, 70, 8, 5, sheet);
  blob(g, 58, 36, 3.5, 5.5, '#111111');
  blob(g, 70, 36, 3.5, 5.5, '#111111');
  blob(g, 64, 47, 3, 4, '#111111');
  blob(g, 52, 44, 3, 2, shirt);
  blob(g, 76, 44, 3, 2, shirt);
}

const gemSprites = GEM_COLORS.map((c) => shaded(64, (g, s) => drawGem(g, s, c), 0.45));
const ballSprite = shaded(64, drawBall, 0.6);

// A hanging hotel lamp, the soft halo around a bulb and the warm pool of light it throws on the floor.
function drawHangLamp(g) {
  g.fillStyle = '#2a1a10';
  g.fillRect(31, 0, 2, 22);
  poly(g, [18, 36, 46, 36, 39, 20, 25, 20], '#c9a24a');
  poly(g, [22, 34, 42, 34, 37, 22, 27, 22], '#ffd27a');
  blob(g, 32, 38, 6, 4, '#fff6c8');
}

function glowCanvas(flat) {
  const c = makeCanvas(64, 64);
  const g = c.getContext('2d');
  g.translate(32, 32);
  if (flat) g.scale(1, 0.22);
  const r = g.createRadialGradient(0, 0, 0, 0, 0, 32);
  r.addColorStop(0, flat ? 'rgba(255,190,100,0.9)' : 'rgba(255,215,140,0.85)');
  r.addColorStop(1, 'rgba(255,140,60,0)');
  g.fillStyle = r;
  g.beginPath(); g.arc(0, 0, 32, 0, Math.PI * 2); g.fill();
  return c;
}

const lampSprite = makeCanvas(64, 64);
drawHangLamp(lampSprite.getContext('2d'));
const haloSprite = glowCanvas(false);
const poolSprite = glowCanvas(true);
// Every side of the monkey in five running poses, from one arm forward to the other.
const MONKEY_POSES = [-1, -0.5, 0, 0.5, 1];
const monkeySprites = [0, 1, 2].map((v) => MONKEY_POSES.map((p) => shaded(128, (g) => drawMonkey(g, v, p), 0, monkeyEyes(v))));
const humanCache = new Map();
function humanSprite(look) {
  const key = `${look.b}-${look.s}-${look.k}-${look.w.join(',')}`;
  if (!humanCache.has(key)) humanCache.set(key, shaded(128, (g) => drawHuman(g, look), 0.2));
  return humanCache.get(key);
}

// ---------- My character and wallet (kept in this browser only) ----------

function cleanLook(l) {
  const o = l && typeof l === 'object' ? l : {};
  const idx = (v, n) => (Number.isInteger(v) && v >= 0 && v < n ? v : 0);
  const w = Array.isArray(o.w) ? o.w.filter((id) => SHOP.some((s) => s.id === id)).slice(0, 8) : [];
  return { s: idx(o.s, SHIRTS.length), k: idx(o.k, SKINS.length), b: idx(o.b, BODIES.length), w };
}
// A random nickname is made of preset words; players can also type their own.
const NICK_A = ['Kiire', 'Julge', 'Vapper', 'Kaval', 'Särav', 'Väle', 'Lustakas', 'Uljas', 'Salajane', 'Vilgas'];
const NICK_B = ['Rebane', 'Ilves', 'Kakk', 'Saarmas', 'Siil', 'Jänes', 'Karu', 'Orav', 'Konn', 'Hunt'];
const pickOf = (a) => a[Math.floor(Math.random() * a.length)];
const newNick = () => `${pickOf(NICK_A)} ${pickOf(NICK_B)} ${10 + Math.floor(Math.random() * 90)}`;
// A nickname has 2-14 letters, numbers and spaces, with at most 3 numbers so it is never a phone number.
const NICK_RE = /^[A-Za-zÕÄÖÜŠŽõäöüšž0-9 ]{2,14}$/;
const okNick = (n) => typeof n === 'string' && n.trim() === n && NICK_RE.test(n) && (n.match(/[0-9]/g) || []).length <= 3;
const STORE = 'ahvihotell-mina';
function loadProfile() {
  let o = null;
  try { o = JSON.parse(localStorage.getItem(STORE) || 'null'); } catch (e) { o = null; }
  if (!o || typeof o !== 'object') o = {};
  const owned = Array.isArray(o.owned) ? o.owned.filter((id) => SHOP.some((s) => s.id === id)) : [];
  const look = cleanLook({ s: Number.isInteger(o.shirt) ? o.shirt : Math.floor(Math.random() * SHIRTS.length), k: o.skin, w: o.wear });
  const bodies = Array.isArray(o.bodies) ? o.bodies.filter((id) => BODIES.some((b) => b.id === id && b.price)) : [];
  const b = BODIES[o.body];
  const body = Number.isInteger(o.body) && b && (!b.price || bodies.includes(b.id)) ? o.body : 0;
  return { gems: Math.max(0, Math.floor(Number(o.gems) || 0)), owned, wear: look.w.filter((id) => owned.includes(id)), shirt: look.s, skin: look.k, bodies, body,
    nick: okNick(o.nick) ? o.nick : newNick(),
    best: Math.max(0, Math.floor(Number(o.best) || 0)) };
}
const me = loadProfile();
function saveProfile() {
  try { localStorage.setItem(STORE, JSON.stringify(me)); } catch (e) { /* private mode */ }
}
saveProfile(); // keeps a newly made nickname
const myLook = () => ({ s: me.shirt, k: me.skin, b: me.body, w: me.wear.slice() });

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
  // Lamps click and buzz, then the power dies with a falling hum.
  lightsOut() {
    [0, 0.25, 0.4, 0.7, 0.85].forEach((at) => tone(140 + Math.random() * 80, 0.05, 'square', 0.18, null, at));
    tone(220, 0.6, 'sawtooth', 0.12, 25, 0.9);
  },
  // Slow heavy breathing right behind me.
  breath() {
    if (!ac) return;
    for (const [at, dur, vol] of [[0, 0.55, 0.5], [0.65, 0.7, 0.35], [1.25, 0.3, 0.6]]) {
      const len = Math.floor(ac.sampleRate * dur);
      const buf = ac.createBuffer(1, len, ac.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.sin((i / len) * Math.PI);
      const src = ac.createBufferSource();
      const f = ac.createBiquadFilter();
      const g = ac.createGain();
      src.buffer = buf;
      f.type = 'bandpass'; f.frequency.value = 500; f.Q.value = 1.2;
      g.gain.value = vol;
      src.connect(f).connect(g).connect(master);
      src.start(ac.currentTime + at);
    }
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

// ---------- Hotel lights ----------

// Lamps hang from the ceiling; each one lights the corridors around it.
const LAMP_REACH = 3.2;
let lamps = [];     // { x, y, hang, p: strength, f: brightness this frame, bad: flickers }
let lampLinks = []; // per map cell: indexes of the lamps that can shine there

function placeLamps() {
  lamps = [];
  for (let y = 1; y < MH - 1; y++) {
    for (let x = 1; x < MW - 1; x++) {
      const h = (Math.imul(x, 2654435761) ^ Math.imul(y + 7, 40503)) >>> 0;
      const lamp = { f: 1, ph: h % 100, bad: h % 5 === 0 };
      if (!map[y * MW + x] && x % 2 && y % 2 && (h >>> 3) % 7 === 0) lamps.push({ ...lamp, x: x + 0.5, y: y + 0.5, hang: true, p: 1 });
    }
  }
  // Light only travels along corridors, never through walls.
  lampLinks = new Array(MW * MH);
  lamps.forEach((l, i) => {
    const start = Math.floor(l.y) * MW + Math.floor(l.x);
    const steps = new Map([[start, 0]]);
    const q = [start];
    while (q.length) {
      const c = q.shift();
      (lampLinks[c] ||= []).push(i);
      if (steps.get(c) >= 3) continue;
      const cx = c % MW;
      const cy = (c / MW) | 0;
      for (const [dx, dy] of DIRS) {
        const n = c + dy * MW + dx;
        if (!wall(cx + dx, cy + dy) && !steps.has(n)) { steps.set(n, steps.get(c) + 1); q.push(n); }
      }
    }
  });
}

function lampAt(px, py, cell = Math.floor(py) * MW + Math.floor(px)) {
  const list = lampLinks[cell];
  if (!list) return 0;
  let s = 0;
  for (const i of list) {
    const l = lamps[i];
    const dist = Math.hypot(l.x - px, l.y - py);
    if (dist < LAMP_REACH) { const v = 1 - dist / LAMP_REACH; s += l.p * l.f * v * v; }
  }
  return Math.min(1, s);
}

// ---------- Game state ----------

let state = 'menu'; // menu, rooms, wait, shop, play, scare, over, spec, lost, win
let mode = 'solo';  // solo or team
let player = { x: 1.5, y: 1.5, a: 0, p: 0, walk: 0 };
let items = [];
let monkeys = [];
let lives = LIVES;
let dead = false;
let gemsLeft = GEM_COUNT;
let picked = 0;
let power = 0;
let invuln = 0;
let time = 0;
let flick = 1;
let flickT = 0;
let beatT = 0;
let chatterT = 3;
let danger = 0;
let scareT = 0;
let scareKind = 0; // 0 jumps at you, 1 lights go out, 2 breathing behind you
let scareLoud = false;
let scareA0 = 0;
let overT = 0;
let netT = 0;
let wasHost = false;
let specId = null;
let drips = [];
let miniBase = null;
const peers = new Map(); // other players in the game: id -> { look, x, y, a, nx, ny, na, lives, dead, walk }
const keys = { up: false, down: false, left: false, right: false, sleft: false, sright: false };
const IN_GAME = ['play', 'scare', 'over', 'spec'];
const inGame = () => IN_GAME.includes(state);

function newGame(seed) {
  rng = seeded(seed);
  makeMaze();
  placeLamps();
  const sx = (CW >> 1) * 2 + 1;
  const sy = (CH >> 1) * 2 + 1;
  player = { x: sx + 0.5, y: sy + 0.5, a: 0, p: 0, walk: 0 };
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
  for (let i = 0; i < MONKEY_COUNT; i++) monkeys.push({ x: 0, y: 0, nx: 0, ny: 0, tx: 0, ty: 0, px: 0, py: 0, wander: [0, 0.15, 0.85][i] ?? 0.3, fast: 1, step: Math.random() * 6 });
  placeMonkeysFar([player]);
  rng = Math.random;
  lives = LIVES;
  dead = false;
  picked = 0;
  power = 0;
  invuln = 2;
  time = 0;
  danger = 0;
  specId = null;
  buildMini();
  mini.hidden = true;
  state = 'play';
  updateHud();
}

// Everyone the monkeys can chase: me (while alive) and every living friend.
function targets() {
  const t = [];
  if (!dead) t.push(player);
  for (const p of peers.values()) if (!p.dead) t.push(p);
  return t;
}

function placeMonkeysFar(ts, list = monkeys) {
  if (!ts.length || !list.length) return;
  const fields = ts.map((t) => bfs(Math.floor(t.x), Math.floor(t.y)));
  const d = new Int16Array(MW * MH).fill(-1);
  for (let i = 0; i < d.length; i++) {
    let v = -1;
    for (const f of fields) if (f[i] >= 0 && (v < 0 || f[i] < v)) v = f[i];
    d[i] = v;
  }
  let max = 0;
  for (let i = 0; i < d.length; i++) max = Math.max(max, d[i]);
  const cand = [];
  for (let i = 0; i < d.length; i++) if (d[i] >= max * 0.55) cand.push(i);
  shuffle(cand);
  const picks = [];
  for (const i of cand) {
    if (picks.length === list.length) break;
    const x = i % MW;
    const y = (i / MW) | 0;
    if (picks.every(([px, py]) => Math.abs(px - x) + Math.abs(py - y) >= 6)) picks.push([x, y]);
  }
  while (picks.length < list.length) { const i = cand[rand(cand.length)]; picks.push([i % MW, (i / MW) | 0]); }
  list.forEach((m, k) => {
    const [x, y] = picks[k];
    m.x = m.nx = x + 0.5; m.y = m.ny = y + 0.5; m.tx = x; m.ty = y; m.px = x; m.py = y;
  });
}

// Moves the monkeys that are next to a caught player far away from everybody.
function relocateNear(x, y) {
  placeMonkeysFar(targets(), monkeys.filter((m) => Math.hypot(m.x - x, m.y - y) < 2.5));
}

function blocked(x, y) {
  const r = 0.22;
  return wall(Math.floor(x - r), Math.floor(y - r)) || wall(Math.floor(x + r), Math.floor(y - r)) ||
    wall(Math.floor(x - r), Math.floor(y + r)) || wall(Math.floor(x + r), Math.floor(y + r));
}

function chooseNext(m, field) {
  const here = field[m.ty * MW + m.tx];
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
      const v = field[o[1] * MW + o[0]];
      if (v < 0) continue;
      if (v < best) { best = v; bests = [o]; } else if (v === best) bests.push(o);
    }
    if (!bests.length) bests = opts;
    next = bests[rand(bests.length)];
  }
  m.px = m.tx; m.py = m.ty;
  m.tx = next[0]; m.ty = next[1];
}

// Monkeys walk from tile centre to tile centre along the shortest way to their target.
function stepMonkey(m, dt, t, field) {
  let move = MONKEY_SPEED * (m.fast || 1) * dt;
  const ptx = Math.floor(t.x);
  const pty = Math.floor(t.y);
  if (Math.floor(m.x) === ptx && Math.floor(m.y) === pty) {
    const dx = t.x - m.x;
    const dy = t.y - m.y;
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
    chooseNext(m, field);
  }
}

// The tile a few steps ahead of where a player is looking, or null when a wall is right in front.
function aheadOf(t, n = 4) {
  const c = Math.cos(t.a || 0);
  const sn = Math.sin(t.a || 0);
  const dx = Math.abs(c) > Math.abs(sn) ? Math.sign(c) : 0;
  const dy = dx ? 0 : Math.sign(sn);
  let x = Math.floor(t.x);
  let y = Math.floor(t.y);
  let k = 0;
  while (k < n && !wall(x + dx, y + dy)) { x += dx; y += dy; k++; }
  return k ? { x: x + 0.5, y: y + 0.5 } : null;
}

// Each monkey goes for the closest living player, every one in its own way:
// 0 the hunter runs straight at you, 1 the trapper cuts you off where you are heading,
// 2 the sneaker roams slowly until it is close, then sprints.
const MONKEY_TINT = ['#ff2a2a', '#ff9a1a', '#c04bff'];
function simMonkeys(dt) {
  const ts = targets();
  if (!ts.length) return;
  const fields = ts.map((t) => bfs(Math.floor(t.x), Math.floor(t.y)));
  monkeys.forEach((m, i) => {
    const mi = Math.floor(m.y) * MW + Math.floor(m.x);
    let k = 0;
    for (let j = 1; j < ts.length; j++) {
      const v = fields[j][mi];
      if (v >= 0 && (fields[k][mi] < 0 || v < fields[k][mi])) k = j;
    }
    const near = fields[k][mi];
    let t = ts[k];
    let field = fields[k];
    m.fast = 1;
    if (i % 3 === 1 && near > 3) {
      const a = aheadOf(t);
      if (a) { t = a; field = bfs(Math.floor(a.x), Math.floor(a.y)); }
    } else if (i % 3 === 2) {
      const close = near >= 0 && near <= 8;
      m.wander = close ? 0 : 0.85;
      m.fast = close ? 1.25 : 0.8;
    }
    stepMonkey(m, dt, t, field);
    m.nx = m.x; m.ny = m.y;
  });
}

// Glides something seen over the network towards where it really is.
function follow(o, x, y, dt) {
  const d = Math.hypot(x - o.x, y - o.y);
  if (d > 2) { o.x = x; o.y = y; } else { const k = Math.min(1, dt * 12); o.x += (x - o.x) * k; o.y += (y - o.y) * k; }
  return d > 0.02;
}

// The shared world: monkeys, friends and lights. In a team game it keeps running while I am scared or dead.
function world(dt) {
  time += dt;
  if (mode === 'team') {
    const host = isHost();
    if (host && !wasHost) for (const m of monkeys) { m.tx = m.px = Math.floor(m.x); m.ty = m.py = Math.floor(m.y); }
    wasHost = host;
    if (host) simMonkeys(dt);
    else for (const m of monkeys) follow(m, m.nx, m.ny, dt);
    for (const p of peers.values()) {
      if (follow(p, p.nx, p.ny, dt)) p.walk += dt * 10;
      const da = Math.atan2(Math.sin(p.na - p.a), Math.cos(p.na - p.a));
      p.a += da * Math.min(1, dt * 12);
    }
    netT -= dt;
    if (netT <= 0) { netT = NET_STEP; sendState(); }
    if (gemsLeft <= 0) { win(); return; }
  } else simMonkeys(dt);
  for (const m of monkeys) {
    m.step += dt * 8;
    // Remember which way each monkey runs, so it can be drawn from the right side.
    const mx = m.x - (m.lx ?? m.x);
    const my = m.y - (m.ly ?? m.y);
    const d2 = mx * mx + my * my;
    if (d2 > 1e-6 && d2 < 1) m.h = Math.atan2(my, mx);
    m.lx = m.x; m.ly = m.y;
  }
  flickT -= dt;
  if (flickT > 0) flick = 0.35 + Math.random() * 0.65;
  else { flick = 1; if (Math.random() < dt * 0.15) flickT = 0.15 + Math.random() * 0.4; }
}

// My own moves, pickups and getting caught.
function update(dt) {
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
    player.walk += dt * 10;
  }
  const myField = bfs(Math.floor(player.x), Math.floor(player.y));

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (it.alive && Math.hypot(it.x - player.x, it.y - player.y) < 0.45) takeItem(i, true);
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
    const pd = myField[Math.floor(m.y) * MW + Math.floor(m.x)];
    if (pd >= 0) nearest = Math.min(nearest, pd);
    if (invuln <= 0 && Math.hypot(m.x - player.x, m.y - player.y) < 0.5) { caught(m); return; }
  }
  danger = clamp(1 - nearest / 8, 0, 1);

  beatT -= dt;
  if (nearest < 12 && beatT <= 0) { sfx.beat(1 - nearest / 12); beatT = 0.32 + nearest * 0.07; }
  chatterT -= dt;
  if (chatterT <= 0) { if (nearest < 9) sfx.monkey(); chatterT = 2 + Math.random() * 4; }
}

function takeItem(i, mine) {
  const it = items[i];
  if (!it || !it.alive) return;
  it.alive = false;
  if (!it.ball) gemsLeft--;
  // The eye ball shows the monkeys to the whole team, not only to whoever found it.
  if (it.ball) { power = POWER_TIME; sfx.ball(); } else if (mine) { picked++; me.gems++; saveProfile(); sfx.gem(); }
  if (mine && mode === 'team' && room) room.send({ t: 'take', i });
  updateHud();
}

function caught(m) {
  lives--;
  updateHud();
  state = 'scare';
  scareT = 0;
  // Each catch picks one of three jumpscares at random.
  scareKind = rand(3);
  scareLoud = false;
  scareA0 = player.a;
  player.p = 0;
  if (scareKind === 1) sfx.lightsOut();
  if (scareKind === 2) {
    sfx.breath();
    // In a solo game the monkey sneaks right behind me, so I see it when I turn around.
    if (mode === 'solo' && m) {
      let d = 0.9;
      while (d > 0.3 && wall(Math.floor(player.x - Math.cos(player.a) * d), Math.floor(player.y - Math.sin(player.a) * d))) d -= 0.1;
      m.x = player.x - Math.cos(player.a) * d;
      m.y = player.y - Math.sin(player.a) * d;
      m.h = player.a;
    }
  }
  if (mode === 'team') {
    if (isHost()) relocateNear(player.x, player.y);
    else if (room) room.send({ t: 'hit' });
    sendState();
  }
}

function afterScare() {
  if (lives <= 0) { die(); return; }
  if (mode === 'solo') placeMonkeysFar([player]);
  player.a = scareA0;
  flick = 1;
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

function startDrips() {
  overT = 0;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  drips = [];
  for (let x = 0; x < W; x += 2 + Math.floor(Math.random() * 4)) {
    drips.push({ x, w: 2 + Math.floor(Math.random() * 5), y: -Math.random() * 40, v: 30 + Math.random() * 110 });
  }
}

// My last life is gone: blood, and then (in a team game) watching a friend.
function die() {
  dead = true;
  power = 0;
  danger = 0;
  showPlayUi(false);
  startDrips();
  sfx.over();
  state = 'over';
  updateHud();
  if (mode === 'team') sendState();
}

const alivePeers = () => [...peers.entries()].filter(([, p]) => !p.dead).map(([id]) => id);

function startSpectate() {
  state = 'spec';
  specId = null;
  nextSpec();
  $('spec').hidden = false;
  $('hud').hidden = false;
}

function nextSpec() {
  const ids = alivePeers();
  if (!ids.length) return;
  specId = ids[(ids.indexOf(specId) + 1) % ids.length];
  $('specWho').textContent = SHIRTS[peers.get(specId).look.s][1];
}

function spectate() {
  const p = peers.get(specId);
  if (p && !p.dead) { render(p); return; }
  if (alivePeers().length) { nextSpec(); return; }
  $('spec').hidden = true;
  $('hud').hidden = true;
  startDrips();
  state = 'over';
}

function lose() {
  state = 'lost';
  sendScore();
  $('spec').hidden = true;
  $('hud').hidden = true;
  const got = GEM_COUNT - gemsLeft;
  $('overText').textContent = mode === 'team'
    ? `Ahvid said kõik kätte. Koos korjasite ${got}/${GEM_COUNT} kalliskivi, sina ${picked}.`
    : `Ahvid said sind kätte. Kalliskive: ${got}/${GEM_COUNT}`;
  $('overBtn').hidden = mode === 'team';
  showScreen('over');
}

function win() {
  state = 'win';
  sendScore();
  sfx.win();
  showPlayUi(false);
  $('spec').hidden = true;
  const secs = Math.round(time);
  if (mode === 'solo') {
    let best = 0;
    try { best = Number(localStorage.getItem('ahvihotell-parim')) || 0; } catch (e) { best = 0; }
    if (!best || secs < best) {
      best = secs;
      try { localStorage.setItem('ahvihotell-parim', String(best)); } catch (e) { /* private mode */ }
    }
    $('winTitle').textContent = '🏆 Sa võitsid!';
    $('winText').textContent = `Kõik ${GEM_COUNT} kalliskivi on korjatud! Aeg: ${fmt(secs)} · Parim: ${fmt(best)}`;
  } else {
    $('winTitle').textContent = '🏆 Te võitsite!';
    $('winText').textContent = `Koos korjasite kõik ${GEM_COUNT} kalliskivi ajaga ${fmt(secs)}! Sina korjasid ${picked}.`;
  }
  $('winBtn').hidden = mode === 'team';
  showScreen('win');
}

function updateHud() {
  const l = Math.max(0, lives);
  $('lives').textContent = dead ? '💀' : '❤️'.repeat(l) + '🖤'.repeat(LIVES - l);
  $('gems').textContent = `💎 ${GEM_COUNT - gemsLeft}/${GEM_COUNT}`;
  const p = $('power');
  p.hidden = power <= 0;
  p.textContent = `👁️ ${Math.ceil(power)}`;
  const t = $('team');
  t.hidden = mode !== 'team' || !peers.size;
  t.textContent = [...peers.values()].map((f) => SHIRTS[f.look.s][1] + (f.dead ? '💀' : `❤️${f.lives}`)).join(' ');
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
  monkeys.forEach((m, i) => blob(mctx, m.x * MINI, m.y * MINI, 3.3, 3.3, MONKEY_TINT[i % 3]));
  for (const p of peers.values()) if (!p.dead) blob(mctx, p.x * MINI, p.y * MINI, 2.6, 2.6, SHIRTS[p.look.s][0]);
  blob(mctx, player.x * MINI, player.y * MINI, 2.6, 2.6, '#ffffff');
  mctx.strokeStyle = '#ffffff';
  mctx.lineWidth = 1.5;
  mctx.beginPath();
  mctx.moveTo(player.x * MINI, player.y * MINI);
  mctx.lineTo(player.x * MINI + Math.cos(player.a) * 7, player.y * MINI + Math.sin(player.a) * 7);
  mctx.stroke();
}

// flip mirrors the picture, so a monkey seen from the side can face left or right.
function drawSprite(lv, size, wx, wy, scale, lift, view, flip) {
  const sx = wx - view.x;
  const sy = wy - view.y;
  const depth = sx * view.dx + sy * view.dy;
  if (depth < 0.15) return;
  const lat = (view.dx * sy - view.dy * sx) / FOV;
  const screenX = (W / 2) * (1 + lat / depth);
  const unit = K / depth;
  const sz = unit * scale;
  const bottom = view.horizon + unit / 2 - lift * unit;
  const left = screenX - sz / 2;
  const img = lv[Math.round(clamp(view.light(depth) + lampAt(wx, wy), 0, 1) * (LEVELS - 1))];
  const x0 = Math.max(0, Math.floor(left));
  const x1 = Math.min(W - 1, Math.floor(left + sz));
  for (let x = x0; x <= x1; x++) {
    if (depth >= zbuf[x]) continue;
    let tx = clamp(Math.floor(((x - left) / sz) * size), 0, size - 1);
    if (flip) tx = size - 1 - tx;
    ctx.drawImage(img, tx, 0, 1, size, x, bottom - sz, 1, sz);
  }
}

// Picks how the camera sees a monkey: from the front, the side or the back, in its running pose.
function monkeyLook(m, view) {
  let side = 0;
  let flip = false;
  if (m.h !== undefined) {
    const hx = Math.cos(m.h);
    const hy = Math.sin(m.h);
    const tx = view.x - m.x;
    const ty = view.y - m.y;
    const toward = (hx * tx + hy * ty) / (Math.hypot(tx, ty) || 1);
    if (toward < -0.7) side = 2;
    else if (toward < 0.7) { side = 1; flip = hy * view.dx - hx * view.dy < 0; }
  }
  return [monkeySprites[side][Math.round(Math.sin(m.step) * 2) + 2], flip];
}

// Lamps, halos and light pools shine by themselves, so they skip the darkness.
function drawGlow(img, size, wx, wy, scale, lift, view, alpha, add) {
  const sx = wx - view.x;
  const sy = wy - view.y;
  const depth = sx * view.dx + sy * view.dy;
  if (depth < 0.15 || alpha <= 0.01) return;
  const lat = (view.dx * sy - view.dy * sx) / FOV;
  const screenX = (W / 2) * (1 + lat / depth);
  const unit = K / depth;
  const sz = unit * scale;
  const bottom = view.horizon + unit / 2 - lift * unit;
  const left = screenX - sz / 2;
  const x0 = Math.max(0, Math.floor(left));
  const x1 = Math.min(W - 1, Math.floor(left + sz));
  ctx.globalAlpha = Math.min(1, alpha);
  if (add) ctx.globalCompositeOperation = 'lighter';
  for (let x = x0; x <= x1; x++) {
    if (depth >= zbuf[x]) continue;
    const tx = clamp(Math.floor(((x - left) / sz) * size), 0, size - 1);
    ctx.drawImage(img, tx, 0, 1, size, x, bottom - sz, 1, sz);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

// ---------- Floor: a red hotel runner with a gold border along the walls ----------

const FT = 32;
const FLOOR_LV = 12;
const FOG_RGB = [14, 16, 30];
// One carpet tile for each mix of walls around a cell (bit 1 left, 2 right, 4 up, 8 down), so the border follows the walls.
// Each tile is baked at several brightness levels that fade into the blue fog.
const floorTiles = [];
for (let mask = 0; mask < 16; mask++) {
  const t = [];
  for (let y = 0; y < FT; y++) for (let x = 0; x < FT; x++) {
    const fx = (x + 0.5) / FT;
    const fy = (y + 0.5) / FT;
    const edge = Math.min(mask & 1 ? fx : 9, mask & 2 ? 1 - fx : 9, mask & 4 ? fy : 9, mask & 8 ? 1 - fy : 9);
    const n = ((x * 7 + y * 13) % 5) * 3;
    if (edge < 0.1) t.push([62 - n, 38 - n / 2, 20]);
    else if (edge < 0.16) t.push([196, 150, 56]);
    else if (Math.abs(fx - 0.5) + Math.abs(fy - 0.5) < 0.11) t.push([200, 155, 60]);
    else t.push([140 - n, 22, 32]);
  }
  const levels = [];
  for (let l = 0; l < FLOOR_LV; l++) {
    const L = l / (FLOOR_LV - 1);
    const a = new Uint32Array(FT * FT);
    t.forEach(([r, g, b], i) => {
      const c = (v, f) => Math.round(v * L + f * (1 - L));
      a[i] = ((255 << 24) | (c(b, FOG_RGB[2]) << 16) | (c(g, FOG_RGB[1]) << 8) | c(r, FOG_RGB[0])) >>> 0;
    });
    levels.push(a);
  }
  floorTiles.push(levels);
}
let floorMap = null;
let floorMask = null;
let floorImg = null;
let floorBuf = null;

function drawFloor(cam, dirX, dirY, planeX, planeY, horizon, light) {
  if (floorMap !== map) {
    floorMap = map;
    floorMask = new Uint8Array(MW * MH);
    for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) {
      floorMask[y * MW + x] = wall(x - 1, y) | (wall(x + 1, y) << 1) | (wall(x, y - 1) << 2) | (wall(x, y + 1) << 3);
    }
  }
  if (!floorImg || floorImg.width !== W || floorImg.height !== H) {
    floorImg = ctx.createImageData(W, H);
    floorBuf = new Uint32Array(floorImg.data.buffer);
  }
  const y0 = Math.floor(horizon) + 1;
  for (let y = y0; y < H; y++) {
    const dist = K / (2 * (y + 0.5 - horizon));
    const lev = Math.round(clamp(light(dist) * 0.85 + 0.05, 0, 1) * (FLOOR_LV - 1));
    let wx = cam.x + dist * (dirX - planeX);
    let wy = cam.y + dist * (dirY - planeY);
    const sx = (dist * planeX * 2) / W;
    const sy = (dist * planeY * 2) / W;
    const o = y * W;
    for (let x = 0; x < W; x++, wx += sx, wy += sy) {
      const cx = Math.floor(wx);
      const cy = Math.floor(wy);
      const m = cx >= 0 && cy >= 0 && cx < MW && cy < MH ? floorMask[cy * MW + cx] : 15;
      floorBuf[o + x] = floorTiles[m][lev][((((wy - cy) * FT) | 0) * FT) + (((wx - cx) * FT) | 0)];
    }
  }
  ctx.putImageData(floorImg, 0, 0, 0, y0, W, H - y0);
}

// Draws the hotel through the eyes of cam: me, or the friend I am watching.
function render(cam) {
  const dirX = Math.cos(cam.a);
  const dirY = Math.sin(cam.a);
  const planeX = -dirY * FOV;
  const planeY = dirX * FOV;
  // cam.p looks up (+) or down (-) by moving the horizon.
  const horizon = H / 2 + (cam.p || 0) * H * 0.4 + Math.sin(cam.walk) * 2.5;
  const light = (d) => clamp(1.2 - d / 5.5, 0, 1) * flick;
  // Some old bulbs keep flickering on their own.
  for (const l of lamps) l.f = flick * (l.bad && Math.sin(time * 17 + l.ph) * Math.sin(time * 5.3 + l.ph) > 0.35 ? 0.15 : 1);

  const g = ctx.createLinearGradient(0, 0, 0, horizon);
  g.addColorStop(0, '#161528');
  g.addColorStop(1, '#0e1020');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, horizon);
  drawFloor(cam, dirX, dirY, planeX, planeY, horizon, light);

  for (let x = 0; x < W; x++) {
    const camX = (2 * x) / W - 1;
    const rdx = dirX + planeX * camX;
    const rdy = dirY + planeY * camX;
    let mx = Math.floor(cam.x);
    let my = Math.floor(cam.y);
    const ddx = rdx === 0 ? 1e30 : Math.abs(1 / rdx);
    const ddy = rdy === 0 ? 1e30 : Math.abs(1 / rdy);
    let stepX = 1;
    let stepY = 1;
    let sdx;
    let sdy;
    if (rdx < 0) { stepX = -1; sdx = (cam.x - mx) * ddx; } else sdx = (mx + 1 - cam.x) * ddx;
    if (rdy < 0) { stepY = -1; sdy = (cam.y - my) * ddy; } else sdy = (my + 1 - cam.y) * ddy;
    let side = 0;
    for (let i = 0; i < 80; i++) {
      if (sdx < sdy) { sdx += ddx; mx += stepX; side = 0; } else { sdy += ddy; my += stepY; side = 1; }
      if (wall(mx, my)) break;
    }
    const perp = Math.max(0.05, side === 0 ? sdx - ddx : sdy - ddy);
    let wx = side === 0 ? cam.y + perp * rdy : cam.x + perp * rdx;
    wx -= Math.floor(wx);
    let tx = clamp(Math.floor(wx * TEX), 0, TEX - 1);
    if ((side === 0 && rdx > 0) || (side === 1 && rdy < 0)) tx = TEX - tx - 1;
    const lineH = K / perp;
    const top = horizon - lineH / 2;
    ctx.drawImage(texFor(mx, my), tx, 0, 1, TEX, x, top, 1, lineH);
    // The open cell in front of the wall decides which lamps light it.
    const front = side === 0 ? my * MW + mx - stepX : (my - stepY) * MW + mx;
    const lit = lampAt(cam.x + perp * rdx, cam.y + perp * rdy, front);
    const shade = 1 - clamp(light(perp) + lit, 0, 1) * (side ? 0.72 : 1);
    if (shade > 0.02) { ctx.fillStyle = `rgba(14,16,30,${shade.toFixed(2)})`; ctx.fillRect(x, top, 1, lineH); }
    if (lit > 0.03) { ctx.fillStyle = `rgba(255,160,70,${(lit * 0.2).toFixed(2)})`; ctx.fillRect(x, top, 1, lineH); }
    zbuf[x] = perp;
  }

  const view = { x: cam.x, y: cam.y, dx: dirX, dy: dirY, horizon, light };
  const near = lamps.filter((l) => (l.x - cam.x) ** 2 + (l.y - cam.y) ** 2 < 120);
  for (const l of near) drawGlow(poolSprite, 64, l.x, l.y, l.hang ? 1.8 : 1.2, l.hang ? -0.9 : -0.6, view, l.f * l.p * 0.55, true);
  const list = [];
  for (const l of near) list.push({ e: l, kind: 'lamp' });
  for (const it of items) if (it.alive) list.push({ e: it, kind: it.ball ? 'ball' : 'gem' });
  for (const m of monkeys) list.push({ e: m, kind: 'monkey' });
  for (const p of peers.values()) if (!p.dead && p !== cam) list.push({ e: p, kind: 'human' });
  for (const s of list) s.d = (s.e.x - cam.x) * dirX + (s.e.y - cam.y) * dirY;
  list.sort((a, b) => b.d - a.d);
  for (const s of list) {
    if (s.d < 0.15) continue;
    const e = s.e;
    if (s.kind === 'lamp') {
      if (e.hang) drawGlow(lampSprite, 64, e.x, e.y, 0.45, 0.55, view, Math.max(0.35, e.f), false);
      drawGlow(haloSprite, 64, e.x, e.y, e.hang ? 0.9 : 0.6, e.hang ? 0.29 : 0.42, view, e.f * e.p, true);
    } else if (s.kind === 'monkey') {
      const [lv, flip] = monkeyLook(e, view);
      drawSprite(lv, 128, e.x, e.y, 0.95, Math.abs(Math.sin(e.step)) * 0.04, view, flip);
    }
    else if (s.kind === 'human') drawSprite(humanSprite(e.look), 128, e.x, e.y, 0.9, Math.abs(Math.sin(e.walk)) * 0.03, view);
    else if (s.kind === 'ball') drawSprite(ballSprite, 64, e.x, e.y, 0.34, 0.22 + Math.sin(time * 3 + e.phase) * 0.05, view);
    else drawSprite(gemSprites[e.color], 64, e.x, e.y, 0.3, 0.2 + Math.sin(time * 3 + e.phase) * 0.05, view);
  }

  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, Math.max(W, H) * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, `rgba(${Math.round(140 * danger)},0,0,0.9)`);
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  const showMini = power > 0 && !dead;
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

function drawFace(t) {
  const flash = t < 0.06 || (t > 0.32 && t < 0.36) || (t > 0.9 && t < 0.93);
  ctx.fillStyle = flash ? '#ffffff' : '#000000';
  ctx.fillRect(0, 0, W, H);
  if (t < 0.06) return;
  const k = 1 - clamp(t / SCARE_TIME, 0, 1);
  const shake = 3 + 12 * k;
  const ox = (Math.random() - 0.5) * shake;
  const oy = (Math.random() - 0.5) * shake;
  // Jumpscare A rushes at you out of the dark; in the others the face is already right in front of you.
  const zoom = scareKind === 0 ? 0.04 + Math.min(t * 4, 1) ** 2 * 0.56 : 0.33 + Math.min(t * 5, 1) * 0.2 + t * 0.03;
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

// The whole jumpscare: its quiet start, then the face.
const scareEnd = () => SCARE_LEAD[scareKind] + SCARE_TIME;

function drawScare(t) {
  const f = t - SCARE_LEAD[scareKind];
  if (f >= 0) {
    if (!scareLoud) {
      scareLoud = true;
      sfx.scare();
      if (navigator.vibrate) navigator.vibrate([200, 50, 300]);
    }
    drawFace(f);
    return;
  }
  if (scareKind === 1) {
    // B: the lights flicker harder and harder, then everything goes black and quiet.
    if (t > 0.9) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); return; }
    flick = Math.random() < t ? 0.05 : 0.4 + Math.random() * 0.6;
    render(player);
    return;
  }
  // C: breathing behind me, then the view turns around by itself.
  const turn = clamp((t - 1) / 0.5, 0, 1);
  render({ ...player, a: scareA0 + (Math.PI * (1 - Math.cos(turn * Math.PI))) / 2 });
  ctx.fillStyle = `rgba(0,0,0,${0.15 + turn * 0.25})`;
  ctx.fillRect(0, 0, W, H);
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
  if (state !== 'over' || overT < 1.3) return;
  if (mode === 'team' && alivePeers().length) { if (overT > 3) startSpectate(); } else lose();
}

// ---------- Playing together (lab.js rooms) ----------
// The menu visitors meet in the lobby room 'fuajee', where every waiting room advertises itself.
// The game itself runs in room 'ah-<code>'. The player with the smallest id moves the monkeys.

let labApi = null;
try { labApi = lab(); } catch (e) { labApi = null; }
let lobby = null;
let room = null;
let roomCode = '';
let roomsKey = '';
const members = new Map(); // waiting room: id -> look
const ads = new Map();     // lobby: code -> { n, c, t }
const banned = new Set();  // rooms whose leader sent me out; hidden from my list

function openLobby() {
  if (lobby || !labApi) return;
  const l = labApi.join('fuajee');
  lobby = l;
  l.on('message', (d) => {
    if (l !== lobby || !d || typeof d !== 'object') return;
    const code = String(d.code || '');
    if (!/^[0-9]{4}$/.test(code)) return;
    if (d.t === 'ad') {
      const c = Array.isArray(d.c) ? d.c.slice(0, MAX_PLAYERS).map((v) => (Number.isInteger(v) && v >= 0 && v < SHIRTS.length ? v : 0)) : [];
      ads.set(code, { n: clamp(Math.floor(num(d.n, 1)), 1, MAX_PLAYERS), c, t: performance.now() });
    } else if (d.t === 'gone') ads.delete(code);
    drawRooms();
  });
  l.on('open', drawRooms);
  l.on('close', drawRooms);
}

function closeLobby() {
  if (lobby) lobby.close();
  lobby = null;
  ads.clear();
}

function leaderId() {
  if (!room || room.id === null) return null;
  return [String(room.id), ...members.keys()].sort()[0];
}

// The room leader can send a player out of the waiting room.
function kick(id) {
  if (state !== 'wait' || !room || !room.connected || !isLeader() || !members.has(id)) return;
  room.send({ t: 'out', id });
  members.delete(id);
  drawWait();
}

function isLeader() {
  if (!room || room.id === null) return false;
  const mine = String(room.id);
  return [mine, ...members.keys()].sort()[0] === mine;
}

function hostId() {
  if (!room || room.id === null) return null;
  return [String(room.id), ...peers.keys()].sort()[0];
}

function isHost() {
  if (mode === 'solo') return true;
  const h = hostId();
  return h !== null && h === String(room.id);
}

function sendState() {
  if (mode !== 'team' || !room || !room.connected) return;
  const msg = { t: 'p', x: r2(player.x), y: r2(player.y), a: r2(player.a), l: lives, d: dead ? 1 : 0, k: myLook() };
  if (isHost()) msg.m = monkeys.map((m) => [r2(m.x), r2(m.y)]);
  room.send(msg);
}

function joinRoom(code) {
  leaveRoom();
  openLobby();
  roomCode = code;
  const r = labApi.join('ah-' + code);
  room = r;
  state = 'wait';
  showScreen('wait');
  $('waitCode').textContent = code;
  r.on('open', (id, others) => {
    if (r !== room || state !== 'wait') return;
    if (others.length >= MAX_PLAYERS) { roomRefused('See tuba on juba täis.'); return; }
    r.send({ t: 'hi', k: myLook() });
    drawWait();
  });
  r.on('join', (id) => {
    if (r !== room) return;
    if (state === 'wait') {
      if (isLeader() && members.size + 1 >= MAX_PLAYERS) r.sendTo(id, { t: 'full' });
      else r.sendTo(id, { t: 'hi', k: myLook() });
    } else if (inGame() && isHost()) r.sendTo(id, { t: 'busy' });
  });
  r.on('leave', (id) => {
    if (r !== room) return;
    members.delete(String(id));
    if (peers.delete(String(id))) updateHud();
    drawWait();
  });
  r.on('close', () => { if (r === room) drawWait(); });
  r.on('message', (data, from) => { if (r === room) onRoomMessage(data, String(from)); });
  drawWait();
}

function leaveRoom() {
  if (room) {
    if (lobby && state === 'wait' && isLeader()) lobby.send({ t: 'gone', code: roomCode });
    room.close();
    room = null;
  }
  roomCode = '';
  members.clear();
  peers.clear();
}

function roomRefused(msg) {
  leaveRoom();
  openRooms();
  $('roomNotice').textContent = msg;
}

function onRoomMessage(data, id) {
  if (!data || typeof data !== 'object') return;
  if (data.t === 'hi') {
    if (state === 'wait') { members.set(id, cleanLook(data.k)); drawWait(); }
  } else if (data.t === 'start') {
    if (state === 'wait' && Array.isArray(data.ids)) startTeam(num(data.seed, 1) >>> 0, data.ids.slice(0, MAX_PLAYERS).map(String));
  } else if (data.t === 'out') {
    // Only the room leader may send someone out of the waiting room.
    if (state !== 'wait' || id !== leaderId()) return;
    if (String(data.id) === String(room.id)) {
      banned.add(roomCode);
      roomRefused('Toa juht saatis sind toast välja.');
    } else {
      members.delete(String(data.id));
      drawWait();
    }
  } else if (data.t === 'busy' || data.t === 'full') {
    if (state === 'wait') roomRefused(data.t === 'busy' ? 'Selles toas käib mäng juba.' : 'See tuba on juba täis.');
  } else if (inGame()) onGameMessage(data, id);
}

function onGameMessage(data, id) {
  if (data.t === 'p') {
    const x = clamp(num(data.x, NaN), 0, MW);
    const y = clamp(num(data.y, NaN), 0, MH);
    const a = num(data.a, 0);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    let p = peers.get(id);
    if (!p) {
      p = { look: cleanLook(data.k), x, y, a, nx: x, ny: y, na: a, lives: LIVES, dead: false, walk: 0 };
      peers.set(id, p);
    }
    p.nx = x; p.ny = y; p.na = a;
    p.look = cleanLook(data.k);
    const lv = clamp(Math.floor(num(data.l, LIVES)), 0, LIVES);
    const dd = Boolean(data.d);
    if (lv !== p.lives || dd !== p.dead) { p.lives = lv; p.dead = dd; updateHud(); }
    if (Array.isArray(data.m) && id === hostId()) {
      data.m.forEach((v, i) => {
        const m = monkeys[i];
        if (m && Array.isArray(v)) { m.nx = clamp(num(v[0], m.nx), 0, MW); m.ny = clamp(num(v[1], m.ny), 0, MH); }
      });
    }
  } else if (data.t === 'take') {
    if (Number.isInteger(data.i)) takeItem(data.i, false);
  } else if (data.t === 'hit') {
    const p = peers.get(id);
    if (p && isHost()) relocateNear(p.nx, p.ny);
  }
}

function startTeam(seed, ids) {
  if (lobby && isLeader()) lobby.send({ t: 'gone', code: roomCode });
  closeLobby();
  mode = 'team';
  peers.clear();
  const mine = String(room.id);
  for (const id of ids) {
    if (id !== mine) peers.set(id, { look: members.get(id) || cleanLook(null), x: 0, y: 0, a: 0, nx: 0, ny: 0, na: 0, lives: LIVES, dead: false, walk: 0 });
  }
  beginGame(seed);
  for (const p of peers.values()) { p.x = p.nx = player.x; p.y = p.ny = player.y; p.a = p.na = player.a; }
}

// Every 1.5 s the room leader tells the lobby that the room still has free places.
setInterval(() => {
  if (state === 'wait' && lobby && lobby.connected && room && room.connected && isLeader()) {
    const n = members.size + 1;
    if (n < MAX_PLAYERS) lobby.send({ t: 'ad', code: roomCode, n, c: [me.shirt, ...[...members.values()].map((l) => l.s)] });
    else lobby.send({ t: 'gone', code: roomCode });
  }
  drawRooms();
}, 1500);

// ---------- Menus ----------

const SCREENS = ['start', 'rooms', 'wait', 'shop', 'win', 'over'];
function showScreen(id) {
  for (const s of SCREENS) $(s).hidden = s !== id;
  for (const e of document.querySelectorAll('.walletNum')) e.textContent = me.gems;
}

// ---------- High scores: the most gems one player has collected in one game ----------

const BOARD = 'kivid';
function drawNick() {
  $('nickIn').value = me.nick;
  $('myBest').textContent = me.best;
}

async function showTop() {
  const list = $('topList');
  if (!labApi) { $('topMsg').textContent = 'Edetabel ei tööta praegu.'; return; }
  try {
    const rows = await labApi.topScores(40, { board: BOARD });
    const seen = new Set();
    list.textContent = '';
    for (const r of rows) {
      if (seen.has(r.name) || !okNick(r.name)) continue;
      seen.add(r.name);
      const li = el('li', r.name === me.nick ? 'mine' : '');
      li.append(el('span', '', `${seen.size}. ${r.name}`), el('b', '', `${r.score} 💎`));
      list.append(li);
      if (seen.size >= 10) break;
    }
    $('topMsg').textContent = seen.size ? '' : 'Edetabel on veel tühi. Ole esimene!';
  } catch (e) {
    $('topMsg').textContent = 'Edetabel ei tööta praegu. Proovi hiljem uuesti.';
  }
}

// After each game my result goes to the table, but only when it beats my own best.
function sendScore() {
  if (picked <= me.best) return;
  me.best = picked;
  saveProfile();
  if (labApi) labApi.addScore(me.nick, picked, BOARD).then(showTop, () => {});
}

function goMenu() {
  leaveRoom();
  closeLobby();
  mode = 'solo';
  state = 'menu';
  showPlayUi(false);
  $('spec').hidden = true;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  showScreen('start');
  drawNick();
  showTop();
}

function openRooms() {
  leaveRoom();
  state = 'rooms';
  showScreen('rooms');
  $('roomNotice').textContent = '';
  roomsKey = '?';
  openLobby();
  drawRooms();
}

function drawRooms() {
  if (state !== 'rooms') return;
  const now = performance.now();
  for (const [code, ad] of ads) if (now - ad.t > 4500) ads.delete(code);
  const free = [...ads].filter(([code, ad]) => ad.n < MAX_PLAYERS && !banned.has(code)).sort((a, b) => a[0].localeCompare(b[0]));
  const key = free.map(([code, ad]) => `${code}:${ad.n}:${ad.c.join('')}`).join('|');
  if (key !== roomsKey) {
    roomsKey = key;
    const list = $('roomList');
    list.textContent = '';
    for (const [code, ad] of free) {
      const b = el('button', '', `🚪 Tuba ${code}   ${ad.c.map((s) => SHIRTS[s][1]).join('')}   ${ad.n}/${MAX_PLAYERS}`);
      b.addEventListener('click', () => joinRoom(code));
      const li = el('li');
      li.append(b);
      list.append(li);
    }
  }
  $('roomMsg').textContent = !lobby ? 'Koos mängimine ei tööta praegu. Proovi hiljem uuesti.'
    : !lobby.connected ? 'Otsin tube…'
    : free.length ? '' : 'Vabu tube praegu pole. Loo uus tuba ja kutsu sõbrad!';
}

function avatar(look) {
  const c = makeCanvas(128, 128);
  drawHuman(c.getContext('2d'), look);
  return c;
}

function drawWait() {
  if (state !== 'wait' || !room) return;
  const list = $('waitList');
  list.textContent = '';
  const ok = room.connected;
  const lead = ok && isLeader();
  const all = [[null, myLook(), 'Sina'], ...[...members].map(([id, l]) => [id, l, ''])];
  for (const [id, look, label] of all) {
    const li = el('li');
    li.append(avatar(look), el('span', '', `${SHIRTS[look.s][1]} ${label}`.trim()));
    if (lead && id !== null) {
      const b = el('button', 'kick', '❌ Viska välja');
      b.addEventListener('click', () => kick(id));
      li.append(b);
    }
    list.append(li);
  }
  $('waitCount').textContent = all.length;
  $('goBtn').hidden = !lead;
  $('waitMsg').textContent = !ok ? 'Ühendan…'
    : lead ? (all.length < 2 ? 'Sina oled toa juht. Oota sõpru või alusta kohe!' : 'Kõik valmis? Vajuta Alusta!')
    : 'Ootame, kuni toa juht mängu alustab…';
}

function drawShop() {
  const g = $('lookPreview').getContext('2d');
  g.clearRect(0, 0, 128, 128);
  drawHuman(g, myLook());
  pickRow($('shirtPick'), SHIRTS.map(([, icon]) => icon), me.shirt, (i) => { me.shirt = i; });
  pickRow($('skinPick'), SKINS.map(() => ''), me.skin, (i) => { me.skin = i; }, SKINS);
  // Skin colour is only for people.
  for (const id of ['skinLabel', 'skinPick']) $(id).style.display = me.body === 0 ? '' : 'none';
  const bodyBox = $('bodyItems');
  bodyBox.textContent = '';
  BODIES.forEach((body, i) => {
    const div = el('div', 'item');
    const b = el('button');
    if (body.price && !me.bodies.includes(body.id)) {
      b.textContent = `Osta ${body.price} 💎`;
      b.disabled = me.gems < body.price;
      b.addEventListener('click', () => buyBody(i));
    } else if (me.body === i) {
      b.textContent = 'Valitud';
      b.className = 'wearing';
    } else {
      b.textContent = 'Vali';
      b.addEventListener('click', () => { me.body = i; saveProfile(); drawShop(); });
    }
    div.append(el('span', 'icon', body.icon), el('span', '', body.name), b);
    bodyBox.append(div);
  });
  const box = $('shopItems');
  box.textContent = '';
  for (const item of SHOP) {
    const div = el('div', 'item');
    const b = el('button');
    if (!me.owned.includes(item.id)) {
      b.textContent = `Osta ${item.price} 💎`;
      b.disabled = me.gems < item.price;
      b.addEventListener('click', () => buy(item));
    } else if (me.wear.includes(item.id)) {
      b.textContent = 'Võta ära';
      b.className = 'wearing';
      b.addEventListener('click', () => wear(item, false));
    } else {
      b.textContent = 'Pane selga';
      b.addEventListener('click', () => wear(item, true));
    }
    div.append(el('span', 'icon', item.icon), el('span', '', item.name), b);
    box.append(div);
  }
  for (const e of document.querySelectorAll('.walletNum')) e.textContent = me.gems;
}

function pickRow(box, labels, current, set, colors) {
  box.textContent = '';
  labels.forEach((label, i) => {
    const b = el('button', i === current ? 'on' : '', label);
    if (colors) b.style.background = colors[i];
    b.addEventListener('click', () => { set(i); saveProfile(); drawShop(); });
    box.append(b);
  });
}

// Only one thing per body part: a new hat replaces the old one.
function wear(item, on) {
  me.wear = me.wear.filter((id) => SHOP.find((s) => s.id === id).slot !== item.slot);
  if (on) me.wear.push(item.id);
  saveProfile();
  drawShop();
}

function buyBody(i) {
  const body = BODIES[i];
  if (me.gems < body.price || me.bodies.includes(body.id)) return;
  initAudio();
  me.gems -= body.price;
  me.bodies.push(body.id);
  me.body = i;
  sfx.ball();
  saveProfile();
  drawShop();
}

function buy(item) {
  if (me.gems < item.price || me.owned.includes(item.id)) return;
  initAudio();
  me.gems -= item.price;
  me.owned.push(item.id);
  sfx.ball();
  wear(item, true);
}

// ---------- Input and main loop ----------

const KEYMAP = { KeyW: 'up', ArrowUp: 'up', KeyS: 'down', ArrowDown: 'down', KeyA: 'sleft', ArrowLeft: 'left', KeyD: 'sright', ArrowRight: 'right' };
window.addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLInputElement) return; // typing a nickname
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
  if (!finePointer || state !== 'play' || !canvas.requestPointerLock) return;
  try {
    const r = canvas.requestPointerLock();
    if (r && r.catch) r.catch(() => {});
  } catch (e) { /* needs a click first */ }
}
function updateHint() {
  $('hint').hidden = !(finePointer && state === 'play' && document.pointerLockElement !== canvas);
}
canvas.addEventListener('click', () => { if (state === 'spec') nextSpec(); else lockMouse(); });
document.addEventListener('pointerlockchange', updateHint);
document.addEventListener('mousemove', (e) => {
  if (document.pointerLockElement === canvas && state === 'play') {
    player.a += e.movementX * 0.0025;
    player.p = clamp(player.p - e.movementY * 0.003, -1, 1);
  }
});

// Touch: drag a finger across the picture to look around, up and down.
let touchId = null;
let touchX = 0;
let touchY = 0;
canvas.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'touch' || touchId !== null) return;
  touchId = e.pointerId;
  touchX = e.clientX;
  touchY = e.clientY;
  initAudio();
});
canvas.addEventListener('pointermove', (e) => {
  if (e.pointerId !== touchId) return;
  if (state === 'play') {
    player.a += (e.clientX - touchX) * 0.008;
    player.p = clamp(player.p - (e.clientY - touchY) * 0.006, -1, 1);
  }
  touchX = e.clientX;
  touchY = e.clientY;
});
for (const ev of ['pointerup', 'pointercancel']) {
  canvas.addEventListener(ev, (e) => { if (e.pointerId === touchId) touchId = null; });
}

function beginGame(seed) {
  initAudio();
  showScreen(null);
  $('spec').hidden = true;
  wasHost = false;
  netT = 0;
  newGame(seed);
  showPlayUi(true);
  lockMouse();
}

function startSolo() {
  leaveRoom();
  closeLobby();
  mode = 'solo';
  beginGame((Math.random() * 4294967296) >>> 0);
}

$('startBtn').addEventListener('click', startSolo);
$('winBtn').addEventListener('click', startSolo);
$('overBtn').addEventListener('click', startSolo);
$('winMenu').addEventListener('click', goMenu);
$('overMenu').addEventListener('click', goMenu);
$('teamBtn').addEventListener('click', () => { initAudio(); openRooms(); });
$('roomsBack').addEventListener('click', goMenu);
$('createBtn').addEventListener('click', () => {
  if (labApi) joinRoom(String(1000 + Math.floor(Math.random() * 9000)));
});
$('waitBack').addEventListener('click', openRooms);
$('goBtn').addEventListener('click', () => {
  if (state !== 'wait' || !room || !room.connected || !isLeader()) return;
  const seed = (Math.random() * 4294967296) >>> 0;
  const ids = [String(room.id), ...members.keys()];
  room.send({ t: 'start', seed, ids });
  startTeam(seed, ids);
});
$('shopBtn').addEventListener('click', () => { state = 'shop'; showScreen('shop'); drawShop(); });
$('shopBack').addEventListener('click', goMenu);
function setNick(name) {
  me.nick = name;
  me.best = 0; // a new name starts its own score
  saveProfile();
  drawNick();
  showTop();
}
$('nickBtn').addEventListener('click', () => setNick(newNick()));
// A typed nickname is kept when I press Enter or leave the box.
$('nickIn').addEventListener('change', () => {
  const v = $('nickIn').value.replace(/\s+/g, ' ').trim();
  if (v === me.nick) { drawNick(); return; }
  if (!okNick(v)) {
    $('topMsg').textContent = 'Nimes võivad olla tähed, tühikud ja kuni 3 numbrit (2–14 märki).';
    drawNick();
    return;
  }
  setNick(v);
});
$('nickIn').addEventListener('keydown', (e) => { if (e.key === 'Enter') e.target.blur(); });

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (inGame() && (mode === 'team' || state === 'play')) world(dt);
  if (state === 'play') {
    update(dt);
    if (state === 'play') render(player);
  } else if (state === 'scare') {
    scareT += dt;
    drawScare(scareT);
    if (scareT >= scareEnd()) afterScare();
  } else if (state === 'over' || state === 'lost') {
    drawOver(dt);
  } else if (state === 'spec') {
    spectate();
  }
  requestAnimationFrame(frame);
}

resize();
window.addEventListener('resize', resize);
showScreen('start');
drawNick();
showTop();
requestAnimationFrame(frame);
