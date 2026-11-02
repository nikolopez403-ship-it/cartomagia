// Piezas para dibujar: manos articuladas, cartas, baraja y efectos.

export const W = 320;
export const H = 220;
export const CW = 56; // ancho de carta
export const CH = 80; // alto de carta

const f = (n) => Math.round(n * 10) / 10;

export const DEFS = `
<defs>
  <linearGradient id="skF" x1="0" x2="1" y1="0" y2="0">
    <stop offset="0" stop-color="#e2a57f"/><stop offset=".45" stop-color="#f8d5b8"/><stop offset="1" stop-color="#dd9f78"/>
  </linearGradient>
  <radialGradient id="skP" cx="50%" cy="42%" r="65%">
    <stop offset="0" stop-color="#fbdcc2"/><stop offset=".7" stop-color="#f0c09d"/><stop offset="1" stop-color="#df a07a"/>
  </radialGradient>
  <radialGradient id="skB" cx="45%" cy="35%" r="70%">
    <stop offset="0" stop-color="#f7cfae"/><stop offset="1" stop-color="#e0a47e"/>
  </radialGradient>
  <linearGradient id="slv" x1="0" x2="1">
    <stop offset="0" stop-color="#140f24"/><stop offset=".5" stop-color="#2b2147"/><stop offset="1" stop-color="#140f24"/>
  </linearGradient>
  <linearGradient id="nail" x1="0" x2="0" y1="0" y2="1">
    <stop offset="0" stop-color="#fbe9e1"/><stop offset="1" stop-color="#efc4b4"/>
  </linearGradient>
  <pattern id="cbp" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect width="7" height="7" fill="#a32637"/><line x1="0" y1="0" x2="0" y2="7" stroke="#f6d27a" stroke-width="1.1" opacity=".5"/>
  </pattern>
  <radialGradient id="felt" cx="50%" cy="40%" r="80%">
    <stop offset="0" stop-color="#21704e"/><stop offset="1" stop-color="#0c3324"/>
  </radialGradient>
  <marker id="arw" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse">
    <path d="M0 0 L10 5 L0 10 z" fill="#f6d27a"/>
  </marker>
</defs>`.replace('#df a07a', '#dfa07a');

export const BG = `<rect width="${W}" height="${H}" fill="url(#felt)"/>
<g opacity=".08" fill="#fff"><circle cx="40" cy="30" r="60"/><circle cx="290" cy="200" r="80"/></g>`;

// ---------------- Mano ----------------
// Coordenadas locales: centro de la palma en (0,0), dedos hacia arriba (y negativa),
// muñeca hacia abajo. Mano izquierda con la palma hacia arriba: pulgar a la izquierda.
const FINGERS = {
  pinky: { bx: 23.5, by: -28, L: 44, W: 15, a: 9 },
  ring: { bx: 8.5, by: -36, L: 56, W: 17, a: 3 },
  middle: { bx: -7.5, by: -38, L: 61, W: 18, a: -1 },
  index: { bx: -23, by: -34, L: 55, W: 17.5, a: -6 },
};
const THUMB = { bx: -27, by: 8, L: 50, W: 21, a: -40 };
const SEG = [0.45, 0.32, 0.23];
const CURL = [72, 95, 68]; // grados por articulación con curl = 1
const OUTLINE = '#a86d4c';

export const POSES = {
  open: { index: { a: -4, c: 0 }, middle: { a: 0, c: 0 }, ring: { a: 3, c: 0 }, pinky: { a: 6, c: 0 }, thumb: { a: 0, c: 0 } },
  relax: { index: { a: 0, c: 0.12 }, middle: { a: 0, c: 0.15 }, ring: { a: 0, c: 0.18 }, pinky: { a: 0, c: 0.22 }, thumb: { a: 6, c: 0.1 } },
  fist: { index: { a: 0, c: 1.2 }, middle: { a: 0, c: 1.2 }, ring: { a: 0, c: 1.2 }, pinky: { a: 0, c: 1.2 }, thumb: { a: 30, c: 0.6 } },
};

function capsule(y0, y1, w, fill = 'url(#skF)') {
  const top = Math.min(y0, y1) - w / 2;
  const h = Math.abs(y1 - y0) + w;
  return `<rect x="${f(-w / 2)}" y="${f(top)}" width="${f(w)}" height="${f(h)}" rx="${f(w / 2)}" fill="${fill}" stroke="${OUTLINE}" stroke-width="1.5"/>`;
}

function nailAt(y, dir, w) {
  // y: extremo del dedo; dir: +1 si el segmento apunta hacia arriba
  const nw = w * 0.62;
  const nh = w * 0.7;
  const ny = dir > 0 ? y - w * 0.32 : y + w * 0.32 - nh;
  return `<rect x="${f(-nw / 2)}" y="${f(ny)}" width="${f(nw)}" height="${f(nh)}" rx="${f(nw / 2.2)}" fill="url(#nail)" stroke="#d19b86" stroke-width=".8"/>`;
}

// Devuelve { fwd, rev } con los segmentos que apuntan lejos del observador
// (fwd) y los que se curvan hacia él (rev) para poder intercalar capas.
function finger(def, p, side) {
  const segs = def === THUMB ? [0.56, 0.44] : SEG;
  const curls = def === THUMB ? [48, 62] : CURL;
  let y = 0;
  let phi = 0;
  const fwd = [];
  const rev = [];
  segs.forEach((ratio, i) => {
    phi += (p.c || 0) * curls[i];
    const len = def.L * ratio;
    const proj = len * Math.cos((phi * Math.PI) / 180);
    const w = def.W * (1 - i * 0.07);
    const y1 = y - proj;
    let svg = capsule(y, y1, w);
    const last = i === segs.length - 1;
    const dir = proj >= 0 ? 1 : -1;
    // Uña visible: palma arriba → cuando el dedo se curva hacia el observador;
    // dorso → cuando apunta lejos.
    if (last && ((side === 'palm' && dir < 0) || (side === 'back' && dir > 0))) svg += nailAt(y1, dir, w);
    if (side === 'palm' && dir > 0 && i > 0) svg += `<path d="M${f(-w * 0.3)} ${f(y + 1)} q${f(w * 0.3)} 2 ${f(w * 0.6)} 0" stroke="${OUTLINE}" stroke-width=".8" fill="none" opacity=".35"/>`;
    if (side === 'back' && dir > 0 && i > 0) svg += `<path d="M${f(-w * 0.25)} ${f(y - 1)} q${f(w * 0.25)} -2.5 ${f(w * 0.5)} 0" stroke="${OUTLINE}" stroke-width=".8" fill="none" opacity=".4"/>`;
    (proj >= 0 ? fwd : rev).push(svg);
    y = y1;
  });
  const t = `translate(${def.bx} ${def.by}) rotate(${f(def.a + (p.a || 0))})`;
  return {
    fwd: fwd.length ? `<g transform="${t}">${fwd.join('')}</g>` : '',
    rev: rev.length ? `<g transform="${t}">${rev.join('')}</g>` : '',
  };
}

function palmShape(side) {
  const d = 'M-34 -30 C-39 -6 -39 18 -30 36 C-20 50 20 51 29 37 C38 18 38 -6 34 -30 C27 -42 -27 -43 -34 -30 Z';
  let s = `<path d="${d}" fill="url(#${side === 'palm' ? 'skP' : 'skB'})" stroke="${OUTLINE}" stroke-width="1.6"/>`;
  if (side === 'palm') {
    s += `<path d="M-12 -20 Q-6 10 -18 38" stroke="${OUTLINE}" stroke-width="1.1" fill="none" opacity=".35"/>
          <path d="M-28 -12 Q2 -5 28 -19" stroke="${OUTLINE}" stroke-width="1" fill="none" opacity=".3"/>
          <ellipse cx="-19" cy="18" rx="13" ry="19" fill="#fff" opacity=".13"/>`;
  } else {
    s += [-23, -7.5, 8.5, 23.5]
      .map((x, i) => `<ellipse cx="${x}" cy="${-32 + (i === 3 ? 5 : i === 1 ? -3 : 0)}" rx="6.5" ry="4" fill="#fff" opacity=".25"/>`)
      .join('');
    s += `<g stroke="${OUTLINE}" stroke-width=".8" opacity=".25" fill="none"><path d="M-19 -22 L-8 30"/><path d="M-6 -26 L-2 32"/><path d="M8 -24 L5 32"/><path d="M21 -18 L13 30"/></g>`;
  }
  return s;
}

const SLEEVE = `<rect x="-34" y="50" width="68" height="170" rx="8" fill="url(#slv)"/>
<rect x="-31" y="38" width="62" height="17" rx="5" fill="#f4f1ea" stroke="#c9c2b4" stroke-width="1.2"/>
<circle cx="0" cy="46.5" r="3" fill="#f6d27a" stroke="#b68a2e" stroke-width=".8"/>`;

/**
 * Mano articulada.
 * p = { x, y, r, s, hand: 'left'|'right', side: 'palm'|'back', pose: {index:{a,c},...,thumb:{a,c,over}},
 *       hold: svg (en coords locales, se dibuja entre capas), ghost: 0..1, sleeve: bool }
 */
export function hand(p) {
  const side = p.side || 'palm';
  const pose = p.pose || POSES.relax;
  // izquierda+palma → sin espejo; derecha+dorso → sin espejo; resto → espejo
  const m = (p.hand || 'left') === 'left' ? side === 'back' : side === 'palm';
  const mt = m ? ' scale(-1 1)' : '';

  const parts = {};
  for (const k of Object.keys(FINGERS)) parts[k] = finger(FINGERS[k], pose[k] || {}, side);
  const th = finger(THUMB, pose.thumb || {}, side);
  const thumbOver = pose.thumb?.over;

  const fwd = Object.values(parts).map((x) => x.fwd).join('');
  const rev = Object.values(parts).map((x) => x.rev).join('');
  const sleeve = p.sleeve === false ? '' : SLEEVE;
  const wrap = (s) => `<g transform="scale(1)${mt}">${s}</g>`;
  const hold = p.hold || '';
  const top = p.top || '';

  let body;
  if (side === 'palm') {
    // pulgar (si no va encima), palma, segmentos hacia afuera, OBJETO, segmentos curvados, pulgar encima
    body =
      wrap(sleeve + (thumbOver ? '' : th.fwd + th.rev) + palmShape('palm') + fwd) +
      hold +
      wrap(rev + (thumbOver ? th.fwd + th.rev : '')) +
      top;
  } else {
    // dorso: lo curvado queda debajo del objeto
    body = wrap(rev + th.rev) + hold + wrap(sleeve + th.fwd + palmShape('back') + fwd) + top;
  }
  const op = p.ghost != null ? ` opacity="${f(p.ghost)}"` : '';
  return `<g transform="translate(${f(p.x)} ${f(p.y)}) rotate(${f(p.r || 0)}) scale(${p.s || 1})"${op}>${body}</g>`;
}

// ---------------- Cartas ----------------
function face(label, w, h) {
  const red = /[♥♦]/.test(label);
  const color = red ? '#c2182b' : '#1b1b24';
  const rank = label.slice(0, -1);
  const suit = label.slice(-1);
  return `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="5.5" fill="#fffdf7" stroke="#3a3348" stroke-width="1.2"/>
  <text x="${-w / 2 + 5}" y="${-h / 2 + 14}" font-size="12" font-weight="700" fill="${color}" font-family="Georgia,serif">${rank}</text>
  <text x="${-w / 2 + 5}" y="${-h / 2 + 25}" font-size="10" fill="${color}">${suit}</text>
  <g transform="rotate(180)"><text x="${-w / 2 + 5}" y="${-h / 2 + 14}" font-size="12" font-weight="700" fill="${color}" font-family="Georgia,serif">${rank}</text></g>
  <text x="0" y="10" font-size="28" text-anchor="middle" fill="${color}">${suit}</text>`;
}
function back(w, h) {
  return `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="5.5" fill="#8e1d2c" stroke="#fff" stroke-width="2.2"/>
  <rect x="${-w / 2 + 4.5}" y="${-h / 2 + 4.5}" width="${w - 9}" height="${h - 9}" rx="3" fill="url(#cbp)" stroke="#f6d27a" stroke-width=".9"/>`;
}

/**
 * Carta. flip: 0 = dorso, 1 = cara (se anima girando en X). lift: sombra más grande.
 */
export function card({ x = 0, y = 0, r = 0, s = 1, label = 'A♠', flip = 0, glow = 0, lift = 0, o = 1, w = CW, h = CH }) {
  const sx = Math.abs(Math.cos(flip * Math.PI));
  const showFace = flip >= 0.5;
  const shadow = `<rect x="${-w / 2 + 2 + lift * 6}" y="${-h / 2 + 3 + lift * 8}" width="${w}" height="${h}" rx="6" fill="#000" opacity="${f(0.22 + lift * 0.1)}"/>`;
  const g = glow
    ? `<rect x="${-w / 2 - 5}" y="${-h / 2 - 5}" width="${w + 10}" height="${h + 10}" rx="9" fill="none" stroke="#f6d27a" stroke-width="3" opacity="${f(glow)}"/>`
    : '';
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(r)}) scale(${f(s)})" opacity="${f(o)}">${shadow}<g transform="scale(${f(Math.max(0.02, sx))} 1)">${
    showFace ? face(label, w, h) : back(w, h)
  }${g}</g></g>`;
}

/** Baraja (pila). n = grosor visual. top = etiqueta si está cara arriba. */
export function deck({ x = 0, y = 0, r = 0, s = 1, n = 6, top = null, o = 1, w = CW, h = CH, shadow = true }) {
  let edges = '';
  for (let i = n; i >= 1; i--) {
    edges += `<rect x="${-w / 2 + i * 0.9}" y="${-h / 2 + i * 1.1}" width="${w}" height="${h}" rx="5.5" fill="${i % 2 ? '#efe7d6' : '#e2d8c3'}" stroke="#8a7b63" stroke-width=".7"/>`;
  }
  const sh = shadow ? `<rect x="${-w / 2 + 3}" y="${-h / 2 + n * 1.1 + 3}" width="${w + n}" height="${h}" rx="6" fill="#000" opacity=".25"/>` : '';
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(r)}) scale(${f(s)})" opacity="${f(o)}">${sh}${edges}${top ? face(top, w, h) : back(w, h)}</g>`;
}

// ---------------- Efectos ----------------
export function arrow(d, o = 1) {
  return `<path d="${d}" fill="none" stroke="#f6d27a" stroke-width="3.2" stroke-linecap="round" marker-end="url(#arw)" opacity="${f(o)}"/>`;
}

export function ring(x, y, rad = 16, o = 1, t = 0) {
  const pulse = 1 + 0.15 * Math.sin(t * 6);
  return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rad * pulse)}" fill="none" stroke="#f6d27a" stroke-width="2.6" stroke-dasharray="5 4" opacity="${f(o)}"/>`;
}

export function sparkle(x, y, s = 1, o = 1, rot = 0) {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f(s)})" opacity="${f(o)}"><path d="M0 -12 L3 -3 L12 0 L3 3 L0 12 L-3 3 L-12 0 L-3 -3 Z" fill="#ffe7a3"/></g>`;
}

export function sparkles(x, y, t, o = 1) {
  let s = '';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + t * 1.5;
    const rr = 30 + 6 * Math.sin(t * 5 + i);
    s += sparkle(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.8, 0.45 + 0.25 * Math.sin(t * 7 + i), o, t * 90);
  }
  return s;
}

export function eye(x, y, o = 1, open = 1) {
  return `<g transform="translate(${f(x)} ${f(y)})" opacity="${f(o)}">
    <path d="M-16 0 Q0 ${f(-13 * open)} 16 0 Q0 ${f(13 * open)} -16 0 Z" fill="#fff" stroke="#1a1426" stroke-width="2"/>
    <circle r="${f(5.5 * open)}" fill="#3a2a6e"/><circle r="${f(2.2 * open)}" fill="#000"/></g>`;
}

export function label(text, x = W / 2, y = 22, o = 1) {
  return `<g opacity="${f(o)}"><text x="${x}" y="${y}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#120d1f" stroke="#120d1f" stroke-width="5" stroke-linejoin="round" opacity=".6">${text}</text>
  <text x="${x}" y="${y}" text-anchor="middle" font-size="12.5" font-weight="800" fill="#fff4d6">${text}</text></g>`;
}

export function xray(svg, o = 0.55) {
  return `<g opacity="${f(o)}">${svg}</g>`;
}

export function svgFrame(inner) {
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img">${DEFS}${BG}<g data-layer>${inner || ''}</g></svg>`;
}
