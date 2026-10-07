// Vanaisa Puupakk: run away from a singing, dancing grandpa in a log costume
// who jumps out from behind the corners of the houses.
import { lab } from '../lab.js';

// The yard is 400 × 560; inside a house the 3D view fills the whole screen.
let W = 400;
let H = 560;
const SAMM = 60 / 128 / 2; // one eighth note at 128 bpm, in seconds

const louend = document.getElementById('louend');
let ctx = louend.getContext('2d'); // swapped briefly when grandpa is drawn for the 3D view
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

let parim = Number(loe('vanaisa-puupakk-parim')) || 0;
parimEl.textContent = parim;
nimiEl.value = loe('vanaisa-puupakk-nimi') || '';

// Our own song. Notes are [step, midi note, length in steps]; one line is 16 eighth notes.
const LAUL = [
  { tekst: 'Tung-tung-tung, taat tuleb!', noodid: [[0, 67, 1], [2, 67, 1], [4, 67, 1], [8, 64, 2], [10, 62, 2], [12, 60, 4]] },
  { tekst: 'Tung-tung-tung, kõik üles!', noodid: [[0, 69, 1], [2, 69, 1], [4, 69, 1], [8, 67, 2], [10, 64, 2], [12, 67, 4]] },
  { tekst: 'Puupakk tantsib, hopsti-hops!', noodid: [[0, 72, 2], [2, 72, 2], [4, 69, 2], [6, 67, 2], [8, 64, 1], [10, 67, 1], [12, 72, 4]] },
  { tekst: 'Jookse, jookse, ma tulen ka!', noodid: [[0, 67, 2], [2, 64, 2], [4, 67, 2], [6, 64, 2], [8, 62, 2], [10, 64, 2], [12, 62, 2], [14, 60, 2]] },
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
          if (samm === s) this.laul(t, noot - 12, pikk * SAMM);
        }
      }
    } else if (s === 0 || s === 8) {
      this.trumm(t, 0.35); // a quiet heartbeat while grandpa hides
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
    if (!this.sees || !('speechSynthesis' in window)) return;
    if (kohe) speechSynthesis.cancel();
    else if (speechSynthesis.speaking) return;
    const u = new SpeechSynthesisUtterance(tekst.replace(/-/g, ' '));
    u.lang = 'et-EE';
    const haal = speechSynthesis.getVoices().find((v) => v.lang && v.lang.toLowerCase().startsWith('et'));
    if (haal) u.voice = haal;
    u.pitch = 0.4;
    u.rate = 1.15;
    speechSynthesis.speak(u);
  },

  vaikus() {
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
  if (!SUUNAD[k]) return;
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
    vajutused.set(e.pointerId, nuppPunktis(punkt(e)) || 'vaade');
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
  huua('TUNG-TUNG-TUNG!!', 1.1);
  heli.laulab = true;
  heli.kone('Tung tung tung!', true);
}

function puhkama() {
  const valik = peidukohad.filter((p) => Math.hypot(p.x - mangija.x, p.y - mangija.y) > 200);
  const koht = valik[Math.floor(Math.random() * valik.length)] || peidukohad[0];
  vanaisa.olek = 'puhkab';
  heli.laulab = false;
  huua('Uhh… puhkan natuke!', 1.4);
  alustaHupe(1.1, 90, koht);
}

function uuenda(dt) {
  mang.aeg += dt;
  const k = Math.min(1, mang.aeg / 90); // it gets harder over 90 seconds

  // Player: keys first, otherwise run towards the touched point.
  let dx = 0;
  let dy = 0;
  for (const kl of klahvid) {
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

  // Walking up into a door takes you inside the house.
  if (dy < 0) {
    for (const m of majad) {
      const ux = m.x + m.w / 2;
      if (Math.abs(mangija.x - ux) < 13 && mangija.y > m.y + m.h && mangija.y < m.y + m.h + 12) {
        sisene(m);
        return;
      }
    }
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
      liiguta(g, ux * kiirus * dt, uy * kiirus * dt, 16);
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

  if (g.olek === 'jaht' && g.z < 12 && Math.hypot(mangija.x - g.x, mangija.y - g.y) < 24) lopp();
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
  mang = { kaib: true, aeg: 0, sees: false };
  vajutused.clear();
  korjatud.clear();
  huue = null;
  heli.vaikus();
  kate.hidden = true;
  vorm.hidden = true;
}

function lopp() {
  mang.kaib = false;
  if (mang.sees) taisVaade(false); // the end screen and high scores show in the normal page again
  heli.vaikus();
  heli.bonk();
  heli.kone('Sain kätte!', true);
  const sek = Math.floor(mang.aeg);
  const rekord = sek > parim;
  if (rekord) {
    parim = sek;
    kirjuta('vanaisa-puupakk-parim', String(parim));
    parimEl.textContent = parim;
  }
  viimane = sek;
  aegEl.textContent = sek;
  kateTekst.textContent = `Vanaisa Puupakk sai su kätte! Pidasid vastu ${sek} sekundit.` + (rekord ? ' Uus rekord! 🎉' : '');
  alustaNupp.textContent = 'Proovi uuesti ▶';
  kate.hidden = false;
  vorm.hidden = sek < 1;
  huua('Sain kätte! Tung!', 3);
}

vorm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nimi = nimiEl.value.trim().slice(0, 16);
  if (!nimi || !viimane) return;
  vorm.hidden = true;
  kirjuta('vanaisa-puupakk-nimi', nimi);
  try {
    await minu.addScore(nimi, viimane);
    await naitaTabel();
  } catch (err) {
    const li = document.createElement('li');
    li.textContent = 'Ei saanud salvestada: ' + err.message;
    tabelEl.prepend(li);
  }
});

async function naitaTabel() {
  try {
    const parimad = await minu.topScores(10);
    tabelEl.replaceChildren(
      ...parimad.map((r) => {
        const li = document.createElement('li');
        li.textContent = `${r.name} – ${r.score} s`;
        return li;
      }),
    );
    if (!parimad.length) tabelEl.innerHTML = '<li>Keegi pole veel mänginud. Ole esimene!</li>';
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

// One arm in a red shirt sleeve; pool is -1 (left) or 1 (right).
function joonistaKasi(pool, nurk, kurikas) {
  ctx.save();
  ctx.translate(pool * 21, -46);
  ctx.rotate(-pool * (1.2 + nurk * 0.9));
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#c0392b';
  ctx.lineWidth = 7;
  joon(0, 0, 0, 16);
  if (kurikas) {
    // the wooden club he knocks the beat with
    ctx.save();
    ctx.translate(0, 19);
    ctx.rotate(pool * 0.8);
    ctx.fillStyle = '#d9a86c';
    ctx.strokeStyle = '#7a5230';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-2, -2);
    ctx.lineTo(-4, 24);
    ctx.quadraticCurveTo(0, 28, 4, 24);
    ctx.lineTo(2, -2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = '#e7b893';
  ovaal(0, 19, 4, 4);
  ctx.fill();
  ctx.restore();
}

// The old man's face inside the log, drawn as real-looking as we can.
function nagu(laulab) {
  const nahk = ctx.createRadialGradient(-4, -54, 2, 0, -47, 17);
  nahk.addColorStop(0, '#f6d9bd');
  nahk.addColorStop(0.7, '#e2b08a');
  nahk.addColorStop(1, '#c68a66');
  ctx.fillStyle = nahk;
  ovaal(0, -48, 13.5, 17);
  ctx.fill();

  ctx.lineCap = 'round';
  ctx.strokeStyle = '#dcdcdc';
  ctx.lineWidth = 1.2;
  for (const hx of [-9, -6, 6, 9]) joon(hx, -60, hx + Math.sign(hx) * 2, -63);

  // forehead wrinkles
  ctx.strokeStyle = 'rgba(130, 75, 45, 0.55)';
  ctx.lineWidth = 0.8;
  for (const wy of [-60, -57.5]) {
    ctx.beginPath();
    ctx.moveTo(-8, wy);
    ctx.quadraticCurveTo(0, wy - 1.5, 8, wy);
    ctx.stroke();
  }

  // bushy white eyebrows
  ctx.strokeStyle = '#f2f2f2';
  ctx.lineWidth = 2.6;
  joon(-10, -53, -3, -54.5);
  joon(3, -54.5, 10, -53);

  // eyes, blinking now and then
  ctx.fillStyle = '#2e2116';
  ctx.strokeStyle = '#2e2116';
  ctx.lineWidth = 1;
  if (kell % 3.2 < 0.12) {
    joon(-7.5, -49.5, -3.5, -49.5);
    joon(3.5, -49.5, 7.5, -49.5);
  } else {
    ovaal(-5.5, -49.5, 1.4, 1.4);
    ctx.fill();
    ovaal(5.5, -49.5, 1.4, 1.4);
    ctx.fill();
  }

  // eye bags and crow's feet
  ctx.strokeStyle = 'rgba(130, 75, 45, 0.5)';
  ctx.lineWidth = 0.7;
  for (const p of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(p * 5.5, -48.5, 3.5, 0.3, Math.PI - 0.3);
    ctx.stroke();
    joon(p * 10.5, -50.5, p * 12.5, -51.5);
    joon(p * 10.5, -49, p * 12.5, -48.5);
  }

  // glasses
  ctx.strokeStyle = '#3a3a3a';
  ctx.lineWidth = 1.1;
  ovaal(-5.5, -49.5, 4.6, 4.2);
  ctx.stroke();
  ovaal(5.5, -49.5, 4.6, 4.2);
  ctx.stroke();
  joon(-1, -50, 1, -50);

  // nose
  ctx.fillStyle = '#cf9470';
  ctx.beginPath();
  ctx.moveTo(-1, -48);
  ctx.quadraticCurveTo(-4, -41, -2.5, -40);
  ctx.quadraticCurveTo(0, -38.8, 2.5, -40);
  ctx.quadraticCurveTo(4, -41, 1, -48);
  ctx.fill();

  // rosy cheeks
  ctx.fillStyle = 'rgba(225, 110, 100, 0.35)';
  ovaal(-8.5, -42.5, 3.5, 2.5);
  ctx.fill();
  ovaal(8.5, -42.5, 3.5, 2.5);
  ctx.fill();

  // grey beard
  ctx.fillStyle = '#ececec';
  ctx.strokeStyle = '#b9b9b9';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-13, -44);
  ctx.quadraticCurveTo(-14, -30, -8, -26);
  ctx.quadraticCurveTo(-4, -21, 0, -24);
  ctx.quadraticCurveTo(4, -21, 8, -26);
  ctx.quadraticCurveTo(14, -30, 13, -44);
  ctx.quadraticCurveTo(7, -36, 0, -37);
  ctx.quadraticCurveTo(-7, -36, -13, -44);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  for (const bx of [-8, -4, 4, 8]) joon(bx, -31, bx * 0.8, -27);

  // singing mouth
  const lahti = laulab ? 1 + Math.abs(Math.sin(kell * 9)) * 3 : 0.8;
  ctx.fillStyle = '#5b1f1f';
  ovaal(0, -34, 3.5, lahti);
  ctx.fill();

  // moustache
  ctx.fillStyle = '#f7f7f7';
  for (const p of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(0, -39);
    ctx.quadraticCurveTo(p * 5, -40.5, p * 9, -36);
    ctx.quadraticCurveTo(p * 5, -37, 0, -37);
    ctx.fill();
    ctx.stroke();
  }
}

function joonistaVanaisa() {
  const g = vanaisa;
  const tantsib = g.olek === 'jaht' || g.olek === 'demo';
  const peidus = g.olek === 'peidus';
  const lainetus = tantsib ? Math.sin(kell * 13) : Math.sin(kell * 3) * 0.3;

  ctx.fillStyle = 'rgba(43, 35, 64, 0.2)';
  ovaal(g.x, g.y, Math.max(8, 22 - g.z * 0.12), 6);
  ctx.fill();

  ctx.save();
  ctx.translate(g.x, g.y - g.z + (peidus ? 14 : 0));
  ctx.scale(1.2, 1.2);
  ctx.rotate(lainetus * 0.09);

  // legs and shoes
  const samm = tantsib ? Math.sin(kell * 13) : 0;
  ctx.lineCap = 'round';
  for (const [lx, s] of [[-8, samm], [8, -samm]]) {
    const jx = lx + s * 5;
    const jy = -4 - Math.max(0, s) * 4;
    ctx.strokeStyle = '#4a3b6b';
    ctx.lineWidth = 6;
    joon(lx, -18, jx, jy);
    ctx.fillStyle = '#3a2a1a';
    ovaal(jx + (lx < 0 ? -2 : 2), jy + 2, 6, 3.5);
    ctx.fill();
  }

  const kasi = tantsib ? Math.sin(kell * 13 + 1) : -0.8;
  joonistaKasi(-1, kasi, false);

  // the log costume
  const puu = ctx.createLinearGradient(-24, 0, 24, 0);
  puu.addColorStop(0, '#5a381c');
  puu.addColorStop(0.3, '#9a6a3c');
  puu.addColorStop(0.65, '#8a5a30');
  puu.addColorStop(1, '#4e3018');
  ctx.fillStyle = puu;
  ctx.strokeStyle = '#3b2412';
  ctx.lineWidth = 2.5;
  kast(-24, -74, 48, 58, 10);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'rgba(50, 28, 12, 0.55)';
  ctx.lineWidth = 1.4;
  for (const bx of [-18, -10, 10, 18]) {
    ctx.beginPath();
    ctx.moveTo(bx, -70);
    ctx.quadraticCurveTo(bx + 3, -45, bx - 1, -20);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.ellipse(13, -24, 4, 3, 0.3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#e9c79b';
  ovaal(0, -74, 24, 7);
  ctx.fill();
  ctx.strokeStyle = '#3b2412';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(140, 90, 45, 0.7)';
  ctx.lineWidth = 1;
  for (const r of [16, 10, 4]) {
    ovaal(0, -74, r, r * 0.29);
    ctx.stroke();
  }
  ctx.fillStyle = '#2b1a0c';
  ovaal(0, -48, 16, 19);
  ctx.fill();
  nagu(tantsib);

  joonistaKasi(1, tantsib ? Math.sin(kell * 13 + 2.5) : -0.8, true);
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
  ctx.fillStyle = '#dff5c8';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#f6e7c1';
  ctx.fillRect(165, 0, 70, H);
  ctx.fillRect(0, 178, W, 40);
  ctx.fillRect(0, 352, W, 40);
  for (const l of lilled) {
    ctx.fillStyle = l.v;
    ovaal(l.x, l.y, 3, 3);
    ctx.fill();
  }

  const asjad = [
    ...majad.map((m) => ({ y: m.y + m.h, joonista: () => joonistaMaja(m) })),
    { y: mangija.y, joonista: joonistaMangija },
    { y: vanaisa.y + (vanaisa.z > 15 ? 1000 : 0), joonista: joonistaVanaisa }, // high in the air he is in front of everything
  ];
  asjad.sort((a, b) => a.y - b.y).forEach((a) => a.joonista());

  const my = vanaisa.y - vanaisa.z - 96;
  if (huue && kell < huue.kuni) {
    mull(huue.tekst, vanaisa.x, my);
  } else if (vanaisa.olek === 'jaht' || vanaisa.olek === 'demo') {
    const r = lauluRida();
    if (r >= 0) mull('♪ ' + LAUL[r].tekst, vanaisa.x, my);
  }
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
// 5 bookshelf, 6 window, 9 the way out. Floor: . empty, * star, P plant, L lamp,
// V where grandpa hides around a corner.
const KAARDID = [
  [
    '111146111111',
    '1*...1....*1',
    '1....5..3..1',
    '1..P.......1',
    '1....1...L.1',
    '111.1141.111',
    '1V....1....1',
    '1.....1..*.1',
    '1..2.......1',
    '1.P...1....1',
    '1.....1...L1',
    '111119111111',
  ],
  [
    '111611161111',
    '1...1......1',
    '1.*.5..33..1',
    '1...5..33.*1',
    '1..........1',
    '11.1111.1111',
    '1V....1....1',
    '1.....1..P.1',
    '1.22.......1',
    '1.....1....1',
    '1L....1...*1',
    '111119111111',
  ],
  [
    '111111461111',
    '1..*1.....*1',
    '1...1.....L1',
    '1...11.11111',
    '1..........1',
    '1.P..2.....1',
    '1....2..V..1',
    '11.111111.11',
    '1......5...1',
    '1.*....5...1',
    '1......5..P1',
    '119111111111',
  ],
  [
    '111111111111',
    '1*.......*.1',
    '1.11.55.11.1',
    '1.1......1.1',
    '1.1..P...1.1',
    '1....33....1',
    '1.1..33..1.1',
    '1.1......1V1',
    '1.11....11.1',
    '1..........1',
    '1L...*....L1',
    '111111911111',
  ],
  [
    '111161161111',
    '1....1....*1',
    '1.*..5.....1',
    '1....5..P..1',
    '1L...1.....1',
    '11.111111.11',
    '1......1V..1',
    '1..3...1...1',
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

const tuba = {
  maja: null, kaart: null, x: 0, y: 0, nurk: 0, kondib: false, asjad: [], kokku: 0,
  vx: 0, vy: 0, vz: 0, vOlek: 'peidus', vHupe: 0, ootab: 0, hoiatatud: false, raputus: 0,
};
const korjatud = new Set(); // stars picked up in this game, as 'house:x,y'
const BOONUS = 3; // seconds a star adds to your time
const HUPE_AEG = 0.7; // how long grandpa's jump out of hiding lasts
let zPuhver = new Float32Array(KIIRI);
const NUPUD = [
  { id: 'vasak', mark: '◀' },
  { id: 'edasi', mark: '▲' },
  { id: 'tagasi', mark: '▼' },
  { id: 'parem', mark: '▶' },
];
function nupuKast(i) {
  const w = (W - 20) / 4;
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

function sisene(m) {
  const k = Math.min(1, mang.aeg / 90);
  const nr = majad.indexOf(m);
  const s = tuba;
  s.maja = m;
  s.kaart = KAARDID[nr % KAARDID.length];
  s.asjad = [];
  s.kokku = 0;
  s.kaart.forEach((rida, y) => {
    [...rida].forEach((c, x) => {
      const voti = `${nr}:${x},${y}`;
      if (c === '9') {
        s.x = x + 0.5;
        s.y = y - 0.5;
      } else if (c === 'V') {
        s.vx = x + 0.5;
        s.vy = y + 0.5;
      } else if (c === 'P') {
        s.asjad.push({ x: x + 0.5, y: y + 0.5, pilt: TAIM, laius: 0.7, korgus: 0.7, z: 0, blokk: true });
      } else if (c === 'L') {
        s.asjad.push({ x: x + 0.5, y: y + 0.5, pilt: LAMP, laius: 0.45, korgus: 0.9, z: 0, blokk: true });
      } else if (c === '*') {
        s.kokku++;
        if (!korjatud.has(voti)) s.asjad.push({ x: x + 0.5, y: y + 0.5, pilt: TAHT, laius: 0.35, korgus: 0.35, z: 0.22, taht: voti });
      }
    });
  });
  s.nurk = -Math.PI / 2;
  s.kondib = false;
  s.vz = 0;
  s.vOlek = 'peidus';
  s.vHupe = 0;
  s.ootab = 7 - 3 * k;
  s.hoiatatud = false;
  s.raputus = 0;
  mang.sees = true;
  taisVaade(true);
  siht = null;
  vajutab = false;
  vajutused.clear();
  heli.laulab = false;
  huua('Korja tähti ⭐ ja leia roheline VÄLJA-uks!', 2.8);
}

function lahku() {
  const m = tuba.maja;
  mang.sees = false;
  taisVaade(false);
  vajutused.clear();
  siht = null;
  mangija.x = m.x + m.w / 2;
  mangija.y = m.y + m.h + 22;
  const valik = peidukohad.filter((p) => Math.hypot(p.x - mangija.x, p.y - mangija.y) > 200);
  const koht = valik[Math.floor(Math.random() * valik.length)] || peidukohad[0];
  Object.assign(vanaisa, { x: koht.x, y: koht.y, z: 0, olek: 'peidus', aeg: 0, hupe: null, hupeAeg: 0, kinni: 0 });
  heli.laulab = false;
  huue = null;
}

// Distances from the player to every floor square, so grandpa can find his way around walls.
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
  tuba.raputus = 0.45;
  huua('TUNG-TUNG-TUNG!!', 1.4);
  heli.laulab = true;
  heli.boing();
  heli.kone('Tung tung tung!', true);
}

function uuendaSees(dt) {
  mang.aeg += dt;
  const k = Math.min(1, mang.aeg / 90);
  const s = tuba;
  s.raputus = Math.max(0, s.raputus - dt);
  const nupud = new Set(vajutused.values());
  let edasi = 0;
  let poore = 0;
  if (klahvid.has('ArrowUp') || klahvid.has('w') || nupud.has('edasi')) edasi += 1;
  if (klahvid.has('ArrowDown') || klahvid.has('s') || nupud.has('tagasi')) edasi -= 1;
  if (klahvid.has('ArrowLeft') || klahvid.has('a') || nupud.has('vasak')) poore -= 1;
  if (klahvid.has('ArrowRight') || klahvid.has('d') || nupud.has('parem')) poore += 1;
  s.nurk += poore * 2.4 * dt;
  s.kondib = edasi !== 0;
  const dx = Math.cos(s.nurk) * edasi * 2.6 * dt;
  const dy = Math.sin(s.nurk) * edasi * 2.6 * dt;
  const r = 0.22;
  if (ruut(s.x + dx + Math.sign(dx) * r, s.y + dy + Math.sign(dy) * r) === '9') {
    lahku();
    return;
  }
  const vaba = (x, y) => !s.asjad.some((a) => a.blokk && Math.hypot(a.x - x, a.y - y) < 0.5);
  if (!onSein(ruut(s.x + dx + Math.sign(dx) * r, s.y)) && vaba(s.x + dx, s.y)) s.x += dx;
  if (!onSein(ruut(s.x, s.y + dy + Math.sign(dy) * r)) && vaba(s.x, s.y + dy)) s.y += dy;

  // Stars add bonus seconds to your time.
  const leitud = s.asjad.filter((a) => a.taht && Math.hypot(a.x - s.x, a.y - s.y) < 0.5);
  if (leitud.length) {
    for (const a of leitud) korjatud.add(a.taht);
    s.asjad = s.asjad.filter((a) => !leitud.includes(a));
    mang.aeg += BOONUS * leitud.length;
    pling();
    if (s.asjad.some((a) => a.taht)) huua(`⭐ +${BOONUS} sekundit!`, 1.2);
    else huua('Kõik selle maja tähed käes! 🎉', 1.8);
  }

  const kaugus = Math.hypot(s.x - s.vx, s.y - s.vy);
  if (s.vOlek === 'peidus') {
    // Grandpa waits around a corner and jumps out when you come close.
    s.ootab -= dt;
    if (!s.hoiatatud && s.ootab < 1.6) {
      s.hoiatatud = true;
      huua('Tung… tung… keegi on siin!', 1.5);
      if (heli.ac) heli.koputus(heli.ac.currentTime, 0.7);
    }
    if (s.ootab <= 0 || kaugus < 1.4 || (kaugus < 3 && naeb(s.x, s.y, s.vx, s.vy))) hyppaValjaSees();
    return;
  }

  const kaugused = kaugusKaart(Math.floor(s.x), Math.floor(s.y));
  let siheX = s.x;
  let siheY = s.y;
  const gx = Math.floor(s.vx);
  const gy = Math.floor(s.vy);
  if (gx !== Math.floor(s.x) || gy !== Math.floor(s.y)) {
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
  s.vHupe = Math.max(0, s.vHupe - dt);
  const kiirus = (1.5 + 0.9 * k) * (s.vHupe > 0 ? 1.9 : 1);
  const ex = siheX - s.vx;
  const ey = siheY - s.vy;
  const e = Math.hypot(ex, ey);
  if (e > 0.01) {
    const samm = Math.min(e, kiirus * dt);
    s.vx += (ex / e) * samm;
    s.vy += (ey / e) * samm;
  }
  if (s.vHupe > 0) {
    s.vz = Math.sin(Math.PI * (1 - s.vHupe / HUPE_AEG)) * 0.45;
  } else {
    const f = kell % 1.8;
    s.vz = f < 0.45 ? Math.sin((Math.PI * f) / 0.45) * 0.25 : 0; // he hops while he sings
  }
  if (kaugus < 0.45 && s.vz < 0.2) lopp();
}

// Grandpa is drawn once per frame onto a small canvas and shown as a picture in 3D.
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
  const yla = pool + yks / 2 - a.z * yks - h;
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
    const m = s.raputus * 25; // the screen shakes when grandpa jumps out
    ctx.translate((Math.random() - 0.5) * m, (Math.random() - 0.5) * m);
  }
  let gr = ctx.createLinearGradient(0, 0, 0, pool);
  gr.addColorStop(0, '#fff8e8');
  gr.addColorStop(1, '#d9c39a');
  ctx.fillStyle = gr;
  ctx.fillRect(-10, -10, W + 20, pool + 10);
  gr = ctx.createLinearGradient(0, pool, 0, VAATE_K);
  gr.addColorStop(0, '#7a5232');
  gr.addColorStop(1, '#d9a873');
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
    const y0 = pool - korgus / 2;
    ctx.drawImage(seinaTekstuur(tyyp), texX, 0, 1, 64, i * lai, y0, lai + 0.5, korgus);
    const tume = Math.min(0.75, kaugus / 10 + (kylg ? 0.15 : 0));
    ctx.fillStyle = `rgba(30, 15, 40, ${tume.toFixed(2)})`;
    ctx.fillRect(i * lai, y0, lai + 0.5, korgus);
  }

  // Everything standing in the room, the farthest first.
  const kaamera = { x: s.x, y: s.y, dirX, dirY, plX, plY, pool, lai };
  const spraidid = s.asjad.map((a) => (a.taht
    ? { ...a, z: a.z + Math.sin(kell * 3 + a.x) * 0.06, laius: a.laius * Math.max(0.15, Math.abs(Math.cos(kell * 2 + a.y))) }
    : a));
  renderVanaisaPilt(s.vOlek === 'peidus' ? 'puhkab' : 'jaht');
  spraidid.push({ x: s.vx, y: s.vy, pilt: vPilt, laius: V_LAI / V_KORGUS, korgus: 1, z: s.vz });
  const kaugusRuut = (a) => (a.x - s.x) ** 2 + (a.y - s.y) ** 2;
  spraidid.sort((a, b) => kaugusRuut(b) - kaugusRuut(a));
  for (const a of spraidid) joonistaSprait(kaamera, a);
  ctx.imageSmoothingEnabled = true;
  joonistaKaed(s);
  ctx.restore();

  // stars and time
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.strokeStyle = '#2b2340';
  ctx.lineWidth = 2;
  kast(8, 8, 150, 30, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#2b2340';
  ctx.font = 'bold 15px ui-rounded, system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const siin = s.kokku - s.asjad.filter((a) => a.taht).length;
  ctx.fillText(`⭐ ${siin}/${s.kokku}   ⏱ ${Math.floor(mang.aeg)} s`, 18, 24);

  // small map in the corner
  const r = Math.max(5, Math.round(Math.min(W, H) / 90));
  const mx0 = W - 12 * r - 8;
  const my0 = 8;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.fillRect(mx0 - 2, my0 - 2, 12 * r + 4, 12 * r + 4);
  s.kaart.forEach((rida, y) => {
    [...rida].forEach((c, x) => {
      if (!onSein(c)) return;
      ctx.fillStyle = c === '9' ? '#2fa84f' : '#2b2340';
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
      ctx.fillStyle = all.has(n.id) ? '#ffc933' : '#8c6cf2';
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
  } else if (s.vOlek === 'jaht') {
    const rr = lauluRida();
    if (rr >= 0) mull('♪ ' + LAUL[rr].tekst, W / 2, 110);
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
    const f = kell % 2.5;
    vanaisa.z = f < 0.5 ? Math.sin((Math.PI * f) / 0.5) * 35 : 0;
  }
  joonista();
  requestAnimationFrame(kaader);
}

naitaTabel();
requestAnimationFrame(kaader);
