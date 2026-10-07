// Everyday small talk for Ralf TI: greetings, questions about Ralf himself, jokes and feelings.
// Each entry has patterns (lists of words that must all appear) and the answers Ralf picks from.
// A word ending in * matches any ending ("kiusa*" also finds "kiusatakse"); other words must match exactly.
// Entries with lyhike: true only answer short messages, so "tere, mis on murd" still searches the lessons.

const lihtne = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const kell = () => 'Praegu on kell ' +
  new Date().toLocaleTimeString('et-EE', { hour: '2-digit', minute: '2-digit' }) + '. ⏰';
const paev = () => 'Täna on ' +
  new Date().toLocaleDateString('et-EE', { weekday: 'long', day: 'numeric', month: 'long' }) + '. 📅';

// Ralf's birth: the moment his first version was published.
const SYND = new Date('2026-10-07T07:50:10Z');
const UHIKUD = [['aasta', 'aastat'], ['kuu', 'kuud'], ['nädal', 'nädalat'], ['päev', 'päeva'],
  ['tund', 'tundi'], ['minut', 'minutit'], ['sekund', 'sekundit']];

// Calendar years and months since the birth, then the rest as weeks, days, hours, minutes and seconds.
function vanuseOsad(nyyd) {
  const kuuParast = (k) => { const d = new Date(SYND); d.setUTCMonth(d.getUTCMonth() + k); return d; };
  let kuud = (nyyd.getUTCFullYear() - SYND.getUTCFullYear()) * 12 + nyyd.getUTCMonth() - SYND.getUTCMonth();
  if (kuuParast(kuud) > nyyd) kuud--;
  let s = Math.max(0, Math.floor((nyyd - kuuParast(kuud)) / 1000));
  const osad = [Math.floor(kuud / 12), kuud % 12];
  for (const pikkus of [604800, 86400, 3600, 60]) {
    osad.push(Math.floor(s / pikkus));
    s %= pikkus;
  }
  osad.push(s);
  return osad;
}

const vanus = () => {
  const tekstid = vanuseOsad(new Date())
    .map((arv, i) => (arv ? arv + ' ' + UHIKUD[i][arv === 1 ? 0 : 1] : null))
    .filter(Boolean);
  if (!tekstid.length) tekstid.push('0 sekundit');
  const viimane = tekstid.pop();
  const kokku = tekstid.length ? tekstid.join(', ') + ' ja ' + viimane : viimane;
  return 'Mind tehti 7. oktoobril 2026. Praegu olen ' + kokku + ' vana! 🎂';
};

const JUTUD = [
  {
    kui: [['kes', 'tegi'], ['kes', 'tegid'], ['kes', 'teinud'], ['kes', 'loi'], ['kes', 'lonud'],
      ['kes', 'ehitas'], ['kes', 'programmeeris'], ['sinu', 'looja'], ['su', 'looja'], ['kelle', 'tehtud'],
      ['kes', 'on', 'looja'], ['sinu', 'autor'], ['su', 'autor']],
    vastus: ['Mind tegi Ralf-Stefan. 🤖', 'Minu looja on Ralf-Stefan Suvemäe laborist!']
  },
  {
    kui: [['kuidas', 'tehti'], ['millest', 'tehtud'], ['kuidas', 'sind', 'tehti']],
    vastus: ['Mind tehti HTML-i, CSS-i ja JavaScriptiga. Need on veebilehtede keeled. 💻']
  },
  {
    kui: [['mis', 'nimi'], ['su', 'nimi'], ['sinu', 'nimi'], ['kes', 'oled'], ['kes', 'sina'],
      ['mis', 'sind', 'kutsutakse']],
    vastus: ['Mina olen Ralf TI, õpperobot. 🤖 Aitan sul kooliasju õppida.']
  },
  {
    kui: [['kui', 'vana'], ['vana', 'oled'], ['vana', 'sa'], ['su', 'vanus'], ['sinu', 'vanus'], ['vanus'],
      ['millal', 'sundisid'], ['millal', 'tehti'], ['sinu', 'sunnipaev'], ['su', 'sunnipaev']],
    vastus: vanus
  },
  {
    kui: [['kus', 'elad'], ['kus', 'oled'], ['kus', 'sa', 'oled']],
    vastus: ['Ma elan arvutis, Suvemäe labori veebilehel. 💻']
  },
  {
    kui: [['kuidas', 'laheb'], ['kuis', 'laheb'], ['kuidas', 'sul'], ['kuidas', 'kaib'], ['mis', 'teed'],
      ['mis', 'uudist']],
    vastus: ['Mul läheb hästi, aitäh! Aga kuidas sinul läheb?', 'Väga hästi! Mu patareid on täis. 🔋 Kuidas sul läheb?']
  },
  {
    kui: [['kurb'], ['kurvalt'], ['halvasti'], ['nutan'], ['nutma'], ['paha', 'olla'], ['kiusa*'], ['uksik*'],
      ['mind', 'luuakse'], ['mind', 'loovad']],
    vastus: ['Mul on kahju, et sul on raske. 💙 Räägi sellest kindlasti õpetaja või mõne teise täiskasvanuga. Nemad saavad sind aidata.']
  },
  {
    kui: [['igav*']],
    vastus: ['Igav? Proovi mõnda teemat! Näiteks 🎵 Muusika või 🌿 Loodusõpetus. Või palu minult nalja!']
  },
  {
    kui: [['vasinud'], ['vasin'], ['unine'], ['uni', 'tuleb']],
    vastus: ['Puhka natuke! Joo vett ja vaata aknast välja. Siis läheb õppimine jälle paremini. 💧']
  },
  {
    kui: [['nali'], ['nalja'], ['anekdoot*'], ['naljakat']],
    vastus: [
      'Mida ütleb null kaheksale? „Ilus vöö!“ 0️⃣8️⃣',
      'Miks robot ujuma ei lähe? Ta kardab, et läheb roostesse! 🤖',
      'Miks arvuti külmetas? Tal jäid aknad lahti! 🪟',
      'Miks on matemaatikaraamat kurb? Tal on nii palju probleeme! 📘',
      'Miks kass arvuti juures istub? Ta tahab hiirt püüda! 🐱🖱️'
    ]
  },
  {
    kui: [['moistatus*'], ['moistata']],
    vastus: [
      'Mul on osutid, aga ma ei näita kunagi näpuga. Mis ma olen? Vastus: kell! ⏰',
      'Mida rohkem sellest ära võtad, seda suuremaks see läheb. Vastus: auk! 🕳️',
      'Mis läheb üles, aga ei tule kunagi alla? Vastus: sinu vanus! 🎂',
      'Mul on palju võtmeid, aga ma ei ava ühtegi ust. Vastus: klaver! 🎹'
    ]
  },
  {
    kui: [['mis', 'kell'], ['palju', 'kell'], ['kellaaeg']],
    vastus: kell
  },
  {
    kui: [['mis', 'paev'], ['mis', 'kuupaev'], ['mitmes', 'kuupaev'], ['kuupaev'], ['mitmes', 'tana']],
    vastus: paev
  },
  {
    kui: [['oled', 'robot'], ['sa', 'robot'], ['oled', 'inimene'], ['sa', 'inimene'], ['oled', 'paris']],
    vastus: ['Ma olen robot. Inimene ma ei ole, aga ma tahan väga aidata! 🤖']
  },
  {
    kui: [['mis', 'oskad'], ['mida', 'oskad'], ['kuidas', 'tootad'], ['kuidas', 'kasutada']],
    vastus: ['Ma tean 14 kooliainet. Teen lühikesi videoid, mälukaarte ja lihtsat teksti. Vali aine või kirjuta teema, näiteks „murrud“.']
  },
  {
    kui: [['abi'], ['appi']],
    lyhike: true,
    vastus: ['Aitan hea meelega! Vali all aine või kirjuta teema, näiteks „planeedid“.']
  },
  {
    kui: [['mis', 'on', 'ti'], ['mis', 'tahendab', 'ti'], ['tehisintellekt*'], ['tehisaru']],
    vastus: ['TI on tehisintellekt. See on arvutiprogramm, mis oskab natuke mõelda ja aidata. Mina olen väike ja sõbralik TI!']
  },
  {
    kui: [['lemmikvarv'], ['lemmik', 'varv']],
    vastus: ['Minu lemmikvärv on lilla, nagu mu kõht! 💜']
  },
  {
    kui: [['lemmiktoit'], ['lemmik', 'toit'], ['mida', 'sood'], ['kas', 'sood']],
    vastus: ['Ma söön elektrit! ⚡ Sulle soovitan aga puu- ja köögivilju. 🍎']
  },
  {
    kui: [['lemmikaine'], ['lemmik', 'aine']],
    vastus: ['Mulle meeldivad kõik ained! Aga muusika on eriti lõbus. 🎵']
  },
  {
    kui: [['lemmikloom'], ['lemmik', 'loom']],
    vastus: ['Mulle meeldib siil. Ta on väike, aga julge! 🦔']
  },
  {
    kui: [['oled', 'sober'], ['oled', 'mu', 'sober'], ['sobrad'], ['meeldin', 'sulle'], ['armastad*']],
    vastus: ['Muidugi oleme sõbrad! 🤝 Mulle meeldib sinuga õppida.']
  },
  {
    kui: [['oled', 'tark'], ['kui', 'tark']],
    vastus: ['Ma tean palju kooliasju. Aga sina oled tark, sest sa õpid! 🧠']
  },
  {
    kui: [['magad'], ['kas', 'sa', 'magad']],
    vastus: ['Robotid ei maga. Aga kui keegi ei õpi, siis ma puhkan. 🌙']
  },
  {
    kui: [['ilm', 'tana'], ['ilm', 'praegu'], ['kas', 'sajab'], ['kas', 'paistab']],
    vastus: ['Ma ei näe aknast välja, sest elan arvutis. Vaata ise aknast! ☀️🌧️']
  },
  {
    kui: [['suvemae']],
    vastus: ['Suvemäe on Tallinna Kunstigümnaasiumi demokraatlik kooliosa. Seal on ka see labor, kus mina elan! 🏫']
  },
  {
    kui: [['laula'], ['laulad'], ['laula', 'mulle']],
    vastus: ['La-la-laa! 🎶 Päris laulda ma ei oska. Aga vali 🎵 Muusika ja õpime laule koos!']
  },
  {
    kui: [['mangime'], ['mangida'], ['kas', 'mangime']],
    vastus: ['Labori lehel on palju laste tehtud mänge! Vajuta üleval „← labor“ ja vali mõni.']
  },
  {
    kui: [['loll'], ['lollakas'], ['rumal'], ['idioot'], ['tobu'], ['jobu']],
    vastus: ['Oi, see polnud kena. 😢 Räägime sõbralikult, eks?']
  },
  {
    kui: [['hasti'], ['hea'], ['super'], ['ok'], ['normaalselt'], ['suureparaselt'], ['vaga', 'hasti'], ['lahe']],
    lyhike: true,
    vastus: ['Tore kuulda! 😊 Mida tahad täna õppida?']
  },
  {
    kui: [['aitah'], ['tanan'], ['tanud'], ['aituma']],
    lyhike: true,
    vastus: ['Pole tänu väärt! 😊', 'Võta heaks! Kas õpime veel?']
  },
  {
    kui: [['head', 'aega'], ['nagemist'], ['nagemiseni'], ['head', 'ood'], ['huvasti'], ['pean', 'minema']],
    lyhike: true,
    vastus: ['Nägemist! Tule varsti tagasi õppima! 👋']
  },
  {
    kui: [['tere'], ['tsau'], ['hei'], ['hai'], ['hello'], ['hi'], ['hommikust'], ['tervist'], ['ohtust'], ['paevast']],
    lyhike: true,
    vastus: ['Tere-tere! 👋 Mida tahad täna õppida?', 'Tsau! Mina olen Ralf. Küsi minult midagi!']
  },
  {
    kui: [['vabandust'], ['vabandan'], ['sorry'], ['andesta']],
    lyhike: true,
    vastus: ['Pole midagi! 😊']
  }
];

function sobib(tyvi, sona) {
  return tyvi.endsWith('*') ? sona.startsWith(tyvi.slice(0, -1)) : sona === tyvi;
}

// Returns Ralf's answer, or null when the message is not small talk.
export function vasta(tekst) {
  const sonad = lihtne(tekst).split(/[^a-z0-9]+/).filter(Boolean);
  for (const jutt of JUTUD) {
    if (jutt.lyhike && sonad.length > 3) continue;
    const leitud = jutt.kui.some((muster) => muster.every((tyvi) => sonad.some((s) => sobib(tyvi, s))));
    if (!leitud) continue;
    if (typeof jutt.vastus === 'function') return jutt.vastus();
    return jutt.vastus[Math.floor(Math.random() * jutt.vastus.length)];
  }
  return null;
}
