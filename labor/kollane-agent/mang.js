'use strict';
// Kollane agent: a very hard top-down horror game.
// An agent in a yellow hazmat suit sneaks through a dark facility, finds keycards L1–L6,
// plants charges at four targets and runs back out before everything blows up.
// Every jumpscare costs one nerve; with no nerves left the agent's single life is gone.

const cv = document.getElementById('mang');
const ctx = cv.getContext('2d');
const dk = document.createElement('canvas'); // the darkness layer
const dctx = dk.getContext('2d');
const $ = (id) => document.getElementById(id);
const rand = (n) => Math.floor(Math.random() * n);

// ---------- Facility map ----------
// Nine rooms in a 3×3 grid; each room is RW×RH floor tiles with walls between them.
const RW = 11, RH = 8, COLS = 3, ROWS = 3;
const W = COLS * (RW + 1) + 1, H = ROWS * (RH + 1) + 1;
const WALL = 1, FLOOR = 0;
const CARD_COLORS = ['#2ecc40', '#3fa9ff', '#ffdc00', '#ff851b', '#d65cff', '#ff4136'];
const ROOMS = { A: [0, 0], B: [0, 1], C: [0, 2], D: [1, 0], E: [1, 1], F: [1, 2], G: [2, 0], H: [2, 1], I: [2, 2] };
// Doors between rooms: 0 is always open, 1–6 needs that keycard.
const DOORS = [['A', 'B', 1], ['B', 'C', 2], ['C', 'F', 3], ['F', 'E', 4], ['E', 'D', 5], ['D', 'G', 0], ['G', 'H', 0], ['H', 'I', 6]];
const PILLARS = [[2, 2], [8, 2], [2, 5], [8, 5]];

const roomX = (c) => 1 + c * (RW + 1);
const roomY = (r) => 1 + r * (RH + 1);
const at = (room, x, y) => { const [r, c] = ROOMS[room]; return { x: roomX(c) + x + 0.5, y: roomY(r) + y + 0.5 }; };

const grid = new Uint8Array(W * H).fill(WALL);
const doorAt = new Int8Array(W * H).fill(-1);
const doorList = [];
for (const [r, c] of Object.values(ROOMS)) {
  for (let y = 0; y < RH; y++) for (let x = 0; x < RW; x++) grid[(roomY(r) + y) * W + roomX(c) + x] = FLOOR;
  for (const [x, y] of PILLARS) grid[(roomY(r) + y) * W + roomX(c) + x] = WALL;
}
for (const [a, b, lvl] of DOORS) {
  const [r1, c1] = ROOMS[a], [r2, c2] = ROOMS[b];
  const cells = r1 === r2
    ? [3, 4].map((k) => [roomX(Math.max(c1, c2)) - 1, roomY(r1) + k])
    : [4, 5, 6].map((k) => [roomX(c1) + k, roomY(Math.max(r1, r2)) - 1]);
  for (const [x, y] of cells) {
    grid[y * W + x] = FLOOR;
    doorAt[y * W + x] = lvl;
    doorList.push({ x, y, lvl });
  }
}

const START = at('A', 1, 3);
const CARD_POS = [at('A', 10, 0), at('B', 10, 7), at('C', 10, 0), at('F', 0, 7), at('E', 1, 7), at('H', 10, 7)];
const TARGET_DEFS = [
  { name: 'Reaktor', kind: 'pomm', icon: '💣', ...at('B', 5, 1) },
  { name: 'Kemikaalihoidla', kind: 'keemiline aine', icon: '🧪', ...at('F', 5, 4) },
  { name: 'Serveriruum', kind: 'pomm', icon: '💣', ...at('D', 5, 1) },
  { name: 'Tuum', kind: 'superpomm', icon: '☢️', ...at('I', 5, 3) },
];
const HOMES = [at('B', 10, 0), at('C', 1, 7), at('F', 10, 7), at('E', 9, 1), at('D', 1, 1),
  at('G', 5, 4), at('G', 1, 7), at('H', 5, 1), at('I', 1, 1), at('I', 10, 7)];
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

const PLAYER_SPEED = 3.7, CHASE_SPEED = 3.35, WANDER_SPEED = 1.3, AMB_SPEED = 4.4;
const NERVES = 3, EVAC_TIME = 75, PLANT_TIME = 2.5, SCARE_TIME = 1.6;

function blocked(x, y) {
  const tx = Math.floor(x), ty = Math.floor(y);
  if (tx < 0 || ty < 0 || tx >= W || ty >= H) return true;
  const i = ty * W + tx;
  if (grid[i] === WALL) return true;
  const d = doorAt[i];
  return d > 0 && !cards[d - 1];
}
const hits = (x, y, r) => blocked(x - r, y - r) || blocked(x + r, y - r) || blocked(x - r, y + r) || blocked(x + r, y + r);
function move(o, dx, dy) {
  if (!hits(o.x + dx, o.y, o.r)) o.x += dx;
  if (!hits(o.x, o.y + dy, o.r)) o.y += dy;
}
function los(x0, y0, x1, y1) {
  const dx = x1 - x0, dy = y1 - y0, n = Math.ceil(Math.hypot(dx, dy) * 4);
  for (let k = 1; k < n; k++) if (blocked(x0 + dx * k / n, y0 + dy * k / n)) return false;
  return true;
}
const angDiff = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
const tileOf = (o) => Math.floor(o.y) * W + Math.floor(o.x);

// Distance (in steps) from every tile to the player, through open doors only. Monsters follow it downhill.
const dist = new Int16Array(W * H);
const queue = new Int32Array(W * H);
function buildField() {
  dist.fill(-1);
  const s = tileOf(player);
  dist[s] = 0;
  let head = 0, tail = 0;
  queue[tail++] = s;
  while (head < tail) {
    const i = queue[head++], x = i % W, y = (i / W) | 0;
    for (const [ox, oy] of DIRS) {
      const nx = x + ox, ny = y + oy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const j = ny * W + nx;
      if (dist[j] >= 0 || blocked(nx + 0.5, ny + 0.5)) continue;
      dist[j] = dist[i] + 1;
      queue[tail++] = j;
    }
  }
}

// ---------- Sound (Web Audio, started by the first tap) ----------
let ac = null, master = null, noiseBuf = null;
function initAudio() {
  if (ac) { ac.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ac = new AC();
  master = ac.createGain();
  master.gain.value = 0.7;
  master.connect(ac.destination);
  // A low, uneasy hum that never stops.
  const lp = ac.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 170;
  const g = ac.createGain(); g.gain.value = 0.07;
  for (const f of [49, 51.7]) { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.connect(lp); o.start(); }
  lp.connect(g); g.connect(master);
}
function tone(f, dur, type = 'square', vol = 0.2, f2 = 0, delay = 0) {
  if (!ac) return;
  const t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t + dur + 0.05);
}
function noise(dur, vol, ftype = 'lowpass', freq = 1000, attack = 0.01, delay = 0) {
  if (!ac) return;
  if (!noiseBuf) {
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = ac.currentTime + delay, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = noiseBuf; s.loop = true;
  f.type = ftype; f.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(master);
  s.start(t); s.stop(t + dur + 0.05);
}
const sfx = {
  access() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.12, 'square', 0.12, 0, i * 0.1)); },
  pickup() { tone(660, 0.1, 'square', 0.15); tone(990, 0.18, 'square', 0.15, 0, 0.1); },
  tick() { tone(1300, 0.04, 'square', 0.05); },
  planted() { tone(220, 0.35, 'sawtooth', 0.18, 110); tone(880, 0.2, 'square', 0.1, 0, 0.3); },
  alarm() { for (let i = 0; i < 8; i++) tone(i % 2 ? 620 : 820, 0.24, 'square', 0.13, 0, i * 0.25); },
  heart() { tone(62, 0.14, 'sine', 0.6, 40); tone(56, 0.14, 'sine', 0.45, 36, 0.17); },
  step() { noise(0.06, 0.05, 'lowpass', 500); },
  whisper() { noise(0.9, 0.3, 'bandpass', 2600, 0.5); tone(90, 0.9, 'sine', 0.2, 60); },
  shriek() { tone(1500, 0.45, 'sawtooth', 0.12, 500); noise(0.35, 0.25, 'highpass', 3000); },
  scream() {
    noise(1.4, 0.9, 'lowpass', 6000);
    for (const f of [180, 233, 311, 415, 555]) tone(f, 1.4, 'sawtooth', 0.17, f * 0.45);
    tone(1900, 0.9, 'square', 0.08, 800);
  },
  boom() { noise(2.8, 1, 'lowpass', 320); tone(80, 2.4, 'sine', 0.7, 25); },
  win() { [392, 523, 659, 784, 1046].forEach((f, i) => tone(f, 0.25, 'triangle', 0.18, 0, 0.9 + i * 0.13)); },
};

// ---------- Input ----------
const keys = new Set();
addEventListener('keydown', (e) => {
  keys.add(e.key.toLowerCase());
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) e.preventDefault();
});
addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
addEventListener('blur', () => keys.clear());

// Drag anywhere on the game to steer, like an invisible joystick.
let joy = null;
cv.addEventListener('pointerdown', (e) => {
  joy = { id: e.pointerId, ox: e.clientX, oy: e.clientY, x: e.clientX, y: e.clientY };
  cv.setPointerCapture(e.pointerId);
});
cv.addEventListener('pointermove', (e) => { if (joy && e.pointerId === joy.id) { joy.x = e.clientX; joy.y = e.clientY; } });
const endJoy = (e) => { if (joy && e.pointerId === joy.id) joy = null; };
cv.addEventListener('pointerup', endJoy);
cv.addEventListener('pointercancel', endJoy);

// ---------- Screen size ----------
let vw = 0, vh = 0, dpr = 1, TS = 40;
function resize() {
  dpr = Math.min(2, window.devicePixelRatio || 1);
  vw = cv.clientWidth; vh = cv.clientHeight;
  cv.width = dk.width = Math.max(1, Math.round(vw * dpr));
  cv.height = dk.height = Math.max(1, Math.round(vh * dpr));
  TS = Math.max(26, Math.min(56, Math.round(Math.min(vw, vh) / 10)));
}
addEventListener('resize', resize);
resize();

// ---------- Game state ----------
let state = 'menu'; // menu, access, play, scare, over, win
let player, cards, cardItems, targets, monsters, amb;
let nerves, scares, timeT, evac, msg = '', msgT = 0, invuln, light, flick, flickT;
let scareT = 0, scareBy = null, accessT = 0, lastTile = -1, hbT = 0, stepT = 0, tickT = 0, warned;
let now = 0;

function say(text, t = 4) { msg = text; msgT = t; }

function newGame() {
  player = { x: START.x, y: START.y, r: 0.3, a: 0, moving: false };
  cards = [false, false, false, false, false, false];
  cardItems = CARD_POS.map((p, i) => ({ ...p, lvl: i + 1, taken: false }));
  targets = TARGET_DEFS.map((t) => ({ ...t, prog: 0, done: false }));
  monsters = HOMES.map((h) => ({ x: h.x, y: h.y, hx: h.x, hy: h.y, r: 0.32, dir: rand(4), turnT: 1, chase: false, gone: 0, seed: Math.random() * 10 }));
  amb = { st: 'off', t: 22, x: 0, y: 0, r: 0.3 };
  nerves = NERVES; scares = 0; timeT = 0; evac = -1; invuln = 2; light = 1; flick = 0; flickT = 4;
  lastTile = -1; warned = new Set();
  say('Leia läbipääsukaart L1. Pimedas on keegi...', 6);
}

function show(id) {
  for (const s of ['menyy', 'ligipaas', 'labi', 'voit']) $(s).classList.toggle('peidus', s !== id);
}

function startRun() {
  initAudio();
  newGame();
  sfx.access();
  show('ligipaas');
  state = 'access';
  accessT = 2.2;
}
$('sisene').addEventListener('click', startRun);
for (const b of document.querySelectorAll('.uuesti')) b.addEventListener('click', startRun);

const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const BEST_KEY = 'kollane-agent-parim';
function showBest() {
  const b = Number(localStorage.getItem(BEST_KEY));
  $('parim').textContent = b ? `Sinu parim aeg: ${fmtTime(b)}` : '';
}
showBest();

function summary() {
  return `Kaarte leitud: ${cards.filter(Boolean).length}/6\nLaenguid paigas: ${targets.filter((t) => t.done).length}/4\nÄkkhirmutusi: ${scares}\nAeg rajatises: ${fmtTime(timeT)}`;
}
function endGame(reason) {
  state = 'over';
  if (reason === 'boom') sfx.boom();
  const why = reason === 'boom' ? 'Rajatis plahvatas, agent oli veel sees.' : 'Närvid otsas. Elu on läinud.';
  $('labiInfo').textContent = `${why}\n\n${summary()}`;
  show('labi');
}
function winGame() {
  state = 'win';
  sfx.boom(); sfx.win();
  const best = Number(localStorage.getItem(BEST_KEY));
  let extra = '';
  if (!best || timeT < best) { localStorage.setItem(BEST_KEY, String(Math.floor(timeT))); extra = '\nUUS REKORD!'; }
  $('voitInfo').textContent = `Rajatis on hävitatud!\n\n${summary()}\nNärve alles: ${nerves}/${NERVES}${extra}`;
  showBest();
  show('voit');
}

function startScare(who) {
  state = 'scare';
  scareT = 0;
  scareBy = who;
  scares++;
  joy = null;
  sfx.scream();
  if (navigator.vibrate) navigator.vibrate([300, 80, 300]);
}
function updateScare(dt) {
  scareT += dt;
  if (scareT < SCARE_TIME) return;
  nerves--;
  if (scareBy === amb) ambOff();
  else { scareBy.x = scareBy.hx; scareBy.y = scareBy.hy; scareBy.chase = false; scareBy.gone = 7; }
  if (nerves <= 0) { endGame('scare'); return; }
  invuln = 2.5;
  say(nerves === 1 ? 'VIIMANE NÄRV! Veel üks ja kõik...' : `Närv läks! Närve alles: ${nerves}`, 4);
  state = 'play';
}

// The thing that comes out of nowhere: it appears in the dark behind the agent and rushes in.
function ambOff() { amb.st = 'off'; amb.t = (evac >= 0 ? 8 : 15) + Math.random() * 14; }
function spawnAmb() {
  const any = [], behind = [];
  for (let i = 0; i < W * H; i++) {
    const d = dist[i];
    if (d < 4 || d > 6) continue;
    const x = (i % W) + 0.5, y = ((i / W) | 0) + 0.5;
    any.push([x, y]);
    if (angDiff(Math.atan2(y - player.y, x - player.x), player.a) > 1.3) behind.push([x, y]);
  }
  const list = behind.length ? behind : any;
  if (!list.length) { amb.t = 3; return; }
  [amb.x, amb.y] = list[rand(list.length)];
  amb.st = 'coming';
  amb.t = 0.9;
  sfx.whisper();
}
function updateAmb(dt) {
  amb.t -= dt;
  if (amb.st === 'off') { if (amb.t <= 0) spawnAmb(); }
  else if (amb.st === 'coming') { if (amb.t <= 0) { amb.st = 'rush'; amb.t = 2.6; sfx.shriek(); } }
  else if (amb.st === 'rush') { stepToward(amb, AMB_SPEED, dt); if (amb.t <= 0) ambOff(); }
}

function stepToward(m, speed, dt) {
  const tx = Math.floor(m.x), ty = Math.floor(m.y), d = dist[ty * W + tx];
  if (d < 0) return;
  let gx = player.x, gy = player.y;
  if (d > 0) {
    for (const [ox, oy] of DIRS) {
      if (dist[(ty + oy) * W + tx + ox] === d - 1) { gx = tx + ox + 0.5; gy = ty + oy + 0.5; break; }
    }
  }
  const dx = gx - m.x, dy = gy - m.y, l = Math.hypot(dx, dy) || 1;
  move(m, dx / l * speed * dt, dy / l * speed * dt);
}
function wander(m, dt) {
  m.turnT -= dt;
  if (m.turnT <= 0) { m.dir = rand(4); m.turnT = 1 + Math.random() * 2.5; }
  const [ox, oy] = DIRS[m.dir], bx = m.x, by = m.y;
  move(m, ox * WANDER_SPEED * dt, oy * WANDER_SPEED * dt);
  if (Math.abs(m.x - bx) + Math.abs(m.y - by) < 0.0005) m.turnT = 0;
}

function update(dt) {
  timeT += dt;
  msgT -= dt;
  invuln -= dt;

  // Move the agent.
  let ix = 0, iy = 0;
  if (keys.has('arrowleft') || keys.has('a')) ix--;
  if (keys.has('arrowright') || keys.has('d')) ix++;
  if (keys.has('arrowup') || keys.has('w')) iy--;
  if (keys.has('arrowdown') || keys.has('s')) iy++;
  if (joy) { ix += (joy.x - joy.ox) / 40; iy += (joy.y - joy.oy) / 40; }
  const l = Math.hypot(ix, iy);
  if (l > 1) { ix /= l; iy /= l; }
  player.moving = l > 0.15;
  if (player.moving) {
    player.a = Math.atan2(iy, ix);
    move(player, ix * PLAYER_SPEED * dt, iy * PLAYER_SPEED * dt);
    stepT -= dt;
    if (stepT <= 0) { sfx.step(); stepT = 0.32; }
  }

  const ti = tileOf(player);
  if (ti !== lastTile) {
    lastTile = ti;
    buildField();
    // Tell the agent which card a locked door next to them needs.
    const x = ti % W, y = (ti / W) | 0;
    for (const [ox, oy] of DIRS) {
      const d = doorAt[(y + oy) * W + x + ox];
      if (d > 0 && !cards[d - 1] && !warned.has(d)) { warned.add(d); say(`Uks L${d} on lukus. Otsi kaarti L${d}.`); }
    }
  }

  for (const c of cardItems) {
    if (c.taken || Math.hypot(c.x - player.x, c.y - player.y) > 0.7) continue;
    c.taken = true;
    cards[c.lvl - 1] = true;
    lastTile = -1;
    sfx.pickup();
    say(`Kaart L${c.lvl} käes! Uks L${c.lvl} on nüüd lahti.`);
  }

  for (const t of targets) {
    if (t.done || Math.hypot(t.x - player.x, t.y - player.y) > 1.0) continue;
    t.prog += dt / PLANT_TIME;
    tickT -= dt;
    if (tickT <= 0) { sfx.tick(); tickT = 0.18; }
    say(`${t.name}: paigaldan (${t.kind}) ${Math.min(99, Math.floor(t.prog * 100))}%`, 0.5);
    if (t.prog >= 1) {
      t.done = true;
      sfx.planted();
      const left = targets.filter((x) => !x.done).length;
      if (left) say(`${t.name}: ${t.kind} paigas! Veel ${left} sihtmärki.`);
      else {
        evac = EVAC_TIME;
        sfx.alarm();
        say('KÕIK LAENGUD PAIGAS! Jookse tagasi VÄLJAPÄÄSU juurde!', 8);
        ambOff();
      }
    }
  }

  if (evac >= 0) {
    evac -= dt;
    if (Math.hypot(START.x - player.x, START.y - player.y) < 1.0) { winGame(); return; }
    if (evac <= 0) { evac = 0; endGame('boom'); return; }
  }

  // The flashlight flickers now and then.
  flickT -= dt;
  if (flickT <= 0) { flickT = 2 + Math.random() * 6; flick = 0.15 + Math.random() * 0.6; }
  if (flick > 0) { flick -= dt; light = Math.random() < 0.5 ? 0.25 : 0.6; } else light = 1;

  let near = 99;
  for (const m of monsters) {
    if (m.gone > 0) { m.gone -= dt; continue; }
    const d = dist[tileOf(m)];
    if (d >= 0 && d <= 9 && los(m.x, m.y, player.x, player.y)) m.chase = true;
    else if (m.chase && (d < 0 || d > 14)) m.chase = false;
    if (m.chase) { stepToward(m, CHASE_SPEED, dt); near = Math.min(near, d); } else wander(m, dt);
    if (invuln <= 0 && Math.hypot(m.x - player.x, m.y - player.y) < 0.62) { startScare(m); return; }
  }
  updateAmb(dt);
  if (amb.st !== 'off') { const d = dist[tileOf(amb)]; if (d >= 0) near = Math.min(near, d); }
  if (amb.st === 'rush' && invuln <= 0 && Math.hypot(amb.x - player.x, amb.y - player.y) < 0.62) { startScare(amb); return; }

  hbT -= dt;
  if (near <= 7 && hbT <= 0) { sfx.heart(); hbT = 0.32 + near * 0.08; }
}

// ---------- Drawing ----------
function drawAgent(x, y) {
  const s = TS;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(player.a);
  if (invuln > 0 && Math.floor(now * 10) % 2) ctx.globalAlpha = 0.45;
  ctx.fillStyle = '#8a8f99'; // air tank
  ctx.fillRect(-s * 0.44, -s * 0.15, s * 0.2, s * 0.3);
  ctx.fillStyle = '#ffd400'; // yellow hazmat suit
  ctx.beginPath(); ctx.arc(0, 0, s * 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#a68a00'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#1b2b3a'; // visor
  ctx.beginPath(); ctx.ellipse(s * 0.13, 0, s * 0.1, s * 0.19, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(150, 220, 255, 0.7)';
  ctx.beginPath(); ctx.ellipse(s * 0.16, -s * 0.07, s * 0.03, s * 0.05, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#333'; // flashlight
  ctx.fillRect(s * 0.2, s * 0.15, s * 0.2, s * 0.08);
  ctx.restore();
}

function drawMonster(x, y, seed, alpha) {
  const s = TS;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#3b2f45'; ctx.lineWidth = s * 0.07; ctx.lineCap = 'round';
  for (let k = 0; k < 5; k++) { // long twitchy arms
    const a = k / 5 * Math.PI * 2 + Math.sin(now * 3 + seed + k) * 0.4;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * s * 0.62, Math.sin(a) * s * 0.62); ctx.stroke();
  }
  ctx.fillStyle = '#3b2f45';
  ctx.beginPath();
  for (let k = 0; k < 14; k++) {
    const a = k / 14 * Math.PI * 2, rr = s * (0.32 + 0.07 * Math.sin(now * 7 + k * 2.3 + seed));
    if (k) ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); else ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath(); ctx.fill();
  for (const [ex, ey, er] of [[-0.12, -0.08, 0.08], [0.1, -0.1, 0.06], [0.02, 0.1, 0.07]]) {
    ctx.fillStyle = '#f2f2e6';
    ctx.beginPath(); ctx.arc(ex * s, ey * s, er * s, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c00';
    ctx.beginPath(); ctx.arc(ex * s, ey * s, er * s * 0.35, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawShadowThing(x, y, alpha) {
  const s = TS;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#050505';
  ctx.beginPath(); ctx.ellipse(0, 0, s * 0.34, s * 0.46, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(-s * 0.12, -s * 0.12, s * 0.09, 0, Math.PI * 2); ctx.arc(s * 0.12, -s * 0.12, s * 0.09, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, s * 0.05, s * 0.16, 0.2, Math.PI - 0.2); ctx.stroke();
  ctx.restore();
}

function glowDot(x, y, r, color, alpha) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.shadowColor = color; ctx.shadowBlur = r * 3;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0; ctx.globalAlpha = 1;
}

function draw() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, vw, vh);
  const camX = player.x * TS - vw / 2, camY = player.y * TS - vh / 2;
  ctx.save();
  ctx.translate(-camX, -camY);

  const x0 = Math.max(0, Math.floor(camX / TS) - 1), x1 = Math.min(W - 1, Math.ceil((camX + vw) / TS) + 1);
  const y0 = Math.max(0, Math.floor(camY / TS) - 1), y1 = Math.min(H - 1, Math.ceil((camY + vh) / TS) + 1);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const i = y * W + x, px = x * TS, py = y * TS;
    if (grid[i] === WALL) {
      ctx.fillStyle = '#4a4f5c'; ctx.fillRect(px, py, TS, TS);
      ctx.fillStyle = '#5f6677'; ctx.fillRect(px, py, TS, TS * 0.18);
    } else {
      ctx.fillStyle = (x + y) % 2 ? '#25332c' : '#202c26';
      ctx.fillRect(px, py, TS, TS);
    }
  }
  // Doors
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `bold ${Math.round(TS * 0.36)}px monospace`;
  for (const d of doorList) {
    if (d.lvl === 0) continue;
    const px = d.x * TS, py = d.y * TS, col = CARD_COLORS[d.lvl - 1];
    if (cards[d.lvl - 1]) {
      ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.strokeRect(px + 2, py + 2, TS - 4, TS - 4);
    } else {
      ctx.fillStyle = '#111'; ctx.fillRect(px, py, TS, TS);
      ctx.fillStyle = col; ctx.fillRect(px + 3, py + 3, TS - 6, TS - 6);
      ctx.fillStyle = '#000'; ctx.fillText(`L${d.lvl}`, px + TS / 2, py + TS / 2 + 1);
    }
  }
  // Exit hatch
  const ex = START.x * TS, ey = START.y * TS;
  ctx.fillStyle = evac >= 0 ? '#1f8f3a' : '#3a3a20';
  ctx.fillRect(ex - TS * 0.45, ey - TS * 0.45, TS * 0.9, TS * 0.9);
  ctx.fillStyle = evac >= 0 ? '#bfffcf' : '#ffd400';
  ctx.font = `bold ${Math.round(TS * 0.24)}px monospace`;
  ctx.fillText('VÄLJA', ex, ey);
  // Targets
  for (const t of targets) {
    const tx = t.x * TS, ty = t.y * TS;
    ctx.fillStyle = '#3d3d3d';
    ctx.beginPath(); ctx.arc(tx, ty, TS * 0.42, 0, Math.PI * 2); ctx.fill();
    ctx.font = `${Math.round(TS * 0.45)}px sans-serif`;
    ctx.fillText(t.icon, tx, ty + 2);
    if (!t.done && t.prog > 0) {
      ctx.strokeStyle = '#ffd400'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(tx, ty, TS * 0.55, -Math.PI / 2, -Math.PI / 2 + t.prog * Math.PI * 2); ctx.stroke();
    }
  }
  // Keycards
  ctx.font = `bold ${Math.round(TS * 0.26)}px monospace`;
  for (const c of cardItems) {
    if (c.taken) continue;
    const cx = c.x * TS, cy = c.y * TS + Math.sin(now * 3 + c.lvl) * 3;
    ctx.fillStyle = CARD_COLORS[c.lvl - 1];
    ctx.fillRect(cx - TS * 0.28, cy - TS * 0.18, TS * 0.56, TS * 0.36);
    ctx.fillStyle = '#000';
    ctx.fillText(`L${c.lvl}`, cx, cy + 1);
  }
  // Monsters
  for (const m of monsters) if (m.gone <= 0) drawMonster(m.x * TS, m.y * TS, m.seed, 1);
  if (amb.st === 'coming') drawShadowThing(amb.x * TS, amb.y * TS, 1 - amb.t / 0.9);
  if (amb.st === 'rush') drawShadowThing(amb.x * TS, amb.y * TS, 1);
  drawAgent(player.x * TS, player.y * TS);
  ctx.restore();

  // Darkness with the flashlight cut out of it.
  const px = player.x * TS - camX, py = player.y * TS - camY;
  dctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  dctx.globalCompositeOperation = 'source-over';
  dctx.fillStyle = 'rgba(0, 0, 0, 0.97)';
  dctx.fillRect(0, 0, vw, vh);
  dctx.globalCompositeOperation = 'destination-out';
  const r0 = TS * 1.8 * light;
  let g = dctx.createRadialGradient(px, py, 0, px, py, r0);
  g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  dctx.fillStyle = g;
  dctx.beginPath(); dctx.arc(px, py, r0, 0, Math.PI * 2); dctx.fill();
  const L = TS * 6.5 * light;
  g = dctx.createRadialGradient(px, py, TS * 0.3, px, py, L);
  g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.7, 'rgba(0,0,0,0.85)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  dctx.fillStyle = g;
  dctx.beginPath(); dctx.moveTo(px, py); dctx.arc(px, py, L, player.a - 0.5, player.a + 0.5); dctx.closePath(); dctx.fill();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(dk, 0, 0);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Things that glow in the dark: hunting eyes, planted charges, faint keycards, the exit.
  const sx = (x) => x * TS - camX, sy = (y) => y * TS - camY;
  for (const m of monsters) {
    if (m.gone > 0 || !m.chase) continue;
    glowDot(sx(m.x) - TS * 0.1, sy(m.y) - TS * 0.08, TS * 0.05, '#ff2020', 0.9);
    glowDot(sx(m.x) + TS * 0.1, sy(m.y) - TS * 0.1, TS * 0.04, '#ff2020', 0.9);
  }
  if (amb.st !== 'off') {
    const a = amb.st === 'coming' ? 1 - amb.t / 0.9 : 1;
    glowDot(sx(amb.x) - TS * 0.12, sy(amb.y) - TS * 0.12, TS * 0.07, '#ffffff', a);
    glowDot(sx(amb.x) + TS * 0.12, sy(amb.y) - TS * 0.12, TS * 0.07, '#ffffff', a);
  }
  for (const t of targets) if (t.done && Math.floor(now * 3) % 2) glowDot(sx(t.x), sy(t.y) - TS * 0.3, TS * 0.08, '#ff3030', 1);
  for (const c of cardItems) if (!c.taken) glowDot(sx(c.x), sy(c.y), TS * 0.05, CARD_COLORS[c.lvl - 1], 0.35);
  if (evac >= 0) {
    glowDot(sx(START.x), sy(START.y), TS * 0.15, '#3dff6e', 0.6 + 0.4 * Math.sin(now * 8));
    ctx.fillStyle = `rgba(255, 0, 0, ${0.08 + 0.08 * Math.sin(now * 6)})`;
    ctx.fillRect(0, 0, vw, vh);
  }
  if (joy) {
    ctx.strokeStyle = 'rgba(255, 212, 0, 0.5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(joy.ox, joy.oy - cv.getBoundingClientRect().top, 40, 0, Math.PI * 2); ctx.stroke();
  }
}

// The jumpscare: a pale face with too many eyes fills the screen.
function drawScare(t) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = Math.random() < 0.3 ? '#300' : '#000';
  ctx.fillRect(0, 0, vw, vh);
  const k = Math.min(t / 0.15, 1);
  const sc = (0.2 + 0.95 * k) * Math.min(vw, vh) / 420;
  const shake = 28 * Math.max(0.3, 1 - t / SCARE_TIME);
  ctx.save();
  ctx.translate(vw / 2 + (Math.random() - 0.5) * shake, vh / 2 + (Math.random() - 0.5) * shake);
  ctx.scale(sc, sc);
  ctx.rotate(Math.sin(t * 40) * 0.04);
  ctx.fillStyle = '#c9ccb4';
  ctx.beginPath(); ctx.ellipse(0, 0, 175, 215, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(70, 80, 55, 0.5)';
  ctx.beginPath(); ctx.ellipse(-95, 40, 45, 80, 0.3, 0, Math.PI * 2); ctx.ellipse(95, 40, 45, 80, -0.3, 0, Math.PI * 2); ctx.fill();
  const eyes = [[-80, -90, 34], [70, -100, 40], [0, -150, 22], [-125, -20, 18], [125, -30, 20]];
  for (const [ex, ey, er] of eyes) {
    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(ex, ey, er + 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(ex + (Math.random() - 0.5) * 6, ey + (Math.random() - 0.5) * 6, er * 0.22, 0, Math.PI * 2); ctx.fill();
  }
  const open = 55 + 45 * Math.abs(Math.sin(t * 18));
  ctx.fillStyle = '#140006';
  ctx.beginPath(); ctx.ellipse(0, 95, 125, open, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f4f1dc';
  for (let i = 0; i < 9; i++) {
    const x = -110 + i * 27.5;
    ctx.beginPath(); ctx.moveTo(x - 11, 95 - open * 0.8); ctx.lineTo(x + 11, 95 - open * 0.8); ctx.lineTo(x, 95 - open * 0.8 + 32); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - 11, 95 + open * 0.8); ctx.lineTo(x + 11, 95 + open * 0.8); ctx.lineTo(x, 95 + open * 0.8 - 32); ctx.fill();
  }
  ctx.restore();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
  for (let i = 0; i < 40; i++) ctx.fillRect(0, Math.random() * vh, vw, 2);
}

// ---------- HUD ----------
const hudCache = {};
function setHud(id, html) { if (hudCache[id] !== html) { hudCache[id] = html; $(id).innerHTML = html; } }
function hud() {
  setHud('hKaardid', cards.map((c, i) => c
    ? `<span class="kaart" style="background:${CARD_COLORS[i]}">L${i + 1}</span>`
    : `<span class="kaart puudu">L${i + 1}</span>`).join(''));
  setHud('hNarvid', '●'.repeat(Math.max(0, nerves)) + '○'.repeat(NERVES - Math.max(0, nerves)));
  setHud('hSiht', `${targets.filter((t) => t.done).length}/4`);
  setHud('hAeg', evac >= 0 ? `PLAHVATUS ${Math.ceil(evac)} s` : '');
  setHud('hTeade', msgT > 0 ? msg : '');
}

// ---------- Main loop ----------
let last = performance.now();
function frame(ts) {
  const dt = Math.min(0.05, (ts - last) / 1000);
  last = ts;
  now = ts / 1000;
  if (state === 'access') { accessT -= dt; if (accessT <= 0) { state = 'play'; show(null); } }
  if (state === 'play') update(dt);
  else if (state === 'scare') updateScare(dt);
  if (player && state !== 'menu') {
    if (state === 'scare') drawScare(scareT); else draw();
    hud();
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
