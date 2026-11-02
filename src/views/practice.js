import { getLesson, LEVELS, starsFor, PASS_SCORE } from '../data/levels.js';
import { getSettings, isUnlocked, recordAttempt, updateSettings } from '../state.js';
import { loadHandLandmarker, drawHands } from '../ai/handTracker.js';
import { PracticeEvaluator } from '../ai/evaluator.js';
import { reviewWithCoach, errorMessage } from '../ai/coach.js';
import { confetti } from '../ui.js';

const COACH_FRAMES = 6;

export function renderPractice(id) {
  const lesson = getLesson(id);
  if (!lesson || !isUnlocked(lesson)) {
    return { html: `<div class="empty"><p>Lección no disponible.</p><a class="btn" href="#/">Volver</a></div>` };
  }

  return {
    html: `
      <div class="practice">
        <div class="practice-top">
          <a href="#/leccion/${id}" class="icon-btn" aria-label="Cerrar">✕</a>
          <div class="practice-title"><small>Práctica</small>${lesson.title}</div>
          <button class="icon-btn" data-flip aria-label="Cambiar cámara">🔄</button>
        </div>
        <div class="stage">
          <video playsinline muted autoplay class="cam"></video>
          <canvas class="overlay"></canvas>
          <div class="hud">
            <div class="hint" hidden></div>
            <div class="countdown" hidden></div>
            <div class="rec" hidden><span class="dot-rec"></span><span class="rec-time">0</span>s</div>
          </div>
          <div class="status">Preparando cámara e IA…</div>
          <div class="timebar"><div></div></div>
        </div>
        <div class="practice-bottom">
          <p class="instructions">${lesson.practice.instructions}</p>
          <button class="btn primary big" data-start disabled>Grabar (${lesson.practice.seconds}s)</button>
          <button class="btn danger big" data-stop hidden>Terminar</button>
        </div>
        <div class="results" hidden></div>
      </div>`,
    mount(root) {
      return mountPractice(root, lesson);
    },
  };
}

function mountPractice(root, lesson) {
  const $ = (s) => root.querySelector(s);
  const video = $('.cam');
  const overlay = $('.overlay');
  const ctx = overlay.getContext('2d');
  const status = $('.status');
  const hint = $('.hint');
  const startBtn = $('[data-start]');
  const stopBtn = $('[data-stop]');
  const countdownEl = $('.countdown');
  const recEl = $('.rec');
  const recTime = $('.rec-time');
  const timebar = $('.timebar div');
  const results = $('.results');

  let stream = null;
  let landmarker = null;
  let raf = 0;
  let alive = true;
  let mode = 'idle'; // idle | countdown | recording | done
  let evaluator = null;
  let recorder = null;
  let chunks = [];
  let recStart = 0;
  let frameTimes = [];
  let frames = [];
  let lastTs = -1;
  let lastResult = null;
  let timers = [];
  const snap = document.createElement('canvas');

  async function startCamera() {
    stopStream();
    const facing = getSettings().facing;
    root.querySelector('.stage').classList.toggle('mirror', facing === 'user');
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
    } catch (e) {
      status.innerHTML = `No se pudo acceder a la cámara.<br><small>${e.name === 'NotAllowedError' ? 'Concede el permiso de cámara a Cartomagia en los ajustes.' : e.message}</small><br><button class="btn" data-retry>Reintentar</button>`;
      status.hidden = false;
      status.querySelector('[data-retry]').onclick = startCamera;
      return false;
    }
    if (!alive) return stopStream();
    video.srcObject = stream;
    await video.play().catch(() => {});
    await new Promise((r) => (video.readyState >= 2 ? r() : video.addEventListener('loadeddata', r, { once: true })));
    overlay.width = video.videoWidth;
    overlay.height = video.videoHeight;
    return true;
  }

  function stopStream() {
    stream?.getTracks().forEach((t) => t.stop());
    stream = null;
  }

  function loop() {
    if (!alive) return;
    raf = requestAnimationFrame(loop);
    if (!landmarker || video.readyState < 2) return;
    const ts = performance.now();
    if (ts - lastTs < 33) return; // ~30 fps máx.
    lastTs = ts;
    lastResult = landmarker.detectForVideo(video, ts);
    drawHands(ctx, lastResult, overlay.width, overlay.height);

    if (mode === 'recording') {
      evaluator.addFrame(lastResult);
      const t = (ts - recStart) / 1000;
      recTime.textContent = Math.floor(t);
      timebar.style.width = Math.min(100, (t / lesson.practice.seconds) * 100) + '%';
      if (frameTimes.length && t >= frameTimes[0]) {
        frameTimes.shift();
        frames.push(captureFrame());
      }
      if (t >= lesson.practice.seconds) stopRecording();
    }
    const h = mode === 'idle' || mode === 'recording' ? (evaluator || new PracticeEvaluator(lesson.practice)).liveHint(lastResult) : null;
    hint.hidden = !h;
    if (h) hint.textContent = h;
  }

  function captureFrame() {
    const w = 512;
    snap.width = w;
    snap.height = Math.round((video.videoHeight / video.videoWidth) * w);
    snap.getContext('2d').drawImage(video, 0, 0, snap.width, snap.height);
    return snap.toDataURL('image/jpeg', 0.72).split(',')[1];
  }

  function startCountdown() {
    mode = 'countdown';
    startBtn.hidden = true;
    results.hidden = true;
    let n = 3;
    countdownEl.hidden = false;
    countdownEl.textContent = n;
    const tick = () => {
      n--;
      if (!alive) return;
      if (n === 0) {
        countdownEl.hidden = true;
        startRecording();
      } else {
        countdownEl.textContent = n;
        timers.push(setTimeout(tick, 900));
      }
    };
    timers.push(setTimeout(tick, 900));
  }

  function startRecording() {
    mode = 'recording';
    evaluator = new PracticeEvaluator(lesson.practice);
    frames = [];
    const secs = lesson.practice.seconds;
    frameTimes = Array.from({ length: COACH_FRAMES }, (_, i) => ((i + 0.5) * secs) / COACH_FRAMES);
    chunks = [];
    try {
      const mime = ['video/webm;codecs=vp9', 'video/webm', 'video/mp4'].find((m) => window.MediaRecorder?.isTypeSupported?.(m));
      recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      recorder.start(500);
    } catch {
      recorder = null; // la evaluación funciona igual sin el video
    }
    recStart = performance.now();
    recEl.hidden = false;
    stopBtn.hidden = false;
  }

  async function stopRecording() {
    if (mode !== 'recording') return;
    mode = 'done';
    recEl.hidden = true;
    stopBtn.hidden = true;
    timebar.style.width = '0%';
    const videoUrl = await new Promise((resolve) => {
      if (!recorder || recorder.state === 'inactive') return resolve(null);
      recorder.onstop = () => resolve(chunks.length ? URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType })) : null);
      recorder.stop();
    });
    const local = evaluator.finish();
    showResults({ local, videoUrl });
  }

  async function showResults({ local, videoUrl }) {
    const settings = getSettings();
    const useCoach = settings.useCoach && settings.apiKey && frames.length > 0;
    results.hidden = false;
    results.innerHTML = `<div class="analyzing"><div class="spinner"></div><p>${useCoach ? 'El coach IA está revisando tu técnica…' : 'Analizando tu práctica…'}</p></div>`;

    let coach = null;
    let coachError = null;
    if (useCoach) {
      try {
        coach = await reviewWithCoach({ apiKey: settings.apiKey, lesson, frames, localResult: local });
      } catch (e) {
        coachError = errorMessage(e);
      }
    } else {
      await new Promise((r) => setTimeout(r, 700));
    }
    if (!alive) return;

    const score = coach ? Math.round(local.score * 0.35 + coach.puntuacion * 0.65) : local.score;
    const gained = recordAttempt(lesson, score);
    const stars = starsFor(score);
    const passed = score >= PASS_SCORE;
    const idx = LEVELS.findIndex((l) => l.id === lesson.id);
    const next = idx >= 0 ? LEVELS[idx + 1] : null;

    results.innerHTML = `
      <div class="result-card ${passed ? 'pass' : 'fail'}">
        <div class="score-ring" style="--p:${score}"><span>${score}</span></div>
        <div class="result-stars">${[1, 2, 3].map((s) => `<i class="${s <= stars ? 'on' : ''}">★</i>`).join('')}</div>
        <h2>${passed ? (stars === 3 ? '¡Magistral!' : '¡Lo lograste!') : 'Casi… ¡sigue practicando!'}</h2>
        <div class="rewards">
          ${gained.coins ? `<span class="reward coins">+${gained.coins} 🪙</span>` : ''}
          <span class="reward">+${gained.points} ⭐</span>
          ${gained.newBest ? '<span class="reward">Nuevo récord</span>' : ''}
        </div>

        <h3>Análisis de manos (en tu teléfono)</h3>
        <div class="metrics">${local.metrics
          .map((m) => `<div class="metric"><span>${m.label}</span><div class="bar"><div style="width:${Math.round(m.value * 100)}%"></div></div></div>`)
          .join('')}</div>
        <ul class="feedback">${local.feedback.map((f) => `<li>${f}</li>`).join('')}</ul>

        ${
          coach
            ? `<h3>🧙 Coach IA</h3>
               <p class="coach-msg">${escapeHtml(coach.comentario)}</p>
               ${coach.aciertos.length ? `<p class="lbl ok">Lo que haces bien</p><ul class="feedback ok">${coach.aciertos.map((a) => `<li>${escapeHtml(a)}</li>`).join('')}</ul>` : ''}
               ${coach.mejoras.length ? `<p class="lbl">Para mejorar</p><ul class="feedback">${coach.mejoras.map((a) => `<li>${escapeHtml(a)}</li>`).join('')}</ul>` : ''}`
            : coachError
              ? `<p class="note">⚠️ ${coachError} Se usó solo el análisis local.</p>`
              : `<p class="note">💡 Activa el <a href="#/perfil">Coach IA</a> en tu perfil para que una IA revise visualmente tu técnica.</p>`
        }

        ${videoUrl ? `<h3>Tu grabación</h3><video class="replay" src="${videoUrl}" controls playsinline></video>` : ''}

        <div class="result-actions">
          <button class="btn big" data-again>Repetir</button>
          ${passed && next ? `<a class="btn primary big" href="#/leccion/${next.id}">Siguiente nivel →</a>` : `<a class="btn primary big" href="#/leccion/${lesson.id}">Ver lección</a>`}
        </div>
      </div>`;
    if (passed) confetti(results);
    results.querySelector('[data-again]').onclick = () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      results.hidden = true;
      mode = 'idle';
      startBtn.hidden = false;
    };
    results.scrollTop = 0;
  }

  startBtn.onclick = startCountdown;
  stopBtn.onclick = stopRecording;
  root.querySelector('[data-flip]').onclick = async () => {
    if (mode === 'recording' || mode === 'countdown') return;
    updateSettings({ facing: getSettings().facing === 'user' ? 'environment' : 'user' });
    await startCamera();
  };

  (async () => {
    const [camOk] = await Promise.all([
      startCamera(),
      loadHandLandmarker()
        .then((l) => (landmarker = l))
        .catch((e) => {
          console.error(e);
          status.textContent = 'No se pudo cargar la IA de manos: ' + e.message;
        }),
    ]);
    if (!alive) return;
    if (camOk && landmarker) {
      status.hidden = true;
      startBtn.disabled = false;
      loop();
    }
  })();

  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    timers.forEach(clearTimeout);
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    stopStream();
  };
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
