// Ilustraciones vectoriales para los pasos de cada lección.
// Cada escena es una función que devuelve SVG. Si en los datos de un paso
// `image` es una ruta (p. ej. "images/agarre-1.jpg"), se muestra esa foto en
// su lugar: así podremos reemplazar estas ilustraciones por fotos reales.

const SKIN = '#f3c9a3';
const SKIN_EDGE = '#b9805b';

function g(content, { x = 0, y = 0, r = 0, s = 1 } = {}) {
  return `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">${content}</g>`;
}

export function cardBack(x, y, r = 0, w = 56, h = 80) {
  return g(
    `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="6" fill="#8e1d2c" stroke="#fff" stroke-width="2.5"/>
     <rect x="${-w / 2 + 5}" y="${-h / 2 + 5}" width="${w - 10}" height="${h - 10}" rx="3" fill="url(#cmBackPattern)" stroke="#f6d27a" stroke-width="1"/>`,
    { x, y, r },
  );
}

export function cardFace(x, y, label = 'A♠', r = 0, w = 56, h = 80, glow = false) {
  const red = /[♥♦]/.test(label);
  const color = red ? '#c2182b' : '#1b1b24';
  const [rank, suit] = [label.slice(0, -1), label.slice(-1)];
  return g(
    `${glow ? `<rect x="${-w / 2 - 5}" y="${-h / 2 - 5}" width="${w + 10}" height="${h + 10}" rx="9" fill="none" stroke="#f6d27a" stroke-width="3" opacity=".9"/>` : ''}
     <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="6" fill="#fffdf7" stroke="#2a2438" stroke-width="1.5"/>
     <text x="${-w / 2 + 6}" y="${-h / 2 + 16}" font-size="13" font-weight="700" fill="${color}" font-family="Georgia,serif">${rank}</text>
     <text x="${-w / 2 + 6}" y="${-h / 2 + 29}" font-size="12" fill="${color}">${suit}</text>
     <text x="0" y="10" font-size="30" text-anchor="middle" fill="${color}">${suit}</text>`,
    { x, y, r },
  );
}

export function deck(x, y, r = 0, n = 6, w = 56, h = 80, top = 'back') {
  let out = '';
  for (let i = n - 1; i >= 0; i--) {
    out += `<rect x="${-w / 2 + i * 1.3}" y="${-h / 2 + i * 1.3}" width="${w}" height="${h}" rx="6" fill="#efe6d4" stroke="#7a6a55" stroke-width="1"/>`;
  }
  const topCard = top === 'back' ? cardBack(0, 0, 0, w, h) : cardFace(0, 0, top, 0, w, h);
  return g(out + topCard, { x, y, r });
}

// Mano estilizada vista desde arriba. Origen en el centro de la palma,
// dedos apuntando hacia arriba antes de rotar.
// pose: 'open' (dedos extendidos) | 'curl' (dedos curvados sobre el borde derecho)
export function hand(x, y, r = 0, { pose = 'open', s = 1, mirror = false, thumb = 'side' } = {}) {
  const palm = `<rect x="-38" y="-42" width="76" height="92" rx="30" fill="${SKIN}" stroke="${SKIN_EDGE}" stroke-width="2"/>`;
  let fingers = '';
  if (pose === 'open') {
    const f = [
      [-35, 46],
      [-16, 54],
      [3, 52],
      [21, 42],
    ];
    fingers = f
      .map(([fx, len]) => `<rect x="${fx}" y="${-36 - len}" width="16" height="${len + 8}" rx="8" fill="${SKIN}" stroke="${SKIN_EDGE}" stroke-width="2"/>`)
      .join('');
  } else if (pose === 'curl') {
    // dedos curvados: salen del borde derecho y se doblan hacia adentro
    const ys = [-34, -14, 6, 26];
    fingers = ys
      .map(
        (fy) =>
          `<path d="M 30 ${fy} q 34 0 34 9 q 0 9 -22 9" fill="${SKIN}" stroke="${SKIN_EDGE}" stroke-width="2" stroke-linejoin="round"/>`,
      )
      .join('');
  }
  let th = '';
  if (thumb === 'side') {
    th = `<rect x="-62" y="-30" width="16" height="50" rx="8" transform="rotate(-28 -54 10)" fill="${SKIN}" stroke="${SKIN_EDGE}" stroke-width="2"/>`;
  } else if (thumb === 'top') {
    th = `<rect x="-48" y="-62" width="16" height="52" rx="8" transform="rotate(62 -40 -14)" fill="${SKIN}" stroke="${SKIN_EDGE}" stroke-width="2"/>`;
  }
  const body = palm + th + fingers;
  return g(mirror ? `<g transform="scale(-1 1)">${body}</g>` : body, { x, y, r, s });
}

// Solo dedos curvados (se dibuja encima de la baraja para dar sensación de agarre)
export function curledFingers(x, y, r = 0, { s = 1, mirror = false } = {}) {
  const ys = [-34, -14, 6, 26];
  const body = ys
    .map(
      (fy) =>
        `<path d="M 30 ${fy} q 34 0 34 9 q 0 9 -22 9" fill="${SKIN}" stroke="${SKIN_EDGE}" stroke-width="2" stroke-linejoin="round"/>`,
    )
    .join('');
  return g(mirror ? `<g transform="scale(-1 1)">${body}</g>` : body, { x, y, r, s });
}

export function thumbOver(x, y, r = 0, s = 1) {
  return g(
    `<rect x="-8" y="-30" width="17" height="54" rx="8.5" fill="${SKIN}" stroke="${SKIN_EDGE}" stroke-width="2"/>`,
    { x, y, r, s },
  );
}

export function arrow(d, color = '#f6d27a') {
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="1 0" marker-end="url(#cmArrow)"/>`;
}

export function label(text, x, y, anchor = 'middle') {
  return `<g><text x="${x}" y="${y}" text-anchor="${anchor}" font-size="13" font-weight="700" fill="#1a1426" stroke="#1a1426" stroke-width="4" stroke-linejoin="round" opacity=".55">${text}</text>
  <text x="${x}" y="${y}" text-anchor="${anchor}" font-size="13" font-weight="700" fill="#fff4d6">${text}</text></g>`;
}

export function ring(x, y, rad = 18) {
  return `<circle cx="${x}" cy="${y}" r="${rad}" fill="none" stroke="#f6d27a" stroke-width="3" stroke-dasharray="5 4"/>`;
}

export function sparkle(x, y, s = 1) {
  return g(`<path d="M0 -12 L3 -3 L12 0 L3 3 L0 12 L-3 3 L-12 0 L-3 -3 Z" fill="#f6d27a"/>`, { x, y, s });
}

function frame(inner) {
  return `<svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg" role="img">
  <defs>
    <pattern id="cmBackPattern" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="8" height="8" fill="#a52a3a"/><line x1="0" y1="0" x2="0" y2="8" stroke="#f6d27a" stroke-width="1.2" opacity=".55"/>
    </pattern>
    <radialGradient id="cmFelt" cx="50%" cy="40%" r="75%">
      <stop offset="0" stop-color="#1f6a4a"/><stop offset="1" stop-color="#0e3a29"/>
    </radialGradient>
    <marker id="cmArrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="#f6d27a"/>
    </marker>
  </defs>
  <rect width="320" height="220" rx="14" fill="url(#cmFelt)"/>
  ${inner}
</svg>`;
}

// ---------- Escenas ----------
const scenes = {
  // Agarre del mecánico
  'grip-1': () => frame(hand(160, 125, 0) + label('Mano izquierda, palma arriba', 160, 26)),
  'grip-2': () =>
    frame(hand(160, 128, 0, { pose: 'none', thumb: 'side' }) + deck(165, 110, -8) + curledFingers(160, 128, 0) + label('Baraja en diagonal sobre la palma', 160, 26)),
  'grip-3': () =>
    frame(
      hand(160, 128, 0, { pose: 'none', thumb: 'side' }) +
        deck(165, 110, -8) +
        curledFingers(160, 128, 0) +
        `<rect x="150" y="56" width="16" height="30" rx="8" fill="${SKIN}" stroke="${SKIN_EDGE}" stroke-width="2"/>` +
        ring(158, 64) +
        label('Índice en el borde superior', 160, 26),
    ),
  'grip-4': () =>
    frame(
      hand(160, 128, 0, { pose: 'none', thumb: 'none' }) +
        deck(165, 110, -8) +
        curledFingers(160, 128, 0) +
        thumbOver(140, 104, -10) +
        ring(140, 100, 22) +
        label('Pulgar sobre la baraja, relajado', 160, 26),
    ),

  // Mezcla por arriba
  'shuffle-1': () =>
    frame(
      hand(110, 150, 15, { pose: 'open', s: 0.8 }) +
        deck(170, 120, 90, 7) +
        hand(225, 140, -20, { s: 0.8, mirror: true, pose: 'none', thumb: 'none' }) +
        curledFingers(225, 140, -20, { s: 0.8, mirror: true }) +
        label('Derecha toma la baraja por los extremos', 160, 26),
    ),
  'shuffle-2': () =>
    frame(
      hand(110, 150, 15, { s: 0.8 }) +
        deck(120, 128, 90, 3) +
        deck(185, 110, 90, 5) +
        thumbOver(118, 108, 60, 0.8) +
        arrow('M 175 80 Q 140 62 118 92') +
        label('Pulgar izquierdo arrastra cartas', 160, 26),
    ),
  'shuffle-3': () =>
    frame(
      deck(120, 130, 90, 6) +
        deck(195, 100, 90, 3) +
        arrow('M 210 150 Q 210 180 180 180') +
        arrow('M 180 60 Q 210 50 215 70') +
        label('Repite con ritmo: sube, baja, suelta', 160, 26),
    ),

  // La carta clave
  'key-1': () =>
    frame(
      deck(130, 120, 0) +
        cardFace(205, 118, '7♣', 12, 56, 80, true) +
        arrow('M 158 160 Q 185 185 205 162') +
        label('Mira en secreto la carta de abajo', 160, 26),
    ),
  'key-2': () =>
    frame(
      deck(110, 125, 0, 4) +
        deck(200, 128, 0, 4) +
        cardFace(160, 70, 'Q♥', -6, 56, 80, true) +
        arrow('M 160 112 Q 160 130 190 120') +
        label('El espectador deja su carta encima', 160, 26),
    ),
  'key-3': () =>
    frame(
      deck(115, 130, 0, 5) +
        deck(210, 115, 0, 4) +
        arrow('M 205 70 Q 160 40 120 82') +
        label('Corta: tu carta clave queda encima de la suya', 160, 26),
    ),
  'key-4': () =>
    frame(
      cardFace(70, 120, '3♦', -6) +
        cardFace(125, 118, '7♣', 0, 56, 80, true) +
        cardFace(185, 118, 'Q♥', 4, 56, 80, true) +
        cardFace(245, 122, '9♠', 8) +
        sparkle(215, 70) +
        sparkle(160, 60, 0.7) +
        label('Extiende: la carta tras tu clave es la elegida', 160, 26),
    ),

  // Levantamiento doble
  'double-1': () =>
    frame(
      hand(160, 135, 0, { pose: 'none', thumb: 'none' }) +
        deck(165, 115, -6) +
        curledFingers(160, 135, 0) +
        `<path d="M 186 72 l 10 -6 l 4 8 z" fill="#fff"/>` +
        ring(194, 72, 15) +
        label('Pulgar derecho separa 2 cartas por atrás', 160, 26),
    ),
  'double-2': () =>
    frame(
      deck(150, 125, -6) +
        `<g transform="translate(150 125) rotate(-6)"><rect x="-28" y="-40" width="56" height="80" rx="6" fill="none" stroke="#f6d27a" stroke-width="3"/><rect x="-26.5" y="-38.5" width="56" height="80" rx="6" fill="none" stroke="#f6d27a" stroke-width="2" opacity=".6"/></g>` +
        label('Las dos cartas se mueven como una sola', 160, 26),
    ),
  'double-3': () =>
    frame(
      deck(115, 130, 0) +
        cardFace(205, 110, 'K♠', 0, 56, 80, true) +
        arrow('M 135 85 Q 165 50 195 66') +
        label('Voltéalas juntas y muestra "la carta de arriba"', 160, 26),
    ),

  // Carta ambiciosa
  'amb-1': () => frame(deck(160, 125, 0, 6, 56, 80, '8♥') + sparkle(205, 80) + label('Muestra una carta (doble levantada)', 160, 26)),
  'amb-2': () =>
    frame(
      deck(150, 135, 0) +
        cardBack(175, 110, 8) +
        arrow('M 220 90 Q 230 140 200 155') +
        label('Coloca "esa carta" en el medio', 160, 26),
    ),
  'amb-3': () =>
    frame(deck(130, 135, 0, 6) + cardFace(220, 105, '8♥', 10, 56, 80, true) + sparkle(250, 60) + sparkle(195, 55, 0.7) + label('¡Chasquea y la carta sube!', 160, 26)),

  // Glide
  'glide-1': () =>
    frame(
      hand(160, 135, 180, { pose: 'open' }) +
        deck(160, 105, 0, 6, 56, 80, '4♣') +
        label('Baraja cara abajo, sujeta desde arriba', 160, 26),
    ),
  'glide-2': () =>
    frame(
      deck(160, 115, 0, 6, 56, 80, '4♣') +
        `<rect x="130" y="138" width="40" height="16" rx="8" fill="${SKIN}" stroke="${SKIN_EDGE}" stroke-width="2"/>` +
        arrow('M 150 172 L 150 196') +
        label('El anular retrocede la carta de abajo', 160, 26),
    ),
  'glide-3': () =>
    frame(
      deck(160, 108, 0, 6, 56, 80, '4♣') +
        cardBack(160, 150, 0) +
        arrow('M 220 150 L 250 150') +
        label('Sacas la segunda carta, no la de abajo', 160, 26),
    ),

  // Mezcla hindú
  'hindu-1': () =>
    frame(
      hand(110, 150, 30, { s: 0.8 }) +
        deck(185, 105, 0) +
        thumbOver(160, 90, 0, 0.8) +
        arrow('M 150 150 Q 140 175 115 170') +
        label('Izquierda pellizca paquetes de arriba', 160, 26),
    ),
  'hindu-2': () =>
    frame(deck(110, 140, 0, 5) + deck(200, 100, 0, 4) + arrow('M 190 160 Q 160 190 125 175') + label('Repite hasta acabar la baraja', 160, 26)),

  // Charlier
  'charlier-1': () =>
    frame(hand(160, 135, 0, { s: 0.95 }) + deck(160, 110, 90, 7) + label('Baraja en la yema de los dedos', 160, 26)),
  'charlier-2': () =>
    frame(
      deck(130, 112, 70, 4) +
        deck(185, 120, 105, 4) +
        arrow('M 185 70 Q 220 80 225 115') +
        label('Deja caer la mitad, el índice la empuja', 160, 26),
    ),
  'charlier-3': () => frame(deck(160, 112, 90, 8) + sparkle(210, 70) + label('Cierra: corte completado', 160, 26)),

  // Cuatro reinas
  'queens-1': () =>
    frame(
      cardFace(85, 118, 'Q♠', -14) +
        cardFace(130, 112, 'Q♥', -5) +
        cardFace(178, 112, 'Q♣', 5) +
        cardFace(225, 118, 'Q♦', 14) +
        label('Presenta las cuatro reinas', 160, 26),
    ),
  'queens-2': () =>
    frame(deck(160, 125, 0, 8) + cardBack(160, 70, 0) + arrow('M 210 70 Q 230 105 195 122') + label('Pierde cada reina en la baraja', 160, 26)),
  'queens-3': () =>
    frame(
      deck(80, 150, 0, 6) +
        cardFace(150, 110, 'Q♠', -6) +
        cardFace(195, 110, 'Q♥', 0) +
        cardFace(240, 110, 'Q♣', 6) +
        sparkle(195, 55) +
        label('Reaparecen arriba, una a una', 160, 26),
    ),

  generic: () => frame(deck(160, 120, 0) + sparkle(215, 70) + label('Cartomagia', 160, 26)),
};

export function renderImage(image) {
  if (!image) return scenes.generic();
  if (/[/.]/.test(image)) {
    return `<img src="${image}" alt="" loading="lazy"/>`;
  }
  return (scenes[image] || scenes.generic)();
}

export function appLogo(size = 88) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs><linearGradient id="lgGold" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#ffe7a3"/><stop offset="1" stop-color="#d79b2f"/></linearGradient></defs>
    <g transform="rotate(-14 50 55)"><rect x="22" y="22" width="40" height="58" rx="6" fill="#8e1d2c" stroke="#fff" stroke-width="2.5"/></g>
    <g transform="rotate(10 50 55)"><rect x="38" y="20" width="40" height="58" rx="6" fill="#fffdf7" stroke="#2a2438" stroke-width="2"/>
      <text x="58" y="58" font-size="26" text-anchor="middle" fill="#c2182b">♥</text></g>
    <path d="M50 4 L54 14 L64 18 L54 22 L50 32 L46 22 L36 18 L46 14 Z" fill="url(#lgGold)"/>
  </svg>`;
}
