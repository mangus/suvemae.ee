import { chasePlayer, isCaught, isWall, movePlayer } from './game-core.mjs';

const canvas = document.getElementById('vaade');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('teade');
const title = document.getElementById('pealkiri');
const guide = document.getElementById('juhis');
const startButton = document.getElementById('alusta');
const timeLabel = document.getElementById('aeg');
const distanceLabel = document.getElementById('kaugus');

const map = [
  '################',
  '#......#.......#',
  '#.##...#..##...#',
  '#..............#',
  '#...###........#',
  '#.........###..#',
  '#..#...........#',
  '#..#..####.....#',
  '#..............#',
  '#.....#....##..#',
  '#.###.#........#',
  '#.....#..###...#',
  '#..............#',
  '#...####.......#',
  '#..............#',
  '################',
];

const FOV = Math.PI / 3;
const RAYS = 240;
const WIN_TIME = 45;
const controls = { forward: false, back: false, left: false, right: false };
let player;
let pigs;
let playing = false;
let startedAt = 0;
let lastFrame = performance.now();
let depth = [];

function resetGame() {
  player = { x: 2.5, y: 2.5, angle: 0.15 };
  pigs = [
    { x: 13.5, y: 2.5, bob: 0 },
    { x: 3.5, y: 12.5, bob: 2 },
    { x: 12.5, y: 13.5, bob: 4 },
  ];
  startedAt = performance.now();
  playing = true;
  overlay.classList.remove('nahtav');
}

function endGame(won) {
  playing = false;
  title.textContent = won ? 'Sa pääsesid! 🎉' : 'Siga sai su kätte! 🐷';
  guide.textContent = won ? 'Pidasid 45 sekundit vastu. Väga osav põgenemine!' : 'Proovi uuesti ja kasuta seinu, et sigade eest ära pöörata.';
  startButton.textContent = 'Mängi uuesti';
  overlay.classList.add('nahtav');
}

function normalizeAngle(angle) {
  while (angle < -Math.PI) angle += Math.PI * 2;
  while (angle > Math.PI) angle -= Math.PI * 2;
  return angle;
}

function castRay(angle) {
  const step = 0.025;
  let distance = 0;
  let x = player.x;
  let y = player.y;
  while (distance < 22) {
    distance += step;
    x = player.x + Math.cos(angle) * distance;
    y = player.y + Math.sin(angle) * distance;
    if (isWall(map, x, y)) return { distance, x, y };
  }
  return { distance: 22, x, y };
}

function drawWorld() {
  const w = canvas.width;
  const h = canvas.height;
  const sky = ctx.createLinearGradient(0, 0, 0, h / 2);
  sky.addColorStop(0, '#79c9ff');
  sky.addColorStop(1, '#d8f4ff');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h / 2);
  const ground = ctx.createLinearGradient(0, h / 2, 0, h);
  ground.addColorStop(0, '#80bd50');
  ground.addColorStop(1, '#244d2f');
  ctx.fillStyle = ground;
  ctx.fillRect(0, h / 2, w, h / 2);

  const strip = w / RAYS;
  depth = new Array(RAYS);
  for (let ray = 0; ray < RAYS; ray += 1) {
    const rayAngle = player.angle - FOV / 2 + ray / RAYS * FOV;
    const hit = castRay(rayAngle);
    const corrected = hit.distance * Math.cos(rayAngle - player.angle);
    depth[ray] = corrected;
    const wallHeight = Math.min(h * 1.8, h / Math.max(corrected, 0.01));
    const texture = Math.abs((hit.x + hit.y) % 1 - 0.5);
    const light = Math.max(28, 72 - corrected * 3 + texture * 18);
    ctx.fillStyle = `hsl(${105 + texture * 30} 38% ${light}%)`;
    ctx.fillRect(ray * strip, (h - wallHeight) / 2, strip + 1, wallHeight);
  }
}

function drawPig(pig, elapsed) {
  const dx = pig.x - player.x;
  const dy = pig.y - player.y;
  const distance = Math.hypot(dx, dy);
  const angle = normalizeAngle(Math.atan2(dy, dx) - player.angle);
  if (Math.abs(angle) > FOV * 0.7) return;
  const screenX = (angle / FOV + 0.5) * canvas.width;
  const rayIndex = Math.max(0, Math.min(RAYS - 1, Math.floor(screenX / canvas.width * RAYS)));
  if (distance > depth[rayIndex] + 0.3) return;
  const size = Math.min(canvas.height * 1.3, canvas.height / distance * 0.95);
  const bob = Math.sin(elapsed * 9 + pig.bob) * size * 0.025;
  const x = screenX;
  const y = canvas.height / 2 + size * 0.14 + bob;

  ctx.save();
  ctx.translate(x, y);
  ctx.lineWidth = Math.max(2, size * 0.025);
  ctx.strokeStyle = '#6b274b';
  ctx.fillStyle = '#ff9eb5';
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.34, size * 0.29, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size*.25, -size*.2); ctx.lineTo(-size*.34, -size*.38); ctx.lineTo(-size*.08, -size*.29);
  ctx.moveTo(size*.25, -size*.2); ctx.lineTo(size*.34, -size*.38); ctx.lineTo(size*.08, -size*.29);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffbfd0';
  ctx.beginPath(); ctx.ellipse(0, size*.06, size*.16, size*.11, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#6b274b';
  ctx.beginPath(); ctx.arc(-size*.055, size*.06, size*.025, 0, Math.PI*2); ctx.arc(size*.055, size*.06, size*.025, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#202033';
  ctx.beginPath(); ctx.arc(-size*.12, -size*.08, size*.025, 0, Math.PI*2); ctx.arc(size*.12, -size*.08, size*.025, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#ffd54f';
  ctx.beginPath(); ctx.arc(-size*.11, -size*.09, size*.008, 0, Math.PI*2); ctx.arc(size*.13, -size*.09, size*.008, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawPigs(elapsed) {
  [...pigs]
    .sort((a, b) => Math.hypot(b.x-player.x, b.y-player.y) - Math.hypot(a.x-player.x, a.y-player.y))
    .forEach((pig) => drawPig(pig, elapsed));
}

function drawHands(elapsed) {
  const sway = playing ? Math.sin(elapsed * 10) * 8 : 0;
  ctx.fillStyle = '#ffe1bb';
  ctx.strokeStyle = '#5b3b2b';
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.roundRect(canvas.width*.12+sway, canvas.height*.82, canvas.width*.12, canvas.height*.28, 28); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(canvas.width*.76-sway, canvas.height*.82, canvas.width*.12, canvas.height*.28, 28); ctx.fill(); ctx.stroke();
}

function update(dt, elapsed) {
  if (!playing) return;
  const turn = 2.25 * dt;
  if (controls.left) player.angle -= turn;
  if (controls.right) player.angle += turn;
  let motion = 0;
  if (controls.forward) motion += 2.8 * dt;
  if (controls.back) motion -= 2.1 * dt;
  if (motion) {
    const moved = movePlayer(player, Math.cos(player.angle) * motion, Math.sin(player.angle) * motion, map);
    player.x = moved.x; player.y = moved.y;
  }
  const pigSpeed = (0.72 + Math.min(elapsed / 75, 0.32)) * dt;
  pigs = pigs.map((pig) => ({ ...pig, ...chasePlayer(pig, player, pigSpeed, map) }));
  const nearest = Math.min(...pigs.map((pig) => Math.hypot(player.x-pig.x, player.y-pig.y)));
  distanceLabel.textContent = `Lähim siga: ${nearest.toFixed(1)} m`;
  timeLabel.textContent = `Aeg: ${Math.min(WIN_TIME, Math.floor(elapsed))}`;
  if (pigs.some((pig) => isCaught(player, pig))) endGame(false);
  else if (elapsed >= WIN_TIME) endGame(true);
}

function frame(now) {
  const dt = Math.min((now - lastFrame) / 1000, 0.05);
  lastFrame = now;
  const elapsed = playing ? (now - startedAt) / 1000 : 0;
  update(dt, elapsed);
  drawWorld();
  drawPigs(elapsed);
  drawHands(elapsed);
  requestAnimationFrame(frame);
}

const keyMap = {
  ArrowUp: 'forward', w: 'forward', W: 'forward',
  ArrowDown: 'back', s: 'back', S: 'back',
  ArrowLeft: 'left', a: 'left', A: 'left',
  ArrowRight: 'right', d: 'right', D: 'right',
};
window.addEventListener('keydown', (event) => {
  const action = keyMap[event.key];
  if (action) { controls[action] = true; event.preventDefault(); }
});
window.addEventListener('keyup', (event) => {
  const action = keyMap[event.key];
  if (action) { controls[action] = false; event.preventDefault(); }
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

startButton.addEventListener('click', resetGame);
resetGame();
playing = false;
overlay.classList.add('nahtav');
requestAnimationFrame(frame);
