// Tap or press Enter on the mole: it digs into the floor, pops back up and says something.
const mutt = document.getElementById('mutt');
const jutt = document.getElementById('jutt');
const laused = ['Tere-tere! 👋', 'Kus mu vihmauss on? 🪱', 'Mul pole hambaid, aga mul on ilus nina! 😄', 'Keldris on mõnus pime!', 'Kaevan-kaevan! ⛏️'];
let taimer = null;
let nr = 0;

function kaeva() {
  jutt.textContent = laused[nr % laused.length];
  nr++;
  jutt.classList.add('nahtav');
  mutt.classList.remove('kaevab');
  void mutt.offsetWidth; // restart the dig animation
  mutt.classList.add('kaevab');
  clearTimeout(taimer);
  taimer = setTimeout(() => {
    jutt.classList.remove('nahtav');
    mutt.classList.remove('kaevab');
  }, 1900);
}

mutt.addEventListener('click', kaeva);
mutt.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); kaeva(); }
});

// Clicking the lamp switches the light off and on.
const kelder = document.getElementById('kelder');
const lamp = document.getElementById('lamp');

function lulita() {
  kelder.classList.toggle('pime');
}

lamp.addEventListener('click', lulita);
lamp.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lulita(); }
});
