// Drawing of the arena and of the anime fighters. The fighters are the
// characters the children drew; everything else is drawn with canvas shapes.

export const COLORS = ['#e8364f', '#2f7df6', '#f5a623', '#21b573', '#9b51e0', '#ff5fa8', '#13b5c6', '#ff7a2e'];

const INK = '#1d1430';
const SKIN = '#f9dccb';
const HAIR = '#2a2140';
const PANTS = '#2d3557';

function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const part = (value) => Math.round(value * amount);
  return `rgb(${part(n >> 16)}, ${part((n >> 8) & 255)}, ${part(n & 255)})`;
}

function mix(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

function path(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (const [x, y] of points.slice(1)) ctx.lineTo(x, y);
}

// A limb: a thick coloured line with a dark outline.
function limb(ctx, points, width, color) {
  path(ctx, points);
  ctx.strokeStyle = INK;
  ctx.lineWidth = width + 3;
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function shape(ctx, points, fill) {
  path(ctx, points);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function dot(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function star(ctx, x, y, outer, inner, points) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i += 1) {
    const r = i % 2 ? inner : outer;
    const a = (Math.PI * i) / points - Math.PI / 2;
    ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  ctx.closePath();
}

function leg(ctx, hip, knee, foot) {
  limb(ctx, [hip, knee, foot], 8, PANTS);
  limb(ctx, [[foot[0] - 2, foot[1] - 2], [foot[0] + 6, foot[1] - 2]], 5, '#fff');
}

function arm(ctx, shoulder, elbow, hand, color) {
  limb(ctx, [shoulder, elbow], 7, color);
  limb(ctx, [elbow, hand], 5.5, SKIN);
  dot(ctx, hand[0], hand[1], 4, SKIN);
}

// Face with a pointed anime chin, seen from three quarters.
function face(ctx, x, y) {
  ctx.beginPath();
  ctx.moveTo(x - 8, y - 3);
  ctx.quadraticCurveTo(x - 8, y + 6, x + 3, y + 10);
  ctx.quadraticCurveTo(x + 8, y + 6, x + 8.5, y - 3);
  ctx.arc(x + 0.25, y - 3, 8.25, 0, Math.PI, true);
  ctx.closePath();
  ctx.fillStyle = SKIN;
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x - 4, y + 1, 2, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

// Spiky hair swept back, with a fringe over the forehead.
function hair(ctx, x, y) {
  const cx = x - 1;
  const cy = y - 4;
  const points = [];
  for (let i = 0; i <= 12; i += 1) {
    const a = -0.3 - (i / 12) * (Math.PI + 0.9);
    const r = i % 2 ? 10 : 16;
    points.push([cx + Math.cos(a) * r - (i % 2 ? 0 : 3), cy + Math.sin(a) * r]);
  }
  points.push([x - 5, y + 2], [x - 1, y - 5], [x + 1, y - 3], [x + 3, y - 6], [x + 5, y - 3.5], [x + 7, y - 6], [x + 9, y - 3]);
  shape(ctx, points, HAIR);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 9, -2.4, -1.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 12, -2.2, -1.85);
  ctx.stroke();
}

// A comic-book impact burst with a sound word in it.
function impact(ctx, x, y, size, word) {
  star(ctx, x, y, size, size * 0.55, 10);
  ctx.fillStyle = '#fff36b';
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.font = `1000 ${Math.round(size * 0.45)}px ui-rounded, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#fff';
  ctx.strokeText(word, x, y);
  ctx.fillStyle = '#e8364f';
  ctx.fillText(word, x, y);
}

// Anime focus lines from the edges of the screen, shown when you are hit.
export function drawFocusLines(ctx, width, height, strength, time) {
  if (strength <= 0) return;
  ctx.save();
  ctx.fillStyle = `rgba(29, 20, 48, ${0.55 * strength})`;
  const cx = width / 2;
  const cy = height / 2;
  const far = Math.hypot(width, height);
  const turn = Math.floor(time / 60);
  for (let i = 0; i < 48; i += 1) {
    const a = (i / 48) * Math.PI * 2 + ((i * 7 + turn) % 5) * 0.01;
    const inner = far * (0.32 + (((i * 13 + turn) % 7) / 7) * 0.1);
    const spread = 0.012 + (i % 3) * 0.006;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
    ctx.lineTo(cx + Math.cos(a - spread) * far, cy + Math.sin(a - spread) * far);
    ctx.lineTo(cx + Math.cos(a + spread) * far, cy + Math.sin(a + spread) * far);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function features(ctx, x, y, eyeColor, mood) {
  ctx.strokeStyle = INK;
  if (mood === 'down') {
    ctx.lineWidth = 1.5;
    path(ctx, [[x + 2.5, y], [x + 6.5, y]]);
    ctx.stroke();
    path(ctx, [[x - 2.5, y], [x + 0.5, y]]);
    ctx.stroke();
  } else if (mood === 'hurt') {
    // Eyes squeezed shut.
    ctx.lineWidth = 1.5;
    path(ctx, [[x + 2.5, y - 2.5], [x + 5.5, y], [x + 2.5, y + 2]]);
    ctx.stroke();
    path(ctx, [[x + 0.5, y - 2.5], [x - 2, y], [x + 0.5, y + 2]]);
    ctx.stroke();
  } else {
    // Big shiny anime eyes: a coloured iris that fades lighter at the
    // bottom, two white sparkles and a thick upper lash line.
    for (const [ex, rx] of [[x + 4.6, 2.6], [x - 1, 1.9]]) {
      ctx.beginPath();
      ctx.ellipse(ex, y, rx, 3.9, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      const iris = ctx.createLinearGradient(0, y - 3, 0, y + 3.5);
      iris.addColorStop(0, shade(eyeColor, 0.55));
      iris.addColorStop(1, eyeColor);
      ctx.beginPath();
      ctx.ellipse(ex + 0.3, y + 0.3, rx * 0.8, 3.3, 0, 0, Math.PI * 2);
      ctx.fillStyle = iris;
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(ex + 0.3, y + 0.3, rx * 0.38, 1.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = INK;
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(ex + 0.9, y - 1.4, rx * 0.38, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ex - 0.5, y + 1.9, rx * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(ex, y, rx + 0.2, 4, 0, Math.PI * 1.1, Math.PI * 1.95);
      ctx.stroke();
    }
    ctx.lineWidth = 1.3;
    path(ctx, [[x + 2.5, y - 6], [x + 7, y - 5.4]]);
    ctx.stroke();
    path(ctx, [[x - 2.5, y - 5.8], [x + 0.5, y - 6.2]]);
    ctx.stroke();
  }
  // Pink blush on the cheeks.
  ctx.fillStyle = 'rgba(255, 110, 150, 0.4)';
  for (const bx of [x + 5.5, x - 2]) {
    ctx.beginPath();
    ctx.ellipse(bx, y + 4, 1.8, 1, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (mood === 'shout' || mood === 'hurt') {
    ctx.beginPath();
    ctx.ellipse(x + 4, y + 6, 1.6, 1.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#b8324f';
    ctx.fill();
  } else {
    ctx.lineWidth = 1.2;
    path(ctx, [[x + 2.5, y + 6], [x + 5, y + 5.6]]);
    ctx.stroke();
  }
}

// The characters the children drew themselves, cut out of their paper.
// Until a picture has loaded, the drawn stand-in is shown instead.
export const CHARACTERS = [
  { file: 'tuletegelane.webp', height: 135, power: 'fire', glow: '#ff7a2e' },
  { file: 'vikatitegelane.webp', height: 150, power: 'scythe', glow: '#b48cff' },
  { file: 'nugategelane.webp', height: 145, power: 'knives', glow: '#7fd3ff' },
  { file: 'rusikategelane.webp', height: 150, power: 'punch', glow: '#ff4a3d' },
];
for (const hero of CHARACTERS) {
  hero.picture = new Image();
  hero.picture.src = new URL(`tegelased/${hero.file}`, import.meta.url).href;
}

function hasPicture(hero) {
  return hero.picture.complete && hero.picture.naturalWidth > 0;
}

// A flickering fire blast: red outside, orange in between, yellow in the middle.
function flame(ctx, x, y, length, size, time) {
  for (const [color, k] of [['#e8364f', 1], ['#ff8a1f', 0.7], ['#ffe45c', 0.4]]) {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i <= 6; i += 1) {
      const t = i / 6;
      const r = size * k * (0.45 + Math.sin(t * Math.PI) * 0.75) * (1 + Math.sin(time / 45 + i * 1.7) * 0.15);
      const fx = x + length * t;
      const fy = y + Math.sin(time / 60 + i) * 2;
      ctx.moveTo(fx + r, fy);
      ctx.arc(fx, fy, r, 0, Math.PI * 2);
    }
    ctx.fill();
  }
  ctx.fillStyle = '#fff2a8';
  for (let i = 0; i < 6; i += 1) {
    const t = (time / 350 + i / 6) % 1;
    ctx.beginPath();
    ctx.arc(x + length * t, y - 10 - t * 18 + Math.sin(time / 50 + i) * 5, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// A silver half-moon swoosh in front of the fighter, as the scythe swings
// from above the head down towards the floor. swing goes from 0 to 1.
function slash(ctx, swing) {
  const cx = 6;
  const cy = -78;
  const r = 62;
  const end = -1.6 + swing * 2.6;
  const start = Math.max(-1.9, end - 1.6);
  ctx.beginPath();
  ctx.arc(cx, cy, r, start, end);
  ctx.arc(cx + 8, cy, r - 14, end, start, true);
  ctx.closePath();
  const shine = ctx.createRadialGradient(cx, cy, r - 18, cx, cy, r);
  shine.addColorStop(0, 'rgba(180, 140, 255, 0)');
  shine.addColorStop(0.6, 'rgba(200, 175, 255, 0.7)');
  shine.addColorStop(1, 'rgba(255, 255, 255, 0.95)');
  ctx.fillStyle = shine;
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, start, end);
  ctx.stroke();
  star(ctx, cx + Math.cos(end) * r, cy + Math.sin(end) * r, 9, 3, 4);
  ctx.fillStyle = '#fff';
  ctx.fill();
}

// Two quick silver cuts that cross like an X in front of the fighter, one
// from each hand-held blade, the second a moment after the first.
// swing goes from 0 to 1.
function knives(ctx, swing) {
  const cx = 34;
  const cy = -86;
  const r = 26;
  for (const [dir, delay] of [[1, 0], [-1, 0.25]]) {
    const t = Math.min(1, (swing - delay) / 0.75);
    if (t <= 0) continue;
    const from = [cx - r, cy - r * dir];
    const to = [from[0] + 2 * r * t, from[1] + 2 * r * dir * t];
    ctx.strokeStyle = 'rgba(170, 220, 255, 0.75)';
    ctx.lineWidth = 7;
    path(ctx, [from, to]);
    ctx.stroke();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2.5;
    path(ctx, [from, to]);
    ctx.stroke();
    star(ctx, to[0], to[1], 8, 3, 4);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }
}

// A red boxing fist that shoots forward and hits with a yellow POW star.
// swing goes from 0 to 1.
function fist(ctx, swing) {
  const out = Math.sin(Math.min(1, swing) * Math.PI);
  const x = 16 + 46 * out;
  const y = -78;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 3;
  for (const dy of [-8, 0, 8]) {
    path(ctx, [[x - 30 * out, y + dy], [x - 12, y + dy]]);
    ctx.stroke();
  }
  if (swing > 0.35 && swing < 0.85) {
    star(ctx, x + 14, y, 26, 12, 8);
    ctx.fillStyle = '#ffe45c';
    ctx.fill();
  }
  shape(ctx, [[x - 12, y - 11], [x + 8, y - 13], [x + 15, y - 4], [x + 13, y + 9], [x - 2, y + 12], [x - 12, y + 9]], '#d8342c');
  shape(ctx, [[x - 16, y - 9], [x - 10, y - 9], [x - 10, y + 9], [x - 16, y + 9]], '#a51f1f');
}

// The fire character's super power: a chunky fire pistol held out in front
// while it flies, and a long blast of fire shot from it a moment later.
const SUPER_SHOT = 0.27;

function firePistol(ctx, x, y) {
  shape(ctx, [[x, y - 5], [x + 24, y - 5], [x + 24, y + 2], [x + 9, y + 2], [x + 6, y + 12], [x - 1, y + 12], [x, y + 2]], '#e8364f');
  shape(ctx, [[x + 20, y - 7], [x + 27, y - 7], [x + 27, y + 4], [x + 20, y + 4]], '#ffc92f');
}

function fireBeam(ctx, x, y, length, time) {
  for (let k = 0; k < 3; k += 1) flame(ctx, x + (k * length) / 3, y, length / 3, 15, time + k * 170);
}

function drawPicture(ctx, hero, { punch, attack, hurt, breath, step, time, flight }) {
  const { picture } = hero;
  const h = hero.height;
  const w = (h * picture.naturalWidth) / picture.naturalHeight;
  ctx.save();
  ctx.translate(0, breath - Math.abs(step) * 4);
  ctx.rotate(punch * 0.08 - hurt * 0.1);
  if (attack > 0) {
    ctx.shadowColor = hero.glow;
    ctx.shadowBlur = 24 * attack;
  }
  // The fire wings breathe a little, as if they were flapping; in flight they flap fast.
  if (hero.power === 'fire') ctx.scale(1 + (flight > 0 ? Math.sin(time / 60) * 0.1 : Math.sin(time / 260) * 0.03), 1);
  ctx.drawImage(picture, -w / 2, -h, w, h);
  ctx.restore();
  if (attack > 0.05) {
    ctx.save();
    ctx.globalAlpha *= Math.min(1, attack * 2);
    if (hero.power === 'fire') flame(ctx, 14, -72 + breath, 70 * punch, 13, time);
    else if (hero.power === 'scythe') slash(ctx, 1 - attack);
    else if (hero.power === 'punch') fist(ctx, 1 - attack);
    else knives(ctx, 1 - attack);
    ctx.restore();
  }
  if (flight > 0) {
    firePistol(ctx, 24, -80 + breath);
    const shot = 1 - flight - SUPER_SHOT;
    if (shot > 0 && flight > 0.08) fireBeam(ctx, 51, -81 + breath, 210 * Math.min(1, shot / 0.1), time);
  }
}

// The drawn stand-in fighter, used while the picture is loading.
function standIn(ctx, color, lean, breath, step, punch, attack, mood) {
  const sb = [-6 + lean, -97 + breath];
  const sf = [7 + lean, -97 + breath];
  // Back arm and leg first, so the body covers them.
  arm(ctx, sb, [sb[0] + 3, -79 + breath], [sb[0] + 14, -90 + breath], shade(color, 0.75));
  leg(ctx, [-4, -62], [-9 - step * 6, -31], [-15 - step * 12, 0]);
  // Jacket with a darker back half, a collar and a belt.
  shape(ctx, [[-11 + lean, -100 + breath], [12 + lean, -100 + breath], [8, -60], [-8, -60]], color);
  path(ctx, [[-11 + lean, -100 + breath], [-2 + lean, -100 + breath], [-3, -60], [-8, -60]]);
  ctx.closePath();
  ctx.fillStyle = shade(color, 0.8);
  ctx.fill();
  shape(ctx, [[-1 + lean, -100 + breath], [5 + lean, -100 + breath], [2 + lean * 0.6, -88 + breath]], '#fff');
  limb(ctx, [[-8.5, -63], [8.5, -63]], 3, INK);
  leg(ctx, [5, -62], [13 + step * 6, -32], [17 + step * 12, 0]);
  limb(ctx, [[1 + lean, -99 + breath], [2 + lean, -104 + breath]], 4, SKIN);
  const hx = 2 + lean * 1.2;
  const hy = -114 + breath;
  face(ctx, hx, hy);
  hair(ctx, hx, hy);
  features(ctx, hx, hy, color, mood);
  // Front arm: guard up, or a straight punch.
  const elbow = mix([sf[0] + 9, -80 + breath], [sf[0] + 20, -95 + breath], punch);
  const hand = mix([sf[0] + 15, -95 + breath], [sf[0] + 40, -96 + breath], punch);
  if (punch > 0.2) {
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.9 * punch})`;
    ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i += 1) {
      path(ctx, [[hand[0] - 30, hand[1] + i * 5], [hand[0] - 8, hand[1] + i * 5]]);
      ctx.stroke();
    }
  }
  arm(ctx, sf, elbow, hand, color);
  if (attack > 0.4) {
    star(ctx, hand[0] + 9, hand[1], 11 * attack + 3, 5 * attack + 1, 8);
    ctx.fillStyle = '#fff7b0';
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// Draws one fighter standing with its feet at (x, y).
export function drawFighter(ctx, character, x, y, options = {}) {
  const { facing = 1, scale = 1, attack = 0, hurt = 0, time = 0, walking = false, label = '', hp = null, me = false, down = false, flight = 0 } = options;
  const color = COLORS[character.v] ?? COLORS[0];
  const hero = CHARACTERS[character.p] ?? CHARACTERS[0];
  const pictured = hasPicture(hero);
  const punch = attack > 0.55 ? 1 : attack / 0.55;
  const step = walking && !down ? Math.sin(time / 85) : 0;
  const breath = down ? 0 : Math.sin(time / 420) * 1.2;
  const lean = punch * 5 - hurt * 5;
  // Flying up during the super power and landing again at its end.
  const lift = down ? 0 : 70 * Math.min(1, (1 - flight) / 0.15, flight / 0.15);
  const mood = down ? 'down' : hurt > 0.4 ? 'hurt' : punch > 0.3 ? 'shout' : '';

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.fillStyle = 'rgba(29, 20, 48, 0.2)';
  ctx.beginPath();
  ctx.ellipse(down ? -55 * facing : 0, 0, down ? 62 : 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  if (me && !down) {
    ctx.strokeStyle = '#ffd23f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 28, 8, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.translate(0, -lift);
  ctx.scale(facing, 1);
  if (down) {
    ctx.translate(0, -5);
    ctx.rotate(-Math.PI / 2);
  }
  if (hurt > 0 && Math.floor(time / 70) % 2 === 0) ctx.globalAlpha = 0.5;

  if (pictured) drawPicture(ctx, hero, { punch, attack, hurt, breath, step, time, flight });
  else standIn(ctx, color, lean, breath, step, punch, attack, mood);
  ctx.restore();

  if (hurt > 0.45 && !down) {
    ctx.save();
    impact(ctx, x - facing * 18 * scale, y - (120 + lift) * scale, 26 * scale * (0.7 + hurt * 0.5), 'PAUH!');
    ctx.restore();
  }

  if (hp !== null) {
    const top = y - (lift + (down ? 40 : pictured ? hero.height + 15 : 140)) * scale;
    ctx.save();
    ctx.fillStyle = INK;
    ctx.fillRect(x - 21, top, 42, 7);
    ctx.fillStyle = hp > 50 ? '#39df8f' : hp > 25 ? '#ffc92f' : '#ff4f6d';
    ctx.fillRect(x - 20, top + 1, 40 * (hp / 100), 5);
    if (label) {
      ctx.font = '900 13px ui-rounded, sans-serif';
      ctx.textAlign = 'center';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#fff';
      ctx.strokeText(label, x, top - 4);
      ctx.fillStyle = INK;
      ctx.fillText(label, x, top - 4);
    }
    ctx.restore();
  }
}

// The fire character's ultra power: a red ring of fire around its feet with
// sparks swirling round it and rising up.
export function drawUltraRing(ctx, x, y, scale, time) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const pulse = 1 + Math.sin(time / 120) * 0.06;
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = '#ff2a3d';
  ctx.beginPath();
  ctx.ellipse(0, -4, 95 * pulse, 30 * pulse, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#c4102a';
  ctx.stroke();
  for (let k = 0; k < 12; k += 1) {
    const a = time / 280 + (k * Math.PI * 2) / 12;
    const rise = (time / 9 + k * 37) % 60;
    dot(ctx, Math.cos(a) * 92, -4 + Math.sin(a) * 28 - rise, 7 - rise / 12, k % 2 ? '#ff4a3d' : '#ffd23f');
  }
  ctx.restore();
}

function cloud(ctx, x, y) {
  for (const [dx, dy, rx, ry] of [[0, 0, 34, 11], [18, -8, 20, 12], [-14, -5, 16, 9]]) {
    ctx.beginPath();
    ctx.ellipse(x + dx, y + dy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawArena(ctx, width, height, time) {
  const horizon = 150;
  ctx.save();
  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, '#8f7bff');
  sky.addColorStop(0.45, '#ff9ec7');
  sky.addColorStop(1, '#ffd98a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, horizon);

  // Big anime sun with slowly turning rays.
  const sunX = width * 0.72;
  const sunY = 92;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, width, horizon);
  ctx.clip();
  ctx.fillStyle = 'rgba(255, 246, 190, 0.35)';
  for (let i = 0; i < 16; i += 1) {
    const a = (i / 16) * Math.PI * 2 + time / 9000;
    ctx.beginPath();
    ctx.moveTo(sunX, sunY);
    ctx.lineTo(sunX + Math.cos(a - 0.08) * 400, sunY + Math.sin(a - 0.08) * 400);
    ctx.lineTo(sunX + Math.cos(a + 0.08) * 400, sunY + Math.sin(a + 0.08) * 400);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  ctx.fillStyle = '#ffe96b';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 44, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff8c8';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 32, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  for (let i = 0; i < 5; i += 1) {
    cloud(ctx, ((i * 170 + time * 0.01 * (1 + (i % 2))) % (width + 160)) - 80, 30 + ((i * 37) % 60));
  }

  // Far mountains and near hills.
  ctx.fillStyle = '#b5c9f2';
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  for (const [px, py] of [[0, 110], [90, 70], [180, 105], [280, 60], [380, 100], [470, 75], [560, 108], [640, 80]]) ctx.lineTo((px * width) / 640, py);
  ctx.lineTo(width, horizon);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#9edcae';
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  for (let x = 0; x < width; x += 80) ctx.quadraticCurveTo(x + 40, horizon - 28, x + 80, horizon);
  ctx.closePath();
  ctx.fill();

  // A pink blossom tree at the edge of the arena.
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#6b3b4f';
  ctx.lineWidth = 9;
  path(ctx, [[46, horizon + 4], [50, horizon - 40], [38, horizon - 70]]);
  ctx.stroke();
  ctx.lineWidth = 5;
  path(ctx, [[50, horizon - 40], [74, horizon - 66]]);
  ctx.stroke();
  for (const [bx, by, br, c] of [[30, -78, 24, '#ffb3d9'], [62, -86, 28, '#ff9fd0'], [86, -64, 20, '#ffc4e1'], [12, -58, 18, '#ffc4e1'], [48, -104, 20, '#ffd6ea']]) {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(bx, horizon + by, br, 0, Math.PI * 2);
    ctx.fill();
  }

  // Wooden dojo floor in perspective, with a red ring.
  const floor = ctx.createLinearGradient(0, horizon, 0, height);
  floor.addColorStop(0, '#f6d6a2');
  floor.addColorStop(1, '#d9a066');
  ctx.fillStyle = floor;
  ctx.fillRect(0, horizon, width, height - horizon);
  ctx.strokeStyle = 'rgba(125, 72, 30, 0.25)';
  ctx.lineWidth = 1.5;
  for (let i = -12; i <= 12; i += 1) {
    path(ctx, [[width / 2 + i * 28, horizon], [width / 2 + i * 95, height]]);
    ctx.stroke();
  }
  for (let k = 1; k < 8; k += 1) {
    const y = horizon + (height - horizon) * (k / 8) ** 1.7;
    path(ctx, [[0, y], [width, y]]);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(232, 54, 79, 0.5)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(width / 2, horizon + (height - horizon) * 0.55, width * 0.38, (height - horizon) * 0.36, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  path(ctx, [[0, horizon], [width, horizon]]);
  ctx.stroke();

  // Falling blossom petals.
  ctx.fillStyle = '#ff9fd6';
  for (let i = 0; i < 14; i += 1) {
    const px = ((i * 97 + time * 0.03 * (1 + (i % 3))) % (width + 40)) - 20;
    const py = (i * 61 + time * 0.025 * (1 + (i % 2))) % height;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(time / 600 + i);
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 2.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}
