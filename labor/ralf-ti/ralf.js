// Ralf TI: a friendly study helper. All lessons live in the ained/ folder, no outside requests.
// Navigation: subject -> grade -> topic -> learning mode (video, flashcards, easy text).

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

// Load every subject; one broken file must not break the others.
async function laeAined() {
  const tulemused = await Promise.allSettled(
    AINE_FAILID.map((f) => import('./ained/' + f + '.js'))
  );
  ained = tulemused.filter((t) => t.status === 'fulfilled').map((t) => t.value.default);
  ained.forEach((a) => {
    a.nupp = nupp(a.emoji + ' ' + a.nimi, $('ained'), () => valiAine(a));
  });
  utle('Tere! Mina olen Ralf. Aitan sul õppida. Vali aine või kirjuta, mida tahad õppida!');
}

function valiAine(a) {
  aine = a;
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
  margi($('klassid'), klassiNupp);
  const kast = $('teemad');
  kast.replaceChildren();
  aine.klassid[k].forEach((t) => {
    t.nupp = nupp(t.emoji + ' ' + t.nimi, kast, () => valiTeema(t));
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
  utle('Super! Õpime teemat "' + t.nimi + '". Kuidas tahad õppida?');
  $('viisid').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Jump straight to a topic found by search.
function avaTeema(leid) {
  valiAine(leid.aine);
  const i = klassideJarjekord(leid.aine).indexOf(leid.klass);
  valiKlass(leid.klass, $('klassid').children[i]);
  valiTeema(leid.teema);
}

// --- "Ask Ralf": search all topics by keywords ---
const lihtne = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const KODUTOO = /kodutoo|kirjuta mulle|tee minu|tee mu |lahenda mulle|essee/;

function otsi(paring) {
  const sonad = lihtne(paring).split(/[^a-z0-9]+/).filter((s) => s.length >= 3);
  const leiud = [];
  ained.forEach((a) => {
    Object.entries(a.klassid).forEach(([k, teemad]) => {
      teemad.forEach((t) => {
        const votmed = t.sonad.map(lihtne)
          .concat(lihtne(t.nimi).split(/[^a-z0-9]+/).filter((s) => s.length >= 4));
        let punktid = 0;
        sonad.forEach((s) => {
          if (votmed.some((v) => s.startsWith(v) || (s.length >= 4 && v.startsWith(s)))) punktid++;
        });
        if (punktid) leiud.push({ aine: a, klass: k, teema: t, punktid });
      });
    });
  });
  return leiud.sort((x, y) => y.punktid - x.punktid).slice(0, 8);
}

$('kusi').addEventListener('submit', (e) => {
  e.preventDefault();
  const paring = $('kysimus').value;
  const kast = $('leiud');
  kast.replaceChildren();
  if (!paring.trim()) {
    utle('Kirjuta enne midagi! Näiteks "murrud" või "planeedid".');
    return;
  }
  const leiud = otsi(paring);
  const kodutoo = KODUTOO.test(lihtne(paring));
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
    utle('Leidsin mitu teemat. Vali, mida mõtlesid!');
  } else {
    utle('Hmm, seda ma veel ei oska. Vali aine nuppude alt!');
  }
});

// Learning modes
const OSAD = ['video', 'kaardid', 'tekst'];

function peidaOsad() {
  peataVideo();
  OSAD.forEach((id) => { $(id).hidden = true; });
  document.querySelectorAll('[data-viis]').forEach((n) => n.classList.remove('valitud'));
}

document.querySelectorAll('[data-viis]').forEach((n) => {
  n.addEventListener('click', () => {
    const viis = n.dataset.viis;
    peidaOsad();
    n.classList.add('valitud');
    $(viis).hidden = false;
    if (viis === 'video') alustaVideo();
    if (viis === 'kaardid') alustaKaardid();
    if (viis === 'tekst') naitaTeksti();
  });
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

// --- Easy-to-read text ---
function naitaTeksti() {
  const leht = $('tekst');
  leht.replaceChildren();
  const pealkiri = document.createElement('h2');
  pealkiri.textContent = teema.emoji + ' ' + teema.nimi;
  leht.append(pealkiri);
  teema.tekst.forEach((loik) => {
    const p = document.createElement('p');
    p.textContent = loik;
    leht.append(p);
  });
  utle('Loe rahulikult. Lühikesed laused on kergem meelde jätta!');
}

laeAined();
