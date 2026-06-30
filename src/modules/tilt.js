// Subtle 3D parallax tilt for [data-tilt] cards. Pointer position maps to a small
// rotateX/rotateY with perspective; eased via gsap.quickTo so it never feels jittery.
import { gsap } from 'gsap';

export function initTilt() {
  if (matchMedia('(hover: none)').matches) return;
  const els = document.querySelectorAll('[data-tilt]');
  els.forEach((el) => {
    el.style.transformStyle = 'preserve-3d';
    gsap.set(el, { transformPerspective: 900 });
    const max = el.classList.contains('card') ? 8 : 6;
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3' });

    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      ry(px * max); rx(-py * max);
    });
    el.addEventListener('mouseleave', () => { rx(0); ry(0); });
  });
}
