// Drawing of the arena and of the anime fighters. Everything is drawn with
// canvas shapes. The fighters are stand-ins until the children's own
// character pictures are added.

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
    for (const [ex, rx] of [[x + 4.5, 2.3], [x - 1, 1.7]]) {
      ctx.beginPath();
      ctx.ellipse(ex, y, rx, 3, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(ex + 0.3, y + 0.4, rx * 0.75, 2.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = eyeColor;
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(ex + 0.3, y + 0.6, rx * 0.35, 1.2, 0, 0, Math.PI * 2);
      ctx.fillStyle = INK;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ex + 0.9, y - 1, 0.7, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    }
    ctx.lineWidth = 1.3;
    path(ctx, [[x + 2.5, y - 4.6], [x + 7, y - 4]]);
    ctx.stroke();
    path(ctx, [[x - 2.5, y - 4.4], [x + 0.5, y - 4.8]]);
    ctx.stroke();
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

// Draws one fighter standing with its feet at (x, y).
export function drawFighter(ctx, character, x, y, options = {}) {
  const { facing = 1, scale = 1, attack = 0, hurt = 0, time = 0, walking = false, label = '', hp = null, me = false, down = false } = options;
  const color = COLORS[character.v] ?? COLORS[0];
  const punch = attack > 0.55 ? 1 : attack / 0.55;
  const step = walking && !down ? Math.sin(time / 85) : 0;
  const breath = down ? 0 : Math.sin(time / 420) * 1.2;
  const lean = punch * 5 - hurt * 5;
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
  ctx.scale(facing, 1);
  if (down) {
    ctx.translate(0, -5);
    ctx.rotate(-Math.PI / 2);
  }
  if (hurt > 0 && Math.floor(time / 70) % 2 === 0) ctx.globalAlpha = 0.5;

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
  ctx.restore();

  if (hp !== null) {
    const top = y - (down ? 40 : 140) * scale;
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
  sky.addColorStop(0, '#6fc3ff');
  sky.addColorStop(1, '#ffe8d2');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, horizon);

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
