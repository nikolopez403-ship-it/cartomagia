import { getLesson, TYPE_LABEL, TYPE_ICON } from '../data/levels.js';
import { getProgress, isUnlocked } from '../state.js';
import { renderImage } from '../illustrations.js';

export function renderLesson(id) {
  const l = getLesson(id);
  if (!l || !isUnlocked(l)) {
    return { html: `<div class="empty"><p>Esta lección está bloqueada.</p><a class="btn" href="#/">Volver al camino</a></div>` };
  }
  const r = getProgress().results[id];

  const steps = l.steps
    .map(
      (s, i) => `<article class="step" data-step="${i}">
      <div class="step-img">${renderImage(s.image)}</div>
      <div class="step-body">
        <span class="step-num">Paso ${i + 1} de ${l.steps.length}</span>
        <h3>${s.title}</h3>
        <p>${s.text}</p>
        ${s.tip ? `<p class="tip">💡 ${s.tip}</p>` : ''}
      </div>
    </article>`,
    )
    .join('');

  return {
    html: `
      <a href="#/" class="back">← Camino</a>
      <section class="lesson-head">
        <span class="chip">${TYPE_ICON[l.type]} ${TYPE_LABEL[l.type]}</span>
        <span class="chip">${'◆'.repeat(l.difficulty)}${'◇'.repeat(3 - l.difficulty)} Dificultad</span>
        <span class="chip gold">🪙 ${l.reward}</span>
        <h1>${l.title}</h1>
        <p class="subtitle">${l.subtitle}</p>
        <p>${l.intro}</p>
        ${r ? `<p class="best">Mejor puntuación: <b>${r.best}</b> · ${'★'.repeat(r.stars)}${'☆'.repeat(3 - r.stars)} · ${r.attempts} intento(s)</p>` : ''}
      </section>

      <section class="carousel">
        <div class="steps">${steps}</div>
        <div class="dots">${l.steps.map((_, i) => `<button class="dot ${i === 0 ? 'on' : ''}" data-go="${i}" aria-label="Paso ${i + 1}"></button>`).join('')}</div>
        <div class="carousel-nav">
          <button class="btn ghost" data-dir="-1">Anterior</button>
          <button class="btn ghost" data-dir="1">Siguiente</button>
        </div>
      </section>

      <section class="practice-cta">
        <h2>🎥 ¡A practicar!</h2>
        <p>${l.practice.instructions}</p>
        <ul class="criteria">${l.practice.criteria.map((c) => `<li>${c}</li>`).join('')}</ul>
        <a class="btn primary big" href="#/practica/${l.id}">Practicar con la cámara</a>
      </section>`,
    mount(root) {
      const track = root.querySelector('.steps');
      const dots = [...root.querySelectorAll('.dot')];
      const current = () => Math.round(track.scrollLeft / track.clientWidth);
      const go = (i) => track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
      track.addEventListener('scroll', () => {
        const c = current();
        dots.forEach((d, i) => d.classList.toggle('on', i === c));
      });
      dots.forEach((d) => d.addEventListener('click', () => go(+d.dataset.go)));
      root.querySelectorAll('[data-dir]').forEach((b) =>
        b.addEventListener('click', () => go(Math.max(0, Math.min(l.steps.length - 1, current() + +b.dataset.dir)))),
      );
    },
  };
}
