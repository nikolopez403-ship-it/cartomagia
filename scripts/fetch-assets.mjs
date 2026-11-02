// Copia el runtime WASM de MediaPipe y descarga el modelo de manos a public/
// para que la app funcione sin conexión dentro del APK.
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'mediapipe');
mkdirSync(outDir, { recursive: true });

cpSync(join(root, 'node_modules', '@mediapipe', 'tasks-vision', 'wasm'), join(outDir, 'wasm'), { recursive: true });

const modelPath = join(outDir, 'hand_landmarker.task');
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

if (!existsSync(modelPath)) {
  console.log('Descargando modelo de manos…');
  const res = await fetch(MODEL_URL);
  if (!res.ok) throw new Error(`No se pudo descargar el modelo: HTTP ${res.status}`);
  writeFileSync(modelPath, Buffer.from(await res.arrayBuffer()));
}
console.log('Assets de MediaPipe listos.');
