// "Minu edenemine": which topics were read and the best exercise score.
// Kept only in this browser (localStorage), never sent anywhere.

const VOTI = 'ralf-ti-edenemine';
const kuulajad = [];
let andmed = {};

try {
  andmed = JSON.parse(localStorage.getItem(VOTI)) || {};
} catch {
  andmed = {};
}

function salvesta() {
  try {
    localStorage.setItem(VOTI, JSON.stringify(andmed));
  } catch {
    // Storage may be off (private mode): progress then lasts until the page closes.
  }
  kuulajad.forEach((f) => f());
}

export const voti = (aine, klass, teema) => aine.id + '/' + klass + '/' + teema.nimi;

export const loe = (v) => andmed[v] || {};

export function margi(v, muutus) {
  andmed[v] = { ...loe(v), ...muutus };
  salvesta();
}

export function kustuta() {
  andmed = {};
  salvesta();
}

export const kuula = (f) => kuulajad.push(f);

// Mark shown before a topic's name: a star for exercises done well, a tick for a topic studied.
export function mark(v) {
  const e = loe(v);
  if (e.parim >= 80) return '⭐';
  if (e.loetud || e.parim != null) return '✔️';
  return '';
}
