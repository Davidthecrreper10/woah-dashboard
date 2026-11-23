// Phone layout for every WOAH page (screens up to 700px wide, and the installed app).
// The computer view is not touched: everything here only applies while <html> has the class "m".
// Adds a slim top bar, a bottom tab bar (Home, Emails, Partners, POS, More) and two sheets (More pages, and You).
// The normal header, menu and photo strip stay in the page (hidden on phones), so nothing else has to change.
(function () {
  const html = document.documentElement;
  const MQ = window.matchMedia ? matchMedia('(max-width: 700px)') : { matches: false, addEventListener() {} };
  const path = location.pathname.split('/').pop() || 'index.html';
  const IS_POS = path === 'sell.html';
  const APP = !!((window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone);
  html.classList.add('pg-' + path.replace(/\.html$/, ''));
  function set() { html.classList.toggle('m', MQ.matches); html.classList.toggle('m-pos', MQ.matches && IS_POS); }
  set();
  (MQ.addEventListener ? MQ.addEventListener('change', set) : MQ.addListener && MQ.addListener(set));

  const I = {   // simple line icons
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/>',
    mail: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="m4 7.5 8 6 8-6"/>',
    people: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="17" cy="9.5" r="2.5"/><path d="M16 14.2c2.4-.2 4 1.3 4.6 4.3"/>',
    pos: '<path d="M4 7h16l-1.4 11.2a2 2 0 0 1-2 1.8H7.4a2 2 0 0 1-2-1.8z"/><path d="M8.5 9.5V6.5a3.5 3.5 0 0 1 7 0v3"/>',
    more: '<circle cx="5.5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18.5" cy="12" r="1.6"/>',
    shop: '<path d="M4 9.5 5.5 4.5h13L20 9.5"/><path d="M4 9.5c0 1.5 1.2 2.5 2.7 2.5s2.6-1 2.6-2.5c0 1.5 1.2 2.5 2.7 2.5s2.7-1 2.7-2.5c0 1.5 1.1 2.5 2.6 2.5S20 11 20 9.5"/><path d="M5.5 12v7.5h13V12"/>',
    box: '<path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4z"/><path d="M3.5 7.5 12 11.5l8.5-4M12 11.5v9"/>',
    flow: '<rect x="3.5" y="4" width="4.5" height="16" rx="1.5"/><rect x="9.8" y="4" width="4.5" height="11" rx="1.5"/><rect x="16" y="4" width="4.5" height="6" rx="1.5"/>',
    gaps: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5.5"/><circle cx="12" cy="16.3" r=".6"/>',
    sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    refresh: '<path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3"/><path d="M19.5 4.5v4h-4"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    out: '<path d="M14 4.5h4.5v15H14"/><path d="M10 8l-4 4 4 4M6 12h9"/>',
    paint: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 0 0 17c1.3 0 1.8-.8 1.8-1.7 0-1.3-1.3-1.5-1.3-2.8 0-1 .8-1.6 1.8-1.6h2.2a3.8 3.8 0 0 0 3.8-3.8"/><circle cx="8" cy="11" r=".9"/><circle cx="11" cy="7.5" r=".9"/><circle cx="15.5" cy="8.5" r=".9"/>',
    phone: '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 17.5h2"/>',
    mega: '<path d="M4 10v4h3l7 4V6L7 10z"/><path d="M17.5 9.5a3.5 3.5 0 0 1 0 5"/>',
    chev: '<path d="m9 6 6 6-6 6"/>',
  };
  const ico = (k, s) => `<svg viewBox="0 0 24 24" width="${s || 22}" height="${s || 22}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[k] || ''}</svg>`;

  // every page, who may open it, and a one-line explanation (shown in the More sheet)
  const PAGES = [
    { href: './', file: 'index.html', label: 'Home', icon: 'home', need: 'full', desc: 'Switches, numbers and the Planner' },
    { href: 'handlers.html', file: 'handlers.html', also: ['email.html'], label: 'Emails', icon: 'mail', need: 'handler', desc: 'Emails to answer and who has them' },
    { href: 'partners.html', file: 'partners.html', also: ['profile.html'], label: 'Partners', icon: 'people', need: 'handler', desc: 'Every sponsor and contact' },
    { href: 'sell.html', file: 'sell.html', label: 'POS', icon: 'pos', need: 'handler', desc: 'Sell merch at the stand' },
    { href: 'shop.html', file: 'shop.html', label: 'Shop', icon: 'shop', need: 'full', desc: 'Online shop orders and accounts' },
    { href: 'stock.html', file: 'stock.html', label: 'Stock', icon: 'box', need: 'handler', desc: 'What is left to sell, per size' },
    { href: 'pipeline.html', file: 'pipeline.html', label: 'Pipeline', icon: 'flow', need: 'handler', desc: 'Sponsors by stage, from first email to signed' },
    { href: 'gaps.html', file: 'gaps.html', label: 'Gaps', icon: 'gaps', need: 'full', desc: 'Things still missing or unassigned' },
    { href: 'control.html', file: 'control.html', label: 'Control', icon: 'sliders', need: 'full', desc: 'Settings, switches and team for Chris' },
  ];
  const RK = { handler: 1, full: 2 };
  const here = PAGES.find(p => p.file === path || (p.also || []).includes(path));
  const TITLES = { 'index.html': 'Home', 'handlers.html': 'Emails', 'email.html': 'Email', 'profile.html': 'Partner', 'sell.html': 'POS', 'install.html': 'Get the app' };
  const BACK = { 'email.html': 'handlers.html', 'profile.html': 'partners.html' };

  function title() {
    if (TITLES[path]) return TITLES[path];
    const h = document.querySelector('header h1'); if (!h) return 'WOAH';
    return h.textContent.replace(/^\s*WOAH\s*/i, '').trim() || 'WOAH';
  }
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- top bar ----------
  function top() {
    if (document.getElementById('mTop')) return;
    const t = document.createElement('div');
    t.id = 'mTop'; t.className = 'm-top';
    const back = BACK[path];
    t.innerHTML =
      (back ? `<a class="m-ib m-back" href="${back}" target="_self" aria-label="Back">${ico('back')}</a>` : `<a class="m-mark" href="${here && here.need === 'handler' && path !== 'index.html' ? 'handlers.html' : './'}" target="_self" aria-label="WOAH home"><img class="w-logo-l" src="img/logo-light.webp" alt=""><img class="w-logo-d" src="img/logo-dark.webp" alt=""></a>`) +
      `<div class="m-ttl"><b>${esc(title())}</b><small id="mUpd"></small></div>` +
      `<button type="button" class="m-ib" id="mRefresh" aria-label="Refresh" target="_self">${ico('refresh')}</button>` +
      `<button type="button" class="m-me" id="mMe" aria-label="You, settings and log out" target="_self">·</button>`;
    document.body.insertBefore(t, document.body.firstChild);
    document.getElementById('mRefresh').onclick = () => {
      const r = document.getElementById('refresh'); const b = document.getElementById('mRefresh');
      b.classList.add('spin'); setTimeout(() => b.classList.remove('spin'), 900);
      if (r) r.click(); else location.reload();
    };
    document.getElementById('mMe').onclick = () => openSheet('me');
    // the "updated" line under the title: first part only, kept in sync
    const u = document.getElementById('updated');
    const sync = () => { const s = document.getElementById('mUpd'); if (s && u) s.textContent = u.textContent.split(' · ')[0].replace(/^Loading…$/, 'Loading…'); };
    if (u) { sync(); new MutationObserver(sync).observe(u, { childList: true, characterData: true, subtree: true }); }
  }

  // ---------- bottom tab bar ----------
  function tabs(me) {
    if (document.getElementById('mTabs') || IS_POS) return;
    const ok = PAGES.filter(p => RK[me.role] >= RK[p.need]);
    if (ok.length < 2) return;
    const main = ok.filter(p => ['index.html', 'handlers.html', 'partners.html', 'sell.html'].includes(p.file));
    // handlers have no Home: give them Stock on the bar instead
    while (main.length < 4 && ok.length > main.length) { const n = ok.find(p => !main.includes(p)); if (!n) break; main.push(n); }
    const rest = ok.filter(p => !main.includes(p));
    const t = document.createElement('nav');
    t.id = 'mTabs'; t.className = 'm-tabs'; t.setAttribute('aria-label', 'Pages');
    const moreHere = here && rest.includes(here);
    t.innerHTML = main.map(p => `<a href="${p.href}" target="_self" class="${here === p ? 'on' : ''}" ${here === p ? 'aria-current="page"' : ''}>${ico(p.icon)}<span>${p.label}</span></a>`).join('') +
      (rest.length ? `<button type="button" id="mMore" class="${moreHere ? 'on' : ''}" target="_self">${ico(moreHere ? here.icon : 'more')}<span>${moreHere ? here.label : 'More'}</span></button>` : '');
    document.body.appendChild(t);
    const mb = document.getElementById('mMore'); if (mb) mb.onclick = () => openSheet('more');
    REST = rest;
  }
  let REST = [], ME = null;

  // ---------- sheets ----------
  function sheetEl() {
    let s = document.getElementById('mSheet');
    if (s) return s;
    s = document.createElement('div'); s.id = 'mSheet'; s.className = 'm-sheet';
    s.innerHTML = `<div class="m-shade" data-close></div><div class="m-panel" role="dialog" aria-modal="true"><div class="m-grab" data-close></div><div id="mSheetBody"></div></div>`;
    document.body.appendChild(s);
    s.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeSheet(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });
    return s;
  }
  function closeSheet() { const s = document.getElementById('mSheet'); if (s) s.classList.remove('open'); html.classList.remove('m-lock'); }
  function openSheet(kind) {
    const s = sheetEl(), b = document.getElementById('mSheetBody');
    if (kind === 'more') {
      b.innerHTML = `<div class="m-sh">More pages</div><div class="m-list">` + REST.map(p =>
        `<a href="${p.href}" target="_self" class="${here === p ? 'on' : ''}"><span class="m-li">${ico(p.icon)}</span><span class="m-lt"><b>${p.label}</b><small>${p.desc}</small></span>${ico('chev', 18)}</a>`).join('') + `</div>`;
    } else {
      const me = ME || {};
      const extras = [...document.querySelectorAll('header button')].filter(x => !['refresh', 'wGear'].includes(x.id) && x.offsetParent === null);
      b.innerHTML =
        `<div class="m-who"><span class="m-me big">${esc(initial(me.name))}</span><span><b>${esc(me.name || 'Logged in')}</b><small>${esc(me.email || '')}${me.role === 'handler' ? ' · email handler' : ''}</small></span></div>` +
        (IS_POS && typeof setPractice === 'function' ? `<div class="m-sh">POS</div><div class="m-list"><button type="button" id="mPrac" target="_self"><span class="m-li">${ico('pos')}</span><span class="m-lt"><b>Practice mode</b><small>Try the POS without real sales</small></span>${ico('chev', 18)}</button><a href="${ME && ME.role === 'full' ? './' : 'handlers.html'}" target="_self"><span class="m-li">${ico('home')}</span><span class="m-lt"><b>Open the dashboard</b><small>Emails, partners and the rest</small></span>${ico('chev', 18)}</a></div>` : '') +
        (extras.length ? `<div class="m-sh">On this page</div><div class="m-list">` + extras.map((x, i) => `<button type="button" data-x="${i}" target="_self"><span class="m-li">${ico('mega')}</span><span class="m-lt"><b>${esc(x.textContent.trim())}</b></span>${ico('chev', 18)}</button>`).join('') + `</div>` : '') +
        `<div class="m-sh">Settings</div><div class="m-list">` +
        `<button type="button" id="mLook" target="_self"><span class="m-li">${ico('paint')}</span><span class="m-lt"><b>Look &amp; theme</b><small>Light, dark, WOAH or Retro</small></span>${ico('chev', 18)}</button>` +
        (APP ? '' : `<a href="install.html" target="_self"><span class="m-li">${ico('phone')}</span><span class="m-lt"><b>Get the app</b><small>Put WOAH on your home screen</small></span>${ico('chev', 18)}</a>`) +
        `<button type="button" id="mOut" class="bad" target="_self"><span class="m-li">${ico('out')}</span><span class="m-lt"><b>Log out</b><small>On this phone only</small></span></button></div>`;
      b.querySelectorAll('[data-x]').forEach(el => el.onclick = () => { closeSheet(); extras[+el.dataset.x].click(); });
      document.getElementById('mLook').onclick = e => {
        e.stopPropagation(); closeSheet();
        const g = document.getElementById('wGear'), p = document.getElementById('wPanel');
        if (!g || !p) return;
        g.click();
        p.style.top = (window.scrollY + 66) + 'px'; p.style.right = '12px';
      };
      const pr = document.getElementById('mPrac'); if (pr) pr.onclick = () => { closeSheet(); setPractice(true); };
      document.getElementById('mOut').onclick = () => { closeSheet(); if (typeof logout === 'function') logout(); };
    }
    s.classList.add('open'); html.classList.add('m-lock');
  }
  function initial(n) { return String(n || '?').trim().charAt(0).toUpperCase() || '?'; }

  // ---------- countdown: one thin line, tap to see the rest ----------
  function countdown() {
    const c = document.getElementById('wCountdown');
    if (!c || c.dataset.m) return;
    c.dataset.m = '1';
    c.addEventListener('click', e => { if (!html.classList.contains('m') || e.target.closest('a, .late')) return; c.classList.toggle('open'); });
  }

  // start once we know who is logged in (common.js calls woahExtras(me))
  // Reassign / Pass on opens a people picker under the email card: bring it into view on phones
  function wrapPick() {
    if (typeof window.pickPeople !== 'function' || window.pickPeople.mWrapped) return;
    const o = window.pickPeople;
    window.pickPeople = function (id) {
      const r = o.apply(this, arguments);
      if (html.classList.contains('m')) setTimeout(() => { const b = document.querySelector('#hc-' + id + ' .pick-head') || document.getElementById('hc-' + id); if (b) b.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
      return r;
    };
    window.pickPeople.mWrapped = true;
  }
  function boot(me) {
    ME = me; wrapPick();
    top(); tabs(me);
    const m = document.getElementById('mMe'); if (m) m.textContent = initial(me.name);
    countdown(); setTimeout(countdown, 1500); setTimeout(countdown, 4000);
    html.classList.add('m-ready');
  }
  const prev = window.woahExtras;
  window.woahExtras = function (me) { try { prev && prev(me); } finally { try { boot(me); } catch (e) { console.error(e); } } };
  // top bar straight away (before the data arrives), so the page doesn't jump
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', top); else top();
})();
