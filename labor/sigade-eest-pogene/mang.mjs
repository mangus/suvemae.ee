// Põgene sigade eest! A third-person 3D chase: the player is a hedgehog
// collecting apples on a fenced forest meadow while pigs chase it.
import { SIZE, chase, freeSpot, isCaught, knockBack, makeTrees, random, separate, step } from './game-core.mjs';
import { render } from './mootor.mjs';
import * as models from './mudelid.mjs';

const canvas = document.getElementById('vaade');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('teade');
const title = document.getElementById('pealkiri');
const guide = document.getElementById('juhis');
const startButton = document.getElementById('alusta');
const appleLabel = document.getElementById('ounad');
const timeLabel = document.getElementById('aeg');
const curlLabel = document.getElementById('kerra');

const GOAL = 10; // apples needed to win
const HOG_RADIUS = 0.45;
const PIG_RADIUS = 0.5;
const RUN_SPEED = 4.2;
const BACK_SPEED = 2.4;
const TURN_SPEED = 2.6;
const CURL_TIME = 1.3;
const CURL_COOLDOWN = 4;
const NEW_PIG_EVERY = 15;
const MAX_PIGS = 6;
const BEST_KEY = 'sigade-eest-pogene:parim-aeg';

const mesh = {
  hedgehog: models.hedgehog(),
  ball: models.hedgehogBall(),
  pig: models.pig(),
  apple: models.apple(),
  shadow: models.shadow(),
};

// The meadow is the same every time, so it can be learned.
const trees = makeTrees(24, random(2026));
const fir = models.fir();
const leafy = models.leafyTree();
const outside = random(99);
const scenery = [
  { mesh: models.fence(SIZE) },
  ...trees.map((tree, i) => ({ mesh: i % 3 ? fir : leafy, x: tree.x, z: tree.z, scale: tree.size, rotY: i })),
  ...Array.from({ length: 36 }, (_, i) => {
    const angle = outside() * Math.PI * 2;
    const distance = SIZE + 4 + outside() * 18;
    return { mesh: i % 2 ? fir : leafy, x: Math.sin(angle) * distance, z: Math.cos(angle) * distance, scale: 0.9 + outside() * 0.7, rotY: i };
  }),
];
const groundLayer = [{ mesh: models.ground(SIZE) }];
const treeShadows = trees.map((tree) => ({ mesh: mesh.shadow, x: tree.x, z: tree.z, scale: 2.2 * tree.size }));

const controls = { forward: false, back: false, left: false, right: false, curl: false };
let hog;
let pigs;
let apple;
let apples;
let elapsed;
let nextPig;
let playing = false;
let clock = 0;
const cam = { yaw: 0 };

// Short beeps made with Web Audio; sound starts only after the first tap.
let audio = null;
function tone(freq, length, type = 'square', delay = 0) {
  if (!audio) return;
  const start = audio.currentTime + delay;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.06, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + length);
  osc.connect(gain).connect(audio.destination);
  osc.start(start);
  osc.stop(start + length);
}
const sound = {
  apple() { tone(660, 0.1); tone(990, 0.16, 'square', 0.08); },
  curl() { tone(320, 0.18, 'triangle'); },
  bump() { tone(200, 0.25, 'triangle'); tone(150, 0.2, 'triangle', 0.1); },
  oink() { tone(170, 0.12, 'sawtooth'); tone(140, 0.16, 'sawtooth', 0.14); },
  win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.22, 'square', i * 0.12)); },
  lose() { tone(140, 0.5, 'sawtooth'); },
};

function readBest() {
  try {
    const value = Number(localStorage.getItem(BEST_KEY));
    return value > 0 ? value : null;
  } catch {
    return null;
  }
}

function saveBest(value) {
  try {
    localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // no storage (private mode): the best time is simply not kept
  }
}

function newPig() {
  const spot = freeSpot(Math.random, trees, [hog, ...pigs], 10);
  return { ...spot, heading: 0, stun: 0, knock: 0, bob: Math.random() * 6 };
}

function setupRound() {
  hog = { x: 0, z: 0, heading: 0, curl: 0, cooldown: 0, moving: false };
  pigs = [];
  pigs.push(newPig());
  pigs.push(newPig());
  apple = freeSpot(Math.random, trees, [hog, ...pigs], 5);
  apples = 0;
  elapsed = 0;
  nextPig = NEW_PIG_EVERY;
  cam.yaw = 0;
}

function start() {
  if (!audio && window.AudioContext) {
    try { audio = new AudioContext(); } catch { audio = null; }
  }
  audio?.resume();
  setupRound();
  playing = true;
  overlay.classList.remove('nahtav');
}

function endGame(won) {
  playing = false;
  if (won) {
    const time = Math.round(elapsed);
    const best = Math.min(time, readBest() ?? Infinity);
    saveBest(best);
    title.textContent = 'Said kõik õunad! 🎉';
    guide.textContent = `Aega kulus ${time} sekundit. Sinu parim aeg: ${best} sekundit.`;
    sound.win();
  } else {
    title.textContent = 'Siga sai su kätte! 🐷';
    guide.textContent = `Korjasid ${apples} õuna. Proovi uuesti ja keera end õigel hetkel kerra!`;
    sound.lose();
  }
  startButton.textContent = 'Mängi uuesti';
  overlay.classList.add('nahtav');
}

function update(dt) {
  if (!playing) return;
  elapsed += dt;
  hog.curl = Math.max(0, hog.curl - dt);
  hog.cooldown = Math.max(0, hog.cooldown - dt);
  if (controls.curl && hog.cooldown === 0) {
    hog.curl = CURL_TIME;
    hog.cooldown = CURL_COOLDOWN;
    sound.curl();
  }

  hog.moving = false;
  if (hog.curl === 0) {
    if (controls.left) hog.heading -= TURN_SPEED * dt;
    if (controls.right) hog.heading += TURN_SPEED * dt;
    const speed = (controls.forward ? RUN_SPEED : 0) - (controls.back ? BACK_SPEED : 0);
    if (speed) {
      Object.assign(hog, step(hog, Math.sin(hog.heading) * speed * dt, Math.cos(hog.heading) * speed * dt, HOG_RADIUS, trees));
      hog.moving = true;
    }
  }

  // Pigs get a little faster all the time, and a new one comes every few seconds.
  const pigStep = Math.min(2.2 + elapsed * 0.03, 3.7) * dt;
  for (const pig of pigs) {
    pig.bob += dt * 12;
    if (pig.stun > 0) {
      pig.stun -= dt;
      pig.heading += dt * 9; // dizzy
      if (pig.knock > 0) {
        pig.knock -= dt;
        Object.assign(pig, knockBack(pig, hog, 11 * dt, trees, PIG_RADIUS));
      }
    } else {
      Object.assign(pig, chase(pig, hog, pigStep, trees, PIG_RADIUS));
    }
  }
  separate(pigs, 1.1, trees, PIG_RADIUS);
  if (elapsed >= nextPig && pigs.length < MAX_PIGS) {
    pigs.push(newPig());
    nextPig += NEW_PIG_EVERY;
    sound.oink();
  }

  // A curled-up hedgehog cannot be caught: its quills push the pig away.
  for (const pig of pigs) {
    if (!isCaught(hog, pig, hog.curl > 0 ? 1.15 : 0.85)) continue;
    if (hog.curl > 0) {
      if (pig.knock <= 0) sound.bump();
      pig.stun = 1.8;
      pig.knock = 0.3;
    } else if (pig.stun <= 0) {
      endGame(false);
      return;
    }
  }

  if (Math.hypot(hog.x - apple.x, hog.z - apple.z) < 0.85) {
    apples += 1;
    sound.apple();
    if (apples >= GOAL) {
      endGame(true);
      return;
    }
    apple = freeSpot(Math.random, trees, [hog, ...pigs], 6);
  }
}

function hud() {
  appleLabel.textContent = `🍎 ${apples}/${GOAL}`;
  timeLabel.textContent = `⏱ ${Math.floor(elapsed)} s`;
  curlLabel.textContent = hog.cooldown > 0 ? `🦔 ${Math.ceil(hog.cooldown)}` : '🦔 valmis';
}

function draw(dt) {
  if (playing) {
    const turn = Math.atan2(Math.sin(hog.heading - cam.yaw), Math.cos(hog.heading - cam.yaw));
    cam.yaw += turn * Math.min(1, dt * 5);
  } else {
    cam.yaw += dt * 0.25; // slowly circle the hedgehog between rounds
  }
  const camera = {
    x: hog.x - Math.sin(cam.yaw) * 4.6,
    y: 2.4,
    z: hog.z - Math.cos(cam.yaw) * 4.6,
    yaw: cam.yaw,
    pitch: 0.36,
  };

  const curled = hog.curl > 0;
  const hogObject = {
    mesh: curled ? mesh.ball : mesh.hedgehog,
    x: hog.x,
    z: hog.z,
    y: hog.moving ? Math.abs(Math.sin(clock * 14)) * 0.06 : 0,
    rotY: curled ? clock * 14 : hog.heading,
  };
  const pigObjects = pigs.map((pig) => ({ mesh: mesh.pig, x: pig.x, z: pig.z, y: Math.abs(Math.sin(pig.bob)) * 0.08, rotY: pig.heading }));
  const appleObject = { mesh: mesh.apple, x: apple.x, z: apple.z, y: 0.15 + Math.sin(clock * 3) * 0.1, rotY: clock * 2 };
  const shadows = [
    ...treeShadows,
    { mesh: mesh.shadow, x: hog.x, z: hog.z, scale: 1.1 },
    { mesh: mesh.shadow, x: apple.x, z: apple.z, scale: 0.6 },
    ...pigs.map((pig) => ({ mesh: mesh.shadow, x: pig.x, z: pig.z, scale: 1.5 })),
  ];
  render(ctx, camera, [groundLayer, shadows, [...scenery, hogObject, appleObject, ...pigObjects]]);
}

// Keep the canvas sharp on any screen without making it too heavy to draw.
function fitCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.round(Math.min(canvas.clientWidth * ratio, 1280)) || 800;
  if (canvas.width !== width) {
    canvas.width = width;
    canvas.height = Math.round(width * 9 / 16);
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  clock += dt;
  fitCanvas();
  update(dt);
  hud();
  draw(dt);
  requestAnimationFrame(frame);
}

const keyMap = {
  ArrowUp: 'forward', w: 'forward', W: 'forward',
  ArrowDown: 'back', s: 'back', S: 'back',
  ArrowLeft: 'left', a: 'left', A: 'left',
  ArrowRight: 'right', d: 'right', D: 'right',
  ' ': 'curl',
};
window.addEventListener('keydown', (event) => {
  if (!playing && (event.key === 'Enter' || event.key === ' ') && event.target !== startButton) {
    event.preventDefault();
    start();
    return;
  }
  const action = keyMap[event.key];
  if (action) {
    controls[action] = true;
    event.preventDefault();
  }
});
window.addEventListener('keyup', (event) => {
  const action = keyMap[event.key];
  if (action) {
    controls[action] = false;
    event.preventDefault();
  }
});
window.addEventListener('blur', () => {
  for (const action of Object.keys(controls)) controls[action] = false;
});

document.querySelectorAll('#nupud button').forEach((button) => {
  const action = button.dataset.key;
  const down = (event) => { event.preventDefault(); controls[action] = true; button.classList.add('vajutatud'); };
  const up = (event) => { event.preventDefault(); controls[action] = false; button.classList.remove('vajutatud'); };
  button.addEventListener('pointerdown', down);
  button.addEventListener('pointerup', up);
  button.addEventListener('pointercancel', up);
  button.addEventListener('pointerleave', up);
});

startButton.addEventListener('click', () => {
  if (!playing) start();
});

setupRound();
requestAnimationFrame(frame);
