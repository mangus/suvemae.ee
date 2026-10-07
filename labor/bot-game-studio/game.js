// Bot Game Studio: pick ideas for a robot helper, squash bugs, publish, reach 500 players.
import { lab } from '../lab.js';

const studio = lab();

const GOAL = 500;
const BUILD_MS = 3500;
const PUBLISH_MS = 1500;
const START_ENERGY = 10;
const TANK_GROWTH = 3; // more credit space for every published idea
const ENERGY_EVERY = 1.5; // seconds per credit
const BUG_CHANCE = 0.4;
const MAX_BUGS = 6;
const BEST_KEY = 'bot-game-studio-best';

const IDEAS = [
  { id: 'sky', icon: '🎨', name: 'Paint a sky', fun: 5, cost: 1, needs: [], code: 'sky.color = "light blue";' },
  { id: 'hero', icon: '🙂', name: 'Add a hero', fun: 10, cost: 2, needs: [], code: 'let hero = new Hero("smiley");' },
  { id: 'sun', icon: '☀️', name: 'Add a sun', fun: 5, cost: 1, needs: ['sky'], code: 'sky.add(new Sun());' },
  { id: 'clouds', icon: '☁️', name: 'Add clouds', fun: 5, cost: 1, needs: ['sky'], code: 'clouds.add(3);' },
  { id: 'music', icon: '🎵', name: 'Add music', fun: 10, cost: 2, needs: ['sky'], code: 'music.play("happy tune");' },
  { id: 'jump', icon: '🦘', name: 'Make the hero jump', fun: 10, cost: 2, needs: ['hero'], code: 'onTap(() => hero.jump());' },
  { id: 'trees', icon: '🌳', name: 'Plant trees', fun: 5, cost: 2, needs: ['hero'], code: 'ground.plant("tree", 2);' },
  { id: 'coins', icon: '🪙', name: 'Add coins', fun: 15, cost: 3, needs: ['hero'], code: 'coins.spawn({ every: 1 });' },
  { id: 'hat', icon: '🎩', name: 'Give the hero a hat', fun: 10, cost: 2, needs: ['hero'], code: 'hero.wear("top hat");' },
  { id: 'bird', icon: '🐦', name: 'Add a bird', fun: 10, cost: 2, needs: ['clouds'], code: 'bird.fly("across the sky");' },
  { id: 'flowers', icon: '🌸', name: 'Grow flowers', fun: 5, cost: 2, needs: ['trees'], code: 'ground.plant("flower", 5);' },
  { id: 'pet', icon: '🐶', name: 'Add a pet', fun: 15, cost: 3, needs: ['jump'], code: 'hero.pet = new Puppy();' },
  { id: 'monster', icon: '👾', name: 'Add a monster', fun: 15, cost: 3, needs: ['jump'], code: 'monster.walk("left", "right");' },
  { id: 'rainbow', icon: '🌈', name: 'Add a rainbow', fun: 10, cost: 2, needs: ['clouds'], code: 'sky.add(new Rainbow());' },
  { id: 'house', icon: '🏠', name: 'Build a house', fun: 10, cost: 3, needs: ['trees'], code: 'world.build(new House());' },
  { id: 'hearts', icon: '❤️', name: 'Add lives', fun: 15, cost: 3, needs: ['monster'], code: 'hero.lives = 3;' },
  { id: 'scores', icon: '🏆', name: 'Add high scores', fun: 15, cost: 3, needs: ['coins'], code: 'scores.save(nickname, points);' },
  { id: 'stars', icon: '✨', name: 'Add sparkles', fun: 10, cost: 3, needs: ['rainbow'], code: 'sky.sparkle(5);' },
  { id: 'boss', icon: '🐉', name: 'Add a big boss', fun: 25, cost: 4, needs: ['monster'], code: 'let boss = new Dragon("huge");' },
  { id: 'fireworks', icon: '🎆', name: 'Add fireworks', fun: 20, cost: 4, needs: ['boss'], code: 'onWin(() => fireworks.go());' },
  { id: 'levels', icon: '🗺️', name: 'Add more levels', fun: 20, cost: 4, needs: ['boss'], code: 'levels.push(level2, level3);' },
  { id: 'castle', icon: '🏰', name: 'Build a castle', fun: 25, cost: 5, needs: ['levels'], code: 'level3.add(new Castle());' },
  { id: 'friends', icon: '🤝', name: 'Play with friends', fun: 30, cost: 5, needs: ['scores', 'castle'], code: 'room.join("friends");' },
];

const $ = (id) => document.getElementById(id);
const canvas = $('preview');
const ctx = canvas.getContext('2d');
let W = 0;
let H = 0;
let dpr = 1;

const state = {
  built: new Set(), // in your game, but players only see it after publishing
  live: new Set(), // published
  building: null,
  publishing: 0, // time publishing started, 0 when not publishing
  energy: START_ENERGY,
  bugs: [],
  players: 0,
  startedAt: 0,
  finishedAt: 0,
  score: 0,
};
const pops = []; // little bangs where bugs got squashed

const has = (id) => state.built.has(id);
const funOf = (ids) => IDEAS.filter((i) => ids.has(i.id)).reduce((sum, i) => sum + i.fun, 0);
const pickOne = (list) => list[Math.floor(Math.random() * list.length)];
const costOf = (idea) => idea.cost + state.built.size; // every build makes the next one cost 1 more
const maxEnergy = () => START_ENERGY + state.live.size * TANK_GROWTH;

function say(text) {
  $('say').textContent = text;
}

// ---- Idea cards ----

function cardState(idea) {
  if (state.live.has(idea.id)) return 'done live';
  if (state.built.has(idea.id)) return 'done';
  return idea.needs.every(has) ? 'open' : 'locked';
}

function cardInfo(kind, idea) {
  if (kind === 'open') return `⚡${costOf(idea)} · +${idea.fun} fun`;
  if (kind === 'locked') return 'Build more first';
  if (kind === 'done') return '✅ built, not published';
  return '🌍 live!';
}

function renderCards() {
  $('cards').replaceChildren(...IDEAS.map((idea) => {
    const kind = cardState(idea);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'card ' + kind;
    button.dataset.id = idea.id;
    button.disabled = kind === 'locked';
    const icon = document.createElement('span');
    icon.className = 'icon';
    icon.textContent = kind === 'locked' ? '🔒' : idea.icon;
    const name = document.createElement('span');
    name.textContent = kind === 'locked' ? '???' : idea.name;
    const info = document.createElement('small');
    info.textContent = cardInfo(kind, idea);
    button.append(icon, name, info);
    return button;
  }));
  const fresh = [...state.built].filter((id) => !state.live.has(id)).length;
  $('publish').textContent = fresh ? `🚀 Publish (${fresh} new)` : '🚀 Publish';
  $('publish').disabled = Boolean(state.building || state.publishing || state.finishedAt);
  $('fun').textContent = funOf(state.live);
}

function typeCode(line) {
  const box = $('code');
  const row = document.createElement('div');
  box.append(row);
  while (box.children.length > 4) box.firstElementChild.remove();
  const text = '> ' + line;
  let n = 0;
  const timer = setInterval(() => {
    n += 1;
    row.textContent = text.slice(0, n);
    if (n >= text.length) clearInterval(timer);
  }, (BUILD_MS * 0.85) / text.length);
}

function pick(id) {
  const idea = IDEAS.find((i) => i.id === id);
  if (!idea || state.finishedAt) return;
  if (state.building) return say('Wait, I am still building! 🔧');
  if (state.publishing) return say('Wait, I am publishing! 🚀');
  const kind = cardState(idea);
  if (kind !== 'open') return say(kind === 'locked' ? 'Build other things first!' : 'Already built! Try another idea.');
  if (state.energy < costOf(idea)) return say(`I need ${costOf(idea)} ⚡ for that. Wait a moment!`);
  if (!state.startedAt) state.startedAt = performance.now();
  state.energy -= costOf(idea);
  state.building = idea;
  $('bot').classList.add('busy');
  say(`${pickOne(['On it!', 'Writing code…', 'Great idea!', 'Beep boop, building!'])} ${idea.icon}`);
  typeCode(idea.code);
  beep(440, 0.08);
  setTimeout(() => finishBuild(idea), BUILD_MS);
  renderCards();
}

function finishBuild(idea) {
  state.built.add(idea.id);
  state.building = null;
  $('bot').classList.remove('busy');
  beep(660, 0.12);
  if (idea.id === 'music') startMusic();
  if (Math.random() < BUG_CHANCE && state.bugs.length < MAX_BUGS) {
    spawnBug();
    say(`${idea.icon} is in! But oops, a bug 🐛 got in too. Tap it to squash it!`);
  } else {
    say(`Done! ${idea.icon} is in your game. New ideas now cost 1 ⚡ more. Press Publish so players can see it.`);
  }
  renderCards();
}

function publish() {
  if (state.building || state.publishing || state.finishedAt) return;
  const fresh = [...state.built].filter((id) => !state.live.has(id));
  if (!fresh.length) return say('Build something new first, then publish!');
  state.publishing = performance.now();
  say('git push… 🚀 Your game goes live in a moment!');
  beep(523, 0.1);
  setTimeout(() => {
    const grow = (state.built.size - state.live.size) * TANK_GROWTH;
    state.live = new Set(state.built);
    state.bugs.forEach((bug) => { bug.live = true; });
    state.publishing = 0;
    const n = state.bugs.length;
    say((n ? `It's live! But ${n} bug${n > 1 ? 's' : ''} went live too 😬 Players don't like bugs. Squash them!` : "It's live! 🎉 Players are coming!") + ` Your ⚡ tank grew by ${grow}!`);
    beep(880, 0.15);
    renderCards();
  }, PUBLISH_MS);
  renderCards();
}

$('cards').addEventListener('click', (e) => {
  const card = e.target.closest('.card');
  if (card) pick(card.dataset.id);
});
$('publish').addEventListener('click', publish);

// ---- Sound (starts only after the first tap) ----

let audio = null;
let muted = false;
let musicTimer = 0;
const TUNE = [523, 659, 784, 659, 587, 698, 880, 698];

function wakeAudio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!audio && AC) audio = new AC();
  if (audio && audio.state === 'suspended') audio.resume();
}

function beep(freq, secs, type = 'square', volume = 0.06) {
  if (!audio || muted) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + secs);
  osc.connect(gain).connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + secs);
}

function startMusic() {
  if (musicTimer) return;
  let i = 0;
  musicTimer = setInterval(() => {
    beep(TUNE[i % TUNE.length], 0.25, 'triangle', 0.035);
    i += 1;
  }, 300);
}

document.addEventListener('pointerdown', wakeAudio);
$('mute').addEventListener('click', () => {
  muted = !muted;
  $('mute').textContent = muted ? '🔇' : '🔊';
});

// ---- Bugs ----

function spawnBug() {
  state.bugs.push({
    x: W * (0.15 + Math.random() * 0.7),
    y: H * (0.25 + Math.random() * 0.6),
    vx: (Math.random() - 0.5) * 90,
    vy: (Math.random() - 0.5) * 70,
    live: false,
  });
}

function moveBug(bug, dt) {
  if (Math.random() < dt) bug.vx = (Math.random() - 0.5) * 90;
  bug.x += bug.vx * dt;
  bug.y += bug.vy * dt;
  if (bug.x < 16 || bug.x > W - 16) bug.vx *= -1;
  if (bug.y < 16 || bug.y > H - 16) bug.vy *= -1;
  bug.x = Math.min(Math.max(bug.x, 16), W - 16);
  bug.y = Math.min(Math.max(bug.y, 16), H - 16);
}

canvas.addEventListener('pointerdown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const i = state.bugs.findIndex((bug) => Math.hypot(bug.x - x, bug.y - y) < 32);
  if (i < 0) return;
  const [bug] = state.bugs.splice(i, 1);
  pops.push({ x: bug.x, y: bug.y, age: 0 });
  beep(200, 0.15, 'sawtooth');
  say(state.bugs.length ? `Squashed! 💥 ${state.bugs.length} more to go.` : pickOne(['Squashed! 💥 No more bugs.', 'Bug gone! 💥 Nice!']));
});

// ---- Winning and the high score table ----

function win(now) {
  state.finishedAt = now;
  state.players = GOAL;
  const secs = Math.max(1, Math.round((now - state.startedAt) / 1000));
  state.score = secs;
  $('wintime').textContent = secs;
  let best = 0;
  try {
    best = Number(localStorage.getItem(BEST_KEY)) || 0;
    if (!best || secs < best) localStorage.setItem(BEST_KEY, String(secs));
  } catch {
    best = 0;
  }
  $('best').textContent = best && secs >= best ? `Your best: ${best} s` : best ? 'New personal best! 🌟' : '';
  $('win').hidden = false;
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.2), i * 150));
  say('WOW! 500 players love your game! 🎉');
  renderCards();
}

async function showScores() {
  const list = $('table');
  const row = (text) => {
    const li = document.createElement('li');
    li.textContent = text;
    return li;
  };
  try {
    const top = await studio.topScores(10, { order: 'asc' });
    list.replaceChildren(...(top.length ? top.map((s) => row(`${s.name} · ${s.score} s`)) : [row('Nobody yet. Be the first!')]));
  } catch {
    list.replaceChildren(row('Could not load the table right now.'));
  }
}

$('save').addEventListener('click', async () => {
  const name = $('name').value.trim().slice(0, 20);
  if (!name) {
    $('saved').textContent = 'Type a nickname first.';
    return;
  }
  $('save').disabled = true;
  try {
    await studio.addScore(name, state.score);
    $('saved').textContent = 'Saved! 🏆';
    await showScores();
  } catch {
    $('saved').textContent = 'Could not save right now. Try again in a moment.';
    $('save').disabled = false;
  }
});
$('again').addEventListener('click', () => location.reload());

// ---- Drawing the game you are making ----

function resize() {
  const rect = canvas.getBoundingClientRect();
  dpr = window.devicePixelRatio || 1;
  W = rect.width;
  H = rect.height;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
}
window.addEventListener('resize', resize);

function circle(x, y, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function outline() {
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#2b2340';
  ctx.stroke();
}

function drawFace(x, y, r, color, eyes = 2) {
  circle(x, y, r, color);
  outline();
  if (eyes === 2) {
    circle(x - r * 0.3, y - r * 0.15, r * 0.12, '#2b2340');
    circle(x + r * 0.3, y - r * 0.15, r * 0.12, '#2b2340');
  } else {
    circle(x, y - r * 0.2, r * 0.25, '#fff');
    circle(x, y - r * 0.2, r * 0.12, '#2b2340');
  }
  ctx.beginPath();
  ctx.arc(x, y + r * 0.1, r * 0.4, 0.15 * Math.PI, 0.85 * Math.PI);
  outline();
}

function label(text, x, y, size, align = 'left', color = '#2b2340') {
  ctx.font = `bold ${Math.round(size)}px ui-rounded, system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function draw(t, now) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  if (has('sky')) {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#7cc8ff');
    sky.addColorStop(1, '#e3f5ff');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
  } else {
    ctx.fillStyle = '#eceaf3';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#dcd8e8';
    for (let x = 0; x < W; x += 24) ctx.fillRect(x, 0, 1, H);
    for (let y = 0; y < H; y += 24) ctx.fillRect(0, y, W, 1);
  }

  if (has('sun')) circle(W * 0.1, H * 0.15, H * 0.08 + Math.sin(t * 2) * 2, '#ffd43b');

  if (has('rainbow')) {
    const colors = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa'];
    const width = H * 0.035;
    colors.forEach((color, i) => {
      ctx.beginPath();
      ctx.arc(W * 0.62, H * 0.85, H * 0.6 - i * width, Math.PI, 2 * Math.PI);
      ctx.lineWidth = width;
      ctx.strokeStyle = color;
      ctx.stroke();
    });
  }

  if (has('clouds')) {
    for (let i = 0; i < 3; i += 1) {
      const x = ((t * 18 + i * (W + 140) / 3) % (W + 140)) - 70;
      const y = H * (0.14 + 0.09 * i);
      circle(x, y, H * 0.06, '#fff');
      circle(x + H * 0.07, y + H * 0.01, H * 0.05, '#fff');
      circle(x - H * 0.07, y + H * 0.015, H * 0.045, '#fff');
    }
  }

  if (has('stars')) {
    for (let i = 0; i < 5; i += 1) {
      const size = H * (0.04 + 0.03 * Math.abs(Math.sin(t * 3 + i)));
      label('✨', W * (0.2 + i * 0.15), H * (0.08 + (i % 2) * 0.1), size, 'center');
    }
  }

  if (has('bird')) label('🐦', ((t * 50) % (W + 80)) - 40, H * 0.3 + Math.sin(t * 5) * 8, H * 0.08, 'center');

  const ground = H * 0.82;
  if (has('hero')) {
    ctx.fillStyle = '#6bd36b';
    ctx.fillRect(0, ground, W, H - ground);
    ctx.fillStyle = '#4cb24c';
    ctx.fillRect(0, ground, W, 4);
  }

  if (has('flowers')) {
    for (let i = 0; i < 6; i += 1) label('🌸', W * (0.05 + i * 0.18), ground + H * 0.08, H * 0.06, 'center');
  }

  if (has('trees')) {
    label('🌳', W * 0.06, ground - H * 0.09, H * 0.2, 'center');
    label('🌳', W * 0.42, ground - H * 0.07, H * 0.15, 'center');
  }

  if (has('house')) label('🏠', W * 0.62, ground - H * 0.08, H * 0.17, 'center');

  if (has('castle')) label('🏰', W * 0.9, ground - H * 0.14, H * 0.28, 'center');

  if (has('levels')) {
    const w = H * 0.1;
    ctx.fillStyle = '#c47a2c';
    ctx.fillRect(W * 0.95 - w, ground - H * 0.22, w, H * 0.22);
    label('2', W * 0.95 - w / 2, ground - H * 0.11, H * 0.08, 'center', '#fff');
  }

  if (has('coins')) {
    for (let i = 0; i < 4; i += 1) {
      const x = W + 20 - ((t * 70 + i * (W + 40) / 4) % (W + 40));
      const y = ground - H * 0.32 + Math.sin(t * 4 + i) * 4;
      circle(x, y, H * 0.035, '#ffd43b');
      outline();
    }
  }

  if (has('monster')) {
    const r = H * 0.065;
    drawFace(W * 0.5 + Math.sin(t * 1.4) * W * 0.1, ground - r, r, '#b07cff', 1);
  }

  if (has('boss')) {
    const r = H * 0.15;
    const x = W * 0.78;
    const y = ground - r + Math.sin(t * 2) * 3;
    ctx.fillStyle = '#2e9b62';
    for (let k = -1; k <= 1; k += 1) {
      ctx.beginPath();
      ctx.moveTo(x + k * r * 0.5 - r * 0.2, y - r * 0.8);
      ctx.lineTo(x + k * r * 0.5, y - r * 1.3);
      ctx.lineTo(x + k * r * 0.5 + r * 0.2, y - r * 0.8);
      ctx.fill();
    }
    drawFace(x, y, r, '#3fbf7f');
  }

  if (has('hero')) {
    const r = H * 0.07;
    const hop = (phase) => (has('jump') ? Math.abs(Math.sin(t * 3 + phase)) * H * 0.25 : 0);
    if (has('friends')) drawFace(W * 0.1, ground - r - hop(1), r, '#ff8fc7');
    const heroY = ground - r - hop(0);
    drawFace(W * 0.22, heroY, r, '#ffc933');
    if (has('hat')) label('🎩', W * 0.22, heroY - r * 1.1, r * 1.2, 'center');
    if (has('pet')) label('🐶', W * 0.33, ground - r * 0.7 - hop(0.6) * 0.5, r * 1.4, 'center');
  }

  if (has('music')) {
    for (let i = 0; i < 3; i += 1) {
      const y = H * 0.65 - ((t * 30 + i * 40) % (H * 0.5));
      label('♪', W * 0.3 + i * W * 0.06, y, H * 0.09, 'center', '#8c6cf2');
    }
  }

  if (has('hearts')) label('❤️❤️❤️', 10, H * 0.93, H * 0.06);

  if (has('fireworks')) label('🎆', W * (0.3 + (Math.floor(t) % 3) * 0.2), H * 0.2, H * (0.06 + (t % 1) * 0.12), 'center');

  if (has('scores')) label(`🏆 ${Math.floor(t * 10) % 10000}`, W - 10, H * 0.08, H * 0.06, 'right');

  if (!state.built.size && !state.building) {
    label('Your game is empty…', W / 2, H * 0.42, Math.min(W * 0.05, 26), 'center', '#8a84a0');
    label('pick an idea below! 👇', W / 2, H * 0.56, Math.min(W * 0.05, 26), 'center', '#8a84a0');
  }

  if (state.building) label(`🔧 Building ${state.building.icon}…`, 10, H * 0.08, Math.min(W * 0.045, 22));

  if (state.publishing) {
    const p = Math.min(1, (now - state.publishing) / PUBLISH_MS);
    label('🚀', W / 2, H * (1.1 - p * 1.3), H * 0.15, 'center');
  }

  for (const bug of state.bugs) {
    if (bug.live) circle(bug.x, bug.y, 22, 'rgba(255, 80, 80, 0.45)');
    label('🐛', bug.x, bug.y, 28, 'center');
  }
  for (const pop of pops) label('💥', pop.x, pop.y, 28 + pop.age * 40, 'center');
}

// ---- Main loop ----

let last = performance.now();
let energyClock = 0;

function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (!state.finishedAt) {
    energyClock += dt;
    if (energyClock >= ENERGY_EVERY) {
      energyClock = 0;
      if (state.energy < maxEnergy()) state.energy += 1;
    }
    if (state.startedAt) {
      const liveBugs = state.bugs.filter((bug) => bug.live).length;
      const rate = funOf(state.live) / 12 - liveBugs * 3; // players per second
      state.players = Math.max(0, state.players + rate * dt);
      if (state.players >= GOAL) win(now);
    }
  }
  state.bugs.forEach((bug) => moveBug(bug, dt));
  pops.forEach((pop) => { pop.age += dt; });
  while (pops.length && pops[0].age > 0.5) pops.shift();

  $('energy').textContent = `${state.energy}/${maxEnergy()}`;
  $('players').textContent = Math.floor(state.players);
  $('bar').style.width = `${Math.min(100, (state.players / GOAL) * 100)}%`;
  $('time').textContent = state.startedAt ? Math.floor(((state.finishedAt || now) - state.startedAt) / 1000) : 0;

  draw(now / 1000, now);
  requestAnimationFrame(frame);
}

resize();
renderCards();
showScores();
requestAnimationFrame(frame);
