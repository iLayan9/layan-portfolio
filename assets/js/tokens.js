(() => {
  const root = document.querySelector('[data-tokens-demo]');
  if (!root) return;

  /* ---------- Layer 1: option tokens (raw values) ---------- */
  const OPTION = {
    'grey/0': '#FFFFFF', 'grey/50': '#F6F7F9', 'grey/200': '#E2E4EA', 'grey/300': '#C4C8D4', 'grey/500': '#7D8396',
    'grey/700': '#3A3F4E', 'grey/800': '#232733', 'grey/900': '#14171F',
    'purple/100': '#EFE8FF', 'purple/300': '#B79CFF', 'purple/500': '#7C4DFF', 'purple/700': '#4A25B0', 'purple/900': '#2A1A5E',
    'amber/100': '#F6E6D3', 'amber/300': '#E2AE74', 'amber/500': '#C98A4B', 'amber/700': '#7D4F25', 'amber/900': '#33241A',
    'blue/100': '#E3EDFF', 'blue/300': '#93B6FF', 'blue/500': '#2F6BFF', 'blue/700': '#1E4FD0', 'blue/900': '#14254F',
    'radius/sm': '6px', 'radius/md': '12px', 'radius/xl': '22px',
    'font/latin': 'Manrope', 'font/arabic': 'IBM Plex Sans Arabic'
  };
  const HUE = { diamond: 'purple', amber: 'amber', opal: 'blue' };
  const RADIUS = { diamond: 'radius/md', amber: 'radius/sm', opal: 'radius/xl' };

  /* ---------- Layer 2: alias tokens (meaning), resolved per mode ---------- */
  const alias = (name, s) => {
    const h = HUE[s.brand], dark = s.theme === 'dark';
    switch (name) {
      case 'color/primary': return `${h}/${dark ? 300 : 500}`;
      case 'color/on-primary': return dark ? 'grey/900' : 'grey/0';
      case 'color/primary-soft': return `${h}/${dark ? 900 : 100}`;
      case 'color/primary-strong': return `${h}/${dark ? 100 : 700}`;
      case 'color/surface': return dark ? 'grey/800' : 'grey/0';
      case 'color/canvas': return dark ? 'grey/900' : 'grey/50';
      case 'color/border': return dark ? 'grey/700' : 'grey/200';
      case 'color/text': return dark ? 'grey/50' : 'grey/900';
      case 'color/text-muted': return dark ? 'grey/300' : 'grey/500';
      case 'radius/brand': return RADIUS[s.brand];
      case 'font/body': return s.lang === 'ar' ? 'font/arabic' : 'font/latin';
    }
  };

  /* ---------- Layer 3: component tokens (context) ---------- */
  const COMPONENT = [
    ['card/bg', 'color/surface', 'card'],
    ['card/border/color', 'color/border', 'card'],
    ['card/radius', 'radius/brand', 'card'],
    ['card/title/color', 'color/text', 'title'],
    ['card/body/color', 'color/text-muted', 'body'],
    ['button/primary/bg', 'color/primary', 'primary'],
    ['button/primary/text', 'color/on-primary', 'primary'],
    ['button/secondary/bg', 'color/primary-soft', 'secondary'],
    ['button/secondary/text', 'color/primary-strong', 'secondary'],
    ['alert/bg', 'color/primary-soft', 'alert'],
    ['alert/text', 'color/primary-strong', 'alert'],
    ['text/font-family', 'font/body', 'card'],
    ['text/direction', null, 'card']
  ];

  const state = { brand: 'diamond', lang: 'en', theme: 'light', token: 'card/border/color' };

  const resolve = (tok) => {
    const row = COMPONENT.find(r => r[0] === tok);
    if (!row[1]) return { comp: tok, alias: '—', option: 'mode: ' + state.lang, value: state.lang === 'ar' ? 'rtl' : 'ltr' };
    const opt = alias(row[1], state);
    return { comp: tok, alias: row[1], option: opt, value: OPTION[opt] || (opt === 'grey/50' ? OPTION['grey/50'] : opt) };
  };
  const isColor = v => /^#/.test(v);
  const cssName = t => '--' + t.replace(/\//g, '-');

  /* ---------- Copy for the live preview ---------- */
  const COPY = {
    en: { kicker: 'Subscription', title: 'Pro plan', body: 'Advanced tools for growing teams.', price: '$24', per: '/ month', p: 'Subscribe', s: 'Compare plans', alert: 'Your plan renews in 3 days' },
    ar: { kicker: 'الاشتراك', title: 'الباقة الاحترافية', body: 'أدوات متقدمة للفرق النامية.', price: '٢٤ ر.س', per: '/ شهريًا', p: 'اشترك', s: 'قارن الباقات', alert: 'يتجدد اشتراكك خلال ٣ أيام' }
  };

  /* ---------- Controls (rendered in every [data-tk-controls]) ---------- */
  const GROUPS = [
    ['brand', 'Brand', [['diamond', 'Diamond'], ['amber', 'Amber'], ['opal', 'Opal']]],
    ['lang', 'Language', [['en', 'EN'], ['ar', 'AR']]],
    ['theme', 'Theme', [['light', 'Light'], ['dark', 'Dark']]]
  ];
  document.querySelectorAll('[data-tk-controls]').forEach(box => {
    box.innerHTML = GROUPS.map(([k, label, opts]) =>
      `<div class="tk-seg" role="group" aria-label="${label}"><span>${label}</span>${opts.map(([v, t]) =>
        `<button type="button" data-k="${k}" data-v="${v}">${t}</button>`).join('')}</div>`).join('');
    box.addEventListener('click', e => {
      const b = e.target.closest('button[data-k]'); if (!b) return;
      state[b.dataset.k] = b.dataset.v; render();
    });
  });
  document.querySelectorAll('[data-tk-pick]').forEach(box => {
    const picks = ['card/border/color', 'button/primary/bg', 'alert/text', 'card/radius', 'text/font-family'];
    box.innerHTML = picks.map(t => `<button type="button" data-tok="${t}">${t}</button>`).join('');
    box.addEventListener('click', e => { const b = e.target.closest('button[data-tok]'); if (!b) return; state.token = b.dataset.tok; render(); });
  });

  const preview = root.querySelector('.tk-preview');
  const table = root.querySelector('.tk-table tbody');
  const chain = document.querySelector('.tk-chain');
  const codeJson = document.querySelector('[data-code="json"]');
  const codeCss = document.querySelector('[data-code="css"]');
  const codeUse = document.querySelector('[data-code="use"]');

  const swatch = v => isColor(v) ? `<i class="tk-sw" style="background:${v}"></i>` : '';
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  const render = () => {
    document.querySelectorAll('.tk-seg button').forEach(b => b.setAttribute('aria-pressed', state[b.dataset.k] === b.dataset.v));
    document.querySelectorAll('[data-tk-pick] button').forEach(b => b.setAttribute('aria-pressed', b.dataset.tok === state.token));
    const mode = `${state.brand} · ${state.lang.toUpperCase()} · ${state.theme}`;
    document.querySelectorAll('[data-tk-mode]').forEach(el => el.textContent = mode);

    /* live preview: set CSS variables from component tokens */
    const vals = {};
    COMPONENT.forEach(([t]) => { vals[t] = resolve(t).value; preview.style.setProperty(cssName(t), vals[t]); });
    preview.style.setProperty('--canvas', OPTION[alias('color/canvas', state)]);
    preview.setAttribute('dir', vals['text/direction']);
    preview.style.fontFamily = `'${vals['text/font-family']}', sans-serif`;
    const c = COPY[state.lang];
    preview.querySelector('[data-c="kicker"]').textContent = c.kicker;
    preview.querySelector('[data-c="title"]').textContent = c.title;
    preview.querySelector('[data-c="body"]').textContent = c.body;
    preview.querySelector('[data-c="price"]').textContent = c.price;
    preview.querySelector('[data-c="per"]').textContent = c.per;
    preview.querySelector('[data-c="p"]').textContent = c.p;
    preview.querySelector('[data-c="s"]').textContent = c.s;
    preview.querySelector('[data-c="alert"]').textContent = c.alert;

    /* inspector table */
    table.innerHTML = COMPONENT.map(([t, , part]) => {
      const r = resolve(t);
      return `<tr data-part="${part}" data-tok="${t}"${t === state.token ? ' class="on"' : ''}><td><code>${t}</code></td><td><code>${r.alias}</code></td><td title="${esc(r.value)}">${swatch(r.value)}<code>${r.option}</code>${isColor(r.value) ? '' : ` <span class="tk-v">${esc(r.value)}</span>`}</td></tr>`;
    }).join('');

    /* chain */
    if (chain) {
      const r = resolve(state.token);
      chain.innerHTML = `
        <div class="tk-step l3"><small>3 · Component</small><code>${r.comp}</code><span>Where it's used</span></div>
        <div class="tk-arrow" aria-hidden="true">→</div>
        <div class="tk-step l2"><small>2 · Alias</small><code>${r.alias}</code><span>What it means</span></div>
        <div class="tk-arrow" aria-hidden="true">→</div>
        <div class="tk-step l1"><small>1 · Option</small><code>${r.option}</code><span>The raw value</span></div>
        <div class="tk-arrow" aria-hidden="true">=</div>
        <div class="tk-step val">${swatch(r.value)}<code>${esc(r.value)}</code></div>`;
    }

    /* code */
    const sel = `[data-brand="${state.brand}"][data-theme="${state.theme}"][lang="${state.lang}"]`;
    if (codeJson) codeJson.innerHTML = esc(JSON.stringify({
      component: { card: { bg: { $value: '{color.surface}' }, border: { color: { $value: '{color.border}' } }, radius: { $value: '{radius.brand}' } },
        button: { primary: { bg: { $value: '{color.primary}' } } } },
      alias: { $mode: mode, color: { surface: { $value: '{' + alias('color/surface', state).replace('/', '.') + '}' }, border: { $value: '{' + alias('color/border', state).replace('/', '.') + '}' }, primary: { $value: '{' + alias('color/primary', state).replace('/', '.') + '}' } }, radius: { brand: { $value: '{' + alias('radius/brand', state).replace('/', '.') + '}' } } }
    }, null, 2)).replace(/"(\{[^"]+\})"/g, '"<b>$1</b>"');
    if (codeCss) codeCss.innerHTML = `${esc(sel)} {\n` + ['card/bg', 'card/border/color', 'card/radius', 'button/primary/bg', 'button/primary/text', 'text/direction', 'text/font-family']
      .map(t => `  <b>${cssName(t)}</b>: ${esc(vals[t])};`).join('\n') + '\n}';
    if (codeUse) codeUse.innerHTML = `.card {\n  background: var(<b>--card-bg</b>);\n  border: 1px solid var(<b>--card-border-color</b>);\n  border-radius: var(<b>--card-radius</b>);\n  direction: var(<b>--text-direction</b>);\n  font-family: var(<b>--text-font-family</b>);\n}\n.button--primary {\n  background: var(<b>--button-primary-bg</b>);\n  color: var(<b>--button-primary-text</b>);\n}`;
    highlight();
  };

  /* hover a row → highlight the part of the preview it styles */
  const highlight = (part) => {
    preview.querySelectorAll('[data-part]').forEach(el => el.classList.toggle('tk-hl', !!part && el.dataset.part === part));
  };
  table.addEventListener('mouseover', e => { const tr = e.target.closest('tr'); if (tr) highlight(tr.dataset.part); });
  table.addEventListener('mouseleave', () => highlight());
  table.addEventListener('click', e => { const tr = e.target.closest('tr'); if (tr) { state.token = tr.dataset.tok; render(); highlight(tr.dataset.part); } });
  preview.addEventListener('mouseover', e => { const el = e.target.closest('[data-part]'); if (el) { table.querySelectorAll('tr').forEach(tr => tr.classList.toggle('hover', tr.dataset.part === el.dataset.part)); } });
  preview.addEventListener('mouseleave', () => table.querySelectorAll('tr').forEach(tr => tr.classList.remove('hover')));

  render();
})();

/* ---------- Three layers: one decision, light vs dark ---------- */
(() => {
  const box = document.querySelector('[data-layers]');
  if (!box) return;
  const M = {
    light: { opt: '200', bg: '#FFFFFF', border: '#E2E4EA', text: '#14171F', sub: '#7D8396', canvas: '#F6F7F9' },
    dark: { opt: '700', bg: '#232733', border: '#3A3F4E', text: '#F6F7F9', sub: '#C4C8D4', canvas: '#14171F' }
  };
  const set = (t) => {
    const m = M[t];
    box.querySelectorAll('[data-t]').forEach(b => b.setAttribute('aria-pressed', b.dataset.t === t));
    box.querySelectorAll('[data-l="opt"]').forEach(el => el.textContent = m.opt);
    box.querySelectorAll('.tl-ramp i').forEach(i => i.classList.toggle('on', i.dataset.g === m.opt));
    const mini = box.querySelector('.tl-mini');
    mini.style.setProperty('--bg', m.bg); mini.style.setProperty('--bd', m.border);
    mini.style.setProperty('--tx', m.text); mini.style.setProperty('--sub', m.sub); mini.style.setProperty('--cv', m.canvas);
    box.querySelector('[data-l="msg"]').innerHTML = t === 'light'
      ? 'In light mode, <code>color/border</code> points to <code>grey/200</code>.'
      : 'Switching to dark changes <b>one line</b>: <code>color/border</code> now points to <code>grey/700</code>. The card, and every component that uses it, follows.';
  };
  box.addEventListener('click', e => { const b = e.target.closest('[data-t]'); if (b) set(b.dataset.t); });
  set('light');
})();

/* ---------- Binding: a card that reads tokens (or doesn't) ---------- */
(() => {
  const box = document.querySelector('[data-bind]');
  if (!box) return;
  const V = {
    light: { 'card/bg': '#FFFFFF', 'card/border/color': '#E2E4EA', 'card/radius': '20', 'card/shadow/y': '8', 'card/shadow/blur': '24', 'card/shadow/color': '#14171F1F',
      'card/title/color': '#14171F', 'card/body/color': '#5B6275', 'button/bg': '#C26A2E', 'button/text': '#FFFFFF', canvas: '#EEF0F4' },
    dark: { 'card/bg': '#232733', 'card/border/color': '#3A3F4E', 'card/radius': '20', 'card/shadow/y': '12', 'card/shadow/blur': '32', 'card/shadow/color': '#00000080',
      'card/title/color': '#F6F7F9', 'card/body/color': '#C4C8D4', 'button/bg': '#E59A5C', 'button/text': '#14171F', canvas: '#14171F' }
  };
  const ROWS = [
    ['Fill', [['card/bg']], 'fill'],
    ['Stroke', [['card/border/color']], 'stroke'],
    ['Corner radius', [['card/radius']], 'radius'],
    ['Drop shadow', [['card/shadow/y', 'Y'], ['card/shadow/blur', 'Blur'], ['card/shadow/color', 'Color']], 'shadow'],
    ['Title', [['card/title/color']], 'title'],
    ['Body text', [['card/body/color']], 'body'],
    ['Button', [['button/bg'], ['button/text']], 'button']
  ];
  const st = { theme: 'light', bound: true };
  const panel = box.querySelector('.bd-panel'), card = box.querySelector('.bd-card'), canvas = box.querySelector('.bd-canvas'), msg = box.querySelector('.bd-msg');
  const isHex = v => v[0] === '#';
  const sw = v => isHex(v) ? `<i class="tk-sw" style="background:${v}"></i>` : '';
  const hex6 = v => isHex(v) ? v.slice(0, 7).toUpperCase() + (v.length > 7 ? ` ${Math.round(parseInt(v.slice(7), 16) / 2.55)}%` : '') : v;

  const render = () => {
    box.querySelectorAll('[data-bt]').forEach(b => b.setAttribute('aria-pressed', b.dataset.bt === st.theme));
    box.classList.toggle('detached', !st.bound);
    const src = st.bound ? V[st.theme] : V.light;          // detached = values frozen at light
    const set = (k, v) => card.style.setProperty('--' + k.replace(/\//g, '-'), v);
    Object.keys(src).forEach(k => { if (k !== 'canvas') set(k, /radius|shadow\/y|shadow\/blur/.test(k) ? src[k] + 'px' : src[k]); });
    canvas.style.background = V[st.theme].canvas;          // the canvas always follows the theme
    panel.innerHTML = ROWS.map(([label, toks, part]) => `
      <div class="bd-prop" role="listitem" data-part="${part}"><span class="bd-label">${label}</span>
        ${toks.map(([t, sub]) => `<span class="bd-val">${sub ? `<em>${sub}</em>` : ''}${st.bound
          ? `<span class="bd-chip">${sw(src[t])}${t}</span>`
          : `<span class="bd-raw">${sw(src[t])}${hex6(src[t])}</span>`}</span>`).join('')}
      </div>`).join('');
    msg.innerHTML = st.bound
      ? (st.theme === 'light' ? 'Every property reads a token. Switch the theme and watch the card follow.' : 'Same card, no edits. Every bound property picked up its dark value.')
      : (st.theme === 'light' ? 'Detached: the panel now shows raw values. It looks the same, until the context changes.' : 'Detached in dark mode: the card keeps its light values and breaks on a dark canvas. Binding prevents exactly this.');
  };
  const hl = part => [card, ...card.querySelectorAll('[data-p]')].forEach(el => el.classList.toggle('tk-hl', !!part && el.dataset.p.split(' ').includes(part)));
  panel.addEventListener('mouseover', e => { const r = e.target.closest('.bd-prop'); hl(r && r.dataset.part); });
  panel.addEventListener('mouseleave', () => hl());
  box.addEventListener('click', e => { const b = e.target.closest('[data-bt]'); if (b) { st.theme = b.dataset.bt; render(); } });
  box.querySelector('[data-bound]').addEventListener('change', e => { st.bound = e.target.checked; render(); });
  render();
})();
