import './styles.css';
import { getProgress, onChange } from './state.js';
import { renderMap } from './views/map.js';
import { renderLesson } from './views/lesson.js';
import { renderPractice } from './views/practice.js';
import { renderShop } from './views/shop.js';
import { renderProfile } from './views/profile.js';

const app = document.getElementById('app');
let cleanup = null;

const routes = [
  [/^#\/?$/, () => renderMap(), 'map'],
  [/^#\/leccion\/([\w-]+)$/, (m) => renderLesson(m[1]), 'map'],
  [/^#\/practica\/([\w-]+)$/, (m) => renderPractice(m[1]), null],
  [/^#\/tienda$/, () => renderShop(), 'shop'],
  [/^#\/perfil$/, () => renderProfile(), 'profile'],
];

function header() {
  const p = getProgress();
  return `<header class="topbar">
    <a href="#/" class="brand"><span class="brand-mark">♠</span> Cartomagia <span class="beta">beta</span></a>
    <div class="stats">
      <span class="stat" title="Racha de días">🔥 ${p.streak.count}</span>
      <span class="stat" title="Puntos">⭐ ${p.points}</span>
      <span class="stat coins" title="Monedas">🪙 ${p.coins}</span>
    </div>
  </header>`;
}

function nav(active) {
  const item = (id, href, icon, text) =>
    `<a href="${href}" class="nav-item ${active === id ? 'active' : ''}"><span>${icon}</span>${text}</a>`;
  return `<nav class="bottomnav">
    ${item('map', '#/', '🗺️', 'Camino')}
    ${item('shop', '#/tienda', '🛍️', 'Tienda')}
    ${item('profile', '#/perfil', '🎩', 'Perfil')}
  </nav>`;
}

function render() {
  if (typeof cleanup === 'function') cleanup();
  cleanup = null;
  const hash = location.hash || '#/';
  for (const [re, view, tab] of routes) {
    const m = hash.match(re);
    if (m) {
      const result = view(m);
      const fullscreen = tab === null;
      app.innerHTML = `${fullscreen ? '' : header()}<main class="${fullscreen ? 'full' : 'page'}">${result.html}</main>${fullscreen ? '' : nav(tab)}`;
      cleanup = result.mount?.(app.querySelector('main')) || null;
      window.scrollTo(0, 0);
      return;
    }
  }
  location.hash = '#/';
}

onChange(() => {
  const bar = app.querySelector('.topbar');
  if (bar) bar.outerHTML = header();
});

window.addEventListener('hashchange', render);
render();
