// Custom cursor (ring + dot with eased follow) and magnetic pull on [data-magnetic].
// Both are pointer-device only; touch screens keep the native behaviour.
import { gsap } from 'gsap';

export function initCursor() {
  const el = document.getElementById('cursor');
  if (!el || matchMedia('(hover: none)').matches) return;
  const ring = el.querySelector('.cursor__ring');
  const dot = el.querySelector('.cursor__dot');

  let x = innerWidth / 2, y = innerHeight / 2;
  const rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });
  const dx = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
  const dy = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });

  window.addEventListener('mousemove', (e) => {
    x = e.clientX; y = e.clientY;
    rx(x); ry(y); dx(x); dy(y);
  }, { passive: true });

  document.addEventListener('mouseenter', () => el.classList.remove('is-hidden'));
  document.addEventListener('mouseleave', () => el.classList.add('is-hidden'));

  const hoverables = document.querySelectorAll('a, button, [data-cursor], [data-tilt]');
  hoverables.forEach((h) => {
    h.addEventListener('mouseenter', () => el.classList.add('is-hover'));
    h.addEventListener('mouseleave', () => el.classList.remove('is-hover'));
  });

  initMagnetic();
}

function initMagnetic() {
  const items = document.querySelectorAll('[data-magnetic]');
  items.forEach((item) => {
    const strength = 0.4;
    const xTo = gsap.quickTo(item, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    const yTo = gsap.quickTo(item, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    item.addEventListener('mousemove', (e) => {
      const r = item.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width / 2);
      const my = e.clientY - (r.top + r.height / 2);
      xTo(mx * strength); yTo(my * strength);
    });
    item.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
  });
}
