const items = document.querySelectorAll('.reveal');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        entry.target.querySelector('.growing-plant')?.classList.add('is-growing');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.documentElement.classList.add('js-motion');
  items.forEach((item) => observer.observe(item));
}
const menu = document.querySelector('.menu');
const nav = document.querySelector('#site-nav');
function closeMenu() {
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Открыть меню');
  nav.classList.remove('is-open');
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  nav.classList.toggle('is-open', open);
});
nav.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menu.focus();
  }
});
window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);

const plant = document.querySelector('.growing-plant');
const replay = document.querySelector('.plant-replay');
if (plant && replay) {
  replay.hidden = reducedMotion.matches || !document.documentElement.classList.contains('js-motion');
  replay.addEventListener('click', () => {
    if (reducedMotion.matches) return;
    plant.classList.remove('is-growing');
    // Restart the staged CSS sequence without moving the surrounding section.
    void plant.getBoundingClientRect();
    plant.classList.add('is-growing');
  });
  reducedMotion.addEventListener('change', () => {
    replay.hidden = reducedMotion.matches || !document.documentElement.classList.contains('js-motion');
    if (!reducedMotion.matches && document.querySelector('#about.is-visible')) {
      plant.classList.add('is-growing');
    }
  });
}
