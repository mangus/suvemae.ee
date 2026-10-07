// Broccoli rain: tap a falling broccoli, the stick figure walks over and
// chops it with his knife. The pieces stay on the grass, and after ten
// broccoli he walks around and eats them all. Round 2 needs 20 broccoli,
// and chillies fall too: if he eats one, the costume bursts and it is over.
// Round 3 needs 30, and twice a door appears: he must hide behind it
// before a bird throws dynamite, or it is over too.

const ala = document.querySelector('#ala');
const koht = document.querySelector('#juku-koht');
const juku = document.querySelector('#juku');
const nupp = document.querySelector('#alusta');
const sonum = document.querySelector('#sonum');
const skoor = document.querySelector('#skoor');

// Round 3: the door to hide behind and the bird with dynamite.
const uks = document.createElement('button');
uks.type = 'button';
uks.className = 'uks';
uks.setAttribute('aria-label', 'Uks: mine peitu');
uks.hidden = true;
uks.innerHTML = '<img src="uks.svg" alt="" draggable="false">';
ala.append(uks);
const lind = document.createElement('div');
lind.className = 'lind';
lind.hidden = true;
lind.setAttribute('aria-hidden', 'true');
lind.innerHTML = '<img src="lind.svg" alt="" draggable="false">';
ala.append(lind);

const EESMARGID = [10, 20, 30]; // broccoli to chop in rounds 1, 2 and 3
const TSILLI_OSA = 0.3; // share of chillies among the falling things from round 2 on
const UKSI = 2; // doors in round 3
const JUKU_LAIUS = 230; // stick figure box before scaling
const JUKU_KORGUS = 330;
const JALAD_Y = 317; // where the feet are inside the box
const NUGA_X = 22; // where the knife blade is inside the box
const NUGA_Y = 137;
const SUU_X = 120; // where the mouth is inside the box
const SUU_Y = 80;
const MURU = 56; // grass height in px, matches .muru
const BROKOLI = 64; // broccoli size in px

const hyyuded = ['KRÕMPS!', 'PÕMM!', 'Tsakk!', 'Plaks!'];

let laius = 0;
let korgus = 0;
let maa = 0; // y of the ground line
let s = 1; // stick figure scale
let jukuX = 0; // left edge of the stick figure
let olek = 'ootab'; // ootab | kaib | lopp | soob
let tykeldatud = 0;
let hoivatud = false;
let tekkeAeg = 0;
let eelmine = 0;
let aeglased = 0; // how many recent frames came late
let raund = 1;
let eesmark = EESMARGID[0];
let uksi = 0; // doors already survived in round 3
let peidus = false;
let minemas = false;
let ukseX = 0;

const brokolid = [];
const jarjekord = [];
const tykid = [];

const oota = (ms) => new Promise((valmis) => setTimeout(valmis, ms));
const piira = (v, min, max) => Math.min(Math.max(v, min), max);

// Hair: many thin strands on a canvas, each swung by a small spring.
const pea = juku.querySelector('.pea');
const juukseLouend = document.createElement('canvas');
juukseLouend.className = 'juuksed';
juukseLouend.setAttribute('aria-hidden', 'true');
juku.append(juukseLouend);
const jl = juukseLouend.getContext('2d');
// A second canvas under the head for the hair that hangs behind it.
const tagaLouend = document.createElement('canvas');
tagaLouend.className = 'juuksed juuksed-taga';
tagaLouend.setAttribute('aria-hidden', 'true');
juku.prepend(tagaLouend);
const jlTaga = tagaLouend.getContext('2d');
const TAGA = 0; // bald on request (was 90 strands behind the head)
const JL_X = -70; // canvas box inside the figure, matches .juuksed
const JL_Y = -70;
const JL_LAIUS = 370;
const JL_KORGUS = 330;
const KARVU = 0; // front hair taken off on request (was 200)
const TUKK = 0; // fringe taken off too (was 26)
const OSAD = 20; // segments per strand, enough for very tight frizzy curls
// Four dark browns, then pink streaks (front) and dark blue streaks (back).
const juuksevarvid = ['#4a2511', '#3b1d0c', '#57301a', '#633820', '#ff6fb5', '#1c2f7a'];
const juuksepaksus = [2.6, 3.2, 2.9, 3.5, 3.1, 3.3]; // one width per colour, so a colour's strands are drawn together
const ROOSA = 4;
const SININE = 5;
const KRUSSIVARV = '#5a321b'; // little curl rings drawn on the back hair mass
const TAUSTAVARV = '#3b1d0c'; // the thick hair mass behind the face
const salguToon = (i) => (i % 5 === 2 ? ROOSA : i % 4); // every fifth strand is pink
let juukseTaust = null;
const vaikne = matchMedia('(prefers-reduced-motion: reduce)').matches;
const karvad = [];
let juukseMoot = 0;
let peaEelmine = null;

function teeJuuksed() {
  const r = pea.offsetWidth / 2;
  const kx = pea.offsetLeft + r - JL_X;
  const ky = pea.offsetTop + r - JL_Y;
  juukseTaust = null; // bald: no hair mass behind the head (was teeJuukseTaust(kx, ky, r))
  // Fringe first, so it survives when slow computers drop half of the hair.
  for (let j = 0; j < TUKK; j++) {
    const fii = -42 + (84 * (j + 0.5)) / TUKK + (Math.random() - 0.5) * 4;
    const nurk = (fii * Math.PI) / 180;
    const juur = r - 6;
    const x = kx + Math.sin(nurk) * juur;
    const y = ky - Math.cos(nurk) * juur;
    const pikkus = Math.max(8, ky - 24 - y) * (0.9 + Math.random() * 0.2); // ends above the eyes
    const kald = -fii * 0.3; // fans out a little at the sides
    const puhke = [];
    for (let k = 0; k < OSAD; k++) {
      const f = (k + 0.5) / OSAD;
      puhke.push(kald - 25 * Math.sign(fii || 1) * f ** 3); // tips curl softly outwards
    }
    const keskmine = (puhke[OSAD >> 1] * Math.PI) / 180;
    karvad.push({
      x,
      y,
      puhke,
      osa: pikkus / OSAD,
      cos: Math.cos(keskmine),
      sin: Math.sin(keskmine),
      jaikus: 110 + Math.random() * 30, // stiff, so the fringe stays off the eyes
      nihe: 0,
      kiirus: 0,
      faas: Math.random() * 6.3,
      toon: j % 4, // dark brown fringe
      px: new Float32Array(OSAD + 1),
      py: new Float32Array(OSAD + 1),
    });
  }
  for (let i = 0; i < KARVU; i++) {
    const fii = (Math.random() * 2 - 1) * 105; // 0 is the top of the head
    const nurk = (fii * Math.PI) / 180;
    const juur = r - 5 - Math.random() * 7;
    const valja = 180 + fii; // pointing straight out of the head
    const alla = fii >= 0 ? 360 : 0; // pointing down on the same side
    // Butterfly cut: short face-framing layers over long back layers, ends flipped out.
    const lyhike = i % 5 < 2;
    const vajumine = lyhike ? 1 : 0.8 + (0.2 * Math.abs(fii)) / 105;
    // Curls eat up length, so the strands are a bit longer than they look.
    const pikkus = lyhike
      ? (50 + (26 * Math.abs(fii)) / 105) * (0.85 + Math.random() * 0.3)
      : (140 + (70 * Math.abs(fii)) / 105) * (0.85 + Math.random() * 0.3);
    const pool = fii >= 0 ? 1 : -1;
    const algus = valja + 67 * pool; // mostly along the head, with a little lift
    const kaar = (lyhike ? 35 : 20) * -pool; // soft outward flip at the ends
    // Curls: each strand bends back and forth, looser near the roots, rounder at the ends.
    const lokiFaas = Math.random() * 6.3;
    const lokiSamm = 2.7 + Math.random() * 0.5; // bigger step = tighter, frizzier curls
    const lokiSuurus = 55 + Math.random() * 25;
    const puhke = [];
    for (let k = 0; k < OSAD; k++) {
      const f = (k + 0.5) / OSAD;
      const ots = Math.max(0, (f - 0.6) / 0.3);
      const lokk = lokiSuurus * Math.min(1, 0.35 + f) * Math.sin(k * lokiSamm + lokiFaas);
      puhke.push(algus + (alla - algus) * vajumine * f ** 0.7 + kaar * ots + lokk);
    }
    const keskmine = (puhke[OSAD >> 1] * Math.PI) / 180;
    karvad.push({
      x: kx + Math.sin(nurk) * juur,
      y: ky - Math.cos(nurk) * juur,
      puhke,
      osa: pikkus / OSAD,
      cos: Math.cos(keskmine),
      sin: Math.sin(keskmine),
      jaikus: 45 + Math.random() * 30,
      nihe: 0,
      kiirus: 0,
      faas: Math.random() * 6.3,
      toon: salguToon(i), // some black, pink, dark red and blond strands
      px: new Float32Array(OSAD + 1),
      py: new Float32Array(OSAD + 1),
    });
  }
  // Hair behind the head, pushed last so slow computers drop it first.
  for (let i = 0; i < TAGA; i++) {
    const fii = (Math.random() * 2 - 1) * 150;
    const nurk = (fii * Math.PI) / 180;
    const juur = r * (0.3 + Math.random() * 0.55);
    const pool = fii >= 0 ? 1 : -1;
    const valja = -pool * (55 + (25 * Math.abs(fii)) / 150); // out to the side first
    const alla = -pool * (8 + Math.random() * 10); // then down the back
    const pikkus = (150 + Math.random() * 80) * (0.85 + Math.random() * 0.3);
    const lokiFaas = Math.random() * 6.3;
    const lokiSamm = 2.9 + Math.random() * 0.4; // tight frizz at the back too
    const lokiSuurus = 75 + Math.random() * 25;
    const puhke = [];
    for (let k = 0; k < OSAD; k++) {
      const f = (k + 0.5) / OSAD;
      const lokk = lokiSuurus * Math.min(1, 0.5 + f) * Math.sin(k * lokiSamm + lokiFaas);
      puhke.push(valja + (alla - valja) * f ** 0.6 + lokk);
    }
    const keskmine = (puhke[OSAD >> 1] * Math.PI) / 180;
    karvad.push({
      x: kx + Math.sin(nurk) * juur,
      y: ky - Math.cos(nurk) * juur,
      puhke,
      osa: pikkus / OSAD,
      cos: Math.cos(keskmine),
      sin: Math.sin(keskmine),
      jaikus: 25 + Math.random() * 20, // softer, so the back hair swings more
      nihe: 0,
      kiirus: 0,
      faas: Math.random() * 6.3,
      toon: i % 5 === 2 ? SININE : i % 4, // dark blue streaks at the back
      taga: true,
      px: new Float32Array(OSAD + 1),
      py: new Float32Array(OSAD + 1),
    });
  }
}

function liigutaJuukseid(dt, aeg) {
  // Head motion in figure units; strands lag behind it and swing back.
  const kast = pea.getBoundingClientRect();
  const x = (kast.left + kast.width / 2) / s;
  const y = (kast.top + kast.height / 2) / s;
  let vx = 0;
  let vy = 0;
  let dvx = 0;
  let dvy = 0;
  if (peaEelmine && dt > 0) {
    vx = (x - peaEelmine.x) / dt;
    vy = (y - peaEelmine.y) / dt;
    if (Math.hypot(vx, vy) > 3000) {
      vx = 0; // a resize, not a real move
      vy = 0;
    }
    dvx = vx - peaEelmine.vx;
    dvy = vy - peaEelmine.vy;
  }
  peaEelmine = { x, y, vx, vy };

  const t = aeg / 1000;
  for (const k of karvad) {
    const tugevus = k.taga ? 2 : 1; // the back hair sways more in the wind
    const tuul = vaikne ? 0 : tugevus * (5 * Math.sin(t * 1.3 + k.faas) + 2.5 * Math.sin(t * 2.9 + k.faas * 2));
    const siht = tuul + 1.7 * (vx * k.cos + vy * k.sin);
    k.kiirus += 0.45 * (dvx * k.cos + dvy * k.sin);
    k.kiirus += (k.jaikus * (siht - k.nihe) - 4 * k.kiirus) * dt;
    k.kiirus = piira(k.kiirus, -900, 900);
    k.nihe = piira(k.nihe + k.kiirus * dt, -70, 70);
  }

  // The back hair mass swings too: it lags behind the head and sways in the wind.
  if (juukseTaust) {
    const tt = juukseTaust;
    const tuulX = vaikne ? 0 : 6 * Math.sin(t * 1.1) + 3 * Math.sin(t * 2.3 + 1);
    tt.kiirusX += (70 * (tuulX - 0.05 * vx - tt.dx) - 6 * tt.kiirusX) * dt - 0.4 * dvx;
    tt.kiirusY += (70 * (-0.04 * vy - tt.dy) - 6 * tt.kiirusY) * dt - 0.3 * dvy;
    tt.dx = piira(tt.dx + tt.kiirusX * dt, -28, 28);
    tt.dy = piira(tt.dy + tt.kiirusY * dt, -18, 18);
    tt.t = t;
  }

  for (const k of karvad) {
    k.px[0] = k.x;
    k.py[0] = k.y;
    for (let i = 0; i < OSAD; i++) {
      const a = ((k.puhke[i] + k.nihe * ((i + 1) / OSAD) ** 1.5) * Math.PI) / 180;
      k.px[i + 1] = k.px[i] - Math.sin(a) * k.osa;
      k.py[i + 1] = k.py[i] + Math.cos(a) * k.osa;
    }
  }

  // Sharp enough on phones without drawing four times the pixels.
  const moot = s * Math.min(window.devicePixelRatio || 1, 1.5);
  if (moot !== juukseMoot) {
    juukseMoot = moot;
    for (const louend of [juukseLouend, tagaLouend]) {
      louend.width = Math.round(JL_LAIUS * moot);
      louend.height = Math.round(JL_KORGUS * moot);
    }
  }
  joonistaJuuksed(jl, moot, false);
  joonistaJuuksed(jlTaga, moot, true);
}

// A solid frizzy mass behind the head, so no sky shows between the strands.
// The bumps and curl rings are placed once, so they don't flicker.
function teeJuukseTaust(x, y, r) {
  const laius = r + 22;
  const alla = y + 105;
  // How much a point swings: nothing at the top of the head, most at the bottom.
  const kiik = (py) => piira((py - y) / (alla - y), 0, 1) ** 1.2;
  const mullid = [];
  const lisa = (mx, my) =>
    mullid.push({ x: mx, y: my, r: 9 + Math.random() * 6, f: kiik(my), faas: Math.random() * 6.3 });
  for (let j = 0; j <= 14; j++) {
    const a = Math.PI + (Math.PI * j) / 14; // bumpy top
    lisa(x + Math.cos(a) * (r + 14), y + Math.sin(a) * (r + 14));
  }
  for (let j = 1; j <= 7; j++) {
    lisa(x - laius, y + ((alla - y) * j) / 7); // bumpy sides
    lisa(x + laius, y + ((alla - y) * j) / 7);
  }
  for (let j = 1; j < 10; j++) lisa(x - laius + (2 * laius * j) / 10, alla); // bumpy bottom
  const rongad = [];
  for (let j = 0; j < 40; j++) {
    const gy = y - r + Math.random() * (alla - y + r + 6);
    rongad.push({
      x: x + (Math.random() * 2 - 1) * (laius + 4),
      y: gy,
      r: 3 + Math.random() * 4,
      f: kiik(gy),
    });
  }
  return { x, y, r, laius, alla, mullid, rongad, dx: 0, dy: 0, kiirusX: 0, kiirusY: 0, t: 0 };
}

function joonistaJuukseTaust(c) {
  const { x, y, r, laius, alla, mullid, rongad, dx, dy, t } = juukseTaust;
  const lainetus = vaikne ? 0 : 1.6; // each bump wobbles a little on its own
  c.fillStyle = TAUSTAVARV;
  c.beginPath();
  c.arc(x, y, r + 12, Math.PI, 0); // over the top of the head
  c.lineTo(x + laius + dx, alla + dy);
  c.lineTo(x - laius + dx, alla + dy);
  c.closePath();
  for (const m of mullid) {
    const mx = m.x + dx * m.f + lainetus * Math.sin(t * 2.2 + m.faas);
    const my = m.y + dy * m.f + lainetus * Math.cos(t * 1.9 + m.faas);
    c.moveTo(mx + m.r, my);
    c.arc(mx, my, m.r, 0, Math.PI * 2);
  }
  c.fill();
  // Small curl rings give the mass a frizzy look.
  c.strokeStyle = KRUSSIVARV;
  c.lineWidth = 1.8;
  c.beginPath();
  for (const g of rongad) {
    const gx = g.x + dx * g.f;
    const gy = g.y + dy * g.f;
    c.moveTo(gx + g.r, gy);
    c.arc(gx, gy, g.r, 0, Math.PI * 1.6);
  }
  c.stroke();
}

function joonistaJuuksed(c, moot, taga) {
  c.setTransform(moot, 0, 0, moot, 0, 0);
  c.clearRect(0, 0, JL_LAIUS, JL_KORGUS);
  c.lineCap = 'round';
  if (taga && juukseTaust) joonistaJuukseTaust(c);
  // One path per colour and segment: a few dozen strokes a frame instead of thousands.
  for (let v = 0; v < juuksevarvid.length; v++) {
    c.strokeStyle = juuksevarvid[v];
    for (let i = 0; i < OSAD; i++) {
      c.lineWidth = juuksepaksus[v] * (1 - i / (OSAD + 2));
      c.beginPath();
      for (const k of karvad) {
        if (k.toon !== v || !k.taga !== !taga) continue;
        c.moveTo(k.px[i], k.py[i]);
        c.lineTo(k.px[i + 1], k.py[i + 1]);
      }
      c.stroke();
    }
  }
}

function mootmed() {
  laius = ala.clientWidth;
  korgus = ala.clientHeight;
  maa = korgus - MURU + 14;
  s = Math.min(0.62, (korgus * 0.42) / JUKU_KORGUS);
  koht.style.transform = `scale(${s})`;
  koht.style.top = `${maa - JALAD_Y * s}px`;
  jukuX = piira(jukuX, 0, laius - JUKU_LAIUS * s);
  koht.style.left = `${jukuX}px`;
  if (!uks.hidden) paigutaUks();
  for (const t of tykid) {
    if (t.maas) {
      t.x = piira(t.x, 6, laius - 6);
      t.y = maa + t.sygavus;
      joonistaTykk(t);
    }
  }
}

function konni(siht, kiirus = 260) {
  siht = piira(siht, 0, laius - JUKU_LAIUS * s);
  const aeg = Math.abs(siht - jukuX) / kiirus;
  if (aeg < 0.05) return Promise.resolve();
  juku.classList.add('konnib');
  koht.style.transition = `left ${aeg}s linear`;
  koht.style.left = `${siht}px`;
  jukuX = siht;
  return oota(aeg * 1000).then(() => {
    juku.classList.remove('konnib');
    koht.style.transition = '';
  });
}

function hyppa() {
  juku.classList.remove('huppab');
  void juku.offsetWidth;
  juku.classList.add('huppab');
}

function hyyd(tekst, x, y) {
  const el = document.createElement('span');
  el.className = 'hyyd';
  el.textContent = tekst;
  el.style.left = `${piira(x, 50, laius - 50)}px`;
  el.style.top = `${y}px`;
  el.addEventListener('animationend', () => el.remove());
  ala.append(el);
}

function naitaSkoori() {
  skoor.textContent = `🥦 ${Math.min(tykeldatud, eesmark)} / ${eesmark}`;
}

function joonistaBrokoli(b) {
  b.el.style.translate = `${b.x}px ${b.y}px`;
}

function joonistaTykk(t) {
  t.el.style.translate = `${t.x}px ${t.y}px`;
  t.el.style.rotate = `${t.poore}deg`;
}

function tekita() {
  const tsilli = raund >= 2 && Math.random() < TSILLI_OSA;
  const el = document.createElement('button');
  el.type = 'button';
  el.className = tsilli ? 'brokoli tsilli' : 'brokoli';
  el.setAttribute('aria-label', tsilli ? 'Tsilli' : 'Brokoli');
  el.innerHTML = `<img src="${tsilli ? 'tsilli.svg' : 'brokoli.svg'}" alt="" draggable="false">`;
  const b = {
    el,
    tsilli,
    x: 8 + Math.random() * Math.max(0, laius - BROKOLI - 16),
    y: -BROKOLI,
    kiirus: 55 + Math.random() * 55 + Math.min(tykeldatud, 15) * 4,
    olek: 'kukub'
  };
  el.style.rotate = `${Math.random() * 40 - 20}deg`;
  // pointerdown reacts at once on touch, click covers the keyboard
  el.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    pyua(b);
  });
  el.addEventListener('click', () => pyua(b));
  ala.append(el);
  brokolid.push(b);
  joonistaBrokoli(b);
}

function maandu(b) {
  b.olek = 'maandus';
  b.el.tabIndex = -1;
  b.el.classList.add('maandus');
  setTimeout(() => {
    b.el.remove();
    eemalda(b);
  }, 500);
}

function eemalda(b) {
  const i = brokolid.indexOf(b);
  if (i >= 0) brokolid.splice(i, 1);
}

function pyua(b) {
  if (olek !== 'kaib' || b.olek !== 'kukub') return;
  b.olek = 'pyutud';
  b.el.tabIndex = -1;
  b.el.classList.add('pyutud');
  if (b.tsilli) {
    sooTsilli(b);
    return;
  }
  sonum.textContent = 'Püütud! Kriipsujuku tuleb! 🔪';
  jarjekord.push(b);
  tooJarjekord();
}

async function tooJarjekord() {
  if (hoivatud) return;
  hoivatud = true;
  while (jarjekord.length) {
    await tykelda(jarjekord.shift());
  }
  hoivatud = false;
  if (olek === 'lopp') soo();
}

async function tykelda(b) {
  const siht = piira(b.x + BROKOLI / 2 - NUGA_X * s, 0, laius - JUKU_LAIUS * s);
  const aeg = Math.max(0.35, Math.abs(siht - jukuX) / 260);

  // The caught broccoli floats down to the knife while he walks over.
  b.el.style.transition = `translate ${aeg}s ease-in-out`;
  b.x = siht + NUGA_X * s - BROKOLI / 2;
  b.y = maa - (JALAD_Y - NUGA_Y) * s - BROKOLI / 2 - 10;
  joonistaBrokoli(b);
  await Promise.all([konni(siht), oota(aeg * 1000)]);

  juku.classList.remove('loob');
  void juku.offsetWidth;
  juku.classList.add('loob');
  await oota(220);
  plahvata(b);
  await oota(260);
  juku.classList.remove('loob');
}

function plahvata(b) {
  const x = b.x + BROKOLI / 2;
  const y = b.y + BROKOLI / 2;
  b.el.remove();
  eemalda(b);
  hyyd(hyyuded[Math.floor(Math.random() * hyyuded.length)], x, y - 30);

  const tykke = raund === 1 ? 8 : 4; // fewer pieces in round 2, there are 50 broccoli
  for (let i = 0; i < tykke; i++) {
    const el = document.createElement('span');
    el.className = i % 3 === 0 ? 'tykk vars' : 'tykk';
    const t = {
      el,
      x,
      y,
      vx: (Math.random() - 0.5) * 320,
      vy: -150 - Math.random() * 250,
      poore: Math.random() * 360,
      keerlemine: (Math.random() - 0.5) * 720,
      sygavus: Math.random() * 30 - 4,
      maas: false
    };
    ala.append(el);
    tykid.push(t);
    joonistaTykk(t);
  }

  tykeldatud += 1;
  naitaSkoori();
  if (tykeldatud >= eesmark && olek === 'kaib') {
    olek = 'lopp';
    sonum.textContent = `Kõik ${eesmark} brokolit tükkideks! 🎉`;
    for (const muu of brokolid) {
      if (muu.olek === 'kukub') maandu(muu);
    }
  } else if (olek === 'kaib') {
    sonum.textContent = `Tükeldatud! Veel ${eesmark - tykeldatud} brokolit.`;
  }
}

async function soo() {
  olek = 'soob';
  await oota(900);
  sonum.textContent = 'Kõht läks tühjaks! Kriipsujuku sööb tükid ära. 😋';

  while (tykid.length) {
    const suu = () => jukuX + SUU_X * s;
    const lahim = tykid.reduce((a, t) => (Math.abs(t.x - suu()) < Math.abs(a.x - suu()) ? t : a));
    await konni(lahim.x - SUU_X * s, 320);

    const suuX = suu();
    const suuY = maa - (JALAD_Y - SUU_Y) * s;
    const soodavad = tykid.filter((t) => t === lahim || Math.abs(t.x - suuX) < 50);
    for (const t of soodavad) {
      tykid.splice(tykid.indexOf(t), 1);
      t.el.style.transition = 'translate .35s ease-in, scale .35s ease-in';
      t.x = suuX;
      t.y = suuY;
      joonistaTykk(t);
      t.el.style.scale = '.2';
    }
    juku.classList.add('soob');
    await oota(380);
    for (const t of soodavad) t.el.remove();
    hyyd('Nämm!', suuX, suuY - 40);
    juku.classList.remove('soob');
    await oota(120);
  }

  hyppa();
  if (raund === 1) {
    sonum.textContent = 'Kõht on täis! Nüüd 2. raund: 20 brokolit. Ära puuduta tsillisid! 🌶️';
    nupp.textContent = '2. raund! 🌶️';
    raund = 2;
  } else if (raund === 2) {
    sonum.textContent = 'Super! Nüüd 3. raund: 30 brokolit. Kui uks ilmub, mine kiiresti peitu! 🚪';
    nupp.textContent = '3. raund! 🚪';
    raund = 3;
  } else {
    sonum.textContent = 'VÕITSID! Kõik kolm raundi on läbi! 🏆';
    nupp.textContent = 'Mängi uuesti 🥦';
    raund = 1;
  }
  nupp.hidden = false;
  olek = 'ootab';
}

// A chilli was tapped: he walks over, eats it, and the costume bursts.
async function sooTsilli(b) {
  olek = 'pauk';
  sonum.textContent = 'Oi ei, tsilli! 🌶️';
  for (const muu of jarjekord.splice(0)) maandu(muu);
  for (const muu of brokolid) {
    if (muu !== b && muu.olek === 'kukub') maandu(muu);
  }
  while (hoivatud) await oota(50);

  // The chilli hovers above his head while he walks under it.
  const siht = piira(b.x + BROKOLI / 2 - SUU_X * s, 0, laius - JUKU_LAIUS * s);
  const aeg = Math.max(0.35, Math.abs(siht - jukuX) / 320);
  const suuY = maa - (JALAD_Y - SUU_Y) * s;
  b.el.style.transition = `translate ${aeg}s ease-in-out`;
  b.x = siht + SUU_X * s - BROKOLI / 2;
  b.y = suuY - BROKOLI - 40;
  joonistaBrokoli(b);
  await Promise.all([konni(siht, 320), oota(aeg * 1000)]);

  const suuX = jukuX + SUU_X * s;
  b.el.classList.remove('pyutud');
  b.el.style.transition = 'translate .35s ease-in, scale .35s ease-in';
  b.x = suuX - BROKOLI / 2;
  b.y = suuY - BROKOLI / 2;
  joonistaBrokoli(b);
  b.el.style.scale = '.3';
  juku.classList.add('soob');
  await oota(380);
  b.el.remove();
  eemalda(b);
  juku.classList.remove('soob');
  juku.classList.add('punane');
  hyyd('KUUM! 🔥', suuX, suuY - 40);
  await oota(1000);
  lohka();
}

function lohka(teade = 'PAUK! Kriipsujuku sõi tsilli ja brokoli lõhkes! Mäng läbi. 🌶️💥') {
  juku.classList.remove('punane');
  juku.classList.add('lohkes');
  const cx = jukuX + 120 * s;
  hyyd('PAUK! 💥', cx, maa - (JALAD_Y - 20) * s);
  // The costume flies apart into big green pieces.
  for (let i = 0; i < 36; i++) {
    const el = document.createElement('span');
    el.className = i % 4 === 0 ? 'tykk suur vars' : 'tykk suur';
    const t = {
      el,
      x: cx + (Math.random() - 0.5) * 200 * s,
      y: maa - (JALAD_Y - (i % 2 ? 10 : 150)) * s,
      vx: (Math.random() - 0.5) * 700,
      vy: -250 - Math.random() * 450,
      poore: Math.random() * 360,
      keerlemine: (Math.random() - 0.5) * 900,
      sygavus: Math.random() * 30 - 4,
      maas: false
    };
    ala.append(el);
    tykid.push(t);
    joonistaTykk(t);
  }
  sonum.textContent = teade;
  nupp.textContent = 'Proovi uuesti 🥦';
  nupp.hidden = false;
  raund = 1;
  olek = 'ootab';
}

// Round 3: a door appears, and he must hide behind it before the bird
// throws dynamite.
function paigutaUks() {
  const h = JUKU_KORGUS * s * 1.05;
  const w = h * 0.55;
  uks.style.width = `${w}px`;
  uks.style.height = `${h}px`;
  uks.style.translate = `${ukseX - w / 2}px ${maa - h + 8}px`;
}

async function avaUks() {
  olek = 'uks';
  peidus = false;
  minemas = false;
  for (const muu of jarjekord.splice(0)) maandu(muu);
  for (const b of brokolid) {
    if (b.olek === 'kukub') maandu(b);
  }
  // The door appears on the side away from him, so he has to run.
  const keskel = jukuX + (JUKU_LAIUS * s) / 2;
  ukseX = keskel > laius / 2 ? laius * 0.18 : laius * 0.82;
  paigutaUks();
  uks.classList.remove('lahti', 'raputab');
  uks.hidden = false;
  sonum.textContent = 'Uks! Puuduta ust ja mine kiiresti peitu! 🚪';
  hyyd('UKS! 🚪', ukseX, maa - JUKU_KORGUS * s * 1.05 - 20);
  await oota(5000);
  if (olek !== 'uks') return;

  sonum.textContent = peidus ? 'Lind tuleb! Kriipsujuku on peidus. 🤫' : 'Lind tuleb! Kiiresti uksest sisse! 🐦';
  const LENDAB = 3; // seconds for the bird to cross the sky
  lind.style.transition = 'none';
  lind.style.translate = '-90px 16px';
  lind.hidden = false;
  void lind.offsetWidth;
  lind.style.transition = `translate ${LENDAB}s linear`;
  lind.style.translate = `${laius + 90}px 16px`;

  // Three dynamites; the middle one is aimed at him (or at the door).
  const visked = [];
  let eelAeg = 0;
  for (const [i, aeg] of [0.7, 1.5, 2.3].entries()) {
    await oota((aeg - eelAeg) * 1000);
    eelAeg = aeg;
    if (olek !== 'uks') return;
    const lx = -90 + ((laius + 180) * aeg) / LENDAB + 35;
    const sihitud = i === 1;
    const sihtX = sihitud
      ? (peidus ? ukseX : jukuX + (JUKU_LAIUS * s) / 2)
      : 20 + Math.random() * (laius - 40);
    visked.push(viska(lx, 50, sihtX, sihitud));
  }
  await Promise.all(visked);
  await oota(800);
  if (olek !== 'uks') return;
  lind.hidden = true;
  if (!peidus) {
    lohka('PAUK! Dünamiit tabas kriipsujukut ja brokoli lõhkes! Mäng läbi. 🧨💥');
    return;
  }

  // Safe: he comes out and the door goes away.
  uks.classList.add('lahti');
  juku.classList.remove('peidus');
  await oota(400);
  if (olek !== 'uks') return;
  uks.hidden = true;
  uks.classList.remove('lahti');
  peidus = false;
  uksi += 1;
  hyppa();
  sonum.textContent = 'Pääsesid! Püüa edasi! 🥦';
  tekkeAeg = 0.5;
  olek = 'kaib';
}

async function minePeitu() {
  if (olek !== 'uks' || minemas || peidus) return;
  minemas = true;
  sonum.textContent = 'Kriipsujuku jookseb ukse juurde! 🏃';
  uks.classList.add('lahti');
  while (hoivatud) await oota(50);
  if (olek !== 'uks') return;
  await konni(ukseX - (JUKU_LAIUS * s) / 2, 420);
  if (olek !== 'uks') return;
  peidus = true;
  juku.classList.add('peidus');
  sonum.textContent = 'Peidus! 🤫';
  await oota(300);
  uks.classList.remove('lahti');
}

// The bird throws a dynamite from (x, y) down to the grass at sihtX.
async function viska(x, y, sihtX, sihitud) {
  const el = document.createElement('span');
  el.className = 'dunamiit';
  el.innerHTML = '<img src="dunamiit.svg" alt="" draggable="false">';
  el.style.translate = `${x}px ${y}px`;
  ala.append(el);
  void el.offsetWidth;
  el.style.transition = 'translate .8s ease-in, rotate .8s linear';
  el.style.translate = `${sihtX}px ${maa - 40}px`;
  el.style.rotate = `${Math.random() < 0.5 ? -360 : 360}deg`;
  await oota(800);
  el.remove();
  pauh(sihtX, maa - 20);
  if (!sihitud || olek !== 'uks') return;
  if (peidus) {
    uks.classList.remove('raputab');
    void uks.offsetWidth;
    uks.classList.add('raputab');
  } else {
    lohka('PAUK! Dünamiit tabas kriipsujukut ja brokoli lõhkes! Mäng läbi. 🧨💥');
  }
}

function pauh(x, y) {
  const el = document.createElement('span');
  el.className = 'pauh';
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.addEventListener('animationend', () => el.remove());
  ala.append(el);
  hyyd('PAUH!', x, y - 50);
}

// Clear the field before a new round.
function koristaVali() {
  for (const t of tykid.splice(0)) t.el.remove();
  for (const b of brokolid.splice(0)) b.el.remove();
  for (const el of ala.querySelectorAll('.dunamiit, .pauh')) el.remove();
  juku.classList.remove('lohkes', 'punane', 'peidus');
  uks.hidden = true;
  uks.classList.remove('lahti', 'raputab');
  lind.hidden = true;
  uksi = 0;
  peidus = false;
  minemas = false;
}

function samm(aeg) {
  const vahe = (aeg - eelmine) / 1000 || 0;
  const dt = Math.min(0.05, vahe);
  eelmine = aeg;

  // Hair reads the head position before this frame moves anything,
  // so the browser does not have to lay out the page twice.
  liigutaJuukseid(dt, aeg);

  // On a computer that keeps missing frames, thin the hair out by half once.
  aeglased = vahe > 0.034 ? aeglased + 1 : Math.max(0, aeglased - 1);
  const pooled = TUKK + KARVU + Math.floor(TAGA / 2);
  if (aeglased > 60 && karvad.length > pooled) karvad.length = pooled;

  if (olek === 'kaib') {
    tekkeAeg -= dt;
    const kukuvad = brokolid.filter((b) => b.olek === 'kukub').length;
    if (tekkeAeg <= 0 && kukuvad < (raund === 1 ? 5 : 6)) {
      tekita();
      tekkeAeg = raund === 1 ? 1.1 + Math.random() * 0.6 : 0.75 + Math.random() * 0.5;
    }
    if (raund === 3 && uksi < UKSI && tykeldatud >= 10 * (uksi + 1)) avaUks();
  }

  for (const b of brokolid) {
    if (b.olek !== 'kukub') continue;
    b.y += b.kiirus * dt;
    if (b.y + BROKOLI - 8 >= maa) maandu(b);
    else joonistaBrokoli(b);
  }

  for (const t of tykid) {
    if (t.maas) continue;
    t.vy += 900 * dt;
    t.x += t.vx * dt;
    t.y += t.vy * dt;
    t.poore += t.keerlemine * dt;
    if (t.x < 6 || t.x > laius - 6) {
      t.vx = -t.vx;
      t.x = piira(t.x, 6, laius - 6);
    }
    if (t.vy > 0 && t.y >= maa + t.sygavus) {
      t.y = maa + t.sygavus;
      t.maas = true;
    }
    joonistaTykk(t);
  }

  requestAnimationFrame(samm);
}

nupp.addEventListener('click', () => {
  if (olek !== 'ootab') return;
  koristaVali();
  eesmark = EESMARGID[raund - 1];
  tykeldatud = 0;
  naitaSkoori();
  tekkeAeg = 0;
  olek = 'kaib';
  nupp.hidden = true;
  sonum.textContent = [
    'Puuduta kukkuvat brokolit!',
    '2. raund! Püüa brokoleid, aga ära puuduta tsillisid! 🌶️',
    '3. raund! Kui uks ilmub, puuduta ust ja mine peitu! 🚪'
  ][raund - 1];
  hyppa();
});

uks.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  minePeitu();
});
uks.addEventListener('click', () => minePeitu());

juku.addEventListener('animationend', (event) => {
  if (event.animationName === 'huppa') juku.classList.remove('huppab');
});

window.addEventListener('resize', mootmed);

mootmed();
teeJuuksed();
jukuX = (laius - JUKU_LAIUS * s) / 2;
koht.style.left = `${jukuX}px`;
requestAnimationFrame(samm);
