// Shared by every WOAH page: login (password + your email, remembered on this device), talking to Chris's script, small helpers.
// The password is checked by the script (not here): the full password opens everything, the handler password only the Email handlers page.
// The email must be in the Planner's Team tab, so taking someone off the Team tab logs them out.
const API = 'https://script.google.com/macros/s/AKfycbzAV1IE_Y6-IlgkQh3MGRTc6aspuaZSu00y5QXu_8R8e1nTgch3XUhUyFR2wdqgZICg/exec';
const RANK = { handler: 1, full: 2 };
let KEY = '', EMAIL = '', ME = null, PAGE = { need: 'handler', onData: () => {} };
try { KEY = localStorage.getItem('woahKey') || localStorage.getItem('woahDashPw') || ''; EMAIL = localStorage.getItem('woahEmail') || localStorage.getItem('woahMyEmail') || ''; } catch (e) {}
if (!EMAIL) KEY = '';   // old logins without an email: ask once

// Plain-text POST without any Google cookies, so it works whatever accounts the browser is signed into.
function call(body, tries) {
  return fetch(API, { method: 'POST', credentials: 'omit', redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ key: KEY, email: EMAIL }, body)) })
    .then(r => r.json())
    .then(res => {
      if (!res.ok) { const e = new Error(res.error || 'Something went wrong'); e.auth = !!res.auth; throw e; }
      if (res.data && res.data.me) gate(res.data.me);
      return res.data;
    })
    .catch(e => {
      // "Failed to fetch" now and then on the first call: try again once before showing an error
      if (e instanceof TypeError && !tries) return new Promise(r => setTimeout(r, 800)).then(() => call(body, 1));
      if (e.auth) logout(e.message); throw e;
    });
}

// Send people to the page they're allowed to see
function gate(me) {
  ME = me;
  if (RANK[me.role] < RANK[PAGE.need]) { location.replace(me.role === 'handler' ? 'handlers.html' : './'); throw new Error('Moving you to your page…'); }
  const w = document.getElementById('who');
  if (w) w.innerHTML = `Logged in as <b>${esc(me.name)}</b> · <a href="#" onclick="logout();return false">Log out</a>`;
  const nav = document.getElementById('nav');
  if (nav) {
    const pages = [['./', 'Dashboard', 'full'], ['handlers.html', 'Email handlers', 'handler'], ['partners.html', 'Partners', 'handler'], ['pipeline.html', 'Pipeline', 'handler'], ['gaps.html', 'Gaps', 'full'], ['control.html', 'Control', 'full']]
      .filter(p => RANK[me.role] >= RANK[p[2]]);
    nav.innerHTML = pages.length > 1 ? pages.map(([href, label]) => `<a href="${href}" target="_self" class="${(location.pathname.endsWith(href) || (href === './' && /\/(index\.html)?$/.test(location.pathname))) ? 'here' : ''}">${label}</a>`).join('') : '';
  }
  if (window.woahExtras) setTimeout(() => window.woahExtras(me), 0);   // countdown bar + Ask Chris (extras.js)
}

function showApp(on) {
  document.getElementById('login').style.display = on ? 'none' : 'block';
  document.getElementById('app').style.display = on ? 'block' : 'none';
}
function loginBox(title) {
  document.getElementById('login').innerHTML = `
    <h1><span>WOAH</span> ${esc(title)}</h1>
    <div class="sub">Log in once on this device</div>
    <form onsubmit="event.preventDefault(); tryLogin();">
      <input id="pw" type="password" autocomplete="current-password" placeholder="WOAH password">
      <input id="em" type="email" autocomplete="email" placeholder="Your email (as in the WOAH Team list)" value="${esc(EMAIL)}" style="margin-top:0">
      <button type="submit">Open</button>
    </form>
    <div class="err" id="loginErr"></div>`;
}
function tryLogin() {
  KEY = document.getElementById('pw').value.trim();
  EMAIL = document.getElementById('em').value.trim().toLowerCase();
  try { localStorage.setItem('woahKey', KEY); localStorage.setItem('woahEmail', EMAIL); } catch (e) {}   // remembered so every page opens straight away; the password is removed again if it's wrong
  document.getElementById('loginErr').textContent = 'Checking…';
  call(Object.assign({ action: PAGE.action || 'data' }, PAGE.params || {})).then(d => {
    try { localStorage.setItem('woahKey', KEY); localStorage.removeItem('woahDashPw'); localStorage.removeItem('woahMyEmail'); } catch (e) {}
    document.getElementById('loginErr').textContent = '';
    showApp(true); PAGE.onData(d);
  }).catch(err => { const e = document.getElementById('loginErr'); if (e) e.textContent = err.message; });
}
function logout(msg) {
  try { localStorage.removeItem('woahKey'); localStorage.removeItem('woahDashPw'); } catch (e) {}
  KEY = ''; ME = null; showApp(false);
  const e = document.getElementById('loginErr'); if (e) e.textContent = msg || '';
}
// Each page calls this once: need = lowest role allowed, onData = draws the page, every = auto refresh (minutes)
function start(opts) {
  PAGE = opts;
  loginBox(opts.title);
  if (KEY) { showApp(true); load(); } else showApp(false);
  if (opts.every) setInterval(() => { if (KEY) load(); }, opts.every * 60000);
}
function load() {
  const r = document.getElementById('refresh'); if (r) r.disabled = true;
  return call(Object.assign({ action: PAGE.action || 'data' }, PAGE.params || {})).then(d => { if (r) r.disabled = false; PAGE.onData(d); }).catch(fail);
}
function fail(err) {
  const r = document.getElementById('refresh'); if (r) r.disabled = false;
  if (!KEY || /Moving you/.test(err && err.message)) return;
  const b = document.getElementById('banner'); if (b) { b.className = 'banner bad'; b.textContent = 'Something went wrong: ' + (err && err.message || err); }
}

// ---------- helpers ----------
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function days(t) { return Math.max(0, Math.floor((Date.now() - t) / 86400000)); }
function ago(t) { const d = days(t); return d === 0 ? 'today' : d === 1 ? '1 day' : d + ' days'; }
function agoText(t) { return days(t) === 0 ? 'today' : ago(t) + ' ago'; }
function ageClass(t, warn, bad) { const d = days(t); return d >= bad ? 'age-bad' : d >= warn ? 'age-warn' : ''; }
function when(t) { return new Date(t).toLocaleString([], { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }
const NAMES = { 'dominique.jason@greenschool.org': 'Dom', 'marianakoenders@yahoo.com': 'Mariana' };
function first(e) { e = String(e).toLowerCase(); return NAMES[e] || e.split('@')[0].split('.')[0].replace(/^\w/, c => c.toUpperCase()); }
function myEmail() { return ME ? String(ME.email || '').toLowerCase() : ''; }
// Always open the exact thread in the WOAH inbox
function fixLink(l) { const m = String(l || '').match(/#all\/([0-9a-f]+)/i); return m ? 'https://mail.google.com/mail/?authuser=woahfestival@greenschool.org#all/' + m[1] : l; }
// "find in my email": searches the logged-in person's OWN Gmail for the email or Chris's forward/reminder about it
function mineLink(x) {
  const id = (String(x.link || '').match(/#all\/([0-9a-f]+)/i) || [])[1] || '';
  const subj = String(x.subject || '').replace(/^\s*((re|fwd?|aw)\s*:\s*)+/i, '').replace(/"/g, '').trim();
  const parts = [];
  if (id) parts.push(id);
  if (x.sender && subj) parts.push('(from:' + x.sender + ' subject:"' + subj + '")');
  else if (subj) parts.push('subject:"' + subj + '"');
  const q = parts.length > 1 ? '{' + parts.join(' ') + '}' : (parts[0] || '');
  const me = myEmail();
  return 'https://mail.google.com/mail/' + (me ? '?authuser=' + encodeURIComponent(me) : '') + '#search/' + encodeURIComponent(q);
}
function links(x) { return `<a href="${esc(fixLink(x.link))}" title="Open in the WOAH inbox">${esc(x.subject)}</a> <a class="mine" href="${esc(mineLink(x))}" title="Search your own Gmail for this email or Chris's forward/reminder about it">find in my email</a>`; }
