// "New sponsor email" tab on the Email handlers page.
// The student picks New or Returning sponsor; the text comes live from that template doc (read again every time the
// tab opens, on Reload, and on each auto-refresh while the email hasn't been edited). They fill in the sponsor's details,
// check the email, and Chris sends it from the WOAH email within about 5 minutes.
const OUT = { kind: 'new', name: '', company: '', to: '', subject: '', body: '', edited: false, subjEdited: false, tpl: null, loading: false, err: '', sent: null };
try { const k = localStorage.getItem('woahOutKind'); if (k === 'returning') OUT.kind = 'returning'; } catch (e) {}

function outSubject() {
  const c = OUT.company.trim();
  return OUT.kind === 'returning' ? `Supporting WOAH Festival again this year${c ? ' – ' + c : ''}` : `Sponsorship invitation: WOAH Festival${c ? ' × ' + c : ''}`;
}
// Template text -> the email: drop the doc's title line, tidy blank lines, put the name after "Dear", sign with your nickname
function outFill(raw) {
  const lines = String(raw || '').replace(/\r/g, '').split('\n');
  while (lines.length && !lines[0].trim()) lines.shift();
  if (lines.length && /\btemplate\b/i.test(lines[0])) lines.shift();
  let t = lines.map(l => l.replace(/\s+$/, '')).join('\n').replace(/\n{3,}/g, '\n\n').trim();
  const name = OUT.name.trim() || '[Name]';
  if (/^\s*dear\s*,/im.test(t)) t = t.replace(/^(\s*)dear\s*,/im, `$1Dear ${name},`);
  else if (!/^(dear|hi|hello)\b/i.test(t)) t = `Dear ${name},\n\n` + t;
  const me = myEmail() ? teamName(myEmail()) : '';
  t += /,\s*$/.test(t) ? `\n${me}\nWOAH Festival Team` : `\n\nBest regards,\n${me}\nWOAH Festival Team`;
  return t;
}
function outRebuild(force) {
  const tp = OUT.tpl && OUT.tpl[OUT.kind];
  if (tp && tp.text && (force || !OUT.edited)) { OUT.body = outFill(tp.text); OUT.edited = false; }
  if (force || !OUT.subjEdited) { OUT.subject = outSubject(); OUT.subjEdited = false; }
}
function outLoad(quiet) {
  if (OUT.loading) return;
  OUT.loading = true; OUT.err = ''; if (!quiet) outDraw();
  call({ action: 'templates' }).then(d => {
    OUT.tpl = d.templates || {}; OUT.loading = false; outRebuild(false);
    const b = document.getElementById('outBody');
    if (quiet && b && document.activeElement && document.activeElement.closest && document.activeElement.closest('#panel')) { if (!OUT.edited && document.activeElement !== b) b.value = OUT.body; return; }   // typing: don't redraw under them
    outDraw();
  })
    .catch(e => { OUT.loading = false; OUT.err = e.message; outDraw(); });
}
function outKind(k) { OUT.kind = k; try { localStorage.setItem('woahOutKind', k); } catch (e) {} OUT.edited = false; OUT.sent = null; outRebuild(true); outDraw(); }
function outField(f, v) {
  OUT[f] = v;
  if (f === 'subject') OUT.subjEdited = true;
  if (f === 'body') OUT.edited = true;
  if (f === 'name' && !OUT.edited) { outRebuild(false); const b = document.getElementById('outBody'); if (b) b.value = OUT.body; }
  if (f === 'company' && !OUT.subjEdited) { OUT.subject = outSubject(); const s = document.getElementById('outSubj'); if (s) s.value = OUT.subject; }
  const m = document.getElementById('outMsg'); if (m) { m.style.display = 'none'; }
}
function outProblem() {
  if (!/^[^\s@,;<>"]+@[^\s@,;<>"]+\.[a-z]{2,}$/i.test(OUT.to.trim())) return "Add the sponsor's email address.";
  if (/@student\.greenschool\.org$/i.test(OUT.to.trim()) || ((DATA && DATA.team) || []).some(t => t.email === OUT.to.trim().toLowerCase())) return "That address is someone on the team, not a sponsor.";
  if (!OUT.name.trim()) return "Add the name of the person you're writing to.";
  if (!OUT.subject.trim()) return 'Add a subject.';
  if (OUT.body.trim().length < 40) return 'The email is empty.';
  const gap = OUT.body.match(/\[[^\]\n]{2,80}\]/); if (gap) return `Fill in ${gap[0]} first (and any other [square brackets]).`;
  if (/^\s*dear\s*,/im.test(OUT.body)) return 'Add the name after "Dear".';
  if (((DATA && DATA.pending) || []).some(p => p.op === 'outreach' && p.id === OUT.to.trim().toLowerCase())) return 'An email to this address is already waiting to be sent.';
  return '';
}
function outAsk() {
  const m = document.getElementById('outMsg'), p = outProblem();
  if (p) { m.className = 'confirm'; m.innerHTML = esc(p); m.style.display = 'block'; return; }
  m.className = 'confirm';
  m.innerHTML = `Send this ${OUT.kind === 'returning' ? 'returning' : 'new'} sponsor email to <b>${esc(OUT.to.trim())}</b> from the WOAH Festival email? It goes exactly as written. Chris emails you a copy (Dom, David, Francis and the sponsorship team get it too).<br>
    <button class="primary" onclick="outSend()">Yes, send it</button><button onclick="document.getElementById('outMsg').style.display='none'">Cancel</button>`;
  m.style.display = 'block';
}
function outSend() {
  const m = document.getElementById('outMsg'); m.innerHTML = 'Sending…';
  call({ action: 'outreach', to: OUT.to.trim(), name: OUT.name.trim(), company: OUT.company.trim(), subject: OUT.subject.trim(), body: OUT.body, kind: OUT.kind })
    .then(d => { OUT.sent = OUT.to.trim(); Object.assign(OUT, { name: '', company: '', to: '', edited: false, subjEdited: false }); outRebuild(true); DATA = d; outDraw(); })
    .catch(err => { m.className = 'confirm'; m.innerHTML = esc(err.message); m.style.display = 'block'; });
}
function outList() {
  const pend = ((DATA && DATA.pending) || []).filter(p => p.op === 'outreach');
  const sent = ((DATA && DATA.snap && DATA.snap.outreach) || []);
  let h = '';
  if (pend.length) h += `<div class="gh">Waiting for Chris to send <span class="sub">· ${pend.length}</span></div>` + pend.map(p => { let v = {}; try { v = JSON.parse(String(p.value).replace(/^​/, '')); } catch (e) {}
    return `<div class="hitem sent"><div class="top"><div><b>${esc(v.subject || '(no subject)')}</b></div><div class="sentlbl">waiting for Chris</div></div><div class="meta">To ${esc(v.name || '')} &lt;${esc(p.id)}&gt; · by ${esc(teamName(p.by))}</div></div>`; }).join('');
  h += `<div class="gh">Sponsor emails sent <span class="sub">· last 45 days</span></div>`;
  h += sent.length ? sent.map(s => `<div class="hitem ${s.replied ? 'sent' : ''}"><div class="top"><div><b>${esc(s.name)}</b> <span class="tag">${s.kind === 'returning' ? 'returning' : 'new'}</span></div><div class="${s.replied ? 'sentlbl' : 'sub'}" style="white-space:nowrap">${s.replied ? 'They replied' : 'No reply yet'}</div></div>
      <div class="meta">${esc(s.subject)} · sent by ${esc(s.by)} · ${esc(agoText(s.at))}</div></div>`).join('')
    : `<div class="empty">None yet. Emails sent from here show up in this list.</div>`;
  return h;
}
function outDraw() {
  const p = document.getElementById('panel'); if (!p || TAB !== 'new') return;
  const tp = OUT.tpl && OUT.tpl[OUT.kind];
  const tplNote = OUT.loading ? 'Loading the template…' : OUT.err ? `Couldn't load the template: ${esc(OUT.err)}` : tp && tp.error ? esc(tp.error) : tp ? `Template: <b>${esc(tp.title || '')}</b>, loaded ${esc(new Date(tp.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}. Changes to the doc show up here automatically.` : '';
  p.innerHTML = `
    <div class="htools"><div class="sub">Write a first email to a sponsor from the WOAH email, using the team's template. Chris sends it within about 5 minutes.</div></div>
    ${OUT.sent ? `<div class="okbox" style="margin-bottom:12px">Your email to <b>${esc(OUT.sent)}</b> is on its way. Chris sends it from the WOAH email within about 5 minutes and emails you a copy.</div>` : ''}
    <div class="out-kind" role="group" aria-label="Which sponsor">
      <button class="${OUT.kind === 'new' ? 'on' : ''}" aria-pressed="${OUT.kind === 'new'}" onclick="outKind('new')"><b>New sponsor</b><span>First time asking them</span></button>
      <button class="${OUT.kind === 'returning' ? 'on' : ''}" aria-pressed="${OUT.kind === 'returning'}" onclick="outKind('returning')"><b>Returning sponsor</b><span>They supported us before</span></button>
    </div>
    <div class="out-grid">
      <label>Their name<input id="outName" value="${esc(OUT.name)}" placeholder="e.g. Made" oninput="outField('name',this.value)"></label>
      <label>Company<input id="outCo" value="${esc(OUT.company)}" placeholder="e.g. Ocean Café" oninput="outField('company',this.value)"></label>
      <label class="wide">Their email<input id="outTo" type="email" value="${esc(OUT.to)}" placeholder="name@company.com" oninput="outField('to',this.value)"></label>
      <label class="wide">Subject<input id="outSubj" value="${esc(OUT.subject)}" oninput="outField('subject',this.value)"></label>
    </div>
    <div class="sub" style="margin:10px 0 6px">${tplNote} ${tp && !OUT.loading ? `<a href="#" target="_self" onclick="outLoad();return false">Reload</a>${OUT.edited ? ' · <a href="#" target="_self" onclick="outRebuild(true);outDraw();return false">Start again from the template</a>' : ''}` : ''}</div>
    <textarea class="compose" id="outBody" oninput="outField('body',this.value)" ${tp && tp.text ? '' : 'disabled'}>${esc(OUT.body)}</textarea>
    <div class="sub" style="margin-top:4px">Check it and change anything you like. It's sent exactly as written. Anything in [square brackets] has to be filled in first.</div>
    <div class="hact"><button class="primary" onclick="outAsk()" ${tp && tp.text ? '' : 'disabled'}>Send from the WOAH email</button></div>
    <div class="confirm" id="outMsg"></div>
    <div id="outList">${outList()}</div>`;
}
// Called by the page on every (auto) refresh while this tab is open: keeps what's typed, refreshes the template if it wasn't edited
function renderOutreach(p, refreshed) {
  if (!document.getElementById('outBody') || !refreshed) { outDraw(); if (!OUT.tpl) outLoad(); return; }
  if (!OUT.edited) outLoad(true);
  const l = document.getElementById('outList'); if (l) l.innerHTML = outList();
}
