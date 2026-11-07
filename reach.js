// "Reach out" on the Partners page and partner profiles: starts a NEW email thread to a contact from the WOAH email.
// Two choices: the Returning sponsor template (read live from the doc, like the New sponsor email tab), or write your own
// (with "Improve my text": Chris fixes grammar only and keeps everything you wrote). Sent by Chris within about 5 minutes.
const RO = { open: false, kind: 'returning', name: '', company: '', to: '', subject: '', body: '', edited: false, tpl: null, loading: false, err: '', before: null, polishing: false, pmsg: '', busy: false, sent: '' };
(function () {
  const css = `.ro-wrap{position:fixed;inset:0;z-index:900;background:rgba(4,33,47,.55);display:flex;align-items:flex-start;justify-content:center;padding:24px 16px;overflow:auto}
  .ro-box{background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:16px;max-width:680px;width:100%;padding:18px 18px 16px;box-shadow:0 20px 60px rgba(0,0,0,.3);animation:ro-in .22s ease-out both}
  @keyframes ro-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  .ro-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:12px}.ro-head h3{margin:0;font-size:19px}
  .ro-x{margin:0;padding:4px 10px}.ro-msg{font-size:13px;margin-top:8px}.ro-msg.bad{color:var(--bad)}
  .ro-polish{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:8px}.ro-polish button{margin:0}
  @media (prefers-reduced-motion:reduce){.ro-box{animation:none}}`;
  const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
})();
function roMe() { const n = String((ME && (ME.nick || ME.name)) || ''); return (n.split(',')[0].trim().split(' ')[0]) || ''; }
function roSubject() {
  const c = RO.company.trim() || '[Company Name]';
  return 'Supporting WOAH Festival again this year - ' + c;
}
function roFill(raw) {
  const lines = String(raw || '').replace(/\r/g, '').split('\n');
  while (lines.length && !lines[0].trim()) lines.shift();
  if (lines.length && /\btemplate\b/i.test(lines[0])) lines.shift();
  let t = lines.map(l => l.replace(/\s+$/, '')).join('\n').replace(/\n{3,}/g, '\n\n').trim();
  const name = RO.name.trim() || '[Name]';
  if (/^\s*dear\s*,/im.test(t)) t = t.replace(/^(\s*)dear\s*,/im, `$1Dear ${name},`);
  else if (!/^(dear|hi|hello)\b/i.test(t)) t = `Dear ${name},\n\n` + t;
  return t + (/,\s*$/.test(t) ? `\n${roMe()}\nWOAH Festival Team` : `\n\nBest regards,\n${roMe()}\nWOAH Festival Team`);
}
function roStarter() { return `Dear ${RO.name.trim() || '[Name]'},\n\n\n\nBest regards,\n${roMe()}\nWOAH Festival Team`; }
function roRebuild(force) {
  if (RO.kind === 'returning') {
    const tp = RO.tpl && RO.tpl.returning;
    if (tp && tp.text && (force || !RO.edited)) { RO.body = roFill(tp.text); RO.edited = false; }
    RO.subject = roSubject();
  } else if (force || !RO.edited) { RO.body = roStarter(); RO.edited = false; }
}
// Open the box for one contact: { email, name, company }
function reachOpen(c) {
  const first = String(c.name || '').trim();
  Object.assign(RO, { open: true, to: String(c.email || '').trim(), name: first, company: String(c.company || '').trim(), edited: false, before: null, pmsg: '', busy: false, sent: '', err: '' });
  if (RO.kind === 'own') RO.subject = 'WOAH Festival - ' + (RO.company || '[Company Name]');
  roRebuild(true); roDraw();
  if (!RO.tpl) roLoad();
}
function reachClose() { RO.open = false; const w = document.getElementById('roWrap'); if (w) w.remove(); document.removeEventListener('keydown', roEsc); }
function roEsc(e) { if (e.key === 'Escape' && !RO.busy) reachClose(); }
function roLoad() {
  if (RO.loading) return; RO.loading = true; RO.err = ''; roDraw();
  call({ action: 'templates' }).then(d => { RO.tpl = d.templates || {}; RO.loading = false; roRebuild(false); roDraw(); })
    .catch(e => { RO.loading = false; RO.err = e.message; roDraw(); });
}
function roKind(k) {
  if (RO.kind === k) return;
  RO.kind = k; RO.before = null; RO.pmsg = '';
  RO.subject = k === 'own' ? 'WOAH Festival - ' + (RO.company.trim() || '[Company Name]') : roSubject();
  roRebuild(true); roDraw();
}
function roField(f, v) {
  RO[f] = v;
  if (f === 'body') { RO.edited = true; RO.before = null; }
  if (f === 'name' && !RO.edited) { roRebuild(false); const b = document.getElementById('roBody'); if (b) b.value = RO.body; }
  if (f === 'company' && (RO.kind === 'returning' || /^WOAH Festival - /.test(RO.subject))) { RO.subject = RO.kind === 'returning' ? roSubject() : 'WOAH Festival - ' + (v.trim() || '[Company Name]'); const s = document.getElementById('roSubj'); if (s) s.value = RO.subject; }
  const m = document.getElementById('roMsg'); if (m) m.style.display = 'none';
}
function roProblem() {
  const to = RO.to.trim().toLowerCase();
  if (!/^[^\s@,;<>"]+@[^\s@,;<>"]+\.[a-z]{2,}$/i.test(to)) return "Add their email address.";
  if (/@student\.greenschool\.org$/i.test(to) || /@greenschool\.org$/i.test(to)) return "That's a Green School address, not a partner.";
  if (!RO.name.trim()) return "Add the name of the person you're writing to.";
  if (!RO.company.trim()) return 'Add the company name.';
  if (RO.subject.trim().length < 4 || /\[Company Name\]/.test(RO.subject)) return 'Add a subject.';
  const own = RO.body.replace(/^\s*(dear|hi|hello)[^\n]*\n/i, '').replace(/(best regards|kind regards|warm regards|thanks)[\s\S]*$/i, '').trim();
  if (own.length < 20) return 'Write the email first.';
  const gap = RO.body.match(/\[[^\]\n]{2,80}\]/); if (gap) return `Fill in ${gap[0]} first (and any other [square brackets]).`;
  if (/^\s*dear\s*,/im.test(RO.body)) return 'Add the name after "Dear".';
  return '';
}
function roPolish() {
  if (RO.polishing) return;
  const own = RO.body.replace(/^\s*(dear|hi|hello)[^\n]*\n/i, '').replace(/(best regards|kind regards|warm regards)[\s\S]*$/i, '').trim();
  if (own.length < 15) { RO.pmsg = 'Write your email first, then press Improve my text.'; roDraw(); return; }
  const was = RO.body; RO.polishing = true; RO.pmsg = ''; roDraw();
  call({ action: 'polish', id: '', text: RO.body, kind: 'outreach' }).then(r => {
    RO.polishing = false;
    const t = r && (r.text || r.polished);
    if (!t) { RO.pmsg = "Chris couldn't improve it this time. Try again in a moment."; roDraw(); return; }
    RO.before = was; RO.body = t; RO.pmsg = 'Chris fixed the grammar and wording. Nothing else was changed, but read it once before sending.'; roDraw();
  }).catch(e => { RO.polishing = false; RO.pmsg = e.message; roDraw(); });
}
function roUnpolish() { if (RO.before == null) return; RO.body = RO.before; RO.before = null; RO.pmsg = ''; roDraw(); }
function roAsk() {
  const m = document.getElementById('roMsg'), p = roProblem();
  m.style.display = 'block';
  if (p) { m.innerHTML = esc(p); return; }
  m.innerHTML = `Send this to <b>${esc(RO.to.trim())}</b> as a new email from the WOAH Festival email? It goes exactly as written. Chris emails you a copy (Dom, David, Francis and the sponsorship team get it too).<br>
    <button class="primary" onclick="roSend()">Yes, send it</button><button onclick="document.getElementById('roMsg').style.display='none'">Cancel</button>`;
}
function roSend() {
  const m = document.getElementById('roMsg'); m.innerHTML = 'Sending…'; RO.busy = true;
  call({ action: 'outreach', to: RO.to.trim(), name: RO.name.trim(), company: RO.company.trim(), subject: RO.subject.trim(), body: RO.body, kind: RO.kind === 'own' ? 'own' : 'returning' })
    .then(() => { RO.busy = false; RO.sent = RO.to.trim(); roDraw(); })
    .catch(err => { RO.busy = false; m.innerHTML = esc(err.message); m.style.display = 'block'; });
}
function roDraw() {
  if (!RO.open) return;
  let w = document.getElementById('roWrap');
  if (!w) { w = document.createElement('div'); w.id = 'roWrap'; w.className = 'ro-wrap'; w.addEventListener('mousedown', e => { if (e.target === w && !RO.busy) reachClose(); }); document.body.appendChild(w); document.addEventListener('keydown', roEsc); }
  if (RO.sent) {
    w.innerHTML = `<div class="ro-box" role="dialog" aria-modal="true" aria-label="Reach out"><div class="ro-head"><h3>Reach out</h3><button class="ro-x" onclick="reachClose()">Close</button></div>
      <div class="okbox">Your email to <b>${esc(RO.sent)}</b> is on its way. Chris sends it from the WOAH email within about 5 minutes and emails you a copy. When they reply, it shows up on the Email handlers page.</div></div>`;
    return;
  }
  const tp = RO.tpl && RO.tpl.returning, tplOk = !!(tp && tp.text), own = RO.kind === 'own';
  const tplNote = RO.loading ? 'Loading the template…' : RO.err ? `Couldn't load the template: ${esc(RO.err)} <a href="#" target="_self" onclick="RO.tpl=null;roLoad();return false">Try again</a>` : tp && tp.error ? esc(tp.error) : tp ? `Template: <b>${esc(tp.title || 'Returning sponsor')}</b>${RO.edited ? ' · <a href="#" target="_self" onclick="roRebuild(true);roDraw();return false">Start again from the template</a>' : ''}` : '';
  const keep = document.activeElement && document.activeElement.id;
  w.innerHTML = `<div class="ro-box" role="dialog" aria-modal="true" aria-label="Reach out">
    <div class="ro-head"><div><h3>Reach out to ${esc(RO.company || RO.to || 'this contact')}</h3><div class="sub">Starts a new email from the WOAH email. Chris sends it within about 5 minutes.</div></div><button class="ro-x" onclick="reachClose()" ${RO.busy ? 'disabled' : ''}>Close</button></div>
    <div class="out-kind" role="group" aria-label="What to send">
      <button class="${!own ? 'on' : ''}" aria-pressed="${!own}" onclick="roKind('returning')"><b>Returning sponsor template</b><span>The team's template, filled in for them</span></button>
      <button class="${own ? 'on' : ''}" aria-pressed="${own}" onclick="roKind('own')"><b>Write my own</b><span>Type the email yourself</span></button>
    </div>
    <div class="out-grid">
      <label>Their name<input id="roName" value="${esc(RO.name)}" placeholder="e.g. Made" oninput="roField('name',this.value)"></label>
      <label>Company<input id="roCo" value="${esc(RO.company)}" placeholder="e.g. Ocean Café" oninput="roField('company',this.value)"></label>
      <label class="wide">Their email<input id="roTo" type="email" value="${esc(RO.to)}" placeholder="name@company.com" oninput="roField('to',this.value)"></label>
      <label class="wide">${own ? 'Subject' : 'Subject (filled in from the company name)'}<input id="roSubj" value="${esc(RO.subject)}" ${own ? `oninput="roField('subject',this.value)"` : 'readonly tabindex="-1"'}></label>
    </div>
    ${own ? '' : `<div class="sub" style="margin:10px 0 0">${tplNote}</div>`}
    <textarea class="compose" id="roBody" style="margin-top:10px" oninput="roField('body',this.value)" ${(!own && !tplOk) || RO.polishing ? 'disabled' : ''}>${esc(RO.body)}</textarea>
    ${own ? `<div class="ro-polish"><button onclick="roPolish()" ${RO.polishing ? 'disabled' : ''}>${RO.polishing ? 'Improving…' : 'Improve my text'}</button>${RO.before != null && !RO.polishing ? '<button onclick="roUnpolish()">Undo</button>' : ''}<span class="sub">${RO.polishing ? 'Chris is fixing the grammar…' : esc(RO.pmsg || 'Chris fixes the grammar only. It keeps everything you wrote.')}</span></div>`
      : `<div class="sub" style="margin-top:4px">Check it and change anything you like. It's sent exactly as written. Anything in [square brackets] has to be filled in first.</div>`}
    <div class="hact"><button class="primary" onclick="roAsk()" ${(!own && !tplOk) || RO.polishing ? 'disabled' : ''}>Send from the WOAH email</button></div>
    <div class="confirm" id="roMsg" style="display:none"></div>
  </div>`;
  if (keep) { const e = document.getElementById(keep); if (e && e.focus) e.focus(); }
}
