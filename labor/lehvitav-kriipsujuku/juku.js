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
const JL_X = -70; // canvas box inside the figure, matches .juuksed
const JL_Y = -70;
const JL_LAIUS = 370;
const JL_KORGUS = 330;
const KARVU = 180;
const OSAD = 6; // segments per strand
const juuksevarvid = ['#8d4b1f', '#7a3f17', '#9c5826', '#a8632d'];
const vaikne = matchMedia('(prefers-reduced-motion: reduce)').matches;
const karvad = [];
let juukseMoot = 0;
let peaEelmine = null;

function teeJuuksed() {
  const r = pea.offsetWidth / 2;
  const kx = pea.offsetLeft + r - JL_X;
  const ky = pea.offsetTop + r - JL_Y;
  for (let i = 0; i < KARVU; i++) {
    const fii = (Math.random() * 2 - 1) * 105; // 0 is the top of the head
    const nurk = (fii * Math.PI) / 180;
    const juur = r - 5 - Math.random() * 7;
    const valja = 180 + fii; // pointing straight out of the head
    const alla = fii >= 0 ? 360 : 0; // pointing down on the same side
    // Butterfly cut: short face-framing layers over long back layers, ends flipped out.
    const lyhike = i % 5 < 2;
    const vajumine = lyhike ? 1 : 0.8 + (0.2 * Math.abs(fii)) / 105;
    const pikkus = lyhike
      ? (42 + (22 * Math.abs(fii)) / 105) * (0.85 + Math.random() * 0.3)
      : (120 + (60 * Math.abs(fii)) / 105) * (0.85 + Math.random() * 0.3);
    const pool = fii >= 0 ? 1 : -1;
    const algus = valja + 67 * pool; // mostly along the head, with a little lift
    const kaar = (lyhike ? 35 : 20) * -pool; // soft outward flip at the ends
    const puhke = [];
    for (let k = 0; k < OSAD; k++) {
      const ots = Math.max(0, (k - (OSAD - 3)) / 2);
      puhke.push(algus + (alla - algus) * vajumine * ((k + 0.5) / OSAD) ** 0.7 + kaar * ots);
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
      paks: 1.6 + Math.random() * 1.4,
      varv: juuksevarvid[i % juuksevarvid.length],
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

  const moot = s * (window.devicePixelRatio || 1);
  if (moot !== juukseMoot) {
    juukseMoot = moot;
    juukseLouend.width = Math.round(JL_LAIUS * moot);
    juukseLouend.height = Math.round(JL_KORGUS * moot);
  }
  jl.setTransform(moot, 0, 0, moot, 0, 0);
  jl.clearRect(0, 0, JL_LAIUS, JL_KORGUS);
  jl.lineCap = 'round';
  for (const k of karvad) {
    let px = k.x;
    let py = k.y;
    jl.strokeStyle = k.varv;
    for (let i = 0; i < OSAD; i++) {
      const a = ((k.puhke[i] + k.nihe * ((i + 1) / OSAD) ** 1.5) * Math.PI) / 180;
      const nx = px - Math.sin(a) * k.osa;
      const ny = py + Math.cos(a) * k.osa;
      jl.lineWidth = k.paks * (1 - i / (OSAD + 2));
      jl.beginPath();
      jl.moveTo(px, py);
      jl.lineTo(nx, ny);
      jl.stroke();
      px = nx;
      py = ny;
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
  const dt = Math.min(0.05, (aeg - eelmine) / 1000 || 0);
  eelmine = aeg;

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

  liigutaJuukseid(dt, aeg);
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
