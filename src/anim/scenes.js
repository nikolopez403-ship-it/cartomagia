// Escenas animadas de cada paso. Cada escena: { dur, captions, render(t) }.
// render(t) devuelve el SVG (sin el marco) para el instante t (segundos).
// Contenido de EJEMPLO para la beta: se reemplazará con el material definitivo.
import { track, span, easeOut, easeIn, linear, mix } from './engine.js';
import { hand, card, deck, arrow, ring, sparkle, sparkles, eye, label, xray, POSES, CW, CH } from './parts.js';

const GRIP = {
  index: { a: -62, c: 0.75 },
  middle: { a: 4, c: 1 },
  ring: { a: 6, c: 1 },
  pinky: { a: 8, c: 1.05 },
  thumb: { a: 32, c: 0.05, over: true },
};
const GRIP_OPEN = {
  index: { a: -20, c: 0.05 },
  middle: { a: 2, c: 0.05 },
  ring: { a: 5, c: 0.08 },
  pinky: { a: 9, c: 0.1 },
  thumb: { a: -10, c: 0, over: false },
};
const GRIP_INDEX_SIDE = { ...GRIP, index: { a: -8, c: 1 } };
const GRIP_THUMB_OFF = { ...GRIP, thumb: { a: -30, c: 0, over: false } };
const BIDDLE = { index: { a: -8, c: 0.95 }, middle: { a: -2, c: 0.95 }, ring: { a: 3, c: 0.95 }, pinky: { a: 7, c: 0.95 }, thumb: { a: 18, c: 0.35 } };
const HOLD_DECK = (o = {}) => deck({ x: 4, y: -24, r: 90, n: 5, ...o });
const BIDDLE_DECK = (o = {}) => deck({ x: 0, y: -42, n: 5, ...o });

// Mano izquierda en agarre de mecánico (posición de pantalla estándar)
function gripHand({ pose = GRIP, hold = HOLD_DECK(), top = '', x = 142, y = 150, r = 52, s = 1.4 } = {}) {
  return hand({ x, y, r, s, pose, hold, top });
}

// -------- Diagrama de canto (vista lateral de la baraja) --------
const BAR_H = 6.5;
function bar(x, y, w, { color = '#efe7d6', stroke = '#8a7b63', r = 0, label: lb = '', o = 1, ox = 0 } = {}) {
  const txt = lb
    ? `<text x="${w / 2 + 8}" y="4" font-size="11" font-weight="800" fill="#fff4d6" stroke="#120d1f" stroke-width="3" paint-order="stroke">${lb}</text>`
    : '';
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${r.toFixed(1)} ${ox.toFixed(1)} 0)" opacity="${o}"><rect x="${-w / 2}" y="${-BAR_H / 2}" width="${w}" height="${BAR_H}" rx="2" fill="${color}" stroke="${stroke}" stroke-width=".8"/>${txt}</g>`;
}

// ================== ESCENAS ==================
export const SCENES = {
  // ---------- Agarre del mecánico ----------
  'grip-1': {
    dur: 4.4,
    captions: [
      [0, 'Mano izquierda, palma hacia arriba'],
      [2.2, 'Dedos relajados, sin tensión'],
    ],
    render(t) {
      const pose = track(t, [
        [0, POSES.open],
        [1.2, POSES.open],
        [2.2, POSES.relax],
        [3.6, POSES.relax],
        [4.4, POSES.open],
      ]);
      const wob = Math.sin(t * 1.4) * 3;
      return hand({ x: 160, y: 132, r: 8 + wob, s: 1.12, pose });
    },
  },

  'grip-2': {
    dur: 5.4,
    captions: [
      [0, 'Coloca la baraja en diagonal sobre la palma'],
      [2, 'Medio, anular y meñique rodean el lado derecho'],
    ],
    render(t) {
      const d = track(t, [
        [0, { x: 70, y: -170, r: 40, o: 0 }],
        [0.3, { x: 70, y: -170, r: 40, o: 1 }],
        [1.6, { x: 4, y: -24, r: 90, o: 1 }, easeOut],
        [5, { x: 4, y: -24, r: 90, o: 1 }],
        [5.4, { x: 4, y: -24, r: 90, o: 0 }],
      ]);
      const pose = track(t, [
        [0, GRIP_OPEN],
        [1.8, GRIP_OPEN],
        [3, GRIP],
        [4.8, GRIP],
        [5.4, GRIP_OPEN],
      ]);
      return gripHand({ pose, hold: deck({ ...d, n: 5 }) }) + (t > 3 && t < 4.9 ? sparkle(250, 70, 0.6, span(t, 3, 3.3)) : '');
    },
  },

  'grip-3': {
    dur: 4.6,
    captions: [
      [0, 'Curva el índice…'],
      [1.4, '…y apóyalo en el borde delantero'],
      [3, 'Hace de tope y de guía'],
    ],
    render(t) {
      const pose = track(t, [
        [0, GRIP_INDEX_SIDE],
        [0.8, GRIP_INDEX_SIDE],
        [2, GRIP],
        [4.2, GRIP],
        [4.6, GRIP_INDEX_SIDE],
      ]);
      const ro = span(t, 2, 2.4) * (1 - span(t, 4, 4.3));
      return gripHand({ pose, top: ring(-44, -24, 15, ro, t) });
    },
  },

  'grip-4': {
    dur: 4.8,
    captions: [
      [0, 'El pulgar se apoya sobre la baraja'],
      [2.4, 'Relajado, sin apretar'],
    ],
    render(t) {
      const pose = track(t, [
        [0, GRIP_THUMB_OFF],
        [0.6, GRIP_THUMB_OFF],
        [1.8, GRIP],
        [4.3, GRIP],
        [4.8, GRIP_THUMB_OFF],
      ]);
      // pequeño "toque" para mostrar que no presiona
      if (t > 2.4 && t < 4.2) pose.thumb = { ...pose.thumb, c: 0.05 + 0.07 * Math.abs(Math.sin((t - 2.4) * 3)) };
      const ro = span(t, 1.8, 2.2) * (1 - span(t, 4, 4.3));
      return gripHand({ pose, top: ring(-12, -26, 20, ro, t) });
    },
  },

  // ---------- Mezcla por arriba ----------
  'shuffle-1': shuffleScene({
    captions: [
      [0, 'La derecha sujeta la baraja por los extremos'],
      [2.4, 'La izquierda espera debajo, palma arriba'],
    ],
    packets: 0,
  }),
  'shuffle-2': shuffleScene({
    captions: [
      [0, 'Baja la baraja hacia la mano izquierda'],
      [1.2, 'El pulgar izquierdo retiene unas cartas'],
      [2.4, 'La derecha sube con el resto'],
    ],
    packets: 1,
    highlightThumb: true,
  }),
  'shuffle-3': shuffleScene({
    captions: [
      [0, 'Repite con ritmo: baja…'],
      [1, '…arrastra…'],
      [2, '…sube'],
      [3, '¡Hasta pasar todas las cartas!'],
    ],
    packets: 4,
    speed: 1.6,
  }),

  // ---------- La carta clave ----------
  'key-1': {
    dur: 5.5,
    captions: [
      [0, 'Mientras mezclas…'],
      [1.2, '…inclina un poco la baraja'],
      [2.2, 'Mira de reojo la carta de abajo: 7♣'],
      [4.2, '¡Recuérdala! Es tu carta clave'],
    ],
    render(t) {
      const tilt = span(t, 1.2, 2) * (1 - span(t, 3.8, 4.6));
      const peek = span(t, 2, 2.6) * (1 - span(t, 4.8, 5.3));
      const h = gripHand({ r: 52 - tilt * 28, y: 140 + tilt * 6 });
      return (
        h +
        xray(card({ x: 238, y: 110, r: 8, label: '7♣', flip: 1, glow: 1, s: 0.95 + 0.05 * Math.sin(t * 4) }), peek) +
        arrow('M 185 150 Q 215 170 228 158', peek) +
        eye(238, 46, peek, 0.4 + 0.6 * peek)
      );
    },
  },

  'key-2': {
    dur: 5.6,
    captions: [
      [0, 'El espectador elige una carta y la memoriza'],
      [2.2, 'La deja encima de la baraja'],
      [4, 'Tu clave (7♣) sigue abajo'],
    ],
    render(t) {
      const c = track(t, [
        [0, { x: 160, y: -40, flip: 1 }],
        [0.8, { x: 160, y: 62, flip: 1 }, easeOut],
        [1.9, { x: 160, y: 62, flip: 1 }],
        [2.4, { x: 160, y: 62, flip: 0 }],
        [3.4, { x: 160, y: 128, flip: 0 }],
        [5.6, { x: 160, y: 128, flip: 0 }],
      ]);
      const handGone = span(t, 3.5, 4.3, easeIn);
      const hy = c.y - 70 - handGone * 160;
      const keyO = span(t, 3.9, 4.4) * (1 - span(t, 5.2, 5.6));
      const spect = hand({
        x: 160,
        y: hy,
        r: 180,
        s: 0.9,
        hand: 'right',
        side: 'back',
        pose: BIDDLE,
        sleeve: true,
      });
      return (
        xray(card({ x: 200, y: 140, r: 10, label: '7♣', flip: 1, s: 0.8 }), keyO * 0.9) +
        deck({ x: 160, y: 130, n: 6 }) +
        card({ x: c.x, y: c.y, label: 'Q♥', flip: c.flip, glow: c.flip > 0.5 ? 1 : 0, lift: c.y < 120 ? 1 : 0 }) +
        spect +
        label('abajo: 7♣', 250, 196, keyO)
      );
    },
  },

  'key-3': {
    dur: 6.4,
    captions: [
      [0, 'Vista de canto: Q♥ arriba, tu 7♣ abajo'],
      [1, 'Cortan: levantan la mitad de arriba…'],
      [2.3, '…y ponen la otra mitad encima'],
      [4, '¡Tu clave queda justo sobre la elegida!'],
    ],
    render(t) {
      const N = 12;
      const half = 6;
      const x0 = 150;
      const topY = 70;
      let out = '';
      const p1 = span(t, 1, 2); // la mitad de arriba se aparta
      const p2 = span(t, 2.3, 3.4); // la de abajo sube y se coloca encima
      const p3 = span(t, 3.5, 4); // se cuadra
      const reset = span(t, 6, 6.4);
      for (let i = N - 1; i >= 0; i--) {
        const isTop = i < half;
        let x = x0;
        let y = topY + i * (BAR_H + 2);
        if (isTop) {
          // de su lugar → abajo a la izquierda
          x = mix(x0, x0 - 70, p1) + mix(0, 70, p3);
          y = mix(y, topY + (i + half) * (BAR_H + 2) + 8, p1) - p3 * 8;
        } else {
          x = mix(x0, x0 - 70, p2) + mix(0, 70, p3);
          y = mix(y, topY + (i - half) * (BAR_H + 2) - 8 + p2 * 0, p2) - mix(0, -8, p2) * 0;
          y += -8 * p2 + 8 * p3;
        }
        y = mix(y, topY + i * (BAR_H + 2), reset);
        x = mix(x, x0, reset);
        const isQ = i === 0;
        const isK = i === N - 1;
        out += bar(x, y, 120, {
          color: isQ ? '#e0485c' : isK ? '#2f9d67' : '#efe7d6',
          stroke: isQ ? '#fff' : isK ? '#fff' : '#8a7b63',
          label: isQ ? 'Q♥ elegida' : isK ? '7♣ tu clave' : '',
        });
      }
      const glow = span(t, 4, 4.4) * (1 - reset);
      const gy = topY + (half - 1) * (BAR_H + 2) + BAR_H / 2 + 1;
      out += `<rect x="${x0 - 66}" y="${gy - 10}" width="132" height="20" rx="6" fill="none" stroke="#f6d27a" stroke-width="2.5" opacity="${glow}"/>`;
      out += sparkles(x0 - 70, gy, t, glow);
      return out;
    },
  },

  'key-4': {
    dur: 7,
    captions: [
      [0, 'Extiende las cartas cara arriba'],
      [2.6, 'Busca tu carta clave: 7♣'],
      [3.8, '¡La siguiente es la elegida!'],
    ],
    render(t) {
      const labels = ['3♦', 'J♠', '5♥', '7♣', 'Q♥', '2♠', '10♦', '4♣', 'K♥'];
      let out = '';
      labels.forEach((lb, i) => {
        const appear = span(t, 0.2 + i * 0.22, 0.6 + i * 0.22, easeOut);
        const x = mix(60, 44 + i * 29, appear);
        const isK = lb === '7♣';
        const isQ = lb === 'Q♥';
        const qLift = isQ ? span(t, 3.8, 4.4, easeOut) * (1 - span(t, 6.4, 7)) : 0;
        const kGlow = isK ? span(t, 2.6, 3) * (1 - span(t, 6.4, 7)) : 0;
        out += card({ x, y: 128 - qLift * 34, r: -12 + i * 3, label: lb, flip: appear, glow: Math.max(kGlow, qLift), s: 0.92, lift: qLift });
      });
      const sp = span(t, 4, 4.4) * (1 - span(t, 6.4, 7));
      return out + sparkles(44 + 4 * 29, 90, t, sp);
    },
  },

  // ---------- Levantamiento doble ----------
  'double-1': {
    dur: 5,
    captions: [
      [0, 'Vista de canto de la baraja'],
      [1, 'El pulgar derecho levanta el borde trasero…'],
      [2.4, '…de DOS cartas a la vez'],
    ],
    render(t) {
      const lift = span(t, 1, 2.2) * (1 - span(t, 4.2, 4.8));
      let out = '';
      const x0 = 160;
      const y0 = 100;
      for (let i = 9; i >= 0; i--) {
        const y = y0 + i * (BAR_H + 1.5);
        const lifted = i < 2;
        out += bar(x0, y - (lifted ? lift * 4 : 0), 150, {
          r: lifted ? lift * 7 : 0,
          ox: -75,
          color: lifted ? '#f6d27a' : '#efe7d6',
          stroke: lifted ? '#fff' : '#8a7b63',
        });
      }
      // pulgar (vista lateral)
      const tx = x0 + 78;
      const ty = y0 - 4 + (1 - lift) * 6 - lift * 16;
      out += `<g transform="translate(${tx} ${ty}) rotate(-20)"><rect x="-10" y="-8" width="46" height="20" rx="10" fill="url(#skF)" stroke="#a86d4c" stroke-width="1.5"/><rect x="-8" y="-6" width="12" height="9" rx="4" fill="url(#nail)" stroke="#d19b86" stroke-width=".8"/></g>`;
      out += label('2 cartas', x0 + 30, y0 - 28, lift);
      out += ring(x0 + 74, y0 - 4, 16, lift, t);
      return out;
    },
  },

  'double-2': {
    dur: 4.6,
    captions: [
      [0, 'Cuadra bien las dos cartas'],
      [2, 'Deben parecer UNA sola carta'],
    ],
    render(t) {
      const sep = track(t, [
        [0, 10],
        [0.8, 10],
        [1.8, 0],
        [4, 0],
        [4.6, 10],
      ]);
      const xr = span(t, 2.2, 2.8) * (1 - span(t, 4, 4.4));
      const top = card({ x: 160 - sep, y: 110 - sep * 0.8, label: 'K♠', lift: 0.4 });
      const second = card({ x: 160 + sep, y: 110 + sep * 0.8, label: 'K♠', lift: 0.2 });
      return (
        gripHand({ x: 120, y: 175, r: 52, s: 0.9 }) +
        second +
        top +
        `<rect x="${160 - CW / 2 - 4}" y="${110 - CH / 2 - 4}" width="${CW + 8}" height="${CH + 8}" rx="8" fill="none" stroke="#7ad7f6" stroke-width="2" stroke-dasharray="4 3" opacity="${xr}"/>` +
        label('2 = 1', 240, 110, xr)
      );
    },
  },

  'double-3': doubleFlipScene('K♠', [
    [0, 'Voltea el bloque como si fuera una carta'],
    [2, 'Muestra la carta: K♠'],
    [3.6, 'Vuelve a voltearlo con naturalidad'],
  ]),

  // ---------- Carta ambiciosa ----------
  'amb-1': doubleFlipScene('8♥', [
    [0, 'Haz un levantamiento doble'],
    [2, 'El público ve el 8♥'],
    [3.6, 'Voltéalo de nuevo cara abajo'],
  ]),

  'amb-2': {
    dur: 6,
    captions: [
      [0, 'Toma SOLO la carta de arriba'],
      [1.6, '(en realidad no es el 8♥)'],
      [2.6, 'Métela en el centro de la baraja'],
      [4.4, 'El 8♥ sigue arriba en secreto'],
    ],
    render(t) {
      const c = track(t, [
        [0, { x: 0, y: 0, r: 0, lift: 0 }],
        [0.4, { x: 0, y: 0, r: 0, lift: 0 }],
        [1.4, { x: 70, y: -30, r: 12, lift: 1 }, easeOut],
        [2.6, { x: 70, y: -30, r: 12, lift: 1 }],
        [3.4, { x: 22, y: -60, r: 4, lift: 0.4 }],
        [4.2, { x: 6, y: -34, r: 0, lift: 0 }],
        [5.4, { x: 6, y: -34, r: 0, lift: 0 }],
        [6, { x: 0, y: 0, r: 0, lift: 0 }],
      ]);
      const peek = span(t, 1.5, 1.9) * (1 - span(t, 2.4, 2.7));
      const eightO = span(t, 4.4, 4.8) * (1 - span(t, 5.6, 6));
      // dentro del marco local de la mano (baraja horizontal)
      const inMiddle = t > 3.3 && t < 5.9;
      const moving = card({ x: 4 - c.y, y: -24 - c.x, r: 90 + c.r, label: '3♠', flip: peek, lift: c.lift });
      const deckSvg = HOLD_DECK();
      const hold = inMiddle ? moving + deckSvg : deckSvg + moving;
      return gripHand({ hold }) + xray(card({ x: 250, y: 70, r: 8, label: '8♥', flip: 1, s: 0.7, glow: 1 }), eightO) + label('arriba: 8♥', 250, 128, eightO);
    },
  },

  'amb-3': {
    dur: 5.6,
    captions: [
      [0, 'Haz un gesto mágico…'],
      [1.4, '¡chas!'],
      [2.2, 'Voltea la carta de arriba…'],
      [3.2, '¡El 8♥ ha vuelto!'],
    ],
    render(t) {
      const snap = span(t, 1.2, 1.6) * (1 - span(t, 2, 2.4));
      const f = track(t, [
        [0, { flip: 0, lx: 4, ly: -24, lift: 0 }],
        [2.2, { flip: 0, lx: 4, ly: -24, lift: 0 }],
        [3.1, { flip: 1, lx: -40, ly: -46, lift: 1 }, easeOut],
        [5, { flip: 1, lx: -40, ly: -46, lift: 1 }],
        [5.6, { flip: 0, lx: 4, ly: -24, lift: 0 }],
      ]);
      const revealed = card({ x: f.lx, y: f.ly, r: 90, label: '8♥', flip: f.flip, lift: f.lift, glow: f.flip > 0.5 ? 1 : 0 });
      const moving = t > 2.2 && t < 5.6;
      const sp = span(t, 3, 3.3) * (1 - span(t, 5, 5.5));
      const rhand = hand({
        x: 278,
        y: 130 + Math.sin(t * 8) * snap * 4,
        r: -30,
        s: 0.7,
        hand: 'right',
        side: 'back',
        pose: mix(POSES.relax, { index: { a: -10, c: 0.6 }, middle: { a: 0, c: 1.1 }, ring: { a: 0, c: 1 }, pinky: { a: 0, c: 1 }, thumb: { a: 30, c: 0.5 } }, snap),
      });
      return gripHand({ hold: HOLD_DECK() + (moving ? '' : revealed), top: moving ? revealed : '' }) + rhand + sparkles(120, 60, t, Math.max(snap, sp)) + (snap > 0.2 ? label('¡chas!', 262, 40, snap) : '');
    },
  },

  // ---------- Glide ----------
  'glide-1': {
    dur: 4.4,
    captions: [
      [0, 'Vista desde abajo'],
      [1.6, 'La carta de abajo es el 4♣'],
    ],
    render(t) {
      const glow = span(t, 1.6, 2) * (1 - span(t, 4, 4.4));
      return glideBase(t, { slide: 0, glow, ringO: 0 });
    },
  },
  'glide-2': {
    dur: 4.6,
    captions: [
      [0, 'Con la yema del anular…'],
      [1.2, '…retrocede la carta de abajo un centímetro'],
    ],
    render(t) {
      const slide = span(t, 1, 2) * (1 - span(t, 4, 4.5));
      return glideBase(t, { slide, glow: 0, ringO: span(t, 0.4, 0.8) * (1 - span(t, 4, 4.4)) });
    },
  },
  'glide-3': {
    dur: 5.6,
    captions: [
      [0, 'La carta de abajo queda retrasada'],
      [1.2, 'La derecha saca la carta que queda expuesta…'],
      [3.2, '…¡la segunda, no el 4♣!'],
    ],
    render(t) {
      const pull = span(t, 1.4, 3, easeOut) * (1 - span(t, 5, 5.5));
      const slide = 1 - span(t, 4.4, 5.2);
      return glideBase(t, { slide, glow: span(t, 3.2, 3.6) * (1 - span(t, 5, 5.5)), ringO: 0, pull });
    },
  },

  // ---------- Mezcla hindú ----------
  'hindu-1': packetScene({
    captions: [
      [0, 'La derecha sujeta la baraja por los extremos'],
      [1.2, 'Pulgar y medio izquierdos pellizcan las de arriba'],
      [2.4, 'La derecha se retira hacia atrás'],
    ],
    packets: 1,
  }),
  'hindu-2': packetScene({
    captions: [
      [0, 'Pellizca…'],
      [1, '…retira…'],
      [2, '…repite'],
      [3, 'Hasta que se acaben las cartas'],
    ],
    packets: 4,
    speed: 1.6,
  }),

  // ---------- Corte a una mano ----------
  'charlier-1': charlierScene(0, [
    [0, 'Sostén la baraja con las yemas'],
    [2, 'Pulgar a un lado, dedos al otro'],
  ]),
  'charlier-2': charlierScene(1, [
    [0, 'Afloja el pulgar: cae la mitad de abajo'],
    [1.6, 'El índice la empuja hacia arriba'],
  ]),
  'charlier-3': charlierScene(2, [
    [0, 'La mitad de arriba cae sobre el índice'],
    [1.8, 'Cierra las mitades en orden inverso'],
    [3.2, '¡Corte completado!'],
  ]),

  // ---------- Cuatro reinas ----------
  'queens-1': {
    dur: 5,
    captions: [
      [0, 'Presenta las cuatro reinas'],
      [2.2, 'En abanico, bien visibles'],
    ],
    render(t) {
      const fan = span(t, 0.4, 1.8, easeOut) * (1 - span(t, 4.4, 5));
      return ['Q♠', 'Q♥', 'Q♣', 'Q♦']
        .map((lb, i) =>
          card({ x: 160 + (i - 1.5) * 40 * fan, y: 125 + Math.abs(i - 1.5) * 6 * fan, r: (i - 1.5) * 14 * fan, label: lb, flip: 1, lift: 0.3 }),
        )
        .join('');
    },
  },
  'queens-2': {
    dur: 6.4,
    captions: [
      [0, 'Coloca cada reina en distintos puntos…'],
      [3.6, '…pero con un control, quedan arriba'],
    ],
    render(t) {
      let out = deck({ x: 160, y: 132, n: 8 });
      const qs = ['Q♠', 'Q♥', 'Q♣', 'Q♦'];
      qs.forEach((lb, i) => {
        const s0 = 0.3 + i * 0.8;
        const p = span(t, s0, s0 + 0.7, easeOut);
        const push = span(t, s0 + 0.7, s0 + 1);
        const x = mix(60 + i * 60, 128 + i * 21, p);
        const y = mix(40, 92 - push * 30, p);
        const o = 1 - span(t, s0 + 0.9, s0 + 1);
        if (o > 0) out += card({ x, y, r: mix(-10, 0, p), label: lb, flip: 1 - p, o, lift: 1 - p });
      });
      const xr = span(t, 3.8, 4.3) * (1 - span(t, 6, 6.4));
      out += xray(qs.map((lb, i) => card({ x: 250 + i * 4, y: 90 - i * 4, label: lb, flip: 1, s: 0.6 })).join(''), xr);
      out += label('¡arriba!', 258, 150, xr);
      return out;
    },
  },
  'queens-3': {
    dur: 6.6,
    captions: [
      [0, 'Chasquea y voltea la de arriba…'],
      [1.4, '¡Una reina!'],
      [2.6, 'Y otra… y otra…'],
      [4.8, '¡Las cuatro reinas han vuelto!'],
    ],
    render(t) {
      let out = deck({ x: 80, y: 140, n: 6 });
      ['Q♠', 'Q♥', 'Q♣', 'Q♦'].forEach((lb, i) => {
        const s0 = 0.4 + i * 1.1;
        const p = span(t, s0, s0 + 0.8, easeOut) * (1 - span(t, 6.1, 6.6));
        if (p > 0) out += card({ x: mix(80, 140 + i * 44, p), y: mix(140, 100, p), r: mix(0, (i - 1.5) * 4, p), label: lb, flip: p, lift: p, glow: p > 0.95 ? 1 : 0 });
      });
      return out + sparkles(205, 100, t, span(t, 4.8, 5.2) * (1 - span(t, 6.1, 6.5)));
    },
  },
};

// ---------- Generadores de escenas ----------

function doubleFlipScene(lb, captions) {
  return {
    dur: 5.4,
    captions,
    render(t) {
      const f = track(t, [
        [0, { flip: 0, lx: 4, ly: -24, lift: 0 }],
        [0.6, { flip: 0, lx: 4, ly: -24, lift: 0 }],
        [1.8, { flip: 1, lx: -16, ly: -40, lift: 0.8 }, easeOut],
        [3.4, { flip: 1, lx: -16, ly: -40, lift: 0.8 }],
        [4.6, { flip: 0, lx: 4, ly: -24, lift: 0 }],
        [5.4, { flip: 0, lx: 4, ly: -24, lift: 0 }],
      ]);
      const xr = span(t, 2, 2.4) * (1 - span(t, 3.2, 3.5));
      const moving = t > 0.6 && t < 4.6;
      // la "carta" que se voltea son dos cartas cuadradas
      const block =
        card({ x: f.lx + 1.2, y: f.ly + 1.2, r: 90, label: lb, flip: f.flip, lift: f.lift }) +
        card({ x: f.lx, y: f.ly, r: 90, label: lb, flip: f.flip, glow: f.flip > 0.5 ? 1 : 0 });
      const rhand = hand({
        x: 268 - Math.sin(f.flip * Math.PI) * 26,
        y: 84 - Math.sin(f.flip * Math.PI) * 8,
        r: -70,
        s: 0.8,
        hand: 'right',
        side: 'back',
        pose: BIDDLE,
      });
      return gripHand({ hold: HOLD_DECK() + (moving ? '' : block), top: moving ? block : '' }) + rhand + label('(son 2 cartas)', 92, 40, xr);
    },
  };
}

// Mezcla por arriba: la derecha (dorso) baja la baraja, el pulgar izquierdo arrastra paquetes.
function shuffleScene({ captions, packets = 1, highlightThumb = false, speed = 1 }) {
  const cycle = 3 / speed;
  const n = Math.max(1, packets);
  const dur = packets === 0 ? 4.8 : cycle * n + 0.8;
  return {
    dur,
    captions,
    render(t) {
      const L = { x: 108, y: 178, r: 28, s: 0.95 };
      let dropped = 0;
      let phase = 0;
      if (packets > 0) {
        const k = Math.min(n - 1, Math.floor(t / cycle));
        phase = (t - k * cycle) / cycle;
        dropped = k + (phase > 0.55 ? 1 : 0);
        if (t >= cycle * n) {
          dropped = n;
          phase = 1;
        }
      }
      const down = packets === 0 ? 0 : phase < 0.4 ? span(phase, 0, 0.4) : 1 - span(phase, 0.55, 0.95);
      const thumbPress = packets === 0 ? 0 : span(phase, 0.3, 0.45) * (1 - span(phase, 0.7, 0.9));
      const rest = { x: 222, y: 128 };
      const low = { x: 150, y: 190 };
      const R = { x: mix(rest.x, low.x, down), y: mix(rest.y, low.y, down) };
      const fade = packets > 0 ? span(t, dur - 0.5, dur) : 0;
      const pile = dropped
        ? deck({ x: 2, y: -20, r: 82, n: Math.min(6, dropped * 1.5), o: 1 - fade })
        : '';
      const leftPose = mix(POSES.relax, { ...POSES.relax, thumb: { a: 40, c: 0.25, over: true } }, Math.max(thumbPress, dropped ? 0.6 : 0));
      const left = hand({ ...L, pose: leftPose, hold: pile, top: highlightThumb ? ring(-14, -6, 15, thumbPress, t) : '' });
      const right = hand({
        x: R.x,
        y: R.y,
        r: -18,
        s: 0.9,
        hand: 'right',
        side: 'back',
        pose: BIDDLE,
        hold: BIDDLE_DECK({ n: Math.max(1, 6 - dropped * 1.2) }),
      });
      return left + right + (packets === 0 && t > 2.4 ? arrow('M 210 90 Q 150 60 120 110', span(t, 2.4, 2.8) * (1 - span(t, 4.4, 4.8))) : '');
    },
  };
}

// Mezcla hindú: la derecha se retira hacia atrás dejando paquetes pellizcados.
function packetScene({ captions, packets = 1, speed = 1 }) {
  const cycle = 3 / speed;
  const dur = cycle * packets + 0.8;
  return {
    dur,
    captions,
    render(t) {
      const k = Math.min(packets - 1, Math.floor(t / cycle));
      let phase = (t - k * cycle) / cycle;
      let dropped = k + (phase > 0.55 ? 1 : 0);
      if (t >= cycle * packets) {
        dropped = packets;
        phase = 1;
      }
      const into = phase < 0.35 ? span(phase, 0, 0.35) : 1 - span(phase, 0.55, 0.95);
      const pinch = span(phase, 0.25, 0.4) * (1 - span(phase, 0.6, 0.8));
      const fade = span(t, dur - 0.5, dur);
      const pile = dropped ? deck({ x: 2, y: -22, r: 90, n: Math.min(6, dropped * 1.5), o: 1 - fade }) : '';
      const pinchPose = { ...POSES.relax, middle: { a: 6, c: 0.9 }, thumb: { a: 45, c: 0.3, over: true } };
      const left = hand({ x: 112, y: 168, r: 62, s: 0.95, pose: mix(POSES.relax, pinchPose, pinch), hold: pile });
      const R = { x: mix(250, 196, into), y: mix(95, 125, into) };
      const right = hand({ x: R.x, y: R.y, r: -95, s: 0.9, hand: 'right', side: 'back', pose: BIDDLE, hold: BIDDLE_DECK({ n: Math.max(1, 6 - dropped * 1.2) }) });
      return left + right + arrow('M 230 60 L 268 44', into < 0.5 ? 1 - into * 2 : 0);
    },
  };
}

// Vista desde abajo para el deslizamiento (glide)
function glideBase(t, { slide = 0, glow = 0, ringO = 0, pull = 0 }) {
  const bottom = card({ x: 0, y: -40 + slide * 16, label: '4♣', flip: 1, glow });
  const second = card({ x: pull * 110, y: -40, label: '9♦', flip: 0, lift: pull });
  const cards = deck({ x: 0, y: -40, n: 5 }) + (pull > 0 ? second : '') + bottom;
  const left = hand({
    x: 150,
    y: 168,
    r: 0,
    s: 1.25,
    pose: { index: { a: -46, c: 0.15 }, middle: { a: -16, c: 0.2 }, ring: { a: 22, c: 0.25 }, pinky: { a: 38, c: 0.3 }, thumb: { a: 30, c: 0 } },
    top: cards + ring(26, 2 + slide * 13, 13, ringO, t),
  });
  const right = pull > 0
    ? hand({ x: 296 + pull * 6, y: 104, r: -90, s: 0.75, hand: 'right', side: 'palm', pose: { index: { a: 0, c: 0.4 }, middle: { a: 0, c: 0.4 }, ring: { a: 0, c: 0.5 }, pinky: { a: 0, c: 0.6 }, thumb: { a: 10, c: 0.2 } } })
    : '';
  return left + right + label('vista desde abajo', 70, 205);
}

// Corte a una mano (Charlier) en 3 fases
function charlierScene(phase, captions) {
  return {
    dur: phase === 0 ? 4 : 5.2,
    captions,
    render(t) {
      const P = phase === 0 ? 0 : span(t, 0.4, 3.6, linear);
      const reset = span(t, phase === 0 ? 3.6 : 4.6, phase === 0 ? 4 : 5.2);
      // a: mitad inferior (cae y es empujada); b: mitad superior
      let a = { x: 0, y: -26, r: 0 };
      let b = { x: 0, y: -26, r: 0 };
      if (phase >= 1) {
        a = track(P, [
          [0, { x: 0, y: -26, r: 0 }],
          [0.4, { x: 22, y: -18, r: 18 }],
          [1, { x: 10, y: -40, r: 8 }],
        ]);
      }
      if (phase === 2) {
        b = track(P, [
          [0, { x: 10, y: -40, r: 8 }],
          [0.5, { x: -20, y: -22, r: -14 }],
          [1, { x: 0, y: -26, r: 0 }],
        ]);
        a = track(P, [
          [0, { x: 10, y: -40, r: 8 }],
          [0.6, { x: 14, y: -34, r: 4 }],
          [1, { x: 0, y: -27, r: 0 }],
        ]);
      }
      a = mix(a, { x: 0, y: -26, r: 0 }, reset);
      b = mix(b, { x: 0, y: -26, r: 0 }, reset);
      const A = deck({ ...a, r: 90 + a.r, n: 3, s: 0.92 });
      const B = deck({ ...b, r: 90 + b.r, n: 3, s: 0.92 });
      const aOnTop = phase === 1 || (phase === 2 && P > 0.55);
      const pose = { index: { a: -10, c: phase >= 1 ? 0.6 + 0.3 * Math.sin(P * Math.PI) : 0.5 }, middle: { a: 0, c: 0.55 }, ring: { a: 0, c: 0.6 }, pinky: { a: 0, c: 0.65 }, thumb: { a: 25, c: 0.15, over: true } };
      return hand({ x: 160, y: 150, r: 15, s: 1.05, pose, hold: aOnTop ? B + A : A + B }) + (phase === 2 ? sparkles(220, 70, t, span(t, 3.6, 4) * (1 - reset)) : '');
    },
  };
}

export const SCENE_KEYS = Object.keys(SCENES);
