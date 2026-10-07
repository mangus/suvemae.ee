'use strict';
// Hea tahte mäng: walk around the Suvemäe house, help students and teachers
// by choosing what the Good Will Agreement says, and pick up litter.
// Drawn in the manner of Latvian illustrator Arta Ozola-Jaunaraja: hair-fine ink lines,
// soft watercolour washes, airy cross-hatched grids and a crochet-lace border.
(() => {
  const W = 720;
  const EESMARK = 12;
  const MAX_PRAHT = 4;
  const INK = '#35344a';
  const PUNANE = '#c8705f';
  const SINEP = '#dcb15a';
  const SININE = '#7ea6b8';
  const ROHE = '#98ad7c';
  const KORALL = '#e3a58e';
  const PABER = '#f8f2e4';
  const VALGE = '#fffdf7';
  const KIRI = '700 20px "Segoe Print", "Bradley Hand", "Chalkboard SE", "Comic Sans MS", cursive';

  const cv = document.getElementById('louend');
  const ctx = cv.getContext('2d');
  const S = Math.min(2, window.devicePixelRatio || 1);
  cv.width = W * S;
  cv.height = W * S;

  const $ = (id) => document.getElementById(id);

  // ---------- Situations from the Good Will Agreement ----------
  // {nimi} is replaced with the character's name (always used in nominative).
  const OLUKORRAD = [
    { kes: 'opilane', reegel: 'Minu keha',
      tekst: '{nimi} ei taha, et teda kallistatakse. Üks sõber tahab ikka kallistada. Mida sa ütled?',
      valikud: [['Igaüks otsustab ise oma keha üle. Küsime enne!', true], ['Kallistus on ju tore, tee ikka.', false], ['Ma ei sekku, see pole minu asi.', false]],
      miks: 'Igal inimesel on õigus otsustada, kes teda puudutab ja kuidas.' },
    { kes: 'opilane', reegel: 'Minu nimi',
      tekst: '„Mind kutsutakse hüüdnimega, mis mulle ei meeldi. Ma tahan, et mind kutsutaks {nimi}.“',
      valikud: [['Selge, {nimi}! Kutsun sind nii, nagu sa ise soovid.', true], ['Aga hüüdnimi on naljakam!', false], ['Ma kutsun sind nii, kuidas ise tahan.', false]],
      miks: 'Austame igaühe nime, millega ta soovib, et teda kutsutakse.' },
    { kes: 'opilane', reegel: 'Minu asjad',
      tekst: '{nimi} jättis oma värvipliiatsid lauale. Sul on just punast vaja.',
      valikud: [['Küsin enne: „Kas ma tohin laenata?“', true], ['Võtan vaikselt, keegi ei märka.', false], ['Võtan ja panen kunagi tagasi.', false]],
      miks: 'Kellegi teise asju ei võta me luba küsimata.' },
    { kes: 'opilane', reegel: 'Minu asjad',
      tekst: '„Meie ühine legoloss on põrandal laiali. Kas aitad?“ küsib {nimi}.',
      valikud: [['Aitan korjata. Hoolitseme ühiste asjade eest!', true], ['Ei, mina seda lossi ei ehitanud.', false], ['Lükkan klotsid diivani alla.', false]],
      miks: 'Hoolitseme ühisvara eest, sest see on kõigi oma.' },
    { kes: 'opilane', reegel: 'Minu Maa',
      tekst: '„Söök on söödud!“ ütleb {nimi}. Mis su taldrikust saab?',
      valikud: [['Pesen oma nõud ise ära.', true], ['Jätan lauale, küll keegi koristab.', false], ['Peidan taldriku kapi taha.', false]],
      miks: 'Hoiame keskkonda puhtana ja arvestame teistega, näiteks peseme nõud.' },
    { kes: 'opilane', reegel: 'Minu Maa',
      tekst: '{nimi} näitab: kraan tilgub ja üks lamp on katki.',
      valikud: [['Ütlen kohe täiskasvanule. Ma ei jää ükskõikseks!', true], ['Pole minu mure.', false], ['Keeran kraani veel rohkem lahti.', false]],
      miks: 'Kui märkad, et miski on katki, ära jää ükskõikseks.' },
    { kes: 'opilane', reegel: 'Stopp',
      tekst: '{nimi} hüüab mängu ajal: „Stopp! Mulle see ei meeldi!“',
      valikud: [['Jään kohe seisma ja kuulan.', true], ['Mängin edasi, see on ju mäng.', false], ['Naeran ja jooksen ära.', false]],
      miks: 'Kui keegi ütleb „Stopp!“, peab igaüks sellele reageerima.' },
    { kes: 'opilane', reegel: 'Stopp',
      tekst: 'Keegi tõukab sind järjekorras. {nimi} küsib: „Mida sa teed?“',
      valikud: [['Ütlen selgelt: „Stopp! Mulle ei meeldi.“', true], ['Tõukan tagasi.', false], ['Olen vait ja kurvastan üksi.', false]],
      miks: 'Kui miski häirib, ütle: „Stopp!“' },
    { kes: 'opilane', reegel: 'Taastav õiglus',
      tekst: '{nimi} ja tema sõber tülitsevad palli pärast.',
      valikud: [['Räägime kohe koos läbi: mis juhtus ja mida keegi vajab?', true], ['Võtan palli endale.', false], ['Kutsun kõik teised vaatama.', false]],
      miks: 'Lahendame konflikte rahumeelselt ja kõik osapooled saavad rääkida.' },
    { kes: 'opilane', reegel: 'Kolm sammu tüli lahendamiseks',
      tekst: '„Me rääkisime juba, aga tüli ei lahenenud. Mis nüüd?“ küsib {nimi}.',
      valikud: [['Viime selle väikesesse ringi arutamiseks.', true], ['Unustame ära, küll möödub.', false], ['Lähme kakleme.', false]],
      miks: 'Kõigepealt räägime kohe, siis väikeses ringis ja vajadusel Suvemäe ringis.' },
    { kes: 'opetaja', reegel: 'Igaühe hääl loeb',
      tekst: '„Suvemäe ringis arutame, mida vahetunnis mängida,“ ütleb {nimi}. Mida sa teed?',
      valikud: [['Ütlen oma mõtte välja ja kuulan ka teisi.', true], ['Ei ütle midagi, mul on ükskõik.', false], ['Karjun teistest üle.', false]],
      miks: 'Igaühel on võimalus oma arvamust avaldada ja oma hääl kuuldavaks teha.' },
    { kes: 'opilane', reegel: 'Enne mõtle, siis ütle',
      tekst: '{nimi} joonistus ei tulnud nii ilus, kui ta tahtis.',
      valikud: [['Mulle meeldivad su värvid! Kas proovime koos?', true], ['See on kole.', false], ['Mina oskan palju paremini.', false]],
      miks: 'Enne mõtle, siis ütle: kas mu sõnad on lahked ja aitavad?' },
    { kes: 'opetaja', reegel: 'Coaching ja eesmärgid',
      tekst: '„Täna on meie coachingu kohtumine. Mida sa tahaksid õppida?“ küsib {nimi}.',
      valikud: [['Räägin oma huvidest ja seame koos eesmärgi.', true], ['Ütlen „ei tea“ ja lähen ära.', false], ['Õpetaja võiks kõik minu eest otsustada.', false]],
      miks: 'Coaching aitab sul endale eesmärke seada ja nende poole liikuda.' },
    { kes: 'opetaja', reegel: 'Ennastjuhtiv õpilane',
      tekst: 'Sa tahad robootikat iseseisvalt õppida. {nimi} küsib: „Kuidas me selle kirja saame?“',
      valikud: [['Lepime koos kokku, mida ja kuidas ma õpin.', true], ['Ma ei räägi sellest kellelegi.', false], ['Ütlen, et õppisin, kuigi ei õppinud.', false]],
      miks: 'Iseseisvalt õpitu lepime kokku õpetajaga, et seda saaks arvestada.' },
    { kes: 'opilane', reegel: 'Õpime koos, vanus ei loe',
      tekst: '{nimi} on sinust palju noorem ja tahab teie mänguga liituda.',
      valikud: [['Tule ka! Mängime koos.', true], ['Sa oled liiga väike.', false], ['Teeme näo, et ei kuule.', false]],
      miks: 'Suvemäel õpivad ja mängivad eri vanuses lapsed koos ning hoolivad üksteisest.' },
    { kes: 'opilane', reegel: 'Tunded sõnadega',
      tekst: '{nimi} on vihane, sest tema torn kukkus ümber.',
      valikud: [['Aitan tal öelda, mis tunne tal on, ilma löömata.', true], ['Ütlen, et ta lööks kõik katki.', false], ['Naeran tema üle.', false]],
      miks: 'Koos mängides õpime oma tundeid väljendama selgelt ja vägivallatult.' },
    { kes: 'opetaja', reegel: 'Õpetaja hoiab turvalist kooli',
      tekst: '„Üks laps ei tunne end koolis turvaliselt,“ ütleb {nimi}. „Mida peaks õpetaja tegema?“',
      valikud: [['Kuulama last ja aitama, et kõigil oleks turvaline.', true], ['Ütlema, et saagu ise hakkama.', false], ['Mitte midagi tegema.', false]],
      miks: 'Õpetaja ülesanne on luua turvaline ja õppimist toetav keskkond.' },
    { kes: 'opilane', reegel: 'Hooli teistest',
      tekst: '{nimi} istub üksi nurgas ja paistab kurb.',
      valikud: [['Lähen ja küsin, kas kõik on hästi.', true], ['Kõnnin mööda.', false], ['Räägin teistele, et ta on imelik.', false]],
      miks: 'Hoolitseme selle eest, et igaühel oleks koolis hea ja turvaline olla.' },
    { kes: 'opetaja', reegel: 'Tagasiside aitab kasvada',
      tekst: '„Su projekt on valmis! Kas tahad tagasisidet?“ küsib {nimi}.',
      valikud: [['Jah, aitäh! Kuulan ja mõtlen, mida edasi teha.', true], ['Ei, ma tean ise kõike.', false], ['Panen kõrvad kinni.', false]],
      miks: 'Õpetaja annab regulaarset tagasisidet, et saaksid areneda.' },
  ];


  // ---------- Answer check ----------
  // The player types their own answer. It is good when it has a good-will word for the
  // situation and no unkind word. "ei", "pole" or "ära" right before a good word turns it
  // around ("ei aita"); before an unkind word it cancels it ("ära löö").
  // A stem matches the start of a word, "x=" matches the whole word, "a b" is a phrase.
  const HALVAD = ['löö=', 'lööb', 'löön', 'lööme', 'lööd=', 'lööks', 'löövad', 'tõuka', 'peks', 'hammust',
    'sõima', 'loll', 'rumal', 'tola', 'idioot', 'vihka', 'kakle', 'karju', 'varasta', 'naeran', 'naerame',
    'naerda', 'välja naer', 'mõnita', 'narri', 'kole', 'lõhu', 'pole minu asi', 'pole minu mure',
    'ei ole minu asi', 'ei huvita'];
  const SONAD = [
    [['küsi', 'luba', 'otsusta', 'keha', 'rahule', 'stopp', 'lõpeta', 'austa', 'ära kallista', 'ei taha'],
      ['kallista', 'sundi', 'tee ikka', 'ei sekku']],
    [['{nimi}', 'soovi', 'tahad', 'vabanda', 'selge', 'muidugi', 'olgu', 'okei', 'austa', 'õige nim'],
      ['hüüdnim', 'naljak', 'kuidas ise tahan', 'kuidas mina tahan', 'nagu mina tahan']],
    [['küsi', 'luba', 'tohin', 'tohiks', 'laena', 'palun', 'oota'],
      ['vaikselt', 'salaja', 'napsa', 'ilma küsimata', 'ilma loata', 'keegi ei märka']],
    [['aita', 'korja', 'korista', 'koos', 'hoolit', 'ehitame', 'jah', 'muidugi'],
      ['diivani', 'peida', 'lükka', 'ei ehitanud', 'ei viitsi']],
    [['pese', 'korista', 'viin', 'nõudepesu', 'kraanikau', 'masinasse'],
      ['peida', 'jätan lauale', 'jätan sinna', 'keegi teine', 'küll keegi']],
    [['ütle', 'räägi', 'kutsu', 'täiskasvan', 'õpetaja', 'teata', 'paranda', 'kinni', 'näita'],
      ['rohkem lahti', 'veel lahti', 'pole minu']],
    [['seisma', 'peatu', 'lõpeta', 'kuula', 'vabanda', 'stopp', 'jään', 'küsi', 'olgu'],
      ['mängin edasi', 'jooksen ära', 'see on ju mäng', 'see on mäng']],
    [['stopp', 'ütle', 'palun', 'lõpeta', 'mulle ei meeldi', 'räägi', 'täiskasvan', 'õpetaja', 'ära tõuka'],
      ['olen vait', 'kurvastan üksi']],
    [['räägi', 'arutame', 'lepime', 'kokku', 'jaga', 'kordamööda', 'koos', 'kuula', 'vabanda', 'lahenda', 'küsi'],
      ['võtan palli', 'kõik vaatama', 'teised vaatama']],
    [['ring', 'väike', 'arutame', 'räägi', 'õpetaja', 'täiskasvan', 'abi', 'küsi'],
      ['unust', 'küll möödub', 'ise möödub']],
    [['ütle', 'arvan', 'mõte', 'mõtte', 'idee', 'pakun', 'kuula', 'hääleta', 'räägi', 'tahaks', 'tahan'],
      ['ükskõik']],
    [['meeldi', 'ilus', 'tore', 'vahva', 'äge', 'proovi', 'koos', 'aita', 'värv', 'julge', 'hästi'],
      ['halb', 'jube', 'nõme', 'oskan paremini', 'mina oskan']],
    [['taha', 'õppi', 'huvi', 'eesmär', 'meeldi', 'unista', 'proovi'],
      ['ei tea', 'minu eest', 'ükskõik']],
    [['lepime', 'kokku', 'kirja', 'plaan', 'kirjuta', 'räägi', 'õpetaja', 'näita', 'eesmär'],
      ['valeta', 'luiska', 'kuigi ei', 'ei räägi']],
    [['tule', 'jah', 'muidugi', 'koos', 'liitu', 'võid', 'tohid', 'mängime', 'olgu', 'pole liiga väike'],
      ['väike', 'liiga', 'teeme näo', 'ei kuule', 'mine ära', 'ei saa']],
    [['tunne', 'tunde', 'ütle', 'räägi', 'aita', 'rahune', 'hinga', 'ehitame', 'koos', 'mõistan', 'saan aru', 'vihane', 'kurb'],
      ['löö kõik']],
    [['kuula', 'aita', 'turva', 'räägi', 'toeta', 'küsi', 'kaitse', 'hooli', 'lohuta'],
      ['ise hakkama', 'mitte midagi', 'ei tee midagi', 'saagu']],
    [['küsi', 'lähen', 'kõik hästi', 'lohuta', 'mängi', 'tule', 'aita', 'kuidas sul', 'räägi', 'istun', 'kalli'],
      ['mööda', 'imelik']],
    [['jah', 'aitäh', 'taha', 'kuula', 'palun', 'muidugi', 'olgu', 'hea meel'],
      ['tean ise', 'kõrvad kinni', 'tean kõike']],
  ];
  OLUKORRAD.forEach((o, i) => { o.head = SONAD[i][0]; o.halb = SONAD[i][1]; });

  const EITUS = { ei: 2, pole: 2, mitte: 2, ega: 2, ära: 1, ärge: 1, ara: 1, arge: 1 };
  const fold = (t) => t.replace(/õ/g, 'o').replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u')
    .replace(/š/g, 's').replace(/ž/g, 'z');
  const clean = (t) => t.toLowerCase().replace(/[^a-z0-9õäöüšž ]+/g, ' ').replace(/ +/g, ' ').trim();

  // Returns 'hea', 'halb', 'segane' (no known word) or 'tyhi' (nothing typed)
  function hinda(vastus, o, nimi) {
    let tekst = clean(vastus);
    if (tekst.replace(/ /g, '').length < 2) return 'tyhi';
    // Typed without Estonian letters? Then compare without them on both sides.
    const plain = !/[õäöüšž]/.test(tekst);
    const norm = (t) => (plain ? fold(clean(t)) : clean(t));
    tekst = norm(tekst);
    const sonad = tekst.split(' ');
    const leia = (list) => {
      const r = { jah: false, eitatud: false };
      list.forEach((v0) => {
        const exact = v0.endsWith('=');
        const v = norm(v0.replace('=', '').split('{nimi}').join(nimi));
        if (!v) return;
        if (v.includes(' ')) {
          if ((' ' + tekst).includes(' ' + v)) r.jah = true;
          return;
        }
        sonad.forEach((w, i) => {
          if (exact ? w !== v : !w.startsWith(v)) return;
          let neg = false;
          for (let k = 1; k <= 2 && i - k >= 0; k++) {
            const e = EITUS[sonad[i - k]];
            if (e && e >= k) neg = true;
          }
          if (neg) r.eitatud = true; else r.jah = true;
        });
      });
      return r;
    };
    const hea = leia(o.head);
    if (leia(HALVAD).jah || leia(o.halb).jah || hea.eitatud) return 'halb';
    return hea.jah ? 'hea' : 'segane';
  }

  // ---------- Helpers ----------
  function rng(seed) {
    return () => {
      seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const grain = document.createElement('canvas');
  grain.width = grain.height = 128;
  (() => {
    const g = grain.getContext('2d');
    const id = g.createImageData(128, 128);
    for (let i = 0; i < 128 * 128; i++) {
      const v = Math.random() * 255;
      id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v;
      id.data[i * 4 + 3] = 30;
    }
    g.putImageData(id, 0, 0);
  })();

  function smoothPath(c, pts, closed) {
    c.beginPath();
    const n = pts.length;
    if (!closed) {
      c.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < n - 1; i++) {
        c.quadraticCurveTo(pts[i][0], pts[i][1], (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2);
      }
      c.lineTo(pts[n - 1][0], pts[n - 1][1]);
      return;
    }
    c.moveTo((pts[n - 1][0] + pts[0][0]) / 2, (pts[n - 1][1] + pts[0][1]) / 2);
    for (let i = 0; i < n; i++) {
      const p = pts[i];
      const q = pts[(i + 1) % n];
      c.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
    }
    c.closePath();
  }

  const jit = (pts, j, r) => pts.map(([x, y]) => [x + (r() - 0.5) * 2 * j, y + (r() - 0.5) * 2 * j]);

  function ellipsePts(cx, cy, rx, ry, n = 14) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
    }
    return out;
  }

  // Rectangle with extra points along the edges so it can wobble
  function rectPts(x, y, w, h, n = 4) {
    const out = [];
    const corners = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    for (let k = 0; k < 4; k++) {
      const a = corners[k];
      const b = corners[(k + 1) % 4];
      out.push(a, a); // doubled corner keeps it fairly sharp
      for (let i = 1; i < n; i++) out.push([a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n]);
    }
    return out;
  }

  function bbox(pts) {
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    pts.forEach(([x, y]) => {
      x0 = Math.min(x0, x);
      y0 = Math.min(y0, y);
      x1 = Math.max(x1, x);
      y1 = Math.max(y1, y);
    });
    return [x0, y0, x1, y1];
  }

  // Hair-fine pen line: one delicate stroke and a faint second one beside it
  function ink(c, pts, closed, r, w = 2, j = 1.2) {
    c.save();
    c.strokeStyle = INK;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.lineWidth = Math.max(0.7, w * 0.6);
    smoothPath(c, jit(pts, j * 0.3, r), closed);
    c.stroke();
    c.lineWidth = Math.max(0.4, w * 0.25);
    c.globalAlpha = 0.45;
    smoothPath(c, jit(pts, j * 0.9, r), closed);
    c.stroke();
    c.restore();
  }

  // Watercolour wash: see-through colour, a darker pooled edge and paper grain
  function flat(c, pts, color, r, j = 1.5) {
    const p = jit(pts, j, r);
    c.save();
    c.fillStyle = color;
    c.globalAlpha = 0.85;
    smoothPath(c, p, true);
    c.fill();
    c.globalAlpha = 0.35;
    c.strokeStyle = color;
    c.lineWidth = 2.2;
    c.stroke();
    c.globalAlpha = 1;
    c.clip();
    c.fillStyle = c.createPattern(grain, 'repeat');
    c.fillRect(-1000, -1000, 3000, 3000);
    c.restore();
    return p;
  }

  // Diagonal pen hatching that fades in from `from` (0 = left edge, 1 = right edge)
  function hatch(c, pts, r, gap = 4, from = 0.55, alpha = 0.6) {
    const [x0, y0, x1, y1] = bbox(pts);
    const h = y1 - y0;
    const sx = x0 + (x1 - x0) * from;
    c.save();
    smoothPath(c, pts, true);
    c.clip();
    c.strokeStyle = INK;
    c.lineWidth = 0.45;
    c.lineCap = 'round';
    for (let d = x0 - h; d < x1 + 2; d += gap) {
      const f = (d + h / 2 - sx) / (x1 - sx + 1) + 0.3;
      if (f <= 0) continue;
      c.globalAlpha = alpha * Math.min(1, f);
      const k = (r() - 0.5) * 1.4;
      c.globalAlpha *= 0.55;
      c.beginPath();
      c.moveTo(d + k, y1 + 2);
      c.lineTo(d + h + 4 + k, y0 - 2);
      c.moveTo(d + k, y0 - 2);
      c.lineTo(d + h + 4 + k, y1 + 2);
      c.stroke();
    }
    c.restore();
  }

  // Tiny ink dots inside a shape
  function stipple(c, pts, r, n, size = 0.8) {
    const [x0, y0, x1, y1] = bbox(pts);
    c.save();
    smoothPath(c, pts, true);
    c.clip();
    c.fillStyle = INK;
    c.globalAlpha = 0.5;
    for (let i = 0; i < n; i++) {
      c.beginPath();
      c.arc(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), size * (0.5 + r()), 0, Math.PI * 2);
      c.fill();
    }
    c.restore();
  }

  function spiral(c, x, y, rad, turns, r, w = 1.2) {
    const n = Math.max(4, Math.round(turns * 12));
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const a = (i / 12) * Math.PI * 2;
      const d = rad * (i / n);
      pts.push([x + Math.cos(a) * d, y + Math.sin(a) * d]);
    }
    ink(c, pts, false, r, w, 0.25);
  }

  function dot(c, x, y, rad, color) {
    c.fillStyle = color;
    c.beginPath();
    c.arc(x, y, rad, 0, Math.PI * 2);
    c.fill();
  }

  function label(c, text, x, y, rot, color = INK, size = 20) {
    c.save();
    c.translate(x, y);
    c.rotate(rot);
    c.font = KIRI.replace('20px', size + 'px');
    c.fillStyle = color;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(text, 0, 0);
    c.restore();
  }

  // Curly garden flower on a wiggly stem
  function curlPlant(c, x, y, h, color, r) {
    ink(c, [[x, y], [x + 4, y - h * 0.35], [x - 3, y - h * 0.7], [x, y - h]], false, r, 1.3, 0.5);
    const leaf = flat(c, [[x, y - h * 0.4], [x + 10, y - h * 0.55], [x + 2, y - h * 0.3]], ROHE, r, 0.6);
    ink(c, leaf, true, r, 0.9, 0.3);
    const p = flat(c, ellipsePts(x, y - h - 6, 8, 8, 10), color, r, 1);
    ink(c, p, true, r, 1.2, 0.4);
    spiral(c, x, y - h - 6, 6, 2, r, 0.9);
  }

  // ---------- Background (drawn once) ----------
  const bg = document.createElement('canvas');
  bg.width = bg.height = W * S;
  (() => {
    const b = bg.getContext('2d');
    b.scale(S, S);
    const r = rng(11);
    b.fillStyle = PABER;
    b.fillRect(0, 0, W, W);
    b.fillStyle = INK;
    for (let i = 0; i < 700; i++) {
      b.globalAlpha = 0.06 + r() * 0.1;
      b.beginPath();
      b.arc(r() * W, r() * W, 0.4 + r() * 0.8, 0, Math.PI * 2);
      b.fill();
    }
    b.globalAlpha = 1;
    b.fillStyle = b.createPattern(grain, 'repeat');
    b.fillRect(0, 0, W, W);

    // Round hills along the top edge, like the rim of a small planet
    for (let i = 0; i < 9; i++) {
      const cx = -20 + i * 95 + r() * 20;
      const hw = 50 + r() * 25;
      const hh = 26 + r() * 30;
      const hill = [];
      for (let k = 0; k <= 12; k++) {
        const a = Math.PI + (k / 12) * Math.PI;
        hill.push([cx + Math.cos(a) * hw, 46 + Math.sin(a) * hh]);
      }
      const p = flat(b, hill, [PUNANE, KORALL, ROHE][i % 3], r, 1);
      hatch(b, p, r, 4, 0.6, 0.5);
      ink(b, p, true, r, 1.4, 0.6);
      for (let s = 1; s <= 2; s++) {
        const q = 1 - s * 0.3;
        ink(b, hill.slice(2, 11).map(([hx, hy]) => [cx + (hx - cx) * q, 46 - (46 - hy) * q]), false, r, 0.8, 0.4);
      }
    }

    // House plan, traced from the Suvemäe school plan poster: one long corridor,
    // the gym on the left, a row of rooms below it and a small wing on top
    const PORAND = '#f6e7bd';
    const tuba = (x, y, w, h, fill) => {
      const p = flat(b, rectPts(x, y, w, h), fill, r, 1.5);
      hatch(b, p, r, 7, 0.8, 0.3);
      ink(b, p, true, r, 1.8, 0.8);
      return p;
    };
    const nimi = (t, x, y, rot = 0, size = 16) => label(b, t, x, y, rot, PUNANE, size);
    const sein = (pts) => ink(b, pts, false, r, 1.8, 0.6);

    // Yard in front of the house, where the chickens live
    const ou = flat(b, rectPts(14, 112, 692, 284), '#e3ebcc', r, 2);
    stipple(b, ou, r, 160, 0.5);
    [[60, 170, PUNANE], [210, 140, SINEP], [330, 200, KORALL], [470, 150, PUNANE], [688, 200, SINEP],
      [250, 330, KORALL], [40, 330, SINEP], [440, 350, PUNANE], [688, 360, KORALL]]
      .forEach(([x, y, col]) => curlPlant(b, x, y, 16, col, r));
    nimi('Õu', 290, 262, -0.05, 20);

    // The long corridor and the entrance porch
    const koridor = flat(b, rectPts(151, 400, 555, 84), PORAND, r, 1);
    stipple(b, koridor, r, 110, 0.5);
    ink(b, koridor, true, r, 1.8, 0.8);
    const eeskoda = flat(b, rectPts(110, 306, 57, 94), PORAND, r, 1);
    ink(b, eeskoda, true, r, 1.8, 0.6);

    tuba(14, 400, 137, 306, '#c6e0e4');     // Spordisaal
    tuba(151, 484, 124, 222, '#f7cdbd');    // Lastetuba
    tuba(275, 484, 220, 222, '#f6dc95');    // Suur tuba
    tuba(495, 484, 108, 222, '#c6e0e4');    // Loovtuba
    tuba(603, 484, 103, 222, '#ece3f2');    // WC and washroom
    tuba(532, 128, 71, 44, PORAND);         // small hall in the wing
    tuba(532, 172, 71, 228, '#f4b49d');     // Kohtumistuba
    tuba(603, 128, 60, 178, '#f6dc95');     // Lõpuklass
    tuba(603, 306, 60, 94, '#d9e6b8');      // Õpetajate tuba
    // Walls inside the WC block
    sein([[630, 540], [630, 706]]);
    sein([[630, 573], [667, 573]]);
    sein([[667, 484], [667, 706]]);

    // Doorways: gaps in the walls
    b.fillStyle = PORAND;
    [[138, 306], [138, 400], [567, 400], [633, 400], [567, 172], [188, 484], [406, 484], [538, 484], [616, 484]].forEach(([x, y]) => {
      b.fillRect(x - 12, y - 6, 24, 12);
      ink(b, [[x - 12, y - 7], [x - 12, y + 7]], false, r, 1.6, 0.3);
      ink(b, [[x + 12, y - 7], [x + 12, y + 7]], false, r, 1.6, 0.3);
    });
    b.fillStyle = PORAND;
    [[151, 442], [603, 150], [667, 640]].forEach(([x, y]) => {
      b.fillRect(x - 6, y - 12, 12, 24);
      ink(b, [[x - 7, y - 12], [x + 7, y - 12]], false, r, 1.6, 0.3);
      ink(b, [[x - 7, y + 12], [x + 7, y + 12]], false, r, 1.6, 0.3);
    });

    // Spordisaal: court lines, balls and a hoop
    ink(b, [[16, 553], [149, 553]], false, r, 1.2, 0.6);
    ink(b, ellipsePts(82, 553, 30, 30, 16), true, r, 1.2, 0.8);
    [[44, 465, PUNANE], [122, 620, SININE], [46, 640, SINEP]].forEach(([x, y, col]) => {
      const p = flat(b, ellipsePts(x, y, 12, 12, 12), col, r, 0.8);
      hatch(b, p, r, 3, 0.6, 0.5);
      ink(b, p, true, r, 1.4, 0.4);
      spiral(b, x, y, 6, 2, r, 0.9);
    });
    const korv = flat(b, rectPts(52, 690, 60, 8, 2), PUNANE, r, 0.5);
    ink(b, korv, true, r, 1.4, 0.3);
    for (let i = 0; i < 4; i++) ink(b, [[56 + i * 17, 690], [62 + i * 13, 668]], false, r, 0.8, 0.3);
    nimi('Spordisaal', 82, 424, -0.05);

    // Kohtumistuba: an oval table with chairs
    const kLaud = flat(b, ellipsePts(567, 305, 20, 34, 16), SINEP, r, 1.2);
    hatch(b, kLaud, r, 4, 0.55, 0.5);
    ink(b, kLaud, true, r, 1.6, 0.6);
    spiral(b, 567, 305, 8, 2, r, 1);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const p = flat(b, ellipsePts(567 + Math.cos(a) * 30, 305 + Math.sin(a) * 48, 8, 7, 10), [PUNANE, SININE, VALGE][i % 3], r, 0.8);
      ink(b, p, true, r, 1.2, 0.4);
    }
    nimi('Kohtumis-', 567, 200, 0, 12);
    nimi('tuba', 567, 215, 0, 12);

    // Lõpuklass: blackboard and desks
    const tahvel = flat(b, rectPts(611, 138, 44, 18, 3), '#2f3b36', r, 1);
    ink(b, tahvel, true, r, 1.4, 0.4);
    b.save();
    b.font = KIRI.replace('20px', '10px');
    b.fillStyle = 'rgba(255,255,255,.85)';
    b.fillText('2+3=5', 616, 151);
    b.restore();
    nimi('Lõpu-', 633, 178, 0, 12);
    nimi('klass', 633, 193, 0, 12);
    for (let i = 0; i < 2; i++) {
      for (let k = 0; k < 2; k++) {
        const lauda = flat(b, rectPts(610 + k * 26, 214 + i * 38, 20, 14, 2), SINEP, r, 0.8);
        hatch(b, lauda, r, 3, 0.6, 0.5);
        ink(b, lauda, true, r, 1.2, 0.4);
        const raamat = flat(b, rectPts(616 + k * 26, 217 + i * 38, 8, 7, 2), [PUNANE, SININE][(i + k) % 2], r, 0.4);
        ink(b, raamat, true, r, 0.9, 0.2);
      }
    }

    // Õpetajate tuba: table with cups
    nimi('Õpetajate', 633, 326, 0, 10);
    nimi('tuba', 633, 340, 0, 10);
    const oLaud = flat(b, rectPts(610, 358, 46, 22, 3), VALGE, r, 1);
    hatch(b, oLaud, r, 4, 0.5, 0.4);
    ink(b, oLaud, true, r, 1.4, 0.5);
    [620, 633, 646].forEach((x, i) => {
      const p = flat(b, rectPts(x - 4, 363, 8, 8, 2), [PUNANE, SINEP, SININE][i], r, 0.4);
      ink(b, p, true, r, 1, 0.2);
      ink(b, [[x, 360], [x - 2, 355], [x + 1, 350]], false, r, 0.8, 0.3);
    });

    // Corridor: the Suvemäe name in the house colours, and two potted plants
    const tahed = ['S', 'u', 'v', 'e', 'm', 'ä', 'e'];
    const varvid = [PUNANE, SININE, KORALL, ROHE, PUNANE, SININE, KORALL];
    tahed.forEach((t, i) => label(b, t, 332 + i * 22, 448 + Math.sin(i) * 4, (r() - 0.5) * 0.4, varvid[i], i === 0 ? 26 : 22));
    spiral(b, 312, 452, 6, 1.5, r, 1);
    spiral(b, 492, 452, 6, 1.5, r, 1);
    curlPlant(b, 172, 478, 18, PUNANE, r);
    curlPlant(b, 690, 478, 18, SINEP, r);

    // Lastetuba: toy blocks and a kite
    const klotsid = [PUNANE, SINEP, SININE, VALGE, ROHE, KORALL];
    for (let i = 0; i < 9; i++) {
      const x = 163 + (i % 3) * 26 + (i > 5 ? 13 : 0);
      const y = 684 - Math.floor(i / 3) * 19;
      const p = flat(b, rectPts(x, y, 24, 18, 2), klotsid[i % 6], r, 0.8);
      hatch(b, p, r, 2.5, 0.6, 0.5);
      ink(b, p, true, r, 1.2, 0.4);
    }
    const tuulelohe = flat(b, [[240, 535], [262, 565], [240, 605], [218, 565]], KORALL, r, 1.5);
    hatch(b, tuulelohe, r, 3.5, 0.5, 0.5);
    ink(b, tuulelohe, true, r, 1.5, 0.5);
    ink(b, [[240, 537], [240, 603]], false, r, 0.9, 0.3);
    ink(b, [[220, 565], [260, 565]], false, r, 0.9, 0.3);
    ink(b, [[240, 605], [232, 617], [246, 627]], false, r, 1.2, 1);
    spiral(b, 248, 632, 5, 1.6, r, 1);
    nimi('Lastetuba', 213, 506, -0.04);

    // Suur tuba: the Suvemäe circle with cushions
    const ring = flat(b, ellipsePts(385, 605, 80, 72, 22), '#f4b49d', r, 3);
    hatch(b, ring, r, 5, 0.65, 0.45);
    stipple(b, ring, r, 100, 0.7);
    ink(b, ring, true, r, 1.8, 1.2);
    const paike = flat(b, ellipsePts(385, 605, 22, 22, 14), SINEP, r, 1);
    ink(b, paike, true, r, 1.5, 0.5);
    spiral(b, 385, 605, 15, 2.5, r, 1.2);
    const padjad = [PUNANE, SINEP, SININE, VALGE, ROHE, KORALL];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const p = flat(b, ellipsePts(385 + Math.cos(a) * 56, 605 + Math.sin(a) * 50, 12, 10, 10), padjad[i % 6], r, 1);
      hatch(b, p, r, 3, 0.55, 0.5);
      ink(b, p, true, r, 1.4, 0.5);
    }
    nimi('Suur tuba', 385, 506, 0.03);

    // Loovtuba: an easel with a curly painting and a palette
    ink(b, [[531, 640], [549, 540], [567, 640]], false, r, 1.6, 0.4);
    const molbert = flat(b, rectPts(522, 548, 54, 48, 3), VALGE, r, 1);
    ink(b, molbert, true, r, 1.5, 0.5);
    dot(b, 538, 564, 6, PUNANE);
    dot(b, 558, 576, 8, SINEP);
    dot(b, 542, 586, 4, SININE);
    spiral(b, 558, 576, 6, 2, r, 0.9);
    const palett = flat(b, ellipsePts(549, 672, 32, 16, 14), '#e7c79a', r, 1);
    ink(b, palett, true, r, 1.4, 0.5);
    [[535, 668, PUNANE], [548, 663, SININE], [562, 669, SINEP], [553, 680, ROHE]].forEach(([x, y, col]) => dot(b, x, y, 4, col));
    nimi('Loovtuba', 549, 506, -0.03);

    // WC: a toilet and a sink
    label(b, 'WC', 648, 600, 0, PUNANE, 16);
    const pott = flat(b, ellipsePts(648, 668, 11, 14, 12), VALGE, r, 0.6);
    ink(b, pott, true, r, 1.4, 0.4);
    const kraanikauss = flat(b, rectPts(674, 498, 26, 16, 3), '#b9c4c9', r, 0.8);
    ink(b, kraanikauss, true, r, 1.3, 0.4);
    dot(b, 687, 506, 4, SININE);

    // Crochet-lace border: a chain of small loops with dots, rosettes in the corners
    b.save();
    b.strokeStyle = INK;
    b.fillStyle = INK;
    b.lineWidth = 0.7;
    b.globalAlpha = 0.75;
    const loop = (x, y, a) => {
      b.beginPath();
      b.arc(x, y, 5, a, a + Math.PI);
      b.stroke();
      b.beginPath();
      b.arc(x + Math.cos(a + Math.PI / 2) * 2.5, y + Math.sin(a + Math.PI / 2) * 2.5, 0.9, 0, Math.PI * 2);
      b.fill();
    };
    for (let x = 18; x < W - 12; x += 10) { loop(x, 4, 0); loop(x, W - 4, Math.PI); }
    for (let y = 18; y < W - 12; y += 10) { loop(4, y, -Math.PI / 2); loop(W - 4, y, Math.PI / 2); }
    [[9, 9], [W - 9, 9], [9, W - 9], [W - 9, W - 9]].forEach(([x, y]) => {
      for (let k = 0; k < 8; k++) {
        const a = k * Math.PI / 4;
        b.beginPath();
        b.ellipse(x + Math.cos(a) * 4, y + Math.sin(a) * 4, 3.2, 1.6, a, 0, Math.PI * 2);
        b.stroke();
      }
      b.beginPath();
      b.arc(x, y, 1.4, 0, Math.PI * 2);
      b.fill();
    });
    b.restore();
  })();

  // ---------- Characters ----------
  // Round, pear-shaped people with big eyes and long noses, drawn in scratchy ink
  function drawPattern(c, kind, color) {
    c.save();
    c.strokeStyle = color;
    c.fillStyle = color;
    c.lineWidth = 2.2;
    if (kind === 'triibud') {
      for (let y = -64; y < -8; y += 7) {
        c.beginPath();
        c.moveTo(-26, y);
        c.quadraticCurveTo(0, y + 3, 26, y);
        c.stroke();
      }
    } else if (kind === 'tapid') {
      for (let y = -60; y < -10; y += 8) for (let x = -24; x < 26; x += 8) dot(c, x + (y % 16 ? 4 : 0), y, 2, color);
    } else if (kind === 'ruudud') {
      c.lineWidth = 1.4;
      for (let x = -26; x < 26; x += 8) { c.beginPath(); c.moveTo(x, -66); c.lineTo(x, -8); c.stroke(); }
      for (let y = -64; y < -8; y += 8) { c.beginPath(); c.moveTo(-26, y); c.lineTo(26, y); c.stroke(); }
    } else if (kind === 'lilled') {
      for (let y = -56; y < -12; y += 13) for (let x = -20; x < 24; x += 12) {
        for (let i = 0; i < 4; i++) dot(c, x + Math.cos(i * 1.57) * 2.6, y + Math.sin(i * 1.57) * 2.6, 1.8, color);
      }
    }
    c.restore();
  }

  function drawHair(c, o, r) {
    const h = o.hair;
    const col = o.hairColor;
    let pts;
    if (h === 'bob') pts = [[-16, -68], [-17, -86], [-9, -95], [6, -95], [16, -87], [17, -68], [12, -80], [-12, -80]];
    else if (h === 'spiky') pts = [[-15, -80], [-17, -91], [-11, -89], [-9, -100], [-3, -92], [1, -103], [5, -92], [11, -99], [12, -89], [17, -90], [15, -80], [0, -86]];
    else pts = [[-15, -78], [-13, -91], [-3, -96], [8, -95], [14, -89], [15, -78], [3, -86], [-6, -85]];
    const p = flat(c, pts, col, r, 0.6);
    hatch(c, p, r, 2.6, 0.3, 0.5);
    ink(c, p, true, r, 1.3, 0.35);
    if (h === 'pats') {
      [-18, 18].forEach((x) => {
        const q = flat(c, ellipsePts(x, -72, 5, 7, 8), col, r, 0.5);
        ink(c, q, true, r, 1.1, 0.3);
      });
    } else if (h === 'bun') {
      const q = flat(c, ellipsePts(0, -98, 8, 6, 10), col, r, 0.5);
      ink(c, q, true, r, 1.1, 0.3);
      spiral(c, 0, -98, 5, 2, r, 0.8);
    } else if (h === 'curly') {
      for (let i = 0; i < 7; i++) {
        const a = Math.PI + (i / 6) * Math.PI;
        const cx = Math.cos(a) * 13;
        const cy = -80 + Math.sin(a) * 13;
        const q = flat(c, ellipsePts(cx, cy, 5.5, 5.5, 8), col, r, 0.4);
        ink(c, q, true, r, 1, 0.3);
        spiral(c, cx, cy, 3.5, 1.5, r, 0.6);
      }
    }
    // one curl sticking up
    if (h !== 'bun') ink(c, [[2, -94], [0, -100], [5, -103], [8, -100], [5, -98]], false, r, 1.2, 0.3);
  }

  function makeSprite(o) {
    const w = 76;
    const h = 130;
    const c = document.createElement('canvas');
    c.width = w * S;
    c.height = h * S;
    const x = c.getContext('2d');
    x.scale(S, S);
    const r = rng(o.seed);
    x.translate(w / 2, h - 6);
    if (o.teacher) x.scale(1.18, 1.18);

    // thin legs and small black shoes
    ink(x, [[-7, -14], [-7, -3]], false, r, 1.8, 0.4);
    ink(x, [[7, -14], [7, -3]], false, r, 1.8, 0.4);
    x.fillStyle = INK;
    x.beginPath(); x.ellipse(-9, -2, 6, 3, 0, 0, Math.PI * 2); x.fill();
    x.beginPath(); x.ellipse(10, -2, 6, 3, 0, 0, Math.PI * 2); x.fill();

    // round, pear-shaped body with a pattern and hatched shade
    const body = [[0, -63], [11, -60], [19, -48], [23, -32], [21, -18], [12, -11], [0, -10], [-12, -11], [-21, -18], [-23, -32], [-19, -48], [-11, -60]];
    const bp = flat(x, body, o.coat, r, 0.6);
    x.save();
    smoothPath(x, bp, true);
    x.clip();
    x.globalAlpha = 0.85;
    drawPattern(x, o.pattern, o.patColor);
    x.restore();
    hatch(x, bp, r, 3, 0.55, 0.55);
    ink(x, bp, true, r, 1.8, 0.4);

    // short arms with round hands
    ink(x, [[-20, -42], [-27, -33], [-27, -26]], false, r, 1.8, 0.4);
    ink(x, [[20, -42], [27, -33], [27, -26]], false, r, 1.8, 0.4);
    [-27, 27].forEach((hx) => {
      const p = flat(x, ellipsePts(hx, -24, 3.6, 3.6, 8), o.skin, r, 0.3);
      ink(x, p, true, r, 1, 0.2);
    });

    if (o.scarf) {
      const s = flat(x, [[-12, -66], [12, -66], [13, -59], [-13, -59]], o.scarf, r, 0.5);
      ink(x, s, true, r, 1.1, 0.3);
      const t = flat(x, [[5, -60], [11, -60], [13, -44], [7, -45]], o.scarf, r, 0.5);
      hatch(x, t, r, 2.5, 0.3, 0.5);
      ink(x, t, true, r, 1.1, 0.3);
    }
    if (o.book) {
      const k = flat(x, [[14, -36], [27, -38], [28, -23], [15, -21]], o.book, r, 0.5);
      hatch(x, k, r, 2.5, 0.5, 0.5);
      ink(x, k, true, r, 1.2, 0.3);
    }

    // head
    const head = flat(x, ellipsePts(0, -78, 14, 15, 14), o.skin, r, 0.5);
    hatch(x, head, r, 2.8, 0.7, 0.35);
    ink(x, head, true, r, 1.5, 0.35);
    drawHair(x, o, r);
    if (o.beard) {
      const bd = flat(x, [[-13, -76], [-11, -66], [-4, -61], [2, -60], [8, -62], [13, -68], [13, -76], [7, -70], [-6, -70]], o.hairColor, r, 0.5);
      hatch(x, bd, r, 2.4, 0.2, 0.5);
      ink(x, bd, true, r, 1.1, 0.3);
    } else {
      x.save();
      x.strokeStyle = INK;
      x.lineWidth = 1.2;
      x.beginPath();
      x.arc(-3, -70, 3.2, 0.3, Math.PI - 0.3);
      x.stroke();
      x.restore();
      dot(x, -9, -72, 3, 'rgba(216,49,43,.35)');
    }
    // big round eyes looking forward
    [[-4, -81], [5, -81]].forEach(([ex, ey]) => {
      const e = flat(x, ellipsePts(ex, ey, 3.8, 4.6, 10), VALGE, r, 0.2);
      ink(x, e, true, r, 1, 0.15);
      dot(x, ex + 1.3, ey + 0.8, 1.6, INK);
    });
    // long nose
    const nose = flat(x, [[2, -78], [7, -77], [15, -71], [13, -68], [5, -71]], o.skin, r, 0.3);
    ink(x, nose, true, r, 1.2, 0.2);
    dot(x, 13, -69.5, 1.6, 'rgba(216,49,43,.5)');
    if (o.glasses) {
      x.save();
      x.strokeStyle = INK;
      x.lineWidth = 1.2;
      x.beginPath(); x.arc(-4, -81, 5.5, 0, Math.PI * 2); x.stroke();
      x.beginPath(); x.arc(5, -81, 5.5, 0, Math.PI * 2); x.stroke();
      x.restore();
    }
    if (o.hat) {
      // tall wavy hat with a pompom
      const p = flat(x, [[-14, -86], [14, -86], [9, -92], [11, -100], [5, -106], [8, -112], [1, -118], [-2, -111], [-6, -104], [-5, -96], [-10, -92]], o.hat, r, 0.5);
      hatch(x, p, r, 2.6, 0.5, 0.55);
      ink(x, p, true, r, 1.3, 0.3);
      const brim = flat(x, ellipsePts(0, -87, 17, 4, 12), o.hat, r, 0.3);
      ink(x, brim, true, r, 1.2, 0.2);
      const pom = flat(x, ellipsePts(1, -118, 3.5, 3.5, 8), SINEP, r, 0.2);
      ink(x, pom, true, r, 1, 0.2);
    }
    return c;
  }

  const TEGELASED = [
    { name: 'Mia', coat: PUNANE, pattern: 'triibud', patColor: VALGE, hair: 'pats', hairColor: '#3b2a20', skin: '#f2d3b8' },
    { name: 'Uku', coat: SININE, pattern: 'ruudud', patColor: SINEP, hair: 'spiky', hairColor: '#d99a2b', skin: '#e8c4a0' },
    { name: 'Lumi', coat: VALGE, pattern: 'tapid', patColor: PUNANE, hair: 'bob', hairColor: INK, skin: '#c99a72' },
    { name: 'Sass', coat: ROHE, pattern: 'triibud', patColor: SINEP, hair: 'curly', hairColor: '#5a3a22', skin: '#8d5e3c' },
    { name: 'Iris', coat: KORALL, pattern: 'tapid', patColor: VALGE, hair: 'bun', hairColor: '#b5562f', skin: '#f5dcc6' },
    { name: 'Andri', coat: SINEP, pattern: 'triibud', patColor: PUNANE, hair: 'spiky', hairColor: INK, skin: '#e9c9a6', hat: PUNANE },
    { name: 'Ruta', teacher: true, aine: 'inglise keel, ühiskonnaõpetuse ja kirjanduse teemad, saksa keel', coat: PUNANE, pattern: 'tapid', patColor: VALGE, hair: 'bob', hairColor: '#e3c27a', skin: '#f3d9c2', scarf: SINEP, book: SININE },
    { name: 'Teilo', teacher: true, aine: 'loodusõpetus, bioloogia, geograafia, inimeseõpetus', coat: ROHE, pattern: 'ruudud', patColor: VALGE, hair: 'spiky', hairColor: '#e0c07a', skin: '#efcfb0', glasses: true },
    { name: 'Rabin', teacher: true, aine: 'inglise keel, matemaatika, füüsika', coat: SININE, pattern: 'ruudud', patColor: SINEP, hair: 'short', hairColor: '#1f1a17', skin: '#a8714a', book: SINEP },
    { name: 'Natalja', teacher: true, aine: 'kunst, tehnoloogia, Eesti loodus', coat: KORALL, pattern: 'lilled', patColor: VALGE, hair: 'bun', hairColor: '#2b2622', skin: '#f0d2b6', scarf: SININE },
    { name: 'Säde', teacher: true, aine: 'inglise keel, kunst, algklassid', coat: SININE, pattern: 'lilled', patColor: KORALL, hair: 'pats', hairColor: '#e8cc85', skin: '#f5dcc6', book: PUNANE },
    { name: 'Marili', teacher: true, aine: 'algklassiõpetaja', coat: SINEP, pattern: 'tapid', patColor: PUNANE, hair: 'curly', hairColor: '#3b2a20', skin: '#e8c4a0', glasses: true },
    { name: 'Mihkel', teacher: true, aine: 'inglise keel, kunst, ajalugu, eesti keel', coat: VALGE, pattern: 'triibud', patColor: SININE, hair: 'short', hairColor: '#2b2622', skin: '#e9c9a6' },
  ];

  const SPAWN = [[80, 470], [210, 600], [380, 560], [540, 640], [300, 440], [460, 440], [570, 330], [630, 250], [120, 650], [430, 670], [650, 440], [230, 520], [560, 560]];

  // Floor areas inside the house where people walk around and litter shows up (x, y, w, h)
  const ALAD = [[30, 430, 105, 260], [170, 415, 520, 55], [170, 520, 510, 170], [545, 230, 45, 150], [615, 205, 40, 90]];
  function spot() {
    const [x, y, w, h] = ALAD[Math.floor(Math.random() * ALAD.length)];
    return [x + Math.random() * w, y + Math.random() * h];
  }

  const npcs = TEGELASED.map((o, i) => ({
    ...o,
    label: o.teacher ? 'Õpetaja ' + o.name : o.name,
    sprite: makeSprite({ ...o, seed: 100 + i * 17 }),
    x: SPAWN[i][0], y: SPAWN[i][1],
    tx: SPAWN[i][0], ty: SPAWN[i][1],
    wait: Math.random() * 2,
    moving: false,
    phase: Math.random() * 6,
    event: null,
    cooldown: 0,
  }));

  const player = {
    name: 'sina', isPlayer: true,
    sprite: makeSprite({ seed: 999, coat: PUNANE, pattern: 'tapid', patColor: VALGE, hair: 'curly', hairColor: '#3b2a20', skin: '#f0cfae', scarf: SINEP }),
    x: 360, y: 450, moving: false, phase: 0,
  };

  // Litter sprites
  function makeLitter(kind, seed) {
    const c = document.createElement('canvas');
    c.width = c.height = 30 * S;
    const x = c.getContext('2d');
    x.scale(S, S);
    x.translate(15, 15);
    const r = rng(seed);
    if (kind === 0) {
      const p = flat(x, ellipsePts(0, 0, 9, 8, 9), VALGE, r, 2);
      hatch(x, p, r, 2.5, 0.5, 0.6);
      ink(x, p, true, r, 1.2, 0.5);
      ink(x, [[-5, -2], [0, 3], [4, -3], [2, 4]], false, r, 0.8, 0.5);
    } else if (kind === 1) {
      const p = flat(x, [[-11, -6], [-3, -1], [3, -1], [11, -6], [11, 6], [3, 1], [-3, 1], [-11, 6]], PUNANE, r, 0.8);
      ink(x, p, true, r, 1, 0.3);
      dot(x, 0, 0, 3, SINEP);
    } else {
      const p = flat(x, rectPts(-5, -10, 10, 20, 2), SININE, r, 0.4);
      hatch(x, p, r, 2.2, 0.5, 0.6);
      ink(x, p, true, r, 1, 0.3);
      ink(x, [[-5, -6], [5, -6]], false, r, 0.8, 0.2);
      ink(x, [[-5, 6], [5, 6]], false, r, 0.8, 0.2);
    }
    return c;
  }
  const litterSprites = [0, 1, 2].map((k) => makeLitter(k, 50 + k));

  // ---------- Chickens in the garden ----------
  function makeChicken(body, seed) {
    const c = document.createElement('canvas');
    c.width = 44 * S;
    c.height = 40 * S;
    const x = c.getContext('2d');
    x.scale(S, S);
    x.translate(20, 37);
    const r = rng(seed);
    ink(x, [[-3, -7], [-4, -1]], false, r, 1.3, 0.2);
    ink(x, [[4, -7], [5, -1]], false, r, 1.3, 0.2);
    ink(x, [[-8, 0], [-4, -1], [-1, 0]], false, r, 1, 0.2);
    ink(x, [[1, 0], [5, -1], [8, 0]], false, r, 1, 0.2);
    const tail = flat(x, [[-11, -16], [-19, -30], [-14, -27], [-16, -34], [-8, -22]], PUNANE, r, 0.5);
    ink(x, tail, true, r, 1, 0.2);
    const bodyP = flat(x, ellipsePts(0, -16, 14, 10, 14), body, r, 0.6);
    hatch(x, bodyP, r, 3, 0.5, 0.5);
    ink(x, bodyP, true, r, 1.4, 0.3);
    spiral(x, -1, -16, 5, 1.8, r, 0.9);
    const head = flat(x, ellipsePts(11, -26, 6.5, 6.5, 10), body, r, 0.3);
    ink(x, head, true, r, 1.2, 0.2);
    const comb = flat(x, [[7, -31], [8, -36], [10, -33], [12, -37], [14, -32], [15, -31]], PUNANE, r, 0.3);
    ink(x, comb, true, r, 0.9, 0.2);
    const beak = flat(x, [[17, -27], [23, -25], [17, -23]], SINEP, r, 0.2);
    ink(x, beak, true, r, 0.9, 0.1);
    dot(x, 12.5, -27, 1.4, INK);
    return c;
  }

  const kanad = [VALGE, SINEP, VALGE, '#f3c9a0'].map((col, i) => ({
    kana: true,
    sprite: makeChicken(col, 300 + i * 7),
    x: 60 + i * 120, y: 220 + (i % 2) * 70,
    tx: 60 + i * 120, ty: 220,
    wait: Math.random() * 2,
    moving: false, phase: 0, dir: 1, flee: 0,
  }));

  // Chickens peck around and run off when you come too close
  function updateKanad(dt) {
    kanad.forEach((k) => {
      k.flee = Math.max(0, k.flee - dt);
      if (running && Math.hypot(k.x - player.x, k.y - player.y) < 55) {
        const a = Math.atan2(k.y - player.y, k.x - player.x);
        // they stay in the yard in front of the house
        k.tx = Math.max(30, Math.min(510, k.x + Math.cos(a) * 90));
        k.ty = Math.max(150, Math.min(385, k.y + Math.sin(a) * 90));
        k.wait = 0;
        k.flee = 0.8;
      }
      if (k.wait > 0) { k.wait -= dt; k.moving = false; return; }
      if (stepToward(k, k.tx, k.ty, k.flee ? 130 : 45, dt)) {
        k.wait = 1 + Math.random() * 3;
        k.tx = 30 + Math.random() * 480;
        k.ty = 150 + Math.random() * 230;
      }
      if (k.moving) k.phase += dt * 14;
    });
  }

  // ---------- State ----------
  let running = false;
  let paused = false;
  let hearts = 0;
  let pool = [];
  let litter = [];
  let litterSpawned = 0;
  let litterTimer = 5;
  let eventTimer = 1;
  let stickers = new Set();
  let startTime = 0;
  let target = null;
  const keys = new Set();
  let current = null;
  let lahendatud = false;
  let toastTimer = 0;

  // ---------- Sound (starts after the first click) ----------
  let audio = null;
  function tone(freq, dur, type = 'sine', vol = 0.12, delay = 0) {
    if (!audio) return;
    const t = audio.currentTime + delay;
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(audio.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }
  const soundGood = () => { tone(660, 0.14); tone(880, 0.2, 'sine', 0.12, 0.1); tone(1100, 0.25, 'sine', 0.1, 0.2); };
  const soundBad = () => { tone(260, 0.22, 'triangle', 0.12); tone(200, 0.3, 'triangle', 0.1, 0.15); };
  const soundPop = () => tone(520, 0.09, 'square', 0.05);
  const soundBell = () => tone(990, 0.12, 'sine', 0.06);

  // ---------- UI ----------
  function toast(text) {
    $('teade').textContent = text;
    toastTimer = 3;
  }

  function setHearts(n) {
    hearts = n;
    $('sudamed').textContent = String(n);
  }

  function startGame() {
    if (!audio) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audio = new AC();
    }
    setHearts(0);
    pool = shuffle(OLUKORRAD.slice());
    litter = [];
    litterSpawned = 0;
    litterTimer = 6;
    eventTimer = 1;
    stickers = new Set();
    player.x = 360;
    player.y = 450;
    target = null;
    npcs.forEach((n) => { n.event = null; n.cooldown = 0; });
    $('algus').classList.add('peidus');
    $('lopp').classList.add('peidus');
    $('dialoog').classList.add('peidus');
    running = true;
    paused = false;
    startTime = performance.now();
    toast('Otsi kedagi, kellel on ! pea kohal.');
  }

  function openDialog(npc) {
    paused = true;
    target = null;
    keys.clear();
    current = npc;
    const s = npc.event;
    const fill = (t) => t.split('{nimi}').join(npc.name);
    $('kes').textContent = npc.label;
    $('jutt').textContent = fill(s.tekst);
    lahendatud = false;
    const box = $('valikud');
    box.textContent = '';
    // The player writes their own answer; the ready-made choices are a helping hand
    const vorm = document.createElement('form');
    vorm.className = 'vastus';
    const sisend = document.createElement('textarea');
    sisend.rows = 2;
    sisend.maxLength = 200;
    sisend.placeholder = 'Kirjuta, mida sa ütled või teed…';
    sisend.setAttribute('aria-label', 'Sinu vastus');
    const vasta = document.createElement('button');
    vasta.type = 'submit';
    vasta.className = 'vasta';
    vasta.textContent = 'Vasta';
    vorm.append(sisend, vasta);
    vorm.addEventListener('submit', (e) => { e.preventDefault(); kontrolli(sisend.value); });
    sisend.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); kontrolli(sisend.value); }
    });
    const abi = document.createElement('button');
    abi.type = 'button';
    abi.className = 'abi';
    abi.textContent = 'Ei tea? Näita valikuid';
    abi.addEventListener('click', () => {
      abi.remove();
      const nupud = document.createElement('div');
      nupud.className = 'valikud';
      shuffle(s.valikud.slice()).forEach(([t, ok]) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = fill(t);
        btn.dataset.ok = ok ? '1' : '';
        btn.addEventListener('click', () => choose(ok));
        nupud.appendChild(btn);
      });
      box.appendChild(nupud);
    });
    box.append(vorm, abi);
    $('tagasiside').classList.add('peidus');
    $('reegel').classList.add('peidus');
    $('edasi').classList.add('peidus');
    $('dialoog').classList.remove('peidus');
    $('dialoog').scrollTop = 0;
    if (window.matchMedia('(pointer: fine)').matches) sisend.focus();
  }

  function lukusta() {
    $('valikud').querySelectorAll('button, textarea').forEach((b) => {
      b.disabled = true;
      if (b.dataset.ok) b.classList.add('oige');
    });
  }

  function naitaReeglit(s) {
    $('reegel').textContent = 'Kokkulepe: ' + s.reegel;
    $('reegel').classList.remove('peidus');
    $('edasi').classList.remove('peidus');
  }

  function kiida(s) {
    lahendatud = true;
    setHearts(hearts + 1);
    stickers.add(s.reegel);
    $('tagasiside').textContent = '♥ Super! ' + s.miks;
    $('tagasiside').className = 'tagasiside hea';
    soundGood();
  }

  // A typed answer: a heart when it fits, otherwise a kind hint and another try
  function kontrolli(text) {
    if (lahendatud || !current) return;
    const s = current.event;
    const fb = $('tagasiside');
    const tulemus = hinda(text, s, current.name);
    if (tulemus === 'tyhi') {
      fb.textContent = 'Kirjuta enne oma vastus.';
      fb.className = 'tagasiside';
      return;
    }
    if (tulemus === 'hea') {
      lukusta();
      kiida(s);
    } else if (tulemus === 'halb') {
      fb.textContent = 'Hmm, see pole hea tahte moodi. ' + s.miks + ' Proovi uuesti!';
      fb.className = 'tagasiside halb';
      soundBad();
    } else {
      fb.textContent = 'Ma ei saanud päris aru. Kirjuta, mida sa teed või ütled. Vihje: ' + s.miks;
      fb.className = 'tagasiside halb';
      soundPop();
    }
    naitaReeglit(s);
  }

  // A ready-made choice: one try only
  function choose(ok) {
    if (lahendatud) return;
    const s = current.event;
    lukusta();
    if (ok) {
      kiida(s);
    } else {
      lahendatud = true;
      pool.push(s); // it may come back later
      $('tagasiside').textContent = 'Hmm, mitte päris. ' + s.miks;
      $('tagasiside').className = 'tagasiside halb';
      soundBad();
    }
    naitaReeglit(s);
  }

  function closeDialog() {
    $('dialoog').classList.add('peidus');
    if (current) {
      if (!lahendatud) pool.push(current.event); // skipped: it may come back later
      current.event = null;
      current.cooldown = 4;
      current = null;
    }
    paused = false;
    if (hearts >= EESMARK) endGame();
  }

  function endGame() {
    running = false;
    const sek = Math.round((performance.now() - startTime) / 1000);
    let parim = null;
    try {
      parim = Number(localStorage.getItem('hea-tahte-parim')) || null;
      if (!parim || sek < parim) { localStorage.setItem('hea-tahte-parim', String(sek)); parim = sek; }
    } catch (e) { /* storage may be blocked */ }
    $('lopujutt').textContent = 'Kogusid ' + EESMARK + ' südant ' + sek + ' sekundiga.' +
      (parim ? ' Sinu parim aeg: ' + parim + ' s.' : '') + ' Suvemäe on sinu abiga veel parem koht!';
    const ul = $('kleepsud');
    ul.textContent = '';
    stickers.forEach((t) => { const li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
    $('lopp').classList.remove('peidus');
    soundGood();
    tone(1320, 0.4, 'sine', 0.08, 0.35);
  }

  $('alusta').addEventListener('click', startGame);
  $('uuesti').addEventListener('click', startGame);
  $('edasi').addEventListener('click', closeDialog);

  // ---------- Input ----------
  function toWorld(e) {
    const rect = cv.getBoundingClientRect();
    return [(e.clientX - rect.left) / rect.width * W, (e.clientY - rect.top) / rect.height * W];
  }
  let pointerDown = false;
  function aim(e) {
    const [x, y] = toWorld(e);
    const hit = npcs.find((n) => n.event && Math.hypot(n.x - x, n.y - 50 - y) < 45);
    target = hit || { x, y };
  }
  cv.addEventListener('pointerdown', (e) => {
    if (!running || paused) return;
    pointerDown = true;
    try { cv.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    aim(e);
  });
  cv.addEventListener('pointermove', (e) => { if (pointerDown && running && !paused) aim(e); });
  const up = () => { pointerDown = false; };
  cv.addEventListener('pointerup', up);
  cv.addEventListener('pointercancel', up);

  const KEYMAP = { ArrowUp: 'u', ArrowDown: 'd', ArrowLeft: 'l', ArrowRight: 'r', w: 'u', s: 'd', a: 'l', d: 'r', W: 'u', S: 'd', A: 'l', D: 'r' };
  window.addEventListener('keydown', (e) => {
    const k = KEYMAP[e.key];
    if (!k || !running || paused) return;
    keys.add(k);
    target = null;
    e.preventDefault();
  });
  window.addEventListener('keyup', (e) => { const k = KEYMAP[e.key]; if (k) keys.delete(k); });

  // ---------- Update ----------
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function stepToward(o, tx, ty, speed, dt) {
    const dx = tx - o.x;
    const dy = ty - o.y;
    const d = Math.hypot(dx, dy);
    if (d < 2) { o.moving = false; return true; }
    const s = Math.min(d, speed * dt);
    o.x += dx / d * s;
    o.y += dy / d * s;
    o.moving = true;
    o.dir = dx < 0 ? -1 : 1;
    return false;
  }

  function update(dt) {
    // player
    let kx = 0;
    let ky = 0;
    if (keys.has('l')) kx -= 1;
    if (keys.has('r')) kx += 1;
    if (keys.has('u')) ky -= 1;
    if (keys.has('d')) ky += 1;
    if (kx || ky) {
      const d = Math.hypot(kx, ky);
      player.x += kx / d * 170 * dt;
      player.y += ky / d * 170 * dt;
      player.moving = true;
    } else if (target) {
      if (stepToward(player, target.x, target.y, 170, dt)) target = null;
    } else {
      player.moving = false;
    }
    player.x = clamp(player.x, 22, W - 22);
    player.y = clamp(player.y, 120, W - 8);
    if (player.moving) player.phase += dt * 11;

    // npcs wander, but stand still while they need help
    npcs.forEach((n) => {
      n.cooldown = Math.max(0, n.cooldown - dt);
      if (n.event) { n.moving = false; return; }
      if (n.wait > 0) { n.wait -= dt; n.moving = false; return; }
      if (stepToward(n, n.tx, n.ty, 38, dt)) {
        n.wait = 1 + Math.random() * 3;
        [n.tx, n.ty] = spot();
      }
      if (n.moving) n.phase += dt * 8;
    });

    // new situations
    eventTimer -= dt;
    const active = npcs.filter((n) => n.event).length;
    if (eventTimer <= 0 && active < 2) {
      eventTimer = 2.5 + Math.random() * 2.5;
      if (!pool.length && !active) pool = shuffle(OLUKORRAD.slice());
      for (let i = 0; i < pool.length; i++) {
        const s = pool[i];
        const free = npcs.filter((n) => !n.event && !n.cooldown && !!n.teacher === (s.kes === 'opetaja') &&
          Math.hypot(n.x - player.x, n.y - player.y) > 90);
        if (free.length) {
          const n = free[Math.floor(Math.random() * free.length)];
          n.event = s;
          pool.splice(i, 1);
          soundBell();
          break;
        }
      }
    }

    // talk when close enough
    const near = npcs.find((n) => n.event && Math.hypot(n.x - player.x, n.y - player.y) < 46);
    if (near) { openDialog(near); return; }

    // litter
    litterTimer -= dt;
    if (litterTimer <= 0 && litterSpawned < MAX_PRAHT) {
      litterTimer = 7 + Math.random() * 6;
      litterSpawned++;
      const [lx, ly] = spot();
      litter.push({ x: lx, y: ly, kind: Math.floor(Math.random() * 3), rot: Math.random() * 6 });
    }
    for (let i = litter.length - 1; i >= 0; i--) {
      const l = litter[i];
      if (Math.hypot(l.x - player.x, l.y - (player.y - 6)) < 28) {
        litter.splice(i, 1);
        setHearts(hearts + 1);
        stickers.add('Minu Maa');
        soundPop();
        toast('♥ Korjasid prahi ära! Minu Maa: hoiame keskkonna puhta.');
        if (hearts >= EESMARK) endGame();
      }
    }
  }

  // ---------- Draw ----------
  function drawChar(o, t) {
    if (o.kana) {
      const hop = o.moving ? -Math.abs(Math.sin(o.phase)) * 3 : 0;
      ctx.save();
      ctx.fillStyle = 'rgba(28,24,21,.16)';
      ctx.beginPath();
      ctx.ellipse(o.x, o.y - 1, 12, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.translate(o.x, o.y + hop);
      if (o.dir === -1) ctx.scale(-1, 1);
      ctx.drawImage(o.sprite, -20, -37, 44, 40);
      ctx.restore();
      return;
    }
    const bob = o.moving ? -Math.abs(Math.sin(o.phase)) * 4 : Math.sin(t * 2 + (o.phase || 0)) * 0.6;
    const tilt = o.moving ? Math.sin(o.phase) * 0.06 : 0;
    ctx.save();
    ctx.fillStyle = 'rgba(28,24,21,.16)';
    ctx.beginPath();
    ctx.ellipse(o.x, o.y - 2, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.translate(o.x, o.y + bob);
    ctx.rotate(tilt);
    if (o.dir === -1) ctx.scale(-1, 1);
    ctx.drawImage(o.sprite, -38, -124, 76, 130);
    ctx.restore();

    ctx.save();
    ctx.font = KIRI.replace('20px', o.isPlayer ? '15px' : '12px');
    ctx.textAlign = 'center';
    ctx.fillStyle = o.isPlayer ? PUNANE : 'rgba(28,24,21,.8)';
    ctx.fillText(o.isPlayer ? '★ sina' : o.name, o.x, o.y + 14);
    ctx.restore();

    if (o.event) {
      const hy = o.y - (o.teacher ? 150 : 132) + Math.sin(t * 5) * 4;
      ctx.save();
      ctx.translate(o.x + 14, hy);
      ctx.rotate(Math.sin(t * 3) * 0.12);
      ctx.fillStyle = 'rgba(28,24,21,.25)';
      ctx.beginPath(); ctx.arc(2, 3, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = PUNANE;
      ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.stroke();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = '#fffaf0';
      ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#fffaf0';
      ctx.font = 'bold 18px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', 0, 1);
      ctx.restore();
    }
  }

  function draw(t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(bg, 0, 0);
    ctx.setTransform(S, 0, 0, S, 0, 0);

    litter.forEach((l) => {
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(l.rot);
      ctx.drawImage(litterSprites[l.kind], -15, -15, 30, 30);
      ctx.restore();
    });

    if (target && running && !paused) {
      ctx.save();
      ctx.strokeStyle = 'rgba(216,49,43,.7)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(target.x, target.y, 12, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    const all = npcs.concat([player], kanad).sort((a, b) => a.y - b.y);
    all.forEach((o) => drawChar(o, t));
  }

  // ---------- Loop ----------
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (running && !paused) update(dt);
    if (toastTimer > 0) {
      toastTimer -= dt;
      if (toastTimer <= 0) $('teade').textContent = '';
    }
    updateKanad(dt);
    draw(now / 1000);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
