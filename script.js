const items = document.querySelectorAll('.reveal');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
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

// Accessible two-mode gallery. A saved choice is optional, never required.
(() => {
  const tabs = [...document.querySelectorAll('[data-space]')];
  if (!tabs.length) return;
  function selectSpace(value, focus = false) {
    if (!tabs.some(tab => tab.dataset.space === value)) return;
    tabs.forEach(tab => {
      const selected = tab.dataset.space === value;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
      if (selected && focus) tab.focus();
    });
    try { localStorage.setItem('jungle-space', value); } catch { /* Storage may be disabled. */ }
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectSpace(tab.dataset.space));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); selectSpace(tabs[next].dataset.space, true); }
    });
  });
  try {
    const saved = localStorage.getItem('jungle-space');
    if (saved) selectSpace(saved);
  } catch { /* Keep the compact gallery visible. */ }
})();

// The room stays fixed; each stop reveals another cumulative planting layer.
(() => {
  const slider = document.querySelector('#vibe-range');
  if (!slider) return;
  const names = ['Чистый лист', 'Первые акценты', 'Зелёный уют', 'Большая стрелиция', 'Воздушный сад', 'Живая стена', 'Своя коллекция', 'Больше разнообразия', 'Домашние джунгли'];
  const descriptions = ['Светлая бело-бежевая гостиная с книгами и керамикой, без растений', 'Кислица на столе и три разных растения на полке и комоде', 'Растения по сторонам комнаты и дополнительные растения на полках', 'Большая стрелиция в левом углу дополняет композицию', 'Пять разных пышных растений на отдельных потолочных подвесах разной высоты у окна', 'Добавлена фитостена над диваном', 'Справа появилась этажерка с подсветкой и первыми растениями, развёрнутая торцом', 'Этажерка, полки и комод постепенно заполняются разными растениями', 'Пышная коллекция: заполненная этажерка, миниатюрные растения на полках и комоде, пёстрые листья и свисающие побеги'];
  const layers = [...document.querySelectorAll('[data-vibe-level]')];
  function render() {
    const level = Math.max(0, Math.min(8, Math.round(Number(slider.value) || 0)));
    slider.value = String(level);
    slider.setAttribute('aria-valuetext', `${names[level]}, ${level + 1} из 9`);
    document.querySelector('#vibe-level').textContent = names[level];
    document.querySelector('#vibe-counter').textContent = `0${level + 1} / 09`;
    document.querySelector('#vibe-scene').setAttribute('aria-label', descriptions[level]);
    slider.parentElement.style.setProperty('--vibe-progress', `${level / 8 * 100}%`);
    layers.forEach(layer => layer.classList.toggle('is-visible', Number(layer.dataset.vibeLevel) <= level && (!layer.dataset.vibeUntil || level <= Number(layer.dataset.vibeUntil))));
  }
  slider.addEventListener('input', render);
  render();
})();
