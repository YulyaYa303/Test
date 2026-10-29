const items = document.querySelectorAll('.reveal');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        if (entry.target.id === 'about') startPlantGrowth();
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

// A short shared timeline grows each branch, with leaves attached to its moving tip.
const plant = document.querySelector('.growing-plant');
const replay = document.querySelector('.plant-replay');
let growthFrame = 0;
let growthStarted = false;
const branchTracks = plant ? [...plant.querySelectorAll('.growth-branch')].map((path) => ({
  path, length: path.getTotalLength(), delay: Number(path.dataset.delay),
  duration: Number(path.dataset.duration), progress: 1,
})) : [];
const branchById = new Map(branchTracks.map((track) => [track.path.id, track]));
const leafTracks = plant ? [...plant.querySelectorAll('.growth-leaf-anchor')].map((anchor) => ({
  anchor, fold: anchor.firstElementChild, branch: branchById.get(anchor.dataset.branch),
  delay: Number(anchor.dataset.delay), duration: Number(anchor.dataset.duration),
  angle: Number(anchor.dataset.angle), size: Number(anchor.dataset.size),
})) : [];
const clampGrowth = (value) => Math.min(1, Math.max(0, value));
const easeGrowth = (value) => 1 - Math.pow(1 - value, 3);
const canopyShadow = plant?.querySelector('.canopy-shadow');
function renderPlantGrowth(time) {
  if (canopyShadow) canopyShadow.setAttribute('rx', String(18 + 134 * easeGrowth(clampGrowth(time / 9))));
  for (const track of branchTracks) {
    track.progress = easeGrowth(clampGrowth((time - track.delay) / track.duration));
    track.path.style.strokeDasharray = String(track.length);
    track.path.style.strokeDashoffset = String(track.length * (1 - track.progress));
    track.path.style.opacity = track.progress > 0 ? '1' : '0';
  }
  for (const track of leafTracks) {
    const progress = clampGrowth((time - track.delay) / track.duration);
    const opened = progress * progress * (3 - 2 * progress);
    const tip = track.branch.path.getPointAtLength(track.branch.length * track.branch.progress);
    track.anchor.setAttribute('transform', `translate(${tip.x} ${tip.y})`);
    track.anchor.style.opacity = String(clampGrowth(progress * 5));
    // A tall folded blade opens sideways while its petiole is still extending.
    const width = .018 + .982 * opened;
    const height = .22 + .78 * easeGrowth(progress);
    const curl = 30 * (1 - opened);
    track.fold.setAttribute('transform', `rotate(${track.angle + curl}) skewY(${14 * (1 - opened)}) scale(${track.size * width} ${track.size * height})`);
  }
}
function startPlantGrowth() {
  if (!plant) return;
  cancelAnimationFrame(growthFrame);
  if (reducedMotion.matches) {
    renderPlantGrowth(20);
    return;
  }
  growthStarted = true;
  plant.classList.remove('is-growing');
  void plant.getBoundingClientRect();
  plant.classList.add('is-growing');
  renderPlantGrowth(0);
  const startedAt = performance.now();
  function advance(now) {
    const elapsed = (now - startedAt) / 1000;
    renderPlantGrowth(elapsed);
    if (elapsed < 11) growthFrame = requestAnimationFrame(advance);
    else growthFrame = 0;
  }
  growthFrame = requestAnimationFrame(advance);
}
if (plant && replay) {
  // Without JavaScript the SVG already contains its complete, static canopy.
  if (!reducedMotion.matches && 'IntersectionObserver' in window) renderPlantGrowth(0);
  replay.hidden = reducedMotion.matches || !('IntersectionObserver' in window);
  replay.addEventListener('click', startPlantGrowth);
  reducedMotion.addEventListener('change', () => {
    replay.hidden = reducedMotion.matches || !('IntersectionObserver' in window);
    if (reducedMotion.matches) {
      cancelAnimationFrame(growthFrame);
      growthFrame = 0;
      plant.classList.remove('is-growing');
      renderPlantGrowth(20);
    } else if (growthStarted || document.querySelector('#about.is-visible')) {
      startPlantGrowth();
    } else {
      // The page can have been opened with reduced motion, without reveal classes.
      const bounds = plant.getBoundingClientRect();
      if (bounds.top < innerHeight && bounds.bottom > 0) startPlantGrowth();
    }
  });
}
