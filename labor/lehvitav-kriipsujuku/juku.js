// Broccoli rain: tap a falling broccoli, the stick figure walks over and
// chops it with his knife. The pieces stay on the grass, and after ten
// broccoli he walks around and eats them all.

const ala = document.querySelector('#ala');
const koht = document.querySelector('#juku-koht');
const juku = document.querySelector('#juku');
const nupp = document.querySelector('#alusta');
const sonum = document.querySelector('#sonum');
const skoor = document.querySelector('#skoor');

const EESMARK = 10;
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
const TAGA = 90; // strands behind the head
const JL_X = -70; // canvas box inside the figure, matches .juuksed
const JL_Y = -70;
const JL_LAIUS = 370;
const JL_KORGUS = 330;
const KARVU = 200; // fewer, thicker strands keep slow computers smooth
const TUKK = 26; // short fringe strands over the forehead
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
  juukseTaust = teeJuukseTaust(kx, ky, r);
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
      jaikus: 45 + Math.random() * 30,
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
    const tuul = vaikne ? 0 : 5 * Math.sin(t * 1.3 + k.faas) + 2.5 * Math.sin(t * 2.9 + k.faas * 2);
    const siht = tuul + 1.7 * (vx * k.cos + vy * k.sin);
    k.kiirus += 0.45 * (dvx * k.cos + dvy * k.sin);
    k.kiirus += (k.jaikus * (siht - k.nihe) - 4 * k.kiirus) * dt;
    k.kiirus = piira(k.kiirus, -900, 900);
    k.nihe = piira(k.nihe + k.kiirus * dt, -70, 70);
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
  const mullid = [];
  const lisa = (mx, my) => mullid.push({ x: mx, y: my, r: 9 + Math.random() * 6 });
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
    rongad.push({
      x: x + (Math.random() * 2 - 1) * (laius + 4),
      y: y - r + Math.random() * (alla - y + r + 6),
      r: 3 + Math.random() * 4,
    });
  }
  return { x, y, r, laius, alla, mullid, rongad };
}

function joonistaJuukseTaust(c) {
  const { x, y, r, laius, alla, mullid, rongad } = juukseTaust;
  c.fillStyle = TAUSTAVARV;
  c.beginPath();
  c.arc(x, y, r + 12, Math.PI, 0); // over the top of the head
  c.lineTo(x + laius, alla);
  c.lineTo(x - laius, alla);
  c.closePath();
  for (const m of mullid) {
    c.moveTo(m.x + m.r, m.y);
    c.arc(m.x, m.y, m.r, 0, Math.PI * 2);
  }
  c.fill();
  // Small curl rings give the mass a frizzy look.
  c.strokeStyle = KRUSSIVARV;
  c.lineWidth = 1.8;
  c.beginPath();
  for (const g of rongad) {
    c.moveTo(g.x + g.r, g.y);
    c.arc(g.x, g.y, g.r, 0, Math.PI * 1.6);
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
  skoor.textContent = `🥦 ${Math.min(tykeldatud, EESMARK)} / ${EESMARK}`;
}

function joonistaBrokoli(b) {
  b.el.style.translate = `${b.x}px ${b.y}px`;
}

function joonistaTykk(t) {
  t.el.style.translate = `${t.x}px ${t.y}px`;
  t.el.style.rotate = `${t.poore}deg`;
}

function tekita() {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'brokoli';
  el.setAttribute('aria-label', 'Brokoli');
  el.innerHTML = '<img src="brokoli.svg" alt="" draggable="false">';
  const b = {
    el,
    x: 8 + Math.random() * Math.max(0, laius - BROKOLI - 16),
    y: -BROKOLI,
    kiirus: 55 + Math.random() * 55 + tykeldatud * 4,
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
    brokolid.splice(brokolid.indexOf(b), 1);
  }, 500);
}

function pyua(b) {
  if (olek !== 'kaib' || b.olek !== 'kukub') return;
  b.olek = 'pyutud';
  b.el.tabIndex = -1;
  b.el.classList.add('pyutud');
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
  brokolid.splice(brokolid.indexOf(b), 1);
  hyyd(hyyuded[Math.floor(Math.random() * hyyuded.length)], x, y - 30);

  for (let i = 0; i < 8; i++) {
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
  if (tykeldatud >= EESMARK && olek === 'kaib') {
    olek = 'lopp';
    sonum.textContent = 'Kõik brokolid tükkideks! 🎉';
    for (const muu of brokolid) {
      if (muu.olek === 'kukub') maandu(muu);
    }
  } else if (olek === 'kaib') {
    sonum.textContent = `Tükeldatud! Veel ${EESMARK - tykeldatud} brokolit.`;
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
  sonum.textContent = 'Kõht on täis! Nämm-nämm! 😋';
  nupp.textContent = 'Mängi uuesti 🥦';
  nupp.hidden = false;
  olek = 'ootab';
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
  const pooled = TUKK + Math.floor(KARVU / 2);
  if (aeglased > 60 && karvad.length > pooled) karvad.length = pooled;

  if (olek === 'kaib') {
    tekkeAeg -= dt;
    const kukuvad = brokolid.filter((b) => b.olek === 'kukub').length;
    if (tekkeAeg <= 0 && kukuvad < 5) {
      tekita();
      tekkeAeg = 1.1 + Math.random() * 0.6;
    }
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
  tykeldatud = 0;
  naitaSkoori();
  tekkeAeg = 0;
  olek = 'kaib';
  nupp.hidden = true;
  sonum.textContent = 'Puuduta kukkuvat brokolit!';
  hyppa();
});

juku.addEventListener('animationend', (event) => {
  if (event.animationName === 'huppa') juku.classList.remove('huppab');
});

window.addEventListener('resize', mootmed);

mootmed();
teeJuuksed();
jukuX = (laius - JUKU_LAIUS * s) / 2;
koht.style.left = `${jukuX}px`;
requestAnimationFrame(samm);
