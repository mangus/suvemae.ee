// Beebi maja: escape from the house of a babbling, toddling baby with a rattle.
// Find the key, the hammer and the wrench, sneak, hide, and run to the garden gate.
import { lab } from '../lab.js';

// The yard is 400 × 560; inside a house the 3D view fills the whole screen.
let W = 400;
let H = 560;
const SAMM = 60 / 128 / 2; // one eighth note at 128 bpm, in seconds

const louend = document.getElementById('louend');
let ctx = louend.getContext('2d'); // swapped briefly when the baby is drawn for the 3D view
const mangukast = louend.parentElement;
const kate = document.getElementById('kate');
const kateTekst = document.getElementById('kateTekst');
const alustaNupp = document.getElementById('alusta');
const aegEl = document.getElementById('aeg');
const parimEl = document.getElementById('parim');
const heliNupp = document.getElementById('heliNupp');
const vorm = document.getElementById('vorm');
const nimiEl = document.getElementById('nimi');
const tabelEl = document.getElementById('edetabel');

const dpr = Math.min(window.devicePixelRatio || 1, 2);
function louendiSuurus() {
  louend.width = Math.round(W * dpr);
  louend.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
louendiSuurus();

const minu = lab();

// localStorage can be blocked in private mode, so it must never break the game.
function loe(voti) {
  try {
    return localStorage.getItem(voti);
  } catch {
    return null;
  }
}
function kirjuta(voti, vaartus) {
  try {
    localStorage.setItem(voti, vaartus);
  } catch {
    // ignore
  }
}

let parim = Number(loe('beebi-maja-kiireim')) || 0; // fastest escape in seconds
parimEl.textContent = parim || '–';
nimiEl.value = loe('beebi-maja-nimi') || '';

// Our own song. Notes are [step, midi note, length in steps]; one line is 16 eighth notes.
const LAUL = [
  { tekst: 'Agu-agu, beebi tuleb!', noodid: [[0, 67, 1], [2, 67, 1], [4, 67, 1], [8, 64, 2], [10, 62, 2], [12, 60, 4]] },
  { tekst: 'Kõristi teeb kõks-kõks-kõks!', noodid: [[0, 69, 1], [2, 69, 1], [4, 69, 1], [8, 67, 2], [10, 64, 2], [12, 67, 4]] },
  { tekst: 'Beebi roomab, hopsti-hops!', noodid: [[0, 72, 2], [2, 72, 2], [4, 69, 2], [6, 67, 2], [8, 64, 1], [10, 67, 1], [12, 72, 4]] },
  { tekst: 'Peitu, peitu, ma leian ka!', noodid: [[0, 67, 2], [2, 64, 2], [4, 67, 2], [6, 64, 2], [8, 62, 2], [10, 64, 2], [12, 62, 2], [14, 60, 2]] },
];

// House footprints on the ground; the walls and roofs are drawn above them.
const majad = [
  { x: 30, y: 70, w: 120, h: 90, sein: '#ff9db5', katus: '#e8506f' },
  { x: 250, y: 70, w: 120, h: 90, sein: '#8fd3ff', katus: '#3d8fd1' },
  { x: 150, y: 245, w: 100, h: 90, sein: '#ffd166', katus: '#f08a24' },
  { x: 30, y: 410, w: 120, h: 90, sein: '#b8f28c', katus: '#4fa83a' },
  { x: 250, y: 410, w: 120, h: 90, sein: '#c9a7ff', katus: '#7d55d6' },
];
// Hiding spots just behind each house, near its corners.
const peidukohad = majad.flatMap((m) => [
  { x: m.x + 35, y: m.y - 3 },
  { x: m.x + m.w - 35, y: m.y - 3 },
]);
const lilled = Array.from({ length: 50 }, (_, i) => ({
  x: (i * 97 + 13) % W,
  y: (i * 151 + 29) % H,
  v: ['#ff6fa3', '#ffd23f', '#ffffff', '#9b7bff'][i % 4],
}));

const mangija = { x: 200, y: 535, liigub: false, suund: 1 };
const vanaisa = { x: 80, y: 300, z: 0, olek: 'demo', aeg: 0, hupe: null, hupeAeg: 0, kinni: 0 };
let mang = { kaib: false, aeg: 0, sees: false };
let huue = null; // a shout bubble: { tekst, kuni }
let kell = 0;
let viimane = 0;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---------- sound: drums, wooden knocks and a singing voice, all made with Web Audio ----------

// The baby's words, spoken by an Estonian speech voice and saved as sound files,
// so they sound Estonian even when the browser has no Estonian voice of its own.
const HAAL = {
  'Tüdrukud ja poisid, kus te olete?': 'kutse',
  'Ma-ma-ma-ma!': 'mama',
  'Ma-ma! Näen sind!': 'naen',
  'Mis see oli?': 'mis',
  'Sain kätte! Kalli-kalli!': 'kalli',
  'Tere! Sa oled nii nämma, ma söön su ära!': 'namma',
  'Sain kätte!': 'sain',
  'Oi! Sa pääsesid minema!': 'paasesid',
};
const klipid = {};
let klipp = null; // the sound file that is playing right now

function klippHeli(tekst) {
  const nimi = HAAL[tekst];
  if (!nimi) return null;
  if (!klipid[nimi]) {
    const a = new Audio(`haal/${nimi}.wav`);
    a.preservesPitch = false; // playing a little faster makes the voice higher, like a baby's
    a.webkitPreservesPitch = false;
    a.mozPreservesPitch = false;
    klipid[nimi] = a;
  }
  return klipid[nimi];
}

const heli = {
  ac: null,
  valjund: null,
  myra: null,
  sees: true,
  samm: 0,
  jargmine: 0,
  laulab: false,
  rida: -1,

  algata() {
    if (this.ac) {
      this.ac.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ac = new AC();
    this.valjund = this.ac.createGain();
    this.valjund.gain.value = this.sees ? 0.6 : 0;
    this.valjund.connect(this.ac.destination);
    const pikkus = Math.floor(this.ac.sampleRate * 0.5);
    this.myra = this.ac.createBuffer(1, pikkus, this.ac.sampleRate);
    const andmed = this.myra.getChannelData(0);
    for (let i = 0; i < pikkus; i++) andmed[i] = Math.random() * 2 - 1;
  },

  // Schedule the next notes slightly ahead of time so the beat stays steady.
  planeeri() {
    if (!this.ac) return;
    if (this.jargmine < this.ac.currentTime) this.jargmine = this.ac.currentTime + 0.05;
    while (this.jargmine < this.ac.currentTime + 0.12) {
      if (this.samm === 0) {
        this.rida = this.laulab ? (this.rida + 1) % LAUL.length : -1;
        if (this.rida >= 0) this.kone(LAUL[this.rida].tekst);
      }
      this.mangiSamm(this.samm, this.jargmine);
      this.jargmine += SAMM;
      this.samm = (this.samm + 1) % 16;
    }
  },

  mangiSamm(s, t) {
    if (this.laulab) {
      if ([0, 2, 4, 8, 10, 12].includes(s)) this.koputus(t, s % 8 === 4 ? 1.25 : 1);
      if (s === 6 || s === 14) this.trumm(t, 0.9);
      if (s % 2 === 1) this.myraLook(t, 8000, 0.08, 0.04, 'highpass');
      if (this.rida >= 0) {
        for (const [samm, noot, pikk] of LAUL[this.rida].noodid) {
          if (samm === s) this.laul(t, noot + 5, pikk * SAMM);
        }
      }
    } else if (s === 0 || s === 8) {
      this.trumm(t, 0.35); // a quiet heartbeat while the baby hides
    }
  },

  koputus(t, korgus) {
    const o = this.ac.createOscillator();
    const g = this.ac.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(560 * korgus, t);
    o.frequency.exponentialRampToValueAtTime(240 * korgus, t + 0.08);
    g.gain.setValueAtTime(0.7, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o.connect(g);
    g.connect(this.valjund);
    o.start(t);
    o.stop(t + 0.16);
    this.myraLook(t, 2500, 0.25, 0.03, 'bandpass');
  },

  trumm(t, tugevus) {
    const o = this.ac.createOscillator();
    const g = this.ac.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.2);
    g.gain.setValueAtTime(tugevus, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o.connect(g);
    g.connect(this.valjund);
    o.start(t);
    o.stop(t + 0.32);
  },

  myraLook(t, sagedus, tugevus, kestus, tyyp) {
    const s = this.ac.createBufferSource();
    s.buffer = this.myra;
    const f = this.ac.createBiquadFilter();
    f.type = tyyp;
    f.frequency.value = sagedus;
    const g = this.ac.createGain();
    g.gain.setValueAtTime(tugevus, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + kestus);
    s.connect(f);
    f.connect(g);
    g.connect(this.valjund);
    s.start(t);
    s.stop(t + kestus + 0.02);
  },

  // A wobbly old-man laa voice: two sawtooths through vowel filters, with vibrato.
  laul(t, noot, kestus) {
    const ac = this.ac;
    const sagedus = 440 * Math.pow(2, (noot - 69) / 12);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.9, t + 0.03);
    g.gain.setValueAtTime(0.9, t + kestus * 0.8);
    g.gain.exponentialRampToValueAtTime(0.0001, t + kestus);
    const f1 = ac.createBiquadFilter();
    f1.type = 'bandpass';
    f1.frequency.value = 700;
    f1.Q.value = 5;
    const f2 = ac.createBiquadFilter();
    f2.type = 'bandpass';
    f2.frequency.value = 1150;
    f2.Q.value = 6;
    const vib = ac.createOscillator();
    vib.frequency.value = 5.5;
    const vibTugevus = ac.createGain();
    vibTugevus.gain.value = 5;
    vib.connect(vibTugevus);
    for (const nihe of [-8, 8]) {
      const o = ac.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = sagedus;
      o.detune.value = nihe;
      vibTugevus.connect(o.frequency);
      o.connect(f1);
      o.connect(f2);
      o.start(t);
      o.stop(t + kestus + 0.05);
    }
    f1.connect(g);
    f2.connect(g);
    g.connect(this.valjund);
    vib.start(t);
    vib.stop(t + kestus + 0.05);
  },

  // A creaky floorboard: a squeaky slide through a narrow filter.
  kriuks() {
    if (!this.ac) return;
    const t = this.ac.currentTime;
    const o = this.ac.createOscillator();
    const f = this.ac.createBiquadFilter();
    const g = this.ac.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(320, t);
    o.frequency.linearRampToValueAtTime(190, t + 0.18);
    o.frequency.linearRampToValueAtTime(260, t + 0.4);
    f.type = 'bandpass';
    f.frequency.value = 900;
    f.Q.value = 4;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
    o.connect(f);
    f.connect(g);
    g.connect(this.valjund);
    o.start(t);
    o.stop(t + 0.45);
  },

  boing() {
    if (!this.ac) return;
    const t = this.ac.currentTime;
    const o = this.ac.createOscillator();
    const g = this.ac.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(700, t + 0.22);
    g.gain.setValueAtTime(0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o.connect(g);
    g.connect(this.valjund);
    o.start(t);
    o.stop(t + 0.32);
  },

  bonk() {
    if (!this.ac) return;
    const t = this.ac.currentTime;
    this.trumm(t, 1);
    this.koputus(t + 0.12, 0.8);
    this.koputus(t + 0.24, 0.6);
  },

  // The words are also read out by the browser's own voice, when it has one.
  kone(tekst, kohe = false) {
    if (!this.sees) return;
    const k = klippHeli(tekst);
    if (k) {
      if (!kohe && klipp && !klipp.paused && !klipp.ended) return;
      if (klipp && klipp !== k) klipp.pause();
      if ('speechSynthesis' in window) speechSynthesis.cancel();
      klipp = k;
      k.currentTime = 0;
      k.playbackRate = 1.25;
      k.play().catch(() => {});
      return;
    }
    if (!('speechSynthesis' in window)) return;
    // Other words use the browser's voice, but only an Estonian or Finnish one: an English voice sounds wrong.
    const haaled = speechSynthesis.getVoices();
    const keelne = (keel) => haaled.find((v) => v.lang && v.lang.toLowerCase().startsWith(keel));
    if (!keelne('et') && !keelne('fi')) return;
    if (kohe) speechSynthesis.cancel();
    else if (speechSynthesis.speaking) return;
    const u = new SpeechSynthesisUtterance(tekst.replace(/-/g, ' '));
    u.lang = 'et-EE';
    const haal = keelne('et') || keelne('fi');
    u.voice = haal;
    u.lang = haal.lang;
    u.pitch = 1.9;
    u.rate = 1.15;
    speechSynthesis.speak(u);
  },

  vaikus() {
    if (klipp) klipp.pause();
    this.laulab = false;
    this.rida = -1;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  },

  lulita() {
    this.sees = !this.sees;
    if (this.valjund) this.valjund.gain.value = this.sees ? 0.6 : 0;
    if (!this.sees && 'speechSynthesis' in window) speechSynthesis.cancel();
  },
};

// ---------- controls ----------

const klahvid = new Set();
let siht = null;
let vajutab = false;
const SUUNAD = {
  ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
  a: [-1, 0], d: [1, 0], w: [0, -1], s: [0, 1],
};

function klahv(e) {
  return e.key.length === 1 ? e.key.toLowerCase() : e.key;
}
window.addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLInputElement) return;
  const k = klahv(e);
  if (k === 'c' && mang.sees) {
    tuba.hiilib = !tuba.hiilib; // C turns sneaking on and off
    return;
  }
  if (!SUUNAD[k] && k !== 'Shift') return;
  klahvid.add(k);
  siht = null;
  if (mang.kaib) e.preventDefault();
});
window.addEventListener('keyup', (e) => klahvid.delete(klahv(e)));

function punkt(e) {
  const r = louend.getBoundingClientRect();
  return { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * H) / r.height };
}
louend.addEventListener('pointerdown', (e) => {
  louend.setPointerCapture(e.pointerId);
  if (mang.sees) {
    const nupp = nuppPunktis(punkt(e));
    if (nupp === 'hiili') {
      tuba.hiilib = !tuba.hiilib; // the sneak button stays on until it is tapped again
      return;
    }
    vajutused.set(e.pointerId, nupp || 'vaade');
    viimaneX.set(e.pointerId, e.clientX);
    lukusta(e);
    return;
  }
  vajutab = true;
  siht = punkt(e);
});
louend.addEventListener('pointermove', (e) => {
  if (mang.sees) {
    const nupp = vajutused.get(e.pointerId);
    if (nupp === 'vaade') {
      // Dragging on the 3D view turns you around.
      if (mang.kaib) tuba.nurk += (e.clientX - viimaneX.get(e.pointerId)) * 0.006;
      viimaneX.set(e.pointerId, e.clientX);
    } else if (nupp !== undefined) {
      vajutused.set(e.pointerId, nuppPunktis(punkt(e)));
    }
    return;
  }
  if (vajutab) siht = punkt(e);
});
function vabasta(e) {
  vajutab = false;
  vajutused.delete(e.pointerId);
  viimaneX.delete(e.pointerId);
  if (mang.sees && e.type === 'pointerup') lukusta(e);
}
const viimaneX = new Map(); // pointer id -> last x, for turning by dragging
// With a locked mouse, moving it turns you around.
document.addEventListener('mousemove', (e) => {
  if (mang.sees && mang.kaib && document.pointerLockElement === louend) tuba.nurk += e.movementX * 0.0025;
});
// A click or tap in a house makes the view truly full screen; a mouse click also locks the mouse for looking around.
function lukusta(e) {
  if (!mang.kaib || !mangukast.classList.contains('taisekraan')) return;
  if (!document.fullscreenElement && mangukast.requestFullscreen) mangukast.requestFullscreen().catch(() => {});
  if (e.pointerType === 'mouse' && document.pointerLockElement !== louend && louend.requestPointerLock) {
    try {
      const p = louend.requestPointerLock();
      if (p && p.catch) p.catch(() => {});
    } catch {
      // pointer lock is not available
    }
  }
}
louend.addEventListener('pointerup', vabasta);
louend.addEventListener('pointercancel', vabasta);

heliNupp.addEventListener('click', () => {
  heli.lulita();
  heliNupp.textContent = heli.sees ? '🔊 Heli sees' : '🔇 Heli väljas';
});
alustaNupp.addEventListener('click', alusta);

// ---------- game ----------

function porkub(x, y, r) {
  return majad.some((m) => x + r > m.x && x - r < m.x + m.w && y + r * 0.6 > m.y && y - r * 0.6 < m.y + m.h);
}

// Move one axis at a time, so you slide along walls instead of sticking to them.
function liiguta(o, dx, dy, r) {
  o.x += dx;
  if (porkub(o.x, o.y, r)) o.x -= dx;
  o.y += dy;
  if (porkub(o.x, o.y, r)) o.y -= dy;
  o.x = clamp(o.x, r, W - r);
  o.y = clamp(o.y, r + 4, H - r);
}

function huua(tekst, sekundid) {
  huue = { tekst, kuni: kell + sekundid };
}

function alustaHupe(kestus, korgus, kuhu) {
  vanaisa.hupe = { t: 0, kestus, korgus, alg: { x: vanaisa.x, y: vanaisa.y }, kuhu };
  heli.boing();
}

function valjaHupe() {
  vanaisa.olek = 'jaht';
  vanaisa.aeg = 0;
  alustaHupe(0.6, 55);
  huua('MA-MA-MA-MA!! 👶', 1.1);
  
  heli.kone('Ma-ma-ma-ma!', true);
}

function puhkama() {
  const valik = peidukohad.filter((p) => Math.hypot(p.x - mangija.x, p.y - mangija.y) > 200);
  const koht = valik[Math.floor(Math.random() * valik.length)] || peidukohad[0];
  vanaisa.olek = 'puhkab';
  heli.laulab = false;
  huua('Aa-aa… teen väikese uinaku!', 1.4);
  alustaHupe(1.1, 90, koht);
}

function uuenda(dt) {
  mang.aeg += dt;
  const k = Math.min(1, mang.aeg / 90); // it gets harder over 90 seconds

  // Player: keys first, otherwise run towards the touched point.
  let dx = 0;
  let dy = 0;
  for (const kl of klahvid) {
    if (!SUUNAD[kl]) continue;
    dx += SUUNAD[kl][0];
    dy += SUUNAD[kl][1];
  }
  if (!dx && !dy && siht && Math.hypot(siht.x - mangija.x, siht.y - mangija.y) > 5) {
    dx = siht.x - mangija.x;
    dy = siht.y - mangija.y;
  }
  const pikkus = Math.hypot(dx, dy);
  mangija.liigub = pikkus > 0;
  if (pikkus) {
    const v = (155 * dt) / pikkus;
    liiguta(mangija, dx * v, dy * v, 11);
    if (dx) mangija.suund = Math.sign(dx);
  }

  // Reaching the garden gate at the top means you escaped.
  if (mangija.y < 30 && Math.abs(mangija.x - 200) < 36) {
    voit();
    return;
  }

  const g = vanaisa;
  g.aeg += dt;
  const kaugus = Math.hypot(mangija.x - g.x, mangija.y - g.y);
  if (g.olek === 'peidus') {
    if (kaugus < 125 || g.aeg > 4.5 - 1.5 * k) valjaHupe();
  } else if (g.olek === 'jaht') {
    const kiirus = 105 + 55 * k;
    const ux = (mangija.x - g.x) / (kaugus || 1);
    const uy = (mangija.y - g.y) / (kaugus || 1);
    if (g.hupe) {
      // In the air he flies over the houses.
      g.x = clamp(g.x + ux * kiirus * 1.6 * dt, 18, W - 18);
      g.y = clamp(g.y + uy * kiirus * 1.6 * dt, 20, H - 6);
    } else {
      const ennex = g.x;
      const enney = g.y;
      const l = lonk();
      liiguta(g, ux * kiirus * l * dt, uy * kiirus * l * dt, 16);
      const liikus = Math.hypot(g.x - ennex, g.y - enney);
      g.kinni = liikus < kiirus * dt * 0.4 ? g.kinni + dt : 0;
      g.hupeAeg += dt;
      if (g.kinni > 0.25 || g.hupeAeg > 2.1 - 0.6 * k) alustaHupe(0.5, 32);
      else if (g.aeg > 6 + 3 * k) puhkama();
    }
  }

  if (g.hupe) {
    const h = g.hupe;
    h.t += dt;
    const p = Math.min(1, h.t / h.kestus);
    g.z = Math.sin(Math.PI * p) * h.korgus;
    if (h.kuhu) {
      g.x = h.alg.x + (h.kuhu.x - h.alg.x) * p;
      g.y = h.alg.y + (h.kuhu.y - h.alg.y) * p;
    }
    if (p >= 1) {
      if (!h.kuhu && porkub(g.x, g.y, 16)) {
        h.kestus += 0.1; // keep flying until he is clear of the house
      } else {
        g.hupe = null;
        g.z = 0;
        g.hupeAeg = 0;
        g.kinni = 0;
        if (g.olek === 'puhkab') {
          g.olek = 'peidus';
          g.aeg = 0;
        }
      }
    }
  }

  if (g.olek === 'jaht' && g.z < 12 && Math.hypot(mangija.x - g.x, mangija.y - g.y) < 24) kinni();
}

function alusta() {
  heli.algata();
  if (heli.sees && 'speechSynthesis' in window) {
    // Unlock speech on phones: it must start from a tap.
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    speechSynthesis.speak(u);
  }
  mangija.x = 200;
  mangija.y = 535;
  siht = null;
  klahvid.clear();
  const koht = peidukohad[Math.floor(Math.random() * 4)]; // behind one of the top houses
  Object.assign(vanaisa, { x: koht.x, y: koht.y, z: 0, olek: 'peidus', aeg: 0, hupe: null, hupeAeg: 0, kinni: 0 });
  taisVaade(false);
  mang = {
    kaib: true, aeg: 0, sees: false, valjas: false, paev: 1, tooriistad: new Set(),
    kodu: majad[2], jarjekord: [0, 1, 2].sort(() => Math.random() - 0.5),
  };
  vajutused.clear();
  korjatud.clear();
  huue = null;
  heli.vaikus();
  kate.hidden = true;
  vorm.hidden = true;
  sisene(mang.kodu); // you wake up inside the baby's house
}

// All the days are used up: the baby wins this time.
function lopp() {
  mang.kaib = false;
  if (mang.sees) taisVaade(false); // the end screen and high scores show in the normal page again
  heli.vaikus();
  heli.bonk();
  heli.kone('Sain kätte!', true);
  viimane = 0;
  kateTekst.textContent = `${PAEVI} päeva said läbi ja Beebi jäi seekord võitjaks. Proovi uuesti!`;
  alustaNupp.textContent = 'Proovi uuesti ▶';
  kate.hidden = false;
  vorm.hidden = true;
  huua('Sain kätte! Kallistus! 🤗', 3);
}

// You got out through the garden gate: the fewer seconds, the better.
function voit() {
  mang.kaib = false;
  if (mang.sees) taisVaade(false);
  heli.vaikus();
  pling();
  heli.kone('Oi! Sa pääsesid minema!', true);
  const sek = Math.max(1, Math.floor(mang.aeg));
  const rekord = !parim || sek < parim;
  if (rekord) {
    parim = sek;
    kirjuta('beebi-maja-kiireim', String(parim));
    parimEl.textContent = parim;
  }
  viimane = sek;
  aegEl.textContent = sek;
  kateTekst.textContent = `🎉 Sa pääsesid Beebi majast! Päev ${mang.paev}/${PAEVI}, aega kulus ${sek} sekundit.` + (rekord ? ' Uus rekord!' : '');
  alustaNupp.textContent = 'Mängi uuesti ▶';
  kate.hidden = false;
  vorm.hidden = false;
  huua('Oi-oi, ta pääses!', 3);
}

vorm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nimi = nimiEl.value.trim().slice(0, 16);
  if (!nimi || !viimane) return;
  vorm.hidden = true;
  kirjuta('beebi-maja-nimi', nimi);
  try {
    await minu.addScore(nimi, viimane, 'pogenemine');
    await naitaTabel();
  } catch (err) {
    const li = document.createElement('li');
    li.textContent = 'Ei saanud salvestada: ' + err.message;
    tabelEl.prepend(li);
  }
});

async function naitaTabel() {
  try {
    const parimad = await minu.topScores(10, { board: 'pogenemine', order: 'asc' });
    tabelEl.replaceChildren(
      ...parimad.map((r) => {
        const li = document.createElement('li');
        li.textContent = `${r.name} – ${r.score} s`;
        return li;
      }),
    );
    if (!parimad.length) tabelEl.innerHTML = '<li>Keegi pole veel põgenenud. Ole esimene!</li>';
  } catch {
    tabelEl.innerHTML = '<li>Edetabelit ei saanud praegu laadida.</li>';
  }
}

// ---------- drawing ----------

function kast(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function ovaal(x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}
function joon(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function joonistaMaja(m) {
  const yla = m.y - 30;
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#2b2340';
  ctx.fillStyle = m.sein;
  kast(m.x, yla, m.w, m.h + 30, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = m.katus;
  ctx.beginPath();
  ctx.moveTo(m.x - 8, yla + 2);
  ctx.lineTo(m.x + m.w / 2, yla - 32);
  ctx.lineTo(m.x + m.w + 8, yla + 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.lineWidth = 2;
  for (const wx of [m.x + 14, m.x + m.w - 36]) {
    ctx.fillStyle = '#fffbe6';
    kast(wx, yla + 16, 22, 20, 4);
    ctx.fill();
    ctx.stroke();
    joon(wx + 11, yla + 16, wx + 11, yla + 36);
    joon(wx, yla + 26, wx + 22, yla + 26);
  }
  ctx.fillStyle = '#8a5a30';
  kast(m.x + m.w / 2 - 12, m.y + m.h - 36, 24, 36, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffd23f';
  ovaal(m.x + m.w / 2 + 6, m.y + m.h - 18, 2, 2);
  ctx.fill();
}

function joonistaMangija() {
  const p = mangija;
  ctx.fillStyle = 'rgba(43, 35, 64, 0.2)';
  ovaal(p.x, p.y, 11, 4);
  ctx.fill();
  ctx.save();
  ctx.translate(p.x, p.y);
  const s = p.liigub ? Math.sin(kell * 16) : 0;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#3d5a99';
  ctx.lineWidth = 4;
  joon(-4, -10, -4 + s * 3, -1);
  joon(4, -10, 4 - s * 3, -1);
  ctx.strokeStyle = '#f1c9a5';
  ctx.lineWidth = 3;
  joon(-8, -20, -12, -13 + s * 3);
  joon(8, -20, 12, -13 - s * 3);
  ctx.fillStyle = '#ffc933';
  ctx.strokeStyle = '#2b2340';
  ctx.lineWidth = 2;
  kast(-8, -24, 16, 15, 5);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#f1c9a5';
  ovaal(0, -31, 8, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#4f8ff7';
  ctx.beginPath();
  ctx.arc(0, -32, 8.5, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillRect(p.suund > 0 ? 2 : -14, -34, 12, 3);
  ctx.fillStyle = '#2b2340';
  ovaal(p.suund * 2 - 2.5, -29.5, 1.2, 1.2);
  ctx.fill();
  ovaal(p.suund * 2 + 2.5, -29.5, 1.2, 1.2);
  ctx.fill();
  if (vanaisa.olek === 'jaht') {
    ovaal(p.suund * 2, -25.5, 1.6, 2);
    ctx.fill();
  }
  ctx.restore();
}

// The baby toddles: it sways from foot to foot and its speed comes in little bursts.
const lonkeFaas = () => Math.max(0, Math.sin(kell * 6));
const lonk = () => 1.05 - 0.4 * lonkeFaas();

// One chubby leg with a white sock; pool is -1 (left) or 1 (right), tostab is how high the foot is lifted.
function jalg(pool, tostab) {
  const hx = pool * 6;
  const fy = -3 - tostab;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#f2c4a0';
  ctx.lineWidth = 9;
  joon(hx, -20, hx + pool * 1.5, fy - 2);
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#d8d0e8';
  ctx.lineWidth = 1;
  ovaal(hx + pool * 2.5, fy, 6, 4);
  ctx.fill();
  ctx.stroke();
}

// One chubby arm in the snail suit; nurk swings it, lusikas puts a big spoon in its hand.
function kasi(pool, nurk, lusikas) {
  ctx.save();
  ctx.translate(pool * 13, -46);
  ctx.rotate(-pool * 0.5 + nurk);
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#a8cf5a'; // snail-green sleeve
  ctx.lineWidth = 7;
  joon(0, 0, 0, 9);
  ctx.strokeStyle = '#f2c4a0';
  ctx.lineWidth = 6;
  joon(0, 10, 0, 14);
  ctx.fillStyle = '#f6cfae';
  ovaal(0, 16, 3.8, 3.8);
  ctx.fill();
  if (lusikas) {
    // a big wooden spoon: "I'll eat you up!"
    ctx.strokeStyle = '#a8703a';
    ctx.lineWidth = 3;
    joon(0, 12, 0, 30);
    ctx.fillStyle = '#d9a35e';
    ctx.strokeStyle = '#8a5a2a';
    ctx.lineWidth = 1.2;
    ovaal(0, 35, 5, 7);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ovaal(-1.5, 33, 1.6, 3);
    ctx.fill();
  }
  ctx.restore();
}

// The baby's big round face.
function nagu(lobiseb) {
  ctx.fillStyle = '#f2c4a0';
  ovaal(-16, -64, 3.5, 4.5);
  ctx.fill();
  ovaal(16, -64, 3.5, 4.5);
  ctx.fill();
  const nahk = ctx.createRadialGradient(-5, -72, 3, 0, -66, 19);
  nahk.addColorStop(0, '#ffe6d2');
  nahk.addColorStop(0.75, '#f6c9a6');
  nahk.addColorStop(1, '#e3a985');
  ctx.fillStyle = nahk;
  ovaal(0, -66, 17, 17.5);
  ctx.fill();

  // one curl of hair on top
  ctx.strokeStyle = '#c98a4a';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-1, -83);
  ctx.quadraticCurveTo(-6, -90, 0, -91);
  ctx.quadraticCurveTo(5, -91, 3, -86);
  ctx.stroke();

  // big shiny eyes, blinking now and then
  if (kell % 3.4 < 0.13) {
    ctx.strokeStyle = '#2e2116';
    ctx.lineWidth = 1.4;
    joon(-9, -66, -3, -66);
    joon(3, -66, 9, -66);
  } else {
    for (const p of [-1, 1]) {
      ctx.fillStyle = '#ffffff';
      ovaal(p * 6, -66, 4.2, 4.6);
      ctx.fill();
      ctx.fillStyle = '#3a6fb0';
      ovaal(p * 6, -65.5, 3, 3.3);
      ctx.fill();
      ctx.fillStyle = '#1a1a2a';
      ovaal(p * 6, -65.5, 1.7, 1.9);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ovaal(p * 6 - 1.1, -67, 0.9, 0.9);
      ctx.fill();
    }
  }

  // tiny eyebrows and nose
  ctx.strokeStyle = 'rgba(160, 100, 60, 0.6)';
  ctx.lineWidth = 1;
  joon(-9, -72, -4, -73);
  joon(4, -73, 9, -72);
  ctx.fillStyle = '#eab08c';
  ovaal(0, -60.5, 2, 1.5);
  ctx.fill();

  // rosy cheeks
  ctx.fillStyle = 'rgba(240, 110, 120, 0.4)';
  ovaal(-10, -58.5, 3.8, 2.6);
  ctx.fill();
  ovaal(10, -58.5, 3.8, 2.6);
  ctx.fill();

  // a babbling mouth, or a dummy when the baby is quiet
  if (lobiseb) {
    ctx.fillStyle = '#b8434f';
    ovaal(0, -55, 3, 1 + Math.abs(Math.sin(kell * 9)) * 2.5);
    ctx.fill();
  } else {
    ctx.fillStyle = '#8fd3ff';
    ovaal(0, -55, 5, 2.4);
    ctx.fill();
    ctx.strokeStyle = '#3d8fd1';
    ctx.lineWidth = 1.2;
    ovaal(0, -52.5, 2.2, 2.2);
    ctx.stroke();
  }
}

// The snail hood with two eye stalks, worn over the baby's head.
function tiguMyts() {
  ctx.fillStyle = '#a8cf5a';
  ctx.strokeStyle = '#6f9a2e';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, -66, 20, Math.PI * 1.03, Math.PI * 1.97);
  ctx.quadraticCurveTo(0, -78, -20, -69);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  for (const p of [-1, 1]) {
    const kiik = Math.sin(kell * 4 + p) * 1.5;
    ctx.strokeStyle = '#8fbf45';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(p * 7, -84);
    ctx.quadraticCurveTo(p * 9, -92, p * 12 + kiik, -99);
    ctx.stroke();
    ctx.fillStyle = '#a8cf5a';
    ovaal(p * 12 + kiik, -100, 3.6, 3.6);
    ctx.fill();
    ctx.fillStyle = '#2b2340';
    ovaal(p * 12.6 + kiik, -100.3, 1.4, 1.4);
    ctx.fill();
  }
}

// The snail shell on the baby's back, peeking out on one side.
function tiguKarp() {
  const gr = ctx.createRadialGradient(-20, -46, 2, -18, -44, 19);
  gr.addColorStop(0, '#ffd28a');
  gr.addColorStop(1, '#d97f3a');
  ctx.fillStyle = gr;
  ctx.strokeStyle = '#9a5220';
  ctx.lineWidth = 1.5;
  ovaal(-18, -44, 18, 18);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#a85c26';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 60; i++) {
    const n = i * 0.22;
    const r = 14 - i * 0.22;
    const x = -18 + Math.cos(n) * r;
    const y = -44 + Math.sin(n) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

// The baby in a snail costume: a shell, a green suit, a hood with eye stalks and a big spoon.
function joonistaVanaisa() {
  const g = vanaisa;
  const tantsib = false; // the baby never dances
  const konnib = g.olek === 'jaht';
  const peidus = g.olek === 'peidus';
  const f = kell * 6;
  const tants = Math.sin(kell * 13);
  const kiik = konnib ? Math.sin(f) : 0; // toddling from one foot to the other

  ctx.fillStyle = 'rgba(43, 35, 64, 0.2)';
  ovaal(g.x, g.y, Math.max(8, 16 - g.z * 0.1), 5);
  ctx.fill();

  ctx.save();
  ctx.translate(g.x, g.y - g.z + (peidus ? 10 : 0));
  ctx.scale(1.15, 1.15);
  if (tantsib) ctx.rotate(tants * 0.08);

  jalg(-1, Math.max(0, -kiik) * 5 + (tantsib ? Math.max(0, tants) * 5 : 0));
  jalg(1, Math.max(0, kiik) * 5 + (tantsib ? Math.max(0, -tants) * 5 : 0));

  ctx.rotate(kiik * 0.12);
  tiguKarp();
  ctx.fillStyle = '#ffffff'; // nappy
  ctx.strokeStyle = '#d8d0e8';
  ctx.lineWidth = 1.2;
  kast(-13, -28, 26, 12, 6);
  ctx.fill();
  ctx.stroke();
  const keha = ctx.createLinearGradient(-14, 0, 14, 0);
  keha.addColorStop(0, '#8fbf45');
  keha.addColorStop(0.5, '#c8e88a');
  keha.addColorStop(1, '#8fbf45');
  ctx.fillStyle = keha;
  ctx.strokeStyle = '#6f9a2e';
  ovaal(0, -38, 14, 15);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffffff'; // onesie buttons
  for (const y of [-45, -39, -33]) {
    ovaal(0, y, 1.3, 1.3);
    ctx.fill();
  }

  const kaed = konnib ? Math.sin(f) * 0.4 : 0;
  kasi(-1, tantsib ? 1.6 + tants * 0.5 : kaed, false);
  kasi(1, tantsib ? -1.6 + tants * 0.5 : -kaed - (konnib ? 0.8 : 0), true);
  nagu(konnib || tantsib);
  tiguMyts();
  ctx.restore();
}

function mull(tekst, x, y) {
  ctx.font = 'bold 14px ui-rounded, system-ui, sans-serif';
  const w = ctx.measureText(tekst).width + 20;
  const h = 28;
  const bx = clamp(x - w / 2, 4, W - w - 4);
  const by = clamp(y - h, 4, H - h - 4);
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#2b2340';
  ctx.lineWidth = 2.5;
  kast(bx, by, w, h, 12);
  ctx.fill();
  ctx.stroke();
  const tx = clamp(x, bx + 14, bx + w - 14);
  ctx.beginPath();
  ctx.moveTo(tx - 6, by + h - 1.5);
  ctx.lineTo(tx, by + h + 8);
  ctx.lineTo(tx + 6, by + h - 1.5);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(tx - 6, by + h);
  ctx.lineTo(tx, by + h + 8);
  ctx.lineTo(tx + 6, by + h);
  ctx.stroke();
  ctx.fillStyle = '#2b2340';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(tekst, bx + w / 2, by + h / 2 + 1);
}

function lauluRida() {
  if (mang.kaib && heli.ac) return heli.rida;
  return Math.floor(kell / (SAMM * 16)) % LAUL.length;
}

function joonista() {
  if (mang.sees) {
    joonistaSees();
    return;
  }
  // The title screen: the baby's house at night with the baby at the door.
  const taevas = ctx.createLinearGradient(0, 0, 0, H);
  taevas.addColorStop(0, '#2b2350');
  taevas.addColorStop(1, '#7a5ca8');
  ctx.fillStyle = taevas;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff6c8';
  for (let i = 0; i < 24; i++) {
    ovaal((i * 97) % W, (i * 53) % 170, 1.5, 1.5);
    ctx.fill();
  }
  ovaal(330, 60, 22, 22); // the moon
  ctx.fill();
  ctx.fillStyle = '#5fae5a';
  ctx.fillRect(0, 470, W, H - 470);
  ctx.fillStyle = '#f4d6a0';
  ctx.fillRect(70, 230, 260, 240);
  ctx.fillStyle = '#c0504d';
  ctx.beginPath();
  ctx.moveTo(50, 235);
  ctx.lineTo(200, 130);
  ctx.lineTo(350, 235);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffd95a';
  for (const [x, y] of [[95, 260], [245, 260], [95, 360], [245, 360]]) ctx.fillRect(x, y, 60, 50);
  ctx.fillStyle = '#2fa84f';
  ctx.fillRect(170, 380, 60, 90);
  ctx.fillStyle = '#ffd166';
  ovaal(220, 428, 3, 3);
  ctx.fill();
  const vana = { x: vanaisa.x, y: vanaisa.y, z: vanaisa.z, olek: vanaisa.olek };
  Object.assign(vanaisa, { x: 200, y: 520, z: 0, olek: 'demo' });
  joonistaVanaisa();
  Object.assign(vanaisa, vana);
  if (huue && kell < huue.kuni) mull(huue.tekst, 200, 395);
}

// ---------- inside a house: a real 3D view drawn with raycasting ----------

// These change when the 3D view goes full screen (see taisVaade).
let VAATE_K = 440; // height of the 3D view; the touch buttons are below it
let KIIRI = 200; // number of rays, one per 2-pixel column
let TASAND = 0.5; // half the width of the view at distance 1: a wider screen shows more
let SKAALA = 400; // height of a wall on screen at distance 1
const PUUTE = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;

// Inside a house the 3D view fills the whole screen; outside it is the 400 × 560 yard again.
function taisVaade(sees) {
  mangukast.classList.toggle('taisekraan', sees);
  document.body.classList.toggle('lukus', sees);
  if (sees) {
    W = Math.max(320, window.innerWidth);
    H = Math.max(320, window.innerHeight);
  } else {
    W = 400;
    H = 560;
    if (document.pointerLockElement && document.exitPointerLock) document.exitPointerLock();
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
  }
  VAATE_K = !sees ? 440 : PUUTE ? H - clamp(Math.round(H * 0.17), 90, 130) : H;
  KIIRI = Math.min(480, Math.round(W / 2));
  zPuhver = new Float32Array(KIIRI);
  TASAND = clamp(W / (2 * VAATE_K), 0.5, 1);
  SKAALA = W / (2 * TASAND);
  louendiSuurus();
}
window.addEventListener('resize', () => {
  if (mangukast.classList.contains('taisekraan')) taisVaade(true);
});
// One map per house. Walls: 1 wallpaper, 2 bricks, 3 wood, 4 wallpaper with a painting,
// 5 bookshelf, 6 window, 9 the locked way out. Floor: . empty, * a tool, P plant, L lamp,
// V where the baby hides around a corner, B a bed you can hide under, K a wardrobe to hide in.
const KAARDID = [
  [
    '111146111111',
    '1*...1....*1',
    '1....5..3B.1',
    '1..P.......1',
    '1.K..1...L.1',
    '111.1141.111',
    '1V....1....1',
    '1.....1B.*.1',
    '1..2.......1',
    '1.P...1....1',
    '1.....1...L1',
    '111119111111',
  ],
  [
    '111611161111',
    '1...1......1',
    '1.*.5..33.B1',
    '1...5..33.*1',
    '1....K.....1',
    '11.1111.1111',
    '1V....1....1',
    '1..B..1..P.1',
    '1.22.......1',
    '1.....1....1',
    '1L....1...*1',
    '111119111111',
  ],
  [
    '111111461111',
    '1..*1.....*1',
    '1...1...B.L1',
    '1...11.11111',
    '1......K...1',
    '1.P..2.....1',
    '1....2..V..1',
    '11.111111.11',
    '1....B.5...1',
    '1.*....5...1',
    '1......5..P1',
    '119111111111',
  ],
  [
    '111111111111',
    '1*.......*.1',
    '1.11.55.11B1',
    '1.1......1.1',
    '1.1K.P...1.1',
    '1....33....1',
    '1.1..33..1.1',
    '1.1.....B1V1',
    '1.11....11.1',
    '1..........1',
    '1L...*....L1',
    '111111911111',
  ],
  [
    '111161161111',
    '1....1....*1',
    '1.*..5....B1',
    '1....5..P..1',
    '1L..K1.....1',
    '11.111111.11',
    '1......1V..1',
    '1..3..B1...1',
    '1..3.......1',
    '1......1.*.1',
    '1P.....1...1',
    '111119111111',
  ],
];
const SEIN = '1234569';
const onSein = (c) => SEIN.includes(c);
const kinnine = (c) => onSein(c) || c === 'P' || c === 'L';

function tekstuur(joonistus, w = 64, h = 64) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  joonistus(c.getContext('2d'));
  return c;
}
function ring(t, x, y, r) {
  t.beginPath();
  t.arc(x, y, r, 0, Math.PI * 2);
  t.fill();
}
function tapeet(t, varv) {
  t.fillStyle = varv;
  t.fillRect(0, 0, 64, 64);
  t.fillStyle = 'rgba(255, 255, 255, 0.3)';
  for (let x = 0; x < 64; x += 16) t.fillRect(x, 0, 6, 56);
  t.fillStyle = '#fff';
  for (const [x, y] of [[11, 12], [27, 36], [43, 18], [59, 44]]) ring(t, x, y, 3);
  t.fillStyle = '#8a5a30';
  t.fillRect(0, 56, 64, 8);
}
// A small painting of a sunny hill.
function maal(t) {
  t.fillStyle = '#8a5a30';
  t.fillRect(13, 9, 38, 32);
  t.save();
  t.beginPath();
  t.rect(17, 13, 30, 24);
  t.clip();
  t.fillStyle = '#9fdcff';
  t.fillRect(17, 13, 30, 24);
  t.fillStyle = '#ffd23f';
  ring(t, 39, 20, 5);
  t.fillStyle = '#7fd15a';
  t.beginPath();
  t.ellipse(28, 40, 22, 12, 0, 0, Math.PI * 2);
  t.fill();
  t.restore();
}
const TEKSTUURID = {
  2: tekstuur((t) => {
    t.fillStyle = '#f0d9c0';
    t.fillRect(0, 0, 64, 64);
    t.fillStyle = '#c8553d';
    for (let r = 0; r < 4; r++) {
      for (let c = -1; c < 3; c++) t.fillRect(c * 32 + (r % 2) * 16 + 1, r * 16 + 1, 30, 14);
    }
  }),
  3: tekstuur((t) => {
    t.fillStyle = '#b07d48';
    t.fillRect(0, 0, 64, 64);
    t.fillStyle = '#8a5a30';
    for (let x = 0; x < 64; x += 16) t.fillRect(x, 0, 2, 64);
    t.strokeStyle = 'rgba(90, 55, 25, 0.5)';
    for (let x = 6; x < 64; x += 16) {
      t.beginPath();
      t.moveTo(x, 0);
      t.bezierCurveTo(x + 4, 20, x - 3, 40, x + 2, 64);
      t.stroke();
    }
  }),
  5: tekstuur((t) => {
    t.fillStyle = '#6b4423';
    t.fillRect(0, 0, 64, 64);
    const varvid = ['#e8506f', '#3d8fd1', '#ffd166', '#4fa83a', '#9b7bff', '#f08a24'];
    for (let r = 0; r < 3; r++) {
      const y = 4 + r * 20;
      let x = 4;
      let i = r;
      while (x < 58) {
        const b = Math.min(4 + ((x * 7 + r * 3) % 4), 60 - x);
        const lyhem = (x + r) % 3;
        t.fillStyle = varvid[i++ % varvid.length];
        t.fillRect(x, y + lyhem, b, 16 - lyhem);
        x += b + 1;
      }
      t.fillStyle = '#4a2e14';
      t.fillRect(0, y + 16, 64, 4);
    }
  }),
  6: tekstuur((t) => {
    t.fillStyle = '#fff4d6';
    t.fillRect(0, 0, 64, 64);
    const taevas = t.createLinearGradient(0, 10, 0, 54);
    taevas.addColorStop(0, '#6ec6ff');
    taevas.addColorStop(1, '#d8f1ff');
    t.fillStyle = taevas;
    t.fillRect(10, 10, 44, 44);
    t.fillStyle = '#fff';
    for (const [x, y, r] of [[20, 24, 6], [27, 21, 8], [34, 24, 5]]) ring(t, x, y, r);
    t.fillStyle = '#7fd15a';
    t.fillRect(10, 45, 44, 9);
    t.fillStyle = '#8a5a30';
    t.fillRect(30, 10, 4, 44);
    t.fillRect(10, 30, 44, 4);
    t.strokeStyle = '#8a5a30';
    t.lineWidth = 4;
    t.strokeRect(10, 10, 44, 44);
    t.fillRect(6, 54, 52, 4);
  }),
  9: tekstuur((t) => {
    t.fillStyle = '#fff4d6';
    t.fillRect(0, 0, 64, 64);
    t.fillStyle = '#8a5a30';
    t.fillRect(14, 16, 36, 48);
    t.fillStyle = '#a8743f';
    t.fillRect(18, 28, 12, 14);
    t.fillRect(34, 28, 12, 14);
    t.fillStyle = '#ffd23f';
    t.fillRect(42, 46, 4, 4);
    t.fillStyle = '#2fa84f';
    t.fillRect(8, 2, 48, 12);
    t.fillStyle = '#fff';
    t.font = 'bold 9px sans-serif';
    t.textAlign = 'center';
    t.textBaseline = 'middle';
    t.fillText('VÄLJA', 32, 8.5);
  }),
};
// Wallpaper takes the colour of the house you are in.
const majaTekstuurid = new Map();
function seinaTekstuur(tyyp) {
  if (tyyp !== '1' && tyyp !== '4') return TEKSTUURID[tyyp] || TEKSTUURID[2];
  const voti = tyyp + tuba.maja.sein;
  if (!majaTekstuurid.has(voti)) {
    majaTekstuurid.set(voti, tekstuur((t) => {
      tapeet(t, tuba.maja.sein);
      if (tyyp === '4') maal(t);
    }));
  }
  return majaTekstuurid.get(voti);
}

// Things standing in the rooms, shown as flat pictures that always face you.
const TAIM = tekstuur((t) => {
  t.fillStyle = '#3f9a3a';
  for (const [x, y, rx, ry, n] of [[32, 22, 8, 18, 0], [20, 28, 7, 16, -0.6], [44, 28, 7, 16, 0.6], [14, 38, 6, 12, -1.1], [50, 38, 6, 12, 1.1]]) {
    t.beginPath();
    t.ellipse(x, y, rx, ry, n, 0, Math.PI * 2);
    t.fill();
  }
  t.fillStyle = '#d9663b';
  t.beginPath();
  t.moveTo(18, 44);
  t.lineTo(46, 44);
  t.lineTo(42, 64);
  t.lineTo(22, 64);
  t.closePath();
  t.fill();
  t.fillStyle = '#b8512c';
  t.fillRect(16, 42, 32, 6);
});
const LAMP = tekstuur((t) => {
  t.fillStyle = 'rgba(255, 230, 120, 0.35)';
  ring(t, 32, 20, 28);
  t.fillStyle = '#4a3b6b';
  t.fillRect(30, 28, 4, 92);
  t.beginPath();
  t.ellipse(32, 122, 14, 5, 0, 0, Math.PI * 2);
  t.fill();
  t.fillStyle = '#ffd166';
  t.strokeStyle = '#2b2340';
  t.lineWidth = 2;
  t.beginPath();
  t.moveTo(16, 32);
  t.lineTo(48, 32);
  t.lineTo(41, 8);
  t.lineTo(23, 8);
  t.closePath();
  t.fill();
  t.stroke();
}, 64, 128);
const VOODI = tekstuur((t) => {
  t.fillStyle = '#2b1a0c'; // the dark space under the bed
  t.fillRect(6, 24, 52, 16);
  t.fillStyle = '#6b4423';
  t.fillRect(2, 18, 6, 22);
  t.fillRect(56, 18, 6, 22);
  t.fillStyle = '#8a5a30';
  t.fillRect(2, 20, 60, 6);
  t.fillRect(2, 0, 6, 24);
  t.fillStyle = '#fff';
  t.fillRect(8, 11, 52, 10);
  t.fillStyle = '#5aa0e8';
  t.fillRect(18, 13, 42, 9);
  t.fillStyle = 'rgba(255, 255, 255, 0.45)';
  for (let x = 22; x < 60; x += 10) t.fillRect(x, 13, 4, 9);
  t.fillStyle = '#fff8e8';
  t.fillRect(9, 7, 12, 7);
}, 64, 40);
const TAHT = tekstuur((t) => {
  t.fillStyle = '#ffd23f';
  t.strokeStyle = '#c98a00';
  t.lineWidth = 3;
  t.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 13 : 29;
    const n = -Math.PI / 2 + (i * Math.PI) / 5;
    t.lineTo(32 + Math.cos(n) * r, 35 + Math.sin(n) * r);
  }
  t.closePath();
  t.fill();
  t.stroke();
  t.fillStyle = '#2b2340';
  ring(t, 27, 33, 2.5);
  ring(t, 37, 33, 2.5);
  t.strokeStyle = '#2b2340';
  t.lineWidth = 2;
  t.beginPath();
  t.arc(32, 37, 5, 0.3, Math.PI - 0.3);
  t.stroke();
});

const KAPP = tekstuur((t) => {
  t.fillStyle = '#5a381c';
  t.fillRect(2, 0, 60, 6);
  t.fillStyle = '#7a4a26';
  t.fillRect(4, 4, 56, 90);
  t.fillStyle = '#9a6a3c';
  t.fillRect(8, 10, 23, 80);
  t.fillRect(33, 10, 23, 80);
  t.strokeStyle = '#4e2e14';
  t.lineWidth = 2;
  t.strokeRect(8, 10, 23, 80);
  t.strokeRect(33, 10, 23, 80);
  t.fillStyle = '#ffd166';
  ring(t, 27, 50, 2.5);
  ring(t, 37, 50, 2.5);
}, 64, 96);
// The three things that open the locked door, drawn from emoji.
const TOORIISTAD = [
  { mark: '🔑', nimi: 'Võti' },
  { mark: '🔨', nimi: 'Haamer' },
  { mark: '🔧', nimi: 'Mutrivõti' },
].map((t) => ({
  ...t,
  pilt: tekstuur((c) => {
    c.fillStyle = 'rgba(255, 220, 90, 0.5)';
    ring(c, 32, 32, 30);
    c.font = '40px system-ui, sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(t.mark, 32, 34);
  }),
}));
const PAEVI = 5; // how many times the baby may catch you

const tuba = {
  maja: null, kaart: null, x: 0, y: 0, nurk: 0, kondib: false, asjad: [], kokku: 0,
  vx: 0, vy: 0, vz: 0, vOlek: 'peidus', vHupe: 0, ootab: 0, hoiatatud: false, raputus: 0,
};
const korjatud = new Set(); // stars picked up in this game, as 'house:x,y'
const BOONUS = 3; // seconds a star adds to your time
const HUPE_AEG = 0.7; // how long the baby's jump out of hiding lasts
let zPuhver = new Float32Array(KIIRI);
const NUPUD = [
  { id: 'vasak', mark: '◀' },
  { id: 'edasi', mark: '▲' },
  { id: 'tagasi', mark: '▼' },
  { id: 'parem', mark: '▶' },
  { id: 'hiili', mark: '🤫' }, // sneak: slow but silent
];
function nupuKast(i) {
  const w = (W - 4 * (NUPUD.length + 1)) / NUPUD.length;
  return { x: 4 + i * (w + 4), w };
}
const vajutused = new Map(); // pointer id -> button id, so two fingers work at once

function nuppPunktis(p) {
  if (p.y < VAATE_K) return null;
  const i = NUPUD.findIndex((n, j) => {
    const k = nupuKast(j);
    return p.x >= k.x && p.x < k.x + k.w;
  });
  return i >= 0 ? NUPUD[i].id : null;
}

function ruut(x, y) {
  const rida = tuba.kaart[Math.floor(y)];
  return (rida && rida[Math.floor(x)]) || '1';
}

// Waking up in the baby's house, under the bed farthest from his corner.
function sisene(m) {
  const k = Math.min(1, mang.aeg / 120);
  const nr = majad.indexOf(m);
  const s = tuba;
  s.maja = m;
  s.kaart = KAARDID[nr % KAARDID.length];
  s.asjad = [];
  s.kokku = 0;
  s.porand = [];
  const voodid = [];
  s.kaart.forEach((rida, y) => {
    [...rida].forEach((c, x) => {
      const voti = `${nr}:${x},${y}`;
      if (!kinnine(c) && c !== '9') s.porand.push({ x, y });
      if (c === '9') {
        s.uks = { x: x + 0.5, y };
      } else if (c === 'V') {
        s.vx = x + 0.5;
        s.vy = y + 0.5;
        s.koduX = x;
        s.koduY = y;
      } else if (c === 'B') {
        voodid.push({ x, y });
        s.asjad.push({ x: x + 0.5, y: y + 0.5, pilt: VOODI, laius: 1, korgus: 0.62, z: 0, peidik: true });
      } else if (c === 'K') {
        s.asjad.push({ x: x + 0.5, y: y + 0.5, pilt: KAPP, laius: 0.95, korgus: 0.95, z: 0, peidik: true });
      } else if (c === 'P') {
        s.asjad.push({ x: x + 0.5, y: y + 0.5, pilt: TAIM, laius: 0.7, korgus: 0.7, z: 0, blokk: true });
      } else if (c === 'L') {
        s.asjad.push({ x: x + 0.5, y: y + 0.5, pilt: LAMP, laius: 0.45, korgus: 0.9, z: 0, blokk: true });
      } else if (c === '*') {
        const i = mang.jarjekord[s.kokku % TOORIISTAD.length];
        s.kokku++;
        if (!korjatud.has(voti)) {
          s.asjad.push({ x: x + 0.5, y: y + 0.5, pilt: TOORIISTAD[i].pilt, laius: 0.45, korgus: 0.45, z: 0.12, taht: voti, tooriist: i });
        }
      }
    });
  });
  const kaugusKodust = (p) => Math.hypot(p.x - s.koduX, p.y - s.koduY);
  const voodi = voodid.sort((a, b) => kaugusKodust(b) - kaugusKodust(a))[0] || { x: Math.floor(s.uks.x), y: s.uks.y - 1 };
  s.x = voodi.x + 0.5;
  s.y = voodi.y + 0.5;
  // A few creaky floorboards; stepping on them without sneaking is loud.
  const lauad = s.porand.filter((p) => s.kaart[p.y][p.x] === '.');
  s.kriuksud = new Set();
  while (s.kriuksud.size < Math.min(8, lauad.length)) {
    const p = lauad[Math.floor(Math.random() * lauad.length)];
    s.kriuksud.add(p.y * 100 + p.x);
  }
  s.nurk = -Math.PI / 2;
  s.kondib = false;
  s.voodis = ruut(s.x, s.y) === 'B';
  s.kapis = false;
  s.peidus = s.voodis;
  s.silm = s.voodis ? 0.12 : 0.5;
  s.hiilib = false;
  s.myra = 0;
  s.ruutNr = Math.floor(s.y) * 100 + Math.floor(s.x);
  s.vSiht = null;
  s.viimati = null;
  s.nuusk = 0;
  s.kadunud = 0;
  s.otsiAeg = 0;
  s.sammuAeg = 0;
  s.jutuAeg = 2;
  s.vz = 0;
  s.vOlek = 'otsib';
  s.vHupe = 0;
  s.ootab = 9 - 3 * k;
  s.hoiatatud = false;
  s.raputus = 0;
  mang.sees = true;
  mang.valjas = false;
  taisVaade(true);
  siht = null;
  vajutab = false;
  vajutused.clear();
  klahvid.clear();
  heli.laulab = false;
  const puudu = puuduvad();
  huua(puudu ? `🌙 Päev ${mang.paev}/${PAEVI}. Leia ${puudu} ja pääse majast välja!` : `🌙 Päev ${mang.paev}/${PAEVI}. Kõik on käes, mine VÄLJA-ukse juurde!`, 3.5);
}

function lahku() {
  const m = tuba.maja;
  mang.sees = false;
  mang.valjas = true;
  taisVaade(false);
  vajutused.clear();
  siht = null;
  mangija.x = m.x + m.w / 2;
  mangija.y = m.y + m.h + 26;
  klahvid.clear();
  const valik = peidukohad.filter((p) => Math.hypot(p.x - mangija.x, p.y - mangija.y) > 200);
  const koht = valik[Math.floor(Math.random() * valik.length)] || peidukohad[0];
  Object.assign(vanaisa, { x: koht.x, y: koht.y, z: 0, olek: 'peidus', aeg: 0, hupe: null, hupeAeg: 0, kinni: 0 });
  heli.laulab = false;
  huua('🎉 Pääsesid majast välja! Nüüd jookse üles väravasse 🏁', 2.5);
}

// Distances from the player to every floor square, so the baby can find his way around walls.
function kaugusKaart(px, py) {
  const kaugused = new Map([[py * 100 + px, 0]]);
  const jarjekord = [[px, py]];
  for (let i = 0; i < jarjekord.length; i++) {
    const [x, y] = jarjekord[i];
    const d = kaugused.get(y * 100 + x);
    for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
      const voti = ny * 100 + nx;
      if (!kaugused.has(voti) && !kinnine(ruut(nx + 0.5, ny + 0.5))) {
        kaugused.set(voti, d + 1);
        jarjekord.push([nx, ny]);
      }
    }
  }
  return kaugused;
}

// Is there no wall on the straight line between two points?
function naeb(x1, y1, x2, y2) {
  const d = Math.hypot(x2 - x1, y2 - y1);
  for (let t = 0; t < d; t += 0.1) {
    if (onSein(ruut(x1 + ((x2 - x1) * t) / d, y1 + ((y2 - y1) * t) / d))) return false;
  }
  return true;
}

function pling() {
  if (!heli.ac) return;
  const t = heli.ac.currentTime;
  [988, 1319].forEach((sagedus, i) => {
    const o = heli.ac.createOscillator();
    const g = heli.ac.createGain();
    o.type = 'triangle';
    o.frequency.value = sagedus;
    g.gain.setValueAtTime(0.3, t + i * 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.25);
    o.connect(g);
    g.connect(heli.valjund);
    o.start(t + i * 0.08);
    o.stop(t + i * 0.08 + 0.3);
  });
}

function hyppaValjaSees() {
  tuba.vOlek = 'jaht';
  tuba.vHupe = HUPE_AEG;
  tuba.kadunud = 0;
  tuba.viimati = { x: Math.floor(tuba.x), y: Math.floor(tuba.y) };
  tuba.raputus = 0.45;
  huua('MA-MA-MA-MA!! 👶', 1.4);
  
  heli.boing();
  heli.kone('Ma-ma-ma-ma!', true);
}

// Lines the baby mutters while he limps around looking for you (our own words).
const OTSI = ['Tüdrukud ja poisid, kus te olete?']; // the child wants the baby to call this out

function puuduvad() {
  return TOORIISTAD.filter((_, i) => !mang.tooriistad.has(i)).map((t) => t.mark).join(' ');
}

function juhuslikRuut() {
  const p = tuba.porand;
  return p[Math.floor(Math.random() * p.length)];
}

// The baby heard you, so he limps over to see what it was.
function kuuleb() {
  const s = tuba;
  s.vOlek = 'otsib';
  s.vSiht = { x: Math.floor(s.x), y: Math.floor(s.y) };
  s.nuusk = 0;
  s.otsiAeg = 0;
  huua('👂 Mis see oli? Ma kuulsin midagi!', 1.6);
  heli.kone('Mis see oli?', true);
}

// Caught: the baby carries you back to bed and a new day starts, until the days run out.
function kinni() {
  heli.vaikus();
  heli.bonk();
  if (mang.paev >= PAEVI) {
    lopp();
    return;
  }
  mang.paev++;
  heli.kone('Tere! Sa oled nii nämma, ma söön su ära!', true);
  sisene(mang.kodu);
  huua(`👶 Tere! Sa oled nii nämma, ma söön su ära! 🌙 Beebi kallistas sind ja sa jäid magama. Päev ${mang.paev}/${PAEVI}`, 3);
}

function uuendaSees(dt) {
  const s = tuba;
  mang.aeg += dt;
  const k = Math.min(1, mang.aeg / 120);
  s.raputus = Math.max(0, s.raputus - dt);
  const nupud = new Set(vajutused.values());
  let edasi = 0;
  let poore = 0;
  if (klahvid.has('ArrowUp') || klahvid.has('w') || nupud.has('edasi')) edasi += 1;
  if (klahvid.has('ArrowDown') || klahvid.has('s') || nupud.has('tagasi')) edasi -= 1;
  if (klahvid.has('ArrowLeft') || klahvid.has('a') || nupud.has('vasak')) poore -= 1;
  if (klahvid.has('ArrowRight') || klahvid.has('d') || nupud.has('parem')) poore += 1;
  const hiilib = s.hiilib || klahvid.has('Shift');
  s.nurk += poore * 2.4 * dt;
  s.kondib = edasi !== 0;
  const kaik = hiilib ? 1.2 : 2.6; // sneaking is slow but silent
  const dx = Math.cos(s.nurk) * edasi * kaik * dt;
  const dy = Math.sin(s.nurk) * edasi * kaik * dt;
  const r = 0.22;
  // The green door only opens with the key, the hammer and the wrench.
  const uksel = Math.abs(s.x - s.uks.x) < 0.5 && s.y > s.uks.y - 0.3;
  if (uksel || ruut(s.x + dx + Math.sign(dx) * r, s.y + dy + Math.sign(dy) * r) === '9') {
    if (mang.tooriistad.size >= TOORIISTAD.length) {
      voit();
      return;
    }
    if (!huue || kell > huue.kuni) huua(`🔒 Uks on lukus! Leia veel: ${puuduvad()}`, 1.8);
  }
  const vaba = (x, y) => !s.asjad.some((a) => a.blokk && Math.hypot(a.x - x, a.y - y) < 0.5);
  if (!onSein(ruut(s.x + dx + Math.sign(dx) * r, s.y)) && vaba(s.x + dx, s.y)) s.x += dx;
  if (!onSein(ruut(s.x, s.y + dy + Math.sign(dy) * r)) && vaba(s.x, s.y + dy)) s.y += dy;

  // Picking up the things that open the door.
  const leitud = s.asjad.filter((a) => a.taht && Math.hypot(a.x - s.x, a.y - s.y) < 0.5);
  if (leitud.length) {
    for (const a of leitud) {
      korjatud.add(a.taht);
      mang.tooriistad.add(a.tooriist);
    }
    s.asjad = s.asjad.filter((a) => !leitud.includes(a));
    pling();
    const t = TOORIISTAD[leitud[0].tooriist];
    const puudu = puuduvad();
    huua(puudu ? `${t.mark} ${t.nimi} leitud! Veel: ${puudu}` : `${t.mark} Kõik käes! Nüüd mine VÄLJA-ukse juurde! 🚪`, 2.4);
  }

  // Hiding under a bed or in a wardrobe.
  const oliPeidus = s.peidus;
  s.voodis = ruut(s.x, s.y) === 'B';
  s.kapis = ruut(s.x, s.y) === 'K';
  s.peidus = s.voodis || s.kapis;
  s.silm += ((s.voodis ? 0.12 : 0.5) - s.silm) * Math.min(1, dt * 8); // crawl down low
  if (s.peidus && !oliPeidus && s.vOlek !== 'jaht') huua(s.kapis ? '🚪 Kapis on pime ja vaikne…' : '🛏️ Voodi all on turvaline!', 1.6);

  // Walking makes noise and creaky floorboards creak; when it gets too loud, the baby hears you.
  const ruutNr = Math.floor(s.y) * 100 + Math.floor(s.x);
  if (s.kondib && !hiilib) s.myra += dt * 0.22;
  if (ruutNr !== s.ruutNr) {
    s.ruutNr = ruutNr;
    if (s.kriuksud.has(ruutNr) && !hiilib) {
      s.myra += 0.7;
      heli.kriuks();
      huua('KRIIIUKS! 😬', 1);
    }
  }
  s.myra = Math.max(0, s.myra - dt * 0.12);
  if (s.myra >= 1) {
    s.myra = 0;
    if (s.vOlek !== 'jaht') kuuleb();
  }

  const kaugus = Math.hypot(s.x - s.vx, s.y - s.vy);
  const naebSind = !s.peidus && kaugus < 7 && naeb(s.x, s.y, s.vx, s.vy);
  s.vHupe = Math.max(0, s.vHupe - dt);
  if (s.vOlek === 'peidus') {
    // At first the baby waits around a corner and jumps out when you come close.
    s.ootab -= dt;
    if (!s.hoiatatud && s.ootab < 1.6) {
      s.hoiatatud = true;
      huua('Kõks… kõks… keegi on siin!', 1.5);
      if (heli.ac) heli.koputus(heli.ac.currentTime, 0.7);
    }
    if (!s.peidus && (kaugus < 1.4 || (kaugus < 3 && naebSind))) {
      hyppaValjaSees();
    } else if (s.ootab <= 0) {
      s.vOlek = 'otsib';
      s.vSiht = null;
      huua('Agu! Lähen otsin sind!', 1.6);
    }
    return;
  }
  if (s.vOlek === 'otsib' && naebSind) {
    s.vOlek = 'jaht';
    s.kadunud = 0;
    
    huua('Ma-ma! Näen sind! 👀', 1.4);
    heli.kone('Ma-ma! Näen sind!', true);
  }
  if (s.vOlek === 'jaht') {
    if (naebSind) {
      s.kadunud = 0;
      s.viimati = { x: Math.floor(s.x), y: Math.floor(s.y) };
    } else {
      s.kadunud += dt;
    }
    if (s.peidus || s.kadunud > 2.5) {
      // He lost you: he limps to where he saw you last and sniffs around.
      s.vOlek = 'otsib';
      s.vSiht = s.viimati || { x: Math.floor(s.vx), y: Math.floor(s.vy) };
      s.nuusk = 0;
      s.otsiAeg = 0;
      heli.laulab = false;
      huua('Tüdrukud ja poisid, kus te olete? 🤔', 1.8);
      heli.kone('Tüdrukud ja poisid, kus te olete?', true);
    }
  } else {
    s.jutuAeg -= dt;
    if (s.jutuAeg <= 0) {
      s.jutuAeg = 4 + Math.random() * 2;
      const jutt = OTSI[Math.floor(Math.random() * OTSI.length)];
      if (!huue || kell > huue.kuni) huua(jutt, 1.8);
      heli.kone(jutt, true);
    }
  }

  // Find the way around the walls, one square at a time.
  if (s.vOlek === 'otsib' && !s.vSiht) s.vSiht = juhuslikRuut();
  const jaht = s.vOlek === 'jaht';
  const sihtX = jaht ? Math.floor(s.x) : s.vSiht.x;
  const sihtY = jaht ? Math.floor(s.y) : s.vSiht.y;
  const gx = Math.floor(s.vx);
  const gy = Math.floor(s.vy);
  let siheX = jaht ? s.x : sihtX + 0.5;
  let siheY = jaht ? s.y : sihtY + 0.5;
  if (gx !== sihtX || gy !== sihtY) {
    const kaugused = kaugusKaart(sihtX, sihtY);
    let lahim = Infinity;
    for (const [nx, ny] of [[gx + 1, gy], [gx - 1, gy], [gx, gy + 1], [gx, gy - 1]]) {
      const d = kaugused.get(ny * 100 + nx);
      if (d !== undefined && d < lahim) {
        lahim = d;
        siheX = nx + 0.5;
        siheY = ny + 0.5;
      }
    }
  }
  s.otsiAeg += dt;
  const kohal = !jaht && Math.hypot(s.vx - siheX, s.vy - siheY) < 0.1;
  if (kohal || (!jaht && s.otsiAeg > 15)) {
    // At the spot he stops and sniffs for a moment, then limps somewhere else.
    if (s.nuusk === 0 && kohal) huua('Hmm-hmm… 👶', 1.2);
    s.nuusk += dt;
    if (s.nuusk > 2 || !kohal) {
      s.nuusk = 0;
      s.otsiAeg = 0;
      s.vSiht = juhuslikRuut();
    }
  } else {
    const kiirus = jaht ? (1.5 + 0.9 * k) * (s.vHupe > 0 ? 1.9 : lonk()) : (0.9 + 0.5 * k) * lonk();
    const ex = siheX - s.vx;
    const ey = siheY - s.vy;
    const e = Math.hypot(ex, ey);
    if (e > 0.01) {
      const samm = Math.min(e, kiirus * dt);
      s.vx += (ex / e) * samm;
      s.vy += (ey / e) * samm;
    }
    // His limping steps sound louder the closer he is.
    s.sammuAeg -= dt;
    if (s.sammuAeg <= 0) {
      s.sammuAeg = 0.52;
      if (heli.ac) heli.trumm(heli.ac.currentTime, clamp(0.55 - kaugus * 0.05, 0.03, 0.55));
    }
  }
  if (s.vHupe > 0) {
    s.vz = Math.sin(Math.PI * (1 - s.vHupe / HUPE_AEG)) * 0.45;
  } else if (jaht) {
    s.vz = 0;
  } else {
    s.vz = 0;
  }
  if (!s.peidus && kaugus < 0.45 && s.vz < 0.2) kinni();
}

// The baby is drawn once per frame onto a small canvas and shown as a picture in 3D.
const V_LAI = 140;
const V_KORGUS = 130;
const vPilt = document.createElement('canvas');
vPilt.width = V_LAI * 2;
vPilt.height = V_KORGUS * 2;
const vCtx = vPilt.getContext('2d');
function renderVanaisaPilt(olek) {
  const paris = ctx;
  const g = vanaisa;
  const salvestus = { x: g.x, y: g.y, z: g.z, olek: g.olek };
  vCtx.setTransform(1, 0, 0, 1, 0, 0);
  vCtx.clearRect(0, 0, vPilt.width, vPilt.height);
  vCtx.setTransform(2, 0, 0, 2, 0, 0);
  ctx = vCtx;
  Object.assign(g, { x: V_LAI / 2, y: V_KORGUS - 5, z: 0, olek });
  joonistaVanaisa();
  Object.assign(g, salvestus);
  ctx = paris;
}

// Draw a flat picture standing in the room, column by column, hidden behind nearer walls.
function joonistaSprait(kaamera, a) {
  const { x, y, dirX, dirY, plX, plY, pool, lai } = kaamera;
  const sx = a.x - x;
  const sy = a.y - y;
  const inv = 1 / (plX * dirY - dirX * plY);
  const tx = inv * (dirY * sx - dirX * sy);
  const ty = inv * (-plY * sx + plX * sy);
  if (ty < 0.15) return;
  const yks = SKAALA / ty; // one wall height on screen at this distance
  const ekraanX = (W / 2) * (1 + tx / ty);
  const h = a.korgus * yks;
  const w = a.laius * yks;
  const yla = pool + yks * kaamera.silm - a.z * yks - h;
  const x0 = ekraanX - w / 2;
  const pw = a.pilt.width;
  const allikaLai = Math.min(pw, (pw * lai) / w);
  const algus = Math.max(0, Math.floor(x0 / lai));
  const lopuni = Math.min(KIIRI, Math.ceil((x0 + w) / lai));
  for (let i = algus; i < lopuni; i++) {
    if (ty >= zPuhver[i]) continue;
    const srcX = clamp(((i * lai - x0) / w) * pw, 0, pw - allikaLai);
    ctx.drawImage(a.pilt, srcX, 0, allikaLai, a.pilt.height, i * lai, yla, lai + 0.5, h);
  }
}

// Your own hands at the bottom of the view, swinging as you walk.
function joonistaKaed(s) {
  const kiik = s.kondib ? Math.sin(kell * 11) * 7 : Math.sin(kell * 2) * 2;
  for (const p of [-1, 1]) {
    ctx.save();
    const k = clamp(VAATE_K / 440, 0.8, 2); // bigger hands on a bigger screen
    ctx.translate(W / 2 + p * 110 * k, VAATE_K + (18 + kiik * p) * k);
    ctx.scale(k, k);
    ctx.rotate(-p * 0.3);
    ctx.fillStyle = '#ffc933';
    ctx.strokeStyle = '#2b2340';
    ctx.lineWidth = 3;
    kast(-24, -40, 48, 90, 16);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f1c9a5';
    ovaal(0, -50, 26, 22);
    ctx.fill();
    ctx.stroke();
    ctx.lineWidth = 2;
    for (const kx of [-12, -4, 4, 12]) joon(kx, -66, kx, -58);
    ctx.restore();
  }
}

// Looking out from under a bed: wooden slats above you and the edge of the blanket.
function joonistaVoodiAlune() {
  const k = VAATE_K * 0.4;
  ctx.fillStyle = '#5aa0e8';
  ctx.beginPath();
  ctx.moveTo(-10, k - 14);
  for (let x = -10; x <= W + 20; x += 30) ctx.quadraticCurveTo(x + 15, k + 14, x + 30, k - 2);
  ctx.lineTo(W + 20, -10);
  ctx.lineTo(-10, -10);
  ctx.closePath();
  ctx.fill();
  const gr = ctx.createLinearGradient(0, 0, 0, k - 20);
  gr.addColorStop(0, '#1e120a');
  gr.addColorStop(1, '#3a2414');
  ctx.fillStyle = gr;
  ctx.fillRect(-10, -10, W + 20, k - 10);
  ctx.fillStyle = '#6b4423';
  for (let x = 10; x < W; x += 80) ctx.fillRect(x, -10, 34, k - 14);
  if (!huue || kell > huue.kuni) mull('🛏️ Oled voodi all. Siin beebi sind kätte ei saa!', W / 2, VAATE_K - 80);
}

// Peeking out through the gap between the wardrobe doors.
function joonistaKapiSees() {
  const pilu = Math.max(24, W * 0.07);
  ctx.fillStyle = 'rgba(30, 16, 6, 0.97)';
  ctx.fillRect(-20, -20, W / 2 - pilu / 2 + 20, VAATE_K + 40);
  ctx.fillRect(W / 2 + pilu / 2, -20, W / 2 + 20, VAATE_K + 40);
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(W / 2 - pilu / 2 - 8, -20, 8, VAATE_K + 40);
  ctx.fillRect(W / 2 + pilu / 2, -20, 8, VAATE_K + 40);
  if (!huue || kell > huue.kuni) mull('🚪 Oled kapis. Beebi ei näe sind!', W / 2, VAATE_K - 80);
}

function joonistaSees() {
  const s = tuba;
  const pool = VAATE_K / 2;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W, VAATE_K);
  ctx.clip();
  ctx.fillStyle = '#7a5232';
  ctx.fillRect(0, 0, W, VAATE_K);
  if (s.raputus > 0) {
    const m = s.raputus * 25; // the screen shakes when the baby jumps out
    ctx.translate((Math.random() - 0.5) * m, (Math.random() - 0.5) * m);
  }
  let gr = ctx.createLinearGradient(0, 0, 0, pool);
  gr.addColorStop(0, '#4a3e36');
  gr.addColorStop(1, '#9a8566');
  ctx.fillStyle = gr;
  ctx.fillRect(-10, -10, W + 20, pool + 10);
  gr = ctx.createLinearGradient(0, pool, 0, VAATE_K);
  gr.addColorStop(0, '#3e2818');
  gr.addColorStop(1, '#a87a4a');
  ctx.fillStyle = gr;
  ctx.fillRect(-10, pool, W + 20, pool + 10);

  const dirX = Math.cos(s.nurk);
  const dirY = Math.sin(s.nurk);
  const plX = -dirY * TASAND;
  const plY = dirX * TASAND;
  const lai = W / KIIRI;
  ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < KIIRI; i++) {
    const kx = (2 * (i + 0.5)) / KIIRI - 1;
    const rx = dirX + plX * kx;
    const ry = dirY + plY * kx;
    let mx = Math.floor(s.x);
    let my = Math.floor(s.y);
    const ddx = Math.abs(1 / rx);
    const ddy = Math.abs(1 / ry);
    const stepX = rx < 0 ? -1 : 1;
    const stepY = ry < 0 ? -1 : 1;
    let sdx = rx < 0 ? (s.x - mx) * ddx : (mx + 1 - s.x) * ddx;
    let sdy = ry < 0 ? (s.y - my) * ddy : (my + 1 - s.y) * ddy;
    let kylg = 0;
    let tyyp = '1';
    for (let n = 0; n < 64; n++) {
      if (sdx < sdy) {
        sdx += ddx;
        mx += stepX;
        kylg = 0;
      } else {
        sdy += ddy;
        my += stepY;
        kylg = 1;
      }
      tyyp = ruut(mx + 0.5, my + 0.5);
      if (onSein(tyyp)) break;
    }
    const kaugus = Math.max(0.05, kylg === 0 ? sdx - ddx : sdy - ddy);
    zPuhver[i] = kaugus;
    let seinX = kylg === 0 ? s.y + kaugus * ry : s.x + kaugus * rx;
    seinX -= Math.floor(seinX);
    let texX = Math.min(63, Math.floor(seinX * 64));
    if ((kylg === 0 && rx < 0) || (kylg === 1 && ry > 0)) texX = 63 - texX;
    const korgus = SKAALA / kaugus;
    const y0 = pool - korgus * (1 - s.silm);
    ctx.drawImage(seinaTekstuur(tyyp), texX, 0, 1, 64, i * lai, y0, lai + 0.5, korgus);
    const tume = Math.min(0.88, kaugus / 6 + (kylg ? 0.15 : 0));
    ctx.fillStyle = `rgba(30, 15, 40, ${tume.toFixed(2)})`;
    ctx.fillRect(i * lai, y0, lai + 0.5, korgus);
  }

  // Everything standing in the room, the farthest first.
  const kaamera = { x: s.x, y: s.y, dirX, dirY, plX, plY, pool, lai, silm: s.silm };
  const minuVoodi = (a) => a.peidik && s.peidus && Math.floor(a.x) === Math.floor(s.x) && Math.floor(a.y) === Math.floor(s.y);
  const spraidid = s.asjad.filter((a) => !minuVoodi(a)).map((a) => (a.taht
    ? { ...a, z: a.z + Math.sin(kell * 3 + a.x) * 0.06, laius: a.laius * Math.max(0.15, Math.abs(Math.cos(kell * 2 + a.y))) }
    : a));
  renderVanaisaPilt(s.vOlek === 'peidus' ? 'puhkab' : 'jaht');
  spraidid.push({ x: s.vx, y: s.vy, pilt: vPilt, laius: V_LAI / V_KORGUS, korgus: 1, z: s.vz });
  const kaugusRuut = (a) => (a.x - s.x) ** 2 + (a.y - s.y) ** 2;
  spraidid.sort((a, b) => kaugusRuut(b) - kaugusRuut(a));
  for (const a of spraidid) joonistaSprait(kaamera, a);
  ctx.imageSmoothingEnabled = true;
  // It is dark in the baby's house: only the middle of the view is lit, like with a torch.
  const vari = ctx.createRadialGradient(W / 2, pool, Math.min(W, VAATE_K) * 0.18, W / 2, pool, Math.max(W, VAATE_K) * 0.72);
  vari.addColorStop(0, 'rgba(12, 6, 22, 0)');
  vari.addColorStop(1, 'rgba(12, 6, 22, 0.78)');
  ctx.fillStyle = vari;
  ctx.fillRect(-10, -10, W + 20, VAATE_K + 20);
  if (s.kapis) joonistaKapiSees();
  else if (s.silm > 0.3) joonistaKaed(s);
  else joonistaVoodiAlune();
  ctx.restore();

  // days, tools, time and how loud you are
  ctx.font = 'bold 15px ui-rounded, system-ui, sans-serif';
  const tooriistad = TOORIISTAD.map((t, i) => (mang.tooriistad.has(i) ? t.mark : '❔')).join(' ');
  const hud = `🌙 ${mang.paev}/${PAEVI}   ${tooriistad}   ⏱ ${Math.floor(mang.aeg)} s`;
  const hudLai = Math.max(180, ctx.measureText(hud).width + 28);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.strokeStyle = '#2b2340';
  ctx.lineWidth = 2;
  kast(8, 8, hudLai, 54, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#2b2340';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(hud, 18, 24);
  ctx.fillText('👂', 18, 47);
  ctx.fillStyle = '#e4dcef';
  ctx.fillRect(42, 42, 100, 10);
  ctx.fillStyle = s.myra > 0.7 ? '#e8506f' : '#f0a020';
  ctx.fillRect(42, 42, 100 * Math.min(1, s.myra), 10);
  ctx.fillStyle = '#2b2340';
  if (s.hiilib || klahvid.has('Shift')) ctx.fillText('🤫 hiilid', 150, 47);

  // small map in the corner
  const r = Math.max(5, Math.round(Math.min(W, H) / 90));
  const mx0 = W - 12 * r - 8;
  const my0 = 8;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.fillRect(mx0 - 2, my0 - 2, 12 * r + 4, 12 * r + 4);
  s.kaart.forEach((rida, y) => {
    [...rida].forEach((c, x) => {
      if (c === 'B' || c === 'K') {
        ctx.fillStyle = c === 'B' ? '#5aa0e8' : '#a0663a';
        ctx.fillRect(mx0 + x * r, my0 + y * r, r, r);
      } else if (s.kriuksud.has(y * 100 + x)) {
        ctx.fillStyle = 'rgba(160, 100, 50, 0.45)'; // a creaky floorboard
        ctx.fillRect(mx0 + x * r, my0 + y * r, r, r);
      }
      if (!onSein(c)) return;
      const lahti = mang.tooriistad.size >= TOORIISTAD.length;
      ctx.fillStyle = c === '9' ? (lahti ? '#2fa84f' : '#e8506f') : '#2b2340';
      ctx.fillRect(mx0 + x * r, my0 + y * r, r, r);
    });
  });
  ctx.fillStyle = '#ffb800';
  for (const a of s.asjad) {
    if (!a.taht) continue;
    ovaal(mx0 + a.x * r, my0 + a.y * r, 1.6, 1.6);
    ctx.fill();
  }
  ctx.fillStyle = '#f08a24';
  ovaal(mx0 + s.x * r, my0 + s.y * r, 2.5, 2.5);
  ctx.fill();
  ctx.strokeStyle = '#f08a24';
  ctx.lineWidth = 1.5;
  joon(mx0 + s.x * r, my0 + s.y * r, mx0 + (s.x + Math.cos(s.nurk)) * r, my0 + (s.y + Math.sin(s.nurk)) * r);
  if (s.vOlek === 'jaht') {
    ctx.fillStyle = '#e8506f';
    ovaal(mx0 + s.vx * r, my0 + s.vy * r, 2.5, 2.5);
    ctx.fill();
  }

  // touch buttons, only on touch screens
  if (VAATE_K < H) {
    ctx.fillStyle = '#ffe0ec';
    ctx.fillRect(0, VAATE_K, W, H - VAATE_K);
    ctx.strokeStyle = '#2b2340';
    ctx.lineWidth = 3;
    joon(0, VAATE_K, W, VAATE_K);
    const all = new Set(vajutused.values());
    NUPUD.forEach((n, i) => {
      const k = nupuKast(i);
      ctx.fillStyle = all.has(n.id) || (n.id === 'hiili' && tuba.hiilib) ? '#ffc933' : '#8c6cf2';
      kast(k.x, VAATE_K + 12, k.w, H - VAATE_K - 24, 18);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 34px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.mark, k.x + k.w / 2, VAATE_K + (H - VAATE_K) / 2);
    });
  }

  if (!PUUTE && mang.kaib && document.pointerLockElement !== louend) {
    mull('🖱️ Klõpsa pildil ja vaata hiirega ringi', W / 2, VAATE_K - 30);
  }

  if (huue && kell < huue.kuni) {
    mull(huue.tekst, W / 2, 110);
  }
}

let eelmine = performance.now();
function kaader(nyyd) {
  const dt = Math.min(0.05, Math.max(0, (nyyd - eelmine) / 1000));
  eelmine = nyyd;
  kell += dt;
  if (mang.kaib) {
    if (mang.sees) uuendaSees(dt);
    else uuenda(dt);
    if (mang.kaib) {
      heli.planeeri();
      aegEl.textContent = Math.floor(mang.aeg);
    }
  } else if (vanaisa.olek === 'demo') {
    vanaisa.z = 0;
  }
  joonista();
  requestAnimationFrame(kaader);
}

naitaTabel();
requestAnimationFrame(kaader);
