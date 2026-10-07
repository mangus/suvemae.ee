// Ralf TI: a friendly study helper. All lessons are written here, no outside requests.

const TEEMAD = [
  {
    nimi: 'Päikesesüsteem',
    emoji: '🪐',
    sonad: ['päike', 'paike', 'planeet', 'kosmos', 'maa', 'kuu', 'jupiter', 'tähed', 'tahed'],
    video: [
      ['☀️', 'Päike on täht. See on suur ja kuum gaasipall.'],
      ['🪐', 'Päikese ümber tiirleb kaheksa planeeti.'],
      ['🌍', 'Maa on Päikesest kolmas planeet.'],
      ['📅', 'Ühe tiiru ümber Päikese teeb Maa ühe aastaga.'],
      ['🌕', 'Kuu tiirleb ümber Maa ja peegeldab Päikese valgust.']
    ],
    kaardid: [
      ['Mis on Päike?', 'Täht, suur ja kuum gaasipall.'],
      ['Mitu planeeti tiirleb ümber Päikese?', 'Kaheksa.'],
      ['Mis on kõige suurem planeet?', 'Jupiter.'],
      ['Mitmes planeet on Maa?', 'Kolmas.'],
      ['Miks Kuu öösel helendab?', 'Ta peegeldab Päikese valgust.']
    ],
    tekst: [
      'Päike on täht. See on väga suur ja kuum gaasipall. Päike annab meile valgust ja soojust.',
      'Päikese ümber tiirleb kaheksa planeeti. Päikesele kõige lähemal on Merkuur. Kõige suurem on Jupiter.',
      'Maa on Päikesest kolmas planeet. Ühe tiiru ümber Päikese teeb Maa ühe aastaga.',
      'Kuu tiirleb ümber Maa. Kuu ise ei helenda. Ta peegeldab Päikese valgust.'
    ]
  },
  {
    nimi: 'Vee ringkäik',
    emoji: '💧',
    sonad: ['vesi', 'vee', 'vihm', 'pilv', 'aur', 'meri', 'lumi', 'ringkäik', 'ringkaik'],
    video: [
      ['☀️', 'Päike soojendab vett meres ja järvedes.'],
      ['♨️', 'Vesi aurustub ja tõuseb auruna õhku.'],
      ['☁️', 'Üleval on külm. Aurust saavad pisikesed tilgad ja pilved.'],
      ['🌧️', 'Kui tilgad lähevad raskeks, sajab vihma või lund.'],
      ['🏞️', 'Jõed viivad vee tagasi merre. Ring algab uuesti!']
    ],
    kaardid: [
      ['Mis soojendab vett meres?', 'Päike.'],
      ['Mis juhtub soojenenud veega?', 'See aurustub ja tõuseb õhku.'],
      ['Millest tekivad pilved?', 'Pisikestest veetilkadest.'],
      ['Millal sajab vihma?', 'Kui pilve tilgad lähevad raskeks.'],
      ['Kuidas jõuab vesi tagasi merre?', 'Jõgede kaudu.']
    ],
    tekst: [
      'Päike soojendab vett meres, järvedes ja jõgedes. Soe vesi aurustub. Aur tõuseb õhku.',
      'Üleval on õhk külm. Aur jahtub ja muutub pisikesteks tilkadeks. Tilkadest saavad pilved.',
      'Kui tilgad lähevad suureks ja raskeks, sajab vihma. Talvel sajab lund.',
      'Vesi voolab jõgedesse. Jõed viivad vee tagasi merre. Siis algab ringkäik uuesti.'
    ]
  },
  {
    nimi: 'Taimed',
    emoji: '🌱',
    sonad: ['taim', 'lill', 'puu', 'leht', 'juur', 'fotosüntees', 'fotosuntees', 'hapnik'],
    video: [
      ['🌱', 'Taim vajab kasvamiseks valgust, vett ja õhku.'],
      ['🥕', 'Juured imevad mullast vett.'],
      ['🌿', 'Vars viib vee üles lehtedeni.'],
      ['🍃', 'Lehed teevad päikesevalguse abil taimele toitu.'],
      ['💨', 'Samal ajal annab taim õhku hapnikku, mida me hingame.']
    ],
    kaardid: [
      ['Mida vajab taim kasvamiseks?', 'Valgust, vett ja õhku.'],
      ['Mida teevad juured?', 'Imevad mullast vett.'],
      ['Mida teeb vars?', 'Viib vee lehtedeni.'],
      ['Kus teeb taim endale toitu?', 'Lehtedes.'],
      ['Mida annab taim õhku?', 'Hapnikku.']
    ],
    tekst: [
      'Taim vajab kasvamiseks valgust, vett ja õhku.',
      'Juured on mulla sees. Nad imevad mullast vett. Vars viib vee üles lehtedeni.',
      'Lehtedes teeb taim päikesevalguse abil endale toitu. Seda nimetatakse fotosünteesiks.',
      'Samal ajal annab taim õhku hapnikku. Meie hingame seda hapnikku sisse.'
    ]
  }
];

const $ = (id) => document.getElementById(id);
const ralf = $('ralf');
let teema = null;
let raagibTaimer = 0;

// Ralf "talks": show the text and move his mouth for a moment.
function utle(tekst) {
  $('jutt').textContent = tekst;
  ralf.classList.add('raagib');
  clearTimeout(raagibTaimer);
  raagibTaimer = setTimeout(() => ralf.classList.remove('raagib'), 1200);
}

// Topic buttons
const teemaNupud = TEEMAD.map((t) => {
  const nupp = document.createElement('button');
  nupp.type = 'button';
  nupp.textContent = t.emoji + ' ' + t.nimi;
  nupp.addEventListener('click', () => valiTeema(t));
  $('teemad').append(nupp);
  return nupp;
});

function valiTeema(t) {
  teema = t;
  TEEMAD.forEach((x, i) => teemaNupud[i].classList.toggle('valitud', x === t));
  peidaOsad();
  $('viisid').hidden = false;
  utle('Super! Õpime teemat "' + t.nimi + '". Kuidas tahad õppida?');
}

// "Ask Ralf": find a topic by keywords
$('kusi').addEventListener('submit', (e) => {
  e.preventDefault();
  const s = $('kysimus').value.toLowerCase();
  if (!s.trim()) {
    utle('Kirjuta enne midagi! Näiteks "vihm" või "planeedid".');
    return;
  }
  const leitud = TEEMAD.find((t) => t.sonad.some((sona) => s.includes(sona)));
  if (leitud) {
    valiTeema(leitud);
  } else {
    utle('Hmm, seda ma veel ei oska. Vali mõni teema nuppude alt!');
  }
});

// Learning modes
const OSAD = ['video', 'kaardid', 'tekst'];

function peidaOsad() {
  peataVideo();
  OSAD.forEach((id) => { $(id).hidden = true; });
  document.querySelectorAll('[data-viis]').forEach((n) => n.classList.remove('valitud'));
}

document.querySelectorAll('[data-viis]').forEach((nupp) => {
  nupp.addEventListener('click', () => {
    const viis = nupp.dataset.viis;
    peidaOsad();
    nupp.classList.add('valitud');
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
