// Logo de la app (las ilustraciones de los pasos ahora están animadas en src/anim/).
export function appLogo(size = 88) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs><linearGradient id="lgGold" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#ffe7a3"/><stop offset="1" stop-color="#d79b2f"/></linearGradient></defs>
    <g transform="rotate(-14 50 55)"><rect x="22" y="22" width="40" height="58" rx="6" fill="#8e1d2c" stroke="#fff" stroke-width="2.5"/></g>
    <g transform="rotate(10 50 55)"><rect x="38" y="20" width="40" height="58" rx="6" fill="#fffdf7" stroke="#2a2438" stroke-width="2"/>
      <text x="58" y="58" font-size="26" text-anchor="middle" fill="#c2182b">♥</text></g>
    <path d="M50 4 L54 14 L64 18 L54 22 L50 32 L46 22 L36 18 L46 14 Z" fill="url(#lgGold)"/>
  </svg>`;
}
