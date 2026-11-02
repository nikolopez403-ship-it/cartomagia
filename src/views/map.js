import { LEVELS, SHOP_ITEMS, TYPE_ICON, TYPE_LABEL } from '../data/levels.js';
import { getProgress, isUnlocked } from '../state.js';

const OFFSETS = [0, 70, 100, 70, 0, -70, -100, -70];

export function renderMap() {
  const p = getProgress();
  const currentIdx = LEVELS.findIndex((l) => isUnlocked(l) && !(p.results[l.id]?.stars > 0));

  const nodes = LEVELS.map((l, i) => {
    const unlocked = isUnlocked(l);
    const stars = p.results[l.id]?.stars ?? 0;
    const state = !unlocked ? 'locked' : stars > 0 ? 'done' : 'current';
    const off = OFFSETS[i % OFFSETS.length];
    return `<div class="node-row" style="--off:${off}px">
      <a class="node ${state} ${i === currentIdx ? 'pulse' : ''}" href="${unlocked ? `#/leccion/${l.id}` : '#/'}" data-locked="${!unlocked}" aria-label="${l.title}">
        <span class="node-icon">${unlocked ? TYPE_ICON[l.type] : '🔒'}</span>
        <span class="node-stars">${[1, 2, 3].map((s) => `<i class="${s <= stars ? 'on' : ''}">★</i>`).join('')}</span>
      </a>
      <div class="node-label"><small>Nivel ${i + 1} · ${TYPE_LABEL[l.type]}</small>${l.title}</div>
    </div>`;
  }).join('');

  const owned = SHOP_ITEMS.filter((s) => p.owned.includes(s.id));
  const extras = owned.length
    ? `<section class="extras"><h2>Tus extras</h2><div class="extra-list">${owned
        .map(
          (s) => `<a class="extra" href="#/leccion/${s.id}"><span>${TYPE_ICON[s.type]}</span><div><b>${s.title}</b><small>${TYPE_LABEL[s.type]} · ${
            '★'.repeat(p.results[s.id]?.stars ?? 0) || 'Sin practicar'
          }</small></div></a>`,
        )
        .join('')}</div></section>`
    : '';

  const done = LEVELS.filter((l) => p.results[l.id]?.stars > 0).length;

  return {
    html: `
      <section class="hero">
        <h1>Tu camino mágico</h1>
        <p>Completa cada nivel practicando frente a la cámara. La IA revisa tu técnica y te premia con monedas.</p>
        <div class="progressbar"><div style="width:${(done / LEVELS.length) * 100}%"></div></div>
        <small>${done} de ${LEVELS.length} niveles completados</small>
      </section>
      <section class="path">${nodes}
        <div class="node-row" style="--off:0px"><div class="node goal">🏆</div><div class="node-label">¡Más niveles muy pronto!</div></div>
      </section>
      ${extras}`,
    mount(root) {
      root.querySelectorAll('.node[data-locked="true"]').forEach((a) =>
        a.addEventListener('click', (e) => {
          e.preventDefault();
          a.classList.remove('shake');
          void a.offsetWidth;
          a.classList.add('shake');
        }),
      );
    },
  };
}
