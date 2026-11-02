// Progreso del usuario guardado en el dispositivo.
import { LEVELS, SHOP_ITEMS, starsFor } from './data/levels.js';

const KEY = 'cartomagia.progress.v1';
const SETTINGS_KEY = 'cartomagia.settings.v1';

const defaults = () => ({
  coins: 0,
  points: 0,
  owned: [], // ids comprados en la tienda
  results: {}, // id -> { best, stars, attempts, completedAt }
  streak: { count: 0, lastDay: null },
});

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* almacenamiento no disponible */
  }
}

let progress = load(KEY, defaults());
let settings = load(SETTINGS_KEY, { apiKey: '', useCoach: true, facing: 'user' });
const listeners = new Set();

export const getProgress = () => progress;
export const getSettings = () => settings;
export function onChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function emit() {
  save(KEY, progress);
  listeners.forEach((fn) => fn(progress));
}

export function updateSettings(patch) {
  settings = { ...settings, ...patch };
  save(SETTINGS_KEY, settings);
}

export function isUnlocked(lesson) {
  if (SHOP_ITEMS.some((s) => s.id === lesson.id)) return progress.owned.includes(lesson.id);
  const idx = LEVELS.findIndex((l) => l.id === lesson.id);
  if (idx <= 0) return true;
  return (progress.results[LEVELS[idx - 1].id]?.stars ?? 0) > 0;
}

export function isCompleted(id) {
  return (progress.results[id]?.stars ?? 0) > 0;
}

// Registra un intento y devuelve lo ganado.
export function recordAttempt(lesson, score) {
  const prev = progress.results[lesson.id] || { best: 0, stars: 0, attempts: 0 };
  const stars = starsFor(score);
  let coins = 0;
  let points = Math.round(score / 10); // puntos por practicar, siempre
  if (stars > 0 && prev.stars === 0) coins += lesson.reward; // primera vez superado
  coins += Math.max(0, stars - prev.stars) * 15; // bonus por cada estrella nueva
  if (score > prev.best) points += score - prev.best;

  progress.results[lesson.id] = {
    best: Math.max(prev.best, score),
    stars: Math.max(prev.stars, stars),
    attempts: prev.attempts + 1,
    completedAt: prev.completedAt || (stars > 0 ? Date.now() : null),
  };
  progress.coins += coins;
  progress.points += points;
  touchStreak();
  emit();
  return { coins, points, stars, newBest: score > prev.best };
}

function touchStreak() {
  const today = new Date().toISOString().slice(0, 10);
  const { lastDay, count } = progress.streak;
  if (lastDay === today) return;
  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  progress.streak = { count: lastDay === yesterday ? count + 1 : 1, lastDay: today };
}

export function buy(item) {
  if (progress.owned.includes(item.id)) return { ok: true };
  if (progress.coins < item.price) return { ok: false, reason: 'No tienes suficientes monedas' };
  progress.coins -= item.price;
  progress.owned.push(item.id);
  emit();
  return { ok: true };
}

export function resetProgress() {
  progress = defaults();
  emit();
}

// Solo para pruebas de la beta
export function addCoins(n) {
  progress.coins += n;
  emit();
}
