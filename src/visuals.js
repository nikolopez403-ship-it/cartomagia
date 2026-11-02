// Visuales de cada paso: animación (escena de src/anim/scenes.js) o foto.
import { SCENES } from './anim/scenes.js';
import { svgFrame } from './anim/parts.js';
import { Player, captionAt } from './anim/engine.js';

let slowMotion = false;

const isPhoto = (image) => image && /[/.]/.test(image);

export function visualHTML(image, { interactive = true } = {}) {
  if (isPhoto(image)) return `<div class="visual"><div class="v-stage"><img src="${image}" alt="" loading="lazy"/></div></div>`;
  const scene = SCENES[image];
  if (!scene) return `<div class="visual"><div class="v-stage">${svgFrame('')}</div></div>`;
  if (!interactive) return `<div class="visual"><div class="v-stage">${svgFrame(scene.render(scene.dur * 0.62))}</div></div>`;
  return `<div class="visual anim" data-scene="${image}">
    <div class="v-stage">${svgFrame(scene.render(0))}<div class="v-caption">${captionAt(0, scene.captions)}</div></div>
    <div class="v-controls">
      <button class="v-btn" data-v="play" aria-label="Pausar">❚❚</button>
      <button class="v-btn" data-v="restart" aria-label="Repetir">↺</button>
      <div class="v-progress"><div></div></div>
      <button class="v-btn v-slow ${slowMotion ? 'on' : ''}" data-v="slow" aria-label="Cámara lenta">🐢</button>
    </div>
  </div>`;
}

export function mountVisuals(root) {
  const players = [];
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  root.querySelectorAll('.visual.anim').forEach((el) => {
    const scene = SCENES[el.dataset.scene];
    const caption = el.querySelector('.v-caption');
    const bar = el.querySelector('.v-progress div');
    const player = new Player(el.querySelector('svg'), scene, {
      onCaption: (c) => {
        caption.textContent = c;
        caption.classList.remove('in');
        void caption.offsetWidth;
        caption.classList.add('in');
      },
      onProgress: (p) => (bar.style.width = `${(p * 100).toFixed(1)}%`),
    });
    player.setSpeed(slowMotion ? 0.45 : 1);
    if (reduce) player.toggle();
    const playBtn = el.querySelector('[data-v="play"]');
    const sync = () => {
      playBtn.textContent = player.playing ? '❚❚' : '▶';
      playBtn.setAttribute('aria-label', player.playing ? 'Pausar' : 'Reproducir');
    };
    sync();
    playBtn.onclick = () => {
      player.toggle();
      sync();
    };
    el.querySelector('.v-stage').onclick = () => {
      player.toggle();
      sync();
    };
    el.querySelector('[data-v="restart"]').onclick = () => {
      if (!player.playing) player.toggle();
      player.restart();
      sync();
    };
    el.querySelector('[data-v="slow"]').onclick = () => {
      slowMotion = !slowMotion;
      players.forEach(({ player: p, el: e }) => {
        p.setSpeed(slowMotion ? 0.45 : 1);
        e.querySelector('.v-slow').classList.toggle('on', slowMotion);
      });
    };
    players.push({ player, el });
  });

  // Solo se anima lo que está a la vista (ahorra batería)
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const item = players.find((p) => p.el === e.target);
        item?.player.setVisible(e.isIntersecting && e.intersectionRatio >= 0.25);
      }
    },
    { threshold: [0, 0.25, 0.5, 1] },
  );
  players.forEach(({ el }) => io.observe(el));

  return () => {
    io.disconnect();
    players.forEach(({ player }) => player.destroy());
  };
}
