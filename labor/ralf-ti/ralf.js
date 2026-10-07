// Ralf TI: a friendly study helper. All lessons live in the ained/ folder, no outside requests.
// Navigation: subject -> grade -> topic -> learning mode (video, flashcards, textbook, exercises).

import { vasta } from './jutt.js';
import { alustaHarjutused } from './harjutused.js';
import * as minu from './edenemine.js';

// Subject files in ained/, in the order their buttons are shown.
const AINE_FAILID = [
  'eesti-keel', 'kirjandus', 'matemaatika', 'inglise-keel', 'loodusopetus',
  'bioloogia', 'geograafia', 'fuusika', 'keemia', 'inimeseopetus',
  'ajalugu', 'uhiskonnaopetus', 'kunst', 'muusika'
];

const $ = (id) => document.getElementById(id);
const ralf = $('ralf');
let ained = [];
let aine = null;
let klass = null;
let teema = null;
let raagibTaimer = 0;

// Ralf "talks": show the text and move his mouth for a moment.
function utle(tekst) {
  $('jutt').textContent = tekst;
  ralf.classList.add('raagib');
  clearTimeout(raagibTaimer);
  raagibTaimer = setTimeout(() => ralf.classList.remove('raagib'), 1200);
}

function nupp(tekst, kuhu, tegevus) {
  const n = document.createElement('button');
  n.type = 'button';
  n.textContent = tekst;
  n.addEventListener('click', tegevus);
  kuhu.append(n);
  return n;
}

function margi(kast, valitud) {
  [...kast.children].forEach((n) => n.classList.toggle('valitud', n === valitud));
}

const klassideJarjekord = (a) => Object.keys(a.klassid).sort((x, y) => x - y);

// A topic's button text, with a tick or a star once it has been studied.
function teemaSilt(a, k, t) {
  const m = minu.mark(minu.voti(a, k, t));
  return t.emoji + ' ' + t.nimi + (m ? ' ' + m : '');
}

// Load every subject; one broken file must not break the others.
async function laeAined() {
  const tulemused = await Promise.allSettled(
    AINE_FAILID.map((f) => import('./ained/' + f + '.js'))
  );
  ained = tulemused.filter((t) => t.status === 'fulfilled').map((t) => t.value.default);
  ained.forEach((a) => {
    a.nupp = nupp(a.emoji + ' ' + a.nimi, $('ained'), () => valiAine(a));
  });
  teeIndeks();
  naitaEdenemist();
  utle('Tere! Mina olen Ralf. Aitan sul õppida. Vali aine või kirjuta, mida tahad õppida!');
}

function valiAine(a) {
  aine = a;
  klass = null;
  margi($('ained'), a.nupp);
  const kast = $('klassid');
  kast.replaceChildren();
  klassideJarjekord(a).forEach((k) => {
    nupp(k + '. klass', kast, (e) => valiKlass(k, e.currentTarget));
  });
  $('klassi-osa').hidden = false;
  $('teema-osa').hidden = true;
  $('viisid').hidden = true;
  peidaOsad();
  utle(a.emoji + ' ' + a.nimi + '! Mis klassis sa käid?');
}

function valiKlass(k, klassiNupp) {
  klass = k;
  margi($('klassid'), klassiNupp);
  const kast = $('teemad');
  kast.replaceChildren();
  aine.klassid[k].forEach((t) => {
    t.nupp = nupp(teemaSilt(aine, k, t), kast, () => valiTeema(t));
  });
  $('teema-osa').hidden = false;
  $('viisid').hidden = true;
  peidaOsad();
  utle(k + '. klass. Vali teema!');
}

function valiTeema(t) {
  teema = t;
  margi($('teemad'), t.nupp);
  peidaOsad();
  $('viisid').hidden = false;
  minu.margi(minu.voti(aine, klass, t), { aeg: Date.now() });
  utle('Super! Õpime teemat "' + t.nimi + '". Kuidas tahad õppida?');
  $('viisid').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Jump straight to a topic found by search or by "continue".
function avaTeema(leid) {
  valiAine(leid.aine);
  const i = klassideJarjekord(leid.aine).indexOf(leid.klass);
  valiKlass(leid.klass, $('klassid').children[i]);
  valiTeema(leid.teema);
}

// --- "Ask Ralf": search every topic's name, keywords, cards, video and text ---
const lihtne = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const tykelda = (s) => lihtne(s).split(/[^a-z0-9]+/).filter((w) => w.length >= 3);
const KODUTOO = /kodutoo|kirjuta mulle|tee minu|tee mu |lahenda mulle|essee/;
// Question words that would match almost every topic.
const TAIDISSONAD = new Set(['mis', 'mida', 'kes', 'kus', 'kas', 'kuidas', 'miks', 'millal', 'see', 'seda',
  'need', 'ning', 'aga', 'ole', 'oli', 'mul', 'minu', 'sinu', 'palun', 'tahan', 'oppida', 'teada', 'raagi',
  'ralf', 'klass', 'klassi']);

// Where to look in a topic, with how much a match there counts.
const VALJAD = [
  [5, (t) => t.nimi],
  [4, (t) => t.sonad.join(' ')],
  [2, (t) => t.kaardid.flat().join(' ')],
  [1, (t) => t.video.map((s) => s[1]).concat(t.tekst).join(' ')]
];

let indeks = [];

function teeIndeks() {
  indeks = [];
  ained.forEach((a) => {
    Object.entries(a.klassid).forEach(([k, teemad]) => {
      teemad.forEach((t) => {
        const valjad = VALJAD.map(([kaal, vota]) => [kaal, [...new Set(tykelda(vota(t)))]]);
        indeks.push({ aine: a, klass: k, teema: t, valjad });
      });
    });
  });
}

// Estonian words change their endings, so compare how the words begin.
function sobib(s, w) {
  if (w.startsWith(s)) return true;
  if (w.length >= 4 && s.startsWith(w)) return true;
  let i = 0;
  while (i < s.length && i < w.length && s[i] === w[i]) i++;
  return i >= 5 && i >= Math.min(s.length, w.length) - 2;
}

function otsi(paring) {
  const sonad = [...new Set(tykelda(paring))].filter((s) => !TAIDISSONAD.has(s));
  const leiud = [];
  indeks.forEach((rida) => {
    let punktid = 0;
    sonad.forEach((s) => {
      let parim = 0;
      rida.valjad.forEach(([kaal, sonu]) => {
        if (kaal > parim && sonu.some((w) => sobib(s, w))) parim = kaal;
      });
      // Topics that match more of the words come first.
      if (parim) punktid += 10 + parim;
    });
    if (punktid) leiud.push({ ...rida, punktid });
  });
  return leiud.sort((x, y) => y.punktid - x.punktid).slice(0, 8);
}

// Links to study sites; the visitor opens them, Ralf itself sends nothing.
function naitaEdasi(paring) {
  const sona = encodeURIComponent(paring.trim());
  $('viki').href = 'https://et.wikipedia.org/w/index.php?search=' + sona;
  $('sonaveeb').href = 'https://sonaveeb.ee/search/unif/dlall/dsall/' + sona;
  $('koolikott').href = 'https://e-koolikott.ee/et/search?q=' + sona;
  $('edasi').hidden = false;
}

$('kusi').addEventListener('submit', (e) => {
  e.preventDefault();
  const paring = $('kysimus').value;
  const kast = $('leiud');
  kast.replaceChildren();
  $('edasi').hidden = true;
  if (!paring.trim()) {
    utle('Kirjuta enne midagi! Näiteks "murrud" või "planeedid".');
    return;
  }
  const kodutoo = KODUTOO.test(lihtne(paring));
  const jutt = !kodutoo && vasta(paring);
  if (jutt) {
    utle(jutt);
    return;
  }
  naitaEdasi(paring);
  const leiud = otsi(paring);
  if (leiud.length === 1 && !kodutoo) {
    avaTeema(leiud[0]);
    return;
  }
  leiud.forEach((l) => {
    nupp(l.teema.emoji + ' ' + l.teema.nimi + ' (' + l.aine.nimi + ', ' + l.klass + '. kl)', kast, () => {
      kast.replaceChildren();
      avaTeema(l);
    });
  });
  if (kodutoo) {
    utle('Kodutööd ma sinu eest ei tee, aga aitan sul teema selgeks saada! Siis saad ise hakkama.');
  } else if (leiud.length) {
    utle('Leidsin need teemad. Vali, mida mõtlesid! All on ka õppelehed.');
  } else {
    utle('Minu tundides seda pole. Proovi all olevaid õppelehti!');
  }
});

// Learning modes
const OSAD = ['video', 'kaardid', 'opik', 'harjutused'];

function peidaOsad() {
  peataVideo();
  OSAD.forEach((id) => { $(id).hidden = true; });
  document.querySelectorAll('[data-viis]').forEach((n) => n.classList.remove('valitud'));
}

function avaViis(viis) {
  peidaOsad();
  document.querySelector('[data-viis="' + viis + '"]').classList.add('valitud');
  $(viis).hidden = false;
  if (viis === 'video') alustaVideo();
  if (viis === 'kaardid') alustaKaardid();
  if (viis === 'opik') alustaOpik();
  if (viis === 'harjutused') alustaHarj();
}

document.querySelectorAll('[data-viis]').forEach((n) => {
  n.addEventListener('click', () => avaViis(n.dataset.viis));
});

// --- Video: scenes change every few seconds ---
const STSEENI_AEG = 3500;
let stseen = 0;
let videoAeg = 0;
let videoKaib = false;
let kaader = 0;
let eelmineAeg = 0;

function naitaStseeni() {
  const [emoji, tekst] = teema.video[stseen];
  const el = $('stseen-emoji');
  el.textContent = emoji;
  el.classList.remove('uus');
  void el.offsetWidth; // restart the pop animation
  el.classList.add('uus');
  $('stseen-tekst').textContent = tekst;
}

function alustaVideo() {
  stseen = 0;
  videoAeg = 0;
  naitaStseeni();
  mangiVideo();
  utle('Vaata hoolega!');
}

function mangiVideo() {
  videoKaib = true;
  $('video-nupp').textContent = '⏸ Paus';
  eelmineAeg = performance.now();
  kaader = requestAnimationFrame(samm);
}

function peataVideo() {
  videoKaib = false;
  cancelAnimationFrame(kaader);
  $('video-nupp').textContent = '▶ Mängi';
}

function samm(nyyd) {
  if (!videoKaib) return;
  videoAeg += nyyd - eelmineAeg;
  eelmineAeg = nyyd;
  const koguAeg = teema.video.length * STSEENI_AEG;
  if (videoAeg >= koguAeg) {
    $('riba-sees').style.width = '100%';
    peataVideo();
    $('video-nupp').textContent = '🔁 Vaata uuesti';
    utle('Video sai läbi! Proovi nüüd mälukaarte.');
    return;
  }
  const uus = Math.floor(videoAeg / STSEENI_AEG);
  if (uus !== stseen) {
    stseen = uus;
    naitaStseeni();
  }
  $('riba-sees').style.width = (videoAeg / koguAeg) * 100 + '%';
  kaader = requestAnimationFrame(samm);
}

$('video-nupp').addEventListener('click', () => {
  if (videoKaib) {
    peataVideo();
  } else if (videoAeg >= teema.video.length * STSEENI_AEG) {
    alustaVideo();
  } else {
    mangiVideo();
  }
});

// --- Flashcards ---
let kaardiNr = 0;
let naitabVastust = false;

function naitaKaarti() {
  const [kysimus, vastus] = teema.kaardid[kaardiNr];
  $('kaart').classList.toggle('vastus', naitabVastust);
  $('kaart-silt').textContent = naitabVastust ? 'Vastus' : 'Küsimus';
  $('kaart-tekst').textContent = naitabVastust ? vastus : kysimus;
  $('kaart-nr').textContent = (kaardiNr + 1) + ' / ' + teema.kaardid.length;
}

function alustaKaardid() {
  kaardiNr = 0;
  naitabVastust = false;
  naitaKaarti();
  utle('Mõtle vastus enne välja, siis puuduta kaarti!');
}

$('kaart').addEventListener('click', () => {
  naitabVastust = !naitabVastust;
  naitaKaarti();
});

function liiguKaart(suund) {
  const n = teema.kaardid.length;
  kaardiNr = (kaardiNr + suund + n) % n;
  naitabVastust = false;
  naitaKaarti();
}

$('eelmine').addEventListener('click', () => liiguKaart(-1));
$('jargmine').addEventListener('click', () => liiguKaart(1));

// --- Textbook: one paragraph per page, a table of contents for the grade ---
let lk = 0;

function teeSisukord() {
  $('sisukord-pealkiri').textContent = '📑 Sisukord: ' + aine.nimi + ', ' + klass + '. klass';
  const ol = $('sisukord');
  ol.replaceChildren();
  aine.klassid[klass].forEach((t) => {
    const li = document.createElement('li');
    const n = nupp(teemaSilt(aine, klass, t), li, () => {
      $('sisukord-kast').open = false;
      valiTeema(t);
      avaViis('opik');
    });
    n.classList.toggle('valitud', t === teema);
    ol.append(li);
  });
}

function naitaLk() {
  const leht = $('opik-leht');
  leht.replaceChildren();
  if (lk === 0) {
    const pealkiri = document.createElement('h2');
    pealkiri.textContent = teema.emoji + ' ' + teema.nimi;
    const kus = document.createElement('p');
    kus.className = 'opik-aine';
    kus.textContent = aine.emoji + ' ' + aine.nimi + ' · ' + klass + '. klass';
    leht.append(pealkiri, kus);
  }
  const pilt = document.createElement('div');
  pilt.className = 'opik-pilt';
  pilt.setAttribute('aria-hidden', 'true');
  pilt.textContent = teema.video[lk % teema.video.length][0];
  const p = document.createElement('p');
  p.textContent = teema.tekst[lk];
  leht.append(pilt, p);

  const viimane = lk === teema.tekst.length - 1;
  $('lk-nr').textContent = 'lk ' + (lk + 1) + ' / ' + teema.tekst.length;
  $('lk-eelmine').disabled = lk === 0;
  $('lk-jargmine').textContent = viimane ? '✏️ Harjutused' : 'järgmine →';
  if (viimane) minu.margi(minu.voti(aine, klass, teema), { loetud: true, aeg: Date.now() });
}

function alustaOpik() {
  lk = 0;
  teeSisukord();
  naitaLk();
  utle('Loe rahulikult. Lehte keerad all olevate nuppudega.');
}

$('lk-eelmine').addEventListener('click', () => {
  if (lk > 0) lk--;
  naitaLk();
});

$('lk-jargmine').addEventListener('click', () => {
  if (lk === teema.tekst.length - 1) {
    avaViis('harjutused');
    return;
  }
  lk++;
  naitaLk();
});

// --- Exercises, checked right away ---
function alustaHarj() {
  const [a, k, t] = [aine, klass, teema];
  utle('Lahenda ülesanded. Ma kontrollin kohe!');
  alustaHarjutused(t, $('harj'), utle, (protsent) => {
    const v = minu.voti(a, k, t);
    minu.margi(v, { parim: Math.max(minu.loe(v).parim ?? 0, protsent), aeg: Date.now() });
  });
}

// --- My progress: kept only in this browser ---
function naitaEdenemist() {
  const kast = $('minu-sisu');
  kast.replaceChildren();
  let viimane = null;
  ained.forEach((a) => {
    let kokku = 0;
    let opitud = 0;
    let tahti = 0;
    Object.entries(a.klassid).forEach(([k, teemad]) => {
      teemad.forEach((t) => {
        kokku++;
        const e = minu.loe(minu.voti(a, k, t));
        if (e.loetud || e.parim != null) opitud++;
        if (e.parim >= 80) tahti++;
        if (e.aeg && (!viimane || e.aeg > viimane.aeg)) viimane = { aeg: e.aeg, aine: a, klass: k, teema: t };
      });
    });
    if (!opitud) return;
    const rida = document.createElement('div');
    rida.className = 'minu-rida';
    const nimi = document.createElement('span');
    nimi.textContent = a.emoji + ' ' + a.nimi;
    const arv = document.createElement('span');
    arv.textContent = opitud + ' / ' + kokku + ' teemat · ' + tahti + ' ⭐';
    const riba = document.createElement('div');
    riba.className = 'minu-riba';
    const sees = document.createElement('div');
    sees.style.width = (opitud / kokku) * 100 + '%';
    riba.append(sees);
    rida.append(nimi, arv, riba);
    kast.append(rida);
  });
  if (viimane) {
    const n = nupp('▶ Jätka: ' + viimane.teema.emoji + ' ' + viimane.teema.nimi, kast, () => avaTeema(viimane));
    n.className = 'jatka';
  }
  if (!kast.querySelector('.minu-rida')) {
    const p = document.createElement('p');
    p.textContent = 'Siia tulevad sinu linnukesed ✔️ ja tähed ⭐. Loe õpikut ja tee harjutusi!';
    kast.prepend(p);
  }
  $('kustuta').hidden = !viimane;
}

$('kustuta').addEventListener('click', () => {
  if (confirm('Kas kustutan kogu sinu edenemise?')) {
    minu.kustuta();
    utle('Alustame otsast! 🧹');
  }
});

// Keep topic buttons, the table of contents and the progress box up to date.
minu.kuula(() => {
  naitaEdenemist();
  if (aine && klass) {
    aine.klassid[klass].forEach((t) => {
      if (t.nupp) t.nupp.textContent = teemaSilt(aine, klass, t);
    });
  }
  if (teema && !$('opik').hidden) teeSisukord();
});

laeAined();
