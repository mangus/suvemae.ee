// 2D sprites for Bot Game Studio. They are drawn with canvas shapes, so there are no image files.
// Every sprite is drawn in a 100 x 100 box centred on (0, 0) and scaled to the size asked for.

const INK = '#2b2340';
const TAU = Math.PI * 2;
const RAINBOW = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa'];
let g = null; // the canvas context being drawn on

function paint(color, ink) {
  if (color) {
    g.fillStyle = color;
    g.fill();
  }
  if (ink) {
    g.lineWidth = 4;
    g.strokeStyle = INK;
    g.stroke();
  }
}

function dot(x, y, r, color, ink = true) {
  g.beginPath();
  g.arc(x, y, r, 0, TAU);
  paint(color, ink);
}

function oval(x, y, rx, ry, color, ink = true, turn = 0) {
  g.beginPath();
  g.ellipse(x, y, rx, ry, turn, 0, TAU);
  paint(color, ink);
}

function box(x, y, w, h, color, ink = true) {
  g.beginPath();
  g.rect(x, y, w, h);
  paint(color, ink);
}

function shape(points, color, ink = true) {
  g.beginPath();
  points.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath();
  paint(color, ink);
}

function lines(points, color = INK, width = 4) {
  g.beginPath();
  points.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.lineWidth = width;
  g.strokeStyle = color;
  g.stroke();
}

function star(x, y, r, color, tips = 5, inner = 0.45, ink = true) {
  const points = [];
  for (let i = 0; i < tips * 2; i += 1) {
    const a = (i * Math.PI) / tips - Math.PI / 2;
    const d = i % 2 ? r * inner : r;
    points.push([x + Math.cos(a) * d, y + Math.sin(a) * d]);
  }
  shape(points, color, ink);
}

function smile(x, y, r) {
  g.beginPath();
  g.arc(x, y, r, 0.15 * Math.PI, 0.85 * Math.PI);
  paint(null, true);
}

function face(x, y, r, color) {
  dot(x, y, r, color);
  dot(x - r * 0.32, y - r * 0.15, r * 0.12, INK, false);
  dot(x + r * 0.32, y - r * 0.15, r * 0.12, INK, false);
  smile(x, y + r * 0.1, r * 0.42);
}

function heart(x, y, s, color) {
  g.beginPath();
  g.moveTo(x, y + s * 0.9);
  g.bezierCurveTo(x - s * 1.5, y - s * 0.1, x - s * 0.8, y - s * 1.2, x, y - s * 0.45);
  g.bezierCurveTo(x + s * 0.8, y - s * 1.2, x + s * 1.5, y - s * 0.1, x, y + s * 0.9);
  paint(color, true);
}

function cloud(x, y, s, color) {
  const puffs = [[-0.5, 0.15, 0.45], [0.5, 0.15, 0.45], [0, -0.15, 0.6]];
  for (const [dx, dy, r] of puffs) dot(x + dx * s, y + dy * s, r * s, color);
  // fill again without outlines so the puffs look like one cloud
  for (const [dx, dy, r] of puffs) dot(x + dx * s, y + dy * s, r * s - 2, color, false);
  box(x - 0.5 * s, y, s, 0.6 * s - 2, color, false);
  lines([[x - 0.5 * s, y + 0.6 * s], [x + 0.5 * s, y + 0.6 * s]]);
}

function note(x, y, color) {
  lines([[x + 7, y], [x + 7, y - 30], [x + 18, y - 22]]);
  oval(x, y, 9, 7, color, true, -0.3);
}

const SPRITES = {
  sky() {
    const sky = g.createLinearGradient(0, -40, 0, 40);
    sky.addColorStop(0, '#7cc8ff');
    sky.addColorStop(1, '#e3f5ff');
    box(-40, -40, 80, 80, sky);
    cloud(4, 6, 34, '#fff');
  },
  hero() {
    face(0, 0, 40, '#ffc933');
  },
  sun(t) {
    g.save();
    g.rotate(t * 0.5);
    for (let i = 0; i < 8; i += 1) {
      g.rotate(Math.PI / 4);
      lines([[0, 32], [0, 46]], '#ffa94d', 8);
    }
    g.restore();
    face(0, 0, 28, '#ffd43b');
  },
  clouds() {
    cloud(0, -6, 50, '#fff');
  },
  music(t) {
    const bob = Math.sin(t * 4) * 3;
    note(-14, 22 + bob, '#8c6cf2');
    note(12, 10 - bob, '#ff8fc7');
  },
  jump(t) {
    const hop = Math.abs(Math.sin(t * 3)) * 14;
    oval(-4, 40, 22, 5, 'rgba(43, 35, 64, 0.2)', false);
    face(-4, 8 - hop, 28, '#ffc933');
    box(32, -14, 8, 22, '#69db7c');
    shape([[26, -14], [36, -34], [46, -14]], '#69db7c');
  },
  trees() {
    box(-7, 8, 14, 36, '#a0632b');
    dot(0, -14, 30, '#4cb24c');
    dot(-12, -20, 5, '#2e9b47', false);
    dot(10, -6, 5, '#2e9b47', false);
    dot(8, -26, 4, '#2e9b47', false);
  },
  coins(t) {
    const w = Math.max(0.15, Math.abs(Math.cos(t * 3)));
    oval(0, 0, 36 * w, 36, '#ffd43b');
    oval(0, 0, 24 * w, 24, '#ffe066');
    box(-4 * w, -14, 8 * w, 28, '#f08c00', false);
  },
  hat() {
    box(-24, -38, 48, 60, '#3a3355');
    box(-24, 6, 48, 10, '#ff6b6b');
    oval(0, 24, 42, 9, '#3a3355');
  },
  bird(t) {
    const flap = Math.sin(t * 10) * 10;
    shape([[-24, 0], [-46, -12], [-42, 14]], '#4dabf7');
    oval(0, 4, 30, 22, '#4dabf7');
    shape([[26, -2], [44, 4], [26, 10]], '#ffa94d');
    shape([[-10, 2], [10, 2], [-2, -20 - flap]], '#a5d8ff');
    dot(18, -6, 4, INK, false);
  },
  flowers() {
    lines([[0, 10], [0, 46]], '#2e9b47', 6);
    oval(10, 32, 10, 5, '#69db7c', true, -0.5);
    for (let i = 0; i < 5; i += 1) {
      const a = (i / 5) * TAU;
      dot(Math.cos(a) * 18, -10 + Math.sin(a) * 18, 13, '#ff8fc7');
    }
    dot(0, -10, 11, '#ffd43b');
  },
  pet() {
    oval(-30, -6, 11, 22, '#a0632b', true, 0.3);
    oval(30, -6, 11, 22, '#a0632b', true, -0.3);
    dot(0, 4, 32, '#d9a066');
    dot(-11, -4, 4, INK, false);
    dot(11, -4, 4, INK, false);
    oval(0, 8, 7, 5, INK, false);
    smile(0, 10, 10);
  },
  monster(t) {
    shape([[-26, -20], [-34, -46], [-12, -30]], '#9775fa');
    shape([[26, -20], [34, -46], [12, -30]], '#9775fa');
    dot(0, 4, 36, '#b07cff');
    dot(0, -4, 15, '#fff');
    dot(Math.sin(t * 2) * 5, -4, 7, INK, false);
    smile(0, 8, 18);
  },
  rainbow() {
    RAINBOW.forEach((color, i) => {
      g.beginPath();
      g.arc(0, 26, 44 - i * 7, Math.PI, TAU);
      g.lineWidth = 7.5;
      g.strokeStyle = color;
      g.stroke();
    });
    dot(-38, 28, 11, '#fff');
    dot(38, 28, 11, '#fff');
  },
  house() {
    box(-30, -6, 60, 46, '#ffd8a8');
    shape([[-42, -4], [0, -42], [42, -4]], '#ff6b6b');
    box(-22, 14, 16, 26, '#a0632b');
    box(6, 6, 16, 14, '#a5d8ff');
  },
  hearts(t) {
    const s = 34 * (1 + Math.max(0, Math.sin(t * 5)) * 0.08);
    heart(0, 2, s, '#ff6b6b');
    dot(-14, -12, 5, '#fff', false);
  },
  scores() {
    dot(-28, -16, 12, null, true);
    dot(28, -16, 12, null, true);
    shape([[-28, -36], [28, -36], [18, 4], [-18, 4]], '#ffd43b');
    box(-5, 4, 10, 16, '#ffd43b');
    box(-22, 20, 44, 14, '#c47a2c');
    star(0, -18, 10, '#fff', 5, 0.45, false);
  },
  stars(t) {
    const s = 1 + Math.sin(t * 4) * 0.12;
    star(0, 0, 36 * s, '#ffd43b', 4, 0.32);
    star(30, -30, 13, '#fff3c4', 4, 0.32);
    star(-30, 30, 10, '#fff', 4, 0.32);
  },
  boss() {
    for (const x of [-22, 0, 22]) shape([[x - 10, -20], [x, -48], [x + 10, -20]], '#2e9b62');
    dot(0, 6, 38, '#3fbf7f');
    lines([[-24, -14], [-8, -6]]);
    lines([[24, -14], [8, -6]]);
    dot(-14, 0, 5, INK, false);
    dot(14, 0, 5, INK, false);
    smile(0, 10, 18);
    shape([[-10, 25], [-6, 34], [-2, 26]], '#fff', false);
    shape([[10, 25], [6, 34], [2, 26]], '#fff', false);
  },
  fireworks(t) {
    const r = 32 + Math.sin(t * 4) * 6;
    for (let i = 0; i < 12; i += 1) {
      const a = (i / 12) * TAU;
      const color = RAINBOW[i % RAINBOW.length];
      lines([[Math.cos(a) * 10, Math.sin(a) * 10], [Math.cos(a) * r, Math.sin(a) * r]], color, 5);
      dot(Math.cos(a) * (r + 6), Math.sin(a) * (r + 6), 4, color, false);
    }
    dot(0, 0, 6, '#ffd43b', false);
  },
  levels() {
    shape([[-42, -30], [-14, -38], [14, -30], [42, -38], [42, 30], [14, 38], [-14, 30], [-42, 38]], '#fff3c4');
    g.setLineDash([6, 7]);
    lines([[-30, 24], [-12, 2], [6, 12], [22, -12]], '#ff6b6b', 4);
    g.setLineDash([]);
    lines([[20, -26], [34, -12]], INK, 5);
    lines([[34, -26], [20, -12]], INK, 5);
  },
  castle() {
    box(-22, -6, 44, 48, '#ced4da');
    box(-42, -18, 22, 60, '#dee2e6');
    box(20, -18, 22, 60, '#dee2e6');
    shape([[-46, -18], [-31, -46], [-16, -18]], '#9775fa');
    shape([[16, -18], [31, -46], [46, -18]], '#9775fa');
    lines([[0, -6], [0, -36]], INK, 3);
    shape([[0, -36], [20, -30], [0, -24]], '#ff8fc7');
    g.beginPath();
    g.moveTo(-10, 42);
    g.lineTo(-10, 24);
    g.arc(0, 24, 10, Math.PI, TAU);
    g.lineTo(10, 42);
    paint('#a0632b', true);
    box(-35, 0, 8, 12, '#4dabf7');
    box(27, 0, 8, 12, '#4dabf7');
  },
  friends() {
    face(-20, 8, 24, '#ffc933');
    face(20, 8, 24, '#ff8fc7');
    heart(0, -30, 10, '#ff6b6b');
  },
  moon() {
    // a crescent: the big circle minus a second circle, kept inside the big one
    g.save();
    g.beginPath();
    g.arc(0, 0, 38, 0, TAU);
    g.clip();
    g.beginPath();
    g.arc(0, 0, 38, 0, TAU);
    g.moveTo(52, -12);
    g.arc(18, -12, 34, 0, TAU);
    g.fillStyle = '#ffe066';
    g.fill('evenodd');
    g.restore();
    dot(-26, -4, 3, INK, false);
    smile(-26, 4, 6);
  },
  snow() {
    for (let i = 0; i < 6; i += 1) {
      g.save();
      g.rotate((i / 6) * TAU);
      lines([[0, 0], [0, -40]], '#74c0fc', 7);
      lines([[-11, -32], [0, -22], [11, -32]], '#74c0fc', 6);
      g.restore();
    }
    dot(0, 0, 8, '#fff');
  },
  fish(t) {
    g.rotate(Math.sin(t * 4) * 0.08);
    shape([[-24, 0], [-46, -18], [-46, 18]], '#ffa94d');
    shape([[-6, -16], [8, -32], [14, -16]], '#ff922b');
    oval(0, 0, 32, 22, '#ffa94d');
    dot(16, -5, 6, '#fff');
    dot(17, -5, 3, INK, false);
  },
  dance(t) {
    g.rotate(Math.sin(t * 6) * 0.2);
    lines([[-24, 10], [-42, -16]], INK, 6);
    lines([[24, 10], [42, -16]], INK, 6);
    face(0, 8, 30, '#ffc933');
    star(-40, -34, 9, '#ff8fc7', 4, 0.35);
    star(40, -34, 9, '#9775fa', 4, 0.35);
  },
  car() {
    shape([[-46, 0], [-46, 18], [46, 18], [46, 2], [30, -4], [18, -24], [-16, -24], [-28, -2]], '#ff6b6b');
    box(-12, -18, 26, 13, '#a5d8ff');
    for (const x of [-24, 24]) {
      dot(x, 20, 11, '#495057');
      dot(x, 20, 4, '#ced4da', false);
    }
  },
  storm(t) {
    cloud(0, -20, 50, '#adb5bd');
    if (Math.sin(t * 6) > -0.6) shape([[6, 8], [-12, 30], [0, 30], [-10, 48], [18, 20], [6, 20], [14, 8]], '#ffd43b');
  },
  shield() {
    g.beginPath();
    g.moveTo(-34, -36);
    g.lineTo(34, -36);
    g.lineTo(34, 0);
    g.quadraticCurveTo(30, 30, 0, 44);
    g.quadraticCurveTo(-30, 30, -34, 0);
    g.closePath();
    paint('#4dabf7', true);
    star(0, -2, 17, '#ffd43b');
  },
  magic(t) {
    lines([[-34, 36], [12, -10]], INK, 10);
    lines([[6, -4], [12, -10]], '#fff', 6);
    star(22, -22, 18 + Math.sin(t * 5) * 3, '#ffd43b');
    star(-12, -30, 7, '#ff8fc7', 4, 0.35, false);
    star(36, 14, 6, '#9775fa', 4, 0.35, false);
  },
  treasure() {
    shape([[-38, -10], [-20, -32], [20, -32], [38, -10], [0, 38]], '#66d9e8');
    lines([[-38, -10], [38, -10]], INK, 3);
    lines([[-20, -32], [-10, -10], [0, 38]], INK, 3);
    lines([[20, -32], [10, -10], [0, 38]], INK, 3);
    lines([[-10, -10], [0, -32], [10, -10]], INK, 3);
    star(-20, -18, 6, '#fff', 4, 0.35, false);
  },
  ufo(t) {
    oval(0, -8, 20, 20, '#a5d8ff');
    face(0, -8, 11, '#8ce99a');
    oval(0, 8, 46, 14, '#ced4da');
    const on = Math.floor(t * 4) % 3;
    [-26, 0, 26].forEach((x, i) => dot(x, 9, 5, i === on ? '#ffd43b' : '#868e96', false));
  },
  dino() {
    shape([[-18, 6], [-48, 26], [-16, 22]], '#69db7c');
    box(-16, 22, 9, 18, '#69db7c');
    box(4, 22, 9, 18, '#69db7c');
    for (const x of [-18, -6, 6]) shape([[x - 6, -6], [x, -18], [x + 6, -6]], '#2e9b47');
    oval(-2, 10, 26, 20, '#69db7c');
    oval(22, -18, 20, 15, '#69db7c');
    dot(28, -22, 3.5, INK, false);
    smile(26, -16, 9);
  },
  store() {
    g.beginPath();
    g.arc(0, -16, 15, Math.PI, TAU);
    g.lineWidth = 6;
    g.strokeStyle = INK;
    g.stroke();
    shape([[-30, -16], [30, -16], [36, 40], [-36, 40]], '#ff8fc7');
    heart(0, 12, 11, '#fff');
  },
  crown() {
    shape([[-40, 26], [-40, -22], [-20, 0], [0, -32], [20, 0], [40, -22], [40, 26]], '#ffd43b');
    dot(0, 10, 7, '#ff6b6b');
    dot(-24, 12, 5, '#4dabf7');
    dot(24, 12, 5, '#69db7c');
  },
  unicorn() {
    dot(-30, -10, 11, '#ff8fc7');
    dot(-32, 8, 10, '#9775fa');
    dot(-26, 24, 9, '#4dabf7');
    shape([[-22, -18], [-16, -42], [-4, -26]], '#fff');
    shape([[22, -18], [16, -42], [4, -26]], '#fff');
    dot(0, 6, 32, '#fff');
    shape([[-7, -24], [7, -24], [0, -50]], '#ffd43b');
    dot(-11, 0, 4, INK, false);
    dot(11, 0, 4, INK, false);
    smile(0, 10, 12);
    dot(-20, 12, 5, '#ffc9e3', false);
    dot(20, 12, 5, '#ffc9e3', false);
  },
  space(t) {
    dot(0, 0, 26, '#ffa94d');
    oval(-8, -8, 7, 4, '#ff922b', false);
    g.beginPath();
    g.ellipse(0, 0, 46, 12, -0.3, 0, TAU);
    g.lineWidth = 6;
    g.strokeStyle = '#9775fa';
    g.stroke();
    dot(Math.cos(t) * 38, -32 + Math.sin(t) * 4, 6, '#ced4da');
  },
  languages() {
    dot(0, 0, 38, '#4dabf7');
    oval(-12, -14, 14, 10, '#69db7c', false);
    oval(14, 12, 15, 11, '#69db7c', false);
    oval(14, -22, 8, 6, '#69db7c', false);
    oval(0, 0, 16, 38, null, true);
    lines([[-38, 0], [38, 0]], INK, 3);
    dot(0, 0, 38, null, true);
  },
  party(t) {
    shape([[-24, 38], [24, 38], [0, -34]], '#9775fa');
    dot(-6, 20, 5, '#ffd43b', false);
    dot(8, 4, 5, '#ff8fc7', false);
    dot(-2, -12, 4, '#69db7c', false);
    dot(0, -38, 8, '#ffd43b');
    const fall = (t * 30) % 20;
    box(30, -34 + fall, 6, 10, '#ff6b6b', false);
    box(-38, -24 + fall, 8, 6, '#4dabf7', false);
    box(32, 6 + fall, 6, 6, '#69db7c', false);
  },
  park(t) {
    lines([[-30, 46], [0, -4], [30, 46]], INK, 6);
    g.beginPath();
    g.arc(0, -4, 36, 0, TAU);
    g.lineWidth = 5;
    g.strokeStyle = '#ff6b6b';
    g.stroke();
    for (let i = 0; i < 6; i += 1) {
      const a = t * 0.6 + (i / 6) * TAU;
      lines([[0, -4], [Math.cos(a) * 36, -4 + Math.sin(a) * 36]], INK, 2);
    }
    for (let i = 0; i < 6; i += 1) {
      const a = t * 0.6 + (i / 6) * TAU;
      box(Math.cos(a) * 36 - 6, -4 + Math.sin(a) * 36 - 2, 12, 11, RAINBOW[i]);
    }
    dot(0, -4, 6, '#ffd43b');
  },

  // Not ideas, but drawn the same way
  lock() {
    g.beginPath();
    g.arc(0, -10, 18, Math.PI, TAU);
    g.lineWidth = 10;
    g.strokeStyle = '#868e96';
    g.stroke();
    box(-28, -10, 56, 44, '#ced4da');
    dot(0, 6, 6, INK, false);
    box(-3, 6, 6, 14, INK, false);
  },
  bug(t) {
    const w = Math.sin(t * 10) * 3;
    for (const x of [-26, -8, 8]) lines([[x, 10], [x - 4, 26 + w]], INK, 3);
    lines([[18, -14], [12, -34]], INK, 3);
    lines([[28, -14], [34, -34]], INK, 3);
    dot(12, -34, 4, '#ff6b6b', false);
    dot(34, -34, 4, '#ff6b6b', false);
    dot(-28, 6 + w, 13, '#c0eb75');
    dot(-10, 4 - w, 15, '#94d82d');
    face(22, 0, 18, '#c0eb75');
  },
  bossbug(t) {
    const w = Math.sin(t * 12) * 3;
    for (const x of [-26, -6, 12]) lines([[x, 12], [x - 6, 34 + w]], INK, 4);
    dot(-28, 6 + w, 17, '#e03131');
    dot(-6, 4 - w, 20, '#ff6b6b');
    shape([[10, -18], [6, -46], [22, -24]], '#ffd43b');
    shape([[34, -18], [44, -44], [28, -24]], '#ffd43b');
    dot(22, 0, 24, '#9c36b5');
    dot(14, -6, 7, '#fff');
    dot(30, -6, 7, '#fff');
    dot(15, -5, 3.5, '#e03131', false);
    dot(31, -5, 3.5, '#e03131', false);
    lines([[6, -18], [18, -12]]);
    lines([[38, -18], [26, -12]]);
    g.beginPath();
    g.arc(22, 20, 10, 1.15 * Math.PI, 1.85 * Math.PI);
    paint(null, true);
  },
  pop() {
    star(0, 0, 44, '#ffa94d', 8, 0.5);
    star(0, 0, 24, '#ffd43b', 8, 0.5, false);
  },
  rocket(t) {
    oval(0, 38, 9, 10 + Math.sin(t * 30) * 3, '#ffa94d', false);
    shape([[-14, 14], [-28, 34], [-12, 30]], '#ff6b6b');
    shape([[14, 14], [28, 34], [12, 30]], '#ff6b6b');
    shape([[0, -46], [16, -20], [14, 30], [-14, 30], [-16, -20]], '#fff');
    dot(0, -6, 8, '#a5d8ff');
  },
};

export const spriteIds = Object.keys(SPRITES);

// Draw sprite `id` centred on (x, y), `size` pixels wide; `t` is the time in seconds for the moving parts.
export function drawSprite(ctx, id, x, y, size, t = 0) {
  const sprite = SPRITES[id];
  if (!sprite) return;
  g = ctx;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 100, size / 100);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  sprite(t);
  ctx.restore();
}

const pictures = new Map(); // id -> picture address, so each card picture is drawn only once

// A still picture of a sprite for the idea cards.
export function spriteImage(id) {
  if (!pictures.has(id)) {
    const canvas = document.createElement('canvas');
    canvas.width = 96;
    canvas.height = 96;
    drawSprite(canvas.getContext('2d'), id, 48, 48, 92);
    pictures.set(id, canvas.toDataURL());
  }
  const img = new Image();
  img.src = pictures.get(id);
  img.alt = '';
  img.className = 'sprite';
  return img;
}
