// WOAH look & feel: picks the UI (WOAH or Retro), the theme (Light / Dark / Match system) and the animation level,
// remembered on this device. Loaded in <head> so the right colours are there before the page draws (no flash).
// It only changes how pages look: no page logic, data or emails depend on it.
(function () {
  const KEY = 'woahUI';
  const DEF = { ui: 'woah', theme: 'system', motion: 'auto' };
  const html = document.documentElement;
  let P = Object.assign({}, DEF);
  try { P = Object.assign(P, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
  const mqDark = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : { matches: false, addEventListener() {} };
  const mqCalm = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false, addEventListener() {} };
  const PHOTOS = ['img/p1.webp', 'img/p2.webp', 'img/p3.webp', 'img/p4.webp', 'img/p5.webp', 'img/p6.webp'];

  function resolved() {
    return {
      ui: P.ui === 'retro' ? 'retro' : 'woah',
      theme: P.theme === 'light' || P.theme === 'dark' ? P.theme : (mqDark.matches ? 'dark' : 'light'),
      motion: P.motion === 'full' || P.motion === 'reduced' || P.motion === 'off' ? P.motion : (mqCalm.matches ? 'reduced' : 'full'),
    };
  }
  function apply(animate) {
    const r = resolved();
    if (animate && r.motion !== 'off') { html.classList.add('w-switching'); setTimeout(() => html.classList.remove('w-switching'), 450); }
    html.dataset.ui = r.ui; html.dataset.theme = r.theme; html.dataset.motion = r.motion;
    let m = document.querySelector('meta[name="theme-color"]');
    if (!m) { m = document.createElement('meta'); m.name = 'theme-color'; (document.head || html).appendChild(m); }
    m.content = r.ui === 'woah' ? (r.theme === 'dark' ? '#04212F' : '#F5F1E8') : (r.theme === 'dark' ? '#0e171b' : '#f4f7f8');
    if (document.body) decorate();
    drawPanel();
  }
  function save(patch) { Object.assign(P, patch); try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} apply(true); }
  mqDark.addEventListener && mqDark.addEventListener('change', () => { if (P.theme === 'system') apply(true); });
  mqCalm.addEventListener && mqCalm.addEventListener('change', () => { if (P.motion === 'auto') apply(false); });
  apply(false);

  // ---------- page decoration (WOAH UI only; Retro stays exactly as it was) ----------
  function logoHTML() { return '<img class="w-logo w-logo-light" src="img/logo-light.webp" alt="WOAH Festival" width="180" height="86"><img class="w-logo w-logo-dark" src="img/logo-dark.webp" alt="WOAH Festival" width="180" height="81">'; }
  function decorateLogos(root) {
    (root || document).querySelectorAll('h1 > span:first-child').forEach(s => {
      if (s.dataset.w || s.textContent.trim() !== 'WOAH') return;
      s.dataset.w = '1'; s.classList.add('w-mark');
      s.insertAdjacentHTML('afterend', logoHTML());
      s.parentNode.classList.add('w-h1');
      const sib = s.parentNode.querySelectorAll('img.w-logo');
      sib.forEach(i => { i.decoding = 'async'; });
      if (!sessionStorage.getItem('wLogoSeen')) { s.parentNode.classList.add('w-reveal'); try { sessionStorage.setItem('wLogoSeen', '1'); } catch (e) {} }
    });
  }
  let heroTimer = null;
  function hero() {
    const app = document.getElementById('app');
    if (!app || document.querySelector('.w-hero')) return;
    const h = document.createElement('div');
    h.className = 'w-hero'; h.setAttribute('aria-hidden', 'true');
    const start = Math.floor(Date.now() / 86400000) % PHOTOS.length;   // a different photo leads each day
    h.innerHTML = PHOTOS.map((src, i) => `<div class="w-ph${i === 0 ? ' on' : ''}" data-src="${PHOTOS[(start + i) % PHOTOS.length]}"></div>`).join('');
    app.insertBefore(h, app.firstChild);
    const ph = [...h.children];
    ph[0].style.backgroundImage = `url(${ph[0].dataset.src})`;
    setTimeout(() => ph.forEach(p => { p.style.backgroundImage = `url(${p.dataset.src})`; }), 1500);   // the rest after the page has loaded
    let i = 0;
    clearInterval(heroTimer);
    heroTimer = setInterval(() => {
      if (document.hidden || html.dataset.motion === 'off' || html.dataset.ui !== 'woah') return;
      ph[i].classList.remove('on'); i = (i + 1) % ph.length; ph[i].classList.add('on');
    }, 8000);
  }
  function loginBg() {
    if (document.querySelector('.w-loginbg')) return;
    const b = document.createElement('div');
    b.className = 'w-loginbg'; b.setAttribute('aria-hidden', 'true');
    b.style.backgroundImage = `url(${PHOTOS[Math.floor(Date.now() / 86400000) % PHOTOS.length]})`;
    document.body.insertBefore(b, document.body.firstChild);
  }
  function watchLogin() {
    const app = document.getElementById('app'), login = document.getElementById('login');
    if (!app || !login) return;
    const sync = () => {
      const inApp = getComputedStyle(app).display !== 'none';
      const was = html.classList.contains('w-in-login');
      html.classList.toggle('w-in-login', !inApp);
      if (was && inApp) {   // just logged in: the colour comes back, then the photo makes way for the page
        html.classList.add('w-unlock'); setTimeout(() => html.classList.remove('w-unlock'), 1400);
        firstRender = Date.now();
      }
    };
    sync();
    new MutationObserver(sync).observe(app, { attributes: true, attributeFilter: ['style'] });
  }

  // ---------- animations ----------
  let firstRender = Date.now(), lastAction = 0;
  const ANIM = '.card, .hitem, .gap, .pp-item, .banner, .msg, .owner-h, .c-sec, .flow .card, .confirm, .okbox, .waitfor, .checkbox';
  document.addEventListener('click', e => { if (e.target.closest('button, a, .chip, label')) lastAction = Date.now(); }, true);
  function animateNodes(nodes) {
    const m = html.dataset.motion;
    if (m === 'off' || html.dataset.ui !== 'woah') return;
    let n = 0;
    nodes.forEach(el => {
      if (el.dataset.wIn) return;
      el.dataset.wIn = '1';
      if (el.closest('.w-hero, .w-panel')) return;
      el.style.setProperty('--wi', Math.min(n++, 14));
      el.classList.remove('w-in'); void el.offsetWidth; el.classList.add('w-in');
    });
  }
  function countUp(root) {
    if (html.dataset.motion !== 'full' || html.dataset.ui !== 'woah') return;
    (root || document).querySelectorAll('.stat .n').forEach(el => {
      if (el.dataset.wCount) return;
      el.dataset.wCount = '1';
      const t = el.textContent.trim(); if (!/^\d{1,5}$/.test(t)) return;
      const to = Number(t); if (!to) return;
      const t0 = performance.now(), dur = 700;
      const step = now => { const k = Math.min(1, (now - t0) / dur); el.textContent = String(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(step); else el.textContent = t; };
      requestAnimationFrame(step);
    });
  }
  function onMutations(muts) {
    const fresh = Date.now() - firstRender < 4000 || Date.now() - lastAction < 900;
    const add = [];
    muts.forEach(m => m.addedNodes.forEach(nd => {
      if (nd.nodeType !== 1) return;
      decorateLogos(nd.parentNode || nd);
      if (!fresh) { nd.matches && nd.matches(ANIM) && (nd.dataset.wIn = '1'); nd.querySelectorAll && nd.querySelectorAll(ANIM).forEach(x => { x.dataset.wIn = '1'; }); return; }
      if (nd.matches && nd.matches(ANIM)) add.push(nd);
      nd.querySelectorAll && nd.querySelectorAll(ANIM).forEach(x => add.push(x));
    }));
    if (add.length) animateNodes(add);
    if (fresh) countUp();
  }

  // ---------- settings panel (both UIs) ----------
  const GEAR = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M19.4 13a7.6 7.6 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7.4 7.4 0 0 0-1.7-1L15 3.5h-4l-.4 2.5a7.4 7.4 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7.6 7.6 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7.4 7.4 0 0 0 1.7 1l.4 2.5h4l.4-2.5a7.4 7.4 0 0 0 1.7-1l2.4 1 2-3.4zM13 15.5A3.5 3.5 0 1 1 13 8.5a3.5 3.5 0 0 1 0 7z" transform="translate(-1 0)"/></svg>';
  function drawPanel() {
    const p = document.getElementById('wPanel'); if (!p) return;
    const opt = (k, v, label) => `<button type="button" target="_self" class="${(P[k] === v || (k === 'motion' && v === 'full' && P.motion === 'auto' && !mqCalm.matches) || (k === 'motion' && v === 'reduced' && P.motion === 'auto' && mqCalm.matches)) ? 'on' : ''}" data-k="${k}" data-v="${v}">${label}</button>`;
    p.innerHTML = `<div class="w-ph-h">Look</div><div class="w-seg">${opt('ui', 'woah', 'WOAH')}${opt('ui', 'retro', 'Retro')}</div>
      <div class="w-ph-h">Theme</div><div class="w-seg">${opt('theme', 'light', 'Light')}${opt('theme', 'dark', 'Dark')}${opt('theme', 'system', 'System')}</div>
      <div class="w-ph-h">Animations</div><div class="w-seg">${opt('motion', 'full', 'Full')}${opt('motion', 'reduced', 'Calm')}${opt('motion', 'off', 'Off')}</div>
      <div class="w-ph-note">Saved on this device only.${mqCalm.matches ? ' Your device asks for less motion, so Calm is the default.' : ''}</div>`;
  }
  function gear() {
    if (document.getElementById('wGear')) return;
    const b = document.createElement('button');
    b.id = 'wGear'; b.type = 'button'; b.className = 'w-gear'; b.title = 'Look & theme'; b.setAttribute('aria-label', 'Look and theme settings'); b.setAttribute('aria-expanded', 'false'); b.setAttribute('target', '_self');
    b.innerHTML = GEAR;
    const p = document.createElement('div'); p.id = 'wPanel'; p.className = 'w-panel'; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', 'Look and theme');
    const r = document.getElementById('refresh');
    if (r && r.parentNode) { r.parentNode.insertBefore(b, r.nextSibling); } else { b.classList.add('w-gear-float'); document.body.appendChild(b); }
    document.body.appendChild(p);
    const place = () => { const rc = b.getBoundingClientRect(); p.style.top = (rc.bottom + window.scrollY + 8) + 'px'; p.style.right = Math.max(12, document.documentElement.clientWidth - rc.right) + 'px'; };
    b.addEventListener('click', e => { e.stopPropagation(); const open = !p.classList.contains('open'); if (open) { drawPanel(); place(); } p.classList.toggle('open', open); b.setAttribute('aria-expanded', String(open)); });
    p.addEventListener('click', e => { e.stopPropagation(); const x = e.target.closest('button[data-k]'); if (!x) return; save({ [x.dataset.k]: x.dataset.v }); place(); });
    document.addEventListener('click', () => { p.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { p.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); } });
    window.addEventListener('resize', () => { if (p.classList.contains('open')) place(); });
    // the login screen has no Refresh button: keep a floating gear there
    const login = document.getElementById('login');
    if (login && r) {
      const f = b.cloneNode(true); f.id = 'wGearLogin'; f.classList.add('w-gear-float', 'w-only-login');
      document.body.appendChild(f);
      f.addEventListener('click', e => { e.stopPropagation(); drawPanel(); const rc = f.getBoundingClientRect(); p.style.top = (rc.bottom + window.scrollY + 8) + 'px'; p.style.right = '16px'; p.classList.toggle('open'); });
    }
  }

  let decorated = false;
  function decorate() {
    if (!document.body) return;
    gear();
    decorateLogos();
    if (html.dataset.ui === 'woah') { hero(); loginBg(); }
    if (!decorated) {
      decorated = true;
      watchLogin();
      new MutationObserver(onMutations).observe(document.body, { childList: true, subtree: true });
      animateNodes([...document.querySelectorAll(ANIM)]);
      countUp();
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', decorate); else decorate();
})();
