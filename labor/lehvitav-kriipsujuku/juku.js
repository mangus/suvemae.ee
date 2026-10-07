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
jukuX = (laius - JUKU_LAIUS * s) / 2;
koht.style.left = `${jukuX}px`;
requestAnimationFrame(samm);
