import './styles/main.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { initGradient } from './modules/gradient.js';
import { initCursor } from './modules/cursor.js';
import { initTilt } from './modules/tilt.js';
import { initOpenNow } from './modules/openNow.js';

gsap.registerPlugin(ScrollTrigger);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ----------------------------- smooth scroll ----------------------------- */
const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: !reduce });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -10, duration: 1.4 });
  });
});

/* ----------------------- line reveal (single rise) ----------------------- */
// A clean clip-and-rise on whole heading lines. Deliberately NOT a word-by-word
// reveal, to keep this site distinct from the Elevate manifesto treatment.
function setupLines() {
  document.querySelectorAll('.reveal-line').forEach((el) => {
    const inner = document.createElement('span');
    inner.className = 'reveal-line__in';
    while (el.firstChild) inner.appendChild(el.firstChild);
    el.appendChild(inner);
    el.classList.add('is-clip');
    if (reduce) return;
    gsap.set(inner, { yPercent: 116 });
    ScrollTrigger.create({
      trigger: el, start: 'top 86%', once: true,
      onEnter: () => gsap.to(inner, { yPercent: 0, duration: 1.1, ease: 'power4.out' }),
    });
  });
}

/* -------------------------------- reveals -------------------------------- */
// ScrollTrigger (not IntersectionObserver) so elements already scrolled past on
// load — e.g. after a refresh that restores mid-page scroll — still get revealed.
function setupReveals() {
  gsap.utils.toArray('[data-reveal], [data-reveal-img]').forEach((el) => {
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => el.classList.add('in'),
    });
  });
}

/* ------------------------------- parallax -------------------------------- */
function setupParallax() {
  if (reduce) return;
  gsap.utils.toArray('[data-parallax]').forEach((el) => {
    const amt = parseFloat(el.dataset.parallax) || 0.15;
    gsap.fromTo(el, { yPercent: -amt * 55 }, {
      yPercent: amt * 55, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

/* ------------------------------- marquee --------------------------------- */
function setupMarquee() {
  const track = document.querySelector('[data-marquee]');
  if (!track || reduce) return;
  track.innerHTML += track.innerHTML;
  gsap.to(track, { xPercent: -50, duration: 34, ease: 'none', repeat: -1 });
}

/* ------------------------------ nav states ------------------------------- */
function setupNav() {
  const nav = document.getElementById('nav');
  lenis.on('scroll', ({ scroll }) => nav.classList.toggle('is-scrolled', scroll > 40));
  const lightSelectors = ['.taste', '.menu', '.visit'];
  const setLight = (on) => nav.classList.toggle('is-light', on);
  document.querySelectorAll('section, footer').forEach((sec) => {
    const isLight = lightSelectors.some((s) => sec.matches(s));
    ScrollTrigger.create({
      trigger: sec, start: 'top 66px', end: 'bottom 66px',
      onToggle: (self) => { if (self.isActive) setLight(isLight); },
    });
  });
}

/* ----------------------------- hero entrance ----------------------------- */
function heroIntro() {
  const items = gsap.utils.toArray('[data-hero]');
  if (reduce) { gsap.set(items, { opacity: 1, y: 0 }); return; }
  gsap.set(items, { opacity: 0, y: 40 });
  gsap.to(items, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.12, delay: 0.1 });
}

/* -------------------------------- loader --------------------------------- */
function runLoader() {
  const loader = document.getElementById('loader');
  const bar = loader ? loader.querySelector('.loader__bar span') : null;
  const finish = () => {
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-ready');
    if (loader) loader.classList.add('is-done');
    heroIntro();
    ScrollTrigger.refresh();
  };
  if (!loader || reduce) { if (loader) loader.style.display = 'none'; finish(); return; }
  const tl = gsap.timeline({ onComplete: finish });
  tl.to(bar, { width: '100%', duration: 1.0, ease: 'power2.inOut' })
    .to(loader, { yPercent: -100, duration: 0.8, ease: 'power4.inOut' }, '+=0.1');
}

/* --------------------------------- boot ---------------------------------- */
document.body.classList.add('is-loading');
initOpenNow();
setupLines();
setupReveals();
setupParallax();
setupMarquee();
setupNav();
initGradient(document.getElementById('hero-gradient'), { interactive: true });
initGradient(document.getElementById('pistachio-canvas'));
initTilt();
initCursor();

const yr = document.querySelector('[data-year]');
if (yr) yr.textContent = new Date().getFullYear();

window.addEventListener('load', () => ScrollTrigger.refresh());
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());

runLoader();
