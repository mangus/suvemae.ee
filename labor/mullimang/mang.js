// Bubble popping game: a 15-second round, live pops from others via a realtime room,
// a shared all-time pop counter (save/load) and a high score table.
import { lab } from '../lab.js';

const mang = lab();
const valjak = document.getElementById('valjak');
const olek = document.getElementById('olek');
const kokkuEl = document.getElementById('kokku');
const nupp = document.getElementById('nupp');
const nimi = document.getElementById('nimi');
const tulemus = document.getElementById('tulemus');
const tabel = document.getElementById('tabel');

const VOORU_PIKKUS = 15000;
const VARVID = ['#ff7eb6', '#7ed6ff', '#ffd23f', '#9cf27e', '#c39bff', '#ff9f5a'];

let kaib = false;
let punktid = 0;
let tekitaja = null;

// Realtime room: everyone on the page sees each other's pops.
const tuba = mang.join('mullid');

function naitaOlekut() {
  if (!tuba.connected) {
    olek.textContent = 'Ühendan…';
  } else if (tuba.peers.size === 0) {
    olek.textContent = 'Praegu oled siin üksi.';
  } else {
    olek.textContent = `Peale sinu on siin veel ${tuba.peers.size}.`;
  }
}

tuba.on('open', naitaOlekut);
tuba.on('join', naitaOlekut);
tuba.on('leave', naitaOlekut);
tuba.on('close', naitaOlekut);
tuba.on('message', (andmed) => {
  if (typeof andmed?.x === 'number' && typeof andmed?.y === 'number') {
    sadeh(Math.min(1, Math.max(0, andmed.x)), Math.min(1, Math.max(0, andmed.y)), '⭐');
  }
});

function sadeh(x, y, mark) {
  const el = document.createElement('div');
  el.className = 'pauk';
  el.textContent = mark;
  el.style.left = `${x * 100}%`;
  el.style.top = `${y * 100}%`;
  valjak.append(el);
  setTimeout(() => el.remove(), 700);
}

function uusMull() {
  const mull = document.createElement('button');
  mull.type = 'button';
  mull.className = 'mull';
  mull.setAttribute('aria-label', 'Mull');
  const x = 0.08 + Math.random() * 0.84;
  const y = 0.1 + Math.random() * 0.8;
  mull.style.left = `${x * 100}%`;
  mull.style.top = `${y * 100}%`;
  mull.style.background = VARVID[Math.floor(Math.random() * VARVID.length)];
  mull.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (!kaib) return;
    punktid += 1;
    nupp.textContent = `${punktid} 🫧`;
    mull.remove();
    sadeh(x, y, '💥');
    tuba.send({ x, y });
  });
  valjak.append(mull);
  setTimeout(() => mull.remove(), 1600);
}

nupp.addEventListener('click', () => {
  if (kaib) return;
  kaib = true;
  punktid = 0;
  tulemus.textContent = '';
  nupp.disabled = true;
  nupp.textContent = '0 🫧';
  uusMull();
  tekitaja = setInterval(uusMull, 450);
  setTimeout(lopeta, VOORU_PIKKUS);
});

async function lopeta() {
  kaib = false;
  clearInterval(tekitaja);
  valjak.querySelectorAll('.mull').forEach((m) => m.remove());
  tulemus.textContent = `Said ${punktid} mulli!`;

  const kes = nimi.value.trim();
  try {
    if (kes && punktid > 0) await mang.addScore(kes, punktid);
    else if (!kes) tulemus.textContent += ' Kirjuta hüüdnimi, et pääseda edetabelisse.';
    if (punktid > 0) {
      const kokku = await mang.load('kokku', 0);
      const uus = (Number(kokku) || 0) + punktid;
      await mang.save('kokku', uus);
      kokkuEl.textContent = uus;
    }
  } catch (err) {
    tulemus.textContent += ' (Salvestamine ei õnnestunud.)';
    console.warn(err);
  }

  await naitaTabelit();
  setTimeout(() => {
    nupp.disabled = false;
    nupp.textContent = 'Uuesti';
  }, 1000);
}

async function naitaTabelit() {
  try {
    const parimad = await mang.topScores(10);
    if (parimad.length === 0) {
      tabel.textContent = 'Edetabel on veel tühi. Ole esimene!';
      return;
    }
    tabel.replaceChildren(
      ...parimad.map((t) => {
        const li = document.createElement('li');
        li.textContent = `${t.name}: ${t.score}`;
        return li;
      }),
    );
  } catch (err) {
    tabel.textContent = 'Edetabelit ei saanud laadida.';
    console.warn(err);
  }
}

async function naitaKokku() {
  try {
    kokkuEl.textContent = Number(await mang.load('kokku', 0)) || 0;
  } catch (err) {
    kokkuEl.textContent = '?';
    console.warn(err);
  }
}

naitaKokku();
naitaTabelit();
