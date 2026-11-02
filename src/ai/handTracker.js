// Detección de manos en el dispositivo con MediaPipe (sin conexión).
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

let landmarkerPromise = null;

export function loadHandLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const fileset = await FilesetResolver.forVisionTasks('./mediapipe/wasm');
      const opts = (delegate) => ({
        baseOptions: { modelAssetPath: './mediapipe/hand_landmarker.task', delegate },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      try {
        return await HandLandmarker.createFromOptions(fileset, opts('GPU'));
      } catch (e) {
        console.warn('GPU no disponible, usando CPU', e);
        return await HandLandmarker.createFromOptions(fileset, opts('CPU'));
      }
    })().catch((e) => {
      landmarkerPromise = null;
      throw e;
    });
  }
  return landmarkerPromise;
}

const CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20], [0, 17],
];

export function drawHands(ctx, result, w, h) {
  ctx.clearRect(0, 0, w, h);
  if (!result?.landmarks) return;
  result.landmarks.forEach((lm, i) => {
    const color = i === 0 ? '#f6d27a' : '#7ad7f6';
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (const [a, b] of CONNECTIONS) {
      ctx.moveTo(lm[a].x * w, lm[a].y * h);
      ctx.lineTo(lm[b].x * w, lm[b].y * h);
    }
    ctx.stroke();
    ctx.fillStyle = '#fff';
    for (const p of lm) {
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}
