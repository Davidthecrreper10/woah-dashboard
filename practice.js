/* Practice mode for the Sell page: real products and prices, everything else pretend.
   Sales, orders, payments and the end-of-day check stay on this phone only (localStorage) and never reach the Sales Tracker, the orders or the stock. */
const PRACTICE = (() => { try { return localStorage.getItem('woahPosPractice') === '1'; } catch (e) { return false; } })();
const SIM = (() => {
  const KEY = 'woahPosSim';
  const PAY = { cash: 'CASH', qris: 'QRIS', xendit: 'CARD (XENDIT)', transfer: 'TRANSFER', later: 'NOT YET PAID', foc: 'FOC' };
  const PAYTEXT = { cash: 'Cash', qris: 'QRIS', xendit: 'Card (Xendit)', transfer: 'Bank transfer' };
  const METHODS = ['CASH', 'QRIS', 'CARD (XENDIT)', 'TRANSFER', 'NOT YET PAID', 'FOC'];
  const PHOTO = ['qris', 'xendit', 'transfer'];
  let S = null;
  function get() { if (S) return S; try { S = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { S = null; } if (!S) S = { days: {}, orders: null, seq: 9000, done: {} }; return S; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function reset() { S = null; try { localStorage.removeItem(KEY); Object.keys(localStorage).filter(k => k.indexOf('P.') === 0).forEach(k => localStorage.removeItem(k)); } catch (e) {} }
  function wait(x) { return new Promise((ok, bad) => setTimeout(() => x instanceof Error ? bad(x) : ok(JSON.parse(JSON.stringify(x))), 250)); }
  function err(t) { return new Error(t); }
  function me() { return (typeof ME !== 'undefined' && ME && ME.name) || 'You'; }
  function brand(n) { return /soap/i.test(n || '') ? 'SOAP' : 'WOAH'; }
  function nm(x) { return [x.product, x.colour, x.fit, x.size].filter(Boolean).join(' '); }
  function today() { return (typeof D !== 'undefined' && D && D.today) || 'Today'; }

  function line(l) {
    if (l.custom) { const n = String(l.custom).trim(); if (!n) throw err('Type a name for the extra item.'); return { product: n, colour: '', fit: '', size: '', item: '', key: '', price: Math.max(0, Math.round(Number(l.price) || 0)) }; }
    const p = D.products.find(x => x.key === l.key); if (!p) throw err('One item isn\'t in Dom\'s sheet any more. Refresh the page and add it again.');
    const v = p.variants.find(x => (x.colour || '') === (l.colour || '') && (x.fit || '') === (l.fit || '') && (x.size || '') === (l.size || ''));
    if (!v) throw err(p.name + ': that size/colour isn\'t in Dom\'s sheet any more. Refresh the page.');
    return { product: p.name, colour: v.colour, fit: v.fit, size: v.size, item: v.item, key: p.key, price: v.price, preorder: !!p.preorder };
  }
  function dayOut(name) {
    const d = get().days[name || today()];
    if (!d) return null;
    const sales = d.sales.map(s => {
      const x = Object.assign({}, s, { total: 0, n: s.items.length, nx: 0, dom: true });
      s.items.forEach(i => { if (i.cancelled) x.nx++; else x.total += i.amount; if (i.kind === 'Sale' && !s.dom) x.dom = false; });
      x.status = x.nx === 0 ? 'OK' : x.nx === x.n ? 'Cancelled' : 'Part cancelled';
      return x;
    });
    const sum = {}; METHODS.forEach(m => sum[m] = { n: 0, amount: 0 });
    const live = sales.filter(s => s.status !== 'Cancelled');
    live.forEach(s => { sum[s.pay].n++; sum[s.pay].amount += s.total; });
    return { name: d.name, sales: sales.slice().reverse(), sum, counted: d.counted || {}, check: d.check || { note: '', by: '', at: 0 },
      count: live.filter(s => s.kind === 'Sale').length, paid: live.filter(s => s.pay !== 'NOT YET PAID').reduce((a, s) => a + s.total, 0),
      owed: live.filter(s => s.pay === 'NOT YET PAID').reduce((a, s) => a + s.total, 0), url: '' };
  }
  function addSale(id, kind, pay, by, note, items) {
    const s = get(), n = today();
    const d = s.days[n] || (s.days[n] = { name: n, sales: [], counted: {}, check: { note: '', by: '', at: 0 } });
    d.sales.push({ sale: id, at: Date.now(), kind, pay, by, note, dom: false, pre: items.map(i => (i.product.match(/WOAH-\d+/) || [])[0]).filter((x, i, a) => x && a.indexOf(x) === i), items });
    save();
  }
  function orders() {
    const s = get();
    if (!s.orders) {
      const ps = (D.products || []).filter(p => p.variants.some(v => v.price > 0));
      const pick = (i, pre) => { const p = ps[i % Math.max(1, ps.length)]; if (!p) return null; const v = p.variants.find(x => x.price > 0); return { product: p.name, colour: v.colour, fit: v.fit, size: v.size, qty: 1, price: v.price, type: pre ? 'Pre-order' : 'Buy now', status: pre ? 'Waiting for stock' : 'Received' }; };
      const mk = (no, name, phone, pay, paid, collect, items, status) => { items = items.filter(Boolean); return { order: no, placed: Date.now() - 86400000, name, email: '', phone, pay, paid, proof: '', collect, status, total: items.reduce((a, i) => a + i.price * i.qty, 0), notes: 'Practice order', items }; };
      const sf = (D.settings.collect || {}).spirit || 'Spirit Friday', sh = (D.settings.collect || {}).shanti || 'Shanti House';
      s.orders = [
        mk('WOAH-9001', 'Maya Practice', '6281200000001', 'Card / e-wallet (Xendit)', 'Yes', sf, [pick(0), pick(1)], 'Ready to collect'),
        mk('WOAH-9002', 'Kai Example', '6281200000002', 'Cash at pick-up', 'No', sh, [pick(2)], 'Ready to collect'),
        mk('WOAH-9003', 'Lena Sample', '6281200000003', 'QRIS', 'Proof sent', sf, [pick(3)], 'Ready to collect'),
        mk('WOAH-9004', 'Tom Testing', '6281200000004', 'Cash at pick-up', 'No', sf, [pick(4, true)], 'Waiting for stock')];
      save();
    }
    return s.orders;
  }

  function sale(req) {
    const x = req.sale || {}, s = get(), id = String(x.id || '');
    if (s.done[id]) return s.done[id];
    const pay = String(x.pay || ''); if (!PAY[pay]) throw err('Pick how they paid.');
    const lines = Array.isArray(x.lines) ? x.lines : []; if (!lines.length) throw err('The cart is empty.');
    const nowL = lines.filter(l => !l.pre), preL = lines.filter(l => l.pre);
    const reason = String(x.reason || '').trim(), owes = String(x.owes || '').trim();
    if (pay === 'foc' && preL.length) throw err('FOC can\'t include pre-orders. Take the pre-order items out or pick another payment.');
    if (pay === 'foc' && !reason) throw err('Say why it\'s free (FOC).');
    if (pay === 'later' && nowL.length && !owes) throw err('Type who still has to pay (name and phone).');
    if (PHOTO.includes(pay) && !x.photo) throw err('Take a photo of the payment with your phone first, then tick the box.');
    let buyer = null;
    if (preL.length) {
      const b = x.buyer || {}; buyer = { name: String(b.name || '').trim(), phone: String(b.phone || '').replace(/\D/g, ''), email: String(b.cemail || '').trim() };
      if (buyer.name.length < 2) throw err('Type the buyer\'s name (for the pre-order).');
      if (!/@/.test(buyer.email) && buyer.phone.length < 8) throw err('Type the buyer\'s phone or email, so we can tell them when the pre-order arrives.');
      if (!D.settings.collect[x.collect]) throw err('Pick where they\'ll collect the pre-order.');
    }
    const by = me() + (x.helper ? ' + ' + String(x.helper).trim() : '');
    const photoNote = PHOTO.includes(pay) ? 'Payment photo on ' + me() + '\'s phone' : '';
    const note = [pay === 'later' && nowL.length ? 'Owes: ' + owes : String(x.note || '').trim(), photoNote].filter(Boolean).join(' · ');
    const items = nowL.map(l => {
      const v = line(l), qty = Math.max(1, Math.min(50, Math.floor(Number(l.qty) || 1))), full = v.price * qty;
      const disc = pay === 'foc' ? full : Math.max(0, Math.min(full, Math.round(Number(l.discount) || 0)));
      const why = pay === 'foc' ? 'FOC: ' + reason : String(l.reason || '').trim();
      if (disc > 0 && !why) throw err('Give a reason for the discount on ' + v.product + '.');
      return { product: nm(v), item: v.item, qty, amount: full - disc, discount: disc, reason: disc ? why : '', brand: brand(v.product), kind: 'Sale', cancelled: false };
    });
    const res = { sale: id };
    if (preL.length) {
      const pre = preL.map(l => { const v = line(l); if (!v.preorder) throw err(v.product + ' isn\'t open for pre-orders.'); if (!(v.price > 0)) throw err(v.product + ' has no price yet in Dom\'s sheet.'); return Object.assign(v, { qty: Math.max(1, Math.min(20, Math.floor(Number(l.qty) || 1))) }); });
      const order = 'WOAH-' + (++s.seq + 100), paidNow = pay !== 'later';
      orders().push({ order, placed: Date.now(), name: buyer.name, email: buyer.email, phone: buyer.phone, pay: paidNow ? PAYTEXT[pay] + ' (at the stall)' : 'Cash at pick-up', paid: paidNow ? 'Yes' : 'No', proof: '',
        collect: D.settings.collect[x.collect], status: 'Waiting for stock', total: pre.reduce((a, l) => a + l.price * l.qty, 0), notes: 'Practice pre-order',
        items: pre.map(l => ({ product: l.product, colour: l.colour, fit: l.fit, size: l.size, qty: l.qty, price: l.price, type: 'Pre-order', status: 'Waiting for stock' })) });
      if (paidNow) pre.forEach(l => items.push({ product: 'Pre-order ' + order + ': ' + nm(l), item: l.item, qty: l.qty, amount: l.price * l.qty, discount: 0, reason: '', brand: brand(l.product), kind: 'Pre-order', cancelled: false }));
      Object.assign(res, { order, buyer: buyer.name, collect: D.settings.collect[x.collect], paidNow, preTotal: pre.reduce((a, l) => a + l.price * l.qty, 0) });
    }
    if (items.length) addSale(id, items[0].kind, PAY[pay], by, note, items);
    res.total = items.reduce((a, i) => a + i.amount, 0); res.day = dayOut();
    s.done[id] = res; save();
    return res;
  }
  function collect(req) {
    const id = String(req.order || '').toUpperCase(), take = !!req.take, hand = !!req.collect, pay = String(req.pay || '');
    if (!take && !hand) throw err('Nothing to do: tick "Take payment" or "Hand over".');
    if (take && !PAYTEXT[pay]) throw err('Pick how they paid.');
    if (take && PHOTO.includes(pay) && !req.photo) throw err('Take a photo of the payment with your phone first, then tick the box.');
    const o = orders().find(x => x.order === id); if (!o) throw err('Order ' + id + ' not found.');
    if (take && o.paid === 'Yes') throw err('Order ' + id + ' is already marked paid.');
    if (hand && o.items.some(i => i.status === 'Waiting for stock') && !req.force) throw err('Some items are still "Waiting for stock". Hand over anyway?');
    if (take) {
      o.paid = 'Yes'; o.pay = PAYTEXT[pay] + ' (at pick-up)';
      addSale(id, 'Shop order', PAY[pay], me(), PHOTO.includes(pay) ? 'Payment photo on ' + me() + '\'s phone' : 'Buyer: ' + o.name,
        o.items.map(i => ({ product: 'Shop order ' + id + ': ' + nm(i), item: '', qty: i.qty, amount: i.price * i.qty, discount: 0, reason: '', brand: brand(i.product), kind: 'Shop order', cancelled: false })));
    }
    if (hand) o.status = 'Collected';
    save();
    return { ok: true, order: id, took: take, handed: hand, day: take ? dayOut() : null };
  }
  function find(req) {
    const d = get().days[req.day]; if (!d) throw err('That selling day isn\'t in practice mode.');
    const x = d.sales.find(s => s.sale === req.sale); if (!x) throw err('Sale not found. Refresh the page.');
    if (x.kind !== 'Sale') throw err('Pre-orders and shop orders are changed in the Orders tab.');
    return x;
  }
  function run(b) {
    try {
      const a = b.action;
      if (a === 'posSale') return wait(sale(b));
      if (a === 'posOrders') return wait({ orders: orders().filter(o => o.status !== 'Collected' && o.status !== 'Cancelled'), at: Date.now() });
      if (a === 'posCollect') return wait(collect(b));
      if (a === 'posDay') { const n = b.day || today(); return wait({ day: dayOut(n), days: Object.keys(get().days).reverse(), today: today() }); }
      if (a === 'posVoid') { const x = find(b); x.items.forEach(i => { if (i.kind === 'Sale') i.cancelled = !b.undo; }); save(); return wait({ day: dayOut(b.day) }); }
      if (a === 'posDom') { const x = find(b); x.dom = !!b.on; save(); return wait({ day: dayOut(b.day) }); }
      if (a === 'posCheck') { const d = get().days[b.day]; if (!d) throw err('That selling day isn\'t in practice mode.'); const c = b.counted || {}; d.counted = {}; Object.keys(c).forEach(m => { if (c[m] !== '' && c[m] != null) d.counted[m] = Math.round(Number(c[m]) || 0); }); d.check = { note: String(b.note || ''), by: me(), at: Date.now() }; save(); return wait({ day: dayOut(b.day) }); }
      return wait(err('Not available in practice mode.'));
    } catch (e) { return wait(e); }
  }
  // stock taken by practice sales (so practice sales count down the stock on this phone only)
  function used(item) {
    let n = 0; Object.values(get().days).forEach(d => d.sales.forEach(s => { if (s.dom) return; s.items.forEach(i => { if (i.kind === 'Sale' && !i.cancelled && i.item === item) n += i.qty; }); }));
    return n;
  }
  return { run, dayOut, used, reset };
})();

if (PRACTICE) {
  const realCall = call;
  window.call = function (body, tries) {
    if (body && body.action === 'pos') return realCall(body, tries).then(d => { d.day = SIM.dayOut(d.today); return d; });
    return SIM.run(body || {});
  };
}
function setPractice(on) {
  if (on && !confirm('Practice mode: real products and prices, but every sale, order and payment is pretend and stays on this phone. Start practising?')) return;
  try { localStorage.setItem('woahPosPractice', on ? '1' : '0'); } catch (e) {}
  location.reload();
}
function resetPractice() {
  if (!confirm('Clear all practice sales and orders on this phone and start fresh?')) return;
  SIM.reset(); location.reload();
}
