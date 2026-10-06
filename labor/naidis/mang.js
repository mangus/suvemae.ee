// Demo of the lab server: realtime dots in a shared room and a high score table.
import { lab } from '../lab.js';

const naidis = lab();
const valjak = document.getElementById('valjak');
const olek = document.getElementById('olek');
const tapid = new Map();

function tapp(id) {
  let el = tapid.get(id);
  if (!el) {
    el = document.createElement('div');
    el.className = 'tapp';
    el.style.background = `hsl(${parseInt(id, 16) % 360} 80% 60%)`;
    valjak.append(el);
    tapid.set(id, el);
  }
  return el;
}

function liiguta(el, x, y) {
  el.style.left = `${x * 100}%`;
  el.style.top = `${y * 100}%`;
}

const mina = document.createElement('div');
mina.className = 'tapp mina';
valjak.append(mina);

const tuba = naidis.join();

function naitaOlekut() {
  olek.textContent = tuba.connected ? `Lehel on peale sinu veel ${tuba.peers.size}.` : 'Ühendan…';
}

tuba.on('open', naitaOlekut);
tuba.on('join', naitaOlekut);
tuba.on('close', naitaOlekut);
tuba.on('leave', (id) => {
  tapid.get(id)?.remove();
  tapid.delete(id);
  naitaOlekut();
});
tuba.on('message', (andmed, kellelt) => {
  if (typeof andmed?.x === 'number' && typeof andmed?.y === 'number') liiguta(tapp(kellelt), andmed.x, andmed.y);
});

let viimatiSaadetud = 0;
valjak.addEventListener('pointermove', (e) => {
  const r = valjak.getBoundingClientRect();
  const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
  const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
  liiguta(mina, x, y);
  const nyyd = performance.now();
  if (nyyd - viimatiSaadetud > 50) {
    viimatiSaadetud = nyyd;
    tuba.send({ x, y });
  }
});

const nupp = document.getElementById('nupp');
const nimi = document.getElementById('nimi');
const tulemus = document.getElementById('tulemus');
const tabel = document.getElementById('tabel');
let klikke = 0;
let kaib = false;

nupp.addEventListener('click', () => {
  if (!kaib) {
    kaib = true;
    klikke = 0;
    tulemus.textContent = '';
    nupp.textContent = 'Vajuta!';
    setTimeout(lopeta, 5000);
    return;
  }
  klikke += 1;
  nupp.textContent = `Vajuta! ${klikke}`;
});

async function lopeta() {
  kaib = false;
  nupp.disabled = true;
  nupp.textContent = 'Alusta';
  tulemus.textContent = `Said ${klikke} klikki!`;
  const kes = nimi.value.trim();
  if (kes && klikke > 0) {
    try {
      await naidis.addScore(kes, klikke);
    } catch (err) {
      tulemus.textContent += ' (Edetabelisse salvestamine ei õnnestunud.)';
      console.warn(err);
    }
  } else if (!kes) {
    tulemus.textContent += ' Kirjuta hüüdnimi, et pääseda edetabelisse.';
  }
  await naitaTabelit();
  setTimeout(() => {
    nupp.disabled = false;
  }, 1000);
}

async function naitaTabelit() {
  try {
    const parimad = await naidis.topScores(10);
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

naitaTabelit();
