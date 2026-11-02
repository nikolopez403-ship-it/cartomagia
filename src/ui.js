export function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add('out'), 2200);
  setTimeout(() => el.remove(), 2700);
}

export function confetti(container) {
  const colors = ['#f6d27a', '#c2182b', '#7ad7f6', '#fff', '#9b6bff'];
  for (let i = 0; i < 60; i++) {
    const c = document.createElement('i');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + '%';
    c.style.background = colors[i % colors.length];
    c.style.animationDelay = Math.random() * 0.6 + 's';
    c.style.transform = `rotate(${Math.random() * 360}deg)`;
    container.appendChild(c);
    setTimeout(() => c.remove(), 3500);
  }
}
