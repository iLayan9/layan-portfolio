(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Starfield ---------- */
  const sky = document.getElementById('sky');
  if (sky) {
    const ctx = sky.getContext('2d');
    let stars = [], w = 0, h = 0, dpr = 1;
    const make = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = sky.clientWidth; h = sky.clientHeight;
      sky.width = w * dpr; sky.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round((w * h) / 5200);
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() < 0.08 ? 1.6 : Math.random() * 0.9 + 0.3,
        a: Math.random() * 0.6 + 0.2, t: Math.random() * Math.PI * 2, s: Math.random() * 0.012 + 0.004,
        sq: Math.random() < 0.18
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const a = reduce ? s.a : s.a * (0.65 + 0.35 * Math.sin(s.t));
        ctx.fillStyle = `rgba(234,240,255,${a})`;
        if (s.sq) ctx.fillRect(Math.round(s.x), Math.round(s.y), Math.ceil(s.r * 1.6), Math.ceil(s.r * 1.6));
        else { ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill(); }
        s.t += s.s;
      }
    };
    make(); draw();
    window.addEventListener('resize', () => { make(); draw(); });
    if (!reduce) { const loop = () => { draw(); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
  }

  /* ---------- Pixel wordmark ---------- */
  const GLYPHS = {
    L: ['X....', 'X....', 'X....', 'X....', 'X....', 'X...X', '.XXX.'],
    A: ['..X..', '.X.X.', 'X...X', 'XXXXX', 'X...X', 'X...X', 'X...X'],
    Y: ['X...X', 'X...X', '.X.X.', '..X..', '..X..', '..X..', '..X..'],
    N: ['X...X', 'XX..X', 'X.X.X', 'X..XX', 'X...X', 'X...X', 'X...X']
  };
  document.querySelectorAll('[data-glyph]').forEach((el, gi) => {
    const rows = GLYPHS[el.dataset.glyph];
    if (!rows) return;
    if (!reduce && !el.closest('.brand')) el.classList.add('js');
    rows.forEach((row, r) => [...row].forEach((c, col) => {
      const i = document.createElement('i');
      if (c === 'X') {
        i.className = 'on';
        i.style.setProperty('--dx', `${(Math.random() - 0.5) * 160}px`);
        i.style.setProperty('--dy', `${(Math.random() - 0.5) * 120}px`);
        i.style.setProperty('--d', `${(gi * 0.07 + Math.random() * 0.35).toFixed(2)}s`);
      }
      el.appendChild(i);
    }));
  });
  if (!reduce) requestAnimationFrame(() => requestAnimationFrame(() =>
    document.querySelectorAll('.glyph.js').forEach(g => g.classList.add('ready'))));

  /* ---------- Pen-tool flow line ---------- */
  const flow = document.querySelector('.flowline');
  const pen = document.querySelector('.pen');
  if (flow) {
    const NS = 'http://www.w3.org/2000/svg';
    const stage = flow.parentElement;
    const build = () => {
      const fr = flow.getBoundingClientRect();
      const W = fr.width, H = fr.height;
      if (!W || !H) return null;
      flow.setAttribute('viewBox', `0 0 ${W} ${H}`);
      flow.innerHTML = '';
      const p = [[0, H * .22], [W * .46, H * .22], [W * .72, H * .86], [W * .985, H * .04]];
      const d = `M${p[0]} L${p[1]} C${W * .57},${H * .22} ${W * .6},${H * .86} ${p[2]} C${W * .83},${H * .86} ${W * .88},${H * .3} ${p[3]}`;
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('d', d); path.setAttribute('class', 'curve');
      flow.appendChild(path);
      const len = path.getTotalLength();
      const handles = [[[W * .57, H * .22], [W * .35, H * .22]], [[W * .6, H * .86], [W * .83, H * .86]]];
      const anchorsAt = [0, 0.38, 0.68, 1];
      const g = document.createElementNS(NS, 'g');
      flow.appendChild(g);
      return { path, len, p, handles, anchorsAt, g, W, H };
    };
    const render = (st, t) => {
      if (!st) return;
      st.path.style.strokeDasharray = st.len;
      st.path.style.strokeDashoffset = st.len * (1 - t);
      st.g.innerHTML = '';
      const NS2 = 'http://www.w3.org/2000/svg';
      const showHandle = (i) => {
        const [a, b] = st.handles[i]; const c = st.p[i + 1];
        [a, b].forEach(hp => {
          const l = document.createElementNS(NS2, 'line');
          l.setAttribute('x1', c[0]); l.setAttribute('y1', c[1]); l.setAttribute('x2', hp[0]); l.setAttribute('y2', hp[1]);
          l.setAttribute('class', 'handle'); st.g.appendChild(l);
          const k = document.createElementNS(NS2, 'circle');
          k.setAttribute('cx', hp[0]); k.setAttribute('cy', hp[1]); k.setAttribute('r', 3); k.setAttribute('class', 'knob'); st.g.appendChild(k);
        });
      };
      if (t > 0.38 && t < 0.72) showHandle(0);
      if (t >= 0.72) showHandle(1);
      st.anchorsAt.forEach((at, i) => {
        if (t + 0.001 < at) return;
        const s = 7, r = document.createElementNS(NS2, 'rect');
        r.setAttribute('x', st.p[i][0] - s / 2); r.setAttribute('y', st.p[i][1] - s / 2);
        r.setAttribute('width', s); r.setAttribute('height', s); r.setAttribute('class', 'anchor');
        st.g.appendChild(r);
      });
      if (pen) {
        const pt = st.path.getPointAtLength(st.len * t);
        const fr = flow.getBoundingClientRect(), sr = stage.getBoundingClientRect();
        const size = pen.getBoundingClientRect().width || 24;
        pen.style.transform = `translate(${fr.left - sr.left + pt.x - size * 0.14}px, ${fr.top - sr.top + pt.y - size * 0.14}px)`;
      }
    };
    let st = build();
    if (reduce) render(st, 1);
    else {
      render(st, 0);
      const start = performance.now() + 900, dur = 1900;
      const tick = (now) => {
        const t = Math.min(Math.max((now - start) / dur, 0), 1);
        const e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        render(st, e);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
    let done = reduce;
    const rebuild = () => { if (!done) return; st = build(); render(st, 1); };
    window.addEventListener('resize', rebuild);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { st = build(); render(st, done ? 1 : 0); });
    setTimeout(() => { done = true; rebuild(); const ab = document.querySelector('.artboard'); if (ab) ab.classList.add('done'); }, 3000);
  }

  /* ---------- Frame dimension labels ---------- */
  document.querySelectorAll('.frame img[data-dims]').forEach(img => {
    const set = () => {
      const frame = img.closest('.frame');
      const out = frame && frame.querySelector('.dims');
      const sel = frame && frame.querySelector('.sel b');
      const txt = img.dataset.dims;
      if (out) out.textContent = txt;
      if (sel) sel.textContent = txt.replace(' × ', ' × ');
    };
    set();
  });

  /* ---------- Copy email ---------- */
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const value = btn.dataset.copy;
      const out = document.getElementById(btn.dataset.toast);
      try { await navigator.clipboard.writeText(value); if (out) out.textContent = 'Email copied'; }
      catch (e) {
        const code = document.getElementById(btn.dataset.select);
        if (code) { const r = document.createRange(); r.selectNodeContents(code); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
        if (out) out.textContent = 'Selected. Press Ctrl+C to copy';
      }
    });
  });

  /* ---------- Compare slider ---------- */
  document.querySelectorAll('.compare').forEach(c => {
    const input = c.querySelector('input[type=range]');
    const set = () => c.style.setProperty('--pos', input.value + '%');
    input.addEventListener('input', set); set();
  });

  /* ---------- Stage switcher ---------- */
  document.querySelectorAll('.stages').forEach(box => {
    const tabs = [...box.querySelectorAll('[role="tab"]')];
    const show = (t) => {
      tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1;
        const p = document.getElementById(x.getAttribute('aria-controls')); if (p) p.hidden = !on; });
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => show(t));
      t.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; n.focus(); show(n);
        }
      });
    });
  });

  /* ---------- TOC highlight ---------- */
  const tocLinks = [...document.querySelectorAll('.toc a')];
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const map = new Map(tocLinks.map(a => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          tocLinks.forEach(a => a.classList.remove('on'));
          const a = map.get(en.target.id); if (a) a.classList.add('on');
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    map.forEach((a, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }
})();

/* ---------- Hero rotating word ---------- */
(() => {
  const el = document.querySelector('[data-rotate]');
  if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const words = el.dataset.rotate.split('|');
  let i = 0;
  const type = (w, k = 0) => { el.textContent = w.slice(0, k); if (k < w.length) setTimeout(() => type(w, k + 1), 70); else setTimeout(erase, 2200); };
  const erase = () => { const t = el.textContent; if (t.length) { el.textContent = t.slice(0, -1); setTimeout(erase, 40); } else { i = (i + 1) % words.length; setTimeout(() => type(words[i]), 250); } };
  setTimeout(erase, 3400);
})();
