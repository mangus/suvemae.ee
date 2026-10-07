// Moves the hedgehog back and forth across the forest; a tap curls it into a ball.
const mets = document.getElementById('mets');
const siil = document.getElementById('siil');
const olek = document.getElementById('olek');

const KIIRUS = 50; // pixels per second
let x = 0;
let suund = 1;
let peatus = false;
let eelmine = performance.now();

function samm(aeg) {
  const dt = Math.min((aeg - eelmine) / 1000, 0.1);
  eelmine = aeg;
  if (!peatus) {
    x += suund * KIIRUS * dt;
    const max = mets.clientWidth - siil.offsetWidth;
    if (x > max) { x = max; suund = -1; }
    if (x < 0) { x = 0; suund = 1; }
  }
  siil.style.transform = `translateX(${x}px) scaleX(${suund})`;
  requestAnimationFrame(samm);
}
requestAnimationFrame(samm);

function kerra() {
  if (peatus) return;
  peatus = true;
  siil.classList.add('kerra');
  olek.textContent = 'Siil kerib end kerra! 🌰';
  setTimeout(() => {
    siil.classList.remove('kerra');
    peatus = false;
    olek.textContent = 'Siil jalutab edasi. Puuduta uuesti!';
  }, 1400);
}

siil.addEventListener('pointerdown', kerra);
siil.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); kerra(); }
});
