const MS = { open: false, step: 1, kind: 'new', tab: 'Sponsors', query: '', tpl: null, tplErr: '', loading: false, finding: false,
  findErr: '', res: null, ticked: {}, body: '', edited: false, busy: false, done: null, err: '' };
const MS_PRESETS = ['All restaurants and bars in the Sanur area', 'All hotels', 'Cafés and restaurants anywhere in Bali', 'Beach clubs', 'Hotels and villas in Sanur',
  'Surf shops, surf schools and surf brands', 'Diving, snorkelling and boat tour companies', 'Yoga, wellness and spas', 'Shops and clothing brands',
  'Food and drink brands', 'NGOs, foundations and ocean conservation groups', 'Media, printing and design', 'Everyone with an email'];
const MS_MAX = 200;
function msBase() { return MS.kind === 'returning' ? 'Supporting WOAH Festival again this year' : 'Sponsorship invitation: WOAH Festival'; }
function msMe() { const n = String((ME && (ME.nick || ME.name)) || ''); return (n.split(',')[0].trim().split(' ')[0]) || ''; }
// no title or greeting line, signed with your name
function msFill(raw) {
  const lines = String(raw || '').replace(/\r/g, '').split('\n');
  while (lines.length && !lines[0].trim()) lines.shift();
  if (lines.length && /\btemplate\b/i.test(lines[0])) lines.shift();
  let t = lines.map(l => l.replace(/\s+$/, '')).join('\n').replace(/\n{3,}/g, '\n\n').trim();
  t = t.replace(/^\s*(dear|hi|hello)\b[^\n]*\n+/i, '').trim();
  return t + (/,\s*$/.test(t) ? `\n${msMe()}\nWOAH Festival Team` : `\n\nBest regards,\n${msMe()}\nWOAH Festival Team`);
}
function msName(c) {
  let n = String(c.contact || '').replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  if (!n || /^[-–?.]+$/.test(n) || n.length > 40 || /@|\d{4}/.test(n)) n = (String(c.company || '').trim() || 'there') + ' team';
  return n;
}
function msCompany(c) { return String(c.company || c.contact || c.to.split('@')[1] || '').replace(/\s*\((ig|IG)\)\s*/g, ' ').replace(/\s+/g, ' ').trim(); }
function msEmailFor(c) {
  const name = msName(c), co = msCompany(c);
  const body = `Dear ${name},\n\n` + MS.body.replace(/\[(company( name)?)\]/gi, co).replace(/\[(name|their name)\]/gi, name);
  return { to: c.to, name, company: co, subject: msBase() + ' - ' + co, body };
}
function msTabs() { return [...new Set(((typeof PP !== 'undefined' && PP && PP.rows) || []).map(r => r.tab))]; }
function massOpen() {
  Object.assign(MS, { open: true, step: 1, res: null, ticked: {}, done: null, err: '', findErr: '', busy: false });
  if (!msTabs().includes(MS.tab)) MS.tab = msTabs().includes('Sponsors') ? 'Sponsors' : (msTabs()[0] || 'Sponsors');
  msDraw(); if (!MS.tpl) msLoad();
}
function massClose() { if (MS.busy) return; MS.open = false; const w = document.getElementById('msWrap'); if (w) w.remove(); document.removeEventListener('keydown', msEsc); }
function msEsc(e) { if (e.key === 'Escape') massClose(); }
function msLoad() {
  MS.loading = true; MS.tplErr = ''; msDraw();
  call({ action: 'templates' }).then(d => { MS.tpl = d.templates || {}; MS.tplData = d; MS.loading = false; if (!MS.edited) msRebuild(); msDraw(); })
    .catch(e => { MS.loading = false; MS.tplErr = e.message; msDraw(); });
}
function msVenueChanged() { msRebuild(); msDraw(); }
function msRebuild() { const tp = MS.tpl && pickTpl(MS.tplData, MS.kind); MS.body = tp && tp.text ? msFill(tp.text) : ''; MS.edited = false; }
function msKind(k) { if (MS.kind === k) return; MS.kind = k; msRebuild(); msDraw(); }
function msFind(q) {
  if (q != null) { MS.query = q; const i = document.getElementById('msQ'); if (i) i.value = q; }
  MS.query = (document.getElementById('msQ') || { value: MS.query }).value.trim();
  if (!MS.query) { MS.findErr = 'Pick one of the choices or type who it should go to.'; msDraw(); return; }
  MS.finding = true; MS.findErr = ''; MS.res = null; msDraw();
  const query = /^everyone with an email$/i.test(MS.query) ? '*' : MS.query;
  call({ action: 'massPick', tab: MS.tab, query }).then(d => {
    MS.finding = false; MS.res = d; MS.ticked = {};
    (d.list || []).forEach(c => { if (!c.skip) MS.ticked[c.to] = true; });
    MS.step = 2; msDraw();
  }).catch(e => { MS.finding = false; MS.findErr = e.message; msDraw(); });
}
function msTick(to, on) { if (on) MS.ticked[to] = true; else delete MS.ticked[to]; msCount(); }
function msAll(on) { (MS.res.list || []).forEach(c => { if (!c.skip) { if (on) MS.ticked[c.to] = true; else delete MS.ticked[c.to]; } }); msDraw(); }
function msChosen() { return ((MS.res && MS.res.list) || []).filter(c => !c.skip && MS.ticked[c.to]); }
function msCount() { const n = msChosen().length, e = document.getElementById('msN'); if (e) e.textContent = n + ' ticked'; const b = document.getElementById('msGo'); if (b) b.textContent = `Send ${n} separate email${n === 1 ? '' : 's'}`; }
function msProblem() {
  const list = msChosen();
  if (!list.length) return 'Tick at least one contact.';
  if (list.length > MS_MAX) return `That's ${list.length} emails. Send at most ${MS_MAX} at a time (untick some, or split the list).`;
  if (MS.body.trim().length < 40) return 'The email is empty.';
  const e = msEmailFor(list[0]); const gap = e.body.match(/\[[^\]\n]{2,80}\]/);
  if (gap) return `Fill in ${gap[0]} first. [Name] and [Company Name] are filled in for each sponsor automatically.`;
  return '';
}
function msAsk() {
  const m = document.getElementById('msMsg'), p = msProblem(), n = msChosen().length;
  m.style.display = 'block';
  if (p) { m.innerHTML = esc(p); return; }
  m.innerHTML = `Send the ${MS.kind === 'returning' ? 'returning' : 'new'} sponsor email to <b>${n} contact${n === 1 ? '' : 's'}</b> from the WOAH Festival email? Each one gets their <b>own separate email</b>. Chris sends 20 every 5 minutes (about ${Math.ceil(n / 20) * 5} minutes in total), skips anyone who already replied to WOAH or was emailed in the last 14 days, and emails you one summary when it's done.<br>
    <button class="primary" onclick="msSend()">Yes, send them</button><button onclick="document.getElementById('msMsg').style.display='none'">Cancel</button>`;
}
function msSend() {
  const m = document.getElementById('msMsg'); m.innerHTML = 'Handing them to Chris…'; MS.busy = true;
  call({ action: 'massSend', kind: MS.kind, items: msChosen().map(msEmailFor) })
    .then(d => { MS.busy = false; MS.done = d; MS.step = 3; msDraw(); })
    .catch(e => { MS.busy = false; m.innerHTML = esc(e.message); });
}
function msRow(c) {
  const on = !c.skip && MS.ticked[c.to];
  return `<label class="ms-row${c.skip ? ' off' : ''}"><input type="checkbox" ${on ? 'checked' : ''} ${c.skip ? 'disabled' : ''} onchange="msTick('${esc(c.to)}',this.checked)">
    <span><b>${esc(c.company || c.to)}</b>${c.contact && !/^[-–?.]+$/.test(c.contact.trim()) ? ' <span class="sub">· ' + esc(c.contact) + '</span>' : ''}<br><span class="sub">${esc(c.to)}${c.skip ? ' · <b>skipped:</b> ' + esc(c.skip) : c.why ? ' · ' + esc(c.why) : ''}</span></span></label>`;
}
function msDraw() {
  if (!MS.open) return;
  let w = document.getElementById('msWrap');
  if (!w) { w = document.createElement('div'); w.id = 'msWrap'; w.className = 'ro-wrap'; w.addEventListener('mousedown', e => { if (e.target === w) massClose(); }); document.body.appendChild(w); document.addEventListener('keydown', msEsc); }
  const head = `<div class="ro-head"><div><h3>Mass email sponsors</h3><div class="sub">The ${MS.kind === 'returning' ? 'Returning' : 'New'} sponsor template to many contacts, each as their own email from the WOAH email.</div></div><button class="ro-x" onclick="massClose()" ${MS.busy ? 'disabled' : ''}>Close</button></div>`;
  let h = '';
  if (MS.step === 3) {
    const d = MS.done || {};
    h = `<div class="okbox"><b>${d.queued} email${d.queued === 1 ? '' : 's'}</b> handed to Chris. He sends 20 every 5 minutes from the WOAH email (done in about ${d.minutes} minutes) and emails you one summary when they're all out. Replies show up on the Email handlers page.</div>
      ${(d.skipped || []).length ? `<div class="sub" style="margin-top:10px"><b>Not sent (${d.skipped.length}):</b><br>${d.skipped.map(esc).join('<br>')}</div>` : ''}
      <div class="hact"><button onclick="massClose()">Done</button></div>`;
  } else {
    const tabs = msTabs();
    h = `<div class="out-kind" role="group" aria-label="Which template">
        <button class="${MS.kind === 'new' ? 'on' : ''}" aria-pressed="${MS.kind === 'new'}" onclick="msKind('new')"><b>New sponsor</b><span>First time asking them</span></button>
        <button class="${MS.kind === 'returning' ? 'on' : ''}" aria-pressed="${MS.kind === 'returning'}" onclick="msKind('returning')"><b>Returning sponsor</b><span>They supported us before</span></button></div>
      ${venueHTML('msVenueChanged')}
      <div class="ms-h">1. Who should get it?</div>
      <div class="ms-chips">${MS_PRESETS.map((p, i) => `<button class="${MS.query === p ? 'on' : ''}" onclick="msFind(MS_PRESETS[${i}])" ${MS.finding ? 'disabled' : ''}>${esc(p)}</button>`).join('')}</div>
      <div class="ms-ask"><input id="msQ" value="${esc(MS.query)}" placeholder="Or tell Chris, e.g. surf shops and cafés in Canggu" onkeydown="if(event.key==='Enter')msFind()">
        <select id="msTab" onchange="MS.tab=this.value">${tabs.map(t => `<option ${t === MS.tab ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>
        <button class="primary" onclick="msFind()" ${MS.finding ? 'disabled' : ''}>${MS.finding ? 'Chris is looking…' : 'Find contacts'}</button></div>
      ${MS.finding ? '<div class="sub" style="margin-top:6px">Chris is reading the list and picking who fits. This can take up to a minute.</div>' : ''}
      ${MS.findErr ? `<div class="ro-msg bad">${esc(MS.findErr)}</div>` : ''}`;
    if (MS.step === 2 && MS.res) {
      const list = MS.res.list || [], ok = list.filter(c => !c.skip).length;
      h += `<div class="ms-h">2. Tick who gets it <span class="sub" style="font-weight:400">· Chris found ${list.length} of ${MS.res.total} contacts with an email on the ${esc(MS.res.tab)} tab${list.length - ok ? `, ${list.length - ok} skipped` : ''}</span></div>
        ${list.length ? `<div class="ms-tools"><a href="#" target="_self" onclick="msAll(true);return false">Tick all</a> · <a href="#" target="_self" onclick="msAll(false);return false">Untick all</a> · <span id="msN"></span></div>
        <div class="ms-list">${list.map(msRow).join('')}</div>` : '<div class="empty">Nobody fits that. Try different words or another tab.</div>'}
        <div class="ms-h">3. The email</div>
        <div class="sub">${MS.loading ? 'Loading the template…' : MS.tplErr ? `Couldn't load the template: ${esc(MS.tplErr)}` : (pickTpl(MS.tplData, MS.kind) && pickTpl(MS.tplData, MS.kind).title ? 'Template: <b>' + esc(pickTpl(MS.tplData, MS.kind).title) + '</b>. ' : '') + 'Each email starts with "Dear &lt;their name&gt;," and the subject is "' + esc(msBase()) + ' - &lt;Company&gt;". [Name] and [Company Name] in the text are filled in for each sponsor. Change the text below and it changes for everyone.'}</div>
        <textarea class="compose" id="msBody" oninput="MS.body=this.value;MS.edited=true" ${MS.body ? '' : 'disabled'}>${esc(MS.body)}</textarea>
        ${MS.edited ? '<div class="sub"><a href="#" target="_self" onclick="msRebuild();msDraw();return false">Start again from the template</a></div>' : ''}
        ${list.length && MS.body ? `<details class="ms-prev"><summary>Preview the first one</summary><pre>${(() => { const c = msChosen()[0] || list.find(x => !x.skip); if (!c) return ''; const e = msEmailFor(c); return esc('To: ' + e.to + '\nSubject: ' + e.subject + '\n\n' + e.body); })()}</pre></details>` : ''}
        <div class="hact"><button class="primary" id="msGo" onclick="msAsk()" ${MS.body ? '' : 'disabled'}></button></div>
        <div class="confirm" id="msMsg" style="display:none"></div>`;
    }
  }
  const keep = document.activeElement && document.activeElement.id, sc = (w.querySelector('.ms-list') || {}).scrollTop;
  w.innerHTML = `<div class="ro-box ms-box" role="dialog" aria-modal="true" aria-label="Mass email sponsors">${head}${h}</div>`;
  if (sc) w.querySelector('.ms-list').scrollTop = sc;
  if (keep) { const e = document.getElementById(keep); if (e && e.focus) e.focus(); }
  msCount();
}
function massCard() {
  const c = document.getElementById('massCard'); if (!c) return;
  c.style.display = 'block';
  if (location.hash === '#mass' && !MS.auto) { MS.auto = true; setTimeout(massOpen, 50); }
  c.innerHTML = `<div class="pp-h">Mass email sponsors</div><div class="sub" style="margin-bottom:10px">Send the New or Returning sponsor template to a whole group at once, e.g. all hotels, or all restaurants and bars in Sanur. Chris picks them from the list, you tick who gets it, and everyone gets their own separate email. People who already replied to WOAH are left out.</div>
    <button class="primary" target="_self" onclick="massOpen()">Start a mass email…</button>`;
}
(function () {
  const css = `.ms-box{max-width:760px}.ms-h{font-weight:700;margin:16px 0 6px}
  .ms-chips{display:flex;flex-wrap:wrap;gap:6px}.ms-chips button{margin:0;border-radius:999px;padding:6px 12px;font-size:13px}.ms-chips button.on{border-color:var(--brand);color:var(--brand)}
  .ms-ask{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}.ms-ask input{flex:1 1 240px;min-width:0;font:inherit;padding:8px 10px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--ink)}
  .ms-ask select{font:inherit;padding:8px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--ink)}.ms-ask button{margin:0}
  .ms-tools{font-size:13px;margin-bottom:6px}.ms-list{max-height:300px;overflow:auto;border:1px solid var(--line);border-radius:10px;padding:4px 8px}
  .ms-row{display:flex;gap:10px;align-items:flex-start;padding:7px 2px;border-bottom:1px solid var(--line);font-size:14px;cursor:pointer}.ms-row:last-child{border-bottom:0}
  .ms-row input{margin-top:4px;flex:none}.ms-row.off{opacity:.55;cursor:default}
  .ms-prev{margin-top:8px}.ms-prev pre{white-space:pre-wrap;font:13px/1.5 inherit;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:10px;max-height:240px;overflow:auto}`;
  const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
})();
