// Vanaisa Puupakk: run away from a singing, dancing grandpa in a log costume
// who jumps out from behind the corners of the houses.
import { lab } from '../lab.js';

const W = 400;
const H = 560;
const SAMM = 60 / 128 / 2; // one eighth note at 128 bpm, in seconds

const louend = document.getElementById('louend');
const ctx = louend.getContext('2d');
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
louend.width = W * dpr;
louend.height = H * dpr;
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

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
let mang = { kaib: false, aeg: 0 };
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
  vajutab = true;
  siht = punkt(e);
  louend.setPointerCapture(e.pointerId);
});
louend.addEventListener('pointermove', (e) => {
  if (vajutab) siht = punkt(e);
});
louend.addEventListener('pointerup', () => {
  vajutab = false;
});
louend.addEventListener('pointercancel', () => {
  vajutab = false;
});

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
  mang = { kaib: true, aeg: 0 };
  huue = null;
  heli.vaikus();
  kate.hidden = true;
  vorm.hidden = true;
}

function lopp() {
  mang.kaib = false;
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

let eelmine = performance.now();
function kaader(nyyd) {
  const dt = Math.min(0.05, Math.max(0, (nyyd - eelmine) / 1000));
  eelmine = nyyd;
  kell += dt;
  if (mang.kaib) {
    uuenda(dt);
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
