import { ALL_LESSONS, LEVELS } from '../data/levels.js';
import { addCoins, getProgress, getSettings, resetProgress, updateSettings } from '../state.js';
import { appLogo } from '../illustrations.js';
import { toast } from '../ui.js';

function rank(points) {
  const ranks = [
    [0, 'Aprendiz'],
    [150, 'Iniciado'],
    [400, 'Prestidigitador'],
    [800, 'Ilusionista'],
    [1500, 'Gran Mago'],
  ];
  let r = ranks[0][1];
  for (const [min, name] of ranks) if (points >= min) r = name;
  return r;
}

export function renderProfile() {
  const p = getProgress();
  const s = getSettings();
  const completed = Object.values(p.results).filter((r) => r.stars > 0).length;
  const stars = Object.values(p.results).reduce((a, r) => a + r.stars, 0);
  const attempts = Object.values(p.results).reduce((a, r) => a + r.attempts, 0);
  const maskedKey = s.apiKey ? s.apiKey.slice(0, 10) + '…' + s.apiKey.slice(-4) : '';

  return {
    html: `
      <section class="profile-head">
        ${appLogo(72)}
        <div><h1>${rank(p.points)}</h1><p>${p.points} puntos · racha de ${p.streak.count} día(s)</p></div>
      </section>
      <section class="stat-grid">
        <div><b>${completed}/${ALL_LESSONS.length}</b><small>Lecciones</small></div>
        <div><b>${stars}</b><small>Estrellas</small></div>
        <div><b>${attempts}</b><small>Prácticas</small></div>
        <div><b>${p.coins}</b><small>Monedas</small></div>
      </section>

      <section class="panel">
        <h2>🧙 Coach IA</h2>
        <p>El análisis de manos funciona siempre, sin internet. Además, el Coach IA puede revisar fotogramas de tu práctica con Claude para darte correcciones concretas sobre la técnica.</p>
        <label class="switch"><input type="checkbox" data-coach ${s.useCoach ? 'checked' : ''}/> Usar Coach IA (requiere internet)</label>
        <label class="field">Clave de API de Anthropic
          <input type="password" data-key placeholder="${maskedKey || 'sk-ant-…'}" autocomplete="off"/>
        </label>
        <div class="row">
          <button class="btn primary" data-save>Guardar clave</button>
          ${s.apiKey ? '<button class="btn ghost" data-clear>Borrar clave</button>' : ''}
        </div>
        <p class="note">Beta: la clave se guarda solo en este dispositivo. En la versión final el coach funcionará mediante nuestro servidor, sin pedir clave.</p>
      </section>

      <section class="panel">
        <h2>🧪 Herramientas de la beta</h2>
        <div class="row">
          <button class="btn ghost" data-coins>+200 monedas</button>
          <button class="btn danger" data-reset>Reiniciar progreso</button>
        </div>
        <p class="note">Cartomagia v0.1.0 · ${LEVELS.length} niveles de ejemplo</p>
      </section>`,
    mount(root) {
      const rerender = () => window.dispatchEvent(new HashChangeEvent('hashchange'));
      root.querySelector('[data-coach]').onchange = (e) => updateSettings({ useCoach: e.target.checked });
      root.querySelector('[data-save]').onclick = () => {
        const v = root.querySelector('[data-key]').value.trim();
        if (!v) return toast('Escribe tu clave primero');
        updateSettings({ apiKey: v, useCoach: true });
        toast('Clave guardada');
        rerender();
      };
      root.querySelector('[data-clear]')?.addEventListener('click', () => {
        updateSettings({ apiKey: '' });
        toast('Clave borrada');
        rerender();
      });
      root.querySelector('[data-coins]').onclick = () => {
        addCoins(200);
        toast('+200 monedas de prueba');
        rerender();
      };
      root.querySelector('[data-reset]').onclick = () => {
        if (confirm('¿Borrar todo tu progreso?')) {
          resetProgress();
          rerender();
        }
      };
    },
  };
}
