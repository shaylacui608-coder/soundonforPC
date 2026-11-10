const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const scene = document.querySelector('.scene');
const orbs = [...scene.querySelectorAll('.orb')];
const motion = document.querySelector('#motion');
const pointer = { x: 0, y: 0 };
const smooth = { x: 0, y: 0 };
let paused = reducedMotion;
let elapsed = 0;
let previous = performance.now();

if (!reducedMotion) {
  window.addEventListener('pointermove', (event) => {
    pointer.x = 2 * event.clientX / innerWidth - 1;
    pointer.y = 1 - 2 * event.clientY / innerHeight;
  });
  window.addEventListener('pointerleave', () => {
    pointer.x = 0;
    pointer.y = 0;
  });
}

for (const orb of orbs) {
  orb.setAttribute('aria-pressed', 'false');
  orb.addEventListener('click', () => {
    orb.setAttribute('aria-pressed', String(orb.classList.toggle('selected')));
  });
}

function updateMotionLabel() {
  motion.textContent = paused ? 'Resume motion ▷' : 'Pause motion Ⅱ';
  motion.setAttribute('aria-label', paused ? 'Resume motion' : 'Pause motion');
}

motion.addEventListener('click', () => {
  paused = !paused;
  updateMotionLabel();
});
updateMotionLabel();

function frame(now) {
  const delta = Math.min((now - previous) / 1000, .05);
  previous = now;
  if (!paused) elapsed += delta;

  smooth.x += (pointer.x - smooth.x) * .04;
  smooth.y += (pointer.y - smooth.y) * .04;
  // Blend the two studio renders as the cursor moves across the scene.
  const blend = Math.max(0, Math.min(1, .5 + .43 * smooth.x + .12 * smooth.y));
  scene.style.setProperty('--light-blend', blend.toFixed(3));

  orbs.forEach((orb, index) => {
    const x = paused ? 0 : Math.sin(elapsed * .30 + index * 1.7) * 5 + smooth.x * (index + 2) * .8;
    const y = paused ? 0 : Math.sin(elapsed * .36 + index * 2.1) * 8 - smooth.y * (index + 2) * .7;
    orb.style.setProperty('--x', x + 'px');
    orb.style.setProperty('--y', y + 'px');
  });

  requestAnimationFrame(frame);
}

if (!reducedMotion) requestAnimationFrame(frame);
