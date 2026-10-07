// Tap or press Enter on the grandma: she stops, waves and says something.
const vanaema = document.getElementById('vanaema');
const jutt = document.getElementById('jutt');
const laused = ['Tere-tere! 👋', 'Kus mu moosipurk on? 🍯', 'Hoo-hoo-hoo! 😄', 'Keldris on mõnus jahe!', 'Tahad kartulit? 🥔'];
let taimer = null;
let nr = 0;

function lehvita() {
  jutt.textContent = laused[nr % laused.length];
  nr++;
  jutt.classList.add('nahtav');
  vanaema.classList.add('lehvitab');
  clearTimeout(taimer);
  taimer = setTimeout(() => {
    jutt.classList.remove('nahtav');
    vanaema.classList.remove('lehvitab');
  }, 1900);
}

vanaema.addEventListener('click', lehvita);
vanaema.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lehvita(); }
});
