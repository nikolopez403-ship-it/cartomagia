// Motor de animación mínimo: interpolación por fotogramas clave y un
// reproductor que dibuja la escena en un <svg> con requestAnimationFrame.

export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, k) => a + (b - a) * k;
export const easeInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);
export const easeOut = (k) => 1 - (1 - k) ** 3;
export const easeIn = (k) => k * k * k;
export const linear = (k) => k;

// Mezcla números u objetos (anidados) de números.
export function mix(a, b, k) {
  if (typeof a === 'number' && typeof b === 'number') return lerp(a, b, k);
  if (a && b && typeof a === 'object') {
    const out = Array.isArray(a) ? [] : {};
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (!(key in b)) out[key] = a[key];
      else if (!(key in a)) out[key] = b[key];
      else out[key] = mix(a[key], b[key], k);
    }
    return out;
  }
  return k < 0.5 ? a : b;
}

// keys: [[tiempo, valor, easing?], ...] ordenados por tiempo.
// El easing de un fotograma clave se usa para llegar a ese fotograma.
export function track(t, keys) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i];
    const [t1, v1, ease = easeInOut] = keys[i + 1];
    if (t <= t1) return mix(v0, v1, ease(clamp((t - t0) / (t1 - t0 || 1))));
  }
  return keys[keys.length - 1][1];
}

// Progreso 0..1 dentro de un intervalo
export const span = (t, t0, t1, ease = easeInOut) => ease(clamp((t - t0) / (t1 - t0)));

// Subtítulo vigente: captions = [[tiempo, texto], ...]
export function captionAt(t, captions = []) {
  let c = captions[0]?.[1] || '';
  for (const [ct, text] of captions) if (t >= ct) c = text;
  return c;
}

export class Player {
  constructor(svgRoot, scene, { onCaption, onProgress } = {}) {
    this.layer = svgRoot.querySelector('[data-layer]');
    this.scene = scene;
    this.t = 0;
    this.speed = 1;
    this.playing = true;
    this.visible = false;
    this.last = 0;
    this.raf = 0;
    this.onCaption = onCaption;
    this.onProgress = onProgress;
    this.lastCaption = null;
    this.frame = this.frame.bind(this);
    this.draw();
  }
  draw() {
    this.layer.innerHTML = this.scene.render(this.t);
    const cap = captionAt(this.t, this.scene.captions);
    if (cap !== this.lastCaption) {
      this.lastCaption = cap;
      this.onCaption?.(cap);
    }
    this.onProgress?.(this.t / this.scene.dur);
  }
  frame(now) {
    this.raf = 0;
    if (!this.playing || !this.visible) return;
    const dt = Math.min(0.1, (now - (this.last || now)) / 1000);
    this.last = now;
    this.t = (this.t + dt * this.speed) % this.scene.dur;
    this.draw();
    this.raf = requestAnimationFrame(this.frame);
  }
  kick() {
    if (!this.raf && this.playing && this.visible) {
      this.last = 0;
      this.raf = requestAnimationFrame(this.frame);
    }
  }
  setVisible(v) {
    this.visible = v;
    this.kick();
  }
  toggle() {
    this.playing = !this.playing;
    this.kick();
    return this.playing;
  }
  restart() {
    this.t = 0;
    this.draw();
    this.kick();
  }
  setSpeed(s) {
    this.speed = s;
  }
  destroy() {
    cancelAnimationFrame(this.raf);
    this.playing = false;
  }
}
