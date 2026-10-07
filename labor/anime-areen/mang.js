// Anime Areen: everyone designs their own anime fighter, then battles the
// others in one shared realtime room. Each player keeps track of their own
// health; an attacker only tells the target that it was hit.
import { lab } from '../lab.js';
import { clamp, moveFighter, attackHits, applyDamage, cleanCharacter } from './game-core.js';
import { CHOICES, NAMES, HAIR_STYLES, HAIR_COLORS, EYES, OUTFITS, POWERS, drawFighter, drawArena, randomCharacter } from './joonista.js';

const W = 640;
const H = 480;
const MOVE_AREA = { width: W, height: 427 };
const DRAW_OFFSET = 56;
const MAX_HP = 100;
const DAMAGE = 10;
const ATTACK_COOLDOWN = 450;
const RESPAWN_MS = 2500;
const SAVE_KEY = 'anime-areen-voitleja';
const PREVIEW = 260;

const $ = (id) => document.getElementById(id);
const looja = $('looja');
const mang = $('mang');
const eelvaade = $('eelvaade');
const valikud = $('valikud');
const nimesilt = $('nimesilt');
const areen = $('areen');
const elu = $('elu');
const elutekst = $('elutekst');
const olek = $('olek');
const voitja = $('voitja');
const teade = $('teade');
const actx = areen.getContext('2d');
const pctx = eelvaade.getContext('2d');

const GROUPS = [
  { key: 'n', title: 'Nimi', labels: NAMES },
  { key: 's', title: 'Juuksed', labels: HAIR_STYLES },
  { key: 'h', title: 'Juuste värv', colors: HAIR_COLORS },
  { key: 'e', title: 'Silmad', labels: EYES },
  { key: 'o', title: 'Riided', colors: OUTFITS },
  { key: 'p', title: 'Võlujõud', labels: POWERS.map((power) => power.name) },
];
const KEYMAP = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
};

const me = { c: loadCharacter(), x: 0, y: 0, f: 1, hp: MAX_HP, atk: 0, hurt: 0, down: false };
const others = new Map();
const keys = new Set();
let tuba = null;
let inArena = false;
let wins = 0;
let lastAttack = -Infinity;
let previewAttack = 0;
let dpr = 1;
let lastFrame = performance.now();
let lastSent = 0;
let sentPosition = '';
let teateTaimer = 0;
let audio = null;

placeRandomly(me);

function loadCharacter() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (saved) return cleanCharacter(saved, CHOICES);
  } catch {
    // A broken save just means a new random fighter.
  }
  return randomCharacter();
}

function saveCharacter() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(me.c));
  } catch {
    // Private mode: the fighter is simply not remembered.
  }
}

function placeRandomly(fighter) {
  fighter.x = Math.round(60 + Math.random() * (W - 120));
  fighter.y = Math.round(60 + Math.random() * (MOVE_AREA.height - 120));
}

function num(value, min, max, fallback) {
  return typeof value === 'number' && Number.isFinite(value) ? clamp(value, min, max) : fallback;
}

function nameOf(id) {
  if (tuba && id === tuba.id) return 'Sina';
  const other = others.get(id);
  return other ? NAMES[other.c.n] : 'Keegi';
}

function hello() {
  return { t: 'hi', c: me.c, x: me.x, y: me.y, f: me.f, hp: me.hp };
}

function send(data) {
  if (tuba?.connected) tuba.send(data);
}

// Character creator

function buildCreator() {
  valikud.replaceChildren(...GROUPS.map((group) => {
    const box = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = group.title;
    box.append(legend);
    (group.colors ?? group.labels).forEach((item, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.key = group.key;
      button.dataset.value = index;
      if (group.colors) {
        button.className = 'varv';
        button.style.background = item;
        button.setAttribute('aria-label', `${group.title} ${index + 1}`);
      } else {
        button.textContent = item;
      }
      box.append(button);
    });
    return box;
  }));
  markChoices();
}

function markChoices() {
  for (const button of valikud.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', String(me.c[button.dataset.key] === Number(button.dataset.value)));
  }
  nimesilt.textContent = NAMES[me.c.n];
}

function characterChanged() {
  saveCharacter();
  markChoices();
  previewAttack = performance.now();
  send(hello());
  sound('pick');
}

valikud.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  me.c = { ...me.c, [button.dataset.key]: Number(button.dataset.value) };
  characterChanged();
});

$('juhuslik').addEventListener('click', () => {
  me.c = randomCharacter();
  characterChanged();
});

$('alusta').addEventListener('click', () => {
  looja.hidden = true;
  mang.hidden = false;
  inArena = true;
  resize();
  if (tuba) send(hello());
  else connect();
  showStatus();
  updateHud();
  mang.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

$('muuda').addEventListener('click', () => {
  inArena = false;
  keys.clear();
  mang.hidden = true;
  looja.hidden = false;
  resize();
  looja.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Playing together

function connect() {
  try {
    tuba = lab().join('areen');
  } catch (err) {
    olek.textContent = 'Areeniga ei saanud ühendust.';
    console.warn(err);
    return;
  }
  tuba.on('open', () => {
    tuba.send(hello());
    showStatus();
  });
  tuba.on('join', (id) => {
    tuba.sendTo(id, hello());
    showStatus();
  });
  tuba.on('leave', (id) => {
    others.delete(id);
    showStatus();
  });
  tuba.on('close', showStatus);
  tuba.on('full', () => {
    olek.textContent = 'Areen on täis. Proovi natukese aja pärast uuesti!';
  });
  tuba.on('message', receive);
}

function showStatus() {
  if (!tuba?.connected) {
    olek.textContent = 'Ühendan areeniga…';
    return;
  }
  const count = tuba.peers.size;
  olek.textContent = count
    ? `Areenil on veel ${count} võitleja${count === 1 ? '' : 't'}.`
    : 'Oled areenil üksi. Kutsu sõber mängima!';
}

function receive(message, from) {
  if (!message || typeof message !== 'object') return;
  if (message.t === 'hi') {
    const other = others.get(from) ?? { atk: 0, hurt: 0 };
    other.c = cleanCharacter(message.c, CHOICES);
    other.x = other.dx = num(message.x, 0, W, W / 2);
    other.y = other.dy = num(message.y, 0, H, H / 2);
    other.f = message.f < 0 ? -1 : 1;
    other.hp = num(message.hp, 0, MAX_HP, MAX_HP);
    other.down = other.hp === 0;
    others.set(from, other);
    showStatus();
    return;
  }
  if (message.t === 'hit') {
    getHit(from, num(message.d, 1, 20, DAMAGE));
    return;
  }
  if (message.t === 'ko') {
    const loser = nameOf(from);
    if (tuba && message.by === tuba.id) {
      wins += 1;
      updateHud();
      flash(`⭐ Sa lõid ${loser} pikali!`);
    } else {
      flash(`💥 ${nameOf(message.by)} lõi ${loser} pikali!`);
    }
  }
  const other = others.get(from);
  if (!other) return;
  if (message.t === 'm') {
    other.x = num(message.x, 0, W, other.x);
    other.y = num(message.y, 0, H, other.y);
    other.f = message.f < 0 ? -1 : 1;
  } else if (message.t === 'a') {
    other.atk = 1;
  } else if (message.t === 'hp') {
    const hp = num(message.hp, 0, MAX_HP, other.hp);
    if (hp < other.hp) other.hurt = 1;
    other.hp = hp;
    other.down = hp === 0;
  }
}

function getHit(from, damage) {
  if (me.down) return;
  const result = applyDamage(me.hp, damage);
  me.hp = result.health;
  me.hurt = 1;
  sound('hit');
  send({ t: 'hp', hp: me.hp });
  if (result.knockedOut) {
    me.down = true;
    send({ t: 'ko', by: from });
    flash(`😵 ${nameOf(from)} lõi sind pikali! Tuled kohe tagasi…`);
    setTimeout(respawn, RESPAWN_MS);
  }
  updateHud();
}

function respawn() {
  me.hp = MAX_HP;
  me.down = false;
  placeRandomly(me);
  send(hello());
  updateHud();
}

function attack() {
  if (!inArena || me.down) return;
  const now = performance.now();
  if (now - lastAttack < ATTACK_COOLDOWN) return;
  lastAttack = now;
  me.atk = 1;
  sound('zap');
  send({ t: 'a' });
  if (!tuba?.connected) return;
  for (const [id, other] of others) {
    if (!other.down && attackHits({ x: me.x, y: me.y, facing: me.f }, other)) tuba.sendTo(id, { t: 'hit', d: DAMAGE });
  }
}

// Keyboard and touch

addEventListener('keydown', (event) => {
  if (!inArena) return;
  const key = KEYMAP[event.code];
  if (key) {
    keys.add(key);
    event.preventDefault();
  } else if (event.code === 'Space') {
    event.preventDefault();
    if (!event.repeat) attack();
  }
});
addEventListener('keyup', (event) => {
  const key = KEYMAP[event.code];
  if (key) keys.delete(key);
  if (inArena && event.code === 'Space') event.preventDefault();
});
addEventListener('blur', () => keys.clear());

for (const button of document.querySelectorAll('.suund')) {
  const key = button.dataset.key;
  const stop = () => {
    keys.delete(key);
    button.classList.remove('vajutatud');
  };
  button.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    button.setPointerCapture?.(event.pointerId);
    keys.add(key);
    button.classList.add('vajutatud');
  });
  button.addEventListener('pointerup', stop);
  button.addEventListener('pointercancel', stop);
  button.addEventListener('lostpointercapture', stop);
}
$('runnak').addEventListener('pointerdown', (event) => {
  event.preventDefault();
  attack();
});
document.querySelector('.puutenupud').addEventListener('contextmenu', (event) => event.preventDefault());

// Sound starts only after the first tap, click or key press.

function unlockAudio() {
  try {
    if (!audio) audio = new AudioContext();
    else if (audio.state === 'suspended') audio.resume();
  } catch {
    audio = null;
  }
}
for (const type of ['pointerdown', 'click', 'keydown']) addEventListener(type, unlockAudio);

function sound(kind) {
  if (!audio || audio.state !== 'running') return;
  const [type, from, to, length] = { zap: ['square', 880, 220, 0.12], hit: ['sawtooth', 200, 60, 0.18], pick: ['triangle', 520, 780, 0.08] }[kind];
  const t = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  osc.frequency.exponentialRampToValueAtTime(to, t + length);
  gain.gain.setValueAtTime(0.08, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + length);
  osc.connect(gain).connect(audio.destination);
  osc.start(t);
  osc.stop(t + length + 0.02);
}

// Screen

function updateHud() {
  elu.style.width = `${me.hp}%`;
  elutekst.textContent = me.hp;
  voitja.textContent = `Võite: ${wins}`;
}

function flash(text) {
  teade.textContent = text;
  teade.classList.add('nahtav');
  clearTimeout(teateTaimer);
  teateTaimer = setTimeout(() => teade.classList.remove('nahtav'), 2200);
}

function resize() {
  dpr = Math.min(2, window.devicePixelRatio || 1);
  areen.width = W * dpr;
  areen.height = H * dpr;
  const size = eelvaade.clientWidth || PREVIEW;
  eelvaade.width = Math.round(size * dpr);
  eelvaade.height = Math.round(size * dpr);
}
addEventListener('resize', resize);

function update(now, dt) {
  if (!me.down) {
    const dir = {
      x: (keys.has('right') ? 1 : 0) - (keys.has('left') ? 1 : 0),
      y: (keys.has('down') ? 1 : 0) - (keys.has('up') ? 1 : 0),
    };
    if (dir.x || dir.y) {
      Object.assign(me, moveFighter(me, dir, dt, MOVE_AREA));
      if (dir.x) me.f = dir.x;
    }
  }
  me.atk = Math.max(0, me.atk - dt / 300);
  me.hurt = Math.max(0, me.hurt - dt / 400);
  const follow = Math.min(1, dt / 80);
  for (const other of others.values()) {
    other.atk = Math.max(0, other.atk - dt / 300);
    other.hurt = Math.max(0, other.hurt - dt / 400);
    other.dx += (other.x - other.dx) * follow;
    other.dy += (other.y - other.dy) * follow;
  }
  const position = `${me.x},${me.y},${me.f}`;
  if (tuba?.connected && now - lastSent > 50 && position !== sentPosition) {
    lastSent = now;
    sentPosition = position;
    tuba.send({ t: 'm', x: me.x, y: me.y, f: me.f });
  }
}

function drawGame(now) {
  actx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawArena(actx, W, H, now);
  const fighters = [{ ...me, dx: me.x, dy: me.y, mine: true }, ...others.values()];
  fighters.sort((a, b) => a.dy - b.dy);
  for (const f of fighters) {
    drawFighter(actx, f.c, f.dx, f.dy + DRAW_OFFSET, {
      facing: f.f,
      attack: f.atk,
      hurt: f.hurt,
      down: f.down,
      time: now + f.dx * 7,
      label: f.mine ? `${NAMES[f.c.n]} (sina)` : NAMES[f.c.n],
      hp: f.hp,
      me: Boolean(f.mine),
    });
  }
}

function drawPreview(now) {
  const s = eelvaade.width / PREVIEW;
  pctx.setTransform(s, 0, 0, s, 0, 0);
  pctx.clearRect(0, 0, PREVIEW, PREVIEW);
  const since = now - previewAttack;
  if (since > 2600) previewAttack = now;
  const attackAmount = since < 350 ? 1 - since / 350 : 0;
  drawFighter(pctx, me.c, 82, 168, { scale: 1.9, time: now, attack: attackAmount });
}

function frame(now) {
  const dt = Math.min(50, now - lastFrame);
  lastFrame = now;
  if (inArena) {
    update(now, dt);
    drawGame(now);
  } else {
    drawPreview(now);
  }
  requestAnimationFrame(frame);
}

buildCreator();
resize();
updateHud();
requestAnimationFrame(frame);
