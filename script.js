/* ====== Lecteur du chant ====== */
const btnChant = document.getElementById('playChant');
const audio = new Audio('chant.m4a');
audio.preload = 'auto';

let isPlaying = false;

btnChant.addEventListener('click', () => {
  isPlaying ? stopChant() : playChant();
});

function playChant(){
  audio.currentTime = 0;
  audio.play().then(() => {
    isPlaying = true;
    btnChant.setAttribute('aria-pressed', 'true');
    btnChant.querySelector('.btn-text')?.replaceChildren(document.createTextNode('Stop'));
  }).catch(()=>{}); // éviter les erreurs d’autoplay bloqué
}

function stopChant(){
  audio.pause();
  isPlaying = false;
  btnChant.setAttribute('aria-pressed', 'false');
  btnChant.querySelector('.btn-text')?.replaceChildren(document.createTextNode('Ambiance Parc des Princes'));
}

/* Stop si l’utilisateur met sur pause ailleurs (UI navigateur) */
audio.addEventListener('pause', () => {
  if(isPlaying){ stopChant(); }
});


/* ====== Carousel simple ====== */
const carousel = document.getElementById('carousel');
const track = carousel.querySelector('.slides');
const slides = Array.from(carousel.querySelectorAll('.slide'));
const btnPrev = carousel.querySelector('.prev');
const btnNext = carousel.querySelector('.next');

/* Dots auto-générés */
let dots = [];
function buildDots(){
  let dotsWrap = carousel.querySelector('.dots');
  if (!dotsWrap) {
    dotsWrap = document.createElement('div');
    dotsWrap.className = 'dots';
    dotsWrap.setAttribute('role', 'tablist');
    dotsWrap.setAttribute('aria-label', 'Pagination du carousel');
    carousel.appendChild(dotsWrap);
  }
  dotsWrap.innerHTML = '';
  dots = slides.map((_, k) => {
    const b = document.createElement('button');
    b.className = 'dot' + (k === index ? ' is-active' : '');
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', k === index ? 'true' : 'false');
    b.setAttribute('aria-label', `Aller à l’image ${k+1}`);
    b.addEventListener('click', () => goTo(k));
    dotsWrap.appendChild(b);
    return b;
  });
}

/* Translation précise au pixel (évite tout “glissement”) */
function applyTransform(){
  const w = carousel.clientWidth;              // largeur exacte du viewport
  track.style.transform = `translate3d(-${index * w}px, 0, 0)`;
}

let index = 0;
let autoTimer = null;

function updateUI(){
  slides.forEach((s, k) => s.classList.toggle('is-active', k === index));
  dots.forEach((d, k) => {
    d.classList.toggle('is-active', k === index);
    d.setAttribute('aria-selected', k === index ? 'true' : 'false');
  });
}

function goTo(i){
  index = (i + slides.length) % slides.length;
  applyTransform();
  updateUI();
  restartAuto();
}

function next(){ goTo(index + 1); }
function prev(){ goTo(index - 1); }

btnNext?.addEventListener('click', next);
btnPrev?.addEventListener('click', prev);

function startAuto(){ stopAuto(); autoTimer = setInterval(next, 5000); }
function stopAuto(){ if (autoTimer){ clearInterval(autoTimer); autoTimer = null; } }
function restartAuto(){ startAuto(); }

/* Pause auto-play quand l’utilisateur survole/interaction */
carousel.addEventListener('mouseenter', stopAuto);
carousel.addEventListener('mouseleave', startAuto);

/* Swipe mobile */
let startX = 0;
track.addEventListener('touchstart', (e) => startX = e.touches[0].clientX, {passive:true});
track.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - startX;
  if(Math.abs(dx) > 50){ dx > 0 ? prev() : next(); }
}, {passive:true});

/* Recalcule la position au resize (évite le décentrage après redimensionnement) */
window.addEventListener('resize', applyTransform);

/* Init */
buildDots();
goTo(0);
startAuto();
