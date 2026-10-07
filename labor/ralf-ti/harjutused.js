// Exercises made from a topic's own flashcards and text, checked right away like in an online textbook.
// Three kinds: match the pairs, multiple choice and fill in the missing word.

const lihtne = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

function segatud(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function el(silt, klass, tekst) {
  const e = document.createElement(silt);
  if (klass) e.className = klass;
  if (tekst != null) e.textContent = tekst;
  return e;
}

function nupuke(tekst, kuhu, tegevus) {
  const n = el('button', '', tekst);
  n.type = 'button';
  n.addEventListener('click', tegevus);
  kuhu.append(n);
  return n;
}

// --- Making the exercises ---

function paarid(teema) {
  const nahtud = new Set();
  const sobivad = teema.kaardid.filter(([, v]) => !nahtud.has(v) && nahtud.add(v));
  if (sobivad.length < 3) return [];
  return [{ tyyp: 'paarid', paarid: segatud(sobivad).slice(0, 4) }];
}

function valikud(teema, mitu) {
  const vastused = [...new Set(teema.kaardid.map((k) => k[1]))];
  return segatud(teema.kaardid).slice(0, mitu)
    .map(([kysimus, oige]) => {
      const valed = segatud(vastused.filter((v) => v !== oige)).slice(0, 3);
      return { tyyp: 'valik', kysimus, oige, valikud: segatud([oige, ...valed]) };
    })
    .filter((y) => y.valikud.length >= 2);
}

// Pick sentences from the text and hide one word: a keyword if there is one, else the longest word.
const SONA = /\p{L}{4,}/gu;

function lungad(teema, mitu) {
  const votmed = teema.sonad.map(lihtne).filter((v) => v.length >= 4);
  const leiud = [];
  teema.tekst.forEach((loik) => {
    loik.split(/(?<=[.!?])\s+/).forEach((lause) => {
      const sonad = [...lause.matchAll(SONA)].filter((m) => m.index > 0);
      if (!sonad.length) return;
      const voti = sonad.find((m) => votmed.some((v) => lihtne(m[0]).startsWith(v)));
      const pikim = sonad.reduce((a, b) => (b[0].length > a[0].length ? b : a));
      const m = voti || (pikim[0].length >= 6 ? pikim : null);
      if (!m) return;
      leiud.push({
        tyyp: 'lynk',
        voti: Boolean(voti),
        enne: lause.slice(0, m.index),
        sona: m[0],
        parast: lause.slice(m.index + m[0].length)
      });
    });
  });
  // Sentences with a keyword come first.
  return segatud(leiud).sort((a, b) => b.voti - a.voti).slice(0, mitu);
}

export function teeYlesanded(teema) {
  return [...paarid(teema), ...valikud(teema, 3), ...lungad(teema, 2)];
}

const punkte = (y) => (y.tyyp === 'paarid' ? y.paarid.length : 1);

// --- Showing the exercises ---

function naitaValik(y, sisu, valmis) {
  sisu.append(el('p', 'harj-kysimus', y.kysimus));
  const kast = el('div', 'harj-valikud');
  y.valikud.forEach((v) => {
    const n = nupuke(v, kast, () => {
      [...kast.children].forEach((b) => {
        b.disabled = true;
        if (b.textContent === y.oige) b.classList.add('oige');
      });
      if (v === y.oige) {
        valmis(1, 'Õige! 🎉');
      } else {
        n.classList.add('vale');
        valmis(0, 'Seekord mitte. Õige vastus on: ' + y.oige);
      }
    });
  });
  sisu.append(kast);
}

function naitaLynk(y, sisu, valmis, utle) {
  sisu.append(el('p', 'harj-kysimus', 'Kirjuta lünka puuduv sõna:'));
  const vorm = el('form', 'harj-lynk');
  const lause = el('p', 'harj-lause');
  const sisend = el('input', 'lunk');
  sisend.autocomplete = 'off';
  sisend.spellcheck = false;
  sisend.setAttribute('autocapitalize', 'off');
  sisend.setAttribute('aria-label', 'Puuduv sõna');
  sisend.style.width = (y.sona.length + 3) + 'ch';
  lause.append(y.enne, sisend, y.parast);
  const kontrolli = el('button', '', 'Kontrolli');
  kontrolli.type = 'submit';
  vorm.append(lause, kontrolli);
  sisu.append(vorm);

  let katseid = 0;
  vorm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (kontrolli.disabled) return;
    const vastus = lihtne(sisend.value);
    if (!vastus) {
      utle('Kirjuta sõna lünka!');
      return;
    }
    const lopeta = (p, sonum, klass) => {
      sisend.disabled = kontrolli.disabled = true;
      sisend.classList.add(klass);
      valmis(p, sonum);
    };
    if (vastus === lihtne(y.sona)) {
      lopeta(katseid ? 0 : 1, katseid ? 'Õige! Teisel katsel said hakkama.' : 'Õige! 🎉', 'oige');
    } else if (!katseid) {
      katseid = 1;
      sisend.value = '';
      sisend.placeholder = y.sona[0] + '…';
      utle('Peaaegu! Sõna algab tähega „' + y.sona[0] + '“. Proovi veel!');
    } else {
      sisend.value = y.sona;
      lopeta(0, 'Õige sõna on „' + y.sona + '“.', 'vale');
    }
  });
}

function naitaPaarid(y, sisu, valmis, utle) {
  sisu.append(el('p', 'harj-kysimus', 'Ühenda paarid: puuduta vasakul küsimust ja siis paremal selle vastust.'));
  const vasak = el('div', 'paarid-veerg');
  const parem = el('div', 'paarid-veerg');
  const paarid = el('div', 'paarid');
  paarid.append(vasak, parem);
  sisu.append(paarid);

  let valitud = null;
  let vigu = 0;
  let leitud = 0;
  y.paarid.forEach(([kysimus], i) => {
    const n = nupuke(kysimus, vasak, () => {
      if (valitud) valitud.classList.remove('valitud');
      valitud = n;
      n.classList.add('valitud');
    });
    n.dataset.i = i;
  });
  segatud(y.paarid.map(([, vastus], i) => [vastus, i])).forEach(([vastus, i]) => {
    const n = nupuke(vastus, parem, () => {
      if (!valitud) {
        utle('Vali enne vasakult küsimus!');
        return;
      }
      if (Number(valitud.dataset.i) !== i) {
        vigu++;
        n.classList.add('vale');
        setTimeout(() => n.classList.remove('vale'), 700);
        utle('Need ei käi kokku. Proovi uuesti!');
        return;
      }
      valitud.classList.replace('valitud', 'oige');
      n.classList.add('oige');
      valitud.disabled = n.disabled = true;
      valitud = null;
      leitud++;
      if (leitud === y.paarid.length) {
        valmis(Math.max(0, y.paarid.length - vigu), vigu ? 'Kõik paarid koos! Vigu oli ' + vigu + '.' : 'Kõik paarid õiged! 🎉');
      } else {
        utle('Õige paar! 👍');
      }
    });
  });
}

const NAITA = { valik: naitaValik, lynk: naitaLynk, paarid: naitaPaarid };

// Runs one round of exercises in `kast`; `lopp(protsent)` gets the score at the end.
export function alustaHarjutused(teema, kast, utle, lopp) {
  const ylesanded = teeYlesanded(teema);
  const max = ylesanded.reduce((s, y) => s + punkte(y), 0);
  let nr = 0;
  let punktid = 0;

  function naita() {
    kast.replaceChildren();
    const y = ylesanded[nr];
    const pea = el('p', 'harj-nr', 'Ülesanne ' + (nr + 1) + ' / ' + ylesanded.length + ' · ' + punktid + ' punkti');
    const sisu = el('div');
    const tagasiside = el('p', 'tagasiside');
    const rida = el('p', 'nupud');
    const edasi = nupuke(nr + 1 < ylesanded.length ? 'Edasi →' : '🏁 Vaata tulemust', rida, () => {
      nr++;
      if (nr < ylesanded.length) naita();
      else tulemus();
    });
    edasi.hidden = true;
    kast.append(pea, sisu, tagasiside, rida);

    const valmis = (p, sonum) => {
      punktid += p;
      tagasiside.textContent = sonum;
      tagasiside.classList.add(p ? 'hea' : 'halb');
      utle(sonum);
      edasi.hidden = false;
      edasi.focus({ preventScroll: true });
    };
    NAITA[y.tyyp](y, sisu, valmis, utle);
  }

  function tulemus() {
    const protsent = Math.round((punktid / max) * 100);
    const tahed = protsent >= 80 ? '⭐⭐⭐' : protsent >= 50 ? '⭐⭐' : '⭐';
    kast.replaceChildren(
      el('p', 'harj-tahed', tahed),
      el('p', 'harj-tulemus', 'Said ' + punktid + ' punkti ' + max + '-st (' + protsent + '%).')
    );
    const rida = el('p', 'nupud');
    nupuke('🔁 Proovi uuesti', rida, () => alustaHarjutused(teema, kast, utle, lopp));
    kast.append(rida);
    utle(protsent >= 80 ? 'Super! Said tähe! ⭐' : protsent >= 50 ? 'Hästi! Proovi veel, siis saad tähe.' : 'Loe õpikut veel kord ja proovi uuesti. Sa saad hakkama!');
    lopp(protsent);
  }

  if (!ylesanded.length) {
    kast.replaceChildren(el('p', 'harj-kysimus', 'Selle teema harjutused on veel tegemata.'));
    return;
  }
  naita();
}
