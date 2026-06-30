// Living pistachio-gold gradient. We draw soft additive blobs on a canvas that
// CSS then blurs heavily, so a handful of cheap circles read as a flowing liquid
// mesh. With { interactive: true } the field gently leans toward the cursor and a
// warm highlight follows it. DPR is capped and the loop self-pauses off-screen.
export function initGradient(canvas, opts = {}) {
  if (!canvas) return;
  const interactive = !!opts.interactive;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d', { alpha: false });
  let w = 0, h = 0, dpr = 1, raf = 0, t = 0;
  let mx = 0.5, my = 0.5, tmx = 0.5, tmy = 0.5;

  const blobs = [
    { c: [111, 154, 100], r: 0.55, ox: 0.30, oy: 0.32, ax: 0.16, ay: 0.12, sx: 0.18, sy: 0.13 },
    { c: [79, 122, 82],  r: 0.62, ox: 0.72, oy: 0.40, ax: 0.18, ay: 0.16, sx: 0.12, sy: 0.21 },
    { c: [201, 162, 75], r: 0.40, ox: 0.55, oy: 0.66, ax: 0.20, ay: 0.14, sx: 0.16, sy: 0.10 },
    { c: [196, 220, 184], r: 0.34, ox: 0.24, oy: 0.74, ax: 0.14, ay: 0.18, sx: 0.20, sy: 0.15 },
    { c: [47, 86, 56],   r: 0.66, ox: 0.85, oy: 0.82, ax: 0.12, ay: 0.12, sx: 0.10, sy: 0.18 },
  ];

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 1.3);
    w = Math.max(1, Math.floor(rect.width * dpr));
    h = Math.max(1, Math.floor(rect.height * dpr));
    canvas.width = w; canvas.height = h;
  };

  const draw = () => {
    mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;
    const leanX = (mx - 0.5), leanY = (my - 0.5);
    ctx.fillStyle = '#0e1c14';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    const min = Math.min(w, h);
    for (const b of blobs) {
      const lean = interactive ? (1.1 - b.r) * 0.16 : 0; // smaller blobs lean more
      const x = (b.ox + Math.sin(t * b.sx + b.ax * 10) * b.ax + leanX * lean) * w;
      const y = (b.oy + Math.cos(t * b.sy + b.ay * 10) * b.ay + leanY * lean) * h;
      const r = b.r * min;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      const [cr, cg, cb] = b.c;
      g.addColorStop(0, `rgba(${cr},${cg},${cb},0.55)`);
      g.addColorStop(0.45, `rgba(${cr},${cg},${cb},0.22)`);
      g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    if (interactive) {
      const gx = mx * w, gy = my * h, gr = 0.5 * min;
      const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
      g.addColorStop(0, 'rgba(232,240,212,0.32)');
      g.addColorStop(0.5, 'rgba(201,162,75,0.12)');
      g.addColorStop(1, 'rgba(201,162,75,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(gx, gy, gr, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  };

  const loop = () => { t += 0.0045; draw(); raf = requestAnimationFrame(loop); };

  resize();
  draw();
  if (interactive) {
    window.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      tmx = (e.clientX - r.left) / r.width;
      tmy = (e.clientY - r.top) / r.height;
    }, { passive: true });
  }
  if (!reduce) {
    raf = requestAnimationFrame(loop);
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !raf) raf = requestAnimationFrame(loop);
      if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; }
    }, { threshold: 0 });
    io.observe(canvas);
  }
  window.addEventListener('resize', () => { resize(); draw(); }, { passive: true });
}
