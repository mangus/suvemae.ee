'use strict';
// Hea tahte mäng: walk around the Suvemäe house, help students and teachers
// by choosing what the Good Will Agreement says, and pick up litter.
// Drawn in a paper-collage style: ink lines, watercolour washes, stitches.
(() => {
  const W = 720;
  const EESMARK = 12;
  const MAX_PRAHT = 4;
  const INK = '#2b2622';
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
      id.data[i * 4 + 3] = 45;
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

  function wash(c, pts, color, r, layers = 4, j = 8, alpha = 0.2) {
    c.save();
    c.globalAlpha = alpha;
    c.fillStyle = color;
    for (let l = 0; l < layers; l++) {
      smoothPath(c, jit(pts, j, r), true);
      c.fill();
    }
    c.restore();
  }

  function ink(c, pts, closed, r, w = 2, j = 1.4) {
    c.save();
    c.strokeStyle = INK;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.lineWidth = w;
    smoothPath(c, jit(pts, j, r), closed);
    c.stroke();
    c.lineWidth = w * 0.5;
    c.globalAlpha = 0.55;
    smoothPath(c, jit(pts, j, r), closed);
    c.stroke();
    c.restore();
  }

  function stitch(c, pts, closed, color, r) {
    c.save();
    c.setLineDash([6, 5]);
    c.strokeStyle = color;
    c.lineWidth = 1.6;
    c.lineCap = 'round';
    smoothPath(c, jit(pts, 1, r), closed);
    c.stroke();
    c.restore();
  }

  // A cut paper piece glued on: soft shadow, flat colour, paper grain
  function paperCut(c, pts, color, r, j = 2.5) {
    const p = jit(pts, j, r);
    c.save();
    c.fillStyle = 'rgba(43,38,34,.18)';
    c.translate(2.5, 3.5);
    smoothPath(c, p, true);
    c.fill();
    c.restore();
    c.save();
    c.fillStyle = color;
    smoothPath(c, p, true);
    c.fill();
    c.clip();
    c.fillStyle = c.createPattern(grain, 'repeat');
    c.fillRect(-1000, -1000, 3000, 3000);
    c.restore();
    return p;
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

  function flower(c, x, y, color, r) {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + r();
      wash(c, ellipsePts(x + Math.cos(a) * 5, y + Math.sin(a) * 5, 4, 4, 8), color, r, 2, 1, 0.5);
    }
    dot(c, x, y, 2.5, '#e0a631');
  }

  // ---------- Background (drawn once) ----------
  const bg = document.createElement('canvas');
  bg.width = bg.height = W * S;
  (() => {
    const b = bg.getContext('2d');
    b.scale(S, S);
    const r = rng(11);
    b.fillStyle = '#f4ecd9';
    b.fillRect(0, 0, W, W);
    wash(b, ellipsePts(360, 370, 300, 250, 18), '#eaa6a0', r, 3, 30, 0.08);
    wash(b, ellipsePts(200, 600, 220, 120, 18), '#8fb8c9', r, 3, 30, 0.08);
    b.fillStyle = b.createPattern(grain, 'repeat');
    b.fillRect(0, 0, W, W);

    // Klass (top left): blackboard and desks
    const klass = rectPts(28, 40, 300, 255);
    paperCut(b, klass, '#cfe3df', r);
    stitch(b, rectPts(38, 50, 280, 235), true, '#2a7f7a', r);
    const tahvel = paperCut(b, rectPts(70, 62, 210, 44, 3), '#3f6b5a', r, 1.5);
    ink(b, tahvel, true, r, 1.6, 0.5);
    b.save();
    b.strokeStyle = 'rgba(255,255,255,.75)';
    b.lineWidth = 1.5;
    smoothPath(b, [[90, 90], [100, 76], [110, 92], [120, 78], [130, 90]], false);
    b.stroke();
    b.font = KIRI.replace('20px', '15px');
    b.fillStyle = 'rgba(255,255,255,.85)';
    b.fillText('2 + 3 = 5', 160, 90);
    b.restore();
    for (let i = 0; i < 2; i++) {
      for (let k = 0; k < 3; k++) {
        const lauda = paperCut(b, rectPts(62 + k * 88, 140 + i * 72, 62, 34, 3), '#e3b46a', r);
        ink(b, lauda, true, r, 1.5, 0.6);
        wash(b, ellipsePts(93 + k * 88, 190 + i * 72, 9, 7, 8), ['#c8553d', '#2a7f7a', '#eaa6a0'][(i + k) % 3], r, 2, 1, 0.6);
      }
    }
    label(b, 'Klass', 280, 270, -0.06, '#2a7f7a');

    // Suvemäe ring (top right): cushions in a circle
    paperCut(b, ellipsePts(545, 172, 132, 122, 20), '#f6dfae', r, 4);
    stitch(b, ellipsePts(545, 172, 120, 110, 20), true, '#c8553d', r);
    wash(b, ellipsePts(545, 172, 40, 36, 12), '#c8553d', r, 3, 4, 0.18);
    flower(b, 545, 172, '#eaa6a0', r);
    const padjad = ['#c8553d', '#2a7f7a', '#eaa6a0', '#8fb8c9'];
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const px = 545 + Math.cos(a) * 82;
      const py = 172 + Math.sin(a) * 74;
      const p = paperCut(b, ellipsePts(px, py, 14, 12, 10), padjad[i % 4], r, 1.5);
      ink(b, p, true, r, 1.4, 0.5);
    }
    label(b, 'Suvemäe ring', 545, 312, 0.04, '#c8553d');

    // Mänguala (bottom left): toy blocks and a kite
    const mang = rectPts(32, 430, 292, 255);
    paperCut(b, mang, '#f7d6d2', r);
    stitch(b, rectPts(42, 440, 272, 235), true, '#c8553d', r);
    const klotsid = ['#c8553d', '#2a7f7a', '#e0a631', '#8fb8c9', '#7a5c99'];
    for (let i = 0; i < 9; i++) {
      const x = 70 + (i % 3) * 30 + (i > 5 ? 15 : 0);
      const y = 600 - Math.floor(i / 3) * 22;
      const p = paperCut(b, rectPts(x, y, 28, 20, 2), klotsid[i % 5], r, 1);
      ink(b, p, true, r, 1.2, 0.4);
      dot(b, x + 8, y + 7, 2.5, 'rgba(255,255,255,.6)');
      dot(b, x + 20, y + 7, 2.5, 'rgba(255,255,255,.6)');
    }
    const tuulelohe = paperCut(b, [[240, 470], [272, 505], [240, 560], [208, 505]], '#e0a631', r, 1.5);
    ink(b, tuulelohe, true, r, 1.5, 0.5);
    ink(b, [[240, 560], [230, 590], [250, 610], [238, 640]], false, r, 1.2, 1);
    wash(b, ellipsePts(240, 505, 10, 20, 8), '#c8553d', r, 2, 2, 0.4);
    label(b, 'Mänguala', 120, 462, -0.05, '#c8553d');

    // Köök (bottom right): table with plates and a sink
    const kook = rectPts(394, 440, 296, 248);
    paperCut(b, kook, '#d6e6ee', r);
    stitch(b, rectPts(404, 450, 276, 228), true, '#2a7f7a', r);
    const laud = paperCut(b, ellipsePts(530, 590, 82, 46, 16), '#e3b46a', r, 2);
    ink(b, laud, true, r, 1.6, 0.6);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      const px = 530 + Math.cos(a) * 52;
      const py = 590 + Math.sin(a) * 26;
      const p = paperCut(b, ellipsePts(px, py, 12, 9, 10), '#fffaf0', r, 0.8);
      ink(b, p, true, r, 1, 0.3);
      wash(b, ellipsePts(px, py, 5, 4, 8), '#eaa6a0', r, 1, 1, 0.6);
    }
    const kraanikauss = paperCut(b, rectPts(600, 465, 70, 40, 3), '#b9c4c9', r, 1);
    ink(b, kraanikauss, true, r, 1.5, 0.5);
    ink(b, [[636, 468], [636, 458], [646, 458]], false, r, 2, 0.3);
    wash(b, ellipsePts(636, 488, 18, 9, 10), '#8fb8c9', r, 2, 2, 0.6);
    label(b, 'Köök', 450, 470, 0.05, '#2a7f7a');

    // Hallway: the Suvemäe name in mixed colours like the logo
    const tahed = ['S', 'u', 'v', 'e', 'm', 'ä', 'e'];
    const varvid = ['#2a7f7a', '#c8553d', '#e0a631', '#8fb8c9', '#7a5c99', '#eaa6a0', '#6d8b4e'];
    tahed.forEach((t, i) => label(b, t, 288 + i * 24, 372 + Math.sin(i) * 5, (r() - 0.5) * 0.4, varvid[i], i === 0 ? 34 : 28));
    ink(b, [[296, 396], [340, 404], [390, 404], [440, 394]], false, r, 1.6, 0.8);

    // Little doodles around the hallway
    for (let i = 0; i < 14; i++) {
      const x = 30 + r() * 660;
      const y = 315 + r() * 105;
      if (x > 260 && x < 470) continue;
      flower(b, x, y, varvid[i % varvid.length], r);
    }
  })();

  // ---------- Characters ----------
  function drawPattern(c, kind, color) {
    c.save();
    c.strokeStyle = color;
    c.fillStyle = color;
    c.lineWidth = 2;
    if (kind === 'triibud') {
      for (let y = -70; y < 0; y += 6) { c.beginPath(); c.moveTo(-30, y); c.lineTo(30, y + 1); c.stroke(); }
    } else if (kind === 'tapid') {
      for (let y = -66; y < 0; y += 7) for (let x = -24; x < 24; x += 7) dot(c, x + (y % 14 ? 3 : 0), y, 1.6, color);
    } else if (kind === 'ruudud') {
      c.lineWidth = 1.2;
      for (let x = -30; x < 30; x += 7) { c.beginPath(); c.moveTo(x, -80); c.lineTo(x, 0); c.stroke(); }
      for (let y = -80; y < 0; y += 7) { c.beginPath(); c.moveTo(-30, y); c.lineTo(30, y); c.stroke(); }
    } else if (kind === 'lilled') {
      for (let y = -60; y < 0; y += 13) for (let x = -20; x < 24; x += 12) {
        for (let i = 0; i < 4; i++) dot(c, x + Math.cos(i * 1.57) * 2.4, y + Math.sin(i * 1.57) * 2.4, 1.6, color);
      }
    }
    c.restore();
  }

  function drawHair(c, o, r) {
    const h = o.hair;
    const col = o.hairColor;
    let pts;
    if (h === 'bob') pts = [[-15, -68], [-16, -84], [-8, -93], [5, -93], [15, -85], [16, -68], [11, -79], [-11, -79]];
    else if (h === 'spiky') pts = [[-14, -78], [-15, -88], [-10, -86], [-8, -96], [-3, -89], [1, -98], [5, -89], [10, -95], [11, -86], [15, -87], [14, -78], [0, -84]];
    else pts = [[-14, -76], [-12, -89], [-3, -94], [7, -93], [13, -87], [14, -76], [3, -84], [-6, -83]];
    const p = paperCut(c, pts, col, r, 0.8);
    ink(c, p, true, r, 1.3, 0.4);
    if (h === 'pats') {
      [-17, 17].forEach((x) => { const q = paperCut(c, ellipsePts(x, -70, 5, 6, 8), col, r, 0.6); ink(c, q, true, r, 1.2, 0.3); });
    } else if (h === 'bun') {
      const q = paperCut(c, ellipsePts(0, -97, 7, 6, 8), col, r, 0.6);
      ink(c, q, true, r, 1.2, 0.3);
    } else if (h === 'curly') {
      for (let i = 0; i < 7; i++) {
        const a = Math.PI + (i / 6) * Math.PI;
        const q = paperCut(c, ellipsePts(Math.cos(a) * 13, -78 + Math.sin(a) * 14, 5.5, 5.5, 8), col, r, 0.5);
        ink(c, q, true, r, 1, 0.3);
      }
    }
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
    const coatBottom = o.teacher ? -16 : -27;

    // legs and shoes
    ink(x, [[-7, coatBottom - 3], [-8, -3]], false, r, 2.2, 0.6);
    ink(x, [[7, coatBottom - 3], [8, -3]], false, r, 2.2, 0.6);
    x.fillStyle = INK;
    x.beginPath(); x.ellipse(-10, -2, 6, 3, 0, 0, Math.PI * 2); x.fill();
    x.beginPath(); x.ellipse(10, -2, 6, 3, 0, 0, Math.PI * 2); x.fill();

    // arms behind the coat
    ink(x, [[-10, -58], [-19, -44], [-18, -33]], false, r, 2, 0.6);
    ink(x, [[10, -58], [19, -44], [18, -33]], false, r, 2, 0.6);
    dot(x, -18, -32, 3, o.skin);
    dot(x, 18, -32, 3, o.skin);

    // coat with a pattern
    const coat = [[-10, -63], [0, -64], [10, -63], [15, -45], [20, coatBottom], [0, coatBottom + 1], [-20, coatBottom], [-15, -45]];
    const cp = paperCut(x, coat, o.coat, r, 0.8);
    x.save();
    smoothPath(x, cp, true);
    x.clip();
    x.globalAlpha = 0.7;
    drawPattern(x, o.pattern, o.patColor);
    x.restore();
    ink(x, cp, true, r, 1.7, 0.4);

    if (o.scarf) {
      const s = paperCut(x, [[-11, -66], [11, -66], [12, -59], [-12, -59]], o.scarf, r, 0.6);
      ink(x, s, true, r, 1.1, 0.3);
      const t = paperCut(x, [[4, -60], [10, -60], [11, -46], [5, -47]], o.scarf, r, 0.6);
      ink(x, t, true, r, 1.1, 0.3);
    }
    if (o.book) {
      const k = paperCut(x, [[12, -44], [24, -46], [25, -32], [13, -30]], o.book, r, 0.5);
      ink(x, k, true, r, 1.2, 0.3);
    }

    // head
    const head = paperCut(x, ellipsePts(0, -77, 13, 15, 12), o.skin, r, 0.6);
    ink(x, head, true, r, 1.5, 0.4);
    drawHair(x, o, r);
    if (o.beard) {
      const b = paperCut(x, [[-12, -73], [-10, -65], [-4, -61], [0, -60], [4, -61], [10, -65], [12, -73], [6, -68], [-6, -68]], o.hairColor, r, 0.6);
      ink(x, b, true, r, 1.1, 0.3);
    }
    dot(x, -5, -76, 1.7, INK);
    dot(x, 5, -76, 1.7, INK);
    dot(x, -8.5, -70.5, 3.2, 'rgba(214,90,80,.45)');
    dot(x, 8.5, -70.5, 3.2, 'rgba(214,90,80,.45)');
    x.save();
    x.strokeStyle = INK;
    x.lineWidth = 1.2;
    x.beginPath();
    x.arc(0, -71, 3, 0.2, Math.PI - 0.2);
    x.stroke();
    x.restore();
    if (o.glasses) {
      x.save();
      x.strokeStyle = INK;
      x.lineWidth = 1.2;
      x.beginPath(); x.arc(-5, -76, 4, 0, Math.PI * 2); x.stroke();
      x.beginPath(); x.arc(5, -76, 4, 0, Math.PI * 2); x.stroke();
      x.beginPath(); x.moveTo(-1, -76); x.lineTo(1, -76); x.stroke();
      x.restore();
    }
    if (o.hat) {
      const p = paperCut(x, ellipsePts(2, -90, 15, 5, 10), o.hat, r, 0.6);
      ink(x, p, true, r, 1.2, 0.3);
      dot(x, 2, -96, 2.2, INK);
    }
    return c;
  }

  const TEGELASED = [
    { name: 'Mia', coat: '#c8553d', pattern: 'triibud', patColor: '#f4ecd9', hair: 'pats', hairColor: '#3b2a20', skin: '#f2d3b8' },
    { name: 'Uku', coat: '#2a7f7a', pattern: 'ruudud', patColor: '#e0a631', hair: 'spiky', hairColor: '#d9a441', skin: '#e8c4a0' },
    { name: 'Lumi', coat: '#8fb8c9', pattern: 'lilled', patColor: '#c8553d', hair: 'bob', hairColor: '#1f1a17', skin: '#c99a72' },
    { name: 'Sass', coat: '#6d8b4e', pattern: 'tapid', patColor: '#f4ecd9', hair: 'curly', hairColor: '#5a3a22', skin: '#8d5e3c' },
    { name: 'Iris', coat: '#eaa6a0', pattern: 'triibud', patColor: '#2a7f7a', hair: 'bun', hairColor: '#b5562f', skin: '#f5dcc6' },
    { name: 'Andri', coat: '#7a5c99', pattern: 'tapid', patColor: '#e0a631', hair: 'spiky', hairColor: '#2b2622', skin: '#e9c9a6', hat: '#c8553d' },
    { name: 'Kaie', teacher: true, coat: '#2a7f7a', pattern: 'lilled', patColor: '#eaa6a0', hair: 'bun', hairColor: '#9a9a9a', skin: '#f0d2b6', glasses: true, book: '#c8553d' },
    { name: 'Tõnu', teacher: true, coat: '#a8743a', pattern: 'ruudud', patColor: '#2b2622', hair: 'spiky', hairColor: '#3b2a20', skin: '#d9a77f', glasses: true },
    { name: 'Liis', teacher: true, coat: '#c8553d', pattern: 'tapid', patColor: '#f4ecd9', hair: 'bob', hairColor: '#d9a441', skin: '#f3d9c2', scarf: '#e0a631', book: '#2a7f7a' },
    { name: 'Jaan', teacher: true, coat: '#6d8b4e', pattern: 'triibud', patColor: '#f4ecd9', hair: 'short', hairColor: '#5a3a22', skin: '#e8c4a0', beard: true },
    { name: 'Peeter', teacher: true, coat: '#8fb8c9', pattern: 'ruudud', patColor: '#c8553d', hair: 'curly', hairColor: '#2b2622', skin: '#8d5e3c', beard: true, book: '#e0a631' },
    { name: 'Anu', teacher: true, coat: '#eaa6a0', pattern: 'lilled', patColor: '#2a7f7a', hair: 'bun', hairColor: '#3b2a20', skin: '#c99a72', scarf: '#7a5c99' },
    { name: 'Maret', teacher: true, coat: '#e0a631', pattern: 'tapid', patColor: '#c8553d', hair: 'curly', hairColor: '#b5562f', skin: '#f5dcc6', glasses: true },
  ];

  const SPAWN = [[150, 230], [270, 200], [500, 250], [600, 120], [150, 520], [520, 520], [440, 180], [620, 380], [240, 640], [330, 330], [90, 400], [400, 620], [660, 600]];

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
    sprite: makeSprite({ seed: 999, coat: '#e0a631', pattern: 'tapid', patColor: '#c8553d', hair: 'curly', hairColor: '#3b2a20', skin: '#f0cfae', scarf: '#2a7f7a' }),
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
      const p = paperCut(x, ellipsePts(0, 0, 9, 8, 9), '#fffaf0', r, 2);
      ink(x, p, true, r, 1.2, 0.5);
      ink(x, [[-5, -2], [0, 3], [4, -3], [2, 4]], false, r, 0.8, 0.5);
    } else if (kind === 1) {
      const p = paperCut(x, [[-11, -6], [-3, -1], [3, -1], [11, -6], [11, 6], [3, 1], [-3, 1], [-11, 6]], '#c8553d', r, 0.8);
      ink(x, p, true, r, 1, 0.3);
      dot(x, 0, 0, 3, '#e0a631');
    } else {
      const p = paperCut(x, [[-4, -10], [4, -10], [2, -4], [5, 4], [4, 10], [-4, 10], [-5, 4], [-2, -4]], '#f2e7b8', r, 0.6);
      ink(x, p, true, r, 1, 0.3);
      wash(x, ellipsePts(0, -10, 6, 3, 8), '#c8553d', r, 2, 1, 0.7);
      wash(x, ellipsePts(0, 10, 6, 3, 8), '#c8553d', r, 2, 1, 0.7);
    }
    return c;
  }
  const litterSprites = [0, 1, 2].map((k) => makeLitter(k, 50 + k));

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
    const box = $('valikud');
    box.textContent = '';
    shuffle(s.valikud.slice()).forEach(([t, ok]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = fill(t);
      btn.dataset.ok = ok ? '1' : '';
      btn.addEventListener('click', () => choose(btn, ok));
      box.appendChild(btn);
    });
    $('tagasiside').classList.add('peidus');
    $('reegel').classList.add('peidus');
    $('edasi').classList.add('peidus');
    $('dialoog').classList.remove('peidus');
    $('dialoog').scrollTop = 0;
  }

  function choose(btn, ok) {
    const s = current.event;
    $('valikud').querySelectorAll('button').forEach((b) => {
      b.disabled = true;
      if (b.dataset.ok) b.classList.add('oige');
    });
    const fb = $('tagasiside');
    if (ok) {
      setHearts(hearts + 1);
      stickers.add(s.reegel);
      fb.textContent = '♥ Super! ' + s.miks;
      fb.className = 'tagasiside hea';
      soundGood();
    } else {
      fb.textContent = 'Hmm, mitte päris. ' + s.miks;
      fb.className = 'tagasiside halb';
      pool.push(s); // it may come back later
      soundBad();
    }
    $('reegel').textContent = 'Kokkulepe: ' + s.reegel;
    $('reegel').classList.remove('peidus');
    $('edasi').classList.remove('peidus');
  }

  function closeDialog() {
    $('dialoog').classList.add('peidus');
    if (current) {
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
        n.tx = 40 + Math.random() * (W - 80);
        n.ty = 130 + Math.random() * (W - 150);
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
      litter.push({ x: 40 + Math.random() * (W - 80), y: 140 + Math.random() * (W - 170), kind: Math.floor(Math.random() * 3), rot: Math.random() * 6 });
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
    const bob = o.moving ? -Math.abs(Math.sin(o.phase)) * 4 : Math.sin(t * 2 + (o.phase || 0)) * 0.6;
    const tilt = o.moving ? Math.sin(o.phase) * 0.06 : 0;
    ctx.save();
    ctx.fillStyle = 'rgba(43,38,34,.16)';
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
    ctx.fillStyle = o.isPlayer ? '#c8553d' : 'rgba(43,38,34,.75)';
    ctx.fillText(o.isPlayer ? '★ sina' : o.name, o.x, o.y + 14);
    ctx.restore();

    if (o.event) {
      const hy = o.y - (o.teacher ? 150 : 132) + Math.sin(t * 5) * 4;
      ctx.save();
      ctx.translate(o.x + 14, hy);
      ctx.rotate(Math.sin(t * 3) * 0.12);
      ctx.fillStyle = 'rgba(43,38,34,.25)';
      ctx.beginPath(); ctx.arc(2, 3, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c8553d';
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
      ctx.strokeStyle = 'rgba(200,85,61,.7)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(target.x, target.y, 12, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    const all = npcs.concat([player]).sort((a, b) => a.y - b.y);
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
    draw(now / 1000);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
