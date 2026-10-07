// Anime Areen: a realtime fighting game for several players in one shared
// room. Each player keeps track of their own health; an attacker only tells
// the target that it was hit. Every player picks one of the characters the
// children drew; more of them will be added later.
import { lab } from '../lab.js';
import { clamp, moveFighter, attackHits, applyDamage, cleanCharacter } from './game-core.js';
import { COLORS, CHARACTERS, drawFighter, drawArena, drawFocusLines } from './joonista.js';

const W = 640;
const H = 480;
const MOVE_AREA = { width: W, height: 367 };
const FEET_OFFSET = 134;
const MAX_HP = 100;
const DAMAGE = 10;
const ATTACK_COOLDOWN = 450;
const RESPAWN_MS = 2500;
const LIMITS = { v: COLORS.length, p: CHARACTERS.length };

const $ = (id) => document.getElementById(id);
const areen = $('areen');
const elu = $('elu');
const elutekst = $('elutekst');
const olek = $('olek');
const voitja = $('voitja');
const teade = $('teade');
const ctx = areen.getContext('2d');

const KEYMAP = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
};

const me = { c: { v: Math.floor(Math.random() * COLORS.length), p: Math.floor(Math.random() * CHARACTERS.length) }, x: 0, y: 0, f: 1, hp: MAX_HP, atk: 0, hurt: 0, down: false, walking: false };
const others = new Map();
const keys = new Set();
let tuba = null;
let wins = 0;
let lastAttack = -Infinity;
let dpr = 1;
let lastFrame = performance.now();
let lastSent = 0;
let sentPosition = '';
let teateTaimer = 0;
let audio = null;

placeRandomly(me);

function placeRandomly(fighter) {
  fighter.x = Math.round(60 + Math.random() * (W - 120));
  fighter.y = Math.round(40 + Math.random() * (MOVE_AREA.height - 80));
}

function num(value, min, max, fallback) {
  return typeof value === 'number' && Number.isFinite(value) ? clamp(value, min, max) : fallback;
}

function hello() {
  return { t: 'hi', c: me.c, x: me.x, y: me.y, f: me.f, hp: me.hp };
}

function send(data) {
  if (tuba?.connected) tuba.send(data);
}

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
    const other = others.get(from) ?? { atk: 0, hurt: 0, movedAt: 0, walking: false };
    other.c = cleanCharacter(message.c, LIMITS);
    other.x = other.dx = num(message.x, 0, W, W / 2);
    other.y = other.dy = num(message.y, 0, MOVE_AREA.height, MOVE_AREA.height / 2);
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
    if (tuba && message.by === tuba.id) {
      wins += 1;
      updateHud();
      flash('⭐ Lõid ühe võitleja pikali!');
    }
    return;
  }
  const other = others.get(from);
  if (!other) return;
  if (message.t === 'm') {
    other.x = num(message.x, 0, W, other.x);
    other.y = num(message.y, 0, MOVE_AREA.height, other.y);
    other.f = message.f < 0 ? -1 : 1;
    other.movedAt = performance.now();
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
    flash('😵 Said pikali! Tuled kohe tagasi…');
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
  if (me.down) return;
  const now = performance.now();
  if (now - lastAttack < ATTACK_COOLDOWN) return;
  lastAttack = now;
  me.atk = 1;
  sound('punch');
  send({ t: 'a' });
  if (!tuba?.connected) return;
  for (const [id, other] of others) {
    if (!other.down && attackHits({ x: me.x, y: me.y, facing: me.f }, other)) tuba.sendTo(id, { t: 'hit', d: DAMAGE });
  }
}

// Keyboard and touch

addEventListener('keydown', (event) => {
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
  if (event.code === 'Space') event.preventDefault();
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

// Choosing a character; the others see the change right away.

const choices = document.querySelectorAll('.tegelane');
function showChoice() {
  for (const button of choices) button.setAttribute('aria-pressed', String(Number(button.dataset.p) === me.c.p));
}
for (const button of choices) {
  button.addEventListener('click', () => {
    me.c.p = Number(button.dataset.p);
    showChoice();
    send(hello());
  });
}
showChoice();

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
  const [type, from, to, length] = { punch: ['triangle', 420, 110, 0.09], hit: ['sawtooth', 200, 60, 0.18] }[kind];
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
}
addEventListener('resize', resize);

function update(now, dt) {
  me.walking = false;
  if (!me.down) {
    const dir = {
      x: (keys.has('right') ? 1 : 0) - (keys.has('left') ? 1 : 0),
      y: (keys.has('down') ? 1 : 0) - (keys.has('up') ? 1 : 0),
    };
    if (dir.x || dir.y) {
      Object.assign(me, moveFighter(me, dir, dt, MOVE_AREA));
      if (dir.x) me.f = dir.x;
      me.walking = true;
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
    other.walking = now - other.movedAt < 150;
  }
  const position = `${me.x},${me.y},${me.f}`;
  if (tuba?.connected && now - lastSent > 50 && position !== sentPosition) {
    lastSent = now;
    sentPosition = position;
    tuba.send({ t: 'm', x: me.x, y: me.y, f: me.f });
  }
}

function draw(now) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawArena(ctx, W, H, now);
  const fighters = [{ ...me, dx: me.x, dy: me.y, mine: true }, ...others.values()];
  fighters.sort((a, b) => a.dy - b.dy);
  for (const f of fighters) {
    drawFighter(ctx, f.c, f.dx, f.dy + FEET_OFFSET, {
      facing: f.f,
      scale: 0.8 + 0.3 * (f.dy / MOVE_AREA.height),
      attack: f.atk,
      hurt: f.hurt,
      down: f.down,
      walking: f.walking,
      time: now + f.dx * 7,
      label: f.mine ? 'Sina' : '',
      hp: f.hp,
      me: Boolean(f.mine),
    });
  }
  drawFocusLines(ctx, W, H, me.down ? 0 : me.hurt, now);
}

function frame(now) {
  const dt = Math.min(50, now - lastFrame);
  lastFrame = now;
  update(now, dt);
  draw(now);
  requestAnimationFrame(frame);
}

connect();
resize();
updateHud();
showStatus();
requestAnimationFrame(frame);
