// Shared by every WOAH page, once you're logged in: the festival countdown bar and the "Ask Chris" chat.
// common.js calls woahExtras(me) the first time it knows who is logged in.
(function () {
  let started = false;
  window.woahExtras = function (me) {
    if (started) return; started = true;
    css();
    try { countdown(me); } catch (e) {}
    try { chat(me); } catch (e) {}
  };
  const store = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  function css() {
    const s = document.createElement('style');
    s.textContent = `
    .w-cd { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 16px; margin: 0 0 14px; padding: 9px 14px; border: 1px solid var(--line); border-radius: 12px; background: var(--card); font-size: 13px; color: var(--muted); }
    .w-cd b.n { font-size: 18px; color: var(--ink); font-variant-numeric: tabular-nums; }
    .w-cd .big { color: var(--ink); }
    .w-cd .late { color: var(--bad); font-weight: 600; cursor: pointer; background: none; border: 0; padding: 0; font: inherit; text-decoration: underline dotted; }
    .w-cd .sep { flex: 1 1 auto; }
    .w-cd a { color: inherit; }
    .w-cd-pop { margin: -8px 0 14px; padding: 10px 14px; border: 1px solid var(--line); border-radius: 12px; background: var(--card); font-size: 13px; }
    .w-cd-pop div { padding: 3px 0; }
    .w-chat-btn { position: fixed; right: 18px; bottom: 18px; z-index: 900; display: flex; align-items: center; gap: 8px; padding: 8px 14px 8px 8px; border-radius: 999px; border: 1px solid var(--line); background: var(--card); color: var(--ink); box-shadow: 0 6px 20px rgba(0,0,0,.18); cursor: pointer; font: inherit; font-weight: 600; }
    .w-chat-btn img { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; background: #fff; }
    .w-chat { position: fixed; right: 18px; bottom: 18px; z-index: 901; width: min(380px, calc(100vw - 24px)); height: min(560px, calc(100vh - 36px)); display: none; flex-direction: column; border: 1px solid var(--line); border-radius: 18px; background: var(--card); color: var(--ink); box-shadow: 0 16px 40px rgba(0,0,0,.28); overflow: hidden; }
    .w-chat.open { display: flex; }
    .w-chat-top { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-bottom: 1px solid var(--line); }
    .w-chat-top img { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; background: #fff; }
    .w-chat-top .t { flex: 1; line-height: 1.2; } .w-chat-top .t small { display: block; color: var(--muted); font-size: 11px; }
    .w-chat-top button { background: none; border: 0; color: var(--muted); font: inherit; font-size: 13px; cursor: pointer; padding: 4px 6px; margin: 0; }
    .w-chat-msgs { flex: 1; overflow-y: auto; padding: 12px 12px 4px; display: flex; flex-direction: column; gap: 8px; }
    .w-msg { max-width: 85%; padding: 8px 12px; border-radius: 14px; font-size: 14px; line-height: 1.4; white-space: normal; word-wrap: break-word; }
    .w-msg.me { align-self: flex-end; background: var(--brand); color: var(--on-brand, #fff); border-bottom-right-radius: 4px; }
    .w-msg.chris { align-self: flex-start; background: var(--bg); border-bottom-left-radius: 4px; }
    .w-msg.err { align-self: flex-start; background: transparent; color: var(--bad); font-size: 13px; padding: 2px 4px; }
    .w-dots span { display: inline-block; width: 6px; height: 6px; margin: 0 2px; border-radius: 50%; background: var(--muted); animation: wdot 1s infinite ease-in-out; }
    .w-dots span:nth-child(2) { animation-delay: .15s } .w-dots span:nth-child(3) { animation-delay: .3s }
    @keyframes wdot { 0%, 80%, 100% { opacity: .3 } 40% { opacity: 1 } }
    .w-links { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .w-links a { display: inline-block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; padding: 4px 10px; border-radius: 999px; border: 1px solid var(--line); background: var(--card); color: var(--ink); text-decoration: none; }
    .w-links a:hover { border-color: var(--brand); }
    .w-msg a.w-a { color: inherit; text-decoration: underline; }
    .w-looked { margin-top: 6px; font-size: 11px; color: var(--muted); }
    .w-wait { font-size: 12px; color: var(--muted); margin-left: 6px; }
    .w-sugs { display: flex; flex-wrap: wrap; gap: 6px; padding: 4px 0 8px; }
    .w-sugs button { margin: 0; font-size: 12px; padding: 5px 10px; border-radius: 999px; border: 1px solid var(--line); background: var(--card); color: var(--ink); cursor: pointer; }
    .w-chat-in { display: flex; gap: 8px; padding: 10px 12px; border-top: 1px solid var(--line); }
    .w-chat-in textarea { flex: 1; resize: none; height: 40px; max-height: 120px; font: inherit; font-size: 14px; padding: 9px 12px; border-radius: 12px; border: 1px solid var(--line); background: var(--bg); color: var(--ink); }
    .w-chat-in button { margin: 0; border-radius: 12px; padding: 0 14px; background: var(--brand); border-color: var(--brand); color: var(--on-brand, #fff); font-weight: 600; cursor: pointer; }
    .w-chat-in button:disabled { opacity: .5; }
    @media (max-width: 560px) { .w-chat { right: 8px; bottom: 8px; width: calc(100vw - 16px); height: calc(100vh - 80px); } .w-chat-btn span { display: none; } .w-chat-btn { padding: 6px; } }
    body { padding-bottom: 72px; }
    @media print { .w-chat, .w-chat-btn, .w-cd { display: none !important; } }`;
    document.head.appendChild(s);
  }

  // ---------- Festival countdown ----------
  function countdown(me) {
    const cached = store.get('woahCd', null);
    if (cached && cached.d) draw(cached.d, me);
    call({ action: 'countdown' }).then(d => { store.set('woahCd', { t: Date.now(), d }); draw(d, me); }).catch(() => {});
  }
  function dayStart(t) { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); }
  function draw(d, me) {
    const app = document.getElementById('app'); if (!app) return;
    let bar = document.getElementById('wCountdown');
    if (!bar) {
      bar = document.createElement('div'); bar.id = 'wCountdown'; bar.className = 'w-cd';
      const head = app.querySelector('header');
      if (head && head.parentNode) head.parentNode.insertBefore(bar, head.nextSibling); else app.insertBefore(bar, app.firstChild);
    }
    const full = me && me.role === 'full';
    let left = '';
    if (d.date) {
      const start = new Date(d.date + 'T00:00:00').getTime(), end = new Date((d.end || d.date) + 'T00:00:00').getTime();
      const today = dayStart(Date.now()), n = Math.round((start - today) / 86400000);
      const nice = new Date(start).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
      if (n > 1) left = `<span><b class="n">${n}</b> days to <span class="big">${esc(d.name || 'WOAH')}</span> · ${esc(nice)}</span>`;
      else if (n === 1) left = `<span><b class="n">1</b> day to <span class="big">${esc(d.name || 'WOAH')}</span> · tomorrow!</span>`;
      else if (today <= end) left = `<span class="big"><b>${esc(d.name || 'WOAH')} is on now!</b></span>`;
      else left = `<span>${esc(d.name || 'WOAH')} is done. Thank you, team!</span>`;
    } else if (full) left = `<span>Festival date not set · <a href="control.html#settings" target="_self">set it on the Control page</a></span>`;
    const nx = (d.next || [])[0];
    const next = nx ? `<span>Next: <span class="big">${esc(nx.item)}</span> · ${esc(nx.dueText)}${nx.owner && nx.owner !== 'No owner' ? ' (' + esc(nx.owner) + ')' : ''}</span>` : '';
    const late = d.overdue ? `<button class="late" type="button" onclick="document.getElementById('wCdPop').style.display=document.getElementById('wCdPop').style.display==='block'?'none':'block'">${d.overdue} overdue</button>` : '';
    if (!left && !next && !late) { bar.style.display = 'none'; return; }
    bar.style.display = 'flex';
    bar.innerHTML = left + '<span class="sep"></span>' + next + late;
    let pop = document.getElementById('wCdPop');
    if (!pop) { pop = document.createElement('div'); pop.id = 'wCdPop'; pop.className = 'w-cd-pop'; pop.style.display = 'none'; bar.parentNode.insertBefore(pop, bar.nextSibling); }
    pop.innerHTML = `<b>Overdue in the Planner</b>${(d.late || []).map(x => `<div>${esc(x.dueText)} · ${esc(x.item)} <span class="sub">· ${esc(x.planner)}${x.owner && x.owner !== 'No owner' ? ' · ' + esc(x.owner) : ''}</span></div>`).join('')}${d.overdue > (d.late || []).length ? `<div class="sub">and ${d.overdue - d.late.length} more${full ? ' · see the Dashboard' : ''}</div>` : ''}`;
  }

  // ---------- Ask Chris ----------
  const SUGS = ["What's overdue?", "Where's the WOAH 2027 folder?", 'Who is handling Bali United?', 'Which sponsors replied recently?', 'What emails are waiting on me?'];
  let busy = false;
  function chat(me) {
    const btn = document.createElement('button');
    btn.className = 'w-chat-btn'; btn.type = 'button'; btn.title = 'Ask Chris anything about WOAH';
    btn.innerHTML = '<img src="img/chris.webp" alt=""><span>Ask Chris</span>';
    const box = document.createElement('div');
    box.className = 'w-chat'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Ask Chris');
    box.innerHTML = `<div class="w-chat-top"><img src="img/chris.webp" alt=""><div class="t"><b>Chris</b><small>Knows WOAH's emails, partners, planner and Drive</small></div>
      <button type="button" data-a="clear" title="Start a new chat">New chat</button><button type="button" data-a="close" title="Close" aria-label="Close">✕</button></div>
      <div class="w-chat-msgs" id="wChatMsgs"></div>
      <form class="w-chat-in"><textarea id="wChatIn" placeholder="Ask Chris…" rows="1"></textarea><button type="submit" id="wChatSend">Send</button></form>`;
    document.body.appendChild(btn); document.body.appendChild(box);
    const open = on => { box.classList.toggle('open', on); btn.style.display = on ? 'none' : 'flex'; store.set('woahChatOpen', on); if (on) { render(); setTimeout(() => document.getElementById('wChatIn').focus(), 50); } };
    btn.onclick = () => open(true);
    box.querySelector('[data-a=close]').onclick = () => open(false);
    box.querySelector('[data-a=clear]').onclick = () => { store.set('woahChat', []); render(); };
    const input = box.querySelector('#wChatIn');
    input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
    input.addEventListener('input', () => { input.style.height = '40px'; input.style.height = Math.min(120, input.scrollHeight) + 'px'; });
    box.querySelector('form').onsubmit = e => { e.preventDefault(); send(); };
    window.woahAsk = q => { open(true); input.value = q; send(); };
    if (store.get('woahChatOpen', false)) open(true);
  }
  function fmt(t) {
    return esc(t).replace(/\[([^\]\n]{1,120})\]\((https:\/\/[^\s)<]+)\)/g, '<a class="w-a" href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/(^|[\s(])(https:\/\/[^\s<)]+)/g, '$1<a class="w-a" href="$2" target="_blank" rel="noopener">link</a>')
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/^\s*[-•]\s+/gm, '• ').replace(/\n/g, '<br>');
  }
  function extra(m) {
    const ok = u => /^https:\/\/(docs|drive)\.google\.com\//.test(String(u || ''));
    const links = (m.links || []).filter(l => l && ok(l.url));
    return (links.length ? `<div class="w-links">${links.map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener" title="${esc(l.title)}">${/\/folders\//.test(l.url) ? '📁 ' : '📄 '}${esc(l.title)}</a>`).join('')}</div>` : '')
      + ((m.looked || []).length ? `<div class="w-looked">${esc(m.looked.join(' · '))}</div>` : '');
  }
  function render(typing, error) {
    const el = document.getElementById('wChatMsgs'); if (!el) return;
    const h = store.get('woahChat', []);
    let html = h.length ? '' : `<div class="w-msg chris">Hi! I'm Chris. Ask me anything about WOAH: who's handling a sponsor, what's overdue, what we promised someone…</div><div class="w-sugs">${SUGS.map(s => `<button type="button" onclick="woahAsk(${esc(JSON.stringify(s))})">${esc(s)}</button>`).join('')}</div>`;
    html += h.map(m => `<div class="w-msg ${m.role === 'me' ? 'me' : 'chris'}">${fmt(m.text)}${m.role === 'me' ? '' : extra(m)}</div>`).join('');
    if (typing) html += '<div class="w-msg chris w-dots"><span></span><span></span><span></span><span class="w-wait" id="wWait"></span></div>';
    if (error) html += `<div class="w-msg err">${esc(error)}</div>`;
    el.innerHTML = html; el.scrollTop = el.scrollHeight;
  }
  function send() {
    const input = document.getElementById('wChatIn'), q = input.value.trim();
    if (!q || busy) return;
    const h = store.get('woahChat', []);
    const history = h.slice(-8);
    h.push({ role: 'me', text: q, at: Date.now() }); store.set('woahChat', h.slice(-40));
    input.value = ''; input.style.height = '40px';
    busy = true; document.getElementById('wChatSend').disabled = true; render(true);
    const t0 = Date.now(), tick = setInterval(() => { const w = document.getElementById('wWait'); if (w) w.textContent = Date.now() - t0 > 4000 ? 'looking through WOAH stuff…' : ''; }, 1000);
    call({ action: 'ask', q, history }).then(d => {
      const h2 = store.get('woahChat', []);
      h2.push({ role: 'chris', text: String(d.answer || ''), links: Array.isArray(d.links) ? d.links.slice(0, 6) : [], looked: Array.isArray(d.looked) ? d.looked.slice(0, 5) : [], at: Date.now() });
      store.set('woahChat', h2.slice(-40));
      render();
    }).catch(e => render(false, e.message || 'Something went wrong')).finally(() => { clearInterval(tick); busy = false; const b = document.getElementById('wChatSend'); if (b) b.disabled = false; });
  }
})();
