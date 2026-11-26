// Student dashboard blocks, shared by home.html (students) and the main Dashboard (admins):
// my emails, my Planner items, my partners, team numbers, and the Team (departments, photos, profiles).
// Data comes from Chris's 'home' call. Nothing here changes how Chris works; the only action is
// "Pass an email to them", which is the same as Reassign on the Email handlers page.
let HD = null;
const H_MAX = 6;

(function () {
  const s = document.createElement('style');
  s.textContent = `
  .h-two { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 14px; margin-bottom: 14px; }
  .h-two > .card { min-width: 0; }
  .h-card-h { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin: 0 0 10px; flex-wrap: wrap; }
  .h-card-h h3 { margin: 0; font-size: 16px; }
  .h-card-h a { font-size: 13px; white-space: nowrap; }
  .h-sec { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); margin: 12px 0 4px; }
  .h-sec:first-child { margin-top: 0; }
  .h-list { list-style: none; margin: 0; padding: 0; }
  .h-list li { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; padding: 8px 0; border-top: 1px solid var(--line); font-size: 14px; }
  .h-list li:first-child { border-top: 0; }
  .h-list .t { min-width: 0; overflow-wrap: anywhere; }
  .h-list .t small { display: block; color: var(--muted); font-size: 12px; margin-top: 2px; }
  .h-list .r { white-space: nowrap; font-size: 12px; color: var(--muted); text-align: right; }
  .h-list .r.age-bad, .h-list .r.bad { color: var(--bad); font-weight: 600; }
  .h-list .r.age-warn { color: var(--warn); font-weight: 600; }
  .h-empty { color: var(--muted); font-size: 14px; padding: 6px 0; }
  .h-more { font-size: 13px; color: var(--muted); padding-top: 6px; }
  .h-note { color: var(--muted); font-size: 12px; margin-top: 10px; }
  .h-dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; background: var(--line-2, var(--line)); flex: none; }
  .h-st { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; color: var(--muted); white-space: nowrap; }
  .h-team { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 10px; }
  .h-p { display: flex; gap: 10px; align-items: center; margin: 0; padding: 10px 12px; border: 1px solid var(--line); border-radius: 12px; background: var(--card); color: var(--ink); text-align: left; font: inherit; cursor: pointer; min-width: 0; transition: border-color .15s, transform .15s; }
  .h-p:hover { border-color: var(--brand); transform: translateY(-1px); }
  .h-p .tx { min-width: 0; }
  .h-p b { display: block; font-size: 14px; }
  .h-p small { display: block; color: var(--muted); font-size: 12px; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .h-p.me { border-style: dashed; }
  .h-av { display: grid; place-items: center; flex: none; width: 44px; height: 44px; border-radius: 50%; background-color: var(--brand); background-size: cover; background-position: center; color: var(--on-brand, #fff); font-weight: 700; font-size: 16px; }
  .h-av.ph { color: transparent; }
  .h-av.big { width: 72px; height: 72px; font-size: 26px; }
  .h-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 6px; }
  .h-tag { font-size: 11px; padding: 2px 8px; border-radius: 999px; background: var(--bg); color: var(--muted); border: 1px solid var(--line); }
  .h-tag.dep { background: var(--brand-soft); color: var(--brand); border-color: transparent; }
  .h-modal { position: fixed; inset: 0; z-index: 950; display: none; align-items: center; justify-content: center; padding: 16px; background: rgba(4,33,47,.45); }
  .h-modal.open { display: flex; }
  .h-box { width: min(560px, 100%); max-height: calc(100vh - 32px); overflow-y: auto; background: var(--card); color: var(--ink); border: 1px solid var(--line); border-radius: 18px; padding: 18px; box-shadow: var(--shadow-up, 0 10px 30px rgba(0,0,0,.2)); }
  .h-ph { display: flex; gap: 14px; align-items: center; margin-bottom: 12px; }
  .h-ph h3 { margin: 0; font-size: 20px; }
  .h-ph .sub { margin-top: 2px; }
  .h-x { margin-left: auto; align-self: flex-start; background: none !important; border: 0 !important; font-size: 22px; line-height: 1; color: var(--muted); padding: 2px 6px; }
  .h-bio { font-size: 14px; margin: 4px 0 0; }
  .h-acts { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0 4px; }
  .h-acts a, .h-acts button { display: inline-flex; align-items: center; margin: 0; padding: 8px 14px; border-radius: 10px; border: 1px solid var(--line); background: var(--card); color: var(--ink); font: inherit; font-size: 14px; font-weight: 600; text-decoration: none; cursor: pointer; }
  .h-acts .pri { background: var(--brand); border-color: var(--brand); color: var(--on-brand, #fff); }
  .h-pass label { display: flex; gap: 8px; align-items: flex-start; padding: 7px 0; border-top: 1px solid var(--line); font-size: 14px; cursor: pointer; }
  .h-pass label:first-of-type { border-top: 0; }
  .h-pass small { display: block; color: var(--muted); font-size: 12px; }
  .h-msg { font-size: 13px; margin-top: 8px; color: var(--muted); }
  .h-msg.bad { color: var(--bad); } .h-msg.ok { color: var(--ok); }
  .h-form label { display: block; font-size: 13px; font-weight: 600; margin: 10px 0 4px; }
  .h-form input, .h-form textarea { width: 100%; box-sizing: border-box; font: inherit; font-size: 14px; padding: 9px 12px; border-radius: 10px; border: 1px solid var(--line); background: var(--bg); color: var(--ink); }
  .h-form textarea { min-height: 64px; resize: vertical; }
  .h-form .cnt { font-size: 11px; color: var(--muted); text-align: right; }
  html.m .h-two { grid-template-columns: 1fr; }
  html.m .h-team { grid-template-columns: 1fr 1fr; }
  html.m .h-p { padding: 9px; gap: 8px; } html.m .h-av { width: 38px; height: 38px; font-size: 14px; }
  html.m .h-modal { align-items: flex-end; padding: 0; } html.m .h-box { border-radius: 18px 18px 0 0; max-height: 88vh; padding-bottom: calc(18px + env(safe-area-inset-bottom)); }`;
  (document.head || document.documentElement).appendChild(s);
})();

// ---------- helpers ----------
function hPhotos() { try { return (JSON.parse(localStorage.getItem('woahPhotos') || 'null') || {}).map || {}; } catch (e) { return {}; } }
function hInit(p) { return String((p && (p.nick || p.name)) || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('').slice(0, 2); }
function hShort(p) { return p ? ((p.nick || '').trim() || String(p.name || '').split(' ')[0]) : ''; }
function hPerson(email) { return ((HD && HD.people) || []).find(p => p.email === String(email || '').toLowerCase()); }
function hAv(p, big) {
  const ph = hPhotos()[p.email];
  return `<span class="h-av ${big ? 'big' : ''} ${ph ? 'ph' : ''}" style="${ph ? `background-image:url('${esc(ph)}')` : ''}">${esc(hInit(p))}</span>`;
}
function hKeyOf(r) { return (r.tab + '|' + (r.email || r.company)).toLowerCase().slice(0, 200); }
function hEmailLink(x) { return `<a href="email.html?id=${encodeURIComponent(x.id)}" target="_self">${esc(x.subject || '(no subject)')}</a>`; }
function hPlural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
function hMine() {
  const me = myEmail(), now = Date.now(), s = (HD && HD.snap) || {};
  const isMine = x => (x.to || []).includes(me) || x.claimedBy === me;
  const us = (s.open || []).filter(isMine), them = (s.waiting || []).filter(x => x.claimedBy ? x.claimedBy === me : (x.to || []).includes(me));
  return {
    us: us.filter(x => !(x.snoozeUntil > now)).sort((a, b) => a.since - b.since), usSnoozed: us.filter(x => x.snoozeUntil > now).length,
    them: them.filter(x => !(x.snoozeUntil > now)).sort((a, b) => (a.since || 0) - (b.since || 0)), themLater: them.filter(x => x.snoozeUntil > now).length,
  };
}
function hSet(id, html) { const el = document.getElementById(id); if (el) el.innerHTML = html; }

// ---------- blocks ----------
function hEmails(id) {
  const m = hMine();
  const usRows = m.us.slice(0, H_MAX).map(x => `<li><span class="t">${hEmailLink(x)}<small>From ${esc(x.from || '—')}${x.reminders ? ' · reminder ' + x.reminders + '/3' : ''}</small></span><span class="r ${ageClass(x.since, 3, 5)}">${ago(x.since)}</span></li>`).join('');
  const themRows = m.them.slice(0, H_MAX).map(x => `<li><span class="t">${hEmailLink(x)}<small>Waiting on ${esc(x.who || '—')}</small></span><span class="r ${x.since ? ageClass(x.since, 7, 12) : ''}">${x.since ? agoText(x.since) : ''}</span></li>`).join('');
  hSet(id, `<div class="h-card-h"><h3>My emails</h3><a href="handlers.html" target="_self">Open Email handlers →</a></div>
    <div class="h-sec">To answer</div>${usRows ? '<ul class="h-list">' + usRows + '</ul>' : '<div class="h-empty">Nothing waiting on you.</div>'}
    ${m.us.length > H_MAX ? `<div class="h-more">+${m.us.length - H_MAX} more on Email handlers</div>` : ''}${m.usSnoozed ? `<div class="h-more">${hPlural(m.usSnoozed, 'email')} snoozed</div>` : ''}
    <div class="h-sec">I'm chasing</div>${themRows ? '<ul class="h-list">' + themRows + '</ul>' : '<div class="h-empty">No one to chase.</div>'}
    ${m.them.length > H_MAX ? `<div class="h-more">+${m.them.length - H_MAX} more on Email handlers</div>` : ''}${m.themLater ? `<div class="h-more">${hPlural(m.themLater, 'reminder')} set for later</div>` : ''}`);
}
function hTasks(id) {
  const tasks = (HD && HD.tasks) || [];
  const rows = tasks.slice().sort((a, b) => (b.overdue - a.overdue) || (a.due - b.due)).slice(0, 10).map(x =>
    `<li><span class="t">${esc(x.item)}<small>${esc(x.planner)}${x.status ? ' · ' + esc(x.status) : ''}</small></span><span class="r ${x.overdue ? 'bad' : ''}">${esc(x.dueText || '')}${x.overdue ? ' · overdue' : ''}</span></li>`).join('');
  hSet(id, `<div class="h-card-h"><h3>My Planner items</h3></div>
    ${rows ? '<ul class="h-list">' + rows + '</ul>' : '<div class="h-empty">Nothing of yours is overdue or due in the next 2 weeks.</div>'}
    ${tasks.length > 10 ? `<div class="h-more">+${tasks.length - 10} more</div>` : ''}
    <div class="h-note">From the Planner, where you're named as the Owner. Overdue first, then by due date.</div>`);
}
function hPartners(id) {
  const pp = (HD && HD.myPartners) || [], all = (HD && HD.myPartnersAll) || 0;
  const rows = pp.slice().sort((a, b) => a.rank - b.rank || String(a.company).localeCompare(String(b.company))).slice(0, 8).map(r =>
    `<li><span class="t"><a href="profile.html?k=${encodeURIComponent(hKeyOf(r))}" target="_self">${esc(r.company || r.contact || r.email)}</a><small>${esc(r.tab)}${r.progress ? ' · ' + esc(String(r.progress).slice(0, 90)) : ''}</small></span>
      <span class="h-st"><span class="h-dot" style="${r.color ? 'background:' + esc(r.color) : ''}"></span>${esc(r.status || 'No status yet')}</span></li>`).join('');
  hSet(id, `<div class="h-card-h"><h3>My partners</h3><a href="pipeline.html" target="_self">Pipeline →</a></div>
    ${rows ? '<ul class="h-list">' + rows + '</ul>' : '<div class="h-empty">You\'re not PIC for any partner yet.</div>'}
    ${all > 8 ? `<div class="h-more">+${all - 8} more. Tick "Only mine" on the Pipeline.</div>` : ''}`);
}

// ---------- team ----------
function hCard(p, me) {
  const busy = [p.usN ? hPlural(p.usN, 'email') : '', p.overdueN ? p.overdueN + ' overdue' : ''].filter(Boolean).join(' · ');
  const sub = p.email === me ? 'You' : (p.depts.length ? p.depts.join(', ') : (p.name !== hShort(p) ? p.name : ''));
  return `<button type="button" class="h-p ${p.email === me ? 'me' : ''}" onclick="hOpen('${esc(p.email)}')">${hAv(p)}<span class="tx"><b>${esc(hShort(p))}</b><small>${esc(sub)}</small>${busy ? `<small>${esc(busy)}</small>` : ''}</span></button>`;
}
function hTeam(id) {
  const me = myEmail(), people = ((HD && HD.people) || []).slice().sort((a, b) => hShort(a).localeCompare(hShort(b)));
  if (!people.length) { hSet(id, '<div class="h-card-h"><h3>Team</h3></div><div class="h-empty">No team yet.</div>'); return; }
  const mine = (hPerson(me) || { depts: [] }).depts;
  const close = people.filter(p => p.email !== me && p.depts.some(d => mine.includes(d)));
  const rest = people.filter(p => p.email !== me && !close.includes(p));
  const meP = people.find(p => p.email === me);
  hSet(id, `<div class="h-card-h"><h3>Team</h3>${meP ? `<a href="#" target="_self" onclick="hOpen('${esc(me)}');return false">Edit my profile →</a>` : ''}</div>
    ${mine.length ? `<div class="h-sec">My department${mine.length > 1 ? 's' : ''} · ${esc(mine.join(', '))}</div>
      <div class="h-team">${(meP ? [meP] : []).concat(close).map(p => hCard(p, me)).join('')}</div>` : ''}
    <div class="h-sec" style="margin-top:${mine.length ? 16 : 0}px">${mine.length ? 'Everyone else' : 'Everyone'}</div>
    <div class="h-team">${(mine.length ? rest : (meP ? [meP] : []).concat(rest)).map(p => hCard(p, me)).join('') || '<div class="h-empty">That\'s everyone.</div>'}</div>
    <div class="h-note">Tap someone to see what they're on, email them, or pass one of your emails to them.</div>`);
}

// ---------- profile ----------
let H_OPEN = '', H_EDIT = false;
function hModal() {
  let m = document.getElementById('hModal');
  if (!m) {
    m = document.createElement('div'); m.id = 'hModal'; m.className = 'h-modal';
    m.innerHTML = '<div class="h-box" role="dialog" aria-modal="true" id="hBox"></div>';
    m.addEventListener('click', e => { if (e.target === m) hClose(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') hClose(); });
    document.body.appendChild(m);
  }
  return m;
}
function hClose() { const m = document.getElementById('hModal'); if (m) m.classList.remove('open'); H_OPEN = ''; H_EDIT = false; }
function hOpen(email) { H_OPEN = email; H_EDIT = false; hModal().classList.add('open'); hDraw(); }
function hList(title, rows, n, empty) {
  return `<div class="h-sec">${title}${n ? ' · ' + n : ''}</div>` + (rows.length ? '<ul class="h-list">' + rows.join('') + '</ul>' + (n > rows.length ? `<div class="h-more">+${n - rows.length} more</div>` : '') : `<div class="h-empty">${empty}</div>`);
}
function hDraw(msg, cls) {
  const box = document.getElementById('hBox'), p = hPerson(H_OPEN), me = myEmail();
  if (!box) return;
  if (!p) { box.innerHTML = '<div class="h-empty">This person is no longer on the team.</div><div class="h-acts"><button onclick="hClose()">Close</button></div>'; return; }
  const self = p.email === me, bio = p.bio || {}, nm = hShort(p);
  let html = `<div class="h-ph">${hAv(p, true)}<div><h3>${esc(nm)}</h3><div class="sub">${esc(p.name)}${self ? ' · you' : ''}</div>
      ${p.depts.length ? `<div class="h-tags">${p.depts.map(d => `<span class="h-tag dep">${esc(d)}</span>`).join('')}</div>` : ''}</div>
      <button class="h-x" onclick="hClose()" aria-label="Close">×</button></div>`;
  if (H_EDIT && self) {
    html += `<div class="h-form"><label for="hBioIn">About me</label><textarea id="hBioIn" maxlength="160" oninput="document.getElementById('hBioC').textContent=this.value.length+'/160'" placeholder="e.g. I run the sound at the festival and do the WOAH Instagram">${esc(bio.bio || '')}</textarea><div class="cnt" id="hBioC">${(bio.bio || '').length}/160</div>
      <label for="hSkIn">Skills (comma separated, up to 8)</label><input id="hSkIn" maxlength="220" value="${esc((bio.skills || []).join(', '))}" placeholder="e.g. Canva, photography, Bahasa, sound"></div>
      <div class="h-acts"><button class="pri" id="hSave" onclick="hSave()">Save</button><button onclick="H_EDIT=false;hDraw()">Cancel</button></div>`;
    box.innerHTML = html + (msg ? `<div class="h-msg ${cls || ''}">${esc(msg)}</div>` : ''); return;
  }
  html += bio.bio ? `<p class="h-bio">${esc(bio.bio)}</p>` : (self ? '<p class="h-bio sub">Add a line about yourself so the team knows what you do.</p>' : '');
  if ((bio.skills || []).length) html += `<div class="h-tags">${bio.skills.map(s => `<span class="h-tag">${esc(s)}</span>`).join('')}</div>`;
  const gm = 'https://mail.google.com/mail/' + (me ? '?authuser=' + encodeURIComponent(me) + '&' : '?') + 'view=cm&fs=1&to=' + encodeURIComponent(p.email);
  html += `<div class="h-acts">${self
    ? `<button class="pri" onclick="H_EDIT=true;hDraw()">Edit about me &amp; skills</button><button onclick="hPhoto()">Change my photo</button>`
    : `<a class="pri" href="${esc(gm)}" target="_blank" rel="noopener">Email ${esc(nm)}</a><button onclick="hPassOpen()">Pass an email to ${esc(nm)}</button>`}</div>`;
  html += `<div id="hPass"></div>`;
  html += hList(self ? 'Emails I have to answer' : 'Emails to answer', (p.us || []).map(x => `<li><span class="t">${hEmailLink(x)}<small>From ${esc(x.from || '—')}</small></span><span class="r ${ageClass(x.since, 3, 5)}">${ago(x.since)}</span></li>`), p.usN, 'Nothing waiting.');
  html += hList(self ? "I'm chasing" : 'Chasing', (p.them || []).map(x => `<li><span class="t">${hEmailLink(x)}<small>Waiting on ${esc(x.who || '—')}</small></span><span class="r">${x.since ? agoText(x.since) : ''}</span></li>`), p.themN, 'No one to chase.');
  html += hList('Planner items', (p.tasks || []).map(x => `<li><span class="t">${esc(x.item)}<small>${esc(x.planner)}</small></span><span class="r ${x.overdue ? 'bad' : ''}">${esc(x.dueText || '')}${x.overdue ? ' · overdue' : ''}</span></li>`), p.tasksN, 'Nothing due in the next 2 weeks.');
  html += hList('Partners (PIC)', (p.partners || []).map(r => `<li><span class="t"><a href="profile.html?k=${encodeURIComponent(hKeyOf(r))}" target="_self">${esc(r.company)}</a><small>${esc(r.tab)}</small></span><span class="h-st"><span class="h-dot" style="${r.color ? 'background:' + esc(r.color) : ''}"></span>${esc(r.status || 'No status yet')}</span></li>`), p.partnersN, 'Not PIC for any partner.');
  box.innerHTML = html + (msg ? `<div class="h-msg ${cls || ''}">${esc(msg)}</div>` : '');
}
function hPhoto() {
  hClose();
  const w = document.getElementById('wPhoto'), m = document.getElementById('mMe');
  if (w && w.offsetParent) w.click(); else if (m) m.click();
}
function hSave() {
  const b = document.getElementById('hSave'); if (b) { b.disabled = true; b.textContent = 'Saving…'; }
  const bio = document.getElementById('hBioIn').value, skills = document.getElementById('hSkIn').value.split(',');
  call({ action: 'bioSet', bio, skills }).then(d => {
    const p = hPerson(myEmail()); if (p) p.bio = (d.bios || {})[p.email] || null;
    H_EDIT = false; hDraw('Saved. The team sees it from their next refresh.', 'ok'); hRedraw();
  }).catch(e => { if (b) { b.disabled = false; b.textContent = 'Save'; } hDraw(e.message, 'bad'); H_EDIT = true; });
}

// ---------- pass one of my emails to someone ----------
function hPassOpen() {
  const p = hPerson(H_OPEN), el = document.getElementById('hPass'); if (!p || !el) return;
  const m = hMine(), nm = hShort(p);
  const items = m.us.map(x => ({ x, k: 'us' })).concat(m.them.map(x => ({ x, k: 'them' }))).filter(o => !(o.x.to || []).includes(p.email) && o.x.claimedBy !== p.email);
  if (!items.length) { el.innerHTML = `<div class="h-msg">You have no emails you could pass to ${esc(nm)} right now.</div>`; return; }
  el.innerHTML = `<div class="h-sec">Which of your emails?</div><div class="h-pass">` + items.map((o, i) =>
    `<label><input type="radio" name="hPassPick" value="${esc(o.x.id)}" data-k="${o.k}" ${i ? '' : 'checked'}><span>${esc(o.x.subject || '(no subject)')}<small>${o.k === 'us' ? 'To answer · from ' + esc(o.x.from || '—') : 'Chasing · waiting on ' + esc(o.x.who || '—')}</small></span></label>`).join('') +
    `</div><div class="h-msg" id="hPassQ"></div><div class="h-acts"><button class="pri" id="hPassGo" onclick="hPassAsk()">Pass it to ${esc(nm)}</button><button onclick="document.getElementById('hPass').innerHTML=''">Cancel</button></div>`;
}
function hPassAsk() {
  const p = hPerson(H_OPEN), pick = document.querySelector('input[name="hPassPick"]:checked'); if (!p || !pick) return;
  const nm = hShort(p), them = pick.dataset.k === 'them', q = document.getElementById('hPassQ'), go = document.getElementById('hPassGo');
  q.innerHTML = them ? `Pass this follow-up to <b>${esc(nm)}</b>? Chris will email them about it and they get the nudges from now on.`
    : `Pass this email to <b>${esc(nm)}</b>? Chris will forward it to them and they get the reminders from now on.`;
  go.textContent = 'Yes, pass it on'; go.onclick = () => hPassGo(pick.value);
}
function hPassGo(id) {
  const p = hPerson(H_OPEN), go = document.getElementById('hPassGo'), q = document.getElementById('hPassQ'); if (!p) return;
  go.disabled = true; go.textContent = 'Passing it on…';
  call({ action: 'inbox', op: 'reassign', id, value: p.email }).then(() => {
    document.getElementById('hPass').innerHTML = `<div class="h-msg ok">Done. Chris passes it to ${esc(hShort(p))} within about 5 minutes.</div>`;
    if (typeof window.hReload === 'function') setTimeout(window.hReload, 300);
  }).catch(e => { go.disabled = false; go.textContent = 'Yes, pass it on'; q.className = 'h-msg bad'; q.textContent = e.message; });
}
// redraw the team + open profile after fresh data (keeps an open profile open)
function hRedraw() { if (document.getElementById('team')) hTeam('team'); if (H_OPEN && !H_EDIT && !document.querySelector('#hPass .h-pass')) hDraw(); }
