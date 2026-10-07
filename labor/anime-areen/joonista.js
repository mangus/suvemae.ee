// Drawing of the chibi anime fighters that players design themselves, and
// of the arena. Everything is drawn with canvas shapes: no outside pictures.

export const NAMES = ['Säde', 'Tuuli', 'Kiisu', 'Täheke', 'Leek', 'Laine', 'Pilvik', 'Mõmm', 'Rakett', 'Nupsu'];
export const HAIR_STYLES = ['Okkalised', 'Hobusesaba', 'Kaks nuppu', 'Lühike salk'];
export const HAIR_COLORS = ['#ff4fa3', '#3d8bff', '#ffd23f', '#38c97a', '#9b5cff', '#ff7b2e', '#3a2a55', '#f2f0ff'];
export const EYES = ['Säravad', 'Kindlad', 'Rõõmsad', 'Tähed', 'Kassisilmad'];
export const OUTFITS = ['#ff5f92', '#2ec4f1', '#ffb703', '#5fd38d', '#a66cff', '#ff6b4a'];
export const POWERS = [
  { name: '⚡ Välk', color: '#ffe14d', word: 'ZÄPP!' },
  { name: '🌸 Lilled', color: '#ff8ad0', word: 'PÕMM!' },
  { name: '❄️ Jää', color: '#7fe3ff', word: 'KRÕKS!' },
  { name: '🔥 Tuli', color: '#ff7a2e', word: 'VUHH!' },
];

// How many options each part of a character has.
export const CHOICES = {
  n: NAMES.length,
  s: HAIR_STYLES.length,
  h: HAIR_COLORS.length,
  e: EYES.length,
  o: OUTFITS.length,
  p: POWERS.length,
};

const INK = '#271842';
const SKIN = '#ffe3d1';

export function randomCharacter() {
  const character = {};
  for (const [key, count] of Object.entries(CHOICES)) character[key] = Math.floor(Math.random() * count);
  return character;
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

function rounded(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function blob(ctx, fill) {
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.stroke();
}

function limb(ctx, x1, y1, x2, y2) {
  ctx.save();
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.strokeStyle = SKIN;
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.restore();
}

function backHair(ctx, style, color) {
  ctx.beginPath();
  if (style === 0) {
    // Spikes around the back and the top of the head.
    const steps = 8;
    for (let i = 0; i <= steps; i += 1) {
      const a = Math.PI * (0.85 + (1.1 * i) / steps);
      const r = i % 2 ? 38 : 22;
      ctx.lineTo(Math.cos(a) * r, -30 + Math.sin(a) * r);
    }
    ctx.closePath();
  } else if (style === 1) {
    ctx.moveTo(-14, -46);
    ctx.quadraticCurveTo(-50, -44, -44, -6);
    ctx.quadraticCurveTo(-40, 6, -28, 8);
    ctx.quadraticCurveTo(-34, -18, -12, -34);
    ctx.closePath();
    blob(ctx, color);
    ctx.beginPath();
    ctx.arc(0, -31, 24, 0, Math.PI * 2);
  } else if (style === 2) {
    ctx.arc(-14, -50, 10, 0, Math.PI * 2);
    blob(ctx, color);
    ctx.beginPath();
    ctx.arc(13, -52, 10, 0, Math.PI * 2);
    blob(ctx, color);
    ctx.beginPath();
    ctx.arc(0, -31, 24, 0, Math.PI * 2);
  } else {
    rounded(ctx, -27, -53, 54, 50, 16);
  }
  blob(ctx, color);
}

function frontHair(ctx, style, color) {
  ctx.beginPath();
  ctx.moveTo(-23, -24);
  ctx.quadraticCurveTo(-27, -56, 2, -54);
  ctx.quadraticCurveTo(29, -52, 24, -24);
  ctx.lineTo(19, -37);
  ctx.lineTo(14, -29);
  ctx.lineTo(8, -39);
  ctx.lineTo(2, -30);
  ctx.lineTo(-4, -39);
  ctx.lineTo(-10, -31);
  ctx.lineTo(-15, -39);
  ctx.closePath();
  blob(ctx, color);
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.beginPath();
  ctx.arc(2, -40, 13, Math.PI * 1.2, Math.PI * 1.45);
  ctx.stroke();
  ctx.restore();
  if (style === 3) {
    // A little curl sticking up from the top.
    ctx.save();
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(0, -52);
    ctx.quadraticCurveTo(2, -70, 15, -64);
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.restore();
  }
}

function eyes(ctx, type, color, starColor) {
  const ey = -20;
  for (const ex of [-3, 11]) {
    ctx.lineWidth = 2;
    if (type === 2) {
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(ex, ey + 2, 4.5, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      continue;
    }
    if (type === 3) {
      star(ctx, ex, ey, 6.5, 3, 5);
      blob(ctx, starColor);
      continue;
    }
    ctx.beginPath();
    ctx.ellipse(ex, ey, 4.8, 7, 0, 0, Math.PI * 2);
    blob(ctx, '#fff');
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(ex + 1, ey + 1, 3.6, 5.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.beginPath();
    if (type === 4) ctx.ellipse(ex + 1, ey + 1, 1.2, 4.6, 0, 0, Math.PI * 2);
    else ctx.ellipse(ex + 1, ey + 1.5, 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ex + 2.4, ey - 2.2, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ex - 0.6, ey + 3, 0.9, 0, Math.PI * 2);
    ctx.fill();
    if (type === 1) {
      // Determined brows slope down towards the nose.
      const left = ex < 4;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(ex - 5, ey + (left ? -12 : -9));
      ctx.lineTo(ex + 5, ey + (left ? -9 : -12));
      ctx.stroke();
    }
  }
  ctx.lineWidth = 3;
}

function dizzy(ctx) {
  ctx.lineWidth = 2.5;
  for (const ex of [-3, 11]) {
    ctx.beginPath();
    ctx.moveTo(ex - 3.5, -24);
    ctx.lineTo(ex + 3.5, -17);
    ctx.moveTo(ex + 3.5, -24);
    ctx.lineTo(ex - 3.5, -17);
    ctx.stroke();
  }
  ctx.lineWidth = 3;
}

function blast(ctx, power, amount, facing) {
  const p = 1 - amount;
  const cx = 34 + p * 42;
  const cy = -10;
  const r = 9 + p * 20;
  ctx.save();
  ctx.globalAlpha = Math.min(1, amount * 1.6);
  ctx.strokeStyle = power.color;
  ctx.lineWidth = 3;
  for (let i = -1; i <= 1; i += 1) {
    ctx.beginPath();
    ctx.moveTo(22, cy + i * 9);
    ctx.lineTo(cx - r * 0.6, cy + i * 9);
    ctx.stroke();
  }
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  star(ctx, cx, cy, r, r * 0.5, 8);
  blob(ctx, power.color);
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.35, 0, Math.PI * 2);
  ctx.fill();
  // The sound word is turned back so it never reads mirrored.
  ctx.translate(cx, cy - r - 8);
  ctx.scale(facing, 1);
  ctx.font = '900 16px ui-rounded, "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.lineWidth = 4;
  ctx.strokeText(power.word, 0, 0);
  ctx.fillStyle = power.color;
  ctx.fillText(power.word, 0, 0);
  ctx.restore();
}

// Draws one fighter with its feet around (x, y + 33 * scale).
export function drawFighter(ctx, character, x, y, options = {}) {
  const { facing = 1, scale = 1, attack = 0, hurt = 0, time = 0, label = '', hp = null, me = false, down = false } = options;
  const hair = HAIR_COLORS[character.h] ?? HAIR_COLORS[0];
  const outfit = OUTFITS[character.o] ?? OUTFITS[0];
  const power = POWERS[character.p] ?? POWERS[0];
  const eyeColor = character.h === 7 ? '#7b6cff' : hair;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.fillStyle = 'rgba(39, 24, 66, 0.18)';
  ctx.beginPath();
  ctx.ellipse(0, 33, 24, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  if (me) {
    ctx.strokeStyle = '#ffb703';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 33, 30, 8, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.scale(facing, 1);
  if (down) {
    ctx.translate(0, 30);
    ctx.rotate(-Math.PI / 2);
    ctx.translate(0, -30);
  }
  if (attack > 0) blast(ctx, power, attack, facing);
  ctx.translate(0, down ? 0 : Math.sin(time / 170) * 1.5);
  if (hurt > 0 && Math.floor(time / 70) % 2 === 0) ctx.globalAlpha = 0.45;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;

  backHair(ctx, character.s, hair);
  ctx.beginPath();
  rounded(ctx, -12, 14, 9, 18, 4);
  rounded(ctx, 3, 14, 9, 18, 4);
  blob(ctx, INK);
  limb(ctx, -10, -4, -17, 10);
  ctx.beginPath();
  ctx.moveTo(-12, -9);
  ctx.lineTo(12, -9);
  ctx.lineTo(16, 18);
  ctx.lineTo(-16, 18);
  ctx.closePath();
  blob(ctx, outfit);
  ctx.beginPath();
  ctx.moveTo(-6, -9);
  ctx.lineTo(0, -1);
  ctx.lineTo(6, -9);
  ctx.closePath();
  blob(ctx, '#fff');
  ctx.lineWidth = 1.5;
  star(ctx, 0, 7, 5.5, 2.5, 5);
  blob(ctx, power.color);
  ctx.lineWidth = 3;
  if (attack > 0) {
    limb(ctx, 10, -3, 30, -6);
    ctx.beginPath();
    ctx.arc(31, -6, 4.5, 0, Math.PI * 2);
    blob(ctx, SKIN);
  } else {
    limb(ctx, 10, -4, 17, 10);
  }

  ctx.beginPath();
  ctx.arc(0, -28, 21, 0, Math.PI * 2);
  blob(ctx, SKIN);
  ctx.fillStyle = 'rgba(255, 110, 150, 0.45)';
  ctx.beginPath();
  ctx.ellipse(-8, -14, 4, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(13, -15, 4, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (attack > 0 || hurt > 0) {
    ctx.ellipse(6, -11, 3, 3.5, 0, 0, Math.PI * 2);
    blob(ctx, '#e0457b');
  } else {
    ctx.arc(5, -14, 3.5, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
  }
  ctx.lineWidth = 3;
  frontHair(ctx, character.s, hair);
  if (down) dizzy(ctx);
  else eyes(ctx, character.e, eyeColor, power.color);
  ctx.restore();

  if (label) {
    const top = y - 80 * scale;
    ctx.save();
    ctx.font = '900 12px ui-rounded, "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fff';
    ctx.strokeText(label, x, top - 4);
    ctx.fillStyle = INK;
    ctx.fillText(label, x, top - 4);
    if (hp !== null) {
      ctx.fillRect(x - 21, top - 1, 42, 7);
      ctx.fillStyle = hp > 50 ? '#39df8f' : hp > 25 ? '#ffc92f' : '#ff4f6d';
      ctx.fillRect(x - 20, top, 40 * (hp / 100), 5);
    }
    ctx.restore();
  }
}

export function drawArena(ctx, width, height, time) {
  const horizon = 120;
  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, '#ffc8ea');
  sky.addColorStop(1, '#fff1b0');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, horizon);

  const sunX = width * 0.8;
  const sunY = 62;
  ctx.save();
  ctx.translate(sunX, sunY);
  ctx.rotate(time / 8000);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  for (let i = 0; i < 12; i += 1) {
    ctx.rotate(Math.PI / 6);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(300, -26);
    ctx.lineTo(300, 26);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 30, 0, Math.PI * 2);
  blob(ctx, '#ffe15c');
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  for (let x = 0; x <= width; x += 80) ctx.quadraticCurveTo(x + 40, horizon - (x % 160 ? 40 : 60), x + 80, horizon);
  ctx.closePath();
  blob(ctx, '#c7b3ff');

  const floor = ctx.createLinearGradient(0, horizon, 0, height);
  floor.addColorStop(0, '#efe4ff');
  floor.addColorStop(1, '#d6f7ff');
  ctx.fillStyle = floor;
  ctx.fillRect(0, horizon, width, height - horizon);
  ctx.strokeStyle = 'rgba(117, 72, 189, 0.2)';
  ctx.lineWidth = 2;
  for (let y = horizon + 40; y < height; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  for (let i = -10; i <= 10; i += 1) {
    ctx.beginPath();
    ctx.moveTo(width / 2 + i * 24, horizon);
    ctx.lineTo(width / 2 + i * 90, height);
    ctx.stroke();
  }
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  ctx.lineTo(width, horizon);
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
