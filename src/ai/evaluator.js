// Evaluación local (en el dispositivo) a partir de los puntos de la mano.
// Mide: presencia de las manos, estabilidad, fluidez del movimiento y
// encuadre. Es una evaluación heurística; el coach IA (Claude) agrega una
// revisión visual de la técnica cuando está activado.

const WRIST = 0;
const TIPS = [4, 8, 12, 16, 20];

export class PracticeEvaluator {
  constructor(practice) {
    this.p = practice;
    this.frames = 0;
    this.goodFrames = 0; // frames con las manos requeridas
    this.anyHandFrames = 0;
    this.edgeFrames = 0; // manos cortadas por el borde
    this.wristMoves = [];
    this.tipMoves = [];
    this.prev = null;
    this.startedAt = performance.now();
  }

  addFrame(result) {
    this.frames++;
    const hands = result?.landmarks || [];
    if (hands.length > 0) this.anyHandFrames++;
    if (hands.length >= this.p.hands) this.goodFrames++;

    if (hands.some((lm) => lm.some((pt) => pt.x < 0.02 || pt.x > 0.98 || pt.y < 0.02 || pt.y > 0.98))) {
      this.edgeFrames++;
    }

    if (hands.length) {
      const cur = hands.map((lm) => ({ wrist: lm[WRIST], tips: TIPS.map((t) => lm[t]), size: handSize(lm) }));
      if (this.prev && this.prev.length === cur.length) {
        for (let i = 0; i < cur.length; i++) {
          const s = cur[i].size || 0.1;
          this.wristMoves.push(dist(cur[i].wrist, this.prev[i].wrist) / s);
          const tipMove = cur[i].tips.reduce((acc, t, k) => acc + dist(t, this.prev[i].tips[k]), 0) / TIPS.length;
          this.tipMoves.push(tipMove / s);
        }
      }
      this.prev = cur;
    } else {
      this.prev = null;
    }
  }

  // Indicación en vivo para el usuario
  liveHint(result) {
    const n = result?.landmarks?.length || 0;
    if (n === 0) return 'No veo tus manos: acércalas a la cámara';
    if (n < this.p.hands) return 'Muestra ambas manos';
    return null;
  }

  finish() {
    const seconds = (performance.now() - this.startedAt) / 1000;
    const frames = Math.max(1, this.frames);
    const presence = this.goodFrames / frames;
    const framing = this.anyHandFrames ? 1 - this.edgeFrames / this.anyHandFrames : 0;
    const wrist = median(this.wristMoves);
    const tips = mean(this.tipMoves);
    const jitter = stdev(this.tipMoves);

    const feedback = [];
    const metrics = [];

    // Presencia
    const presenceScore = clamp01((presence - 0.3) / 0.6);
    metrics.push({ label: this.p.hands === 2 ? 'Ambas manos visibles' : 'Mano visible', value: presenceScore });
    if (presence < 0.6) feedback.push(this.p.hands === 2 ? 'Mantén las dos manos dentro del encuadre todo el tiempo.' : 'Mantén la mano dentro del encuadre todo el tiempo.');

    // Encuadre
    const framingScore = clamp01((framing - 0.5) / 0.45);
    metrics.push({ label: 'Encuadre', value: framingScore });
    if (this.anyHandFrames && framing < 0.8) feedback.push('Tus manos se salen por el borde: aléjate un poco de la cámara.');

    let techniqueScore;
    if (this.p.mode === 'hold') {
      // Para posiciones: la mano debe estar quieta
      const stability = isFinite(wrist) ? clamp01(1 - (wrist - 0.01) / 0.08) : 0;
      techniqueScore = stability;
      metrics.push({ label: 'Estabilidad', value: stability });
      if (stability < 0.6) feedback.push('La mano se mueve mucho: relájala y mantén la posición.');
    } else {
      // Para movimientos: debe haber actividad, con ritmo parejo
      const activity = isFinite(tips) ? clamp01((tips - 0.008) / 0.05) : 0;
      const smooth = isFinite(jitter) && tips > 0 ? clamp01(1 - (jitter / (tips + 1e-6) - 0.6) / 1.6) : 0;
      techniqueScore = activity * 0.6 + smooth * 0.4;
      metrics.push({ label: 'Actividad', value: activity });
      metrics.push({ label: 'Fluidez', value: smooth });
      if (activity < 0.4) feedback.push('Casi no detecto movimiento: realiza la técnica de forma continua.');
      if (smooth < 0.5 && activity >= 0.4) feedback.push('El movimiento es irregular: busca un ritmo más constante.');
    }

    const durationScore = clamp01(seconds / (this.p.seconds * 0.8));
    // Si no se ven las manos, el resto de métricas no cuenta.
    const score = Math.round(100 * presenceScore * (0.35 + framingScore * 0.15 + techniqueScore * 0.4 + durationScore * 0.1));

    if (!feedback.length) feedback.push('¡Buen trabajo! Manos visibles, buen encuadre y movimiento controlado.');

    return { score, metrics, feedback, seconds, frames: this.frames };
  }
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
function handSize(lm) {
  return dist(lm[0], lm[9]); // muñeca → base del dedo medio
}
function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}
function mean(a) {
  return a.length ? a.reduce((s, v) => s + v, 0) / a.length : NaN;
}
function median(a) {
  if (!a.length) return NaN;
  const s = [...a].sort((x, y) => x - y);
  return s[Math.floor(s.length / 2)];
}
function stdev(a) {
  if (a.length < 2) return NaN;
  const m = mean(a);
  return Math.sqrt(mean(a.map((v) => (v - m) ** 2)));
}
