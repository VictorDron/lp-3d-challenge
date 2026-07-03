const canvas = document.querySelector('#space');
const ctx = canvas.getContext('2d');
const ship = document.querySelector('#ship');
const planet = document.querySelector('#planet');
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let width = 0;
let height = 0;
let stars = [];
let pointer = { x: 0, y: 0 };

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.min(180, Math.floor((width * height) / 7500));
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    z: Math.random() * 1 + 0.2,
    r: Math.random() * 1.5 + 0.2,
    vx: (Math.random() - 0.5) * 0.18,
    vy: (Math.random() - 0.5) * 0.18,
    hue: Math.random() > 0.74 ? '246,201,111' : '246,243,232'
  }));
}

function drawStars() {
  ctx.clearRect(0, 0, width, height);
  for (const star of stars) {
    star.x += star.vx * star.z;
    star.y += star.vy * star.z;
    if (star.x < -10) star.x = width + 10;
    if (star.x > width + 10) star.x = -10;
    if (star.y < -10) star.y = height + 10;
    if (star.y > height + 10) star.y = -10;
    const dx = (pointer.x - width / 2) * 0.0009 * star.z;
    const dy = (pointer.y - height / 2) * 0.0009 * star.z;
    ctx.beginPath();
    ctx.fillStyle = `rgba(${star.hue}, ${0.28 + star.z * 0.45})`;
    ctx.arc(star.x + dx * 40, star.y + dy * 40, star.r * star.z, 0, Math.PI * 2);
    ctx.fill();
  }
  if (!prefersReduced) requestAnimationFrame(drawStars);
}

function onPointerMove(event) {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  const x = (event.clientX / window.innerWidth - 0.5) * 2;
  const y = (event.clientY / window.innerHeight - 0.5) * 2;
  if (ship) ship.style.translate = `${x * -18}px ${y * -12}px`;
  if (planet) planet.style.filter = `drop-shadow(${x * -12}px ${y * -8}px 34px rgba(255,109,90,.18))`;
}

function setupTiltCards() {
  document.querySelectorAll('.tilt').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `rotateX(${py * -7}deg) rotateY(${px * 8}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });
}

function setupReveal() {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.16 });
  document.querySelectorAll('[data-reveal]').forEach((el, index) => {
    el.style.transitionDelay = `${Math.min(index * 60, 260)}ms`;
    observer.observe(el);
  });
}

resize();
setupTiltCards();
setupReveal();
window.addEventListener('resize', resize);
window.addEventListener('pointermove', onPointerMove, { passive: true });
if (prefersReduced) drawStars(); else requestAnimationFrame(drawStars);
