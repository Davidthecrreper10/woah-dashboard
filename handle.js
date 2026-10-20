// Shared by handlers.html (the lists) and email.html (one email in full): the cards, the buttons and the follow-up composer.
// Clicks become requests that Chris (the WOAH inbox) carries out on its next check, within about 5 minutes.
let DATA = null;
const ADMIN = 'david.mantzios@student.greenschool.org';
const OPS = { claim: 'Claim', unclaim: 'Unclaim', snooze: 'Snooze', unsnooze: 'Wake up', done: 'Mark done', reassign: 'Reassign' };
const THEM_OPS = { claim: "I'll chase it", unclaim: 'Stop chasing', snooze: 'Remind me', unsnooze: 'Cancel reminder', done: 'Sorted', reassign: 'Pass on', followup: 'Send your follow-up' };
OPS.reply = 'Send your reply';
const FLAG_TIPS = { 'Money': 'mentions money', 'Contract': 'mentions a contract or agreement', 'Personal details': 'asks for personal details', 'Looks like a scam': 'might be a scam', 'Has attachments': 'has attachments' };
const DRAFTS = {};   // follow-up text being written, kept while the page refreshes

function lists() { const s = (DATA && DATA.snap) || {}; return { us: s.open || [], them: s.waiting || [] }; }
function findItem(id) {
  const l = lists();
  const u = l.us.find(x => x.id === id); if (u) return { x: u, kind: 'us' };
  const t = l.them.find(x => x.id === id); return t ? { x: t, kind: 'them' } : null;
}
function teamName(e) { const p = ((DATA && DATA.team) || []).find(t => t.email === String(e).toLowerCase()); return p ? p.name.split(' ')[0] : first(e); }
function urgency(x) { return days(x.since) + (x.reminders || 0) * 2; }
function chasing(x, me) { return x.claimedBy ? x.claimedBy === me : (x.to || []).includes(me); }
function shortDay(t) { return new Date(t).toLocaleDateString([], { day: 'numeric', month: 'short' }); }
function canFollowUp(x) { return true; }   // emails a team member sent from their own inbox (WOAH CC'd) are followed up from the WOAH email too

// The subject opens the email in full; "find in my email" searches your own Gmail
function subjLink(x) {
  return `<a href="email.html?id=${encodeURIComponent(x.id)}" target="_self" title="Open the full email">${esc(x.subject)}</a> <a class="mine" href="${esc(mineLink(x))}" title="Search your own Gmail for this email or Chris's forward/reminder about it">find in my email</a>`;
}
function pendHtml(x, them) {
  const L = them ? THEM_OPS : OPS;
  return ((DATA && DATA.pending) || []).filter(a => a.id === x.id).map(a => `<div class="pend">Waiting for Chris: ${esc(L[a.op] || a.op)}${a.op === 'reassign' ? ' to ' + esc(teamName(a.value)) : a.op === 'snooze' ? (them ? ' in ' : ' ') + esc(a.value) + ' days' : ''} (by ${esc(teamName(a.by))})</div>`).join('');
}
function flagHtml(x) {
  return (x.flags || []).length ? `<div class="flagbox"><b>Check with a teacher before replying</b> · this email ${esc(x.flags.map(f => FLAG_TIPS[f] || f).join(', '))}.</div>` : '';
}

// ---------- To answer ----------
function usMeta(x) {
  const sn = x.snoozeUntil > Date.now();
  return `From ${esc(x.from)} · sent to ${esc(x.owners || '—')}${x.topic ? ' · ' + esc(x.topic) : ''} · reminders ${x.reminders || 0}/3${sn ? ' · snoozed until ' + esc(shortDay(x.snoozeUntil)) : ''}`;
}
function usTags(x, me) {
  return `${x.cc ? '<span class="tag">their inbox</span>' : ''}${x.claimedBy ? `<span class="tag">${x.claimedBy === me ? 'You claimed this' : esc(x.claimedName || teamName(x.claimedBy)) + ' is on it'}</span>` : ''}`;
}
function usButtons(x, me, inDetail) {
  const pend = ((DATA && DATA.pending) || []).filter(a => a.id === x.id);
  const sn = x.snoozeUntil > Date.now();
  const team = ((DATA && DATA.team) || []).filter(t => !(x.to || []).includes(t.email));
  return `<div class="hact">
    ${!inDetail ? `<a class="btn primary" href="email.html?id=${encodeURIComponent(x.id)}#reply" target="_self">Write reply</a>` : ''}
    ${x.claimedBy === me ? `<button onclick="act('${x.id}','unclaim')">Unclaim</button>` : (x.claimedBy || pend.some(a => a.op === 'claim')) ? '' : `<button class="${inDetail ? 'primary' : ''}" onclick="act('${x.id}','claim')">Claim</button>`}
    <select onchange="if(this.value){act('${x.id}','reassign',this.value);this.value=''}"><option value="">Reassign to…</option>${team.map(t => `<option value="${esc(t.email)}">${esc(t.name)}</option>`).join('')}</select>
    ${sn ? `<button onclick="act('${x.id}','unsnooze')">Wake up</button>`
         : `<select onchange="if(this.value){act('${x.id}','snooze',this.value);this.value=''}"><option value="">Snooze…</option><option value="1">1 day</option><option value="3">3 days</option><option value="7">1 week</option></select>`}
    <button onclick="act('${x.id}','done')">Mark done</button>
    <button class="ghost" onclick="act('${x.id}','dismiss')" title="Take it off the list straight away and stop the reminders">Dismiss</button>
  </div>`;
}
function item(x, me) {
  const d = days(x.since), u = urgency(x);
  return `<div class="hitem ${u >= 7 ? 'u-bad' : u >= 3 ? 'u-warn' : ''}">
    <div class="top"><div>${subjLink(x)}${usTags(x, me)}</div>
      <div class="${ageClass(x.since, 3, 5)}" style="white-space:nowrap">${d === 0 ? 'today' : d + (d === 1 ? ' day' : ' days')}</div></div>
    <div class="meta">${usMeta(x)}</div>
    ${flagHtml(x)}${pendHtml(x, false)}${usButtons(x, me)}
    <div class="confirm" id="hc-${x.id}"></div></div>`;
}

// ---------- Waiting on them ----------
function themMeta(x) {
  const later = x.snoozeUntil > Date.now();
  return `Waiting on ${esc(x.who || '—')} · ${x.claimedBy ? 'chased by' : 'sent by'} ${esc(x.owners || '—')} · nudges ${x.nudges || 0}${x.followedUp ? ' · followed up by ' + esc(x.followedBy || 'the team') + ' ' + esc(agoText(x.followedUp)) : ''}${later ? ' · reminder on ' + esc(shortDay(x.snoozeUntil)) : ''}`;
}
function themTags(x, me) {
  return `${x.own ? `<span class="tag" title="${esc(x.owners || 'A team member')} sent this from their own email with WOAH in CC. A follow-up from this page still comes from the WOAH email, in the same conversation.">sent from ${esc(x.owners || 'their')}'s own email</span>` : ''}${x.claimedBy ? `<span class="tag">${x.claimedBy === me ? "You're chasing this" : esc(x.claimedName || teamName(x.claimedBy)) + ' is chasing'}</span>` : ''}`;
}
function themButtons(x, me, inDetail) {
  const pend = ((DATA && DATA.pending) || []).filter(a => a.id === x.id);
  const later = x.snoozeUntil > Date.now();
  const team = ((DATA && DATA.team) || []).filter(t => t.email !== (x.claimedBy || ''));
  return `<div class="hact">
    ${!inDetail && canFollowUp(x) ? `<a class="btn primary" href="email.html?id=${encodeURIComponent(x.id)}#followup" target="_self">Write follow-up</a>` : ''}
    ${x.claimedBy === me ? `<button onclick="act('${x.id}','unclaim')">Stop chasing</button>` : pend.some(a => a.op === 'claim') ? '' : `<button class="${inDetail ? 'primary' : ''}" onclick="act('${x.id}','claim')">I'll chase it</button>`}
    <select onchange="if(this.value){act('${x.id}','reassign',this.value);this.value=''}"><option value="">Pass on to…</option>${team.map(t => `<option value="${esc(t.email)}">${esc(t.name)}</option>`).join('')}</select>
    ${later ? `<button onclick="act('${x.id}','unsnooze')">Cancel reminder</button>`
            : `<select onchange="if(this.value){act('${x.id}','snooze',this.value);this.value=''}"><option value="">Remind me…</option><option value="3">in 3 days</option><option value="7">in 1 week</option><option value="14">in 2 weeks</option></select>`}
    <button onclick="act('${x.id}','done')">Sorted</button>
    <button class="ghost" onclick="act('${x.id}','dismiss')" title="Take it off the list straight away and stop the nudges">Dismiss</button>
  </div>`;
}
function themItem(x, me) {
  const d = days(x.since), later = x.snoozeUntil > Date.now();
  return `<div class="hitem ${!later && (x.nudges >= 2 || d >= 12) ? 'u-bad' : !later && d >= 7 ? 'u-warn' : ''}">
    <div class="top"><div>${subjLink(x)}${themTags(x, me)}</div>
      <div class="${ageClass(x.since, 7, 12)}" style="white-space:nowrap">${d === 0 ? 'today' : d + (d === 1 ? ' day' : ' days')}</div></div>
    <div class="meta">${themMeta(x)}</div>
    ${pendHtml(x, true)}${themButtons(x, me, false)}
    <div class="confirm" id="hc-${x.id}"></div></div>`;
}

// ---------- buttons ----------
function act(id, op, value) {
  const box = document.getElementById('hc-' + id);
  const f = findItem(id), them = f && f.kind === 'them', x = f ? f.x : {};
  const go = op === 'followup' || op === 'reply' ? `doAct('${id}','${op}')` : `doAct('${id}','${op}','${esc(value || '')}')`;
  const ask = html => { box.innerHTML = html + `<br><button onclick="${go}">${op === 'followup' || op === 'reply' ? 'Yes, send it' : op === 'done' ? (them ? "Yes, it's sorted" : "Yes, it's done") : 'Yes, pass it on'}</button><button onclick="this.parentNode.style.display='none'">Cancel</button>`; box.style.display = 'block'; };
  if (op === 'followup' || op === 'reply') {
    const text = ((DRAFTS[id] || {}).text || '').trim();
    const gap = text.match(/\[[^\]\n]{2,80}\]/);
    if (text.length < 5) { box.innerHTML = 'Write the ' + (op === 'reply' ? 'reply' : 'follow-up') + ' first.'; box.style.display = 'block'; return; }
    if (gap) { box.innerHTML = `Fill in <b>${esc(gap[0])}</b> first (and any other [square brackets]).`; box.style.display = 'block'; return; }
    const flags = op === 'reply' && (x.flags || []).length ? `<br><b>This email is flagged (${esc(x.flags.join(', '))}): only send it once a teacher has OK'd it.</b>` : '';
    return ask(`Send this to <b>${esc((op === 'reply' ? x.from : x.who) || 'them')}</b> from the WOAH Festival email? It goes exactly as written, in the same conversation, and Chris emails you a copy.${flags}`);
  }
  if (them && op === 'reassign') return ask(`Pass this follow-up to <b>${esc(teamName(value))}</b>? Chris will email them about it and they get the nudges from now on.`);
  if (them && op === 'done') return ask('Mark as sorted? Use this if they answered some other way (phone, WhatsApp, in person) or no follow-up is needed. Chris stops nudging.');
  if (op === 'reassign') return ask(`Pass this email to <b>${esc(teamName(value))}</b>? Chris will forward it to them and they get the reminders from now on.`);
  if (op === 'done') return ask('Mark as done? Use this if it was answered some other way (phone, WhatsApp, in person) or needs no reply. Reminders stop.');
  doAct(id, op, value);
}
function doAct(id, op, value) {
  const box = document.getElementById('hc-' + id); if (box) { box.innerHTML = 'Sending…'; box.style.display = 'block'; }
  if (op === 'dismiss') { op = 'done'; value = 'dismiss'; }   // Dismiss = done in one click, no questions
  if (op === 'followup' || op === 'reply') value = (DRAFTS[id] || {}).text || '';
  call({ action: 'inbox', op, id, value: value || '' })
    .then(d => { if ((op === 'followup' || op === 'reply') && DRAFTS[id]) DRAFTS[id].sent = true; (window.afterAct || render)(d); })
    .catch(err => { if (box) { box.innerHTML = esc(err.message); box.style.display = 'block'; } else fail(err); });
}
