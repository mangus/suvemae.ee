const juku = document.querySelector('#juku');
const tervita = document.querySelector('#tervita');
const sonum = document.querySelector('#sonum');

const tervitused = [
  'Kriipsujuku ütleb: tere-tere! 👋',
  'Nii tore sind näha! 😊',
  'Kriipsujuku lehvitab eriti kiiresti! ✨',
  'Zombid, hoidke eemale! 🧟💚'
];

let tervituseNumber = 0;

tervita.addEventListener('click', () => {
  juku.classList.remove('huppab');
  void juku.offsetWidth;
  juku.classList.add('huppab');

  sonum.textContent = tervitused[tervituseNumber];
  tervituseNumber = (tervituseNumber + 1) % tervitused.length;
});

juku.addEventListener('animationend', (event) => {
  if (event.animationName === 'huppa') {
    juku.classList.remove('huppab');
  }
});
