import { SHOP_ITEMS, TYPE_ICON, TYPE_LABEL } from '../data/levels.js';
import { buy, getProgress } from '../state.js';
import { visualHTML } from '../visuals.js';
import { toast, confetti } from '../ui.js';

export function renderShop() {
  const p = getProgress();
  const cards = SHOP_ITEMS.map((s) => {
    const owned = p.owned.includes(s.id);
    const canBuy = p.coins >= s.price;
    return `<article class="shop-card ${owned ? 'owned' : ''}">
      <div class="shop-img">${visualHTML(s.steps[0]?.image, { interactive: false })}</div>
      <div class="shop-body">
        <span class="chip">${TYPE_ICON[s.type]} ${TYPE_LABEL[s.type]}</span>
        <span class="chip">${'◆'.repeat(s.difficulty)}${'◇'.repeat(3 - s.difficulty)}</span>
        <h3>${s.title}</h3>
        <p>${s.intro}</p>
        ${
          owned
            ? `<a class="btn primary" href="#/leccion/${s.id}">Abrir lección</a>`
            : `<button class="btn ${canBuy ? 'gold' : 'disabled'}" data-buy="${s.id}">🪙 ${s.price} ${canBuy ? 'Desbloquear' : '· te faltan ' + (s.price - p.coins)}</button>`
        }
      </div>
    </article>`;
  }).join('');

  return {
    html: `
      <section class="hero">
        <h1>Tienda mágica</h1>
        <p>Cambia tus monedas por técnicas, trucos y rutinas avanzadas. Gana monedas superando niveles del camino.</p>
        <div class="wallet">🪙 <b>${p.coins}</b> monedas</div>
      </section>
      <section class="shop-grid">${cards}</section>`,
    mount(root) {
      root.querySelectorAll('[data-buy]').forEach((b) =>
        b.addEventListener('click', () => {
          const item = SHOP_ITEMS.find((s) => s.id === b.dataset.buy);
          const res = buy(item);
          if (!res.ok) return toast(res.reason);
          toast(`¡Desbloqueaste «${item.title}»!`);
          confetti(document.body);
          setTimeout(() => (location.hash = `#/leccion/${item.id}`), 600);
        }),
      );
    },
  };
}
